import { useState, useMemo } from "react";

const MODULES = [
  {
    id: "overview", label: "System Overview", icon: "⬡", category: "General",
    sections: [
      { title: "What is KROS?", content: "Knowledge Retention & Operations System — an AI-powered operational knowledge management platform for Malaysian mining SMEs. It combines AI chat (Claude + DeepSeek + Gemini), document management (SKILL.md files), succession planning, compliance tracking, knowledge capture, production monitoring, asset management, and HR management." },
      { title: "Getting Started", content: "Login with your credentials. Navigate using the sidebar menu organised by sections: AI, OPERATIONS, HSE, REPORTING, SYSTEM. The default password for new users is 123456. Toggle dark/light mode at the bottom of the sidebar." },
      { title: "Global Search", content: "Use the search bar at the top of any page to quickly find and navigate to any module. Type a module name or keyword and select from the dropdown results." },
      { title: "Quick Actions", content: "Click the ⚡ button in the top bar to access frequently used actions: Ask AI (Ctrl+K), Production Board, Shift Handover, New Weigh Ticket, New Blast Record, Report Hazard, Generate Report." },
      { title: "Notifications", content: "Click the 🔔 bell icon in the top bar to open the notification centre. Alerts are categorised by severity: Critical (red), Warning (gold), Info (blue). Filter by All, Unread, Critical, or Warnings. Click an alert to mark it as read." },
    ]
  },
  {
    id: "dashboard", label: "Dashboard", icon: "◫", category: "General",
    sections: [
      { title: "Customisable Widgets", content: "The Dashboard is fully customisable. Click ⚙ Customise to open the widget config panel. Turn widgets ON/OFF by clicking them. Use 'Reset to [dept] default' to restore department-preset layout. Preferences are saved automatically." },
      { title: "Available Widgets", content: "12 widgets available: KPI Grid, Skills Health, Succession Monitor, Production Summary, Safety Snapshot, HR Snapshot, Compliance Calendar, Fleet Summary, Training Alerts, Recent Activity, Environmental Status, Weather Alert. Widgets shown depend on your department/role." },
      { title: "Department Presets", content: "Mining: KPI + Production + Fleet + Skills + Activity + Weather. HSE: Safety + Environmental + Compliance + Skills + Activity. HR: HR Snap + Training + Succession + Skills + Activity. Finance: KPI + Compliance + Skills + Activity. Maintenance: KPI + Production + Fleet + Skills + Activity. Admin: All 12 widgets." },
    ]
  },
  {
    id: "ask", label: "Ask AI", icon: "✦", category: "AI",
    sections: [
      { title: "How to Ask", content: "Type your question in the chat input and press Enter. Ask operational questions in plain English or Bahasa Malaysia. The AI searches all 35+ SKILL.md files for answers. 12 suggested question templates are available." },
      { title: "AI Analysis Mode", content: "For analysis queries (containing words like 'analyse', 'recommend', 'review', 'trend'), the AI Analysis engine is activated. It checks internal skills first, then cross-references with connected AI for comprehensive reporting with data-driven recommendations." },
      { title: "AI Routing", content: "Queries auto-route by sensitivity: High (HR, payroll, financial) → Claude or Gemini. Low (SOPs, maintenance) → DeepSeek. Medium (safety, compliance) → Gemini. You can manually override the engine using the chip selector below the input." },
      { title: "Skill Detection", content: "The AI automatically detects which skill file your question relates to using keyword analysis and tags responses with the skill reference and sensitivity level." },
      { title: "Response Features", content: "Responses include formatted text, source references, sensitivity badges, engine badges, and AI cross-reference indicators for analysis queries." },
    ]
  },
  {
    id: "skills", label: "Skills Library", icon: "◫", category: "AI",
    sections: [
      { title: "Overview", content: "Browse all 35+ SKILL.md files organised by 11 modules (ops, hse, hrm, fin, maint, env, proj, qa, log, eng, com, ai). Each card shows the skill ID, title, description, owner, and freshness status." },
      { title: "Filtering & Search", content: "Use the module filter buttons at the top to show skills from specific modules only. Skills are colour-coded by module with distinct tag styles." },
      { title: "Skill Status", content: "Fresh (green) — current and up to date. Stale (gold) — needs review within 30 days. Urgent (red) — overdue for review. The status dot on each card indicates urgency." },
      { title: "Creating & Managing", content: "Admin users can create new skill files directly from the Library page. Upload .md files or create new ones with title, module, owner, and metadata fields." },
    ]
  },
  {
    id: "prod-board", label: "Production Board", icon: "📊", category: "Operations",
    sections: [
      { title: "Overview", content: "Live shift-level production tracking with real-time KPI cards. Shows tonnes, ore, waste, grade, and uptime for each shift (Morning/Afternoon/Night) with plan vs actual comparison bars." },
      { title: "Shift Selector", content: "Click shift buttons at the top to view each shift's detailed stats. Buttons are colour-coded green (on target) or gold (below target) with percentage completion." },
      { title: "Plan vs Actual", content: "Each shift shows tonnes produced vs target with variance percentage, progress bar, target line, and equipment assignment (loader + trucks). AI analysis recommends recovery actions for below-target shifts." },
      { title: "Equipment Time Usage", content: "Visual breakdown of all equipment time: Operating, Standby, Idle, Breakdown, PM, Travel. Each equipment unit shows hours, utilisation %, fuel consumption, and status badge." },
      { title: "Delay Analysis", content: "Click 'Show Delay Analysis' for Pareto-ranked delay codes by total minutes lost. Each delay shows frequency, trend direction, and AI recommendations for top delay types." },
    ]
  },
  {
    id: "workflow", label: "Workflows", icon: "⚙", category: "Operations",
    sections: [
      { title: "Overview", content: "Track and manage active workflows across all mining operations. 16 workflow templates available including PTW applications, PO approvals, breakdown responses, shift handover, competency assessment, and more." },
      { title: "Active Tasks", content: "View tasks by status tabs: Active, Overdue, or All. Each task shows ID, name, assignee, current step, due date, and status dot (🟡 in progress, 🔵 pending, 🔴 overdue). Click a task to select it." },
      { title: "Workflow Templates", content: "Browse all templates organised by module with icons. Each shows step count and SLA time. Templates with alerts have a notification dot. Click any template to ask AI to start the process." },
      { title: "AI Workflow Assistant", content: "The AI Workflow Assistant banner at the top lets you check workflow status, get step guidance, or request automated follow-ups via Ask AI." },
    ]
  },
  {
    id: "handover", label: "Shift Handover", icon: "⟳", category: "Operations",
    sections: [
      { title: "Overview", content: "Digital shift handover form replacing paper-based handovers. 5-section checklist covering: Production Status, Equipment Status, Safety & Compliance, People, and Outstanding Actions." },
      { title: "Navigation", content: "Step through each section using the left sidebar or Previous/Next buttons. Each section contains checkable items. Completed steps show a green checkmark." },
      { title: "Sign Off", content: "On the final section, select outgoing and incoming supervisors from dropdown lists. AI checks completeness (items checked vs total) before allowing sign-off. Click 'Complete & Sign Handover' to finalise." },
      { title: "AI Handover Summary", content: "After sign-off, AI generates a handover summary highlighting pending items, critical issues, and recommendations for the incoming shift." },
      { title: "History", content: "The Recent Handover History table shows past handovers with dates, participants, sections completed, issues reported, and status." },
    ]
  },
  {
    id: "mine-analysis", label: "Mine Analysis", icon: "⛏", category: "Operations",
    sections: [
      { title: "Overview", content: "AI-powered mining data analysis covering 6 analysis modes: Grade Control, Dilution & Recovery, Blast Performance, Cost per Tonne, Fleet Efficiency, and Mine Reconciliation." },
      { title: "Analysis Modes", content: "Select an analysis card to activate it. Each mode shows KPIs, trend analysis, sample reports, and AI recommendations. Active mode is highlighted with accent border." },
      { title: "Skill Upload", content: "Upload mine data files (CSV, XLSX, PDF) via drag-and-drop or click-to-browse. Processed files appear in upload history with status badges (processed/analysed/pending). Upload history is sorted newest first." },
      { title: "AI Recommendations", content: "Each analysis mode generates AI recommendations for operational improvements based on the uploaded data and detected trends." },
    ]
  },
  {
    id: "production", label: "Production Analysis", icon: "⬡", category: "Operations",
    sections: [
      { title: "Overview", content: "Multi-mine, multi-mineral production tracking with month-to-month comparison. Create custom mines with specific locations and minerals. Supports 5 default minerals: Silica, Iron Ore, Gold, Bauxite, Aggregate." },
      { title: "Mine Selector", content: "Select from existing mines or click '+ Add Mine' to create a new mine with name, location, status, and minerals. Custom mines get auto-generated locations, shift data, and 5 months of production data." },
      { title: "Mineral Selection", content: "Each mine can have multiple minerals. The mineral selector shows only minerals relevant to the selected mine. Add custom minerals anytime via the '◈ Add Mineral' button." },
      { title: "Mine Info Panel", content: "Click ℹ to open the Mine Information panel showing: Details & Status (name, location, status, license expiry, last inspection), Documents & Licenses (6 license types with upload status), Maps & Reports, and AI Document Analysis for compliance insights." },
      { title: "Month Comparison", content: "The Monthly tab shows a 10-row comparison table across 5 months with trend arrows ▲/▼ for each metric. Compare side-by-side with another mine using the toggle." },
      { title: "Shift & Upload Tabs", content: "Shift Detail tab shows 3 shifts per mine with ore/waste/grade/downtime. Data Upload tab has drag-and-drop file upload with AI production insights." },
    ]
  },
  {
    id: "weightbridge", label: "Fleet & Weightbridge", icon: "◈", category: "Operations",
    sections: [
      { title: "Overview", content: "Three-tab module: Weightbridge (truck tickets), Fleet Map (live equipment positions), and Dispatch Optimisation (AI-recommended truck assignments)." },
      { title: "Weightbridge", content: "View recent weighbridge tickets with gross/tare/net weights, material type, grade, and destination. 4 KPI cards show today's tonnes, active trucks, avg cycle time, and payload utilisation." },
      { title: "Fleet Map", content: "Live 2D equipment position map with colour-coded markers: green (operating), red (breakdown), blue (standby). Shows excavators, dozers, graders, and haul trucks with labels and ETA." },
      { title: "Dispatch Optimisation", content: "AI-recommended truck-to-loader assignments to minimise cycle time and maximise throughput. Compares current vs recommended assignment with tph, queue time, and efficiency metrics." },
      { title: "Cycle Time Analysis", content: "Per-truck cycle time breakdown showing Load (teal), Haul (gold), Dump (purple), and Return (blue) segments with total cycle time." },
    ]
  },
  {
    id: "grade-control", label: "Grade Control", icon: "⟳", category: "Operations",
    sections: [
      { title: "Overview", content: "Real grade tracking, 3-way reconciliation (Model vs Plan vs Actual), dilution monitoring, ore loss tracking, and blast hole assay analysis." },
      { title: "KPI Cards", content: "4 cards: Current Grade, Model vs Actual (with gap warning), Dilution (target <8%), and Ore Loss (target <3%). Each card shows colour-coded status." },
      { title: "Zone Filter", content: "Filter grade data by mining zone (West Pit, East Pit, Main Zone, Deep Zone) using the dropdown controls." },
      { title: "Reconciliation Chart", content: "Side-by-side monthly bar chart showing Model (teal), Plan (gold), and Actual (green) grades for 5 months with numeric values." },
      { title: "Blast Hole Assays", content: "Per-hole assay results showing Fe, SiO₂, and Al₂O₃ values with depth. Anomalous values are colour-coded: low (red) or high (green)." },
      { title: "AI Reconciliation Analysis", content: "AI identifies model vs actual gaps, dilution trends, and grade control drilling gaps with specific recommendations for improvement." },
    ]
  },
  {
    id: "stockpile", label: "Stockpile Manager", icon: "△", category: "Operations",
    sections: [
      { title: "Overview", content: "Track stockpile inventory, grades, and movements with AI blend optimisation for consistent mill feed. 4 KPI cards: Total Inventory, Avg Feed Grade, Today's Reclaim, Stockpile Days." },
      { title: "Stockpile Inventory", content: "List of all stockpiles with name, location, tonnage, Fe grade, SiO₂ grade, and status badge. Each stockpile shows key stats in a compact card layout." },
      { title: "Blend Optimisation", content: "Select blend scenarios (Current Feed, Option 1: More HG, Option 2: Product Boost) to see the resulting Fe and SiO₂ grade. Blend bar shows HG/MG/LG proportions. Results show Pass/Fail against spec." },
      { title: "Movements Log", content: "Table showing recent stockpile movements with date, from/to locations, tonnage, grade, and type badge (Receipt/Reclaim)." },
      { title: "AI Recommendation", content: "AI recommends the optimal blend ratio to achieve target feed grade. Shows which option meets spec and suggests reclaim adjustments." },
    ]
  },
  {
    id: "blasting", label: "Blast Dashboard", icon: "✦", category: "Operations",
    sections: [
      { title: "Overview", content: "Blast performance tracking with powder factor, fragmentation P80, vibration monitoring, and AI-optimised blast design recommendations." },
      { title: "KPI Cards", content: "4 cards: Last Blast PF (kg/t target 0.48), Fragmentation P80 (target <250mm), Vibration Level (limit 5.0mm/s), Tonnes per Hole." },
      { title: "Recent Blasts", content: "Table showing recent blast records with blast ID, zone, date, and stats (PF, P80, vibration, yield). Warning values highlighted in red." },
      { title: "Powder Factor Trend", content: "5-month bar chart comparing actual PF vs target. Bars colour-coded green (on target) or red (above target)." },
      { title: "AI Recommendations", content: "AI analyses fragmentation optimisation, powder factor trends, and vibration compliance with specific recommendations for spacing, timing, and community monitoring." },
    ]
  },
  {
    id: "training", label: "Training Matrix", icon: "◎", category: "HSE",
    sections: [
      { title: "Overview", content: "Role-based training and competency tracking with expiry alerts. Supports 12 training modules across Safety, Operations, and Compliance categories." },
      { title: "Competency Matrix", content: "Full staff vs training modules grid showing status for each combination: ✓ (valid), ⚠ (expiring soon), ✕ (expired), — (not assigned). Critical modules highlighted in red." },
      { title: "Expiry Alerts", content: "Filter to show all expired and expiring certifications sorted by urgency. Each row shows staff name, module, expiry date, and days remaining." },
      { title: "AI Gap Analysis", content: "AI identifies critical expired certifications, expiring-soon items, and competency coverage gaps with cross-training recommendations. Also provides a recommended training schedule by month." },
    ]
  },
  {
    id: "safety", label: "Safety & Fatigue", icon: "⚠", category: "HSE",
    sections: [
      { title: "Overview", content: "Three-tab module: Safety Observations, Fatigue Monitor, and AI Analysis. Report hazards, track observations, and monitor DOSH work-hour compliance." },
      { title: "Safety Observations", content: "List of observations with type badges (Critical/Positive/Observation), description, location, reporter, date, and status. Click '+ Report Hazard' to open the reporting modal with type, category, location, and description fields." },
      { title: "Fatigue Monitor", content: "Staff hours tracking table showing weekly hours, today's hours, shift count, last break, fatigue risk status (high/medium/low), and action buttons. DOSH compliance: max 60h/week, max 12h/shift." },
      { title: "AI Analysis", content: "Incident trend analysis with month-to-date stats, category breakdown bars, and AI recommendations for haul road safety, fatigue roster review, and PTW compliance." },
    ]
  },
  {
    id: "environmental", label: "Environmental Monitor", icon: "🌿", category: "HSE",
    sections: [
      { title: "Overview", content: "Live environmental monitoring across 5 station types: Water Quality, Air Quality, Vibration, Tailings (TSF), and Noise. AI-driven compliance predictions." },
      { title: "Monitoring Points", content: "Select from 5 monitoring points via dropdown. Each shows real-time parameters with values, limits, visual bars, and status badges (normal/warning)." },
      { title: "Compliance Calendar", content: "DOE/JMG submission calendar showing upcoming and overdue reports with authority and status badges." },
      { title: "AI Predictions", content: "AI forecasts water quality trends, dry season risks, and sends compliance alerts for overdue inspections like TSF dam safety." },
    ]
  },
  {
    id: "predictive-mt", label: "Predictive Maintenance", icon: "🔧", category: "HSE",
    sections: [
      { title: "Overview", content: "Equipment health monitoring with component-level wear tracking, failure prediction, and AI-driven maintenance planning. Covers 8 equipment units with health scores." },
      { title: "Fleet Health", content: "Each equipment unit shows a health score ring (conic gradient), trend indicator (🔴 critical/▼ declining/— stable/▲ improving), and risk badge. Click to expand component-level details." },
      { title: "Component Tracking", content: "Expanded view per equipment shows: wear % with bars, temperature vs baseline, vibration levels, hydraulic pressure, remaining life estimates. Colour-coded by status (green/yellow/red)." },
      { title: "Predicted Failures", content: "AI-predicted failures within next 10 days with failure probability bar, timeframe, impact description, and estimated cost." },
      { title: "AI Maintenance Plan", content: "AI generates a prioritised maintenance plan with cost comparison (intervention cost vs failure cost) to justify proactive maintenance decisions." },
    ]
  },
  {
    id: "exec-report", label: "Executive Report", icon: "📈", category: "Reporting",
    sections: [
      { title: "Overview", content: "AI-generated board-level management pack with KPIs, variance analysis, and narrative. Covers production, financials, safety, and maintenance." },
      { title: "Generating Reports", content: "Select a month from the dropdown and click '✦ Generate Report'. The AI analyses the data and generates a comprehensive report with 4 KPI cards, executive summary, monthly trend table, and AI narrative with outlook and recommendations." },
      { title: "Report Sections", content: "Executive Summary — narrative covering production, revenue, margin, safety, and key risks. Monthly Trend — 5-month table with tonnes, revenue, cost, and LTI. AI Narrative — production outlook, financial recommendations, and risk register updates." },
      { title: "Export", content: "Click Export PDF, Export Excel, or Distribute Report buttons at the bottom to share the generated report." },
    ]
  },
  {
    id: "hrm", label: "HRM Module", icon: "👥", category: "Reporting",
    sections: [
      { title: "Overview", content: "Human Resource Management with worker profiles, emergency contacts, insurance tracking, job levels (1-8), and document management." },
      { title: "Worker List", content: "Left panel shows all workers filterable by department and status. Each entry shows avatar, name, position, department, employee ID, and status badge." },
      { title: "Profile Tab", content: "Full worker information: IC number, passport, DOB, gender, nationality, phone, email, department, position, level badge, join date, and status." },
      { title: "Emergency Tab", content: "Emergency contact name, relation, and phone number. AI recommends 6-month review and adding a secondary contact." },
      { title: "Insurance Tab", content: "Insurance provider, policy number, coverage amount, and expiry date with countdown. Colour-coded green (active) or red (expired)." },
      { title: "Documents Tab", content: "Uploaded documents with type icons (🛂 Passport, 🆔 IC, 📜 Certification), status badges, download buttons, and upload zone." },
    ]
  },
  {
    id: "assets", label: "Asset Management", icon: "🔧", category: "Reporting",
    sections: [
      { title: "Overview", content: "Full machinery fleet tracking with 12 assets across excavators, dozers, haulers, loaders, trucks, graders, drills, compactors, generators, cranes, and light vehicles." },
      { title: "Asset List", content: "Left panel with type/status filters. Each asset shows type, make/model, plate number, location, hours/km, and status dot (🟢 Working, 🔴 Repair, 🟡 PM, 🔵 Standby, 🟣 Deployed, ⚫ Retired)." },
      { title: "Finance Tab", content: "Purchase price, loan provider, period, monthly installment, remaining balance, months remaining, loan status (Active/Settled). Insurance & Road Tax section with provider, policy, premium, and 30-day expiry alerts." },
      { title: "Maintenance Tab", content: "Fuel consumption, last service, next service due with colour-coded status (green/yellow/red), and AI maintenance analysis." },
      { title: "Documents Tab", content: "8 document categories (Loan Grant, Insurance Policy, Road Tax, Service Record, Inspection Cert, Warranty, Operator Manual, Transfer/Disposal) with upload status and upload zone." },
    ]
  },
  {
    id: "weather", label: "Weather Dashboard", icon: "⛅", category: "HSE",
    sections: [
      { title: "Overview", content: "Multi-site weather monitoring with 6-day forecast across 3 mine locations (Kros Hill, Bukit Besi, Sungai Lembing). Each location has unique temperature, rainfall, and conditions." },
      { title: "Location Selection", content: "Click location chips to switch between mine sites. Each shows lat/long and elevation. Forecast data adjusts per location." },
      { title: "Forecast Cards", content: "6-day forecast with hi/lo temps, condition icons, humidity, wind/gusts, rain %, UV index. Today's card highlighted with gold border. Storm days with red border." },
      { title: "Impact Matrix", content: "Table showing operational impact by weather condition: blast delays, haul road status, dust suppression needs, and risk level." },
      { title: "AI Recommendations", content: "Per-day operational recommendations including blasting decisions, water truck scheduling, heat stress protocols, and maintenance planning." },
    ]
  },
  {
    id: "succession", label: "Succession Planning", icon: "⟳", category: "General",
    sections: [
      { title: "Overview", content: "The Succession Matrix shows readiness levels for each key role: Ready Now, Ready in 12 months, and Ready in 24 months." },
      { title: "Risk Ratings", content: "Roles are rated as: Managed (green) — deputy identified; At-Risk (yellow) — partial coverage; Critical (red) — no identified successor." },
      { title: "Deputy Activation", content: "To activate a deputy, notify the Mine Manager, update Mine Control, notify PTW holders, and log the activation in HRMS." },
    ]
  },
  {
    id: "exit", label: "Exit Capture", icon: "◳", category: "General",
    sections: [
      { title: "Overview", content: "The Exit Knowledge Capture module facilitates AI-assisted exit interviews to preserve departing employees' knowledge before they leave." },
      { title: "Process", content: "5-step process: Notice Received → Department Clearance → IT Return → Finance Settlement → Final Interview. The AI generates interview questions based on the employee's role and skill ownership." },
    ]
  },
  {
    id: "compliance", label: "Compliance", icon: "⚖", category: "General",
    sections: [
      { title: "Overview", content: "The Compliance calendar tracks Malaysian regulatory deadlines including EPF, SOCSO, DOE, DOSH, and JMG submissions." },
      { title: "Adding Items", content: "Admin users can add new compliance items with categories, deadlines, authorities, and amounts." },
    ]
  },
  {
    id: "admin", label: "Admin", icon: "◈", category: "System",
    sections: [
      { title: "User Management", content: "Admin users can view, create, edit, and delete system users. Access levels: Admin, Manager, Staff. The user table shows name, email, role, access level, reports-to, status (Active/First login), and last active timestamp." },
      { title: "Creating Users", content: "Click '+ Add User' and fill in the form with given name, surname, email, role, access level, reports-to, and approved-by. New users get default password '123456' and must change on first login." },
      { title: "Invite Users", content: "Click '✉ Invite User' to send an email invitation. Enter the email and select the access level. The invited user appears in the list with 'Invited' status." },
      { title: "Permissions Summary", content: "The Access & Permissions Summary card shows user counts by access level with descriptions: Admin (full access), Manager (module access), Staff (view only)." },
    ]
  },
  {
    id: "settings", label: "Settings", icon: "◎", category: "System",
    sections: [
      { title: "Overview", content: "Configure AI engine settings and view API key status. Settings are persistent across sessions." },
    ]
  },
];

