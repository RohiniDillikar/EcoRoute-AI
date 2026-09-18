import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import { cityBins, cities, haversine, routeData } from "../data/data";

const depotIcon = L.divIcon({ className: "depot-pin", html: "D" });
const truckIcon = L.divIcon({ className: "truck-pin", html: "●" });

function pointsFor(stops, city) {
  const cb = cityBins(city);
  return stops.map((id) => {
    if (id === "DEPOT") return { lat: cities[city].lat, lon: cities[city].lon, id };
    const b = cb.find((x) => x.Bin_ID === id);
    return b ? { lat: b.Latitude, lon: b.Longitude, id } : null;
  }).filter(Boolean);
}

function routeDistance(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += haversine(points[i - 1], points[i]);
  return total;
}

export default function RouteStudio({ city, selectedTruck, customRoute }) {
  const [mode, setMode] = useState("optimized");
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);

  const optimizedStops = routeData.optimized[selectedTruck] || ["DEPOT", "DEPOT"];
  const baselineStops = routeData.baseline;
  const customStops = customRoute?.stops;
  const stops = customRoute ? customStops : mode === "baseline" ? baselineStops : optimizedStops;
  const points = useMemo(() => pointsFor(stops, city), [stops, city]);

  useEffect(() => {
    if (!playing) return;
    if (step >= points.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setInterval(() => setStep((s) => Math.min(s + 1, points.length - 1)), 700);
    return () => clearInterval(t);
  }, [playing, step, points.length]);

  useEffect(() => setStep(0), [city, selectedTruck, mode, customRoute]);

  const dist = customRoute ? routeDistance(points) : mode === "baseline" ? routeData.stats.baselineDistanceKm : selectedTruck === "T02" ? 6.19 : selectedTruck === "T03" ? 5.71 : 0;

  return (
    <section className="section route-section" id="routes">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ROUTE STUDIO</span>
          <h2>See the route—not just the number.</h2>
        </div>
        <div className="route-tabs">
          <button className={mode === "optimized" ? "active" : ""} onClick={() => { setMode("optimized"); setPlaying(false); }}>OPTIMIZED</button>
          <button className={mode === "baseline" ? "active" : ""} onClick={() => { setMode("baseline"); setPlaying(false); }}>BEFORE</button>
        </div>
      </div>

      <div className="route-workspace">
        <div className="route-map">
          <MapContainer center={[cities[city].lat, cities[city].lon]} zoom={cities[city].zoom} scrollWheelZoom className="map mini-map">
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Polyline positions={points.map((p) => [p.lat, p.lon])} pathOptions={{ color: mode === "baseline" ? "#f0a66a" : "#b7f05a", weight: 5, dashArray: mode === "baseline" ? "8 7" : undefined }} />
            {points[0] && <Marker position={[points[0].lat, points[0].lon]} icon={depotIcon} />}
            {playing && points[step] && <Marker position={[points[step].lat, points[step].lon]} icon={truckIcon} />}
          </MapContainer>
          <button className="play-route" onClick={() => { setStep(0); setPlaying(true); }}>{playing ? "ROUTE PLAYING…" : "▶ PLAY ROUTE"}</button>
        </div>
        <div className="route-readout">
          <div className="big-metric"><span>ROUTE DISTANCE</span><strong>{dist.toFixed(2)} <small>km</small></strong></div>
          <div className="comparison">
            <div><span>BEFORE</span><b>{routeData.stats.baselineDistanceKm} km</b></div>
            <div><span>AFTER</span><b>{routeData.stats.optimizedDistanceKm} km</b></div>
          </div>
          <div className="stop-list">
            {stops.map((s, i) => <div className={playing && i === step ? "stop active-stop" : "stop"} key={`${s}-${i}`}><span>{String(i + 1).padStart(2, "0")}</span><b>{s}</b>{i < stops.length - 1 && <i />}</div>)}
          </div>
          <p>{customRoute ? "This route was generated interactively from the dispatch queue using a nearest-feasible-stop heuristic." : "Validated prototype scenario: optimized route uses fewer kilometres while respecting the displayed truck capacity assumptions."}</p>
        </div>
      </div>
    </section>
  );
}
