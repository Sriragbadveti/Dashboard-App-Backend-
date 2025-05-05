const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");

const secret =  "sriragsecretkey";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).send({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).send({ message: "Invalid token" });
    }

    
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized", error: error.message });
  }
};

module.exports = authMiddleware;