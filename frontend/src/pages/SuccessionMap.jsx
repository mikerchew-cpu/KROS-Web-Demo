import { useState } from "react";
import { useKROS } from "../context/KROSContext";

const RISK_CONFIG = {
  critical: { label: "Critical",  color: "var(--red)",         bg: "risk-critical", icon: "🔴", desc: "No identified successor — immediate action required" },
  "at-risk":{ label: "At Risk",   color: "var(--gold)",        bg: "risk-at-risk",  icon: "🟡", desc: "Successor exists but not ready for 24+ months" },
  managed:  { label: "Managed",   color: "var(--green-light)", bg: "risk-managed",  icon: "🟢", desc: "Ready Now deputy exists" },
};

export default function SuccessionMap() {
  const { succession } = useKROS();
  const [selected, setSelected] = useState(null);

  const critical = succession.filter(r => r.risk === "critical");
  const atRisk   = succession.filter(r => r.risk === "at-risk");
  const managed  = succession.filter(r => r.risk === "managed");

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Succession Map</div>
          <div className="page-subtitle">Role coverage matrix — zero single points of failure</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm">Export PDF</button>
          <button className="btn btn-primary btn-sm">+ Add Role</button>
        </div>
      </div>

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { ...RISK_CONFIG.critical, count: critical.length },
          { ...RISK_CONFIG["at-risk"], count: atRisk.length },
          { ...RISK_CONFIG.managed,  count: managed.length },
        ].map((r, i) => (
          <div key={i} style={{
            background: "var(--surface-1)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "12px 18px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>{r.icon}</span>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: r.color, lineHeight: 1 }}>{r.count}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{r.label}</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", maxWidth: 160, lineHeight: 1.4 }}>{r.desc}</div>
          </div>
        ))}
      </div>

      {/* Alert for critical gaps */}
      {critical.length > 0 && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <span>⚠</span>
          <div>
            <strong>Critical succession gaps detected:</strong>{" "}
            {critical.map(r => r.role).join(", ")} — no Ready Now deputy assigned.
            These roles are single points of failure. Immediate action required.
          </div>
        </div>
      )}

      {/* Matrix table */}
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <div className="succession-row header">
          <div>Role</div>
          <div>Risk</div>
          <div>Current Holder</div>
          <div>Ready Now</div>
          <div>12–24 Months</div>
          <div>Action</div>
        </div>

        {succession.map((row, i) => {
          const rc = RISK_CONFIG[row.risk];
          const isSelected = selected?.role === row.role;
          return (
            <div
              key={i}
              className="succession-row"
              style={{
                cursor: "pointer",
                background: isSelected ? "rgba(200,149,42,0.06)" : undefined,
              }}
              onClick={() => setSelected(isSelected ? null : row)}
            >
              <div style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{row.role}</span>
              </div>
              <div>
                <span className={`risk-pill ${rc.bg}`}>{rc.icon} {rc.label}</span>
              </div>
              <div>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, var(--teal), var(--navy-mid))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>
                  {row.current.split(" ").map(w => w[0]).join("").slice(0,2)}
                </div>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{row.current}</span>
              </div>
              <div>
                {row.readyNow === "—" ? (
                  <span style={{ color: "var(--red)", fontSize: 12, fontWeight: 600 }}>⚠ None</span>
                ) : (
                  <span style={{ color: "var(--green-light)", fontSize: 12 }}>{row.readyNow}</span>
                )}
              </div>
              <div>
                <span style={{ fontSize: 12, color: row.r12 === "—" ? "var(--text-muted)" : "var(--text-secondary)" }}>{row.r12}</span>
              </div>
              <div>
                {row.risk === "critical" ? (
                  <button className="btn btn-danger btn-sm" style={{ fontSize: 10 }}>Urgent</button>
                ) : row.risk === "at-risk" ? (
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 10 }}>Review</button>
                ) : (
                  <span className="badge badge-green" style={{ fontSize: 9 }}>✓ OK</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel for selected role */}
      {selected && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{selected.role} — Succession Detail</div>
              <div className="card-subtitle">Deputy assignments and development plan</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>×</button>
          </div>

          <div className="grid-3">
            {[
              { label: "Ready Now",    name: selected.readyNow, timeline: "Can act today",     color: selected.readyNow === "—" ? "var(--red)" : "var(--green-light)" },
              { label: "12–24 Months", name: selected.r12,      timeline: "In development",    color: selected.r12 === "—" ? "var(--text-muted)" : "var(--gold)" },
              { label: "24–36 Months", name: selected.r24,      timeline: "Early pipeline",    color: selected.r24 === "—" ? "var(--text-muted)" : "var(--teal-light)" },
            ].map(({ label, name, timeline, color }) => (
              <div key={label} style={{ background: "var(--surface-2)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 8, letterSpacing: 1 }}>{label.toUpperCase()}</div>
                {name === "—" ? (
                  <div style={{ color: "var(--red)", fontWeight: 600, fontSize: 13 }}>⚠ Not Identified</div>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 14, color, marginBottom: 2 }}>{name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{timeline}</div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button className="btn btn-purple btn-sm">✦ Ask Claude: Who can cover this role?</button>
            <button className="btn btn-secondary btn-sm">View IDP</button>
            <button className="btn btn-ghost btn-sm">Assign Deputy</button>
          </div>
        </div>
      )}
    </div>
  );
}
