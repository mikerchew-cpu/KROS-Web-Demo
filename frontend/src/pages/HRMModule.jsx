import { useState } from "react";

const LEVELS = ["Level 1 — Operator", "Level 2 — Technician", "Level 3 — Senior Technician", "Level 4 — Supervisor", "Level 5 — Engineer", "Level 6 — Senior Engineer", "Level 7 — Manager", "Level 8 — Senior Manager"];

const DEPARTMENTS = ["Mining", "Processing", "Maintenance", "HSE", "HR & Admin", "Finance", "Geology", "Environment", "Logistics", "Quality", "Community"];

const WORKERS = [
  { id: "EMP-001", givenName: "Ahmad", surname: "Zulkifli", ic: "810101-01-1234", passport: "A12345678", dob: "1981-01-01", gender: "Male", nationality: "Malaysian", phone: "+60 12-345 6789", email: "ahmad.z@kros.my", department: "Mining", position: "Mine Manager", level: "Level 8 — Senior Manager", joined: "2019-03-01", status: "Active", emergency: { name: "Siti Zubaidah", relation: "Spouse", phone: "+60 12-987 6543" }, insurance: { provider: "GREAT Eastern", policy: "GE-MN-2024-8871", coverage: "RM 500,000", expiry: "2027-03-01" }, documents: [
    { name: "Passport_Ahmad.pdf", type: "Passport", date: "2024-01-15", status: "verified" },
    { name: "IC_Ahmad.pdf", type: "IC", date: "2024-01-15", status: "verified" },
    { name: "Mining_Manager_Cert.pdf", type: "Certification", date: "2025-06-01", status: "verified" },
  ]},
  { id: "EMP-002", givenName: "Farah", surname: "Izzati", ic: "850605-01-5678", passport: "B23456789", dob: "1985-06-05", gender: "Female", nationality: "Malaysian", phone: "+60 13-456 7890", email: "farah.i@kros.my", department: "HSE", position: "HSE Manager", level: "Level 7 — Manager", joined: "2020-06-15", status: "Active", emergency: { name: "Mohd Asyraf", relation: "Spouse", phone: "+60 11-234 5678" }, insurance: { provider: "AIA Malaysia", policy: "AIA-HSE-2023-4421", coverage: "RM 350,000", expiry: "2026-06-15" }, documents: [
    { name: "Passport_Farah.pdf", type: "Passport", date: "2024-03-01", status: "verified" },
    { name: "DOSH_GreenBook.pdf", type: "Certification", date: "2025-04-20", status: "verified" },
  ]},
  { id: "EMP-003", givenName: "Amirul", surname: "Haziq", ic: "920312-01-9012", passport: "C34567890", dob: "1992-03-12", gender: "Male", nationality: "Malaysian", phone: "+60 14-567 8901", email: "amirul.h@kros.my", department: "Maintenance", position: "Maintenance Technician", level: "Level 3 — Senior Technician", joined: "2021-09-01", status: "Active", emergency: { name: "Rosniza Hassan", relation: "Mother", phone: "+60 16-789 0123" }, insurance: { provider: "GREAT Eastern", policy: "GE-MT-2021-3322", coverage: "RM 150,000", expiry: "2026-09-01" }, documents: [
    { name: "Passport_Amirul.pdf", type: "Passport", date: "2023-11-20", status: "expiring" },
    { name: "IC_Amirul.pdf", type: "IC", date: "2024-01-15", status: "verified" },
  ]},
  { id: "EMP-004", givenName: "Tan Mei", surname: "Ling", ic: "820720-01-3456", passport: "D45678901", dob: "1982-07-20", gender: "Female", nationality: "Malaysian", phone: "+60 12-678 9012", email: "tan.ml@kros.my", department: "Finance", position: "Finance Manager", level: "Level 7 — Manager", joined: "2020-01-10", status: "Active", emergency: { name: "Tan Kok Seng", relation: "Father", phone: "+60 12-345 6780" }, insurance: { provider: "AIA Malaysia", policy: "AIA-FIN-2020-1122", coverage: "RM 350,000", expiry: "2027-01-10" }, documents: [
    { name: "Passport_TanML.pdf", type: "Passport", date: "2024-06-01", status: "verified" },
    { name: "Finance_Cert.pdf", type: "Certification", date: "2025-01-15", status: "verified" },
  ]},
  { id: "EMP-005", givenName: "Raj", surname: "Namasivayam", ic: "780815-01-7890", passport: "E56789012", dob: "1978-08-15", gender: "Male", nationality: "Malaysian", phone: "+60 16-789 0123", email: "raj.n@kros.my", department: "Mining", position: "Mine Operations Superintendent", level: "Level 7 — Manager", joined: "2018-06-01", status: "Active", emergency: { name: "Devi Namasivayam", relation: "Spouse", phone: "+60 11-876 5432" }, insurance: { provider: "GREAT Eastern", policy: "GE-OP-2018-9988", coverage: "RM 400,000", expiry: "2027-06-01" }, documents: [
    { name: "Passport_Raj.pdf", type: "Passport", date: "2024-02-10", status: "verified" },
    { name: "Blasting_Cert.pdf", type: "Certification", date: "2025-06-15", status: "verified" },
    { name: "IC_Raj.pdf", type: "IC", date: "2024-01-15", status: "verified" },
  ]},
  { id: "EMP-006", givenName: "Kevin", surname: "Tan", ic: "950110-01-2345", passport: "F67890123", dob: "1995-01-10", gender: "Male", nationality: "Malaysian", phone: "+60 17-890 1234", email: "kevin.t@kros.my", department: "Maintenance", position: "Maintenance Technician", level: "Level 2 — Technician", joined: "2023-03-15", status: "Active", emergency: { name: "Tan Ah Kow", relation: "Father", phone: "+60 12-345 6781" }, insurance: { provider: "GREAT Eastern", policy: "GE-MT-2023-5544", coverage: "RM 100,000", expiry: "2027-03-15" }, documents: [
    { name: "Passport_Kevin.pdf", type: "Passport", date: "2024-05-01", status: "verified" },
  ]},
];

