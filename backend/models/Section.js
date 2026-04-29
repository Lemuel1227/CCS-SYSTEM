const mongoose = require("mongoose");
require("./SchoolYearSemester");
require("./AcademicTrack");

const sectionSchema = new mongoose.Schema(
  {
    schoolYearSemester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolYearSemester",
      required: true,
    },
    sectionName: {
      type: String,
      required: true,
      trim: true,
    },
    yearLevel: {
      type: String,
      trim: true,
    },
    program: {
      type: String,
      trim: true,
    },
    academicTrack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicTrack",
      default: null,
    },
    maxStudents: {
      type: Number,
      min: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

sectionSchema.index({ schoolYearSemester: 1, sectionName: 1 }, { unique: true });

module.exports = mongoose.models.Section || mongoose.model("Section", sectionSchema);
