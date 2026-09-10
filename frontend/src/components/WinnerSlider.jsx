import { useEffect, useState } from "react";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";

function maskWinnerId(userId = "") {
  if (!userId) return "Winner";
  if (userId.length <= 4) return "****";
  return `${userId.slice(0, 2)}****${userId.slice(-2)}`;
}

function WinnerSlider({ currentGiveaway, winners = [] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setCurrent(0);
  }, [currentGiveaway?.giveawayId, winners.length]);

  useEffect(() => {
    if (paused || winners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % winners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [paused, winners.length]);

  const previous = () => {
    setCurrent(
      (prev) => (prev - 1 + winners.length) % winners.length
    );
  };

  const next = () => {
    setCurrent((prev) => (prev + 1) % winners.length);
  };

  const hasWinners = winners.length > 0;
  const currentWinner = hasWinners ? winners[current] : null;

  return (
    <section
      className="winner-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Winner announcements"
    >
      <div className="winner-slider-main">
        <div className="winner-slider-icon">
          <Trophy size={22} />
        </div>

        <div className="winner-slider-content">
          <span>WINNER ANNOUNCEMENT</span>

          {currentWinner ? (
            <strong>
              {maskWinnerId(currentWinner.userId)} won{" "}
              {currentWinner.prize}
            </strong>
          ) : (
            <strong>
              {currentGiveaway?.status === "ENDED"
                ? "Winner selection is being finalized."
                : "Winners will be announced after the giveaway ends."}
            </strong>
          )}
        </div>
      </div>

      {winners.length > 1 && (
        <div className="winner-slider-controls">
          <button
            type="button"
            onClick={previous}
            aria-label="Previous winner"
          >
            <ChevronLeft size={18} />
          </button>

          <span aria-live="polite">
            {current + 1} / {winners.length}
          </span>

          <button
            type="button"
            onClick={next}
            aria-label="Next winner"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}

export default WinnerSlider;
