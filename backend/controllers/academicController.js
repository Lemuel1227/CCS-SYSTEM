const mongoose = require("mongoose");
const SchoolYearSemester = require("../models/SchoolYearSemester");
const Section = require("../models/Section");
const AcademicTrack = require("../models/AcademicTrack");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const formatSchoolYearLabel = (record) => {
  if (!record) return "";
  return `${record.schoolYear} (${record.semester})`;
};

const getSchoolYears = async (req, res) => {
  try {
    const items = await SchoolYearSemester.find().sort({ schoolYear: -1, semester: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createSchoolYear = async (req, res) => {
  try {
    const { schoolYear, semester, isCurrent, startDate, endDate } = req.body;

    if (!schoolYear || !semester) {
      return res.status(400).json({ message: "School year and semester are required" });
    }

    if (isCurrent) {
      await SchoolYearSemester.updateMany({}, { isCurrent: false });
    }

    const created = await SchoolYearSemester.create({
      schoolYear,
      semester,
      isCurrent: Boolean(isCurrent),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    res.status(201).json(created);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "School year + semester already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateSchoolYear = async (req, res) => {
  try {
    const item = await SchoolYearSemester.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "School year record not found" });
    }

    const { schoolYear, semester, isCurrent, startDate, endDate } = req.body;

    if (schoolYear !== undefined) item.schoolYear = schoolYear;
    if (semester !== undefined) item.semester = semester;
    if (startDate !== undefined) item.startDate = startDate || undefined;
    if (endDate !== undefined) item.endDate = endDate || undefined;

    if (isCurrent !== undefined) {
      if (Boolean(isCurrent)) {
        await SchoolYearSemester.updateMany({}, { isCurrent: false });
      }
      item.isCurrent = Boolean(isCurrent);
    }

    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "School year + semester already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteSchoolYear = async (req, res) => {
  try {
    const inUse = await Section.countDocuments({ schoolYearSemester: req.params.id });
    if (inUse > 0) {
      return res.status(400).json({ message: "Cannot delete school year with existing sections" });
    }

    const deleted = await SchoolYearSemester.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "School year record not found" });
    }

    res.json({ message: "School year deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getSections = async (req, res) => {
  try {
    const filter = {};
    if (req.query.schoolYearSemester && isValidObjectId(req.query.schoolYearSemester)) {
      filter.schoolYearSemester = req.query.schoolYearSemester;
    }

    const items = await Section.find(filter)
      .populate("schoolYearSemester", "schoolYear semester isCurrent")
      .populate({
        path: "academicTrack",
        select: "name code courses",
        populate: {
          path: "courses",
          select: "code desc units"
        }
      })
      .sort({ sectionName: 1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createSection = async (req, res) => {
  try {
    const { schoolYearSemester, sectionName, yearLevel, program, academicTrack, maxStudents } = req.body;

    if (!schoolYearSemester || !sectionName) {
      return res.status(400).json({ message: "School year and section name are required" });
    }

    if (!isValidObjectId(schoolYearSemester)) {
      return res.status(400).json({ message: "Invalid school year reference" });
    }

    const schoolYear = await SchoolYearSemester.findById(schoolYearSemester);
    if (!schoolYear) {
      return res.status(400).json({ message: "Referenced school year not found" });
    }

    const created = await Section.create({
      schoolYearSemester,
      sectionName,
      yearLevel,
      program,
      academicTrack: academicTrack || undefined,
      maxStudents: maxStudents ? Number(maxStudents) : undefined,
      createdBy: req.user?._id,
    });

    const populated = await created.populate({
      path: "academicTrack",
      select: "name code courses",
      populate: {
        path: "courses",
        select: "code desc units"
      }
    });
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Section already exists for this school year" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const { schoolYearSemester, sectionName, yearLevel, program, academicTrack, maxStudents } = req.body;

    if (schoolYearSemester !== undefined) {
      if (!isValidObjectId(schoolYearSemester)) {
        return res.status(400).json({ message: "Invalid school year reference" });
      }

      const schoolYear = await SchoolYearSemester.findById(schoolYearSemester);
      if (!schoolYear) {
        return res.status(400).json({ message: "Referenced school year not found" });
      }

      section.schoolYearSemester = schoolYearSemester;
    }

    if (sectionName !== undefined) section.sectionName = sectionName;
    if (yearLevel !== undefined) section.yearLevel = yearLevel;
    if (program !== undefined) section.program = program;
    if (academicTrack !== undefined) section.academicTrack = academicTrack || undefined;
    if (maxStudents !== undefined) section.maxStudents = maxStudents ? Number(maxStudents) : undefined;

    const updated = await section.save();
    const populated = await updated.populate({
      path: "academicTrack",
      select: "name code courses",
      populate: {
        path: "courses",
        select: "code desc units"
      }
    });
    res.json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Section already exists for this school year" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteSection = async (req, res) => {
  try {
    const deleted = await Section.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json({ message: "Section deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateAcademicTrackCourses = async (req, res) => {
  try {
    const { id } = req.params;
    const { courses } = req.body;

    if (!Array.isArray(courses)) {
      return res.status(400).json({ message: "Courses must be an array" });
    }

    // Validate all course IDs
    for (const courseId of courses) {
      if (!isValidObjectId(courseId)) {
        return res.status(400).json({ message: `Invalid course ID: ${courseId}` });
      }
    }

    const track = await AcademicTrack.findById(id);
    if (!track) {
      return res.status(404).json({ message: "Academic track not found" });
    }

    track.courses = courses;
    const updated = await track.save();
    const populated = await updated.populate("courses", "code desc units");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAcademicTracks = async (req, res) => {
  try {
    const items = await AcademicTrack.find().sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createAcademicTrack = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Academic track name is required" });
    }

    const created = await AcademicTrack.create({
      name,
      code,
      createdBy: req.user?._id,
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateAcademicTrack = async (req, res) => {
  try {
    const track = await AcademicTrack.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ message: "Academic track not found" });
    }

    const { name, code } = req.body;

    if (name !== undefined) track.name = name;
    if (code !== undefined) track.code = code;

    const updated = await track.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteAcademicTrack = async (req, res) => {
  try {
    const deleted = await AcademicTrack.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Academic track not found" });
    }

    res.json({ message: "Academic track deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAcademicOptions = async (req, res) => {
  try {
    const [schoolYears, sections] = await Promise.all([
      SchoolYearSemester.find().sort({ schoolYear: -1, semester: 1 }),
      Section.find().populate("schoolYearSemester", "schoolYear semester isCurrent").sort({ sectionName: 1 }),
    ]);

    const sectionOptions = sections.map((section) => ({
      _id: section._id,
      sectionName: section.sectionName,
      yearLevel: section.yearLevel,
      program: section.program,
      schoolYearSemester: section.schoolYearSemester,
      schoolYearLabel: formatSchoolYearLabel(section.schoolYearSemester),
    }));

    res.json({ schoolYears, sections: sectionOptions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getSchoolYears,
  createSchoolYear,
  updateSchoolYear,
  deleteSchoolYear,
  getSections,
  createSection,
  updateSection,
  deleteSection,
  getAcademicTracks,
  createAcademicTrack,
  updateAcademicTrack,
  deleteAcademicTrack,
  updateAcademicTrackCourses,
  getAcademicOptions,
};