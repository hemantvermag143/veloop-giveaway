const mongoose = require("mongoose");

const idempotencyKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
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

    status: {
      type: String,
      enum: ["PROCESSING", "COMPLETED", "FAILED"],
      default: "PROCESSING",
    },

    response: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

idempotencyKeySchema.index(
  { key: 1, userId: 1, giveawayId: 1 },
  { unique: true }
);

module.exports = mongoose.model("IdempotencyKey", idempotencyKeySchema);
