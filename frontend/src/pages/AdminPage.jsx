import { useState, useEffect, useCallback } from "react";

const ACCESS_LEVELS = ["admin", "manager", "staff"];

const COMMON_ROLES = [
  "Mine Manager", "HSE Manager", "Finance Manager", "Maintenance Manager",
  "Operations Manager", "Plant Manager", "Senior Engineer", "Engineer",
  "Geologist", "Surveyor", "Supervisor", "Maintenance Tech.",
  "Operator", "Admin Staff", "HR Executive", "Safety Officer", "Other",
];

const DEMO_USERS = [
  { id: 1, givenName: "Ahmad",    surname: "Zulkifli",  email: "ahmad@kros.my",  role: "Mine Manager",      access: "admin",   reportsTo: null, approvedBy: null, mustChangePassword: false, lastActive: "Today 08:15" },
  { id: 2, givenName: "Farah",    surname: "Izzati",    email: "farah@kros.my",  role: "HSE Manager",       access: "manager", reportsTo: 1,     approvedBy: 1,    mustChangePassword: false, lastActive: "Today 07:30" },
  { id: 3, givenName: "Tan Mei",  surname: "Ling",      email: "tan@kros.my",    role: "Finance Manager",   access: "manager", reportsTo: 1,     approvedBy: 1,    mustChangePassword: false, lastActive: "Yesterday 16:45" },
  { id: 4, givenName: "Amirul",   surname: "Haziq",     email: "amirul@kros.my", role: "Maintenance Tech.", access: "staff",   reportsTo: 2,     approvedBy: 1,    mustChangePassword: false, lastActive: "Today 08:42" },
  { id: 5, givenName: "Raj",      surname: "Namasivayam", email: "raj@kros.my",  role: "Mine Ops Super.",    access: "manager", reportsTo: 1,     approvedBy: 1,    mustChangePassword: true,  lastActive: "Never" },
  { id: 6, givenName: "Nurul",    surname: "Ain",       email: "nurul@kros.my",  role: "Finance Executive", access: "staff",   reportsTo: 3,     approvedBy: 3,    mustChangePassword: true,  lastActive: "Never" },
];

const emptyForm = { givenName: "", surname: "", email: "", role: "", customRole: "", access: "staff", reportsTo: "", approvedBy: "" };

