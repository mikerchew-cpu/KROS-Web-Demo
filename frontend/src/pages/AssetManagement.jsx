import { useState } from "react";

const MACHINERY_TYPES = [
  "Excavator", "Bulldozer (Dozer)", "Wheel Loader", "Articulated Hauler (Dumper)",
  "Off-Highway Truck (Dump Truck)", "Hydraulic Mining Shovel", "Backhoe Loader",
  "Motor Grader", "Compactor / Roller", "Skid Steer Loader", "Track Loader",
  "Telehandler", "Forklift", "Drill Rig", "Roadheader", "Dragline",
  "Crane (Mobile)", "Crane (Crawler)", "Concrete Mixer Truck", "Lowbed Trailer",
  "Water Truck", "Fuel Truck", "Light Vehicle (4x4)", "Service Truck",
  "Generator", "Compressor", "Pump", "Screener / Crusher",
];

const MANUFACTURERS = ["Caterpillar", "Komatsu", "Hitachi", "Volvo", "Liebherr", "Sany", "XCMG", "JCB", "Kobelco", "Doosan", "Hyundai", "Sandvik", "Atlas Copco"];

const LOCATIONS = ["West Pit", "East Pit", "South Pit", "Crusher Area", "Workshop", "Fuel Station", "Stockpile Pad", "Admin Yard", "Haul Road A", "Camp"];

const STATUSES = [
  { id: "Working", label: "Working", icon: "🟢" },
  { id: "Repair", label: "Repair / Breakdown", icon: "🔴" },
  { id: "PM", label: "Scheduled PM", icon: "🟡" },
  { id: "Standby", label: "Standby / Idle", icon: "🔵" },
  { id: "Deployed", label: "Deployed Off-Site", icon: "🟣" },
  { id: "Retired", label: "Retired / Disposed", icon: "⚫" },
];

