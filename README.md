# KROS Web Application — v2.0
## Knowledge Retention & Operations System
### Powered by Anthropic Claude + DeepSeek AI

**🔗 Live Demo:** https://mikerchew-cpu.github.io/KROS-Web-Demo/

---

## Stack

| Layer     | Technology              | Purpose                                     |
|-----------|-------------------------|---------------------------------------------|
| Frontend  | React 18 + Vite         | Single-page web app                         |
| Backend   | Node.js + Express       | API server, AI routing, Skills.md serving   |
| AI (main) | Anthropic Claude        | Medium/high sensitivity queries             |
| AI (alt)  | DeepSeek                | Low sensitivity queries (cost saving)       |
| Auth      | JWT + bcrypt            | Role-based access control                   |
| Database  | PostgreSQL              | Users, sessions, audit logs                 |
| Docs      | SharePoint / GitHub     | Skills.md document store                    |

---

## Project Structure

```
kros-web/
├── frontend/               # React app (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── context/
│   │   │   └── KROSContext.jsx     # Global state + AI routing logic
│   │   ├── components/
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main overview + KPIs
│   │   │   ├── AskClaude.jsx       # AI chat interface (Claude + DeepSeek)
│   │   │   ├── SkillsLibrary.jsx   # Browse & manage all 20 Skills.md
│   │   │   ├── SuccessionMap.jsx   # Role coverage matrix
│   │   │   ├── ExitCapture.jsx     # AI-facilitated exit interview
│   │   │   ├── Compliance.jsx      # Malaysian regulatory calendar
│   │   │   ├── LoginPage.jsx
│   │   │   └── Settings.jsx        # AI config, API keys, routing rules
│   │   └── styles/
│   │       └── globals.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                # Express API server
│   ├── server.js           # Main server — AI routing + skill serving
│   ├── .env.example        # Environment variable template
│   └── package.json
│
├── skills/                 # Your Skills.md files live here
│   ├── operations/
│   │   ├── ops_sop.md
│   │   └── ops_shift_handover.md
│   ├── safety/
│   │   ├── hse_ptw.md
│   │   ├── hse_hazop.md
│   │   └── hse_emergency.md
│   ├── hrm/
│   │   ├── hrm_onboard.md
│   │   ├── hrm_competency.md
│   │   ├── hrm_succession.md
│   │   ├── hrm_exit.md
│   │   └── hrm_payroll.md
│   ├── financial/
│   │   ├── fin_budget.md
│   │   ├── fin_royalty.md
│   │   ├── fin_procurement.md
│   │   └── fin_reporting.md
│   ├── maintenance/
│   │   ├── maint_pm.md
│   │   └── maint_breakdown.md
│   ├── environment/
│   │   └── env_report.md
│   └── projects/
│       ├── proj_lifecycle.md
│       ├── proj_risk.md
│       └── proj_lessons.md
│
└── README.md
```

---

## Quick Start

### 1. Clone and install

```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit .env — add your Claude and DeepSeek API keys
```

**Required keys:**
- `ANTHROPIC_API_KEY` — get from https://console.anthropic.com
- `DEEPSEEK_API_KEY` — get from https://platform.deepseek.com

### 3. Copy your Skills.md files

```bash
mkdir -p skills
# Copy all your .md files from KROS into the skills/ directory
# maintaining the folder structure above
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# Running on http://localhost:3001

# Terminal 2 — Frontend
cd frontend && npm run dev
# Running on http://localhost:5173
```

---

## AI Routing Logic

```
User query
    │
    ▼
Sensitivity detection (keyword analysis)
    │
    ├── HIGH (HR, payroll, EPF, royalty, financial)
    │       └── → Anthropic Claude (claude-sonnet-4-6)
    │
    ├── MEDIUM (PTW, HAZOP, environment, compliance)
    │       └── → Anthropic Claude (claude-sonnet-4-6)
    │
    └── LOW (SOPs, maintenance, shift handover, emergency)
            └── → DeepSeek (deepseek-chat) [cheaper]
```

**Override:** Users can manually pin Claude or DeepSeek via the chat UI.

---

## Data Security Notes

| Data Type        | Allowed Engine  | Reason                                          |
|------------------|-----------------|-------------------------------------------------|
| HR records       | Claude only     | PDPA 2010 — personal data protection            |
| Payroll/EPF data | Claude only     | Financial sensitivity + PDPA                    |
| Royalty figures  | Claude only     | Commercially sensitive                          |
| PTW/HAZOP data   | Claude only     | Regulatory records                              |
| SOPs / checklists| Claude or DeepSeek | General operational knowledge               |
| Emergency response | Claude or DeepSeek | Non-sensitive procedural                  |

**Warning:** DeepSeek API servers are based in China. Never send personal employee data, financial records, or proprietary geological data to DeepSeek. The routing rules enforce this automatically.

---

## Demo Accounts

| Email               | Password  | Role            |
|---------------------|-----------|-----------------|
| ahmad@kros.my       | admin123  | Mine Manager    |
| farah@kros.my       | hse123    | HSE Manager     |
| tan@kros.my         | fin123    | Finance Manager |
| amirul@kros.my      | maint123  | Maint. Tech.    |

---

## Production Deployment

```bash
# Build frontend
cd frontend && npm run build
# Static files in frontend/dist/ — serve via Nginx or Vercel

# Backend — use PM2
npm install -g pm2
cd backend && pm2 start server.js --name kros-api

# Or Docker
docker-compose up -d
```

---

## API Reference

```
POST /api/chat
Body: { messages: [{role, content}], sensitivity?, engineOverride? }
Returns: { response, engine, sensitivity, model, tokens_used }

GET  /api/skills
Returns: { count, skills: [{id, filename, size, preview}] }

GET  /api/skills/:id
Returns: { id, content }

GET  /api/health
Returns: { status, engines, skills_loaded, timestamp }
```

---

*KROS Web App v2.0 — Claude + DeepSeek Edition*
*Built for Malaysian Mining SMEs*
