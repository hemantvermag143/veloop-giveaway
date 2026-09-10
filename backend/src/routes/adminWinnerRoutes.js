const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");
const { selectGiveawayWinners } = require("../services/winnerSelection");

const router = express.Router();

router.post(
  "/:id/select-winners",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const selectedWinners = await selectGiveawayWinners(req.params.id);

      return res.status(200).json({
        success: true,
        message: selectedWinners.length
          ? "Winners selected successfully."
          : "Winner count is already complete.",
        data: selectedWinners,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
