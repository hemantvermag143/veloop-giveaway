const mongoose = require("mongoose");

const giveawaySchema = new mongoose.Schema(
  {
    giveawayId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["UPCOMING", "ACTIVE", "ENDED", "ARCHIVED"],
      required: true,
      default: "UPCOMING",
    },

    startAt: {
      type: Date,
      required: true,
    },

    endAt: {
      type: Date,
      required: true,
    },

    rules: {
      type: [String],
      default: [],
    },

    eligibility: {
      type: [String],
      default: [],
    },

    prizes: {
      type: [
        {
          prizeId: {
            type: String,
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          image: {
            type: String,
            default: "",
          },
          type: {
            type: String,
            enum: ["PHYSICAL", "GIFT_CARD", "DIGITAL"],
            required: true,
          },
          claimType: {
            type: String,
            enum: ["PHYSICAL_FORM", "EMAIL", "DIGITAL_DELIVERY"],
            required: true,
          },
          winnerCount: {
            type: Number,
            required: true,
            min: 1,
          },
          entryCurrency: {
            type: String,
            required: true,
          },
          entryAmount: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      default: [],
    },

    participationSettings: {
      oneParticipationPerUser: {
        type: Boolean,
        default: true,
      },
      allowReentry: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Giveaway", giveawaySchema);
