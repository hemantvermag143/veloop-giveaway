import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import Countdown from "../components/Countdown";
import GiveawayLoader from "../components/GiveawayLoader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JoinConfirmationModal from "../components/JoinConfirmationModal";
import PrizeClaim from "../components/PrizeClaim";
import {
  getGiveawayBySlug,
  getMe,
  getMyParticipation,
  getMyWinnerStatus,
  getWinners,
  joinGiveaway,
} from "../services/api";

function GiveawayDetails() {
  const { slug } = useParams();
  const [expired, setExpired] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [giveaway, setGiveaway] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [joined, setJoined] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [user, setUser] = useState(null);
  const [publicWinners, setPublicWinners] = useState([]);
  const [participationLoaded, setParticipationLoaded] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setLoadError("");

    getGiveawayBySlug(slug)
      .then((response) => {
        if (mounted) {
          setGiveaway(response.data);
        }
      })
      .catch((error) => {
        if (mounted) {
          setLoadError(error.message || "Unable to load giveaway.");
          setGiveaway(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    let mounted = true;

    async function loadPublicWinners() {
      if (!giveaway?.giveawayId) {
        setPublicWinners([]);
        return;
      }

      try {
        const response = await getWinners(giveaway.giveawayId);

        if (!mounted) return;

        setPublicWinners(response.data || []);
      } catch {
        if (!mounted) return;

        setPublicWinners([]);
      }
    }

    loadPublicWinners();

    return () => {
      mounted = false;
    };
  }, [giveaway?.giveawayId]);

  useEffect(() => {
    let mounted = true;

    const token = localStorage.getItem("veloop_token");

    if (!giveaway?.giveawayId) {
      setParticipationLoaded(true);
      return;
    }

    if (!token) {
      setUser(null);
      setJoined(false);
      setWinner(null);
      setParticipationLoaded(true);
      return;
    }

    getMe(token)
      .then(async (meResponse) => {
        if (!mounted) return;

        setUser(meResponse.data);

        const [participationResponse, winnerResponse] = await Promise.all([
          getMyParticipation(giveaway.giveawayId, token),
          getMyWinnerStatus(giveaway.giveawayId, token),
        ]);

        if (!mounted) return;

        setJoined(Boolean(participationResponse.data?.participating));

        if (winnerResponse.data?.isWinner && winnerResponse.data?.winner) {
          const winnerData = winnerResponse.data.winner;
          const winnerPrize = giveaway.prizes?.find(
            (item) => item.prizeId === winnerData.prizeId
          );

          setWinner({
            ...winnerData,
            giveawayName: giveaway.title,
            prizeName: winnerPrize?.name,
            prizeType: winnerPrize?.type,
            claimDeadline: giveaway.endAt
              ? new Date(
                  new Date(giveaway.endAt).getTime() +
                    7 * 24 * 60 * 60 * 1000
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "7 days after giveaway ends",
            prize: winnerPrize?.name,
            winnerStatus: winnerData.status,
          });
        } else {
          setWinner(null);
        }
      })
      .catch(() => {
        if (!mounted) return;

        setUser(null);
        setJoined(false);
        setWinner(null);
      })
      .finally(() => {
        if (mounted) {
          setParticipationLoaded(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [giveaway]);

  if (loading) {
    return (
      <main className="details-page">
        <div className="details-loader">
          <GiveawayLoader message="Loading giveaway details..." />
        </div>
      </main>
    );
  }

  if (loadError || !giveaway) {
    return (
      <main className="details-page">
        <div className="details-empty" role="alert">
          <h1>We couldn't load this giveaway</h1>
          <p>
            Something went wrong while loading the latest giveaway details.
            Please try again or return to the giveaway home.
          </p>

          <div className="details-empty-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>

            <Link to="/giveaways" className="secondary-btn">
              Back to Giveaways
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const prize = giveaway.prizes?.[0];

  if (!prize) {
    return (
      <main className="details-page">
        <div className="details-empty">
          <h1>Prize unavailable</h1>
          <p>This giveaway does not have a configured prize.</p>
          <Link to="/giveaways" className="primary-btn">
            Back to Giveaways
          </Link>
        </div>
      </main>
    );
  }

  const balance = user?.balances?.[prize.entryCurrency] ?? 0;
  const alreadyJoined = joined;
  const hasEnoughBalance = balance >= prize.entryAmount;
  const balanceAfter = balance - prize.entryAmount;
  const isAuthenticated = Boolean(localStorage.getItem("veloop_token"));

  const isEnded = giveaway.status === "ENDED" || expired;
  const isUpcoming = giveaway.status === "UPCOMING";

  return (
    <>
      <Navbar />
      <main className="details-page">
      <div className="details-container">
        <Link to="/giveaways" className="back-link">
          <ArrowLeft size={17} />
          Back to Giveaway Home
        </Link>

        <section className="details-hero">
          <div className="details-prize-visual">
            {giveaway.badge && (
              <span className="details-badge">{giveaway.badge}</span>
            )}
            <img
              className="details-prize-image"
              src={prize.image || "/prizes/amazon-2000.png"}
              alt={prize.name}
            />
          </div>

          <div className="details-content">
            <span className="section-eyebrow">
              {isEnded
                ? "GIVEAWAY ENDED"
                : isUpcoming
                  ? "COMING SOON"
                  : "ACTIVE GIVEAWAY"}
            </span>

            <h1>{prize.name}</h1>

            <p className="details-description">
              {giveaway.description}
            </p>

            <div className="details-meta">
              <span>
                <Users size={16} />
                {typeof giveaway.participantCount === "number"
                  ? giveaway.participantCount.toLocaleString()
                  : "0"} participants
              </span>

              <span>
                <Clock3 size={16} />
                {isEnded
                  ? "Winner announcement available"
                  : isUpcoming
                    ? "Starts soon"
                    : "Giveaway live"}
              </span>
            </div>

            {!isEnded && isUpcoming && giveaway.startAt && (
              <Countdown
                targetDate={giveaway.startAt}
                mode="start"
              />
            )}

            {!isEnded && !isUpcoming && (
              <Countdown
                targetDate={giveaway.endAt}
                onExpire={() => setExpired(true)}
              />
            )}
          </div>
        </section>

        <section className="details-grid">
          <div className="details-card">
            <div className="details-card-heading">
              <Wallet size={20} />
              <div>
                <span>ENTRY FEE</span>
                <h2>
                  {prize.entryAmount.toLocaleString()}{" "}
                  {prize.entryCurrency}
                </h2>
              </div>
            </div>

            {isEnded ? (
              <div className="ended-entry-note">
                <CheckCircle2 size={19} />
                <div>
                  <strong>Participation is closed</strong>
                  <span>
                    This giveaway has ended. Winner information is available
                    in the Winners section.
                  </span>
                </div>
              </div>
            ) : isUpcoming ? (
              <div className="upcoming-entry-note">
                <Clock3 size={19} />
                <div>
                  <strong>Participation opens soon</strong>
                  <span>
                    Get ready to enter when this giveaway goes live.
                  </span>
                </div>
              </div>
            ) : isAuthenticated ? (
              <>
                <div className="balance-row">
                  <span>Your Balance</span>
                  <strong>
                    {balance.toLocaleString()} {prize.entryCurrency}
                  </strong>
                </div>

                {hasEnoughBalance ? (
                  <div className="balance-success">
                    <CheckCircle2 size={18} />
                    <span>
                      You have enough {prize.entryCurrency}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="balance-warning">
                      <ShieldCheck size={18} />
                      <span>
                        You need{" "}
                        {(prize.entryAmount - balance).toLocaleString()} more{" "}
                        {prize.entryCurrency}
                      </span>
                    </div>

                    <button type="button" className="earn-more-btn">
                      Earn More {prize.entryCurrency} →
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="visitor-join-note">
                <ShieldCheck size={18} />
                <span>Login to verify your balance and participate.</span>
              </div>
            )}

            {!isEnded && !isUpcoming && !isAuthenticated && (
              <Link to="/login" className="join-details-btn">
                Login to Participate
              </Link>
            )}

            {!isEnded &&
              !isUpcoming &&
              isAuthenticated &&
              hasEnoughBalance &&
              !alreadyJoined && (
                <button
                  type="button"
                  className="join-details-btn"
                  onClick={() => setShowJoinModal(true)}
                >
                  Join Giveaway – {prize.entryAmount.toLocaleString()}{" "}
                  {prize.entryCurrency}
                </button>
              )}

            {!isEnded &&
              !isUpcoming &&
              isAuthenticated &&
              alreadyJoined && (
                <div className="joined-success">
                  <CheckCircle2 size={18} />
                  <span>You’re already participating in this giveaway.</span>
                </div>
              )}
          </div>

          {joinSuccess && (
            <section className="join-success-panel" aria-live="polite">
              <div className="join-success-icon">
                <CheckCircle2 size={30} />
              </div>

              <div>
                <span className="section-eyebrow">PARTICIPATION CONFIRMED</span>
                <h2>You’re In!</h2>
                <p>
                  Your participation for <strong>{prize.name}</strong> has been
                  successfully recorded.
                </p>
                <span className="join-success-entry">
                  Entry Fee: {prize.entryAmount.toLocaleString()}{" "}
                  {prize.entryCurrency}
                </span>
              </div>

              <button
                type="button"
                className="modal-confirm"
                onClick={() => setJoinSuccess(false)}
              >
                View Giveaway
              </button>
            </section>
          )}

          <div className="details-card">
            <span className="section-eyebrow">HOW THIS GIVEAWAY WORKS</span>

            <div className="detail-steps">
              <div>
                <strong>01</strong>
                <span>Review the prize and entry requirements.</span>
              </div>
              <div>
                <strong>02</strong>
                <span>Verify your available reward balance.</span>
              </div>
              <div>
                <strong>03</strong>
                <span>Confirm your participation.</span>
              </div>
              <div>
                <strong>04</strong>
                <span>Your entry is recorded securely.</span>
              </div>
              <div>
                <strong>05</strong>
                <span>Giveaway remains active until the end time.</span>
              </div>
              <div>
                <strong>06</strong>
                <span>Winner selection happens after the giveaway ends.</span>
              </div>
              <div>
                <strong>07</strong>
                <span>Eligible winners can complete the claim process.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="details-card details-info">
          <span className="section-eyebrow">IMPORTANT INFORMATION</span>
          <h2>Before you join</h2>

          <div className="details-accordion">
            <details open>
              <summary>Duration &amp; timing</summary>
              <div className="accordion-content">
                <p>
                  <strong>Start:</strong>{" "}
                  {new Date(giveaway.startAt).toLocaleString()}
                </p>
                <p>
                  <strong>End:</strong>{" "}
                  {new Date(giveaway.endAt).toLocaleString()}
                </p>
                <p>
                  Participation is available only while the giveaway is active.
                </p>
              </div>
            </details>

            <details>
              <summary>Entry details</summary>
              <div className="accordion-content">
                <p>
                  <strong>Entry currency:</strong>{" "}
                  {prize.entryCurrency}
                </p>
                <p>
                  <strong>Entry amount:</strong>{" "}
                  {prize.entryAmount.toLocaleString()}{" "}
                  {prize.entryCurrency}
                </p>
                <p>
                  The entry requirement is determined by the giveaway and
                  validated by the platform before participation is recorded.
                </p>
              </div>
            </details>

            <details>
              <summary>Prize details</summary>
              <div className="accordion-content">
                <p>
                  <strong>Prize:</strong> {prize.name}
                </p>
                <p>
                  <strong>Prize type:</strong>{" "}
                  {prize.type.replace("_", " ")}
                </p>
                <p>
                  <strong>Number of winners:</strong>{" "}
                  {prize.winnerCount}
                </p>
              </div>
            </details>

            <details>
              <summary>Winner &amp; selection</summary>
              <div className="accordion-content">
                <p>
                  <strong>Selection timing:</strong>{" "}
                  Winners are selected after the giveaway ends.
                </p>
                <p>
                  <strong>Winner status:</strong>{" "}
                  The current winner state is controlled by the platform.
                </p>
              </div>
            </details>

            <details>
              <summary>Claim requirements</summary>
              <div className="accordion-content">
                <p>
                  <strong>Claim method:</strong>{" "}
                  {prize.claimType === "PHYSICAL_FORM"
                    ? "Physical claim form"
                    : prize.claimType === "EMAIL"
                      ? "Email delivery"
                      : "Digital delivery"}
                </p>
                <p>
                  Winners must complete the required verification and claim
                  information within the stated claim window.
                </p>
              </div>
            </details>

            <details>
              <summary>Eligibility &amp; platform rules</summary>
              <div className="accordion-content">
                <p>
                  <strong>Account eligibility:</strong>{" "}
                  Eligible VELOOP users only.
                </p>
                <p>
                  Participation must follow the giveaway rules and applicable
                  platform requirements.
                </p>
              </div>
            </details>

            <details>
              <summary>Fraud prevention</summary>
              <div className="accordion-content">
                <p>
                  Suspicious, duplicated, blocked, or abusive participation may
                  be flagged or rejected by the platform.
                </p>
                <p>
                  Participation checks are performed by the backend before an
                  entry is recorded.
                </p>
              </div>
            </details>
          </div>
        </section>

        <section className="details-card details-rules">
          <span className="section-eyebrow">TERMS &amp; CONDITIONS</span>
          <h2>Giveaway Rules</h2>

          <div className="rules-grid">
            <div>
              <strong>One entry per user</strong>
              <p>
                Each eligible user can participate only once in this giveaway.
              </p>
            </div>

            <div>
              <strong>Entry fee is final</strong>
              <p>
                Your required entry amount is determined by the active giveaway
                and deducted from the matching reward balance.
              </p>
            </div>

            <div>
              <strong>Winner selection</strong>
              <p>
                Winners are selected only after the giveaway has ended.
              </p>
            </div>

            <div>
              <strong>Winner verification</strong>
              <p>
                A winner must be verified before the prize claim can be
                submitted.
              </p>
            </div>

            <div>
              <strong>Claim deadline</strong>
              <p>
                Eligible winners must complete the claim process within the
                stated claim window.
              </p>
            </div>

            <div>
              <strong>Fair participation</strong>
              <p>
                Suspicious, blocked, duplicated, or abusive participation may
                be rejected according to platform rules.
              </p>
            </div>
          </div>
        </section>

        <section className="details-card about-prize-card">
          <div className="about-prize-layout">
            <div className="about-prize-image-wrap">
              <img
                src={prize.image || "/prizes/amazon-2000.png"}
                alt={prize.name}
                className="about-prize-image"
                loading="lazy"
              />
            </div>

            <div className="about-prize-content">
              <span className="section-eyebrow">ABOUT THE PRIZE</span>
              <h2>{prize.name}</h2>

              <p className="details-description">
                {prize.description || giveaway.description}
              </p>

              <div className="about-prize-facts">
                <div>
                  <span>Prize Type</span>
                  <strong>{prize.type.replace("_", " ")}</strong>
                </div>

                <div>
                  <span>Winners</span>
                  <strong>{prize.winnerCount.toLocaleString()}</strong>
                </div>

                <div>
                  <span>Claim Method</span>
                  <strong>
                    {prize.claimType === "PHYSICAL_FORM"
                      ? "Physical Claim Form"
                      : prize.claimType === "EMAIL"
                        ? "Email Delivery"
                        : "Digital Delivery"}
                  </strong>
                </div>
              </div>

              <div className="about-prize-note">
                <ShieldCheck size={18} />
                <span>
                  Winners are verified before the prize claim is processed.
                </span>
              </div>
            </div>
          </div>
        </section>

        {isEnded && (
          <section className="details-card public-results-card" aria-live="polite">
            <div className="public-results-header">
              <div>
                <span className="section-eyebrow">WINNER RESULTS</span>
                <h2>Winner(s) Announced</h2>
              </div>

              <strong>{publicWinners.length}</strong>
            </div>

            {publicWinners.length > 0 ? (
              <div className="public-results-list">
                {publicWinners.map((publicWinner, index) => (
                  <div
                    className="public-result-item"
                    key={`${publicWinner.userId}-${publicWinner.prizeId}-${index}`}
                  >
                    <div>
                      <strong>
                        {publicWinner.userId || "Winner"}
                      </strong>
                      <span>
                        {prize.name}
                      </span>
                    </div>

                    <span>
                      {publicWinner.selectedAt
                        ? new Date(
                            publicWinner.selectedAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Selected"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="winner-empty">
                <ShieldCheck size={24} />
                <strong>Winner information is being prepared.</strong>
                <span>
                  The winner result will appear once selection is complete.
                </span>
              </div>
            )}
          </section>
        )}

        {winner && (
          <section className="winner-claim-area">
            <div>
              <span className="section-eyebrow">WINNER</span>
              <h2>Congratulations! You won {winner.prizeName || winner.prize}.</h2>
              <p>
                Your winner status has been verified. Claim your prize within{" "}
                {winner.claimDeadline}.
              </p>
            </div>

            <button
              type="button"
              className="claim-prize-btn"
              onClick={() => setShowClaimModal(true)}
            >
              Claim Your Prize
            </button>
          </section>
        )}

        {isEnded &&
          isAuthenticated &&
          alreadyJoined &&
          participationLoaded &&
          !winner && (
            <section className="non-winner-area" aria-live="polite">
              <div className="non-winner-icon">
                <CheckCircle2 size={28} />
              </div>

              <div>
                <span className="section-eyebrow">GIVEAWAY COMPLETE</span>
                <h2>Thanks for participating!</h2>
                <p>
                  Winners have been announced for this giveaway. Keep
                  participating for the next chance to win.
                </p>
              </div>

              <Link to="/giveaways" className="modal-confirm">
                Explore Giveaways
              </Link>
            </section>
          )}

        <PrizeClaim
          open={showClaimModal}
          winner={winner}
          giveaway={giveaway}
          onClose={() => setShowClaimModal(false)}
        />
        <JoinConfirmationModal
          open={showJoinModal}
          giveaway={giveaway}
          balance={balance}
          balanceAfter={balanceAfter}
          joining={joining}
          onCancel={() => setShowJoinModal(false)}
          onConfirm={async () => {
            const token = localStorage.getItem("veloop_token");

            if (!token) {
              setShowJoinModal(false);
              setJoinError("Please login before participating.");
              return;
            }

            setJoining(true);
            setJoinError("");

            try {
              await joinGiveaway(giveaway.giveawayId, token);

              const meResponse = await getMe(token);

              setUser(meResponse.data);
              setJoined(true);
              setJoinSuccess(true);
              setShowJoinModal(false);

              window.dispatchEvent(
                new CustomEvent("veloop:balance-updated")
              );
            } catch (error) {
              setJoinError(error.message || "Unable to join this giveaway.");
            } finally {
              setJoining(false);
            }
          }}
        />
      </div>
      </main>
      <div className="details-footer">
        <div className="details-container">
          <Footer />
        </div>
      </div>
    </>
  );
}

export default GiveawayDetails;
