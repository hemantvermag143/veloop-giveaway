const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");

const router = express.Router();
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      code: 'RATE_LIMITED',
      message: 'Too many login attempts. Please try again later.'
    });
  }
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      code: 'RATE_LIMITED',
      message: 'Too many registration attempts. Please try again later.'
    });
  }
});

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function createToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

router.get("/me", require("../middleware/authMiddleware").authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findOne(
      { userId: req.user.userId },
      { _id: 0, userId: 1, name: 1, email: 1, balances: 1, status: 1, role: 1 }
    ).lean();

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        code: "LOGIN_REQUIRED",
        message: "Please login before continuing.",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/register", registerLimiter, async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const email = data.email.toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        code: "USER_EXISTS",
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await User.create({
      userId: `VE${Date.now().toString().slice(-8)}`,
      name: data.name,
      email,
      passwordHash,
    });

    const token = createToken(user.userId);

    return res.status(201).json({
      success: true,
      data: {
        userId: user.userId,
        name: user.name,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const email = data.email.toLowerCase();

    const user = await User.findOne({ email });

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        code: "LOGIN_REQUIRED",
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        code: "LOGIN_REQUIRED",
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user.userId);

    return res.json({
      success: true,
      data: {
        userId: user.userId,
        name: user.name,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
