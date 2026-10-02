const express = require("express");
const crypto = require("crypto");

const Instrument = require("../models/Instrument");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// CERTIFICATE CONFIGURATION
// ======================================================
//
// For the prototype, a certificate is valid for 365 days.
// Keep this configurable so the validity period can later
// be changed according to the applicable Legal Metrology
// rules / department configuration.
//

const CERTIFICATE_VALIDITY_DAYS = 365;

// ======================================================
// HELPER: Generate Certificate Number
// ======================================================

function generateCertificateNumber() {
  const year = new Date().getFullYear();

  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `CERT-${year}-${randomPart}`;
}

// ======================================================
// HELPER: Calculate Certificate Valid Until
// ======================================================

function calculateValidUntil(issueDate) {
  const validUntil = new Date(issueDate);

  validUntil.setDate(
    validUntil.getDate() + CERTIFICATE_VALIDITY_DAYS
  );

  return validUntil;
}

// ======================================================
// GET ALL INSTRUMENTS
// TRADER -> ONLY OWN INSTRUMENTS
// OFFICER -> ALL INSTRUMENTS
// ======================================================

router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      let query = {};

      if (req.user.role === "TRADER") {
        query = {
          currentOwner: req.user.name,
        };
      }

      const instruments = await Instrument.find(
        query
      ).sort({
        createdAt: -1,
      });

      res.json({
        success: true,
        count: instruments.length,
        data: instruments,
      });
    } catch (error) {
      console.error(
        "Get instruments error:",
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
// GET ONE INSTRUMENT
// TRADER -> ONLY OWN INSTRUMENT
// OFFICER -> ANY INSTRUMENT
// ======================================================

router.get(
  "/:instrumentId",
  authMiddleware,
  async (req, res) => {
    try {
      let query = {
        instrumentId: req.params.instrumentId,
      };

      if (req.user.role === "TRADER") {
        query.currentOwner = req.user.name;
      }

      const instrument =
        await Instrument.findOne(query);

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

      if (!instrumentData.installationLocation) {
        return res.status(400).json({
          success: false,
          message:
            "installationLocation is required",
        });
      }

      // -----------------------------------------------
      // Never trust owner from frontend
      // -----------------------------------------------

      instrumentData.currentOwner =
        req.user.name;

      // -----------------------------------------------
      // Initial ownership history
      // -----------------------------------------------

      instrumentData.ownershipHistory = [
        {
          ownerName: req.user.name,

          location:
            instrumentData.installationLocation,

          fromDate: new Date(),

          source: "Initial Registration",

          remarks:
            "Initial instrument registration",
        },
      ];

      // -----------------------------------------------
      // Initial lifecycle event
      // -----------------------------------------------

      instrumentData.lifecycleHistory = [
        {
          event: "Instrument registered",

          description:
            "Instrument registered through WebFlux",

          date: new Date(),

          performedBy: req.user.name,
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
      // Validate result
      // -----------------------------------------------

      if (!["PASS", "FAIL"].includes(result)) {
        return res.status(400).json({
          success: false,
          message:
            "Inspection result must be PASS or FAIL",
        });
      }

      // -----------------------------------------------
      // Convert result
      // -----------------------------------------------

      const verificationResult =
        result === "PASS"
          ? "Passed"
          : "Failed";

      const effectiveOfficerName =
        officerName ||
        req.user.name ||
        "LMO Officer";

      const verificationDate =
        new Date();

      // -----------------------------------------------
      // CERTIFICATE GENERATION
      // -----------------------------------------------
      //
      // Only a successful verification receives
      // a certificate.
      //

      let certificateNumber = null;
      let validUntil = null;

      if (verificationResult === "Passed") {
        certificateNumber =
          generateCertificateNumber();

        validUntil =
          calculateValidUntil(
            verificationDate
          );
      }

      // -----------------------------------------------
      // Create inspection record
      // -----------------------------------------------

      const inspectionRecord = {
        inspectionDate:
          verificationDate,

        officerName:
          effectiveOfficerName,

        location:
          instrument.installationLocation,

        result:
          verificationResult,

        remarks,

        gps,

        photos: photos || [],
      };

      instrument.inspectionHistory.push(
        inspectionRecord
      );

      // -----------------------------------------------
      // Create verification history
      // -----------------------------------------------

      instrument.verificationHistory.push({
        verificationDate,

        result:
          verificationResult,

        officerName:
          effectiveOfficerName,

        validUntil,

        certificateNumber,

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
      // Update verification status
      // -----------------------------------------------

      if (verificationResult === "Passed") {
        instrument.status = "Verified";

        instrument.lastVerifiedAt =
          verificationDate;

        instrument.validUntil =
          validUntil;

        // -------------------------------------------
        // Current certificate
        // -------------------------------------------

        instrument.certificateNumber =
          certificateNumber;

        instrument.certificateIssuedAt =
          verificationDate;

        instrument.certificateValidUntil =
          validUntil;

        instrument.certificateStatus =
          "Valid";
      } else {
        // -------------------------------------------
        // Failed verification
        // -------------------------------------------

        instrument.status = "Suspended";

        /*
         * Do NOT update lastVerifiedAt or validUntil
         * when the inspection fails.
         *
         * Also do not delete an older certificate.
         * The previous verification remains in
         * verificationHistory for audit purposes.
         */

        if (
          instrument.certificateNumber &&
          instrument.certificateStatus ===
            "Valid"
        ) {
          instrument.certificateStatus =
            "Revoked";
        }
      }

      // -----------------------------------------------
      // Add lifecycle event
      // -----------------------------------------------

      if (verificationResult === "Passed") {
        instrument.lifecycleHistory.push({
          event:
            "Verification completed",

          description: [
            `Field verification passed.`,
            `Certificate ${certificateNumber} issued.`,
            `Valid until ${validUntil.toISOString()}.`,
            physicalCondition,
            workingCondition,
            accuracyResult,
          ]
            .filter(Boolean)
            .join(" "),

          date:
            verificationDate,

          performedBy:
            effectiveOfficerName,
        });
      } else {
        instrument.lifecycleHistory.push({
          event:
            "Verification failed",

          description: [
            "Field verification failed.",
            physicalCondition,
            workingCondition,
            accuracyResult,
          ]
            .filter(Boolean)
            .join(" "),

          date:
            verificationDate,

          performedBy:
            effectiveOfficerName,
        });
      }

      // -----------------------------------------------
      // Save
      // -----------------------------------------------

      await instrument.save();

      // -----------------------------------------------
      // Response
      // -----------------------------------------------

      res.status(201).json({
        success: true,

        message:
          verificationResult === "Passed"
            ? "Inspection passed and digital certificate issued successfully"
            : "Inspection failed and instrument verification status updated",

        data: {
          instrument,

          verification: {
            result:
              verificationResult,

            certificateNumber,

            issuedAt:
              verificationResult ===
              "Passed"
                ? verificationDate
                : null,

            validUntil,

            certificateStatus:
              verificationResult ===
              "Passed"
                ? "Valid"
                : null,
          },
        },
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
          message:
            "Instrument not found",
        });
      }

      const effectiveOfficerName =
        officerName ||
        req.user.name ||
        "LMO Officer";

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
        ownerName:
          observedOwner,

        location,

        fromDate:
          new Date(),

        source:
          "Officer Observation",

        remarks:
          remarks ||
          `Ownership/possession observed by ${effectiveOfficerName}.`,
      });

      // -----------------------------------------------
      // Update current observed owner
      // -----------------------------------------------

      instrument.currentOwner =
        observedOwner;

      instrument.installationLocation =
        location;

      // -----------------------------------------------
      // Add lifecycle event
      // -----------------------------------------------

      instrument.lifecycleHistory.push({
        event:
          "Ownership observed",

        description: [
          `Instrument observed with ${observedOwner}.`,
          `Location: ${location}.`,
          remarks,
        ]
          .filter(Boolean)
          .join(" "),

        date:
          new Date(),

        performedBy:
          effectiveOfficerName,
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