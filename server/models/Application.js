const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
    },

    applicant: {
      type: String,
      required: true,
    },

    instruments: [
      {
        instrumentId: {
          type: String,
          required: true,
        },
      },
    ],

    applicationType: {
      type: String,
      enum: ["Initial Verification", "Re-Verification"],
      default: "Initial Verification",
    },

    status: {
      type: String,
      enum: [
        "Submitted",
        "Assigned",
        "Inspection Scheduled",
        "Inspection Completed",
        "Approved",
        "Rejected",
      ],
      default: "Submitted",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Application", applicationSchema);