import { useMemo, useState } from "react";
import { cityBins, routeData } from "../data/data";

export default function ScenarioLab({ city = "Visakhapatnam" }) {
  const [threshold, setThreshold] = useState(70);
  const [efficiency, setEfficiency] = useState(15);
  const [capacity, setCapacity] = useState(750);
  const [traffic, setTraffic] = useState(100);
  const [mode, setMode] = useState("balanced");

  const result = useMemo(() => {
    const operationalBins = cityBins(city);
    const cutoff = mode === "urgent" ? 80 : mode === "all" ? 40 : threshold;
    const selected = operationalBins.filter((b) => b.Emptying_Probability * 100 >= cutoff);
    const waste = selected.reduce((s, b) => s + b.Estimated_Waste_kg, 0);
    const truckCount = Math.max(1, Math.ceil(waste / capacity));
    const scale = selected.length / 11;
    const distance = routeData.stats.optimizedDistanceKm * scale * (traffic / 100) * (truckCount > 2 ? 1.12 : 1);
    const fuel = routeData.stats.optimizedFuelL * (distance / routeData.stats.optimizedDistanceKm) * (1 - efficiency / 100);
    const co2 = fuel * (routeData.stats.optimizedCo2Kg / routeData.stats.optimizedFuelL);
    return { selected: selected.length, waste, truckCount, distance, fuel, co2, cutoff };
  }, [threshold, efficiency, capacity, traffic, mode, city]);

  return (
    <section className="section scenario-section" id="scenario">
      <div className="section-heading">
        <div>
          <span className="eyebrow">WHAT-IF LAB</span>
          <h2>Change the policy. Watch the operation respond.</h2>
        </div>
        <span className="section-note">All outputs are simulated scenarios.</span>
      </div>

      <div className="scenario-grid">
        <div className="controls">
          <label>Collection threshold <b>{threshold}%</b></label>
          <input type="range" min="40" max="90" value={threshold} onChange={(e) => setThreshold(+e.target.value)} />
          <small>Bins at or above this model probability enter the balanced collection set.</small>

          <label>Truck efficiency gain <b>+{efficiency}%</b></label>
          <input type="range" min="0" max="30" value={efficiency} onChange={(e) => setEfficiency(+e.target.value)} />

          <label>Fleet capacity <b>{capacity} kg</b></label>
          <input type="range" min="500" max="1000" step="250" value={capacity} onChange={(e) => setCapacity(+e.target.value)} />

          <label>Traffic factor <b>{traffic}%</b></label>
          <input type="range" min="80" max="140" value={traffic} onChange={(e) => setTraffic(+e.target.value)} />

          <div className="mode-buttons">
            <button className={mode === "urgent" ? "active" : ""} onClick={() => setMode("urgent")}>URGENT ONLY</button>
            <button className={mode === "balanced" ? "active" : ""} onClick={() => setMode("balanced")}>BALANCED</button>
            <button className={mode === "all" ? "active" : ""} onClick={() => setMode("all")}>MONITOR ALL</button>
          </div>
        </div>

        <div className="scenario-output">
          <div className="scenario-title">SCENARIO OUTPUT <span>{city} · cutoff {result.cutoff}%</span></div>
          <div className="scenario-cards">
            <div><span>BINS TO COLLECT</span><strong>{result.selected}</strong></div>
            <div><span>WASTE</span><strong>{result.waste.toFixed(0)}<small> kg</small></strong></div>
            <div><span>ACTIVE TRUCKS</span><strong>{result.truckCount}</strong></div>
            <div><span>ROUTE KM</span><strong>{result.distance.toFixed(2)}</strong></div>
            <div><span>FUEL</span><strong>{result.fuel.toFixed(2)}<small> L</small></strong></div>
            <div><span>CO₂ ESTIMATE</span><strong>{result.co2.toFixed(2)}<small> kg</small></strong></div>
          </div>
          <div className="scenario-equation">
            <span>MODELLED FLOW</span>
            <b>sensor signal → probability → threshold → fleet capacity → route estimate → emissions estimate</b>
          </div>
        </div>
      </div>
    </section>
  );
}
