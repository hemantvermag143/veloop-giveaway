const mongoose = require("mongoose");

const fraudEventSchema = new mongoose.Schema(
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

    deviceHash: {
      type: String,
      default: "",
    },

    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    signals: {
      type: [String],
      default: [],
    },

    action: {
      type: String,
      enum: ["FLAGGED", "BLOCKED", "ALLOWED"],
      required: true,
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

module.exports = mongoose.model("FraudEvent", fraudEventSchema);
