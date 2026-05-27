const { createClient } = require("@supabase/supabase-js");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || "https://hypgryszzgpzirdduxxd.supabase.co",
      process.env.VITE_SUPABASE_ANON_KEY
    );

    if (req.url === "/api/health" && req.method === "GET") {
      const { count } = await supabase.from("skills").select("*", { count: "exact", head: true });
      return res.status(200).json({ status: "ok", version: "3.0.0", skills_loaded: count || 0 });
    }

    return res.status(200).json({ message: "API ready", path: req.url });
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
};
