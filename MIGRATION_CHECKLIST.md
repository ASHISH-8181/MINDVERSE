# MongoDB → PostgreSQL Migration Checklist ✅

## Completed Tasks

### ✅ Configuration

- [x] Updated `.env` with Neon PostgreSQL connection string
- [x] Removed `MONGO_URI` environment variable
- [x] Set up SSL/TLS for Neon connection

### ✅ Dependencies

- [x] Installed `pg` (PostgreSQL driver)
- [x] Installed `sequelize` (SQL ORM)
- [x] Removed `mongoose` from package.json
- [x] Verified both packages installed correctly

### ✅ Database Layer

- [x] Created `src/config/database.js` (Sequelize configuration)
- [x] Configured connection pooling (max 5 connections)
- [x] Set up SSL/TLS options for Neon
- [x] Enabled auto-sync on startup

### ✅ Models

- [x] Created Sequelize User model in `src/models/index.js`
- [x] Created Sequelize File model in `src/models/index.js`
- [x] Set up User ↔ Files one-to-many relationship
- [x] Added UUID primary keys
- [x] Added proper validations
- [x] Added indexes (email UNIQUE, username, userId)

### ✅ Controllers

- [x] Updated `uploadFileUrl()` for Sequelize
- [x] Updated `getUserFiles()` for Sequelize
- [x] Updated `deleteUserFile()` for Sequelize
- [x] Updated `getFileStats()` for Sequelize
- [x] Updated `searchUserFiles()` for Sequelize with case-insensitive search

### ✅ Server

- [x] Updated `src/server.js` to import new database config
- [x] Changed MongoDB connection to PostgreSQL connection
- [x] Maintained Socket.io integration

### ✅ Routes

- [x] Updated route comments (MongoDB → PostgreSQL)
- [x] All endpoints remain unchanged at API level

### ✅ Documentation

- [x] Created `POSTGRESQL_MIGRATION.md` (migration summary)
- [x] Created `POSTGRESQL_ARCHITECTURE.md` (architecture overview)
- [x] Created `SETUP_POSTGRESQL.sh` (setup script)

---

## Files Modified

| File                                | Changes                               |
| ----------------------------------- | ------------------------------------- |
| `.env`                              | DATABASE_URL set to Neon PostgreSQL   |
| `src/config/database.js`            | ✨ NEW - Sequelize setup              |
| `src/models/index.js`               | ✨ NEW - User & File Sequelize models |
| `src/models/User.js`                | ⏸️ DEPRECATED - Old Mongoose model    |
| `src/controllers/fileController.js` | Updated all DB queries to Sequelize   |
| `src/routes/fileRoutes.js`          | Updated comments only                 |
| `src/server.js`                     | Updated database import/connection    |
| `package.json`                      | Removed mongoose, kept pg + sequelize |

---

## Database Schema Created

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

### Files Table

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  firebaseUrl VARCHAR(255) NOT NULL,
  fileType VARCHAR(50) DEFAULT 'unknown',
  fileSize BIGINT DEFAULT 0,
  uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_files_userId ON files(userId);
CREATE INDEX idx_files_uploadedAt ON files(uploadedAt DESC);
```

---

## API Response Format Changes

### User ID Format

```javascript
// Before (MongoDB)
{
  _id: "507f1f77bcf86cd799439011";
}

// After (PostgreSQL)
{
  id: "550e8400-e29b-41d4-a716-446655440000";
}
```

### File Response

```javascript
// Before (MongoDB)
{
  _id: ObjectId,
  filename: "doc.pdf",
  uploadedAt: Date
}

// After (PostgreSQL)
{
  id: UUID,
  userId: UUID,
  filename: "doc.pdf",
  uploadedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Frontend Changes Required

⚠️ If your frontend uses user IDs stored locally:

1. **Clear Local Storage**

   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Update User ID References**

   - Change `user._id` to `user.id`
   - Update any API calls that reference user IDs

3. **Update File Uploads**
   - Send POST to `/api/files/upload-url` with new format
   - Expect UUID in response instead of ObjectId

Example Frontend Update:

```javascript
// Before
const userId = user._id;

// After
const userId = user.id;

// Before
const fileId = file._id;

// After
const fileId = file.id;
```

---

## Testing Checklist

Before deploying to production:

- [ ] Start server: `npm start`
- [ ] Check console for "✓ PostgreSQL connected successfully"
- [ ] Test POST `/api/files/upload-url` with new user ID format
- [ ] Test GET `/api/files/user/:userId/files`
- [ ] Test GET `/api/files/user/:userId/stats`
- [ ] Test GET `/api/files/user/:userId/search?query=test`
- [ ] Test DELETE `/api/files/user/:userId/files/:fileId`
- [ ] Check Neon dashboard for created tables
- [ ] Verify data appears in PostgreSQL

---

## Troubleshooting

### Error: "connect ENOTFOUND"

- Check `DATABASE_URL` in `.env`
- Verify Neon database is active
- Test connection: `psql <CONNECTION_STRING>`

### Error: "password authentication failed"

- Verify credentials in `.env`
- Check for special characters in password (may need URL encoding)

### Tables not created

- Check server logs for error messages
- Verify Sequelize sync is running: `await sequelize.sync({ alter: true })`

### Connection timeout

- Check Neon dashboard for IP restrictions
- Verify SSL mode is required

---

## Performance Notes

✅ Connection pooling: 5 max connections
✅ Indexes on: email, userId, uploadedAt
✅ SSL/TLS: Enabled
✅ Query optimization: Using Sequelize eager loading

---

## Version Information

- **Node.js**: Required v14+
- **PostgreSQL**: Neon (v15+)
- **Sequelize**: 6.37.7
- **pg**: 8.16.3

---

## Next Steps

1. **Immediate**

   - [ ] Run `npm install` to ensure all dependencies installed
   - [ ] Start server and verify connection
   - [ ] Test basic file operations

2. **Short-term**

   - [ ] Update frontend user ID references
   - [ ] Clear frontend local storage
   - [ ] Test full workflow end-to-end
   - [ ] Monitor Neon logs for issues

3. **Long-term**
   - [ ] Set up database backups in Neon
   - [ ] Configure alerts for connection errors
   - [ ] Monitor performance metrics
   - [ ] Plan data migration if coming from existing MongoDB

---

## Support

Neon PostgreSQL Documentation:

- https://neon.tech/docs/introduction

Sequelize Documentation:

- https://sequelize.org/docs/v6/

pg (Node PostgreSQL Driver):

- https://node-postgres.com/

---

**Migration Date**: November 14, 2025  
**Status**: ✅ Complete and Ready for Testing
