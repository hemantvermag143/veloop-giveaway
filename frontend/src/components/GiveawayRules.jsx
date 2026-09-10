import { FileText, ShieldCheck, Scale } from "lucide-react";

function GiveawayRules() {
  const rules = [
    "Each giveaway follows its stated participation and eligibility requirements.",
    "Entry currency and entry amount are specific to each giveaway.",
    "Winner selection takes place after the giveaway ends.",
    "Suspicious, fraudulent, abusive or rule-breaking activity may result in disqualification.",
    "Participants should review the giveaway terms before confirming an entry.",
    "Final participation and winner decisions are controlled by the platform backend.",
  ];

  return (
    <section className="rules-section" id="rules">
      <div className="section-heading">
        <span className="section-eyebrow">TRANSPARENT & FAIR</span>
        <h2>Giveaway Rules</h2>
        <p>
          Review the key participation rules before joining a giveaway.
        </p>
      </div>

      <div className="rules-grid">
        {rules.map((rule, index) => (
          <div className="rule-card" key={rule}>
            <div className="rule-icon">
              {index === 0 ? (
                <FileText size={19} />
              ) : index === 3 ? (
                <ShieldCheck size={19} />
              ) : (
                <Scale size={19} />
              )}
            </div>

            <span>{rule}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default GiveawayRules;
