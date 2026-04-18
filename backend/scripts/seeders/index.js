const { connectAndRun } = require("./shared");
const { seedUsersCore } = require("./users");
const { seedAdminProfilesCore } = require("./adminProfiles");
const { seedFacultyProfilesCore } = require("./facultyProfiles");
const { seedStudentProfilesCore } = require("./studentProfiles");
const { seedCoursesCore } = require("./courses");
const { seedEventsCore } = require("./events");

const seedAllCore = async ({ reset = false } = {}) => {
  const userMap = await seedUsersCore({ reset });
  await seedAdminProfilesCore({ reset, userMap });
  await seedFacultyProfilesCore({ reset, userMap });
  await seedStudentProfilesCore({ reset, userMap });
  await seedCoursesCore({ reset });
  await seedEventsCore({ reset, userMap });

  console.log("Temp seed completed.");
};

const seedAll = async (options = {}) => connectAndRun(() => seedAllCore(options));

if (require.main === module) {
  const reset = process.argv.includes("--reset");

  seedAll({ reset }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  seedAllCore,
  seedAll,
};