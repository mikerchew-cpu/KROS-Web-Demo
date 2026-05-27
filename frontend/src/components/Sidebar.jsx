import { useKROS } from "../context/KROSContext";

const NAV_ITEMS = [
  { id: "dashboard",  icon: "⬡", label: "Dashboard" },
  { id: "ask",        icon: "✦", label: "Ask AI",           section: "AI" },
  { id: "skills",     icon: "◫", label: "Skills Library" },
  { id: "prod-board", icon: "📊",label: "Production Board",  section: "OPERATIONS" },
  { id: "hrm",        icon: "👥", label: "HRM" },
  { id: "assets",     icon: "🔧", label: "Assets",        section: "OPERATIONS" },
  { id: "workflow",   icon: "⚙", label: "Workflows" },
  { id: "handover",   icon: "⟳", label: "Shift Handover" },
  { id: "mine-analysis",icon:"⛏",label: "Mine Analysis" },
  { id: "production", icon: "⬡", label: "Production" },
  { id: "weightbridge",icon:"◈", label: "Fleet & Weigh" },
  { id: "grade-control",icon:"⟳",label: "Grade Control" },
  { id: "stockpile",  icon: "△", label: "Stockpiles" },
  { id: "blasting",   icon: "✦", label: "Blast Analysis" },
  { id: "training",   icon: "◎", label: "Training Matrix" },
  { id: "weather",    icon: "⛅", label: "Weather",          section: "HSE" },
  { id: "safety",     icon: "⚠", label: "Safety & Fatigue" },
  { id: "environmental",icon:"🌿",label: "Environmental" },
  { id: "predictive-mt",icon:"🔧",label: "Predictive Maint" },
  { id: "exec-report",icon:"📈", label: "Executive Report",  section: "REPORTING" },
  { id: "succession", icon: "⟳", label: "Succession" },
  { id: "exit",       icon: "◳", label: "Exit Capture" },
  { id: "compliance", icon: "⚖", label: "Compliance" },
  { id: "manual",     icon: "◈", label: "User Manual" },
  { id: "settings",   icon: "◎", label: "Settings",          section: "SYSTEM" },
];

const ADMIN_ITEM = { id: "admin", icon: "◈", label: "Admin", section: "SYSTEM" };

export default function Sidebar({ user, activePage, onNavigate, onLogout, theme, onToggleTheme, onNotif }) {
  const { notifications, activeEngine, aiEngines } = useKROS();
  const engine = aiEngines[activeEngine];
  const urgentCount = notifications.filter(n => n.type === "urgent").length;
  const isAdmin = user.access === "admin";
  const visibleNav = isAdmin
    ? [...NAV_ITEMS.slice(0, -1), ADMIN_ITEM, ...NAV_ITEMS.slice(-1)]
    : NAV_ITEMS;
  const initials = ((user.givenName?.[0] || "") + (user.surname?.[0] || "")).toUpperCase().slice(0, 2);
  let lastSection = null;

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">KR</div>
          <span className="logo-text">KROS</span>
        </div>
        <div className="logo-sub">Mine Ops System</div>
      </div>
      <div className="sidebar-nav">
        {visibleNav.map(item => {
          const showSection = item.section && item.section !== lastSection;
          if (showSection) lastSection = item.section;
          return (
            <div key={item.id}>
              {showSection && <div className="nav-section-label">{item.section}</div>}
              <div className={`nav-item${activePage === item.id ? " active" : ""}`} onClick={() => onNavigate(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.id === "dashboard" && urgentCount > 0 && <span className="nav-badge">{urgentCount}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="sidebar-footer">
        <div className="ai-engine-indicator" style={{ margin: "0 0 8px" }}>
          <div className="ai-dot" style={{
            background: engine.color === "purple" ? "var(--purple-light)" : engine.color === "gold" ? "var(--gold-light)" : "var(--teal-light)",
            boxShadow: `0 0 6px ${engine.color === "purple" ? "var(--purple-light)" : engine.color === "gold" ? "var(--gold-light)" : "var(--teal-light)"}`,
          }} />
          <span className="ai-engine-label">{engine.emoji} {engine.name}</span>
        </div>
        <button onClick={onToggleTheme} className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", fontSize: 12, gap: 6, marginBottom: 8 }}>
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
        <div className="user-card" onClick={onLogout} title="Sign out">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user.givenName} {user.surname}</div>
            <div className="user-role">{user.role}</div>
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: 14 }}>⇥</span>
        </div>
      </div>
    </nav>
  );
}
