const express = require("express");
const router = express.Router();
const Feed = require("../models/feedmodel");
const Report = require("../models/reportmodel");
const authMiddleware = require("../middlewares/authMiddleware");

// Report a feed
router.post("/report", authMiddleware, async (req, res) => {
  try {
    const { feedId, reason } = req.body;

    if (!feedId || !reason) {
      return res.status(400).send({ message: "Missing reason or feedId" });
    }

    const report = new Report({
      feedId,
      reportedBy: req.user.id,
      reason,
    });

    await report.save();

    // Also update Feed collection
    const feed = await Feed.findOne({ postId: feedId });
    if (feed) {
      feed.reportedBy.push({
        userId: req.user.id,
        reason,
        reportDate: new Date(),
      });
      await feed.save();
    }

    res.status(200).send({ message: "Report saved successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal server Error", error: error.message });
  }
});

module.exports = router;