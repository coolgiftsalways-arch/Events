const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Post = require("../models/Post");
const { eventView, detailsView } = require("../utils/eventView");
const bookingView = require("../utils/bookingView");
const { getMembership } = require("../utils/membership");
const { syncBookingPayment } = require("../utils/bookingPayments");
const requireAdmin = require("../middleware/requireAdmin");
const { razorpay, PLANS, GROUP, planDetails, syncSubscription } = require("../config/plans");

const ISSUE = ["pending", "halted"];
const LIVE = ["active", "authenticated", "cancel_scheduled"];
const OPEN = ["created", "authenticated", "active", "pending", "halted", "cancel_scheduled"];

const safeEqual = (a, b) => {
  const x = crypto.createHash("sha256").update(String(a)).digest();
  const y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};

// ---------- LOGIN (max 10 wrong tries per 15 min per IP) ----------
const tries = new Map();
router.post("/login", (req, res) => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !JWT_SECRET)
    return res.status(500).json({ error: "Admin login is not set up (ADMIN_EMAIL / ADMIN_PASSWORD / JWT_SECRET in .env)" });

  const ip = req.ip;
  const t = tries.get(ip) || { n: 0, at: Date.now() };
  if (Date.now() - t.at > 15 * 60 * 1000) Object.assign(t, { n: 0, at: Date.now() });
  if (t.n >= 10) return res.status(429).json({ error: "Too many attempts. Try again in 15 minutes." });

  const { email = "", password = "" } = req.body || {};
  const ok = safeEqual(String(email).trim().toLowerCase(), ADMIN_EMAIL.toLowerCase()) & safeEqual(password, ADMIN_PASSWORD);
  if (!ok) {
    t.n++;
    tries.set(ip, t);
    return res.status(401).json({ error: "Wrong email or password" });
  }
  tries.delete(ip);
  const token = jwt.sign({ role: "admin", email: ADMIN_EMAIL }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, email: ADMIN_EMAIL });
});

router.use(requireAdmin);

const view = (s, plans = {}) => ({
  id: s.razorpaySubscriptionId,
  name: s.name || "",
  email: s.email,
  phone: s.phone || "",
  plan: s.plan,
  planName: PLANS[s.plan]?.name || s.plan,
  role: PLANS[s.plan]?.role || "organiser",
  price: plans[s.plan]?.amount ?? null,
  period: plans[s.plan]?.label || "",
  status: s.status,
  currentEnd: s.currentEnd,
  paidCount: s.paidCount || 0,
  shortUrl: s.shortUrl,
  createdAt: s.createdAt,
  cancelledAt: s.cancelledAt,
  cancelledBy: s.cancelledBy,
});

// Turn the filters in the query string into a MongoDB filter
function buildFilter({ status, role, q }) {
  const f = {};
  if (status === "live") f.status = { $in: LIVE };
  else if (status === "issues") f.status = { $in: ISSUE };
  else if (status === "unpaid") f.status = "created";
  else if (status === "ended") f.status = { $in: ["cancelled", "completed", "expired"] };
  if (GROUP[role]) f.plan = { $in: GROUP[role] };
  if (q) {
    const rx = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    f.$or = [{ email: rx }, { name: rx }, { phone: rx }, { razorpaySubscriptionId: rx }];
  }
  return f;
}

