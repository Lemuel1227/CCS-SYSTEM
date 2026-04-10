const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, admin } = require("../middlewares/authMiddleware");

// Protect all user routes (only admins can access these user management endpoints)
router.use(protect, admin);

// READ ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      if (req.body.accountStatus) {
        user.accountStatus = req.body.accountStatus;
      }

      if (req.body.password) {
        if (req.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You cannot change the password for other users." });
        }
        user.password = req.body.password; // pre('save') hashes this
      }

      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        accountStatus: updatedUser.accountStatus
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// RESET PASSWORD
router.put("/:id/reset-password", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.password = "password123";
      user.requiresPasswordChange = true;
      await user.save();
      res.json({ message: "Password reset successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
