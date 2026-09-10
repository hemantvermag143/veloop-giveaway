const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const giveawayRoutes = require("./routes/giveawayRoutes");
const authRoutes = require("./routes/authRoutes");
const participationRoutes = require("./routes/participationRoutes");
const joinRoutes = require("./routes/joinRoutes");
const winnerRoutes = require("./routes/winnerRoutes");
const claimRoutes = require("./routes/claimRoutes");
const adminWinnerRoutes = require("./routes/adminWinnerRoutes");
const adminClaimRoutes = require("./routes/adminClaimRoutes");
const { startGiveawayLifecycleScheduler } = require("./services/giveawayLifecycle");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:5174",
      "http://172.25.189.99:5174",
      "http://172.25.189.99:5173",
      "http://172.25.189.99:4173",
    ],
  })
);

app.use(express.json({ limit: "10kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.use("/api/giveaways", participationRoutes);
app.use("/api/giveaways", giveawayRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/giveaways", joinRoutes);
app.use("/api/giveaways", winnerRoutes);
app.use("/api/giveaways", claimRoutes);
app.use("/api/admin/giveaways", adminWinnerRoutes);
app.use("/api/admin", adminClaimRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "VELOOP Giveaway API is running",
  });
});

app.use(errorHandler);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    startGiveawayLifecycleScheduler();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
