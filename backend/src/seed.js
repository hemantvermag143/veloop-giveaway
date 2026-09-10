const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Giveaway = require("./models/Giveaway");

dotenv.config();

const giveaways = [
  {
    giveawayId: "GW-IP15",
    title: "Win an iPhone 15 Pro",
    slug: "iphone-15-pro",
    description: "Enter for a chance to win the premium iPhone 15 Pro.",
    status: "ACTIVE",
    startAt: new Date("2026-09-01T10:00:00+05:30"),
    endAt: new Date("2026-09-16T18:00:00+05:30"),
    rules: [
      "One participation per user.",
      "Eligible VELOOP users only.",
      "Winner is selected after the giveaway ends.",
    ],
    eligibility: [
      "Authenticated VELOOP user",
      "Sufficient VEs balance",
    ],
    prizes: [
      {
        prizeId: "PRIZE-IP15",
        name: "iPhone 15 Pro",
        image: "/prizes/iphone-15-pro.png",
        type: "PHYSICAL",
        claimType: "PHYSICAL_FORM",
        winnerCount: 1,
        entryCurrency: "VEs",
        entryAmount: 250,
      },
    ],
    participationSettings: {
      oneParticipationPerUser: true,
      allowReentry: false,
    },
  },
  {
    giveawayId: "GW-WATCH",
    title: "Win an Apple Watch",
    slug: "apple-watch",
    description: "Get a chance to win an Apple Watch.",
    status: "ACTIVE",
    startAt: new Date("2026-09-01T10:00:00+05:30"),
    endAt: new Date("2026-09-16T18:00:00+05:30"),
    rules: [
      "One participation per user.",
      "Eligible VELOOP users only.",
    ],
    eligibility: [
      "Authenticated VELOOP user",
      "Sufficient VEs balance",
    ],
    prizes: [
      {
        prizeId: "PRIZE-WATCH",
        name: "Apple Watch",
        image: "/prizes/apple-watch.png",
        type: "PHYSICAL",
        claimType: "PHYSICAL_FORM",
        winnerCount: 3,
        entryCurrency: "VEs",
        entryAmount: 200,
      },
    ],
    participationSettings: {
      oneParticipationPerUser: true,
      allowReentry: false,
    },
  },
  {
    giveawayId: "GW-AIRPODS",
    title: "Win AirPods Pro",
    slug: "airpods",
    description: "Enter to win premium AirPods Pro.",
    status: "ACTIVE",
    startAt: new Date("2026-09-01T10:00:00+05:30"),
    endAt: new Date("2026-09-16T18:00:00+05:30"),
    rules: [
      "One participation per user.",
      "Eligible VELOOP users only.",
    ],
    eligibility: [
      "Authenticated VELOOP user",
      "Sufficient SVEs balance",
    ],
    prizes: [
      {
        prizeId: "PRIZE-AIRPODS",
        name: "AirPods Pro",
        image: "/prizes/airpods-pro.png",
        type: "PHYSICAL",
        claimType: "PHYSICAL_FORM",
        winnerCount: 5,
        entryCurrency: "SVEs",
        entryAmount: 500,
      },
    ],
    participationSettings: {
      oneParticipationPerUser: true,
      allowReentry: false,
    },
  },
  {
    giveawayId: "GW-AMZ2000",
    title: "₹2,000 Amazon Voucher",
    slug: "amazon-2000",
    description: "Win an Amazon shopping voucher worth ₹2,000.",
    status: "ACTIVE",
    startAt: new Date("2026-09-01T10:00:00+05:30"),
    endAt: new Date("2026-09-16T18:00:00+05:30"),
    rules: [
      "One participation per user.",
      "Eligible VELOOP users only.",
    ],
    eligibility: [
      "Authenticated VELOOP user",
      "Sufficient VEs balance",
    ],
    prizes: [
      {
        prizeId: "PRIZE-AMZ2000",
        name: "₹2,000 Amazon Voucher",
        image: "/prizes/amazon-2000.png",
        type: "GIFT_CARD",
        claimType: "EMAIL",
        winnerCount: 10,
        entryCurrency: "VEs",
        entryAmount: 500,
      },
    ],
    participationSettings: {
      oneParticipationPerUser: true,
      allowReentry: false,
    },
  },
  {
    giveawayId: "GW-AMZ500",
    title: "₹500 Amazon Voucher",
    slug: "amazon-500",
    description: "Enter for a chance to win a ₹500 Amazon voucher.",
    status: "UPCOMING",
    startAt: new Date("2026-09-18T10:00:00+05:30"),
    endAt: new Date("2026-09-30T18:00:00+05:30"),
    rules: [
      "One participation per user.",
    ],
    eligibility: [
      "Authenticated VELOOP user",
      "Sufficient VEs balance",
    ],
    prizes: [
      {
        prizeId: "PRIZE-AMZ500",
        name: "₹500 Amazon Voucher",
        image: "/prizes/amazon-500.png",
        type: "GIFT_CARD",
        winnerCount: 10,
        entryCurrency: "VEs",
        entryAmount: 300,
      },
    ],
    participationSettings: {
      oneParticipationPerUser: true,
      allowReentry: false,
    },
  },
  {
    giveawayId: "GW-AMZ20",
    title: "₹20 Amazon Voucher",
    slug: "amazon-20",
    description: "A small reward with a simple entry.",
    status: "ENDED",
    startAt: new Date("2026-08-01T10:00:00+05:30"),
    endAt: new Date("2026-08-31T18:00:00+05:30"),
    rules: [
      "One participation per user.",
    ],
    eligibility: [
      "Authenticated VELOOP user",
      "Sufficient Tokens balance",
    ],
    prizes: [
      {
        prizeId: "PRIZE-AMZ20",
        name: "₹20 Amazon Voucher",
        image: "/prizes/amazon-20.png",
        type: "GIFT_CARD",
        winnerCount: 10,
        entryCurrency: "Tokens",
        entryAmount: 2000,
      },
    ],
    participationSettings: {
      oneParticipationPerUser: true,
      allowReentry: false,
    },
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Giveaway.deleteMany({});
    await Giveaway.insertMany(giveaways);

    console.log(`${giveaways.length} giveaways seeded successfully`);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
