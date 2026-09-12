import { useEffect, useMemo, useState } from "react";
import {
  Crown,
  Medal,
  Trophy,
  Clock3,
  Gift,
  Users,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
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

function getAvatarLabel(userId) {
  if (!userId) return "VE";
  return userId.slice(-2).toUpperCase();
}

function LeaderRank({ position }) {
  if (position === 1) {
    return (
      <div className="leaderboard-rank leaderboard-rank-gold">
        <Crown size={16} strokeWidth={2.3} />
        <span>1</span>
      </div>
    );
  }

  if (position === 2) {
    return (
      <div className="leaderboard-rank leaderboard-rank-silver">
        <Medal size={16} strokeWidth={2.3} />
        <span>2</span>
      </div>
    );
  }

  if (position === 3) {
    return (
      <div className="leaderboard-rank leaderboard-rank-bronze">
        <Trophy size={16} strokeWidth={2.3} />
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

function PodiumCard({ entry, position }) {
  if (!entry) {
    return <div className="leaderboard-podium-slot empty" aria-hidden="true" />;
  }

  const isFirst = position === 1;

  return (
    <article
      className={`leaderboard-podium-card leaderboard-podium-${position}`}
    >
      <div className="leaderboard-podium-crown">
        {isFirst ? <Crown size={18} strokeWidth={2.2} /> : null}
      </div>

      <div className="leaderboard-podium-rank">
        <LeaderRank position={position} />
      </div>

      <div className="leaderboard-podium-avatar">
        <span>{getAvatarLabel(entry.userId)}</span>
      </div>

      <div className="leaderboard-podium-user">{entry.userId}</div>

      <div className="leaderboard-podium-value">
        <strong>{entry.entryAmount}</strong>
        <span>{entry.entryCurrency}</span>
      </div>

      <div className="leaderboard-podium-prize">
        {entry.prize || "Reward"}
      </div>

      <div
        className={
          entry.winner
            ? "leaderboard-winner-badge"
            : "leaderboard-position-copy"
        }
      >
        {entry.winner ? <Trophy size={13} /> : null}
        {entry.winner ? "Winner selected" : `Position #${position}`}
      </div>

      <div className="leaderboard-podium-footer">
        <Clock3 size={12} />
        <span>{formatDate(entry.joinedAt)}</span>
      </div>
    </article>
  );
}

export default function GiveawayLeaderboard({ currentGiveaway }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("all");
  const [sort, setSort] = useState("entries");

  useEffect(() => {
    let mounted = true;

    if (!currentGiveaway?.giveawayId) {
      setLeaderboard([]);
      setMeta(null);
      return undefined;
    }

    setLoading(true);
    setError("");

    getGiveawayLeaderboard(currentGiveaway.giveawayId, { period, sort })
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
  }, [currentGiveaway?.giveawayId, period, sort]);

  const topThree = useMemo(
    () => leaderboard.filter((entry) => entry.position <= 3),
    [leaderboard]
  );

  const topThreeMap = useMemo(
    () =>
      topThree.reduce((accumulator, entry) => {
        accumulator[entry.position] = entry;
        return accumulator;
      }, {}),
    [topThree]
  );

  if (!currentGiveaway) {
    return null;
  }

  return (
    <section className="leaderboard-section" id="leaderboard">
      <div className="leaderboard-shell">
        <div className="leaderboard-topline">
          <div className="leaderboard-title-wrap">
            <div className="leaderboard-title-icon">
              <Trophy size={24} strokeWidth={1.8} />
            </div>

            <div>
              <span className="section-eyebrow">GIVEAWAY LEADERBOARD</span>
              <h2>🏆 Compete. Earn. Rise to the top.</h2>
              <p>
                Live participation rankings for{" "}
                <strong>
                  {meta?.giveawayName || currentGiveaway.name}
                </strong>
                .
              </p>
            </div>
          </div>

          <div className="leaderboard-live-pill">
            <span className="leaderboard-live-dot" />
            🔥 Live rankings
          </div>
        </div>

        <div className="leaderboard-controls" aria-label="Leaderboard view">
          <div className="leaderboard-filter-group">
            {["Daily", "Weekly", "Monthly", "All Time"].map((label) => {
              const value =
                label === "All Time" ? "all" : label.toLowerCase();

              return (
                <button
                  key={label}
                  type="button"
                  className={`leaderboard-filter-button ${
                    period === value ? "active" : ""
                  }`}
                  onClick={() => setPeriod(value)}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="leaderboard-filter-group leaderboard-mode-group">
            <button
              type="button"
              className={`leaderboard-filter-button ${
                sort === "entries" ? "active" : ""
              }`}
              onClick={() => setSort("entries")}
            >
              <TrendingUp size={14} />
              Top Entries
            </button>

            <button
              type="button"
              className={`leaderboard-filter-button ${
                sort === "participants" ? "active" : ""
              }`}
              onClick={() => setSort("participants")}
            >
              <Users size={14} />
              Top Participants
            </button>
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
                  <strong>
                    {meta?.totalParticipants ?? leaderboard.length}
                  </strong>
                </div>
              </div>

              <div className="leaderboard-summary-card">
                <Gift size={18} />
                <div>
                  <span>Reward</span>
                  <strong>
                    {currentGiveaway.prizes?.[0]?.name ||
                      leaderboard[0]?.prize ||
                      "Reward"}
                  </strong>
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

            <div className="leaderboard-podium-header">
              <div>
                <span className="section-eyebrow">✨ TOP PARTICIPANTS</span>
                <h3>Rise to the top</h3>
              </div>
              <div className="leaderboard-podium-note">
                <Sparkles size={14} />
                <span>Ranked by recorded entry</span>
              </div>
            </div>

            <div className="leaderboard-podium">
              <PodiumCard entry={topThreeMap[2]} position={2} />
              <PodiumCard entry={topThreeMap[1]} position={1} />
              <PodiumCard entry={topThreeMap[3]} position={3} />
            </div>

            <div className="leaderboard-table-wrap">
              <div className="leaderboard-table-header">
                <span>Rank</span>
                <span>Participant</span>
                <span>Entry</span>
                <span>Reward</span>
                <span>Status</span>
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
                        {getAvatarLabel(entry.userId)}
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
                      <Gift size={16} />
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

                      <ChevronRight size={15} />
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
