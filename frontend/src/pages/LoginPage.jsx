import { useState } from "react";

const DEMO_USERS = [
  { name: "Ahmad Zulkifli",  role: "Mine Manager",       email: "ahmad@kros.my",   password: "admin123",  access: "admin"   },
  { name: "Farah Izzati",    role: "HSE Manager",        email: "farah@kros.my",   password: "hse123",    access: "manager" },
  { name: "Tan Mei Ling",    role: "Finance Manager",    email: "tan@kros.my",     password: "fin123",    access: "manager" },
  { name: "Amirul Haziq",    role: "Maintenance Tech.",  email: "amirul@kros.my",  password: "maint123",  access: "staff"   },
];

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await new Promise(r => setTimeout(r, 600)); // simulate auth

    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError("Invalid credentials. Try: ahmad@kros.my / admin123");
    }
    setLoading(false);
  };

  const quickLogin = (user) => {
    setEmail(user.email);
    setPassword(user.password);
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
            <input
              type="email"
              className="form-input"
              placeholder="you@company.com.my"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 14, fontSize: 12 }}>
              <span>⚠</span> {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="divider" />

        <div style={{ marginBottom: 10 }}>
          <div className="form-label" style={{ marginBottom: 8 }}>Quick Demo Access</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {DEMO_USERS.map(u => (
              <button
                key={u.email}
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: "flex-start", gap: 10 }}
                onClick={() => quickLogin(u)}
                type="button"
              >
                <span style={{ fontSize: 18 }}>
                  {u.role === "Mine Manager" ? "⬡" : u.role.includes("HSE") ? "⚠" : u.role.includes("Finance") ? "💰" : "🔧"}
                </span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{u.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            Powered by Anthropic Claude &amp; DeepSeek AI
          </span>
        </div>
      </div>
    </div>
  );
}
