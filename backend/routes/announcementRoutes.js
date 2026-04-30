const express = require("express");
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const { protect } = require("../middlewares/authMiddleware");

// All standard users should be able to get announcements
router.get("/", protect, getAnnouncements);

// Requires auth, role check handled in controller
router.post("/", protect, createAnnouncement);
router.put("/:id", protect, updateAnnouncement);
router.delete("/:id", protect, deleteAnnouncement);

module.exports = router;