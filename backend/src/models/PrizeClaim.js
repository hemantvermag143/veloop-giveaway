const mongoose = require("mongoose");

const prizeClaimSchema = new mongoose.Schema(
  {
    giveawayId: {
      type: String,
      required: true,
      index: true,
    },

    winnerId: {
      type: String,
      required: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    prizeId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "NOT_SUBMITTED",
        "SUBMITTED",
        "PROCESSING",
        "COMPLETED",
        "EXPIRED",
      ],
      default: "NOT_SUBMITTED",
    },

    claimDeadline: {
      type: Date,
      required: true,
    },

    details: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pin: String,
      email: String,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

prizeClaimSchema.index(
  { giveawayId: 1, userId: 1 },
  { unique: true }
);

module.exports = mongoose.model("PrizeClaim", prizeClaimSchema);
