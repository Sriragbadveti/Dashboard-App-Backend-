const mongoose = require("mongoose");
var validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      minlength: 3,
      maxlength: 32,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      minlength: 5,
      maxlength: 50,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 60,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    credits: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
    },
    savedFeeds: {
      type: [String],
      default: [],
    },
    recentActivity: {
      type: [
        {
          action: String,
          points: Number,
          date: Date,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);