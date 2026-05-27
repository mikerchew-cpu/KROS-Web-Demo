import { useState } from "react";

const TRUCKS = [
  { id: "HT-01", dest: "Crusher", payload: 42.5, status: "enroute", loc: { x: 35, y: 45 }, eta: "3 min", trips: 8 },
  { id: "HT-02", dest: "West Pit", payload: 0, status: "returning", loc: { x: 20, y: 30 }, eta: "5 min", trips: 7 },
  { id: "HT-03", dest: "Stockpile", payload: 41.2, status: "loading", loc: { x: 50, y: 55 }, eta: "—", trips: 6 },
  { id: "HT-04", dest: "—", payload: 0, status: "down", loc: { x: 15, y: 20 }, eta: "45 min", trips: 3, issue: "Brake repair" },
  { id: "HT-05", dest: "Crusher", payload: 43.8, status: "enroute", loc: { x: 40, y: 38 }, eta: "2 min", trips: 9 },
];

const TICKETS = [
  { id: "WB-2026-1842", truck: "HT-01", gross: 58.2, tare: 15.7, net: 42.5, material: "Iron Ore", grade: "58.2%", time: "08:42", dest: "Crusher" },
  { id: "WB-2026-1841", truck: "HT-05", gross: 59.5, tare: 15.7, net: 43.8, material: "Iron Ore", grade: "57.9%", time: "08:38", dest: "Crusher" },
  { id: "WB-2026-1840", truck: "HT-03", gross: 56.9, tare: 15.7, net: 41.2, material: "Low Grade", grade: "52.1%", time: "08:35", dest: "Stockpile" },
  { id: "WB-2026-1839", truck: "HT-02", gross: 0, tare: 15.7, net: 0, material: "—", grade: "—", time: "08:30", dest: "Returning empty" },
];

const EQUIP_POSITIONS = [
  { id: "EX-01", name: "Excavator #1", x: 52, y: 53, status: "Operating", type: "excavator" },
  { id: "EX-02", name: "Excavator #2", x: 22, y: 28, status: "Breakdown", type: "excavator" },
  { id: "DZ-01", name: "Dozer #1", x: 30, y: 35, status: "Standby", type: "dozer" },
  { id: "GR-01", name: "Grader", x: 38, y: 25, status: "Operating", type: "grader" },
];

