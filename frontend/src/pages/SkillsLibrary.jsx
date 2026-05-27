import { useState, useRef } from "react";
import { useKROS } from "../context/KROSContext";
import { skillsAPI } from "../utils/api";

const MODULE_COLORS = {
  ops:   { accent: "var(--teal)",          tag: "tag-ops",  label: "Operations"      },
  hse:   { accent: "var(--red)",           tag: "tag-hse",  label: "Safety / HSE"    },
  env:   { accent: "var(--teal-light)",    tag: "tag-env",  label: "Environment"     },
  hrm:   { accent: "#6BAED6",              tag: "tag-hrm",  label: "HRM"             },
  fin:   { accent: "var(--gold)",          tag: "tag-fin",  label: "Finance"         },
  proj:  { accent: "var(--purple-light)",  tag: "tag-proj", label: "Projects"        },
  maint: { accent: "var(--green-light)",   tag: "tag-maint",label: "Maintenance"     },
  ai:    { accent: "var(--purple)",        tag: "tag-ai",   label: "AI Analysis"     },
  qa:    { accent: "var(--green)",         tag: "tag-qa",   label: "Quality"         },
  log:   { accent: "var(--gold)",          tag: "tag-log",  label: "Logistics"       },
  eng:   { accent: "var(--gold-light)",    tag: "tag-eng",  label: "Energy"          },
  com:   { accent: "var(--navy-mid)",      tag: "tag-com",  label: "Community"       },
};

const STATUS_INFO = {
  fresh:  { label: "Current",  color: "var(--green-light)", bg: "badge-green" },
  stale:  { label: "Stale",    color: "var(--gold)",        bg: "badge-gold"  },
  urgent: { label: "Overdue",  color: "var(--red)",         bg: "badge-red"   },
};

const SENSITIVITY_INFO = {
  low:    { label: "Low",    color: "var(--green-light)", desc: "Can be processed by any AI engine" },
  medium: { label: "Medium", color: "var(--gold)",        desc: "Routed to Gemini only" },
  high:   { label: "High",   color: "var(--red)",         desc: "Sensitive data — Gemini only, encrypted" },
};

