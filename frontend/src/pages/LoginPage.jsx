import { useState, useEffect } from "react";
import { supabase, DEMO_USERS } from "../lib/supabase";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw new Error(authError.message);
      const token = data.session.access_token;
      localStorage.setItem("kros_token", token);

      const { data: profile } = await supabase.from("worker_profiles").select("*").eq("email", email).maybeSingle();
      const user = profile || { givenName: email.split("@")[0], surname: "", email, role: "Staff", access: "staff" };
      localStorage.setItem("kros_user", JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      const demoUser = DEMO_USERS.find(u => u.email === email.toLowerCase() && password === "123456");
      if (demoUser) {
        const token = btoa(JSON.stringify({ id: demoUser.email, exp: Date.now() + 28800000 }));
        localStorage.setItem("kros_token", token);
        localStorage.setItem("kros_user", JSON.stringify(demoUser));
        onLogin(demoUser);
      } else {
        setError(err.message === "Invalid login credentials" ? "Invalid email or password" : "Server unreachable. Use demo mode with password 123456.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">KR</div>
          <div className="login-title">KROS</div>
          <div className="login-sub">Knowledge Retention &amp; Operations System</div>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="you@company.com.my" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="alert alert-error" style={{ marginBottom: 14, fontSize: 12 }}><span>⚠</span> {error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <div className="divider" />
        <div style={{ marginBottom: 10 }}>
          <div className="form-label" style={{ marginBottom: 8 }}>Quick Demo Access</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {DEMO_USERS.map(u => (
              <button key={u.email} className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start", gap: 10 }} onClick={() => { setEmail(u.email); setPassword("123456"); }} type="button">
                <span style={{ fontSize: 18 }}>{u.role === "Mine Manager" ? "⬡" : u.role.includes("HSE") ? "⚠" : u.role.includes("Finance") ? "💰" : "🔧"}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600 }}>{u.givenName} {u.surname}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{u.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Default password: 123456 · Supabase Auth enabled</span>
        </div>
      </div>
    </div>
  );
}