export default function Weightbridge() {
  const [tab, setTab] = useState("tickets");

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Fleet & Weightbridge</div><div className="page-subtitle">Live fleet tracking, weighbridge tickets, and dispatch optimisation with AI</div></div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === "tickets" ? "active" : ""}`} onClick={() => setTab("tickets")}>Weightbridge</button>
        <button className={`tab ${tab === "fleet" ? "active" : ""}`} onClick={() => setTab("fleet")}>Fleet Map</button>
        <button className={`tab ${tab === "dispatch" ? "active" : ""}`} onClick={() => setTab("dispatch")}>Dispatch Optimisation</button>
      </div>

      {tab === "tickets" && (
        <>
          <div className="board-main-grid" style={{ marginBottom: 20 }}>
            <div className="board-kpi-card"><div className="board-kpi-label">Today's Tonnes</div><div className="board-kpi-main">3,245<span className="kpi-unit">t</span></div><div className="board-kpi-meta">82 loads · Avg 39.6t/load</div></div>
            <div className="board-kpi-card"><div className="board-kpi-label">Trucks Active</div><div className="board-kpi-main">{TRUCKS.filter(t => t.status !== "down").length}<span className="kpi-unit">/5</span></div><div className="board-kpi-meta">1 down · 4 operating</div></div>
            <div className="board-kpi-card"><div className="board-kpi-label">Avg Cycle Time</div><div className="board-kpi-main">18.5<span className="kpi-unit">min</span></div><div className="board-kpi-meta">Load 3.2 · Haul 8.1 · Dump 2.5 · Return 4.7</div></div>
            <div className="board-kpi-card"><div className="board-kpi-label">Payload Utilisation</div><div className="board-kpi-main">92.3<span className="kpi-unit">%</span></div><div className="board-kpi-meta">Target 95% · Overloads: 2</div></div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Recent Weighbridge Tickets</div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Ticket</th><th>Truck</th><th>Gross</th><th>Tare</th><th>Net (t)</th><th>Material</th><th>Grade</th><th>Dest</th><th>Time</th></tr></thead>
                <tbody>
                  {TICKETS.map(t => (
                    <tr key={t.id}>
                      <td className="cell-mono">{t.id}</td>
                      <td className="cell-bold">{t.truck}</td>
                      <td>{t.gross || "—"}t</td>
                      <td>{t.tare}t</td>
                      <td className="cell-bold">{t.net || "—"}t</td>
                      <td>{t.material}</td>
                      <td>{t.grade}</td>
                      <td>{t.dest}</td>
                      <td className="cell-mono">{t.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "fleet" && (
        <>
          <div className="dashboard-panels" style={{ marginBottom: 20 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">Live Fleet Map</div><div className="card-subtitle">Kros Hill — equipment positions</div></div>
              <div className="fleet-map">
                {EQUIP_POSITIONS.map(e => (
                  <div key={e.id} className="fleet-marker" style={{ left: `${e.x}%`, top: `${e.y}%` }}>
                    <div className={`fleet-icon ${e.status === "Operating" ? "op" : e.status === "Breakdown" ? "down" : "stdby"}`}>
                      {e.type === "excavator" ? "⬡" : e.type === "dozer" ? "⟳" : "⬢"}
                    </div>
                    <div className="fleet-label">{e.id}</div>
                  </div>
                ))}
                {TRUCKS.map(t => (
                  <div key={t.id} className="fleet-marker" style={{ left: `${t.loc.x}%`, top: `${t.loc.y}%` }}>
                    <div className={`fleet-icon ${t.status === "down" ? "down" : t.status === "enroute" ? "op" : "stdby"} truck`}>
                      {t.status === "down" ? "✕" : "◈"}
                    </div>
                    <div className="fleet-label">{t.id}</div>
                    <div className="fleet-eta">{t.eta}</div>
                  </div>
                ))}
                <div className="fleet-legend">
                  <span><span className="fleet-legend-dot op" /> Operating</span>
                  <span><span className="fleet-legend-dot stdby" /> Standby</span>
                  <span><span className="fleet-legend-dot down" /> Breakdown</span>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Equipment Status</div></div>
              <div className="card-body">
                {[...EQUIP_POSITIONS, ...TRUCKS.map(t => ({ id: t.id, name: t.id, status: t.status, type: "truck" }))].map(e => (
                  <div key={e.id} className="etu-item">
                    <div className="etu-item-header">
                      <span className="etu-item-id">{e.id}</span>
                      <span className="etu-item-name">{e.name}</span>
                      <span className={`badge badge-${e.status === "Operating" || e.status === "enroute" || e.status === "loading" ? "green" : e.status === "Breakdown" || e.status === "down" ? "red" : e.status === "returning" ? "gold" : "teal"}`}>{e.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card-footer">
                <div className="ai-insight"><span className="ai-insight-icon">✦</span><span><strong>AI Fleet Analysis:</strong> HT-04 brake repair ETA 45 min — redistribute loads to HT-01 and HT-05. EX-02 hydraulic leak — reroute trucks to EX-01. Estimated throughput impact: 120t/hr vs target 140t/hr.</span></div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "dispatch" && (
        <div className="dashboard-panels">
          <div className="card">
            <div className="card-header"><div className="card-title">Dispatch Optimisation</div><div className="card-subtitle">AI-recommended truck assignments to minimise cycle time</div></div>
            <div className="card-body">
              <div className="dispatch-scenario">
                <div className="dispatch-header">Current Assignment</div>
                <div className="dispatch-table">
                  {[
                    { loader: "EX-01", trucks: "HT-01, HT-03", tph: 82, queue: "3 min", efficiency: 87 },
                    { loader: "EX-02", trucks: "— (breakdown)", tph: 0, queue: "—", efficiency: 0 },
                  ].map((d, i) => (
                    <div key={i} className="dispatch-row">
                      <span className="dispatch-loader">{d.loader}</span>
                      <span className="dispatch-trucks">{d.trucks}</span>
                      <span className="dispatch-tph">{d.tph}tph</span>
                      <span className="dispatch-queue">Q: {d.queue}</span>
                      <span className="dispatch-eff">{d.efficiency}%</span>
                    </div>
                  ))}
                </div>
                <div className="dispatch-header" style={{ marginTop: 16 }}>AI Recommended</div>
                <div className="dispatch-table">
                  {[
                    { loader: "EX-01 (op)", trucks: "HT-01, HT-02, HT-05", tph: 128, queue: "1 min", efficiency: 94 },
                    { loader: "EX-02 (down)", trucks: "HT-03 to stockpile (LG)", tph: 38, queue: "0 min", efficiency: 85 },
                  ].map((d, i) => (
                    <div key={i} className={`dispatch-row recommended`}>
                      <span className="dispatch-loader">{d.loader}</span>
                      <span className="dispatch-trucks">{d.trucks}</span>
                      <span className="dispatch-tph">{d.tph}tph</span>
                      <span className="dispatch-queue">Q: {d.queue}</span>
                      <span className="dispatch-eff">{d.efficiency}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card-footer">
              <div className="ai-insight"><span className="ai-insight-icon">✦</span><span><strong>AI Optimisation:</strong> Reassign HT-03 from crusher to stockpile (low-grade feed). Move HT-02 from standby to EX-01. Estimated +46 tph (+56%) throughput improvement. Payload balance within 5% target.</span></div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Cycle Time Analysis</div></div>
            <div className="card-body">
              {["HT-01", "HT-02", "HT-03", "HT-04", "HT-05"].map(id => {
                const avg = 16 + Math.random() * 8;
                return (
                  <div key={id} className="cycle-row">
                    <span className="cycle-truck">{id}</span>
                    <div className="cycle-bar-track">
                      <div className="cycle-bar-seg" style={{ width: "18%", background: "var(--teal)" }} title="Load" />
                      <div className="cycle-bar-seg" style={{ width: "42%", background: "var(--gold)" }} title="Haul" />
                      <div className="cycle-bar-seg" style={{ width: "14%", background: "var(--purple)" }} title="Dump" />
                      <div className="cycle-bar-seg" style={{ width: "26%", background: "var(--teal-light)" }} title="Return" />
                    </div>
                    <span className="cycle-total">{Math.round(avg)} min</span>
                  </div>
                );
              })}
              <div className="cycle-legend">
                <span><span className="cycle-legend-dot" style={{ background: "var(--teal)" }} /> Load</span>
                <span><span className="cycle-legend-dot" style={{ background: "var(--gold)" }} /> Haul</span>
                <span><span className="cycle-legend-dot" style={{ background: "var(--purple)" }} /> Dump</span>
                <span><span className="cycle-legend-dot" style={{ background: "var(--teal-light)" }} /> Return</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
