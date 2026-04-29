const express = require("express");
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMySchedule
} = require("../controllers/studentController");
const { protect, adminOrFaculty } = require("../middlewares/authMiddleware");

// Student-specific routes (accessible by students)
router.get("/me/schedule", protect, getMySchedule);

// All routes below require protect and admin
router.use(protect, adminOrFaculty);

router.route("/")
  .get(getStudents)
  .post(createStudent);

router.route("/:id")
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
