import { useMemo, useState } from "react";

export default function DatasetExplorer({ bins, onSelect }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const rows = useMemo(() => bins.filter((b) => {
    const q = query.toLowerCase();
    return (!q || b.Bin_ID.toLowerCase().includes(q)) &&
      (filter === "All" || b.Collection_Priority === filter);
  }), [bins, query, filter]);

  return (
    <section className="section dataset" id="dataset">
      <div className="section-heading">
        <div>
          <span className="eyebrow">DATASET EXPLORER</span>
          <h2>The prototype data is visible—not hidden behind the UI.</h2>
        </div>
        <span className="section-note">20 operational demo records · source: project prototype subset</span>
      </div>
      <div className="table-tools">
        <input placeholder="Search bin ID…" value={query} onChange={(e) => setQuery(e.target.value)} />
        {["All", "High", "Medium", "Low"].map((f) => <button className={filter === f ? "active" : ""} key={f} onClick={() => setFilter(f)}>{f}</button>)}
      </div>
      <div className="data-table-wrap">
        <table>
          <thead><tr><th>BIN</th><th>CAPACITY</th><th>EST. WASTE</th><th>PROBABILITY</th><th>CLASS</th><th>PRIORITY</th><th /></tr></thead>
          <tbody>
            {rows.map((b) => <tr key={b.Bin_ID}>
              <td><b>{b.Bin_ID}</b></td><td>{b.Capacity_kg} kg</td><td>{b.Estimated_Waste_kg.toFixed(1)} kg</td><td>{Math.round(b.Emptying_Probability * 100)}%</td><td>{b.Predicted_Class}</td><td><span className={`priority ${b.Collection_Priority.toLowerCase()}`}>{b.Collection_Priority}</span></td><td><button onClick={() => onSelect(b.Bin_ID)}>Inspect</button></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
