import { useKROS, SKILLS_DATA, SUCCESSION_DATA } from "../context/KROSContext";

const KPIS = [
  { label: "Skills On Time",    value: "17",  sub: "of 20 skills current",      change: "+2 this month",  type: "positive", accent: "var(--teal)",   icon: "◫" },
  { label: "Overdue Reviews",   value: "3",   sub: "require immediate update",  change: "1 critical",     type: "negative", accent: "var(--red)",    icon: "⚠" },
  { label: "Succession Gaps",   value: "2",   sub: "critical roles uncovered",  change: "Ops & Metallurgy",type:"negative", accent: "var(--gold)",   icon: "⟳" },
  { label: "Exit Captures",     value: "100%",sub: "completed on time",         change: "3 this quarter", type: "positive", accent: "var(--green)",  icon: "◳" },
  { label: "PM Compliance",     value: "94%", sub: "target ≥ 95%",             change: "↓ 1% this month", type: "neutral",  accent: "var(--purple)", icon: "⬡" },
  { label: "Open PTWs",         value: "7",   sub: "active permits today",      change: "2 expire today", type: "neutral",  accent: "var(--teal-light)", icon: "⚖" },
  { label: "AI Queries Today",  value: "43",  sub: "staff interactions",        change: "↑ 12 vs yesterday",type:"positive",accent: "var(--purple-light)", icon: "✦" },
  { label: "Knowledge Score",   value: "82",  sub: "out of 100",               change: "↑ 4 this quarter",type:"positive", accent: "var(--gold-light)",  icon: "◎" },
];

const RECENT_ACTIVITY = [
  { time: "08:42", user: "Amirul Haziq",    action: "Asked Claude about crusher P1 breakdown response",           engine: "deepseek", skill: "maint_breakdown" },
  { time: "08:15", user: "Farah Izzati",    action: "Updated hse_emergency.md — slope failure protocol revised",  engine: null,       skill: "hse_emergency" },
  { time: "07:50", user: "Raj Namasivayam", action: "Completed shift handover via ops_shift_handover.md",          engine: null,       skill: "ops_shift_handover" },
  { time: "07:30", user: "Tan Mei Ling",    action: "Asked Claude about royalty calculation for Q1",               engine: "claude",   skill: "fin_royalty" },
  { time: "Yesterday", user: "HR Manager",  action: "Exit capture session completed — Kerani Kewangan departing",  engine: "claude",   skill: "hrm_exit" },
  { time: "Yesterday", user: "AI System",   action: "Flagged: hrm_succession.md overdue review — 5 months",        engine: null,       skill: "hrm_succession" },
];

const TAG_MAP = {
  ops: "tag-ops", hse: "tag-hse", hrm: "tag-hrm",
  fin: "tag-fin", proj: "tag-proj", maint: "tag-maint", env: "tag-env",
};

export default function Dashboard({ user, onNavigate }) {
  const { notifications, clearNotification } = useKROS();
  const overdueSkills = SKILLS_DATA.filter(s => s.status !== "fresh");
  const criticalGaps  = SUCCESSION_DATA.filter(s => s.risk === "critical");

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Good morning, {user.givenName} 👋</div>
          <div className="page-subtitle">{user.role} · {new Date().toLocaleDateString("en-MY", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("ask")}>✦ Ask AI</button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate("skills")}>View All Skills</button>
        </div>
      </div>

      {/* Alerts */}
      {notifications.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {notifications.map(n => (
            <div key={n.id} className={`alert alert-${n.type === "urgent" ? "error" : n.type === "warn" ? "warn" : "info"}`}>
              <span>{n.type === "urgent" ? "⚠" : n.type === "warn" ? "◉" : "◈"}</span>
              <span style={{ flex: 1 }}>{n.message}</span>
              {n.skill && (
                <span
                  className="skill-ref"
                  onClick={() => onNavigate("skills")}
                  style={{ cursor: "pointer" }}
                >
                  {n.skill}.md
                </span>
              )}
              <button
                onClick={() => clearNotification(n.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 14, padding: "0 4px" }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {KPIS.map((kpi, i) => (
          <div className="stat-card" key={i} style={{ "--accent-color": kpi.accent }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontSize: 20, opacity: 0.7 }}>{kpi.icon}</div>
            </div>
            <div className="stat-value">{kpi.value}</div>
            <div className="stat-label">{kpi.label}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{kpi.sub}</div>
            <div className={`stat-change ${kpi.type}`}>
              {kpi.type === "positive" ? "▲" : kpi.type === "negative" ? "▼" : "—"} {kpi.change}
            </div>
          </div>
        ))}
      </div>

      {/* Two columns: Skills status + Succession */}
      <div className="grid-2" style={{ marginBottom: 24 }}>

        {/* Skills needing attention */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Skills Needing Attention</div>
              <div className="card-subtitle">{overdueSkills.length} of 20 skills require update</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("skills")}>View all</button>
          </div>

          {overdueSkills.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div className={`skill-status-dot ${s.status}`} style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 1 }}>{s.title}</div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                  {s.id}.md · Owner: {s.owner}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span className={`badge badge-${s.status === "urgent" ? "red" : "gold"}`}>
                  {s.status}
                </span>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.lastUpdated}</span>
              </div>
            </div>
          ))}

          <div style={{ paddingTop: 12 }}>
            <div style={{ marginBottom: 6, fontSize: 11, color: "var(--text-muted)" }}>Overall Skills Health</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "85%", background: "linear-gradient(90deg, var(--teal), var(--gold))" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>17 current</span>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>85%</span>
            </div>
          </div>
        </div>

        {/* Succession gaps */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Succession Risk Monitor</div>
              <div className="card-subtitle">{criticalGaps.length} critical gaps — immediate action needed</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("succession")}>Full matrix</button>
          </div>

          {SUCCESSION_DATA.slice(0, 6).map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.role}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{row.current}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: row.readyNow === "—" ? "var(--red)" : "var(--green-light)", marginBottom: 2 }}>
                  {row.readyNow === "—" ? "No deputy" : row.readyNow}
                </div>
                <span className={`risk-pill risk-${row.risk}`}>
                  {row.risk === "critical" ? "🔴" : row.risk === "at-risk" ? "🟡" : "🟢"} {row.risk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Activity</div>
            <div className="card-subtitle">Latest staff interactions with KROS &amp; AI</div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Staff</th>
                <th>Action</th>
                <th>AI Used</th>
                <th>Skill</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ACTIVITY.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{row.time}</td>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 12 }}>{row.user}</td>
                  <td style={{ fontSize: 12 }}>{row.action}</td>
                  <td>
                    {row.engine ? (
                      <span className={`badge badge-${row.engine === "claude" ? "purple" : "teal"}`}>
                        {row.engine === "claude" ? "✦ Claude" : "◈ DeepSeek"}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: 11 }}>—</span>
                    )}
                  </td>
                  <td>
                    {row.skill && (
                      <span className="skill-ref" style={{ fontSize: 10 }}>{row.skill}.md</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
