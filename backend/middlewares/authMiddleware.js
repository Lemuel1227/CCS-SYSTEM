const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallbacksecret123"
      );

      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
         return res.status(401).json({ message: "Not authorized, user not found" });
      }

      // Automatically invalidate token if password was changed after the token was issued
      if (req.user.passwordChangedAt) {
        const changedTimestamp = parseInt(req.user.passwordChangedAt.getTime() / 1000, 10);
        if (decoded.iat < changedTimestamp) {
          return res.status(401).json({ message: "Password recently changed. Please log in again." });
        }
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // Allow bypass for the very first user creation
  if (!token) {
    const userCount = await User.countDocuments();
    if (userCount === 0 && req.originalUrl.includes("/api/auth/register")) {
      return next();
    }
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const admin = async (req, res, next) => {
  // Allow if it's the very first user
  if (!req.user) {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      return next();
    }
  }

  if (req.user && req.user.role === "admin") {
    return next();
  } else if (req.user) {
    return res.status(403).json({ message: "Not authorized as an admin" });
  }
};

const adminOrFaculty = async (req, res, next) => {
  // Allow if it's the very first user
  if (!req.user) {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      return next();
    }
  }

  if (req.user && (req.user.role === "admin" || req.user.role === "faculty")) {
    return next();
  } else if (req.user) {
    return res.status(403).json({ message: "Not authorized as an admin or faculty" });
  }
};

module.exports = { protect, admin, adminOrFaculty };