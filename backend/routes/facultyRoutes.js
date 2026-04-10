const express = require("express");
const router = express.Router();
const FacultyProfile = require("../models/FacultyProfile");
const User = require("../models/User");
const { protect, admin } = require("../middlewares/authMiddleware");

// GET MY FACULTY PROFILE (by logged-in user)
router.get("/me", protect, async (req, res) => {
  try {
    const faculty = await FacultyProfile.findOne({ user: req.user._id }).populate(
      "user",
      "userId email name"
    );
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE MY FACULTY PROFILE (by logged-in user)
router.put("/me", protect, async (req, res) => {
  try {
    const faculty = await FacultyProfile.findOne({ user: req.user._id });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    const {
      employeeIdNumber,
      firstName,
      middleName,
      lastName,
      gender,
      department,
      position,
      contactNumber,
      email,
    } = req.body;

    if (employeeIdNumber) faculty.employeeIdNumber = employeeIdNumber;
    if (firstName !== undefined) faculty.firstName = firstName;
    if (middleName !== undefined) faculty.middleName = middleName;
    if (lastName !== undefined) faculty.lastName = lastName;
    if (gender !== undefined) faculty.gender = gender;
    if (department !== undefined) faculty.department = department;
    if (position !== undefined) faculty.position = position;
    if (contactNumber !== undefined) faculty.contactNumber = contactNumber;

    if (email) {
      const user = await User.findById(faculty.user);
      if (user) {
        user.email = email;
        await user.save();
      }
    }

    const updated = await faculty.save();
    const populated = await updated.populate("user", "userId email name");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.use(protect, admin);

// GET ALL FACULTY
router.get("/", async (req, res) => {
  try {
    const faculty = await FacultyProfile.find().populate("user", "userId email name");
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// CREATE FACULTY
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      employeeIdNumber,
      firstName,
      middleName,
      lastName,
      gender,
      department,
      position,
      contactNumber,
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

    const existing = await FacultyProfile.findOne({
      $or: [{ user: user._id }, { employeeIdNumber }],
    });
    if (existing) {
      return res.status(400).json({ message: "Faculty profile already exists" });
    }

    const faculty = await FacultyProfile.create({
      user: user._id,
      employeeIdNumber,
      firstName,
      middleName,
      lastName,
      gender,
      department,
      position,
      contactNumber,
    });

    const populated = await faculty.populate("user", "userId email name");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE FACULTY
router.put("/:id", async (req, res) => {
  try {
    const faculty = await FacultyProfile.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    const {
      userId,
      employeeIdNumber,
      firstName,
      middleName,
      lastName,
      gender,
      department,
      position,
      contactNumber,
      email,
    } = req.body;

    if (userId) {
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(400).json({ message: "User not found for userId" });
      }
      faculty.user = user._id;
      if (email) {
        user.email = email;
        await user.save();
      }
    }

    if (employeeIdNumber) faculty.employeeIdNumber = employeeIdNumber;
    if (firstName !== undefined) faculty.firstName = firstName;
    if (middleName !== undefined) faculty.middleName = middleName;
    if (lastName !== undefined) faculty.lastName = lastName;
    if (gender !== undefined) faculty.gender = gender;
    if (department !== undefined) faculty.department = department;
    if (position !== undefined) faculty.position = position;
    if (contactNumber !== undefined) faculty.contactNumber = contactNumber;

    const updated = await faculty.save();
    const populated = await updated.populate("user", "userId email name");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE FACULTY
router.delete("/:id", async (req, res) => {
  try {
    await FacultyProfile.findByIdAndDelete(req.params.id);
    res.json({ message: "Faculty profile deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
