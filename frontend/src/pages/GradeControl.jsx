import { useState } from "react";

const ZONES = ["West Pit", "East Pit", "Main Zone", "Deep Zone"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May"];

const GRADE_DATA = [
  { month: "Jan", plan: 58.2, actual: 58.5, model: 59.1, dilution: 7.2, oreLoss: 2.8, tonnes: 172000 },
  { month: "Feb", plan: 58.0, actual: 57.8, model: 58.7, dilution: 8.1, oreLoss: 3.2, tonnes: 168000 },
  { month: "Mar", plan: 58.5, actual: 57.9, model: 59.3, dilution: 8.5, oreLoss: 3.5, tonnes: 175000 },
  { month: "Apr", plan: 58.2, actual: 58.1, model: 58.9, dilution: 7.8, oreLoss: 3.0, tonnes: 170000 },
  { month: "May", plan: 58.2, actual: 57.8, model: 58.6, dilution: 8.2, oreLoss: 3.1, tonnes: 175200 },
];

const BH_ASSAYS = [
  { hole: "BH-1204", zone: "West Pit", fe: 58.7, sio2: 4.2, al2o3: 2.1, depth: 45 },
  { hole: "BH-1205", zone: "West Pit", fe: 57.5, sio2: 4.8, al2o3: 2.4, depth: 42 },
  { hole: "BH-1206", zone: "East Pit", fe: 59.2, sio2: 3.5, al2o3: 1.8, depth: 48 },
  { hole: "BH-1207", zone: "East Pit", fe: 56.8, sio2: 5.2, al2o3: 2.8, depth: 40 },
  { hole: "BH-1208", zone: "Main Zone", fe: 58.1, sio2: 4.5, al2o3: 2.2, depth: 52 },
];

export default function GradeControl() {
  const [zone, setZone] = useState("All");
  const filteredGrade = zone === "All" ? GRADE_DATA : GRADE_DATA;
  const current = GRADE_DATA[GRADE_DATA.length - 1];

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Grade Control</div><div className="page-subtitle">Real grade tracking, reconciliation (model vs plan vs actual), dilution monitoring with AI analysis</div></div>
      </div>

      <div className="board-main-grid" style={{ marginBottom: 20 }}>
        <div className="board-kpi-card">
          <div className="board-kpi-label">Current Grade</div>
          <div className="board-kpi-main">{current.actual}<span className="kpi-unit">% Fe</span></div>
          <div className="board-kpi-meta">Plan {current.plan}% · Variance {(current.actual - current.plan).toFixed(1)}%</div>
        </div>
        <div className="board-kpi-card">
          <div className="board-kpi-label">Model vs Actual</div>
          <div className="board-kpi-main">{(current.actual / current.model * 100).toFixed(1)}<span className="kpi-unit">%</span></div>
          <div className="board-kpi-meta" style={{ color: current.model - current.actual > 1 ? "var(--red)" : "var(--text-muted)" }}>Model {current.model}% · Gap {(current.model - current.actual).toFixed(1)}%</div>
        </div>
        <div className="board-kpi-card">
          <div className="board-kpi-label">Dilution</div>
          <div className="board-kpi-main">{current.dilution}<span className="kpi-unit">%</span></div>
          <div className="board-kpi-meta" style={{ color: current.dilution > 8 ? "var(--red)" : "var(--text-muted)" }}>Target &lt;8% · {current.dilution > 8 ? "Exceeded" : "Within limit"}</div>
        </div>
        <div className="board-kpi-card">
          <div className="board-kpi-label">Ore Loss</div>
          <div className="board-kpi-main">{current.oreLoss}<span className="kpi-unit">%</span></div>
          <div className="board-kpi-meta">Target &lt;3% · {current.oreLoss > 3 ? "⚠ Above target" : "On target"}</div>
        </div>
      </div>

      <div className="prod-controls" style={{ marginBottom: 20 }}>
        <div className="prod-controls-row">
          <div className="prod-select-group">
            <label className="prod-label">Zone</label>
            <select className="form-select" value={zone} onChange={e => setZone(e.target.value)}>
              <option value="All">All Zones</option>
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div className="prod-select-group">
            <label className="prod-label">Period</label>
            <select className="form-select"><option>Last 5 months</option></select>
          </div>
          <div className="prod-select-group">
            <label className="prod-label">Reconciliation</label>
            <select className="form-select" defaultValue="3way"><option value="3way">Model vs Plan vs Actual</option></select>
          </div>
        </div>
      </div>

      <div className="dashboard-panels" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Grade Trend — {zone}</div></div>
          <div className="card-body">
            <div className="recon-chart">
              {filteredGrade.map((d, i) => (
                <div key={i} className="recon-month">
                  <div className="recon-month-label">{d.month}</div>
                  <div className="recon-bars">
                    <div className="recon-bar-row">
                      <span className="recon-bar-label">Model</span>
                      <div className="recon-bar-track"><div className="recon-bar-fill model" style={{ width: `${(d.model / 62) * 100}%` }} /></div>
                      <span className="recon-bar-val">{d.model}</span>
                    </div>
                    <div className="recon-bar-row">
                      <span className="recon-bar-label">Plan</span>
                      <div className="recon-bar-track"><div className="recon-bar-fill plan" style={{ width: `${(d.plan / 62) * 100}%` }} /></div>
                      <span className="recon-bar-val">{d.plan}</span>
                    </div>
                    <div className="recon-bar-row">
                      <span className="recon-bar-label">Actual</span>
                      <div className="recon-bar-track"><div className="recon-bar-fill actual" style={{ width: `${(d.actual / 62) * 100}%` }} /></div>
                      <span className="recon-bar-val">{d.actual}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Blast Hole Assays — {zone}</div></div>
          <div className="card-body">
            {BH_ASSAYS.filter(a => zone === "All" || a.zone === zone).map(a => (
              <div key={a.hole} className="bh-row">
                <div className="bh-header">
                  <span className="bh-hole">{a.hole}</span>
                  <span className="bh-zone">{a.zone}</span>
                  <span className="bh-depth">{a.depth}m</span>
                </div>
                <div className="bh-assays">
                  <span className="bh-assay">
                    <span className="bh-assay-label">Fe</span>
                    <span className={`bh-assay-value ${a.fe < 57 ? "low" : a.fe > 59 ? "high" : ""}`}>{a.fe}%</span>
                  </span>
                  <span className="bh-assay">
                    <span className="bh-assay-label">SiO₂</span>
                    <span className="bh-assay-value">{a.sio2}%</span>
                  </span>
                  <span className="bh-assay">
                    <span className="bh-assay-label">Al₂O₃</span>
                    <span className="bh-assay-value">{a.al2o3}%</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">AI Reconciliation Analysis</div></div>
        <div className="card-body">
          <div className="ai-rec-list">
            <div className="ai-rec-item">
              <div className="ai-rec-icon">⟳</div>
              <div className="ai-rec-content">
                <div className="ai-rec-title">Model vs Actual Gap: 0.8% Fe</div>
                <div className="ai-rec-desc">Resource model overestimating grade by average 0.8% Fe across all zones. East Pit shows largest gap (1.2%). Recommended: review estimation parameters and search ellipse orientation.</div>
              </div>
            </div>
            <div className="ai-rec-item">
              <div className="ai-rec-icon">⚠</div>
              <div className="ai-rec-content">
                <div className="ai-rec-title">Dilution Trending Up</div>
                <div className="ai-rec-desc">Dilution increased from 7.2% (Jan) to 8.2% (May). Primary driver: blast movement at hanging wall contact in West Pit. Recommend: blast monitoring with marker holes and adjust dig limits.</div>
              </div>
            </div>
            <div className="ai-rec-item">
              <div className="ai-rec-icon">⬡</div>
              <div className="ai-rec-content">
                <div className="ai-rec-title">Grade Control Drilling Gap</div>
                <div className="ai-rec-desc">BH-1207 (East Pit) shows 56.8% Fe — 1.9% below zone average. Additional grade control samples recommended at 5m × 5m spacing vs current 10m × 10m to improve definition.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
