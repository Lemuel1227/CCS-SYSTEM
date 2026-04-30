const express = require("express");
const router = express.Router();
const {
  getMyGrades,
  getGrades,
  createGrade,
  updateGrade,
  deleteGrade
} = require("../controllers/gradeController");
const { protect, adminOrFaculty } = require("../middlewares/authMiddleware");

// Student-specific routes (accessible by students)
router.get("/me", protect, getMyGrades);

// Admin/Faculty routes
router.get("/", protect, adminOrFaculty, getGrades);
router.post("/", protect, adminOrFaculty, createGrade);
router.put("/:id", protect, adminOrFaculty, updateGrade);
router.delete("/:id", protect, adminOrFaculty, deleteGrade);

module.exports = router;
