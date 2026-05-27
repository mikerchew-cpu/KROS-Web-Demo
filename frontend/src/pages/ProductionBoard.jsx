import { useState } from "react";

const SHIFTS = ["Morning", "Afternoon", "Night"];
const SHIFT_TARGETS = { Morning: 6200, Afternoon: 5900, Night: 5600 };

const SHIFT_DATA = [
  { shift: "Morning", tonnes: 6350, ore: 5020, waste: 1330, grade: 58.3, uptime: 94, delays: [{ code: "ME-01", desc: "Crusher jam", mins: 28 }], loader: "EX-01", trucks: ["HT-01","HT-02","HT-03"], target: 6200 },
  { shift: "Afternoon", tonnes: 5710, ore: 4480, waste: 1230, grade: 57.6, uptime: 87, delays: [{ code: "ME-02", desc: "Conveyor splice", mins: 45 }, { code: "OP-03", desc: "Shift change", mins: 15 }], loader: "EX-02", trucks: ["HT-01","HT-04","HT-05"], target: 5900 },
  { shift: "Night", tonnes: 5430, ore: 4150, waste: 1280, grade: 57.9, uptime: 91, delays: [{ code: "PM-01", desc: "Planned lube", mins: 35 }], loader: "EX-01", trucks: ["HT-02","HT-03","HT-05"], target: 5600 },
];

const EQUIPMENT = [
  { id: "EX-01", name: "Excavator #1", type: "Excavator", status: "Operating", hours: 10.5, util: 87, fuel: 185 },
  { id: "EX-02", name: "Excavator #2", type: "Excavator", status: "Breakdown", hours: 6.2, util: 52, fuel: 110, issue: "Hydraulic leak" },
  { id: "HT-01", name: "Haul Truck #1", type: "Haul Truck", status: "Operating", hours: 10.8, util: 91, fuel: 320 },
  { id: "HT-02", name: "Haul Truck #2", type: "Haul Truck", status: "Operating", hours: 10.2, util: 85, fuel: 305 },
  { id: "HT-03", name: "Haul Truck #3", type: "Haul Truck", status: "Idle", hours: 7.5, util: 62, fuel: 210 },
  { id: "HT-04", name: "Haul Truck #4", type: "Haul Truck", status: "PM", hours: 0, util: 0, fuel: 0, issue: "Scheduled service" },
  { id: "HT-05", name: "Haul Truck #5", type: "Haul Truck", status: "Operating", hours: 9.8, util: 82, fuel: 290 },
  { id: "DZ-01", name: "Dozer #1", type: "Dozer", status: "Standby", hours: 4.2, util: 35, fuel: 95 },
];

const DELAY_CODES = [
  { code: "ME-01", desc: "Mechanical - Crusher", freq: 3, totalMins: 85, trend: "up" },
  { code: "ME-02", desc: "Mechanical - Conveyor", freq: 2, totalMins: 70, trend: "up" },
  { code: "OP-01", desc: "Operational - No loader", freq: 4, totalMins: 55, trend: "down" },
  { code: "OP-02", desc: "Operational - Haul road", freq: 2, totalMins: 30, trend: "stable" },
  { code: "OP-03", desc: "Operational - Shift change", freq: 3, totalMins: 45, trend: "stable" },
  { code: "PM-01", desc: "Planned - Lubrication", freq: 2, totalMins: 70, trend: "down" },
  { code: "PM-02", desc: "Planned - Inspection", freq: 1, totalMins: 30, trend: "stable" },
  { code: "WE-01", desc: "Weather - Rain", freq: 1, totalMins: 60, trend: "down" },
];

const TIME_BREAKDOWN = {
  Operating: 62,
  Standby: 8,
  Idle: 5,
  Breakdown: 10,
  PM: 8,
  Travel: 4,
  Other: 3,
};

