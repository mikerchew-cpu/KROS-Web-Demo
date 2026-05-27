import { useState } from "react";

const DEMO_USERS = [
  { givenName: "Ahmad",    surname: "Zulkifli",  role: "Mine Manager",      email: "ahmad@kros.my",  access: "admin"   },
  { givenName: "Farah",    surname: "Izzati",    role: "HSE Manager",       email: "farah@kros.my",  access: "manager" },
  { givenName: "Tan Mei",  surname: "Ling",      role: "Finance Manager",   email: "tan@kros.my",    access: "manager" },
  { givenName: "Amirul",   surname: "Haziq",     role: "Maintenance Tech.", email: "amirul@kros.my", access: "staff"   },
];

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [mustChange, setMustChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changeError, setChangeError] = useState("");
  const [changeSuccess, setChangeSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }
      localStorage.setItem("kros_token", data.token);
      if (data.mustChangePassword) {
        setMustChange(true);
        setLoading(false);
        return;
      }
      onLogin(data.user);
    } catch {
      // Offline/demo mode — authenticate locally when backend is unreachable
      const user = DEMO_USERS.find(u => u.email === email.toLowerCase() && password === "123456");
      if (user) {
        const token = btoa(JSON.stringify({ id: user.email, exp: Date.now() + 28800000 }));
        localStorage.setItem("kros_token", token);
        onLogin(user);
      } else {
        setError("Server unreachable. In demo mode, use any account with password 123456.");
      }
    }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangeError("");
    if (newPassword.length < 4) {
      setChangeError("Password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError("Passwords do not match");
      return;
    }
    try {
      const token = localStorage.getItem("kros_token");
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: password, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChangeError(data.error || "Failed to update password");
        return;
      }
      setChangeSuccess(true);
      setTimeout(async () => {
        // Re-login with new password automatically
        const res2 = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: newPassword }),
        });
        const data2 = await res2.json();
        localStorage.setItem("kros_token", data2.token);
        onLogin(data2.user);
      }, 1500);
    } catch {
      setChangeError("Server unreachable");
    }
  };

  const quickLogin = (user) => {
    setEmail(user.email);
    setPassword("");
    setError("");
  };

  if (mustChange) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon">KR</div>
            <div className="login-title">Change Password</div>
            <div className="login-sub">First-time login — please set a new password</div>
          </div>

          {changeSuccess ? (
            <div className="alert alert-info" style={{ marginBottom: 14 }}>
              <span>✓</span> Password updated! Logging you in…
            </div>
          ) : (
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" placeholder="at least 4 characters"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={4} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-input" placeholder="retype password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>

              {changeError && (
                <div className="alert alert-error" style={{ marginBottom: 14, fontSize: 12 }}>
                  <span>⚠</span> {changeError}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px" }}>
                Set New Password
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

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
            <input type="email" className="form-input" placeholder="you@company.com.my"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
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
              <button key={u.email} className="btn btn-ghost btn-sm"
                style={{ justifyContent: "flex-start", gap: 10 }}
                onClick={() => { setEmail(u.email); setPassword("123456"); }}
                type="button">
                <span style={{ fontSize: 18 }}>
                  {u.role === "Mine Manager" ? "⬡" : u.role.includes("HSE") ? "⚠" : u.role.includes("Finance") ? "💰" : "🔧"}
                </span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600 }}>{u.givenName} {u.surname}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{u.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            Default password: 123456
          </span>
        </div>
      </div>
    </div>
  );
}
