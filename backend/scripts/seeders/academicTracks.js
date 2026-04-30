const AcademicTrack = require("../../models/AcademicTrack");
const Course = require("../../models/Course");
const { connectAndRun } = require("./shared");

const seedAcademicTracksCore = async ({ reset = false, userMap } = {}) => {
  if (reset) {
    await AcademicTrack.deleteMany({});
  }

  const adminUser = userMap?.get("admin01");
  const courses = await Course.find().sort({ year: 1, sem: 1, code: 1 });

  const bsitTrack = await AcademicTrack.findOneAndUpdate(
    { code: "BSIT" },
    {
      name: "Bachelor of Science in Information Technology",
      code: "BSIT",
      courses: courses.map(c => c._id),
      createdBy: adminUser?._id,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  const bscsTrack = await AcademicTrack.findOneAndUpdate(
    { code: "BSCS" },
    {
      name: "Bachelor of Science in Computer Science",
      code: "BSCS",
      courses: courses.map(c => c._id),
      createdBy: adminUser?._id,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  console.log("Academic tracks seed completed.");
  return { bsitTrack, bscsTrack };
};

const seedAcademicTracks = async (options = {}) => connectAndRun(() => seedAcademicTracksCore(options));

if (require.main === module) {
  const reset = process.argv.includes("--reset");
  seedAcademicTracks({ reset }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  seedAcademicTracksCore,
  seedAcademicTracks,
};
