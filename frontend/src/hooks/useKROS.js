/**
 * KROS Custom Hooks
 * useChat    — AI chat with automatic engine routing
 * useSkills  — Skills library with search and filtering
 * useSuccession — Succession matrix
 * useCompliance — Compliance calendar
 */

import { useState, useCallback, useRef } from "react";
import { chatAPI, skillsAPI, successionAPI, complianceAPI } from "../utils/api";

// ── Sensitivity detector (mirrors backend logic) ───────────────
export function detectSensitivity(text) {
  const t = (text || "").toLowerCase();
  const HIGH = [
    "salary", "payroll", "epf", "socso", "hrdf", "pcb",
    "employee data", "staff record", "resign", "termination",
    "succession", "deputy", "royalty", "budget", "financial",
    "profit", "revenue", "personnel", "bank account",
    "confidential", "tax", "lhdn", "audit",
  ];
  const MED = [
    "permit", "ptw", "loto", "hazop", "risk register",
    "incident report", "environment", "doe", "dosh", "jmg",
    "regulatory", "compliance", "procurement", "vendor",
  ];
  if (HIGH.some((w) => t.includes(w))) return "high";
  if (MED.some((w) => t.includes(w))) return "medium";
  return "low";
}

export function detectSkill(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("permit") || t.includes("ptw") || t.includes("loto"))        return "hse_ptw";
  if (t.includes("emergency") || t.includes("fire") || t.includes("evacu"))   return "hse_emergency";
  if (t.includes("hazop") || t.includes("risk register"))                      return "hse_hazop";
  if (t.includes("crusher") || t.includes("breakdown") || t.includes("fault")) return "maint_breakdown";
  if (t.includes("preventive") || t.includes(" pm ") || t.includes("service")) return "maint_pm";
  if (t.includes("shift") || t.includes("handover"))                           return "ops_shift_handover";
  if (t.includes("blast") || t.includes("drill") || t.includes("haul"))       return "ops_sop";
  if (t.includes("epf") || t.includes("socso") || t.includes("payroll"))      return "hrm_payroll";
  if (t.includes("resign") || t.includes("leaving") || t.includes("exit"))    return "hrm_exit";
  if (t.includes("succession") || t.includes("deputy"))                        return "hrm_succession";
  if (t.includes("onboard") || t.includes("new hire"))                         return "hrm_onboard";
  if (t.includes("royalty") || t.includes("statutory"))                        return "fin_royalty";
  if (t.includes("budget") || t.includes("cost code"))                         return "fin_budget";
  if (t.includes("effluent") || t.includes("doe") || t.includes("tailings"))  return "env_report";
  if (t.includes("project") || t.includes("capex"))                            return "proj_lifecycle";
  return null;
}

// ── useChat ────────────────────────────────────────────────────
export function useChat(initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [engineOverride, setEngineOverride] = useState(null);
  const abortRef = useRef(null);

  const send = useCallback(
    async (content) => {
      if (!content?.trim() || loading) return;

      const sensitivity  = detectSensitivity(content);
      const skill        = detectSkill(content);
      const userMessage  = { role: "user", content };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      // Include conversation history (last 10 messages for context)
      const history = [...messages.slice(-10), userMessage];

      try {
        const data = await chatAPI.send(history, sensitivity, engineOverride);

        setMessages((prev) => [
          ...prev,
          {
            role:        "assistant",
            content:     data.response,
            engine:      data.engine,
            model:       data.model,
            sensitivity,
            skill,
            tokens:      data.tokens_used,
            timestamp:   new Date(),
          },
        ]);
      } catch (err) {
        setError(err.message);
        // Show error in chat
        setMessages((prev) => [
          ...prev,
          {
            role:    "assistant",
            content: `⚠ Sorry, I couldn't reach the AI engine. Error: ${err.message}. Please try again.`,
            engine:  "error",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, engineOverride]
  );

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages, loading, error,
    engineOverride, setEngineOverride,
    send, clear,
    currentSensitivity: (text) => detectSensitivity(text),
  };
}

// ── useSkills ──────────────────────────────────────────────────
export function useSkills() {
  const [skills, setSkills]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const data = await skillsAPI.list();
      setSkills(data.skills || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = skills.filter((s) => {
    const matchSearch =
      !search ||
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.id?.toLowerCase().includes(search.toLowerCase());
    const matchModule  = moduleFilter === "all" || s.module === moduleFilter;
    const matchStatus  = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchModule && matchStatus;
  });

  const proposeUpdate = useCallback(async (id, content, reason) => {
    const data = await skillsAPI.proposeUpdate(id, content, reason);
    return data;
  }, []);

  return {
    skills: filtered,
    allSkills: skills,
    loading, error,
    search, setSearch,
    moduleFilter, setModuleFilter,
    statusFilter, setStatusFilter,
    fetchSkills, proposeUpdate,
  };
}

// ── useSuccession ──────────────────────────────────────────────
export function useSuccession() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchSuccession = useCallback(async () => {
    setLoading(true);
    try {
      const data = await successionAPI.list();
      setRows(data.succession || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRow = useCallback(async (role, data) => {
    const updated = await successionAPI.update(role, data);
    setRows((prev) => prev.map((r) => (r.role === role ? { ...r, ...updated } : r)));
  }, []);

  const critical = rows.filter((r) => r.risk === "critical");
  const atRisk   = rows.filter((r) => r.risk === "at-risk");
  const managed  = rows.filter((r) => r.risk === "managed");

  return {
    rows, critical, atRisk, managed,
    loading, error,
    fetchSuccession, updateRow,
  };
}

// ── useCompliance ──────────────────────────────────────────────
export function useCompliance() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchCompliance = useCallback(async () => {
    setLoading(true);
    try {
      const data = await complianceAPI.list();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const markDone = useCallback(async (id, note) => {
    await complianceAPI.mark(id, "done", note);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "done" } : item))
    );
  }, []);

  const overdue   = items.filter((i) => i.status === "overdue");
  const dueSoon   = items.filter((i) => i.status === "due");
  const upcoming  = items.filter((i) => i.status === "upcoming");
  const done      = items.filter((i) => i.status === "done");

  return {
    items, overdue, dueSoon, upcoming, done,
    loading, error,
    fetchCompliance, markDone,
  };
}

// ── useAIRouter ────────────────────────────────────────────────
export function useAIRouter() {
  const [override, setOverride] = useState(null); // "claude" | "deepseek" | null

  const route = useCallback(
    (text) => {
      if (override) return override;
      const sens = detectSensitivity(text);
      return sens === "low" ? "deepseek" : "claude";
    },
    [override]
  );

  const sensitivityLabel = (text) => {
    const s = detectSensitivity(text);
    return {
      low:    { label: "Low",    color: "var(--green-light)", engine: "DeepSeek" },
      medium: { label: "Medium", color: "var(--gold)",        engine: "Claude"   },
      high:   { label: "High",   color: "var(--red)",         engine: "Claude"   },
    }[s];
  };

  return { route, override, setOverride, sensitivityLabel, detectSensitivity, detectSkill };
}
