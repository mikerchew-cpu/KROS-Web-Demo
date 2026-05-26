require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");

const { callAI, streamAI, loadSkills } = require("./services/aiService");
const { router: authRouter, requireAuth } = require("./routes/auth");

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "2mb" }));

const aiLimit  = rateLimit({ windowMs: 60_000, max: 60,  message: "AI rate limit exceeded" });
const genLimit = rateLimit({ windowMs: 60_000, max: 200, message: "Too many requests" });
app.use(genLimit);

app.use("/api/auth", authRouter);

app.get("/api/health", (req, res) => {
  const skills = loadSkills();
  res.json({
    status: "ok", version: "2.0.0",
    timestamp: new Date().toISOString(),
    engines: {
      claude:   process.env.ANTHROPIC_API_KEY ? "configured" : "missing key",
      deepseek: process.env.DEEPSEEK_API_KEY  ? "configured" : "missing key",
      gemini:   process.env.GEMINI_API_KEY    ? "configured" : "missing key",
    },
    skills_loaded: Object.keys(skills).length,
  });
});

app.use("/api", requireAuth);

app.post("/api/chat", aiLimit, async (req, res) => {
  const { messages, engineOverride } = req.body;
  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: "messages array required" });
  try {
    const result = await callAI({ messages, engineOverride });
    res.json(result);
  } catch (err) {
    console.error("[KROS] AI error:", err.message);
    res.status(502).json({ error: "AI service error", message: err.message });
  }
});

app.post("/api/chat/stream", aiLimit, async (req, res) => {
  const { messages, engineOverride } = req.body;
  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: "messages array required" });
  await streamAI({ messages, engineOverride, res });
});

app.get("/api/skills",     (req, res) => { const skills = loadSkills(); res.json({ count: Object.keys(skills).length, skills: Object.entries(skills).map(([id, content]) => ({ id, filename: `${id}.md`, size: content.length, preview: content.slice(0, 300) })) }); });
app.get("/api/skills/:id", (req, res) => { const skill = loadSkills()[req.params.id]; if (!skill) return res.status(404).json({ error: "Skill not found" }); res.json({ id: req.params.id, content: skill }); });
app.get("/api/succession",        (req, res) => res.json({ succession: [{ role:"Mine Manager",current:"Ahmad Zulkifli",readyNow:"Raj Namasivayam",r12:"Nur Hidayah",r24:"—",risk:"managed"},{role:"Mine Ops Superintendent",current:"Raj Namasivayam",readyNow:"—",r12:"Siti Aminah",r24:"Chong Wei Lim",risk:"critical"},{role:"HSE Manager",current:"Farah Izzati",readyNow:"Mohd Asyraf",r12:"Nadia bt Hamid",r24:"—",risk:"managed"},{role:"Chief Metallurgist",current:"Lee Kah Wai",readyNow:"—",r12:"—",r24:"Priya Subramaniam",risk:"critical"},{role:"Finance Manager",current:"Tan Mei Ling",readyNow:"—",r12:"Nurul Ain",r24:"—",risk:"at-risk"},{role:"Maintenance Super.",current:"Haji Rosli",readyNow:"Amirul Haziq",r12:"Kevin Tan",r24:"—",risk:"managed"}] }));
app.get("/api/compliance",        (req, res) => res.json({ items: [{id:1,category:"Statutory",item:"EPF Submission",deadline:"2025-05-15",status:"due",authority:"KWSP",skill:"hrm_payroll",amount:"RM 48,200"},{id:2,category:"Statutory",item:"SOCSO Submission",deadline:"2025-05-15",status:"due",authority:"PERKESO",skill:"hrm_payroll",amount:"RM 6,840"},{id:3,category:"Environment",item:"DOE Discharge Report",deadline:"2025-05-14",status:"overdue",authority:"DOE",skill:"env_report",amount:"—"},{id:4,category:"Royalty",item:"State Mineral Royalty",deadline:"2025-06-30",status:"upcoming",authority:"JMG Pahang",skill:"fin_royalty",amount:"RM 184,200"}] }));
app.get("/api/dashboard/kpis",    (req, res) => res.json({ currentSkills:17, overdueSkills:3, successionGaps:2, exitCaptureRate:100, pmCompliance:94, openPTWs:7, aiQueriesToday:43, knowledgeScore:82 }));
app.get("/api/dashboard/activity",(req, res) => res.json({ activity: [{time:"08:42",user:"Amirul Haziq",action:"Asked about crusher breakdown",engine:"deepseek",skill:"maint_breakdown"},{time:"08:15",user:"Farah Izzati",action:"Updated hse_emergency.md",engine:null,skill:"hse_emergency"},{time:"07:30",user:"Tan Mei Ling",action:"Asked about royalty calculation",engine:"claude",skill:"fin_royalty"}] }));
app.get("/api/exit/sessions",     (req, res) => res.json({ sessions: [{id:1,name:"Rosniza bt Hamid",role:"Finance Clerk",dept:"Finance",date:"2025-04-28",status:"completed",skills:["fin_budget","fin_procurement"],score:92},{id:2,name:"Hafiz bin Said",role:"Maint. Tech",dept:"Maintenance",date:"2025-04-15",status:"completed",skills:["maint_pm","maint_breakdown"],score:87}] }));
app.get("/api/settings",          (req, res) => res.json({ claudeConfigured: !!process.env.ANTHROPIC_API_KEY, deepseekConfigured: !!process.env.DEEPSEEK_API_KEY, geminiConfigured: !!process.env.GEMINI_API_KEY, version: "2.0.0" }));

app.listen(PORT, () => {
  const skills = loadSkills();
  console.log(`✦ KROS Backend v2.0 on port ${PORT}`);
  console.log(`  Claude:   ${process.env.ANTHROPIC_API_KEY ? "✓" : "✗ missing key"}`);
  console.log(`  DeepSeek: ${process.env.DEEPSEEK_API_KEY  ? "✓" : "✗ missing key"}`);
  console.log(`  Gemini:   ${process.env.GEMINI_API_KEY    ? "✓" : "✗ missing key"}`);
  console.log(`  Skills:   ${Object.keys(skills).length} loaded`);
});

module.exports = app;
