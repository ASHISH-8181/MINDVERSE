const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hackagra";

    await mongoose.connect(mongoURI);

    console.log("✓ MongoDB connected successfully");
    console.log(`Connected to: ${mongoURI.split("@")[1] || "local database"}`);
    return mongoose.connection;
  } catch (err) {
    console.error("✗ DB connection error:", err.message);
    console.error("\n⚠️  IMPORTANT: MongoDB Atlas IP Whitelist Issue");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error(
      "Your current IP address is not whitelisted in MongoDB Atlas."
    );
    console.error("\nTo fix this:");
    console.error("1. Go to: https://cloud.mongodb.com/v2");
    console.error('2. Select your project "mindverse-69a67"');
    console.error("3. Go to: Network Access → IP Whitelist");
    console.error('4. Click "Add IP Address"');
    console.error(
      '5. Choose "Add Current IP Address" or add 0.0.0.0/0 (allows all IPs)'
    );
    console.error("6. Confirm and try again\n");
    process.exit(1);
  }
};

module.exports = connectDB;
