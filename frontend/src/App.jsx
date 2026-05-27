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
import AdminPage from "./pages/AdminPage";
import Workflow from "./pages/Workflow";
import MineAnalysis from "./pages/MineAnalysis";
import ProductionAnalysis from "./pages/ProductionAnalysis";
import UserManual from "./pages/UserManual";
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

  const restoreSession = () => {
    const stored = localStorage.getItem("kros_user");
    const token = localStorage.getItem("kros_token");
    if (stored && token) {
      try {
        const parsed = JSON.parse(stored);
        const tokenData = JSON.parse(atob(token));
        if (tokenData.exp && tokenData.exp > Date.now()) {
          setUser(parsed);
          return true;
        }
      } catch {}
      localStorage.removeItem("kros_user");
      localStorage.removeItem("kros_token");
    }
    return false;
  };

  useEffect(() => { restoreSession(); }, []);

  const handleLogin = (u) => {
    localStorage.setItem("kros_user", JSON.stringify(u));
    setUser(u);
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("kros_user");
    localStorage.removeItem("kros_token");
    setShowLogin(false);
    setUser(null);
  };

  window.__KROS_NAV = setActivePage;

  if (!user && !showLogin) return <LandingPage onGetStarted={() => setShowLogin(true)} theme={theme} onToggleTheme={toggleTheme} />;
  if (!user) return <LoginPage onLogin={handleLogin} />;

  const pages = {
    dashboard:          <Dashboard   user={user} onNavigate={setActivePage} />,
    skills:             <SkillsLibrary onNavigate={setActivePage} />,
    ask:                <AskClaude   user={user} />,
    succession:         <SuccessionMap />,
    exit:               <ExitCapture />,
    compliance:         <Compliance />,
    admin:              <AdminPage   user={user} />,
    settings:           <Settings    user={user} onLogout={handleLogout} />,
    workflow:           <Workflow />,
    "mine-analysis":    <MineAnalysis />,
    "production":       <ProductionAnalysis />,
    manual:             <UserManual />,
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
