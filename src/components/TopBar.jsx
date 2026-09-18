export default function TopBar({ city, setCity, onReset, theme, onTheme }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">E</div>
        <div>
          <strong>EcoRoute AI</strong>
          <span>SUSTAINABLE COLLECTION INTELLIGENCE</span>
        </div>
      </div>
      <div className="top-actions">
        <div className="live"><i /> PROTOTYPE SIMULATION</div>
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option>Visakhapatnam</option>
          <option>Hyderabad</option>
          <option>Bengaluru</option>
          <option>Chennai</option>
        </select>
        <button className="theme-toggle" onClick={onTheme} aria-label="Toggle light and dark mode">
          <span>{theme === "dark" ? "☀" : "☾"}</span>
          {theme === "dark" ? "LIGHT" : "DARK"}
        </button>
        <button className="ghost-btn" onClick={onReset}>RESET DEMO</button>
      </div>
    </header>
  );
}
