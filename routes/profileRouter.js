const express = require("express");
const router = express.Router();
const User = require("../models/usermodel");
const authMiddleware = require("../middlewares/authMiddleware");
const bcrypt = require("bcrypt");

// Get Profile Data
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const sendUser = {
      username: user.username,
      email: user.email,
      credits: user.credits,
      profileCompleted: user.profileCompleted,
      savedFeeds: user.savedFeeds,
    };
    res.status(200).send({ message: "User details sent", sendUser });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});

// Update Username or Password
router.put("/updateprofile", authMiddleware, async (req, res) => {
  try {
    const allowedFields = ["username", "password"];
    const bodyKeys = Object.keys(req.body);

    const isValid = bodyKeys.every((field) => allowedFields.includes(field));
    if (!isValid) {
      return res.status(400).send({ message: "Only username or password can be updated" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (req.body.username) {
      if (req.body.username.length < 3 || req.body.username.length > 12) {
        return res.status(400).send({ message: "Invalid username length" });
      }
      user.username = req.body.username;
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
    }

    await user.save();
    res.status(200).send({ message: "User profile updated successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});

// Complete Profile and Add Credits
router.put("/completeprofile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.profileCompleted) {
      return res.status(200).send({ message: "Profile already completed" });
    }

    user.profileCompleted = true;
    user.credits += 20;
    user.recentActivity.push({
      action: "Completed profile",
      points: 20,
      date: new Date(),
    });

    await user.save();
    res.status(200).send({ message: "20 credits added for profile completion" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;