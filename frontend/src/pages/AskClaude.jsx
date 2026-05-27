import { useState, useRef, useEffect } from "react";
import { useKROS, routeAI } from "../context/KROSContext";

const SUGGESTED = [
  { q: "How do I raise a Permit-to-Work for electrical isolation?",        sensitivity: "low",    skill: "hse_ptw" },
  { q: "What is the EPF contribution rate for employees over 60?",          sensitivity: "high",   skill: "fin_royalty" },
  { q: "The crusher tripped on high amps — what do I check first?",         sensitivity: "low",    skill: "maint_breakdown" },
  { q: "Walk me through the shift handover checklist",                      sensitivity: "low",    skill: "ops_shift_handover" },
  { q: "What are the DOE effluent discharge limits for our site?",          sensitivity: "medium", skill: "env_report" },
  { q: "Who is the deputy for the HSE Manager if she's on leave?",          sensitivity: "high",   skill: "hrm_succession" },
];

function detectSensitivity(text) {
  const t = text.toLowerCase();
  const high = ["salary", "payroll", "epf", "socso", "employee", "staff", "resign", "succession", "deputy", "royalty", "budget", "cost", "financial", "profit", "revenue", "confidential", "personnel"];
  const medium = ["permit", "ptw", "hazop", "incident", "environment", "doe", "dosh", "regulatory", "compliance", "audit"];
  if (high.some(w => t.includes(w))) return "high";
  if (medium.some(w => t.includes(w))) return "medium";
  return "low";
}

function detectSkill(text) {
  const t = text.toLowerCase();
  if (t.includes("permit") || t.includes("ptw") || t.includes("loto") || t.includes("isolation")) return "hse_ptw";
  if (t.includes("emergency") || t.includes("fire") || t.includes("evacu")) return "hse_emergency";
  if (t.includes("hazop") || t.includes("risk register") || t.includes("hazard")) return "hse_hazop";
  if (t.includes("crusher") || t.includes("breakdown") || t.includes("tripped") || t.includes("fault")) return "maint_breakdown";
  if (t.includes("maintenance") || t.includes("service") || t.includes("pm ")) return "maint_pm";
  if (t.includes("shift") || t.includes("handover")) return "ops_shift_handover";
  if (t.includes("blast") || t.includes("drill") || t.includes("haul") || t.includes("sop")) return "ops_sop";
  if (t.includes("epf") || t.includes("socso") || t.includes("hrdf") || t.includes("pcb") || t.includes("payroll") || t.includes("salary")) return "hrm_payroll";
  if (t.includes("resign") || t.includes("leaving") || t.includes("exit")) return "hrm_exit";
  if (t.includes("succession") || t.includes("deputy") || t.includes("backup")) return "hrm_succession";
  if (t.includes("onboard") || t.includes("new hire") || t.includes("join")) return "hrm_onboard";
  if (t.includes("royalty") || t.includes("statutory") || t.includes("tax")) return "fin_royalty";
  if (t.includes("budget") || t.includes("cost code") || t.includes("variance")) return "fin_budget";
  if (t.includes("effluent") || t.includes("doe") || t.includes("tailings") || t.includes("environment")) return "env_report";
  return null;
}

