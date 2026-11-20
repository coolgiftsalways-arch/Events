const crypto = require("crypto");
const router = require("express").Router();
const Razorpay = require("razorpay");
const Subscription = require("../models/Subscription");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// silver = monthly plan, gold = yearly plan (period is set on the Plan in Razorpay)
const PLANS = {
  silver: { planId: process.env.RAZORPAY_PLAN_SILVER, totalCount: 120 }, // up to 10 years of months
  gold: { planId: process.env.RAZORPAY_PLAN_GOLD, totalCount: 10 },      // up to 10 years
  // vendor plans
  basic: { planId: process.env.RAZORPAY_PLAN_VENDOR_BASIC, totalCount: 120 },    // monthly
  growth: { planId: process.env.RAZORPAY_PLAN_VENDOR_GROWTH, totalCount: 40 },   // every 3 months
  premium: { planId: process.env.RAZORPAY_PLAN_VENDOR_PREMIUM, totalCount: 10 }, // yearly
};

// Organiser and vendor memberships are separate (same email can have one of each)
const GROUP = { organiser: ["silver", "gold"], vendor: ["basic", "growth", "premium"] };
const groupOf = (plan) => (GROUP.vendor.includes(plan) ? GROUP.vendor : GROUP.organiser);

// Copy Razorpay's view of a subscription into our DB
async function sync(sub) {
  const rz = await razorpay.subscriptions.fetch(sub.razorpaySubscriptionId);
  sub.status = rz.status;
  if (rz.current_end) sub.currentEnd = new Date(rz.current_end * 1000);
  await sub.save();
  return sub;
}

const view = (s) => ({
  id: s.razorpaySubscriptionId, plan: s.plan, status: s.status,
  shortUrl: s.shortUrl, currentEnd: s.currentEnd,
});

// POST /api/subscriptions  body: { plan, name, email, phone }
router.post("/", async (req, res) => {
  try {
    const { plan, name, email, phone } = req.body;
    const cfg = PLANS[plan];
    if (!cfg?.planId) return res.status(400).json({ error: "Invalid plan" });
    if (!email) return res.status(400).json({ error: "Email required" });

    // Already subscribed? Don't charge twice.
    const live = await Subscription.findOne({ email: String(email).toLowerCase(), plan: { $in: groupOf(plan) }, status: { $in: ["active", "authenticated"] } });
    if (live) return res.status(409).json({ error: "You already have an active plan", subscription: view(live) });

    const rz = await razorpay.subscriptions.create({
      plan_id: cfg.planId,
      total_count: cfg.totalCount,
      customer_notify: 1,
      notes: { email, name: name || "", phone: phone || "", plan },
    });

    const sub = await Subscription.create({
      email, name, phone, plan,
      razorpaySubscriptionId: rz.id, shortUrl: rz.short_url, status: rz.status,
    });
    res.status(201).json(view(sub));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.error?.description || "Could not start subscription" });
  }
});

// GET /api/subscriptions/:id/status  (frontend polls this)
router.get("/:id/status", async (req, res) => {
  const sub = await Subscription.findOne({ razorpaySubscriptionId: String(req.params.id) });
  if (!sub) return res.status(404).json({ error: "Not found" });
  try { await sync(sub); } catch { /* fall back to stored status */ }
  res.json(view(sub));
});

// GET /api/subscriptions/by-email/:email?role=vendor|organiser  (for dashboard "manage plan")
router.get("/by-email/:email", async (req, res) => {
  const plans = GROUP[req.query.role] || GROUP.organiser;
  const sub = await Subscription.findOne({ email: String(req.params.email).toLowerCase(), plan: { $in: plans } }).sort({ createdAt: -1 });
  if (!sub) return res.json(null);
  try { await sync(sub); } catch {}
  res.json(view(sub));
});

// POST /api/subscriptions/:id/cancel  body: { email }
// Cancels at end of the current paid period (no more future charges).
router.post("/:id/cancel", async (req, res) => {
  const sub = await Subscription.findOne({ razorpaySubscriptionId: String(req.params.id) });
  if (!sub || sub.email !== String(req.body.email || "").toLowerCase())
    return res.status(404).json({ error: "Not found" });
  try {
    const atCycleEnd = sub.status === "active"; // not started yet -> cancel immediately
    await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, atCycleEnd);
    await sync(sub);
    if (atCycleEnd) sub.status = "cancel_scheduled", await sub.save();
    res.json(view(sub));
  } catch (e) {
    res.status(400).json({ error: e.error?.description || "Could not cancel" });
  }
});

// POST /api/subscriptions/webhook  (set this URL in Razorpay Dashboard -> Webhooks)
router.post("/webhook", async (req, res) => {
  const sig = req.headers["x-razorpay-signature"];
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(req.body).digest("hex");
  if (!sig || sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
    return res.status(400).send("bad signature");

  const event = JSON.parse(req.body.toString());
  const rz = event.payload?.subscription?.entity;
  if (rz) {
    const sub = await Subscription.findOne({ razorpaySubscriptionId: rz.id });
    if (sub) {
      // keep "cancel_scheduled" until Razorpay actually cancels it
      if (!(sub.status === "cancel_scheduled" && rz.status === "active")) sub.status = rz.status;
      if (rz.current_end) sub.currentEnd = new Date(rz.current_end * 1000);
      await sub.save();
    }
  }
  res.json({ ok: true });
});

module.exports = router;
