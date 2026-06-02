// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const Admin = require('../models/Admin');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header first (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Fallback to cookie
    if (!token && req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }

    if (!token) {
      return sendError(res, 'Unauthorized access: Session token missing', 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return sendError(res, 'Unauthorized access: Invalid or expired session token', 401);
    }

    // Find admin user
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return sendError(res, 'Unauthorized access: User not found', 401);
    }

    // Attach admin to request object
    req.admin = admin;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return sendError(res, 'Internal server error during authentication', 500);
  }
};

module.exports = { protect };
