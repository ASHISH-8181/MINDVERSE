# PostgreSQL Connection Troubleshooting

## Issue: ETIMEDOUT Error

Your server is experiencing a timeout when trying to connect to the Neon PostgreSQL database.

### Diagnosis

```
Error code: ETIMEDOUT
Underlying error: Connection timeout
```

This means the connection attempt took too long and was abandoned. This typically indicates one of:

1. **Database is Suspended** (most likely for free tier)
2. **IP Whitelist Issue** - Your current IP is not allowed
3. **Database Credentials Invalid**
4. **Network/Firewall Blocking**

---

## Solution Steps

### Step 1: Check Neon Dashboard

1. Go to https://console.neon.tech
2. Log in to your account
3. Check if your project "neondb" is:
   - ✅ Active (not suspended)
   - ✅ Computing resources running
   - ✅ No errors displayed

### Step 2: Wake Up Suspended Database (Free Tier)

Free tier databases suspend after 1 week of inactivity.

1. In Neon Console, find your project
2. Look for "Suspended" status
3. Click the project to wake it up
4. Try connecting again

### Step 3: Check IP Whitelist

1. In Neon Console → Project Settings → Network
2. Verify your IP is allowed:
   - Allow all IPs: `0.0.0.0/0`
   - Or add your specific IP from: https://whatismyipaddress.com

### Step 4: Verify Connection String

Your current connection string:

```
postgresql://neondb_owner:npg_lPgJcYXb9u1M@ep-wandering-smoke-ah1qz39s-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Check these details in Neon Console:

- Database name: `neondb` ✓
- Username: `neondb_owner` ✓
- Host: `ep-wandering-smoke-ah1qz39s-pooler.c-3.us-east-1.aws.neon.tech` ✓

If different, update `.env` with the correct values.

### Step 5: Test Direct Connection

Open terminal and test:

```bash
psql "postgresql://neondb_owner:npg_lPgJcYXb9u1M@ep-wandering-smoke-ah1qz39s-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

If this fails, the issue is network/credentials, not your Node.js setup.

---

## Quick Temporary Fix: Use SQLite for Development

If you want to continue development while fixing Neon:

1. Install SQLite package:

```bash
npm install sqlite3 sqlite
```

2. Temporarily modify `.env`:

```dotenv
# Comment out PostgreSQL for now
# DATABASE_URL=postgresql://...

# Use SQLite instead
DATABASE_DRIVER=sqlite
```

3. Modify `src/config/database.js` to support both.

---

## Neon Free Tier Limitations

If using free tier, be aware:

- ❄️ Databases suspend after 1 week of inactivity
- 🔄 Takes 10-30 seconds to wake up
- 📊 Limited to 3GB storage
- ⏱️ Limited compute hours

To prevent suspension:

- Upgrade to paid plan
- Or keep making queries regularly

---

## If All Else Fails

1. Create a new Neon project
2. Get the new connection string
3. Update `.env` with new DATABASE_URL
4. Try again

---

## Still Not Working?

Run these diagnostics:

```bash
# Check DNS resolution
nslookup ep-wandering-smoke-ah1qz39s-pooler.c-3.us-east-1.aws.neon.tech

# Check connection with detailed logs
DEBUG_SQL=1 npm start

# Check network connectivity to AWS
curl -v telnet://ep-wandering-smoke-ah1qz39s-pooler.c-3.us-east-1.aws.neon.tech:5432
```

---

## Next Steps After Fixing Connection

Once you can connect:

1. Run: `npm start`
2. Should see:

   ```
   Connecting to: postgresql:***@...
   Attempting to authenticate with PostgreSQL...
   ✓ PostgreSQL connected successfully
   ✓ Database models synchronized
   ✓ Server running on http://localhost:5001
   ```

3. Test endpoints with frontend or Postman

---

**Last Updated**: November 14, 2025
