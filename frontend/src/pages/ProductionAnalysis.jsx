import { useState, useRef, useMemo } from "react";

const MINES = [
  { id: "kros-hill", name: "Kros Hill", location: "Pahang, Malaysia" },
  { id: "bukit-besi", name: "Bukit Besi", location: "Terengganu, Malaysia" },
  { id: "sungai-lembing", name: "Sungai Lembing", location: "Pahang, Malaysia" },
];

const MINERALS = [
  { id: "iron-ore", name: "Iron Ore", symbol: "Fe", unit: "%" },
  { id: "gold", name: "Gold", symbol: "Au", unit: "g/t" },
  { id: "bauxite", name: "Bauxite", symbol: "Al₂O₃", unit: "%" },
  { id: "aggregate", name: "Aggregate", symbol: "AGG", unit: "t" },
];

const LOCATIONS = {
  "kros-hill": ["West Pit", "East Pit", "South Pit", "Underground L1"],
  "bukit-besi": ["North Pit", "Central Pit", "Stockpile"],
  "sungai-lembing": ["Main Zone", "West Extension", "Deep Zone"],
};

const MONTHS = [
  { key: "2026-05", label: "May 2026" },
  { key: "2026-04", label: "Apr 2026" },
  { key: "2026-03", label: "Mar 2026" },
  { key: "2026-02", label: "Feb 2026" },
  { key: "2026-01", label: "Jan 2026" },
];

function generateMonthlyData(mine, mineral, locations) {
  const baseTonnes = { "kros-hill": 180000, "bukit-besi": 120000, "sungai-lembing": 85000 };
  const baseGrade = { "iron-ore": 58.2, gold: 3.8, bauxite: 48.5, aggregate: 100 };
  const baseRecovery = { "kros-hill": 94, "bukit-besi": 91, "sungai-lembing": 93 };
  const bt = baseTonnes[mine] || 100000;
  const bg = baseGrade[mineral] || 50;
  const br = baseRecovery[mine] || 90;

  return MONTHS.map((m, mi) => {
    const variance = (mi) * 2 - 4;
    const tonnes = Math.round(bt + variance * 3000 + (Math.random() - 0.5) * 15000);
    const grade = bg + (Math.random() - 0.5) * 1.5;
    const recovery = br + (Math.random() - 0.5) * 3;
    const costPerTonne = 32.5 + (Math.random() - 0.5) * 5 + (mi < 2 ? 2 : 0);
    const uptime = 88 + Math.round((Math.random() - 0.2) * 10);
    const totalHrs = 720;
    const downtimeHrs = Math.round(totalHrs * (100 - uptime) / 100);
    const oreTonnes = Math.round(tonnes * (0.75 + Math.random() * 0.15));
    const wasteTonnes = tonnes - oreTonnes;
    return {
      month: m.key,
      monthLabel: m.label,
      tonnes,
      oreTonnes,
      wasteTonnes,
      grade: +grade.toFixed(1),
      recovery: +recovery.toFixed(1),
      costPerTonne: +costPerTonne.toFixed(2),
      uptime,
      downtimeHrs,
      overTimeHrs: Math.round(80 + (Math.random() - 0.5) * 60),
      manHours: Math.round(5200 + (Math.random() - 0.5) * 800),
      totalHrs,
    };
  });
}

