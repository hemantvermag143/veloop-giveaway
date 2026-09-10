const Giveaway = require("../models/Giveaway");
const { selectGiveawayWinners } = require("./winnerSelection");

async function syncGiveawayLifecycle() {
  const now = new Date();

  const upcomingResult = await Giveaway.updateMany(
    {
      status: "UPCOMING",
      startAt: { $lte: now },
      endAt: { $gt: now },
    },
    {
      $set: { status: "ACTIVE" },
    }
  );

  const endedResult = await Giveaway.updateMany(
    {
      status: "ACTIVE",
      endAt: { $lte: now },
    },
    {
      $set: { status: "ENDED" },
    }
  );

  const endedGiveaways = await Giveaway.find({
    status: "ENDED",
    endAt: { $lte: now },
  })
    .select("giveawayId")
    .lean();

  let winnersSelected = 0;

  for (const giveaway of endedGiveaways) {
    try {
      const selected = await selectGiveawayWinners(giveaway.giveawayId);
      winnersSelected += selected.length;

      if (selected.length) {
        console.log(
          `Winners automatically selected for ${giveaway.giveawayId}: ${selected.length}`
        );
      }
    } catch (error) {
      if (error.code !== "NO_ELIGIBLE_WINNERS") {
        console.error(
          `Automatic winner selection failed for ${giveaway.giveawayId}:`,
          error.message
        );
      }
    }
  }

  return {
    activated: upcomingResult.modifiedCount,
    ended: endedResult.modifiedCount,
    winnersSelected,
  };
}

function startGiveawayLifecycleScheduler(intervalMs = 60 * 1000) {
  const run = async () => {
    try {
      const result = await syncGiveawayLifecycle();

      if (
        result.activated ||
        result.ended ||
        result.winnersSelected
      ) {
        console.log(
          `Giveaway lifecycle synced: ${result.activated} activated, ${result.ended} ended, ${result.winnersSelected} winners selected`
        );
      }
    } catch (error) {
      console.error("Giveaway lifecycle sync failed:", error.message);
    }
  };

  run();
  return setInterval(run, intervalMs);
}

module.exports = {
  syncGiveawayLifecycle,
  startGiveawayLifecycleScheduler,
};
