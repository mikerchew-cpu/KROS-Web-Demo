import { useState } from "react";

const OBSERVATIONS = [
  { id: 1, type: "Positive", desc: "Operator stopped conveyor before clearing jam — correct LOTO procedure followed.", loc: "Crusher Area", reporter: "Farah I.", date: "2026-05-27", status: "closed" },
  { id: 2, type: "Critical", desc: "Haul truck passed through active blast exclusion zone — radio communication failure.", loc: "West Pit", reporter: "Raj N.", date: "2026-05-27", status: "investigating" },
  { id: 3, type: "Positive", desc: "Crew conducted pre-start inspection without prompting — all items checked correctly.", loc: "Workshop", reporter: "Amirul H.", date: "2026-05-26", status: "closed" },
  { id: 4, type: "Critical", desc: "Fire extinguisher missing from EX-02 cab — replaced within 2h of report.", loc: "East Pit", reporter: "Mohd A.", date: "2026-05-26", status: "closed" },
  { id: 5, type: "Observation", desc: "Haul road surface deteriorating at junction B — grader required before next shift.", loc: "Haul Road B", reporter: "Siti A.", date: "2026-05-26", status: "open" },
];

const STAFF_HOURS = [
  { name: "Amirul Haziq", role: "Maint. Tech.", weekHrs: 54, todayHrs: 10.5, fatigueRisk: "low", shifts: 5, lastBreak: "2 days ago" },
  { name: "Raj Namasivayam", role: "Ops Super.", weekHrs: 62, todayHrs: 11, fatigueRisk: "medium", shifts: 6, lastBreak: "5 days ago" },
  { name: "Mohd Asyraf", role: "HSE Officer", weekHrs: 48, todayHrs: 9, fatigueRisk: "low", shifts: 5, lastBreak: "1 day ago" },
  { name: "Kevin Tan", role: "Maint. Tech.", weekHrs: 68, todayHrs: 12, fatigueRisk: "high", shifts: 6, lastBreak: "6 days ago" },
  { name: "Siti Aminah", role: "Shift Super.", weekHrs: 58, todayHrs: 10, fatigueRisk: "medium", shifts: 5, lastBreak: "3 days ago" },
];

const HAZARD_CATEGORIES = ["Dust/ Air Quality", "Ground Stability", "Mobile Equipment", "Electrical", "Working at Height", "Confined Space", "Chemicals", "Fire"];

