const bcrypt = require("bcryptjs");
const router = require("express").Router();
const User = require("../models/User");
const { requireUser, signUser } = require("../middleware/auth");
const { getMembership, profileView } = require("../utils/membership");
const rateLimit = require("../utils/rateLimit");

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v, max = 200) => String(v ?? "").trim().slice(0, max);

async function session(user) {
  const membership = await getMembership(user.email, user.role);
  return { token: signUser(user), user: profileView(user, membership), membership };
}

// POST /api/auth/:role/register  body: { name, email, phone, password, company? }
router.post("/:role/register", rateLimit({ max: 20, minutes: 60 }), async (req, res) => {
  const role = req.params.role;
  if (!["vendor", "organiser"].includes(role)) return res.status(404).json({ error: "Not found" });

  const name = str(req.body.name, 100);
  const email = str(req.body.email, 150).toLowerCase();
  const phone = str(req.body.phone, 20);
  const password = String(req.body.password || "");

  if (!name) return res.status(400).json({ error: "Please enter your name." });
  if (!EMAIL_RX.test(email)) return res.status(400).json({ error: "Please enter a valid email." });
  if (password.length < 6) return res.status(400).json({ error: "Password must contain at least 6 characters." });
  if (await User.exists({ email, role }))
    return res.status(409).json({ error: "An account with this email already exists. Please log in." });

  const user = await User.create({
    role,
    name,
    email,
    phone,
    company: str(req.body.company, 120),
    category: str(req.body.category, 80),
    username: str(req.body.company || name, 40).toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20),
    passwordHash: await bcrypt.hash(password, 10),
    lastLoginAt: new Date(),
  });
  res.status(201).json(await session(user));
});

// POST /api/auth/:role/login  body: { email, password }
router.post("/:role/login", rateLimit({ max: 10, minutes: 15, message: "Too many attempts. Try again in 15 minutes." }), async (req, res) => {
  const role = req.params.role;
  if (!["vendor", "organiser"].includes(role)) return res.status(404).json({ error: "Not found" });
  const email = str(req.body.email, 150).toLowerCase();
  const user = await User.findOne({ email, role }).select("+passwordHash");
  const ok = user && (await bcrypt.compare(String(req.body.password || ""), user.passwordHash));
  if (!ok) return res.status(401).json({ error: "Email or password is incorrect." });
  if (user.status !== "active") return res.status(403).json({ error: "This account is blocked. Please contact support." });
  user.lastLoginAt = new Date();
  await user.save();
  res.json(await session(user));
});

// GET /api/auth/me  -> fresh profile + membership
router.get("/me", requireUser(), async (req, res) => {
  const membership = await getMembership(req.user.email, req.user.role);
  res.json({ user: profileView(req.user, membership), membership });
});

// PATCH /api/auth/me  -> update profile fields
const EDITABLE = ["name", "phone", "company", "username", "bio", "about", "location", "website", "instagram", "facebook", "category", "profileImage"];
router.patch("/me", requireUser(), async (req, res) => {
  for (const key of EDITABLE) {
    if (req.body[key] === undefined) continue;
    req.user[key] = key === "profileImage" ? String(req.body[key] || "").slice(0, 3_000_000) : str(req.body[key], key === "about" ? 3000 : 300);
  }
  if (!req.user.name) return res.status(400).json({ error: "Name can't be empty." });
  await req.user.save();
  const membership = await getMembership(req.user.email, req.user.role);
  res.json({ user: profileView(req.user, membership), membership });
});

// POST /api/auth/me/password  body: { currentPassword, newPassword }
router.post("/me/password", requireUser(), async (req, res) => {
  const user = await User.findById(req.user._id).select("+passwordHash");
  if (!(await bcrypt.compare(String(req.body.currentPassword || ""), user.passwordHash)))
    return res.status(400).json({ error: "Current password is wrong." });
  if (String(req.body.newPassword || "").length < 6) return res.status(400).json({ error: "New password must be at least 6 characters." });
  user.passwordHash = await bcrypt.hash(String(req.body.newPassword), 10);
  await user.save();
  res.json({ ok: true });
});

module.exports = router;
