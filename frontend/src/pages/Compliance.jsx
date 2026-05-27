// ─────────────────────────────────────────────
// Compliance.jsx
// ─────────────────────────────────────────────
import { useState } from "react";
import { complianceAPI } from "../utils/api";

const DEFAULT_ITEMS = [
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

const CATEGORIES = ["Statutory", "Royalty", "Environment", "HSE", "Mining"];
const STATUS_CHOICES = ["upcoming", "due", "overdue", "done"];

const STATUS_CONF = {
  overdue:  { label: "Overdue",  badge: "badge-red",    icon: "⚠" },
  due:      { label: "Due Soon", badge: "badge-gold",   icon: "◉" },
  upcoming: { label: "Upcoming", badge: "badge-teal",   icon: "◈" },
  done:     { label: "Done",     badge: "badge-green",  icon: "✓" },
};

function Modal({ title, children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={onClose}>
      <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 12, width: "90%", maxWidth: 520, maxHeight: "85vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{title}</div>
          <button className="btn btn-ghost btn-sm" style={{ padding: "3px 10px" }} onClick={onClose}>×</button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Compliance() {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: "Statutory", item: "", deadline: "", authority: "", skill: "", amount: "", status: "upcoming" });
  const [submitting, setSubmitting] = useState(false);

  const filtered = filter === "all" ? items : items.filter(i => i.status === filter || i.category.toLowerCase() === filter);

  const handleAdd = async () => {
    if (!form.item.trim() || !form.deadline.trim()) return;
    setSubmitting(true);
    try {
      const result = await complianceAPI.create({ ...form, item: form.item.trim(), deadline: form.deadline.trim() });
      setItems(prev => [...prev, result]);
      setShowAdd(false);
      setForm({ category: "Statutory", item: "", deadline: "", authority: "", skill: "", amount: "", status: "upcoming" });
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Compliance Calendar</div>
          <div className="page-subtitle">Malaysian regulatory obligations — EPF, SOCSO, DOE, JMG, DOSH</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Item</button>
      </div>

      {items.some(i => i.status === "overdue") && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <span>⚠</span>
          <div>
            <strong>Overdue compliance items detected:</strong>{" "}
            {items.filter(i => i.status === "overdue").map(i => i.item).join(", ")} — immediate action required.
          </div>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: "Overdue",    count: items.filter(i=>i.status==="overdue").length,  color: "var(--red)"         },
          { label: "Due This Month", count: items.filter(i=>i.status==="due").length,  color: "var(--gold)"        },
          { label: "Upcoming",   count: items.filter(i=>i.status==="upcoming").length, color: "var(--teal-light)"  },
          { label: "Total Items",count: items.length,                                   color: "var(--text-primary)"},
        ].map((s,i) => (
          <div key={i} className="stat-card" style={{ "--accent-color": s.color }}>
            <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.count}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all","overdue","due","upcoming", ...CATEGORIES].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? "btn-secondary" : "btn-ghost"}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

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
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const sc = STATUS_CONF[item.status];
                return (
                  <tr key={item.id || i}>
                    <td><span className="tag tag-fin" style={{ fontSize: 9 }}>{item.category}</span></td>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{item.item}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{item.deadline}</td>
                    <td style={{ fontSize: 12 }}>{item.authority}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{item.amount}</td>
                    <td><span className={`badge ${sc.badge}`}>{sc.icon} {sc.label}</span></td>
                    <td><span className="skill-ref" style={{ fontSize: 10 }}>{item.skill}.md</span></td>
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
            Ask AI: <em>"Walk me through the EPF submission steps for this month"</em> — the AI will read{" "}
            <span className="skill-ref">hrm_payroll.md</span> and guide you step by step.
          </div>
        </div>
      </div>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Add Compliance Item">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4, letterSpacing: 0.5 }}>ITEM *</div>
              <input className="input" placeholder="e.g. EPF Submission" value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} style={{ width: "100%" }} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4, letterSpacing: 0.5 }}>CATEGORY</div>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: "100%" }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4, letterSpacing: 0.5 }}>STATUS</div>
                <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: "100%" }}>
                  {STATUS_CHOICES.map(s => <option key={s} value={s}>{STATUS_CONF[s]?.label || s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4, letterSpacing: 0.5 }}>DEADLINE *</div>
                <input className="input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={{ width: "100%" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4, letterSpacing: 0.5 }}>AUTHORITY</div>
                <input className="input" placeholder="e.g. KWSP" value={form.authority} onChange={e => setForm({ ...form, authority: e.target.value })} style={{ width: "100%" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4, letterSpacing: 0.5 }}>AMOUNT</div>
                <input className="input" placeholder="e.g. RM 10,000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={{ width: "100%" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4, letterSpacing: 0.5 }}>SKILL</div>
                <input className="input" placeholder="e.g. hrm_payroll" value={form.skill} onChange={e => setForm({ ...form, skill: e.target.value })} style={{ width: "100%" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!form.item.trim() || !form.deadline.trim() || submitting}>
                {submitting ? "Adding…" : "Add Item"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Settings.jsx
// ─────────────────────────────────────────────
export function Settings({ user, onLogout }) {
  const isAdmin = user?.access === "admin";
  const [claudeKey, setClaudeKey]     = useState("sk-ant-••••••••••••••••");
  const [deepseekKey, setDeepseekKey] = useState("sk-••••••••••••••••");
  const [geminiKey, setGeminiKey]     = useState("AIza••••••••••••••••••");
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
        {!isAdmin && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
            Read-only view — API settings managed by admin
          </div>
        )}
      </div>

      <div className="grid-2">
        {/* AI Engine Config */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">AI Engine Configuration</div>
              <div className="card-subtitle">{isAdmin ? "Configure AI engine API keys" : "AI engine API keys (admin-managed)"}</div>
            </div>
            {!isAdmin && <span className="badge badge-gold" style={{ fontSize: 10 }}>🔒 Admin only</span>}
          </div>

          <div className="form-group">
            <label className="form-label">✦ Anthropic Claude API Key</label>
            <input type="password" className="form-input" value={claudeKey} readOnly={!isAdmin} style={!isAdmin ? { opacity: 0.6, cursor: "not-allowed" } : {}} onChange={e => isAdmin && setClaudeKey(e.target.value)} />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Model: claude-sonnet-4-6</div>
          </div>

          <div className="form-group">
            <label className="form-label">◈ DeepSeek API Key</label>
            <input type="password" className="form-input" value={deepseekKey} readOnly={!isAdmin} style={!isAdmin ? { opacity: 0.6, cursor: "not-allowed" } : {}} onChange={e => isAdmin && setDeepseekKey(e.target.value)} />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Model: deepseek-chat</div>
          </div>

          <div className="form-group">
            <label className="form-label">◉ Google Gemini API Key</label>
            <input type="password" className="form-input" value={geminiKey} readOnly={!isAdmin} style={!isAdmin ? { opacity: 0.6, cursor: "not-allowed" } : {}} onChange={e => isAdmin && setGeminiKey(e.target.value)} />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Model: gemini-2.0-flash</div>
          </div>

          <div className="form-group">
            <label className="form-label">AI Routing Mode</label>
            <select className="form-select" value={routing} disabled={!isAdmin} style={!isAdmin ? { opacity: 0.6, cursor: "not-allowed" } : {}} onChange={e => isAdmin && setRouting(e.target.value)}>
              <option value="auto">Auto (default Claude)</option>
              <option value="claude">Force Claude for all queries</option>
              <option value="deepseek">Force DeepSeek for all queries</option>
              <option value="gemini">Force Gemini for all queries</option>
            </select>
            {routing === "deepseek" && (
              <div className="alert alert-error" style={{ marginTop: 8, fontSize: 11 }}>
                ⚠ Warning: Forcing DeepSeek for all queries will send sensitive HR and financial data to DeepSeek servers (China-based). Not recommended for production.
              </div>
            )}
          </div>

          {isAdmin ? (
            <button className="btn btn-primary" onClick={handleSave} style={{ width: "100%", justifyContent: "center" }}>
              {saved ? "✓ Saved!" : "Save API Configuration"}
            </button>
          ) : (
            <div className="alert alert-info" style={{ fontSize: 11 }}>
              🔒 Only administrators can modify API engine settings.
            </div>
          )}
        </div>

        {/* Data Sensitivity Rules */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Data Sensitivity Rules</div>
            <div className="card-subtitle">Which queries go to which AI engine</div>
          </div>

          {[
            { level: "🔴 High", color: "var(--red)", engine: "Gemini only", examples: "HR records, payroll, EPF/SOCSO, royalty amounts, financial data, succession details", reason: "Personal and financial data — must not leave Malaysian/secure servers" },
            { level: "🟡 Medium", color: "var(--gold)", engine: "Gemini only", examples: "PTW records, HAZOP data, environmental reports, procurement details", reason: "Regulatory data — prefer secure processing" },
            { level: "🟢 Low", color: "var(--green-light)", engine: "DeepSeek or Gemini", examples: "SOP guidance, maintenance steps, shift handover, emergency response", reason: "General operational knowledge — safe for DeepSeek" },
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
            { label: "Name",   value: `${user.givenName} ${user.surname}` },
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
            { label: "Gemini Endpoint",    value: "https://generativelanguage.googleapis.com/v1beta/models" },
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
