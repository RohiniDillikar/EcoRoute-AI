import { featureImportance } from "../data/data";

function Gauge({ value }) {
  const pct = Math.round(value * 100);
  return (
    <div className="gauge">
      <div className="gauge-ring" style={{ "--pct": `${pct * 3.6}deg` }}>
        <div>
          <strong>{pct}%</strong>
          <span>EMPTYING</span>
        </div>
      </div>
      <div className="gauge-copy">
        <b>{pct >= 70 ? "Collection signal detected" : pct >= 50 ? "Watch closely" : "No urgent collection signal"}</b>
        <span>Thresholds are prototype policy rules applied to the model probability.</span>
      </div>
    </div>
  );
}

export default function BinInspector({ bin, explain, setExplain, onDispatch, queued }) {
  if (!bin) {
    return (
      <aside className="inspector empty-inspector">
        <span className="eyebrow">BIN INTELLIGENCE</span>
        <h3>Select a bin on the map</h3>
        <p>Click any marker to open its explainable AI inspection. The same selection can be pushed into the dispatch queue.</p>
      </aside>
    );
  }

  const pseudoSensors = {
    FL_B: Math.round(25 + bin.Emptying_Probability * 65),
    FL_A: Math.round(20 + bin.Emptying_Probability * 60),
    VS: Math.round(30 + bin.Emptying_Probability * 70),
    FL_B_3: Math.round(25 + bin.Emptying_Probability * 55),
    FL_A_3: Math.round(20 + bin.Emptying_Probability * 52),
    FL_B_12: Math.round(18 + bin.Emptying_Probability * 48),
    FL_A_12: Math.round(15 + bin.Emptying_Probability * 46),
  };

  return (
    <aside className="inspector">
      <div className="inspector-head">
        <div>
          <span className="eyebrow">BIN INTELLIGENCE</span>
          <h3>{bin.Bin_ID}</h3>
        </div>
        <span className={`priority ${bin.Collection_Priority.toLowerCase()}`}>{bin.Collection_Priority}</span>
      </div>
      <Gauge value={bin.Emptying_Probability} />

      <div className="signal-grid">
        {Object.entries(pseudoSensors).slice(0, 6).map(([k, v]) => (
          <div key={k} className="signal">
            <span>{k}</span>
            <div><i style={{ width: `${v}%` }} /></div>
            <b>{v}</b>
          </div>
        ))}
      </div>

      <button className="primary-btn wide" onClick={() => setExplain(!explain)}>
        {explain ? "HIDE EXPLANATION" : "EXPLAIN THIS PREDICTION"}
      </button>

      {explain && (
        <div className="explanation">
          <h4>Why did the model flag {bin.Bin_ID}?</h4>
          <p>The Random Forest learns relationships between sensor features and the Emptying / Non Emptying class. In the project model, <b>VS</b> carries the largest feature importance.</p>
          <div className="importance-list">
            {featureImportance.slice(0, 5).map(([name, score]) => (
              <div key={name}>
                <span>{name}</span>
                <div><i style={{ width: `${score * 100 / 0.42}%` }} /></div>
                <b>{Math.round(score * 100)}%</b>
              </div>
            ))}
          </div>
          <small>Explanation is model-level feature importance, not a causal proof for an individual bin.</small>
        </div>
      )}

      <div className="inspector-footer">
        <div><span>EST. WASTE</span><b>{bin.Estimated_Waste_kg.toFixed(1)} kg</b></div>
        <div><span>CAPACITY</span><b>{bin.Capacity_kg} kg</b></div>
      </div>

      <button
        className={queued ? "secondary-btn wide queued-btn" : "secondary-btn wide"}
        onClick={() => onDispatch(bin.Bin_ID)}
      >
        {queued ? "REMOVE FROM DISPATCH" : "ADD TO DISPATCH QUEUE"}
      </button>
    </aside>
  );
}
