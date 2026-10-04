const express = require("express");
const crypto = require("crypto");

const Application = require("../models/Application");
const Instrument = require("../models/Instrument");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// ======================================================
// HELPER
// ======================================================

function generateApplicationId() {
  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `APP-${Date.now()}-${randomPart}`;
}


// ======================================================
// GET ALL APPLICATIONS
//
// TRADER  -> only their applications
// OFFICER -> all applications
// ======================================================

router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      let query = {};

      if (req.user.role === "TRADER") {
        query = {
          applicant: req.user.name,
        };
      }

      const applications =
        await Application.find(query).sort({
          createdAt: -1,
        });

      res.json({
        success: true,
        count: applications.length,
        data: applications,
      });
    } catch (error) {
      console.error(
        "Get applications error:",
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
// GET ONE APPLICATION
//
// TRADER  -> only their application
// OFFICER -> any application
// ======================================================

router.get(
  "/:applicationId",
  authMiddleware,
  async (req, res) => {
    try {
      const query = {
        applicationId:
          req.params.applicationId,
      };

      if (req.user.role === "TRADER") {
        query.applicant = req.user.name;
      }

      const application =
        await Application.findOne(query);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      res.json({
        success: true,
        data: application,
      });
    } catch (error) {
      console.error(
        "Get application error:",
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
// CREATE VERIFICATION APPLICATION
//
// TRADER ONLY
// ======================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("TRADER"),
  async (req, res) => {
    try {
      const {
        instruments,
        applicationType,
        remarks,
      } = req.body || {};


      // -----------------------------------------------
      // Validate instruments
      // -----------------------------------------------

      if (
        !Array.isArray(instruments) ||
        instruments.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one instrument is required",
        });
      }


      // -----------------------------------------------
      // Extract instrument IDs
      // -----------------------------------------------

      const instrumentIds = [
        ...new Set(
          instruments
            .map((item) =>
              typeof item === "string"
                ? item
                : item?.instrumentId
            )
            .filter(Boolean)
        ),
      ];


      if (instrumentIds.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Valid instrument IDs are required",
        });
      }


      // -----------------------------------------------
      // Find instruments belonging to logged-in trader
      // -----------------------------------------------

      const traderInstruments =
        await Instrument.find({
          instrumentId: {
            $in: instrumentIds,
          },

          currentOwner: req.user.name,
        });


      // -----------------------------------------------
      // Prevent submitting another trader's instrument
      // -----------------------------------------------

      if (
        traderInstruments.length !==
        instrumentIds.length
      ) {
        return res.status(403).json({
          success: false,
          message:
            "One or more selected instruments do not belong to your account",
        });
      }


      // -----------------------------------------------
      // Prevent duplicate active applications
      // -----------------------------------------------

      const activeApplication =
        await Application.findOne({
          applicant: req.user.name,

          status: {
            $in: [
              "Submitted",
              "Assigned",
              "Inspection Scheduled",
            ],
          },

          "instruments.instrumentId": {
            $in: instrumentIds,
          },
        });


      if (activeApplication) {
        return res.status(409).json({
          success: false,
          message:
            "One or more instruments already have an active verification application",
          applicationId:
            activeApplication.applicationId,
        });
      }


      // -----------------------------------------------
      // Build trusted instrument records
      // -----------------------------------------------

      const applicationInstruments =
      traderInstruments.map(
        (instrument) => ({
          instrumentId: instrument.instrumentId,
        })
      );


      // -----------------------------------------------
      // Create application
      // -----------------------------------------------

      const application =
        await Application.create({
          applicationId:
            generateApplicationId(),

          applicant:
            req.user.name,

          instruments:
            applicationInstruments,

          applicationType:
            applicationType ||
            "Initial Verification",

          status: "Submitted",

          remarks:
            remarks ||
            "Verification request submitted through WebFlux.",
        });


      // -----------------------------------------------
      // Add lifecycle event to instruments
      // -----------------------------------------------

      for (const instrument of traderInstruments) {
        instrument.lifecycleHistory.push({
          event:
            "Verification application submitted",

          description:
            `Verification application ${application.applicationId} submitted through WebFlux.`,

          date: new Date(),

          performedBy:
            req.user.name,
        });

        await instrument.save();
      }


      res.status(201).json({
        success: true,

        message:
          "Verification application submitted successfully",

        data: application,
      });
    } catch (error) {
      console.error(
        "Create application error:",
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
// PATCH APPLICATION STATUS
//
// OFFICER ONLY
// ======================================================

router.patch(
  "/:applicationId/status",
  authMiddleware,
  roleMiddleware("OFFICER","GATC"),
  async (req, res) => {
    try {
      const { applicationId } =
        req.params;

      const { status, instrumentId, scheduledDate } =
        req.body || {};


      const allowedStatuses = [
        "Submitted",
        "Assigned",
        "Inspection Scheduled",
        "Inspection Completed",
        "Approved",
        "Rejected",
      ];


      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid application status",
        });
      }


      const application = await Application.findOne({ applicationId });
      if (!application) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found",
        });
      }

      if (status === "Inspection Scheduled") {
        const parsedDate = new Date(scheduledDate);
        if (!scheduledDate || Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "A valid inspection date is required",
          });
        }
        application.scheduledDate = parsedDate;
        application.status = status;
      } else if (status === "Inspection Completed") {
        const completedInstrumentId = String(instrumentId || "").trim();
        if (!completedInstrumentId) {
          return res.status(400).json({
            success: false,
            message: "An instrument ID is required to complete its inspection",
          });
        }

        const applicationInstrument = application.instruments.find(
          (item) => item.instrumentId === completedInstrumentId
        );
        if (!applicationInstrument) {
          return res.status(400).json({
            success: false,
            message: "The instrument is not part of this application",
          });
        }

        applicationInstrument.inspectionCompleted = true;
        if (application.instruments.every((item) => item.inspectionCompleted)) {
          application.status = "Inspection Completed";
        }
      } else {
        application.status = status;
      }

      application.updatedAt = new Date();
      await application.save();

      res.json({
        success: true,

        message:
          "Application status updated successfully",

        data: application,
      });
    } catch (error) {
      console.error(
        "Application status update error:",
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