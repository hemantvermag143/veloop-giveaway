const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: null,
      index: true,
    },

    giveawayId: {
      type: String,
      default: null,
      index: true,
    },

    action: {
      type: String,
      enum: [
        "JOIN_GIVEAWAY",
        "ENTRY_FEE_DEDUCTED",
        "JOIN_REJECTED",
        "DUPLICATE_ATTEMPT",
        "FRAUD_FLAGGED",
        "CLAIM_SUBMITTED",
        "CLAIM_PROCESSING",
        "CLAIM_COMPLETED",
        "WINNER_SELECTED",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "FLAGGED"],
      required: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

module.exports = mongoose.model("AuditLog", auditLogSchema);
