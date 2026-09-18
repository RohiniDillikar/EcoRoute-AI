import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import TopBar from "./components/TopBar";
import CityMap from "./components/CityMap";
import AIProcess from "./components/AIProcess";
import BinInspector from "./components/BinInspector";
import DispatchQueue from "./components/DispatchQueue";
import FleetCommand from "./components/FleetCommand";
import RouteStudio from "./components/RouteStudio";
import ScenarioLab from "./components/ScenarioLab";
import ModelXRay from "./components/ModelXRay";
import ResponsibleAI from "./components/ResponsibleAI";
import BOBWorkflow from "./components/BOBWorkflow";
import DatasetExplorer from "./components/DatasetExplorer";
import { bins, cityBins, routeData, interactiveOptimize, cities } from "./data/data";
import "./styles.css";

function App() {
  const [city, setCity] = useState("Visakhapatnam");
  const [selectedId, setSelectedId] = useState("B003");
  const [scan, setScan] = useState(false);
  const [scanStage, setScanStage] = useState(-1);
  const [scanDone, setScanDone] = useState(false);
  const [explain, setExplain] = useState(false);
  const [queue, setQueue] = useState([]);
  const [truck, setTruck] = useState("T02");
  const [customRoutes, setCustomRoutes] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState("T02");
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("ecoroute-theme") || "dark"; } catch { return "dark"; }
  });
  const [focusMode, setFocusMode] = useState("all");
  const [showAlerts, setShowAlerts] = useState(true);
  const [toast, setToast] = useState("");
  const [activity, setActivity] = useState([
    "System initialized — prototype data loaded",
    "Random Forest model ready — 95% test accuracy",
    "Awaiting operator analysis",
  ]);

  const activeBins = useMemo(() => cityBins(city), [city]);
  const selected = activeBins.find((b) => b.Bin_ID === selectedId);
  const high = activeBins.filter((b) => b.Emptying_Probability >= 0.70);
  const medium = activeBins.filter((b) => b.Emptying_Probability >= 0.50 && b.Emptying_Probability < 0.70);
  const candidates = [...high, ...medium];
  const totalWaste = candidates.reduce((s, b) => s + b.Estimated_Waste_kg, 0);

  useEffect(() => {
    setSelectedId("B001");
    setExplain(false);
    setCustomRoutes([]);
  }, [city]);

  const runScan = () => {
    if (scan) return;
    setScan(true);
    setScanDone(false);
    setScanStage(0);
    [1, 2, 3, 4].forEach((s) => setTimeout(() => setScanStage(s), s * 550));
    setTimeout(() => {
      setScanDone(true);
      setScan(false);
    }, 2800);
  };

  const toggleQueue = (id) => {
    setQueue((q) => q.includes(id) ? q.filter((x) => x !== id) : [...q, id]);
  };

  const buildQueueRoute = () => {
    if (!queue.length) return;
    const result = interactiveOptimize(queue, city, truck === "T02" ? 750 : 1000);
    setCustomRoutes(result);
    setSelectedTruck(truck);
    document.getElementById("routes")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reset = () => {
    setCity("Visakhapatnam");
    setSelectedId("B003");
    setScan(false);
    setScanStage(-1);
    setScanDone(false);
    setExplain(false);
    setQueue([]);
    setCustomRoutes([]);
    setSelectedTruck("T02");
    setFocusMode("all");
    setShowAlerts(true);
    setActivity(["Demo reset — ready for a fresh AI analysis"]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedCustom = customRoutes.find((r) => r.id === selectedTruck);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("ecoroute-theme", theme); } catch {}
  }, [theme]);

  const notify = (message) => {
    setToast(message);
    setActivity((a) => [message, ...a].slice(0, 6));
    setTimeout(() => setToast(""), 2200);
  };

  const focusBins = focusMode === "high"
    ? high
    : focusMode === "medium"
      ? medium
      : focusMode === "collection"
        ? candidates
        : activeBins;

  const highestRisk = [...activeBins].sort((a,b) => b.Emptying_Probability - a.Emptying_Probability)[0];

  const toggleQueueWithFeedback = (id) => {
    const wasQueued = queue.includes(id);
    toggleQueue(id);
    notify(wasQueued ? `${id} removed from dispatch queue` : `${id} added to dispatch queue`);
  };

  const quickAddHighest = () => {
    if (!highestRisk) return;
    if (!queue.includes(highestRisk.Bin_ID)) {
      setQueue((q) => [...q, highestRisk.Bin_ID]);
      notify(`${highestRisk.Bin_ID} added — highest predicted collection risk`);
    } else {
      notify(`${highestRisk.Bin_ID} is already queued`);
    }
  };

  
  const [whatIfThreshold, setWhatIfThreshold] = useState(0.65);
  const [whatIfTraffic, setWhatIfTraffic] = useState(10);
  const [whatIfCapacity, setWhatIfCapacity] = useState(750);

  const whatIfSelectedBins = activeBins
    .filter((bin) => bin.Emptying_Probability >= whatIfThreshold)
    .sort((a, b) => b.Emptying_Probability - a.Emptying_Probability);

  const whatIfBinsCount = whatIfSelectedBins.length;
  const whatIfWaste = whatIfSelectedBins.reduce(
    (sum, bin) => sum + Number(bin.Estimated_Waste_kg || 0), 0
  );
  const whatIfTrips = whatIfWaste > 0 ? Math.ceil(whatIfWaste / whatIfCapacity) : 0;
  const whatIfDistance = whatIfBinsCount
    ? 11.91 * (whatIfBinsCount / Math.max(1, activeBins.length * 0.55)) * (1 + whatIfTraffic / 100)
    : 0;
  const whatIfFuel = whatIfDistance * 0.235;
  const whatIfCo2 = whatIfFuel * 2.68;