const SHIFT_DATA = {
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

const SAMPLE_UPLOADS = [
  { name: "daily_production_may27.xlsx", size: "1.2 MB", date: "2026-05-27", status: "analysed", mine: "kros-hill", mineral: "iron-ore" },
  { name: "crusher_throughput_week21.csv", size: "0.8 MB", date: "2026-05-26", status: "processed", mine: "kros-hill", mineral: "iron-ore" },
  { name: "grade_control_lab_results_27may.pdf", size: "2.1 MB", date: "2026-05-27", status: "pending", mine: "bukit-besi", mineral: "gold" },
  { name: "bukit_besi_production_apr.xlsx", size: "3.4 MB", date: "2026-04-30", status: "analysed", mine: "bukit-besi", mineral: "iron-ore" },
  { name: "sg_lembing_gold_production_q2.csv", size: "1.1 MB", date: "2026-05-20", status: "analysed", mine: "sungai-lembing", mineral: "gold" },
];

export default function ProductionAnalysis() {
  const [selectedMine, setSelectedMine] = useState("kros-hill");
  const [selectedMineral, setSelectedMineral] = useState("iron-ore");
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareMine, setCompareMine] = useState("bukit-besi");
  const [uploads, setUploads] = useState(SAMPLE_UPLOADS);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const fileRef = useRef(null);

  const mine = MINES.find(m => m.id === selectedMine);
  const locations = LOCATIONS[selectedMine] || [];
  const allLocations = selectedLocations.length === 0 ? locations : selectedLocations;

  const monthlyData = useMemo(() => generateMonthlyData(selectedMine, selectedMineral, allLocations), [selectedMine, selectedMineral, allLocations]);
  const compareData = useMemo(() => compareMode ? generateMonthlyData(compareMine, selectedMineral, LOCATIONS[compareMine] || []) : null, [compareMode, compareMine, selectedMineral]);

  const currentMonth = monthlyData[0];
  const prevMonth = monthlyData[1];
  const pctChange = (a, b) => b ? (((a - b) / b) * 100).toFixed(1) : "—";

  const shifts = SHIFT_DATA[selectedMine] || SHIFT_DATA["kros-hill"];

  const handleUpload = (files) => {
    if (!files?.length) return;
    const f = files[0];
    setUploads(prev => [
      { name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`, date: new Date().toISOString().slice(0, 10), status: "pending", mine: selectedMine, mineral: selectedMineral },
      ...prev,
    ]);
  };

  const toggleLocation = (loc) => {
    setSelectedLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Mine Production Analysis</div>
          <div className="page-subtitle">Multi-mine, multi-mineral production tracking with month-to-month comparison</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm">✦ Generate Report</button>
        </div>
      </div>

      <div className="prod-controls">
        <div className="prod-controls-row">
          <div className="prod-select-group">
            <label className="prod-label">Mine</label>
            <select className="form-select" value={selectedMine} onChange={e => setSelectedMine(e.target.value)}>
              {MINES.map(m => <option key={m.id} value={m.id}>{m.name} — {m.location}</option>)}
            </select>
          </div>
          <div className="prod-select-group">
            <label className="prod-label">Mineral</label>
            <select className="form-select" value={selectedMineral} onChange={e => setSelectedMineral(e.target.value)}>
              {MINERALS.map(m => <option key={m.id} value={m.id}>{m.name} ({m.symbol})</option>)}
            </select>
          </div>
          <div className="prod-select-group">
            <label className="prod-label">Locations</label>
            <div className="prod-location-chips">
              {locations.map(loc => (
                <span key={loc} className={`prod-chip ${selectedLocations.length === 0 || selectedLocations.includes(loc) ? "active" : ""}`}
                  onClick={() => toggleLocation(loc)}>
                  {loc}
                </span>
              ))}
              {selectedLocations.length > 0 && (
                <span className="prod-chip-reset" onClick={() => setSelectedLocations([])}>× Clear</span>
              )}
            </div>
          </div>
        </div>
        <div className="prod-controls-row">
          <label className="prod-toggle">
            <input type="checkbox" checked={compareMode} onChange={e => setCompareMode(e.target.checked)} />
            <span>Compare with another mine</span>
          </label>
          {compareMode && (
            <select className="form-select" value={compareMine} onChange={e => setCompareMine(e.target.value)} style={{ marginLeft: 12, width: 240 }}>
              {MINES.filter(m => m.id !== selectedMine).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
        <button className={`tab ${activeTab === "monthly" ? "active" : ""}`} onClick={() => setActiveTab("monthly")}>Monthly Comparison</button>
        <button className={`tab ${activeTab === "shifts" ? "active" : ""}`} onClick={() => setActiveTab("shifts")}>Shift Detail</button>
        <button className={`tab ${activeTab === "upload" ? "active" : ""}`} onClick={() => setActiveTab("upload")}>Data Upload</button>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="kpi-grid">
            {[
              { id: "tonnes", label: "Tonnes Mined", value: currentMonth.tonnes.toLocaleString(), target: monthlyData[2]?.tonnes.toLocaleString(), unit: "t", icon: "⬡", change: pctChange(currentMonth.tonnes, prevMonth.tonnes) },
              { id: "grade", label: `Grade (${MINERALS.find(m => m.id === selectedMineral)?.symbol})`, value: currentMonth.grade.toString(), target: prevMonth.grade.toString(), unit: MINERALS.find(m => m.id === selectedMineral)?.unit, icon: "⟳", change: pctChange(currentMonth.grade, prevMonth.grade) },
              { id: "recovery", label: "Recovery", value: currentMonth.recovery.toString(), target: prevMonth.recovery.toString(), unit: "%", icon: "◎", change: pctChange(currentMonth.recovery, prevMonth.recovery) },
              { id: "uptime", label: "Crushing Uptime", value: currentMonth.uptime.toString(), target: prevMonth.uptime.toString(), unit: "%", icon: "⚖", change: pctChange(currentMonth.uptime, prevMonth.uptime) },
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
                <div className="card-title">{mine?.name} — Current Month</div>
                <div className="card-subtitle">{MONTHS[0].label}</div>
              </div>
              <div className="card-body">
                <div className="prod-summary-grid">
                  <div className="prod-summary-item">
                    <span className="prod-summary-label">Total Tonnes</span>
                    <span className="prod-summary-value">{currentMonth.tonnes.toLocaleString()}</span>
                    <span className="prod-summary-change" data-good={pctChange(currentMonth.tonnes, prevMonth.tonnes) >= 0}>
                      {pctChange(currentMonth.tonnes, prevMonth.tonnes) >= 0 ? "▲" : "▼"} {pctChange(currentMonth.tonnes, prevMonth.tonnes)}%
                    </span>
                  </div>
                  <div className="prod-summary-item">
                    <span className="prod-summary-label">Ore Tonnes</span>
                    <span className="prod-summary-value">{currentMonth.oreTonnes.toLocaleString()}</span>
                    <span className="prod-summary-sub">{((currentMonth.oreTonnes / currentMonth.tonnes) * 100).toFixed(0)}% ore</span>
                  </div>
                  <div className="prod-summary-item">
                    <span className="prod-summary-label">Waste Tonnes</span>
                    <span className="prod-summary-value">{currentMonth.wasteTonnes.toLocaleString()}</span>
                    <span className="prod-summary-sub">Strip ratio: {(currentMonth.wasteTonnes / currentMonth.oreTonnes).toFixed(2)}:1</span>
                  </div>
                  <div className="prod-summary-item">
                    <span className="prod-summary-label">Man Hours</span>
                    <span className="prod-summary-value">{currentMonth.manHours.toLocaleString()}</span>
                    <span className="prod-summary-sub">Overtime: {currentMonth.overTimeHrs}h</span>
                  </div>
                  <div className="prod-summary-item">
                    <span className="prod-summary-label">Downtime</span>
                    <span className="prod-summary-value">{currentMonth.downtimeHrs}h</span>
                    <span className="prod-summary-sub">of {currentMonth.totalHrs}h total</span>
                  </div>
                  <div className="prod-summary-item">
                    <span className="prod-summary-label">Cost / Tonne</span>
                    <span className="prod-summary-value">RM {currentMonth.costPerTonne}</span>
                    <span className="prod-summary-change" data-good={currentMonth.costPerTonne <= prevMonth.costPerTonne}>
                      {currentMonth.costPerTonne <= prevMonth.costPerTonne ? "▲" : "▼"} RM {(currentMonth.costPerTonne - prevMonth.costPerTonne).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {compareMode && compareData && (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">{MINES.find(m => m.id === compareMine)?.name} — Comparison</div>
                  <div className="card-subtitle">{MONTHS[0].label}</div>
                </div>
                <div className="card-body">
                  <div className="prod-summary-grid">
                    {[
                      { label: "Total Tonnes", value: compareData[0].tonnes.toLocaleString(), vs: currentMonth.tonnes },
                      { label: `Grade (${MINERALS.find(m => m.id === selectedMineral)?.symbol})`, value: compareData[0].grade.toString(), vs: currentMonth.grade, unit: MINERALS.find(m => m.id === selectedMineral)?.unit },
                      { label: "Recovery", value: `${compareData[0].recovery}%`, vs: currentMonth.recovery, unit: "%" },
                      { label: "Uptime", value: `${compareData[0].uptime}%`, vs: currentMonth.uptime, unit: "%" },
                      { label: "Cost / Tonne", value: `RM ${compareData[0].costPerTonne}`, vs: currentMonth.costPerTonne, unit: "RM" },
                      { label: "Downtime", value: `${compareData[0].downtimeHrs}h`, vs: currentMonth.downtimeHrs, unit: "h" },
                    ].map((item, i) => {
                      const diff = ((item.vs - (item.vs || 0))).toFixed(1);
                      return (
                        <div key={i} className="prod-summary-item">
                          <span className="prod-summary-label">{item.label}</span>
                          <span className="prod-summary-value">{item.value}{item.unit && <span className="kpi-unit">{item.unit}</span>}</span>
                          <span className={`prod-summary-change ${Math.abs(compareData[0].tonnes - currentMonth.tonnes) < 500 ? "" : ""}`}>
                            {item.vs > item.vs - 1 ? "▲" : "▼"} {Math.abs(item.vs - item.vs).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "monthly" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Month-to-Month Comparison</div>
            <div className="card-subtitle">{mine?.name} · {MINERALS.find(m => m.id === selectedMineral)?.name}</div>
          </div>
          <div className="table-wrap">
            <table className="monthly-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {MONTHS.map(m => <th key={m.key}>{m.label}</th>)}
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Tonnes Mined (t)", key: "tonnes", fmt: (v) => v.toLocaleString() },
                  { label: "Ore Tonnes (t)", key: "oreTonnes", fmt: (v) => v.toLocaleString() },
                  { label: "Waste Tonnes (t)", key: "wasteTonnes", fmt: (v) => v.toLocaleString() },
                  { label: `Grade (${MINERALS.find(m => m.id === selectedMineral)?.symbol})`, key: "grade", fmt: (v) => v.toFixed(1) },
                  { label: "Recovery (%)", key: "recovery", fmt: (v) => `${v.toFixed(1)}%` },
                  { label: "Uptime (%)", key: "uptime", fmt: (v) => `${v}%` },
                  { label: "Cost / Tonne (RM)", key: "costPerTonne", fmt: (v) => `RM ${v.toFixed(2)}` },
                  { label: "Downtime (h)", key: "downtimeHrs", fmt: (v) => `${v}h` },
                  { label: "Man Hours", key: "manHours", fmt: (v) => v.toLocaleString() },
                  { label: "Overtime (h)", key: "overTimeHrs", fmt: (v) => `${v}h` },
                ].map(row => {
                  const vals = monthlyData.map(d => d[row.key]);
                  const first = vals[0];
                  const last = vals[vals.length - 1];
                  const improving = row.key === "costPerTonne" || row.key === "downtimeHrs" || row.key === "overTimeHrs" ? first <= last : first >= last;
                  return (
                    <tr key={row.key}>
                      <td className="cell-bold">{row.label}</td>
                      {vals.map((v, i) => (
                        <td key={i} className={i === 0 ? "cell-highlight" : ""}>{row.fmt(v)}</td>
                      ))}
                      <td>
                        <span className={`trend-arrow ${improving ? "trend-up" : "trend-down"}`}>
                          {improving ? "▲" : "▼"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {compareMode && compareData && (
            <div style={{ marginTop: 20 }}>
              <div className="card-subtitle" style={{ marginBottom: 12 }}>Comparison: {MINES.find(m => m.id === compareMine)?.name}</div>
              <div className="table-wrap">
                <table className="monthly-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      {MONTHS.map(m => <th key={m.key}>{m.label}</th>)}
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Tonnes Mined (t)", key: "tonnes", fmt: (v) => v.toLocaleString() },
                      { label: `Grade (${MINERALS.find(m => m.id === selectedMineral)?.symbol})`, key: "grade", fmt: (v) => v.toFixed(1) },
                      { label: "Recovery (%)", key: "recovery", fmt: (v) => `${v.toFixed(1)}%` },
                      { label: "Cost / Tonne (RM)", key: "costPerTonne", fmt: (v) => `RM ${v.toFixed(2)}` },
                    ].map(row => {
                      const vals = compareData.map(d => d[row.key]);
                      const first = vals[0];
                      const last = vals[vals.length - 1];
                      const improving = row.key === "costPerTonne" ? first <= last : first >= last;
                      return (
                        <tr key={row.key}>
                          <td className="cell-bold">{row.label}</td>
                          {vals.map((v, i) => (
                            <td key={i} className={i === 0 ? "cell-highlight" : ""}>{row.fmt(v)}</td>
                          ))}
                          <td>
                            <span className={`trend-arrow ${improving ? "trend-up" : "trend-down"}`}>
                              {improving ? "▲" : "▼"}
                            </span>
                          </td>
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

      {activeTab === "shifts" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Today's Production by Shift — {mine?.name}</div>
            <div className="card-subtitle">{new Date().toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}</div>
          </div>
          <div className="shift-grid">
            {shifts.map((s, i) => (
              <div key={i} className="shift-card">
                <div className="shift-header">
                  <span className="shift-name">{s.shift}</span>
                  <span className="shift-stat">{s.tonnes.toLocaleString()} t</span>
                </div>
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
            <span className="shift-total-value">{shifts.reduce((sum, s) => sum + s.tonnes, 0).toLocaleString()} tonnes</span>
          </div>
        </div>
      )}

      {activeTab === "upload" && (
        <>
          <div className="dashboard-panels">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Production Skill Upload</div>
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
                  <div className="upload-sub">Supports CSV, XLSX, PDF — max 10MB</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Upload History</div>
                <div className="card-subtitle">Filtered by: {mine?.name} / {MINERALS.find(m => m.id === selectedMineral)?.name}</div>
              </div>
              <div className="card-body">
                {uploads.filter(u => u.mine === selectedMine || u.mineral === selectedMineral).length === 0 ? (
                  <div className="empty-state">No uploads for current selection</div>
                ) : (
                  uploads.filter(u => u.mine === selectedMine || u.mineral === selectedMineral).map((u, i) => (
                    <div key={i} className="upload-row">
                      <div className="upload-row-info">
                        <div className="upload-row-name">{u.name}</div>
                        <div className="upload-row-meta">{u.size} · {u.date} · {MINES.find(m => m.id === u.mine)?.name || u.mine}</div>
                      </div>
                      <span className={`badge badge-${u.status === "analysed" ? "purple" : u.status === "processed" ? "green" : "gold"}`}>{u.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <div className="card-title">AI Production Insights</div>
              <div className="card-subtitle">Based on uploaded data and shift reports for {mine?.name}</div>
            </div>
            <div className="card-body">
              <div className="insight-grid">
                <div className="insight-card">
                  <div className="insight-icon">⬡</div>
                  <div className="insight-content">
                    <div className="insight-title">Throughput Below Target</div>
                    <div className="insight-desc">{mine?.name}: Current run rate {currentMonth.tonnes.toLocaleString()}t vs target {monthlyData[2]?.tonnes.toLocaleString()}t. Month-on-month change: {pctChange(currentMonth.tonnes, prevMonth.tonnes)}%.</div>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">⟳</div>
                  <div className="insight-content">
                    <div className="insight-title">Grade Variability</div>
                    <div className="insight-desc">{MINERALS.find(m => m.id === selectedMineral)?.name} grade: {currentMonth.grade} ({pctChange(currentMonth.grade, prevMonth.grade)}% vs prev month). Recovery at {currentMonth.recovery}%.</div>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">⚖</div>
                  <div className="insight-content">
                    <div className="insight-title">Cost Analysis</div>
                    <div className="insight-desc">Unit cost RM {currentMonth.costPerTonne}/t. Overtime: {currentMonth.overTimeHrs}h. Uptime: {currentMonth.uptime}% with {currentMonth.downtimeHrs}h downtime.</div>
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
