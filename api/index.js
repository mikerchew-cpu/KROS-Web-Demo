const https = require("https");

const SUPABASE_URL = "https://hypgryszzgpzirdduxxd.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cGdyeXN6emdwemlyZGR1eHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3OTkzOTIsImV4cCI6MjA5NTM3NTM5Mn0.fLka2W5LUw12RjaPqFGp8vnWPe8O8MWYtGVs5-b_pXI";

function json(res, code, data) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function supabaseFetch(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL + "/rest/v1");
    Object.entries(options.params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
    https.get(url.toString(), {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        ...(options.headers || {}),
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    }).on("error", reject);
  });
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") return res.end();

  try {
    const path = req.url.split("?")[0];

    if (path === "/api/health") {
      const result = await supabaseFetch("/skills", { params: { select: "count" }, headers: { Prefer: "count=exact" } });
      return json(res, 200, { status: "ok", version: "3.0.0", skills_loaded: (result.data || []).length, timestamp: new Date().toISOString() });
    }

    if (path === "/api/skills") {
      const result = await supabaseFetch("/skills", { params: { select: "*", order: "last_updated.desc" } });
      return json(res, 200, { count: (result.data || []).length, skills: result.data || [] });
    }

    if (path === "/api/workers") {
      const result = await supabaseFetch("/worker_profiles", { params: { select: "*", order: "created_at.asc" } });
      return json(res, 200, { count: (result.data || []).length, workers: result.data || [] });
    }

    if (path === "/api/assets") {
      const result = await supabaseFetch("/assets", { params: { select: "*", order: "created_at.asc" } });
      return json(res, 200, { count: (result.data || []).length, assets: result.data || [] });
    }

    if (path === "/api/notifications") {
      const result = await supabaseFetch("/notifications", { params: { select: "*", order: "created_at.desc", limit: "20" } });
      return json(res, 200, { notifications: result.data || [] });
    }

    return json(res, 200, { api: "kros-v3", path, method: req.method, status: "ready" });
  } catch (err) {
    return json(res, 500, { error: err.message });
  }
};
