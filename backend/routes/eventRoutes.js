const express = require("express");
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  applyForEvent,
  cancelEventApplication,
} = require("../controllers/eventController");
const { protect, adminOrFaculty } = require("../middlewares/authMiddleware");

router.route("/")
  .get(protect, getEvents)
  .post(protect, adminOrFaculty, createEvent);

router.route("/:id")
  .get(protect, getEventById)
  .put(protect, adminOrFaculty, updateEvent)
  .delete(protect, adminOrFaculty, deleteEvent);

router.route("/:id/apply")
  .post(protect, applyForEvent);

router.route("/:id/cancel")
  .post(protect, cancelEventApplication);

module.exports = router;
