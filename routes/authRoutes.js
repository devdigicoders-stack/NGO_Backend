// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { handleMulterUpload } = require('../middleware/multerUpload');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// GET /api/auth/profile — protected
router.get('/profile', protect, authController.getProfile);

// PUT /api/auth/profile — protected
router.put('/profile', protect, authController.updateProfile);

// POST /api/auth/avatar — protected (profile photo upload)
router.post('/avatar', protect, handleMulterUpload, authController.uploadAvatar);

// PUT /api/auth/prefs — protected
router.put('/prefs', protect, authController.updatePrefs);

module.exports = router;
