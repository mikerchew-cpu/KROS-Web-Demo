import { useState } from "react";

const SECTIONS = [
  { id: "executive", label: "Executive Summary" },
  { id: "production", label: "Production" },
  { id: "financial", label: "Financial" },
  { id: "safety", label: "Safety & Environment" },
  { id: "maintenance", label: "Maintenance" },
  { id: "outlook", label: "Outlook" },
];

const MONTH_DATA = {
  production: { tonnes: 175200, plan: 180000, ore: 136500, waste: 38700, grade: 57.8, recovery: 93.2, uptime: 88.5 },
  financial: { revenue: 14200000, cost: 9540000, opex: 4890000, capex: 1250000, royalty_pct: 3.5 },
  safety: { lti: 0, mtis: 1, nearMisses: 12, envExceedances: 0, observations: 28 },
  maintenance: { pmCompliance: 91, breakdowns: 5, criticalAlerts: 3, equipmentHealth: 62 },
  outlook: { nextMonthTarget: 178000, riskLevel: "medium", keyInitiatives: ["Crusher #2 bearing replacement", "Conveyor belt #2 splice repair", "West Pit grade control drilling"] },
};

const MONTHLY_TREND = [
  { month: "Jan", tonnes: 172000, revenue: 13800, cost: 9200, lti: 0 },
  { month: "Feb", tonnes: 168000, revenue: 13500, cost: 9100, lti: 1 },
  { month: "Mar", tonnes: 175000, revenue: 14100, cost: 9350, lti: 0 },
  { month: "Apr", tonnes: 170000, revenue: 13650, cost: 9280, lti: 0 },
  { month: "May", tonnes: 175200, revenue: 14200, cost: 9540, lti: 0 },
];

