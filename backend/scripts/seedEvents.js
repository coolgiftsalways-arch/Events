// Copies the demo events from frontend/src/data/events.js into MongoDB (once).
// Run from the backend folder:  npm run seed:events
// Remove them later from the admin panel, or:  npm run seed:events -- --remove
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
if (process.env.FORCE_PUBLIC_DNS === "true") require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const path = require("path");
const { pathToFileURL } = require("url");
const mongoose = require("mongoose");
const Event = require("../models/Event");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  if (process.argv.includes("--remove")) {
    const r = await Event.deleteMany({ isDemo: true });
    console.log(`Removed ${r.deletedCount} demo events.`);
    return mongoose.disconnect();
  }

  const file = pathToFileURL(path.join(__dirname, "..", "..", "frontend", "src", "data", "events.js")).href;
  const { events, eventDetails } = await import(file);

  let added = 0;
  for (const e of events) {
    if (await Event.exists({ slug: e.id })) continue;
    const d = eventDetails[e.id] || {};
    const stalls = d.stalls?.length
      ? d.stalls
      : Array.from({ length: 12 }, (_, i) => ({ id: `S${String(i + 1).padStart(2, "0")}`, type: "Standard Stall", size: "6 × 6 ft", price: 10000, available: true }));
    await Event.create({
      slug: e.id,
      title: e.title,
      category: Array.isArray(e.category) ? e.category : [e.category].filter(Boolean),
      description: d.about || "",
      date: e.date,
      startDate: e.startDate,
      time: e.time,
      venue: e.venue,
      city: e.city,
      image: e.image,
      logo: e.logo,
      organiserName: e.organiser,
      availabilityStatus: e.status,
      price: Math.min(...stalls.map((s) => s.price)),
      totalStalls: stalls.length,
      availableStalls: stalls.filter((s) => s.available).length,
      contactEmail: d.organiserEmail,
      contactPhone: d.organiserPhone,
      about: d.about,
      footfall: d.footfall,
      audience: d.audience,
      gallery: d.gallery || [],
      stalls,
      status: "approved",
      isDemo: true,
    });
    added++;
  }
  console.log(`Added ${added} demo events (${events.length - added} were already there).`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
