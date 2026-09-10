import { ArrowRight, Clock3, Users } from "lucide-react";

function PrizeCard({ giveaway, position }) {
  const prize = giveaway.prizes?.[0];

  const badge =
    giveaway.status === "ACTIVE"
      ? "LIVE"
      : giveaway.status === "UPCOMING"
        ? "COMING SOON"
        : "ENDED";

  const entryText = prize
    ? `${prize.entryAmount.toLocaleString()} ${prize.entryCurrency}`
    : "—";

  const participantCount = Number(giveaway.participantCount || 0);
  const participantText = `${participantCount.toLocaleString()} ${
    participantCount === 1 ? "participant" : "participants"
  }`;

  return (
    <article className="prize-card">
      <div className="prize-card-visual">
        <span className="prize-position">{position}</span>

        {prize?.image ? (
          <img
            className="prize-image"
            src={prize.image}
            alt={prize.name || giveaway.title}
          />
        ) : (
          <div className="prize-placeholder" aria-hidden="true">
            🎁
          </div>
        )}
      </div>

      <div className="prize-card-body">
        <div className="prize-card-badge">{badge}</div>

        <h3>{prize?.name || giveaway.title}</h3>

        <p>{giveaway.description}</p>

        <div className="prize-meta">
          <span>
            <Users size={15} />
            {participantText}
          </span>

          <span>
            <Clock3 size={15} />
            {giveaway.status === "UPCOMING"
              ? "Starts "
              : giveaway.status === "ACTIVE"
                ? "Ends "
                : "Ended "}
            {(giveaway.status === "UPCOMING"
              ? giveaway.startAt
              : giveaway.endAt)
              ? new Date(
                  giveaway.status === "UPCOMING"
                    ? giveaway.startAt
                    : giveaway.endAt
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </span>
        </div>

        <div className="prize-entry">
          <span>Entry</span>
          <strong>{entryText}</strong>
        </div>

        <a
          className="prize-cta"
          href={`/giveaway/${giveaway.slug}`}
        >
          {giveaway.status === "ACTIVE"
            ? "Join Now"
            : giveaway.status === "ENDED"
              ? "View Winners"
              : "View Giveaway"}
          <ArrowRight size={17} />
        </a>
      </div>
    </article>
  );
}

export default PrizeCard;