export default function SafetyObservation() {
  const [tab, setTab] = useState("observations");
  const [showReport, setShowReport] = useState(false);
  const [reportForm, setReportForm] = useState({ type: "Observation", desc: "", loc: "", category: "" });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Safety & Fatigue Management</div>
          <div className="page-subtitle">Observations, hazard reporting, fatigue monitoring, and delay coding with AI analysis</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowReport(true)}>+ Report Hazard</button>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === "observations" ? "active" : ""}`} onClick={() => setTab("observations")}>Observations ({OBSERVATIONS.length})</button>
        <button className={`tab ${tab === "fatigue" ? "active" : ""}`} onClick={() => setTab("fatigue")}>Fatigue Monitor</button>
        <button className={`tab ${tab === "analysis" ? "active" : ""}`} onClick={() => setTab("analysis")}>AI Analysis</button>
      </div>

      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">Report Hazard / Observation</div><button className="btn btn-ghost btn-sm" onClick={() => setShowReport(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={reportForm.type} onChange={e => setReportForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="Observation">Safety Observation</option>
                  <option value="Hazard">Hazard Report</option>
                  <option value="Near Miss">Near Miss</option>
                  <option value="Critical">Critical Concern</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={reportForm.category} onChange={e => setReportForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="">— Select —</option>
                  {HAZARD_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={reportForm.loc} onChange={e => setReportForm(p => ({ ...p, loc: e.target.value }))} placeholder="e.g. Crusher #2" /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={reportForm.desc} onChange={e => setReportForm(p => ({ ...p, desc: e.target.value }))} placeholder="Describe what you observed..." rows={3} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowReport(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setShowReport(false); setReportForm({ type: "Observation", desc: "", loc: "", category: "" }); }}>Submit Report</button>
            </div>
          </div>
        </div>
      )}

      {tab === "observations" && (
        <div className="card">
          <div className="card-header"><div className="card-title">Safety Observations</div><div className="card-subtitle">Last 7 days — {OBSERVATIONS.filter(o => o.type === "Critical").length} critical, {OBSERVATIONS.filter(o => o.status === "open").length} open</div></div>
          <div className="card-body">
            {OBSERVATIONS.map(o => (
              <div key={o.id} className={`obs-row ${o.type === "Critical" ? "critical" : o.type === "Positive" ? "positive" : ""}`}>
                <div className="obs-type-badge">
                  <span className={`badge badge-${o.type === "Critical" ? "red" : o.type === "Positive" ? "green" : "gold"}`}>{o.type}</span>
                </div>
                <div className="obs-content">
                  <div className="obs-desc">{o.desc}</div>
                  <div className="obs-meta">{o.loc} · {o.reporter} · {o.date}</div>
                </div>
                <span className={`badge badge-${o.status === "closed" ? "green" : o.status === "investigating" ? "gold" : "muted"}`}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "fatigue" && (
        <div className="card">
          <div className="card-header"><div className="card-title">Fatigue & Hours Monitor</div><div className="card-subtitle">DOSH compliance: max 60h/week, max 12h/shift</div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Role</th><th>Week Hours</th><th>Today</th><th>Shifts</th><th>Last Break</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {STAFF_HOURS.map((s, i) => (
                  <tr key={i}>
                    <td className="cell-bold">{s.name}</td>
                    <td>{s.role}</td>
                    <td className={s.weekHrs > 60 ? "shift-warn" : ""}>{s.weekHrs}h</td>
                    <td>{s.todayHrs}h</td>
                    <td>{s.shifts}/7</td>
                    <td className="cell-mono">{s.lastBreak}</td>
                    <td><span className={`badge badge-${s.fatigueRisk === "high" ? "red" : s.fatigueRisk === "medium" ? "gold" : "green"}`}>{s.fatigueRisk}</span></td>
                    <td>
                      {s.fatigueRisk === "high" ? <button className="btn btn-danger btn-sm">Rest Required</button> :
                       s.fatigueRisk === "medium" ? <button className="btn btn-ghost btn-sm">Review</button> : <span className="cell-muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer">
            <div className="ai-insight">
              <span className="ai-insight-icon">✦</span>
              <span><strong>AI Fatigue Alert:</strong> Kevin Tan at 68h/week (exceeds 60h DOSH limit). Fatigue risk HIGH. Recommend mandatory rest day before next shift. Raj Namasivayam and Siti Aminah approaching threshold — review roster allocation.</span>
            </div>
          </div>
        </div>
      )}

      {tab === "analysis" && (
        <>
          <div className="dashboard-panels">
            <div className="card">
              <div className="card-header"><div className="card-title">Incident Trend Analysis</div></div>
              <div className="card-body">
                <div className="trend-stats">
                  <div className="trend-stat"><span className="trend-stat-value">12</span><span className="trend-stat-label">Month to date</span></div>
                  <div className="trend-stat"><span className="trend-stat-value">4</span><span className="trend-stat-label">Last month</span></div>
                  <div className="trend-stat"><span className="trend-stat-value">-33%</span><span className="trend-stat-label">vs same period 2025</span></div>
                  <div className="trend-stat"><span className="trend-stat-value">2</span><span className="trend-stat-label">Critical open</span></div>
                </div>
                <div className="trend-bars">
                  {["Mobile Equip", "Ground", "Electrical", "Dust/Air", "Fire"].map((c, i) => (
                    <div key={c} className="trend-bar-row">
                      <span className="trend-bar-label">{c}</span>
                      <div className="trend-bar-track"><div className="trend-bar-fill" style={{ width: `${60 - i * 10}%`, background: i < 2 ? "var(--red)" : i === 2 ? "var(--gold)" : "var(--teal)" }} /></div>
                      <span className="trend-bar-count">{3 - i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">AI Recommendations</div></div>
              <div className="card-body">
                <div className="ai-rec-list">
                  <div className="ai-rec-item">
                    <div className="ai-rec-icon">⚠</div>
                    <div className="ai-rec-content">
                      <div className="ai-rec-title">Haul Road Safety</div>
                      <div className="ai-rec-desc">2 near-misses at junction B this month. Install speed bumps and reflective markers. Schedule grader maintenance for haul road.</div>
                    </div>
                  </div>
                  <div className="ai-rec-item">
                    <div className="ai-rec-icon">↻</div>
                    <div className="ai-rec-content">
                      <div className="ai-rec-title">Fatigue Roster Review</div>
                      <div className="ai-rec-desc">3 operators exceeding 55h/week. Implement rotating shift pattern and mandatory 24h break after 6 consecutive shifts.</div>
                    </div>
                  </div>
                  <div className="ai-rec-item">
                    <div className="ai-rec-icon">◫</div>
                    <div className="ai-rec-content">
                      <div className="ai-rec-title">PTW Compliance</div>
                      <div className="ai-rec-desc">Mobile equipment category has 3 violations in 30 days. Targeted refresher training for excavator and haul truck operators.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
