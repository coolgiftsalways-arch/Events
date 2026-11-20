const Booking = require("../models/Booking");
const Event = require("../models/Event");
const { razorpay } = require("../config/plans");

// Mark a booking paid exactly once and take the stall off sale
async function markBookingPaid(bookingId, paymentId) {
  const b = await Booking.findOneAndUpdate(
    { _id: bookingId, paymentStatus: { $ne: "paid" } },
    { paymentStatus: "paid", razorpayPaymentId: paymentId || "", paidAt: new Date() },
    { new: true }
  );
  if (!b) return Booking.findById(bookingId);
  b.amountPaid = b.amountToPayNow;
  await b.save();

  if (b.stall?.id) {
    const e = await Event.findOneAndUpdate(
      { _id: b.event, stalls: { $elemMatch: { id: b.stall.id, available: true } } },
      { $set: { "stalls.$.available": false }, $inc: { availableStalls: -1 } },
      { new: true }
    );
    if (e) {
      const left = e.stalls.filter((s) => s.available).length;
      e.availableStalls = left;
      e.availabilityStatus = left === 0 ? "Sold Out" : left <= 3 ? "Few Stalls Left" : "Stalls Open";
      await e.save();
    }
  }
  return b;
}

// Ask Razorpay whether the payment link has been paid
async function syncBookingPayment(b) {
  if (!b.razorpayPaymentLinkId || b.paymentStatus === "paid") return b;
  const link = await razorpay.paymentLink.fetch(b.razorpayPaymentLinkId);
  if (link.status === "paid") return markBookingPaid(b._id, link.payments?.[0]?.payment_id);
  if (["expired", "cancelled"].includes(link.status) && b.paymentStatus === "awaiting") {
    b.paymentStatus = "failed";
    await b.save();
  }
  return b;
}

// Razorpay wants +91XXXXXXXXXX
const contact = (phone) => {
  const d = String(phone || "").replace(/\D/g, "");
  if (d.length === 10) return "+91" + d;
  if (d.length === 12 && d.startsWith("91")) return "+" + d;
  return undefined;
};

async function createPaymentLink(b) {
  const link = await razorpay.paymentLink.create({
    amount: Math.round(b.amountToPayNow * 100),
    currency: "INR",
    accept_partial: false,
    description: `Stall ${b.stall?.id || ""} – ${b.eventTitle}`.slice(0, 2048),
    customer: { name: b.vendorName || undefined, email: b.email || undefined, contact: contact(b.phone) },
    notify: { sms: false, email: false },
    reminder_enable: false,
    reference_id: String(b._id),
    notes: { bookingId: String(b._id), event: String(b.event) },
    ...(process.env.CLIENT_URL && { callback_url: `${process.env.CLIENT_URL}/vendor/bookings`, callback_method: "get" }),
  });
  b.razorpayPaymentLinkId = link.id;
  b.paymentUrl = link.short_url;
  b.paymentStatus = "awaiting";
  await b.save();
  return b;
}

module.exports = { markBookingPaid, syncBookingPayment, createPaymentLink };
