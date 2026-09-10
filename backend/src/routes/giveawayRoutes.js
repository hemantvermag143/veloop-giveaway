const express = require("express");
const Giveaway = require("../models/Giveaway");
const GiveawayParticipation = require("../models/GiveawayParticipation");

const router = express.Router();

function maskWinnerId(userId = "") {
  if (!userId) return "Winner";
  if (userId.length <= 4) return "****";
  return `${userId.slice(0, 2)}****${userId.slice(-2)}`;
}

router.get("/", async (req, res, next) => {
  try {
    const giveaways = await Giveaway.find({})
      .sort({ startAt: -1 })
      .lean();

    const counts = await GiveawayParticipation.aggregate([
      { $match: { status: "ACTIVE" } },
      { $group: { _id: "$giveawayId", participants: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      counts.map((item) => [item._id, item.participants])
    );

    const data = giveaways.map((giveaway) => ({
      ...giveaway,
      participantCount: countMap.get(giveaway.giveawayId) || 0,
    }));

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/current", async (req, res, next) => {
  try {
    const giveaway = await Giveaway.findOne({ status: "ACTIVE" })
      .sort({ startAt: -1 })
      .lean();

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        code: "GIVEAWAY_NOT_FOUND",
        message: "No active giveaway is available.",
      });
    }

    const participantCount = await GiveawayParticipation.countDocuments({
      giveawayId: giveaway.giveawayId,
      status: "ACTIVE",
    });

    return res.json({
      success: true,
      data: {
        ...giveaway,
        participantCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/previous/winners", async (req, res, next) => {
  try {
    const giveaways = await Giveaway.find({
      status: { $in: ["ENDED", "ARCHIVED"] },
    })
      .sort({ endAt: -1 })
      .lean();

    const GiveawayWinner = require("../models/GiveawayWinner");
    const Prize = require("../models/Prize");

    const winnerRecords = await GiveawayWinner.find({
      giveawayId: { $in: giveaways.map((giveaway) => giveaway.giveawayId) },
      status: "SELECTED",
    })
      .sort({ selectedAt: -1 })
      .lean();

    const giveawayMap = new Map(
      giveaways.map((giveaway) => [giveaway.giveawayId, giveaway])
    );

    const prizes = await Prize.find({
      prizeId: { $in: winnerRecords.map((winner) => winner.prizeId) },
    }).lean();

    const prizeMap = new Map(
      prizes.map((prize) => [prize.prizeId, prize])
    );

    const data = winnerRecords.map((winner) => {
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

router.get("/previous", async (req, res, next) => {
  try {
    const giveaways = await Giveaway.find({
      status: { $in: ["ENDED", "ARCHIVED"] },
    })
      .sort({ endAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: giveaways,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/slug/:slug", async (req, res, next) => {
  try {
    const giveaway = await Giveaway.findOne({
      slug: req.params.slug,
    }).lean();

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        code: "GIVEAWAY_NOT_FOUND",
        message: "Giveaway not found.",
      });
    }

    const participantCount = await GiveawayParticipation.countDocuments({
      giveawayId: giveaway.giveawayId,
      status: "ACTIVE",
    });

    return res.json({
      success: true,
      data: {
        ...giveaway,
        participantCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const giveaway = await Giveaway.findOne({
      giveawayId: req.params.id,
    }).lean();

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        code: "GIVEAWAY_NOT_FOUND",
        message: "Giveaway not found.",
      });
    }

    const participantCount = await GiveawayParticipation.countDocuments({
      giveawayId: giveaway.giveawayId,
      status: "ACTIVE",
    });

    return res.json({
      success: true,
      data: {
        ...giveaway,
        participantCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
