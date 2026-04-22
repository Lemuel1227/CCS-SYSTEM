const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  // Update to use userId instead of email
  const { userId, password } = req.body;

  try {
    const user = await User.findOne({ userId });
    const isMatch = user ? await user.matchPassword(password) : false;
    console.log("LOGIN ATTEMPT:", { body: req.body, userPass: user ? user.password : null, isMatch });

    if (user && isMatch) {
      res.json({
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        requiresPasswordChange: user.requiresPasswordChange,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid User ID or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private/Admin
const registerUser = async (req, res) => {
  const { userId, name, email, password, role, accountStatus } = req.body;

  try {
    const userExists = await User.findOne({ 
      $or: [{ email }, { userId: userId || "" }]
    });

    if (userExists) {
      return res.status(400).json({ message: "User or Email already exists" });
    }

    const user = await User.create({
      userId: userId || `U-${Date.now()}`,
      name,
      email,
      password,
      role: role || "student",
      accountStatus: accountStatus || "active",
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        requiresPasswordChange: user.requiresPasswordChange,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        requiresPasswordChange: user.requiresPasswordChange,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.password = req.body.password;
      user.requiresPasswordChange = false; // They have now set a new non-default password
      
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        userId: updatedUser.userId,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        requiresPasswordChange: updatedUser.requiresPasswordChange,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { authUser, registerUser, getUserProfile, changePassword };
