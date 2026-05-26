/**
 * KROS AI Service
 * Handles routing between Claude and DeepSeek
 * Supports both standard and streaming responses
 */

const fs   = require("fs");
const path = require("path");

const CLAUDE_API    = "https://api.anthropic.com/v1/messages";
const DEEPSEEK_API  = "https://api.deepseek.com/chat/completions";
const CLAUDE_MODEL  = "claude-sonnet-4-6";
const DEEPSEEK_MODEL= "deepseek-chat";

// ── Skills loader ──────────────────────────────────────────────
let skillsCache = null;
let skillsCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
      if (entry.isDirectory()) {
        readDir(path.join(d, entry.name));
      } else if (entry.name.endsWith(".md")) {
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
1. Answer operational questions using the SKILL.md content below
2. Walk staff through procedures step by step when requested
3. Answer Malaysian statutory questions (EPF, SOCSO, HRDF, DOE, JMG, DOSH) accurately
4. Always cite which SKILL.md file you are drawing from
5. Flag any knowledge gaps in SKILL.md files you notice

RULES:
- Never contradict safety procedures — safety always takes priority
- For LOTO/isolation: always emphasise zero-tolerance rules
- Respond in the same language the user writes (Bahasa Malaysia or English)
- Structure responses clearly: use headers, bullet points, numbered steps
- End every response with: 📎 Source: [skill_name].md — [section]
- If no skill covers the question, say so honestly and suggest who to contact
- NEVER make up procedures or rates — only use what is in the SKILL.md files

SKILL.MD CONTENT:
${skillContent}`;
}

// ── Standard (non-streaming) call ─────────────────────────────
async function callAI({ messages, engineOverride }) {
  const engine   = engineOverride === "deepseek" ? "deepseek" : "claude";
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

  } else {
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
  }

  return { response: responseText, engine, model, tokens_used: tokensUsed };
}

// ── Streaming call (Server-Sent Events) ───────────────────────
async function streamAI({ messages, engineOverride, res: httpRes }) {
  const engine    = engineOverride === "deepseek" ? "deepseek" : "claude";
  const skills    = loadSkills();
  const sysPrompt = buildSystemPrompt(skills);

  // Set SSE headers
  httpRes.setHeader("Content-Type",  "text/event-stream");
  httpRes.setHeader("Cache-Control", "no-cache");
  httpRes.setHeader("Connection",    "keep-alive");

  const send = (data) => httpRes.write(`data: ${JSON.stringify(data)}\n\n`);

  // Send engine info first
  send({ type: "engine", engine, model: engine === "claude" ? CLAUDE_MODEL : DEEPSEEK_MODEL });

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

    } else {
      // DeepSeek streaming
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
    }
  } catch (err) {
    send({ type: "error", message: err.message });
  } finally {
    httpRes.end();
  }
}

module.exports = { callAI, streamAI, loadSkills };
