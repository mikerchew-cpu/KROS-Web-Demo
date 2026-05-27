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
import ProductionBoard from "./pages/ProductionBoard";
import ShiftHandover from "./pages/ShiftHandover";
import SafetyObservation from "./pages/SafetyObservation";
import Weightbridge from "./pages/Weightbridge";
import GradeControl from "./pages/GradeControl";
import StockpileManager from "./pages/StockpileManager";
import BlastDashboard from "./pages/BlastDashboard";
import EnvironmentalMonitor from "./pages/EnvironmentalMonitor";
import PredictiveMaintenance from "./pages/PredictiveMaintenance";
import ExecutiveReport from "./pages/ExecutiveReport";
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
    const token = localStorage.getItem("kros_token");
    if (stored && token) {
      try {
        const parsed = JSON.parse(stored);
        const tokenData = JSON.parse(atob(token));
        if (tokenData.exp && tokenData.exp > Date.now()) { setUser(parsed); return; }
      } catch {}
    }
  }, []);

  const handleLogin = (u) => { localStorage.setItem("kros_user", JSON.stringify(u)); setUser(u); setActivePage("dashboard"); };
  const handleLogout = () => { localStorage.removeItem("kros_user"); localStorage.removeItem("kros_token"); setShowLogin(false); setUser(null); };
  window.__KROS_NAV = setActivePage;

  if (!user && !showLogin) return <LandingPage onGetStarted={() => setShowLogin(true)} theme={theme} onToggleTheme={toggleTheme} />;
  if (!user) return <LoginPage onLogin={handleLogin} />;

  const pages = {
    dashboard:       <Dashboard        user={user} onNavigate={setActivePage} />,
    skills:          <SkillsLibrary    onNavigate={setActivePage} />,
    ask:             <AskClaude        user={user} />,
    succession:      <SuccessionMap />,
    exit:            <ExitCapture />,
    compliance:      <Compliance />,
    admin:           <AdminPage        user={user} />,
    settings:        <Settings         user={user} onLogout={handleLogout} />,
    workflow:        <Workflow />,
    "mine-analysis": <MineAnalysis />,
    "production":    <ProductionAnalysis />,
    manual:          <UserManual />,
    "prod-board":    <ProductionBoard />,
    "handover":      <ShiftHandover />,
    "safety":        <SafetyObservation />,
    "weightbridge":  <Weightbridge />,
    "grade-control": <GradeControl />,
    "stockpile":     <StockpileManager />,
    "blasting":      <BlastDashboard />,
    "environmental": <EnvironmentalMonitor />,
    "predictive-mt": <PredictiveMaintenance />,
    "exec-report":   <ExecutiveReport />,
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
