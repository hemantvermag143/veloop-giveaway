const mongoose = require("mongoose");

const giveawayEntryTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

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

    currency: {
      type: String,
      enum: ["VEs", "SVEs", "Tokens"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      enum: ["ENTRY_FEE", "REVERSAL"],
      required: true,
      default: "ENTRY_FEE",
    },

    originalTransactionId: {
      type: String,
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
      required: true,
      default: "PENDING",
    },

    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "GiveawayEntryTransaction",
  giveawayEntryTransactionSchema
);