export default function AdminPage({ user }) {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("staff");

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("kros_token");
      const res = await fetch("/api/auth/users", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data.users);
    } catch {
      setUsers(DEMO_USERS);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const roleValue = form.role === "Other" ? form.customRole || "" : form.role;
    const body = {
      givenName: form.givenName, surname: form.surname, email: form.email,
      role: roleValue, access: form.access,
      reportsTo: form.reportsTo ? parseInt(form.reportsTo, 10) : null,
      approvedBy: form.approvedBy ? parseInt(form.approvedBy, 10) : null,
    };
    try {
      const token = localStorage.getItem("kros_token");
      const url = editing ? `/api/auth/users/${editing.id}` : "/api/auth/users";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); setError(err.error || "Request failed"); return; }
      await fetchUsers();
      setShowForm(false); setEditing(null); setForm(emptyForm);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch { setError("Server unreachable — using demo mode"); }
  };

  const handleDelete = async (id, fn, sn) => {
    if (!confirm(`Delete user "${fn} ${sn}"?`)) return;
    try {
      const token = localStorage.getItem("kros_token");
      const res = await fetch(`/api/auth/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const err = await res.json(); alert(err.error || "Delete failed"); return; }
      await fetchUsers();
    } catch { setUsers(prev => prev.filter(u => u.id !== id)); }
  };

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newUser = {
      id: Date.now(), givenName: inviteEmail.split("@")[0], surname: "(Invited)",
      email: inviteEmail, role: "Pending", access: inviteRole,
      reportsTo: null, approvedBy: user.id, mustChangePassword: true, lastActive: "Invited"
    };
    setUsers(prev => [...prev, newUser]);
    setInviteEmail("");
    setShowInvite(false);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const startEdit = (u) => {
    const isCustom = u.role && !COMMON_ROLES.includes(u.role);
    setForm({ givenName: u.givenName, surname: u.surname, email: u.email, role: isCustom ? "Other" : u.role, customRole: isCustom ? u.role : "", access: u.access, reportsTo: u.reportsTo ? String(u.reportsTo) : "", approvedBy: u.approvedBy ? String(u.approvedBy) : "" });
    setEditing(u); setShowForm(true); setError("");
  };

  const cancelForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); setError(""); };

  const isAdmin = user.access === "admin";
  const otherUsers = users.filter(u => !editing || u.id !== editing.id);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-subtitle">Manage system users, access levels, and invitations</div>
        </div>
        <div className="page-header-actions">
          {isAdmin && !showForm && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowInvite(true)}>✉ Invite User</button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Add User</button>
            </>
          )}
        </div>
      </div>

      {saved && <div className="alert alert-info" style={{ marginBottom: 16 }}><span>✓</span> User saved successfully.</div>}
      {!isAdmin && <div className="alert alert-warn" style={{ marginBottom: 16 }}><span>⚠</span> You need admin access to manage users.</div>}

      {showInvite && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">Invite New User</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowInvite(false)}>✕ Cancel</button>
          </div>
          <form onSubmit={handleInvite}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="user@company.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Access Level</label>
                <select className="form-select" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  {ACCESS_LEVELS.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginBottom: 16 }}>Send Invite</button>
            </div>
          </form>
        </div>
      )}

      {showForm && isAdmin && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">{editing ? "Edit User" : "Add New User"}</div>
            <button className="btn btn-ghost btn-sm" onClick={cancelForm}>✕ Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Given Name</label>
                <input className="form-input" value={form.givenName} onChange={e => setForm({ ...form, givenName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Surname</label>
                <input className="form-input" value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role / Title</label>
                <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="">— Select role —</option>
                  {COMMON_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {form.role === "Other" && <input className="form-input" style={{ marginTop: 6 }} placeholder="Enter custom role" value={form.customRole || ""} onChange={e => setForm({ ...form, customRole: e.target.value })} />}
              </div>
              <div className="form-group">
                <label className="form-label">Access Level</label>
                <select className="form-select" value={form.access} onChange={e => setForm({ ...form, access: e.target.value })}>
                  {ACCESS_LEVELS.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reports To</label>
                <select className="form-select" value={form.reportsTo} onChange={e => setForm({ ...form, reportsTo: e.target.value })}>
                  <option value="">— None —</option>
                  {otherUsers.map(u => <option key={u.id} value={String(u.id)}>{u.givenName} {u.surname}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Approved By</label>
                <select className="form-select" value={form.approvedBy} onChange={e => setForm({ ...form, approvedBy: e.target.value })}>
                  <option value="">— None —</option>
                  {otherUsers.map(u => <option key={u.id} value={String(u.id)}>{u.givenName} {u.surname}</option>)}
                </select>
              </div>
            </div>
            {!editing && <div className="alert alert-info" style={{ fontSize: 11, marginTop: 10 }}>New users get default password <strong>123456</strong> and must change on first login.</div>}
            {error && <div className="alert alert-error" style={{ fontSize: 12, marginTop: 4 }}>⚠ {error}</div>}
            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <button type="submit" className="btn btn-primary">{editing ? "Save Changes" : "Create User"}</button>
              <button type="button" className="btn btn-ghost" onClick={cancelForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Access</th>
                <th>Reports To</th>
                <th>Status</th>
                <th>Last Active</th>
                {isAdmin && <th style={{ textAlign: "center" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const rpt = u.reportsTo ? users.find(x => x.id === u.reportsTo) : null;
                return (
                  <tr key={u.id}>
                    <td className="cell-bold">{u.givenName} {u.surname}</td>
                    <td className="cell-mono">{u.email}</td>
                    <td>{u.role}</td>
                    <td><span className={`badge ${u.access === "admin" ? "badge-purple" : u.access === "manager" ? "badge-gold" : "badge-teal"}`}>{u.access}</span></td>
                    <td style={{ fontSize: 12 }}>{rpt ? `${rpt.givenName} ${rpt.surname}` : <span className="cell-muted">—</span>}</td>
                    <td>{u.mustChangePassword ? <span className="badge badge-gold">First login</span> : <span style={{ color: "var(--green-light)", fontSize: 11 }}>✓ Active</span>}</td>
                    <td className="cell-mono">{u.lastActive || "—"}</td>
                    {isAdmin && (
                      <td style={{ textAlign: "center" }}>
                        <div className="table-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => startEdit(u)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.givenName, u.surname)}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">Access & Permissions Summary</div>
        </div>
        <div className="card-body">
          <div className="perm-grid">
            <div className="perm-card">
              <div className="perm-card-title">Admin</div>
              <div className="perm-card-count">{users.filter(u => u.access === "admin").length}</div>
              <div className="perm-card-desc">Full system access — users, settings, all modules</div>
            </div>
            <div className="perm-card">
              <div className="perm-card-title">Manager</div>
              <div className="perm-card-count">{users.filter(u => u.access === "manager").length}</div>
              <div className="perm-card-desc">Module access — view and edit skills, run analysis</div>
            </div>
            <div className="perm-card">
              <div className="perm-card-title">Staff</div>
              <div className="perm-card-count">{users.filter(u => u.access === "staff").length}</div>
              <div className="perm-card-desc">View only — browse skills, ask AI questions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
