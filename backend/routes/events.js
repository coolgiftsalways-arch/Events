const mongoose = require("mongoose");
const router = require("express").Router();
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const { requireUser, optionalUser } = require("../middleware/auth");
const { storeMedia } = require("../utils/storeMedia");
const { eventView, detailsView } = require("../utils/eventView");

const str = (v, max = 300) => String(v ?? "").trim().slice(0, max);

// Find by demo slug ("mumbai-flea") or Mongo id
function findEvent(id, extra = {}) {
  const or = [{ slug: String(id) }];
  if (mongoose.isValidObjectId(id)) or.push({ _id: id });
  return Event.findOne({ $or: or, ...extra });
}

// GET /api/events  -> all approved events (public)
router.get("/", async (req, res) => {
  const events = await Event.find({ status: "approved" }).select("-stalls -gallery").sort({ startDate: 1 }).limit(1000);
  res.json(events.map(eventView));
});

// GET /api/events/mine  -> organiser's own events (any status)
router.get("/mine", requireUser("organiser"), async (req, res) => {
  const events = await Event.find({ organiser: req.user._id }).select("-stalls -gallery").sort({ createdAt: -1 });
  // number of vendor requests per event (not counting unfinished payments)
  const counts = await Booking.aggregate([
    { $match: { organiser: req.user._id, $nor: [{ kind: "booking", paymentStatus: { $in: ["awaiting", "failed"] } }] } },
    { $group: { _id: "$event", n: { $sum: 1 } } },
  ]);
  const byEvent = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  res.json(events.map((e) => ({ ...eventView(e), bookings: byEvent[String(e._id)] || 0 })));
});

// GET /api/events/:id  -> event + details (stalls etc.)
router.get("/:id", optionalUser, async (req, res) => {
  const e = await findEvent(req.params.id);
  const isOwner = e && req.user && String(e.organiser) === String(req.user._id);
  if (!e || (e.status !== "approved" && !isOwner)) return res.status(404).json({ error: "Event not found" });
  res.json({ event: eventView(e), details: detailsView(e) });
});

// Build stall list for an organiser's event: N standard stalls at the given price
function makeStalls(total, price) {
  const n = Math.max(0, Math.min(500, Number(total) || 0));
  return Array.from({ length: n }, (_, i) => ({
    id: `S${String(i + 1).padStart(2, "0")}`,
    type: "Standard Stall",
    size: "",
    price: Number(price) || 0,
    available: true,
  }));
}

function readBody(b) {
  const city = str(b.city, 80);
  return {
    title: str(b.title, 150),
    category: (Array.isArray(b.category) ? b.category : [b.category]).filter(Boolean).map((c) => str(c, 50)).slice(0, 5),
    description: str(b.description, 5000),
    startDate: str(b.date || b.startDate, 10),
    date: str(b.displayDate, 60) || undefined,
    startTime: str(b.startTime, 10),
    endTime: str(b.endTime, 10),
    venue: str(b.venue, 200),
    address: str(b.address, 300),
    city,
    state: str(b.state, 80),
    price: Math.max(0, Number(b.price) || 0),
    totalStalls: Math.max(0, Math.min(500, Number(b.totalStalls) || 0)),
    contactEmail: str(b.contactEmail, 150),
    contactPhone: str(b.contactPhone, 20),
    about: str(b.about || b.description, 5000),
    footfall: str(b.footfall, 100),
    audience: str(b.audience, 200),
  };
}

const needsApproval = () => process.env.EVENTS_NEED_APPROVAL !== "false";

// POST /api/events  (organiser) -> new event, waits for admin approval
router.post("/", requireUser("organiser"), async (req, res) => {
  const data = readBody(req.body);
  if (!data.title || !data.startDate || !data.venue) return res.status(400).json({ error: "Title, date and venue are required." });
  const image = await storeMedia(req.body.coverImage || req.body.image, "stallora/events");
  const date = data.date || new Date(data.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const e = await Event.create({
    ...data,
    date,
    image,
    stalls: makeStalls(data.totalStalls, data.price),
    availableStalls: data.totalStalls,
    organiser: req.user._id,
    organiserName: req.user.company || req.user.name,
    logo: req.user.company || req.user.name,
    status: needsApproval() ? "pending" : "approved",
  });
  res.status(201).json({ event: eventView(e), details: detailsView(e), needsApproval: needsApproval() });
});

// PATCH /api/events/:id  (owner) -> edit; edited approved events go back to review if approval is on
router.patch("/:id", requireUser("organiser"), async (req, res) => {
  const e = await findEvent(req.params.id, { organiser: req.user._id });
  if (!e) return res.status(404).json({ error: "Event not found" });
  const data = readBody({ ...eventView(e), ...e.toObject(), ...req.body });
  Object.assign(e, data);
  if (req.body.coverImage || req.body.image) e.image = await storeMedia(req.body.coverImage || req.body.image, "stallora/events");
  if (req.body.availabilityStatus) e.availabilityStatus = str(req.body.availabilityStatus, 40);
  if (needsApproval() && e.status === "rejected") e.status = "pending";
  await e.save();
  res.json({ event: eventView(e), details: detailsView(e) });
});

// DELETE /api/events/:id  (owner)
router.delete("/:id", requireUser("organiser"), async (req, res) => {
  const e = await findEvent(req.params.id, { organiser: req.user._id });
  if (!e) return res.status(404).json({ error: "Event not found" });
  await e.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
module.exports.findEvent = findEvent;
