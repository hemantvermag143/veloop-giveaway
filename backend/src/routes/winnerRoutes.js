const express = require("express");
const GiveawayWinner = require("../models/GiveawayWinner");
const Giveaway = require("../models/Giveaway");
const Prize = require("../models/Prize");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

function maskWinnerId(userId = "") {
  if (!userId) return "Winner";
  if (userId.length <= 4) return "****";
  return `${userId.slice(0, 2)}****${userId.slice(-2)}`;
}

router.get("/previous/winners", async (req, res, next) => {
  try {
    const giveaways = await Giveaway.find({
      status: { $in: ["ENDED", "ARCHIVED"] },
    })
      .sort({ endAt: -1 })
      .lean();

    const giveawayIds = giveaways.map((giveaway) => giveaway.giveawayId);

    if (!giveawayIds.length) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const winners = await GiveawayWinner.find({
      giveawayId: { $in: giveawayIds },
      status: "SELECTED",
    })
      .sort({ selectedAt: -1 })
      .lean();

    const prizeIds = [...new Set(winners.map((winner) => winner.prizeId))];

    const prizes = await Prize.find({
      prizeId: { $in: prizeIds },
    }).lean();

    const giveawayMap = new Map(
      giveaways.map((giveaway) => [giveaway.giveawayId, giveaway])
    );

    const prizeMap = new Map(
      prizes.map((prize) => [prize.prizeId, prize])
    );

    const data = winners.map((winner) => {
      const giveaway = giveawayMap.get(winner.giveawayId);
      const prize = prizeMap.get(winner.prizeId);

      return {
        giveawayId: winner.giveawayId,
        giveawayName: giveaway?.title || "VELOOP Giveaway",
        prizeId: winner.prizeId,
        prize: prize?.name || "Prize",
        userId: maskWinnerId(winner.userId),
        selectedAt: winner.selectedAt,
        status: winner.status,
      };
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/winners", async (req, res, next) => {
  try {
    const giveaway = await Giveaway.findOne({ giveawayId: req.params.id });

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        code: "GIVEAWAY_NOT_FOUND",
        message: "Giveaway not found.",
      });
    }

    if (giveaway.status === "ACTIVE") {
      return res.json({
        success: true,
        data: [],
        message: "Winners will be announced after the giveaway ends.",
      });
    }

    const winners = await GiveawayWinner.find({
      giveawayId: giveaway.giveawayId,
      status: "SELECTED",
    })
      .sort({ selectedAt: 1 })
      .lean();

    const safeWinners = winners.map((winner) => ({
      giveawayId: winner.giveawayId,
      prizeId: winner.prizeId,
      userId: maskWinnerId(winner.userId),
      selectionMethod: winner.selectionMethod,
      selectedAt: winner.selectedAt,
      status: winner.status,
    }));

    return res.json({
      success: true,
      data: safeWinners,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/my-winner-status", authenticateToken, async (req, res, next) => {
  try {
    const winner = await GiveawayWinner.findOne({
      giveawayId: req.params.id,
      userId: req.user.userId,
      status: "SELECTED",
    }).lean();

    return res.json({
      success: true,
      data: {
        isWinner: Boolean(winner),
        winner: winner
          ? {
              giveawayId: winner.giveawayId,
              prizeId: winner.prizeId,
              userId: winner.userId,
              status: winner.status,
              selectedAt: winner.selectedAt,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
