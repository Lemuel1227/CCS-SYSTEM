const { connectAndRun } = require("./shared");
const Announcement = require("../../models/Announcement");
const { seedUsersCore } = require("./users");

const seedAnnouncementsCore = async ({ reset = false, userMap } = {}) => {
  if (reset) {
    await Announcement.deleteMany({});
    console.log("Announcements reset.");
  }

  // Automatically seed users if userMap is missing
  if (!userMap) {
    userMap = await seedUsersCore({ reset });
  }

  const adminUser = userMap.get("admin01");
  const facultyUser = userMap.get("faculty01");

  if (!adminUser && !facultyUser) {
    console.warn("No admin or faculty user found via userMap. Skipping Announcement seed.");
    return;
  }

  const announcementsData = [
    {
      title: "Welcome to the New CCS Portal",
      content: "We are thrilled to launch the new College of Computer Studies portal. Stay tuned for further updates regarding new features that will be rolled out progressively.",
      author: adminUser ? adminUser._id : facultyUser._id,
      status: "Posted",
      postedAt: Date.now() - 1000 * 60 * 60 * 24 * 2 // 2 days ago
    },
    {
      title: "Enrollment Schedule for 1st Semester",
      content: "Please be guided that the enrollment for the upcoming 1st semester 2026-2027 will strictly follow the alphabetical schedule. Kindly check your respective dates on the bulletin board.",
      author: adminUser ? adminUser._id : facultyUser._id,
      status: "Posted",
      postedAt: Date.now() - 1000 * 60 * 60 * 24 * 5 // 5 days ago
    },
    {
      title: "System Maintenance Notice",
      content: "The portal will be down for scheduled maintenance this Saturday from 10:00 PM to 2:00 AM. Expect intermittent connectivity.",
      author: facultyUser ? facultyUser._id : adminUser._id,
      status: "Posted",
      postedAt: Date.now() - 1000 * 60 * 60 * 12 // 12 hours ago
    },
    {
      title: "Draft: Guidelines for Thesis Capstone 1",
      content: "Here are the initial guidelines for incoming 3rd year students for their capstone project. Note: Not yet final, subject for revision.",
      author: facultyUser ? facultyUser._id : adminUser._id,
      status: "Draft",
      postedAt: null
    }
  ];

  await Announcement.insertMany(announcementsData);
  console.log("Announcements seeded successfully.");
};

const seedAnnouncements = async (options = {}) =>
  connectAndRun(() => seedAnnouncementsCore(options));

if (require.main === module) {
  const reset = process.argv.includes("--reset");

  seedAnnouncements({ reset }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  seedAnnouncementsCore,
  seedAnnouncements,
};