const User = require("../models/User");

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findOne(
      { userId: req.user.userId },
      { role: 1, status: 1 }
    ).lean();

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        code: "LOGIN_REQUIRED",
        message: "Please login before continuing.",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        message: "Admin access is required.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requireAdmin,
};
