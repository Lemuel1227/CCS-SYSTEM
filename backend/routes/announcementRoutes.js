const express = require("express");
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const { protect } = require("../middlewares/authMiddleware");
const { announcementUpload } = require("../middlewares/uploadMiddleware");

// All standard users should be able to get announcements
router.get("/", protect, getAnnouncements);

// Requires auth, role check handled in controller
router.post("/", protect, announcementUpload.single('image'), createAnnouncement);
router.put("/:id", protect, announcementUpload.single('image'), updateAnnouncement);
router.delete("/:id", protect, deleteAnnouncement);

module.exports = router;