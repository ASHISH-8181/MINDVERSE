import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

/**
 * Upload file to Cloudinary via backend
 */
export const uploadToCloudinary = async (file) => {
  try {
    if (!file) throw new Error("No file provided");

    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 100MB limit");
    }

    console.log("📤 Uploading to Cloudinary...");

    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data.success) {
      // support both `url` and `fileUrl` in case backend returns either
      const url =
        response.data.url || response.data.fileUrl || response.data.secure_url;
      console.log("✅ File uploaded:", url);
      return url;
    }

    throw new Error("Upload failed");
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    throw error;
  }
};

/**
 * Save Cloudinary URL to database
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

    const response = await axios.post(`${API_BASE_URL}/files/upload-url`, {
      userId,
      filename,
      fileUrl,
      fileType,
      fileSize,
    });

    if (response.data.success) {
      console.log("✅ File URL saved to database");
      return response.data.data;
    } else {
      throw new Error("Failed to save file URL");
    }
  } catch (error) {
    console.error("❌ Error saving file URL:", error);
    throw error;
  }
};

/**
 * Get all files for a user
 */
export const getUserFiles = async (userId) => {
  const response = await axios.get(
    `${API_BASE_URL}/files/user/${userId}/files`
  );
  return response.data;
};

/**
 * Delete a file
 */
export const deleteUserFile = async (userId, fileId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/files/user/${userId}/files/${fileId}`
  );
  return response.data;
};

/**
 * Get stats
 */
export const getFileStats = async (userId) => {
  const response = await axios.get(
    `${API_BASE_URL}/files/user/${userId}/stats`
  );
  return response.data;
};

/**
 * Search files
 */
export const searchUserFiles = async (userId, query) => {
  const response = await axios.get(
    `${API_BASE_URL}/files/user/${userId}/search`,
    {
      params: { query },
    }
  );
  return response.data;
};
