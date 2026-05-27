import { useState } from "react";

const WORKFLOWS = [
  { id: "ptw", label: "Permit-to-Work Application", module: "hse", steps: 4, sla: "4 hours", icon: "⚖", alerts: true },
  { id: "exit", label: "Exit Clearance Process", module: "hrm", steps: 5, sla: "14 days", icon: "◳", alerts: true },
  { id: "po", label: "Purchase Order Approval", module: "fin", steps: 3, sla: "48 hours", icon: "💰", alerts: true },
  { id: "onboard", label: "New Hire Onboarding", module: "hrm", steps: 6, sla: "30 days", icon: "◈", alerts: false },
  { id: "ptw_close", label: "PTW Closure & Verification", module: "hse", steps: 3, sla: "2 hours", icon: "✓", alerts: true },
  { id: "breakdown", label: "Breakdown Response (P1/P2)", module: "maint", steps: 5, sla: "30 min", icon: "🔧", alerts: true },
  { id: "royalty", label: "Royalty Submission", module: "fin", steps: 4, sla: "Monthly", icon: "📊", alerts: true },
  { id: "incident", label: "Incident Reporting & Investigation", module: "hse", steps: 6, sla: "24 hours", icon: "⚠", alerts: true },
  { id: "shift", label: "Shift Handover", module: "ops", steps: 6, sla: "15 min", icon: "⟳", alerts: false },
  { id: "competency", label: "Competency Assessment", module: "hrm", steps: 4, sla: "Quarterly", icon: "◎", alerts: true },
  { id: "env_report", label: "Environmental Report Submission", module: "env", steps: 5, sla: "Monthly", icon: "🌿", alerts: true },
  { id: "project_gate", label: "Project Gate Review", module: "proj", steps: 5, sla: "Per phase", icon: "⬡", alerts: false },
  { id: "inspection", label: "Quality Inspection Hold", module: "qa", steps: 4, sla: "24 hours", icon: "◫", alerts: true },
  { id: "fuel_order", label: "Fuel Reorder Request", module: "eng", steps: 3, sla: "4 hours", icon: "⛽", alerts: true },
  { id: "community_grievance", label: "Community Grievance Resolution", module: "com", steps: 5, sla: "14 days", icon: "🤝", alerts: true },
  { id: "stocktake", label: "Stocktake & Inventory Count", module: "log", steps: 4, sla: "Monthly", icon: "📦", alerts: false },
];

const MODULE_COLORS = {
  hse: "var(--red)", hrm: "#6BAED6", fin: "var(--gold)", maint: "var(--green-light)",
  ops: "var(--teal)", env: "var(--teal-light)", proj: "var(--purple-light)",
  qa: "var(--green)", eng: "var(--gold-light)", com: "var(--navy-light)", log: "var(--gold)",
};

const ACTIVE_WORKFLOWS_DATA = [
  { id: "WF-001", name: "PTW — Crusher #3 Maintenance", assignee: "Amirul Haziq", status: "in_progress", step: "Authorisation", due: "Today 14:00" },
  { id: "WF-002", name: "PO — Liner Set (x4)", assignee: "Tan Mei Ling", status: "pending", step: "Finance Review", due: "Tomorrow 09:00" },
  { id: "WF-003", name: "Breakdown — Conveyor Belt #2", assignee: "Raj Namasivayam", status: "overdue", step: "Root Cause Analysis", due: "Overdue 2h" },
  { id: "WF-004", name: "Exit Clearance — Rosniza bt Hamid", assignee: "HR Manager", status: "in_progress", step: "Department Clearance", due: "2025-06-10" },
  { id: "WF-005", name: "Royalty Submission — Q2 2025", assignee: "Tan Mei Ling", status: "pending", step: "Data Compilation", due: "2025-06-30" },
  { id: "WF-006", name: "Community Grievance — Dust Complaint", assignee: "Community Relations Mgr", status: "overdue", step: "Investigation", due: "Overdue 5d" },
];

