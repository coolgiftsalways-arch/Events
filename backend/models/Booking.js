const mongoose = require("mongoose");

// A vendor's request for a stall at an event (organisers see these as "applications")
const bookingSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    eventTitle: String,
    eventDate: String,
    eventVenue: String,
    organiser: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

    // vendor details (copied so the organiser sees them even for guest bookings)
    vendorName: String,
    businessName: String,
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    category: String,
    products: String,

    kind: { type: String, enum: ["enquiry", "booking"], default: "booking" },
    stall: { id: String, type: { type: String }, size: String, price: Number },

    // money (in rupees)
    originalPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    membershipName: String,
    bookingFee: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    paymentOption: { type: String, enum: ["full", "advance", "none"], default: "none" },
    amountToPayNow: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },

    // pending / approved / rejected / cancelled
    status: { type: String, default: "pending", index: true },
    // unpaid / awaiting / paid / failed / refunded
    paymentStatus: { type: String, default: "unpaid", index: true },
    razorpayPaymentLinkId: String,
    paymentUrl: String,
    razorpayPaymentId: String,
    paidAt: Date,
    note: String, // organiser/admin note
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
