import { useState } from "react";

const EQUIPMENT = [
  { id: "CR-01", name: "Crusher #1", health: 72, trend: "declining", nextPM: "2026-06-15", risk: "medium", components: [
    { name: "Mantle Liner", wearPct: 78, lifeRemaining: "22 days", critical: false },
    { name: "Concave Liner", wearPct: 65, lifeRemaining: "35 days", critical: false },
    { name: "Bearing (Drive)", temp: 72, baseline: 55, status: "warning" },
    { name: "Bearing (Idle)", temp: 48, baseline: 45, status: "normal" },
  ]},
  { id: "CR-02", name: "Crusher #2", health: 45, trend: "critical", nextPM: "2026-05-28", risk: "high", components: [
    { name: "Mantle Liner", wearPct: 92, lifeRemaining: "5 days", critical: true },
    { name: "Concave Liner", wearPct: 88, lifeRemaining: "8 days", critical: true },
    { name: "Bearing (Drive)", temp: 78, baseline: 55, status: "critical" },
    { name: "Hydraulic Pressure", value: 185, baseline: 160, status: "warning" },
  ]},
  { id: "CV-01", name: "Conveyor #1", health: 85, trend: "stable", nextPM: "2026-06-22", risk: "low", components: [
    { name: "Belt Splice #3", resistance: 98, baseline: 88, status: "warning" },
    { name: "Drive Pulley", wearPct: 35, lifeRemaining: "60 days", critical: false },
  ]},
  { id: "CV-02", name: "Conveyor #2", health: 62, trend: "declining", nextPM: "2026-06-01", risk: "medium", components: [
    { name: "Belt Splice #1", resistance: 110, baseline: 88, status: "critical" },
    { name: "Return Rollers", wearPct: 55, lifeRemaining: "30 days", critical: false },
  ]},
  { id: "HT-01", name: "Haul Truck #1", health: 90, trend: "stable", nextPM: "2026-07-05", risk: "low", components: [
    { name: "Engine Hours", value: 4850, limit: 6000, status: "normal" },
    { name: "Brake Pad", wearPct: 40, lifeRemaining: "45 days", critical: false },
  ]},
  { id: "HT-04", name: "Haul Truck #4", health: 35, trend: "critical", nextPM: "2026-05-28", risk: "high", components: [
    { name: "Engine Hours", value: 5850, limit: 6000, status: "warning" },
    { name: "Brake Pad", wearPct: 88, lifeRemaining: "5 days", critical: true },
    { name: "Hydraulic Leak", value: "Active", status: "critical" },
  ]},
  { id: "EX-01", name: "Excavator #1", health: 78, trend: "stable", nextPM: "2026-06-10", risk: "low", components: [
    { name: "Swing Bearing", vibration: 2.8, baseline: 2.0, status: "warning" },
    { name: "Track Wear", wearPct: 45, lifeRemaining: "40 days", critical: false },
  ]},
  { id: "EX-02", name: "Excavator #2", health: 28, trend: "critical", nextPM: "2026-05-28", risk: "high", components: [
    { name: "Hydraulic Pump", pressure: 145, baseline: 180, status: "critical" },
    { name: "Boom Cylinder", leak: "Active", status: "critical" },
  ]},
];

const PREDICTED_FAILURES = [
  { equipment: "CR-02", component: "Drive Bearing", probability: 82, timeframe: "3-5 days", impact: "Production stop", cost: "RM 28,000" },
  { equipment: "HT-04", component: "Brake System", probability: 75, timeframe: "5-7 days", impact: "Safety risk", cost: "RM 4,500" },
  { equipment: "EX-02", component: "Hydraulic Pump", probability: 90, timeframe: "1-2 days", impact: "Excavator down", cost: "RM 18,000" },
  { equipment: "CV-02", component: "Belt Splice #1", probability: 65, timeframe: "7-10 days", impact: "Conveyor stop", cost: "RM 12,000" },
];

