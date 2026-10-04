const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const path = require("path");
const connectDB = require("./config/db");

const instrumentRoutes = require("./routes/instrumentRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/authRoutes");
const certificateRoutes = require("./routes/CertificateRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const transferRoutes = require("./routes/transferRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect MongoDB
connectDB();

// Security Middleware: Helmet sets secure HTTP headers
app.use(helmet());

// Security Middleware: Tight CORS
// Defaults to your Vite preview/prod URLs and local dev
const allowedOrigins = (
  process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")
    : ["http://localhost:5173", "https://webflux.onrender.com"]
)
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or server-to-server) or allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // FIX: Attach a 403 status to the error so the global error handler doesn't default to 500
      const error = new Error("Not allowed by CORS");
      error.status = 403;
      callback(error);
    }
  },
  credentials: true
}));
app.set("trust proxy", 1);
// Security Middleware: Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased to 1000 to accommodate heavy officer session workflows
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global rate limiter to all /api routes
app.use("/api", globalLimiter);

// Middleware for parsing JSON
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "WebFlux API is running",
  });
});

// API routes
app.use("/api/instruments", instrumentRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transfers", transferRoutes);

// Certificate 
app.use(
  "/api/certificates",
  certificateRoutes
);

app.get("/api/auth/test", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "JWT authentication is working",
    user: req.user,
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// Forces all Express/Middleware errors to return as JSON
// ======================================================
app.use((err, req, res, next) => {
  console.error("Middleware Error:", err.message);

  // Catch Multer file size limit errors specifically
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
       success: false,
       message: "File is too large. Maximum size is 5MB."
     });
  }

  // Catch custom Multer file filter errors or general errors
  const status = err.status || (err.name === 'MulterError' ? 400 : 500);
  res.status(status).json({
    success: false,
    message: err.message || "An unexpected server error occurred."
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`WebFlux server running on port ${PORT}`);
});