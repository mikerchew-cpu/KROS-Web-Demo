import { useState } from "react";
import { useKROS, SKILLS_DATA, SUCCESSION_DATA } from "../context/KROSContext";

const KPI_DEFS = [
  { label: "Skills On Time",    key: "skillsFresh", icon: "◫", type: "positive" },
  { label: "Overdue Reviews",   key: "overdue",     icon: "⚠", type: "negative" },
  { label: "Succession Gaps",   key: "gaps",        icon: "⟳", type: "negative" },
  { label: "Exit Captures",     key: "exits",       icon: "◳", type: "positive" },
  { label: "PM Compliance",     key: "pm",          icon: "⬡", type: "neutral" },
  { label: "Open PTWs",         key: "ptw",         icon: "⚖", type: "neutral" },
  { label: "AI Queries Today",  key: "aiQueries",   icon: "✦", type: "positive" },
  { label: "Knowledge Score",   key: "score",       icon: "◎", type: "positive" },
];

const RECENT_ACTIVITY = [
  { time: "08:42", user: "Amirul Haziq",    action: "Asked Claude about crusher P1 breakdown response",           engine: "deepseek", skill: "maint_breakdown" },
  { time: "08:15", user: "Farah Izzati",    action: "Updated hse_emergency.md — slope failure protocol revised",  engine: null,       skill: "hse_emergency" },
  { time: "07:50", user: "Raj Namasivayam", action: "Completed shift handover via ops_shift_handover.md",          engine: null,       skill: "ops_shift_handover" },
  { time: "07:30", user: "Tan Mei Ling",    action: "Asked Claude about royalty calculation for Q1",               engine: "claude",   skill: "fin_royalty" },
  { time: "07:15", user: "AI System",       action: "Maint analysis — crusher bearing temp trending high",         engine: "ai_analysis", skill: "maint_ai_analysis" },
  { time: "06:50", user: "Mine Manager",    action: "Reviewed weekly production analysis report",                 engine: "ai_analysis", skill: "ops_ai_analysis" },
  { time: "Yesterday", user: "HR Manager",  action: "Exit capture session completed — Kerani Kewangan departing",  engine: "claude",   skill: "hrm_exit" },
  { time: "Yesterday", user: "AI System",   action: "Flagged: hrm_succession.md overdue review — 5 months",        engine: null,       skill: "hrm_succession" },
];

const TAG_MAP = {
  ops: "tag-ops", hse: "tag-hse", hrm: "tag-hrm",
  fin: "tag-fin", proj: "tag-proj", maint: "tag-maint", env: "tag-env",
  ai: "tag-ai", qa: "tag-qa", log: "tag-log", eng: "tag-eng", com: "tag-com",
};

function computeMetrics(skillsData, successionData) {
  const fresh = skillsData.filter(s => s.status === "fresh").length;
  const stale = skillsData.filter(s => s.status === "stale").length;
  const urgent = skillsData.filter(s => s.status === "urgent").length;
  return {
    skillsFresh: fresh,
    overdue: stale + urgent,
    gaps: successionData.filter(s => s.risk === "critical").length,
    exits: 100,
    pm: 94,
    ptw: 7,
    aiQueries: 43,
    score: Math.round((fresh / skillsData.length) * 80 + 15),
    totalSkills: skillsData.length,
    stale, urgent, fresh,
  };
}

