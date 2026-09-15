import { useMemo, useState } from "react";
import {
  Trophy,
  CalendarDays,
  ShieldCheck,
  Search,
  Grid2X2,
  List,
  CheckCircle2,
  Sparkles,
  Gift,
  Clock3,
} from "lucide-react";

function maskWinnerId(userId = "") {
  if (!userId) return "Winner";
  if (userId.length <= 4) return "****";
  return `${userId.slice(0, 2)}****${userId.slice(-2)}`;
}

function getWinnerPrizeImage(winner = {}) {
  if (winner?.prizeImage) return winner.prizeImage;

  const fallbackImages = {
    "PRIZE-IP15": "/prizes/iphone-15-pro.png",
    "PRIZE-WATCH": "/prizes/apple-watch.png",
    "PRIZE-AIRPODS": "/prizes/airpods-pro.png",
    "PRIZE-AMZ2000": "/prizes/amazon-2000.png",
    "PRIZE-AMZ500": "/prizes/amazon-500.png",
    "PRIZE-AMZ20": "/prizes/amazon-20.png",
  };

  return fallbackImages[winner?.prizeId] || "";
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getCategory(prize = "", prizeType = "") {
  const value = prize.toLowerCase();

  if (value.includes("iphone") || value.includes("phone")) {
    return "Gadgets & Electronics";
  }

  if (
    value.includes("watch") ||
    value.includes("airpods") ||
    value.includes("earbuds") ||
    prizeType === "PHYSICAL"
  ) {
    return "Gadgets & Electronics";
  }

  if (
    value.includes("amazon") ||
    value.includes("gift") ||
    prizeType === "GIFT_CARD"
  ) {
    return "Gift Cards & Vouchers";
  }

  return "Other Rewards";
}

function getPrizeValue(prize = "") {
  const match = prize.match(/₹[\d,]+/);
  return match ? match[0] : "Exclusive";
}

function getTypeLabel(prizeType = "") {
  if (prizeType === "GIFT_CARD") return "🎟 GIFT_CARD";
  if (prizeType === "PHYSICAL") return "◉ PHYSICAL";
  return "✦ DIGITAL";
}

function WinnerCard({ winner, activeTab }) {
  const maskedId = maskWinnerId(winner.userId);
  const category = getCategory(winner.prize, winner.prizeType);
  const prizeValue = getPrizeValue(winner.prize);

  return (
    <article className="winner-reference-card">
      <div className="winner-reference-card-head">
        <span
          className={`winner-reference-type ${
            winner.prizeType === "GIFT_CARD" ? "gift" : "physical"
          }`}
        >
          {getTypeLabel(winner.prizeType)}
        </span>

        <span className="winner-reference-audit">
          <CheckCircle2 size={12} />
          Audit Verified
        </span>
      </div>

      <div className="winner-reference-image-wrap">
        <span className="winner-reference-spark spark-one">✦</span>
        <span className="winner-reference-spark spark-two">✧</span>

        {winner.prizeImage ? (
          <img
            src={getWinnerPrizeImage(winner)}
            alt={winner.prize || "Giveaway prize"}
            className="winner-reference-image"
            loading="lazy"
          />
        ) : (
          <div className="winner-reference-image-fallback">
            <Gift size={40} />
          </div>
        )}
      </div>

      <div className="winner-reference-prize-copy">
        <h3>{winner.prize || "Giveaway Reward"}</h3>
        <p>
          Prize Value: <strong>{prizeValue}</strong>
        </p>
      </div>

      <div className="winner-reference-user">
        <div className="winner-reference-user-avatar">
          {maskedId.slice(-2)}
        </div>

        <div className="winner-reference-user-main">
          <strong>{maskedId}</strong>
          <span>VEL • {maskedId.slice(-4)}</span>
        </div>
      </div>

      <div className="winner-reference-footer">
        <span>
          <Clock3 size={11} />
          {formatDate(winner.selectedAt)}
        </span>

        <span className="winner-reference-claimed">
          Claimed
        </span>
      </div>

      <div className="winner-reference-meta">
        <span>{category}</span>
        <span>
          {activeTab === "winners" ? "Current Winner" : "Previous Winner"}
        </span>
      </div>
    </article>
  );
}

function WinnerRow({ winner, index }) {
  const maskedId = maskWinnerId(winner.userId);
  const category = getCategory(winner.prize, winner.prizeType);

  return (
    <article className="winner-reference-row">
      <div className="winner-reference-row-rank">#{index + 1}</div>

      <div className="winner-reference-row-user">
        <div className="winner-reference-row-avatar">
          {maskedId.slice(-2)}
        </div>

        <div>
          <strong>{maskedId}</strong>
          <span>{winner.prizeType || "REWARD"}</span>
        </div>
      </div>

      <div className="winner-reference-row-prize">
        <Gift size={14} />
        <span>{winner.prize || "Giveaway Reward"}</span>
      </div>

      <span>{category}</span>
      <span>{formatDate(winner.selectedAt)}</span>

      <span className="winner-reference-row-status">
        <CheckCircle2 size={13} />
        Claimed
      </span>
    </article>
  );
}

function WinnersTabs({
  currentGiveaway,
  currentWinners = [],
  previousWinners = [],
}) {
  const [activeTab, setActiveTab] = useState("winners");
  const [view, setView] = useState("cards");
  const [category, setCategory] = useState("All Winners");
  const [search, setSearch] = useState("");

  const items =
    activeTab === "winners" ? currentWinners : previousWinners;

  const categories = [
    "All Winners",
    "Gadgets & Electronics",
    "Gift Cards & Vouchers",
  ];

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((winner) => {
      const winnerId = maskWinnerId(winner.userId).toLowerCase();
      const prize = (winner.prize || "").toLowerCase();
      const winnerCategory = getCategory(winner.prize, winner.prizeType);

      const matchesSearch =
        !query || winnerId.includes(query) || prize.includes(query);

      const matchesCategory =
        category === "All Winners" || winnerCategory === category;

      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  const isCurrentEnded = currentGiveaway?.status === "ENDED";

  return (
    <section className="winners-section" id="winners">
      <div className="winner-directory-shell winner-reference-shell">
        <div className="winner-reference-heading">
          <div>
            <span className="section-eyebrow">
              🏆 WINNER DIRECTORY
            </span>

            <h2>All Verified Winners Directory ({previousWinners.length + currentWinners.length})</h2>

            <p>
              Browse through all verified rewards recipients and audited
              winning tickets.
            </p>
          </div>

          <div className="winner-directory-security">
            <ShieldCheck size={17} />
            <span>Privacy protected</span>
          </div>
        </div>

        <div className="winner-reference-controls">
          <div className="winner-directory-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "winners"}
              className={activeTab === "winners" ? "active" : ""}
              onClick={() => {
                setActiveTab("winners");
                setCategory("All Winners");
              }}
            >
              <Trophy size={16} />
              Winners
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "previous"}
              className={activeTab === "previous" ? "active" : ""}
              onClick={() => {
                setActiveTab("previous");
                setCategory("All Winners");
              }}
            >
              <CalendarDays size={16} />
              Previous Winners
            </button>
          </div>

          <div className="winner-reference-view-toggle">
            <button
              type="button"
              className={view === "cards" ? "active" : ""}
              onClick={() => setView("cards")}
              aria-label="Cards view"
            >
              <Grid2X2 size={15} />
              <span>Cards</span>
            </button>

            <button
              type="button"
              className={view === "table" ? "active" : ""}
              onClick={() => setView("table")}
              aria-label="Table view"
            >
              <List size={15} />
              <span>Table</span>
            </button>
          </div>
        </div>

        <div className="winner-reference-toolbar">
          <div className="winner-directory-search">
            <Search size={17} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search for winner / prize ticket..."
              aria-label="Search winners"
            />
          </div>

          <div className="winner-directory-categories">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item === "Gadgets & Electronics"
                  ? "📱 Gadgets & Electronics"
                  : item === "Gift Cards & Vouchers"
                    ? "🎁 Gift Cards & Vouchers"
                    : "✨ All Winners"}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="winner-empty winner-directory-empty">
            <Sparkles size={24} />

            <strong>
              {activeTab === "winners"
                ? isCurrentEnded
                  ? "Winner information is being prepared."
                  : "No winners announced yet."
                : "No previous winners available."}
            </strong>

            <span>
              {search || category !== "All Winners"
                ? "Try another search or category."
                : activeTab === "winners"
                  ? "Winner information will appear after the giveaway ends."
                  : "Completed giveaway winner information will appear here."}
            </span>
          </div>
        ) : view === "cards" ? (
          <div className="winner-reference-grid">
            {filteredItems.map((winner, index) => (
              <WinnerCard
                key={`${winner.giveawayId}-${winner.userId}-${index}`}
                winner={winner}
                activeTab={activeTab}
              />
            ))}
          </div>
        ) : (
          <div className="winner-reference-table">
            <div className="winner-reference-table-header">
              <span>Rank</span>
              <span>Winner</span>
              <span>Prize</span>
              <span>Category</span>
              <span>Date</span>
              <span>Status</span>
            </div>

            {filteredItems.map((winner, index) => (
              <WinnerRow
                key={`${winner.giveawayId}-${winner.userId}-${index}`}
                winner={winner}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default WinnersTabs;