const ASSETS = [
  { id: "ASSET-001", type: "Excavator", make: "Caterpillar", model: "CAT 336D2 L", year: 2021, plate: "WXX 1234", serial: "CAT336D2L-123456", hrs: 8450, location: "West Pit", status: "Working", operator: "Amirul Haziq", purchaseDate: "2021-03-15", purchasePrice: 1850000, loanProvider: "Maybank Islamic", loanStart: "2021-04-01", loanEnd: "2027-04-01", monthlyInstallment: 28450, loanBalance: 485000, insurance: { provider: "Zurich", policy: "ZUR-EX-2025-1122", expiry: "2026-03-15", premium: 18500 }, roadtax: "2026-03-15", warranty: "Expired", fuelConsumption: 28.5, lastService: "2026-05-20", nextService: "2026-06-20" },
  { id: "ASSET-002", type: "Bulldozer (Dozer)", make: "Komatsu", model: "D375A-8", year: 2020, plate: "WXX 5678", serial: "KOMD375A-789012", hrs: 11200, location: "East Pit", status: "PM", operator: "Kevin Tan", purchaseDate: "2020-06-01", purchasePrice: 2200000, loanProvider: "CIMB Islamic", loanStart: "2020-07-01", loanEnd: "2026-07-01", monthlyInstallment: 34200, loanBalance: 210000, insurance: { provider: "AIA", policy: "AIA-DZ-2024-3344", expiry: "2027-06-01", premium: 22000 }, roadtax: "2026-06-01", warranty: "Expired", fuelConsumption: 42.0, lastService: "2026-05-15", nextService: "2026-06-15" },
  { id: "ASSET-003", type: "Articulated Hauler (Dumper)", make: "Volvo", model: "A60H", year: 2022, plate: "WXX 9012", serial: "VOLA60H-345678", hrs: 6200, location: "Haul Road A", status: "Working", operator: "Raj Namasivayam", purchaseDate: "2022-08-01", purchasePrice: 2800000, loanProvider: "Maybank Islamic", loanStart: "2022-09-01", loanEnd: "2028-09-01", monthlyInstallment: 41200, loanBalance: 1250000, insurance: { provider: "Zurich", policy: "ZUR-HT-2025-5566", expiry: "2027-08-01", premium: 28000 }, roadtax: "2026-08-01", warranty: "Active until Aug 2027", fuelConsumption: 52.0, lastService: "2026-05-18", nextService: "2026-06-18" },
  { id: "ASSET-004", type: "Wheel Loader", make: "Caterpillar", model: "CAT 980M", year: 2023, plate: "WXX 3456", serial: "CAT980M-901234", hrs: 3800, location: "Crusher Area", status: "Working", operator: "Siti Aminah", purchaseDate: "2023-02-01", purchasePrice: 1650000, loanProvider: "RHB Islamic", loanStart: "2023-03-01", loanEnd: "2029-03-01", monthlyInstallment: 25200, loanBalance: 980000, insurance: { provider: "AIA", policy: "AIA-WL-2024-7788", expiry: "2027-02-01", premium: 16500 }, roadtax: "2027-02-01", warranty: "Active until Feb 2028", fuelConsumption: 22.0, lastService: "2026-05-10", nextService: "2026-06-10" },
  { id: "ASSET-005", type: "Off-Highway Truck (Dump Truck)", make: "Caterpillar", model: "CAT 777G", year: 2022, plate: "WXX 7890", serial: "CAT777G-567890", hrs: 7200, location: "West Pit", status: "Repair", operator: "Amirul Haziq", purchaseDate: "2022-04-01", purchasePrice: 3200000, loanProvider: "Maybank Islamic", loanStart: "2022-05-01", loanEnd: "2028-05-01", monthlyInstallment: 46500, loanBalance: 1420000, insurance: { provider: "Zurich", policy: "ZUR-HT-2025-9900", expiry: "2026-04-01", premium: 32000 }, roadtax: "2026-04-01", warranty: "Active until May 2027", fuelConsumption: 65.0, lastService: "2026-05-22", nextService: "2026-06-22", issue: "Brake system fault — awaiting parts" },
  { id: "ASSET-006", type: "Motor Grader", make: "Komatsu", model: "GD675-6", year: 2021, plate: "WXX 1122", serial: "KOMGD675-234567", hrs: 5400, location: "Haul Road A", status: "Working", operator: "Raj Namasivayam", purchaseDate: "2021-11-01", purchasePrice: 980000, loanProvider: "CIMB Islamic", loanStart: "2021-12-01", loanEnd: "2027-12-01", monthlyInstallment: 15200, loanBalance: 320000, insurance: { provider: "AIA", policy: "AIA-GR-2025-1122", expiry: "2026-11-01", premium: 9800 }, roadtax: "2026-11-01", warranty: "Expired", fuelConsumption: 18.5, lastService: "2026-05-05", nextService: "2026-06-05" },
  { id: "ASSET-007", type: "Drill Rig", make: "Sandvik", model: "DP1500i", year: 2023, plate: "WXX 3344", serial: "SANDVDP1500-890123", hrs: 2600, location: "East Pit", status: "Working", operator: "Siti Aminah", purchaseDate: "2023-06-01", purchasePrice: 4500000, loanProvider: "Maybank Islamic", loanStart: "2023-07-01", loanEnd: "2029-07-01", monthlyInstallment: 65000, loanBalance: 2800000, insurance: { provider: "Zurich", policy: "ZUR-DR-2025-3344", expiry: "2027-06-01", premium: 45000 }, roadtax: "2027-06-01", warranty: "Active until Jun 2028", fuelConsumption: 35.0, lastService: "2026-05-12", nextService: "2026-06-12" },
  { id: "ASSET-008", type: "Compactor / Roller", make: "BOMAG", model: "BW226DH-5", year: 2020, plate: "WXX 5566", serial: "BOMBW226-456789", hrs: 9800, location: "South Pit", status: "Standby", operator: "Kevin Tan", purchaseDate: "2020-09-01", purchasePrice: 520000, loanProvider: "RHB Islamic", loanStart: "2020-10-01", loanEnd: "2025-10-01", monthlyInstallment: 9500, loanBalance: 0, insurance: { provider: "AIA", policy: "AIA-CP-2024-5566", expiry: "2026-09-01", premium: 5200 }, roadtax: "2026-09-01", warranty: "Expired", fuelConsumption: 12.0, lastService: "2026-04-28", nextService: "2026-06-28" },
  { id: "ASSET-009", type: "Water Truck", make: "Isuzu", model: "FVM 34T", year: 2022, plate: "WXX 7788", serial: "ISUFVM34-678901", hrs: 4100, location: "Haul Road A", status: "Working", operator: "Mohd Asyraf", purchaseDate: "2022-02-01", purchasePrice: 380000, loanProvider: "Maybank Islamic", loanStart: "2022-03-01", loanEnd: "2027-03-01", monthlyInstallment: 6200, loanBalance: 125000, insurance: { provider: "Zurich", policy: "ZUR-WT-2025-7788", expiry: "2027-02-01", premium: 3800 }, roadtax: "2027-02-01", warranty: "Active until Feb 2027", fuelConsumption: 8.5, lastService: "2026-05-08", nextService: "2026-06-08" },
  { id: "ASSET-010", type: "Generator", make: "Caterpillar", model: "C32 (1000kVA)", year: 2021, plate: "GEN-001", serial: "CATC32-345678", hrs: 18500, location: "Crusher Area", status: "Working", operator: "Kevin Tan", purchaseDate: "2021-01-15", purchasePrice: 850000, loanProvider: "CIMB Islamic", loanStart: "2021-02-01", loanEnd: "2026-02-01", monthlyInstallment: 14800, loanBalance: 0, insurance: { provider: "AIA", policy: "AIA-GN-2024-9900", expiry: "2027-01-15", premium: 8500 }, roadtax: "—", warranty: "Expired", fuelConsumption: 85.0, lastService: "2026-05-01", nextService: "2026-07-01" },
  { id: "ASSET-011", type: "Light Vehicle (4x4)", make: "Toyota", model: "Hilux 2.8G", year: 2024, plate: "WXX 9900", serial: "TOYHILUX-112233", km: 28500, location: "Admin Yard", status: "Working", operator: "Farah Izzati", purchaseDate: "2024-01-10", purchasePrice: 148000, loanProvider: "RHB Islamic", loanStart: "2024-02-01", loanEnd: "2028-02-01", monthlyInstallment: 3100, loanBalance: 85000, insurance: { provider: "Zurich", policy: "ZUR-LV-2025-1122", expiry: "2027-01-10", premium: 2800 }, roadtax: "2027-01-10", warranty: "Active until Jan 2028", fuelConsumption: 8.2, lastService: "2026-05-25", nextService: "2026-08-25" },
  { id: "ASSET-012", type: "Crane (Mobile)", make: "Liebherr", model: "LTM 1055-4.2", year: 2022, plate: "WXX 2468", serial: "LIEBLTM1055-789012", hrs: 3200, location: "Workshop", status: "Standby", operator: "Raj Namasivayam", purchaseDate: "2022-10-01", purchasePrice: 3800000, loanProvider: "Maybank Islamic", loanStart: "2022-11-01", loanEnd: "2029-11-01", monthlyInstallment: 52000, loanBalance: 2100000, insurance: { provider: "Zurich", policy: "ZUR-CR-2025-2468", expiry: "2026-10-01", premium: 38000 }, roadtax: "2026-10-01", warranty: "Active until Oct 2027", fuelConsumption: 38.0, lastService: "2026-05-02", nextService: "2026-07-02" },
];

