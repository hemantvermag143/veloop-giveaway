import { ArrowDownLeft, Clock3, RefreshCcw, WalletCards } from "lucide-react";
import styles from "./TransactionHistory.module.css";

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TransactionHistory({ transactions = [], loading = false }) {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <div>
          <span className="section-eyebrow">WALLET ACTIVITY</span>
          <h2>Transaction History</h2>
          <p>
            A clear record of your giveaway entries and wallet deductions.
          </p>
        </div>

        <div className={styles.icon} aria-hidden="true">
          <WalletCards size={22} />
        </div>
      </div>

      {loading ? (
        <div className={styles.state}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      ) : transactions.length === 0 ? (
        <div className={styles.empty}>
          <Clock3 size={24} />
          <strong>No transactions yet</strong>
          <span>Your giveaway entry activity will appear here.</span>
        </div>
      ) : (
        <div className={styles.list}>
          {transactions.map((transaction) => {
            const isReversal = transaction.type === "REVERSAL";

            return (
              <article
                key={transaction.transactionId}
                className={styles.item}
              >
                <div className={styles.main}>
                  <div className={styles.type}>
                    <span
                      className={
                        isReversal
                          ? `${styles.badge} ${styles.reversal}`
                          : styles.badge
                      }
                    >
                      {isReversal ? (
                        <RefreshCcw size={15} />
                      ) : (
                        <ArrowDownLeft size={15} />
                      )}
                    </span>

                    <div>
                      <strong>
                        {isReversal ? "Entry Reversal" : "Giveaway Entry"}
                      </strong>
                      <span>
                        {transaction.giveawayId} · {transaction.prizeId}
                      </span>
                    </div>
                  </div>

                  <div className={styles.amount}>
                    <strong>
                      {isReversal ? "+" : "-"}
                      {Number(transaction.amount || 0).toLocaleString()}{" "}
                      {transaction.currency}
                    </strong>
                    <span>{transaction.status}</span>
                  </div>
                </div>

                <div className={styles.meta}>
                  <span>{formatDate(transaction.createdAt)}</span>
                  <span>
                    Balance:{" "}
                    {Number(transaction.balanceAfter || 0).toLocaleString()}{" "}
                    {transaction.currency}
                  </span>
                  <span className={styles.id}>
                    ID: {transaction.transactionId}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default TransactionHistory;
