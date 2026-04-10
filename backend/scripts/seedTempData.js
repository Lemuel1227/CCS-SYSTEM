const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const AdminProfile = require("../models/AdminProfile");
const FacultyProfile = require("../models/FacultyProfile");
const StudentProfile = require("../models/StudentProfile");

dotenv.config();

const shouldReset = process.argv.includes("--reset");

const usersToSeed = [
  {
    userId: "admin01",
    name: "Admin User",
    email: "admin@pnc.edu.ph",
    password: "password123",
    role: "admin",
    accountStatus: "active",
  },
  {
    userId: "faculty01",
    name: "Maria Santos",
    email: "maria.santos@pnc.edu.ph",
    password: "password123",
    role: "faculty",
    accountStatus: "active",
  },
  {
    userId: "faculty02",
    name: "Juan Reyes",
    email: "juan.reyes@pnc.edu.ph",
    password: "password123",
    role: "faculty",
    accountStatus: "active",
  },
  {
    userId: "student01",
    name: "Carl Lawrence Antioquia",
    email: "carl.antioquia@pnc.edu.ph",
    password: "password123",
    role: "student",
    accountStatus: "active",
  },
  {
    userId: "student02",
    name: "Lemuel John Ellasus",
    email: "lemuel.ellasus@pnc.edu.ph",
    password: "password123",
    role: "student",
    accountStatus: "active",
  },
];

const adminProfilesToSeed = [
  {
    userId: "admin01",
    fullName: "Admin User",
    position: "System Administrator",
    contactNumber: "09171112222",
  },
];

const facultyProfilesToSeed = [
  {
    userId: "faculty01",
    employeeIdNumber: "EMP-2020-001",
    firstName: "Maria",
    middleName: "L.",
    lastName: "Santos",
    gender: "Female",
    department: "IT",
    position: "Instructor",
    contactNumber: "09189876543",
  },
  {
    userId: "faculty02",
    employeeIdNumber: "EMP-2018-042",
    firstName: "Juan",
    middleName: "R.",
    lastName: "Reyes",
    gender: "Male",
    department: "CS",
    position: "Associate Professor",
    contactNumber: "09191112222",
  },
];

const studentProfilesToSeed = [
  {
    userId: "student01",
    studentNumber: "2023-0001",
    firstName: "Carl Lawrence",
    middleName: "",
    lastName: "Antioquia",
    gender: "Male",
    yearLevel: "4th Year",
    program: "BSIT",
    academicStatus: "regular",
    height: 170,
    weight: 65,
    contactNumber: "09171112222",
    emergencyContactName: "Maria Antioquia",
    emergencyContactNumber: "09181112222",
    emergencyContactRelation: "Mother",
  },
  {
    userId: "student02",
    studentNumber: "2023-0002",
    firstName: "Lemuel John",
    middleName: "O.",
    lastName: "Ellasus",
    gender: "Male",
    yearLevel: "4th Year",
    program: "BSIT",
    academicStatus: "regular",
    height: 168,
    weight: 62,
    contactNumber: "09172223333",
    emergencyContactName: "Susan Ellasus",
    emergencyContactNumber: "09182223333",
    emergencyContactRelation: "Mother",
  },
];

const upsertUser = async (userData) => {
  const existing = await User.findOne({ userId: userData.userId });
  if (existing) {
    existing.name = userData.name;
    existing.email = userData.email;
    existing.role = userData.role;
    existing.accountStatus = userData.accountStatus;
    await existing.save();
    return existing;
  }
  const user = await User.create(userData);
  return user;
};

const main = async () => {
  await connectDB();

  if (shouldReset) {
    await Promise.all([
      AdminProfile.deleteMany({}),
      FacultyProfile.deleteMany({}),
      StudentProfile.deleteMany({}),
      User.deleteMany({}),
    ]);
  }

  const userMap = new Map();
  for (const u of usersToSeed) {
    const user = await upsertUser(u);
    userMap.set(u.userId, user);
  }

  for (const a of adminProfilesToSeed) {
    const user = userMap.get(a.userId);
    if (!user) continue;
    await AdminProfile.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        fullName: a.fullName,
        position: a.position,
        contactNumber: a.contactNumber,
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  for (const f of facultyProfilesToSeed) {
    const user = userMap.get(f.userId);
    if (!user) continue;
    await FacultyProfile.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        employeeIdNumber: f.employeeIdNumber,
        firstName: f.firstName,
        middleName: f.middleName,
        lastName: f.lastName,
        gender: f.gender,
        department: f.department,
        position: f.position,
        contactNumber: f.contactNumber,
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  for (const s of studentProfilesToSeed) {
    const user = userMap.get(s.userId);
    if (!user) continue;
    await StudentProfile.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        studentNumber: s.studentNumber,
        firstName: s.firstName,
        middleName: s.middleName,
        lastName: s.lastName,
        gender: s.gender,
        yearLevel: s.yearLevel,
        program: s.program,
        academicStatus: s.academicStatus,
        height: s.height,
        weight: s.weight,
        contactNumber: s.contactNumber,
        emergencyContactName: s.emergencyContactName,
        emergencyContactNumber: s.emergencyContactNumber,
        emergencyContactRelation: s.emergencyContactRelation,
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  console.log("Temp seed completed.");
  await mongoose.connection.close();
};

main().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close();
  process.exit(1);
});
