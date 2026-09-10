import { ShieldCheck, LockKeyhole, Scale, BadgeCheck } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Secure Participation",
    text: "Your participation follows protected account and validation checks.",
  },
  {
    icon: LockKeyhole,
    title: "Protected Data",
    text: "Sensitive claim information is handled only when required.",
  },
  {
    icon: Scale,
    title: "Fair Process",
    text: "Winner selection and participation rules are controlled by the platform.",
  },
  {
    icon: BadgeCheck,
    title: "Transparent Rewards",
    text: "Giveaway status, entry requirements and winner information are clearly presented.",
  },
];

function TrustSection() {
  return (
    <section className="trust-section">
      <div className="section-heading">
        <span className="section-eyebrow">WHY VELOOP</span>
        <h2>Built for Trust</h2>
        <p>
          A reward experience designed to feel transparent, secure and reliable.
        </p>
      </div>

      <div className="trust-grid">
        {trustItems.map((item) => {
          const Icon = item.icon;

          return (
            <article className="trust-card" key={item.title}>
              <div className="trust-icon">
                <Icon size={21} />
              </div>

              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default TrustSection;
