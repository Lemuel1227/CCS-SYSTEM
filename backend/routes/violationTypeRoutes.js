const express = require("express");
const router = express.Router();
const {
  getViolationTypes,
  createViolationType,
  updateViolationType,
  deleteViolationType,
} = require("../controllers/violationController");
const { protect, adminOrFaculty } = require("../middlewares/authMiddleware");

router.use(protect, adminOrFaculty);

router.route("/")
  .get(getViolationTypes)
  .post(createViolationType);

router.route("/:id")
  .put(updateViolationType)
  .delete(deleteViolationType);

module.exports = router;