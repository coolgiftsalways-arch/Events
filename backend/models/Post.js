const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    organiser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    organiserName: String,
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    mediaUrl: String,
    caption: { type: String, default: "" },
    eventName: String,
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    status: { type: String, enum: ["published", "hidden"], default: "published" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
