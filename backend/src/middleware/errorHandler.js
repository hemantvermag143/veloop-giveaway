function errorHandler(err, req, res, next) {
  console.error(err.message);

  if (err?.name === "ZodError") {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Please check the submitted information.",
      details: err.issues?.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })) || [],
    });
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";

  const messages = {
    GIVEAWAY_NOT_FOUND: "Giveaway not found.",
    GIVEAWAY_NOT_ACTIVE: "This giveaway is not active.",
    GIVEAWAY_ENDED: "This giveaway has ended.",
    ALREADY_PARTICIPATING: "You are already participating in this giveaway.",
    INSUFFICIENT_VE_BALANCE: "You do not have enough VEs.",
    INSUFFICIENT_SVE_BALANCE: "You do not have enough SVEs.",
    INSUFFICIENT_TOKEN_BALANCE: "You do not have enough Tokens.",
    LOGIN_REQUIRED: "Please login before continuing.",
    PARTICIPATION_BLOCKED: "Your participation is currently blocked.",
    SUSPICIOUS_ACTIVITY: "Suspicious activity was detected.",
    RATE_LIMITED: "Too many requests. Please try again later.",
    CLAIM_NOT_ALLOWED: "You are not allowed to claim this prize.",
    USER_EXISTS: "An account with this email already exists.",
    VALIDATION_ERROR: "Please check the submitted information.",
    INTERNAL_SERVER_ERROR: "Something went wrong. Please try again.",
  };

  return res.status(statusCode).json({
    success: false,
    code,
    message: messages[code] || messages.INTERNAL_SERVER_ERROR,
  });
}

module.exports = errorHandler;
