const Subscription = require("../models/Subscription");
const { PLANS, GROUP } = require("../config/plans");

const LIVE = ["active", "authenticated", "cancel_scheduled"];

// The user's current paid membership (from Razorpay subscriptions), or null
async function getMembership(email, role) {
  const sub = await Subscription.findOne({
    email: String(email).toLowerCase(),
    plan: { $in: GROUP[role] || [] },
    status: { $in: LIVE },
  }).sort({ createdAt: -1 });
  if (!sub) return null;
  const p = PLANS[sub.plan] || {};
  return {
    id: sub.plan,
    planId: sub.plan,
    name: p.name,
    status: "active",
    cancelling: sub.status === "cancel_scheduled",
    discount: p.discount || 0,
    events: p.events || 0,
    months: p.months || 0,
    startedAt: sub.createdAt,
    expiresAt: sub.currentEnd || new Date(Date.now() + 31 * 864e5),
    subscriptionId: sub.razorpaySubscriptionId,
    paymentMode: "razorpay-subscription",
  };
}

// Shape that the frontend pages already understand (same fields they used in localStorage)
function profileView(user, membership) {
  const base = {
    id: String(user._id),
    _id: String(user._id),
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone,
    company: user.company,
    username: user.username,
    bio: user.bio,
    about: user.about,
    location: user.location,
    website: user.website,
    instagram: user.instagram,
    facebook: user.facebook,
    category: user.category,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
  };
  if (user.role === "organiser") {
    Object.assign(base, {
      membership: membership?.planId || "",
      membershipName: membership?.name || "",
      membershipStatus: membership ? "active" : "pending_payment",
      paymentVerified: Boolean(membership),
      membershipExpiresAt: membership?.expiresAt || null,
    });
  }
  return base;
}

module.exports = { getMembership, profileView, LIVE };