export default function ProductionBoard() {
  const [activeShift, setActiveShift] = useState("Morning");
  const [showDelays, setShowDelays] = useState(false);
  const shift = SHIFT_DATA.find(s => s.shift === activeShift) || SHIFT_DATA[0];
  const totalToday = SHIFT_DATA.reduce((s, x) => s + x.tonnes, 0);
  const totalTarget = SHIFT_DATA.reduce((s, x) => s + x.target, 0);
  const pct = Math.round((totalToday / totalTarget) * 100);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Production Board</div>
          <div className="page-subtitle">Real-time shift tracking, plan vs actual, equipment utilisation — Kros Hill</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowDelays(!showDelays)}>{showDelays ? "Hide" : "Show"} Delay Analysis</button>
        </div>
      </div>

      <div className="board-shift-selector">
        {SHIFTS.map(s => (
          <button key={s} className={`board-shift-btn ${activeShift === s ? "active" : ""} ${SHIFT_DATA.find(x => x.shift === s && x.tonnes >= x.target) ? "on-target" : "below-target"}`}
            onClick={() => setActiveShift(s)}>
            <span className="board-shift-name">{s}</span>
            <span className="board-shift-tonnes">{SHIFT_DATA.find(x => x.shift === s)?.tonnes?.toLocaleString()}t</span>
            <span className="board-shift-pct">{Math.round((SHIFT_DATA.find(x => x.shift === s)?.tonnes || 0) / (SHIFT_DATA.find(x => x.shift === s)?.target || 1) * 100)}%</span>
          </button>
        ))}
      </div>

      <div className="board-main-grid">
        <div className="board-kpi-card">
          <div className="board-kpi-label">Current Shift</div>
          <div className="board-kpi-main">{shift.tonnes.toLocaleString()}<span className="kpi-unit">t</span></div>
          <div className="board-kpi-bar">
            <div className="board-kpi-fill" style={{ width: `${(shift.tonnes / shift.target) * 100}%`, background: shift.tonnes >= shift.target ? "var(--green)" : "var(--gold)" }} />
          </div>
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
            <div className="card-title">Plan vs Actual — Today</div>
            <div className="card-subtitle">Total: {totalToday.toLocaleString()}t of {totalTarget.toLocaleString()}t ({pct}%)</div>
          </div>
          <div className="card-body">
            {SHIFT_DATA.map(s => {
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
              <span><strong>AI Analysis:</strong> Morning shift exceeded target by 2.4%. Afternoon shift lost ~45 min to conveyor splice — if recovered, would have hit 5,900t target. Night shift on track at 97%. Recommendation: pre-cool conveyor bearings before afternoon shift.</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Equipment Time Usage</div>
            <div className="card-subtitle">Current shift — {EQUIPMENT.filter(e => e.status === "Operating").length} of {EQUIPMENT.length} units operating</div>
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
              {EQUIPMENT.map(e => (
                <div key={e.id} className="etu-item">
                  <div className="etu-item-header">
                    <span className="etu-item-id">{e.id}</span>
                    <span className="etu-item-name">{e.name}</span>
                    <span className={`badge badge-${e.status === "Operating" ? "green" : e.status === "Breakdown" ? "red" : e.status === "PM" ? "gold" : "teal"}`}>{e.status}</span>
                  </div>
                  <div className="etu-item-meta">{e.type} · {e.hours}h today · Util: {e.util}% · Fuel: {e.fuel}L{e.issue && <span className="etu-issue"> · ⚠ {e.issue}</span>}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <div className="ai-insight">
              <span className="ai-insight-icon">✦</span>
              <span><strong>AI Recommendation:</strong> EX-02 (Excavator #2) hydraulic leak — estimated 4h repair. Reassign haul trucks HT-03 and HT-05 to EX-01. DZ-01 standby since 06:00 — consider deploying to haul road maintenance.</span>
            </div>
          </div>
        </div>
      </div>

      {showDelays && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div className="card-title">Delay & Event Analysis</div>
            <div className="card-subtitle">7-day rolling — Pareto ranking by total minutes lost</div>
          </div>
          <div className="card-body">
            <div className="delay-pareto">
              {DELAY_CODES.sort((a, b) => b.totalMins - a.totalMins).map((d, i) => (
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
              <span><strong>AI Analysis:</strong> Top 3 delays (Crusher, Conveyor, No Loader) account for 58% of all lost time. Crusher jam frequency increasing — review mantle profile. Conveyor splice repairs trending up — schedule belt replacement within 2 weeks.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
