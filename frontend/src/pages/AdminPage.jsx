import { useState, useEffect, useCallback } from "react";

const ACCESS_LEVELS = ["admin", "manager", "staff"];

const COMMON_ROLES = [
  "Mine Manager",
  "HSE Manager",
  "Finance Manager",
  "Maintenance Manager",
  "Operations Manager",
  "Plant Manager",
  "Senior Engineer",
  "Engineer",
  "Geologist",
  "Surveyor",
  "Supervisor",
  "Maintenance Tech.",
  "Operator",
  "Admin Staff",
  "HR Executive",
  "Safety Officer",
  "Other",
];

const emptyForm = { givenName: "", surname: "", email: "", role: "", customRole: "", access: "staff", reportsTo: "", approvedBy: "" };

export default function AdminPage({ user }) {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const token = localStorage.getItem("kros_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const DEMO_USERS = [
    { id: 1, givenName: "Ahmad",    surname: "Zulkifli",  email: "ahmad@kros.my",  role: "Mine Manager",      access: "admin",   reportsTo: null, approvedBy: null, mustChangePassword: false },
    { id: 2, givenName: "Farah",    surname: "Izzati",    email: "farah@kros.my",  role: "HSE Manager",       access: "manager", reportsTo: 1,     approvedBy: 1,    mustChangePassword: false },
    { id: 3, givenName: "Tan Mei",  surname: "Ling",      email: "tan@kros.my",    role: "Finance Manager",   access: "manager", reportsTo: 1,     approvedBy: 1,    mustChangePassword: false },
    { id: 4, givenName: "Amirul",   surname: "Haziq",     email: "amirul@kros.my", role: "Maintenance Tech.", access: "staff",   reportsTo: 2,     approvedBy: 1,    mustChangePassword: false },
  ];

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/users", { headers });
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
      givenName: form.givenName,
      surname: form.surname,
      email: form.email,
      role: roleValue,
      access: form.access,
      reportsTo: form.reportsTo ? parseInt(form.reportsTo, 10) : null,
      approvedBy: form.approvedBy ? parseInt(form.approvedBy, 10) : null,
    };

    try {
      const url = editing ? `/api/auth/users/${editing.id}` : "/api/auth/users";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Request failed");
        return;
      }
      await fetchUsers();
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const handleDelete = async (id, fn, sn) => {
    if (!confirm(`Delete user "${fn} ${sn}"?`)) return;
    try {
      const res = await fetch(`/api/auth/users/${id}`, { method: "DELETE", headers });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Delete failed");
        return;
      }
      await fetchUsers();
    } catch {}
  };

  const startEdit = (u) => {
    const isCustom = u.role && !COMMON_ROLES.includes(u.role);
    setForm({
      givenName: u.givenName,
      surname: u.surname,
      email: u.email,
      role: isCustom ? "Other" : u.role,
      customRole: isCustom ? u.role : "",
      access: u.access,
      reportsTo: u.reportsTo ? String(u.reportsTo) : "",
      approvedBy: u.approvedBy ? String(u.approvedBy) : "",
    });
    setEditing(u);
    setShowForm(true);
    setError("");
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setError("");
  };

  const { access: userAccess } = user || {};
  const isAdmin = userAccess === "admin";

  const otherUsers = users.filter((u) => !editing || u.id !== editing.id);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-subtitle">Add, edit, and manage system users and their access levels</div>
        </div>
        {isAdmin && !showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add User
          </button>
        )}
      </div>

      {saved && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          <span>✓</span> User saved successfully.
        </div>
      )}

      {!isAdmin && (
        <div className="alert alert-warn" style={{ marginBottom: 16 }}>
          <span>⚠</span> You need admin access to manage users.
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
                {form.role === "Other" && (
                  <input className="form-input" style={{ marginTop: 6 }} placeholder="Enter custom role" value={form.customRole || ""} onChange={e => setForm({ ...form, customRole: e.target.value })} />
                )}
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
                  <option value="">— None (top-level) —</option>
                  {otherUsers.map(u => (
                    <option key={u.id} value={String(u.id)}>{u.givenName} {u.surname} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Approved By</label>
                <select className="form-select" value={form.approvedBy} onChange={e => setForm({ ...form, approvedBy: e.target.value })}>
                  <option value="">— None —</option>
                  {otherUsers.map(u => (
                    <option key={u.id} value={String(u.id)}>{u.givenName} {u.surname} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>
            {!editing && (
              <div className="alert alert-info" style={{ fontSize: 11, marginTop: 10 }}>
                New users get default password <strong>123456</strong> and must change on first login.
              </div>
            )}
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
                <th>Given Name</th>
                <th>Surname</th>
                <th>Email</th>
                <th>Role</th>
                <th>Access</th>
                <th>Reports To</th>
                <th>Approved By</th>
                <th>Status</th>
                {isAdmin && <th style={{ textAlign: "center" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const rpt = u.reportsTo ? users.find(x => x.id === u.reportsTo) : null;
                const apv = u.approvedBy ? users.find(x => x.id === u.approvedBy) : null;
                return (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.givenName}</td>
                    <td style={{ fontWeight: 600 }}>{u.surname}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <span className={`badge ${u.access === "admin" ? "badge-purple" : u.access === "manager" ? "badge-gold" : "badge-teal"}`}>
                        {u.access}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {rpt ? `${rpt.givenName} ${rpt.surname}` : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {apv ? `${apv.givenName} ${apv.surname}` : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td>
                      {u.mustChangePassword ? (
                        <span className="badge badge-gold" style={{ fontSize: 10 }}>First login</span>
                      ) : (
                        <span style={{ color: "var(--green-light)", fontSize: 11 }}>✓ Active</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
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
    </div>
  );
}
