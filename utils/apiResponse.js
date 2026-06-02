// ─────────────────────────────────────────────────────────────
// utils/apiResponse.js  —  Standardized API response helpers
// Every controller uses these to send consistent JSON responses
// ─────────────────────────────────────────────────────────────

/**
 * Send a success response.
 * @param {Response} res
 * @param {*}        data     Payload
 * @param {string}   message  Human-readable message
 * @param {number}   status   HTTP status code (default 200)
 */
const sendSuccess = (res, data, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send an error response.
 * @param {Response} res
 * @param {string}   message  Error message
 * @param {number}   status   HTTP status code (default 500)
 * @param {*}        errors   Optional validation errors array
 */
const sendError = (res, message = 'Internal Server Error', status = 500, errors = null) => {
  const body = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};

module.exports = { sendSuccess, sendError };
