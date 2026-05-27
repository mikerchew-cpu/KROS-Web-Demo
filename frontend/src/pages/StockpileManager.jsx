import { useState } from "react";

const STOCKPILES = [
  { id: "SP-01", name: "High Grade Stockpile", tonnes: 45200, gradeFe: 59.2, gradeSiO2: 3.8, targetFe: 58.5, area: "North Pad", status: "active" },
  { id: "SP-02", name: "Medium Grade Stockpile", tonnes: 28400, gradeFe: 55.8, gradeSiO2: 5.2, targetFe: 56.0, area: "South Pad", status: "active" },
  { id: "SP-03", name: "Low Grade Stockpile", tonnes: 18200, gradeFe: 48.5, gradeSiO2: 8.5, targetFe: 50.0, area: "East Pad", status: "active" },
  { id: "SP-04", name: "Waste Rock Dump", tonnes: 125000, gradeFe: 32.0, gradeSiO2: 15.2, targetFe: null, area: "West Dump", status: "inactive" },
  { id: "SP-05", name: "Product Stockpile", tonnes: 8900, gradeFe: 60.5, gradeSiO2: 2.8, targetFe: 60.0, area: "Plant South", status: "active" },
];

const MOVEMENTS = [
  { date: "2026-05-27", from: "West Pit", to: "SP-01 (HG)", tonnes: 2400, grade: 59.5, type: "Receipt" },
  { date: "2026-05-27", from: "SP-01 (HG)", to: "Crusher", tonnes: 1800, grade: 59.2, type: "Reclaim" },
  { date: "2026-05-26", from: "East Pit", to: "SP-02 (MG)", tonnes: 3100, grade: 55.2, type: "Receipt" },
  { date: "2026-05-26", from: "SP-02 (MG)", to: "Crusher", tonnes: 1500, grade: 55.8, type: "Reclaim" },
  { date: "2026-05-25", from: "West Pit", to: "SP-03 (LG)", tonnes: 1800, grade: 48.0, type: "Receipt" },
];

const BLEND_SCENARIOS = [
  { id: "current", name: "Current Feed", hgPct: 55, mgPct: 35, lgPct: 10, resultFe: 57.4, resultSiO2: 4.8, meetsSpec: false },
  { id: "opt1", name: "Option 1: More HG", hgPct: 65, mgPct: 25, lgPct: 10, resultFe: 58.1, resultSiO2: 4.3, meetsSpec: true },
  { id: "opt2", name: "Option 2: Product Boost", hgPct: 50, mgPct: 30, lgPct: 20, resultFe: 56.8, resultSiO2: 5.1, meetsSpec: false },
];

