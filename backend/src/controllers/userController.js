const { User } = require("../models/index");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

/**
 * Create a new user
 * @route POST /api/users/create
 */
exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "username, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:userId
 */
exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Support lookup by ObjectId or by username/email string (e.g. "demo-user")
    let user = null;
    if (userId) {
      try {
        if (mongoose.isValidObjectId(userId)) {
          user = await User.findById(userId).select("-password");
        }
      } catch (err) {
        // ignore cast errors
      }
    }

    if (!user) {
      // try username or email match when userId isn't a Mongo ObjectId
      user = await User.findOne({ $or: [{ username: userId }, { email: userId }] }).select("-password");
    }

    if (user && user.files) {
      user.files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        filesCount: user.files?.length || 0,
        files: user.files || [],
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};
