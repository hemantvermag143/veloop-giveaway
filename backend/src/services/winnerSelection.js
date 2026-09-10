const mongoose = require("mongoose");
const Giveaway = require("../models/Giveaway");
const GiveawayParticipation = require("../models/GiveawayParticipation");
const GiveawayWinner = require("../models/GiveawayWinner");
const AuditLog = require("../models/AuditLog");

async function selectGiveawayWinners(giveawayId) {
  const session = await mongoose.startSession();

  try {
    let selectedWinners = [];

    await session.withTransaction(async () => {
      const giveaway = await Giveaway.findOne({ giveawayId }).session(session);

      if (!giveaway) {
        const error = new Error("Giveaway not found.");
        error.statusCode = 404;
        error.code = "GIVEAWAY_NOT_FOUND";
        throw error;
      }

      if (giveaway.status !== "ENDED") {
        const error = new Error(
          "Winners can only be selected after the giveaway ends."
        );
        error.statusCode = 409;
        error.code = "GIVEAWAY_NOT_ENDED";
        throw error;
      }

      const prize = giveaway.prizes?.[0];

      if (!prize) {
        const error = new Error("No prize is configured for this giveaway.");
        error.statusCode = 409;
        error.code = "GIVEAWAY_NOT_FOUND";
        throw error;
      }

      const existingWinners = await GiveawayWinner.find({
        giveawayId: giveaway.giveawayId,
        prizeId: prize.prizeId,
        status: "SELECTED",
      })
        .session(session)
        .lean();

      if (existingWinners.length >= prize.winnerCount) {
        return;
      }

      const remainingSlots = prize.winnerCount - existingWinners.length;
      const excludedUserIds = existingWinners.map((winner) => winner.userId);

      const participants = await GiveawayParticipation.find({
        giveawayId: giveaway.giveawayId,
        prizeId: prize.prizeId,
        status: "ACTIVE",
        userId: { $nin: excludedUserIds },
      })
        .session(session)
        .lean();

      if (!participants.length) {
        const error = new Error(
          "No eligible participants are available for winner selection."
        );
        error.statusCode = 409;
        error.code = "NO_ELIGIBLE_WINNERS";
        throw error;
      }

      const shuffled = [...participants];

      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const winnersToCreate = shuffled
        .slice(0, remainingSlots)
        .map((participant) => ({
          giveawayId: giveaway.giveawayId,
          prizeId: prize.prizeId,
          userId: participant.userId,
          selectionMethod: "RANDOM",
          selectedAt: new Date(),
          status: "SELECTED",
        }));

      if (!winnersToCreate.length) {
        const error = new Error("Winner selection could not be completed.");
        error.statusCode = 409;
        error.code = "NO_ELIGIBLE_WINNERS";
        throw error;
      }

      await GiveawayWinner.insertMany(winnersToCreate, {
        session,
        ordered: true,
      });

      await AuditLog.insertMany(
        winnersToCreate.map((winner) => ({
          userId: winner.userId,
          giveawayId: giveaway.giveawayId,
          action: "WINNER_SELECTED",
          status: "SUCCESS",
          metadata: {
            prizeId: winner.prizeId,
            selectionMethod: winner.selectionMethod,
            selectedAt: winner.selectedAt,
          },
        })),
        { session, ordered: true }
      );

      selectedWinners = winnersToCreate;
    });

    return selectedWinners;
  } finally {
    await session.endSession();
  }
}

module.exports = {
  selectGiveawayWinners,
};
