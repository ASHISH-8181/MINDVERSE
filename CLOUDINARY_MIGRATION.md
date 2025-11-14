# Cloudinary Migration - Complete Guide

## Overview

This document outlines the complete migration from Firebase Storage to Cloudinary for file uploads in the Hackagra project.

---

## Changes Made

### 1. Backend Changes

#### A. Updated Dependencies ✅

- **cloudinary** package already in `package.json` (v2.8.0)
- **multer** package already in `package.json` for handling file uploads
- No new packages needed to be installed

#### B. Configuration (`backend/src/app.js`) ✅

```javascript
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

#### C. Environment Variables (`backend/.env`) ✅

Added the following:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=donbkjz1m
CLOUDINARY_API_KEY=588258821595957
CLOUDINARY_API_SECRET=KYnb8Ju3ulsJ0_HQAAreaCBS48k
```

#### D. New Upload Route (`backend/src/routes/fileRoutes.js`) ✅

```javascript
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
```

#### E. New Controller Function (`backend/src/controllers/fileController.js`) ✅

Added `uploadToCloudinary()` function:

- Accepts file via multer (memory storage)
- Uploads to Cloudinary using `upload_stream()`
- Stores in folder: `mindverse_uploads`
- Supports any file type: `resource_type: "auto"`
- Returns: `{ success: true, url: <cloudinary_secure_url>, publicId: <id> }`

#### F. Database Model Update (`backend/src/models/index.js`) ✅

Changed field name:

```javascript
// OLD
firebaseUrl: { type: DataTypes.STRING, ... }

// NEW
fileUrl: { type: DataTypes.STRING, ... }
```

#### G. Updated uploadFileUrl Controller ✅

Changed parameter validation:

```javascript
// OLD: firebaseUrl
// NEW: fileUrl

if (!userId || !fileUrl || !filename) {
  return res.status(400).json({
    success: false,
    message: "userId, fileUrl, and filename are required",
  });
}
```

---

### 2. Frontend Changes

#### A. New Utility File (`frontend/src/utils/cloudinaryUpload.js`) ✅

Created new utility module with functions:

1. **uploadToCloudinary(file)**

   - Upload file to Cloudinary via backend
   - Validates file size (max 100MB)
   - Returns Cloudinary URL

2. **saveFileUrlToDatabase(userId, filename, fileUrl, fileType, fileSize)**

   - Saves file metadata to database
   - Uses endpoint: `POST /api/files/upload-url`

3. **getUserFiles(userId)**

   - Fetches all files for user
   - Uses endpoint: `GET /api/files/user/:userId/files`

4. **deleteUserFile(userId, fileId)**

   - Deletes a file
   - Uses endpoint: `DELETE /api/files/user/:userId/files/:fileId`

5. **getFileStats(userId)**

   - Gets file statistics
   - Uses endpoint: `GET /api/files/user/:userId/stats`

6. **searchUserFiles(userId, query)**
   - Searches files by name
   - Uses endpoint: `GET /api/files/user/:userId/search?query=...`

#### B. Updated Summarizer Component (`frontend/src/pages/Summarizer/Summarizer.jsx`) ✅

```javascript
import {
  uploadToCloudinary,
  saveFileUrlToDatabase,
  getUserFiles,
} from "../../utils/cloudinaryUpload";

// Updated handleFileUpload()
const cloudinaryUrl = await uploadToCloudinary(file);
await saveFileUrlToDatabase(
  userId,
  file.name,
  cloudinaryUrl,
  file.type,
  file.size
);
```

#### C. Updated FileUpload Component (`frontend/src/components/FileUpload/FileUpload.jsx`) ✅

```javascript
import { uploadToCloudinary, saveFileUrlToDatabase, ... } from "../../utils/cloudinaryUpload";

// Updated handleUpload()
const cloudinaryUrl = await uploadToCloudinary(file);
await saveFileUrlToDatabase(userId, file.name, cloudinaryUrl, file.type, file.size);

// Updated fileUrl reference
<a href={file.fileUrl} ...>  // Changed from file.firebaseUrl
```

---

## Migration Checklist

- [x] Add Cloudinary SDK to backend (`cloudinary` v2.8.0)
- [x] Configure Cloudinary in `app.js` with env variables
- [x] Add Cloudinary credentials to `.env`
- [x] Create `/api/upload` route with multer middleware
- [x] Add `uploadToCloudinary()` controller function
- [x] Rename `firebaseUrl` → `fileUrl` in database schema
- [x] Update `uploadFileUrl()` controller to use `fileUrl`
- [x] Create `cloudinaryUpload.js` utility with all functions
- [x] Update `Summarizer.jsx` to use new Cloudinary upload
- [x] Update `FileUpload.jsx` to use new Cloudinary upload
- [x] Remove Firebase Storage imports and initialization
- [x] Update file URL references from `firebaseUrl` to `fileUrl`

