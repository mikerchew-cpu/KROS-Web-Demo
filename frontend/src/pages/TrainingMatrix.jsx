import { useState } from "react";

const TRAINING_MODULES = [
  { id: "LOTO", name: "Lockout/Tagout (LOTO)", category: "Safety", interval: 12, hours: 8, critical: true },
  { id: "PTW", name: "Permit-to-Work Authorisation", category: "Safety", interval: 12, hours: 16, critical: true },
  { id: "CONF-SPACE", name: "Confined Space Entry", category: "Safety", interval: 12, hours: 8, critical: true },
  { id: "FIRE", name: "Fire Warden / Extinguisher", category: "Safety", interval: 24, hours: 4, critical: false },
  { id: "EMERG", name: "Emergency Response", category: "Safety", interval: 12, hours: 8, critical: true },
  { id: "HAUL", name: "Haul Truck Operation", category: "Operations", interval: 24, hours: 24, critical: false },
  { id: "EXCAV", name: "Excavator Operation", category: "Operations", interval: 24, hours: 24, critical: false },
  { id: "DRILL", name: "Drill Rig Operation", category: "Operations", interval: 24, hours: 16, critical: false },
  { id: "BLAST", name: "Blasting Certificate", category: "Operations", interval: 12, hours: 32, critical: true },
  { id: "ENV", name: "Environmental Awareness", category: "Compliance", interval: 24, hours: 4, critical: false },
  { id: "DOSH", name: "DOSH Compliance Officer", category: "Compliance", interval: 12, hours: 40, critical: true },
  { id: "HRDF", name: "HRDF Grant Applications", category: "Compliance", interval: 24, hours: 8, critical: false },
];

const STAFF = [
  { name: "Ahmad Zulkifli", role: "Mine Manager", trainings: { LOTO: { date: "2025-11-15", expiry: "2026-11-15", status: "valid" }, PTW: { date: "2025-11-15", expiry: "2026-11-15", status: "valid" }, EMERG: { date: "2025-06-20", expiry: "2026-06-20", status: "valid" }, BLAST: { date: "2025-03-10", expiry: "2026-03-10", status: "expiring" }, DOSH: { date: "2024-01-15", expiry: "2025-01-15", status: "expired" } } },
  { name: "Farah Izzati", role: "HSE Manager", trainings: { LOTO: { date: "2025-12-01", expiry: "2026-12-01", status: "valid" }, PTW: { date: "2025-12-01", expiry: "2026-12-01", status: "valid" }, CONF_SPACE: { date: "2025-08-15", expiry: "2026-08-15", status: "valid" }, EMERG: { date: "2025-07-01", expiry: "2026-07-01", status: "valid" }, FIRE: { date: "2024-11-10", expiry: "2026-11-10", status: "valid" }, DOSH: { date: "2025-04-20", expiry: "2026-04-20", status: "valid" } } },
  { name: "Amirul Haziq", role: "Maint. Tech", trainings: { LOTO: { date: "2025-10-20", expiry: "2026-10-20", status: "valid" }, CONF_SPACE: { date: "2025-06-10", expiry: "2026-06-10", status: "valid" }, HAUL: { date: "2024-05-15", expiry: "2026-05-15", status: "expiring" }, EXCAV: { date: "2024-05-15", expiry: "2026-05-15", status: "expiring" }, FIRE: { date: "2025-02-10", expiry: "2027-02-10", status: "valid" } } },
  { name: "Raj Namasivayam", role: "Ops Super.", trainings: { LOTO: { date: "2025-09-01", expiry: "2026-09-01", status: "valid" }, PTW: { date: "2025-09-01", expiry: "2026-09-01", status: "valid" }, HAUL: { date: "2024-01-10", expiry: "2026-01-10", status: "expired" }, BLAST: { date: "2025-06-15", expiry: "2026-06-15", status: "valid" }, EMERG: { date: "2025-04-10", expiry: "2026-04-10", status: "expiring" } } },
  { name: "Tan Mei Ling", role: "Finance Manager", trainings: { HRDF: { date: "2025-05-01", expiry: "2027-05-01", status: "valid" }, ENV: { date: "2025-03-20", expiry: "2027-03-20", status: "valid" } } },
  { name: "Kevin Tan", role: "Maint. Tech", trainings: { LOTO: { date: "2025-08-15", expiry: "2026-08-15", status: "valid" }, CONF_SPACE: { date: "2024-11-20", expiry: "2025-11-20", status: "expired" }, HAUL: { date: "2024-10-01", expiry: "2026-10-01", status: "valid" }, FIRE: { date: "2024-06-15", expiry: "2026-06-15", status: "expiring" } } },
];