export default function PredictiveMaintenance() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Predictive Maintenance</div><div className="page-subtitle">Equipment health monitoring, failure prediction, and AI-driven maintenance recommendations</div></div>
      </div>

      <div className="board-main-grid" style={{ marginBottom: 20 }}>
        <div className="board-kpi-card">
          <div className="board-kpi-label">Equipment Health</div>
          <div className="board-kpi-main">{EQUIPMENT.filter(e => e.health >= 70).length}<span className="kpi-unit">/{EQUIPMENT.length}</span></div>
          <div className="board-kpi-meta">Avg health: {Math.round(EQUIPMENT.reduce((s, e) => s + e.health, 0) / EQUIPMENT.length)}%</div>
        </div>
        <div className="board-kpi-card">
          <div className="board-kpi-label">Critical Risk</div>
          <div className="board-kpi-main" style={{ color: "var(--red)" }}>{EQUIPMENT.filter(e => e.risk === "high").length}</div>
          <div className="board-kpi-meta">{PREDICTED_FAILURES.length} predicted failures within 10 days</div>
        </div>
        <div className="board-kpi-card">
          <div className="board-kpi-label">PM Compliance</div>
          <div className="board-kpi-main">91<span className="kpi-unit">%</span></div>
          <div className="board-kpi-meta">Target 95% · 2 overdue this week</div>
        </div>
        <div className="board-kpi-card">
          <div className="board-kpi-label">AI Predictions</div>
          <div className="board-kpi-main">4<span className="kpi-unit">alerts</span></div>
          <div className="board-kpi-meta">Within 10-day window</div>
        </div>
      </div>

      <div className="dashboard-panels">
        <div className="card">
          <div className="card-header"><div className="card-title">Equipment Fleet Health</div></div>
          <div className="card-body">
            {EQUIPMENT.map(e => {
              const isExpanded = expanded === e.id;
              const healthColor = e.health >= 70 ? "var(--green)" : e.health >= 50 ? "var(--gold)" : "var(--red)";
              return (
                <div key={e.id} className={`pd-equip ${isExpanded ? "expanded" : ""}`} onClick={() => setExpanded(isExpanded ? null : e.id)}>
                  <div className="pd-equip-header">
                    <div className="pd-equip-info">
                      <span className="pd-equip-id">{e.id}</span>
                      <span className="pd-equip-name">{e.name}</span>
                    </div>
                    <div className="pd-equip-stats">
                      <div className="pd-health-ring" style={{ background: `conic-gradient(${healthColor} ${e.health * 3.6}deg, var(--surface-3) 0deg)` }}>
                        <span className="pd-health-pct">{e.health}%</span>
                      </div>
                      <span className={`pd-trend ${e.trend}`}>{e.trend === "critical" ? "🔴" : e.trend === "declining" ? "▼" : e.trend === "stable" ? "—" : "▲"}</span>
                      <span className={`badge badge-${e.risk === "high" ? "red" : e.risk === "medium" ? "gold" : "green"}`}>{e.risk}</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="pd-equip-detail">
                      {e.components.map((c, i) => (
                        <div key={i} className="pd-comp-row">
                          <span className="pd-comp-name">{c.name}</span>
                          {c.wearPct !== undefined && <><div className="pd-comp-bar"><div className="pd-comp-fill" style={{ width: `${c.wearPct}%`, background: c.wearPct > 80 ? "var(--red)" : c.wearPct > 60 ? "var(--gold)" : "var(--green)" }} /></div><span className="pd-comp-val">{c.wearPct}%</span></>}
                          {c.temp !== undefined && <><span className="pd-comp-val">{c.temp}°C</span><span className={`badge badge-${c.status === "critical" ? "red" : c.status === "warning" ? "gold" : "green"}`}>{c.status}</span></>}
                          {c.vibration !== undefined && <><span className="pd-comp-val">{c.vibration}mm/s</span><span className={`badge badge-${c.status}`}>{c.status}</span></>}
                          {c.value !== undefined && <><span className="pd-comp-val">{typeof c.value === "number" ? `${c.value}` : c.value}</span><span className={`badge badge-${c.status}`}>{c.status}</span></>}
                          {c.leak !== undefined && <span className="badge badge-red">{c.leak}</span>}
                          {c.lifeRemaining && <span className="pd-comp-life">{c.lifeRemaining} remaining</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">AI Predicted Failures — Next 10 Days</div></div>
          <div className="card-body">
            {PREDICTED_FAILURES.map((pf, i) => (
              <div key={i} className="pf-row">
                <div className="pf-header">
                  <span className="pf-equip">{pf.equipment}</span>
                  <span className="pf-comp">{pf.component}</span>
                </div>
                <div className="pf-stats">
                  <div className="pf-prob">
                    <div className="pf-prob-bar"><div className="pf-prob-fill" style={{ width: `${pf.probability}%`, background: pf.probability > 80 ? "var(--red)" : pf.probability > 60 ? "var(--gold)" : "var(--teal)" }} /></div>
                    <span className="pf-prob-val">{pf.probability}%</span>
                  </div>
                  <span className="pf-time">{pf.timeframe}</span>
                </div>
                <div className="pf-meta">{pf.impact} · Est. {pf.cost}</div>
              </div>
            ))}
          </div>
          <div className="card-footer">
            <div className="ai-insight"><span className="ai-insight-icon">✦</span><span><strong>AI Maintenance Plan:</strong> 1. CR-02 bearing replacement — schedule tonight (critical, 82% failure probability). 2. HT-04 brake overhaul — tomorrow AM. 3. EX-02 hydraulic pump — order part today, replace within 48h. Estimated total cost: RM 50,500 vs RM 185,000 if all fail without intervention.</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
