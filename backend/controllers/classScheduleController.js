const mongoose = require("mongoose");
const ClassSchedule = require("../models/ClassSchedule");
const SchoolYearSemester = require("../models/SchoolYearSemester");
const Section = require("../models/Section");
const Course = require("../models/Course");
const FacultyProfile = require("../models/FacultyProfile");
const AcademicTrack = require("../models/AcademicTrack");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const dayOrder = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

const formatSchoolYearLabel = (record) => {
  if (!record) return "";
  return `${record.schoolYear} (${record.semester})`;
};

const toMinutes = (time) => {
  if (!time || typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) return NaN;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const validateTimeRange = (timeStart, timeEnd) => {
  const start = toMinutes(timeStart);
  const end = toMinutes(timeEnd);
  return Number.isFinite(start) && Number.isFinite(end) && start < end;
};

const populateSchedule = (query) =>
  query.populate([
    { path: "schoolYearSemester", select: "schoolYear semester isCurrent" },
    { path: "section", select: "sectionName yearLevel program schoolYearSemester" },
    { path: "course", select: "code desc units year sem" },
    {
      path: "faculty",
      select: "firstName middleName lastName employeeIdNumber user",
      populate: { path: "user", select: "userId name email" },
    },
    { path: "createdBy", select: "userId name email role" },
  ]);

const getClassSchedules = async (req, res) => {
  try {
    const filter = {};
    if (req.query.schoolYearSemester && isValidObjectId(req.query.schoolYearSemester)) {
      filter.schoolYearSemester = req.query.schoolYearSemester;
    }
    if (req.query.section && isValidObjectId(req.query.section)) {
      filter.section = req.query.section;
    }
    if (req.query.dayOfWeek) {
      filter.dayOfWeek = req.query.dayOfWeek;
    }

    const schedules = await populateSchedule(ClassSchedule.find(filter));
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

const getClassScheduleById = async (req, res) => {
  try {
    const schedule = await populateSchedule(ClassSchedule.findById(req.params.id));
    if (!schedule) {
      return res.status(404).json({ message: "Class schedule not found" });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getClassScheduleOptions = async (req, res) => {
  try {
    const [schoolYears, sections, courses, faculty] = await Promise.all([
      SchoolYearSemester.find().sort({ schoolYear: -1, semester: 1 }),
      Section.find()
        .populate("schoolYearSemester", "schoolYear semester isCurrent")
        .populate({
          path: "academicTrack",
          select: "name code courses",
          populate: {
            path: "courses",
            select: "code desc units"
          }
        })
        .sort({ sectionName: 1 }),
      Course.find().sort({ year: 1, sem: 1, code: 1 }),
      FacultyProfile.find().populate("user", "userId name email").sort({ lastName: 1, firstName: 1 }),
    ]);

    const sectionOptions = sections.map((section) => ({
      _id: section._id,
      sectionName: section.sectionName,
      yearLevel: section.yearLevel,
      program: section.program,
      schoolYearSemester: section.schoolYearSemester,
      schoolYearLabel: formatSchoolYearLabel(section.schoolYearSemester),
      academicTrack: section.academicTrack,
    }));

    res.json({ schoolYears, sections: sectionOptions, courses, faculty });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const findScheduleConflict = async ({
  scheduleId,
  schoolYearSemester,
  section,
  faculty,
  roomName,
  dayOfWeek,
  timeStart,
  timeEnd,
}) => {
  const conflictFilter = {
    schoolYearSemester,
    dayOfWeek,
    timeStart: { $lt: timeEnd },
    timeEnd: { $gt: timeStart },
    $or: [{ section }, { faculty }, { roomName: roomName.trim() }],
  };

  if (scheduleId) {
    conflictFilter._id = { $ne: scheduleId };
  }

  return ClassSchedule.findOne(conflictFilter);
};

const createClassSchedule = async (req, res) => {
  try {
    const {
      schoolYearSemester,
      section,
      course,
      faculty,
      roomName,
      dayOfWeek,
      timeStart,
      timeEnd,
      scheduleType,
    } = req.body;

    if (
      !schoolYearSemester ||
      !section ||
      !course ||
      !faculty ||
      !roomName ||
      !dayOfWeek ||
      !timeStart ||
      !timeEnd
    ) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (
      !isValidObjectId(schoolYearSemester) ||
      !isValidObjectId(section) ||
      !isValidObjectId(course) ||
      !isValidObjectId(faculty)
    ) {
      return res.status(400).json({ message: "Invalid school year, section, course, or faculty reference" });
    }

    if (!validateTimeRange(timeStart, timeEnd)) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    const [schoolYearDoc, sectionDoc, courseDoc, facultyDoc] = await Promise.all([
      SchoolYearSemester.findById(schoolYearSemester),
      Section.findById(section),
      Course.findById(course),
      FacultyProfile.findById(faculty),
    ]);

    if (!schoolYearDoc || !sectionDoc || !courseDoc || !facultyDoc) {
      return res.status(400).json({ message: "Referenced record not found" });
    }

    if (String(sectionDoc.schoolYearSemester) !== String(schoolYearSemester)) {
      return res.status(400).json({ message: "Section does not belong to the selected school year/semester" });
    }

    if (sectionDoc.academicTrack) {
      const track = await AcademicTrack.findById(sectionDoc.academicTrack);
      if (track && track.courses && track.courses.length > 0) {
        if (!track.courses.some(c => String(c) === String(course))) {
          return res.status(400).json({ message: "Course is not in this section's academic track" });
        }
      }
    }

    const conflict = await findScheduleConflict({
      schoolYearSemester,
      section,
      faculty,
      roomName,
      dayOfWeek,
      timeStart,
      timeEnd,
    });

    if (conflict) {
      return res.status(400).json({
        message: "Schedule conflict detected for section, faculty, or room on the same day/time.",
      });
    }

    const created = await ClassSchedule.create({
      schoolYearSemester,
      section,
      course,
      faculty,
      roomName: roomName.trim(),
      dayOfWeek,
      timeStart,
      timeEnd,
      scheduleType: scheduleType || "Lecture",
      createdBy: req.user?._id,
    });

    const populated = await populateSchedule(ClassSchedule.findById(created._id));
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateClassSchedule = async (req, res) => {
  try {
    const schedule = await ClassSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: "Class schedule not found" });
    }

    const nextValues = {
      schoolYearSemester: req.body.schoolYearSemester || String(schedule.schoolYearSemester),
      section: req.body.section || String(schedule.section),
      course: req.body.course || String(schedule.course),
      faculty: req.body.faculty || String(schedule.faculty),
      roomName: req.body.roomName !== undefined ? req.body.roomName : schedule.roomName,
      dayOfWeek: req.body.dayOfWeek || schedule.dayOfWeek,
      timeStart: req.body.timeStart || schedule.timeStart,
      timeEnd: req.body.timeEnd || schedule.timeEnd,
      scheduleType: req.body.scheduleType || schedule.scheduleType,
    };

    if (
      !isValidObjectId(nextValues.schoolYearSemester) ||
      !isValidObjectId(nextValues.section) ||
      !isValidObjectId(nextValues.course) ||
      !isValidObjectId(nextValues.faculty)
    ) {
      return res.status(400).json({ message: "Invalid school year, section, course, or faculty reference" });
    }

    if (!validateTimeRange(nextValues.timeStart, nextValues.timeEnd)) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    const sectionDoc = await Section.findById(nextValues.section);
    if (!sectionDoc) {
      return res.status(400).json({ message: "Section not found" });
    }
    if (String(sectionDoc.schoolYearSemester) !== String(nextValues.schoolYearSemester)) {
      return res.status(400).json({ message: "Section does not belong to the selected school year/semester" });
    }

    if (sectionDoc.academicTrack) {
      const track = await AcademicTrack.findById(sectionDoc.academicTrack);
      if (track && track.courses && track.courses.length > 0) {
        if (!track.courses.some(c => String(c) === String(nextValues.course))) {
          return res.status(400).json({ message: "Course is not in this section's academic track" });
        }
      }
    }

    const conflict = await findScheduleConflict({
      scheduleId: schedule._id,
      schoolYearSemester: nextValues.schoolYearSemester,
      section: nextValues.section,
      faculty: nextValues.faculty,
      roomName: nextValues.roomName,
      dayOfWeek: nextValues.dayOfWeek,
      timeStart: nextValues.timeStart,
      timeEnd: nextValues.timeEnd,
    });

    if (conflict) {
      return res.status(400).json({
        message: "Schedule conflict detected for section, faculty, or room on the same day/time.",
      });
    }

    schedule.schoolYearSemester = nextValues.schoolYearSemester;
    schedule.section = nextValues.section;
    schedule.course = nextValues.course;
    schedule.faculty = nextValues.faculty;
    schedule.roomName = String(nextValues.roomName || "").trim();
    schedule.dayOfWeek = nextValues.dayOfWeek;
    schedule.timeStart = nextValues.timeStart;
    schedule.timeEnd = nextValues.timeEnd;
    schedule.scheduleType = nextValues.scheduleType;

    const updated = await schedule.save();
    const populated = await populateSchedule(ClassSchedule.findById(updated._id));
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteClassSchedule = async (req, res) => {
  try {
    const schedule = await ClassSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: "Class schedule not found" });
    }
    res.json({ message: "Class schedule deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getClassSchedules,
  getClassScheduleById,
  getClassScheduleOptions,
  createClassSchedule,
  updateClassSchedule,
  deleteClassSchedule,
};
