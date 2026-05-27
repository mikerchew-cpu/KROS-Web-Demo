import { useState, useRef, useMemo, useCallback } from "react";

const DEFAULT_MINERALS = [
  { id: "silica", name: "Silica", symbol: "SiO₂", unit: "%" },
  { id: "iron-ore", name: "Iron Ore", symbol: "Fe", unit: "%" },
  { id: "gold", name: "Gold", symbol: "Au", unit: "g/t" },
  { id: "bauxite", name: "Bauxite", symbol: "Al₂O₃", unit: "%" },
  { id: "aggregate", name: "Aggregate", symbol: "AGG", unit: "t" },
];

const DEFAULT_MINES = [
  { id: "kros-hill", name: "Kros Hill", location: "Pahang, Malaysia", minerals: ["iron-ore", "gold"], status: "Active", licenseExpiry: "2027-06-30", lastInspection: "2026-04-15" },
  { id: "bukit-besi", name: "Bukit Besi", location: "Terengganu, Malaysia", minerals: ["iron-ore", "bauxite"], status: "Active", licenseExpiry: "2026-08-15", lastInspection: "2026-03-20" },
  { id: "sungai-lembing", name: "Sungai Lembing", location: "Pahang, Malaysia", minerals: ["gold", "aggregate"], status: "Active", licenseExpiry: "2025-12-31", lastInspection: "2025-10-10" },
];

const DEFAULT_LOCATIONS = {
  "kros-hill": ["West Pit", "East Pit", "South Pit", "Underground L1"],
  "bukit-besi": ["North Pit", "Central Pit", "Stockpile"],
  "sungai-lembing": ["Main Zone", "West Extension", "Deep Zone"],
};

const DEFAULT_SHIFTS = {
  "kros-hill": [
    { shift: "Morning", tonnes: 6200, grade: 58.1, ore: 4900, waste: 1300, downtime: 45, notes: "Crusher jam cleared 08:30" },
    { shift: "Afternoon", tonnes: 5800, grade: 57.5, ore: 4400, waste: 1400, downtime: 70, notes: "Conveyor belt splice repair" },
    { shift: "Night", tonnes: 5500, grade: 57.9, ore: 4200, waste: 1300, downtime: 30, notes: "Routine maintenance window" },
  ],
  "bukit-besi": [
    { shift: "Morning", tonnes: 4100, grade: 56.8, ore: 3200, waste: 900, downtime: 25, notes: "Smooth production" },
    { shift: "Afternoon", tonnes: 3900, grade: 57.1, ore: 3000, waste: 900, downtime: 55, notes: "Excavator #2 fault" },
    { shift: "Night", tonnes: 3700, grade: 56.5, ore: 2800, waste: 900, downtime: 15, notes: "Planned lube stop" },
  ],
  "sungai-lembing": [
    { shift: "Morning", tonnes: 2900, grade: 3.9, ore: 2300, waste: 600, downtime: 35, notes: "Normal operations" },
    { shift: "Afternoon", tonnes: 2700, grade: 3.7, ore: 2100, waste: 600, downtime: 20, notes: "Shift change delay" },
    { shift: "Night", tonnes: 2500, grade: 3.8, ore: 2000, waste: 500, downtime: 50, notes: "Ventilation maintenance" },
  ],
};

const MINE_STATUSES = [
  { id: "Active", label: "Active", icon: "🟢" },
  { id: "Inactive", label: "Inactive", icon: "🔴" },
  { id: "Under Development", label: "Under Development", icon: "🟡" },
  { id: "Suspended", label: "Suspended", icon: "🔶" },
];

const MONTHS = [
  { key: "2026-05", label: "May 2026" }, { key: "2026-04", label: "Apr 2026" },
  { key: "2026-03", label: "Mar 2026" }, { key: "2026-02", label: "Feb 2026" },
  { key: "2026-01", label: "Jan 2026" },
];

const BASE_GRADE_MAP = { "iron-ore": 58.2, gold: 3.8, bauxite: 48.5, aggregate: 100, silica: 99.5 };

function generateMonthlyData(mine, mineral, mines) {
  const found = mines.find(m => m.id === mine);
  const baseTonnes = found ? Math.round(80000 + Math.random() * 120000) : 100000;
  const bg = BASE_GRADE_MAP[mineral] || 50;
  const br = 85 + Math.round(Math.random() * 12);
  return MONTHS.map((m, mi) => {
    const tonnes = Math.round(baseTonnes + mi * 2000 + (Math.random() - 0.5) * 15000);
    const grade = bg + (Math.random() - 0.5) * 1.5;
    const recovery = br + (Math.random() - 0.5) * 3;
    const costPerTonne = 32.5 + (Math.random() - 0.5) * 5 + (mi < 2 ? 2 : 0);
    const uptime = 88 + Math.round((Math.random() - 0.2) * 10);
    const totalHrs = 720;
    const downtimeHrs = Math.round(totalHrs * (100 - uptime) / 100);
    const oreTonnes = Math.round(tonnes * (0.75 + Math.random() * 0.15));
    return { month: m.key, monthLabel: m.label, tonnes, oreTonnes, wasteTonnes: tonnes - oreTonnes, grade: +grade.toFixed(1), recovery: +recovery.toFixed(1), costPerTonne: +costPerTonne.toFixed(2), uptime, downtimeHrs, overTimeHrs: Math.round(80 + (Math.random() - 0.5) * 60), manHours: Math.round(5200 + (Math.random() - 0.5) * 800), totalHrs };
  });
}

