const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");
const Section = require("../models/Section");
const ClassSchedule = require("../models/ClassSchedule");
const mongoose = require("mongoose");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeTextField = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return "";
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(", ");
  }
  return String(value).trim();
};

const normalizeOptionalObjectId = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return undefined;
  return isValidObjectId(value) ? value : undefined;
};

const formatSchoolYearLabel = (schoolYearSemester) => {
  if (!schoolYearSemester) return "";
  return `${schoolYearSemester.schoolYear} (${schoolYearSemester.semester})`;
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const students = await StudentProfile.find()
      .populate("user", "userId email name")
      .populate({
        path: "section",
        select: "sectionName yearLevel program schoolYearSemester",
        populate: {
          path: "schoolYearSemester",
          select: "schoolYear semester isCurrent",
        },
      });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private/Admin
const getStudentById = async (req, res) => {
  try {
    const student = await StudentProfile.findById(req.params.id)
      .populate("user", "userId email name")
      .populate({
        path: "section",
        select: "sectionName yearLevel program schoolYearSemester",
        populate: {
          path: "schoolYearSemester",
          select: "schoolYear semester isCurrent",
        },
      });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a student profile
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  try {
    const {
      userId, studentNumber, firstName, middleName, lastName, gender,
      yearLevel, schoolYear, program, academicTrack, section, academicStatus, height,
      weight, contactNumber, emergencyContactName, emergencyContactNumber,
      emergencyContactRelation, yearGraduated, email, password,
      achievements, skills, interests
    } = req.body;

    const finalUserId = userId || studentNumber;

    if (!studentNumber || !firstName || !lastName || !height) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    let user = await User.findOne({ userId: finalUserId });

    // Auto-create user if parameter is enabled & doesn't exist
    if (!user) {
       user = await User.create({
          userId: finalUserId,
          name: `${firstName} ${lastName}`,
          email: email || `${studentNumber}@student.app.edu`,
          password: password || "password123",
          role: "student"
       });
    }

    const existingStudent = await StudentProfile.findOne({
      $or: [{ user: user._id }, { studentNumber }],
    });

    if (existingStudent) {
      return res.status(400).json({ message: "Student profile (or student number) already exists" });
    }

    const normalizedSectionId = normalizeOptionalObjectId(section);
    let resolvedSchoolYear = schoolYear;
    let resolvedYearLevel = yearLevel;

    if (normalizedSectionId) {
      const sectionRecord = await Section.findById(normalizedSectionId).populate("schoolYearSemester", "schoolYear semester");
      if (!sectionRecord) {
        return res.status(400).json({ message: "Selected section not found" });
      }
      resolvedSchoolYear = formatSchoolYearLabel(sectionRecord.schoolYearSemester);
      resolvedYearLevel = sectionRecord.yearLevel || resolvedYearLevel;
    }

    const student = await StudentProfile.create({
      user: user._id,
      studentNumber,
      firstName,
      middleName,
      lastName,
      gender,
      yearLevel: resolvedYearLevel,
      schoolYear: resolvedSchoolYear,
      program,
      academicTrack: normalizeOptionalObjectId(academicTrack),
      section: normalizedSectionId,
      academicStatus,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      contactNumber,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelation,
      yearGraduated: yearGraduated ? Number(yearGraduated) : undefined,
      achievements: Array.isArray(achievements) ? achievements : (achievements ? achievements.split(',').map(s=>s.trim()) : []),
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s=>s.trim()) : []),
      interests: Array.isArray(interests) ? interests : (interests ? interests.split(',').map(s=>s.trim()) : []),
    });

    const populated = await student.populate([
      { path: "user", select: "userId email name" },
      {
        path: "section",
        select: "sectionName yearLevel program schoolYearSemester",
        populate: {
          path: "schoolYearSemester",
          select: "schoolYear semester isCurrent",
        },
      },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a student profile
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    const student = await StudentProfile.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const {
      userId, studentNumber, firstName, middleName, lastName, gender,
      yearLevel, schoolYear, program, academicTrack, section, academicStatus, height,
      weight, contactNumber, emergencyContactName, emergencyContactNumber,
      emergencyContactRelation, yearGraduated, email, achievements, skills, interests
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
    if (yearLevel !== undefined && section === undefined) student.yearLevel = yearLevel;
    if (schoolYear !== undefined && section === undefined) student.schoolYear = schoolYear;
    if (program !== undefined) student.program = program;
    
    if (academicTrack !== undefined) {
      student.academicTrack = normalizeOptionalObjectId(academicTrack);
    }
    if (section !== undefined) {
      student.section = normalizeOptionalObjectId(section);

      if (student.section) {
        const sectionRecord = await Section.findById(student.section).populate("schoolYearSemester", "schoolYear semester");
        if (!sectionRecord) {
          return res.status(400).json({ message: "Selected section not found" });
        }
        student.schoolYear = formatSchoolYearLabel(sectionRecord?.schoolYearSemester);
        student.yearLevel = sectionRecord.yearLevel || student.yearLevel;
      }
    }

    if (student.academicTrack !== undefined && student.academicTrack !== null && !isValidObjectId(student.academicTrack)) {
      student.academicTrack = undefined;
    }
    if (student.section !== undefined && student.section !== null && !isValidObjectId(student.section)) {
      student.section = undefined;
    }
    
    if (academicStatus !== undefined) student.academicStatus = academicStatus;
    if (height !== undefined) student.height = height;
    if (weight !== undefined) student.weight = weight;
    if (contactNumber !== undefined) student.contactNumber = contactNumber;
    if (emergencyContactName !== undefined) student.emergencyContactName = emergencyContactName;
    if (emergencyContactNumber !== undefined) student.emergencyContactNumber = emergencyContactNumber;
    if (emergencyContactRelation !== undefined) student.emergencyContactRelation = emergencyContactRelation;
    if (yearGraduated !== undefined) student.yearGraduated = yearGraduated;
    if (achievements !== undefined) student.achievements = normalizeTextField(achievements);
    if (skills !== undefined) student.skills = normalizeTextField(skills);
    if (interests !== undefined) student.interests = normalizeTextField(interests);

    if (email !== undefined) {
      const user = await User.findById(student.user);
      if (user) {
        user.email = email;
        await user.save();
      }
    }

    const updated = await student.save();
    const populated = await updated.populate([
      { path: "user", select: "userId email name" },
      {
        path: "section",
        select: "sectionName yearLevel program schoolYearSemester",
        populate: {
          path: "schoolYearSemester",
          select: "schoolYear semester isCurrent",
        },
      },
    ]);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a student profile
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const student = await StudentProfile.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    
    // Optionally delete the user account too, but we will leave the user account intact for now
    // await User.findByIdAndDelete(student.user);
    
    res.json({ message: "Student profile deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get current student's schedule
// @route   GET /api/students/me/schedule
// @access  Private/Student
const getMySchedule = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id })
      .populate("section");
    
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    if (!student.section) {
      return res.json([]);
    }

    const schedules = await ClassSchedule.find({ section: student.section._id })
      .populate("schoolYearSemester", "schoolYear semester isCurrent")
      .populate("section", "sectionName yearLevel program")
      .populate("course", "code desc units year sem")
      .populate("faculty", "firstName middleName lastName employeeIdNumber user")
      .sort({ dayOfWeek: 1, timeStart: 1 });

    const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };
    const sorted = schedules.sort((a, b) => {
      const dayDiff = (dayOrder[a.dayOfWeek] || 99) - (dayOrder[b.dayOfWeek] || 99);
      if (dayDiff !== 0) return dayDiff;
      return (a.timeStart || "").localeCompare(b.timeStart || "");
    });

    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMySchedule,
};