export default function StockpileManager() {
  const [activeBlend, setActiveBlend] = useState("current");
  const blend = BLEND_SCENARIOS.find(b => b.id === activeBlend) || BLEND_SCENARIOS[0];
  const totalStock = STOCKPILES.reduce((s, x) => s + x.tonnes, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Stockpile Management</div><div className="page-subtitle">Volume/grade tracking, blending optimisation, and inventory reconciliation with AI</div></div>
      </div>

      <div className="board-main-grid" style={{ marginBottom: 20 }}>
        <div className="board-kpi-card"><div className="board-kpi-label">Total Inventory</div><div className="board-kpi-main">{(totalStock / 1000).toFixed(0)}<span className="kpi-unit">kt</span></div><div className="board-kpi-meta">{STOCKPILES.filter(s => s.status === "active").length} active stockpiles</div></div>
        <div className="board-kpi-card"><div className="board-kpi-label">Avg Feed Grade</div><div className="board-kpi-main">{blend.resultFe}<span className="kpi-unit">% Fe</span></div><div className="board-kpi-meta" style={{ color: blend.meetsSpec ? "var(--green-light)" : "var(--red)" }}>{blend.meetsSpec ? "Meets spec" : "Below spec"}</div></div>
        <div className="board-kpi-card"><div className="board-kpi-label">Today Reclaim</div><div className="board-kpi-main">3,300<span className="kpi-unit">t</span></div><div className="board-kpi-meta">To crusher: 100%</div></div>
        <div className="board-kpi-card"><div className="board-kpi-label">Stockpile Days</div><div className="board-kpi-main">{Math.round(totalStock / 3300)}<span className="kpi-unit">days</span></div><div className="board-kpi-meta">At current reclaim rate</div></div>
      </div>

      <div className="dashboard-panels">
        <div className="card">
          <div className="card-header"><div className="card-title">Stockpile Inventory</div><div className="card-subtitle">Click stockpile for detail</div></div>
          <div className="card-body">
            {STOCKPILES.map(sp => (
              <div key={sp.id} className={`sp-row ${sp.status === "active" ? "" : "inactive"}`}>
                <div className="sp-info">
                  <div className="sp-name">{sp.name}</div>
                  <div className="sp-location">{sp.area}</div>
                </div>
                <div className="sp-stats">
                  <div className="sp-stat"><span className="sp-stat-value">{(sp.tonnes / 1000).toFixed(1)}kt</span><span className="sp-stat-label">Tonnes</span></div>
                  <div className="sp-stat"><span className="sp-stat-value">{sp.gradeFe}%</span><span className="sp-stat-label">Fe</span></div>
                  <div className="sp-stat"><span className="sp-stat-value">{sp.gradeSiO2}%</span><span className="sp-stat-label">SiO₂</span></div>
                </div>
                <span className={`badge badge-${sp.status === "active" ? "green" : "muted"}`}>{sp.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Blend Optimisation</div><div className="card-subtitle">Select blend ratio to achieve target feed grade</div></div>
          <div className="card-body">
            <div className="blend-chips">
              {BLEND_SCENARIOS.map(b => (
                <span key={b.id} className={`prod-chip ${activeBlend === b.id ? "active" : ""}`} onClick={() => setActiveBlend(b.id)}>{b.name}</span>
              ))}
            </div>
            <div className="blend-visual" style={{ marginTop: 12 }}>
              <div className="blend-bar">
                <div className="blend-seg" style={{ width: `${blend.hgPct}%`, background: "var(--green)" }} title={`HG ${blend.hgPct}%`} />
                <div className="blend-seg" style={{ width: `${blend.mgPct}%`, background: "var(--gold)" }} title={`MG ${blend.mgPct}%`} />
                <div className="blend-seg" style={{ width: `${blend.lgPct}%`, background: "var(--teal-light)" }} title={`LG ${blend.lgPct}%`} />
              </div>
              <div className="blend-result">
                <div className="blend-result-item"><span>Fe</span><span className={blend.resultFe >= 58 ? "blend-good" : "blend-bad"}>{blend.resultFe}%</span></div>
                <div className="blend-result-item"><span>SiO₂</span><span className={blend.resultSiO2 <= 5 ? "blend-good" : "blend-bad"}>{blend.resultSiO2}%</span></div>
                <div className="blend-result-item"><span>Spec</span><span className={`badge badge-${blend.meetsSpec ? "green" : "red"}`}>{blend.meetsSpec ? "Pass" : "Fail"}</span></div>
              </div>
            </div>
          </div>
          <div className="card-footer">
            <div className="ai-insight"><span className="ai-insight-icon">✦</span><span><strong>AI Recommendation:</strong> Option 1 (65% HG / 25% MG / 10% LG) achieves 58.1% Fe and 4.3% SiO₂ — meets crusher feed spec. Current feed at 57.4% Fe is below target. Increase HG reclaim by 10%.</span></div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><div className="card-title">Recent Movements</div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>From</th><th>To</th><th>Tonnes</th><th>Grade</th><th>Type</th></tr></thead>
            <tbody>
              {MOVEMENTS.map((m, i) => (
                <tr key={i}>
                  <td className="cell-mono">{m.date}</td>
                  <td>{m.from}</td>
                  <td>{m.to}</td>
                  <td className="cell-bold">{m.tonnes.toLocaleString()}t</td>
                  <td>{m.grade}% Fe</td>
                  <td><span className={`badge badge-${m.type === "Receipt" ? "teal" : "gold"}`}>{m.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