---

## API Endpoints

### Upload File to Cloudinary

```
POST /api/upload
Content-Type: multipart/form-data

Request:
- file: <binary file data>

Response:
{
  "success": true,
  "url": "https://res.cloudinary.com/donbkjz1m/image/upload/...",
  "publicId": "mindverse_uploads/...",
  "message": "File uploaded successfully"
}
```

### Save File URL to Database

```
POST /api/files/upload-url
Content-Type: application/json

Request:
{
  "userId": "user-id",
  "filename": "document.pdf",
  "fileUrl": "https://res.cloudinary.com/...",
  "fileType": "application/pdf",
  "fileSize": 1024000
}

Response:
{
  "success": true,
  "message": "File URL saved successfully",
  "data": {
    "user": { "id": "user-id", "username": "...", "email": "..." },
    "file": { "id": "...", "filename": "...", "fileUrl": "...", ... }
  }
}
```

### Get User Files

```
GET /api/files/user/:userId/files

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "filename": "document.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "fileType": "application/pdf",
      "fileSize": 1024000,
      "uploadedAt": "2025-11-14T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

## Testing the Migration

### 1. Test Backend Upload

```bash
curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/file.pdf" \
  http://localhost:5001/api/upload
```

Expected response:

```json
{
  "success": true,
  "url": "https://res.cloudinary.com/donbkjz1m/...",
  "publicId": "mindverse_uploads/..."
}
```

### 2. Test Save File URL

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "filename": "test.pdf",
    "fileUrl": "https://res.cloudinary.com/donbkjz1m/...",
    "fileType": "application/pdf",
    "fileSize": 1024000
  }' \
  http://localhost:5001/api/files/upload-url
```

### 3. Test Frontend Upload

1. Navigate to Smart Summarizer page
2. Click "Upload File"
3. Select a file
4. Click "Upload"
5. Verify file appears in your files list
6. Click "View" to open the Cloudinary URL

---

## Troubleshooting

### Issue: Cloudinary upload fails

**Solution:** Verify `.env` variables are correctly set:

```bash
CLOUDINARY_CLOUD_NAME=donbkjz1m
CLOUDINARY_API_KEY=588258821595957
CLOUDINARY_API_SECRET=KYnb8Ju3ulsJ0_HQAAreaCBS48k
```

### Issue: CORS errors

**Solution:** Ensure `CORS_ORIGIN` in `.env` is set correctly:

```env
CORS_ORIGIN=http://localhost:5173
```

### Issue: File not saved to database

**Solution:** Ensure database is running and `DATABASE_URL` is correct

### Issue: Old Firebase URLs still appear

**Solution:** Clear browser cache and refresh page. Existing files with old `firebaseUrl` won't automatically update.

---

## File Structure

```
backend/
├── src/
│   ├── app.js                  ← Cloudinary initialized here
│   ├── routes/
│   │   └── fileRoutes.js       ← New /api/upload route
│   ├── controllers/
│   │   └── fileController.js   ← New uploadToCloudinary() function
│   └── models/
│       └── index.js            ← Updated fileUrl field
├── .env                        ← Cloudinary credentials

frontend/
└── src/
    ├── utils/
    │   └── cloudinaryUpload.js ← New utility module
    ├── pages/
    │   └── Summarizer/
    │       └── Summarizer.jsx  ← Updated to use Cloudinary
    └── components/
        └── FileUpload/
            └── FileUpload.jsx  ← Updated to use Cloudinary
```

---

## Next Steps

1. ✅ Refactor backend for Cloudinary
2. ✅ Update frontend components
3. ✅ Update database models
4. ✅ Test upload functionality
5. ⏳ Optional: Delete old Firebase storage config files
6. ⏳ Optional: Migrate existing Firebase URLs to Cloudinary

---

## Notes

- **File Storage**: Files are now stored on Cloudinary servers
- **Folder**: All uploads go to `mindverse_uploads` folder in Cloudinary
- **Security**: API credentials are in `.env` (NOT exposed to frontend)
- **CORS**: Cloudinary URLs are public and don't require authentication
- **Scalability**: Cloudinary handles CDN distribution and optimization

---

## Contact Support

For issues with Cloudinary, visit: https://cloudinary.com/console
