import { useState } from "react";

const MODULES = [
  {
    id: "overview", label: "System Overview", icon: "⬡",
    sections: [
      { title: "What is KROS?", content: "Knowledge Retention & Operations System — an AI-powered operational knowledge management platform for Malaysian mining SMEs. It combines AI chat (Claude + DeepSeek + Gemini), document management (SKILL.md files), succession planning, compliance tracking, and knowledge capture." },
      { title: "Getting Started", content: "Login with your credentials. Navigate using the sidebar menu. The default password for new users is 123456." },
      { title: "Theme Switching", content: "Toggle between dark and light mode using the theme button at the bottom of the sidebar." },
    ]
  },
  {
    id: "dashboard", label: "Dashboard", icon: "◫",
    sections: [
      { title: "Overview", content: "The Dashboard provides a real-time view of key operational metrics including skills status, succession risks, compliance deadlines, and recent AI activity." },
      { title: "KPI Cards", content: "Each KPI card shows a key metric. Click on a card to expand it and see the trend bar with additional detail." },
      { title: "Skills Health", content: "The left panel shows skills needing attention (stale or urgent). The progress bar shows overall skills freshness percentage." },
      { title: "Succession Monitor", content: "The right panel displays succession risk for key roles. Critical gaps are highlighted in red." },
      { title: "Recent Activity", content: "The table at the bottom shows the latest staff interactions with KROS and AI systems." },
    ]
  },
  {
    id: "ask", label: "Ask AI", icon: "✦",
    sections: [
      { title: "How to Ask", content: "Type your question in the chat input box and press Enter. Ask operational questions in plain English or Bahasa Malaysia. The AI will search the SKILL.md knowledge base for answers." },
      { title: "AI Routing", content: "Queries are automatically routed based on data sensitivity: High sensitivity (HR, payroll, financial) goes to Claude or Gemini. Low sensitivity (SOPs, maintenance, checklists) uses DeepSeek. You can override the engine selection manually." },
      { title: "Skill Detection", content: "The AI automatically detects which skill file your question relates to and tags the response with the skill reference." },
      { title: "Suggested Questions", content: "Click on any suggested question to quickly start a conversation. These cover common topics across all operational areas." },
      { title: "AI Analysis", content: "For analysis queries, the AI first checks internal skill files, then cross-references with connected AI engines for comprehensive reporting with recommendations." },
    ]
  },
  {
    id: "skills", label: "Skills Library", icon: "◫",
    sections: [
      { title: "Overview", content: "Browse all 35 SKILL.md files organised by module. Each card shows the skill name, title, description, owner, and status." },
      { title: "Filtering", content: "Use the module filter buttons at the top to show skills from specific modules only." },
      { title: "Skill Status", content: "Skills are marked as: Fresh (current), Stale (needs review), or Urgent (overdue). The status dot colour indicates the urgency level." },
      { title: "Creating Skills", content: "Admin users can create new skill files directly from the Library page." },
    ]
  },
  {
    id: "succession", label: "Succession Planning", icon: "⟳",
    sections: [
      { title: "Overview", content: "The Succession Matrix shows readiness levels for each key role: Ready Now, Ready in 12 months, and Ready in 24 months." },
      { title: "Risk Ratings", content: "Roles are rated as: Managed (green) — deputy identified; At-Risk (yellow) — partial coverage; Critical (red) — no identified successor." },
      { title: "Deputy Activation", content: "To activate a deputy, notify the Mine Manager, update Mine Control, notify PTW holders, and log the activation in HRMS." },
    ]
  },
  {
    id: "exit", label: "Exit Capture", icon: "◳",
    sections: [
      { title: "Overview", content: "The Exit Knowledge Capture module facilitates AI-assisted exit interviews to preserve departing employees' knowledge before they leave." },
      { title: "Process", content: "5-step process: Notice Received → Department Clearance → IT Return → Finance Settlement → Final Interview. The AI generates interview questions based on the employee's role and skill ownership." },
    ]
  },
  {
    id: "compliance", label: "Compliance", icon: "⚖",
    sections: [
      { title: "Overview", content: "The Compliance calendar tracks Malaysian regulatory deadlines including EPF, SOCSO, DOE, DOSH, and JMG submissions." },
      { title: "Adding Items", content: "Admin users can add new compliance items with categories, deadlines, authorities, and amounts." },
    ]
  },
  {
    id: "workflow", label: "Workflow Manager", icon: "⚙",
    sections: [
      { title: "Overview", content: "Track and manage active workflows across all mining operations. Workflows include PTW applications, PO approvals, breakdown responses, and more." },
      { title: "Active Tasks", content: "View tasks by status: Active, Overdue, or All. Click on a task to see details. Status dots indicate progress." },
      { title: "Workflow Templates", content: "Browse all available workflow templates. Click any template to ask AI to start the process." },
    ]
  },
  {
    id: "mine-analysis", label: "Mine Analysis", icon: "⛏",
    sections: [
      { title: "Overview", content: "AI-powered mining data analysis covering grade control, dilution, blasting, costs, fleet efficiency, and reconciliation." },
      { title: "Skill Upload", content: "Upload mine data files (CSV, XLSX, PDF) for AI analysis. Drag and drop files or click to browse. Processed files appear in the upload history." },
      { title: "Analysis Modes", content: "Select an analysis type to generate insights. Each mode provides specific KPIs, trend analysis, and AI recommendations." },
    ]
  },
  {
    id: "production", label: "Production Analysis", icon: "📊",
    sections: [
      { title: "Overview", content: "Real-time production tracking with shift-level analysis. Monitor tonnes, grade, recovery, uptime, cost, and compliance metrics." },
      { title: "Shift Details", content: "View production data by shift (Morning, Afternoon, Night) including tonnes, grade, downtime, and notes." },
      { title: "AI Insights", content: "The system automatically generates production insights based on uploaded shift reports and data files." },
    ]
  },
  {
    id: "admin", label: "Admin", icon: "◈",
    sections: [
      { title: "User Management", content: "Admin users can view, create, edit, and delete system users. Access levels: Admin, Manager, Staff." },
      { title: "Creating Users", content: "Click 'Add User' and fill in the form. New users get default password '123456' and must change on first login." },
      { title: "Invite Users", content: "Use the invite feature to send email invitations to new users." },
    ]
  },
  {
    id: "settings", label: "Settings", icon: "◎",
    sections: [
      { title: "Overview", content: "Configure AI engine settings and view API key status. Settings are persistent across sessions." },
    ]
  },
];

export default function UserManual() {
  const [activeModule, setActiveModule] = useState("overview");

  const mod = MODULES.find(m => m.id === activeModule);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">User Manual</div>
          <div className="page-subtitle">Complete documentation for all KROS modules and features</div>
        </div>
      </div>

      <div className="manual-layout">
        <div className="manual-toc">
          <div className="card" style={{ padding: 12 }}>
            <div className="manual-toc-title">Modules</div>
            {MODULES.map(m => (
              <div key={m.id}
                className={`manual-toc-item ${activeModule === m.id ? "active" : ""}`}
                onClick={() => setActiveModule(m.id)}>
                <span className="manual-toc-icon">{m.icon}</span>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="manual-content">
          <div className="card">
            <div className="card-header">
              <div className="manual-content-header">
                <span className="manual-content-icon">{mod.icon}</span>
                <div>
                  <div className="card-title">{mod.label}</div>
                  <div className="card-subtitle">{mod.sections.length} section{mod.sections.length > 1 ? "s" : ""}</div>
                </div>
              </div>
            </div>
            <div className="card-body">
              {mod.sections.map((sec, i) => (
                <div key={i} className="manual-section">
                  <div className="manual-section-title">{sec.title}</div>
                  <div className="manual-section-content">{sec.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
