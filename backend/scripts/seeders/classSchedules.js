const ClassSchedule = require("../../models/ClassSchedule");
const SchoolYearSemester = require("../../models/SchoolYearSemester");
const Section = require("../../models/Section");
const Course = require("../../models/Course");
const FacultyProfile = require("../../models/FacultyProfile");
const AcademicTrack = require("../../models/AcademicTrack");
const { connectAndRun } = require("./shared");

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = [
  { timeStart: "07:30", timeEnd: "09:00" },
  { timeStart: "09:00", timeEnd: "10:30" },
  { timeStart: "10:30", timeEnd: "12:00" },
  { timeStart: "13:00", timeEnd: "14:30" },
  { timeStart: "14:30", timeEnd: "16:00" },
  { timeStart: "16:00", timeEnd: "17:30" },
];

const ROOMS = {
  lecture: ["Room 201", "Room 202", "Room 203", "Room 301", "Room 302", "Room 303", "Room 401", "Room 402"],
  lab: ["Lab 1", "Lab 2", "Lab 3", "Lab 4", "Lab 5"],
};

const extractYearNumber = (yearLevel = "") => {
  const match = String(yearLevel).match(/^(\d)/);
  return match ? Number(match[1]) : null;
};

const isLabCourse = (courseCode) => {
  const labPatterns = ["CCS", "MAT", "PED"];
  return labPatterns.some(pattern => courseCode.startsWith(pattern));
};

const seedClassSchedulesCore = async ({ reset = false, userMap } = {}) => {
  if (reset) {
    await ClassSchedule.deleteMany({});
  }

  const adminUser = userMap?.get("admin01");
  const currentSchoolYear = await SchoolYearSemester.findOne({ isCurrent: true }) || await SchoolYearSemester.findOne();
  if (!currentSchoolYear) {
    console.log("Class schedule seed skipped: no school year/semester found.");
    return;
  }

  const [sections, courses, facultyProfiles] = await Promise.all([
    Section.find({ schoolYearSemester: currentSchoolYear._id }).populate("academicTrack"),
    Course.find().sort({ year: 1, sem: 1, code: 1 }),
    FacultyProfile.find().sort({ lastName: 1, firstName: 1 }),
  ]);

  if (sections.length === 0 || courses.length === 0 || facultyProfiles.length === 0) {
    console.log("Class schedule seed skipped: missing sections/courses/faculty.");
    return;
  }

  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    const sectionYear = extractYearNumber(section.yearLevel);
    
    let targetCourses = courses.filter((course) => course.year === sectionYear);
    
    if (section.academicTrack && section.academicTrack.courses && section.academicTrack.courses.length > 0) {
      const trackCourseIds = section.academicTrack.courses.map(c => typeof c === 'object' ? c._id : c);
      targetCourses = targetCourses.filter(course => trackCourseIds.includes(course._id));
    }
    
    const usableCourses = targetCourses.length > 0 ? targetCourses : courses;
    const desiredCount = Math.min(7, usableCourses.length);

    for (let j = 0; j < desiredCount; j += 1) {
      const course = usableCourses[(i * 3 + j) % usableCourses.length];
      const isLab = isLabCourse(course.code) || j % 4 === 0;
      const scheduleType = isLab ? "Laboratory" : "Lecture";
      const availableRooms = isLab ? ROOMS.lab : ROOMS.lecture;
      
      const dayOfWeek = DAYS[(i + j) % DAYS.length];
      const slot = TIME_SLOTS[(i * 2 + j) % TIME_SLOTS.length];
      const roomName = availableRooms[(i + j) % availableRooms.length];
      const faculty = facultyProfiles[(i + j) % facultyProfiles.length];

      await ClassSchedule.findOneAndUpdate(
        {
          schoolYearSemester: currentSchoolYear._id,
          section: section._id,
          course: course._id,
          dayOfWeek,
          timeStart: slot.timeStart,
          timeEnd: slot.timeEnd,
        },
        {
          schoolYearSemester: currentSchoolYear._id,
          section: section._id,
          course: course._id,
          faculty: faculty._id,
          roomName,
          dayOfWeek,
          timeStart: slot.timeStart,
          timeEnd: slot.timeEnd,
          scheduleType,
          createdBy: adminUser?._id,
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
    }
  }

  console.log("Class schedules seed completed.");
};

const seedClassSchedules = async (options = {}) => connectAndRun(() => seedClassSchedulesCore(options));

if (require.main === module) {
  const reset = process.argv.includes("--reset");
  seedClassSchedules({ reset }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  seedClassSchedulesCore,
  seedClassSchedules,
};
