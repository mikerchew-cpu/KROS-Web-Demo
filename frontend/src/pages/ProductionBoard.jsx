import { useState } from "react";

const MINES = [
  { id: "kros-hill", name: "Kros Hill", location: "Pahang" },
  { id: "bukit-besi", name: "Bukit Besi", location: "Terengganu" },
  { id: "sungai-lembing", name: "Sungai Lembing", location: "Pahang" },
];

const SHIFT_NAMES = ["Morning", "Afternoon", "Night"];

const MINE_DATA = {
  "kros-hill": {
    shifts: [
      { shift: "Morning", tonnes: 6350, ore: 5020, waste: 1330, grade: 58.3, uptime: 94, delays: [{ code: "ME-01", desc: "Crusher jam", mins: 28 }], loader: "EX-01", trucks: ["HT-01","HT-02","HT-03"], target: 6200 },
      { shift: "Afternoon", tonnes: 5710, ore: 4480, waste: 1230, grade: 57.6, uptime: 87, delays: [{ code: "ME-02", desc: "Conveyor splice", mins: 45 }, { code: "OP-03", desc: "Shift change", mins: 15 }], loader: "EX-02", trucks: ["HT-01","HT-04","HT-05"], target: 5900 },
      { shift: "Night", tonnes: 5430, ore: 4150, waste: 1280, grade: 57.9, uptime: 91, delays: [{ code: "PM-01", desc: "Planned lube", mins: 35 }], loader: "EX-01", trucks: ["HT-02","HT-03","HT-05"], target: 5600 },
    ],
    equipment: [
      { id: "EX-01", name: "Excavator #1", type: "Excavator", status: "Operating", hours: 10.5, util: 87, fuel: 185 },
      { id: "EX-02", name: "Excavator #2", type: "Excavator", status: "Breakdown", hours: 6.2, util: 52, fuel: 110, issue: "Hydraulic leak" },
      { id: "HT-01", name: "Haul Truck #1", type: "Haul Truck", status: "Operating", hours: 10.8, util: 91, fuel: 320 },
      { id: "HT-02", name: "Haul Truck #2", type: "Haul Truck", status: "Operating", hours: 10.2, util: 85, fuel: 305 },
      { id: "HT-03", name: "Haul Truck #3", type: "Haul Truck", status: "Idle", hours: 7.5, util: 62, fuel: 210 },
      { id: "HT-04", name: "Haul Truck #4", type: "Haul Truck", status: "PM", hours: 0, util: 0, fuel: 0, issue: "Scheduled service" },
      { id: "HT-05", name: "Haul Truck #5", type: "Haul Truck", status: "Operating", hours: 9.8, util: 82, fuel: 290 },
      { id: "DZ-01", name: "Dozer #1", type: "Dozer", status: "Standby", hours: 4.2, util: 35, fuel: 95 },
    ],
    delays: [
      { code: "ME-01", desc: "Mechanical — Crusher", freq: 3, totalMins: 85, trend: "up" },
      { code: "ME-02", desc: "Mechanical — Conveyor", freq: 2, totalMins: 70, trend: "up" },
      { code: "OP-01", desc: "Operational — No loader", freq: 4, totalMins: 55, trend: "down" },
      { code: "OP-02", desc: "Operational — Haul road", freq: 2, totalMins: 30, trend: "stable" },
      { code: "PM-01", desc: "Planned — Lubrication", freq: 2, totalMins: 70, trend: "down" },
    ],
  },
  "bukit-besi": {
    shifts: [
      { shift: "Morning", tonnes: 4100, ore: 3200, waste: 900, grade: 56.8, uptime: 92, delays: [{ code: "OP-01", desc: "Loader change", mins: 20 }], loader: "EX-03", trucks: ["HT-06","HT-07","HT-08"], target: 4000 },
      { shift: "Afternoon", tonnes: 3850, ore: 2950, waste: 900, grade: 57.1, uptime: 85, delays: [{ code: "ME-03", desc: "Conveyor fault", mins: 55 }], loader: "EX-03", trucks: ["HT-06","HT-07","HT-09"], target: 3900 },
      { shift: "Night", tonnes: 3700, ore: 2800, waste: 900, grade: 56.5, uptime: 90, delays: [{ code: "PM-01", desc: "Planned service", mins: 30 }], loader: "EX-04", trucks: ["HT-08","HT-09","HT-10"], target: 3800 },
    ],
    equipment: [
      { id: "EX-03", name: "Excavator #3", type: "Excavator", status: "Operating", hours: 11.2, util: 89, fuel: 175 },
      { id: "EX-04", name: "Excavator #4", type: "Excavator", status: "Standby", hours: 3.8, util: 30, fuel: 55 },
      { id: "HT-06", name: "Haul Truck #6", type: "Haul Truck", status: "Operating", hours: 10.5, util: 86, fuel: 290 },
      { id: "HT-07", name: "Haul Truck #7", type: "Haul Truck", status: "Operating", hours: 9.8, util: 80, fuel: 275 },
      { id: "HT-08", name: "Haul Truck #8", type: "Haul Truck", status: "Operating", hours: 8.5, util: 72, fuel: 240 },
      { id: "HT-09", name: "Haul Truck #9", type: "Haul Truck", status: "Idle", hours: 5.2, util: 42, fuel: 140 },
      { id: "HT-10", name: "Haul Truck #10", type: "Haul Truck", status: "Breakdown", hours: 2.0, util: 16, fuel: 55, issue: "Transmission fault" },
    ],
    delays: [
      { code: "ME-03", desc: "Mechanical — Conveyor BB", freq: 2, totalMins: 55, trend: "up" },
      { code: "OP-01", desc: "Operational — No loader", freq: 3, totalMins: 40, trend: "stable" },
      { code: "PM-01", desc: "Planned — Service", freq: 2, totalMins: 60, trend: "down" },
    ],
  },
  "sungai-lembing": {
    shifts: [
      { shift: "Morning", tonnes: 2900, ore: 2300, waste: 600, grade: 3.9, uptime: 95, delays: [], loader: "EX-05", trucks: ["HT-11","HT-12"], target: 2800 },
      { shift: "Afternoon", tonnes: 2700, ore: 2100, waste: 600, grade: 3.7, uptime: 88, delays: [{ code: "OP-02", desc: "Shift change delay", mins: 20 }], loader: "EX-05", trucks: ["HT-11","HT-13"], target: 2700 },
      { shift: "Night", tonnes: 2500, ore: 2000, waste: 500, grade: 3.8, uptime: 92, delays: [{ code: "VN-01", desc: "Ventilation maint", mins: 35 }], loader: "EX-06", trucks: ["HT-12","HT-13"], target: 2600 },
    ],
    equipment: [
      { id: "EX-05", name: "Excavator #5", type: "Excavator", status: "Operating", hours: 9.5, util: 82, fuel: 120 },
      { id: "EX-06", name: "Excavator #6", type: "Excavator", status: "Standby", hours: 4.0, util: 34, fuel: 50 },
      { id: "HT-11", name: "Haul Truck #11", type: "Haul Truck", status: "Operating", hours: 10.0, util: 84, fuel: 185 },
      { id: "HT-12", name: "Haul Truck #12", type: "Haul Truck", status: "Operating", hours: 9.2, util: 78, fuel: 170 },
      { id: "HT-13", name: "Haul Truck #13", type: "Haul Truck", status: "Idle", hours: 4.5, util: 38, fuel: 85 },
    ],
    delays: [
      { code: "VN-01", desc: "Ventilation", freq: 1, totalMins: 35, trend: "stable" },
      { code: "OP-02", desc: "Operational — Shift change", freq: 3, totalMins: 45, trend: "stable" },
    ],
  },
};

