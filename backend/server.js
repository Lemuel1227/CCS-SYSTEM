const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

const normalizeRouter = (moduleExport, modulePath) => {
  const visited = new Set();
  let candidate = moduleExport;

  // Unwrap common interop shells.
  for (let i = 0; i < 6 && candidate && typeof candidate !== "function"; i += 1) {
    if (visited.has(candidate)) break;
    visited.add(candidate);

    if (typeof candidate.default === "function") {
      return candidate.default;
    }
    if (candidate.default) {
      candidate = candidate.default;
      continue;
    }
    if (typeof candidate.router === "function") {
      return candidate.router;
    }
    if (candidate.router) {
      candidate = candidate.router;
      continue;
    }
    break;
  }

  if (typeof candidate === "function") {
    return candidate;
  }

  // Some builds can surface router-like objects (non-callable) with `.handle`.
  if (candidate && typeof candidate.handle === "function") {
    return (req, res, next) => candidate.handle(req, res, next);
  }

  // Last-resort: scan top-level props for a router-like value.
  if (candidate && typeof candidate === "object") {
    const values = Object.values(candidate);
    for (const value of values) {
      if (typeof value === "function") {
        return value;
      }
      if (value && typeof value.handle === "function") {
        return (req, res, next) => value.handle(req, res, next);
      }
    }
  }

  const shape =
    candidate && typeof candidate === "object"
      ? `keys: ${Object.keys(candidate).join(", ")}`
      : `type: ${typeof candidate}`;
  throw new TypeError(
    `Route module "${modulePath}" must export an Express router function (${shape})`
  );
};

const userRoutes = normalizeRouter(require("./routes/userRoutes"), "./routes/userRoutes");
const authRoutes = normalizeRouter(require("./routes/authRoutes"), "./routes/authRoutes");
const facultyRoutes = normalizeRouter(require("./routes/facultyRoutes"), "./routes/facultyRoutes");
const studentRoutes = normalizeRouter(require("./routes/studentRoutes"), "./routes/studentRoutes");
const profileRoutes = normalizeRouter(require("./routes/profileRoutes"), "./routes/profileRoutes");
const courseRoutes = normalizeRouter(require("./routes/courseRoutes"), "./routes/courseRoutes");
const medicalRecordRoutes = normalizeRouter(require("./routes/medicalRecordRoutes"), "./routes/medicalRecordRoutes");
const academicRoutes = normalizeRouter(require("./routes/academicRoutes"), "./routes/academicRoutes");
const classScheduleRoutes = normalizeRouter(require("./routes/classScheduleRoutes"), "./routes/classScheduleRoutes");
const violationRoutes = normalizeRouter(require("./routes/violationRoutes"), "./routes/violationRoutes");
const violationTypeRoutes = normalizeRouter(require("./routes/violationTypeRoutes"), "./routes/violationTypeRoutes");
const eventRoutes = normalizeRouter(require("./routes/eventRoutes"), "./routes/eventRoutes");
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/class-schedules", classScheduleRoutes);
app.use("/api/violations", violationRoutes);
app.use("/api/violation-types", violationTypeRoutes);
app.use("/api/events", eventRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
