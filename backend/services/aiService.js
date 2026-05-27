const fs   = require("fs");
const path = require("path");

const CLAUDE_API    = "https://api.anthropic.com/v1/messages";
const DEEPSEEK_API  = "https://api.deepseek.com/chat/completions";
const GEMINI_API    = "https://generativelanguage.googleapis.com/v1beta/models";
const CLAUDE_MODEL  = "claude-sonnet-4-6";
const DEEPSEEK_MODEL= "deepseek-chat";
const GEMINI_MODEL  = "gemini-2.0-flash";

// ── Skills loader ──────────────────────────────────────────────
let skillsCache = null;
let skillsCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

function loadSkills() {
  const now = Date.now();
  if (skillsCache && now - skillsCacheTime < CACHE_TTL) return skillsCache;

  const dir = process.env.SKILLS_DIR
    ? path.resolve(process.env.SKILLS_DIR)
    : path.join(__dirname, "../../skills");

  if (!fs.existsSync(dir)) {
    console.warn("[KROS] Skills directory not found:", dir);
    return {};
  }

  const skills = {};
  function readDir(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach((entry) => {
      if (entry.isDirectory()) readDir(path.join(d, entry.name));
      else if (entry.name.endsWith(".md") && !entry.name.startsWith("._")) {
        const id = path.basename(entry.name, ".md");
        skills[id] = fs.readFileSync(path.join(d, entry.name), "utf8");
      }
    });
  }
  readDir(dir);

  skillsCache = skills;
  skillsCacheTime = now;
  console.log(`[KROS] Loaded ${Object.keys(skills).length} skills from ${dir}`);
  return skills;
}

// ── System prompt builder ──────────────────────────────────────
function buildSystemPrompt(skills) {
  const skillList = Object.keys(skills).join(", ");

  const skillContent = Object.entries(skills)
    .map(([id, content]) => `\n--- ${id}.md ---\n${content.slice(0, 4000)}\n`)
    .join("");

  return `You are KROS AI — the operational knowledge guide for a Malaysian mining SME.
You have access to ${Object.keys(skills).length} SKILL.md files: ${skillList}

YOUR ROLE:
1. Answer operational questions using the SKILL.md content below as your priority
2. Walk staff through procedures step by step when requested
3. Answer Malaysian statutory questions (EPF, SOCSO, HRDF, DOE, JMG, DOSH) accurately
4. Always cite which SKILL.md file you are drawing from
5. Flag any knowledge gaps in SKILL.md files you notice

RULES:
- Never contradict safety procedures — safety always takes priority
- For LOTO/isolation: always emphasise zero-tolerance rules
- Always respond in English regardless of the user's language
- Structure responses clearly: use headers, bullet points, numbered steps
- End every response with: 📎 Source: [skill_name].md — [section]
- If a skill file covers the question, use it and cite it
- If NO skill file covers the question, suggest exactly where the user can find that data (e.g. "Check the Monthly EPF Statement in i-Akaun Majikan" or "Refer to the DOE e-Consult system for the latest effluent discharge limits"). If unsure, suggest who to contact (e.g. "Contact the HSE Manager for the latest PTW statistics")
- NEVER make up procedures or rates — only use what is in the SKILL.md files

SKILL.MD CONTENT:
${skillContent}`;
}