// ---------- DASHBOARD NUMBERS ----------
router.get("/stats", async (req, res) => {
  const [plans, byStatus, byPlan, recent, attention] = await Promise.all([
    planDetails(),
    Subscription.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    Subscription.aggregate([{ $match: { status: { $in: LIVE } } }, { $group: { _id: "$plan", n: { $sum: 1 } } }]),
    Subscription.find({ status: { $ne: "created" } }).sort({ createdAt: -1 }).limit(5),
    Subscription.find({ status: { $in: ISSUE } }).sort({ updatedAt: -1 }).limit(10),
  ]);

  const count = Object.fromEntries(byStatus.map((r) => [r._id, r.n]));
  const sum = (list) => list.reduce((t, s) => t + (count[s] || 0), 0);

  // Monthly recurring revenue: every live member's price spread per month
  let mrr = 0;
  const planRows = Object.keys(PLANS).map((key) => {
    const n = byPlan.find((r) => r._id === key)?.n || 0;
    const p = plans[key];
    if (p && p.months) mrr += (n * p.amount) / p.months;
    return { key, name: PLANS[key].name, role: PLANS[key].role, members: n, price: p?.amount ?? null, period: p?.label || "" };
  });

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [joinedThisMonth, cancelledThisMonth] = await Promise.all([
    Subscription.countDocuments({ createdAt: { $gte: monthStart }, status: { $in: [...LIVE, ...ISSUE, "cancelled", "completed"] } }),
    Subscription.countDocuments({ cancelledAt: { $gte: monthStart } }),
  ]);

  const [vendorCount, organiserCount, pendingEvents, liveEvents, bookingAgg, newBookings] = await Promise.all([
    User.countDocuments({ role: "vendor" }),
    User.countDocuments({ role: "organiser" }),
    Event.countDocuments({ status: "pending" }),
    Event.countDocuments({ status: "approved" }),
    Booking.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$amountPaid" }, n: { $sum: 1 } } }]),
    Booking.countDocuments({ createdAt: { $gte: monthStart }, $nor: [{ kind: "booking", paymentStatus: { $in: ["awaiting", "failed"] } }] }),
  ]);

  res.json({
    users: { vendors: vendorCount, organisers: organiserCount },
    events: { pending: pendingEvents, live: liveEvents },
    bookings: { paid: bookingAgg[0]?.n || 0, revenue: bookingAgg[0]?.total || 0, thisMonth: newBookings },
    live: sum(LIVE),
    issues: sum(ISSUE),
    cancelling: count.cancel_scheduled || 0,
    unpaid: count.created || 0,
    ended: sum(["cancelled", "completed", "expired"]),
    organisers: planRows.filter((p) => p.role === "organiser").reduce((t, p) => t + p.members, 0),
    vendors: planRows.filter((p) => p.role === "vendor").reduce((t, p) => t + p.members, 0),
    mrr: Math.round(mrr),
    joinedThisMonth,
    cancelledThisMonth,
    plans: planRows,
    recent: recent.map((s) => view(s, plans)),
    attention: attention.map((s) => view(s, plans)),
  });
});

// ---------- MEMBERS LIST ----------
router.get("/subscriptions", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const filter = buildFilter(req.query);
  const [plans, total, items] = await Promise.all([
    planDetails(),
    Subscription.countDocuments(filter),
    Subscription.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
  ]);
  res.json({ total, page, pages: Math.ceil(total / limit) || 1, items: items.map((s) => view(s, plans)) });
});

// ---------- ONE MEMBER (fresh from Razorpay + payment history) ----------
router.get("/subscriptions/:id", async (req, res) => {
  const sub = await Subscription.findOne({ razorpaySubscriptionId: String(req.params.id) });
  if (!sub) return res.status(404).json({ error: "Not found" });
  let payments = [];
  try {
    await syncSubscription(sub);
    const inv = await razorpay.invoices.all({ subscription_id: sub.razorpaySubscriptionId, count: 50 });
    payments = (inv.items || []).map((i) => ({
      date: (i.paid_at || i.issued_at || i.created_at) * 1000,
      amount: i.amount / 100,
      status: i.status, // paid / issued / expired
      paymentId: i.payment_id,
    }));
  } catch (e) {
    console.error("Razorpay fetch failed:", e.error?.description || e.message);
  }
  res.json({ ...view(sub, await planDetails()), payments });
});

// ---------- CANCEL ----------
// body: { immediately: true } -> stop now; otherwise stop at end of paid period
router.post("/subscriptions/:id/cancel", async (req, res) => {
  const sub = await Subscription.findOne({ razorpaySubscriptionId: String(req.params.id) });
  if (!sub) return res.status(404).json({ error: "Not found" });
  try {
    const now = req.body?.immediately === true || sub.status !== "active";
    await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, !now);
    await syncSubscription(sub);
    if (!now) sub.status = "cancel_scheduled";
    sub.cancelledAt = new Date();
    sub.cancelledBy = "admin";
    await sub.save();
    res.json(view(sub, await planDetails()));
  } catch (e) {
    res.status(400).json({ error: e.error?.description || "Could not cancel" });
  }
});

