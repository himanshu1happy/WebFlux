const express = require("express");

const Instrument = require("../models/Instrument");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const rateLimit = require("express-rate-limit");
const router = express.Router();

// ======================================================
// GET ALL CERTIFICATES
// TRADER -> OWN CERTIFICATES
// OFFICER -> ALL CERTIFICATES
// ======================================================

router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      let query = {
        certificateNumber: {
          $exists: true,
          $ne: null,
        },
      };

      // Traders can only see certificates belonging
      // to instruments currently owned by them.
      if (req.user.role === "TRADER") {
        query.currentOwner = req.user.name;
      }

      const instruments =
        await Instrument.find(query)
          .sort({
            certificateIssuedAt: -1,
          });

      const certificates =
        instruments.map((instrument) => ({
          certificateNumber:
            instrument.certificateNumber,

          instrumentId:
            instrument.instrumentId,

          instrumentType:
            instrument.instrumentType,

          tradeCategory:
            instrument.tradeCategory,

          manufacturer:
            instrument.manufacturer,

          model:
            instrument.model,

          serialNumber:
            instrument.serialNumber,

          capacity:
            instrument.capacity,

          accuracyClass:
            instrument.accuracyClass,

          owner:
            instrument.currentOwner,

          location:
            instrument.installationLocation,

          issuedAt:
            instrument.certificateIssuedAt,

          validUntil:
            instrument.certificateValidUntil,

          status:
            instrument.certificateStatus,

          instrumentStatus:
            instrument.status,
        }));

      res.json({
        success: true,
        count: certificates.length,
        data: certificates,
      });
    } catch (error) {
      console.error(
        "Get certificates error:",
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
// GET CERTIFICATE BY CERTIFICATE NUMBER
// AUTHENTICATED USERS
// ======================================================

router.get(
  "/:certificateNumber",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        certificateNumber,
      } = req.params;

      const instrument =
        await Instrument.findOne({
          certificateNumber,
        });

      if (!instrument) {
        return res.status(404).json({
          success: false,
          message:
            "Certificate not found",
        });
      }

      // -----------------------------------------------
      // Trader ownership protection
      // -----------------------------------------------

      if (
        req.user.role === "TRADER" &&
        instrument.currentOwner !==
          req.user.name
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this certificate",
        });
      }

      // -----------------------------------------------
      // Find verification record associated
      // with this certificate
      // -----------------------------------------------

      const verification =
        instrument.verificationHistory
          .slice()
          .reverse()
          .find(
            (item) =>
              item.certificateNumber ===
              certificateNumber
          );

      res.json({
        success: true,

        data: {
          certificateNumber:
            instrument.certificateNumber,

          instrumentId:
            instrument.instrumentId,

          instrumentType:
            instrument.instrumentType,

          tradeCategory:
            instrument.tradeCategory,

          manufacturer:
            instrument.manufacturer,

          model:
            instrument.model,

          serialNumber:
            instrument.serialNumber,

          capacity:
            instrument.capacity,

          accuracyClass:
            instrument.accuracyClass,

          owner:
            instrument.currentOwner,

          location:
            instrument.installationLocation,

          issuedAt:
            instrument.certificateIssuedAt,

          validUntil:
            instrument.certificateValidUntil,

          status:
            instrument.certificateStatus,

          instrumentStatus:
            instrument.status,

          verification:
            verification || null,

          verificationHistory:
            instrument.verificationHistory || [],
        },
      });
    } catch (error) {
      console.error(
        "Get certificate error:",
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
// PUBLIC CERTIFICATE VERIFICATION
// NO LOGIN REQUIRED
// ======================================================

// Strict rate limiter for public verification endpoint
const publicVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 verification requests per window to prevent scraping
  message: { 
    success: false, 
    verified: false, 
    message: "Too many verification attempts from this IP. Please try again later." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get(
  "/public/:certificateNumber",
  publicVerificationLimiter,
  async (req, res) => {
    try {
      const {
        certificateNumber,
      } = req.params;

      const instrument =
        await Instrument.findOne({
          certificateNumber,
        });

      if (!instrument) {
        return res.status(404).json({
          success: false,
          verified: false,
          message:
            "Certificate not found",
        });
      }

      const verification =
        instrument.verificationHistory
          .slice()
          .reverse()
          .find(
            (item) =>
              item.certificateNumber ===
              certificateNumber
          );

      const now = new Date();

      let certificateStatus =
        instrument.certificateStatus;

      // -----------------------------------------------
      // Check expiry dynamically
      // -----------------------------------------------

      if (
        instrument.certificateValidUntil &&
        new Date(
          instrument.certificateValidUntil
        ) < now
      ) {
        certificateStatus = "Expired";
      }

      res.json({
        success: true,

        verified:
          certificateStatus === "Valid",

        data: {
          certificateNumber:
            instrument.certificateNumber,

          instrumentId:
            instrument.instrumentId,

          instrumentType:
            instrument.instrumentType,

          tradeCategory:
            instrument.tradeCategory,

          manufacturer:
            instrument.manufacturer,

          model:
            instrument.model,

          serialNumber:
            instrument.serialNumber,

          capacity:
            instrument.capacity,

          accuracyClass:
            instrument.accuracyClass,

          owner:
            instrument.currentOwner,

          location:
            instrument.installationLocation,

          issuedAt:
            instrument.certificateIssuedAt,

          validUntil:
            instrument.certificateValidUntil,

          status:
            certificateStatus,

          verificationDate:
            verification?.verificationDate ||
            null,

          officerName:
            verification?.officerName ||
            null,

          result:
            verification?.result ||
            null,
        },
      });
    } catch (error) {
      console.error(
        "Public certificate verification error:",
        error
      );

      res.status(500).json({
        success: false,
        verified: false,
        message:
          "Unable to verify certificate",
      });
    }
  }
);

module.exports = router;