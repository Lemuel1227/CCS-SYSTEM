const express = require("express");
const router = express.Router();
const {
  getSchoolYears,
  createSchoolYear,
  updateSchoolYear,
  deleteSchoolYear,
  getSections,
  createSection,
  updateSection,
  deleteSection,
  getAcademicTracks,
  createAcademicTrack,
  updateAcademicTrack,
  deleteAcademicTrack,
  updateAcademicTrackCourses,
  getAcademicOptions,
} = require("../controllers/academicController");
const { protect, adminOrFaculty } = require("../middlewares/authMiddleware");

router.use(protect, adminOrFaculty);

router.get("/options", getAcademicOptions);

router.route("/school-years").get(getSchoolYears).post(createSchoolYear);
router.route("/school-years/:id").put(updateSchoolYear).delete(deleteSchoolYear);

router.route("/academic-tracks").get(getAcademicTracks).post(createAcademicTrack);
router.route("/academic-tracks/:id").put(updateAcademicTrack).delete(deleteAcademicTrack);
router.put("/academic-tracks/:id/courses", updateAcademicTrackCourses);

router.route("/sections").get(getSections).post(createSection);
router.route("/sections/:id").put(updateSection).delete(deleteSection);

module.exports = router;