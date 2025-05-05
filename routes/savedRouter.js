const express = require("express");
const router = express.Router();
const User = require("../models/usermodel");
const Feed = require("../models/feedmodel");
const authMiddleware = require("../middlewares/authMiddleware");

// Save a feed post
router.post("/savedpost", authMiddleware, async (req, res) => {
  try {
    const { feedUrl, title, platform, createdAt } = req.body;

    if (!feedUrl || !title || !platform) {
      return res.status(400).send({ message: "Missing required feed data" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send({ message: "User not found" });

    if (user.savedFeeds.includes(feedUrl)) {
      return res.status(400).send({ message: "Post already saved" });
    }

    // Save post ID in user and increment credits
    user.savedFeeds.push(feedUrl);
    user.credits += 1; // Increment credits by 1 (you can change the value if needed)
    await user.save();

    // Check if feed already exists
    let feed = await Feed.findOne({ postId: feedUrl });

    if (!feed) {
      feed = new Feed({
        postId: feedUrl,
        platform,
        content: { title },
        savedBy: [user._id],
        createdAt: createdAt || new Date()
      });
    } else {
      if (!feed.savedBy.includes(user._id)) {
        feed.savedBy.push(user._id);
      }
    }

    await feed.save();

    res.status(200).send({ message: "Post has been saved successfully", updatedCredits: user.credits });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});

// Get saved posts
router.get("/showSavedPosts", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send({ message: "User not found" });

    const savedPosts = await Feed.find({ postId: { $in: user.savedFeeds } });

    // Always return 200 even if array is empty
    res.status(200).send({
      message: "Saved posts fetched successfully",
      savedPosts: savedPosts || [],
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});
// Remove saved post
router.delete("/unsavepost", authMiddleware, async (req, res) => {
  const { feedUrl } = req.query;

  if (!feedUrl) {
    return res.status(400).send({ message: "Feed URL is missing" });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  if (!user.savedFeeds.includes(feedUrl)) {
    return res.status(400).send({ message: "Feed not found in saved posts" });
  }

  user.savedFeeds = user.savedFeeds.filter((url) => url !== feedUrl);
  await user.save();

  res.status(200).send({ message: "Post has been successfully removed" });
});

module.exports = router;