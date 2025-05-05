const express = require("express");
const router = express.Router();
const User = require("../models/usermodel");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// Get all users
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const listUsers = await User.find().select("-password");

    if (!listUsers || listUsers.length === 0) {
      return res.status(400).send({ message: "No users are registered in the database" });
    }

    res.status(200).send({ message: "Users fetched successfully", users: listUsers });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});

// Credit a user manually
router.put("/credit-user/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const searchedUserId = req.params.id;
    const { credits } = req.body;

    const user = await User.findById(searchedUserId);
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    if (!credits || typeof credits !== "number" || credits < 0) {
      return res.status(400).send({ message: "Invalid credits value" });
    }

    user.credits += credits;
    await user.save();

    res.status(200).send({ message: "Credits added successfully to the user's account" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;