import { useState, useEffect } from "react";
import { KROSProvider } from "./context/KROSContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import SkillsLibrary from "./pages/SkillsLibrary";
import AskClaude from "./pages/AskClaude";
import SuccessionMap from "./pages/SuccessionMap";
import ExitCapture from "./pages/ExitCapture";
import Compliance, { Settings } from "./pages/Compliance";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import "./styles/globals.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("kros_theme") || "dark");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("kros_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

  useEffect(() => {
    const stored = localStorage.getItem("kros_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogin = (u) => { localStorage.setItem("kros_user", JSON.stringify(u)); setUser(u); };
  const handleLogout = () => { localStorage.removeItem("kros_user"); setUser(null); };

  if (!user && !showLogin) return <LandingPage onGetStarted={() => setShowLogin(true)} theme={theme} onToggleTheme={toggleTheme} />;
  if (!user) return <LoginPage onLogin={handleLogin} />;

  const pages = {
    dashboard:  <Dashboard   user={user} onNavigate={setActivePage} />,
    skills:     <SkillsLibrary />,
    ask:        <AskClaude   user={user} />,
    succession: <SuccessionMap />,
    exit:       <ExitCapture />,
    compliance: <Compliance />,
    settings:   <Settings    user={user} onLogout={handleLogout} />,
  };

  return (
    <KROSProvider>
      <div className="app-shell">
        <Sidebar user={user} activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
        <main className="main-content">
          {pages[activePage] || <Dashboard user={user} onNavigate={setActivePage} />}
        </main>
      </div>
    </KROSProvider>
  );
}
