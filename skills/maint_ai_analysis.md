# AI Maintenance Analysis

**Module:** maint  
**Owner:** Maintenance Super.  
**Status:** Current  
**Sensitivity:** low

AI-driven predictive maintenance, fault detection and diagnosis, and maintenance schedule optimisation.

---

## Predictive Maintenance

The AI engine analyses equipment telemetry, historical failure data, and operating conditions to predict maintenance needs:

- **Component life forecasting** — predicts remaining useful life of wear parts based on actual usage
- **Failure probability modelling** — calculates real-time failure risk per equipment unit
- **Condition-based triggers** — maintenance alerts when sensor data indicates degradation
- **Optimal intervention timing** — recommends maintenance window that minimises production impact

### Prediction Categories
| Equipment | Parameters Monitored | Prediction Horizon |
|-----------|---------------------|--------------------|
| Crusher | Amp draw, CSS drift, bearing temp, liner wear | 7-30 days |
| Conveyor | Belt tension, splice resistance, roller temp | 14-60 days |
| Excavator | Hydraulic pressure, swing bearing vibration | 7-21 days |
| Haul Truck | Engine hours, brake wear, tyre pressure | 30-90 days |
| Pump | Flow rate, vibration, seal leakage | 14-45 days |

## Fault Detection & Diagnosis

### Automated Diagnosis
When a fault occurs, the AI performs real-time diagnostic analysis:

1. **Symptom collection** — gather all available telemetry and operator observations
2. **Pattern matching** — compare symptom set against known failure mode database
3. **Probability ranking** — list possible root causes with confidence scores
4. **Recommendation generation** — suggest diagnostic tests to confirm root cause

### Diagnostic Confidence
| Confidence Level | Meaning | Action |
|-----------------|---------|--------|
| >90% | High certainty | Proceed with recommended repair |
| 70-90% | Probable | Perform suggested diagnostic tests |
| 50-70% | Possible | Escalate to specialist technician |
| <50% | Uncertain | Full inspection protocol required |

## Schedule Optimisation

### PM Optimisation
- Adjust PM intervals based on actual equipment condition rather than fixed calendar
- Suggest combining PM tasks when multiple equipment units are scheduled
- Recommend reordering PM sequence to maximise equipment availability
- Identify PM tasks that can be extended or shortened based on historical data

### Resource Allocation
- Predict workshop workload 30 days ahead
- Recommend technician specialisation assignments based on upcoming fault types
- Optimise spare parts inventory based on predicted failure probabilities
- Suggest contractor vs in-house execution based on workload forecast

## Root Cause Analysis Support

AI enhances RCA by:
- Analysing failure history across similar equipment for common patterns
- Recommending 5-Why investigation paths based on symptom clusters
- Correlating failures with operational conditions (weather, feed type, operator)
- Tracking repeat failures and flagging ineffective corrective actions

## Reporting & Dashboard Integration

| Report | Frequency | Audience |
|--------|-----------|----------|
| Predictive Fault Alert | Real-time | Maintenance Super. |
| Diagnostic Support Report | On-demand | Technician |
| PM Optimisation Schedule | Weekly | Maintenance Planner |
| Reliability Dashboard | Monthly | Mine Manager |

## Data Sources

- CMMS (work orders, failure codes, parts usage)
- Equipment telemetry / IoT sensors
- Vibration analysis system
- Oil analysis laboratory results
- Operator daily check sheets
- Production schedule (for maintenance window optimisation)
