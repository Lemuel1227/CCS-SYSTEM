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

const describeModuleShape = (value) => {
  if (value === null) return "type: null";
  if (value === undefined) return "type: undefined";

  const type = typeof value;
  if (type !== "object" && type !== "function") {
    return `type: ${type}`;
  }

  const keys = Object.keys(value);
  const ownNames = Object.getOwnPropertyNames(value);
  const constructorName = value?.constructor?.name || "unknown";

  return `type: ${type}, constructor: ${constructorName}, keys: [${keys.join(", ")}], ownProps: [${ownNames.join(", ")}]`;
};

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

  const shape = describeModuleShape(candidate);
  throw new TypeError(
    `Route module "${modulePath}" must export an Express router function (${shape})`
  );
};

const loadRouteModule = (modulePath) => {
  try {
    const loaded = require(modulePath);
    return normalizeRouter(loaded, modulePath);
  } catch (error) {
    const isLoadError = error && error.name !== "TypeError";
    const fsHint =
      error && typeof error.message === "string" && /(EROFS|EACCES|EPERM)/i.test(error.message)
        ? " Hint: this runtime may be read-only; avoid creating directories/files at module import time."
        : "";
    const details = error && error.stack ? error.stack : String(error);

    const wrapped = new Error(
      isLoadError
        ? `Failed to load route module "${modulePath}".${fsHint}\nOriginal error: ${details}`
        : `${error.message}\nRoute diagnostic for "${modulePath}" complete.`
    );
    wrapped.cause = error;
    throw wrapped;
  }
};

const userRoutes = loadRouteModule("./routes/userRoutes");
const authRoutes = loadRouteModule("./routes/authRoutes");
const facultyRoutes = loadRouteModule("./routes/facultyRoutes");
const studentRoutes = loadRouteModule("./routes/studentRoutes");
const profileRoutes = loadRouteModule("./routes/profileRoutes");
const courseRoutes = loadRouteModule("./routes/courseRoutes");
const medicalRecordRoutes = loadRouteModule("./routes/medicalRecordRoutes");
const academicRoutes = loadRouteModule("./routes/academicRoutes");
const classScheduleRoutes = loadRouteModule("./routes/classScheduleRoutes");
const violationRoutes = loadRouteModule("./routes/violationRoutes");
const violationTypeRoutes = loadRouteModule("./routes/violationTypeRoutes");
const eventRoutes = loadRouteModule("./routes/eventRoutes");
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
