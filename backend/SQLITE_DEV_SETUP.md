# Quick Development Setup: SQLite Local Database

Since your Neon database connection is experiencing timeouts, you can use SQLite for local development while you troubleshoot the PostgreSQL connection.

## Enable SQLite Development Mode

### Option 1: Update `.env` file

Add this line to your `/Users/aditya/Desktop/a/backend/.env`:

```dotenv
USE_LOCAL_DB=true
```

This will make the server use SQLite instead of PostgreSQL.

### Option 2: Use Command Line

```bash
cd /Users/aditya/Desktop/a/backend
USE_LOCAL_DB=true npm start
```

## Expected Output

When you run with SQLite enabled, you should see:

```
Using local SQLite database for development...
Attempting to authenticate with database...
✓ Database connected successfully
✓ Database models synchronized
ℹ️  Using SQLite: ./data/hackagra.db (Development only)
✓ Server running on http://localhost:5001
```

## Database File Location

Your local SQLite database will be stored at:

```
/Users/aditya/Desktop/a/backend/data/hackagra.db
```

This file is automatically created on first run.

## Important Notes

⚠️ **SQLite is for development only** - It doesn't support:

- Concurrent connections in production
- Scaling to multiple servers
- Advanced PostgreSQL features

✅ **What works fine**:

- Testing all API endpoints
- Local development
- Testing file uploads
- Testing user authentication

## Switching Back to PostgreSQL

When your Neon database is fixed:

1. Remove or comment out `USE_LOCAL_DB=true` from `.env`
2. Ensure `DATABASE_URL` is set correctly
3. Run `npm start` (it will use PostgreSQL)

## Clear SQLite Data

If you want to start fresh:

```bash
rm /Users/aditya/Desktop/a/backend/data/hackagra.db
```

The database will be recreated on next run with fresh schema.

## Testing with SQLite

All API endpoints work the same way:

```bash
# Upload a file
curl -X POST http://localhost:5001/api/files/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "filename": "test.pdf",
    "firebaseUrl": "https://example.com/file.pdf",
    "fileType": "pdf",
    "fileSize": 1024
  }'

# Get user files
curl http://localhost:5001/api/files/user/test-user-1/files

# Get stats
curl http://localhost:5001/api/files/user/test-user-1/stats
```

## Next Steps

1. Add `USE_LOCAL_DB=true` to `.env`
2. Run `npm start`
3. Test your endpoints with Postman/frontend
4. Once Neon is working, follow the troubleshooting guide
5. Switch back to PostgreSQL when ready

---

For PostgreSQL connection issues, see: **POSTGRESQL_TROUBLESHOOTING.md**
