const express = require("express");
const router = express.Router();
const Instrument = require("../models/Instrument");
const User = require("../models/User"); // FIX: Import User model to verify recipient
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// POST /api/transfers
router.post("/", authMiddleware, roleMiddleware("TRADER"), async (req, res) => {
  try {
    const { instrumentId, newOwner, newLocation, newMobile, reason } = req.body;
    
    const instrument = await Instrument.findOne({ instrumentId });
    
    if (!instrument) {
      return res.status(404).json({ success: false, message: "Instrument not found." });
    }

    // SECURITY CHECK: Ensure the logged-in trader actually owns this instrument
    if (instrument.currentOwner !== req.user.name) {
      return res.status(403).json({ success: false, message: "Unauthorized to transfer this instrument." });
    }

    // FIX: Verify the new owner actually exists in the database as a TRADER
    const targetTrader = await User.findOne({ 
      name: newOwner.trim(), 
      role: "TRADER" 
    });

    if (!targetTrader) {
      return res.status(404).json({ 
        success: false, 
        message: `Trader account '${newOwner}' not found. Please verify the exact registered business name.` 
      });
    }

    // 1. Push previous owner to immutable history
    instrument.ownershipHistory.push({
      ownerName: instrument.currentOwner,
      location: instrument.installationLocation,
      toDate: new Date(),
      source: "Verified Transfer",
      remarks: reason
    });

    // 2. Add to lifecycle audit trail
    instrument.lifecycleHistory.push({
      event: "Ownership Transferred",
      description: `Transferred to new owner: ${targetTrader.name}`,
      performedBy: req.user.name
    });

    // 3. Update the active ownership fields using the verified database name
    instrument.currentOwner = targetTrader.name;
    instrument.installationLocation = newLocation;
    
    await instrument.save();

    res.json({
        success: true,
        transferId: `TRF-${Math.floor(100000 + Math.random() * 900000)}`,
        message: "Transfer completed successfully."
      });

  } catch (error) {
    console.error("Transfer Error:", error);
    res.status(500).json({ success: false, message: "Server error during transfer." });
  }
});

module.exports = router;