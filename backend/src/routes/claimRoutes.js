const express = require("express");
const { z } = require("zod");
const rateLimit = require("express-rate-limit");
const GiveawayWinner = require("../models/GiveawayWinner");
const Giveaway = require("../models/Giveaway");
const Prize = require("../models/Prize");
const PrizeClaim = require("../models/PrizeClaim");
const AuditLog = require("../models/AuditLog");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

const claimLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      code: "RATE_LIMITED",
      message: "Too many prize claim attempts. Please try again later.",
    });
  },
});

const claimSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().min(7).max(20).optional(),
  address: z.string().min(5).max(300).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  pin: z.string().min(4).max(10).optional(),
  email: z.string().email().optional(),
});

router.post("/:id/claim", claimLimiter, authenticateToken, async (req, res, next) => {
  try {
    const giveaway = await Giveaway.findOne({ giveawayId: req.params.id });

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        code: "GIVEAWAY_NOT_FOUND",
        message: "Giveaway not found.",
      });
    }

    const winner = await GiveawayWinner.findOne({
      giveawayId: giveaway.giveawayId,
      userId: req.user.userId,
      status: "SELECTED",
    });

    if (!winner) {
      return res.status(403).json({
        success: false,
        code: "CLAIM_NOT_ALLOWED",
        message: "You are not eligible to claim this prize.",
      });
    }

    const prize =
      giveaway.prizes.find((item) => item.prizeId === winner.prizeId) ||
      (await Prize.findOne({ prizeId: winner.prizeId }));

    if (!prize) {
      return res.status(404).json({
        success: false,
        code: "CLAIM_NOT_ALLOWED",
        message: "Prize details could not be found.",
      });
    }

    const now = new Date();

    let claim = await PrizeClaim.findOne({
      giveawayId: giveaway.giveawayId,
      userId: req.user.userId,
    });

    if (claim) {
      return res.status(409).json({
        success: false,
        code: "CLAIM_ALREADY_SUBMITTED",
        message: "Your claim has already been submitted.",
        data: {
          status: claim.status,
        },
      });
    }

    const details = claimSchema.parse(req.body || {});

    let requiredFields = [];

    if (prize.type === "PHYSICAL") {
      requiredFields = ["fullName", "phone", "address", "city", "state", "pin"];
    } else if (prize.type === "GIFT_CARD" || prize.type === "DIGITAL") {
      requiredFields = ["email"];
    }

    for (const field of requiredFields) {
      if (!details[field]) {
        return res.status(400).json({
          success: false,
          code: "INVALID_CLAIM",
          message: `Required claim field missing: ${field}.`,
        });
      }
    }

    const claimDeadline = giveaway.endAt
      ? new Date(new Date(giveaway.endAt).getTime() + 7 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (now > claimDeadline) {
      return res.status(400).json({
        success: false,
        code: "CLAIM_NOT_ALLOWED",
        message: "The claim period has expired.",
      });
    }

    claim = await PrizeClaim.create({
      giveawayId: giveaway.giveawayId,
      winnerId: winner._id.toString(),
      userId: req.user.userId,
      prizeId: winner.prizeId,
      status: "SUBMITTED",
      claimDeadline,
      details,
      submittedAt: now,
    });

    await AuditLog.create({
      userId: req.user.userId,
      giveawayId: giveaway.giveawayId,
      action: "CLAIM_SUBMITTED",
      status: "SUCCESS",
      metadata: {
        claimId: claim._id.toString(),
        prizeId: winner.prizeId,
        claimType: prize.claimType || prize.type,
        status: claim.status,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Prize claim submitted successfully.",
      data: {
        claimId: claim._id,
        status: claim.status,
        giveawayId: claim.giveawayId,
        prizeId: claim.prizeId,
        claimDeadline: claim.claimDeadline,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/my-claim", authenticateToken, async (req, res, next) => {
  try {
    let claim = await PrizeClaim.findOne({
      giveawayId: req.params.id,
      userId: req.user.userId,
    });

    if (
      claim &&
      ["SUBMITTED", "PROCESSING"].includes(claim.status) &&
      new Date() > claim.claimDeadline
    ) {
      claim.status = "EXPIRED";
      await claim.save();
    }

    claim = claim ? claim.toObject() : null;

    return res.json({
      success: true,
      data: claim
        ? {
            claimId: claim._id,
            giveawayId: claim.giveawayId,
            prizeId: claim.prizeId,
            status: claim.status,
            claimDeadline: claim.claimDeadline,
            details: claim.details,
            submittedAt: claim.submittedAt,
          }
        : {
            status: "NOT_SUBMITTED",
            claim: null,
          },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
