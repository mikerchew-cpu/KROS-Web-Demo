require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "https://hypgryszzgpzirdduxd.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "2mb" }));

const aiLimit = rateLimit({ windowMs: 60_000, max: 60, message: "AI rate limit exceeded" });
const genLimit = rateLimit({ windowMs: 60_000, max: 200, message: "Too many requests" });
app.use(genLimit);

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Authentication required" });
  const token = header.slice(7);
  supabase.auth.getUser(token).then(({ data: { user }, error }) => {
    if (error || !user) return res.status(401).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// — Auth routes —
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: "Invalid credentials" });
  const { data: profile } = await supabase.from("worker_profiles").select("*").eq("email", email).maybeSingle();
  res.json({ token: data.session.access_token, user: profile || { email, role: "Staff", access: "staff" }, expiresIn: "8h" });
});

app.post("/api/auth/logout", (req, res) => res.json({ message: "Logged out" }));

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const { data: profile } = await supabase.from("worker_profiles").select("*").eq("email", req.user.email).maybeSingle();
  res.json(profile || { email: req.user.email });
});

app.get("/api/auth/users", requireAuth, async (req, res) => {
  const { data: users, error } = await supabase.from("worker_profiles").select("*").order("created_at");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ count: users.length, users });
});

// — Health —
app.get("/api/health", async (req, res) => {
  const { count: skills } = await supabase.from("skills").select("*", { count: "exact", head: true });
  res.json({ status: "ok", version: "3.0.0", timestamp: new Date().toISOString(), engines: { claude: "configured", deepseek: "configured", gemini: "configured" }, skills_loaded: skills || 0 });
});

// — Skills API —
app.get("/api/skills", async (req, res) => {
  const { data: skills, error } = await supabase.from("skills").select("*").order("last_updated", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ count: skills.length, skills });
});

app.get("/api/skills/:id", async (req, res) => {
  const { data, error } = await supabase.from("skills").select("*").eq("skill_id", req.params.id).single();
  if (error) return res.status(404).json({ error: "Skill not found" });
  res.json(data);
});

app.post("/api/skills", requireAuth, async (req, res) => {
  const { skill_id, module, title, owner, sensitivity, status, description, content } = req.body;
  if (!skill_id || !title) return res.status(400).json({ error: "skill_id and title required" });
  const { data, error } = await supabase.from("skills").insert({ skill_id, module, title, owner, sensitivity, status, description, content }).select().single();
  if (error) return res.status(409).json({ error: error.message });
  res.json(data);
});

// — Workers API —
app.get("/api/workers", async (req, res) => {
  const { data, error } = await supabase.from("worker_profiles").select("*").order("created_at");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ count: data.length, workers: data });
});

app.get("/api/workers/:id", async (req, res) => {
  const { data, error } = await supabase.from("worker_profiles").select("*").eq("id", req.params.id).single();
  if (error) return res.status(404).json({ error: "Worker not found" });
  res.json(data);
});

// — Assets API —
app.get("/api/assets", async (req, res) => {
  const { data, error } = await supabase.from("assets").select("*").order("created_at");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ count: data.length, assets: data });
});

app.get("/api/assets/:id", async (req, res) => {
  const { data, error } = await supabase.from("assets").select("*").eq("id", req.params.id).single();
  if (error) return res.status(404).json({ error: "Asset not found" });
  res.json(data);
});

// — Production API —
app.get("/api/production", async (req, res) => {
  const { data, error } = await supabase.from("production_days").select("*").order("date", { ascending: false }).limit(30);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ days: data });
});

app.get("/api/production/shifts/:dayId", async (req, res) => {
  const { data, error } = await supabase.from("production_shifts").select("*").eq("production_day_id", req.params.dayId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ shifts: data });
});

// — Safety API —
app.get("/api/safety/observations", async (req, res) => {
  const { data, error } = await supabase.from("safety_observations").select("*").order("date", { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ observations: data });
});

app.post("/api/safety/observations", requireAuth, async (req, res) => {
  const { data, error } = await supabase.from("safety_observations").insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// — Notifications API —
app.get("/api/notifications", async (req, res) => {
  const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(20);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ notifications: data });
});

app.put("/api/notifications/:id/read", requireAuth, async (req, res) => {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Marked as read" });
});

// — Chat / AI —
app.post("/api/chat", aiLimit, async (req, res) => {
  const { messages, engineOverride } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: "messages array required" });
  try {
    const { callAI } = require("./services/aiService");
    const result = await callAI({ messages, engineOverride });
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: "AI service error", message: err.message });
  }
});

app.post("/api/chat/stream", aiLimit, async (req, res) => {
  const { messages, engineOverride } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: "messages array required" });
  try {
    const { streamAI } = require("./services/aiService");
    await streamAI({ messages, engineOverride, res });
  } catch {
    res.status(502).json({ error: "AI service error" });
  }
});

app.listen(PORT, () => {
  console.log(`✦ KROS v3.0 (Supabase) on port ${PORT}`);
  console.log(`  Supabase: ${process.env.VITE_SUPABASE_URL || "configured"}`);
});
