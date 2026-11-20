// Run: node test-razorpay.js        -> checks keys, plans, DB
//      node test-razorpay.js pay    -> also creates a ₹1 test subscription link
require("dotenv").config();
if (process.env.FORCE_PUBLIC_DNS === "true") require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const Razorpay = require("razorpay");
const mongoose = require("mongoose");

const ok = (m) => console.log("✅", m);
const bad = (m) => console.log("❌", m);

(async () => {
  const key = process.env.RAZORPAY_KEY_ID || "";
  if (!key || !process.env.RAZORPAY_KEY_SECRET) return bad("RAZORPAY_KEY_ID / SECRET missing in .env");
  ok(`Key: ${key.startsWith("rzp_live_") ? "LIVE (real money!)" : "TEST"} mode`);
  const rz = new Razorpay({ key_id: key, key_secret: process.env.RAZORPAY_KEY_SECRET });

  // 1. Keys valid?
  try { await rz.plans.all({ count: 1 }); ok("Razorpay keys work"); }
  catch (e) { return bad("Keys rejected: " + (e.error?.description || e.message)); }

  // 2. Every plan exists, show price + period
  const names = ["SILVER", "GOLD", "VENDOR_BASIC", "VENDOR_GROWTH", "VENDOR_PREMIUM", "TEST"];
  for (const n of names) {
    const id = process.env["RAZORPAY_PLAN_" + n];
    if (!id) { bad(`${n}: RAZORPAY_PLAN_${n} not set`); continue; }
    if (!id.startsWith("plan_")) { bad(`${n}: "${id}" is not a plan id (must start with plan_)`); continue; }
    try {
      const p = await rz.plans.fetch(id);
      ok(`${n}: ${p.item.name} — ₹${p.item.amount / 100} every ${p.interval} ${p.period}`);
    } catch (e) { bad(`${n}: ${id} — ${e.error?.description || e.message} (wrong mode?)`); }
  }

  // 3. MongoDB
  try { await mongoose.connect(process.env.MONGO_URI); ok("MongoDB connected: " + mongoose.connection.host); }
  catch (e) { bad("MongoDB: " + e.message); }
  await mongoose.disconnect();

  // 4. Optional ₹1 subscription link
  if (process.argv[2] === "pay") {
    if (!process.env.RAZORPAY_PLAN_TEST) return bad("Set RAZORPAY_PLAN_TEST first");
    const s = await rz.subscriptions.create({ plan_id: process.env.RAZORPAY_PLAN_TEST, total_count: 3, notes: { test: "yes" } });
    ok(`₹1 subscription ${s.id} created. Open and pay:\n   ${s.short_url}`);
    console.log(`   Cancel later: node -e "require('dotenv').config();new (require('razorpay'))({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET}).subscriptions.cancel('${s.id}').then(r=>console.log(r.status))"`);
  }
})();