# PostgreSQL Architecture Overview

## Database Connection Flow

```
┌─────────────────────┐
│   Node.js Server    │
│   (Express.js)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Sequelize ORM    │ ← New layer for SQL abstraction
│  (Query Builder)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   pg Driver         │ ← PostgreSQL client library
│  (Connection Pool)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│    Neon PostgreSQL Database             │
│  (ep-wandering-smoke-ah1qz39s-pooler)   │
│                                         │
│  ┌──────────────────┐                   │
│  │ users table      │                   │
│  ├──────────────────┤                   │
│  │ id (UUID)        │                   │
│  │ username         │                   │
│  │ email (UNIQUE)   │                   │
│  │ password         │                   │
│  │ createdAt        │                   │
│  │ updatedAt        │                   │
│  └──────────────────┘                   │
│                                         │
│  ┌──────────────────┐                   │
│  │ files table      │                   │
│  ├──────────────────┤                   │
│  │ id (UUID)        │                   │
│  │ userId (FK)   ──┼──→ users.id        │
│  │ filename         │                   │
│  │ firebaseUrl      │                   │
│  │ fileType         │                   │
│  │ fileSize         │                   │
│  │ uploadedAt       │                   │
│  │ createdAt        │                   │
│  │ updatedAt        │                   │
│  └──────────────────┘                   │
└─────────────────────────────────────────┘
```

## Model Relationships

### One-to-Many (User ↔ Files)

```
User (1) ─────────── (Many) Files
  │
  └─ user.getFiles()        ← Fetch all files for user
  └─ user.createFile()      ← Create new file for user
  └─ user.Files             ← Array of associated files
```

## Migration Path

### Before (MongoDB)

```javascript
User Document:
{
  _id: ObjectId("..."),
  username: "john",
  email: "john@example.com",
  files: [
    {
      _id: ObjectId("..."),
      filename: "doc.pdf",
      firebaseUrl: "https://...",
      uploadedAt: Date
    }
  ]
}
```

### After (PostgreSQL)

```javascript
User Row:
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  username: "john",
  email: "john@example.com",
  createdAt: 2024-11-14T10:00:00.000Z,
  updatedAt: 2024-11-14T10:00:00.000Z
}

File Rows:
{
  id: "650e8400-e29b-41d4-a716-446655440001",
  userId: "550e8400-e29b-41d4-a716-446655440000",
  filename: "doc.pdf",
  firebaseUrl: "https://...",
  uploadedAt: 2024-11-14T10:00:00.000Z,
  createdAt: 2024-11-14T10:00:00.000Z,
  updatedAt: 2024-11-14T10:00:00.000Z
}
```

## Key Differences

| Feature           | MongoDB               | PostgreSQL      |
| ----------------- | --------------------- | --------------- |
| **Model**         | Document-based        | Relational      |
| **IDs**           | ObjectId              | UUID            |
| **Relationships** | Embedded docs         | Foreign keys    |
| **Queries**       | JavaScript objects    | SQL             |
| **Transactions**  | Limited               | Full ACID       |
| **Indexing**      | Single-field          | Multi-field     |
| **Scaling**       | Horizontal (sharding) | Vertical        |
| **Cost**          | High for clusters     | Lower with Neon |

## File Locations

```
backend/
├── .env                          ← PostgreSQL connection string
├── src/
│   ├── config/
│   │   ├── db.js                 ← [DEPRECATED] Remove later
│   │   └── database.js           ← NEW: Sequelize config
│   ├── models/
│   │   ├── User.js               ← [DEPRECATED] Mongoose model
│   │   └── index.js              ← NEW: Sequelize models (User + File)
│   ├── controllers/
│   │   └── fileController.js     ← UPDATED: Sequelize queries
│   ├── routes/
│   │   └── fileRoutes.js         ← UPDATED: Comments updated
│   ├── app.js                    ← Unchanged
│   └── server.js                 ← UPDATED: New DB import
└── package.json                  ← UPDATED: pg + sequelize
```

## Sequelize Usage Examples

### Create User

```javascript
const user = await User.create({
  username: "john",
  email: "john@example.com",
  password: hashedPassword,
});
```

### Add File to User

```javascript
const file = await File.create({
  userId: user.id,
  filename: "document.pdf",
  firebaseUrl: "https://...",
  fileType: "pdf",
});
```

### Get User with Files

```javascript
const user = await User.findByPk(userId, {
  include: {
    association: "files",
    order: [["uploadedAt", "DESC"]],
  },
});
```

### Search Files

```javascript
const results = await File.findAll({
  where: {
    userId: userId,
    filename: { [Op.iLike]: `%query%` }, // Case-insensitive
  },
});
```

### Delete File (Cascade)

```javascript
await File.destroy({
  where: { id: fileId, userId: userId },
});
```

## Performance Tips

✅ **Indexing** - Indexed on email (UNIQUE) and userId (Foreign Key)
✅ **Connection Pooling** - Max 5 connections, reduces overhead
✅ **Query Optimization** - Use Sequelize eager loading
✅ **SSL/TLS** - Secure Neon connection
✅ **Batch Operations** - Use `bulkCreate()` for multiple inserts

## Neon Advantages

🚀 **Serverless** - No server management
💰 **Pay-per-use** - Only pay for actual usage
⚡ **Auto-scaling** - Handles traffic spikes
🔒 **SSL/TLS** - Encryption built-in
🌍 **Global** - Edge functions support
📊 **Monitoring** - Built-in analytics

## Next Steps

1. ✅ Database configured
2. ⏳ Run server: `npm start`
3. ⏳ Test endpoints with Postman
4. ⏳ Update frontend (if using local user IDs)
5. ⏳ Monitor Neon dashboard
