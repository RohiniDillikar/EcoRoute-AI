import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { cities } from "../data/data";

function Recenter({ city }) {
  const map = useMap();
  useEffect(() => {
    map.setView([cities[city].lat, cities[city].lon], cities[city].zoom);
  }, [city, map]);
  return null;
}

function markerColor(p) {
  if (p >= 0.7) return "#d9ff70";
  if (p >= 0.5) return "#ffd166";
  return "#6c7b75";
}

export default function CityMap({
  city,
  bins,
  selectedId,
  setSelectedId,
  scanActive,
  highlightedIds,
  routePoints = [],
  routeMode = "none",
}) {
  return (
    <div className="map-shell">
      <MapContainer
        key={city}
        center={[cities[city].lat, cities[city].lon]}
        zoom={cities[city].zoom}
        scrollWheelZoom
        className="map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter city={city} />

        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints.map((p) => [p.lat, p.lon])}
            pathOptions={{
              color: routeMode === "baseline" ? "#f0a66a" : "#b7f05a",
              weight: 5,
              opacity: 0.9,
              dashArray: routeMode === "baseline" ? "10 8" : undefined,
            }}
          />
        )}

        {bins.map((b) => {
          const active = highlightedIds.includes(b.Bin_ID);
          return (
            <CircleMarker
              key={b.Bin_ID}
              center={[b.Latitude, b.Longitude]}
              radius={selectedId === b.Bin_ID ? 11 : 7}
              pathOptions={{
                color: selectedId === b.Bin_ID ? "#ffffff" : markerColor(b.Emptying_Probability),
                fillColor: markerColor(b.Emptying_Probability),
                fillOpacity: active || scanActive ? 0.95 : 0.58,
                weight: selectedId === b.Bin_ID ? 3 : 1,
                className: scanActive ? "scan-marker" : "",
              }}
              eventHandlers={{ click: () => setSelectedId(b.Bin_ID) }}
            >
              <Popup>
                <div className="popup">
                  <b>{b.Bin_ID}</b>
                  <span>{Math.round(b.Emptying_Probability * 100)}% emptying probability</span>
                  <strong>{b.Collection_Priority} priority</strong>
                  <button onClick={() => setSelectedId(b.Bin_ID)}>OPEN INTELLIGENCE</button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <div className="map-overlay">
        <span>AI SPATIAL VIEW</span>
        <small>{city} · simulated operational context</small>
      </div>
      {scanActive && (
        <div className="scan-beam">
          <div className="scan-line" />
          <div className="scan-label">AI CITY SCAN IN PROGRESS</div>
        </div>
      )}
    </div>
  );
}
