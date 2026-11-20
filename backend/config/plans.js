const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Plan key -> Razorpay plan id (+ how many renewals max)
const PLANS = {
  // organiser
  silver: { name: "Silver", role: "organiser", planId: process.env.RAZORPAY_PLAN_SILVER, totalCount: 120 },
  gold: { name: "Gold", role: "organiser", planId: process.env.RAZORPAY_PLAN_GOLD, totalCount: 10 },
  // vendor
  // perks: discount % on stall enquiries, for up to `events` events
  basic: { name: "Basic", role: "vendor", planId: process.env.RAZORPAY_PLAN_VENDOR_BASIC, totalCount: 120, discount: 10, events: 2, months: 1 },
  growth: { name: "Growth", role: "vendor", planId: process.env.RAZORPAY_PLAN_VENDOR_GROWTH, totalCount: 40, discount: 20, events: 5, months: 3 },
  premium: { name: "Premium", role: "vendor", planId: process.env.RAZORPAY_PLAN_VENDOR_PREMIUM, totalCount: 10, discount: 30, events: 36, months: 12 },
};

// Organiser and vendor memberships are separate (same email can have one of each)
const GROUP = {
  organiser: Object.keys(PLANS).filter((k) => PLANS[k].role === "organiser"),
  vendor: Object.keys(PLANS).filter((k) => PLANS[k].role === "vendor"),
};
const groupOf = (plan) => GROUP[PLANS[plan]?.role] || GROUP.organiser;

// Price + billing period of each plan, read from Razorpay (cached 10 min)
let planCache = { at: 0, data: {} };
async function planDetails() {
  if (Date.now() - planCache.at < 10 * 60 * 1000) return planCache.data;
  const data = {};
  await Promise.all(
    Object.entries(PLANS).map(async ([key, p]) => {
      if (!p.planId) return;
      try {
        const rz = await razorpay.plans.fetch(p.planId);
        const months = { daily: 1 / 30, weekly: 1 / 4, monthly: 1, yearly: 12 }[rz.period] * rz.interval;
        const unit = { daily: "day", weekly: "week", monthly: "month", yearly: "year" }[rz.period];
        const label = rz.interval > 1 ? `every ${rz.interval} ${unit}s` : `/ ${unit}`;
        data[key] = { amount: rz.item.amount / 100, period: rz.period, interval: rz.interval, months, label };
      } catch {
        /* plan missing or wrong mode */
      }
    })
  );
  planCache = { at: Date.now(), data };
  return data;
}

// Copy Razorpay's view of a subscription into our DB
async function syncSubscription(sub) {
  const rz = await razorpay.subscriptions.fetch(sub.razorpaySubscriptionId);
  // keep "cancel_scheduled" until Razorpay actually cancels it
  if (!(sub.status === "cancel_scheduled" && rz.status === "active")) sub.status = rz.status;
  if (rz.current_end) sub.currentEnd = new Date(rz.current_end * 1000);
  sub.paidCount = rz.paid_count;
  await sub.save();
  return rz;
}

module.exports = { razorpay, PLANS, GROUP, groupOf, planDetails, syncSubscription };
