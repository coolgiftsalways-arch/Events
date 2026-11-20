const mongoose = require("mongoose");

// One collection for vendors and organisers (same email can have one of each)
const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["vendor", "organiser"], required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    passwordHash: { type: String, required: true, select: false },
    status: { type: String, enum: ["active", "blocked"], default: "active" },

    // profile
    company: { type: String, default: "" }, // organiser company / vendor brand
    username: { type: String, default: "" },
    bio: { type: String, default: "" },
    about: { type: String, default: "" },
    location: { type: String, default: "" },
    website: { type: String, default: "" },
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    category: { type: String, default: "" },
    profileImage: { type: String, default: "" },

    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
