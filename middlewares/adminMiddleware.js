const User = require("../models/usermodel");

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.role !== "admin") {
      return res.status(403).send({ message: "Forbidden user, Access Denied - only admins" });
    }

    next();
  } catch (error) {
    res.status(500).send({ message: "Internal server error", error: error.message });
  }
};

module.exports = adminMiddleware;