// ---------- REFRESH ALL OPEN SUBSCRIPTIONS FROM RAZORPAY ----------
router.post("/sync", async (req, res) => {
  const subs = await Subscription.find({ status: { $in: OPEN } }).limit(300);
  let updated = 0;
  for (const s of subs) {
    try {
      await syncSubscription(s);
      updated++;
    } catch {
      /* skip */
    }
  }
  res.json({ checked: subs.length, updated });
});

// ---------- CSV EXPORT ----------
router.get("/export.csv", async (req, res) => {
  const plans = await planDetails();
  const subs = await Subscription.find(buildFilter(req.query)).sort({ createdAt: -1 }).limit(5000);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [["Name", "Email", "Phone", "Type", "Plan", "Price", "Status", "Paid until", "Payments", "Joined", "Razorpay ID"]];
  for (const s of subs) {
    const v = view(s, plans);
    rows.push([v.name, v.email, v.phone, v.role, v.planName, v.price, v.status, v.currentEnd ? new Date(v.currentEnd).toISOString().slice(0, 10) : "", v.paidCount, new Date(v.createdAt).toISOString().slice(0, 10), v.id]);
  }
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=stallora-members.csv");
  res.send(rows.map((r) => r.map(esc).join(",")).join("\n"));
});

// ==========================================================
// USERS (vendors + organisers)
// ==========================================================
const rx = (q) => new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
const pageArgs = (q) => {
  const page = Math.max(1, parseInt(q.page) || 1);
  const limit = Math.min(100, parseInt(q.limit) || 20);
  return { page, limit, skip: (page - 1) * limit };
};

const userView = (u) => ({
  id: String(u._id),
  role: u.role,
  name: u.name,
  email: u.email,
  phone: u.phone,
  company: u.company,
  category: u.category,
  status: u.status,
  createdAt: u.createdAt,
  lastLoginAt: u.lastLoginAt,
});

router.get("/users", async (req, res) => {
  const { page, limit, skip } = pageArgs(req.query);
  const f = {};
  if (["vendor", "organiser"].includes(req.query.role)) f.role = req.query.role;
  if (["active", "blocked"].includes(req.query.status)) f.status = req.query.status;
  if (req.query.q) f.$or = [{ name: rx(req.query.q) }, { email: rx(req.query.q) }, { phone: rx(req.query.q) }, { company: rx(req.query.q) }];
  const [total, items] = await Promise.all([User.countDocuments(f), User.find(f).sort({ createdAt: -1 }).skip(skip).limit(limit)]);
  res.json({ total, page, pages: Math.ceil(total / limit) || 1, items: items.map(userView) });
});

router.get("/users/:id", async (req, res) => {
  const u = await User.findById(req.params.id).catch(() => null);
  if (!u) return res.status(404).json({ error: "Not found" });
  const [membership, events, bookings] = await Promise.all([
    getMembership(u.email, u.role),
    u.role === "organiser" ? Event.find({ organiser: u._id }).sort({ createdAt: -1 }).limit(50) : [],
    Booking.find(u.role === "vendor" ? { $or: [{ vendor: u._id }, { email: u.email }] } : { organiser: u._id }).sort({ createdAt: -1 }).limit(50),
  ]);
  res.json({ ...userView(u), bio: u.bio, location: u.location, website: u.website, instagram: u.instagram, membership, events: events.map(eventView), bookings: bookings.map(bookingView) });
});

// body: { status: "active" | "blocked" }
router.patch("/users/:id", async (req, res) => {
  if (!["active", "blocked"].includes(req.body.status)) return res.status(400).json({ error: "Invalid status" });
  const u = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).catch(() => null);
  if (!u) return res.status(404).json({ error: "Not found" });
  res.json(userView(u));
});

// ==========================================================
// EVENTS
// ==========================================================
router.get("/events", async (req, res) => {
  const { page, limit, skip } = pageArgs(req.query);
  const f = {};
  if (["pending", "approved", "rejected", "hidden"].includes(req.query.status)) f.status = req.query.status;
  if (req.query.demo === "hide") f.isDemo = { $ne: true };
  if (req.query.q) f.$or = [{ title: rx(req.query.q) }, { city: rx(req.query.q) }, { venue: rx(req.query.q) }, { organiserName: rx(req.query.q) }];
  const [total, items] = await Promise.all([
    Event.countDocuments(f),
    Event.find(f).select("-stalls -gallery").sort({ status: -1, createdAt: -1 }).skip(skip).limit(limit),
  ]);
  res.json({ total, page, pages: Math.ceil(total / limit) || 1, items: items.map(eventView) });
});