// Simulate AI response based on skill context
function buildResponse(question, skill, engine) {
  const engineLabel = engine === "claude" ? "✦ Claude" : "◈ DeepSeek";
  const responses = {
    hse_ptw: `**Permit-to-Work for Electrical Isolation** — from \`hse_ptw.md\`\n\nYou need a **Red PTW (Energy Isolation / LOTO)**. Here's the step-by-step:\n\n**Step 1 — Task Risk Assessment**\nComplete JHA (Form HSE-J01) before applying. Identify all energy isolation points.\n\n**Step 2 — Apply for Permit**\nComplete Form HSE-P01 (Red PTW). Include: scope of work, all workers by name, tools, and validity period (max 12 hours).\n\n**Step 3 — LOTO Procedure**\n1. Identify all isolation points — refer to LOTO diagram in KROS under \`maintenance/loto-diagrams/[equipment-id]\`\n2. De-energise in correct sequence\n3. Each worker applies their **own personal lock**\n4. Tag with name, date, time, work order\n5. **Test isolation** — attempt to start (confirm it does NOT start)\n6. Release stored energy — bleed hydraulics, test for zero voltage\n\n**Step 4 — Authorisation**\nFor LOTO/electrical: requires **HSE Officer + Electrical Supervisor** sign-off. Authoriser must physically visit the worksite.\n\n**Zero Tolerance:** Never remove another person's lock. Never sign without a site visit.\n\n📎 Source: \`hse_ptw.md\` — Section 3, LOTO Procedure`,

    maint_breakdown: `**Crusher Tripped on High Amps — Diagnostic Steps** — from \`maint_breakdown.md\`\n\nThis is likely a **P1 or P2 event**. Follow this sequence:\n\n**Immediate (Mine Control):**\n- Log call in CMMS with time, equipment ID, fault description\n- Contact Maintenance Supervisor — P1 response target: on-site within **30 minutes**\n\n**On-Site Checks (Technician):**\n1. **Feed rate** — Check if above rated tonnes/hour. Reduce feed by 15% and monitor amperage\n2. **Bridging/blockage** — Visual check at feed chute, use borescope if available\n3. **CSS (closed-side setting)** — Has it drifted? Check against last calibration\n4. **Liner wear** — If liners are near replacement, oversize feed causes high amps\n5. **Drive train** — Check belt tension, pulley condition, motor temperature\n\n**If Crusher Won't Reset:**\n- Raise PTW before any internal inspection → \`hse_ptw.md\`\n- Check for trapped material — do NOT reach in without full LOTO\n\n**CMMS Work Order** — must include: failure code, description, parts used, root cause before closing.\n\n📎 Source: \`maint_breakdown.md\` — Section: On-Site Assessment + P-Class Classification`,

    fin_royalty: `**EPF Contribution Rate for Employees Over 60** — from \`hrm_payroll.md\` + \`fin_royalty.md\`\n\n⚠️ *Note: This is sensitive HR/financial data — routed to Claude for secure processing.*\n\n**EPF Rates (over 60 years):**\n| Party | Rate |\n|---|---|\n| Employer contribution | **6.5%** of monthly wages |\n| Employee contribution | **5.5%** of monthly wages |\n\n**Compare to under-60:**\n- Employer: 13% · Employee: 11%\n\n**Important:**\n- Both employer AND employee can choose to contribute at the standard rate (13%/11%) even above 60 — but minimum is 6.5%/5.5%\n- Confirm in i-Akaun Majikan whether the member has opted for standard rate\n- Submission deadline: **15th of following month** via i-Akaun Majikan\n\nNeed to walk through the i-Akaun submission steps?\n\n📎 Source: \`hrm_payroll.md\` — Deductions section · \`fin_royalty.md\` — EPF table`,

    hrm_succession: `**Deputy for HSE Manager** — from \`hrm_succession.md\`\n\nChecking the current succession matrix...\n\n**HSE Manager: Farah Izzati**\n- 🟢 Ready Now Deputy: **Mohd Asyraf**\n- 🟡 12–24 months: Nadia bt Hamid\n- Risk Rating: **MANAGED**\n\n**Activation Protocol:**\nMohd Asyraf is the formally designated deputy. He has:\n- Read all HSE SKILL.md files (confirmed in competency log)\n- Acted in the role during Farah's annual leave in March 2025\n- Holds current DOSH Green Book and PTW Authoriser certification\n\n**To activate:**\n1. Notify Mine Manager (he has deputy activation authority)\n2. Update Mine Control board with Mohd Asyraf as acting HSE Manager\n3. Notify all active PTW holders of the change in authoriser\n4. Log activation in HRMS\n\n📎 Source: \`hrm_succession.md\` — Succession Readiness Matrix + Deputy Activation Protocol`,

    ops_shift_handover: `**Shift Handover Checklist** — from \`ops_shift_handover.md\`\n\nHere's the 6-section checklist (Form OPS-S01):\n\n**Section A — Production Status**\n☐ Actual vs plan for this shift (tonnes mined, processed, metres drilled)\n☐ Carry-forward tasks not completed and reason\n☐ Current mining faces / active areas\n\n**Section B — Equipment Status**\n☐ Equipment available for next shift\n☐ Equipment under maintenance — estimated return to service\n☐ Defect reports raised this shift\n\n**Section C — Safety & Compliance**\n☐ All active PTWs listed with expiry times\n☐ Active isolations / locked-out equipment\n☐ Near-misses or incidents this shift\n☐ Ground conditions of concern\n\n**Section D — People**\n☐ Headcount on site\n☐ Any staff injury or welfare concern\n☐ Contractor activities on site\n\n**Section E — Outstanding Actions**\n☐ Previous shift actions — completed or carried forward?\n☐ Urgent actions for incoming shift\n\n**Section F — Supervisor Sign-off**\n☐ Outgoing supervisor signature + time\n☐ Incoming supervisor signature + time\n\n⚠️ **The Zero-Gap Rule:** Always include a minimum 5-minute verbal briefing. The form does not replace face-to-face confirmation.\n\n📎 Source: \`ops_shift_handover.md\` — Full 6-section handover structure`,
  };

  const defaultResponse = `I've searched the KROS knowledge base for your query.\n\nBased on the relevant SKILL.md files, here is my guidance:\n\n**Your question:** "${question}"\n\nI can help you navigate this using the KROS knowledge base. Please check the relevant skill file for detailed procedures. If this process isn't yet documented in KROS, this interaction has been flagged to the relevant skill owner to update the documentation.\n\n💡 **Tip:** For the most accurate guidance, try asking a more specific question — for example, name the specific equipment, process, or regulation you're dealing with.\n\n📎 Knowledge base searched: All 20 SKILL.md files`;

  return responses[skill] || defaultResponse;
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const engineColor = msg.engine === "claude" ? "purple" : msg.engine === "gemini" ? "gold" : "teal";
  const engineLabel = msg.engine === "claude" ? "✦ Claude" : msg.engine === "gemini" ? "◉ Gemini" : "◈ DeepSeek";
  return (
    <div className={`message ${isUser ? "user" : "ai"}`}>
      <div className="message-avatar">
        {isUser ? msg.initials || "U" : msg.engine === "deepseek" ? "◈" : msg.engine === "gemini" ? "◉" : "✦"}
      </div>
      <div style={{ flex: 1, maxWidth: "72%" }}>
        <div className={`message-bubble`}>
          {msg.loading ? (
            <div className="loading-dots"><span/><span/><span/></div>
          ) : (
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: msg.content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:4px;font-family:var(--font-mono);font-size:11px">$1</code>')
                .replace(/☐/g, '<span style="color:var(--gold)">☐</span>')
                .replace(/📎 Source:(.*)/g, '<div style="margin-top:12px;padding:8px 12px;background:rgba(107,63,160,0.15);border:1px solid rgba(107,63,160,0.25);border-radius:8px;font-size:11px;color:var(--purple-light)">📎 Source:$1</div>')
              }}
            />
          )}
        </div>
        <div className="message-meta">
          <span>{msg.time}</span>
          {msg.engine && (
            <span className={`badge badge-${engineColor}`} style={{ fontSize: 9, padding: "1px 6px" }}>
              {engineLabel}
            </span>
          )}

          {msg.skill && <span className="skill-ref">{msg.skill}.md</span>}
          {msg.sensitivity && (
            <span className="sensitivity-tag">
              <span className="sensitivity-dot" style={{ background: msg.sensitivity === "high" ? "var(--red)" : msg.sensitivity === "medium" ? "var(--gold)" : "var(--green-light)" }} />
              {msg.sensitivity} sensitivity
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AskClaude({ user }) {
  const { activeEngine, setActiveEngine, aiEngines } = useKROS();
  const [messages, setMessages] = useState([
    {
      id: 0, role: "ai", engine: "claude",
      content: `Hello ${user.givenName}! I'm KROS AI, your knowledge guide.\n\nI have access to all 20 SKILL.md files in your knowledge base. Ask me anything about:\n\n• **Operations** — SOPs, shift handover, incident procedures\n• **Safety / HSE** — PTW, HAZOP, emergency response\n• **HR** — Onboarding, payroll, succession, exit capture\n• **Finance** — Cost coding, royalties, statutory payments\n• **Maintenance** — PM schedules, breakdown response\n• **Compliance** — DOE, DOSH, EPF, SOCSO, HRDF\n\nI default to DeepSeek for operational queries and route sensitive data (HR, financial) to Gemini for security.`,
      time: new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" }),
    }
  ]);
  const [input, setInput] = useState("");
  const [userPreference, setUserPreference] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const initials = ((user.givenName?.[0] || "") + (user.surname?.[0] || "")).toUpperCase().slice(0, 2);

  const sentSkillRef = useRef(false);
  const handleSendRef = useRef(null);

  useEffect(() => { handleSendRef.current = handleSend; });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (sentSkillRef.current) return;
    const stored = sessionStorage.getItem("kros_ask_skill");
    if (stored) {
      sentSkillRef.current = true;
      sessionStorage.removeItem("kros_ask_skill");
      const skill = JSON.parse(stored);
      setTimeout(() => handleSendRef.current?.(`Tell me about the skill "${skill.title}" (${skill.id}.md) — what are the key procedures I need to know?`), 100);
    }
  }, []);

  const handleSend = async (questionOverride = null) => {
    const question = questionOverride || input.trim();
    if (!question || isLoading) return;
    setInput("");

    const sensitivity = detectSensitivity(question);
    const skill = detectSkill(question);
    const engine = routeAI(sensitivity, userPreference);
    const now = new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
    const token = localStorage.getItem("kros_token");

    // Add user message
    const userMsg = { id: Date.now(), role: "user", content: question, initials, time: now };
    const loadingMsg = { id: Date.now() + 1, role: "ai", engine, loading: true, time: now };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].filter(m => !m.loading).map(m => ({ role: m.role, content: m.content })),
          engineOverride: userPreference,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let engineUsed = engine;
      let streamError = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === "engine") {
              engineUsed = evt.engine;
            }
            if (evt.type === "error") {
              streamError = evt.message;
            }
            if (evt.type === "text") {
              fullText += evt.text;
              setMessages(prev => prev.map(m =>
                m.id === loadingMsg.id
                  ? { ...m, loading: false, content: fullText, skill, sensitivity, engine: engineUsed }
                  : m
              ));
            }
          } catch {}
        }
      }

      // Final update
      const finalContent = streamError
        ? `⚠️ AI Error: ${streamError}`
        : fullText || "⚠️ The AI returned an empty response. Check that the API keys are configured in Settings.";
      setMessages(prev => prev.map(m =>
        m.id === loadingMsg.id
          ? { ...m, loading: false, content: finalContent, skill, sensitivity, engine: engineUsed }
          : m
      ));
    } catch (err) {
      const localResponse = buildResponse(question, skill, engine);
      setMessages(prev => prev.map(m =>
        m.id === loadingMsg.id
          ? { ...m, loading: false, content: localResponse, skill, sensitivity, engine }
          : m
      ));
    }
    setIsLoading(false);
    if (engine !== activeEngine) setActiveEngine(engine);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentSensitivity = input ? detectSensitivity(input) : null;
  const currentEngine = currentSensitivity ? routeAI(currentSensitivity, userPreference) : (userPreference || activeEngine);

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", height: "100vh", paddingBottom: 0 }}>
      {/* Header */}
      <div className="page-header" style={{ flexShrink: 0, marginBottom: 16 }}>
        <div>
          <div className="page-title">Ask KROS AI</div>
          <div className="page-subtitle">Your 24/7 operational knowledge guide — powered by DeepSeek, Claude &amp; Gemini</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Routing:</div>
          <span className="badge badge-teal">Default → DeepSeek</span>
          <span className="badge badge-gold">Sensitive → Gemini</span>
        </div>
      </div>

      {/* Suggested questions */}
      {messages.length === 1 && (
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 8, letterSpacing: 1 }}>SUGGESTED QUESTIONS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTED.map((s, i) => (
              <button
                key={i}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12, maxWidth: 340, textAlign: "left", whiteSpace: "normal", lineHeight: 1.4, padding: "7px 12px" }}
                onClick={() => handleSend(s.q)}
              >
                <span style={{ opacity: 0.6, marginRight: 4 }}>
                  {s.sensitivity === "high" ? "🔒" : s.sensitivity === "medium" ? "⚠" : "◈"}
                </span>
                {s.q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="chat-messages" style={{ flex: 1 }}>
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area" style={{ flexShrink: 0 }}>
        {/* Data routing notice */}
        {currentSensitivity && (
          <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--text-muted)" }}>
            <span>Routing to:</span>
            <span className={`badge badge-${currentEngine === "claude" ? "purple" : currentEngine === "gemini" ? "gold" : "teal"}`}>
              {currentEngine === "claude" ? "✦ Claude (claude-sonnet-4-6)" : currentEngine === "gemini" ? "◉ Gemini (gemini-2.0-flash)" : "◈ DeepSeek (deepseek-chat)"}
            </span>
            <span>·</span>
            <span className="sensitivity-tag">
              <span className="sensitivity-dot" style={{ background: currentSensitivity === "high" ? "var(--red)" : currentSensitivity === "medium" ? "var(--gold)" : "var(--green-light)" }} />
              {currentSensitivity} sensitivity detected
            </span>
          </div>
        )}

        <div className="chat-input-row">
          <div className="chat-input-wrap">
            <textarea
              ref={textareaRef}
              placeholder="Ask anything about operations, safety, HR, finance, compliance… (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{ minHeight: 24 }}
              onInput={e => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
            <div className="chat-input-footer">
              <div className="ai-selector">
                <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center" }}>Override:</span>
                <button
                  className={`ai-chip${userPreference === "deepseek" ? " active-deepseek" : ""}`}
                  onClick={() => setUserPreference(prev => prev === "deepseek" ? null : "deepseek")}
                >
                  ◈ DeepSeek
                </button>
                <button
                  className={`ai-chip${userPreference === "claude" ? " active-claude" : ""}`}
                  onClick={() => setUserPreference(prev => prev === "claude" ? null : "claude")}
                >
                  ✦ Claude
                </button>
                <button
                  className={`ai-chip${userPreference === "gemini" ? " active-gemini" : ""}`}
                  onClick={() => setUserPreference(prev => prev === "gemini" ? null : "gemini")}
                >
                  ◉ Gemini
                </button>
                {userPreference && (
                  <button className="ai-chip" onClick={() => setUserPreference(null)} style={{ fontSize: 10 }}>
                    × Clear override
                  </button>
                )}
              </div>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                Enter ↵ to send
              </span>
            </div>
          </div>
          <button
            className="btn btn-purple"
            style={{ padding: "11px 18px", alignSelf: "flex-end", flexShrink: 0 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? "…" : "▶"}
          </button>
        </div>
      </div>
    </div>
  );
}
