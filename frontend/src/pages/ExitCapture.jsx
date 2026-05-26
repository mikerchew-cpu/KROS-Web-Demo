import { useState } from "react";

const SESSIONS = [
  { id: 1, name: "Kerani Kewangan (Rosniza bt Hamid)", role: "Finance Clerk",    dept: "Finance",    date: "2025-04-28", status: "completed", skills: ["fin_budget","fin_procurement"],     score: 92 },
  { id: 2, name: "Juruteknik Jentera (Hafiz bin Said)", role: "Maint. Tech",     dept: "Maintenance", date: "2025-04-15", status: "completed", skills: ["maint_pm","maint_breakdown"],       score: 87 },
  { id: 3, name: "Pegawai Alam Sekitar (Lim Jia Yi)",  role: "Env. Officer",    dept: "Environment", date: "2025-05-08", status: "pending",   skills: ["env_report"],                       score: null },
];

const EXIT_QUESTIONS = [
  "Walk me through a typical week in your role — what do you actually do that isn't in any document?",
  "What are the top 5 things that would go wrong if you disappeared today?",
  "What are the workarounds or shortcuts you use that aren't in the official SOP?",
  "Who are the critical external contacts and what do you know about them that I need to know?",
  "What decisions are currently pending that need to be handed over?",
  "What was the hardest problem you solved here — how did you solve it?",
  "What would you tell your replacement on Day 1 that they absolutely must know?",
  "Which KROS skill files are wrong, incomplete, or outdated — in your opinion?",
];

export default function ExitCapture() {
  const [activeSession, setActiveSession] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [answer, setAnswer] = useState("");
  const [showNew, setShowNew] = useState(false);

  const handleNext = () => {
    if (answer.trim()) {
      setAnswers(prev => ({ ...prev, [currentQ]: answer }));
      setAnswer("");
      if (currentQ < EXIT_QUESTIONS.length - 1) {
        setCurrentQ(prev => prev + 1);
      }
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Exit Knowledge Capture</div>
          <div className="page-subtitle">AI-facilitated knowledge extraction — nothing leaves with the staff member</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>+ New Session</button>
      </div>

      <div className="alert alert-ai" style={{ marginBottom: 24 }}>
        <span>✦</span>
        <div style={{ fontSize: 12 }}>
          <strong>How it works:</strong> Claude conducts a structured exit interview using the hrm_exit.md protocol.
          Session answers are auto-analysed and draft SKILL.md updates are generated within 24 hours for owner approval.
        </div>
      </div>

      <div className="grid-2">
        {/* Sessions list */}
        <div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 12, letterSpacing: 1 }}>RECENT SESSIONS</div>

          {SESSIONS.map(s => (
            <div
              key={s.id}
              className="card"
              style={{ marginBottom: 10, cursor: "pointer", borderColor: activeSession?.id === s.id ? "var(--gold)" : undefined }}
              onClick={() => setActiveSession(s)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13, marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{s.role} · {s.dept}</div>
                </div>
                <span className={`badge badge-${s.status === "completed" ? "green" : "gold"}`}>
                  {s.status}
                </span>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {s.skills.map(sk => (
                  <span key={sk} className="skill-ref">{sk}.md</span>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.date}</span>
                {s.score && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="progress-bar" style={{ width: 80 }}>
                      <div className="progress-fill" style={{ width: `${s.score}%`, background: s.score > 85 ? "var(--green-light)" : "var(--gold)" }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{s.score}% captured</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Session detail / Active interview */}
        <div>
          {showNew ? (
            <div className="card">
              <div className="card-header">
                <div className="card-title">✦ AI-Facilitated Exit Interview</div>
                <button className="btn btn-ghost btn-sm" onClick={() => { setShowNew(false); setCurrentQ(0); setAnswers({}); setAnswer(""); }}>×</button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    Question {currentQ + 1} of {EXIT_QUESTIONS.length}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {Object.keys(answers).length} answered
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(Object.keys(answers).length / EXIT_QUESTIONS.length) * 100}%`, background: "linear-gradient(90deg, var(--purple), var(--teal))" }} />
                </div>
              </div>

              <div style={{ background: "var(--purple-dark)", border: "1px solid rgba(107,63,160,0.3)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "var(--purple-light)", fontFamily: "var(--font-mono)", marginBottom: 6 }}>✦ CLAUDE ASKS</div>
                <div style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>{EXIT_QUESTIONS[currentQ]}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Answer (be as specific as possible)</label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  placeholder="Type your answer here — the more detail you provide, the better the SKILL.md update will be…"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))} disabled={currentQ === 0}>← Previous</button>
                <button className="btn btn-purple" style={{ flex: 1, justifyContent: "center" }} onClick={handleNext} disabled={!answer.trim()}>
                  {currentQ < EXIT_QUESTIONS.length - 1 ? "Next Question →" : "Complete & Generate Updates"}
                </button>
              </div>

              {Object.keys(answers).length > 0 && (
                <div style={{ marginTop: 16, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8, fontSize: 11, color: "var(--text-muted)" }}>
                  <span style={{ color: "var(--purple-light)" }}>✦ Claude will analyse {Object.keys(answers).length} answer{Object.keys(answers).length > 1 ? "s" : ""} and draft SKILL.md updates within 24 hours.</span>
                </div>
              )}
            </div>
          ) : activeSession ? (
            <div className="card">
              <div className="card-header">
                <div className="card-title">{activeSession.name}</div>
                <span className={`badge badge-${activeSession.status === "completed" ? "green" : "gold"}`}>{activeSession.status}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {[
                  { label: "Role",             value: activeSession.role },
                  { label: "Department",       value: activeSession.dept },
                  { label: "Session Date",     value: activeSession.date },
                  { label: "Knowledge Score",  value: activeSession.score ? `${activeSession.score}% captured` : "In progress" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 10 }}>{label}</span>
                    <span style={{ color: "var(--text-secondary)" }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6 }}>SKILLS UPDATED</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {activeSession.skills.map(sk => <span key={sk} className="skill-ref">{sk}.md</span>)}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-purple btn-sm">✦ View AI-Generated Updates</button>
                <button className="btn btn-ghost btn-sm">Download Report</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)", gap: 12 }}>
              <span style={{ fontSize: 40 }}>◳</span>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Select a session or start a new one</div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>+ Start Exit Interview</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
