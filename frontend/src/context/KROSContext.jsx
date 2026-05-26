import { createContext, useContext, useState, useCallback } from "react";

const KROSContext = createContext(null);

export const SKILLS_DATA = [
  { id: "ops_sop",           module: "ops",   title: "Standard Operating Procedures",      owner: "Ops Superintendent",      status: "fresh",  lastUpdated: "2025-04-10", sensitivity: "low",    description: "Drill, blast, load & haul, processing plant procedures with checklists and escalation paths." },
  { id: "ops_shift_handover",module: "ops",   title: "Shift Handover Protocol",            owner: "Ops Superintendent",      status: "fresh",  lastUpdated: "2025-04-28", sensitivity: "low",    description: "Zero-gap 6-section handover form covering production, equipment, safety, people and sign-off." },
  { id: "ops_incident",      module: "ops",   title: "Incident Logging & Escalation",      owner: "HSE Manager",             status: "fresh",  lastUpdated: "2025-03-15", sensitivity: "low",    description: "Incident classification, escalation tree and DOSH notification requirements." },
  { id: "maint_pm",          module: "maint", title: "Preventive Maintenance Schedule",    owner: "Maintenance Super.",      status: "stale",  lastUpdated: "2025-01-20", sensitivity: "low",    description: "PM intervals by equipment type, oil analysis programme, and maintenance KPIs." },
  { id: "maint_breakdown",   module: "maint", title: "Breakdown Response & RCA",           owner: "Maintenance Super.",      status: "fresh",  lastUpdated: "2025-04-02", sensitivity: "low",    description: "P1-P4 classification, CMMS work order requirements, 5-Why and fishbone RCA." },
  { id: "hse_ptw",           module: "hse",   title: "Permit-to-Work System",              owner: "HSE Manager",             status: "fresh",  lastUpdated: "2025-04-18", sensitivity: "medium", description: "6 PTW types, full LOTO procedure, confined space entry, zero-tolerance violations." },
  { id: "hse_hazop",         module: "hse",   title: "HAZOP & Risk Register",              owner: "HSE Manager",             status: "stale",  lastUpdated: "2025-02-10", sensitivity: "medium", description: "Risk matrix, HAZOP guide words, site risk register format and bowtie analysis." },
  { id: "hse_emergency",     module: "hse",   title: "Emergency Response Procedures",      owner: "HSE Manager",             status: "fresh",  lastUpdated: "2025-04-25", sensitivity: "low",    description: "Response procedures for injury, fire, slope failure, misfire and spill." },
  { id: "env_report",        module: "env",   title: "Environmental Reporting (DOE/JMG)",  owner: "Environmental Manager",   status: "fresh",  lastUpdated: "2025-03-30", sensitivity: "medium", description: "DOE reporting calendar, effluent standards, TSF management, scheduled waste." },
  { id: "hrm_onboard",       module: "hrm",   title: "New Hire Onboarding Protocol",       owner: "HR Manager",              status: "fresh",  lastUpdated: "2025-04-05", sensitivity: "high",   description: "Day 1 orientation, 30/60/90 check-ins, buddy system, and knowledge capture from new hires." },
  { id: "hrm_competency",    module: "hrm",   title: "Competency Framework & Assessment",  owner: "HR Manager",              status: "fresh",  lastUpdated: "2025-03-20", sensitivity: "high",   description: "Competency levels 0-4, role maps, zero-tolerance critical competencies." },
  { id: "hrm_succession",    module: "hrm",   title: "Succession Planning",                owner: "HR Manager",              status: "urgent", lastUpdated: "2024-12-01", sensitivity: "high",   description: "Readiness matrix, deputy assignment protocol, individual development plans." },
  { id: "hrm_exit",          module: "hrm",   title: "Exit Knowledge Capture Protocol",    owner: "HR Manager",              status: "fresh",  lastUpdated: "2025-04-20", sensitivity: "high",   description: "5-step exit capture, AI-assisted interview, SKILL.md update assignments." },
  { id: "hrm_payroll",       module: "hrm",   title: "Payroll, Leave & Allowances",        owner: "HR Manager",              status: "fresh",  lastUpdated: "2025-04-01", sensitivity: "high",   description: "Payroll calendar, OT calculation, Malaysian statutory compliance (EPF, SOCSO, HRDF)." },
  { id: "fin_budget",        module: "fin",   title: "Mine Budgeting & Cost Coding",       owner: "Finance Manager",         status: "fresh",  lastUpdated: "2025-01-10", sensitivity: "high",   description: "Cost coding structure, unit rate method, variance thresholds and monthly review cycle." },
  { id: "fin_royalty",       module: "fin",   title: "Royalty & Statutory Payments",       owner: "Finance Manager",         status: "stale",  lastUpdated: "2025-01-15", sensitivity: "high",   description: "Malaysian state royalty rates, EPF/SOCSO/HRDF/PCB calendar and calculation guides." },
  { id: "fin_procurement",   module: "fin",   title: "Procurement & Vendor Management",    owner: "Finance Manager",         status: "fresh",  lastUpdated: "2025-03-08", sensitivity: "medium", description: "Authority matrix, 3-way match, approved vendor list, anti-corruption procedures." },
  { id: "fin_reporting",     module: "fin",   title: "Management Accounts & Reporting",    owner: "Finance Manager",         status: "fresh",  lastUpdated: "2025-04-12", sensitivity: "high",   description: "Monthly management accounts structure from executive summary to cash flow." },
  { id: "proj_lifecycle",    module: "proj",  title: "Project Lifecycle & Governance",     owner: "General Manager / PMO",   status: "fresh",  lastUpdated: "2025-02-28", sensitivity: "medium", description: "5-phase gate model, PEP requirements, change control and project archive." },
  { id: "proj_risk",         module: "proj",  title: "Risk Register & Lessons Learned",    owner: "General Manager / PMO",   status: "fresh",  lastUpdated: "2025-02-28", sensitivity: "medium", description: "Risk matrix, response strategies, top 10 mining project risks, EMV contingency calc." },
];

