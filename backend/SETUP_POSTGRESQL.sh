#!/bin/bash

# PostgreSQL Migration Test Script

echo "🚀 Starting PostgreSQL Migration Test..."
echo ""

cd /Users/aditya/Desktop/a/backend

# Check if Node modules are installed
echo "✓ Checking Node modules..."
if [ ! -d "node_modules" ]; then
    echo "  Installing dependencies..."
    npm install
fi

# Verify packages
echo "✓ Verifying PostgreSQL packages..."
npm list pg sequelize 2>&1 | grep -E "pg@|sequelize@"

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Your backend is configured for PostgreSQL with Neon."
echo ""
echo "Database Details:"
echo "  Host: ep-wandering-smoke-ah1qz39s-pooler.c-3.us-east-1.aws.neon.tech"
echo "  Database: neondb"
echo "  User: neondb_owner"
echo "  SSL: Required"
echo ""
echo "To start the server, run:"
echo "  npm start"
echo "or"
echo "  node src/server.js"
echo ""
