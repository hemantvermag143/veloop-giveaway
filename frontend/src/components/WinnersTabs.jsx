import { useState } from "react";
import { Trophy, CalendarDays, ShieldCheck } from "lucide-react";

function maskWinnerId(userId = "") {
  if (!userId) return "Winner";
  if (userId.length <= 4) return "****";
  return `${userId.slice(0, 2)}****${userId.slice(-2)}`;
}

function WinnersTabs({
  currentGiveaway,
  currentWinners = [],
  previousWinners = [],
}) {
  const [activeTab, setActiveTab] = useState("winners");

  const items =
    activeTab === "winners" ? currentWinners : previousWinners;

  const isCurrentEnded = currentGiveaway?.status === "ENDED";

  return (
    <section className="winners-section" id="winners">
      <div className="section-heading">
        <span className="section-eyebrow">WINNER STORIES</span>
        <h2>Winners</h2>
        <p>See giveaway winners and completed-event history.</p>
      </div>

      <div
        className="winner-tabs"
        role="tablist"
        aria-label="Winner lists"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "winners"}
          className={activeTab === "winners" ? "active" : ""}
          onClick={() => setActiveTab("winners")}
        >
          <Trophy size={17} />
          Winners
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "previous"}
          className={activeTab === "previous" ? "active" : ""}
          onClick={() => setActiveTab("previous")}
        >
          <CalendarDays size={17} />
          Previous Winners
        </button>
      </div>

      <div className="winner-list" role="tabpanel">
        {items.length === 0 ? (
          <div className="winner-empty">
            <ShieldCheck size={24} />
            <strong>
              {activeTab === "winners"
                ? isCurrentEnded
                  ? "Winner information is being prepared."
                  : "No winners announced yet."
                : "No previous winners available."}
            </strong>
            <span>
              {activeTab === "winners"
                ? isCurrentEnded
                  ? "Winner information will appear once selection is complete."
                  : "Winner information will appear after the giveaway ends."
                : "Completed giveaway winner information will appear here."}
            </span>
          </div>
        ) : (
          items.map((winner, index) => (
            <article
              className="winner-card"
              key={`${winner.giveawayId}-${winner.userId}-${index}`}
            >
              <div className="winner-card-icon">
                <Trophy size={19} />
              </div>

              <div className="winner-card-content">
                <strong>{maskWinnerId(winner.userId)}</strong>
                <span>{winner.prize}</span>

                {activeTab === "previous" &&
                  winner.giveawayName &&
                  winner.giveawayName !== winner.prize && (
                    <small>{winner.giveawayName}</small>
                  )}
              </div>

              {winner.selectedAt && (
                <time dateTime={winner.selectedAt}>
                  {new Date(winner.selectedAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </time>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default WinnersTabs;
