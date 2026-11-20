const jwt = require("jsonwebtoken");

// Allows the request only with a valid admin token: "Authorization: Bearer <token>"
module.exports = function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    if (req.admin.role !== "admin") throw new Error();
    next();
  } catch {
    res.status(401).json({ error: "Please log in again" });
  }
};
