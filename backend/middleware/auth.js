const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Reads "Authorization: Bearer <token>" for a vendor/organiser.
async function readUser(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (!token) return null;
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    if (!["vendor", "organiser"].includes(data.role)) return null;
    const user = await User.findById(data.sub);
    if (!user || user.status !== "active" || user.role !== data.role) return null;
    return user;
  } catch {
    return null;
  }
}

// requireUser() any logged-in user, requireUser("vendor") only vendors, etc.
const requireUser = (role) => async (req, res, next) => {
  const user = await readUser(req);
  if (!user) return res.status(401).json({ error: "Please log in again" });
  if (role && user.role !== role) return res.status(403).json({ error: `Only ${role}s can do this` });
  req.user = user;
  next();
};

// Attaches req.user when a valid token is sent, but doesn't require it
const optionalUser = async (req, res, next) => {
  req.user = await readUser(req);
  next();
};

const signUser = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });

module.exports = { requireUser, optionalUser, signUser };
