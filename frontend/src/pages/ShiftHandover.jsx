import { useState } from "react";

const SECTIONS = [
  { id: "production", label: "Production Status" },
  { id: "equipment", label: "Equipment Status" },
  { id: "safety", label: "Safety & Compliance" },
  { id: "people", label: "People" },
  { id: "actions", label: "Outstanding Actions" },
];

const SHIFT_HISTORY = [
  { date: "2026-05-27", outgoing: "Raj N.", incoming: "Amirul H.", sections: 6, signoffs: 2, issues: 1, status: "completed" },
  { date: "2026-05-26", outgoing: "Siti A.", incoming: "Raj N.", sections: 6, signoffs: 2, issues: 0, status: "completed" },
  { date: "2026-05-25", outgoing: "Amirul H.", incoming: "Siti A.", sections: 5, signoffs: 1, issues: 2, status: "completed" },
  { date: "2026-05-24", outgoing: "Raj N.", incoming: "Amirul H.", sections: 6, signoffs: 2, issues: 0, status: "completed" },
];

export default function ShiftHandover() {
  const [step, setStep] = useState(0);
  const [signed, setSigned] = useState(false);
  const [outgoing, setOutgoing] = useState("");
  const [incoming, setIncoming] = useState("");
  const [checks, setChecks] = useState({});

  const toggleCheck = (section, item) => {
    const key = `${section}-${item}`;
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const currentSec = SECTIONS[step];
  const checkedCount = Object.values(checks).filter(Boolean).length;

  const sectionItems = {
    production: [
      "Actual tonnes vs plan recorded",
      "Carry-forward tasks documented",
      "Current mining faces / areas noted",
      "Grade control deviations reported",
      "Stockpile movements logged",
    ],
    equipment: [
      "Equipment available for next shift confirmed",
      "Equipment under maintenance listed with ETR",
      "Defect reports raised this shift logged",
      "Fuel levels adequate for next shift",
      "Tyres / tracks visually inspected",
    ],
    safety: [
      "All active PTWs listed with expiry times",
      "Active isolations / LOTO confirmed",
      "Near-misses reported this shift",
      "Ground conditions assessed",
      "Emergency equipment checked",
    ],
    people: [
      "Headcount on site recorded",
      "Any injuries or welfare concerns noted",
      "Contractor activities documented",
      "Visitor / VIP log updated",
      "Training / assessment conducted",
    ],
    actions: [
      "Previous shift actions completed or carried forward",
      "Urgent actions for incoming shift highlighted",
      "High-priority work orders communicated",
      "Environmental / compliance items flagged",
      "Management instructions relayed",
    ],
  };

  const completeHandover = () => {
    if (!outgoing || !incoming) return;
    setSigned(true);
  };

  if (signed) {
    return (
      <div className="page">
        <div className="page-header">
          <div><div className="page-title">Shift Handover</div><div className="page-subtitle">Handover completed successfully</div></div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <div className="card-title" style={{ fontSize: 20 }}>Handover Signed</div>
          <div style={{ color: "var(--text-secondary)", margin: "12px 0 24px" }}>
            {outgoing} → {incoming}<br />
            {new Date().toLocaleString("en-MY")}<br />
            {checkedCount} of 25 checklist items completed
          </div>
          <button className="btn btn-primary" onClick={() => { setSigned(false); setStep(0); setChecks({}); setOutgoing(""); setIncoming(""); }}>
            New Handover
          </button>
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header"><div className="card-title">AI Handover Summary</div></div>
          <div className="card-body">
            <div className="ai-insight" style={{ marginBottom: 8 }}><span className="ai-insight-icon">✦</span><span><strong>Pending:</strong> Crusher #3 bearing temp elevated — incoming shift to inspect within first hour. Conveyor belt #2 splice repair still open — parts arrived, schedule for AM shift.</span></div>
            <div className="ai-insight"><span className="ai-insight-icon">✦</span><span><strong>Recommendation:</strong> Ensure PTW for crusher inspection is raised before departing. Afternoon shift had 2 near-misses — include in toolbox talk.</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Shift Handover</div>
          <div className="page-subtitle">Digital handover form — complete all {SECTIONS.length} sections and sign off</div>
        </div>
        <div className="handover-progress">
          <span>Step {step + 1} of {SECTIONS.length}</span>
          <div className="handover-progress-bar">
            <div className="handover-progress-fill" style={{ width: `${((step + 1) / SECTIONS.length) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="handover-layout">
        <div className="handover-steps">
          {SECTIONS.map((s, i) => (
            <div key={s.id} className={`handover-step ${i === step ? "active" : i < step ? "done" : ""}`} onClick={() => setStep(i)}>
              <span className="handover-step-num">{i < step ? "✓" : i + 1}</span>
              <span className="handover-step-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="handover-content">
          <div className="card">
            <div className="card-header">
              <div className="card-title">{currentSec?.label}</div>
              <div className="card-subtitle">Check all items that apply</div>
            </div>
            <div className="card-body">
              {sectionItems[currentSec?.id]?.map((item, i) => {
                const key = `${currentSec.id}-${i}`;
                return (
                  <div key={key} className={`handover-check-item ${checks[key] ? "checked" : ""}`} onClick={() => toggleCheck(currentSec.id, i)}>
                    <span className={`handover-checkbox ${checks[key] ? "checked" : ""}`}>{checks[key] ? "✓" : ""}</span>
                    <span className="handover-check-label">{item}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {step === SECTIONS.length - 1 && (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-header"><div className="card-title">Sign Off</div></div>
              <div className="card-body">
                <div className="handover-signoff">
                  <div className="form-group"><label className="form-label">Outgoing Supervisor</label>
                    <select className="form-select" value={outgoing} onChange={e => setOutgoing(e.target.value)}>
                      <option value="">— Select —</option>
                      <option value="Raj Namasivayam">Raj Namasivayam</option>
                      <option value="Siti Aminah">Siti Aminah</option>
                      <option value="Amirul Haziq">Amirul Haziq</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Incoming Supervisor</label>
                    <select className="form-select" value={incoming} onChange={e => setIncoming(e.target.value)}>
                      <option value="">— Select —</option>
                      <option value="Raj Namasivayam">Raj Namasivayam</option>
                      <option value="Siti Aminah">Siti Aminah</option>
                      <option value="Amirul Haziq">Amirul Haziq</option>
                    </select>
                  </div>
                </div>
                <div className="ai-insight" style={{ marginTop: 12 }}>
                  <span className="ai-insight-icon">✦</span>
                  <span><strong>AI Check:</strong> {checkedCount} of 25 items checked. {25 - checkedCount > 0 ? `${25 - checkedCount} items unchecked — ensure all applicable items are verified before signing.` : "All items verified. Ready for sign-off."}</span>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 12, width: "100%", justifyContent: "center" }} onClick={completeHandover} disabled={!outgoing || !incoming}>
                  ✓ Complete & Sign Handover
                </button>
              </div>
            </div>
          )}

          <div className="handover-nav">
            <button className="btn btn-ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Previous</button>
            <button className="btn btn-primary" onClick={() => setStep(Math.min(SECTIONS.length - 1, step + 1))} disabled={step >= SECTIONS.length - 1}>
              Next →
            </button>
          </div>
        </div>
      </div>

      {SHIFT_HISTORY.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header"><div className="card-title">Recent Handover History</div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Outgoing</th><th>Incoming</th><th>Sections</th><th>Issues</th><th>Status</th></tr></thead>
              <tbody>
                {SHIFT_HISTORY.map((h, i) => (
                  <tr key={i}>
                    <td className="cell-mono">{h.date}</td>
                    <td>{h.outgoing}</td>
                    <td>{h.incoming}</td>
                    <td>{h.sections}/6</td>
                    <td>{h.issues > 0 ? <span className="badge badge-red">{h.issues} open</span> : <span className="badge badge-green">None</span>}</td>
                    <td><span className="badge badge-green">Completed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
