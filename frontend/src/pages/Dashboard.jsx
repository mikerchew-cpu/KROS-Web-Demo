import { useState, useEffect } from "react";
import { useKROS, SKILLS_DATA, SUCCESSION_DATA } from "../context/KROSContext";

const ALL_WIDGETS = [
  { id: "kpi-grid", label: "KPI Grid", icon: "⬡", depts: ["admin", "mining", "finance", "maintenance"], defaultRole: "admin" },
  { id: "skills-health", label: "Skills Health", icon: "◫", depts: ["admin", "mining", "hse", "hr", "finance", "maintenance"], defaultRole: "admin" },
  { id: "succession", label: "Succession Monitor", icon: "⟳", depts: ["admin", "hr"], defaultRole: "hr" },
  { id: "production-summary", label: "Production Summary", icon: "📊", depts: ["admin", "mining", "maintenance"], defaultRole: "mining" },
  { id: "safety-snapshot", label: "Safety Snapshot", icon: "⚠", depts: ["admin", "hse"], defaultRole: "hse" },
  { id: "hr-snapshot", label: "HR Snapshot", icon: "👥", depts: ["admin", "hr"], defaultRole: "hr" },
  { id: "compliance", label: "Compliance Calendar", icon: "⚖", depts: ["admin", "finance", "hse"], defaultRole: "finance" },
  { id: "fleet-summary", label: "Fleet Summary", icon: "◈", depts: ["admin", "mining", "maintenance"], defaultRole: "mining" },
  { id: "training-alerts", label: "Training Alerts", icon: "◎", depts: ["admin", "hr"], defaultRole: "hr" },
  { id: "recent-activity", label: "Recent Activity", icon: "✦", depts: ["admin", "mining", "hse", "hr", "finance", "maintenance"], defaultRole: "admin" },
  { id: "environmental", label: "Environmental Status", icon: "🌿", depts: ["admin", "hse"], defaultRole: "hse" },
  { id: "weather", label: "Weather Alert", icon: "⛅", depts: ["admin", "mining", "hse", "maintenance"], defaultRole: "mining" },
];

const ROLE_MAP = {
  admin: "admin", manager: "admin", "Mine Manager": "mining", "Mine Ops Super.": "mining",
  "HSE Manager": "hse", "HR Manager": "hr", "Finance Manager": "finance",
  "Maintenance Tech.": "maintenance", "Maintenance Super.": "maintenance",
};

const RECENT_ACTIVITY = [
  { time: "08:42", user: "Amirul Haziq",    action: "Asked Claude about crusher P1 breakdown response",           engine: "deepseek", skill: "maint_breakdown" },
  { time: "08:15", user: "Farah Izzati",    action: "Updated hse_emergency.md — slope failure protocol revised",  engine: null,       skill: "hse_emergency" },
  { time: "07:50", user: "Raj Namasivayam", action: "Completed shift handover",                                  engine: null,       skill: "ops_shift_handover" },
  { time: "07:30", user: "Tan Mei Ling",    action: "Asked Claude about royalty calculation for Q1",               engine: "claude",   skill: "fin_royalty" },
  { time: "07:15", user: "AI System",       action: "Maint analysis — crusher bearing temp trending high",         engine: "ai_analysis", skill: "maint_ai_analysis" },
  { time: "Yesterday", user: "HR Manager",  action: "Exit capture session completed",                              engine: "claude",   skill: "hrm_exit" },
  { time: "Yesterday", user: "AI System",   action: "Flagged: hrm_succession.md overdue — 5 months",               engine: null,       skill: "hrm_succession" },
];

const STORAGE_KEY = "kros_dashboard_widgets";

function getDefaultWidgets(role) {
  const dept = ROLE_MAP[role] || "admin";
  return ALL_WIDGETS.filter(w => w.depts.includes(dept)).map(w => w.id);
}

