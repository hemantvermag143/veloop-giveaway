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
  Flame,
  UserPlus,
  Zap,
} from "lucide-react";
import { getGiveawayLeaderboard } from "../services/api";

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getAvatarLabel(userId = "") {
  if (!userId) return "VE";
  return userId.slice(-2).toUpperCase();
}

function LeaderRank({ position }) {
  if (position === 1) {
    return (
      <div className="leaderboard-reference-rank rank-gold">
        <Crown size={15} />
        <span>1</span>
      </div>
    );
  }

  if (position === 2) {
    return (
      <div className="leaderboard-reference-rank rank-silver">
        <Medal size={15} />
        <span>2</span>
      </div>
    );
  }

  if (position === 3) {
    return (
      <div className="leaderboard-reference-rank rank-bronze">
        <Trophy size={15} />
        <span>3</span>
      </div>
    );
  }

  return (
    <div className="leaderboard-reference-rank">
      <span>{position}</span>
    </div>
  );
}

function PodiumCard({ entry, position }) {
  if (!entry) {
    return (
      <article
        className={`leaderboard-reference-podium podium-${position} is-empty`}
        aria-hidden="true"
      >
        <div className="leaderboard-reference-empty-ring">
          {position === 1 ? <Crown size={26} /> : <Medal size={24} />}
        </div>

        <strong>Awaiting participant</strong>
        <span>Join to claim this position</span>

        <div className="leaderboard-reference-place">
          {position === 1
            ? "CHAMPION"
            : position === 2
              ? "2ND PLACE"
              : "3RD PLACE"}
        </div>
      </article>
    );
  }

  return (
    <article
      className={`leaderboard-reference-podium podium-${position}`}
    >
      {position === 1 && (
        <div className="leaderboard-reference-crown">
          <Crown size={34} />
        </div>
      )}

      <div className="leaderboard-reference-podium-top">
        <LeaderRank position={position} />

        <span className="leaderboard-reference-mini-spark">✦</span>
      </div>

      <div className="leaderboard-reference-avatar-stage">
        <span className="leaderboard-reference-orbit orbit-one" />
        <span className="leaderboard-reference-orbit orbit-two" />

        <div className="leaderboard-reference-avatar">
          {getAvatarLabel(entry.userId)}
        </div>
      </div>

      <strong className="leaderboard-reference-user">
        {entry.userId}
      </strong>

      <div className="leaderboard-reference-score">
        {entry.entryAmount.toLocaleString("en-IN")}{" "}
        <span>{entry.entryCurrency}</span>
      </div>

      <div className="leaderboard-reference-reward">
        <Gift size={13} />
        <span>{entry.prize || "Reward"}</span>
      </div>

      <div className="leaderboard-reference-place">
        {position === 1
          ? "🏆 CHAMPION"
          : position === 2
            ? "🥈 2ND PLACE"
            : "🥉 3RD PLACE"}
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

  const topThreeMap = useMemo(() => {
    return leaderboard.reduce((accumulator, entry) => {
      if (entry.position <= 3) {
        accumulator[entry.position] = entry;
      }
      return accumulator;
    }, {});
  }, [leaderboard]);

  const tableEntries = useMemo(
    () => leaderboard.filter((entry) => entry.position > 3),
    [leaderboard]
  );

  if (!currentGiveaway) {
    return null;
  }

  return (
    <section className="leaderboard-section" id="leaderboard">
      <div className="leaderboard-shell leaderboard-reference-shell">
        <div className="leaderboard-reference-header">
          <div className="leaderboard-reference-brand">
            <div className="leaderboard-reference-trophy">
              <Trophy size={31} strokeWidth={1.8} />
            </div>

            <div>
              <span className="section-eyebrow">
                GIVEAWAY LEADERBOARD
              </span>

              <h2>Compete. Earn. <span>Rise to the top.</span></h2>

              <p>
                Live participation rankings for{" "}
                <strong>
                  {meta?.giveawayName || currentGiveaway.name}
                </strong>
              </p>
            </div>
          </div>
        </div>

        <div className="leaderboard-reference-filterbar">
          <div className="leaderboard-reference-periods">
            {[
              ["daily", "Daily"],
              ["weekly", "Weekly"],
              ["monthly", "Monthly"],
              ["all", "All Time"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={period === value ? "active" : ""}
                onClick={() => setPeriod(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="leaderboard-reference-modes">
            <button
              type="button"
              className={sort === "entries" ? "active" : ""}
              onClick={() => setSort("entries")}
            >
              <Flame size={14} />
              Top Earners
            </button>

            <button
              type="button"
              className={sort === "participants" ? "active" : ""}
              onClick={() => setSort("participants")}
            >
              <UserPlus size={14} />
              Top Participants
            </button>

          </div>
        </div>

        {loading && (
          <div className="leaderboard-state leaderboard-reference-state">
            <div className="leaderboard-spinner" />
            <span>Loading live rankings...</span>
          </div>
        )}

        {!loading && error && (
          <div className="leaderboard-state leaderboard-state-error leaderboard-reference-state">
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && leaderboard.length === 0 && (
          <div className="leaderboard-state leaderboard-empty leaderboard-reference-state">
            <Users size={24} />
            <div>
              <strong>No participants yet</strong>
              <span>Be the first to join this giveaway.</span>
            </div>
          </div>
        )}

        {!loading && !error && leaderboard.length > 0 && (
          <>
            <div className="leaderboard-reference-podium-header">
              <div>
                <span className="section-eyebrow">🏆 TOP EARNERS</span>
                <h3>Rise to the top</h3>
              </div>

              <span className="leaderboard-reference-live">
                <span />
                Live rankings
              </span>
            </div>

            <div className="leaderboard-reference-podium-grid">
              <PodiumCard entry={topThreeMap[2]} position={2} />
              <PodiumCard entry={topThreeMap[1]} position={1} />
              <PodiumCard entry={topThreeMap[3]} position={3} />
            </div>

            {tableEntries.length > 0 && (
              <div className="leaderboard-reference-table">
                <div className="leaderboard-reference-table-head">
                  <span>RANK</span>
                  <span>USER</span>
                  <span>{sort === "entries" ? "VES EARNED" : "ACTIVITY"}</span>
                  <span>REWARD</span>
                  <span>STATUS</span>
                </div>

                <div className="leaderboard-reference-table-body">
                  {tableEntries.map((entry) => (
                    <article
                      className="leaderboard-reference-table-row"
                      key={`${entry.position}-${entry.userId}`}
                    >
                      <div>
                        <LeaderRank position={entry.position} />
                      </div>

                      <div className="leaderboard-reference-table-user">
                        <div className="leaderboard-reference-table-avatar">
                          {getAvatarLabel(entry.userId)}
                        </div>

                        <div>
                          <strong>{entry.userId}</strong>
                          <span>Joined {formatDate(entry.joinedAt)}</span>
                        </div>
                      </div>

                      <div className="leaderboard-reference-table-entry">
                        <strong>
                          {entry.entryAmount.toLocaleString("en-IN")}
                        </strong>
                        <span>{entry.entryCurrency}</span>
                      </div>

                      <div className="leaderboard-reference-table-reward">
                        <Gift size={14} />
                        <span>{entry.prize || "Reward"}</span>
                      </div>

                      <div className="leaderboard-reference-table-status">
                        {entry.winner && entry.winningDetails ? (
                          <span className="leaderboard-status-success">
                            Winner selected
                          </span>
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
            )}

            <button
              type="button"
              className="leaderboard-reference-full-button"
              onClick={() => {
                const element = document.getElementById("leaderboard");
                element?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              View Full Leaderboard
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div className="leaderboard-reference-footer-note">
          <Sparkles size={13} />
          <span>
            Rankings are based on verified giveaway participation recorded by
            VELOOP.
          </span>
        </div>
      </div>
    </section>
  );
}
