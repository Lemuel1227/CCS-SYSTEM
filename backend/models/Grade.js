const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PASSED", "FAILED", "INCOMPLETE", "DROPPED"],
      default: "PASSED",
    },
    semester: {
      type: String,
      required: true,
    },
    schoolYear: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

gradeSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.models.Grade || mongoose.model("Grade", gradeSchema);
