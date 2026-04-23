const express = require("express");
const router = express.Router();
const {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMyMedicalRecord,
  updateMyMedicalRecord,
  addMyMedicalDocument,
  deleteMyMedicalDocument,
  downloadMyMedicalDocument,
  downloadMedicalRecordDocument,
} = require("../controllers/medicalRecordController");
const { protect, adminOrFaculty } = require("../middlewares/authMiddleware");
const { medicalUpload } = require("../middlewares/uploadMiddleware");

router.get("/me", protect, getMyMedicalRecord);
router.put("/me", protect, medicalUpload.single("file"), updateMyMedicalRecord);
router.post("/me/documents", protect, medicalUpload.single("file"), addMyMedicalDocument);
router.delete("/me/documents/:documentId", protect, deleteMyMedicalDocument);
router.get("/me/documents/:documentId/download", protect, downloadMyMedicalDocument);

router.use(protect, adminOrFaculty);

router.route("/")
  .get(getMedicalRecords)
  .post(createMedicalRecord);

router.route("/:id")
  .get(getMedicalRecordById)
  .put(updateMedicalRecord)
  .delete(deleteMedicalRecord);
router.get("/:id/documents/:documentId/download", downloadMedicalRecordDocument);

module.exports = router;
