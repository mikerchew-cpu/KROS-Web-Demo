import { useState } from "react";

const ACTIONS = [
  { id: "ask", icon: "✦", label: "Ask AI", shortcut: "Ctrl+K" },
  { id: "prod-board", icon: "📊", label: "Production Board", shortcut: "Ctrl+1" },
  { id: "handover", icon: "⟳", label: "Shift Handover", shortcut: "Ctrl+2" },
  { id: "weightbridge", icon: "◈", label: "New Weigh Ticket", shortcut: "Ctrl+3" },
  { id: "blasting", icon: "✦", label: "New Blast Record", shortcut: "Ctrl+4" },
  { id: "safety", icon: "⚠", label: "Report Hazard", shortcut: "Ctrl+5" },
  { id: "exec-report", icon: "📈", label: "Generate Report", shortcut: "Ctrl+6" },
];

export default function QuickActions({ onNavigate }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="quick-actions">
      <button className="quick-actions-trigger" onClick={() => setOpen(!open)} title="Quick Actions (Ctrl+Space)">
        ⚡
      </button>
      {open && (
        <div className="quick-actions-dropdown">
          <div className="quick-actions-header">Quick Actions</div>
          {ACTIONS.map(a => (
            <div key={a.id} className="quick-action-item" onClick={() => { setOpen(false); onNavigate(a.id); }}>
              <span className="quick-action-icon">{a.icon}</span>
              <span className="quick-action-label">{a.label}</span>
              <span className="quick-action-shortcut">{a.shortcut}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
