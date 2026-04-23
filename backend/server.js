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

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const studentRoutes = require("./routes/studentRoutes");
const profileRoutes = require("./routes/profileRoutes");
const courseRoutes = require("./routes/courseRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const academicRoutes = require("./routes/academicRoutes");
const classScheduleRoutes = require("./routes/classScheduleRoutes");
const violationRoutes = require("./routes/violationRoutes");
const violationTypeRoutes = require("./routes/violationTypeRoutes");
const eventRoutes = require("./routes/eventRoutes");

const resolveRouteHandler = (routeModule, routeName) => {
  if (typeof routeModule === "function") {
    return routeModule;
  }

  if (routeModule && typeof routeModule === "object") {
    const functionCandidates = [
      routeModule.default,
      routeModule.router,
      routeModule.routes,
      routeModule[routeName],
    ];

    const exportedFunction = functionCandidates.find((candidate) => typeof candidate === "function");
    if (exportedFunction) {
      return exportedFunction;
    }

    // Some bundlers/runtime bridges return router-like objects that are not directly callable.
    // Adapt them to Express middleware if they expose `.handle(req,res,next)`.
    if (typeof routeModule.handle === "function") {
      return (req, res, next) => routeModule.handle(req, res, next);
    }
  }

  const receivedType = routeModule === null ? "null" : typeof routeModule;
  const keys = routeModule && typeof routeModule === "object" ? Object.keys(routeModule).join(", ") : "";
  throw new TypeError(
    `Invalid route handler for ${routeName}: expected function, received ${receivedType}${keys ? ` (keys: ${keys})` : ""}`
  );
};

const mountRoute = (routePath, routeModule, routeName) => {
  app.use(routePath, resolveRouteHandler(routeModule, routeName));
};

mountRoute("/api/users", userRoutes, "userRoutes");
mountRoute("/api/auth", authRoutes, "authRoutes");
mountRoute("/api/faculty", facultyRoutes, "facultyRoutes");
mountRoute("/api/students", studentRoutes, "studentRoutes");
mountRoute("/api/profile", profileRoutes, "profileRoutes");
mountRoute("/api/courses", courseRoutes, "courseRoutes");
mountRoute("/api/medical-records", medicalRecordRoutes, "medicalRecordRoutes");
mountRoute("/api/academic", academicRoutes, "academicRoutes");
mountRoute("/api/class-schedules", classScheduleRoutes, "classScheduleRoutes");
mountRoute("/api/violations", violationRoutes, "violationRoutes");
mountRoute("/api/violation-types", violationTypeRoutes, "violationTypeRoutes");
mountRoute("/api/events", eventRoutes, "eventRoutes");

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
