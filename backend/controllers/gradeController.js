const Grade = require("../models/Grade");
const StudentProfile = require("../models/StudentProfile");
const Course = require("../models/Course");
const mongoose = require("mongoose");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// @desc    Get student's academic progress
// @route   GET /api/grades/me
// @access  Private/Student
const getMyGrades = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const grades = await Grade.find({ student: student._id })
      .populate("course", "code desc units prereq year sem")
      .sort({ "course.year": 1, "course.sem": 1, "course.code": 1 });

    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all grades (admin/faculty)
// @route   GET /api/grades
// @access  Private/Admin/Faculty
const getGrades = async (req, res) => {
  try {
    const { student, course } = req.query;
    const filter = {};

    if (student && isValidObjectId(student)) {
      filter.student = student;
    }
    if (course && isValidObjectId(course)) {
      filter.course = course;
    }

    const grades = await Grade.find(filter)
      .populate("student", "studentNumber firstName lastName")
      .populate("course", "code desc units prereq year sem")
      .sort({ "course.year": 1, "course.sem": 1, "course.code": 1 });

    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create or update grade
// @route   POST /api/grades
// @access  Private/Admin/Faculty
const createGrade = async (req, res) => {
  try {
    const { student, course, grade, status, semester, schoolYear } = req.body;

    if (!student || !course || !grade || !semester || !schoolYear) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!isValidObjectId(student) || !isValidObjectId(course)) {
      return res.status(400).json({ message: "Invalid student or course reference" });
    }

    const studentDoc = await StudentProfile.findById(student);
    const courseDoc = await Course.findById(course);

    if (!studentDoc || !courseDoc) {
      return res.status(404).json({ message: "Student or course not found" });
    }

    const existingGrade = await Grade.findOne({ student, course });

    if (existingGrade) {
      existingGrade.grade = grade;
      existingGrade.status = status || "PASSED";
      existingGrade.semester = semester;
      existingGrade.schoolYear = schoolYear;
      const updated = await existingGrade.save();
      const populated = await updated.populate("course", "code desc units prereq year sem");
      return res.json(populated);
    }

    const created = await Grade.create({
      student,
      course,
      grade,
      status: status || "PASSED",
      semester,
      schoolYear,
    });

    const populated = await created.populate("course", "code desc units prereq year sem");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update grade
// @route   PUT /api/grades/:id
// @access  Private/Admin/Faculty
const updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    const { grade: newGrade, status, semester, schoolYear } = req.body;

    if (newGrade !== undefined) grade.grade = newGrade;
    if (status !== undefined) grade.status = status;
    if (semester !== undefined) grade.semester = semester;
    if (schoolYear !== undefined) grade.schoolYear = schoolYear;

    const updated = await grade.save();
    const populated = await updated.populate("course", "code desc units prereq year sem");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private/Admin/Faculty
const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }
    res.json({ message: "Grade deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getMyGrades,
  getGrades,
  createGrade,
  updateGrade,
  deleteGrade,
};
