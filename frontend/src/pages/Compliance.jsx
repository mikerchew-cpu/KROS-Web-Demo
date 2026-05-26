// ─────────────────────────────────────────────
// Compliance.jsx
// ─────────────────────────────────────────────
import { useState } from "react";

const COMPLIANCE_ITEMS = [
  { category: "Statutory",   item: "EPF Submission",       deadline: "2025-05-15", status: "due",      authority: "KWSP",   skill: "hrm_payroll",   amount: "RM 48,200" },
  { category: "Statutory",   item: "SOCSO Submission",     deadline: "2025-05-15", status: "due",      authority: "PERKESO",skill: "hrm_payroll",   amount: "RM 6,840" },
  { category: "Statutory",   item: "HRDF Levy",            deadline: "2025-05-15", status: "due",      authority: "HRD Corp",skill: "hrm_payroll",   amount: "RM 2,100" },
  { category: "Statutory",   item: "PCB / MTD Tax",        deadline: "2025-05-15", status: "due",      authority: "LHDN",   skill: "hrm_payroll",   amount: "RM 31,500" },
  { category: "Royalty",     item: "State Mineral Royalty",deadline: "2025-06-30", status: "upcoming", authority: "JMG Pahang", skill: "fin_royalty", amount: "RM 184,200" },
  { category: "Environment", item: "DOE Discharge Report", deadline: "2025-05-14", status: "overdue",  authority: "DOE",    skill: "env_report",    amount: "—" },
  { category: "Environment", item: "Scheduled Waste Inv.", deadline: "2025-07-15", status: "upcoming", authority: "DOE",    skill: "env_report",    amount: "—" },
  { category: "HSE",         item: "DOSH Annual Return",   deadline: "2025-06-01", status: "upcoming", authority: "DOSH",   skill: "hse_hazop",     amount: "—" },
  { category: "HSE",         item: "Fire Drill Record",    deadline: "2025-05-31", status: "upcoming", authority: "BOMBA",  skill: "hse_emergency", amount: "—" },
  { category: "Mining",      item: "Annual Mine Plan",     deadline: "2025-06-30", status: "upcoming", authority: "JMG",    skill: "proj_lifecycle",amount: "—" },
];

const STATUS_CONF = {
  overdue:  { label: "Overdue",  badge: "badge-red",    icon: "⚠" },
  due:      { label: "Due Soon", badge: "badge-gold",   icon: "◉" },
  upcoming: { label: "Upcoming", badge: "badge-teal",   icon: "◈" },
  done:     { label: "Done",     badge: "badge-green",  icon: "✓" },
};

export function Compliance() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? COMPLIANCE_ITEMS : COMPLIANCE_ITEMS.filter(i => i.status === filter || i.category.toLowerCase() === filter);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Compliance Calendar</div>
          <div className="page-subtitle">Malaysian regulatory obligations — EPF, SOCSO, DOE, JMG, DOSH</div>
        </div>
        <button className="btn btn-primary btn-sm">+ Add Item</button>
      </div>

      {/* Overdue alert */}
      {COMPLIANCE_ITEMS.some(i => i.status === "overdue") && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <span>⚠</span>
          <div>
            <strong>Overdue compliance items detected:</strong>{" "}
            {COMPLIANCE_ITEMS.filter(i => i.status === "overdue").map(i => i.item).join(", ")} — immediate action required.
            Ask Claude for step-by-step submission guidance.
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: "Overdue",    count: COMPLIANCE_ITEMS.filter(i=>i.status==="overdue").length,  color: "var(--red)"         },
          { label: "Due This Month", count: COMPLIANCE_ITEMS.filter(i=>i.status==="due").length,  color: "var(--gold)"        },
          { label: "Upcoming",   count: COMPLIANCE_ITEMS.filter(i=>i.status==="upcoming").length, color: "var(--teal-light)"  },
          { label: "Total Items",count: COMPLIANCE_ITEMS.length,                                   color: "var(--text-primary)"},
        ].map((s,i) => (
          <div key={i} className="stat-card" style={{ "--accent-color": s.color }}>
            <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.count}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all","overdue","due","upcoming","Statutory","Royalty","Environment","HSE","Mining"].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-secondary" : "btn-ghost"}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Item</th>
                <th>Deadline</th>
                <th>Authority</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Skill</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const sc = STATUS_CONF[item.status];
                return (
                  <tr key={i}>
                    <td><span className="tag tag-fin" style={{ fontSize: 9 }}>{item.category}</span></td>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{item.item}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{item.deadline}</td>
                    <td style={{ fontSize: 12 }}>{item.authority}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{item.amount}</td>
                    <td><span className={`badge ${sc.badge}`}>{sc.icon} {sc.label}</span></td>
                    <td><span className="skill-ref" style={{ fontSize: 10 }}>{item.skill}.md</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 10, padding: "3px 8px" }}>
                        ✦ Guide
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="alert alert-ai">
          <span>✦</span>
          <div style={{ fontSize: 12 }}>
            Ask Claude: <em>"Walk me through the EPF submission steps for this month"</em> and Claude will read{" "}
            <span className="skill-ref">hrm_payroll.md</span> and guide you through the i-Akaun Majikan process step by step.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Settings.jsx
