const mongoose = require("mongoose");

const stallSchema = new mongoose.Schema(
  {
    id: String, // e.g. "A01"
    type: { type: String, default: "Standard Stall" },
    size: { type: String, default: "" },
    price: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, sparse: true }, // ids of the original demo events
    title: { type: String, required: true, trim: true },
    category: [String],
    description: { type: String, default: "" },

    date: String, // display text, e.g. "14–16 Dec 2026"
    startDate: String, // YYYY-MM-DD (used for sorting / filters)
    startTime: String,
    endTime: String,
    time: String,

    venue: String,
    address: String,
    city: String,
    state: String,

    price: Number, // starting stall price
    totalStalls: Number,
    availableStalls: Number,
    contactEmail: String,
    contactPhone: String,
    image: String,
    logo: String,

    organiser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    organiserName: String,

    // pending -> approved (visible) / rejected ; hidden = taken down by admin
    status: { type: String, enum: ["pending", "approved", "rejected", "hidden"], default: "pending", index: true },
    availabilityStatus: { type: String, default: "Stalls Open" }, // "Stalls Open", "Few Stalls Left", "Sold Out"
    rejectionReason: String,

    // extra page details
    about: String,
    footfall: String,
    audience: String,
    gallery: [String],
    stalls: [stallSchema],

    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
