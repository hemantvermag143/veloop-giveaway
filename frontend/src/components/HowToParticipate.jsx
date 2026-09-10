import {
  LogIn,
  ListChecks,
  Coins,
  Trophy,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Sign Up / Login",
    description: "Create your VELOOP account or login to continue.",
    icon: LogIn,
  },
  {
    number: "02",
    title: "Complete Tasks",
    description: "Complete eligible activities available on VELOOP.",
    icon: ListChecks,
  },
  {
    number: "03",
    title: "Earn Entries",
    description: "Collect eligible entries and rewards for participation.",
    icon: Coins,
  },
  {
    number: "04",
    title: "Win Rewards",
    description: "Eligible winners are selected after the giveaway ends.",
    icon: Trophy,
  },
];

function HowToParticipate() {
  return (
    <section className="how-section">
      <div className="section-heading">
        <span className="section-eyebrow">HOW IT WORKS</span>
        <h2>How to Participate?</h2>
        <p>
          Follow these simple steps to enter eligible VELOOP giveaways.
        </p>
      </div>

      <div className="how-timeline">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div className="how-step" key={step.number}>
              <div className="how-step-icon">
                <Icon size={21} />
              </div>

              <span className="how-step-number">{step.number}</span>

              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default HowToParticipate;