router.get("/events/:id", async (req, res) => {
  const e = await Event.findById(req.params.id).catch(() => null);
  if (!e) return res.status(404).json({ error: "Not found" });
  const counts = await Booking.aggregate([
    { $match: { event: e._id } },
    { $group: { _id: "$paymentStatus", n: { $sum: 1 }, paid: { $sum: "$amountPaid" } } },
  ]);
  res.json({ event: eventView(e), details: detailsView(e), bookings: counts });
});

// body: { status: "approved" | "rejected" | "hidden" | "pending", reason }
router.patch("/events/:id", async (req, res) => {
  if (!["approved", "rejected", "hidden", "pending"].includes(req.body.status)) return res.status(400).json({ error: "Invalid status" });
  const update = { status: req.body.status };
  if (req.body.status === "rejected") update.rejectionReason = String(req.body.reason || "").slice(0, 300);
  const e = await Event.findByIdAndUpdate(req.params.id, update, { new: true }).catch(() => null);
  if (!e) return res.status(404).json({ error: "Not found" });
  res.json(eventView(e));
});

router.delete("/events/:id", async (req, res) => {
  const e = await Event.findById(req.params.id).catch(() => null);
  if (!e) return res.status(404).json({ error: "Not found" });
  if (await Booking.exists({ event: e._id, paymentStatus: "paid" }))
    return res.status(400).json({ error: "This event has paid bookings. Hide it instead of deleting." });
  await e.deleteOne();
  res.json({ ok: true });
});

// ==========================================================
// BOOKINGS
// ==========================================================
router.get("/bookings", async (req, res) => {
  const { page, limit, skip } = pageArgs(req.query);
  const f = {};
  const s = req.query.status;
  if (s === "paid") f.paymentStatus = "paid";
  else if (s === "awaiting") f.paymentStatus = "awaiting";
  else if (["pending", "approved", "rejected", "cancelled"].includes(s)) f.status = s;
  if (req.query.q) f.$or = [{ vendorName: rx(req.query.q) }, { email: rx(req.query.q) }, { phone: rx(req.query.q) }, { eventTitle: rx(req.query.q) }, { businessName: rx(req.query.q) }];
  const [total, items] = await Promise.all([Booking.countDocuments(f), Booking.find(f).sort({ createdAt: -1 }).skip(skip).limit(limit)]);
  res.json({ total, page, pages: Math.ceil(total / limit) || 1, items: items.map(bookingView) });
});

router.get("/bookings/:id", async (req, res) => {
  let b = await Booking.findById(req.params.id).catch(() => null);
  if (!b) return res.status(404).json({ error: "Not found" });
  try {
    b = await syncBookingPayment(b);
  } catch {
    /* keep stored */
  }
  res.json({ ...bookingView(b), razorpayPaymentId: b.razorpayPaymentId, razorpayPaymentLinkId: b.razorpayPaymentLinkId });
});

// body: { status, note }
router.patch("/bookings/:id", async (req, res) => {
  if (!["pending", "approved", "rejected", "cancelled"].includes(req.body.status)) return res.status(400).json({ error: "Invalid status" });
  const b = await Booking.findById(req.params.id).catch(() => null);
  if (!b) return res.status(404).json({ error: "Not found" });
  b.status = req.body.status;
  if (req.body.note !== undefined) b.note = String(req.body.note).slice(0, 500);
  await b.save();
  res.json(bookingView(b));
});

// ==========================================================
// POSTS (moderation)
// ==========================================================
router.get("/posts", async (req, res) => {
  const { page, limit, skip } = pageArgs(req.query);
  const [total, items] = await Promise.all([Post.countDocuments(), Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit)]);
  res.json({
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    items: items.map((p) => ({ id: String(p._id), organiserName: p.organiserName, caption: p.caption, mediaType: p.mediaType, mediaUrl: p.mediaUrl, status: p.status, createdAt: p.createdAt })),
  });
});

router.patch("/posts/:id", async (req, res) => {
  if (!["published", "hidden"].includes(req.body.status)) return res.status(400).json({ error: "Invalid status" });
  const p = await Post.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).catch(() => null);
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json({ id: String(p._id), status: p.status });
});

module.exports = router;