export default function UserManual() {
  const [activeModule, setActiveModule] = useState("overview");
  const [search, setSearch] = useState("");
  const [askAI, setAskAI] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return MODULES;
    const q = search.toLowerCase();
    return MODULES.filter(m =>
      m.label.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.sections.some(s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q))
    );
  }, [search]);

  const mod = filtered.find(m => m.id === activeModule) || filtered[0];

  const categories = [...new Set(MODULES.map(m => m.category))];

  const handleAskAI = () => {
    if (!askAI.trim()) return;
    const q = askAI.toLowerCase();
    let found = [];
    MODULES.forEach(m => {
      m.sections.forEach(s => {
        if (s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)) {
          found.push({ module: m.label, section: s.title, content: s.content });
        }
      });
    });
    if (found.length === 0) {
      setAiResponse(`I couldn't find information about "${askAI}" in the user manual. Try searching for different keywords like "production", "safety", "asset", "training", "grade", "weather", "hrm", or "blasting".`);
    } else {
      setAiResponse(`Found ${found.length} result(s) for "${askAI}":\n\n${found.slice(0, 3).map((f, i) => `**${i+1}. ${f.module} → ${f.section}**\n${f.content}`).join('\n\n')}${found.length > 3 ? `\n\n...and ${found.length - 3} more result(s). Try a more specific search.` : ''}`);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">User Manual</div>
          <div className="page-subtitle">Complete documentation for all {MODULES.length} KROS modules — search or ask AI</div>
        </div>
      </div>

      <div className="manual-controls">
        <div className="manual-search">
          <span className="manual-search-icon">🔍</span>
          <input className="manual-search-input" type="text" placeholder="Search modules, features, keywords..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="manual-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>
        <div className="manual-ask-ai">
          <input className="manual-ask-input" type="text" placeholder="Ask AI about any feature..." value={askAI} onChange={e => setAskAI(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAskAI(); }} />
          <button className="btn btn-purple btn-sm" onClick={handleAskAI} disabled={!askAI.trim()}>Ask</button>
        </div>
      </div>

      {aiResponse && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">✦ AI Answer</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setAiResponse("")}>✕ Clear</button>
          </div>
          <div className="card-body">
            <div className="manual-ai-response" style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)" }}>
              {aiResponse.split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: 8 }}>{line.replace(/\*\*/g, '')}</div>;
                return <div key={i}>{line}</div>;
              })}
            </div>
          </div>
        </div>
      )}

      <div className="manual-layout">
        <div className="manual-toc">
          <div className="card" style={{ padding: 12 }}>
            <div className="manual-toc-title">Modules ({filtered.length})</div>
            {categories.map(cat => {
              const items = filtered.filter(m => m.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="manual-toc-category">{cat}</div>
                  {items.map(m => (
                    <div key={m.id} className={`manual-toc-item ${activeModule === m.id ? "active" : ""}`} onClick={() => { setActiveModule(m.id); setSearch(""); }}>
                      <span className="manual-toc-icon">{m.icon}</span>
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>
              );
            })}
            {filtered.length === 0 && <div className="empty-state" style={{ padding: 16 }}>No modules match "{search}"</div>}
          </div>
        </div>

        <div className="manual-content">
          {mod && (
            <div className="card">
              <div className="card-header">
                <div className="manual-content-header">
                  <span className="manual-content-icon">{mod.icon}</span>
                  <div>
                    <div className="card-title">{mod.label}</div>
                    <div className="card-subtitle">{mod.sections.length} sections · {mod.category}</div>
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
          )}
        </div>
      </div>
    </div>
  );
}
