const mongoose = require("mongoose");

// -------------------------
// Lifecycle History
// -------------------------
const lifecycleSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    performedBy: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

// -------------------------
// Ownership History
// -------------------------
const ownershipSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: true,
    },

    location: {
      type: String,
    },

    fromDate: {
      type: Date,
    },

    toDate: {
      type: Date,
    },

    source: {
      type: String,
      enum: [
        "Trader Declaration",
        "Officer Observation",
        "Verified Transfer",
        "Initial Registration",
      ],
      default: "Trader Declaration",
    },

    remarks: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

// -------------------------
// Verification History
// -------------------------
const verificationSchema = new mongoose.Schema(
  {
    verificationDate: {
      type: Date,
      default: Date.now,
    },

    result: {
      type: String,
      enum: ["Passed", "Failed", "Pending"],
      required: true,
    },

    officerName: {
      type: String,
    },

    validUntil: {
      type: Date,
    },

    certificateNumber: {
      type: String,
    },

    remarks: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

// -------------------------
// Inspection History
// -------------------------
const inspectionSchema = new mongoose.Schema(
  {
    inspectionDate: {
      type: Date,
      default: Date.now,
    },

    officerName: {
      type: String,
    },

    location: {
      type: String,
    },

    result: {
      type: String,
      enum: ["Passed", "Failed", "Pending"],
    },

    remarks: {
      type: String,
    },

    gps: {
      latitude: Number,
      longitude: Number,
    },

    photos: [
      {
        type: String,
      },
    ],
  },
  {
    _id: false,
  }
);

// -------------------------
// Main Instrument Schema
// -------------------------
const instrumentSchema = new mongoose.Schema(
  {
    // -------------------------
    // Permanent Identity
    // -------------------------
    instrumentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    tradeCategory: {
      type: String,
      required: true,
    },

    instrumentType: {
      type: String,
      required: true,
    },

    manufacturer: {
      type: String,
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },

    capacity: {
      type: String,
      required: true,
    },

    accuracyClass: {
      type: String,
    },

    // -------------------------
    // Current Owner
    // -------------------------
    currentOwner: {
      type: String,
      required: true,
    },

    // -------------------------
    // Current Location
    // -------------------------
    installationLocation: {
      type: String,
      required: true,
    },

    // -------------------------
    // Verification Status
    // -------------------------
    status: {
      type: String,
      enum: [
        "Verified",
        "Due Soon",
        "Expired",
        "Pending Verification",
        "Suspended",
      ],
      default: "Pending Verification",
    },

    // -------------------------
    // Latest Verification
    // -------------------------
    lastVerifiedAt: {
      type: Date,
    },

    validUntil: {
      type: Date,
    },

    // -------------------------
    // Current Digital Certificate
    // -------------------------
    certificateNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    certificateIssuedAt: {
      type: Date,
    },

    certificateValidUntil: {
      type: Date,
    },

    certificateStatus: {
      type: String,
      enum: [
        "Valid",
        "Expired",
        "Revoked",
      ],
      default: "Valid",
    },

    // -------------------------
    // Complete Timeline
    // -------------------------
    lifecycleHistory: [lifecycleSchema],

    // -------------------------
    // Ownership Changes
    // -------------------------
    ownershipHistory: [ownershipSchema],

    // -------------------------
    // Verification Records
    // -------------------------
    verificationHistory: [verificationSchema],

    // -------------------------
    // Field Inspection Records
    // -------------------------
    inspectionHistory: [inspectionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Instrument",
  instrumentSchema
);