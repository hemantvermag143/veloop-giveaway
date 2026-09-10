const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      code: "LOGIN_REQUIRED",
      message: "Please login before continuing.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: payload.userId,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      code: "LOGIN_REQUIRED",
      message: "Your session has expired. Please login again.",
    });
  }
}

module.exports = {
  authenticateToken,
};
