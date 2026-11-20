const crypto = require("crypto");
const router = require("express").Router();
const Subscription = require("../models/Subscription");
const { markBookingPaid } = require("../utils/bookingPayments");

const { razorpay, PLANS, groupOf, syncSubscription } = require("../config/plans");

// Copy Razorpay's view of a subscription into our DB
async function sync(sub) {
  await syncSubscription(sub);
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
    if (!cfg) return res.status(400).json({ error: "Invalid plan" });
    if (!cfg.planId) {
      const envName = { silver: "RAZORPAY_PLAN_SILVER", gold: "RAZORPAY_PLAN_GOLD" }[plan] || `RAZORPAY_PLAN_VENDOR_${plan.toUpperCase()}`;
      console.error(`Plan "${plan}" has no Razorpay plan id: add ${envName}=plan_... to backend/.env`);
      return res.status(503).json({ error: "This plan isn't available yet. Please try again later or contact support." });
    }
    if (!email) return res.status(400).json({ error: "Email required" });

    // Already subscribed? Don't charge twice.
    const live = await Subscription.findOne({ email: String(email).toLowerCase(), plan: { $in: groupOf(plan) }, status: { $in: ["active", "authenticated"] } });
    if (live) return res.status(409).json({ error: "You already have an active plan", subscription: view(live) });

    // Clicked "Continue" before but didn't pay? Reuse that link instead of making a new one.
    const unpaid = await Subscription.findOne({
      email: String(email).toLowerCase(),
      plan,
      razorpayPlanId: cfg.planId, // only if it's for the same Razorpay plan (price) as now
      status: "created",
      createdAt: { $gte: new Date(Date.now() - 24 * 3600 * 1000) },
    }).sort({ createdAt: -1 });
    if (unpaid) return res.status(200).json(view(unpaid));

    const rz = await razorpay.subscriptions.create({
      plan_id: cfg.planId,
      total_count: cfg.totalCount,
      customer_notify: 1,
      notes: { email, name: name || "", phone: phone || "", plan },
    });

    const sub = await Subscription.create({
      email, name, phone, plan,
      razorpayPlanId: cfg.planId,
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
  const plans = groupOf(req.query.role === "vendor" ? "basic" : "silver");
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
    if (atCycleEnd) sub.status = "cancel_scheduled";
    sub.cancelledAt = new Date();
    sub.cancelledBy = "customer";
    await sub.save();
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

  // Stall booking paid through a payment link
  const link = event.payload?.payment_link?.entity;
  if (event.event === "payment_link.paid" && link?.reference_id) {
    await markBookingPaid(link.reference_id, event.payload?.payment?.entity?.id).catch(() => {});
  }

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
