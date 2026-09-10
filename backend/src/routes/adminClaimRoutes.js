const express = require("express");
const mongoose = require("mongoose");
const PrizeClaim = require("../models/PrizeClaim");
const AuditLog = require("../models/AuditLog");
const { authenticateToken } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/claims", authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const claims = await PrizeClaim.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: claims,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/claims/:id/process",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const claim = await PrizeClaim.findById(req.params.id);

      if (!claim) {
        return res.status(404).json({
          success: false,
          code: "CLAIM_NOT_FOUND",
          message: "Claim not found.",
        });
      }

      if (claim.status !== "SUBMITTED") {
        return res.status(409).json({
          success: false,
          code: "INVALID_CLAIM_STATE",
          message: "Only submitted claims can be moved to processing.",
        });
      }

      const now = new Date();

      if (now > claim.claimDeadline) {
        claim.status = "EXPIRED";
        await claim.save();

        return res.status(409).json({
          success: false,
          code: "CLAIM_EXPIRED",
          message: "The claim deadline has expired.",
        });
      }

      claim.status = "PROCESSING";
      claim.processedAt = now;
      await claim.save();

      await AuditLog.create({
        userId: claim.userId,
        giveawayId: claim.giveawayId,
        action: "CLAIM_PROCESSING",
        status: "SUCCESS",
        metadata: {
          claimId: claim._id.toString(),
          transition: "SUBMITTED_TO_PROCESSING",
          processedAt: now,
        },
      });

      return res.json({
        success: true,
        message: "Claim moved to processing.",
        data: {
          claimId: claim._id,
          status: claim.status,
          processedAt: claim.processedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/claims/:id/complete",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const claim = await PrizeClaim.findById(req.params.id);

      if (!claim) {
        return res.status(404).json({
          success: false,
          code: "CLAIM_NOT_FOUND",
          message: "Claim not found.",
        });
      }

      if (claim.status !== "PROCESSING") {
        return res.status(409).json({
          success: false,
          code: "INVALID_CLAIM_STATE",
          message: "Only processing claims can be completed.",
        });
      }

      const now = new Date();

      claim.status = "COMPLETED";
      claim.completedAt = now;
      await claim.save();

      await AuditLog.create({
        userId: claim.userId,
        giveawayId: claim.giveawayId,
        action: "CLAIM_COMPLETED",
        status: "SUCCESS",
        metadata: {
          claimId: claim._id.toString(),
          transition: "PROCESSING_TO_COMPLETED",
          completedAt: now,
        },
      });

      return res.json({
        success: true,
        message: "Claim completed successfully.",
        data: {
          claimId: claim._id,
          status: claim.status,
          completedAt: claim.completedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
