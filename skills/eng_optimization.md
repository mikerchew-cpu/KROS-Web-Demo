# Energy Optimisation

**Module:** energy  
**Owner:** Engineering Manager  
**Status:** Current  
**Sensitivity:** low

Strategies and analysis methods for continuous improvement in energy efficiency across site operations.

---

## Energy Auditing

### Audit Frequency
| Audit Type | Frequency | Scope |
|------------|-----------|-------|
| Walk-through | Monthly | Visual inspection, obvious waste |
| Preliminary | Quarterly | Meter data analysis, benchmarking |
| Detailed | Annually | Full audit with measurements and recommendations |

### Audit Process
1. Collect energy consumption data for previous 12 months
2. Identify major energy consumers (>10% of total)
3. Compare against industry benchmarks (MJ/tonne)
4. Identify energy saving opportunities
5. Calculate ROI for each opportunity
6. Prioritise based on payback period

## Load Optimisation

### Peak Demand Management
- Identify peak demand periods from SCADA data
- Stagger start-up of large equipment to avoid simultaneous operation
- Schedule non-critical processes during off-peak periods
- Implement automated demand limiting system

### Power Factor Correction
- Target power factor: >0.95
- Monitor monthly power factor penalty on electricity bill
- Maintain capacitor banks in good working order
- Consider active harmonic filters if THD >8%

## Equipment Efficiency

### Motor Efficiency
| Motor Size | Minimum Standard | Replacement Criteria |
|------------|-----------------|---------------------|
| <15 kW | IE2 | Rewind >2 times or failure |
| 15-75 kW | IE3 | Failure or >10 years old |
| >75 kW | IE4 | Failure or life-cycle cost analysis |

### Pump Optimisation
- Match pump impeller size to actual duty
- Install VFD where flow variation exceeds 30%
- Trim impeller where pump is oversized
- Review system resistance regularly

## Alternative Energy

### Solar Assessment
- Site has average 5.5 hours peak sun per day
- Roof-mounted solar for admin building: estimated 50 kWp
- Ground-mounted solar for camp: estimated 100 kWp
- Estimated payback period: 4-6 years

### Energy Recovery
- Investigate regenerative braking on downhill conveyors
- Capture waste heat from generator cooling systems for camp heating
- Assess potential for hydraulic turbine at water discharge points

## Reporting & KPIs

| KPI | Target |
|-----|--------|
| Specific energy consumption | <20 MJ/tonne processed |
| Energy cost intensity | <8% of operating cost |
| Emission intensity | <0.5 tCO₂e/tonne |
| Renewable energy share | >10% by 2027 |
| Energy savings year-on-year | >3% |

## Data Sources

- Utility bills and interval meter data
- SCADA system (real-time power consumption)
- Generator management system
- Production reporting system
- Fuel dispensing records
- Weather data (for solar analysis)
