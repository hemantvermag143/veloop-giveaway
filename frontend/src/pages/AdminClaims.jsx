import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock3, ShieldCheck, Truck } from "lucide-react";
import {
  completeAdminClaim,
  getAdminClaims,
  getMe,
  processAdminClaim,
} from "../services/api";

function AdminClaims() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  async function loadClaims() {
    const token = localStorage.getItem("veloop_token");

    if (!token) {
      setError("Please login as an admin.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const me = await getMe(token);

      if (me.data?.role !== "ADMIN") {
        navigate("/giveaways", { replace: true });
        return;
      }

      const response = await getAdminClaims(token);
      setClaims(response.data || []);
    } catch (err) {
      setError(err.message || "Unable to load claims.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClaims();
  }, []);

  async function handleProcess(claimId) {
    const token = localStorage.getItem("veloop_token");
    if (!token) return;

    try {
      setActionId(claimId);
      await processAdminClaim(claimId, token);
      await loadClaims();
    } catch (err) {
      setError(err.message || "Unable to process claim.");
    } finally {
      setActionId("");
    }
  }

  async function handleComplete(claimId) {
    const token = localStorage.getItem("veloop_token");
    if (!token) return;

    try {
      setActionId(claimId);
      await completeAdminClaim(claimId, token);
      await loadClaims();
    } catch (err) {
      setError(err.message || "Unable to complete claim.");
    } finally {
      setActionId("");
    }
  }

  const statusIcon = {
    SUBMITTED: <Clock3 size={18} />,
    PROCESSING: <Truck size={18} />,
    COMPLETED: <CheckCircle2 size={18} />,
    EXPIRED: <ShieldCheck size={18} />,
  };

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-header">
          <div>
            <span className="section-eyebrow">VELOOP ADMIN</span>
            <h1>Prize Claims</h1>
            <p>Review submitted claims and manage their delivery status.</p>
          </div>

          <a className="primary-btn" href="/giveaways">
            Back to Giveaways
          </a>
        </div>

        {error && (
          <div className="admin-error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="admin-empty">
            <Clock3 size={24} />
            <strong>Loading claims...</strong>
            <span>Please wait a moment.</span>
          </div>
        ) : claims.length === 0 ? (
          <div className="admin-empty">
            <ShieldCheck size={24} />
            <strong>No prize claims found</strong>
            <span>Submitted winner claims will appear here.</span>
          </div>
        ) : (
          <div className="admin-claims-list">
            {claims.map((claim) => (
              <article className="admin-claim-card" key={claim._id}>
                <div className="admin-claim-main">
                  <div className="admin-claim-icon">
                    {statusIcon[claim.status] || <ShieldCheck size={18} />}
                  </div>

                  <div className="admin-claim-content">
                    <div className="admin-claim-topline">
                      <strong>{claim.prizeId}</strong>
                      <span className={`admin-status status-${claim.status.toLowerCase()}`}>
                        {claim.status}
                      </span>
                    </div>

                    <span>Giveaway: {claim.giveawayId}</span>
                    <small>Winner: {claim.userId}</small>
                    <small>
                      Deadline:{" "}
                      {claim.claimDeadline
                        ? new Date(claim.claimDeadline).toLocaleString("en-IN")
                        : "—"}
                    </small>
                  </div>
                </div>

                <div className="admin-claim-actions">
                  {claim.status === "SUBMITTED" && (
                    <button
                      type="button"
                      className="admin-action-btn"
                      disabled={actionId === claim._id}
                      onClick={() => handleProcess(claim._id)}
                    >
                      {actionId === claim._id ? "Processing..." : "Move to Processing"}
                    </button>
                  )}

                  {claim.status === "PROCESSING" && (
                    <button
                      type="button"
                      className="admin-action-btn"
                      disabled={actionId === claim._id}
                      onClick={() => handleComplete(claim._id)}
                    >
                      {actionId === claim._id ? "Completing..." : "Mark Completed"}
                    </button>
                  )}

                  {(claim.status === "COMPLETED" ||
                    claim.status === "EXPIRED") && (
                    <span className="admin-action-done">
                      {claim.status === "COMPLETED"
                        ? "Claim completed"
                        : "Claim expired"}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminClaims;
