require('dotenv').config();
const fs = require('fs');
const path = './data/hackagra.db';
console.log('USE_LOCAL_DB=', process.env.USE_LOCAL_DB);
try {
  const stat = fs.statSync(path);
  console.log('DB exists', stat.size, 'bytes');
} catch (e) {
  console.error('stat error', e.message);
}
try {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(path, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error('open error', err.message);
      process.exit(1);
    }
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (e, rows) => {
      if (e) console.error('query error', e.message);
      else console.log('tables:', rows);
      db.close();
    });
  });
} catch (e) {
  console.error('require sqlite3 error', e.message);
  process.exit(1);
}
