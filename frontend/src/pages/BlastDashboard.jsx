import { useState } from "react";

const BLASTS = [
  { id: "B-2026-042", date: "2026-05-27", zone: "West Pit", holes: 85, powder: 3240, tonnes: 48500, powderFactor: 0.48, p80: 245, vibration: 4.2, limit: 5.0, status: "completed" },
  { id: "B-2026-041", date: "2026-05-25", zone: "East Pit", holes: 62, powder: 2480, tonnes: 37200, powderFactor: 0.52, p80: 265, vibration: 3.8, limit: 5.0, status: "completed" },
  { id: "B-2026-040", date: "2026-05-22", zone: "West Pit", holes: 78, powder: 2960, tonnes: 45200, powderFactor: 0.46, p80: 230, vibration: 4.5, limit: 5.0, status: "completed" },
  { id: "B-2026-039", date: "2026-05-18", zone: "South Pit", holes: 45, powder: 1800, tonnes: 26100, powderFactor: 0.44, p80: 215, vibration: 3.2, limit: 5.0, status: "completed" },
];

const POWDER_TREND = [
  { month: "Jan", pf: 0.52, target: 0.48 },
  { month: "Feb", pf: 0.50, target: 0.48 },
  { month: "Mar", pf: 0.47, target: 0.48 },
  { month: "Apr", pf: 0.49, target: 0.48 },
  { month: "May", pf: 0.48, target: 0.48 },
];

export default function BlastDashboard() {
  const lastBlast = BLASTS[0];

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Blast Performance Dashboard</div><div className="page-subtitle">Powder factor, fragmentation, vibration monitoring, and AI-optimised blast design</div></div>
        <button className="btn btn-primary btn-sm">+ New Blast Design</button>
      </div>

      <div className="board-main-grid" style={{ marginBottom: 20 }}>
        <div className="board-kpi-card">
          <div className="board-kpi-label">Last Blast PF</div>
          <div className="board-kpi-main">{lastBlast.powderFactor}<span className="kpi-unit">kg/t</span></div>
          <div className="board-kpi-meta" style={{ color: lastBlast.powderFactor <= 0.50 ? "var(--green-light)" : "var(--red)" }}>Target 0.48 · {lastBlast.powderFactor <= 0.50 ? "On target" : "Review"}</div>
        </div>
        <div className="board-kpi-card">
          <div className="board-kpi-label">Fragmentation P80</div>
          <div className="board-kpi-main">{lastBlast.p80}<span className="kpi-unit">mm</span></div>
          <div className="board-kpi-meta" style={{ color: lastBlast.p80 <= 250 ? "var(--green-light)" : "var(--gold)" }}>Target &lt;250mm</div>
        </div>
        <div className="board-kpi-card">
          <div className="board-kpi-label">Vibration Level</div>
          <div className="board-kpi-main">{lastBlast.vibration}<span className="kpi-unit">mm/s</span></div>
          <div className="board-kpi-meta" style={{ color: lastBlast.vibration > lastBlast.limit * 0.8 ? "var(--gold)" : "var(--green-light)" }}>Limit {lastBlast.limit}mm/s · {(lastBlast.vibration / lastBlast.limit * 100).toFixed(0)}%</div>
        </div>
        <div className="board-kpi-card">
          <div className="board-kpi-label">Tonnes per Hole</div>
          <div className="board-kpi-main">{Math.round(lastBlast.tonnes / lastBlast.holes)}<span className="kpi-unit">t</span></div>
          <div className="board-kpi-meta">{lastBlast.holes} holes · {lastBlast.tonnes.toLocaleString()}t total</div>
        </div>
      </div>

      <div className="dashboard-panels">
        <div className="card">
          <div className="card-header"><div className="card-title">Recent Blasts</div></div>
          <div className="card-body">
            {BLASTS.map(b => (
              <div key={b.id} className="blast-row">
                <div className="blast-header">
                  <span className="blast-id">{b.id}</span>
                  <span className="blast-zone">{b.zone}</span>
                  <span className="blast-date cell-mono">{b.date}</span>
                </div>
                <div className="blast-stats">
                  <span className="blast-stat"><span className="blast-stat-label">PF</span><span className={`blast-stat-value ${b.powderFactor > 0.50 ? "warn" : ""}`}>{b.powderFactor}</span></span>
                  <span className="blast-stat"><span className="blast-stat-label">P80</span><span className={`blast-stat-value ${b.p80 > 250 ? "warn" : ""}`}>{b.p80}mm</span></span>
                  <span className="blast-stat"><span className="blast-stat-label">Vib</span><span className={`blast-stat-value ${b.vibration > b.limit * 0.8 ? "warn" : ""}`}>{b.vibration}mm/s</span></span>
                  <span className="blast-stat"><span className="blast-stat-label">Yield</span><span className="blast-stat-value">{Math.round(b.tonnes / b.holes)}t/hole</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Powder Factor Trend</div></div>
          <div className="card-body">
            <div className="pf-chart">
              {POWDER_TREND.map((p, i) => (
                <div key={i} className="pf-month">
                  <div className="pf-label">{p.month}</div>
                  <div className="pf-bars">
                    <div className="pf-bar-actual" style={{ height: `${p.pf / 0.6 * 100}%`, background: p.pf <= 0.50 ? "var(--green)" : "var(--red)" }} />
                    <div className="pf-bar-target" style={{ height: `${p.target / 0.6 * 100}%` }} />
                  </div>
                  <div className="pf-value">{p.pf}</div>
                </div>
              ))}
            </div>
            <div className="pf-legend"><span><span className="pf-legend-dot actual" /> Actual</span><span><span className="pf-legend-dot target" /> Target 0.48</span></div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><div className="card-title">AI Blast Analysis & Recommendations</div></div>
        <div className="card-body">
          <div className="ai-rec-list">
            <div className="ai-rec-item">
              <div className="ai-rec-icon">⬡</div>
              <div className="ai-rec-content">
                <div className="ai-rec-title">Fragmentation Optimisation</div>
                <div className="ai-rec-desc">P80 trending at 245mm (target &lt;250mm) — within acceptable range. East Pit blast (B-041) showed P80 of 265mm due to wider spacing. Recommendation: reduce spacing from 6.5m to 6.0m in East Pit to improve fragmentation.</div>
              </div>
            </div>
            <div className="ai-rec-item">
              <div className="ai-rec-icon">⟳</div>
              <div className="ai-rec-content">
                <div className="ai-rec-title">Powder Factor Optimisation</div>
                <div className="ai-rec-desc">Year-to-date PF trending downward from 0.52 to 0.48 — positive trend. Current PF at target but South Pit blast achieved 0.44. Review if South Pit geology allows consistent 0.44-0.46 PF without compromising fragmentation.</div>
              </div>
            </div>
            <div className="ai-rec-item">
              <div className="ai-rec-icon">⚖</div>
              <div className="ai-rec-content">
                <div className="ai-rec-title">Vibration Compliance</div>
                <div className="ai-rec-desc">All blasts within 5.0mm/s limit. West Pit blasts consistently higher (4.2-4.5mm/s). Community monitoring station 800m from West Pit — consider timing delays to reduce peak particle velocity if complaints arise.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
