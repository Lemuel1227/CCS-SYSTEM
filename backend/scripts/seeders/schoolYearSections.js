const SchoolYearSemester = require("../../models/SchoolYearSemester");
const Section = require("../../models/Section");
const AcademicTrack = require("../../models/AcademicTrack");
const { connectAndRun } = require("./shared");
const { schoolYearsToSeed } = require("./data");

const SECTION_PATTERNS = [
  { sectionName: "1IT-A", yearLevel: "1st Year", program: "BSIT" },
  { sectionName: "1IT-B", yearLevel: "1st Year", program: "BSIT" },
  { sectionName: "1IT-C", yearLevel: "1st Year", program: "BSIT" },
  { sectionName: "2IT-A", yearLevel: "2nd Year", program: "BSIT" },
  { sectionName: "2IT-B", yearLevel: "2nd Year", program: "BSIT" },
  { sectionName: "2IT-C", yearLevel: "2nd Year", program: "BSIT" },
  { sectionName: "3IT-A", yearLevel: "3rd Year", program: "BSIT" },
  { sectionName: "3IT-B", yearLevel: "3rd Year", program: "BSIT" },
  { sectionName: "4IT-A", yearLevel: "4th Year", program: "BSIT" },
  { sectionName: "4IT-B", yearLevel: "4th Year", program: "BSIT" },
  { sectionName: "1CS-A", yearLevel: "1st Year", program: "BSCS" },
  { sectionName: "1CS-B", yearLevel: "1st Year", program: "BSCS" },
  { sectionName: "2CS-A", yearLevel: "2nd Year", program: "BSCS" },
  { sectionName: "2CS-B", yearLevel: "2nd Year", program: "BSCS" },
  { sectionName: "3CS-A", yearLevel: "3rd Year", program: "BSCS" },
  { sectionName: "3CS-B", yearLevel: "3rd Year", program: "BSCS" },
  { sectionName: "4CS-A", yearLevel: "4th Year", program: "BSCS" },
  { sectionName: "4CS-B", yearLevel: "4th Year", program: "BSCS" },
];

const seedSchoolYearSectionsCore = async ({ reset = false, userMap } = {}) => {
  if (reset) {
    await Section.deleteMany({});
    await SchoolYearSemester.deleteMany({});
  }

  const adminUser = userMap?.get("admin01");

  const schoolYearDocs = new Map();

  for (const schoolYearData of schoolYearsToSeed) {
    const doc = await SchoolYearSemester.findOneAndUpdate(
      { schoolYear: schoolYearData.schoolYear, semester: schoolYearData.semester },
      {
        schoolYear: schoolYearData.schoolYear,
        semester: schoolYearData.semester,
        isCurrent: Boolean(schoolYearData.isCurrent),
        startDate: schoolYearData.startDate ? new Date(schoolYearData.startDate) : undefined,
        endDate: schoolYearData.endDate ? new Date(schoolYearData.endDate) : undefined,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    schoolYearDocs.set(`${schoolYearData.schoolYear}-${schoolYearData.semester}`, doc);
  }

  if (schoolYearsToSeed.some((item) => item.isCurrent)) {
    const currentItems = schoolYearsToSeed.filter((item) => item.isCurrent);
    const currentIds = currentItems
      .map((item) => schoolYearDocs.get(`${item.schoolYear}-${item.semester}`))
      .filter(Boolean)
      .map((doc) => doc._id);
    await SchoolYearSemester.updateMany({ _id: { $nin: currentIds } }, { isCurrent: false });
  }

  const bsitTrack = await AcademicTrack.findOne({ code: "BSIT" });
  const bscsTrack = await AcademicTrack.findOne({ code: "BSCS" });

  for (const schoolYearDoc of schoolYearDocs.values()) {
    for (const sectionPattern of SECTION_PATTERNS) {
      const academicTrack = sectionPattern.program === "BSIT" ? bsitTrack?._id : sectionPattern.program === "BSCS" ? bscsTrack?._id : null;
      
      await Section.findOneAndUpdate(
        { schoolYearSemester: schoolYearDoc._id, sectionName: sectionPattern.sectionName },
        {
          schoolYearSemester: schoolYearDoc._id,
          sectionName: sectionPattern.sectionName,
          yearLevel: sectionPattern.yearLevel,
          program: sectionPattern.program,
          academicTrack,
          maxStudents: 45,
          createdBy: adminUser?._id,
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
    }
  }

  console.log("School year and section seed completed.");
};

const seedSchoolYearSections = async (options = {}) => connectAndRun(() => seedSchoolYearSectionsCore(options));

if (require.main === module) {
  const reset = process.argv.includes("--reset");
  seedSchoolYearSections({ reset }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  seedSchoolYearSectionsCore,
  seedSchoolYearSections,
};
