import { Gift, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            <Gift size={20} />
            <strong>VELOOP</strong>
          </div>

          <p>
            Reward-focused giveaways designed for a secure and transparent
            experience.
          </p>

          <div className="footer-trust">
            <ShieldCheck size={18} />
            <span>Secure &amp; transparent reward experience</span>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <div>
            <span>EXPLORE</span>
            <Link to="/giveaways">Giveaway Home</Link>
            <a href="/giveaways#winners">Winners</a>
            <a href="/giveaways#giveaways">Rewards</a>
          </div>

          <div>
            <span>POLICIES</span>
            <a href="/giveaways#rules">Rules</a>
          </div>

          <div>
            <span>SUPPORT</span>
            <a href="/giveaways#faq">Help Center</a>
            <a href="mailto:support@veloop.example">Support</a>
          </div>
        </nav>
      </div>

      <div className="footer-bottom">
        <span>© 2026 VELOOP Rewards</span>
        <span>Giveaways • Winners • Rewards</span>
      </div>
    </footer>
  );
}

export default Footer;