const DOCS_UPLOADED = [
  { asset: "ASSET-001", name: "Grant_Letter_CAT336.pdf", type: "Loan Grant", date: "2021-03-20" },
  { asset: "ASSET-001", name: "Insurance_ZUR_EX_2025.pdf", type: "Insurance", date: "2025-03-01" },
  { asset: "ASSET-003", name: "Roadtax_A60H_2026.pdf", type: "Road Tax", date: "2025-08-01" },
  { asset: "ASSET-005", name: "Service_Record_777G.pdf", type: "Service Record", date: "2026-05-22" },
  { asset: "ASSET-011", name: "Grant_Letter_Hilux.pdf", type: "Loan Grant", date: "2024-02-01" },
];

function monthsBetween(d1, d2) {
  const m1 = new Date(d1).getFullYear() * 12 + new Date(d1).getMonth();
  const m2 = new Date(d2).getFullYear() * 12 + new Date(d2).getMonth();
  return Math.max(0, m2 - m1);
}

function daysUntil(d) {
  if (!d || d === "—") return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

export default function AssetManagement() {
  const [selected, setSelected] = useState(ASSETS[0]);
  const [tab, setTab] = useState("overview");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = ASSETS.filter(a => (filterType === "All" || a.type === filterType) && (filterStatus === "All" || a.status === filterStatus));
  const totalLoanBalance = ASSETS.reduce((s, a) => s + a.loanBalance, 0);
  const totalValue = ASSETS.reduce((s, a) => s + a.purchasePrice, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Asset Management</div><div className="page-subtitle">Machinery fleet tracking — finance, maintenance, documents, and lifecycle with AI</div></div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Asset</button>
      </div>

      <div className="board-main-grid" style={{ marginBottom: 20 }}>
        <div className="board-kpi-card"><div className="board-kpi-label">Total Assets</div><div className="board-kpi-main">{ASSETS.length}</div><div className="board-kpi-meta">{ASSETS.filter(a => a.status === "Working").length} working · {ASSETS.filter(a => a.status === "Repair").length} in repair</div></div>
        <div className="board-kpi-card"><div className="board-kpi-label">Fleet Value</div><div className="board-kpi-main">RM {(totalValue / 1e6).toFixed(1)}<span className="kpi-unit">M</span></div><div className="board-kpi-meta">Avg {(totalValue / ASSETS.length / 1000).toFixed(0)}k per asset</div></div>
        <div className="board-kpi-card"><div className="board-kpi-label">Loan Balance</div><div className="board-kpi-main">RM {(totalLoanBalance / 1e6).toFixed(1)}<span className="kpi-unit">M</span></div><div className="board-kpi-meta">{ASSETS.filter(a => a.loanBalance > 0).length} assets financing</div></div>
        <div className="board-kpi-card"><div className="board-kpi-label">Next Installment</div><div className="board-kpi-main">RM {ASSETS.reduce((s, a) => s + a.monthlyInstallment, 0).toLocaleString()}<span className="kpi-unit">/mo</span></div><div className="board-kpi-meta">Total monthly commitment</div></div>
      </div>

      <div className="asset-layout">
        <div className="asset-list-panel">
          <div className="card" style={{ padding: 0 }}>
            <div className="asset-list-header">
              <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ fontSize: 11, padding: "5px 8px", flex: 1 }}>
                <option value="All">All Types</option>
                {MACHINERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ fontSize: 11, padding: "5px 8px", flex: 1 }}>
                <option value="All">All Status</option>
                {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="asset-list-items">
              {filtered.map(a => (
                <div key={a.id} className={`asset-item ${selected.id === a.id ? "selected" : ""}`} onClick={() => setSelected(a)}>
                  <div className="asset-item-header">
                    <span className="asset-item-type">{a.type}</span>
                    <span className={`asset-status-dot ${a.status.toLowerCase()}`} title={STATUSES.find(s => s.id === a.status)?.label} />
                  </div>
                  <div className="asset-item-info">
                    <span className="asset-item-name">{a.make} {a.model}</span>
                    <span className="asset-item-plate">{a.plate}</span>
                  </div>
                  <div className="asset-item-meta">
                    <span>{a.location}</span>
                    <span className="cell-mono">{a.hrs?.toLocaleString() || a.km?.toLocaleString()} {a.hrs ? "h" : "km"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="asset-detail-panel">
          <div className="tabs" style={{ marginBottom: 16 }}>
            <button className={`tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
            <button className={`tab ${tab === "finance" ? "active" : ""}`} onClick={() => setTab("finance")}>Finance</button>
            <button className={`tab ${tab === "maintenance" ? "active" : ""}`} onClick={() => setTab("maintenance")}>Maintenance</button>
            <button className={`tab ${tab === "documents" ? "active" : ""}`} onClick={() => setTab("documents")}>Documents</button>
          </div>

          {tab === "overview" && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">{selected.make} {selected.model}</div>
                <div className="card-subtitle">{selected.id} · {selected.plate}</div>
              </div>
              <div className="card-body">
                <div className="asset-detail-grid">
                  <div className="hrm-field"><span className="hrm-field-label">Type</span><span className="hrm-field-value">{selected.type}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Serial No.</span><span className="hrm-field-value cell-mono">{selected.serial}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Year</span><span className="hrm-field-value">{selected.year}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Plate No.</span><span className="hrm-field-value">{selected.plate}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Location</span><span className="hrm-field-value">{selected.location}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Status</span><span className="hrm-field-value">{STATUSES.find(s => s.id === selected.status)?.icon} {selected.status}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Operator</span><span className="hrm-field-value">{selected.operator}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Hours / KM</span><span className="hrm-field-value">{selected.hrs?.toLocaleString() || "—"} {selected.hrs ? "hrs" : ""}{selected.km ? `${selected.km.toLocaleString()} km` : ""}</span></div>
                  <div className="hrm-field" style={{ gridColumn: "span 2" }}>
                    <span className="hrm-field-label">Issue / Notes</span>
                    <span className="hrm-field-value" style={{ color: selected.issue ? "var(--red)" : "var(--green-light)" }}>
                      {selected.issue || "No issues reported"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "finance" && (
            <>
              <div className="dashboard-panels" style={{ marginBottom: 16 }}>
                <div className="card">
                  <div className="card-header"><div className="card-title">Purchase & Financing</div></div>
                  <div className="card-body">
                    <div className="asset-detail-grid">
                      <div className="hrm-field"><span className="hrm-field-label">Purchase Date</span><span className="hrm-field-value">{selected.purchaseDate}</span></div>
                      <div className="hrm-field"><span className="hrm-field-label">Purchase Price</span><span className="hrm-field-value" style={{ color: "var(--gold)", fontWeight: 700 }}>RM {selected.purchasePrice.toLocaleString()}</span></div>
                      <div className="hrm-field"><span className="hrm-field-label">Loan Provider</span><span className="hrm-field-value">{selected.loanProvider}</span></div>
                      <div className="hrm-field"><span className="hrm-field-label">Loan Period</span><span className="hrm-field-value">{selected.loanStart} → {selected.loanEnd}</span></div>
                      <div className="hrm-field"><span className="hrm-field-label">Monthly Installment</span><span className="hrm-field-value" style={{ color: "var(--red)", fontWeight: 700 }}>RM {selected.monthlyInstallment.toLocaleString()}</span></div>
                      <div className="hrm-field"><span className="hrm-field-label">Remaining Balance</span><span className="hrm-field-value" style={{ color: selected.loanBalance > 0 ? "var(--gold)" : "var(--green-light)", fontWeight: 700 }}>RM {selected.loanBalance.toLocaleString()}{selected.loanBalance === 0 ? " (PAID)" : ""}</span></div>
                      <div className="hrm-field"><span className="hrm-field-label">Months Remaining</span><span className="hrm-field-value">{selected.loanBalance > 0 ? monthsBetween(new Date().toISOString().slice(0, 10), selected.loanEnd) : 0} months</span></div>
                      <div className="hrm-field"><span className="hrm-field-label">Loan Status</span><span className="hrm-field-value">{selected.loanBalance > 0 ? <span className="badge badge-gold">Active</span> : <span className="badge badge-green">Settled</span>}</span></div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header"><div className="card-title">Insurance & Road Tax</div></div>
                  <div className="card-body">
                    <div className="asset-detail-grid">
                      <div className="hrm-field"><span className="hrm-field-label">Insurer</span><span className="hrm-field-value">{selected.insurance.provider}</span></div>
                      <div className="hrm-field"><span className="hrm-field-label">Policy No.</span><span className="hrm-field-value cell-mono">{selected.insurance.policy}</span></div>
                      <div className="hrm-field"><span className="hrm-field-label">Annual Premium</span><span className="hrm-field-value">RM {selected.insurance.premium.toLocaleString()}</span></div>
                      <div className="hrm-field"><span className="hrm-field-label">Insurance Expiry</span><span className={`hrm-field-value ${daysUntil(selected.insurance.expiry) <= 30 ? "hrm-expired" : ""}`}>{selected.insurance.expiry} ({daysUntil(selected.insurance.expiry)} days)</span></div>
                      <div className="hrm-field"><span className="hrm-field-label">Road Tax Expiry</span><span className={`hrm-field-value ${daysUntil(selected.roadtax) <= 30 ? "hrm-expired" : ""}`}>{selected.roadtax} ({daysUntil(selected.roadtax)} days)</span></div>
                      <div className="hrm-field"><span className="hrm-field-label">Warranty</span><span className="hrm-field-value">{selected.warranty}</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ai-insight">
                <span className="ai-insight-icon">✦</span>
                <span><strong>AI Financial Analysis:</strong> {selected.make} {selected.model} ({selected.plate}) — Purchase price RM {(selected.purchasePrice / 1e6).toFixed(1)}M. 
                {selected.loanBalance > 0 
                  ? ` Remaining loan RM ${(selected.loanBalance / 1e3).toFixed(0)}k over ${monthsBetween(new Date().toISOString().slice(0,10), selected.loanEnd)} months (RM ${selected.monthlyInstallment.toLocaleString()}/mo).`
                  : " Loan fully settled."}
                {daysUntil(selected.insurance.expiry) <= 30 ? ` ⚠ Insurance expiring in ${daysUntil(selected.insurance.expiry)} days — renew immediately.` : ""}
                {daysUntil(selected.roadtax) <= 30 ? ` ⚠ Road tax expiring in ${daysUntil(selected.roadtax)} days.` : ""}
                </span>
              </div>
            </>
          )}

          {tab === "maintenance" && (
            <div className="card">
              <div className="card-header"><div className="card-title">Maintenance Schedule</div></div>
              <div className="card-body">
                <div className="asset-detail-grid">
                  <div className="hrm-field"><span className="hrm-field-label">Fuel Consumption</span><span className="hrm-field-value">{selected.fuelConsumption} L/hr{selected.fuelConsumption < 10 ? " (km/L)" : ""}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Last Service</span><span className="hrm-field-value">{selected.lastService}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Next Service Due</span><span className={`hrm-field-value ${daysUntil(selected.nextService) <= 7 ? "hrm-expired" : ""}`}>{selected.nextService} ({daysUntil(selected.nextService)} days)</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Service Status</span><span className="hrm-field-value">
                    {daysUntil(selected.nextService) <= 0 ? <span className="badge badge-red">Overdue</span> :
                     daysUntil(selected.nextService) <= 7 ? <span className="badge badge-gold">Due Soon</span> :
                     <span className="badge badge-green">On Track</span>}
                  </span></div>
                </div>
                <div className="ai-insight" style={{ marginTop: 12 }}>
                  <span className="ai-insight-icon">✦</span>
                  <span><strong>AI Maintenance:</strong> {selected.type} — {selected.hrs ? `${selected.hrs.toLocaleString()} engine hours` : `${selected.km?.toLocaleString()} km`}. 
                  {daysUntil(selected.nextService) <= 0 ? ` Service OVERDUE — schedule immediately to avoid breakdown risk.` :
                   daysUntil(selected.nextService) <= 7 ? ` Service due in ${daysUntil(selected.nextService)} days — plan workshop slot.` :
                   ` Next service in ${daysUntil(selected.nextService)} days — on schedule.`}
                  {selected.status === "Repair" ? ` Current issue: ${selected.issue}.` : ""}
                  </span>
                </div>
              </div>
            </div>
          )}

          {tab === "documents" && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Documents</div>
                <button className="btn btn-ghost btn-sm">+ Upload</button>
              </div>
              <div className="card-body">
                <div className="asset-doc-categories">
                  {["Loan Grant Letter", "Insurance Policy", "Road Tax", "Service Record", "Inspection Cert", "Warranty", "Operator Manual", "Transfer/Disposal"].map((cat, i) => {
                    const has = DOCS_UPLOADED.filter(d => d.asset === selected.id && d.type === cat).length > 0;
                    return (
                      <div key={i} className={`asset-doc-cat ${has ? "has" : ""}`}>
                        <span className="asset-doc-cat-name">{cat}</span>
                        {has ? <span className="badge badge-green">✓</span> : <span className="badge badge-muted">Upload</span>}
                      </div>
                    );
                  })}
                </div>
                {DOCS_UPLOADED.filter(d => d.asset === selected.id).map((d, i) => (
                  <div key={i} className="hrm-doc-row">
                    <div className="hrm-doc-icon">📄</div>
                    <div className="hrm-doc-info">
                      <div className="hrm-doc-name">{d.name}</div>
                      <div className="hrm-doc-meta">{d.type} · {d.date}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm">⬇</button>
                  </div>
                ))}
                <div className="upload-zone" style={{ marginTop: 12, padding: 14 }} onClick={() => {}}>
                  <div className="upload-text" style={{ fontSize: 12 }}>+ Upload Document (Grant, Insurance, Road Tax, etc.)</div>
                  <div className="upload-sub" style={{ fontSize: 10 }}>PDF, JPG, PNG — max 10MB</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
