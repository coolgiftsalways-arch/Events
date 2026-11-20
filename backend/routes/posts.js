const router = require("express").Router();
const Post = require("../models/Post");
const { requireUser } = require("../middleware/auth");
const { storeMedia } = require("../utils/storeMedia");

const view = (p) => ({
  id: String(p._id),
  mediaType: p.mediaType,
  mediaUrl: p.mediaUrl,
  image: p.mediaType === "image" ? p.mediaUrl : "",
  caption: p.caption,
  eventName: p.eventName || "",
  likes: p.likes,
  views: p.views,
  organiserId: String(p.organiser),
  organiserName: p.organiserName,
  createdAt: p.createdAt,
});

// GET /api/posts/mine
router.get("/mine", requireUser("organiser"), async (req, res) => {
  const posts = await Post.find({ organiser: req.user._id }).sort({ createdAt: -1 }).limit(200);
  res.json(posts.map(view));
});

// GET /api/posts/organiser/:id  (public profile posts)
router.get("/organiser/:id", async (req, res) => {
  const posts = await Post.find({ organiser: req.params.id, status: "published" }).sort({ createdAt: -1 }).limit(100).catch(() => []);
  res.json(posts.map(view));
});

// POST /api/posts  body: { mediaType, mediaUrl (data url), caption, eventName }
router.post("/", requireUser("organiser"), async (req, res) => {
  const caption = String(req.body.caption || "").trim().slice(0, 2200);
  if (!caption) return res.status(400).json({ error: "Please write a caption for your post." });
  const mediaType = req.body.mediaType === "video" ? "video" : "image";
  const mediaUrl = await storeMedia(req.body.mediaUrl || req.body.image, "stallora/posts");
  const p = await Post.create({
    organiser: req.user._id,
    organiserName: req.user.company || req.user.name,
    mediaType,
    mediaUrl,
    caption,
    eventName: String(req.body.eventName || "").slice(0, 150),
  });
  res.status(201).json(view(p));
});

// DELETE /api/posts/:id
router.delete("/:id", requireUser("organiser"), async (req, res) => {
  const r = await Post.deleteOne({ _id: req.params.id, organiser: req.user._id }).catch(() => ({ deletedCount: 0 }));
  if (!r.deletedCount) return res.status(404).json({ error: "Post not found" });
  res.json({ ok: true });
});

module.exports = router;
