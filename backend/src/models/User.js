const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, "Filename is required"],
    trim: true,
  },
  fileUrl: {
    type: String,
    required: [true, "File URL is required"],
  },
  fileType: {
    type: String,
    default: "unknown",
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
  },
  email: {
  type: String,
  required: true,
  unique: true,   // <-- THIS creates a unique index in MongoDB
},
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  files: [fileSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Remove manual indexes — these caused duplicates
// userSchema.index({ email: 1 });
// userSchema.index({ username: 1 });
userSchema.index({ "files.uploadedAt": -1 }); // keep this one

module.exports = mongoose.model("User", userSchema);
