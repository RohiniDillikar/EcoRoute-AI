import { useState } from "react";

const steps = [
  ["01", "PROBLEM", "Frame the waste-collection inefficiency and affected stakeholders."],
  ["02", "IDEATION", "Use IBM BOB to refine the product concept, flows and differentiators."],
  ["03", "BUILD", "Translate the chosen workflow into an AI + data application."],
  ["04", "VALIDATE", "Inspect model metrics, responsible-AI risks and prototype behavior."],
  ["05", "DEMO", "Connect prediction → dispatch → route → impact in one user flow."],
];

export default function BOBWorkflow() {
  const [selected, setSelected] = useState(2);
  return (
    <section className="section bob" id="bob">
      <div className="section-heading">
        <div>
          <span className="eyebrow">IBM BOB × ECOROUTE</span>
          <h2>From idea refinement to an executable demo.</h2>
        </div>
      </div>
      <div className="bob-flow">
        {steps.map(([n, title], i) => (
          <button key={n} className={selected === i ? "selected" : ""} onClick={() => setSelected(i)}>
            <span>{n}</span><b>{title}</b>{i < steps.length - 1 && <i>→</i>}
          </button>
        ))}
      </div>
      <div className="bob-detail">
        <span className="eyebrow">{steps[selected][0]} / {steps[selected][1]}</span>
        <h3>{steps[selected][2]}</h3>
        <p>BOB is used as a structured innovation and development aid; the project still requires human review of data, model assumptions and implementation decisions.</p>
      </div>
    </section>
  );
}