function daysUntil(d) { return Math.ceil((new Date(d) - new Date()) / (1000*60*60*24)); }

export default function TrainingMatrix() {
  const [view, setView] = useState("matrix");

  const expireSoon = [];
  STAFF.forEach(s => Object.entries(s.trainings).forEach(([mod, t]) => {
    if (t.status === "expired" || t.status === "expiring") expireSoon.push({ staff: s.name, role: s.role, module: mod, ...t, days: daysUntil(t.expiry) });
  }));

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Training & Competency Matrix</div><div className="page-subtitle">Role-based training tracking, expiry alerts, and AI-driven gap analysis</div></div>
        <button className="btn btn-primary btn-sm">+ Assign Training</button>
      </div>

      <div className="board-main-grid" style={{ marginBottom: 20 }}>
        <div className="board-kpi-card"><div className="board-kpi-label">Staff Tracked</div><div className="board-kpi-main">{STAFF.length}</div><div className="board-kpi-meta">{TRAINING_MODULES.length} training modules</div></div>
        <div className="board-kpi-card"><div className="board-kpi-label">Expired</div><div className="board-kpi-main" style={{ color: "var(--red)" }}>{expireSoon.filter(e => e.status === "expired").length}</div><div className="board-kpi-meta">Requires immediate action</div></div>
        <div className="board-kpi-card"><div className="board-kpi-label">Expiring Soon</div><div className="board-kpi-main" style={{ color: "var(--gold)" }}>{expireSoon.filter(e => e.status === "expiring").length}</div><div className="board-kpi-meta">Within 60 days</div></div>
        <div className="board-kpi-card"><div className="board-kpi-label">Compliance Rate</div><div className="board-kpi-main">{Math.round((1 - expireSoon.length / (STAFF.length * Object.keys(STAFF[0].trainings).length)) * 100)}<span className="kpi-unit">%</span></div><div className="board-kpi-meta">All modules valid</div></div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${view === "matrix" ? "active" : ""}`} onClick={() => setView("matrix")}>Competency Matrix</button>
        <button className={`tab ${view === "expiry" ? "active" : ""}`} onClick={() => setView("expiry")}>Expiry Alerts ({expireSoon.length})</button>
        <button className={`tab ${view === "analysis" ? "active" : ""}`} onClick={() => setView("analysis")}>AI Gap Analysis</button>
      </div>

      {view === "matrix" && (
        <div className="card" style={{ padding: 0, overflow: "auto" }}>
          <table className="training-matrix-table">
            <thead>
              <tr>
                <th style={{ minWidth: 150, position: "sticky", left: 0, background: "var(--surface-1)", zIndex: 2 }}>Staff / Module</th>
                {TRAINING_MODULES.map(m => <th key={m.id} title={m.name} className={m.critical ? "critical-mod" : ""}>{m.name.length > 10 ? m.id : m.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {STAFF.map(s => (
                <tr key={s.name}>
                  <td style={{ position: "sticky", left: 0, background: "var(--surface-1)", zIndex: 1, fontWeight: 600 }}>{s.name}<br/><span className="cell-mono">{s.role}</span></td>
                  {TRAINING_MODULES.map(m => {
                    const t = s.trainings[m.id];
                    const days = t ? daysUntil(t.expiry) : null;
                    return (
                      <td key={m.id} className="training-cell">
                        {t ? (
                          <div className={`training-badge ${t.status}`}>
                            <span className="training-status">{t.status === "valid" ? "✓" : t.status === "expiring" ? "⚠" : "✕"}</span>
                            {days !== null && <span className="training-days">{days > 0 ? `${days}d` : "0d"}</span>}
                          </div>
                        ) : (
                          <div className="training-badge na"><span className="training-status">—</span></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "expiry" && (
        <div className="card">
          <div className="card-header"><div className="card-title">Expiry Alerts</div><div className="card-subtitle">{expireSoon.length} items requiring attention</div></div>
          <div className="card-body">
            {expireSoon.sort((a, b) => a.days - b.days).map((e, i) => (
              <div key={i} className="expiry-row">
                <span className={`expiry-icon ${e.status === "expired" ? "expired" : "expiring"}`}>{e.status === "expired" ? "✕" : "⚠"}</span>
                <div className="expiry-info">
                  <span className="expiry-staff">{e.staff}</span>
                  <span className="expiry-module">{TRAINING_MODULES.find(m => m.id === e.module)?.name || e.module}</span>
                </div>
                <span className={`expiry-date ${e.status === "expired" ? "expired" : ""}`}>{e.expiry} ({e.days > 0 ? `${e.days} days` : "Overdue"})</span>
                <span className={`badge badge-${e.status === "expired" ? "red" : "gold"}`}>{e.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "analysis" && (
        <div className="dashboard-panels">
          <div className="card">
            <div className="card-header"><div className="card-title">AI Gap Analysis</div></div>
            <div className="card-body">
              <div className="ai-rec-list">
                <div className="ai-rec-item">
                  <div className="ai-rec-icon">⚠</div>
                  <div className="ai-rec-content">
                    <div className="ai-rec-title">Critical Training Gaps</div>
                    <div className="ai-rec-desc">Ahmad Zulkifli — DOSH Compliance Officer certification expired (Jan 2025). Raj Namasivayam — Haul Truck Operation expired (Jan 2026). Kevin Tan — Confined Space Entry expired (Nov 2025). These are regulatory requirements — schedule renewal within 14 days.</div>
                  </div>
                </div>
                <div className="ai-rec-item">
                  <div className="ai-rec-icon">⟳</div>
                  <div className="ai-rec-content">
                    <div className="ai-rec-title">Expiring within 60 Days</div>
                    <div className="ai-rec-desc">3 certifications approaching expiry: Ahmad (Blasting — Mar 2026), Amirul (Haul Truck & Excavator — May 2026), Raj (Emergency Response — Apr 2026), Kevin (Fire Warden — Jun 2026). Recommend: group training session for haul truck and excavator recertification.</div>
                  </div>
                </div>
                <div className="ai-rec-item">
                  <div className="ai-rec-icon">⬡</div>
                  <div className="ai-rec-content">
                    <div className="ai-rec-title">Competency Coverage</div>
                    <div className="ai-rec-desc">Only 2 of 6 staff have PTW Authorisation. Only 1 has DOSH certification. Consider: cross-train Ops Super. and Maintenance Lead on PTW to increase coverage and reduce single-point dependency.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Training Recommendation</div></div>
            <div className="card-body">
              <div className="training-recommendations">
                <div className="rec-month">
                  <div className="rec-month-header">June 2026</div>
                  <div className="rec-month-items">
                    <span className="rec-item"><span className="rec-item-name">Confined Space Refresher</span><span className="rec-item-staff">Kevin Tan</span></span>
                    <span className="rec-item"><span className="rec-item-name">Haul Truck Re-cert</span><span className="rec-item-staff">Amirul H., Raj N.</span></span>
                    <span className="rec-item"><span className="rec-item-name">Blasting Renewal</span><span className="rec-item-staff">Ahmad Z.</span></span>
                  </div>
                </div>
                <div className="rec-month">
                  <div className="rec-month-header">July 2026</div>
                  <div className="rec-month-items">
                    <span className="rec-item"><span className="rec-item-name">DOSH Compliance Course</span><span className="rec-item-staff">Ahmad Z., Farah I.</span></span>
                    <span className="rec-item"><span className="rec-item-name">Excavator Re-cert</span><span className="rec-item-staff">Amirul H.</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
