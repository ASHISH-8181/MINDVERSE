/**
 * FRONTEND-ONLY FILE UPLOAD UTILITY
 * 
 * This module handles all file operations entirely in the frontend:
 * - Files are uploaded directly to Firebase Storage (no backend required)
 * - File metadata is stored in browser localStorage (no backend database)
 * - All operations work without any backend API calls
 * 
 * Storage: localStorage with key format: "user_files_{userId}"
 */

import { storage } from "../config/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";

// Frontend-only storage using localStorage
const STORAGE_KEY_PREFIX = "user_files_";

/**
 * Get storage key for a user
 */
const getStorageKey = (userId) => `${STORAGE_KEY_PREFIX}${userId}`;

/**
 * Get all files for a user from localStorage
 */
const getFilesFromStorage = (userId) => {
  try {
    const key = getStorageKey(userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return [];
  }
};

/**
 * Save files to localStorage
 */
const saveFilesToStorage = (userId, files) => {
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(files));
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    throw new Error("Failed to save files to storage");
  }
};

/**
 * Upload file to Firebase Storage (frontend-only)
 */
export const uploadToCloudinary = async (file, userId) => {
  try {
    if (!file) throw new Error("No file provided");

    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 100MB limit");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log("📤 Uploading to Firebase Storage...");

    // Create a unique file path in Firebase Storage
    const timestamp = Date.now();
    const filename = `${userId}/${timestamp}_${file.name}`;
    const fileRef = ref(storage, filename);

    // Upload file to Firebase Storage
    let firebaseUrl;
    try {
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      // Wait for upload to complete
      firebaseUrl = await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`📈 Upload is ${Math.round(progress)}% done`);
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const url = await getDownloadURL(fileRef);
              console.log("✅ File uploaded successfully:", url);
              resolve(url);
            } catch (err) {
              reject(err);
            }
          }
        );
      });
    } catch (error) {
      // Fallback to uploadBytes if resumable upload fails
      console.log("⚠️ Using fallback upload method");
      await uploadBytes(fileRef, file);
      firebaseUrl = await getDownloadURL(fileRef);
      console.log("✅ File uploaded successfully:", firebaseUrl);
    }

    return firebaseUrl;
  } catch (error) {
    console.error("❌ Firebase upload error:", error);
    throw error;
  }
};

/**
 * Save file URL to localStorage (frontend-only)
 */
export const saveFileUrlToDatabase = async (
  userId,
  filename,
  fileUrl,
  fileType,
  fileSize
) => {
  try {
    if (!userId || !fileUrl || !filename) {
      throw new Error("userId, fileUrl, and filename are required");
    }

    const files = getFilesFromStorage(userId);
    
    // Create new file entry
    const newFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filename,
      fileUrl,
      fileType: fileType || "application/octet-stream",
      fileSize,
      uploadedAt: new Date().toISOString(),
    };

    files.push(newFile);
    saveFilesToStorage(userId, files);

    console.log("✅ File URL saved to localStorage");
    return {
      success: true,
      data: {
        file: newFile,
      },
    };
  } catch (error) {
    console.error("❌ Error saving file URL:", error);
    throw error;
  }
};

/**
 * Get all files for a user (frontend-only)
 */
export const getUserFiles = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const files = getFilesFromStorage(userId);
    
    // Sort by date (newest first)
    const sortedFiles = files.sort(
      (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );

    return {
      success: true,
      data: sortedFiles,
      count: sortedFiles.length,
    };
  } catch (error) {
    console.error("❌ Error fetching user files:", error);
    return {
      success: false,
      error: error.message,
      data: [],
      count: 0,
    };
  }
};

/**
 * Delete a file (frontend-only)
 */
export const deleteUserFile = async (userId, fileId) => {
  try {
    if (!userId || !fileId) {
      throw new Error("User ID and File ID are required");
    }

    const files = getFilesFromStorage(userId);
    const fileIndex = files.findIndex((f) => f.id === fileId);

    if (fileIndex === -1) {
      throw new Error("File not found");
    }

    const file = files[fileIndex];

    // Try to delete from Firebase Storage
    try {
      // Extract the file path from the Firebase URL
      // Firebase URLs are like: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile?alt=media
      const url = new URL(file.fileUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+)/);
      if (pathMatch) {
        const filePath = decodeURIComponent(pathMatch[1]);
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
        console.log("✅ File deleted from Firebase Storage");
      }
    } catch (storageError) {
      console.warn("⚠️ Could not delete from Firebase Storage:", storageError);
      // Continue with localStorage deletion even if Firebase deletion fails
    }

    // Remove from localStorage
    files.splice(fileIndex, 1);
    saveFilesToStorage(userId, files);

    return {
      success: true,
      data: {
        files: files,
      },
    };
  } catch (error) {
    console.error("❌ Error deleting file:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get file statistics (frontend-only)
 */
export const getFileStats = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const files = getFilesFromStorage(userId);
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + (file.fileSize || 0), 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    // Count file types
    const fileTypes = {};
    files.forEach((file) => {
      const type = file.fileType || "unknown";
      fileTypes[type] = (fileTypes[type] || 0) + 1;
    });

    // Get recent files (last 5)
    const recentFiles = files
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, 5);

    return {
      success: true,
      data: {
        totalFiles,
        totalSize,
        totalSizeMB,
        fileTypes,
        recentFiles,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching file statistics:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Search files (frontend-only)
 */
export const searchUserFiles = async (userId, query) => {
  try {
    if (!userId || !query) {
      throw new Error("User ID and search query are required");
    }

    const files = getFilesFromStorage(userId);
    const searchQuery = query.toLowerCase();
    
    const filteredFiles = files.filter((file) =>
      file.filename.toLowerCase().includes(searchQuery)
    );

    return {
      success: true,
      data: filteredFiles,
      count: filteredFiles.length,
    };
  } catch (error) {
    console.error("❌ Error searching files:", error);
    return {
      success: false,
      error: error.message,
      data: [],
      count: 0,
    };
  }
};
