# Frontend-Backend File Upload Integration Guide

## ✅ Integration Complete!

Your file upload system is now fully integrated between frontend and backend.

---

## How It Works

### 1. **User Uploads File (Frontend)**

- User selects file via Summarizer page
- File is validated (size, type)
- Shows file preview before upload

### 2. **Upload to Firebase (Frontend)**

- File uploaded to Firebase Storage
- Gets Firebase download URL
- Backend is notified with file metadata

### 3. **Save to Database (Backend)**

- Backend receives file URL, size, type, name
- Auto-creates user if doesn't exist
- Saves file record to SQLite/PostgreSQL
- Returns success with file ID

### 4. **Display in History (Frontend)**

- Fetches all files for user from backend
- Shows in history sidebar
- Click to view file details
- Can delete from history

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React)                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User selects file                                      │
│     ↓                                                       │
│  2. handleFileChange() - Store file in state               │
│     ↓                                                       │
│  3. handleFileUpload() - Call uploadFileToFirebase()       │
│     ↓                                                       │
│  4. uploadFileToFirebase() - Upload to Firebase            │
│     ↓                                                       │
│  5. Get Firebase URL                                       │
│     ↓                                                       │
│  6. POST /api/files/upload-url with metadata               │
│     ↓                                                       │
│  7. Backend saves to database                              │
│     ↓                                                       │
│  8. Success response → Refresh file history                │
│     ↓                                                       │
│  9. getUserFiles() - Fetch updated list                    │
│     ↓                                                       │
│  10. Display in history card                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Updated Summarizer Page Features

### Upload Section (Left Column)

- ✅ Drag & drop file input
- ✅ Shows selected file details
- ✅ Upload button with loading state
- ✅ File size validation

### File Details (Right Column - Top)

- ✅ Display selected file info
- ✅ Copy Firebase link button
- ✅ Open file in new tab
- ✅ Delete file button

### History Card (Right Column - Bottom)

- ✅ List all user's uploaded files
- ✅ Click to view file details
- ✅ Sortedby upload date (newest first)
- ✅ Delete individual files
- ✅ Shows file size and type
- ✅ Empty state message

---

## Key API Endpoints Used

### Upload File

```bash
POST /api/files/upload-url
Body: {
  userId: string,
  username?: string,
  email?: string,
  filename: string,
  firebaseUrl: string,
  fileType: string,
  fileSize: number
}
```

### Get User Files

```bash
GET /api/files/user/:userId/files
Response: {
  success: true,
  data: [
    {
      id: UUID,
      userId: UUID,
      filename: string,
      firebaseUrl: string,
      fileType: string,
      fileSize: number,
      uploadedAt: Date,
      createdAt: Date,
      updatedAt: Date
    }
  ]
}
```

### Delete File

```bash
DELETE /api/files/user/:userId/files/:fileId
```

---

## Frontend Files Updated

### `/frontend/src/pages/Summarizer/Summarizer.jsx`

**Complete rewrite with:**

- Firebase upload integration
- File history display
- File management (view, delete, copy link)
- Responsive design
- Dark mode support
- Loading states
- Toast notifications

---

## Backend Files (Already Done)

### `/backend/src/controllers/fileController.js`

- ✅ uploadFileUrl() - Auto-create user, save file
- ✅ getUserFiles() - Fetch user's files
- ✅ deleteUserFile() - Delete file by ID
- ✅ getFileStats() - Get file statistics
- ✅ searchUserFiles() - Search files by name

### `/backend/src/controllers/userController.js`

- ✅ createUser() - Create new user
- ✅ getUser() - Get user with files

### `/backend/src/routes/userRoutes.js`

- ✅ POST /api/users/create
- ✅ GET /api/users/:userId

### `/backend/src/routes/fileRoutes.js`

- ✅ POST /api/files/upload-url
- ✅ GET /api/files/user/:userId/files
- ✅ GET /api/files/user/:userId/stats
- ✅ GET /api/files/user/:userId/search
- ✅ DELETE /api/files/user/:userId/files/:fileId

---

## Environment Variables Needed

### Frontend `.env`

```dotenv
VITE_API_BASE_URL=http://localhost:5001/api
VITE_API_URL=http://localhost:5001/api
```

