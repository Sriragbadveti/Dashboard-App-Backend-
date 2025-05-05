require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // React app port
  credentials: true
}));

// Routers
const authRouter = require("./routes/authRouter.js");
const profileRouter = require("./routes/profileRouter.js");
const adminRouter = require("./routes/adminRouter.js");
const feedRouter = require("./routes/feedRouter.js");
const saveRouter = require("./routes/savedRouter.js");

app.use("/api/auth", authRouter);
app.use("/api/user", profileRouter);
app.use("/api/admin", adminRouter);
app.use("/api/feed", feedRouter);
app.use("/api/save", saveRouter);

// Database Connection
mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
})
.catch((err) => {
  console.log('MongoDB connection error:', err);
});

// Server
const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`App is successfully running on port ${PORT}`);
});