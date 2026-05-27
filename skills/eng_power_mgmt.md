# Power Management

**Module:** energy  
**Owner:** Engineering Manager  
**Status:** Current  
**Sensitivity:** low

Procedures for power consumption monitoring, generator management, and energy cost control.

---

## Power Supply Sources

| Source | Application | Capacity | Backup |
|--------|-------------|----------|--------|
| Grid supply | Main plant, workshop, office | 5 MVA | N/A |
| Diesel generators | Crusher, dewatering pumps | 2 MW | Primary backup |
| Standby generator | Critical systems (control room, safety) | 500 kVA | Auto-start on grid failure |

## Consumption Monitoring

### Key Monitoring Points
- **Total site consumption** — main grid meter (daily reading)
- **Area sub-meters** — plant, workshop, mine dewatering, camp (weekly)
- **Major equipment** — crusher, conveyor, pumps (real-time SCADA)
- **Generator fuel** — daily dip reading, consumption recording

### Target Consumption
| Area | Monthly Target (kWh) | % of Total |
|------|---------------------|------------|
| Crushing plant | 180,000 | 45% |
| Mine dewatering | 100,000 | 25% |
| Workshop | 40,000 | 10% |
| Camp/offices | 50,000 | 12.5% |
| Lighting/other | 30,000 | 7.5% |

## Generator Management

### Routine Operations
- Daily: check oil level, coolant level, battery voltage
- Weekly: run under load for 30 minutes, record parameters
- Monthly: change oil and filters (or per hour-meter)
- Quarterly: load bank test, injector service

### Fuel Management
| Activity | Frequency | Responsible |
|----------|-----------|-------------|
| Fuel dip reading | Daily | Shift Technician |
| Bulk fuel order | When <50% capacity | Logistics |
| Fuel quality test | Monthly | Laboratory |
| Generator consumption report | Weekly | Engineering Manager |

## Energy Saving Measures

### Operational Controls
- Schedule high-consumption activities during off-peak tariff periods
- Implement automated conveyor start/stop based on load
- Optimise crusher settings to reduce power draw per tonne
- Install motion sensors for area lighting

### Equipment Upgrades
- Replace standard motors with high-efficiency (IE3/IE4) motors
- Install variable frequency drives on conveyor and pump motors
- Upgrade lighting to LED throughout site
- Consider solar hybrid solution for camp power

## Emergency Power Protocol

### Power Failure Response
1. Standby generator auto-starts within 10 seconds
2. Critical loads prioritised: control room, safety systems, dewatering
3. Engineering Manager notified within 5 minutes
4. Estimated restoration time communicated to all departments
5. Non-essential loads shed to maintain critical operations

## Reporting & KPIs

| KPI | Target |
|-----|--------|
| Power cost per tonne | RM 3.50/t |
| Generator uptime | >99% |
| Fuel consumption | <0.3 L/kWh |
| Peak demand | <4.5 MVA |
| Energy cost vs budget | Within ±5% |
