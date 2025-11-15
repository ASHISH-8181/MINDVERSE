const { connectMongo } = require('../src/config/mongo');
const { User } = require('../src/models/index');

(async () => {
  console.log('Starting inspect script...');
  try {
    await connectMongo();
    console.log('Connected to Mongo, querying users...');
    const users = await User.find({ username: 'demo-user' }).lean();
    console.log('Found users:', JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Inspect error:', err);
    process.exit(1);
  }
})();
