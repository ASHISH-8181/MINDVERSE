# Firebase File Upload Setup Guide

## Overview

This setup enables file uploads to Firebase Storage with URLs saved to MongoDB for each user.

## What's Been Set Up

### Frontend

1. **Firebase Configuration** (`src/config/firebase.js`)
   - Initialized Firebase app with your configuration
   - Exported Firebase Storage reference
2. **Upload Utility** (`src/utils/firebaseUpload.js`)

   - `uploadFileToFirebase(file, userId)` - Upload file and save URL
   - `getUserFiles(userId)` - Retrieve all user files
   - `deleteUserFile(userId, fileId)` - Delete a file entry

3. **File Upload Component** (`src/components/FileUpload/FileUpload.jsx`)
   - Ready-to-use React component with:
     - File selection and upload
     - Display all uploaded files
     - Delete files
     - File size formatting and timestamps

### Backend

1. **User Model** (`src/models/User.js`)

   - Stores user data with embedded file array
   - Each file includes: filename, firebaseUrl, uploadedAt, fileType, fileSize

2. **File Controller** (`src/controllers/fileController.js`)

   - `uploadFileUrl` - Save file URL to MongoDB
   - `getUserFiles` - Retrieve user's files
   - `deleteUserFile` - Remove file from user's file list

3. **File Routes** (`src/routes/fileRoutes.js`)
   - POST `/api/files/upload-url` - Save file URL
   - GET `/api/files/user/:userId/files` - Get user files
   - DELETE `/api/files/user/:userId/files/:fileId` - Delete file

## Usage in Frontend

### Basic Usage

```jsx
import { uploadFileToFirebase, getUserFiles } from "@/utils/firebaseUpload";
import FileUploadComponent from "@/components/FileUpload/FileUpload";

// Use the component
<FileUploadComponent userId={currentUserId} />;

// Or use the utility functions directly
const handleUpload = async (file, userId) => {
  const result = await uploadFileToFirebase(file, userId);
  if (result.success) {
    console.log("File uploaded:", result.firebaseUrl);
  }
};
```

## Environment Variables

### Frontend (`.env` or `vite.config.js`)

```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend (`.env`)

```
MONGODB_URI=mongodb+srv://adityakumar07024_db_user:W3P6xolrJu4pmt1t@cluster0.ijrurlt.mongodb.net/
PORT=5000
```

## Database Setup

Your MongoDB URI is already available:

```
mongodb+srv://adityakumar07024_db_user:W3P6xolrJu4pmt1t@cluster0.ijrurlt.mongodb.net/
```

The User model will store documents like:

```json
{
  "_id": "userId",
  "username": "user",
  "email": "user@example.com",
  "password": "hashedPassword",
  "files": [
    {
      "_id": "fileId",
      "filename": "document.pdf",
      "firebaseUrl": "https://firebasestorage.googleapis.com/...",
      "uploadedAt": "2025-11-14T10:30:00Z",
      "fileType": "application/pdf",
      "fileSize": 102400
    }
  ],
  "createdAt": "2025-11-14T09:00:00Z",
  "updatedAt": "2025-11-14T10:30:00Z"
}
```

## Firebase Security Rules

Update your Firebase Storage rules in the Firebase Console:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## Next Steps

1. **Backend Setup:**

   - Connect MongoDB in `src/config/db.js`
   - Add authentication middleware for user verification
   - Set up Firebase Admin SDK if you need server-side file deletion from Firebase

2. **Frontend Setup:**

   - Update API base URL in your environment config
   - Import and use `FileUploadComponent` in your desired pages
   - Or use the utility functions directly in your components

3. **Optional Enhancements:**
   - Add file type validation
   - Implement file size limits
   - Add progress tracking for uploads
   - Implement drag-and-drop upload
   - Add file caching/versioning

## File Upload Flow

```
User selects file in Frontend
         ↓
uploadFileToFirebase() called
         ↓
File uploaded to Firebase Storage
         ↓
Firebase returns download URL
         ↓
API call to backend with URL and user ID
         ↓
Backend saves file entry to MongoDB user document
         ↓
Frontend receives confirmation
         ↓
File appears in user's file list
```

## API Endpoints

### Save File URL

```bash
POST /api/files/upload-url
Content-Type: application/json

{
  "userId": "user_mongo_id",
  "filename": "document.pdf",
  "firebaseUrl": "https://firebasestorage.googleapis.com/...",
  "fileType": "application/pdf",
  "fileSize": 102400
}
```

### Get User Files

```bash
GET /api/files/user/{userId}/files
```

### Delete File

```bash
DELETE /api/files/user/{userId}/files/{fileId}
```

## Troubleshooting

1. **Firebase Upload Fails:**

   - Check Firebase security rules
   - Verify Firebase config is correct
   - Check browser console for CORS errors

2. **URL Not Saved to MongoDB:**

   - Verify MongoDB connection
   - Check user ID is valid
   - Check backend error logs

3. **Files Not Appearing:**
   - Verify user ID matches
   - Check MongoDB document structure
   - Ensure frontend is calling getUserFiles after upload

## Support

For issues with Firebase: https://firebase.google.com/docs/storage
For issues with MongoDB: https://docs.mongodb.com/
