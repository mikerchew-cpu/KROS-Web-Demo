/**
 * KROS Auth Routes
 * POST   /api/auth/login         — issue JWT
 * POST   /api/auth/logout        — invalidate token
 * GET    /api/auth/me            — current user info
 * GET    /api/auth/users         — list users (admin)
 * POST   /api/auth/users         — create user (admin)
 * PUT    /api/auth/users/:id     — update user (admin)
 * DELETE /api/auth/users/:id     — delete user (admin)
 * PUT    /api/auth/password      — user changes own password
 */

const express = require("express");
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");

const router  = express.Router();
const SECRET  = process.env.JWT_SECRET || "change-this-in-production";
const EXPIRES = process.env.JWT_EXPIRES_IN || "8h";
const DEFAULT_PW = "123456";

// ── Demo users (mutable array for admin management) ────────────
let nextId = 5;
const USERS = [
  { id: 1, givenName: "Ahmad",    surname: "Zulkifli",  email: "ahmad@kros.my",  role: "Mine Manager",       access: "admin",   reportsTo: null, approvedBy: null, mustChangePassword: true,  passwordHash: bcrypt.hashSync("123456", 10) },
  { id: 2, givenName: "Farah",    surname: "Izzati",    email: "farah@kros.my",  role: "HSE Manager",        access: "manager", reportsTo: 1,     approvedBy: 1,    mustChangePassword: true,  passwordHash: bcrypt.hashSync("123456", 10) },
  { id: 3, givenName: "Tan Mei",  surname: "Ling",      email: "tan@kros.my",    role: "Finance Manager",    access: "manager", reportsTo: 1,     approvedBy: 1,    mustChangePassword: true,  passwordHash: bcrypt.hashSync("123456", 10) },
  { id: 4, givenName: "Amirul",   surname: "Haziq",     email: "amirul@kros.my", role: "Maintenance Tech.",  access: "staff",   reportsTo: 2,     approvedBy: 1,    mustChangePassword: true,  passwordHash: bcrypt.hashSync("123456", 10) },
];

function sanitise(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// ── POST /auth/login ───────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const user = USERS.find((u) => u.email === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const payload = { id: user.id, email: user.email, role: user.role, access: user.access };
  const token   = jwt.sign(payload, SECRET, { expiresIn: EXPIRES });

  return res.json({
    token,
    user: { ...sanitise(user) },
    expiresIn: EXPIRES,
    mustChangePassword: user.mustChangePassword,
  });
});

// ── POST /auth/logout ──────────────────────────────────────────
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// ── PUT /auth/password — user changes own password ─────────────
router.put("/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "currentPassword and newPassword required" });
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" });
  }

  const idx = USERS.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });

  const valid = await bcrypt.compare(currentPassword, USERS[idx].passwordHash);
  if (!valid) return res.status(401).json({ error: "Current password is incorrect" });

  USERS[idx].passwordHash = await bcrypt.hash(newPassword, 10);
  USERS[idx].mustChangePassword = false;

  res.json({ message: "Password updated" });
});

// ── Auth middleware ────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.access)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// ── GET /auth/me ───────────────────────────────────────────────
router.get("/me", requireAuth, (req, res) => {
  const user = USERS.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(sanitise(user));
});

// ── Admin: list users ──────────────────────────────────────────
router.get("/users", requireAuth, requireRole("admin"), (req, res) => {
  const safe = USERS.map(sanitise);
  res.json({ count: safe.length, users: safe });
});

// ── Admin: create user ─────────────────────────────────────────
router.post("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { givenName, surname, email, role, access, reportsTo, approvedBy } = req.body;
  if (!givenName || !surname || !email) {
    return res.status(400).json({ error: "givenName, surname, and email required" });
  }
  if (USERS.find((u) => u.email === email.toLowerCase())) {
    return res.status(409).json({ error: "Email already exists" });
  }
  const validAccess = ["admin", "manager", "staff"];
  if (access && !validAccess.includes(access)) {
    return res.status(400).json({ error: `access must be one of: ${validAccess.join(", ")}` });
  }
  if (reportsTo && !USERS.find((u) => u.id === reportsTo)) {
    return res.status(400).json({ error: "Reports-to user not found" });
  }
  if (approvedBy && !USERS.find((u) => u.id === approvedBy)) {
    return res.status(400).json({ error: "Approver not found" });
  }
  const user = {
    id: nextId++,
    givenName,
    surname,
    email: email.toLowerCase(),
    role: role || "Staff",
    access: access || "staff",
    reportsTo: reportsTo || null,
    approvedBy: approvedBy || null,
    mustChangePassword: true,
    passwordHash: await bcrypt.hash(DEFAULT_PW, 10),
  };
  USERS.push(user);
  res.status(201).json(sanitise(user));
});

// ── Admin: update user ─────────────────────────────────────────
router.put("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = USERS.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });

  const { givenName, surname, email, role, access, password, reportsTo, approvedBy } = req.body;
  if (email && email !== USERS[idx].email && USERS.find((u) => u.email === email.toLowerCase())) {
    return res.status(409).json({ error: "Email already exists" });
  }
  const validAccess = ["admin", "manager", "staff"];
  if (access && !validAccess.includes(access)) {
    return res.status(400).json({ error: `access must be one of: ${validAccess.join(", ")}` });
  }

  if (givenName)          USERS[idx].givenName = givenName;
  if (surname)            USERS[idx].surname = surname;
  if (email)              USERS[idx].email = email.toLowerCase();
  if (role)               USERS[idx].role = role;
  if (access)             USERS[idx].access = access;
  if (password)           USERS[idx].passwordHash = await bcrypt.hash(password, 10);
  if (reportsTo !== undefined)  USERS[idx].reportsTo = reportsTo;
  if (approvedBy !== undefined) USERS[idx].approvedBy = approvedBy;

  res.json(sanitise(USERS[idx]));
});

// ── Admin: delete user ─────────────────────────────────────────
router.delete("/users/:id", requireAuth, requireRole("admin"), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = USERS.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  if (id === 1) return res.status(403).json({ error: "Cannot delete the primary admin account" });
  USERS.splice(idx, 1);
  res.json({ message: "User deleted" });
});

module.exports = { router, requireAuth, requireRole };
