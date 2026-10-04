const express = require("express");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Instrument = require("../models/Instrument");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validateFileContent = require("../middleware/fileSecurityMiddleware");
const Tesseract = require("tesseract.js");

const router = express.Router();


const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${randomName}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const path = require("path");

    // 1. Anchored extension check (blocks .jpgx)
    const extRegex = /\.(jpeg|jpg|png|pdf)$/i;
    const hasValidExt = extRegex.test(path.extname(file.originalname));

    // 2. Anchored mimetype check
    const mimeRegex = /^(image\/(jpeg|png)|application\/pdf)$/i;
    const hasValidMime = mimeRegex.test(file.mimetype);

    if (hasValidExt && hasValidMime) {
      return cb(null, true);
    }

    cb(new Error("Invalid file type. Only JPG, PNG, and PDF are allowed."));
  }
});
// ======================================================
// SECURE FILE SERVING
// ======================================================
router.get("/files/:filename", authMiddleware, async (req, res) => {
  try {
    const safeFilename = path.basename(req.params.filename); 
    const filepath = path.join(__dirname, '../uploads', safeFilename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    // Find the instrument associated with this file
    const instrument = await Instrument.findOne({
      $or: [
        { invoiceDocument: safeFilename },
        { "inspectionHistory.photos": safeFilename }
      ]
    });

    // Deny access if the file is orphaned or not linked to an instrument
    if (!instrument) {
      return res.status(403).json({ success: false, message: "Unauthorized access to file." });
    }

    // Enforce ownership check for Traders
    if (req.user.role === "TRADER" && instrument.currentOwner !== req.user.name) {
      return res.status(403).json({ success: false, message: "Unauthorized: You do not own this document." });
    }

    res.sendFile(filepath);
  } catch (error) {
    console.error("File serving error:", error);
    res.status(500).json({ success: false, message: "Server error serving file." });
  }
});
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

      // FIX: Use the 'query' object instead of ignoring it
      const instrument = await Instrument.findOne(query);

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
  upload.single("invoiceDocument"),
  validateFileContent,
  async (req, res) => {
    const cleanUpFile = () => {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    };

    try {
      // 1. Strictly enforce the file upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Invoice document upload is required.",
        });
      }

      // 2. Extract ONLY permitted fields from req.body (Prevent Mass Assignment)
      const allowedData = {
        tradeCategory: req.body.tradeCategory,
        instrumentType: req.body.instrumentType,
        manufacturer: req.body.manufacturer,
        model: req.body.model,
        serialNumber: req.body.serialNumber,
        capacity: req.body.capacity,
        purchaseYear: req.body.purchaseYear,
        accuracyClass: req.body.accuracyClass,
        installationLocation: req.body.installationLocation,
        gstin: req.body.gstin,
        invoiceNumber: req.body.invoiceNumber,
        invoiceDocument: req.file.filename,
      };

      // 3. FAST CHECK 1: Schema Validation BEFORE OCR
      const requiredFields = [
        "tradeCategory",
        "instrumentType",
        "manufacturer",
        "model",
        "serialNumber",
        "capacity",
        "installationLocation"
      ];

      for (const field of requiredFields) {
        if (!allowedData[field] || String(allowedData[field]).trim() === "") {
          cleanUpFile();
          return res.status(400).json({
            success: false,
            message: `${field} is required`,
          });
        }
      }

      // 4. FAST CHECK 2: Case-Insensitive Duplicate Check BEFORE OCR
      // Uses the same collation ({ locale: 'en', strength: 2 }) as the Mongoose index
      const existingInstrument = await Instrument.findOne({
        manufacturer: allowedData.manufacturer,
        model: allowedData.model,
        serialNumber: allowedData.serialNumber
      }).collation({ locale: 'en', strength: 2 });

      if (existingInstrument) {
        cleanUpFile();
        return res.status(409).json({
          success: false,
          message: "This specific instrument (Make/Model/Serial) is already registered in the system. If you recently acquired it, please use the verified Transfer flow to claim ownership."
        });
      }

      // 5. HEAVY WORK: Server-Side OCR Validation
      if (req.file.mimetype === "application/pdf") {
        allowedData.ocrValidationData = [
          {
            label: "Document",
            value: "PDF",
            status: "FLAGGED",
            detected: "PDF Document (Requires manual Officer review)"
          }
        ];
      } else {
        try {
          const { data: { text } } = await Tesseract.recognize(req.file.path, "eng");
          const textUpper = text.toUpperCase();
          const normalizedText = textUpper.replace(/\s+/g, ' ');
          const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

          const fieldsToCheck = [
            { label: "Business Name", value: req.user.name },
            { label: "GSTIN", value: allowedData.gstin, isOptional: true },
            { label: "Invoice Number", value: allowedData.invoiceNumber, isOptional: true },
            { label: "Purchase Year", value: allowedData.purchaseYear, isOptional: true },
            { label: "Manufacturer", value: allowedData.manufacturer },
            { label: "Model", value: allowedData.model },
            { label: "Capacity", value: allowedData.capacity },
            { label: "Accuracy Class", value: allowedData.accuracyClass, isOptional: true },
            { label: "Serial Number", value: allowedData.serialNumber, isOptional: true }
          ];

          allowedData.ocrValidationData = fieldsToCheck.map(field => {
            if (!field.value || String(field.value).trim() === "") {
              return {
                label: field.label,
                value: "Not provided",
                status: "NOT PROVIDED",
                detected: "Trader left this field blank"
              };
            }

            const searchVal = String(field.value).toUpperCase().trim();
            const normalizedSearch = searchVal.replace(/\s+/g, ' ');
            let status = "MISMATCH";

            if (["Purchase Year", "Capacity", "Serial Number", "GSTIN", "Invoice Number"].includes(field.label)) {
              const regex = new RegExp(`\\b${escapeRegExp(normalizedSearch)}\\b`);
              if (regex.test(textUpper)) status = "MATCH";
            } else {
              if (normalizedSearch.length < 3) {
                const regex = new RegExp(`\\b${escapeRegExp(normalizedSearch)}\\b`);
                if (regex.test(normalizedText)) status = "MATCH";
              } else if (normalizedText.includes(normalizedSearch)) {
                status = "MATCH";
              }
            }

            if (status === "MISMATCH" && field.isOptional) {
              status = "FLAGGED";
            }

            return {
              label: field.label,
              value: field.value,
              status,
              detected: status === "MATCH" ? field.value : (status === "FLAGGED" ? "Not found (Review manually)" : "Not found in scan")
            };
          });
        } catch (ocrError) {
          console.error("Server-side OCR failed:", ocrError);
          allowedData.ocrValidationData = [{
            label: "OCR Processing",
            value: "Failed",
            status: "FLAGGED",
            detected: "System could not read the image. Manual review required."
          }];
        }
      }

      // 6. Auto-Generate a Robust Permanent Digital ID
      const entropy = crypto.randomBytes(3).toString("hex").toUpperCase();
      const timeFragment = Date.now().toString().slice(-4);
      const prefix = allowedData.instrumentType === "Fuel Dispenser" ? "LM-FD" : "LM-WM";
      
      allowedData.instrumentId = `${prefix}-${timeFragment}-${entropy}`;

      // 7. Hardcode Ownership and Status
      allowedData.currentOwner = req.user.name;
      allowedData.status = "Pending Verification";

      // 8. Initialize History Arrays
      allowedData.ownershipHistory = [
        {
          ownerName: req.user.name,
          location: allowedData.installationLocation,
          fromDate: new Date(),
          source: "Initial Registration",
          remarks: "Initial instrument registration",
        },
      ];
      
      allowedData.lifecycleHistory = [
        {
          event: "Instrument registered",
          description: "Instrument registered through WebFlux. Invoice uploaded.",
          date: new Date(),
          performedBy: req.user.name,
        },
      ];

      // 9. Create instrument using ONLY the sanitized object
      const instrument = await Instrument.create(allowedData);

      res.status(201).json({
        success: true,
        message: "Instrument created successfully",
        data: instrument,
      });
    } catch (error) {
      // Clean up the uploaded file if database insertion fails
      cleanUpFile();
      
      console.error("Create instrument error:", error);

      // Catch MongoDB unique index violations (code 11000)
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "This specific instrument (Make/Model/Serial) is already registered in the system. If you recently acquired it, please use the verified Transfer flow to claim ownership."
        });
      }

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
  roleMiddleware("OFFICER","GATC"),
  upload.array("photos", 5), // Handles the FormData images from React
  async (req, res) => {
    // Helper to clean up array of uploaded photos
    const cleanUpFiles = () => {
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
      }
    };

    try {
      const { instrumentId } = req.params;
      const {
        officerName,
        physicalCondition,
        workingCondition,
        accuracyResult,
        gps,
        reading,
        remarks,
        result,
      } = req.body || {};

      const instrument = await Instrument.findOne({ instrumentId });
      if (!instrument) {
        cleanUpFiles(); // FIX: Clean up files before early return
        return res.status(404).json({ success: false, message: "Instrument not found" });
      }

      if (!["PASS", "FAIL"].includes(result)) {
        cleanUpFiles(); // FIX: Clean up files before early return
        return res.status(400).json({ success: false, message: "Inspection result must be PASS or FAIL" });
      }

      const verificationResult = result === "PASS" ? "Passed" : "Failed";
      const effectiveOfficerName = officerName || req.user.name || "LMO Officer";
      const verificationDate = new Date();

      // Handle photos 
      const uploadedPhotos = req.files ? req.files.map(f => f.filename) : [];

      let certificateNumber = null;
      let validUntil = null;

      if (verificationResult === "Passed") {
        certificateNumber = generateCertificateNumber();
        validUntil = calculateValidUntil(verificationDate);
      }

      // 1. Immutable Verification History (NEVER overwrites)
      instrument.verificationHistory.push({
        verificationDate,
        readings: reading, // The OCR or manually entered reading
        result: verificationResult,
        officerName: effectiveOfficerName,
        validUntil,
        certificateNumber,
        remarks: [physicalCondition, workingCondition, accuracyResult, remarks].filter(Boolean).join(" | "),
      });

      // 2. Inspection History
      let parsedGps = null;
      if (gps) parsedGps = JSON.parse(gps);

      instrument.inspectionHistory.push({
        inspectionDate: verificationDate,
        officerName: effectiveOfficerName,
        location: instrument.installationLocation,
        result: verificationResult,
        remarks,
        gps: parsedGps,
        photos: uploadedPhotos,
      });

      // 3. Update main instrument active status
      if (verificationResult === "Passed") {
        instrument.status = "Verified";
        instrument.lastVerifiedAt = verificationDate;
        instrument.validUntil = validUntil;
        
        instrument.certificateNumber = certificateNumber;
        instrument.certificateIssuedAt = verificationDate;
        instrument.certificateValidUntil = validUntil;
        instrument.certificateStatus = "Valid";
      } else {
        instrument.status = "Suspended";
        // Do NOT overwrite lastVerifiedAt or validUntil on failure
        if (instrument.certificateNumber && instrument.certificateStatus === "Valid") {
          instrument.certificateStatus = "Revoked";
        }
      }

      // 4. Lifecycle event
      instrument.lifecycleHistory.push({
        event: verificationResult === "Passed" ? "Verification completed" : "Verification failed",
        description: `Field verification ${verificationResult.toLowerCase()}. ${physicalCondition}. Reading: ${reading || "N/A"}.`,
        date: verificationDate,
        performedBy: effectiveOfficerName,
      });

      await instrument.save();

      res.status(201).json({
        success: true,
        message: verificationResult === "Passed" ? "Inspection passed and digital certificate issued." : "Inspection failed.",
      });
    } catch (error) {
      cleanUpFiles(); // FIX: Clean up files if database save or other logic fails
      console.error("Inspection submission error:", error);
      res.status(400).json({ success: false, message: error.message });
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
  roleMiddleware("OFFICER","GATC"),
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