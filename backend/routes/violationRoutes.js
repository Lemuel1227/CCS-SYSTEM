const express = require("express");
const router = express.Router();
const {
  getViolations,
  getViolationById,
  createViolation,
  updateViolation,
  deleteViolation,
} = require("../controllers/violationController");
const { protect, adminOrFaculty } = require("../middlewares/authMiddleware");

router.use(protect, adminOrFaculty);

router.route("/")
  .get(getViolations)
  .post(createViolation);

router.route("/:id")
  .get(getViolationById)
  .put(updateViolation)
  .delete(deleteViolation);

module.exports = router;