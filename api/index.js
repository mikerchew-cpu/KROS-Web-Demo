const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "https://hypgryszzgpzirdduxxd.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const path = req.url.split("?")[0];

  // Health
  if (path === "/api/health" && req.method === "GET") {
    const { count: skills } = await supabase.from("skills").select("*", { count: "exact", head: true });
    return res.json({ status: "ok", version: "3.0.0", timestamp: new Date().toISOString(), skills_loaded: skills || 0 });
  }

  // Skills list
  if (path === "/api/skills" && req.method === "GET") {
    const { data, error } = await supabase.from("skills").select("*").order("last_updated", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ count: data.length, skills: data });
  }

  // Skill by id
  if (path.startsWith("/api/skills/") && req.method === "GET") {
    const id = path.replace("/api/skills/", "");
    const { data, error } = await supabase.from("skills").select("*").eq("skill_id", id).single();
    if (error) return res.status(404).json({ error: "Skill not found" });
    return res.json(data);
  }

  // Workers list
  if (path === "/api/workers" && req.method === "GET") {
    const { data, error } = await supabase.from("worker_profiles").select("*").order("created_at");
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ count: data.length, workers: data });
  }

  // Assets list
  if (path === "/api/assets" && req.method === "GET") {
    const { data, error } = await supabase.from("assets").select("*").order("created_at");
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ count: data.length, assets: data });
  }

  // Notifications
  if (path === "/api/notifications" && req.method === "GET") {
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(20);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ notifications: data });
  }

  // Auth login
  if (path === "/api/auth/login" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const { email, password } = JSON.parse(body);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return res.status(401).json({ error: "Invalid credentials" });
        const { data: profile } = await supabase.from("worker_profiles").select("*").eq("email", email).maybeSingle();
        return res.json({ token: data.session.access_token, user: profile || { email, role: "Staff", access: "staff" }, expiresIn: "8h" });
      } catch { return res.status(400).json({ error: "Invalid request" }); }
    });
    return;
  }

  // Auth me
  if (path === "/api/auth/me" && req.method === "GET") {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Auth required" });
    const { data: { user }, error } = await supabase.auth.getUser(auth.slice(7));
    if (error || !user) return res.status(401).json({ error: "Invalid token" });
    const { data: profile } = await supabase.from("worker_profiles").select("*").eq("email", user.email).maybeSingle();
    return res.json(profile || { email: user.email });
  }

  // Production data
  if (path === "/api/production" && req.method === "GET") {
    const { data, error } = await supabase.from("production_days").select("*").order("date", { ascending: false }).limit(30);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ days: data });
  }

  // Safety observations
  if (path === "/api/safety/observations" && req.method === "GET") {
    const { data, error } = await supabase.from("safety_observations").select("*").order("date", { ascending: false }).limit(50);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ observations: data });
  }

  // Fallback
  return res.status(404).json({ error: "Not found", path });
};
