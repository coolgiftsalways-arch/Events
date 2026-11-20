// Tiny in-memory limiter: max `max` hits per `minutes` per key (e.g. IP)
module.exports = function rateLimit({ max = 10, minutes = 15, message = "Too many attempts. Try again later." } = {}) {
  const hits = new Map();
  return (req, res, next) => {
    const key = req.ip + req.baseUrl + req.path;
    const now = Date.now();
    const h = hits.get(key) || { n: 0, at: now };
    if (now - h.at > minutes * 60 * 1000) Object.assign(h, { n: 0, at: now });
    h.n++;
    hits.set(key, h);
    if (h.n > max) return res.status(429).json({ error: message });
    next();
  };
};