export const SUCCESSION_DATA = [
  { role: "Mine Manager",              current: "Ahmad Zulkifli",    readyNow: "Raj Namasivayam",  r12: "Nur Hidayah bt Karim",  r24: "—",                    risk: "managed" },
  { role: "Mine Ops Superintendent",   current: "Raj Namasivayam",  readyNow: "—",                r12: "Siti Aminah bt Yusoff", r24: "Chong Wei Lim",        risk: "critical" },
  { role: "HSE Manager",               current: "Farah Izzati",     readyNow: "Mohd Asyraf",      r12: "Nadia bt Hamid",        r24: "—",                    risk: "managed" },
  { role: "Chief Metallurgist",        current: "Lee Kah Wai",      readyNow: "—",                r12: "—",                     r24: "Priya Subramaniam",    risk: "critical" },
  { role: "Maintenance Super.",        current: "Haji Rosli bin M.", readyNow: "Amirul Haziq",     r12: "Kevin Tan",             r24: "—",                    risk: "managed" },
  { role: "Finance Manager",           current: "Tan Mei Ling",     readyNow: "—",                r12: "Nurul Ain bt Aziz",     r24: "—",                    risk: "at-risk" },
  { role: "Chief Geologist",           current: "Dr. Wong Fook Sen",readyNow: "Harish Kumar",     r12: "Zubaidah bt Osman",     r24: "—",                    risk: "managed" },
  { role: "Environmental Manager",     current: "Lim Jia Yi",       readyNow: "—",                r12: "Mohamad Syafiq",        r24: "Rekha Pillai",         risk: "at-risk" },
];

export const AI_ENGINES = {
  claude:   { name: "Claude",   model: "claude-sonnet-4-6",     color: "purple", emoji: "✦", safeFor: ["low","medium","high"] },
  deepseek: { name: "DeepSeek", model: "deepseek-chat",         color: "teal",   emoji: "◈", safeFor: ["low"] },
};

// Smart router: pick AI based on data sensitivity
export function routeAI(sensitivity, userPreference = null) {
  if (userPreference) return userPreference;
  if (sensitivity === "high" || sensitivity === "medium") return "claude";
  return "deepseek"; // low sensitivity — use cheaper DeepSeek
}

export function KROSProvider({ children }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [activeEngine, setActiveEngine] = useState("claude");
  const [notifications, setNotifications] = useState([
    { id: 1, type: "urgent", message: "hrm_succession.md is 5 months overdue for review", skill: "hrm_succession" },
    { id: 2, type: "warn",   message: "fin_royalty.md — verify rates before next submission", skill: "fin_royalty" },
    { id: 3, type: "warn",   message: "maint_pm.md last updated Jan 2025 — review needed", skill: "maint_pm" },
    { id: 4, type: "info",   message: "2 critical succession gaps: Ops Super & Metallurgist" },
  ]);

  const addMessage = useCallback((msg) => {
    setChatHistory(prev => [...prev, { ...msg, id: Date.now() + Math.random() }]);
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <KROSContext.Provider value={{
      chatHistory, setChatHistory, addMessage,
      activeEngine, setActiveEngine,
      notifications, clearNotification,
      skills: SKILLS_DATA,
      succession: SUCCESSION_DATA,
      aiEngines: AI_ENGINES,
      routeAI,
    }}>
      {children}
    </KROSContext.Provider>
  );
}

export function useKROS() {
  const ctx = useContext(KROSContext);
  if (!ctx) throw new Error("useKROS must be used inside KROSProvider");
  return ctx;
}
