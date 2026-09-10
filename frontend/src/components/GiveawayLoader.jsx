import { Gift, Sparkles } from "lucide-react";

function GiveawayLoader({ message = "Unlocking rewards..." }) {
  return (
    <div className="giveaway-loader" role="status" aria-live="polite">
      <div className="giveaway-loader-box">
        <Gift size={30} />
      </div>

      <span className="section-eyebrow">VELOOP REWARDS</span>
      <strong>{message}</strong>

      <div className="giveaway-loader-dots" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <Sparkles className="giveaway-loader-sparkle" size={18} aria-hidden="true" />
    </div>
  );
}

export default GiveawayLoader;
