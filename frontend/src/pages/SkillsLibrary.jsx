import { useState } from "react";
import { useKROS } from "../context/KROSContext";

const MODULE_COLORS = {
  ops:   { accent: "var(--teal)",          tag: "tag-ops",  label: "Operations"    },
  hse:   { accent: "var(--red)",           tag: "tag-hse",  label: "Safety / HSE"  },
  env:   { accent: "var(--green-light)",   tag: "tag-env",  label: "Environment"   },
  hrm:   { accent: "#6BAED6",              tag: "tag-hrm",  label: "HRM"           },
  fin:   { accent: "var(--gold)",          tag: "tag-fin",  label: "Finance"       },
  proj:  { accent: "var(--purple-light)",  tag: "tag-proj", label: "Projects"      },
  maint: { accent: "var(--green-light)",   tag: "tag-maint",label: "Maintenance"   },
};

const STATUS_INFO = {
  fresh:  { label: "Current",  color: "var(--green-light)", bg: "badge-green" },
  stale:  { label: "Stale",    color: "var(--gold)",        bg: "badge-gold"  },
  urgent: { label: "Overdue",  color: "var(--red)",         bg: "badge-red"   },
};

const SENSITIVITY_INFO = {
  low:    { label: "Low",    color: "var(--green-light)", desc: "Can be processed by any AI engine" },
  medium: { label: "Medium", color: "var(--gold)",        desc: "Routed to Claude only" },
  high:   { label: "High",   color: "var(--red)",         desc: "Sensitive data — Claude only, encrypted" },
};

export default function SkillsLibrary() {
  const { skills } = useKROS();
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = skills.filter(s => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchModule = filterModule === "all" || s.module === filterModule;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchModule && matchStatus;
  });

  const modules = [...new Set(skills.map(s => s.module))];

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Skills Library</div>
          <div className="page-subtitle">20 living documents — version-controlled, role-owned, AI-searchable</div>
        </div>
        <button className="btn btn-primary btn-sm">+ New Skill</button>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Skills", value: skills.length, color: "var(--teal)" },
          { label: "Current",      value: skills.filter(s=>s.status==="fresh").length,  color: "var(--green-light)" },
          { label: "Stale",        value: skills.filter(s=>s.status==="stale").length,  color: "var(--gold)" },
          { label: "Overdue",      value: skills.filter(s=>s.status==="urgent").length, color: "var(--red)" },
        ].map((s,i) => (
          <div key={i} style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 16px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <span style={{ color: "var(--text-muted)", fontSize: 14 }}>🔍</span>
          <input
            placeholder="Search skills by name or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["all", ...modules].map(m => (
            <button
              key={m}
              className={`btn btn-sm ${filterModule === m ? "btn-secondary" : "btn-ghost"}`}
              onClick={() => setFilterModule(m)}
            >
              {m === "all" ? "All Modules" : MODULE_COLORS[m]?.label || m}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {["all","fresh","stale","urgent"].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${filterStatus === s ? "btn-secondary" : "btn-ghost"}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "All Status" : STATUS_INFO[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-panel layout if a skill is selected */}
      <div style={{ display: "flex", gap: 20 }}>
        {/* Skill grid */}
        <div style={{ flex: 1 }}>
          <div className="grid-auto">
            {filtered.map(skill => {
              const mc = MODULE_COLORS[skill.module] || {};
              const si = STATUS_INFO[skill.status];
              const sens = SENSITIVITY_INFO[skill.sensitivity];
              return (
                <div
                  key={skill.id}
                  className="skill-card"
                  style={{ "--accent": mc.accent, cursor: "pointer" }}
                  onClick={() => setSelected(selected?.id === skill.id ? null : skill)}
                >
                  <div className="skill-card-header">
                    <span className="skill-name">{skill.id}.md</span>
                    <span className={`badge ${si.bg}`} style={{ fontSize: 9 }}>{si.label}</span>
                  </div>

                  <div className="skill-title">{skill.title}</div>
                  <div className="skill-desc">{skill.description}</div>

                  <div className="skill-footer">
                    <span className={`tag ${mc.tag}`}>{mc.label}</span>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: sens.color, display: "inline-block" }} />
                      <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{sens.label}</span>
                    </div>
                  </div>

                  <div className="skill-owner" style={{ marginTop: 8 }}>
                    <span>◎</span> {skill.owner}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>◫</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No skills match your filter</div>
              <div style={{ fontSize: 12 }}>Try adjusting your search or filters</div>
            </div>
          )}
        </div>

        {/* Skill detail panel */}
        {selected && (
          <div style={{ width: 320, flexShrink: 0 }}>
            <div className="card" style={{ position: "sticky", top: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span className="skill-name">{selected.id}.md</span>
                <button className="btn btn-ghost btn-sm" style={{ padding: "3px 8px" }} onClick={() => setSelected(null)}>×</button>
              </div>

              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.3 }}>
                {selected.title}
              </div>

              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
                {selected.description}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {[
                  { label: "Module",        value: MODULE_COLORS[selected.module]?.label },
                  { label: "Owner",         value: selected.owner },
                  { label: "Last Updated",  value: selected.lastUpdated },
                  { label: "Status",        value: STATUS_INFO[selected.status]?.label, color: STATUS_INFO[selected.status]?.color },
                  { label: "AI Sensitivity",value: SENSITIVITY_INFO[selected.sensitivity]?.desc, color: SENSITIVITY_INFO[selected.sensitivity]?.color },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                    <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.5 }}>{label}</span>
                    <span style={{ color: color || "var(--text-secondary)", fontWeight: 500, textAlign: "right", maxWidth: 180 }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="btn btn-purple btn-sm" style={{ justifyContent: "center" }}>
                  ✦ Ask AI about this skill
                </button>
                <button className="btn btn-secondary btn-sm" style={{ justifyContent: "center" }}>
                  ◫ View Full Document
                </button>
                <button className="btn btn-ghost btn-sm" style={{ justifyContent: "center" }}>
                  ✎ Propose Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
