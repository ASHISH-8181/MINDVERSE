const { User } = require("../models/index");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

/**
 * Upload file to Cloudinary
 * @route POST /api/upload
 */
exports.uploadToCloudinary = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file found" });
    }

    const isPDF = req.file.mimetype === "application/pdf";

    const uploadOptions = {
      folder: "mindverse_uploads",
      resource_type: isPDF ? "raw" : "auto",
      format: isPDF ? "pdf" : undefined,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({ success: false, error });
        }

        // Return `url` for frontend consistency, include publicId and original type
        return res.status(200).json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
          originalType: req.file.mimetype,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Save Cloudinary URL in DB
 * @route POST /api/files/upload-url
 */
exports.uploadFileUrl = async (req, res) => {
  try {
    const { userId, filename, fileUrl, fileType, fileSize, username, email } =
      req.body;

    console.log("📥 uploadFileUrl request body:", req.body);

    if (!userId || !fileUrl || !filename) {
      return res.status(400).json({
        success: false,
        message: "userId, fileUrl, and filename are required",
      });
    }

    if (fileSize && fileSize > 100 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 100MB limit",
      });
    }

    // Resolve user by ObjectId, then username, then email. If not found, create.
    let user = null;
    if (userId) {
      try {
        if (mongoose.isValidObjectId(userId)) {
          user = await User.findById(userId);
        } else {
          // treat non-ObjectId userId as a username
          user = await User.findOne({ username: userId });
        }
      } catch (err) {
        // ignore cast errors
      }
    }

    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      console.log("👤 Creating new user");
      const newUser = new User({
        username: userId && !mongoose.isValidObjectId(userId) ? userId : username || `user_${Date.now()}`,
        email: (email || `${Date.now()}@app.local`).toLowerCase(),
        password: "auto-generated",
      });
      user = await newUser.save();
      console.log("✅ User created:", user._id);
    }

    // Save file as subdocument on user
    console.log("💾 Creating file subdocument...");
    const fileDoc = {
      filename,
      fileUrl,
      fileType: fileType || "unknown",
      fileSize: fileSize || 0,
      uploadedAt: new Date(),
    };

    user.files.push(fileDoc);
    await user.save();

    const addedFile = user.files[user.files.length - 1];
    res.status(201).json({
      success: true,
      message: "File URL saved successfully",
      data: {
        user,
        file: addedFile,
      },
    });
  } catch (error) {
    console.error("❌ Error saving file URL:", error);
    res.status(500).json({
      success: false,
      message: "Error saving file URL",
      error: error.message,
    });
  }
};

/**
 * Get all files for a user
 */
exports.getUserFiles = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("🔍 getUserFiles for userId:", userId);
    // Resolve a user by ObjectId, or by username/email if a non-ObjectId string is provided
    let user = null;
    if (userId) {
      try {
        if (mongoose.isValidObjectId(userId)) {
          user = await User.findById(userId).select('files');
        }
      } catch (err) {
        // ignore
      }
    }
    if (!user) {
      // case-insensitive username match, or exact email (lowercased)
      const usernameRegex = new RegExp(`^${userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
      user = await User.findOne({ $or: [{ username: usernameRegex }, { email: userId.toLowerCase() }] }).select('files');
    }

    console.log("👤 User found:", user?._id || user?.username || null);
    const files = user ? (user.files || []).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)) : [];

    res.status(200).json({
      success: true,
      message: "Files retrieved successfully",
      data: files,
      count: files.length,
    });
  } catch (error) {
    console.error("Error fetching user files:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user files",
      error: error.message,
    });
  }
};

/**
 * Delete file
 */
exports.deleteUserFile = async (req, res) => {
  try {
    const { userId, fileId } = req.params;
    // Resolve user by ObjectId or username/email
    let user = null;
    if (userId) {
      try {
        if (mongoose.isValidObjectId(userId)) {
          user = await User.findById(userId);
        }
      } catch (err) {}
    }
    if (!user) {
      const usernameRegex = new RegExp(`^${userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
      user = await User.findOne({ $or: [{ username: usernameRegex }, { email: userId.toLowerCase() }] });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const fileIndex = user.files.findIndex((f) => f._id.toString() === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    user.files.splice(fileIndex, 1);
    await user.save();

    const files = user.files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
      files,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting file",
      error: error.message,
    });
  }
};

