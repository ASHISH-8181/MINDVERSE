#!/bin/bash

echo "=== Testing File Upload API ==="
echo ""

# First, create a test user
echo "1. Creating a test user..."
CREATE_USER=$(curl -s -X POST http://localhost:5001/api/files/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-001",
    "filename": "initial.txt",
    "firebaseUrl": "https://example.com/initial.txt",
    "fileType": "txt",
    "fileSize": 512
  }')

echo "Response: $CREATE_USER"
echo ""

# Try to upload a file
echo "2. Uploading a file..."
UPLOAD=$(curl -s -X POST http://localhost:5001/api/files/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-001",
    "filename": "document.pdf",
    "firebaseUrl": "https://firebasestorage.googleapis.com/v0/b/mindverse/documents/pdf.pdf",
    "fileType": "pdf",
    "fileSize": 2048
  }')

echo "Upload Response: $UPLOAD"
echo ""

# Get all files for user
echo "3. Fetching all files for user..."
FILES=$(curl -s http://localhost:5001/api/files/user/test-user-001/files)
echo "Files: $FILES"
echo ""

echo "✓ Upload test completed"
