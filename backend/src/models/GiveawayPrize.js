const mongoose = require("mongoose");

const giveawayPrizeSchema = new mongoose.Schema(
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
    position: {
      type: Number,
      required: true,
      min: 1,
    },
    winnerCount: {
      type: Number,
      required: true,
      min: 1,
    },
    entryCurrency: {
      type: String,
      required: true,
      enum: ["VEs", "SVEs", "Tokens"],
    },
    entryAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

giveawayPrizeSchema.index(
  { giveawayId: 1, prizeId: 1 },
  { unique: true }
);

module.exports = mongoose.model("GiveawayPrize", giveawayPrizeSchema);
