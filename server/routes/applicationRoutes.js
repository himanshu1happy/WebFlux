const express = require("express");
const Application = require("../models/Application");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET all applications
router.get("/",authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET one application
router.get("/:applicationId", authMiddleware,async (req, res) => {
  try {
    const application = await Application.findOne({
      applicationId: req.params.applicationId,
    });

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE verification application
router.post("/",authMiddleware, async (req, res) => {
  try {
    const application = await Application.create(req.body);

    res.status(201).json({
      success: true,
      message: "Verification application submitted successfully",
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


// PATCH application status
router.patch("/:applicationId/status",authMiddleware, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Submitted",
      "Assigned",
      "Inspection Scheduled",
      "Inspection Completed",
      "Approved",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const application = await Application.findOneAndUpdate(
      { applicationId },
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      message: "Application status updated successfully",
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
});


module.exports = router;  