function computeMetrics() {
  const fresh = SKILLS_DATA.filter(s => s.status === "fresh").length;
  const stale = SKILLS_DATA.filter(s => s.status === "stale").length;
  const urgent = SKILLS_DATA.filter(s => s.status === "urgent").length;
  return { skillsFresh: fresh, overdue: stale + urgent, gaps: SUCCESSION_DATA.filter(s => s.risk === "critical").length, exits: 100, pm: 94, ptw: 7, aiQueries: 43, score: Math.round((fresh / SKILLS_DATA.length) * 80 + 15), totalSkills: SKILLS_DATA.length, stale, urgent, fresh };
}

export default function Dashboard({ user, onNavigate }) {
  const { notifications, clearNotification } = useKROS();
  const [showConfig, setShowConfig] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return getDefaultWidgets(user.role);
  });
  const metrics = computeMetrics();

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(activeWidgets)); }, [activeWidgets]);

  const toggleWidget = (id) => {
    setActiveWidgets(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
  };

  const resetToDefault = () => {
    setActiveWidgets(getDefaultWidgets(user.role));
  };

  const w = (id) => activeWidgets.includes(id);
  const overdueSkills = SKILLS_DATA.filter(s => s.status !== "fresh");
  const criticalGaps = SUCCESSION_DATA.filter(s => s.risk === "critical");
  const deptLabel = ROLE_MAP[user.role] || "admin";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Good morning, {user.givenName}</div>
          <div className="page-subtitle">{user.role} · {new Date().toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowConfig(!showConfig)}>
            {showConfig ? "✓ Done" : "⚙ Customise"}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate("skills")}>View All Skills</button>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="page-alerts">
          {notifications.map(n => (
            <div key={n.id} className={`alert alert-${n.type === "urgent" ? "error" : n.type === "warn" ? "warn" : "info"}`}>
              <span>{n.type === "urgent" ? "⚠" : n.type === "warn" ? "◉" : "◈"}</span>
              <span style={{ flex: 1 }}>{n.message}</span>
              {n.skill && <span className="skill-ref" onClick={() => onNavigate("skills")} style={{ cursor: "pointer" }}>{n.skill}.md</span>}
              <button onClick={() => clearNotification(n.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 14, padding: "0 4px" }}>×</button>
            </div>
          ))}
        </div>
      )}

      {showConfig && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">Customise Dashboard</div>
            <div className="card-header-actions">
              <button className="btn btn-ghost btn-sm" onClick={resetToDefault}>Reset to {deptLabel} default</button>
            </div>
          </div>
          <div className="card-body">
            <div className="dash-config-grid">
              {ALL_WIDGETS.map(wgt => (
                <div key={wgt.id} className={`dash-config-item ${activeWidgets.includes(wgt.id) ? "active" : ""}`} onClick={() => toggleWidget(wgt.id)}>
                  <div className="dash-config-icon">{wgt.icon}</div>
                  <div className="dash-config-info">
                    <div className="dash-config-name">{wgt.label}</div>
                    <div className="dash-config-depts">{wgt.depts.map(d => <span key={d} className="dash-config-dept">{d}</span>)}</div>
                  </div>
                  <span className={`dash-config-toggle ${activeWidgets.includes(wgt.id) ? "on" : "off"}`}>
                    {activeWidgets.includes(wgt.id) ? "ON" : "OFF"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="dash-widget-grid">
        {w("kpi-grid") && (
          <div className="dash-widget-full">
            <div className="kpi-grid">
              {[
                { label: "Skills On Time", v: String(metrics.skillsFresh), sub: `of ${metrics.totalSkills} current`, ch: "+14 this month", icon: "◫", type: "positive" },
                { label: "Overdue Reviews", v: String(metrics.overdue), sub: "require update", ch: `${metrics.urgent} critical`, icon: "⚠", type: "negative" },
                { label: "Succession Gaps", v: String(metrics.gaps), sub: "critical roles", ch: "Ops & Metallurgy", icon: "⟳", type: "negative" },
                { label: "Exit Captures", v: "100%", sub: "completed on time", ch: "3 this quarter", icon: "◳", type: "positive" },
                { label: "PM Compliance", v: "94%", sub: "target ≥ 95%", ch: "↓ 1%", icon: "⬡", type: "neutral" },
                { label: "Open PTWs", v: "7", sub: "active today", ch: "2 expire today", icon: "⚖", type: "neutral" },
                { label: "AI Queries", v: "43", sub: "staff interactions", ch: "↑ 12 vs yesterday", icon: "✦", type: "positive" },
                { label: "Knowledge Score", v: String(metrics.score), sub: "out of 100", ch: "↑ 4 this quarter", icon: "◎", type: "positive" },
              ].map(k => (
                <div key={k.label} className="kpi-card">
                  <div className="kpi-card-header"><span className="kpi-icon">{k.icon}</span><span className={`kpi-trend ${k.type}`}>{k.ch.split(" ")[0]}</span></div>
                  <div className="kpi-value">{k.v}</div>
                  <div className="kpi-label">{k.label}</div>
                  <div className="kpi-sub">{k.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {w("production-summary") && (
          <div className="dash-widget-half">
            <div className="card">
              <div className="card-header">
                <div className="card-title">📊 Production Summary</div>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("prod-board")}>View →</button>
              </div>
              <div className="card-body">
                <div className="dash-mini-stats">
                  <div className="dash-mini-stat"><span className="dash-mini-val">17,500</span><span className="dash-mini-label">Today (t)</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val" style={{ color: "var(--gold)" }}>97.3%</span><span className="dash-mini-label">vs Plan</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val">57.8%</span><span className="dash-mini-label">Grade Fe</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val" style={{ color: "var(--red)" }}>88.5%</span><span className="dash-mini-label">Uptime</span></div>
                </div>
                <div className="ai-insight"><span className="ai-insight-icon">✦</span><span>Morning shift on target (+2.4%). Afternoon lost 45 min to conveyor splice. Night shift at 97%.</span></div>
              </div>
            </div>
          </div>
        )}

        {w("skills-health") && (
          <div className="dash-widget-half">
            <div className="card">
              <div className="card-header">
                <div className="card-title">◫ Skills Health</div>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("skills")}>View →</button>
              </div>
              <div className="card-body">
                {overdueSkills.slice(0, 3).map(s => (
                  <div key={s.id} className="list-row">
                    <div className={`skill-status-dot ${s.status}`} />
                    <div className="list-row-content">
                      <div className="list-row-title">{s.title}</div>
                      <div className="list-row-meta">{s.id}.md · {s.owner}</div>
                    </div>
                    <span className={`badge badge-${s.status === "urgent" ? "red" : "gold"}`}>{s.status}</span>
                  </div>
                ))}
                <div className="progress-label" style={{ marginTop: 10 }}>Overall: {metrics.skillsFresh}/{metrics.totalSkills} current ({Math.round(metrics.skillsFresh / metrics.totalSkills * 100)}%)</div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${metrics.skillsFresh / metrics.totalSkills * 100}%`, background: "linear-gradient(90deg, var(--teal), var(--gold))" }} /></div>
              </div>
            </div>
          </div>
        )}

        {w("succession") && (
          <div className="dash-widget-half">
            <div className="card">
              <div className="card-header">
                <div className="card-title">⟳ Succession Gaps</div>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("succession")}>View →</button>
              </div>
              <div className="card-body">
                {criticalGaps.slice(0, 3).map(r => (
                  <div key={r.role} className="list-row">
                    <div className="list-row-content">
                      <div className="list-row-title">{r.role}</div>
                      <div className="list-row-meta">{r.current}</div>
                    </div>
                    <span className={`risk-pill risk-${r.risk}`}>{r.risk === "critical" ? "🔴" : "🟡"} {r.risk}</span>
                  </div>
                ))}
                <div className="ai-insight" style={{ marginTop: 10 }}><span className="ai-insight-icon">✦</span><span>2 critical gaps: no deputy identified for Ops Superintendent or Chief Metallurgist.</span></div>
              </div>
            </div>
          </div>
        )}

        {w("safety-snapshot") && (
          <div className="dash-widget-half">
            <div className="card">
              <div className="card-header">
                <div className="card-title">⚠ Safety Snapshot</div>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("safety")}>View →</button>
              </div>
              <div className="card-body">
                <div className="dash-mini-stats">
                  <div className="dash-mini-stat"><span className="dash-mini-val" style={{ color: "var(--green-light)" }}>0</span><span className="dash-mini-label">LTI (MTD)</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val">12</span><span className="dash-mini-label">Near Misses</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val" style={{ color: "var(--gold)" }}>28</span><span className="dash-mini-label">Observations</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val">5</span><span className="dash-mini-label">Open PTWs</span></div>
                </div>
                <div className="ai-insight"><span className="ai-insight-icon">✦</span><span>Kevin Tan at 68h/week — exceeds 60h DOSH limit. Fatigue risk HIGH — mandatory rest recommended.</span></div>
              </div>
            </div>
          </div>
        )}

        {w("hr-snapshot") && (
          <div className="dash-widget-half">
            <div className="card">
              <div className="card-header">
                <div className="card-title">👥 HR Snapshot</div>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("hrm")}>View →</button>
              </div>
              <div className="card-body">
                <div className="dash-mini-stats">
                  <div className="dash-mini-stat"><span className="dash-mini-val">6</span><span className="dash-mini-label">Workers</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val">11</span><span className="dash-mini-label">Departments</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val" style={{ color: "var(--red)" }}>2</span><span className="dash-mini-label">Expired Certs</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val" style={{ color: "var(--gold)" }}>3</span><span className="dash-mini-label">Expiring Docs</span></div>
                </div>
                <div className="ai-insight"><span className="ai-insight-icon">✦</span><span>2 certifications expired (DOSH, Confined Space). 3 employees approaching 60h/week fatigue limit.</span></div>
              </div>
            </div>
          </div>
        )}

        {w("compliance") && (
          <div className="dash-widget-half">
            <div className="card">
              <div className="card-header">
                <div className="card-title">⚖ Upcoming Deadlines</div>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("compliance")}>View →</button>
              </div>
              <div className="card-body">
                {[
                  { item: "EPF Submission", due: "Jun 15", status: "upcoming" },
                  { item: "DOE Monthly Report", due: "Jun 7", status: "upcoming" },
                  { item: "TSF Dam Inspection", due: "May 15", status: "overdue" },
                  { item: "Royalty Payment Q2", due: "Jun 30", status: "upcoming" },
                ].map((c, i) => (
                  <div key={i} className="list-row">
                    <div className="list-row-content">
                      <div className="list-row-title">{c.item}</div>
                      <div className="list-row-meta">{c.due}</div>
                    </div>
                    <span className={`badge badge-${c.status === "overdue" ? "red" : "gold"}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {w("fleet-summary") && (
          <div className="dash-widget-half">
            <div className="card">
              <div className="card-header">
                <div className="card-title">◈ Fleet Summary</div>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("weightbridge")}>View →</button>
              </div>
              <div className="card-body">
                <div className="dash-mini-stats">
                  <div className="dash-mini-stat"><span className="dash-mini-val">{4}</span><span className="dash-mini-label">Active Trucks</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val">{1}</span><span className="dash-mini-label" style={{ color: "var(--red)" }}>Down</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val">3,245</span><span className="dash-mini-label">Tonnes Today</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val">18.5m</span><span className="dash-mini-label">Avg Cycle</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {w("training-alerts") && (
          <div className="dash-widget-half">
            <div className="card">
              <div className="card-header">
                <div className="card-title">◎ Training Alerts</div>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("training")}>View →</button>
              </div>
              <div className="card-body">
                {[
                  { name: "Ahmad Z.", cert: "DOSH Compliance", days: "120 days overdue" },
                  { name: "Raj N.", cert: "Haul Truck Ops", days: "Expired Jan 2026" },
                  { name: "Kevin T.", cert: "Confined Space", days: "Expired Nov 2025" },
                  { name: "Amirul H.", cert: "Haul Truck", days: "Expiring in 14 days" },
                ].map((t, i) => (
                  <div key={i} className="list-row">
                    <div className="list-row-content">
                      <div className="list-row-title">{t.name}</div>
                      <div className="list-row-meta">{t.cert} · {t.days}</div>
                    </div>
                    <span className="badge badge-red">Overdue</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {w("environmental") && (
          <div className="dash-widget-half">
            <div className="card">
              <div className="card-header">
                <div className="card-title">🌿 Environmental</div>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("environmental")}>View →</button>
              </div>
              <div className="card-body">
                <div className="dash-mini-stats">
                  <div className="dash-mini-stat"><span className="dash-mini-val" style={{ color: "var(--gold)" }}>78</span><span className="dash-mini-label">TSS (mg/L)</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val">89</span><span className="dash-mini-label">PM10 (µg/m³)</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val">2.8</span><span className="dash-mini-label">Vibration mm/s</span></div>
                  <div className="dash-mini-stat"><span className="dash-mini-val" style={{ color: "var(--red)" }}>1</span><span className="dash-mini-label">Overdue Reports</span></div>
                </div>
                <div className="ai-insight"><span className="ai-insight-icon">✦</span><span>TSS trending upward at C2 (78 mg/L). Dry season forecast — increase dust suppression. TSF inspection overdue.</span></div>
              </div>
            </div>
          </div>
        )}

        {w("weather") && (
          <div className="dash-widget-half">
            <div className="card">
              <div className="card-header">
                <div className="card-title">⛅ 5-Day Forecast</div>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("weather")}>View →</button>
              </div>
              <div className="card-body">
                <div className="dash-weather-mini">
                  {["Today 32°", "Tmrw 34°", "+2 31°⛈", "+3 29°🌧", "+4 30°"].map((d, i) => (
                    <span key={i} className="dash-weather-day">{d}</span>
                  ))}
                </div>
                <div className="ai-insight"><span className="ai-insight-icon">✦</span><span>Thunderstorms +2 days — postpone blasting. High temp tomorrow — increase water trucks for dust control.</span></div>
              </div>
            </div>
          </div>
        )}

        {w("recent-activity") && (
          <div className="dash-widget-full">
            <div className="card">
              <div className="card-header">
                <div className="card-title">✦ Recent Activity</div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Time</th><th>Staff</th><th>Action</th><th>AI Used</th><th>Skill</th></tr></thead>
                  <tbody>
                    {RECENT_ACTIVITY.map((row, i) => (
                      <tr key={i}>
                        <td className="cell-mono">{row.time}</td>
                        <td className="cell-bold">{row.user}</td>
                        <td>{row.action}</td>
                        <td>{row.engine === "ai_analysis" ? <span className="badge badge-purple">◈ AI</span> : row.engine ? <span className={`badge badge-${row.engine === "claude" ? "purple" : "teal"}`}>✦ {row.engine}</span> : <span className="cell-muted">—</span>}</td>
                        <td>{row.skill && <span className="skill-ref" style={{ fontSize: 10 }}>{row.skill}.md</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {activeWidgets.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 40, marginTop: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⬡</div>
          <div className="card-title" style={{ fontSize: 16 }}>Dashboard is empty</div>
          <div style={{ color: "var(--text-secondary)", marginTop: 8 }}>Click <strong>⚙ Customise</strong> above to add widgets to your dashboard.</div>
        </div>
      )}
    </div>
  );
}
