const mongoose = require("mongoose");

const prizeSchema = new mongoose.Schema(
  {
    prizeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    position: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    winnerCount: {
      type: Number,
      required: true,
      min: 1,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Prize", prizeSchema);
