import { useState, useRef } from "react";

const METRICS = [
  { id: "tonnes", label: "Tonnes Mined", target: "180,000", actual: "175,200", unit: "t", icon: "⬡" },
  { id: "grade", label: "Feed Grade", target: "58.2", actual: "57.8", unit: "% Fe", icon: "⟳" },
  { id: "recovery", label: "Plant Recovery", target: "94.0", actual: "93.2", unit: "%", icon: "◎" },
  { id: "uptime", label: "Crushing Uptime", target: "92", actual: "88.5", unit: "%", icon: "⚖" },
  { id: "cost", label: "Unit Cost", target: "32.50", actual: "34.80", unit: "RM/t", icon: "💰" },
  { id: "compliance", label: "Grade Compliance", target: "95", actual: "91", unit: "%", icon: "✓" },
];

const SHIFTS = [
  { shift: "Morning", tonnes: 6200, grade: 58.1, downtime: 45, notes: "Crusher jam cleared 08:30" },
  { shift: "Afternoon", tonnes: 5800, grade: 57.5, downtime: 70, notes: "Conveyor belt splice repair" },
  { shift: "Night", tonnes: 5500, grade: 57.9, downtime: 30, notes: "Routine maintenance window" },
];

const SAMPLE_UPLOADS = [
  { name: "daily_production_may27.xlsx", size: "1.2 MB", date: "2026-05-27", status: "analysed" },
  { name: "crusher_throughput_week21.csv", size: "0.8 MB", date: "2026-05-26", status: "processed" },
  { name: "grade_control_lab_results_27may.pdf", size: "2.1 MB", date: "2026-05-27", status: "pending" },
];

export default function ProductionAnalysis() {
  const [uploads, setUploads] = useState(SAMPLE_UPLOADS);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = (files) => {
    if (!files?.length) return;
    const f = files[0];
    setUploads(prev => [{ name: f.name, size: `${(f.size / (1024*1024)).toFixed(1)} MB`, date: new Date().toISOString().slice(0,10), status: "pending" }, ...prev]);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Mine Production Analysis</div>
          <div className="page-subtitle">Real-time production tracking, shift analysis, and AI-driven performance insights</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm">✦ Generate Report</button>
        </div>
      </div>

      <div className="kpi-grid">
        {METRICS.map(m => {
          const actualNum = parseFloat(m.actual);
          const targetNum = parseFloat(m.target);
          const pct = Math.round((actualNum / targetNum) * 100);
          const isGood = m.id === "cost" ? pct <= 100 : pct >= 100;
          return (
            <div key={m.id} className="kpi-card">
              <div className="kpi-card-header">
                <span className="kpi-icon">{m.icon}</span>
                <span className={`kpi-trend ${isGood ? "positive" : "negative"}`}>{pct}%</span>
              </div>
              <div className="kpi-value">{m.actual}<span className="kpi-unit">{m.unit}</span></div>
              <div className="kpi-label">{m.label}</div>
              <div className="kpi-sub">Target: {m.target}{m.unit}</div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-panels">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Today's Production by Shift</div>
            <div className="card-subtitle">{new Date().toLocaleDateString("en-MY", { day:"numeric", month:"long", year:"numeric" })}</div>
          </div>
          <div className="shift-grid">
            {SHIFTS.map((s, i) => (
              <div key={i} className="shift-card">
                <div className="shift-header">
                  <span className="shift-name">{s.shift}</span>
                  <span className="shift-stat">{s.tonnes.toLocaleString()} t</span>
                </div>
                <div className="shift-row"><span>Grade</span><span>{s.grade}% Fe</span></div>
                <div className="shift-row"><span>Downtime</span><span className={s.downtime > 60 ? "shift-warn" : ""}>{s.downtime} min</span></div>
                <div className="shift-notes">{s.notes}</div>
              </div>
            ))}
          </div>
          <div className="shift-total">
            <span>Total Today</span>
            <span className="shift-total-value">17,500 tonnes</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Production Skill Upload</div>
            <div className="card-subtitle">Upload shift reports, production data, or lab results for AI analysis</div>
          </div>
          <div className="card-body">
            <div className={`upload-zone ${dragOver ? "drag-over" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" hidden accept=".csv,.xlsx,.xls,.pdf" onChange={e => handleUpload(e.target.files)} />
              <div className="upload-icon">📤</div>
              <div className="upload-text">Drop production data files here</div>
              <div className="upload-sub">Supports CSV, XLSX, PDF — max 10MB</div>
            </div>
            <div className="upload-history">
              {uploads.map((u, i) => (
                <div key={i} className="upload-row">
                  <div className="upload-row-info">
                    <div className="upload-row-name">{u.name}</div>
                    <div className="upload-row-meta">{u.size} · {u.date}</div>
                  </div>
                  <span className={`badge badge-${u.status === "analysed" ? "purple" : u.status === "processed" ? "green" : "gold"}`}>{u.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">AI Production Insights</div>
          <div className="card-subtitle">Automated analysis based on uploaded data and shift reports</div>
        </div>
        <div className="card-body">
          <div className="insight-grid">
            <div className="insight-card">
              <div className="insight-icon">⬡</div>
              <div className="insight-content">
                <div className="insight-title">Throughput Below Target</div>
                <div className="insight-desc">Current run rate 175.2kt vs target 180kt. Primary constraint: crusher jam (45 min downtime). Recommendation: review mantle and liner condition.</div>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">⟳</div>
              <div className="insight-content">
                <div className="insight-title">Grade Variability Detected</div>
                <div className="insight-desc">Afternoon shift grade dropped to 57.5% (range 0.6% below morning). Correlates with face change in West Pit. Recommend additional grade control samples.</div>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">⚖</div>
              <div className="insight-content">
                <div className="insight-title">Cost Escalation Alert</div>
                <div className="insight-desc">Unit cost RM 34.80/t exceeds budget RM 32.50/t by 7%. Driven by: overtime (12%) and crusher liner wear (5% over plan). Full cost analysis uploaded to Cost Analysis skill.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
