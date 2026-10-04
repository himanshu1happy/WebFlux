const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const { sendOtpEmail } = require("../services/emailService");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// ======================================================
// STRICT AUTHENTICATION RATE LIMITERS
// ======================================================

// Custom key generator to prevent locking out entire offices sharing an IP
const emailAndIpKeyGenerator = (req) => {
  const email = req.body.email ? String(req.body.email).trim().toLowerCase() : "";
  return `${req.ip}_${email}`;
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 login attempts per IP+email combination
  message: { success: false, message: "Too many login attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: emailAndIpKeyGenerator
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 OTP requests/verifications per IP+email combination
  message: { success: false, message: "Too many OTP requests. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: emailAndIpKeyGenerator
});

// ======================================================
// HELPERS
// ======================================================
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
};

// ======================================================
// REGISTER
// ======================================================
// FIX: Attached otpLimiter to the route
router.post("/register", otpLimiter, async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      mobile,
      email,
      password,
      role,
    } = req.body;

    // ------------------------------------------
    // Validate required fields
    // ------------------------------------------
    if (
      !name ||
      !email ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password and role are required",
      });
    }

    // ------------------------------------------
    // Enforce Public Registration Role
    // ------------------------------------------
    if (role !== "TRADER") {
      return res.status(403).json({
        success: false,
        message: "Public registration is restricted to Traders only.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // Check elevated roles
    if (role === "OFFICER" || role === "GATC") {
      const adminSecret = req.body.adminSecret;
      if (!adminSecret || adminSecret !== (process.env.ADMIN_SECRET || "webflux_admin_123")) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: Admin secret required to register as an Officer or GATC.",
        });
      }
    }

    // ------------------------------------------
    // Check existing user
    // ------------------------------------------
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "User with this email already exists",
      });
    }

    // ------------------------------------------
    // Hash password
    // ------------------------------------------
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // ------------------------------------------
    // Generate OTP
    // ------------------------------------------
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    const otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // ------------------------------------------
    // Create user
    // ------------------------------------------
    const user = await User.create({
      name: name.trim(),
      contactPerson:
        contactPerson?.trim() || "",
      mobile: mobile?.trim() || "",
      email: normalizedEmail,
      password: hashedPassword,
      role,
      emailVerified: false,
      emailVerificationOtp: hashedOtp,
      emailVerificationOtpExpires:
        otpExpires,
      emailVerificationAttempts: 0,
      lastOtpSentAt: new Date(),
    });

    // ------------------------------------------
    // Send OTP email
    // ------------------------------------------
    try {
      await sendOtpEmail({
        email: user.email,
        name:
          user.contactPerson ||
          user.name,
        otp,
      });
    } catch (emailError) {
      console.error(
        "OTP email sending failed:",
        emailError.message
      );
      // Remove account if email couldn't be sent
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        success: false,
        message:
          "Unable to send verification email. Please try again.",
      });
    }

    // ------------------------------------------
    // Response
    // ------------------------------------------
    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please verify your email.",
      requiresEmailVerification: true,
      email: user.email,
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during registration",
    });
  }
});

// ======================================================
// VERIFY EMAIL OTP
// ======================================================
// FIX: Attached otpLimiter to the route
router.post("/verify-email", otpLimiter, async (req, res) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    // ------------------------------------------
    // Validate input
    // ------------------------------------------
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message:
          "OTP must be a 6-digit number",
      });
    }

    // ------------------------------------------
    // Find user
    // ------------------------------------------
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No account found with this email",
      });
    }

    // ------------------------------------------
    // Already verified
    // ------------------------------------------
    if (user.emailVerified) {
      return res.json({
        success: true,
        message: "Email is already verified",
      });
    }

    // ------------------------------------------
    // OTP expiry
    // ------------------------------------------
    if (
      !user.emailVerificationOtpExpires ||
      user.emailVerificationOtpExpires <
        new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // ------------------------------------------
    // Maximum attempts
    // ------------------------------------------
    if (
      user.emailVerificationAttempts >= 5
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // ------------------------------------------
    // Compare hashed OTP
    // ------------------------------------------
    const hashedOtp = hashOtp(cleanOtp);

    if (
      hashedOtp !==
      user.emailVerificationOtp
    ) {
      user.emailVerificationAttempts += 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ------------------------------------------
    // Verification successful
    // ------------------------------------------
    user.emailVerified = true;
    user.emailVerificationOtp = null;
    user.emailVerificationOtpExpires =
      null;
    user.emailVerificationAttempts = 0;
    user.lastOtpSentAt = null;
    await user.save();

    return res.json({
      success: true,
      message:
        "Email verified successfully. You can now login.",
    });
  } catch (error) {
    console.error(
      "Email verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during email verification",
    });
  }
});