### Backend `.env`

```dotenv
USE_LOCAL_DB=true  # or false for PostgreSQL
PORT=5001
CORS_ORIGIN=http://localhost:5173
```

---

## How to Test

### 1. Start Backend

```bash
cd /Users/aditya/Desktop/a/backend
npm start
```

Expected output:

```
Using local SQLite database for development...
✓ Database connected successfully
✓ Database models synchronized
✓ Server running on http://localhost:5001
```

### 2. Start Frontend

```bash
cd /Users/aditya/Desktop/a/frontend
npm run dev
```

Expected output:

```
VITE v5.x.x  ready in 123 ms

➜  Local:   http://localhost:5173
```

### 3. Test File Upload

1. Navigate to **Smart Summarizer** page
2. Click upload area to select file
3. Click **Upload File** button
4. Should see success toast
5. File appears in **Upload History** card below
6. Click file to view details
7. Click delete button to test deletion

---

## Testing with cURL

### Create User (optional - auto-created on upload)

```bash
curl -X POST http://localhost:5001/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Upload File

```bash
curl -X POST http://localhost:5001/api/files/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user",
    "username": "Demo User",
    "email": "demo@app.com",
    "filename": "document.pdf",
    "firebaseUrl": "https://firebasestorage.googleapis.com/.../document.pdf",
    "fileType": "pdf",
    "fileSize": 2048
  }'
```

### Get User Files

```bash
curl http://localhost:5001/api/files/user/demo-user/files
```

### Get File Stats

```bash
curl http://localhost:5001/api/files/user/demo-user/stats
```

### Delete File

```bash
curl -X DELETE http://localhost:5001/api/files/user/demo-user/files/FILE_UUID
```

---

## Features Summary

✅ **File Upload**

- Drag & drop or click to select
- Real-time progress
- Size validation (100MB max)
- Auto-create user

✅ **File Management**

- View file details
- Copy Firebase URL
- Open file in new tab
- Delete files

✅ **History Tracking**

- Persistent storage in database
- Shows all user uploads
- Sorted by date (newest first)
- File metadata (size, type)

✅ **Database Integration**

- SQLite for development
- PostgreSQL ready for production
- Auto-sync schema
- Proper relationships

✅ **Error Handling**

- Toast notifications
- Validation checks
- Network error handling
- Graceful fallbacks

✅ **User Experience**

- Responsive design
- Dark mode support
- Loading states
- Empty states
- Keyboard accessible

---

## Troubleshooting

### File Upload Fails

1. Check backend is running: `curl http://localhost:5001/api/ping`
2. Check Firebase config is correct
3. Check file size < 100MB
4. Check CORS settings in backend

### Files Not Showing in History

1. Check backend API endpoint: `GET /api/files/user/USER_ID/files`
2. Verify userId is correct
3. Check browser console for errors
4. Check localStorage has userId set

### Delete Not Working

1. Verify fileId is correct UUID
2. Check backend DELETE endpoint working
3. Verify userId matches

---

## Next Steps

1. ✅ **Frontend Integration** - DONE
2. ✅ **Backend API** - DONE
3. ⏳ **Test full flow**
4. ⏳ **Add more features** (summarization, mind map)
5. ⏳ **Deploy to production**

---

## Architecture Diagram

```
Frontend (React)
├── Summarizer Page
│   ├── Upload Section
│   │   ├── File input
│   │   └── Upload button → uploadFileToFirebase()
│   ├── File Details
│   │   ├── Display selected file
│   │   ├── Copy URL button
│   │   ├── Open file button
│   │   └── Delete button
│   └── History Card
│       └── List files from backend

Firebase Storage
└── Stores actual files
    └── Returns download URLs

Backend API (Node.js/Express)
├── POST /api/files/upload-url
│   └── Saves file metadata to database
├── GET /api/files/user/:userId/files
│   └── Returns user's file list
├── DELETE /api/files/user/:userId/files/:fileId
│   └── Removes file record
└── Database (SQLite/PostgreSQL)
    └── Stores file metadata & URLs
```

---

**Integration Date:** November 14, 2025  
**Status:** ✅ Complete and Ready for Testing  
**Next Feature:** File Summarization with AI
