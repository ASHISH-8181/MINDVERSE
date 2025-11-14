#!/bin/bash

echo "=== Testing File Upload API ==="
echo ""

# Upload a file (auto-creates user)
echo "1. Uploading file (auto-creates user if needed)..."
UPLOAD=$(curl -s -X POST http://localhost:5001/api/files/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user-123",
    "username": "Demo User",
    "email": "demo@app.com",
    "filename": "document.pdf",
    "firebaseUrl": "https://firebasestorage.googleapis.com/v0/b/mindverse/documents/sample.pdf",
    "fileType": "pdf",
    "fileSize": 2048
  }')

echo "Upload Response:"
echo "$UPLOAD" | jq . 2>/dev/null || echo "$UPLOAD"
echo ""

# Upload another file
echo "2. Uploading second file for same user..."
UPLOAD2=$(curl -s -X POST http://localhost:5001/api/files/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user-123",
    "filename": "notes.txt",
    "firebaseUrl": "https://firebasestorage.googleapis.com/v0/b/mindverse/documents/notes.txt",
    "fileType": "txt",
    "fileSize": 512
  }')

echo "Upload Response:"
echo "$UPLOAD2" | jq . 2>/dev/null || echo "$UPLOAD2"
echo ""

# Get all files for user
echo "3. Fetching all files for user..."
FILES=$(curl -s http://localhost:5001/api/files/user/demo-user-123/files)
echo "Files:"
echo "$FILES" | jq . 2>/dev/null || echo "$FILES"
echo ""

# Get user profile
echo "4. Fetching user profile..."
USER=$(curl -s http://localhost:5001/api/users/demo-user-123)
echo "User Profile:"
echo "$USER" | jq . 2>/dev/null || echo "$USER"
echo ""

echo "✅ Upload test completed"
