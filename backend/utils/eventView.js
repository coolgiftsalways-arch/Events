// Event as the frontend expects it (old static-data shape + details)
function eventView(e) {
  const id = e.slug || String(e._id);
  const location = [e.city, e.state].filter(Boolean).join(", ");
  return {
    id,
    _id: String(e._id),
    title: e.title,
    category: e.category || [],
    description: e.description || "",
    date: e.date || e.startDate || "",
    startDate: e.startDate || "",
    startTime: e.startTime || "",
    endTime: e.endTime || "",
    time: e.time || [e.startTime, e.endTime].filter(Boolean).join(" - "),
    venue: e.venue || "",
    address: e.address || "",
    city: e.city || "",
    state: e.state || "",
    location,
    price: e.price ?? null,
    totalStalls: e.totalStalls ?? (e.stalls || []).length,
    availableStalls: e.availableStalls ?? (e.stalls || []).filter((s) => s.available).length,
    contactEmail: e.contactEmail || "",
    contactPhone: e.contactPhone || "",
    image: e.image || "",
    coverImage: e.image || "",
    logo: e.logo || e.organiserName || "EVENT",
    organiser: e.organiserName || "Event Organiser",
    organiserName: e.organiserName || "Event Organiser",
    organiserId: e.organiser ? String(e.organiser) : null,
    status: e.availabilityStatus || "Stalls Open",
    availabilityStatus: e.availabilityStatus || "Stalls Open",
    approvalStatus: e.status,
    rejectionReason: e.rejectionReason || "",
    isDemo: e.isDemo,
    createdAt: e.createdAt,
  };
}

// The "details" object (what data/events.js called eventDetails[id])
function detailsView(e) {
  return {
    about: e.about || e.description || "",
    footfall: e.footfall || "",
    audience: e.audience || "",
    organiserPhone: e.contactPhone || "",
    organiserEmail: e.contactEmail || "",
    gallery: e.gallery || [],
    stalls: (e.stalls || []).map((s) => ({ id: s.id, type: s.type, size: s.size, price: s.price, available: s.available })),
  };
}

module.exports = { eventView, detailsView };
