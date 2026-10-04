const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    contactPerson: {
      type: String,
      trim: true,
      default: "",
    },

    mobile: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["TRADER", "OFFICER", "GATC"],
      required: true,
    },

    // -----------------------------
    // Email verification
    // -----------------------------

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationOtp: {
      type: String,
      default: null,
    },

    emailVerificationOtpExpires: {
      type: Date,
      default: null,
    },

    emailVerificationAttempts: {
      type: Number,
      default: 0,
    },

    // Prevent excessive OTP requests
    lastOtpSentAt: {
      type: Date,
      default: null,
    },

    // -----------------------------
    // Login OTP verification
    // -----------------------------

    loginOtp: {
      type: String,
      default: null,
    },

    loginOtpExpires: {
      type: Date,
      default: null,
    },

    loginOtpAttempts: {
      type: Number,
      default: 0,
    },

    lastLoginOtpSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);