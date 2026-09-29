const express = require("express");
const Instrument = require("../models/Instrument");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// GET ALL INSTRUMENTS
// ======================================================

router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const instruments = await Instrument.find().sort({
        createdAt: -1,
      });

      res.json({
        success: true,
        count: instruments.length,
        data: instruments,
      });
    } catch (error) {
      console.error("Get instruments error:", error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ======================================================
// GET ONE INSTRUMENT
// ======================================================

router.get(
  "/:instrumentId",
  authMiddleware,
  async (req, res) => {
    try {
      const instrument = await Instrument.findOne({
        instrumentId: req.params.instrumentId,
      });

      if (!instrument) {
        return res.status(404).json({
          success: false,
          message: "Instrument not found",
        });
      }

      res.json({
        success: true,
        data: instrument,
      });
    } catch (error) {
      console.error(
        "Get instrument error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ======================================================
// CREATE NEW INSTRUMENT
// TRADER ONLY
// ======================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("TRADER"),
  async (req, res) => {
    try {
      const instrumentData = req.body || {};

      // -----------------------------------------------
      // Validate required fields
      // -----------------------------------------------

      if (!instrumentData.instrumentId) {
        return res.status(400).json({
          success: false,
          message: "instrumentId is required",
        });
      }

      if (!instrumentData.currentOwner) {
        return res.status(400).json({
          success: false,
          message: "currentOwner is required",
        });
      }

      if (!instrumentData.installationLocation) {
        return res.status(400).json({
          success: false,
          message:
            "installationLocation is required",
        });
      }

      // -----------------------------------------------
      // Create first ownership history record
      // -----------------------------------------------

      instrumentData.ownershipHistory = [
        {
          ownerName:
            instrumentData.currentOwner,

          location:
            instrumentData.installationLocation,

          fromDate: new Date(),

          source: "Initial Registration",

          remarks:
            "Initial instrument registration",
        },
      ];

      // -----------------------------------------------
      // Create first lifecycle event
      // -----------------------------------------------

      instrumentData.lifecycleHistory = [
        {
          event: "Instrument registered",

          description:
            "Instrument registered through WebFlux",

          date: new Date(),

          performedBy:
            instrumentData.currentOwner,
        },
      ];

      // -----------------------------------------------
      // Create instrument
      // -----------------------------------------------

      const instrument =
        await Instrument.create(
          instrumentData
        );

      res.status(201).json({
        success: true,
        message:
          "Instrument created successfully",
        data: instrument,
      });
    } catch (error) {
      console.error(
        "Create instrument error:",
        error
      );

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ======================================================
// SUBMIT INSPECTION
// OFFICER ONLY
// ======================================================

router.post(
  "/:instrumentId/inspection",
  authMiddleware,
  roleMiddleware("OFFICER"),
  async (req, res) => {
    try {
      const { instrumentId } =
        req.params;

      const {
        officerName,
        physicalCondition,
        workingCondition,
        accuracyResult,
        gps,
        photos,
        remarks,
        result,
      } = req.body || {};

      // -----------------------------------------------
      // Find instrument
      // -----------------------------------------------

      const instrument =
        await Instrument.findOne({
          instrumentId,
        });

      if (!instrument) {
        return res.status(404).json({
          success: false,
          message: "Instrument not found",
        });
      }

      // -----------------------------------------------
      // Convert result
      // -----------------------------------------------

      const verificationResult =
        result === "PASS"
          ? "Passed"
          : "Failed";

      // -----------------------------------------------
      // Create inspection record
      // -----------------------------------------------

      const inspectionRecord = {
        inspectionDate: new Date(),

        officerName:
          officerName ||
          req.user.name ||
          "LMO Officer",

        location:
          instrument.installationLocation,

        result: verificationResult,

        remarks,

        gps,

        photos: photos || [],
      };

      // -----------------------------------------------
      // Add inspection history
      // -----------------------------------------------

      instrument.inspectionHistory.push(
        inspectionRecord
      );

      // -----------------------------------------------
      // Add verification history
      // -----------------------------------------------

      instrument.verificationHistory.push({
        verificationDate: new Date(),

        result: verificationResult,

        officerName:
          officerName ||
          req.user.name ||
          "LMO Officer",

        remarks: [
          physicalCondition,
          workingCondition,
          accuracyResult,
          remarks,
        ]
          .filter(Boolean)
          .join(" | "),
      });

      // -----------------------------------------------
      // Update instrument status
      // -----------------------------------------------

      instrument.status =
        verificationResult === "Passed"
          ? "Verified"
          : "Suspended";

      instrument.lastVerifiedAt =
        new Date();

      // -----------------------------------------------
      // Add lifecycle event
      // -----------------------------------------------

      instrument.lifecycleHistory.push({
        event:
          verificationResult === "Passed"
            ? "Verification completed"
            : "Verification failed",

        description: [
          `Field verification ${verificationResult.toLowerCase()}.`,
          physicalCondition,
          workingCondition,
          accuracyResult,
        ]
          .filter(Boolean)
          .join(" "),

        date: new Date(),

        performedBy:
          officerName ||
          req.user.name ||
          "LMO Officer",
      });

      // -----------------------------------------------
      // Save
      // -----------------------------------------------

      await instrument.save();

      res.status(201).json({
        success: true,

        message:
          "Inspection submitted successfully",

        data: instrument,
      });
    } catch (error) {
      console.error(
        "Inspection submission error:",
        error
      );

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ======================================================
// OWNERSHIP / POSSESSION OBSERVATION
// OFFICER ONLY
// ======================================================

router.post(
  "/:instrumentId/ownership-observation",
  authMiddleware,
  roleMiddleware("OFFICER"),
  async (req, res) => {
    try {
      const { instrumentId } =
        req.params;

      const {
        observedOwner,
        location,
        officerName,
        remarks,
      } = req.body || {};

      // -----------------------------------------------
      // Validate fields
      // -----------------------------------------------

      if (!observedOwner || !location) {
        return res.status(400).json({
          success: false,
          message:
            "Observed owner and location are required",
        });
      }

      // -----------------------------------------------
      // Find instrument
      // -----------------------------------------------

      const instrument =
        await Instrument.findOne({
          instrumentId,
        });

      if (!instrument) {
        return res.status(404).json({
          success: false,
          message: "Instrument not found",
        });
      }

      // -----------------------------------------------
      // Close previous ownership period
      // -----------------------------------------------

      if (
        instrument.ownershipHistory.length >
        0
      ) {
        const currentOwnership =
          instrument.ownershipHistory[
            instrument.ownershipHistory.length - 1
          ];

        if (!currentOwnership.toDate) {
          currentOwnership.toDate =
            new Date();
        }
      }

      // -----------------------------------------------
      // Add observation
      // -----------------------------------------------

      instrument.ownershipHistory.push({
        ownerName: observedOwner,

        location,

        fromDate: new Date(),

        source: "Officer Observation",

        remarks:
          remarks ||
          `Ownership/possession observed by ${
            officerName ||
            req.user.name ||
            "LMO Officer"
          }.`,
      });

      // -----------------------------------------------
      // Add lifecycle event
      // -----------------------------------------------

      instrument.lifecycleHistory.push({
        event: "Ownership observed",

        description: [
          `Instrument observed with ${observedOwner}.`,
          `Location: ${location}.`,
          remarks,
        ]
          .filter(Boolean)
          .join(" "),

        date: new Date(),

        performedBy:
          officerName ||
          req.user.name ||
          "LMO Officer",
      });

      // -----------------------------------------------
      // Save
      // -----------------------------------------------

      await instrument.save();

      res.status(201).json({
        success: true,

        message:
          "Ownership observation recorded successfully",

        data: instrument,
      });
    } catch (error) {
      console.error(
        "Ownership observation error:",
        error
      );

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;