# AI Safety Analysis

**Module:** hse  
**Owner:** HSE Manager  
**Status:** Current  
**Sensitivity:** medium

AI-driven safety risk prediction, incident pattern analysis, and proactive hazard recommendations.

---

## Incident Pattern Analysis

The AI engine analyses historical incident data, near-miss reports, and safety observations to detect patterns and predict future risks:

- **Temporal pattern detection** — incidents clustering by shift, day of week, or season
- **Location-based clustering** — geographic hot spots for specific incident types
- **Causal chain analysis** — identifying recurring root cause combinations
- **Behavioural trend detection** — changes in at-risk behaviour frequency by crew or department

### Incident Prediction Scoring
| Risk Level | Criteria | Response |
|------------|----------|----------|
| 🔴 Critical | >80% probability of LTI within 30 days | Immediate intervention required |
| 🟡 Warning | 50-80% probability within 60 days | Targeted toolbox talk + inspection |
| 🟢 Monitor | <50% probability within 90 days | Continue current controls |

## Hazard Detection & Risk Assessment

AI continuously evaluates the risk environment using multiple data streams:

- **PTW data analysis** — identifies permit types and locations with recurring violations
- **Hazard report NLP** — natural language processing of hazard descriptions to detect emerging risks
- **Weather integration** — AI correlates weather forecasts with site-specific risk profiles
- **Personnel data** — fatigue risk assessment based on shift patterns, overtime hours, and task complexity

### Automated Risk Register Updates
The AI recommends additions to the risk register when:
- Three or more similar near-misses occur within 30 days
- A new hazard type appears in reports
- External benchmarks (industry alerts, DOSH directives) indicate new risks
- Seasonal conditions create elevated risk profiles

## Proactive Safety Recommendations

### Preventive Actions
- Reassess critical risk controls when incident precursors are detected
- Increase inspection frequency in areas with elevated risk scores
- Deploy additional supervision during high-risk periods identified by AI
- Adjust PTW authorisation levels based on historical compliance data

### Training Recommendations
The AI maps incident patterns to competency gaps:
- Flag crews or individuals with elevated at-risk behaviour scores for refresher training
- Recommend specific HSE training modules based on incident type clustering
- Schedule emergency response drills when AI detects extended period without practice

### Compliance Recommendations
- Alert when DOSH reporting deadlines approach with open investigation items
- Flag PTW types approaching zero-tolerance violation thresholds
- Recommend permit refresher training for authorisers with error rates above threshold

## Reporting & Dashboard Integration

| Report | Frequency | Audience |
|--------|-----------|----------|
| Incident Pattern Alert | Real-time | HSE Manager |
| Predictive Risk Score | Daily AM | Shift Supervisor |
| Hazard Trend Analysis | Weekly | HSE Team |
| Safety Recommendation Summary | Monthly | Mine Manager |

## Data Sources

- Incident management system
- Near-miss and hazard reports (text analysis)
- PTW database (approvals, violations, expiry)
- Personnel schedule and overtime records
- Weather monitoring system
- DOSH/regulatory databases
