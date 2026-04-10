const mongoose = require("mongoose");

const facultyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    employeeIdNumber: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
    },
    lastName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
    },
    department: {
      type: String,
    },
    position: {
      type: String,
    },
    // TODO: profileImage field (string) to be added later when storage is decided.
    contactNumber: {
      type: String,
    },
    // TODO: email is stored on User; decide if FacultyProfile should mirror it.
    // TODO: frontend uses employeeId; map to employeeIdNumber when integrating.
    // TODO: frontend fields to add later: academicRank, employmentType, status, specializations.
  },
  { timestamps: true }
);

module.exports = mongoose.model("FacultyProfile", facultyProfileSchema);
