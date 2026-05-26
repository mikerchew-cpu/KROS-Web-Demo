/**
 * KROS Auth Routes
 * POST /api/auth/login   — issue JWT
 * POST /api/auth/logout  — invalidate token
 * GET  /api/auth/me      — current user info
 */

const express = require("express");
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");

const router  = express.Router();
const SECRET  = process.env.JWT_SECRET || "change-this-in-production";
const EXPIRES = process.env.JWT_EXPIRES_IN || "8h";

// ── Demo users (replace with DB in production) ─────────────────
const USERS = [
  { id: 1, name: "Ahmad Zulkifli",  email: "ahmad@kros.my",  role: "Mine Manager",       access: "admin",   passwordHash: bcrypt.hashSync("admin123", 10) },
  { id: 2, name: "Farah Izzati",    email: "farah@kros.my",  role: "HSE Manager",        access: "manager", passwordHash: bcrypt.hashSync("hse123",   10) },
  { id: 3, name: "Tan Mei Ling",    email: "tan@kros.my",    role: "Finance Manager",    access: "manager", passwordHash: bcrypt.hashSync("fin123",   10) },
  { id: 4, name: "Amirul Haziq",    email: "amirul@kros.my", role: "Maintenance Tech.",  access: "staff",   passwordHash: bcrypt.hashSync("maint123", 10) },
];

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
    user: { id: user.id, name: user.name, email: user.email, role: user.role, access: user.access },
    expiresIn: EXPIRES,
  });
});

// ── POST /auth/logout ──────────────────────────────────────────
router.post("/logout", (req, res) => {
  // In production: add token to a blocklist / revocation store
  // Here we just acknowledge — client should delete the token
  res.json({ message: "Logged out successfully" });
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
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, access: user.access });
});

module.exports = { router, requireAuth, requireRole };