const TIME_BREAKDOWN = { Operating: 62, Standby: 8, Idle: 5, Breakdown: 10, PM: 8, Travel: 4, Other: 3 };

export default function ProductionBoard() {
  const [selectedMine, setSelectedMine] = useState("kros-hill");
  const [activeShift, setActiveShift] = useState("Morning");
  const [showDelays, setShowDelays] = useState(false);

  const mine = MINES.find(m => m.id === selectedMine) || MINES[0];
  const data = MINE_DATA[selectedMine] || MINE_DATA["kros-hill"];
  const shift = data.shifts.find(s => s.shift === activeShift) || data.shifts[0];
  const totalToday = data.shifts.reduce((s, x) => s + x.tonnes, 0);
  const totalTarget = data.shifts.reduce((s, x) => s + x.target, 0);
  const pct = Math.round((totalToday / totalTarget) * 100);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Production Board — {mine.name}</div>
          <div className="page-subtitle">{mine.location} · Real-time shift tracking, plan vs actual, equipment utilisation</div>
        </div>
        <div className="page-header-actions">
          <select className="form-select" value={selectedMine} onChange={e => { setSelectedMine(e.target.value); setActiveShift("Morning"); }} style={{ width: 180 }}>
            {MINES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setShowDelays(!showDelays)}>{showDelays ? "Hide" : "Show"} Delay Analysis</button>
        </div>
      </div>

      <div className="board-shift-selector">
        {SHIFT_NAMES.map(s => {
          const sd = data.shifts.find(x => x.shift === s);
          return (
            <button key={s} className={`board-shift-btn ${activeShift === s ? "active" : ""} ${sd && sd.tonnes >= sd.target ? "on-target" : "below-target"}`} onClick={() => setActiveShift(s)}>
              <span className="board-shift-name">{s}</span>
              <span className="board-shift-tonnes">{sd?.tonnes?.toLocaleString()}t</span>
              <span className="board-shift-pct">{sd ? Math.round((sd.tonnes / sd.target) * 100) : 0}%</span>
            </button>
          );
        })}
      </div>

      <div className="board-main-grid">
        <div className="board-kpi-card">
          <div className="board-kpi-label">{activeShift} Shift</div>
          <div className="board-kpi-main">{shift.tonnes.toLocaleString()}<span className="kpi-unit">t</span></div>
          <div className="board-kpi-bar"><div className="board-kpi-fill" style={{ width: `${(shift.tonnes / shift.target) * 100}%`, background: shift.tonnes >= shift.target ? "var(--green)" : "var(--gold)" }} /></div>
          <div className="board-kpi-meta">Target: {shift.target.toLocaleString()}t · {Math.round((shift.tonnes / shift.target) * 100)}%</div>
        </div>
        <div className="board-kpi-card">
          <div className="board-kpi-label">Ore Tonnes</div>
          <div className="board-kpi-main">{shift.ore.toLocaleString()}<span className="kpi-unit">t</span></div>
          <div className="board-kpi-bar"><div className="board-kpi-fill" style={{ width: `${(shift.ore / shift.tonnes) * 100}%`, background: "var(--teal)" }} /></div>
          <div className="board-kpi-meta">{Math.round((shift.ore / shift.tonnes) * 100)}% ore · Waste: {shift.waste.toLocaleString()}t</div>
        </div>
        <div className="board-kpi-card">
          <div className="board-kpi-label">Grade</div>
          <div className="board-kpi-main">{shift.grade}<span className="kpi-unit">%</span></div>
          <div className="board-kpi-bar"><div className="board-kpi-fill" style={{ width: `${(shift.grade / 60) * 100}%`, background: shift.grade >= 58 ? "var(--green)" : "var(--gold)" }} /></div>
          <div className="board-kpi-meta">Target 58% · {(shift.grade / 58 * 100).toFixed(0)}% compliance</div>
        </div>
        <div className="board-kpi-card">
          <div className="board-kpi-label">Uptime</div>
          <div className="board-kpi-main">{shift.uptime}<span className="kpi-unit">%</span></div>
          <div className="board-kpi-bar"><div className="board-kpi-fill" style={{ width: `${shift.uptime}%`, background: shift.uptime >= 90 ? "var(--green)" : shift.uptime >= 85 ? "var(--gold)" : "var(--red)" }} /></div>
          <div className="board-kpi-meta">Target 92% · {shift.delays.length} delay events</div>
        </div>
      </div>

      <div className="dashboard-panels">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Plan vs Actual — Today · {mine.name}</div>
            <div className="card-subtitle">Total: {totalToday.toLocaleString()}t of {totalTarget.toLocaleString()}t ({pct}%)</div>
          </div>
          <div className="card-body">
            {data.shifts.map(s => {
              const p = Math.round((s.tonnes / s.target) * 100);
              const isOnTarget = s.tonnes >= s.target;
              return (
                <div key={s.shift} className="pva-row">
                  <div className="pva-header">
                    <span className="pva-shift">{s.shift}</span>
                    <span className="pva-actual">{s.tonnes.toLocaleString()}t</span>
                    <span className={`pva-variance ${isOnTarget ? "positive" : "negative"}`}>{isOnTarget ? "+" : ""}{(s.tonnes - s.target).toLocaleString()}t</span>
                  </div>
                  <div className="pva-bar-track">
                    <div className="pva-bar-fill" style={{ width: `${Math.min(p, 100)}%`, background: isOnTarget ? "var(--green)" : "var(--gold)" }} />
                    <div className="pva-target-line" style={{ left: `${(s.target / (s.target * 1.15)) * 100}%` }} />
                  </div>
                  <div className="pva-meta">
                    <span>Loader: {s.loader} · Trucks: {s.trucks.join(", ")}</span>
                    <span>Grade: {s.grade}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card-footer">
            <div className="ai-insight">
              <span className="ai-insight-icon">✦</span>
              <span><strong>AI Analysis — {mine.name}:</strong> {data.shifts[0].tonnes >= data.shifts[0].target ? `${activeShift} shift on target. ` : `${activeShift} shift below target. `}
              Total operation at {pct}% of plan. {data.shifts.some(s => s.delays.length > 0) ? `Key delays: ${data.shifts.flatMap(s => s.delays).slice(0, 2).map(d => `${d.desc} (${d.mins}min)`).join(", ")}.` : "No significant delays recorded."}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Equipment — {mine.name}</div>
            <div className="card-subtitle">{data.equipment.filter(e => e.status === "Operating").length} of {data.equipment.length} units operating</div>
          </div>
          <div className="card-body">
            <div className="etu-summary">
              {Object.entries(TIME_BREAKDOWN).map(([k, v]) => (
                <div key={k} className="etu-segment" style={{ flex: v }}>
                  <div className="etu-bar" style={{ background: k === "Operating" ? "var(--green)" : k === "Breakdown" ? "var(--red)" : k === "PM" ? "var(--gold)" : k === "Standby" ? "var(--teal-light)" : "var(--text-muted)" }} />
                  <div className="etu-label">{k}</div>
                  <div className="etu-value">{v}%</div>
                </div>
              ))}
            </div>
            <div className="etu-list">
              {data.equipment.map(e => (
                <div key={e.id} className="etu-item">
                  <div className="etu-item-header">
                    <span className="etu-item-id">{e.id}</span>
                    <span className="etu-item-name">{e.name}</span>
                    <span className={`badge badge-${e.status === "Operating" ? "green" : e.status === "Breakdown" ? "red" : e.status === "PM" ? "gold" : "teal"}`}>{e.status}</span>
                  </div>
                  <div className="etu-item-meta">{e.type} · {e.hours}h · Util: {e.util}% · Fuel: {e.fuel}L{e.issue && <span className="etu-issue"> · ⚠ {e.issue}</span>}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <div className="ai-insight"><span className="ai-insight-icon">✦</span><span><strong>AI Fleet — {mine.name}:</strong> {data.equipment.filter(e => e.status === "Breakdown").length > 0 ? `${data.equipment.filter(e => e.status === "Breakdown").map(e => `${e.id} (${e.issue})`).join(", ")} in breakdown. ` : "All key equipment operating. "}Utilisation average: {Math.round(data.equipment.reduce((s, e) => s + e.util, 0) / data.equipment.length)}%.</span></div>
          </div>
        </div>
      </div>

      {showDelays && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div className="card-title">Delay & Event Analysis — {mine.name}</div>
            <div className="card-subtitle">Pareto ranking by total minutes lost</div>
          </div>
          <div className="card-body">
            <div className="delay-pareto">
              {data.delays.sort((a, b) => b.totalMins - a.totalMins).map((d, i) => (
                <div key={d.code} className="delay-row">
                  <span className="delay-rank">#{i + 1}</span>
                  <div className="delay-info">
                    <span className="delay-code">{d.code}</span>
                    <span className="delay-desc">{d.desc}</span>
                  </div>
                  <div className="delay-stats">
                    <span className={`delay-trend ${d.trend}`}>{d.trend === "up" ? "▲" : d.trend === "down" ? "▼" : "—"}</span>
                    <span className="delay-mins">{d.totalMins} min</span>
                    <span className="delay-freq">{d.freq}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <div className="ai-insight">
              <span className="ai-insight-icon">✦</span>
              <span><strong>AI Delay Analysis — {mine.name}:</strong> {data.delays.length > 0 ? `Top delay: ${data.delays[0].desc} (${data.delays[0].totalMins} min). ${data.delays.filter(d => d.trend === "up").length > 0 ? `${data.delays.filter(d => d.trend === "up").length} delay type(s) trending up — review maintenance schedule.` : "No worsening delay trends identified."}` : "No delays recorded for this period."}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
