import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import GiveawayHero from "./components/GiveawayHero";
import GiveawayStats from "./components/GiveawayStats";
import Countdown from "./components/Countdown";
import PrizeCard from "./components/PrizeCard";
import HowToParticipate from "./components/HowToParticipate";
import WinnerSlider from "./components/WinnerSlider";
import WinnersTabs from "./components/WinnersTabs";
import GiveawayRules from "./components/GiveawayRules";
import FAQ from "./components/FAQ";
import TrustSection from "./components/TrustSection";
import TransactionHistory from "./components/TransactionHistory";
import Footer from "./components/Footer";
import GiveawayLoader from "./components/GiveawayLoader";
import GiveawayLeaderboard from "./components/GiveawayLeaderboard";
import LiveVFX from "./components/LiveVFX";
import GiveawayDetails from "./pages/GiveawayDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminClaims from "./pages/AdminClaims";
import { getCurrentGiveaway, getGiveaways, getPreviousWinners, getWinners, getMyTransactions } from "./services/api";

function GiveawayHome() {
  const [currentGiveaway, setCurrentGiveaway] = useState(null);
  const [allGiveaways, setAllGiveaways] = useState([]);
  const [previousWinners, setPreviousWinners] = useState([]);
  const [currentWinners, setCurrentWinners] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("veloop_token");

    Promise.allSettled([
      getCurrentGiveaway(),
      getGiveaways(),
      getPreviousWinners(),
    ])
      .then(async ([currentResult, allResult, winnersResult]) => {
        if (!mounted) return;

        const currentFailed = currentResult.status === "rejected";
        const allFailed = allResult.status === "rejected";
        const winnersFailed = winnersResult.status === "rejected";

        if (!currentFailed) {
          setCurrentGiveaway(currentResult.value.data || null);
        }

        if (!allFailed) {
          setAllGiveaways(allResult.value.data || []);
        }

        if (!winnersFailed) {
          setPreviousWinners(winnersResult.value.data || []);
        }

        if (!currentFailed && currentResult.value.data?.giveawayId) {
          try {
            const currentWinnersResponse = await getWinners(
              currentResult.value.data.giveawayId
            );

            if (mounted) {
              setCurrentWinners(currentWinnersResponse.data || []);
            }
          } catch {
            if (mounted) {
              setCurrentWinners([]);
            }
          }
        }

        if (currentFailed && allFailed) {
          setApiError("Unable to load the latest giveaway data.");
        } else if (winnersFailed) {
          setApiError("");
        } else {
          setApiError("");
        }
      })
      .finally(() => {
        if (mounted) {
          setApiLoading(false);
        }
      });

    if (token) {
      setTransactionsLoading(true);

      getMyTransactions(token)
        .then((response) => {
          if (mounted) {
            setTransactions(response.data || []);
          }
        })
        .catch(() => {
          if (mounted) {
            setTransactions([]);
          }
        })
        .finally(() => {
          if (mounted) {
            setTransactionsLoading(false);
          }
        });
    }

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="app">
      <LiveVFX />
      <Navbar />
      <main className="page-content">
        {apiLoading && <GiveawayLoader message="Checking active giveaways..." />}

        {apiError && (
          <div className="api-status-banner api-status-error" role="alert">
            <strong>We couldn&apos;t load the latest giveaways.</strong>
            <span>Please try again in a moment.</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="api-retry-btn"
            >
              Try Again
            </button>
          </div>
        )}

        <GiveawayHero currentGiveaway={currentGiveaway} />
        <GiveawayStats
          currentGiveaway={currentGiveaway}
          allGiveaways={allGiveaways}
          previousWinners={previousWinners}
        />

        <section className="countdown-section">
          <div>
            <span className="section-eyebrow">
              {currentGiveaway?.status === "UPCOMING"
                ? "COMING SOON"
                : currentGiveaway?.status === "ENDED"
                  ? "GIVEAWAY COMPLETE"
                  : currentGiveaway
                    ? "LIVE GIVEAWAY"
                    : "VELOOP REWARDS"}
            </span>

            <h2>
              {currentGiveaway?.status === "UPCOMING"
                ? "Get ready for the next giveaway"
                : currentGiveaway?.status === "ENDED"
                  ? "Winner announcement"
                  : currentGiveaway
                    ? "Don’t miss your chance to win"
                    : "More rewards are on the way"}
            </h2>

            <p>
              {currentGiveaway?.status === "UPCOMING"
                ? "Participation opens when this giveaway goes live."
                : currentGiveaway?.status === "ENDED"
                  ? "This giveaway has ended. Check the winners section for results."
                  : currentGiveaway
                    ? "Enter before the timer reaches zero."
                    : "Explore the available giveaways below."}
            </p>
          </div>

          {currentGiveaway?.status === "ACTIVE" && currentGiveaway.endAt && (
            <Countdown targetDate={currentGiveaway.endAt} />
          )}

          {currentGiveaway?.status === "UPCOMING" && currentGiveaway.startAt && (
            <Countdown targetDate={currentGiveaway.startAt} mode="start" />
          )}

          {currentGiveaway?.status === "ENDED" && (
            <div className="countdown-status-message">
              <span>Winners are announced after the giveaway ends.</span>
            </div>
          )}
        </section>

        <section className="prizes-section" id="giveaways">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">REWARDS</span>
              <h2>Choose your giveaway</h2>
              <p>Explore active, upcoming and completed reward events.</p>
            </div>
          </div>

          <div className="prize-grid">
            {allGiveaways.map((giveaway, index) => (
              <PrizeCard
                key={giveaway.giveawayId}
                giveaway={giveaway}
                position={`Prize ${index + 1}`}
              />
            ))}
          </div>
        </section>

        <GiveawayLeaderboard currentGiveaway={currentGiveaway} />
        <HowToParticipate />

        <WinnerSlider currentGiveaway={currentGiveaway} winners={currentWinners} />

        <WinnersTabs currentGiveaway={currentGiveaway} currentWinners={currentWinners} previousWinners={previousWinners} />

        <GiveawayRules />

        <TrustSection />

        {localStorage.getItem("veloop_token") && (
          <TransactionHistory
            transactions={transactions}
            loading={transactionsLoading}
          />
        )}

        <FAQ />

        <Footer />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/claims" element={<AdminClaims />} />
        <Route path="/giveaways" element={<GiveawayHome />} />
        <Route path="/giveaway/:slug" element={<GiveawayDetails />} />
        <Route path="*" element={<Navigate to="/giveaways" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
