const express = require("express");
const Giveaway = require("../models/Giveaway");
const GiveawayParticipation = require("../models/GiveawayParticipation");
const GiveawayWinner = require("../models/GiveawayWinner");
const Prize = require("../models/Prize");

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

router.get("/:id/leaderboard", async (req, res, next) => {
  try {
    const period = String(req.query.period || "all").toLowerCase();
    const sort = String(req.query.sort || "entries").toLowerCase();

    const allowedPeriods = new Set(["daily", "weekly", "monthly", "all"]);
    const allowedSorts = new Set(["entries", "participants"]);

    if (!allowedPeriods.has(period) || !allowedSorts.has(sort)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_LEADERBOARD_FILTER",
        message: "Invalid leaderboard filter.",
      });
    }

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

    const participantQuery = {
      giveawayId: giveaway.giveawayId,
      status: "ACTIVE",
    };

    if (period !== "all") {
      const days = period === "daily" ? 1 : period === "weekly" ? 7 : 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      participantQuery.joinedAt = { $gte: since };
    }

    const participants = await GiveawayParticipation.find(participantQuery)
      .sort(
        sort === "participants"
          ? { joinedAt: -1, entryAmount: -1 }
          : { entryAmount: -1, joinedAt: 1 }
      )
      .lean();

    const winners = await GiveawayWinner.find({
      giveawayId: giveaway.giveawayId,
      status: "SELECTED",
    }).lean();

    const winnerMap = new Map(
      winners.map((winner) => [winner.userId, winner])
    );

    const prizeIds = [
      ...new Set([
        ...participants.map((item) => item.prizeId),
        ...winners.map((item) => item.prizeId),
      ]),
    ];

    const prizes = await Prize.find({
      prizeId: { $in: prizeIds },
    }).lean();

    const prizeMap = new Map(
      prizes.map((prize) => [prize.prizeId, prize])
    );

    const data = participants.map((participant, index) => {
      const winner = winnerMap.get(participant.userId);
      const prize = prizeMap.get(
        winner?.prizeId || participant.prizeId
      );

      return {
        position: index + 1,
        userId: maskWinnerId(participant.userId),
        entryAmount: participant.entryAmount,
        entryCurrency: participant.entryCurrency,
        joinedAt: participant.joinedAt,
        prize: prize?.name || "Giveaway Reward",
        winner: Boolean(winner),
        winningDetails: winner
          ? {
              selectedAt: winner.selectedAt,
              selectionMethod: winner.selectionMethod,
              status: winner.status,
            }
          : null,
      };
    });

    return res.json({
      success: true,
      data: {
        giveawayId: giveaway.giveawayId,
        giveawayName: giveaway.title,
        totalParticipants: data.length,
        leaderboard: data,
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
        prizeImage: prize?.image || "",
        prizeType: prize?.type || "",
        claimType: prize?.claimType || "",
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
