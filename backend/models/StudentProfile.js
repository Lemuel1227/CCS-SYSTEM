const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    studentNumber: {
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
    yearLevel: {
      type: String,
    },
    program: {
      type: String,
    },
    academicTrack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicTrack",
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
    academicStatus: {
      type: String,
      enum: ["regular", "irregular"],
    },
    height: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
    },
    contactNumber: {
      type: String,
    },
    emergencyContactName: {
      type: String,
    },
    emergencyContactNumber: {
      type: String,
    },
    emergencyContactRelation: {
      type: String,
    },
    yearGraduated: {
      type: Number,
    },
    // TODO: profileImage field (string) to be added later when storage is decided.
    // TODO: email is stored on User; decide if StudentProfile should mirror it.
    // TODO: frontend uses studentNo; map to studentNumber when integrating.
    // TODO: frontend fields to add later: achievements, skills, interests.
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
