const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      required: true,
    },
    content: {
      type: Object,
      required: true,
    },
    savedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    reportedBy: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          reason: String,
          reportDate: Date,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feed", feedSchema);