const STEPS_MAP = {
  "PTW Application": ["Task Assessment", "Permit Application", "Authorisation", "Execution", "Closure"],
  "Exit Clearance": ["Notice Received", "Department Clearance", "IT Return", "Finance Settlement", "Final Interview"],
  "PO Approval": ["Requisition", "Manager Approve", "Finance Approve", "PO Issued"],
  "Breakdown Response": ["Log Call", "Dispatch Tech", "Diagnose", "Repair", "Close Out"],
  "Incident Reporting": ["Initial Report", "Scene Secure", "Investigation", "Root Cause", "Corrective Action", "Close"],
  "Shift Handover": ["Production Status", "Equipment", "Safety", "People", "Actions", "Sign Off"],
  "Community Grievance": ["Register", "Acknowledge", "Investigate", "Resolve", "Close"],
  "Stocktake": ["Prepare", "Count", "Verify", "Update System"],
};

export default function Workflow() {
  const [activeTab, setActiveTab] = useState("active");
  const [selected, setSelected] = useState(null);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Workflow Manager</div>
          <div className="page-subtitle">Active processes, approvals, and task tracking across all mining operations</div>
        </div>
        <div className="tabs">
          <button className={`tab ${activeTab === "active" ? "active" : ""}`} onClick={() => setActiveTab("active")}>Active ({ACTIVE_WORKFLOWS_DATA.filter(w => w.status !== "overdue").length + 2})</button>
          <button className={`tab ${activeTab === "overdue" ? "active" : ""}`} onClick={() => setActiveTab("overdue")}>Overdue ({ACTIVE_WORKFLOWS_DATA.filter(w => w.status === "overdue").length})</button>
          <button className={`tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All Workflows</button>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 16 }}>
        <span>⚙</span>
        <span><strong>AI Workflow Assistant:</strong> Use "Ask AI" to check workflow status, get step guidance, or request automated follow-ups.</span>
      </div>

      <div className="dashboard-panels">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Active Tasks</div>
            <div className="card-subtitle">{ACTIVE_WORKFLOWS_DATA.filter(w => w.status !== "overdue").length} in progress</div>
          </div>
          <div className="card-body">
            {ACTIVE_WORKFLOWS_DATA.filter(w => activeTab === "overdue" ? w.status === "overdue" : activeTab === "active" ? w.status !== "overdue" : true).map(wf => (
              <div key={wf.id} className={`list-row ${selected === wf.id ? "selected" : ""}`} onClick={() => setSelected(selected === wf.id ? null : wf.id)}>
                <div className={`wf-status-dot ${wf.status}`} />
                <div className="list-row-content">
                  <div className="list-row-title">{wf.name}</div>
                  <div className="list-row-meta">{wf.id} · {wf.assignee} · Step: {wf.step}</div>
                </div>
                <div className="list-row-end">
                  <span className={`badge badge-${wf.status === "overdue" ? "red" : wf.status === "in_progress" ? "gold" : "teal"}`}>{wf.status}</span>
                  <div className="cell-mono" style={{ fontSize: 10, marginTop: 2 }}>{wf.due}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Workflow Templates</div>
            <div className="card-subtitle">Start a new process from any template</div>
          </div>
          <div className="wf-grid">
            {WORKFLOWS.map(w => (
              <div key={w.id} className="wf-card" onClick={() => onNavigate("ask")} title="Ask AI to start this workflow">
                <div className="wf-card-icon" style={{ background: MODULE_COLORS[w.module] || "var(--text-muted)" }}>{w.icon}</div>
                <div className="wf-card-content">
                  <div className="wf-card-title">{w.label}</div>
                  <div className="wf-card-meta">{w.steps} steps · SLA: {w.sla}</div>
                </div>
                {w.alerts && <span className="wf-alert-dot" title="Alerts enabled" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function onNavigate(page) {
  try { window.__KROS_NAV && window.__KROS_NAV(page); } catch {}
}
