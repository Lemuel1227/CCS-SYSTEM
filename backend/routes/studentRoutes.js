const express = require("express");
const router = express.Router();
const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");
const { protect, admin } = require("../middlewares/authMiddleware");

const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(value || "");

// GET MY STUDENT PROFILE (by logged-in user)
router.get("/me", protect, async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id }).populate(
      "user",
      "userId email name"
    );
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE MY STUDENT PROFILE (by logged-in user)
router.put("/me", protect, async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const {
      studentNumber,
      firstName,
      middleName,
      lastName,
      gender,
      yearLevel,
      program,
      academicStatus,
      height,
      weight,
      contactNumber,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelation,
      yearGraduated,
      email,
    } = req.body;

    if (studentNumber) student.studentNumber = studentNumber;
    if (firstName !== undefined) student.firstName = firstName;
    if (middleName !== undefined) student.middleName = middleName;
    if (lastName !== undefined) student.lastName = lastName;
    if (gender !== undefined) student.gender = gender;
    if (yearLevel !== undefined) student.yearLevel = yearLevel;
    if (program !== undefined) student.program = program;
    if (academicStatus !== undefined) student.academicStatus = academicStatus;
    if (height !== undefined) student.height = height;
    if (weight !== undefined) student.weight = weight;
    if (contactNumber !== undefined) student.contactNumber = contactNumber;
    if (emergencyContactName !== undefined) student.emergencyContactName = emergencyContactName;
    if (emergencyContactNumber !== undefined) student.emergencyContactNumber = emergencyContactNumber;
    if (emergencyContactRelation !== undefined) student.emergencyContactRelation = emergencyContactRelation;
    if (yearGraduated !== undefined) student.yearGraduated = yearGraduated;

    if (email) {
      const user = await User.findById(student.user);
      if (user) {
        user.email = email;
        await user.save();
      }
    }

    const updated = await student.save();
    const populated = await updated.populate("user", "userId email name");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.use(protect, admin);

// GET ALL STUDENTS
router.get("/", async (req, res) => {
  try {
    const students = await StudentProfile.find().populate("user", "userId email name");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// CREATE STUDENT
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      studentNumber,
      firstName,
      middleName,
      lastName,
      gender,
      yearLevel,
      program,
      academicTrack,
      section,
      academicStatus,
      height,
      weight,
      contactNumber,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelation,
      yearGraduated,
      email,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(400).json({ message: "User not found for userId" });
    }

    if (email) {
      user.email = email;
      await user.save();
    }

    const existing = await StudentProfile.findOne({
      $or: [{ user: user._id }, { studentNumber }],
    });
    if (existing) {
      return res.status(400).json({ message: "Student profile already exists" });
    }

    const student = await StudentProfile.create({
      user: user._id,
      studentNumber,
      firstName,
      middleName,
      lastName,
      gender,
      yearLevel,
      program,
      academicTrack: isValidObjectId(academicTrack) ? academicTrack : undefined,
      section: isValidObjectId(section) ? section : undefined,
      academicStatus,
      height,
      weight,
      contactNumber,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelation,
      yearGraduated,
    });

    const populated = await student.populate("user", "userId email name");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE STUDENT
router.put("/:id", async (req, res) => {
  try {
    const student = await StudentProfile.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const {
      userId,
      studentNumber,
      firstName,
      middleName,
      lastName,
      gender,
      yearLevel,
      program,
      academicTrack,
      section,
      academicStatus,
      height,
      weight,
      contactNumber,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelation,
      yearGraduated,
      email,
    } = req.body;

    if (userId) {
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(400).json({ message: "User not found for userId" });
      }
      student.user = user._id;
      if (email) {
        user.email = email;
        await user.save();
      }
    }

    if (studentNumber) student.studentNumber = studentNumber;
    if (firstName !== undefined) student.firstName = firstName;
    if (middleName !== undefined) student.middleName = middleName;
    if (lastName !== undefined) student.lastName = lastName;
    if (gender !== undefined) student.gender = gender;
    if (yearLevel !== undefined) student.yearLevel = yearLevel;
    if (program !== undefined) student.program = program;
    if (academicTrack !== undefined && isValidObjectId(academicTrack)) {
      student.academicTrack = academicTrack;
    }
    if (section !== undefined && isValidObjectId(section)) {
      student.section = section;
    }
    if (academicStatus !== undefined) student.academicStatus = academicStatus;
    if (height !== undefined) student.height = height;
    if (weight !== undefined) student.weight = weight;
    if (contactNumber !== undefined) student.contactNumber = contactNumber;
    if (emergencyContactName !== undefined) student.emergencyContactName = emergencyContactName;
    if (emergencyContactNumber !== undefined) student.emergencyContactNumber = emergencyContactNumber;
    if (emergencyContactRelation !== undefined) student.emergencyContactRelation = emergencyContactRelation;
    if (yearGraduated !== undefined) student.yearGraduated = yearGraduated;

    const updated = await student.save();
    const populated = await updated.populate("user", "userId email name");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE STUDENT
router.delete("/:id", async (req, res) => {
  try {
    await StudentProfile.findByIdAndDelete(req.params.id);
    res.json({ message: "Student profile deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
