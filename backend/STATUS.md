# Backend Setup - Current Status

## ✅ Server Running Successfully

Your Node.js backend is now **running with SQLite** for local development!

### Status Check

```bash
curl http://localhost:5001/api/ping
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-11-14T04:35:44.854Z",
  "environment": "development"
}
```

---

## Current Configuration

### Database Setup

**Active**: SQLite (Local Development)

```
Location: /Users/aditya/Desktop/a/backend/data/hackagra.db
Purpose: Local testing & development
```

**Available**: PostgreSQL (Neon - Troubleshooting)

```
Host: ep-wandering-smoke-ah1qz39s-pooler.c-3.us-east-1.aws.neon.tech
Status: Connection timeout (ETIMEDOUT)
Action: See POSTGRESQL_TROUBLESHOOTING.md
```

### Server Configuration

```
Port: 5001
Environment: development
CORS Origin: http://localhost:5173
Node Version: v25.1.0
```

---

## How to Start/Stop Server

### Start Server

```bash
cd /Users/aditya/Desktop/a/backend
npm start
```

Expected output:

```
> backend@1.0.0 start
> node src/server.js

Using local SQLite database for development...
Attempting to authenticate with database...
✓ Database connected successfully
✓ Database models synchronized
ℹ️  Using SQLite: ./data/hackagra.db (Development only)
✓ Server running on http://localhost:5001
```

### Stop Server

```bash
# If running in foreground
Ctrl+C

# If running in background
pkill -f "node src/server.js"
```

---

## What's Working

✅ User model with UUID primary key
✅ File model with foreign key to users
✅ File upload endpoint: `POST /api/files/upload-url`
✅ Get user files: `GET /api/files/user/:userId/files`
✅ File statistics: `GET /api/files/user/:userId/stats`
✅ Search files: `GET /api/files/user/:userId/search?query=name`
✅ Delete files: `DELETE /api/files/user/:userId/files/:fileId`
✅ Health check: `GET /api/ping`
✅ CORS enabled for frontend (port 5173)

---

## Testing API Endpoints

### 1. Health Check

```bash
curl http://localhost:5001/api/ping
```

### 2. Upload File

```bash
curl -X POST http://localhost:5001/api/files/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "filename": "document.pdf",
    "firebaseUrl": "https://example.com/doc.pdf",
    "fileType": "pdf",
    "fileSize": 2048
  }'
```

### 3. Get User Files

```bash
curl http://localhost:5001/api/files/user/user-123/files
```

### 4. Get Statistics

```bash
curl http://localhost:5001/api/files/user/user-123/stats
```

### 5. Search Files

```bash
curl "http://localhost:5001/api/files/user/user-123/search?query=document"
```

### 6. Delete File

```bash
# First get a fileId from GET /files/user/:userId/files
curl -X DELETE http://localhost:5001/api/files/user/user-123/files/FILE_ID_HERE
```

---

## Switching to PostgreSQL

When your Neon database is active:

1. **Fix the connection issue**

   - See: `POSTGRESQL_TROUBLESHOOTING.md`
   - Options: Wake up suspended DB, check IP whitelist, verify credentials

2. **Update .env**

   ```dotenv
   # Change this:
   USE_LOCAL_DB=true

   # To this:
   USE_LOCAL_DB=false
   ```

3. **Restart server**
   ```bash
   npm start
   ```

---

## Important Files

| File                                | Purpose                                   |
| ----------------------------------- | ----------------------------------------- |
| `.env`                              | Configuration (database, ports, API keys) |
| `src/config/database.js`            | Database connection (SQLite + PostgreSQL) |
| `src/models/index.js`               | User & File Sequelize models              |
| `src/controllers/fileController.js` | API logic                                 |
| `src/routes/fileRoutes.js`          | API routes                                |
| `src/app.js`                        | Express app setup                         |
| `src/server.js`                     | Server entry point                        |
| `package.json`                      | Dependencies & scripts                    |

---

## Documentation Files

| File                            | For What                               |
| ------------------------------- | -------------------------------------- |
| `SQLITE_DEV_SETUP.md`           | Using SQLite for development           |
| `POSTGRESQL_TROUBLESHOOTING.md` | Fixing PostgreSQL connection           |
| `POSTGRESQL_MIGRATION.md`       | MongoDB → PostgreSQL migration details |
| `POSTGRESQL_ARCHITECTURE.md`    | Technical architecture overview        |
| `MIGRATION_CHECKLIST.md`        | Complete migration checklist           |

---

## Database Troubleshooting

### SQLite Issues

**Error**: "Unable to connect to SQLite database"

- Solution: Check `./data` directory is writable
- Fix: `chmod 755 /Users/aditya/Desktop/a/backend/data`

**Clear SQLite Data**:

```bash
rm /Users/aditya/Desktop/a/backend/data/hackagra.db
```

### PostgreSQL Issues

**Error**: ETIMEDOUT

- Likely cause: Neon database is suspended (free tier)
- Solution: See `POSTGRESQL_TROUBLESHOOTING.md`

---

## Next Steps

### For Frontend Integration

1. Ensure frontend is running on `http://localhost:5173`
2. CORS is configured to allow frontend requests
3. Test file upload endpoint from frontend

### For Production

1. Activate Neon PostgreSQL (see troubleshooting guide)
2. Set `USE_LOCAL_DB=false` in `.env`
3. Add production DATABASE_URL
4. Deploy backend with PostgreSQL

### For Development

1. Keep using SQLite (`USE_LOCAL_DB=true`)
2. Test all endpoints locally
3. Use SQLite until ready for production

---

## Quick Reference

**Start server**: `npm start`
**Stop server**: `Ctrl+C` (or `pkill -f "node src/server.js"`)
**Health check**: `curl http://localhost:5001/api/ping`
**Database**: SQLite at `./data/hackagra.db`
**API port**: 5001
**Frontend port**: 5173

---

## Additional Commands

```bash
# Check if server is running
ps aux | grep "node src/server"

# View database (requires sqlite3 CLI)
sqlite3 /Users/aditya/Desktop/a/backend/data/hackagra.db
  > .tables
  > SELECT * FROM users;
  > .quit

# Enable SQL query logging
DEBUG_SQL=1 npm start

# Check recent server logs
tail -f ~/.pm2/logs/backend-error.log  # if using PM2
```

---

## Important Notes

⚠️ **SQLite limitations**:

- Single-user development only
- Not suitable for production
- No concurrent connections

✅ **When ready for production**:

- Activate Neon PostgreSQL
- Switch `USE_LOCAL_DB=false`
- Update DATABASE_URL with credentials

---

**Last Updated**: November 14, 2025  
**Backend Status**: ✅ Running (SQLite)  
**API Health**: ✅ Responding  
**Ready for**: Development & Testing
