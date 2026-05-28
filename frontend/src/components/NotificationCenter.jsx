import { useState } from "react";

const ALERTS = [
  { id: 1, module: "License", message: "Sungai Lembing mining license expiry in 7 days", severity: "critical", time: "2m ago", read: false },
  { id: 2, module: "Maintenance", message: "CR-02 drive bearing failure probability 82% within 3 days", severity: "critical", time: "15m ago", read: false },
  { id: 3, module: "Training", message: "Ahmad Z. — DOSH certification expired 120 days overdue", severity: "critical", time: "1h ago", read: false },
  { id: 4, module: "Weather", message: "Thunderstorms forecast +2 days — postpone blasting", severity: "warning", time: "2h ago", read: false },
  { id: 5, module: "Safety", message: "Kevin Tan at 68h/week — exceeds DOSH 60h limit", severity: "warning", time: "3h ago", read: false },
  { id: 6, module: "Production", message: "Afternoon shift 4.8% below target — conveyor splice delay", severity: "warning", time: "4h ago", read: false },
  { id: 7, module: "Environment", message: "TSS at C2 trending up — 78 mg/L (limit 100)", severity: "info", time: "5h ago", read: true },
  { id: 8, module: "Stockpile", message: "Low Grade stockpile at 91% capacity — plan reclaim", severity: "info", time: "6h ago", read: true },
  { id: 9, module: "Financial", message: "Monthly royalty submission due in 7 days", severity: "info", time: "8h ago", read: true },
];

export default function NotificationCenter({ onClose }) {
  const [alerts, setAlerts] = useState(ALERTS);
  const [filter, setFilter] = useState("all");

  const markRead = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, read: true })));

  const filtered = filter === "all" ? alerts : filter === "unread" ? alerts.filter(a => !a.read) : alerts.filter(a => a.severity === filter);
  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-panel" onClick={e => e.stopPropagation()}>
        <div className="notif-header">
          <div className="notif-title">
            <span>🔔 Notifications</span>
            {unreadCount > 0 && <span className="badge badge-red">{unreadCount} new</span>}
          </div>
          <div className="notif-header-actions">
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="notif-filters">
          <button className={`notif-filter ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
          <button className={`notif-filter ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>Unread</button>
          <button className={`notif-filter ${filter === "critical" ? "active" : ""}`} onClick={() => setFilter("critical")}>Critical</button>
          <button className={`notif-filter ${filter === "warning" ? "active" : ""}`} onClick={() => setFilter("warning")}>Warnings</button>
        </div>

        <div className="notif-list">
          {filtered.map(a => (
            <div key={a.id} className={`notif-item ${!a.read ? "unread" : ""} ${a.severity}`} onClick={() => markRead(a.id)}>
              <div className="notif-item-icon">
                {a.severity === "critical" ? "🔴" : a.severity === "warning" ? "🟡" : "🔵"}
              </div>
              <div className="notif-item-content">
                <div className="notif-item-module">{a.module}</div>
                <div className="notif-item-message">{a.message}</div>
                <div className="notif-item-time">{a.time}</div>
              </div>
              {!a.read && <div className="notif-unread-dot" />}
            </div>
          ))}
        </div>

        <div className="notif-footer">
          <span className="notif-footer-text">{alerts.length} total · {unreadCount} unread</span>
        </div>
      </div>
    </div>
  );
}
