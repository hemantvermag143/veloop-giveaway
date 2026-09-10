const express = require("express");
const { z } = require("zod");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const { randomUUID } = require("crypto");

const Giveaway = require("../models/Giveaway");
const GiveawayParticipation = require("../models/GiveawayParticipation");
const GiveawayEntryTransaction = require("../models/GiveawayEntryTransaction");
const AuditLog = require("../models/AuditLog");
const FraudEvent = require("../models/FraudEvent");
const IdempotencyKey = require("../models/IdempotencyKey");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

const joinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      code: "RATE_LIMITED",
      message: "Too many giveaway join attempts. Please try again later.",
    });
  },
});

const joinSchema = z.object({
  giveawayId: z.string().min(1),
});

router.post("/:id/join", joinLimiter, authenticateToken, async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { giveawayId } = joinSchema.parse({
      giveawayId: req.params.id,
    });

    if (req.body && Object.keys(req.body).some((key) => key !== "giveawayId")) {
      const error = new Error("Only giveawayId is accepted.");
      error.statusCode = 400;
      error.code = "INVALID_JOIN_REQUEST";
      throw error;
    }

    const userId = req.user.userId;

    const idempotencyKey =
      typeof req.headers["idempotency-key"] === "string"
        ? req.headers["idempotency-key"].trim().slice(0, 100)
        : "";

    let responseData;

    if (idempotencyKey) {
      const existingKey = await IdempotencyKey.findOne({
        key: idempotencyKey,
        userId,
        giveawayId,
      }).lean();

      if (existingKey) {
        if (existingKey.status === "COMPLETED" && existingKey.response) {
          return res.status(201).json({
            ...existingKey.response,
            idempotentReplay: true,
          });
        }

        if (existingKey.status === "PROCESSING") {
          const processingAgeMs = Date.now() - new Date(existingKey.updatedAt).getTime();
          const staleAfterMs = 10 * 60 * 1000;

          if (processingAgeMs < staleAfterMs) {
            const error = new Error(
              "This participation request is already being processed."
            );
            error.statusCode = 409;
            error.code = "IDEMPOTENCY_IN_PROGRESS";
            throw error;
          }

          await IdempotencyKey.deleteOne({
            _id: existingKey._id,
            status: "PROCESSING",
          });
        }
      }

      try {
        await IdempotencyKey.create({
          key: idempotencyKey,
          userId,
          giveawayId,
          status: "PROCESSING",
        });
      } catch (error) {
        if (error?.code === 11000) {
          const existing = await IdempotencyKey.findOne({
            key: idempotencyKey,
            userId,
            giveawayId,
          }).lean();

          if (existing?.status === "COMPLETED" && existing.response) {
            return res.status(201).json({
              ...existing.response,
              idempotentReplay: true,
            });
          }

          const idempotencyError = new Error(
            "This participation request is already being processed."
          );
          idempotencyError.statusCode = 409;
          idempotencyError.code = "IDEMPOTENCY_IN_PROGRESS";
          throw idempotencyError;
        }

        throw error;
      }
    }

    await session.withTransaction(async () => {
      const giveaway = await Giveaway.findOne({
        giveawayId,
      }).session(session);

      if (!giveaway) {
        const error = new Error("Giveaway not found.");
        error.statusCode = 404;
        error.code = "GIVEAWAY_NOT_FOUND";
        throw error;
      }

      const now = new Date();

      if (giveaway.status !== "ACTIVE") {
        const error = new Error("This giveaway is not active.");
        error.statusCode = 409;
        error.code =
          giveaway.status === "ENDED"
            ? "GIVEAWAY_ENDED"
            : "GIVEAWAY_NOT_ACTIVE";
        throw error;
      }

      if (now < giveaway.startAt) {
        const error = new Error("This giveaway has not started yet.");
        error.statusCode = 409;
        error.code = "GIVEAWAY_NOT_ACTIVE";
        throw error;
      }

      if (now >= giveaway.endAt) {
        const error = new Error("This giveaway has ended.");
        error.statusCode = 409;
        error.code = "GIVEAWAY_ENDED";
        throw error;
      }

      const prize = giveaway.prizes[0];

      if (!prize) {
        const error = new Error("No prize is configured for this giveaway.");
        error.statusCode = 409;
        error.code = "GIVEAWAY_NOT_FOUND";
        throw error;
      }

      const existingParticipation =
        await GiveawayParticipation.findOne({
          userId,
          giveawayId,
        }).session(session);

      if (existingParticipation) {
        const error = new Error("You are already participating.");
        error.statusCode = 409;
        error.code = "ALREADY_PARTICIPATING";
        error.duplicateParticipationId = existingParticipation._id.toString();
        throw error;
      }

      const user = await User.findOne({ userId }).session(session);

      if (!user || user.status !== "ACTIVE") {
        const error = new Error("Please login before participating.");
        error.statusCode = 401;
        error.code = "LOGIN_REQUIRED";
        throw error;
      }

      const currency = prize.entryCurrency;
      const amount = prize.entryAmount;
      const balanceBefore = user.balances[currency] ?? 0;


      if (balanceBefore < amount) {
        await AuditLog.create({
          userId,
          giveawayId,
          action: "JOIN_REJECTED",
          status: "FAILED",
          metadata: {
            reason: "INSUFFICIENT_BALANCE",
            prizeId: prize.prizeId,
            currency,
            amount,
            balanceBefore,
          },
        });

        const error = new Error(
          `Insufficient ${currency} balance.`
        );
        error.statusCode = 409;
        error.code = `INSUFFICIENT_${currency === "VEs" ? "VE" : currency === "SVEs" ? "SVE" : "TOKEN"}_BALANCE`;
        throw error;
      }

      const balanceAfter = balanceBefore - amount;

      user.balances[currency] = balanceAfter;
      await user.save({ session });

      const transactionId = randomUUID();

      await GiveawayEntryTransaction.create(
        [
          {
            transactionId,
            userId,
            giveawayId,
            prizeId: prize.prizeId,
            currency,
            amount,
            type: "ENTRY_FEE",
            status: "COMPLETED",
            balanceBefore,
            balanceAfter,
          },
        ],
        { session }
      );

      await GiveawayParticipation.create(
        [
          {
            userId,
            giveawayId,
            prizeId: prize.prizeId,
            entryCurrency: currency,
            entryAmount: amount,
            status: "ACTIVE",
            joinedAt: new Date(),
            transactionId,
          },
        ],
        { session }
      );

      await AuditLog.insertMany(
        [
          {
            userId,
            giveawayId,
            action: "JOIN_GIVEAWAY",
            status: "SUCCESS",
            metadata: {
              prizeId: prize.prizeId,
              currency,
              amount,
              transactionId,
            },
          },
          {
            userId,
            giveawayId,
            action: "ENTRY_FEE_DEDUCTED",
            status: "SUCCESS",
            metadata: {
              prizeId: prize.prizeId,
              currency,
              amount,
              balanceBefore,
              balanceAfter,
              transactionId,
            },
          },
        ],
        { session, ordered: true }
      );

      responseData = {
        giveawayId,
        prizeId: prize.prizeId,
        currency,
        amount,
        balanceBefore,
        balanceAfter,
        transactionId,
      };
    });

    if (idempotencyKey) {
      await IdempotencyKey.updateOne(
        {
          key: idempotencyKey,
          userId,
          giveawayId,
        },
        {
          $set: {
            status: "COMPLETED",
            response: {
              success: true,
              data: responseData,
              message: "Your giveaway participation has been recorded.",
            },
          },
        }
      );
    }

    return res.status(201).json({
      success: true,
      data: responseData,
      message: "Your giveaway participation has been recorded.",
    });
  } catch (error) {
    if (idempotencyKey) {
      try {
        await IdempotencyKey.deleteOne({
          key: idempotencyKey,
          userId,
          giveawayId,
          status: { $ne: "COMPLETED" },
        });
      } catch (idempotencyError) {
        console.error(
          "Idempotency cleanup failed:",
          idempotencyError.message
        );
      }
    }

    if (error.code === "ALREADY_PARTICIPATING") {
      try {
        const deviceHash =
          typeof req.headers["x-device-hash"] === "string"
            ? req.headers["x-device-hash"].slice(0, 200)
            : "";

        const previousDuplicateAttempts = await AuditLog.countDocuments({
          userId: req.user.userId,
          action: "DUPLICATE_ATTEMPT",
          createdAt: {
            $gte: new Date(Date.now() - 15 * 60 * 1000),
          },
        });

        await AuditLog.create({
          userId: req.user.userId,
          giveawayId: req.params.id,
          action: "DUPLICATE_ATTEMPT",
          status: "FLAGGED",
          metadata: {
            existingParticipationId:
              error.duplicateParticipationId || null,
            attemptedAt: new Date(),
            previousDuplicateAttempts,
          },
        });

        if (previousDuplicateAttempts >= 3) {
          await FraudEvent.create({
            userId: req.user.userId,
            giveawayId: req.params.id,
            deviceHash,
            riskScore: 80,
            reason: "Repeated duplicate participation attempts.",
            signals: [
              "MULTIPLE_DUPLICATE_ATTEMPTS",
              "RECENT_REPEATED_ACTIVITY",
            ],
            action: "FLAGGED",
          });
        }
      } catch (fraudError) {
        console.error(
          "Duplicate/fraud logging failed:",
          fraudError.message
        );
      }
    }

    next(error);
  } finally {
    await session.endSession();
  }
});

module.exports = router;