// ── Standard (non-streaming) call ─────────────────────────────
async function callAI({ messages, engineOverride }) {
  const engine   = engineOverride === "claude" ? "claude" : engineOverride === "gemini" ? "gemini" : "deepseek";
  const skills   = loadSkills();
  const sysPrompt = buildSystemPrompt(skills);

  let responseText = "";
  let tokensUsed   = 0;
  let model        = "";

  if (engine === "claude") {
    model = CLAUDE_MODEL;
    const res = await fetch(CLAUDE_API, {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        system: sysPrompt,
        messages: messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Claude API error ${res.status}: ${err.error?.message || res.statusText}`);
    }

    const data   = await res.json();
    responseText = data.content?.[0]?.text || "";
    tokensUsed   = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

  } else if (engine === "deepseek") {
    model = DEEPSEEK_MODEL;
    const res = await fetch(DEEPSEEK_API, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        messages: [
          { role: "system", content: sysPrompt },
          ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`DeepSeek API error ${res.status}: ${err.error?.message || res.statusText}`);
    }

    const data   = await res.json();
    responseText = data.choices?.[0]?.message?.content || "";
    tokensUsed   = data.usage?.total_tokens || 0;

  } else {
    model = GEMINI_MODEL;
    const res = await fetch(`${GEMINI_API}/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: sysPrompt }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Gemini API error ${res.status}: ${err.error?.message || res.statusText}`);
    }

    const data   = await res.json();
    responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    tokensUsed   = (data.usageMetadata?.promptTokenCount || 0) + (data.usageMetadata?.candidatesTokenCount || 0);
  }

  return { response: responseText, engine, model, tokens_used: tokensUsed };
}

// ── Streaming call (Server-Sent Events) ───────────────────────
async function streamAI({ messages, engineOverride, res: httpRes }) {
  const engine    = engineOverride === "claude" ? "claude" : engineOverride === "gemini" ? "gemini" : "deepseek";
  const skills    = loadSkills();
  const sysPrompt = buildSystemPrompt(skills);

  // Set SSE headers
  httpRes.setHeader("Content-Type",  "text/event-stream");
  httpRes.setHeader("Cache-Control", "no-cache");
  httpRes.setHeader("Connection",    "keep-alive");

  const send = (data) => httpRes.write(`data: ${JSON.stringify(data)}\n\n`);

  const modelMap = { claude: CLAUDE_MODEL, deepseek: DEEPSEEK_MODEL, gemini: GEMINI_MODEL };
  send({ type: "engine", engine, model: modelMap[engine] });

  try {
    if (engine === "claude") {
      const res = await fetch(CLAUDE_API, {
        method: "POST",
        headers: {
          "Content-Type":      "application/json",
          "x-api-key":         process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model:      CLAUDE_MODEL,
          max_tokens: 2000,
          stream:     true,
          system:     sysPrompt,
          messages:   messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
        }),
      });

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let totalTokens = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);
          if (raw === "[DONE]") continue;
          try {
            const evt = JSON.parse(raw);
            if (evt.type === "content_block_delta") {
              send({ type: "text", text: evt.delta?.text || "" });
            }
            if (evt.type === "message_delta") {
              totalTokens = evt.usage?.output_tokens || 0;
            }
          } catch {}
        }
      }
      send({ type: "done", tokens_used: totalTokens });

    } else if (engine === "deepseek") {
      const res = await fetch(DEEPSEEK_API, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model:      DEEPSEEK_MODEL,
          max_tokens: 2000,
          stream:     true,
          messages: [
            { role: "system", content: sysPrompt },
            ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
          ],
        }),
      });

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);
          if (raw === "[DONE]") continue;
          try {
            const evt = JSON.parse(raw);
            const text = evt.choices?.[0]?.delta?.content || "";
            if (text) send({ type: "text", text });
          } catch {}
        }
      }
      send({ type: "done" });

    } else {
      const res = await fetch(`${GEMINI_API}/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: sysPrompt }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        }),
      });

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);
          if (raw === "[DONE]") continue;
          try {
            const evt = JSON.parse(raw);
            const text = evt.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (text) send({ type: "text", text });
          } catch {}
        }
      }
      send({ type: "done" });
    }
  } catch (err) {
    send({ type: "error", message: err.message });
  } finally {
    httpRes.end();
  }
}

function invalidateSkillsCache() {
  skillsCache = null;
  skillsCacheTime = 0;
}

module.exports = { callAI, streamAI, loadSkills, invalidateSkillsCache };