export default function Dashboard({ user, onNavigate }) {
  const { notifications, clearNotification } = useKROS();
  const [showDetail, setShowDetail] = useState(null);
  const metrics = computeMetrics(SKILLS_DATA, SUCCESSION_DATA);
  const overdueSkills = SKILLS_DATA.filter(s => s.status !== "fresh");
  const criticalGaps = SUCCESSION_DATA.filter(s => s.risk === "critical");

  const getKpiValue = (key) => {
    const map = {
      skillsFresh: { v: String(metrics.skillsFresh), sub: `of ${metrics.totalSkills} skills current`, ch: `+${metrics.skillsFresh - 17} this month` },
      overdue:     { v: String(metrics.overdue),     sub: "require immediate update",              ch: `${metrics.urgent} critical` },
      gaps:        { v: String(metrics.gaps),        sub: "critical roles uncovered",              ch: "Ops & Metallurgy" },
      exits:       { v: `${metrics.exits}%`,         sub: "completed on time",                     ch: "3 this quarter" },
      pm:          { v: `${metrics.pm}%`,            sub: "target ≥ 95%",                          ch: "↓ 1% this month" },
      ptw:         { v: String(metrics.ptw),          sub: "active permits today",                  ch: "2 expire today" },
      aiQueries:   { v: String(metrics.aiQueries),   sub: "staff interactions",                    ch: "↑ 12 vs yesterday" },
      score:       { v: String(metrics.score),        sub: "out of 100",                           ch: "↑ 4 this quarter" },
    };
    return map[key] || { v: "—", sub: "", ch: "" };
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Good morning, {user.givenName}</div>
          <div className="page-subtitle">{user.role} · {new Date().toLocaleDateString("en-MY", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("workflow")}>⚙ Workflows</button>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("mine-analysis")}>⛏ Analysis</button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate("skills")}>View All Skills</button>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="page-alerts">
          {notifications.map(n => (
            <div key={n.id} className={`alert alert-${n.type === "urgent" ? "error" : n.type === "warn" ? "warn" : "info"}`}>
              <span>{n.type === "urgent" ? "⚠" : n.type === "warn" ? "◉" : "◈"}</span>
              <span style={{ flex: 1 }}>{n.message}</span>
              {n.skill && (
                <span className="skill-ref" onClick={() => onNavigate("skills")} style={{ cursor: "pointer" }}>
                  {n.skill}.md
                </span>
              )}
              <button onClick={() => clearNotification(n.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 14, padding: "0 4px" }}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="kpi-grid">
        {KPI_DEFS.map(kpi => {
          const d = getKpiValue(kpi.key);
          return (
            <div key={kpi.key} className="kpi-card" onClick={() => setShowDetail(showDetail === kpi.key ? null : kpi.key)}>
              <div className="kpi-card-header">
                <span className="kpi-icon">{kpi.icon}</span>
                <span className={`kpi-trend ${kpi.type}`}>{d.ch.split(" ")[0]}</span>
              </div>
              <div className="kpi-value">{d.v}</div>
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-sub">{d.sub}</div>
              {showDetail === kpi.key && (
                <div className="kpi-detail">
                  <div className="progress-bar" style={{ marginTop: 8 }}>
                    <div className="progress-fill" style={{
                      width: kpi.key === "score" ? `${metrics.score}%` :
                             kpi.key === "skillsFresh" ? `${(metrics.skillsFresh / metrics.totalSkills) * 100}%` :
                             kpi.key === "pm" ? "94%" : "70%",
                      background: kpi.type === "positive" ? "var(--green)" : kpi.type === "negative" ? "var(--red)" : "var(--gold)"
                    }} />
                  </div>
                  <div className="kpi-detail-text">
                    {kpi.key === "skillsFresh" && `${metrics.skillsFresh} current, ${metrics.stale} stale, ${metrics.urgent} urgent`}
                    {kpi.key === "overdue" && `${metrics.urgent} urgent · ${metrics.stale} stale · Review now`}
                    {kpi.key === "score" && `${metrics.score}/100 · ${metrics.skillsFresh} skills on time · ${metrics.overdue} overdue`}
                    {kpi.key === "gaps" && `${criticalGaps.map(g => g.role).join(", ")}`}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="dashboard-panels">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Skills Needing Attention</div>
              <div className="card-subtitle">{overdueSkills.length} of {metrics.totalSkills} skills require update</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("skills")}>View all</button>
          </div>
          <div className="card-body">
            {overdueSkills.slice(0, 4).map(s => (
              <div key={s.id} className="list-row">
                <div className={`skill-status-dot ${s.status}`} />
                <div className="list-row-content">
                  <div className="list-row-title">{s.title}</div>
                  <div className="list-row-meta">{s.id}.md · Owner: {s.owner}</div>
                </div>
                <span className={`badge badge-${s.status === "urgent" ? "red" : "gold"}`}>{s.status}</span>
              </div>
            ))}
          </div>
          <div className="card-footer">
            <div className="progress-label">Overall Skills Health</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(metrics.skillsFresh / metrics.totalSkills) * 100}%`, background: "linear-gradient(90deg, var(--teal), var(--gold))" }} />
            </div>
            <div className="progress-stats">
              <span>{metrics.skillsFresh} current</span>
              <span>{Math.round((metrics.skillsFresh / metrics.totalSkills) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Succession Risk Monitor</div>
              <div className="card-subtitle">{criticalGaps.length} critical gaps — immediate action needed</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("succession")}>Full matrix</button>
          </div>
          <div className="card-body">
            {SUCCESSION_DATA.slice(0, 5).map((row, i) => (
              <div key={i} className="list-row">
                <div className="list-row-content">
                  <div className="list-row-title">{row.role}</div>
                  <div className="list-row-meta">{row.current}</div>
                </div>
                <div className="list-row-end">
                  <div className="list-row-sub" style={{ color: row.readyNow === "—" ? "var(--red)" : "var(--green-light)" }}>
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
      </div>

      <div className="card" style={{ marginTop: 20 }}>
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
                  <td className="cell-mono">{row.time}</td>
                  <td className="cell-bold">{row.user}</td>
                  <td>{row.action}</td>
                  <td>
                    {row.engine === "ai_analysis" ? (
                      <span className="badge badge-purple">◈ AI Analysis</span>
                    ) : row.engine ? (
                      <span className={`badge badge-${row.engine === "claude" ? "purple" : "teal"}`}>
                        {row.engine === "claude" ? "✦ Claude" : "◈ DeepSeek"}
                      </span>
                    ) : (
                      <span className="cell-muted">—</span>
                    )}
                  </td>
                  <td>
                    {row.skill && <span className="skill-ref" style={{ fontSize: 10 }}>{row.skill}.md</span>}
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
