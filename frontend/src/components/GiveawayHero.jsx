import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

function GiveawayHero({ currentGiveaway }) {
  const prize =
    currentGiveaway?.prizes?.find(
      (item) => item.name?.toLowerCase().includes("iphone 15 pro")
    ) || {
      name: "iPhone 15 Pro",
      image: "/prizes/iphone-15-pro.png",
      entryAmount: 250,
      entryCurrency: "VEs",
    };

  const prizeName = "iPhone 15 Pro";
  const entryText = `${prize.entryAmount.toLocaleString()} ${prize.entryCurrency}`;
  const liveLabel =
    currentGiveaway?.status === "ACTIVE"
      ? "LIVE GIVEAWAYS"
      : currentGiveaway?.status === "UPCOMING"
        ? "UPCOMING GIVEAWAYS"
        : "GIVEAWAYS";

  return (
    <section className="giveaway-hero">
      <div className="hero-copy">
        <div className="hero-badge">
          <Sparkles size={15} />
          {liveLabel}
        </div>

        <h1>Win More. Reward Yourself.</h1>

        <p>
          Enter exciting giveaways using your VELOOP rewards and get a chance
          to win premium prizes.
        </p>

        <div className="hero-actions">
          <a href="#giveaways" className="primary-btn">
            Explore Giveaways
            <ArrowRight size={18} />
          </a>
        </div>

        <div className="hero-trust">
          <ShieldCheck size={18} />
          <span>Secure entries • Fair winner selection</span>
        </div>
      </div>

      <div className="hero-prize">
        {prize?.image ? (
          <img
            className="hero-prize-image"
            src={prize.image}
            alt={prize.name || currentGiveaway?.title || "Featured prize"}
          />
        ) : (
          <div className="prize-orb">🎁</div>
        )}
        <div className="hero-card">
          <span>Featured Prize</span>
          <strong>{prizeName}</strong>
          <small>Entry from {entryText}</small>
        </div>
      </div>
    </section>
  );
}

export default GiveawayHero;
