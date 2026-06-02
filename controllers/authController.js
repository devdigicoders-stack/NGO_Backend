// backend/controllers/authController.js
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, NODE_ENV } = require('../config');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { saveImageBuffer, parseBase64Input } = require('../utils/uploadService');
const { SERVER_URL } = require('../config');

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Helper to format admin data (remove sensitive fields)
const formatAdmin = (admin, includeToken = null) => {
  const obj = admin.toObject ? admin.toObject() : admin;
  delete obj.password;
  if (includeToken) obj.token = includeToken;
  return obj;
};

const authController = {
  // POST /api/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400);
      }

      const admin = await Admin.findOne({ email });
      if (!admin) {
        return sendError(res, 'Invalid credentials', 401);
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return sendError(res, 'Invalid credentials', 401);
      }

      // Generate JWT
      const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '7d' });

      // Set cookie (local dev)
      res.cookie('admin_token', token, cookieOptions);

      // Send token + admin data (without password) for cross-origin (production)
      return sendSuccess(res, formatAdmin(admin, token), 'Logged in successfully');
    } catch (err) {
      console.error('Login error:', err);
      return sendError(res, 'Failed to log in', 500);
    }
  },

  // POST /api/auth/logout
  async logout(req, res) {
    try {
      res.clearCookie('admin_token', {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: NODE_ENV === 'production' ? 'none' : 'lax'
      });
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      return sendError(res, 'Failed to log out', 500);
    }
  },

  // GET /api/auth/profile
  async getProfile(req, res) {
    try {
      return sendSuccess(res, formatAdmin(req.admin), 'Profile fetched successfully');
    } catch (err) {
      console.error('Profile fetch error:', err);
      return sendError(res, 'Failed to fetch profile', 500);
    }
  },

  // PUT /api/auth/profile
  async updateProfile(req, res) {
    try {
      const { name, email, phone, location, bio, avatar } = req.body;
      
      const admin = req.admin;
      if (name) admin.name = name;
      if (email) {
        // Check if email is unique
        const existing = await Admin.findOne({ email, _id: { $ne: admin._id } });
        if (existing) {
          return sendError(res, 'Email already in use', 400);
        }
        admin.email = email;
      }
      if (phone !== undefined) admin.phone = phone;
      if (location !== undefined) admin.location = location;
      if (bio !== undefined) admin.bio = bio;
      if (avatar !== undefined) admin.avatar = avatar;

      admin.updatedAt = new Date();
      await admin.save();

      return sendSuccess(res, formatAdmin(admin), 'Profile updated successfully');
    } catch (err) {
      console.error('Update profile error:', err);
      return sendError(res, 'Failed to update profile', 500);
    }
  },

  // POST /api/auth/avatar — upload profile photo (multipart or base64)
  async uploadAvatar(req, res) {
    try {
      let result;

      if (req.file) {
        result = saveImageBuffer({
          buffer: req.file.buffer,
          category: 'profiles',
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
        });
      } else if (req.body.base64Data) {
        const { buffer, mimeType } = parseBase64Input(req.body.base64Data);
        result = saveImageBuffer({
          buffer,
          category: 'profiles',
          originalName: req.body.filename || 'avatar.jpg',
          mimeType,
        });
      } else {
        return sendError(res, 'No image provided', 400);
      }

      const admin = req.admin;
      admin.avatar = result.url;
      admin.updatedAt = new Date();
      await admin.save();

      const data = formatAdmin(admin);
      data.avatarFullUrl = `${SERVER_URL}${result.url}`;

      return sendSuccess(res, data, 'Profile photo updated successfully');
    } catch (err) {
      console.error('Avatar upload error:', err);
      return sendError(res, err.message || 'Failed to upload profile photo', 400);
    }
  },

  // PUT /api/auth/prefs
  async updatePrefs(req, res) {
    try {
      const { prefs } = req.body;
      if (!prefs) {
        return sendError(res, 'Preferences are required', 400);
      }

      const admin = req.admin;
      admin.prefs = { ...admin.prefs, ...prefs };
      admin.updatedAt = new Date();
      await admin.save();

      return sendSuccess(res, formatAdmin(admin), 'Preferences updated successfully');
    } catch (err) {
      console.error('Update preferences error:', err);
      return sendError(res, 'Failed to update preferences', 500);
    }
  }
};

module.exports = authController;
