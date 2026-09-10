const mongoose = require("mongoose");

const giveawayWinnerSchema = new mongoose.Schema(
  {
    giveawayId: {
      type: String,
      required: true,
      index: true,
    },

    prizeId: {
      type: String,
      required: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    selectionMethod: {
      type: String,
      enum: ["RANDOM", "MANUAL"],
      default: "RANDOM",
    },

    selectedAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["SELECTED", "DISQUALIFIED", "REPLACED"],
      default: "SELECTED",
    },
  },
  {
    timestamps: true,
  }
);

giveawayWinnerSchema.index(
  { giveawayId: 1, prizeId: 1, userId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "GiveawayWinner",
  giveawayWinnerSchema
);
