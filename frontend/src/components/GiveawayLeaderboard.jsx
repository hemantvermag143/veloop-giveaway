import { useEffect, useMemo, useState } from "react";
import { Crown, Medal, Trophy, Clock3, Gift, Users, ChevronRight } from "lucide-react";
import { getGiveawayLeaderboard } from "../services/api";

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function LeaderRank({ position }) {
  if (position === 1) {
    return (
      <div className="leaderboard-rank leaderboard-rank-gold">
        <Crown size={18} strokeWidth={2.2} />
        <span>1</span>
      </div>
    );
  }

  if (position === 2) {
    return (
      <div className="leaderboard-rank leaderboard-rank-silver">
        <Medal size={18} strokeWidth={2.2} />
        <span>2</span>
      </div>
    );
  }

  if (position === 3) {
    return (
      <div className="leaderboard-rank leaderboard-rank-bronze">
        <Trophy size={18} strokeWidth={2.2} />
        <span>3</span>
      </div>
    );
  }

  return (
    <div className="leaderboard-rank">
      <span>#{position}</span>
    </div>
  );
}

export default function GiveawayLeaderboard({ currentGiveaway }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    if (!currentGiveaway?.giveawayId) {
      setLeaderboard([]);
      setMeta(null);
      return undefined;
    }

    setLoading(true);
    setError("");

    getGiveawayLeaderboard(currentGiveaway.giveawayId)
      .then((response) => {
        if (!mounted) return;
        setLeaderboard(response.data?.leaderboard || []);
        setMeta(response.data || null);
      })
      .catch(() => {
        if (!mounted) return;
        setLeaderboard([]);
        setMeta(null);
        setError("Leaderboard is temporarily unavailable.");
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [currentGiveaway?.giveawayId]);

  const topThree = useMemo(
    () => leaderboard.filter((entry) => entry.position <= 3),
    [leaderboard]
  );

  if (!currentGiveaway) {
    return null;
  }

  return (
    <section className="leaderboard-section" id="leaderboard">
      <div className="leaderboard-shell">
        <div className="leaderboard-heading">
          <div className="leaderboard-heading-copy">
            <span className="section-eyebrow">GIVEAWAY LEADERBOARD</span>
            <h2>See who&apos;s leading the reward race</h2>
            <p>
              Track recorded participation positions in{" "}
              <strong>{meta?.giveawayName || currentGiveaway.name}</strong>.
              Winner selection is announced after the giveaway ends.
            </p>
          </div>

          <div className="leaderboard-live-pill">
            <span className="leaderboard-live-dot" />
            Live rankings
          </div>
        </div>

        {loading && (
          <div className="leaderboard-state">
            <div className="leaderboard-spinner" />
            <span>Loading live rankings...</span>
          </div>
        )}

        {!loading && error && (
          <div className="leaderboard-state leaderboard-state-error">
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && leaderboard.length === 0 && (
          <div className="leaderboard-state leaderboard-empty">
            <Users size={22} />
            <div>
              <strong>No participants yet</strong>
              <span>Be the first to join this giveaway.</span>
            </div>
          </div>
        )}

        {!loading && !error && leaderboard.length > 0 && (
          <>
            <div className="leaderboard-summary">
              <div className="leaderboard-summary-card">
                <Users size={18} />
                <div>
                  <span>Total participants</span>
                  <strong>{meta?.totalParticipants ?? leaderboard.length}</strong>
                </div>
              </div>

              <div className="leaderboard-summary-card">
                <Gift size={18} />
                <div>
                  <span>Reward</span>
                  <strong>{currentGiveaway.prizes?.[0]?.name || leaderboard[0]?.prize || "Reward"}</strong>
                </div>
              </div>

              <div className="leaderboard-summary-card">
                <Clock3 size={18} />
                <div>
                  <span>Status</span>
                  <strong>
                    {currentGiveaway.status === "ENDED"
                      ? "Winner announced"
                      : "Entries open"}
                  </strong>
                </div>
              </div>
            </div>

            {topThree.length > 0 && (
              <div className="leaderboard-podium">
                {[2, 1, 3].map((rank) => {
                  const entry = topThree.find((item) => item.position === rank);
                  if (!entry) return <div key={rank} className="leaderboard-podium-slot empty" />;

                  return (
                    <div
                      className={`leaderboard-podium-card leaderboard-podium-${rank}`}
                      key={entry.userId}
                    >
                      <div className="leaderboard-podium-rank">
                        <LeaderRank position={entry.position} />
                      </div>

                      <div className="leaderboard-podium-avatar">
                        {entry.userId?.slice(-2) || "VE"}
                      </div>

                      <strong>{entry.userId}</strong>
                      <span>{entry.prize}</span>

                      {entry.winner ? (
                        <div className="leaderboard-winner-badge">
                          <Trophy size={14} />
                          Winner
                        </div>
                      ) : (
                        <div className="leaderboard-position-copy">
                          Position #{entry.position}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="leaderboard-table-wrap">
              <div className="leaderboard-table-header">
                <span>Position</span>
                <span>Participant</span>
                <span>Entry</span>
                <span>Reward</span>
                <span>Winning details</span>
              </div>

              <div className="leaderboard-table-body">
                {leaderboard.map((entry) => (
                  <article
                    className={`leaderboard-row ${
                      entry.winner ? "leaderboard-row-winner" : ""
                    }`}
                    key={`${entry.position}-${entry.userId}`}
                  >
                    <div className="leaderboard-position">
                      <LeaderRank position={entry.position} />
                    </div>

                    <div className="leaderboard-user">
                      <div className="leaderboard-user-avatar">
                        {entry.userId?.slice(-2) || "VE"}
                      </div>

                      <div>
                        <strong>{entry.userId}</strong>
                        <span>Joined {formatDate(entry.joinedAt)}</span>
                      </div>
                    </div>

                    <div className="leaderboard-entry">
                      <strong>{entry.entryAmount}</strong>
                      <span>{entry.entryCurrency}</span>
                    </div>

                    <div className="leaderboard-reward">
                      <Gift size={17} />
                      <span>{entry.prize || "Reward"}</span>
                    </div>

                    <div className="leaderboard-winning-details">
                      {entry.winner && entry.winningDetails ? (
                        <>
                          <span className="leaderboard-status-success">
                            Winner selected
                          </span>
                          <small>
                            {formatDate(entry.winningDetails.selectedAt)}
                          </small>
                        </>
                      ) : currentGiveaway.status === "ENDED" ? (
                        <span className="leaderboard-status-muted">
                          Not selected
                        </span>
                      ) : (
                        <span className="leaderboard-status-muted">
                          Pending until giveaway ends
                        </span>
                      )}

                      <ChevronRight size={16} />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
