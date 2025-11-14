# Upload Feature Testing Guide

## Setup Checklist

### Backend Setup

- [x] `.env` file created with MongoDB URI and Firebase config
- [x] `config/db.js` updated to use environment variables
- [x] `controllers/fileController.js` fully implemented with 5 functions
- [x] `routes/fileRoutes.js` with all endpoints
- [x] `models/User.js` with proper validation and indexes
- [x] `server.js` updated with proper database connection
- [x] `app.js` updated with error handling and CORS

### Frontend Setup

- [x] Firebase installed: `npm install firebase`
- [x] `config/firebase.js` initialized with credentials
- [x] `utils/firebaseUpload.js` with all utility functions
- [x] `components/FileUpload/FileUpload.jsx` ready to use

---

## Starting the Backend

```bash
cd backend

# Install dependencies if not done
npm install

# Start the server
npm start
# or if you have a start script: node src/server.js

# Expected output:
# ✓ MongoDB connected successfully
# ✓ Server running on http://localhost:5000
```

---

## API Endpoints Reference

### 1. Upload File URL

**Endpoint:** `POST /api/files/upload-url`

**Request:**

```bash
curl -X POST http://localhost:5000/api/files/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "filename": "document.pdf",
    "firebaseUrl": "https://firebasestorage.googleapis.com/...",
    "fileType": "application/pdf",
    "fileSize": 102400
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "File URL saved successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "username",
      "email": "email@example.com"
    },
    "file": {
      "_id": "file_id",
      "filename": "document.pdf",
      "firebaseUrl": "https://...",
      "fileType": "application/pdf",
      "fileSize": 102400,
      "uploadedAt": "2025-11-14T10:30:00Z"
    }
  }
}
```

---

### 2. Get User Files

**Endpoint:** `GET /api/files/user/:userId/files`

**Request:**

```bash
curl http://localhost:5000/api/files/user/USER_ID/files
```

**Response:**

```json
{
  "success": true,
  "message": "Files retrieved successfully",
  "data": [
    {
      "_id": "file_id",
      "filename": "document.pdf",
      "firebaseUrl": "https://...",
      "fileType": "application/pdf",
      "fileSize": 102400,
      "uploadedAt": "2025-11-14T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

### 3. Get File Statistics

**Endpoint:** `GET /api/files/user/:userId/stats`

**Request:**

```bash
curl http://localhost:5000/api/files/user/USER_ID/stats
```

**Response:**

```json
{
  "success": true,
  "message": "File statistics retrieved successfully",
  "data": {
    "totalFiles": 3,
    "totalSize": 307200,
    "totalSizeMB": "0.29",
    "fileTypes": {
      "application/pdf": 2,
      "image/jpeg": 1
    },
    "recentFiles": [...]
  }
}
```

---

### 4. Search Files

**Endpoint:** `GET /api/files/user/:userId/search?query=filename`

**Request:**

```bash
curl "http://localhost:5000/api/files/user/USER_ID/search?query=document"
```

**Response:**

```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [
    {
      "_id": "file_id",
      "filename": "document.pdf",
      ...
    }
  ],
  "count": 1
}
```

---

### 5. Delete File

**Endpoint:** `DELETE /api/files/user/:userId/files/:fileId`

**Request:**

```bash
curl -X DELETE http://localhost:5000/api/files/user/USER_ID/files/FILE_ID
```

**Response:**

```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "username",
      "email": "email@example.com"
    },
    "files": [...]
  }
}
```

---

## Frontend Usage Examples

### Basic Upload Component

```jsx
import FileUploadComponent from "@/components/FileUpload/FileUpload";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

export default function MyPage() {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h1>Upload Files</h1>
      <FileUploadComponent userId={user._id} />
    </div>
  );
}
```

### Using Utility Functions

```jsx
import {
  uploadFileToFirebase,
  getUserFiles,
  deleteUserFile,
  getFileStats,
  searchUserFiles,
  formatFileSize,
  formatDate,
} from "@/utils/firebaseUpload";

// Upload a file
const handleUpload = async (file) => {
  const result = await uploadFileToFirebase(file, userId);
  if (result.success) {
    console.log("Uploaded:", result.firebaseUrl);
  }
};

// Get all files
const handleFetchFiles = async () => {
  const result = await getUserFiles(userId);
  if (result.success) {
    console.log("Files:", result.data);
    console.log("Total:", result.count);
  }
};

// Get statistics
const handleGetStats = async () => {
  const result = await getFileStats(userId);
  if (result.success) {
    console.log("Total files:", result.data.totalFiles);
    console.log("Total size:", result.data.totalSizeMB, "MB");
  }
};

// Search files
const handleSearch = async (query) => {
  const result = await searchUserFiles(userId, query);
  if (result.success) {
    console.log("Found:", result.count, "files");
  }
};

// Delete a file
const handleDelete = async (fileId) => {
  const result = await deleteUserFile(userId, fileId);
  if (result.success) {
    console.log("File deleted");
  }
};
```

---

## Environment Variables

### Backend (.env)

```
MONGO_URI=mongodb+srv://adityakumar07024_db_user:W3P6xolrJu4pmt1t@cluster0.ijrurlt.mongodb.net/hackagra
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env.local or vite.config.js)

```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Troubleshooting

### Issue: MongoDB Connection Error

**Solution:**

- Verify MongoDB URI in `.env`
- Check internet connection
- Ensure whitelist IP in MongoDB Atlas

### Issue: Firebase Upload Fails

**Solution:**

- Check Firebase config in `frontend/src/config/firebase.js`
- Verify Firebase Storage rules allow uploads
- Check browser console for CORS errors

### Issue: API Returns 404

**Solution:**

- Verify server is running on port 5000
- Check API endpoint URL format
- Ensure CORS_ORIGIN in .env matches frontend URL

### Issue: File Not Saved to MongoDB

**Solution:**

- Verify userId is valid MongoDB ObjectId
- Check user exists in database
- Review backend console for errors

---

## Complete Upload Flow

```
User selects file
    ↓
Frontend validates file size (max 100MB)
    ↓
uploadFileToFirebase() called
    ↓
File uploaded to Firebase Storage
    ↓
Get Firebase download URL
    ↓
POST /api/files/upload-url with metadata
    ↓
Backend finds user by ID
    ↓
Add file to user's files array
    ↓
Save to MongoDB
    ↓
Return success response
    ↓
Frontend receives confirmation
    ↓
File appears in user's file list
```

---

## File Validation

### Size Limits

- Max file size: 100 MB

### Validation Steps

1. Frontend: Checks file exists and size < 100MB
2. Firebase: Validates upload during transfer
3. Backend: Validates request body and file size
4. MongoDB: Validates against schema

---

## Security Considerations

1. **Firebase Security Rules:** Update in Firebase Console

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

2. **Backend Validation:** All user inputs validated

3. **CORS:** Configured in backend app.js

4. **File Naming:** Uses timestamp to ensure uniqueness

---

## Performance Tips

- Lazy load file list
- Implement pagination for large file lists
- Use search for quick file access
- Monitor total storage usage

---

## Support Resources

- Firebase Docs: https://firebase.google.com/docs/storage
- MongoDB Docs: https://docs.mongodb.com/
- Express Docs: https://expressjs.com/
- React Docs: https://react.dev/