function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", justifyContent: "center", alignItems: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface-1)", border: "1px solid var(--border)",
          borderRadius: 12, width: "90%", maxWidth: 720, maxHeight: "85vh",
          display: "flex", flexDirection: "column",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{title}</div>
          <button className="btn btn-ghost btn-sm" style={{ padding: "3px 10px" }} onClick={onClose}>×</button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px", lineHeight: 1.7, fontSize: 13, color: "var(--text-secondary)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function SkillsLibrary({ onNavigate }) {
  const { skills, addSkill, updateSkill, removeSkill } = useKROS();
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null);

  const [docModal, setDocModal] = useState(null);
  const [docLoading, setDocLoading] = useState(false);

  const [proposeModal, setProposeModal] = useState(null);
  const [proposeContent, setProposeContent] = useState("");
  const [proposeReason, setProposeReason] = useState("");
  const [proposeSubmitting, setProposeSubmitting] = useState(false);
  const [proposeResult, setProposeResult] = useState(null);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const filtered = skills.filter(s => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchModule = filterModule === "all" || s.module === filterModule;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchModule && matchStatus;
  });

  const modules = [...new Set(skills.map(s => s.module))];

  const handleAskAI = (skill) => {
    sessionStorage.setItem("kros_ask_skill", JSON.stringify({ id: skill.id, title: skill.title }));
    onNavigate("ask");
  };

  const handleViewDoc = async (skill) => {
    setDocLoading(true);
    setDocModal(skill);
    try {
      const data = await skillsAPI.get(skill.id);
      setDocModal({ ...skill, fullContent: data.content });
    } catch {
      setDocModal({ ...skill, fullContent: `# ${skill.title}\n\n${skill.description}\n\n_(Full document content is not yet available on the server. This excerpt is from the skills library.)_` });
    }
    setDocLoading(false);
  };

  const handleProposeOpen = async (skill) => {
    try {
      const data = await skillsAPI.get(skill.id);
      setProposeContent(data.content);
    } catch {
      setProposeContent(`# ${skill.title}\n\n${skill.description}`);
    }
    setProposeReason("");
    setProposeResult(null);
    setProposeModal(skill);
  };

  const handleEditOpen = (skill) => {
    setEditForm({ id: skill.id, title: skill.title, description: skill.description, module: skill.module, owner: skill.owner, sensitivity: skill.sensitivity, status: skill.status });
    setEditError(null);
    setEditModal(skill);
  };

  const handleEditSubmit = async () => {
    if (!editForm.title.trim()) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      await skillsAPI.update(editModal.id, editForm);
      updateSkill(editModal.id, { title: editForm.title, description: editForm.description, module: editForm.module, owner: editForm.owner, sensitivity: editForm.sensitivity, status: editForm.status, lastUpdated: new Date().toISOString().slice(0, 10) });
      setEditModal(null);
    } catch (err) {
      setEditError(err.message);
    }
    setEditSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteSubmitting(true);
    try {
      await skillsAPI.remove(deleteConfirm.id);
      removeSkill(deleteConfirm.id);
      setDeleteConfirm(null);
      setSelected(null);
    } catch (err) {
      setDeleteConfirm(null);
      setCreateError(err.message);
    }
    setDeleteSubmitting(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const result = await skillsAPI.upload(file);
      const now = new Date().toISOString().slice(0, 10);
      addSkill({ id: result.id, title: result.title || result.id, description: `Uploaded from ${result.filename}`, module: "ops", owner: "", sensitivity: "low", status: "fresh", lastUpdated: now });
    } catch (err) {
      setUploadError(err.message);
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleQuickCreate = async () => {
    if (creating) return;
    const count = skills.filter(s => s.id.startsWith("new_skill_")).length + 1;
    const id = `new_skill_${count}`;
    const skill = { id, title: `New Skill ${count}`, description: "Newly created skill", module: "ops", owner: "", sensitivity: "low", status: "fresh" };
    setCreating(true);
    setCreateError(null);
    try {
      await skillsAPI.create(skill);
      addSkill({ ...skill, lastUpdated: new Date().toISOString().slice(0, 10) });
    } catch (err) {
      setCreateError(err.message);
    }
    setCreating(false);
  };

  const handleProposeSubmit = async () => {
    if (!proposeContent.trim() || !proposeReason.trim()) return;
    setProposeSubmitting(true);
    try {
      const result = await skillsAPI.proposeUpdate(proposeModal.id, proposeContent, proposeReason);
      setProposeResult({ success: true, id: result.id });
    } catch (err) {
      setProposeResult({ success: false, error: err.message });
    }
    setProposeSubmitting(false);
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Skills Library</div>
          <div className="page-subtitle">20 living documents — version-controlled, role-owned, AI-searchable</div>
        </div>
        <div style={{ display: "flex", gap: 0, position: "relative" }}>
          <button className="btn btn-primary btn-sm" style={{ borderRadius: "6px 0 0 6px" }} onClick={handleQuickCreate} disabled={creating}>{creating ? "Creating…" : "+ New Skill"}</button>
          <button className="btn btn-primary btn-sm" style={{ borderRadius: "0 6px 6px 0", borderLeft: "1px solid rgba(255,255,255,0.2)", padding: "6px 8px" }} onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Upload .md file">▼</button>
          <input ref={fileInputRef} type="file" accept=".md" style={{ display: "none" }} onChange={handleUpload} />
        </div>
      </div>
      {uploadError && (
        <div style={{ color: "var(--red)", fontSize: 12, padding: "6px 12px", background: "rgba(255,0,0,0.08)", borderRadius: 6, marginBottom: 12 }}>Upload failed: {uploadError}</div>
      )}

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
                <button className="btn btn-purple btn-sm" style={{ justifyContent: "center" }} onClick={() => handleAskAI(selected)}>
                  ✦ Ask AI about this skill
                </button>
                <button className="btn btn-secondary btn-sm" style={{ justifyContent: "center" }} onClick={() => handleViewDoc(selected)}>
                  ◫ View Full Document
                </button>
                <button className="btn btn-ghost btn-sm" style={{ justifyContent: "center" }} onClick={() => handleProposeOpen(selected)}>
                  ✎ Propose Update
                </button>
                <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                <button className="btn btn-secondary btn-sm" style={{ justifyContent: "center" }} onClick={() => handleEditOpen(selected)}>
                  ✎ Edit Card
                </button>
                <button className="btn btn-sm" style={{ justifyContent: "center", background: "rgba(255,68,68,0.1)", color: "var(--red)", border: "1px solid rgba(255,68,68,0.25)" }} onClick={() => setDeleteConfirm(selected)}>
                  ✕ Delete Skill
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Document Modal */}
      {docModal && (
        <Modal onClose={() => setDocModal(null)} title={`${docModal.id}.md — ${docModal.title}`}>
          {docLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              <div className="loading-dots" style={{ marginBottom: 12 }}><span/><span/><span/></div>
              Loading document…
            </div>
          ) : (
            <div style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6, color: "var(--text-primary)" }}>
              {docModal.fullContent}
            </div>
          )}
        </Modal>
      )}

      {/* Propose Update Modal */}
      {proposeModal && (
        <Modal onClose={() => setProposeModal(null)} title={`Propose Update — ${proposeModal.id}.md`}>
          {proposeResult ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              {proposeResult.success ? (
                <>
                  <div style={{ fontSize: 32, marginBottom: 12, color: "var(--green-light)" }}>✓</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Proposal Submitted</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                    Your update proposal has been recorded (ID: {proposeResult.id}). A skill owner will review it.
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setProposeModal(null)}>Close</button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 12, color: "var(--red)" }}>✗</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Submission Failed</div>
                  <div style={{ fontSize: 13, color: "var(--red)", marginBottom: 16 }}>{proposeResult.error}</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setProposeResult(null)}>Try Again</button>
                </>
              )}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6, letterSpacing: 0.5 }}>PROPOSED CONTENT</div>
                <textarea
                  style={{
                    width: "100%", minHeight: 200, padding: 10, borderRadius: 8,
                    background: "var(--surface-0)", border: "1px solid var(--border)",
                    color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: 12,
                    resize: "vertical", lineHeight: 1.5,
                  }}
                  value={proposeContent}
                  onChange={e => setProposeContent(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6, letterSpacing: 0.5 }}>REASON FOR CHANGE</div>
                <textarea
                  style={{
                    width: "100%", minHeight: 60, padding: 10, borderRadius: 8,
                    background: "var(--surface-0)", border: "1px solid var(--border)",
                    color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: 12,
                    resize: "vertical", lineHeight: 1.5,
                  }}
                  placeholder="Explain why this change is needed…"
                  value={proposeReason}
                  onChange={e => setProposeReason(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setProposeModal(null)}>Cancel</button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleProposeSubmit}
                  disabled={!proposeContent.trim() || !proposeReason.trim() || proposeSubmitting}
                >
                  {proposeSubmitting ? "Submitting…" : "Submit Proposal"}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {createError && (
        <div style={{ color: "var(--red)", fontSize: 12, padding: "6px 12px", background: "rgba(255,0,0,0.08)", borderRadius: 6, marginBottom: 12 }}>Failed to create skill: {createError}</div>
      )}

      {/* Edit Card Modal */}
      {editModal && (
        <Modal onClose={() => setEditModal(null)} title={`Edit Card — ${editModal.id}.md`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4, letterSpacing: 0.5 }}>TITLE</div>
              <input className="input" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} style={{ width: "100%" }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4, letterSpacing: 0.5 }}>DESCRIPTION</div>
              <textarea className="input" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={{ width: "100%", minHeight: 60, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4, letterSpacing: 0.5 }}>MODULE</div>
                <select className="input" value={editForm.module} onChange={e => setEditForm({ ...editForm, module: e.target.value })} style={{ width: "100%" }}>
                  {Object.entries(MODULE_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4, letterSpacing: 0.5 }}>SENSITIVITY</div>
                <select className="input" value={editForm.sensitivity} onChange={e => setEditForm({ ...editForm, sensitivity: e.target.value })} style={{ width: "100%" }}>
                  {Object.entries(SENSITIVITY_INFO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4, letterSpacing: 0.5 }}>STATUS</div>
                <select className="input" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} style={{ width: "100%" }}>
                  {Object.entries(STATUS_INFO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 4, letterSpacing: 0.5 }}>OWNER</div>
              <input className="input" value={editForm.owner} onChange={e => setEditForm({ ...editForm, owner: e.target.value })} style={{ width: "100%" }} />
            </div>
            {editError && <div style={{ color: "var(--red)", fontSize: 12, padding: "6px 10px", background: "rgba(255,0,0,0.08)", borderRadius: 6 }}>{editError}</div>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleEditSubmit} disabled={!editForm.title.trim() || editSubmitting}>
                {editSubmitting ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)} title="Delete Skill">
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✕</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Delete <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>{deleteConfirm.id}.md</code>?</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>This will permanently remove the skill file. This action cannot be undone.</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-sm" style={{ background: "rgba(255,68,68,0.15)", color: "var(--red)", border: "1px solid rgba(255,68,68,0.3)" }} onClick={handleDelete} disabled={deleteSubmitting}>
                {deleteSubmitting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
