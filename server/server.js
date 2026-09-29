const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const instrumentRoutes = require("./routes/instrumentRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/authRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
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
app.get("/api/auth/test", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "JWT authentication is working",
    user: req.user,
  });
});
// Start server
app.listen(PORT, () => {
  console.log(`WebFlux server running on port ${PORT}`);
});