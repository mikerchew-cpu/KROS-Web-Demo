import { useState, useEffect, lazy, Suspense } from "react";
import { KROSProvider } from "./context/KROSContext";
import Sidebar from "./components/Sidebar";
import GlobalSearch from "./components/GlobalSearch";
import QuickActions from "./components/QuickActions";
import NotificationCenter from "./components/NotificationCenter";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import Compliance, { Settings } from "./pages/Compliance";
import "./styles/globals.css";

const SkillsLibrary = lazy(() => import("./pages/SkillsLibrary"));
const AskClaude = lazy(() => import("./pages/AskClaude"));
const SuccessionMap = lazy(() => import("./pages/SuccessionMap"));
const ExitCapture = lazy(() => import("./pages/ExitCapture"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const Workflow = lazy(() => import("./pages/Workflow"));
const MineAnalysis = lazy(() => import("./pages/MineAnalysis"));
const ProductionAnalysis = lazy(() => import("./pages/ProductionAnalysis"));
const UserManual = lazy(() => import("./pages/UserManual"));
const ProductionBoard = lazy(() => import("./pages/ProductionBoard"));
const ShiftHandover = lazy(() => import("./pages/ShiftHandover"));
const SafetyObservation = lazy(() => import("./pages/SafetyObservation"));
const Weightbridge = lazy(() => import("./pages/Weightbridge"));
const GradeControl = lazy(() => import("./pages/GradeControl"));
const StockpileManager = lazy(() => import("./pages/StockpileManager"));
const BlastDashboard = lazy(() => import("./pages/BlastDashboard"));
const EnvironmentalMonitor = lazy(() => import("./pages/EnvironmentalMonitor"));
const PredictiveMaintenance = lazy(() => import("./pages/PredictiveMaintenance"));
const ExecutiveReport = lazy(() => import("./pages/ExecutiveReport"));
const TrainingMatrix = lazy(() => import("./pages/TrainingMatrix"));
const WeatherDashboard = lazy(() => import("./pages/WeatherDashboard"));
const HRMModule = lazy(() => import("./pages/HRMModule"));
const AssetManagement = lazy(() => import("./pages/AssetManagement"));

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("kros_theme") || "system");
  const [showLogin, setShowLogin] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const getEffectiveTheme = (t) => {
    if (t === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return t;
  };

  useEffect(() => {
    const effective = getEffectiveTheme(theme);
    document.documentElement.setAttribute("data-theme", effective);
    localStorage.setItem("kros_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      document.documentElement.setAttribute("data-theme", mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : prev === "light" ? "system" : "dark");
  };
  window.__KROS_NAV = setActivePage;

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

  if (!user && !showLogin) return <LandingPage onGetStarted={() => setShowLogin(true)} theme={theme} onToggleTheme={cycleTheme} />;
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
    "training":      <TrainingMatrix />,
    "weather":       <WeatherDashboard />,
    "hrm":           <HRMModule />,
    "assets":        <AssetManagement />,
  };

  return (
    <KROSProvider>
      <div className="app-shell">
        <Sidebar user={user} activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} theme={theme} onToggleTheme={cycleTheme} />
        <div className="main-area">
          <header className="top-bar">
            <GlobalSearch onNavigate={setActivePage} />
            <div className="top-bar-actions">
              <QuickActions onNavigate={setActivePage} />
              <button className="top-bar-notif" onClick={() => setShowNotif(true)} title="Notifications">
                🔔
              </button>
            </div>
          </header>
          <main className="main-content">
            <Suspense fallback={<div className="page-loading"><div className="loading-dots" style={{ justifyContent: "center", padding: 40 }}><span/><span/><span/></div></div>}>
              {pages[activePage] || <Dashboard user={user} onNavigate={setActivePage} />}
            </Suspense>
          </main>
        </div>
      </div>
      {showNotif && <NotificationCenter onClose={() => setShowNotif(false)} />}
    </KROSProvider>
  );
}