const LICENSE_TYPES = [
  { id: "mining-license", label: "Mining License / Lease" },
  { id: "environmental-permit", label: "Environmental Permit (DOE)" },
  { id: "explosives-license", label: "Explosives License" },
  { id: "water-abstraction", label: "Water Abstraction Permit" },
  { id: "occupational-safety", label: "Occupational Safety Certificate (DOSH)" },
  { id: "business-registration", label: "Business Registration (SSM)" },
];

const SAMPLE_MINE_DOCS = [
  { name: "mining_lease_2024.pdf", type: "mining-license", size: "2.4 MB", date: "2024-01-15", status: "active", aiStatus: "analysed" },
  { name: "doe_environmental_permit.pdf", type: "environmental-permit", size: "1.8 MB", date: "2024-03-01", status: "active", aiStatus: "analysed" },
  { name: "site_map_overview.pdf", type: "map", size: "4.2 MB", date: "2025-06-10", status: "active", aiStatus: "analysed" },
  { name: "q1_2026_production_report.pdf", type: "report", size: "3.1 MB", date: "2026-04-05", status: "active", aiStatus: "analysed" },
];

const SAMPLE_UPLOADS = [
  { name: "daily_production_may27.xlsx", size: "1.2 MB", date: "2026-05-27", status: "analysed", mine: "kros-hill", mineral: "iron-ore" },
  { name: "crusher_throughput_week21.csv", size: "0.8 MB", date: "2026-05-26", status: "processed", mine: "kros-hill", mineral: "iron-ore" },
  { name: "grade_control_lab_results_27may.pdf", size: "2.1 MB", date: "2026-05-27", status: "pending", mine: "bukit-besi", mineral: "gold" },
  { name: "sg_lembing_silica_quality_q2.csv", size: "1.1 MB", date: "2026-05-20", status: "analysed", mine: "sungai-lembing", mineral: "silica" },
];

