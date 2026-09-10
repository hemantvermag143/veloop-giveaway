import { CheckCircle2, X, Wallet } from "lucide-react";

function JoinConfirmationModal({
  open,
  giveaway,
  balance,
  balanceAfter,
  onCancel,
  onConfirm,
  joining = false,
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="join-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-modal-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onCancel}
          aria-label="Close confirmation modal"
        >
          <X size={19} />
        </button>

        <div className="modal-icon">
          <CheckCircle2 size={24} />
        </div>

        <div className="modal-header">
          <span className="section-eyebrow">CONFIRM PARTICIPATION</span>
          <h2 id="join-modal-title">Ready to join?</h2>
          <p>
            Review your entry details before confirming your participation.
          </p>
        </div>

        <div className="modal-prize">
          <span>Prize</span>
          <strong>{giveaway.prizes?.[0]?.name || giveaway.title}</strong>
        </div>

        <div className="modal-summary">
          <div>
            <span>Entry Fee</span>
            <strong>
              {(giveaway.prizes?.[0]?.entryAmount || 0).toLocaleString()}{" "}
              {giveaway.prizes?.[0]?.entryCurrency || ''}
            </strong>
          </div>

          <div>
            <span>Your Balance</span>
            <strong>
              {balance.toLocaleString()} {giveaway.prizes?.[0]?.entryCurrency || ''}
            </strong>
          </div>

          <div>
            <span>Balance After Joining</span>
            <strong>
              {balanceAfter.toLocaleString()} {giveaway.prizes?.[0]?.entryCurrency || ''}
            </strong>
          </div>
        </div>

        <div className="modal-note">
          <Wallet size={17} />
          <span>
            By continuing, you confirm that you have reviewed the giveaway
            rules and terms.
          </span>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-cancel"
            onClick={onCancel}
            disabled={joining}
          >
            Cancel
          </button>

          <button
            type="button"
            className="modal-confirm"
            onClick={onConfirm}
            disabled={joining}
            aria-busy={joining}
          >
            {joining ? "Joining Giveaway..." : "Confirm & Join"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinConfirmationModal;
