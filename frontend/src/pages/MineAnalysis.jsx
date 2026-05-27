import { useState, useRef } from "react";

const ANALYSIS_MODES = [
  { id: "grade", label: "Grade Control Analysis", icon: "⬡", desc: "Analyse ore grade trends, variability, and reconciliation against plan" },
  { id: "dilution", label: "Dilution & Recovery", icon: "⟳", desc: "Track mining dilution, ore loss, and identify improvement areas" },
  { id: "blasting", label: "Blast Performance", icon: "⚖", desc: "Evaluate blast fragmentation, powder factor, and wall damage" },
  { id: "cost", label: "Cost per Tonne", icon: "💰", desc: "Monitor mining cost drivers and benchmark against budget" },
  { id: "fleet", label: "Fleet Efficiency", icon: "◈", desc: "Analyse equipment utilisation, cycle times, and payload" },
  { id: "reconciliation", label: "Mine Reconciliation", icon: "◎", desc: "Resource model vs plan vs actual reconciliation across all stages" },
];

const SAMPLE_REPORTS = {
  grade: { title: "Grade Control Analysis — May 2026", summary: "Average grade 57.8% Fe vs plan 58.2%. Variance -0.4% within tolerance. East pit showing consistent high-grade above model.", kpis: ["Grade: 57.8%", "Deviation: -0.4%", "Compliance: 92%"] },
  dilution: { title: "Dilution & Recovery Report", summary: "Mining dilution at 8.2% (target <10%). Ore loss at 3.1%. Primary contributor: blast movement at hanging wall contact.", kpis: ["Dilution: 8.2%", "Ore Loss: 3.1%", "Recovery: 96.9%"] },
  blasting: { title: "Blast Performance — May 2026", summary: "Average powder factor 0.48 kg/t. Fragmentation P80 at 245mm. Wall damage incidents: 1 (minor).", kpis: ["Powder Factor: 0.48 kg/t", "P80: 245mm", "Wall Damage: 1 event"] },
};

const UPLOAD_HISTORY = [
  { name: "grade_data_q2_2026.xlsx", size: "2.4 MB", date: "2026-05-26", type: "Grade Control", status: "processed" },
  { name: "drill_log_may2026.csv", size: "1.8 MB", date: "2026-05-25", type: "Drilling", status: "processed" },
  { name: "blast_report_week21.pdf", size: "0.6 MB", date: "2026-05-24", type: "Blasting", status: "analysed" },
  { name: "cost_data_apr2026.xlsx", size: "3.2 MB", date: "2026-05-20", type: "Cost", status: "pending" },
];

export default function MineAnalysis() {
  const [activeMode, setActiveMode] = useState(null);
  const [uploaded, setUploaded] = useState(UPLOAD_HISTORY);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = (files) => {
    if (!files?.length) return;
    const file = files[0];
    const newEntry = { name: file.name, size: `${(file.size / (1024*1024)).toFixed(1)} MB`, date: new Date().toISOString().slice(0,10), type: "New Upload", status: "pending" };
    setUploaded(prev => [newEntry, ...prev]);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Mine Analysis</div>
          <div className="page-subtitle">AI-powered mining data analysis with skill upload — grade control, dilution, costs &amp; more</div>
        </div>
      </div>

      <div className="dashboard-panels">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Analysis Modes</div>
            <div className="card-subtitle">Select an analysis type to generate insights</div>
          </div>
          <div className="analysis-grid">
            {ANALYSIS_MODES.map(m => (
              <div key={m.id} className={`analysis-card ${activeMode === m.id ? "active" : ""}`} onClick={() => setActiveMode(activeMode === m.id ? null : m.id)}>
                <div className="analysis-card-icon">{m.icon}</div>
                <div className="analysis-card-title">{m.label}</div>
                <div className="analysis-card-desc">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Skill Upload</div>
            <div className="card-subtitle">Upload mine data files for AI analysis (CSV, XLSX, PDF up to 10MB)</div>
          </div>
          <div className="card-body">
            <div className={`upload-zone ${dragOver ? "drag-over" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" hidden accept=".csv,.xlsx,.xls,.pdf,.json" onChange={e => handleUpload(e.target.files)} />
              <div className="upload-icon">📤</div>
              <div className="upload-text">Drop files here or click to browse</div>
              <div className="upload-sub">Supports CSV, XLSX, PDF, JSON — max 10MB</div>
            </div>

            {uploaded.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="upload-history-label">Upload History</div>
                {uploaded.map((u, i) => (
                  <div key={i} className="upload-row">
                    <div className="upload-row-info">
                      <div className="upload-row-name">{u.name}</div>
                      <div className="upload-row-meta">{u.size} · {u.date} · {u.type}</div>
                    </div>
                    <span className={`badge badge-${u.status === "processed" ? "green" : u.status === "analysed" ? "purple" : "gold"}`}>{u.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {activeMode && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div className="card-title">{SAMPLE_REPORTS[activeMode]?.title || `${ANALYSIS_MODES.find(m => m.id === activeMode)?.label} Analysis`}</div>
            <button className="btn btn-primary btn-sm">✦ Run AI Analysis</button>
          </div>
          <div className="card-body">
            <div className="analysis-output">{SAMPLE_REPORTS[activeMode]?.summary || "Upload data files above and run AI analysis to generate insights. Analysis covers trend detection, anomaly identification, and actionable recommendations."}</div>
            {SAMPLE_REPORTS[activeMode]?.kpis && (
              <div className="kpi-mini-row">
                {SAMPLE_REPORTS[activeMode].kpis.map((k, i) => (
                  <div key={i} className="kpi-mini">{k}</div>
                ))}
              </div>
            )}
            <div className="analysis-recommendations">
              <div className="card-subtitle" style={{ marginBottom: 8 }}>AI Recommendations</div>
              <ul className="rec-list">
                <li>Increase blast monitoring at hanging wall contact to reduce dilution by estimated 1.5%</li>
                <li>Review grade control drilling pattern in East pit — potential for 5m × 5m optimisation</li>
                <li>Schedule reconciliation review meeting before month-end reporting</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
