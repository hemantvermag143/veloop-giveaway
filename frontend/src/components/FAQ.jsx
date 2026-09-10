import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do I participate in a giveaway?",
    answer:
      "Login to your VELOOP account, review the giveaway requirements, verify your available balance and confirm your participation.",
  },
  {
    question: "What happens after I join?",
    answer:
      "Your participation is recorded and the applicable entry amount is processed according to the giveaway rules.",
  },
  {
    question: "When are winners announced?",
    answer:
      "Winners are announced after the giveaway has ended and the winner selection process is completed.",
  },
  {
    question: "Can I participate more than once?",
    answer:
      "Participation rules depend on the specific giveaway. Review the individual giveaway details before joining.",
  },
  {
    question: "What happens if I win?",
    answer:
      "Eligible winners will see a claim option with the information required to receive or process their prize.",
  },
  {
    question: "How is suspicious activity handled?",
    answer:
      "Suspicious, fraudulent or abusive activity may be flagged or blocked according to platform rules and fraud-prevention controls.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section className="faq-section" id="faq">
      <div className="section-heading">
        <span className="section-eyebrow">HELP CENTER</span>
        <h2>Frequently Asked Questions</h2>
        <p>Everything you need to know before participating.</p>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div className={`faq-item ${isOpen ? "open" : ""}`} key={faq.question}>
              <button
                type="button"
                className="faq-question"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={19}
                  className={isOpen ? "rotated" : ""}
                />
              </button>

              {isOpen && <div className="faq-answer">{faq.answer}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FAQ;