const DOC_TYPES = ["Passport", "IC", "Work Permit", "Visa", "Certification", "Employment Contract", "Insurance", "Medical", "Training Cert", "Other"];

export default function HRMModule() {
  const [selectedWorker, setSelectedWorker] = useState(WORKERS[0]);
  const [tab, setTab] = useState("profile");
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = WORKERS.filter(w => (filterDept === "All" || w.department === filterDept) && (filterStatus === "All" || w.status === filterStatus));
  const w = selectedWorker;

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">HRM — Human Resource Management</div><div className="page-subtitle">Worker information, emergency contacts, insurance, levels, and document management</div></div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddWorker(true)}>+ Add Worker</button>
      </div>

      <div className="board-main-grid" style={{ marginBottom: 20 }}>
        <div className="board-kpi-card"><div className="board-kpi-label">Total Workers</div><div className="board-kpi-main">{WORKERS.length}</div><div className="board-kpi-meta">{WORKERS.filter(w => w.status === "Active").length} active</div></div>
        <div className="board-kpi-card"><div className="board-kpi-label">Departments</div><div className="board-kpi-main">{new Set(WORKERS.map(w => w.department)).size}</div><div className="board-kpi-meta">{new Set(WORKERS.map(w => w.position)).size} positions</div></div>
        <div className="board-kpi-card"><div className="board-kpi-label">Insurance Active</div><div className="board-kpi-main">{WORKERS.filter(w => new Date(w.insurance.expiry) > new Date()).length}</div><div className="board-kpi-meta">{WORKERS.filter(w => new Date(w.insurance.expiry) <= new Date()).length} expiring</div></div>
        <div className="board-kpi-card"><div className="board-kpi-label">Docs Verified</div><div className="board-kpi-main">{WORKERS.reduce((s, w) => s + w.documents.filter(d => d.status === "verified").length, 0)}</div><div className="board-kpi-meta">{WORKERS.reduce((s, w) => s + w.documents.filter(d => d.status === "expiring").length, 0)} expiring</div></div>
      </div>

      <div className="hrm-layout">
        <div className="hrm-worker-list">
          <div className="card" style={{ padding: 0 }}>
            <div className="hrm-list-header">
              <select className="form-select" value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ fontSize: 11, padding: "5px 8px" }}>
                <option value="All">All Depts</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ fontSize: 11, padding: "5px 8px" }}>
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <span className="cell-mono" style={{ fontSize: 10 }}>{filtered.length}</span>
            </div>
            <div className="hrm-worker-items">
              {filtered.map(worker => (
                <div key={worker.id} className={`hrm-worker-item ${selectedWorker.id === worker.id ? "selected" : ""}`} onClick={() => setSelectedWorker(worker)}>
                  <div className="hrm-worker-avatar">{worker.givenName[0]}{worker.surname[0]}</div>
                  <div className="hrm-worker-info">
                    <div className="hrm-worker-name">{worker.givenName} {worker.surname}</div>
                    <div className="hrm-worker-meta">{worker.position} · {worker.department}</div>
                    <div className="hrm-worker-id">{worker.id}</div>
                  </div>
                  <span className={`badge badge-${worker.status === "Active" ? "green" : "muted"}`} style={{ fontSize: 8 }}>{worker.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hrm-worker-detail">
          <div className="tabs" style={{ marginBottom: 16 }}>
            <button className={`tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>Profile</button>
            <button className={`tab ${tab === "emergency" ? "active" : ""}`} onClick={() => setTab("emergency")}>Emergency</button>
            <button className={`tab ${tab === "insurance" ? "active" : ""}`} onClick={() => setTab("insurance")}>Insurance</button>
            <button className={`tab ${tab === "documents" ? "active" : ""}`} onClick={() => setTab("documents")}>Documents</button>
          </div>

          {tab === "profile" && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">{w.givenName} {w.surname}</div>
                <div className="card-subtitle">{w.id} · {w.position}</div>
              </div>
              <div className="card-body">
                <div className="hrm-detail-grid">
                  <div className="hrm-field"><span className="hrm-field-label">IC Number</span><span className="hrm-field-value">{w.ic}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Passport</span><span className="hrm-field-value">{w.passport}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Date of Birth</span><span className="hrm-field-value">{w.dob}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Gender</span><span className="hrm-field-value">{w.gender}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Nationality</span><span className="hrm-field-value">{w.nationality}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Phone</span><span className="hrm-field-value">{w.phone}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Email</span><span className="hrm-field-value">{w.email}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Department</span><span className="hrm-field-value">{w.department}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Level</span><span className="hrm-field-value"><span className="badge badge-purple">{w.level}</span></span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Joined</span><span className="hrm-field-value">{w.joined}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Status</span><span className="hrm-field-value"><span className={`badge badge-${w.status === "Active" ? "green" : "muted"}`}>{w.status}</span></span></div>
                </div>
              </div>
            </div>
          )}

          {tab === "emergency" && (
            <div className="card">
              <div className="card-header"><div className="card-title">Emergency Contact</div></div>
              <div className="card-body">
                <div className="hrm-detail-grid">
                  <div className="hrm-field"><span className="hrm-field-label">Contact Name</span><span className="hrm-field-value hrm-emergency-name">{w.emergency.name}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Relation</span><span className="hrm-field-value">{w.emergency.relation}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Phone</span><span className="hrm-field-value">{w.emergency.phone}</span></div>
                </div>
                <div className="ai-insight" style={{ marginTop: 12 }}>
                  <span className="ai-insight-icon">✦</span>
                  <span><strong>AI Check:</strong> Emergency contact recorded. Recommended: review emergency contact details every 6 months. Add secondary emergency contact for redundancy.</span>
                </div>
              </div>
            </div>
          )}

          {tab === "insurance" && (
            <div className="card">
              <div className="card-header"><div className="card-title">Insurance Coverage</div></div>
              <div className="card-body">
                <div className="hrm-detail-grid">
                  <div className="hrm-field"><span className="hrm-field-label">Provider</span><span className="hrm-field-value">{w.insurance.provider}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Policy No.</span><span className="hrm-field-value">{w.insurance.policy}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Coverage</span><span className="hrm-field-value hrm-insurance-amount">{w.insurance.coverage}</span></div>
                  <div className="hrm-field"><span className="hrm-field-label">Expiry</span><span className={`hrm-field-value ${new Date(w.insurance.expiry) <= new Date() ? "hrm-expired" : ""}`}>{w.insurance.expiry} {new Date(w.insurance.expiry) <= new Date() ? "(Expired)" : `(${Math.ceil((new Date(w.insurance.expiry) - new Date()) / (1000*60*60*24))} days remaining)`}</span></div>
                </div>
                <div className="ai-insight" style={{ marginTop: 12 }}>
                  <span className="ai-insight-icon">✦</span>
                  <span><strong>AI Analysis:</strong> {new Date(w.insurance.expiry) <= new Date() ? `Insurance expired. Immediate renewal required. Contact ${w.insurance.provider} for reinstatement.` : `Insurance active until ${w.insurance.expiry}. Coverage of ${w.insurance.coverage}. Remind HR to initiate renewal 30 days before expiry.`}</span>
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
                {w.documents.length === 0 ? (
                  <div className="empty-state">No documents uploaded</div>
                ) : (
                  w.documents.map((doc, i) => (
                    <div key={i} className="hrm-doc-row">
                      <div className="hrm-doc-icon">{doc.type === "Passport" ? "🛂" : doc.type === "IC" ? "🆔" : doc.type === "Certification" ? "📜" : "📄"}</div>
                      <div className="hrm-doc-info">
                        <div className="hrm-doc-name">{doc.name}</div>
                        <div className="hrm-doc-meta">{doc.type} · Uploaded {doc.date}</div>
                      </div>
                      <span className={`badge badge-${doc.status === "verified" ? "green" : "gold"}`}>{doc.status}</span>
                      <button className="btn btn-ghost btn-sm" title="Download">⬇</button>
                    </div>
                  ))
                )}
                <div className="upload-zone" style={{ marginTop: 12, padding: 14 }} onClick={() => {}}>
                  <div className="upload-text" style={{ fontSize: 12 }}>+ Upload Document (Passport, Permit, Contract, etc.)</div>
                  <div className="upload-sub" style={{ fontSize: 10 }}>PDF, JPG, PNG — max 10MB</div>
                </div>
              </div>
              <div className="card-footer">
                <div className="ai-insight"><span className="ai-insight-icon">✦</span><span><strong>AI Document Check:</strong> {w.documents.filter(d => d.status === "expiring").length > 0 ? `${w.documents.filter(d => d.status === "expiring").length} document(s) expiring soon. Schedule renewal.` : "All documents verified and current."}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
