# Developer Quick Reference - File Upload Feature

## 🎯 Quick Links

| Document                                             | Purpose                     |
| ---------------------------------------------------- | --------------------------- |
| [QUICK_START.md](./QUICK_START.md)                   | Start here - 5 minute setup |
| [SETUP_COMPLETE.md](./SETUP_COMPLETE.md)             | Full setup summary          |
| [UPLOAD_TESTING_GUIDE.md](./UPLOAD_TESTING_GUIDE.md) | API endpoints & testing     |
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)             | Firebase configuration      |

---

## 🚀 Start Server (Copy-Paste)

### Backend

```bash
cd backend && node src/server.js
```

### Frontend

```bash
cd frontend && npm run dev
```

---

## 💻 Code Examples

### 1. Simple Upload Component

```jsx
import FileUploadComponent from "@/components/FileUpload/FileUpload";

export default function Upload() {
  return <FileUploadComponent userId="user_id_here" />;
}
```

### 2. Manual Upload Function

```jsx
import { uploadFileToFirebase } from "@/utils/firebaseUpload";
import toast from "react-hot-toast";

const handleUpload = async (file) => {
  const result = await uploadFileToFirebase(file, userId);
  if (result.success) {
    toast.success("File uploaded!");
  } else {
    toast.error(result.error);
  }
};
```

### 3. Get User Files

```jsx
import { getUserFiles } from "@/utils/firebaseUpload";
import { useEffect, useState } from "react";

export default function FileList() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const result = await getUserFiles(userId);
      if (result.success) {
        setFiles(result.data);
      }
    };
    fetchFiles();
  }, [userId]);

  return (
    <div>
      {files.map((file) => (
        <div key={file._id}>{file.filename}</div>
      ))}
    </div>
  );
}
```

### 4. Search Files

```jsx
import { searchUserFiles } from "@/utils/firebaseUpload";

const handleSearch = async (query) => {
  const result = await searchUserFiles(userId, query);
  if (result.success) {
    console.log(`Found ${result.count} files`);
    setResults(result.data);
  }
};
```

### 5. Delete File

```jsx
import { deleteUserFile } from "@/utils/firebaseUpload";
import toast from "react-hot-toast";

const handleDelete = async (fileId) => {
  if (window.confirm("Delete this file?")) {
    const result = await deleteUserFile(userId, fileId);
    if (result.success) {
      toast.success("File deleted");
      refreshList(); // Reload list
    }
  }
};
```

---

## 🔌 API Endpoints

### Upload URL

```
POST /api/files/upload-url
Body: { userId, filename, firebaseUrl, fileType, fileSize }
```

### Get Files

```
GET /api/files/user/:userId/files
```

### Get Stats

```
GET /api/files/user/:userId/stats
```

### Search

```
GET /api/files/user/:userId/search?query=name
```

### Delete

```
DELETE /api/files/user/:userId/files/:fileId
```

---

## 📦 Utility Functions

```javascript
// Upload file
uploadFileToFirebase(file, userId);

// Get files
getUserFiles(userId);

// Delete file
deleteUserFile(userId, fileId);

// Get statistics
getFileStats(userId);

// Search files
searchUserFiles(userId, query);

// Download file
downloadFile(firebaseUrl, filename);

// Format file size
formatFileSize(bytes); // "2.5 MB"

// Format date
formatDate(dateString); // "Nov 14, 2025"
```

---

## 📋 Backend Functions

```javascript
// Save file URL
uploadFileUrl(req, res);

// Get user files
getUserFiles(req, res);

// Get statistics
getFileStats(req, res);

// Search files
searchUserFiles(req, res);

// Delete file
deleteUserFile(req, res);
```

---

## 🔍 Check Status

### Is Backend Running?

```bash
curl http://localhost:5000/api/ping
```

### Is MongoDB Connected?

Check backend console for:

```
✓ MongoDB connected successfully
```

### Are Dependencies Installed?

```bash
# Frontend
npm list firebase

# Backend
npm list mongoose express
```

---

## 🐛 Common Issues

| Issue               | Solution                                      |
| ------------------- | --------------------------------------------- |
| Backend won't start | Check `.env` file exists, MongoDB URI correct |
| Upload fails        | Check Firebase config, file size < 100MB      |
| Files not showing   | Check userId is valid ObjectId                |
| API returns 404     | Check endpoint URL spelling, backend running  |
| CORS errors         | Check `CORS_ORIGIN` in backend `.env`         |

---

## 📁 Key Files

```
Backend
├── .env                      ← Configuration (sensitive data)
├── src/server.js            ← Entry point
├── src/app.js              ← Express app
├── src/models/User.js      ← Data model
├── src/controllers/fileController.js  ← Business logic
└── src/routes/fileRoutes.js          ← API endpoints

Frontend
├── src/config/firebase.js          ← Firebase setup
├── src/utils/firebaseUpload.js     ← Upload functions
└── src/components/FileUpload/FileUpload.jsx  ← UI Component
```

---

## 🧪 Quick Test

### 1. Create Test User

```javascript
// In MongoDB
db.users.insertOne({
  username: "testuser",
  email: "test@example.com",
  password: "hashedpassword",
  files: [],
});
```

### 2. Test Upload Endpoint

```bash
curl -X POST http://localhost:5000/api/files/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "mongodb_id_from_step_1",
    "filename": "test.txt",
    "firebaseUrl": "https://example.com/file",
    "fileType": "text/plain",
    "fileSize": 1024
  }'
```

### 3. Check Response

Should return success with file data

---

## 🎛️ Configuration

### Backend Environment (.env)

```
MONGO_URI=...              ← Your MongoDB connection
PORT=5000                  ← Server port
NODE_ENV=development       ← Environment
CORS_ORIGIN=...           ← Frontend URL
```

### Frontend Environment (.env.local)

```
VITE_API_BASE_URL=...     ← Backend API URL
```

---

## 📊 Database Schema

```
User Document:
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String,
  files: [{
    _id: ObjectId,
    filename: String,
    firebaseUrl: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Security Notes

1. **Frontend**: File validation (size, type)
2. **Backend**: Request validation, size limits
3. **Database**: Indexes for performance
4. **Firebase**: Security rules needed (see FIREBASE_SETUP.md)
5. **CORS**: Configured for frontend URL only

---

## ⚡ Performance Tips

- Use `getUserFiles` on component mount
- Implement pagination for large file lists
- Use `searchUserFiles` for quick access
- Cache file lists locally if possible
- Lazy load file previews

---

## 📞 Support

**All documentation:**

- QUICK_START.md - Quick setup
- SETUP_COMPLETE.md - Complete summary
- UPLOAD_TESTING_GUIDE.md - API reference
- FIREBASE_SETUP.md - Firebase config

**Console Logs:**

- Backend: Check server logs for errors
- Frontend: Check browser console
- Network tab: Check API requests

---

## ✅ Final Checklist

- [ ] Backend `.env` file created
- [ ] Frontend `.env.local` file created
- [ ] Backend dependencies installed: `npm install`
- [ ] Frontend Firebase installed: `npm install firebase`
- [ ] Backend server running on port 5000
- [ ] Frontend dev server running on port 5173
- [ ] Can access `/api/ping` endpoint
- [ ] FileUploadComponent renders
- [ ] Can select and upload file
- [ ] File appears in list after upload
- [ ] Can delete files
- [ ] Can search files
- [ ] Can view file statistics

---

## 🎉 You're All Set!

Start servers and begin uploading files. Refer to the documentation files for detailed information.
