const { connectAndRun } = require("./shared");
const { seedUsersCore } = require("./users");
const { seedAdminProfilesCore } = require("./adminProfiles");
const { seedFacultyProfilesCore } = require("./facultyProfiles");
const { seedCoursesCore } = require("./courses");
const { seedAcademicTracksCore } = require("./academicTracks");
const { seedSchoolYearSectionsCore } = require("./schoolYearSections");
const { seedStudentProfilesCore } = require("./studentProfiles");
const { seedClassSchedulesCore } = require("./classSchedules");
const { seedEventsCore } = require("./events");
const { seedViolationTypesCore } = require("./violationTypes");
const { seedViolationsCore } = require("./violations");
const { seedMedicalRecordsCore } = require("./medicalRecords");
const { seedClubOrgsCore } = require("./clubOrgs");
const { seedAnnouncementsCore } = require("./announcements");

const seedAllCore = async ({ reset = false } = {}) => {
  const userMap = await seedUsersCore({ reset });
  await seedAdminProfilesCore({ reset, userMap });
  await seedFacultyProfilesCore({ reset, userMap });
  await seedCoursesCore({ reset });
  await seedAcademicTracksCore({ reset, userMap });
  await seedSchoolYearSectionsCore({ reset, userMap });
  await seedStudentProfilesCore({ reset, userMap });
  await seedClassSchedulesCore({ reset, userMap });
  await seedViolationTypesCore({ reset });
  await seedViolationsCore({ reset });
  await seedEventsCore({ reset, userMap });
  await seedMedicalRecordsCore({ reset });
  await seedClubOrgsCore({ reset });
  await seedAnnouncementsCore({ reset, userMap });

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
