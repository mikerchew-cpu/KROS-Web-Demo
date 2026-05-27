/**
 * KROS API Service
 * Centralised fetch wrapper for all backend calls
 */

const BASE = import.meta.env.VITE_API_URL || "/api";

// ── Core fetch wrapper ─────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("kros_token");
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
    ...opts,
  });

  if (res.status === 401) {
    localStorage.removeItem("kros_token");
    localStorage.removeItem("kros_user");
    window.location.reload();
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Auth ───────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiFetch("/auth/logout", { method: "POST" }),
};

// ── Chat / AI ──────────────────────────────────────────────────
export const chatAPI = {
  /**
   * Send a message to the AI engine
   * @param {Array}  messages        - [{role, content}]
   * @param {string} sensitivity     - "low" | "medium" | "high"
   * @param {string} engineOverride  - "claude" | "deepseek" | null
   * @returns {{ response, engine, sensitivity, model, tokens_used }}
   */
  send: (messages, sensitivity = null, engineOverride = null) =>
    apiFetch("/chat", {
      method: "POST",
      body: JSON.stringify({ messages, sensitivity, engineOverride }),
    }),

  /**
   * Stream a response (for real-time typing effect)
   * Returns a ReadableStream
   */
  stream: async (messages, sensitivity = null, engineOverride = null, onChunk) => {
    const token = localStorage.getItem("kros_token");
    const res = await fetch(`${BASE}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages, sensitivity, engineOverride }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      // Parse SSE data lines
      chunk.split("\n").forEach((line) => {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) onChunk(data.text);
          } catch {}
        }
      });
    }
  },
};

// ── Skills ─────────────────────────────────────────────────────
export const skillsAPI = {
  list: () => apiFetch("/skills"),

  get: (id) => apiFetch(`/skills/${id}`),

  create: (data) =>
    apiFetch("/skills", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  upload: (file) => {
    const token = localStorage.getItem("kros_token");
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${BASE}/skills/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      if (res.status === 401) { localStorage.removeItem("kros_token"); localStorage.removeItem("kros_user"); window.location.reload(); return; }
      if (!res.ok) { const err = await res.json().catch(() => ({ error: "Upload failed" })); throw new Error(err.error || `HTTP ${res.status}`); }
      return res.json();
    });
  },

  update: (id, data) =>
    apiFetch(`/skills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id) =>
    apiFetch(`/skills/${id}`, { method: "DELETE" }),

  proposeUpdate: (id, proposedContent, reason) =>
    apiFetch(`/skills/${id}/propose`, {
      method: "POST",
      body: JSON.stringify({ proposedContent, reason }),
    }),

  history: (id) => apiFetch(`/skills/${id}/history`),

  search: (query) => apiFetch(`/skills/search?q=${encodeURIComponent(query)}`),
};

// ── Succession ─────────────────────────────────────────────────
export const successionAPI = {
  list:   ()            => apiFetch("/succession"),
  update: (role, data)  => apiFetch(`/succession/${encodeURIComponent(role)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
};

// ── Exit Capture ───────────────────────────────────────────────
export const exitAPI = {
  sessions:      ()           => apiFetch("/exit/sessions"),
  getSession:    (id)         => apiFetch(`/exit/sessions/${id}`),
  createSession: (staffData)  =>
    apiFetch("/exit/sessions", {
      method: "POST",
      body: JSON.stringify(staffData),
    }),
  saveAnswer: (sessionId, questionIndex, answer) =>
    apiFetch(`/exit/sessions/${sessionId}/answers`, {
      method: "POST",
      body: JSON.stringify({ questionIndex, answer }),
    }),
  complete: (sessionId) =>
    apiFetch(`/exit/sessions/${sessionId}/complete`, { method: "POST" }),
  generateUpdates: (sessionId) =>
    apiFetch(`/exit/sessions/${sessionId}/generate-updates`, { method: "POST" }),
};

// ── Compliance ─────────────────────────────────────────────────
export const complianceAPI = {
  list:   ()                    => apiFetch("/compliance"),
  mark:   (id, status, note)    =>
    apiFetch(`/compliance/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    }),
  create: (item)                =>
    apiFetch("/compliance", {
      method: "POST",
      body: JSON.stringify(item),
    }),
};

// ── Dashboard / Analytics ──────────────────────────────────────
export const dashboardAPI = {
  kpis:           ()    => apiFetch("/dashboard/kpis"),
  activity:       (n)   => apiFetch(`/dashboard/activity?limit=${n || 20}`),
  engineUsage:    ()    => apiFetch("/dashboard/engine-usage"),
  knowledgeScore: ()    => apiFetch("/dashboard/knowledge-score"),
};

// ── Settings ───────────────────────────────────────────────────
export const settingsAPI = {
  get:    ()       => apiFetch("/settings"),
  update: (data)   =>
    apiFetch("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  testEngine: (engine) =>
    apiFetch(`/settings/test-engine/${engine}`, { method: "POST" }),
};

// ── Health check ───────────────────────────────────────────────
export const healthAPI = {
  check: () => apiFetch("/health"),
};
