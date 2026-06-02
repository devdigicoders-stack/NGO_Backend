// ─────────────────────────────────────────────────────────────
// middleware/errorHandler.js  —  Global error handler
//
// Must be registered LAST in app.js (after all routes).
// Catches any unhandled errors thrown by controllers.
// ─────────────────────────────────────────────────────────────
const { NODE_ENV } = require('../config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log stack trace in development only
  if (NODE_ENV === 'development') {
    console.error('\n[ERROR]', err.stack);
  } else {
    console.error(`[ERROR] ${status} — ${message}`);
  }

  return res.status(status).json({
    success:   false,
    message,
    timestamp: new Date().toISOString(),
    // Only expose stack trace in dev mode
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
