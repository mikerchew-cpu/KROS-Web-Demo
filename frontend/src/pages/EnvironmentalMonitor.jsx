import { useState } from "react";

const MONITOR_POINTS = [
  { id: "WQ-01", name: "Discharge Point C2", type: "Water Quality", params: [
    { name: "TSS", value: 78, limit: 100, unit: "mg/L", status: "warning" },
    { name: "pH", value: 7.2, limit: "6.0-9.0", unit: "", status: "normal" },
    { name: "Oil & Grease", value: 3.2, limit: 10, unit: "mg/L", status: "normal" },
    { name: "Iron (Fe)", value: 2.8, limit: 5, unit: "mg/L", status: "normal" },
  ]},
  { id: "AQ-01", name: "Perimeter Station NW", type: "Air Quality", params: [
    { name: "PM10", value: 89, limit: 150, unit: "µg/m³", status: "normal" },
    { name: "PM2.5", value: 35, limit: 75, unit: "µg/m³", status: "normal" },
    { name: "NO₂", value: 0.02, limit: 0.17, unit: "ppm", status: "normal" },
  ]},
  { id: "VB-01", name: "Community Monitor #2", type: "Vibration", params: [
    { name: "PPV", value: 2.8, limit: 5.0, unit: "mm/s", status: "normal" },
    { name: "Airblast", value: 115, limit: 133, unit: "dBL", status: "normal" },
  ]},
  { id: "TSF-01", name: "TSF Dam - Piezometer 3", type: "Tailings", params: [
    { name: "Phreatic Level", value: 12.4, limit: 15.0, unit: "m", status: "normal" },
    { name: "Freeboard", value: 2.8, limit: 2.0, unit: "m", status: "normal" },
    { name: "Decant Flow", value: 18.5, limit: 25, unit: "L/s", status: "normal" },
  ]},
  { id: "NQ-01", name: "Perimeter NE", type: "Noise", params: [
    { name: "Leq (Day)", value: 52, limit: 65, unit: "dB(A)", status: "normal" },
    { name: "Leq (Night)", value: 41, limit: 55, unit: "dB(A)", status: "normal" },
  ]},
];

const DOE_CALENDAR = [
  { item: "Monthly Effluent Report", due: "2026-06-07", status: "upcoming", authority: "DOE" },
  { item: "Scheduled Waste Inventory", due: "2026-06-15", status: "upcoming", authority: "DOE" },
  { item: "Quarterly Groundwater Report", due: "2026-07-01", status: "upcoming", authority: "DOE/JMG" },
  { item: "Annual Environmental Audit", due: "2026-08-30", status: "upcoming", authority: "DOE" },
  { item: "TSF Dam Safety Inspection", due: "2026-05-15", status: "overdue", authority: "JMG" },
];

export default function EnvironmentalMonitor() {
  const [selectedPoint, setSelectedPoint] = useState(MONITOR_POINTS[0].id);
  const point = MONITOR_POINTS.find(p => p.id === selectedPoint) || MONITOR_POINTS[0];

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Environmental Monitoring</div><div className="page-subtitle">Live water, air, vibration, tailings, and noise monitoring with AI-driven compliance predictions</div></div>
      </div>

      <div className="prod-controls" style={{ marginBottom: 20 }}>
        <div className="prod-controls-row">
          <div className="prod-select-group">
            <label className="prod-label">Monitoring Point</label>
            <select className="form-select" value={selectedPoint} onChange={e => setSelectedPoint(e.target.value)}>
              {MONITOR_POINTS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
            </select>
          </div>
          <div className="prod-select-group">
            <label className="prod-label">Status</label>
            <span className={`badge badge-${point.params.some(p => p.status === "warning") ? "gold" : "green"}`} style={{ alignSelf: "center" }}>
              {point.params.some(p => p.status === "warning") ? "⚠ Warnings" : "✓ All Normal"}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-panels">
        <div className="card">
          <div className="card-header"><div className="card-title">{point.name} — Parameters</div></div>
          <div className="card-body">
            {point.params.map((p, i) => (
              <div key={i} className="env-param-row">
                <div className="env-param-info">
                  <span className="env-param-name">{p.name}</span>
                  <span className="env-param-value">{p.value}</span>
                  <span className="env-param-unit">{p.unit}</span>
                </div>
                <div className="env-param-bar">
                  {typeof p.limit === "number" && (
                    <div className="env-param-fill" style={{
                      width: `${Math.min((p.value / p.limit) * 100, 100)}%`,
                      background: p.status === "warning" ? "var(--gold)" : p.value / p.limit > 0.75 ? "var(--teal-light)" : "var(--green)",
                    }} />
                  )}
                </div>
                <span className="env-param-limit">Limit: {p.limit}{p.unit}</span>
                <span className={`badge badge-${p.status === "warning" ? "gold" : "green"}`} style={{ fontSize: 9 }}>{p.status}</span>
              </div>
            ))}
          </div>
          <div className="card-footer">
            <div className="ai-insight"><span className="ai-insight-icon">✦</span><span><strong>AI Analysis:</strong> TSS at {point.params.find(p => p.name === "TSS")?.value || "—"} mg/L — {point.params.some(p => p.name === "TSS" && p.status === "warning") ? "trending upward, check sediment pond and flocculant dosing." : "within limits, continue standard monitoring."}</span></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Compliance Calendar</div></div>
          <div className="card-body">
            {DOE_CALENDAR.map((c, i) => (
              <div key={i} className="doe-row">
                <div className="doe-info">
                  <span className="doe-item">{c.item}</span>
                  <span className="doe-auth">{c.authority}</span>
                </div>
                <span className={`doe-date ${c.status === "overdue" ? "doe-overdue" : ""}`}>{c.due}</span>
                <span className={`badge badge-${c.status === "overdue" ? "red" : "gold"}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><div className="card-title">AI Environmental Predictions</div></div>
        <div className="card-body">
          <div className="ai-rec-list">
            <div className="ai-rec-item">
              <div className="ai-rec-icon">🌿</div>
              <div className="ai-rec-content">
                <div className="ai-rec-title">Water Quality Forecast</div>
                <div className="ai-rec-desc">Based on 7-day trend, TSS at Discharge Point C2 is projected to reach 85 mg/L within 5 days. Recommend: increase flocculant dosing by 10% and check sediment pond level before scheduled maintenance.</div>
              </div>
            </div>
            <div className="ai-rec-item">
              <div className="ai-rec-icon">⚠</div>
              <div className="ai-rec-content">
                <div className="ai-rec-title">Dry Season Risk</div>
                <div className="ai-rec-desc">Forecast shows 14 consecutive dry days starting June 3. Risk: elevated dust levels and reduced water availability for dust suppression. Recommendation: pre-wet haul roads, stockpile water, schedule water truck shifts.</div>
              </div>
            </div>
            <div className="ai-rec-item">
              <div className="ai-rec-icon">◫</div>
              <div className="ai-rec-content">
                <div className="ai-rec-title">Compliance Alert</div>
                <div className="ai-rec-desc">TSF Dam Safety Inspection overdue (due 2026-05-15). Annual report must include piezometer trends, freeboard measurements, and dam stability assessment. Notify JMG within 7 days of completed inspection.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
