const express = require("express");
const router = express.Router();
const {
  getClassSchedules,
  getClassScheduleById,
  getClassScheduleOptions,
  createClassSchedule,
  updateClassSchedule,
  deleteClassSchedule,
  getMySchedule,
} = require("../controllers/classScheduleController");
const { protect, adminOrFaculty } = require("../middlewares/authMiddleware");

// User-specific routes (accessible by students and faculty)
router.get("/me", protect, getMySchedule);
router.get("/options", protect, adminOrFaculty, getClassScheduleOptions);

// Admin/Faculty only routes
router.get("/", protect, adminOrFaculty, getClassSchedules);
router.post("/", protect, adminOrFaculty, createClassSchedule);
router.get("/:id", protect, adminOrFaculty, getClassScheduleById);
router.put("/:id", protect, adminOrFaculty, updateClassSchedule);
router.delete("/:id", protect, adminOrFaculty, deleteClassSchedule);

module.exports = router;
