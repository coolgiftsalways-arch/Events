const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    name: String,
    phone: String,
    plan: { type: String, enum: ["silver", "gold", "basic", "growth", "premium"], required: true },
    razorpaySubscriptionId: { type: String, unique: true },
    razorpayPlanId: String, // which Razorpay plan (price) this was created with
    shortUrl: String,
    // created -> authenticated -> active -> (pending/halted) -> cancelled/completed
    status: { type: String, default: "created" },
    currentEnd: Date, // paid until
    paidCount: { type: Number, default: 0 },
    cancelledAt: Date,
    cancelledBy: String, // "customer" | "admin"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
