import { featureImportance } from "../data/data";

export default function ModelXRay() {
  return (
    <section className="section xray" id="model">
      <div className="section-heading">
        <div>
          <span className="eyebrow">MODEL X-RAY</span>
          <h2>Make the AI inspectable.</h2>
        </div>
        <span className="section-note">Random Forest · original training set: 4,638 rows</span>
      </div>

      <div className="xray-grid">
        <div className="model-card">
          <div className="model-header"><span>CLASSIFIER</span><strong>RANDOM FOREST</strong></div>
          <div className="accuracy">95<span>%</span><small>test accuracy</small></div>
          <div className="metrics">
            <div><span>EMPTYING</span><b>0.95</b><em>precision</em><b>0.96</b><em>recall</em></div>
            <div><span>NON EMPTYING</span><b>0.96</b><em>precision</em><b>0.95</b><em>recall</em></div>
          </div>
        </div>

        <div className="feature-card">
          <span className="eyebrow">FEATURE IMPORTANCE</span>
          <div className="importance-chart">
            {featureImportance.map(([name, value]) => (
              <div className="bar-row" key={name}>
                <span>{name}</span>
                <div><i style={{ width: `${(value / 0.42) * 100}%` }} /></div>
                <b>{(value * 100).toFixed(1)}%</b>
              </div>
            ))}
          </div>
        </div>

        <div className="matrix-card">
          <span className="eyebrow">CLASSIFICATION SNAPSHOT</span>
          <div className="matrix">
            <div className="corner">ACTUAL / PRED.</div><b>EMPTY</b><b>NON</b>
            <b>EMPTY</b><strong>96%</strong><strong>4%</strong>
            <b>NON</b><strong>5%</strong><strong>95%</strong>
          </div>
          <p>Metrics summarize held-out model performance. They do not guarantee the same accuracy on future municipal deployments.</p>
        </div>
      </div>
    </section>
  );
}
