# Quick Start Guide - File Upload Feature

## 🚀 5-Minute Setup

### Step 1: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Environment is already configured (.env file created)
# Verify MongoDB URI is correct:
# MONGO_URI=mongodb+srv://adityakumar07024_db_user:W3P6xolrJu4pmt1t@cluster0.ijrurlt.mongodb.net/hackagra

# Start the server
node src/server.js

# You should see:
# ✓ MongoDB connected successfully
# ✓ Server running on http://localhost:5000
```

### Step 2: Frontend Setup

```bash
cd frontend

# Firebase already installed
# Create .env.local file
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env.local

# Start the dev server
npm run dev

# You should see:
# ✓ Vite server is running on http://localhost:5173
```

### Step 3: Use the Upload Component

```jsx
import FileUploadComponent from "@/components/FileUpload/FileUpload";

// In your page/component:
<FileUploadComponent userId="your_user_id_here" />;
```

---

## 📋 What's Included

### Backend Files Created/Updated

| File                                | Purpose                                              |
| ----------------------------------- | ---------------------------------------------------- |
| `.env`                              | Environment variables with MongoDB & Firebase config |
| `src/server.js`                     | Express server with proper DB connection             |
| `src/app.js`                        | Express app with routes and error handling           |
| `src/config/db.js`                  | MongoDB connection setup                             |
| `src/models/User.js`                | User schema with file uploads support                |
| `src/controllers/fileController.js` | 5 controller functions for file operations           |
| `src/routes/fileRoutes.js`          | 5 API endpoints for file management                  |

### Frontend Files Created/Updated

| File                                       | Purpose                         |
| ------------------------------------------ | ------------------------------- |
| `src/config/firebase.js`                   | Firebase app initialization     |
| `src/utils/firebaseUpload.js`              | 8 utility functions for uploads |
| `src/components/FileUpload/FileUpload.jsx` | Complete upload component       |
| `.env.example`                             | Environment template            |

---

## 🔧 Core Functions

### Backend Functions

1. **uploadFileUrl** - Save file URL to MongoDB
2. **getUserFiles** - Get all files for a user
3. **deleteUserFile** - Delete a file entry
4. **getFileStats** - Get storage statistics
5. **searchUserFiles** - Search files by name

### Frontend Functions

1. **uploadFileToFirebase** - Upload to Firebase & save URL
2. **getUserFiles** - Fetch user's files
3. **deleteUserFile** - Delete file from database
4. **getFileStats** - Get file statistics
5. **searchUserFiles** - Search files
6. **downloadFile** - Download a file
7. **formatFileSize** - Format size for display
8. **formatDate** - Format date for display

---

## 🧪 Test the Upload

### Method 1: Using the Component

```jsx
import FileUploadComponent from "@/components/FileUpload/FileUpload";

export default function TestUpload() {
  return <FileUploadComponent userId="test_user_id" />;
}
```

### Method 2: Using cURL

```bash
# First, create a test user in MongoDB
# Or use an existing user ID

# Test upload endpoint
curl -X POST http://localhost:5000/api/files/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_HERE",
    "filename": "test.txt",
    "firebaseUrl": "https://example.com/file",
    "fileType": "text/plain",
    "fileSize": 1024
  }'

# Get files
curl http://localhost:5000/api/files/user/USER_ID_HERE/files

# Get stats
curl http://localhost:5000/api/files/user/USER_ID_HERE/stats

# Search
curl "http://localhost:5000/api/files/user/USER_ID_HERE/search?query=test"

# Delete file
curl -X DELETE http://localhost:5000/api/files/user/USER_ID_HERE/files/FILE_ID_HERE
```

### Method 3: Using Postman

1. Import the following endpoints into Postman
2. Replace `USER_ID` and `FILE_ID` with actual values
3. Run the requests

---

## 📱 Full Upload Workflow

```
┌─────────────────────────────────────────────┐
│ 1. User selects file in UI                  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ 2. Frontend validates file (<100MB)         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ 3. uploadFileToFirebase() called            │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ 4. File uploaded to Firebase Storage        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ 5. Get Firebase download URL                │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ 6. POST /api/files/upload-url               │
│    (Send URL + metadata to backend)         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ 7. Backend validates request                │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ 8. Find user in MongoDB                     │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ 9. Add file to user.files array             │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ 10. Save user document to MongoDB           │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ 11. Return success response                 │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ 12. Frontend shows file in list             │
└─────────────────────────────────────────────┘
```

---

## 🐛 Debugging

### Check Backend is Running

```bash
curl http://localhost:5000/api/ping
# Should return: { "status": "ok", ... }
```

### Check Database Connection

```bash
# Check backend console for:
# ✓ MongoDB connected successfully
# Connected to: cluster0.ijrurlt.mongodb.net
```

### Check Firebase Config

```javascript
// In browser console:
import { storage } from "@/config/firebase";
console.log(storage); // Should show Firebase Storage instance
```

### View API Response

```javascript
// In browser console:
const res = await fetch("http://localhost:5000/api/files/user/test/files");
const data = await res.json();
console.log(data);
```

---

## ✅ Checklist

- [ ] Backend `.env` file created with correct MongoDB URI
- [ ] Frontend `.env.local` created with API base URL
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connection successful
- [ ] Can call `/api/ping` endpoint
- [ ] FileUploadComponent renders without errors
- [ ] Can select and upload a file
- [ ] File appears in the list after upload
- [ ] Can view/download files
- [ ] Can delete files

---

## 📚 Documentation

- **Testing Guide:** See `UPLOAD_TESTING_GUIDE.md`
- **Firebase Setup:** See `FIREBASE_SETUP.md`
- **API Reference:** All endpoints documented in Testing Guide

---

## 💡 Tips

1. Always check browser console for errors
2. Check backend console for server logs
3. Use the health check endpoint to verify backend is up
4. Use Postman to test API endpoints
5. Use MongoDB Atlas to view stored files
6. Use Firebase Console to view uploaded files

---

## 🚀 Next Steps

1. Integrate with your authentication system
2. Add file type restrictions
3. Implement file versioning
4. Add progress bars for large uploads
5. Implement drag-and-drop
6. Add file preview functionality
7. Implement file sharing
8. Add real-time notifications

---

## 📞 Need Help?

All files have been set up correctly. If something doesn't work:

1. Check the error message in console
2. Verify environment variables are set correctly
3. Restart both frontend and backend
4. Check MongoDB Atlas connection
5. Verify Firebase config in code
