const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.DATABASE_URL;

const connectMongo = async () => {
  try {
    if (!mongoUri) {
      console.error('✗ MONGODB_URI (or MONGO_URL) not set in .env');
      process.exit(1);
    }

    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ MongoDB connected successfully');
    return mongoose;
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message || err);
    process.exit(1);
  }
};

module.exports = { connectMongo, mongoose };
