import { useEffect, useState } from "react";
import { CheckCircle2, Gift, X } from "lucide-react";
import { getMyClaim, submitClaim } from "../services/api";

function PrizeClaim({ winner, giveaway, open, onClose }) {
  const [status, setStatus] = useState("NOT_SUBMITTED");
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pin: "",
    email: "",
  });

  useEffect(() => {
    let mounted = true;

    async function loadClaim() {
      const token = localStorage.getItem("veloop_token");

      if (!open || !winner || !giveaway?.giveawayId || !token) return;

      setLoading(true);
      setError("");

      try {
        const response = await getMyClaim(giveaway.giveawayId, token);

        if (!mounted) return;

        setStatus(response.data?.status || "NOT_SUBMITTED");
        setClaim(response.data?.claim || response.data || null);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to load claim status.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadClaim();

    return () => {
      mounted = false;
    };
  }, [open, winner, giveaway?.giveawayId]);

  if (!open || !winner) return null;

  const prizeName = winner.prizeName || winner.prize || "your prize";
  const prizeType = winner.prizeType || winner.type || "GIFT_CARD";
  const isPhysical = prizeType === "PHYSICAL";

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("veloop_token");

    if (!token) {
      setError("Please login before submitting your claim.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const details = isPhysical
        ? {
            fullName: form.fullName,
            phone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
            pin: form.pin,
          }
        : {
            email: form.email,
          };

      const response = await submitClaim(
        giveaway.giveawayId,
        details,
        token
      );

      setStatus(response.data?.status || "SUBMITTED");
      setClaim(response.data || null);
    } catch {
      setError(
        "We couldn't submit your claim. Please check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const claimDeadline = claim?.claimDeadline
    ? new Date(claim.claimDeadline).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : winner.claimDeadline || "7 days after giveaway ends";

  return (
    <div className="modal-backdrop">
      <div
        className="claim-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close claim modal"
        >
          <X size={19} />
        </button>

        {loading ? (
          <div className="claim-success">
            <div className="claim-success-icon">
              <Gift size={28} />
            </div>
            <span className="section-eyebrow">CLAIM</span>
            <h2>Loading claim status...</h2>
            <p>Please wait while we verify your claim.</p>
          </div>
        ) : status !== "NOT_SUBMITTED" ? (
          <div className="claim-success">
            <div className="claim-success-icon">
              <CheckCircle2 size={28} />
            </div>

            <span className="section-eyebrow">CLAIM STATUS</span>
            <h2>
              {status === "SUBMITTED"
                ? "Claim Submitted ✓"
                : status === "PROCESSING"
                  ? "Claim Processing"
                  : status === "COMPLETED"
                    ? "Prize Claim Completed ✓"
                    : status === "EXPIRED"
                      ? "Claim Window Expired"
                      : `Claim ${status}`}
            </h2>

            <p>
              {status === "EXPIRED" ? (
                <>
                  The claim window for <strong>{prizeName}</strong> has expired
                  and this claim can no longer be submitted.
                </>
              ) : (
                <>
                  Your claim for <strong>{prizeName}</strong> is currently{" "}
                  <strong>{status.replaceAll("_", " ")}</strong>.
                </>
              )}
            </p>

            <div className="claim-status-box">
              <span>Current status</span>
              <strong>{status.replaceAll("_", " ")}</strong>
              <small>Claim deadline: {claimDeadline}</small>
            </div>

            <button
              type="button"
              className="modal-confirm"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="modal-icon">
              <Gift size={24} />
            </div>

            <div className="modal-header">
              <span className="section-eyebrow">CLAIM YOUR PRIZE</span>
              <h2 id="claim-title">Congratulations!</h2>
              <p>
                You won <strong>{prizeName}</strong>.
              </p>
            </div>

            <div className="claim-verification">
              <div>
                <span>Giveaway</span>
                <strong>{giveaway.title}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>WINNER VERIFIED ✓</strong>
              </div>

              <div>
                <span>Claim within</span>
                <strong>{claimDeadline}</strong>
              </div>
            </div>

            {error && (
              <div className="api-status-banner api-status-error" role="alert">
                <strong>Claim action couldn't be completed.</strong>
                <span>{error}</span>
              </div>
            )}

            <form className="claim-form" onSubmit={handleSubmit}>
              {isPhysical ? (
                <>
                  <label>
                    Full Name
                    <input
                      required
                      value={form.fullName}
                      onChange={(e) =>
                        updateField("fullName", e.target.value)
                      }
                      placeholder="Enter your full name"
                    />
                  </label>

                  <label>
                    Phone Number
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        updateField("phone", e.target.value)
                      }
                      placeholder="Enter phone number"
                    />
                  </label>

                  <label>
                    Complete Address
                    <textarea
                      required
                      rows="3"
                      value={form.address}
                      onChange={(e) =>
                        updateField("address", e.target.value)
                      }
                      placeholder="Enter complete delivery address"
                    />
                  </label>

                  <div className="claim-fields-row">
                    <label>
                      City
                      <input
                        required
                        value={form.city}
                        onChange={(e) =>
                          updateField("city", e.target.value)
                        }
                        placeholder="City"
                      />
                    </label>

                    <label>
                      State
                      <input
                        required
                        value={form.state}
                        onChange={(e) =>
                          updateField("state", e.target.value)
                        }
                        placeholder="State"
                      />
                    </label>

                    <label>
                      PIN Code
                      <input
                        required
                        inputMode="numeric"
                        value={form.pin}
                        onChange={(e) =>
                          updateField("pin", e.target.value)
                        }
                        placeholder="PIN"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label>
                  Email Address
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                    placeholder="Enter email for your gift card"
                  />
                  <small>
                    Enter the email where you want to receive your gift card.
                  </small>
                </label>
              )}

              <button
                type="submit"
                className="modal-confirm"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Claim"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default PrizeClaim;