return (
    <div>
      <TopBar
        city={city}
        setCity={(c) => { setCity(c); notify(`Switched operational context to ${c}`); }}
        onReset={reset}
        theme={theme}
        onTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="status-pill"><i /> AI OPERATIONS PROTOTYPE</div>
            <h1>Waste collection,<br /><span>before the truck moves.</span></h1>
            <p>EcoRoute AI turns smart-bin sensor signals into explainable collection priorities, capacity-aware dispatch and simulated environmental impact.</p>
            <div className="hero-actions">
              <button className="primary-btn large" onClick={runScan}>{scan ? "ANALYZING CITY…" : scanDone ? "RUN ANALYSIS AGAIN" : "RUN AI CITY ANALYSIS"} <span>↗</span></button>
              <a href="#fleet" className="secondary-btn large">OPEN FLEET COMMAND ↓</a>
              <button className="secondary-btn large" onClick={quickAddHighest}>⚡ QUEUE HIGHEST RISK</button>
            </div>
            <div className="hero-trust">
              <span>AI decision support</span><span>Human dispatch control</span><span>Simulated operational data</span>
            </div>
          </div>

          <div className="hero-map">
            <CityMap
              city={city}
              bins={activeBins}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              scanActive={scan}
              highlightedIds={scanDone ? candidates.map((b) => b.Bin_ID) : []}
              routePoints={[]}
            />
            <div className="map-stats">
              <div><span>CITY CONTEXT</span><b>{city}</b></div>
              <div><span>BINS MONITORED</span><b>{activeBins.length}</b></div>
              <div><span>COLLECTION CANDIDATES</span><b>{candidates.length}</b></div>
              <div><span>EST. WASTE</span><b>{totalWaste.toFixed(0)} kg</b></div>
            </div>
          </div>
        </section>

        <section className="section command-strip">
          <div><span className="eyebrow">LIVE OPERATIONS</span><b>{scanDone ? "AI analysis complete · operator review ready" : "Awaiting AI city scan"}</b></div>
          <div className="command-metrics">
            <span><i className="dot high-dot" /> {high.length} HIGH RISK</span>
            <span><i className="dot med-dot" /> {medium.length} MEDIUM</span>
            <span><i className="dot" /> {queue.length} QUEUED</span>
            <span><i className="dot" /> 2 ACTIVE ROUTES</span>
          </div>
        </section>

        <section className="section attention-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">OPERATOR ATTENTION</span>
              <h2>Focus the city view around what matters now.</h2>
            </div>
            <button className="ghost-btn" onClick={() => setShowAlerts(!showAlerts)}>
              {showAlerts ? "HIDE ACTIVITY" : "SHOW ACTIVITY"}
            </button>
          </div>
          <div className="attention-grid">
            <div className="focus-panel">
              <div className="focus-head"><span>MAP FOCUS</span><b>{focusBins.length} visible signals</b></div>
              <div className="focus-buttons">
                {[
                  ["all","ALL BINS"],["high","HIGH"],["medium","MEDIUM"],["collection","COLLECTION SET"]
                ].map(([key,label]) => (
                  <button key={key} className={focusMode === key ? "active" : ""} onClick={() => setFocusMode(key)}>{label}</button>
                ))}
              </div>
              <div className="focus-stats">
                <div><strong>{high.length}</strong><span>HIGH</span></div>
                <div><strong>{medium.length}</strong><span>MEDIUM</span></div>
                <div><strong>{activeBins.length-high.length-medium.length}</strong><span>LOW</span></div>
              </div>
            </div>
            {showAlerts && (
              <div className="activity-panel">
                <div className="focus-head"><span>ACTIVITY FEED</span><b>LIVE SIMULATION</b></div>
                {activity.map((item, i) => <button key={`${item}-${i}`} onClick={() => highestRisk && setSelectedId(highestRisk.Bin_ID)}><i />{item}<em>›</em></button>)}
              </div>
            )}
          </div>
        </section>

        <section className="section intelligence">
          <div className="section-heading">
            <div>
              <span className="eyebrow">AI DECISION ENGINE</span>
              <h2>From raw signal to an operational action.</h2>
            </div>
            <span className="section-note">5-stage transparent pipeline</span>
          </div>
          <AIProcess active={scanStage} done={scanDone} />
        </section>

        <section className="section bin-explorer">
          <div className="section-heading">
            <div>
              <span className="eyebrow">BIN EXPLORER</span>
              <h2>Inspect any bin</h2>
              <p className="muted">Choose a bin to load its complete city-specific AI report.</p>
            </div>
            <div className="bin-explorer-context">
              <span>{city}</span>
              <strong>{activeBins.length} monitored bins</strong>
            </div>
          </div>

          <div className="bin-selector-grid">
            {activeBins.map((bin) => {
              const pct = Math.round(bin.Emptying_Probability * 100);
              const priority = bin.Collection_Priority;
              return (
                <button
                  key={bin.Bin_ID}
                  type="button"
                  className={`bin-select-card ${selectedId === bin.Bin_ID ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedId(bin.Bin_ID);
                    setExplain(false);
                    document.getElementById("bin-report")?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }}
                >
                  <div className="bin-card-top">
                    <strong>{bin.Bin_ID}</strong>
                    <span className={`priority-badge ${priority.toLowerCase()}`}>{priority}</span>
                  </div>
                  <div className="bin-card-probability">{pct}%</div>
                  <div className="bin-card-class">{bin.Predicted_Class}</div>
                  <div className="bin-card-footer">
                    <span>{Number(bin.Estimated_Waste_kg).toFixed(1)} kg</span>
                    <span>{selectedId === bin.Bin_ID ? "SELECTED" : "VIEW REPORT →"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="section intelligence-workspace" id="bin-report">
          <div className="workspace-map">
            <CityMap
              city={city}
              bins={focusBins}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              scanActive={false}
              highlightedIds={scanDone ? candidates.map((b) => b.Bin_ID) : []}
            />
            <div className="workspace-hint">CLICK A BIN → INSPECT → EXPLAIN → ADD TO DISPATCH</div>
          </div>
          <div className="selected-bin-banner">
            <div>
              <span className="eyebrow">SELECTED BIN REPORT</span>
              <h3>{selected?.Bin_ID || "—"} · {city}</h3>
              <p>
                {selected
                  ? `This report is calculated for ${selected.Bin_ID} in ${city}. Select another bin above to switch the entire report.`
                  : "Select a bin above to inspect its report."}
              </p>
            </div>
            {selected && (
              <div className="selected-bin-kpis">
                <div><strong>{Math.round(selected.Emptying_Probability * 100)}%</strong><span>EMPTYING PROBABILITY</span></div>
                <div><strong>{selected.Collection_Priority}</strong><span>PRIORITY</span></div>
                <div><strong>{Number(selected.Estimated_Waste_kg).toFixed(1)} kg</strong><span>EST. WASTE</span></div>
              </div>
            )}
          </div>

          <BinInspector
            bin={selected}
            explain={explain}
            setExplain={setExplain}
            onDispatch={toggleQueue}
            queued={selected ? queue.includes(selected.Bin_ID) : false}
          />
        </section>

        <DispatchQueue
          queue={queue}
          bins={activeBins}
          truck={truck}
          setTruck={setTruck}
          onRemove={(id) => toggleQueue(id)}
          onClear={() => setQueue([])}
          onBuild={buildQueueRoute}
        />

        <FleetCommand
          routeInfo={routeData.optimized}
          customRoutes={customRoutes}
          selectedTruck={selectedTruck}
          setSelectedTruck={setSelectedTruck}
        />

        <RouteStudio
          city={city}
          selectedTruck={selectedTruck}
          customRoute={selectedCustom}
        />

        <section className="impact-band">
          <div>
            <span className="eyebrow">SIMULATED SCENARIO · VALIDATED PROTOTYPE FIGURES</span>
            <h2>11.91 km instead of 24.05 km</h2>
            <p>In the fixed 11-bin collection scenario, the optimized prototype route reduces estimated distance by 12.14 km, alongside lower simulated fuel and CO₂ estimates.</p>
          </div>
          <div className="impact-numbers">
            <div><strong>50.49%</strong><span>potential distance reduction</span></div>
            <div><strong>7.52 kg</strong><span>simulated optimized CO₂</span></div>
            <div><strong>1020 kg</strong><span>simulated collected waste</span></div>
          </div>
        </section>

        <ScenarioLab city={city} />
        <ModelXRay />
        <DatasetExplorer bins={activeBins} onSelect={(id) => { setSelectedId(id); document.getElementById("dataset")?.scrollIntoView({ behavior: "smooth" }); }} />
        <ResponsibleAI />
        <BOBWorkflow />

        <section className="section final-story">
          <div className="story-line"><span>01</span><b>DETECT</b><i>sensor patterns</i></div>
          <div className="story-line"><span>02</span><b>EXPLAIN</b><i>model evidence</i></div>
          <div className="story-line"><span>03</span><b>DISPATCH</b><i>operator-controlled queue</i></div>
          <div className="story-line"><span>04</span><b>OPTIMIZE</b><i>route + capacity</i></div>
          <div className="story-line"><span>05</span><b>ESTIMATE</b><i>fuel + CO₂ scenario</i></div>
        </section>
      
        <section className="section whatif-section" id="what-if">
          <div className="section-heading">
            <div>
              <span className="eyebrow">WHAT-IF LAB</span>
              <h2>Simulate collection decisions</h2>
              <p className="muted">Change operating conditions and see how the plan responds.</p>
            </div>
            <span className="whatif-live">INTERACTIVE SIMULATION</span>
          </div>

          <div className="whatif-layout">
            <div className="whatif-controls">
              <label>
                <div className="whatif-label"><span>Collection threshold</span><b>{Math.round(whatIfThreshold*100)}%</b></div>
                <input type="range" min="50" max="90" value={Math.round(whatIfThreshold*100)}
                  onChange={(e)=>setWhatIfThreshold(Number(e.target.value)/100)} />
              </label>
              <div className="range-caption"><span>Collect more</span><span>Collect fewer</span></div>

              <label>
                <div className="whatif-label"><span>Traffic / route overhead</span><b>{whatIfTraffic}%</b></div>
                <input type="range" min="0" max="40" value={whatIfTraffic}
                  onChange={(e)=>setWhatIfTraffic(Number(e.target.value))} />
              </label>
              <div className="range-caption"><span>Normal</span><span>Heavy traffic</span></div>

              <label>
                <div className="whatif-label"><span>Truck capacity</span><b>{whatIfCapacity} kg</b></div>
                <input type="range" min="300" max="1000" step="50" value={whatIfCapacity}
                  onChange={(e)=>setWhatIfCapacity(Number(e.target.value))} />
              </label>
              <div className="range-caption"><span>300 kg</span><span>1000 kg</span></div>

              <button className="secondary-button" type="button"
                onClick={()=>{setWhatIfThreshold(.65);setWhatIfTraffic(10);setWhatIfCapacity(750);}}>
                Reset scenario
              </button>
            </div>

            <div className="whatif-results">
              <div className="scenario-head">
                <div>
                  <span className="eyebrow">SCENARIO OUTPUT</span>
                  <h3>{city} collection projection</h3>
                  <p>{whatIfBinsCount} of {activeBins.length} bins meet the selected threshold.</p>
                </div>
                <div className="scenario-count"><strong>{whatIfBinsCount}</strong><span>BINS</span></div>
              </div>

              <div className="whatif-kpis">
                <div><span>EST. WASTE</span><strong>{whatIfWaste.toFixed(1)} kg</strong></div>
                <div><span>ROUTE DISTANCE</span><strong>{whatIfDistance.toFixed(2)} km</strong></div>
                <div><span>EST. FUEL</span><strong>{whatIfFuel.toFixed(2)} L</strong></div>
                <div><span>EST. CO₂</span><strong>{whatIfCo2.toFixed(2)} kg</strong></div>
                <div><span>TRIPS NEEDED</span><strong>{whatIfTrips}</strong></div>
              </div>

              <div className="whatif-insight">
                <b>✦ AI operational insight</b>
                <span>
                  {whatIfBinsCount === 0
                    ? "No bins meet this threshold. Lower the threshold to create a collection queue."
                    : whatIfBinsCount > Math.ceil(activeBins.length*.65)
                    ? "This creates a large collection wave. Review fleet capacity before dispatch."
                    : "The scenario focuses collection on bins with stronger predicted need."}
                </span>
              </div>
              <small className="whatif-note">Prototype simulation • scenario estimates, not live municipal measurements.</small>
            </div>
          </div>
        </section>
</main>

      {toast && <div className="toast" aria-live="polite">{toast}</div>}

      <footer>
        <div><b>EcoRoute AI</b><span>AI-powered sustainable waste collection intelligence</span></div>
        <span>Prototype · SDG 11 · SDG 12 · SDG 13</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