export default function ExecutiveReport() {
  const [period, setPeriod] = useState("May 2026");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const d = MONTH_DATA;
  const current = MONTHLY_TREND[MONTHLY_TREND.length - 1];
  const prev = MONTHLY_TREND[MONTHLY_TREND.length - 2];

  const generateReport = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 2000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Executive Report</div>
          <div className="page-subtitle">AI-generated board-level management pack with KPIs, variance analysis, and narrative</div>
        </div>
        <div className="page-header-actions">
          <select className="form-select" value={period} onChange={e => setPeriod(e.target.value)} style={{ width: 150 }}>
            <option>May 2026</option>
            <option>April 2026</option>
            <option>March 2026</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={generateReport} disabled={generating}>
            {generating ? "Generating..." : generated ? "Regenerate" : "✦ Generate Report"}
          </button>
        </div>
      </div>

      {!generated && !generating && (
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div className="card-title" style={{ fontSize: 18 }}>AI Executive Report</div>
          <div style={{ color: "var(--text-secondary)", marginTop: 8, maxWidth: 400, margin: "12px auto" }}>
            Generate a comprehensive board-level report with AI analysis covering production, financials, safety, and maintenance performance for {period}.
          </div>
          <button className="btn btn-primary btn-lg" onClick={generateReport} style={{ marginTop: 16 }}>✦ Generate Now</button>
        </div>
      )}

      {generating && (
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <div className="loading-dots" style={{ justifyContent: "center", marginBottom: 16 }}><span/><span/><span/></div>
          <div style={{ color: "var(--text-secondary)" }}>AI is analysing {period} data and generating report...</div>
        </div>
      )}

      {generated && (
        <>
          <div className="board-main-grid" style={{ marginBottom: 20 }}>
            <div className="board-kpi-card"><div className="board-kpi-label">Production</div><div className="board-kpi-main">{d.production.tonnes.toLocaleString()}<span className="kpi-unit">t</span></div><div className="board-kpi-meta">{Math.round(d.production.tonnes / d.production.plan * 100)}% of plan</div></div>
            <div className="board-kpi-card"><div className="board-kpi-label">Revenue</div><div className="board-kpi-main">RM {(d.financial.revenue / 1e6).toFixed(1)}<span className="kpi-unit">M</span></div><div className="board-kpi-meta">Margin: {Math.round((d.financial.revenue - d.financial.cost) / d.financial.revenue * 100)}%</div></div>
            <div className="board-kpi-card"><div className="board-kpi-label">Safety</div><div className="board-kpi-main">{d.safety.lti}<span className="kpi-unit">LTI</span></div><div className="board-kpi-meta">{d.safety.nearMisses} near-misses · {d.safety.mtis} MTI</div></div>
            <div className="board-kpi-card"><div className="board-kpi-label">Equip Health</div><div className="board-kpi-main">{d.maintenance.equipmentHealth}<span className="kpi-unit">%</span></div><div className="board-kpi-meta">PM: {d.maintenance.pmCompliance}% · {d.maintenance.breakdowns} breakdowns</div></div>
          </div>

          <div className="dashboard-panels">
            <div className="card">
              <div className="card-header"><div className="card-title">Executive Summary</div></div>
              <div className="card-body">
                <div className="exec-summary">
                  <p><strong>Kros Hill — {period} Performance</strong></p>
                  <p>Production of {d.production.tonnes.toLocaleString()} tonnes was <strong>{Math.round(d.production.tonnes / d.production.plan * 100)}%</strong> of plan ({d.production.plan.toLocaleString()}t). Revenue of <strong>RM {(d.financial.revenue / 1e6).toFixed(1)}M</strong> with an operating margin of <strong>{Math.round((d.financial.revenue - d.financial.cost) / d.financial.revenue * 100)}%</strong>.</p>
                  <p>Safety performance: <strong>zero LTI</strong> for the month. {d.safety.nearMisses} near-misses reported reflecting strong reporting culture. {d.safety.observations} safety observations recorded.</p>
                  <p>Maintenance: equipment health at {d.maintenance.equipmentHealth}%. {d.maintenance.criticalAlerts} critical alerts active. PM compliance at {d.maintenance.pmCompliance}% (target 95%).</p>
                  <p><strong>Key risk:</strong> Crusher #2 drive bearing predicted failure within 3-5 days requires immediate intervention.</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Monthly Trend</div></div>
              <div className="card-body">
                <div className="trend-table">
                  {MONTHLY_TREND.map((m, i) => (
                    <div key={i} className="trend-row">
                      <span className="trend-mth">{m.month}</span>
                      <div className="trend-data">
                        <span className="trend-val">{m.tonnes.toLocaleString()}t</span>
                        <span className="trend-bar-cell">
                          <div className="trend-bar-tr"><div className="trend-bar-fill-tr" style={{ width: `${(m.tonnes / 180000) * 100}%`, background: m.tonnes >= 170000 ? "var(--green)" : "var(--gold)" }} /></div>
                        </span>
                        <span className={`trend-pct ${m.tonnes >= prev.tonnes ? "positive" : "negative"}`}>RM{(m.revenue / 1000).toFixed(0)}k</span>
                        <span className="trend-lti">{m.lti > 0 ? <span className="badge badge-red">LTI</span> : <span className="badge badge-green">OK</span>}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header"><div className="card-title">AI Narrative — Outlook & Recommendations</div></div>
            <div className="card-body">
              <div className="ai-rec-list">
                <div className="ai-rec-item">
                  <div className="ai-rec-icon">⬡</div>
                  <div className="ai-rec-content">
                    <div className="ai-rec-title">Production Outlook — Next Month Target: {d.outlook.nextMonthTarget.toLocaleString()}t</div>
                    <div className="ai-rec-desc">To achieve the target, the plant must run at 6,100t/day (current: 5,840t/day). The primary constraint is crusher availability. CR-02 bearing replacement must be completed within 48h. Additionally, shift handover delays (avg 15 min/shift) are costing approximately 180t/month in lost production time.</div>
                  </div>
                </div>
                <div className="ai-rec-item">
                  <div className="ai-rec-icon">💰</div>
                  <div className="ai-rec-content">
                    <div className="ai-rec-title">Financial Recommendations</div>
                    <div className="ai-rec-desc">Operating cost per tonne is RM {(d.financial.cost / d.production.tonnes).toFixed(2)} — 7% above budget of RM 32.50. Primary cost drivers: overtime (12% overspend) and crusher liners (15% above plan). Recommended: implement overtime approval threshold at 10% of base hours, and renegotiate liner supply contract.</div>
                  </div>
                </div>
                <div className="ai-rec-item">
                  <div className="ai-rec-icon">⚠</div>
                  <div className="ai-rec-content">
                    <div className="ai-rec-title">Risk Register Update</div>
                    <div className="ai-rec-desc">Overall risk level: <strong>{d.outlook.riskLevel.toUpperCase()}</strong>. Key initiatives for next month: {d.outlook.keyInitiatives.join(", ")}. Board approval required for emergency crusher component procurement (estimated RM 45,000).</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-ghost btn-sm">📄 Export PDF</button>
              <button className="btn btn-ghost btn-sm">📊 Export Excel</button>
              <button className="btn btn-primary btn-sm">✉ Distribute Report</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
