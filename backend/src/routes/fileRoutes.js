const express = require("express");
const router = express.Router();
const multer = require("multer");
const fileController = require("../controllers/fileController");

// Memory storage for multer (files won't be saved to disk)
const memoryStorage = multer.memoryStorage();
const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

/**
 * @route POST /api/upload
 * @desc Upload file to Cloudinary
 * @body multipart/form-data with "file" field
 */
router.post(
  "/upload",
  upload.single("file"),
  fileController.uploadToCloudinary
);

/**
 * Proxy route for streaming external files (Cloudinary)
 * GET /api/files/proxy?url=<encoded_url>
 */
router.get("/files/proxy", fileController.proxyFile);

/**
 * @route POST /api/files/upload-url
 * @desc Save file URL to database for a specific user
 * @body { userId, filename, fileUrl, fileType, fileSize }
 */
router.post("/files/upload-url", fileController.uploadFileUrl);

/**
 * @route GET /api/files/user/:userId/files
 * @desc Get all files for a specific user
 */
router.get("/files/user/:userId/files", fileController.getUserFiles);

/**
 * @route GET /api/files/user/:userId/stats
 * @desc Get file statistics for a user
 */
router.get("/files/user/:userId/stats", fileController.getFileStats);

/**
 * @route GET /api/files/user/:userId/search?query=filename
 * @desc Search user files by name
 */
router.get("/files/user/:userId/search", fileController.searchUserFiles);

/**
 * @route DELETE /api/files/user/:userId/files/:fileId
 * @desc Delete a specific file for a user
 */
router.delete(
  "/files/user/:userId/files/:fileId",
  fileController.deleteUserFile
);

module.exports = router;
