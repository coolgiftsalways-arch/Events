const mongoose = require("mongoose");
const router = require("express").Router();
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const { requireUser, optionalUser } = require("../middleware/auth");
const { getMembership } = require("../utils/membership");
const { syncBookingPayment, createPaymentLink } = require("../utils/bookingPayments");
const { findEvent } = require("./events");
const bookingView = require("../utils/bookingView");
const { BOOKING_DISCOUNT, BOOKING_FEE, ADVANCE_PAYMENT } = require("../config/pricing");
const rateLimit = require("../utils/rateLimit");

const str = (v, max = 200) => String(v ?? "").trim().slice(0, max);
const OPEN = ["pending", "approved"];

// POST /api/bookings
// kind "enquiry": logged-in vendor asks for a stall (membership discount applies, no payment now)
// kind "booking": pick a stall + pay now via Razorpay payment link (login optional)
router.post("/", rateLimit({ max: 30, minutes: 15 }), optionalUser, async (req, res) => {
  const b = req.body || {};
  const kind = b.kind === "enquiry" ? "enquiry" : "booking";
  const vendor = req.user?.role === "vendor" ? req.user : null;
  if (kind === "enquiry" && !vendor) return res.status(401).json({ error: "Please log in as a vendor first." });

  const event = await findEvent(b.eventId, { status: "approved" });
  if (!event) return res.status(404).json({ error: "Event not found" });

  const email = str(b.email || vendor?.email, 150).toLowerCase();
  const vendorName = str(b.vendorName || [b.firstName, b.lastName].filter(Boolean).join(" ") || vendor?.name, 120);
  if (!email || !vendorName) return res.status(400).json({ error: "Name and email are required." });

  // one open request per vendor per event
  const dupFilter = { event: event._id, status: { $in: OPEN }, $or: [{ email }] };
  if (vendor) dupFilter.$or.push({ vendor: vendor._id });
  if (kind === "enquiry" && (await Booking.exists(dupFilter)))
    return res.status(409).json({ error: "You have already submitted an enquiry for this event." });

  const doc = {
    kind,
    event: event._id,
    eventTitle: event.title,
    eventDate: event.date || event.startDate,
    eventVenue: event.venue || [event.city, event.state].filter(Boolean).join(", "),
    organiser: event.organiser,
    vendor: vendor?._id,
    vendorName,
    businessName: str(b.businessName || b.brandName || vendor?.company, 120),
    email,
    phone: str(b.phone || vendor?.phone, 20),
    category: str(b.category || vendor?.category, 80),
    products: str(b.products, 1000),
  };

  if (kind === "enquiry") {
    // membership discount, limited to N discounted events per membership
    const membership = await getMembership(vendor.email, "vendor");
    let percent = 0;
    if (membership) {
      const used = await Booking.countDocuments({
        vendor: vendor._id,
        discountPercent: { $gt: 0 },
        status: { $in: OPEN },
        createdAt: { $gte: membership.startedAt },
      });
      if (used < membership.events) percent = membership.discount;
    }
    const price = Number(event.price) || 0;
    const total = Math.round(price * (1 - percent / 100));
    Object.assign(doc, {
      originalPrice: price,
      discountPercent: percent,
      discount: price - total,
      membershipName: percent ? membership.name : undefined,
      total,
      paymentOption: "none",
    });
    const booking = await Booking.create(doc);
    return res.status(201).json(bookingView(booking));
  }

  // kind "booking": a specific stall, pay now
  const stall = (event.stalls || []).find((s) => s.id === str(b.stallId, 20));
  if (!stall) return res.status(400).json({ error: "Please choose a stall." });
  if (!stall.available) return res.status(409).json({ error: "Sorry, this stall was just booked. Please choose another." });

  const discount = Math.min(BOOKING_DISCOUNT, stall.price);
  const total = stall.price - discount + BOOKING_FEE;
  const paymentOption = b.paymentOption === "advance" ? "advance" : "full";
  Object.assign(doc, {
    stall: { id: stall.id, type: stall.type, size: stall.size, price: stall.price },
    originalPrice: stall.price,
    discount,
    bookingFee: BOOKING_FEE,
    total,
    paymentOption,
    amountToPayNow: paymentOption === "full" ? total : Math.min(ADVANCE_PAYMENT, total),
  });

  const booking = await Booking.create(doc);
  try {
    await createPaymentLink(booking);
  } catch (e) {
    await booking.deleteOne();
    console.error("Payment link failed:", e.error?.description || e.message);
    return res.status(502).json({ error: e.error?.description || "Could not start payment. Please try again." });
  }
  res.status(201).json(bookingView(booking));
});

// GET /api/bookings/mine  (vendor)
router.get("/mine", requireUser("vendor"), async (req, res) => {
  const list = await Booking.find({ $or: [{ vendor: req.user._id }, { email: req.user.email }] }).sort({ createdAt: -1 }).limit(200);
  res.json(list.map(bookingView));
});

// GET /api/bookings/organiser  (organiser: requests for their events)
router.get("/organiser", requireUser("organiser"), async (req, res) => {
  // hide pay-now bookings that were never paid
  const list = await Booking.find({
    organiser: req.user._id,
    $nor: [{ kind: "booking", paymentStatus: { $in: ["awaiting", "failed"] } }],
  })
    .sort({ createdAt: -1 })
    .limit(1000);
  res.json(list.map(bookingView));
});

// GET /api/bookings/:id/status  (payment page polls this)
router.get("/:id/status", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Not found" });
  let b = await Booking.findById(req.params.id);
  if (!b) return res.status(404).json({ error: "Not found" });
  try {
    b = await syncBookingPayment(b);
  } catch {
    /* use stored status */
  }
  res.json({ id: String(b._id), paymentStatus: b.paymentStatus, status: b.status });
});

// PATCH /api/bookings/:id  (organiser approves / rejects)  body: { status, note }
router.patch("/:id", requireUser("organiser"), async (req, res) => {
  const status = req.body.status;
  if (!["approved", "rejected", "pending"].includes(status)) return res.status(400).json({ error: "Invalid status" });
  const b = await Booking.findOne({ _id: req.params.id, organiser: req.user._id }).catch(() => null);
  if (!b) return res.status(404).json({ error: "Not found" });
  b.status = status;
  if (req.body.note !== undefined) b.note = str(req.body.note, 500);
  await b.save();
  res.json(bookingView(b));
});

// POST /api/bookings/:id/cancel  (vendor cancels own unpaid request)
router.post("/:id/cancel", requireUser("vendor"), async (req, res) => {
  const b = await Booking.findOne({ _id: req.params.id, $or: [{ vendor: req.user._id }, { email: req.user.email }] }).catch(() => null);
  if (!b) return res.status(404).json({ error: "Not found" });
  if (b.paymentStatus === "paid") return res.status(400).json({ error: "Paid bookings can't be cancelled here. Please contact support." });
  b.status = "cancelled";
  await b.save();
  res.json(bookingView(b));
});

module.exports = router;
