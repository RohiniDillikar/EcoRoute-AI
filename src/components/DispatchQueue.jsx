export default function DispatchQueue({
  queue,
  bins,
  truck,
  setTruck,
  onRemove,
  onClear,
  onBuild,
}) {
  const selected = bins.filter((b) => queue.includes(b.Bin_ID));
  const kg = selected.reduce((s, b) => s + b.Estimated_Waste_kg, 0);

  if (!queue.length) return null;

  return (
    <div className="dispatch-tray">
      <div>
        <span className="eyebrow">DISPATCH QUEUE</span>
        <strong>{queue.length} BINS · {kg.toFixed(0)} KG</strong>
      </div>
      <select value={truck} onChange={(e) => setTruck(e.target.value)}>
        <option value="T02">Assign T02 · 750 kg</option>
        <option value="T03">Assign T03 · 1000 kg</option>
      </select>
      <button className="primary-btn" onClick={onBuild}>BUILD ROUTE FROM QUEUE</button>
      <button className="icon-btn" onClick={onClear}>×</button>
      <div className="queue-items">
        {selected.map((b) => (
          <button key={b.Bin_ID} onClick={() => onRemove(b.Bin_ID)}>{b.Bin_ID} · {b.Estimated_Waste_kg.toFixed(0)}kg</button>
        ))}
      </div>
    </div>
  );
}
