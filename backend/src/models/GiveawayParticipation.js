const mongoose = require("mongoose");

const giveawayParticipationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    giveawayId: {
      type: String,
      required: true,
      index: true,
    },

    prizeId: {
      type: String,
      required: true,
    },

    entryCurrency: {
      type: String,
      enum: ["VEs", "SVEs", "Tokens"],
      required: true,
    },

    entryAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    deviceHash: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "FLAGGED", "BLOCKED", "CANCELLED"],
      default: "ACTIVE",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    transactionId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

giveawayParticipationSchema.index(
  { userId: 1, giveawayId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "GiveawayParticipation",
  giveawayParticipationSchema
);