/**
 * Stats for a user
 */
exports.getFileStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Resolve user by ObjectId or username/email
    let user = null;
    if (userId) {
      try {
        if (mongoose.isValidObjectId(userId)) {
          user = await User.findById(userId).select('files');
        }
      } catch (err) {}
    }
    if (!user) {
      const usernameRegex = new RegExp(`^${userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
      user = await User.findOne({ $or: [{ username: usernameRegex }, { email: userId.toLowerCase() }] }).select('files');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const files = user.files || [];

    const totalSize = files.reduce((sum, f) => sum + (f.fileSize || 0), 0);

    const stats = {
      totalFiles: files.length,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      fileTypes: {},
      recentFiles: files.slice(0, 5),
    };

    files.forEach((f) => {
      const type = f.fileType || "unknown";
      stats.fileTypes[type] = (stats.fileTypes[type] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      message: "File statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching file stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching file stats",
      error: error.message,
    });
  }
};

/**
 * Proxy a remote file (Cloudinary) and stream it to the client.
 * Simple protection: only allow Cloudinary `res.cloudinary.com` + our folder `mindverse_uploads`.
 * Endpoint: GET /api/files/proxy?url=<encoded_url>
 */
exports.proxyFile = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url)
      return res
        .status(400)
        .json({ success: false, message: "url query param required" });

    // Basic validation — prevent open proxy. Allow Cloudinary URLs and the configured folder.
    const allowedHost = "res.cloudinary.com";
    const allowedFolder = "mindverse_uploads";
    let parsed;
    try {
      parsed = new URL(url);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid URL" });
    }

    if (
      !parsed.hostname.includes(allowedHost) ||
      !parsed.pathname.includes(allowedFolder)
    ) {
      return res
        .status(403)
        .json({ success: false, message: "URL not allowed" });
    }

    const axios = require("axios");

    const upstream = await axios({
      method: "get",
      url,
      responseType: "stream",
      headers: {
        // forward range header if present (pdf.js uses ranges)
        ...(req.headers.range ? { Range: req.headers.range } : {}),
        // set a user-agent
        "User-Agent": req.headers["user-agent"] || "hackagra-proxy",
      },
      validateStatus: (s) => s >= 200 && s < 500,
    });

    // If upstream returned a 4xx/5xx, forward the status and message
    if (upstream.status >= 400) {
      return res
        .status(upstream.status)
        .json({ success: false, message: `Upstream error ${upstream.status}` });
    }

    // Forward some headers
    const contentType = upstream.headers["content-type"];
    if (contentType) res.setHeader("content-type", contentType);
    if (upstream.headers["content-length"])
      res.setHeader("content-length", upstream.headers["content-length"]);
    if (upstream.headers["accept-ranges"])
      res.setHeader("accept-ranges", upstream.headers["accept-ranges"]);
    if (upstream.headers["content-range"])
      res.setHeader("content-range", upstream.headers["content-range"]);

    upstream.data.pipe(res);
  } catch (err) {
    console.error("Proxy fetch error", err?.message || err);
    return res.status(500).json({ success: false, message: "Proxy error" });
  }
};

/**
 * Search files
 */
exports.searchUserFiles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { query } = req.query;
    // Resolve user by ObjectId or username/email
    let user = null;
    if (userId) {
      try {
        if (mongoose.isValidObjectId(userId)) {
          user = await User.findById(userId).select('files');
        }
      } catch (err) {}
    }
    if (!user) {
      const usernameRegex = new RegExp(`^${userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
      user = await User.findOne({ $or: [{ username: usernameRegex }, { email: userId.toLowerCase() }] }).select('files');
    }
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const q = (query || '').toLowerCase();
    const searchResults = (user.files || []).filter((f) => (f.filename || '').toLowerCase().includes(q));
    searchResults.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: searchResults,
      count: searchResults.length,
    });
  } catch (error) {
    console.error("Error searching files:", error);
    res.status(500).json({
      success: false,
      message: "Error searching files",
      error: error.message,
    });
  }
};
