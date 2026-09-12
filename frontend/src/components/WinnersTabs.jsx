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
} from "lucide-react";

function maskWinnerId(userId = "") {
  if (!userId) return "Winner";
  if (userId.length <= 4) return "****";
  return `${userId.slice(0, 2)}****${userId.slice(-2)}`;
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getCategory(prize = "") {
  const value = prize.toLowerCase();

  if (value.includes("iphone") || value.includes("phone")) return "Phones";
  if (value.includes("watch")) return "Watches";
  if (value.includes("airpods") || value.includes("earbuds")) return "Audio";
  if (value.includes("amazon") || value.includes("gift")) return "Gift Cards";
  if (value.includes("token")) return "Tokens";

  return "Other";
}

function WinnerCard({ winner, activeTab }) {
  const maskedId = maskWinnerId(winner.userId);
  const category = getCategory(winner.prize);

  return (
    <article className="winner-directory-card">
      <div className="winner-directory-top">
        <div className="winner-directory-trophy">
          <Trophy size={20} />
        </div>

        <span className="winner-directory-rank">
          {activeTab === "winners" ? "WINNER" : "PREVIOUS"}
        </span>
      </div>

      <div className="winner-directory-avatar">
        <span>{maskedId.slice(-2)}</span>
      </div>

      <strong className="winner-directory-name">{maskedId}</strong>

      <div className="winner-directory-prize">
        <Gift size={15} />
        <span>{winner.prize || "Giveaway Reward"}</span>
      </div>

      <div className="winner-directory-meta">
        <span>{category}</span>
        <span>{formatDate(winner.selectedAt)}</span>
      </div>

      <div className="winner-directory-verified">
        <CheckCircle2 size={14} />
        <span>Verified winner</span>
      </div>

      <div className="winner-directory-selection">
        <span>Selection</span>
        <strong>{winner.selectionMethod || "Verified draw"}</strong>
      </div>
    </article>
  );
}

function WinnerRow({ winner, activeTab, index }) {
  const maskedId = maskWinnerId(winner.userId);
  const category = getCategory(winner.prize);

  return (
    <article className="winner-directory-row">
      <div className="winner-directory-table-rank">
        #{index + 1}
      </div>

      <div className="winner-directory-table-user">
        <div className="winner-directory-table-avatar">
          {maskedId.slice(-2)}
        </div>

        <div>
          <strong>{maskedId}</strong>
          <span>{activeTab === "winners" ? "Current winner" : "Past winner"}</span>
        </div>
      </div>

      <div className="winner-directory-table-prize">
        <Gift size={15} />
        <span>{winner.prize || "Giveaway Reward"}</span>
      </div>

      <div className="winner-directory-table-category">
        {category}
      </div>

      <div className="winner-directory-table-date">
        {formatDate(winner.selectedAt)}
      </div>

      <div className="winner-directory-table-status">
        <CheckCircle2 size={14} />
        Verified
      </div>
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

  const categories = useMemo(() => {
    const values = new Set(
      items.map((winner) => getCategory(winner.prize))
    );

    return ["All Winners", ...Array.from(values)];
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((winner) => {
      const winnerId = maskWinnerId(winner.userId).toLowerCase();
      const prize = (winner.prize || "").toLowerCase();
      const matchesSearch =
        !query || winnerId.includes(query) || prize.includes(query);

      const matchesCategory =
        category === "All Winners" ||
        getCategory(winner.prize) === category;

      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  const isCurrentEnded = currentGiveaway?.status === "ENDED";

  return (
    <section className="winners-section" id="winners">
      <div className="winner-directory-shell">
        <div className="winner-directory-heading">
          <div>
            <span className="section-eyebrow">🏆 WINNER DIRECTORY</span>
            <h2>All Verified Winners</h2>
            <p>
              Explore current and previous giveaway winners with privacy-safe
              winner IDs.
            </p>
          </div>

          <div className="winner-directory-security">
            <ShieldCheck size={17} />
            <span>Privacy protected</span>
          </div>
        </div>

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

        <div className="winner-directory-toolbar">
          <div className="winner-directory-search">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search winner ID or prize..."
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
                {item}
              </button>
            ))}
          </div>

          <div className="winner-directory-view-toggle">
            <button
              type="button"
              className={view === "cards" ? "active" : ""}
              aria-label="Card view"
              onClick={() => setView("cards")}
            >
              <Grid2X2 size={16} />
            </button>

            <button
              type="button"
              className={view === "table" ? "active" : ""}
              aria-label="Table view"
              onClick={() => setView("table")}
            >
              <List size={17} />
            </button>
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
          <div className="winner-directory-grid">
            {filteredItems.map((winner, index) => (
              <WinnerCard
                key={`${winner.giveawayId}-${winner.userId}-${index}`}
                winner={winner}
                activeTab={activeTab}
              />
            ))}
          </div>
        ) : (
          <div className="winner-directory-table">
            <div className="winner-directory-table-header">
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
                activeTab={activeTab}
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
