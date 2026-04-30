const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { protect, adminOrFaculty } = require("../middlewares/authMiddleware");

// Public read routes (accessible by all authenticated users)
router.get("/", protect, getCourses);
router.get("/:id", protect, getCourseById);

// Admin/Faculty only routes
router.post("/", protect, adminOrFaculty, createCourse);
router.put("/:id", protect, adminOrFaculty, updateCourse);
router.delete("/:id", protect, adminOrFaculty, deleteCourse);

module.exports = router;