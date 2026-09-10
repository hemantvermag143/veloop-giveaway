const express = require("express");
const GiveawayParticipation = require("../models/GiveawayParticipation");
const GiveawayEntryTransaction = require("../models/GiveawayEntryTransaction");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();


router.get("/my-transactions", authenticateToken, async (req, res, next) => {
  try {
    const transactions = await GiveawayEntryTransaction.find({
      userId: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/my-status", authenticateToken, async (req, res, next) => {
  try {
    const participation = await GiveawayParticipation.findOne({
      giveawayId: req.params.id,
      userId: req.user.userId,
    }).lean();

    return res.json({
      success: true,
      data: {
        participating: Boolean(participation),
        participation: participation || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
