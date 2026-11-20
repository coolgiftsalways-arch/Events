require("dotenv").config();

// Some Indian ISPs fail MongoDB Atlas "mongodb+srv" lookups -> use public DNS
if (process.env.FORCE_PUBLIC_DNS === "true") {
  require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || true }));
// Webhook needs the raw body for signature check, so mount it before express.json()
app.use("/api/subscriptions/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "12mb" })); // room for images sent from the browser

app.get("/api/health", (req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));
app.use("/api/subscriptions", require("./routes/subscriptions"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/posts", require("./routes/posts"));

// Any error inside a route -> clean JSON message instead of a crash page
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") return res.status(413).json({ error: "File too large. Please use a smaller image." });
  if (err.status && err.status < 500) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});



async function start() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in backend/.env");
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}

start().catch((e) => {
  console.error("Startup failed:", e.message);
  process.exit(1);
});
