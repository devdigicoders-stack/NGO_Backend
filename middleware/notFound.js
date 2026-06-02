// ─────────────────────────────────────────────────────────────
// middleware/notFound.js  —  404 handler
//
// Catches requests that didn't match any route.
// Register this AFTER all routes but BEFORE errorHandler.
// ─────────────────────────────────────────────────────────────
const notFound = (req, res, next) => {
  const err    = new Error(`Route not found — ${req.method} ${req.originalUrl}`);
  err.status   = 404;
  next(err);
};

module.exports = notFound;