function genId() { return "mine-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

export default function ProductionAnalysis() {
  const [mines, setMines] = useState(DEFAULT_MINES);
  const [minerals, setMinerals] = useState(DEFAULT_MINERALS);
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  const [shifts, setShifts] = useState(DEFAULT_SHIFTS);

  const [selectedMine, setSelectedMine] = useState("kros-hill");
  const [selectedMineral, setSelectedMineral] = useState("silica");
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareMine, setCompareMine] = useState("bukit-besi");
  const [uploads, setUploads] = useState(SAMPLE_UPLOADS);
  const [mineDocs, setMineDocs] = useState(SAMPLE_MINE_DOCS);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddMine, setShowAddMine] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", location: "", minerals: [], status: "Active" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showMineInfo, setShowMineInfo] = useState(false);
  const [showAddMineral, setShowAddMineral] = useState(false);
  const [mineralForm, setMineralForm] = useState({ name: "", symbol: "", unit: "" });
  const [editMine, setEditMine] = useState(null);
  const fileRef = useRef(null);
  const docFileRef = useRef(null);

  const mine = mines.find(m => m.id === selectedMine);
  const mineLocations = locations[selectedMine] || [];
  const allLocations = selectedLocations.length === 0 ? mineLocations : selectedLocations;
  const mineMinerals = minerals.filter(m => mine?.minerals?.includes(m.id));
  const isCustom = selectedMine.startsWith("mine-");

  const monthlyData = useMemo(() => generateMonthlyData(selectedMine, selectedMineral, mines), [selectedMine, selectedMineral, mines]);
  const compareData = useMemo(() => compareMode ? generateMonthlyData(compareMine, selectedMineral, mines) : null, [compareMode, compareMine, selectedMineral, mines]);

  const currentMonth = monthlyData[0];
  const prevMonth = monthlyData[1];
  const pctChange = (a, b) => b ? (((a - b) / b) * 100).toFixed(1) : "—";
  const mineShifts = shifts[selectedMine] || [
    { shift: "Morning", tonnes: 5000, grade: 50, ore: 3800, waste: 1200, downtime: 30, notes: "Normal ops" },
    { shift: "Afternoon", tonnes: 4800, grade: 50, ore: 3600, waste: 1200, downtime: 40, notes: "Standard shift" },
    { shift: "Night", tonnes: 4500, grade: 50, ore: 3400, waste: 1100, downtime: 20, notes: "Routine" },
  ];
  const expiryDays = mine?.licenseExpiry ? daysUntil(mine.licenseExpiry) : null;
  const hasExpiryAlert = expiryDays !== null && expiryDays <= 180;

  const handleUpload = (files) => {
    if (!files?.length) return;
    const f = files[0];
    setUploads(prev => [{ name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`, date: new Date().toISOString().slice(0, 10), status: "pending", mine: selectedMine, mineral: selectedMineral }, ...prev]);
  };

  const handleDocUpload = (files) => {
    if (!files?.length) return;
    const f = files[0];
    setMineDocs(prev => [{ name: f.name, type: "report", size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`, date: new Date().toISOString().slice(0, 10), status: "active", aiStatus: "pending" }, ...prev]);
  };

  const toggleLocation = (loc) => setSelectedLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]);

  const addMine = useCallback(() => {
    if (!addForm.name.trim() || !addForm.location.trim()) return;
    const id = genId();
    const newMine = { id, name: addForm.name.trim(), location: addForm.location.trim(), minerals: addForm.minerals.length > 0 ? addForm.minerals : ["silica"], status: addForm.status || "Active", licenseExpiry: "", lastInspection: "" };
    setMines(prev => [...prev, newMine]);
    setLocations(prev => ({ ...prev, [id]: ["Pit A", "Pit B", "Stockpile"] }));
    setShifts(prev => ({ ...prev, [id]: [
      { shift: "Morning", tonnes: 5000, grade: 50, ore: 3800, waste: 1200, downtime: 30, notes: `Start — ${addForm.name}` },
      { shift: "Afternoon", tonnes: 4800, grade: 50, ore: 3600, waste: 1200, downtime: 40, notes: "Standard ops" },
      { shift: "Night", tonnes: 4500, grade: 50, ore: 3400, waste: 1100, downtime: 20, notes: "Routine" },
    ] }));
    setSelectedMine(id); setSelectedMineral(addForm.minerals[0] || "silica"); setSelectedLocations([]);
    setAddForm({ name: "", location: "", minerals: [], status: "Active" }); setShowAddMine(false);
  }, [addForm]);

  const saveMineInfo = useCallback(() => {
    if (!editMine) return;
    setMines(prev => prev.map(m => m.id === editMine.id ? { ...m, ...editMine } : m));
    setEditMine(null);
    setShowMineInfo(false);
  }, [editMine]);

  const deleteMine = useCallback((id) => {
    setMines(prev => prev.filter(m => m.id !== id));
    const { [id]: _, ...locRest } = locations; setLocations(locRest);
    const { [id]: _s, ...shiftRest } = shifts; setShifts(shiftRest);
    if (selectedMine === id) setSelectedMine(mines[0]?.id || "kros-hill");
    setDeleteConfirm(null);
  }, [selectedMine, mines, locations, shifts]);

  const addCustomMineral = () => {
    if (!mineralForm.name.trim()) return;
    const id = "min-" + Date.now().toString(36);
    setMinerals(prev => [...prev, { id, name: mineralForm.name.trim(), symbol: mineralForm.symbol.trim() || "—", unit: mineralForm.unit.trim() || "%" }]);
    setMineralForm({ name: "", symbol: "", unit: "" }); setShowAddMineral(false);
  };

  const toggleMineralSel = (mid) => setAddForm(prev => ({
    ...prev, minerals: prev.minerals.includes(mid) ? prev.minerals.filter(m => m !== mid) : [...prev, mid],
  }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Mine Production Analysis</div>
          <div className="page-subtitle">Multi-mine, multi-mineral production tracking with compliance alerts &amp; AI analysis</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowAddMineral(true)}>◈ Add Mineral</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddMine(true)}>+ Add Mine</button>
        </div>
      </div>

      {hasExpiryAlert && (
        <div className="alert alert-warn" style={{ marginBottom: 16 }}>
          <span>⚠</span>
          <span><strong>License Expiry Alert:</strong> {mine?.name} mining license {mine?.licenseExpiry ? `expires ${fmtDate(mine.licenseExpiry)} (${expiryDays} days)` : "has no expiry date set"}. <button className="btn btn-ghost btn-sm" onClick={() => setShowMineInfo(true)} style={{ fontSize: 11 }}>Update →</button></span>
        </div>
      )}

      {/* Add Mine Modal */}
      {showAddMine && (
        <div className="modal-overlay" onClick={() => setShowAddMine(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">Add New Mine</div><button className="btn btn-ghost btn-sm" onClick={() => setShowAddMine(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Mine Name</label><input className="form-input" value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Gunung Rapat" /></div>
              <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={addForm.location} onChange={e => setAddForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Perak, Malaysia" /></div>
              <div className="form-group"><label className="form-label">Status</label>
                <select className="form-select" value={addForm.status} onChange={e => setAddForm(p => ({ ...p, status: e.target.value }))}>
                  {MINE_STATUSES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Minerals</label>
                <div className="prod-location-chips">
                  {minerals.map(m => (
                    <span key={m.id} className={`prod-chip ${addForm.minerals.includes(m.id) ? "active" : ""}`} onClick={() => toggleMineralSel(m.id)}>{m.name} ({m.symbol})</span>
                  ))}
                </div>
                <div className="modal-hint">Select minerals produced at this mine</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAddMine(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addMine} disabled={!addForm.name.trim()}>+ Add Mine</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Mineral Modal */}
      {showAddMineral && (
        <div className="modal-overlay" onClick={() => setShowAddMineral(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="modal-header"><div className="modal-title">Add Custom Mineral</div><button className="btn btn-ghost btn-sm" onClick={() => setShowAddMineral(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Mineral Name</label><input className="form-input" value={mineralForm.name} onChange={e => setMineralForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Silica" /></div>
              <div className="form-group"><label className="form-label">Chemical Symbol</label><input className="form-input" value={mineralForm.symbol} onChange={e => setMineralForm(p => ({ ...p, symbol: e.target.value }))} placeholder="e.g. SiO₂" /></div>
              <div className="form-group"><label className="form-label">Grade Unit</label><input className="form-input" value={mineralForm.unit} onChange={e => setMineralForm(p => ({ ...p, unit: e.target.value }))} placeholder="e.g. %, g/t" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAddMineral(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addCustomMineral} disabled={!mineralForm.name.trim()}>+ Add Mineral</button>
            </div>
          </div>
        </div>
      )}

      {/* Mine Info Modal */}
      {showMineInfo && (
        <div className="modal-overlay" onClick={() => { if (!editMine) setShowMineInfo(false); }}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Mine Information — {mine?.name}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditMine(null); setShowMineInfo(false); }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="mine-info-columns">
                <div className="mine-info-panel">
                  <div className="mine-info-section-title">Details & Status</div>
                  {editMine ? (
                    <>
                      <div className="form-group"><label className="form-label">Mine Name</label><input className="form-input" value={editMine.name} onChange={e => setEditMine(p => ({ ...p, name: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={editMine.location} onChange={e => setEditMine(p => ({ ...p, location: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Status</label>
                        <select className="form-select" value={editMine.status} onChange={e => setEditMine(p => ({ ...p, status: e.target.value }))}>
                          {MINE_STATUSES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                        </select>
                      </div>
                      <div className="form-group"><label className="form-label">License Expiry</label><input type="date" className="form-input" value={editMine.licenseExpiry || ""} onChange={e => setEditMine(p => ({ ...p, licenseExpiry: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Last Inspection</label><input type="date" className="form-input" value={editMine.lastInspection || ""} onChange={e => setEditMine(p => ({ ...p, lastInspection: e.target.value }))} /></div>
                    </>
                  ) : (
                    <>
                      <div className="mine-detail-row"><span className="mine-detail-label">Location</span><span>{mine?.location}</span></div>
                      <div className="mine-detail-row"><span className="mine-detail-label">Status</span><span>{MINE_STATUSES.find(s => s.id === mine?.status)?.icon} {mine?.status}</span></div>
                      <div className="mine-detail-row"><span className="mine-detail-label">Minerals</span><span>{mine?.minerals?.map(mid => minerals.find(m => m.id === mid)?.name).filter(Boolean).join(", ") || "—"}</span></div>
                      <div className="mine-detail-row"><span className="mine-detail-label">License Expiry</span>
                        <span className={hasExpiryAlert ? "mine-alert-text" : ""}>{mine?.licenseExpiry ? `${fmtDate(mine.licenseExpiry)} (${expiryDays} days)` : "Not set"}</span>
                      </div>
                      <div className="mine-detail-row"><span className="mine-detail-label">Last Inspection</span><span>{mine?.lastInspection ? fmtDate(mine.lastInspection) : "Not recorded"}</span></div>
                      <div className="mine-detail-row"><span className="mine-detail-label">Locations</span><span>{mineLocations.join(", ") || "—"}</span></div>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditMine({ ...mine })} style={{ marginTop: 8 }}>✎ Edit Details</button>
                    </>
                  )}
                </div>

                <div>
                  <div className="mine-info-section-title">Documents & Licenses</div>
                  <div className="mine-docs-list">
                    {LICENSE_TYPES.map(lt => {
                      const doc = mineDocs.find(d => d.type === lt.id);
                      return (
                        <div key={lt.id} className={`mine-doc-item ${doc ? "has-doc" : ""}`}>
                          <div className="mine-doc-info">
                            <div className="mine-doc-name">{lt.label}</div>
                            {doc ? (
                              <div className="mine-doc-meta">{doc.name} · {doc.size} · {doc.date}</div>
                            ) : (
                              <div className="mine-doc-meta" style={{ color: "var(--text-muted)" }}>Not uploaded</div>
                            )}
                          </div>
                          <span className={`badge badge-${doc?.aiStatus === "analysed" ? "purple" : doc ? "green" : "muted"}`}>
                            {doc?.aiStatus === "analysed" ? "AI Ready" : doc ? "Uploaded" : "Missing"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div className="mine-info-section-title">Maps & Reports</div>
                    <div className="mine-docs-list">
                      {mineDocs.filter(d => d.type === "map" || d.type === "report").map((doc, i) => (
                        <div key={i} className="mine-doc-item has-doc">
                          <div className="mine-doc-info">
                            <div className="mine-doc-name">{doc.name}</div>
                            <div className="mine-doc-meta">{doc.size} · {doc.date} · {doc.type === "map" ? "Map" : "Report"}</div>
                          </div>
                          <span className={`badge badge-${doc.aiStatus === "analysed" ? "purple" : "gold"}`}>{doc.aiStatus === "analysed" ? "AI Ready" : "Pending"}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`upload-zone ${dragOver ? "drag-over" : ""}`} style={{ marginTop: 10, padding: 14 }}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); handleDocUpload(e.dataTransfer.files); }}
                      onClick={() => docFileRef.current?.click()}>
                      <input ref={docFileRef} type="file" hidden accept=".pdf,.jpg,.png,.dwg,.dxf" onChange={e => handleDocUpload(e.target.files)} />
                      <div className="upload-text" style={{ fontSize: 12 }}>+ Upload License / Map / Report</div>
                      <div className="upload-sub" style={{ fontSize: 10 }}>PDF, JPG, PNG, DWG — max 20MB</div>
                    </div>
                  </div>
                </div>
              </div>

              {mineDocs.filter(d => d.aiStatus === "analysed").length > 0 && (
                <div className="mine-ai-insights" style={{ marginTop: 16 }}>
                  <div className="mine-info-section-title">AI Document Analysis</div>
                  <div className="insight-grid" style={{ marginTop: 8 }}>
                    <div className="insight-card">
                      <div className="insight-icon">⬡</div>
                      <div className="insight-content">
                        <div className="insight-title">License Compliance</div>
                        <div className="insight-desc">{mine?.name} — {mineDocs.filter(d => d.aiStatus === "analysed").length} documents analysed. {hasExpiryAlert ? `License expires in ${expiryDays} days — renewal process should be initiated.` : "All licenses are current."}</div>
                      </div>
                    </div>
                    <div className="insight-card">
                      <div className="insight-icon">⟳</div>
                      <div className="insight-content">
                        <div className="insight-title">Map & Survey Analysis</div>
                        <div className="insight-desc">{mineDocs.filter(d => d.type === "map").length} site maps available for AI review. Recommend quarterly survey update for pit progression tracking.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {editMine && <><button className="btn btn-ghost" onClick={() => setEditMine(null)}>Cancel</button><button className="btn btn-primary" onClick={saveMineInfo}>Save Changes</button></>}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header"><div className="modal-title">Delete Mine</div><button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>✕</button></div>
            <div className="modal-body"><p>Delete <strong>{deleteConfirm.name}</strong>? All production data, documents, and records will be removed.</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteMine(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="prod-controls">
        <div className="prod-controls-row">
          <div className="prod-select-group">
            <label className="prod-label">Mine {isCustom && <span className="badge badge-purple" style={{ fontSize: 8 }}>CUSTOM</span>}</label>
            <div className="prod-mine-select-row">
              <select className="form-select" value={selectedMine} onChange={e => { setSelectedMine(e.target.value); setSelectedLocations([]); }}>
                {mines.map(m => <option key={m.id} value={m.id}>{m.name} — {m.location}</option>)}
              </select>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowMineInfo(true)} title="Mine Info">ℹ</button>
              {selectedMine.startsWith("mine-") && <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(mine)} title="Delete">🗑</button>}
            </div>
            {mine && (
              <div style={{ fontSize: 10, marginTop: 4, display: "flex", gap: 8 }}>
                <span>{MINE_STATUSES.find(s => s.id === mine.status)?.icon} {mine.status}</span>
                {mine.licenseExpiry && <span className={hasExpiryAlert ? "mine-alert-text" : ""}>License: {fmtDate(mine.licenseExpiry)}</span>}
              </div>
            )}
          </div>
          <div className="prod-select-group">
            <label className="prod-label">Mineral</label>
            <select className="form-select" value={selectedMineral} onChange={e => setSelectedMineral(e.target.value)}>
              {mineMinerals.length > 0 ? mineMinerals.map(m => <option key={m.id} value={m.id}>{m.name} ({m.symbol})</option>) : minerals.map(m => <option key={m.id} value={m.id}>{m.name} ({m.symbol})</option>)}
            </select>
          </div>
          <div className="prod-select-group">
            <label className="prod-label">Locations</label>
            <div className="prod-location-chips">
              {mineLocations.map(loc => (
                <span key={loc} className={`prod-chip ${selectedLocations.length === 0 || selectedLocations.includes(loc) ? "active" : ""}`} onClick={() => toggleLocation(loc)}>{loc}</span>
              ))}
              {selectedLocations.length > 0 && <span className="prod-chip-reset" onClick={() => setSelectedLocations([])}>× All</span>}
            </div>
          </div>
        </div>
        <div className="prod-controls-row">
          <label className="prod-toggle"><input type="checkbox" checked={compareMode} onChange={e => setCompareMode(e.target.checked)} /><span>Compare with another mine</span></label>
          {compareMode && (
            <select className="form-select" value={compareMine} onChange={e => setCompareMine(e.target.value)} style={{ marginLeft: 12, width: 240 }}>
              {mines.filter(m => m.id !== selectedMine).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          )}
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {minerals.length} minerals · {mines.length} mines
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
        <button className={`tab ${activeTab === "monthly" ? "active" : ""}`} onClick={() => setActiveTab("monthly")}>Monthly Comparison</button>
        <button className={`tab ${activeTab === "shifts" ? "active" : ""}`} onClick={() => setActiveTab("shifts")}>Shift Detail</button>
        <button className={`tab ${activeTab === "upload" ? "active" : ""}`} onClick={() => setActiveTab("upload")}>Data Upload</button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          <div className="kpi-grid">
            {[
              { id: "tonnes", label: "Tonnes Mined", value: currentMonth.tonnes.toLocaleString(), target: monthlyData[2]?.tonnes.toLocaleString(), unit: "t", icon: "⬡", change: pctChange(currentMonth.tonnes, prevMonth.tonnes) },
              { id: "grade", label: `Grade (${minerals.find(m => m.id === selectedMineral)?.symbol})`, value: currentMonth.grade.toString(), target: prevMonth.grade.toString(), unit: minerals.find(m => m.id === selectedMineral)?.unit, icon: "⟳", change: pctChange(currentMonth.grade, prevMonth.grade) },
              { id: "recovery", label: "Recovery", value: currentMonth.recovery.toString(), target: prevMonth.recovery.toString(), unit: "%", icon: "◎", change: pctChange(currentMonth.recovery, prevMonth.recovery) },
              { id: "uptime", label: "Uptime", value: `${currentMonth.uptime}%`, target: `${prevMonth.uptime}%`, unit: "", icon: "⚖", change: pctChange(currentMonth.uptime, prevMonth.uptime) },
              { id: "cost", label: "Unit Cost", value: `RM ${currentMonth.costPerTonne}`, target: `RM ${prevMonth.costPerTonne}`, unit: "/t", icon: "💰", change: pctChange(currentMonth.costPerTonne, prevMonth.costPerTonne) },
            ].map(m => {
              const isGood = m.id === "cost" ? parseFloat(m.change) <= 0 : parseFloat(m.change) >= 0;
              return (
                <div key={m.id} className="kpi-card">
                  <div className="kpi-card-header">
                    <span className="kpi-icon">{m.icon}</span>
                    <span className={`kpi-trend ${Math.abs(parseFloat(m.change)) < 1 ? "neutral" : isGood ? "positive" : "negative"}`}>
                      {m.change !== "—" ? `${m.change.startsWith("-") ? "" : "+"}${m.change}%` : "—"}
                    </span>
                  </div>
                  <div className="kpi-value">{m.value}<span className="kpi-unit">{m.unit}</span></div>
                  <div className="kpi-label">{m.label}</div>
                  <div className="kpi-sub">vs {MONTHS[1].label}: {m.target}{m.unit}</div>
                </div>
              );
            })}
          </div>

          <div className="prod-summary-cards">
            <div className="card">
              <div className="card-header">
                <div className="card-title">{mine?.name} — {MONTHS[0].label}</div>
                <div className="card-subtitle">{mine?.location}</div>
              </div>
              <div className="card-body">
                <div className="prod-summary-grid">
                  {[
                    { label: "Total Tonnes", value: currentMonth.tonnes.toLocaleString(), change: `${pctChange(currentMonth.tonnes, prevMonth.tonnes)}%`, good: parseFloat(pctChange(currentMonth.tonnes, prevMonth.tonnes)) >= 0 },
                    { label: "Ore Tonnes", value: currentMonth.oreTonnes.toLocaleString(), sub: `${((currentMonth.oreTonnes / currentMonth.tonnes) * 100).toFixed(0)}% ore` },
                    { label: "Waste / Strip Ratio", value: `${(currentMonth.wasteTonnes / currentMonth.oreTonnes).toFixed(2)}:1`, sub: `${currentMonth.wasteTonnes.toLocaleString()}t waste` },
                    { label: "Man Hours", value: currentMonth.manHours.toLocaleString(), sub: `Overtime: ${currentMonth.overTimeHrs}h` },
                    { label: "Downtime", value: `${currentMonth.downtimeHrs}h`, sub: `Uptime: ${currentMonth.uptime}%` },
                    { label: "Cost / Tonne", value: `RM ${currentMonth.costPerTonne}`, change: `RM ${(currentMonth.costPerTonne - prevMonth.costPerTonne).toFixed(2)}`, good: currentMonth.costPerTonne <= prevMonth.costPerTonne },
                  ].map((item, i) => (
                    <div key={i} className="prod-summary-item">
                      <span className="prod-summary-label">{item.label}</span>
                      <span className="prod-summary-value">{item.value}</span>
                      {item.change && <span className="prod-summary-change" data-good={item.good}>{item.good ? "▲" : "▼"} {item.change}</span>}
                      {item.sub && <span className="prod-summary-sub">{item.sub}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {compareMode && compareData && (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">{mines.find(m => m.id === compareMine)?.name} — {MONTHS[0].label}</div>
                  <div className="card-subtitle">{mines.find(m => m.id === compareMine)?.location}</div>
                </div>
                <div className="card-body">
                  <div className="prod-summary-grid">
                    {[
                      { label: "Total Tonnes", value: compareData[0].tonnes.toLocaleString(), vs: currentMonth.tonnes, vsLabel: `${((compareData[0].tonnes / currentMonth.tonnes) * 100 - 100).toFixed(1)}%` },
                      { label: `Grade`, value: compareData[0].grade.toFixed(1), unit: minerals.find(m => m.id === selectedMineral)?.unit },
                      { label: "Recovery", value: `${compareData[0].recovery}%` },
                      { label: "Uptime", value: `${compareData[0].uptime}%` },
                      { label: "Cost / Tonne", value: `RM ${compareData[0].costPerTonne}` },
                      { label: "Downtime", value: `${compareData[0].downtimeHrs}h` },
                    ].map((item, i) => (
                      <div key={i} className="prod-summary-item">
                        <span className="prod-summary-label">{item.label}</span>
                        <span className="prod-summary-value">{item.value}{item.unit && <span className="kpi-unit">{item.unit}</span>}</span>
                        {item.vsLabel && <span className="prod-summary-change" data-good={parseFloat(item.vsLabel) >= 0}>{parseFloat(item.vsLabel) >= 0 ? "▲" : "▼"} {item.vsLabel}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Monthly Tab */}
      {activeTab === "monthly" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Month-to-Month Comparison</div>
            <div className="card-subtitle">{mine?.name} · {minerals.find(m => m.id === selectedMineral)?.name}</div>
          </div>
          <div className="table-wrap">
            <table className="monthly-table">
              <thead><tr><th>Metric</th>{MONTHS.map(m => <th key={m.key}>{m.label}</th>)}<th>Trend</th></tr></thead>
              <tbody>
                {[
                  { label: "Tonnes Mined (t)", key: "tonnes", fmt: v => v.toLocaleString() },
                  { label: "Ore Tonnes (t)", key: "oreTonnes", fmt: v => v.toLocaleString() },
                  { label: "Waste (t)", key: "wasteTonnes", fmt: v => v.toLocaleString() },
                  { label: `Grade (${minerals.find(m => m.id === selectedMineral)?.symbol})`, key: "grade", fmt: v => v.toFixed(1) },
                  { label: "Recovery (%)", key: "recovery", fmt: v => `${v.toFixed(1)}%` },
                  { label: "Uptime (%)", key: "uptime", fmt: v => `${v}%` },
                  { label: "Cost / Tonne (RM)", key: "costPerTonne", fmt: v => `RM ${v.toFixed(2)}` },
                  { label: "Downtime (h)", key: "downtimeHrs", fmt: v => `${v}h` },
                  { label: "Man Hours", key: "manHours", fmt: v => v.toLocaleString() },
                  { label: "Overtime (h)", key: "overTimeHrs", fmt: v => `${v}h` },
                ].map(row => {
                  const vals = monthlyData.map(d => d[row.key]);
                  const improving = ["costPerTonne", "downtimeHrs", "overTimeHrs"].includes(row.key) ? vals[0] <= vals[4] : vals[0] >= vals[4];
                  return (
                    <tr key={row.key}>
                      <td className="cell-bold">{row.label}</td>
                      {vals.map((v, i) => <td key={i} className={i === 0 ? "cell-highlight" : ""}>{row.fmt(v)}</td>)}
                      <td><span className={`trend-arrow ${improving ? "trend-up" : "trend-down"}`}>{improving ? "▲" : "▼"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {compareMode && compareData && (
            <div style={{ marginTop: 20 }}>
              <div className="card-subtitle" style={{ marginBottom: 12 }}>Comparison: {mines.find(m => m.id === compareMine)?.name}</div>
              <div className="table-wrap">
                <table className="monthly-table">
                  <thead><tr><th>Metric</th>{MONTHS.map(m => <th key={m.key}>{m.label}</th>)}<th>Trend</th></tr></thead>
                  <tbody>
                    {["tonnes", "grade", "recovery", "costPerTonne"].map(key => {
                      const vals = compareData.map(d => d[key]);
                      const label = { tonnes: "Tonnes (t)", grade: `Grade`, recovery: "Recovery (%)", costPerTonne: "Cost/T (RM)" }[key];
                      const improving = key === "costPerTonne" ? vals[0] <= vals[4] : vals[0] >= vals[4];
                      const fmt = key === "tonnes" ? v => v.toLocaleString() : key === "grade" ? v => v.toFixed(1) : key === "costPerTonne" ? v => `RM ${v.toFixed(2)}` : v => `${v.toFixed(1)}%`;
                      return (
                        <tr key={key}>
                          <td className="cell-bold">{label}</td>
                          {vals.map((v, i) => <td key={i} className={i === 0 ? "cell-highlight" : ""}>{fmt(v)}</td>)}
                          <td><span className={`trend-arrow ${improving ? "trend-up" : "trend-down"}`}>{improving ? "▲" : "▼"}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shift Tab */}
      {activeTab === "shifts" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Today's Production by Shift — {mine?.name}</div>
            <div className="card-subtitle">{new Date().toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}</div>
          </div>
          <div className="shift-grid">
            {mineShifts.map((s, i) => (
              <div key={i} className="shift-card">
                <div className="shift-header"><span className="shift-name">{s.shift}</span><span className="shift-stat">{s.tonnes.toLocaleString()} t</span></div>
                <div className="shift-row"><span>Ore</span><span>{s.ore.toLocaleString()} t</span></div>
                <div className="shift-row"><span>Waste</span><span>{s.waste.toLocaleString()} t</span></div>
                <div className="shift-row"><span>Grade</span><span>{s.grade}%</span></div>
                <div className="shift-row"><span>Downtime</span><span className={s.downtime > 60 ? "shift-warn" : ""}>{s.downtime} min</span></div>
                <div className="shift-notes">{s.notes}</div>
              </div>
            ))}
          </div>
          <div className="shift-total">
            <span>Total Today</span>
            <span className="shift-total-value">{mineShifts.reduce((s, x) => s + x.tonnes, 0).toLocaleString()} tonnes</span>
          </div>
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <>
          <div className="dashboard-panels">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Production Data Upload</div>
                <div className="card-subtitle">Upload shift reports, production data, or lab results for AI analysis</div>
              </div>
              <div className="card-body">
                <div className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
                  onClick={() => fileRef.current?.click()}>
                  <input ref={fileRef} type="file" hidden accept=".csv,.xlsx,.xls,.pdf" onChange={e => handleUpload(e.target.files)} />
                  <div className="upload-icon">📤</div>
                  <div className="upload-text">Drop production data files here</div>
                  <div className="upload-sub">CSV, XLSX, PDF — max 10MB · AI analysis on upload</div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Upload History</div>
                <div className="card-subtitle">Filtered by: {mine?.name}</div>
              </div>
              <div className="card-body">
                {uploads.filter(u => u.mine === selectedMine).length === 0
                  ? <div className="empty-state">No uploads for this mine</div>
                  : uploads.filter(u => u.mine === selectedMine).map((u, i) => (
                      <div key={i} className="upload-row">
                        <div className="upload-row-info">
                          <div className="upload-row-name">{u.name}</div>
                          <div className="upload-row-meta">{u.size} · {u.date} · {minerals.find(m => m.id === u.mineral)?.name || u.mineral}</div>
                        </div>
                        <span className={`badge badge-${u.status === "analysed" ? "purple" : u.status === "processed" ? "green" : "gold"}`}>{u.status}</span>
                      </div>
                    ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <div className="card-title">AI Production Insights — {mine?.name}</div>
              <div className="card-subtitle">Cross-referencing production data, documents, and historical trends</div>
            </div>
            <div className="card-body">
              <div className="insight-grid">
                <div className="insight-card">
                  <div className="insight-icon">⬡</div>
                  <div className="insight-content">
                    <div className="insight-title">Throughput Analysis</div>
                    <div className="insight-desc">{currentMonth.tonnes.toLocaleString()}t this month. MoM: {pctChange(currentMonth.tonnes, prevMonth.tonnes)}%. {currentMonth.tonnes >= prevMonth.tonnes ? "Production increased — positive trend across all shifts." : "Production declined — investigate shift-level constraints."}</div>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">⟳</div>
                  <div className="insight-content">
                    <div className="insight-title">Quality Control</div>
                    <div className="insight-desc">Grade: {currentMonth.grade}{minerals.find(m => m.id === selectedMineral)?.unit} (MoM: {pctChange(currentMonth.grade, prevMonth.grade)}%). Recovery: {currentMonth.recovery}%. Grade-control samples recommended for variance &gt;2%.</div>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">⚖</div>
                  <div className="insight-content">
                    <div className="insight-title">Compliance & Cost</div>
                    <div className="insight-desc">Cost: RM {currentMonth.costPerTonne}/t. Status: {mine?.status}. License: {mine?.licenseExpiry ? `${fmtDate(mine.licenseExpiry)} (${expiryDays}d)` : "N/A"}. {hasExpiryAlert ? "⚠ License renewal alert active." : "Licenses current."}</div>
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