// ─────────────────────────────────────────────
export function Settings({ user, onLogout }) {
  const [claudeKey, setClaudeKey]     = useState("sk-ant-••••••••••••••••");
  const [deepseekKey, setDeepseekKey] = useState("sk-••••••••••••••••");
  const [routing, setRouting]         = useState("auto");
  const [saved, setSaved]             = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Settings</div>
      </div>

      <div className="grid-2">
        {/* AI Engine Config */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">AI Engine Configuration</div>
              <div className="card-subtitle">Configure Claude and DeepSeek API keys</div>
            </div>
          </div>

          <div className="alert alert-warn" style={{ marginBottom: 16 }}>
            <span>⚠</span>
            <div style={{ fontSize: 12 }}>
              API keys are stored encrypted server-side. Never expose them in frontend code.
              Use environment variables in production.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">✦ Anthropic Claude API Key</label>
            <input type="password" className="form-input" value={claudeKey} onChange={e => setClaudeKey(e.target.value)} />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Model: claude-sonnet-4-6 · Used for: medium & high sensitivity queries</div>
          </div>

          <div className="form-group">
            <label className="form-label">◈ DeepSeek API Key</label>
            <input type="password" className="form-input" value={deepseekKey} onChange={e => setDeepseekKey(e.target.value)} />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Model: deepseek-chat · Used for: low sensitivity queries only · ⚠ No personal/financial data</div>
          </div>

          <div className="form-group">
            <label className="form-label">AI Routing Mode</label>
            <select className="form-select" value={routing} onChange={e => setRouting(e.target.value)}>
              <option value="auto">Auto (Smart routing by sensitivity)</option>
              <option value="claude">Force Claude for all queries</option>
              <option value="deepseek">Force DeepSeek for all queries</option>
            </select>
            {routing === "deepseek" && (
              <div className="alert alert-error" style={{ marginTop: 8, fontSize: 11 }}>
                ⚠ Warning: Forcing DeepSeek for all queries will send sensitive HR and financial data to DeepSeek servers (China-based). Not recommended for production.
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={handleSave} style={{ width: "100%", justifyContent: "center" }}>
            {saved ? "✓ Saved!" : "Save API Configuration"}
          </button>
        </div>

        {/* Data Sensitivity Rules */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Data Sensitivity Rules</div>
            <div className="card-subtitle">Which queries go to which AI engine</div>
          </div>

          {[
            { level: "🔴 High", color: "var(--red)", engine: "Claude only", examples: "HR records, payroll, EPF/SOCSO, royalty amounts, financial data, succession details", reason: "Personal and financial data — must not leave Malaysian/secure servers" },
            { level: "🟡 Medium", color: "var(--gold)", engine: "Claude only", examples: "PTW records, HAZOP data, environmental reports, procurement details", reason: "Regulatory data — prefer secure processing" },
            { level: "🟢 Low", color: "var(--green-light)", engine: "DeepSeek or Claude", examples: "SOP guidance, maintenance steps, shift handover, emergency response", reason: "General operational knowledge — safe for DeepSeek" },
          ].map((row, i) => (
            <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: row.color }}>{row.level} Sensitivity</span>
                <span className={`badge badge-${i === 0 ? "purple" : i === 1 ? "purple" : "teal"}`} style={{ fontSize: 10 }}>→ {row.engine}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}><strong>Examples:</strong> {row.examples}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{row.reason}</div>
            </div>
          ))}
        </div>

        {/* Account */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Account</div>
          </div>
          {[
            { label: "Name",   value: user.name },
            { label: "Role",   value: user.role },
            { label: "Email",  value: user.email },
            { label: "Access", value: user.access },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{label}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{value}</span>
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-danger btn-sm" onClick={onLogout} style={{ width: "100%", justifyContent: "center" }}>Sign Out</button>
          </div>
        </div>

        {/* Backend info */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Backend API</div>
            <div className="card-subtitle">Node.js + FastAPI server configuration</div>
          </div>
          {[
            { label: "Backend URL",        value: "https://api.kros.company.com.my" },
            { label: "Document Store",     value: "SharePoint / Confluence" },
            { label: "Database",           value: "PostgreSQL 15" },
            { label: "Claude Endpoint",    value: "https://api.anthropic.com/v1/messages" },
            { label: "DeepSeek Endpoint",  value: "https://api.deepseek.com/chat/completions" },
            { label: "Auth",               value: "JWT + bcrypt" },
            { label: "Version",            value: "KROS v2.0 — Claude Edition" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
              <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 10 }}>{label}</span>
              <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: 10 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Compliance;
