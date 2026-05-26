import { useKROS } from "../context/KROSContext";

const NAV_ITEMS = [
  { id: "dashboard",  icon: "⬡", label: "Dashboard" },
  { id: "ask",        icon: "✦", label: "Ask AI",       section: "AI" },
  { id: "skills",     icon: "◫", label: "Skills Library" },
  { id: "succession", icon: "⟳", label: "Succession" },
  { id: "exit",       icon: "◳", label: "Exit Capture" },
  { id: "compliance", icon: "⚖", label: "Compliance" },
  { id: "settings",   icon: "◎", label: "Settings",     section: "SYSTEM" },
];

export default function Sidebar({ user, activePage, onNavigate, onLogout, theme, onToggleTheme }) {
  const { notifications, activeEngine, aiEngines } = useKROS();
  const engine = aiEngines[activeEngine];
  const urgentCount = notifications.filter(n => n.type === "urgent").length;

  const initials = user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  let lastSection = null;

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">KR</div>
          <span className="logo-text">KROS</span>
        </div>
        <div className="logo-sub">Knowledge Engine</div>
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        {NAV_ITEMS.map(item => {
          const showSection = item.section && item.section !== lastSection;
          if (showSection) lastSection = item.section;
          return (
            <div key={item.id}>
              {showSection && (
                <div className="nav-section-label">{item.section}</div>
              )}
              <div
                className={`nav-item${activePage === item.id ? " active" : ""}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.id === "dashboard" && urgentCount > 0 && (
                  <span className="nav-badge">{urgentCount}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Engine indicator */}
      <div className="ai-engine-indicator">
        <div className="ai-dot" style={{
          background: engine.color === "purple" ? "var(--purple-light)" : engine.color === "gold" ? "var(--gold-light)" : "var(--teal-light)",
          boxShadow: `0 0 6px ${engine.color === "purple" ? "var(--purple-light)" : engine.color === "gold" ? "var(--gold-light)" : "var(--teal-light)"}`,
        }} />
        <span className="ai-engine-label">{engine.emoji} {engine.name} · {engine.model}</span>
      </div>

      {/* Theme toggle */}
      <div style={{ padding: "0 18px 8px", display: "flex", justifyContent: "center" }}>
        <button
          onClick={onToggleTheme}
          className="btn btn-ghost btn-sm"
          style={{ width: "100%", justifyContent: "center", fontSize: 13, gap: 6 }}
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* User card */}
      <div className="sidebar-footer">
        <div className="user-card" onClick={onLogout} title="Click to sign out">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: 14 }}>⇥</span>
        </div>
      </div>
    </nav>
  );
}
