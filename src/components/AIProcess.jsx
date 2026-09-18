import { motion } from "framer-motion";

const stages = [
  ["01", "INGEST", "Read smart-bin signals"],
  ["02", "PREDICT", "Estimate emptying probability"],
  ["03", "PRIORITIZE", "Convert probability into urgency"],
  ["04", "OPTIMIZE", "Build capacity-aware routes"],
  ["05", "ESTIMATE", "Model fuel + CO₂ impact"],
];

export default function AIProcess({ active, done }) {
  return (
    <div className="ai-process">
      {stages.map(([n, title, desc], i) => {
        const state = done ? "done" : active === i ? "active" : active > i ? "done" : "";
        return (
          <motion.div
            key={n}
            className={`process-node ${state}`}
            animate={active === i && !done ? { scale: [1, 1.025, 1] } : {}}
            transition={{ duration: 0.7, repeat: Infinity }}
          >
            <div className="process-num">{n}</div>
            <div>
              <b>{title}</b>
              <span>{desc}</span>
            </div>
            <em>{state === "done" ? "✓" : state === "active" ? "…" : "○"}</em>
          </motion.div>
        );
      })}
    </div>
  );
}
