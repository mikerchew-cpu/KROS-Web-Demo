# AI Project Analysis

**Module:** proj  
**Owner:** General Manager / PMO  
**Status:** Current  
**Sensitivity:** medium

AI-driven project risk analysis, schedule slippage detection, and mitigation recommendations.

---

## Schedule Slippage Detection

The AI engine monitors project schedule adherence in real-time:

- **Critical path analysis** — identifies activities where delay will impact overall completion
- **Float consumption tracking** — monitors how much buffer time has been consumed per activity
- **Early warning system** — flags activities trending toward delay before they impact the critical path
- **Delay pattern recognition** — identifies recurring causes of slippage across projects

### Slippage Risk Levels
| Risk Level | Float Remaining | Response |
|------------|----------------|----------|
| 🔴 Critical | <10% of original float | Immediate recovery plan |
| 🟡 Warning | 10-30% of original float | Review and mitigate |
| 🟢 On Track | >30% of original float | Continue monitoring |

## Cost Performance Analysis

AI continuously tracks cost performance and forecasts final outcomes:

- **Earned Value Analysis** — automated SPI/CPI calculation with trend projection
- **Estimate at Completion** — AI forecast of final project cost based on current performance
- **Cost variance decomposition** — identifies whether variance is scope, rate, or efficiency driven
- **Contingency consumption** — tracks draw-down of contingency budget vs planned

### Cost Health Dashboard
| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| CPI | >1.0 | 0.85-1.0 | <0.85 |
| SPI | >0.95 | 0.80-0.95 | <0.80 |
| Contingency left | >50% | 25-50% | <25% |

## Risk Detection & Mitigation

### Automated Risk Identification
- **Risk trigger monitoring** — AI scans project data for known risk trigger events
- **Emerging risk detection** — identifies new risks through pattern analysis of project data
- **Risk correlation** — detects when multiple risks are becoming likely simultaneously
- **External factor monitoring** — AI scans regulatory, market, and weather data for project impacts

### Mitigation Recommendations
- Suggest specific risk responses based on successful past mitigations
- Recommend risk owner reassignment when current owner is overloaded
- Propose risk transfer options (insurance, contractor terms)
- Alert when risk thresholds require escalation to Project Board

## Resource Optimisation

- **Workload balancing** — detect resource overallocation and suggest adjustments
- **Productivity trend analysis** — identify teams or contractors with declining performance
- **Cross-project optimisation** — recommend resource sharing between projects
- **Procurement lead time** — flag long-lead items that risk schedule delay

## Lessons Learned Automation

- AI analyses project data to automatically draft lessons learned entries
- Correlates issues with root causes for the knowledge base
- Recommends process improvements for next project phase or future projects
- Tracks closure status of action items from previous lessons learned

## Reporting & Dashboard Integration

| Report | Frequency | Audience |
|--------|-----------|----------|
| Schedule Risk Alert | Real-time | Project Manager |
| Cost Performance Dashboard | Weekly | PMO |
| Risk Register Update | Weekly | Project Team |
| Project Health Report | Monthly | Project Board/Steering Committee |

## Data Sources

- Project scheduling system (MS Project, Primavera)
- Cost management system
- Risk register (project-level)
- Resource management system
- Procurement system (PO dates, delivery status)
- Time tracking system
- Quality inspection records
