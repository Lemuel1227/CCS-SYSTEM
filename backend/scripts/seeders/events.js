const Event = require("../../models/Event");
const { connectAndRun } = require("./shared");

const mockEvents = [
  {
    title: "CodeFest 2026",
    description: "Annual college hackathon. Build amazing projects in 48 hours with fellow students!",
    date: "2026-04-15",
    time: "08:00",
    location: "CCS Main Lab",
    status: "Upcoming",
    maxParticipants: 100,
    participants: []
  },
  {
    title: "Web Dev Workshop",
    description: "Learn modern web development using React and modern CSS frameworks.",
    date: "2026-03-20",
    time: "13:00",
    location: "Online (Zoom)",
    status: "Upcoming",
    maxParticipants: 50,
    participants: []
  },
  {
    title: "AI in Tech Seminar",
    description: "Guest speaker discussing the future of Artificial Intelligence in daily life.",
    date: "2026-02-28",
    time: "10:00",
    location: "Auditorium A",
    status: "Completed",
    maxParticipants: 200,
    participants: []
  },
  {
    title: "Coding Bootcamp Phase 1",
    description: "First phase of the intensive coding bootcamp for freshman beginners.",
    date: "2026-03-13",
    time: "09:00",
    location: "Room 302",
    status: "Ongoing",
    maxParticipants: 40,
    participants: []
  }
];

const seedEventsCore = async ({ reset = false, userMap } = {}) => {
  if (reset) {
    await Event.deleteMany({});
  }

  for (const ev of mockEvents) {
    const existing = await Event.findOne({ title: ev.title });
    if (!existing) {
      await Event.create(ev);
    }
  }

  console.log("Events seed completed.");
};

const seedEvents = async (options = {}) => connectAndRun(() => seedEventsCore(options));

if (require.main === module) {
  const reset = process.argv.includes("--reset");

  seedEvents({ reset }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  seedEventsCore,
  seedEvents,
};
