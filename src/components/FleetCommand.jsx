export default function FleetCommand({ routeInfo, customRoutes, selectedTruck, setSelectedTruck }) {
  const trucks = [
    ["T01", 500, "IDLE"],
    ["T02", 750, "ACTIVE"],
    ["T03", 1000, "ACTIVE"],
  ];

  return (
    <section className="section" id="fleet">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FLEET COMMAND</span>
          <h2>Turn predictions into dispatchable work.</h2>
        </div>
        <span className="section-note">Capacity-aware · prototype heuristic</span>
      </div>

      <div className="fleet-grid">
        {trucks.map(([id, cap, status]) => {
          const route = routeInfo[id];
          const custom = customRoutes?.find((x) => x.id === id);
          const load = custom ? custom.load : id === "T02" ? 524 : id === "T03" ? 496 : 0;
          return (
            <button
              key={id}
              className={`truck-card ${selectedTruck === id ? "selected" : ""}`}
              onClick={() => setSelectedTruck(id)}
            >
              <div className="truck-top">
                <span>{id}</span>
                <em className={status === "ACTIVE" ? "active-status" : ""}>{status}</em>
              </div>
              <div className="truck-icon">▰</div>
              <h3>{custom ? "Interactive route" : status === "ACTIVE" ? "Optimized route" : "Standby vehicle"}</h3>
              <div className="loadbar"><i style={{ width: `${Math.min(100, (load / cap) * 100)}%` }} /></div>
              <div className="truck-meta"><span>{load} / {cap} kg</span><span>{custom ? custom.stops.length - 2 : id === "T02" ? 5 : id === "T03" ? 6 : 0} stops</span></div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
