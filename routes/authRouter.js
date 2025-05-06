const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
const router = express.Router();

const secret =  "sriragsecretkey"; // Fallback secret

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || email.length < 5 || email.length > 50) {
      return res.status(400).send("Email ID characters problem");
    }
    if (!username || username.length < 3 || username.length > 32) {
      return res.status(400).send("Username characters problem");
    }
    if (!password || password.length < 4 || password.length > 60) {
      return res.status(400).send("Password characters limit exceeded");
    }

    const genSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, genSalt);

    const newUser = new User({
      email,
      password: hashedPassword,
      username,
    });

    const saveUser = await newUser.save();

    const token = jwt.sign({ id: saveUser._id, role: saveUser.role }, secret, {
      expiresIn: "1d",
    });

    res
      .cookie("token", token, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
        domain:'.vercel.app',
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .send({ message: "User has been registered successfully" });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || email.length < 5 || email.length > 50) {
      return res.status(400).send("Email ID characters problem");
    }
    if (!password || password.length < 4 || password.length > 20) {
      return res.status(400).send("Password characters limit exceeded");
    }

    const checkEmail = await User.findOne({ email });

    if (!checkEmail) {
      return res
        .status(400)
        .send({ message: "Email id has not been found, Try signing up" });
    }

    const checkPassword = await bcrypt.compare(password, checkEmail.password);

    if (!checkPassword) {
      return res.status(400).send({ message: "Password is incorrect" });
    }

    const token = jwt.sign(
      { id: checkEmail._id, role: checkEmail.role },
      secret,
      { expiresIn: "1d" }
    );
    console.log("Sending cookie to origin:", req.headers.origin);
    res
      .cookie("token", token, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        partitioned:true,
        path : "/",
      })
      .status(200)
      .send({ message: "User has been logged in successfully" });

    const today = new Date().toDateString();
    const lastLoginDate = checkEmail.lastLogin?.toDateString();

    if (today !== lastLoginDate) {
      checkEmail.credits += 5;
      checkEmail.lastLogin = new Date();
      checkEmail.recentActivity.push({
        action: "Daily login",
        points: 5,
        date: new Date(),
      });
      await checkEmail.save();
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
});

// Logout Route
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    res.clearCookie("token").status(200).send({ message: "User logged out" });
  } catch (error) {
    res.status(500).send({ message: "Error logging out", error: error.message });
  }
});

module.exports = router;