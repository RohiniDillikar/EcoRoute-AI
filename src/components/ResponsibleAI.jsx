import { useState } from "react";

const items = [
  ["01", "TRANSPARENCY", "Show probability, threshold and feature importance instead of presenting an unexplained collection command."],
  ["02", "FAIRNESS", "Validate performance across container types, neighborhoods and operating conditions before real deployment; monitor subgroup error rates."],
  ["03", "PRIVACY", "Use operational sensor and route information only for the stated service purpose. Avoid unnecessary personally identifiable data."],
  ["04", "HUMAN OVERSIGHT", "Treat AI output as decision support. A municipal operator can inspect, queue, remove or reroute a bin."],
  ["05", "SAFETY", "Capacity, traffic and road constraints must be verified against live fleet and road systems before dispatch."],
];

export default function ResponsibleAI() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section responsible" id="responsible">
      <div className="section-heading">
        <div>
          <span className="eyebrow">RESPONSIBLE AI</span>
          <h2>Trust is part of the system design.</h2>
        </div>
      </div>
      <div className="responsible-grid">
        <div className="responsible-list">
          {items.map(([n, title, text], i) => (
            <button className={open === i ? "open" : ""} key={n} onClick={() => setOpen(i)}>
              <span>{n}</span><b>{title}</b><em>{open === i ? "−" : "+"}</em>
              {open === i && <p>{text}</p>}
            </button>
          ))}
        </div>
        <div className="trust-panel">
          <div className="shield">◇</div>
          <h3>Operator in the loop</h3>
          <p>EcoRoute AI exposes the evidence behind a prediction and keeps dispatch as a human-controlled action.</p>
          <div className="trust-tags"><span>EXPLAINABLE</span><span>PRIVACY-AWARE</span><span>MONITORED</span></div>
        </div>
      </div>
    </section>
  );
}