// ======================================================
// RESEND OTP
// ======================================================
// FIX: Attached otpLimiter to the route
router.post("/resend-otp", otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No account found with this email",
      });
    }

    // ------------------------------------------
    // Already verified
    // ------------------------------------------
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Email is already verified",
      });
    }

    // ------------------------------------------
    // Resend cooldown: 60 seconds
    // ------------------------------------------
    if (user.lastOtpSentAt) {
      const elapsed =
        Date.now() -
        new Date(
          user.lastOtpSentAt
        ).getTime();
      const cooldown =
        60 * 1000;

      if (elapsed < cooldown) {
        const remaining = Math.ceil(
          (cooldown - elapsed) / 1000
        );
        return res.status(429).json({
          success: false,
          message:
            `Please wait ${remaining} seconds before requesting another OTP.`,
          retryAfter: remaining,
        });
      }
    }

    // ------------------------------------------
    // Generate new OTP
    // ------------------------------------------
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    user.emailVerificationOtp =
      hashedOtp;
    user.emailVerificationOtpExpires =
      new Date(
        Date.now() + 10 * 60 * 1000
      );
    user.emailVerificationAttempts = 0;
    user.lastOtpSentAt = new Date();
    await user.save();

    // ------------------------------------------
    // Send email
    // ------------------------------------------
    try {
      await sendOtpEmail({
        email: user.email,
        name:
          user.contactPerson ||
          user.name,
        otp,
      });
    } catch (emailError) {
      console.error(
        "Resend OTP email failed:",
        emailError.message
      );
      return res.status(500).json({
        success: false,
        message:
          "Unable to send OTP email. Please try again.",
      });
    }

    return res.json({
      success: true,
      message:
        "A new OTP has been sent to your email.",
    });
  } catch (error) {
    console.error(
      "Resend OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while resending OTP",
    });
  }
});

// ======================================================
// LOGIN
// ======================================================
// Login now requires:
// 1. Correct email + password
// 2. Verified email
// 3. Correct Login OTP
//
// JWT is NOT created here.
// JWT will be created only after OTP verification.
// ======================================================

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const {
      email,
      password,
      role,
    } = req.body;

    // ------------------------------------------
    // Validate input
    // ------------------------------------------
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ------------------------------------------
    // Find user
    // ------------------------------------------
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ------------------------------------------
    // Compare password FIRST
    // ------------------------------------------
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ------------------------------------------
    // Check role
    // ------------------------------------------
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message:
          `Please use the ${user.role} portal to sign in to your account.`,
      });
    }

    // ------------------------------------------
    // Check email verification
    // ------------------------------------------
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in.",
        requiresEmailVerification: true,
        email: user.email,
      });
    }

    // ------------------------------------------
    // Login OTP cooldown
    // ------------------------------------------
    if (user.lastLoginOtpSentAt) {
      const elapsed =
        Date.now() -
        new Date(user.lastLoginOtpSentAt).getTime();

      const cooldown = 60 * 1000;

      if (elapsed < cooldown) {
        const remaining = Math.ceil(
          (cooldown - elapsed) / 1000
        );

        return res.status(429).json({
          success: false,
          message:
            `Please wait ${remaining} seconds before requesting another login OTP.`,
          retryAfter: remaining,
          requiresLoginOtp: true,
          email: user.email,
        });
      }
    }

    // ------------------------------------------
    // Generate Login OTP
    // ------------------------------------------
    const otp = generateOtp();

    // Never store the actual OTP
    const hashedOtp = hashOtp(otp);

    // OTP valid for 5 minutes
    const otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // ------------------------------------------
    // Save Login OTP
    // ------------------------------------------
    user.loginOtp = hashedOtp;
    user.loginOtpExpires = otpExpires;
    user.loginOtpAttempts = 0;
    user.lastLoginOtpSentAt = new Date();

    await user.save();

    // ------------------------------------------
    // Send Login OTP through Brevo
    // ------------------------------------------
    try {
      await sendOtpEmail({
        email: user.email,
        name: user.contactPerson || user.name,
        otp,
      });
    } catch (emailError) {
      console.error(
        "Login OTP email sending failed:",
        emailError.message
      );

      // Clear OTP if email wasn't sent
      user.loginOtp = null;
      user.loginOtpExpires = null;
      user.loginOtpAttempts = 0;
      user.lastLoginOtpSentAt = null;

      await user.save();

      return res.status(500).json({
        success: false,
        message:
          "Unable to send login verification email. Please try again.",
      });
    }

    // ------------------------------------------
    // IMPORTANT:
    // DO NOT CREATE JWT YET
    // ------------------------------------------

    return res.json({
      success: true,
      message:
        "A login OTP has been sent to your email.",
      requiresLoginOtp: true,
      email: user.email,
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during login",
    });
  }
});

// ======================================================
// GET CURRENT USER (/me)
// ======================================================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
         success: false,
         message: "User not found"
       });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        contactPerson: user.contactPerson,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Fetch current user error:", error);
    return res.status(500).json({
       success: false,
       message: "Server error fetching user data"
     });
  }
});

module.exports = router;