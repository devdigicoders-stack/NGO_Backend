// backend/routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');
const { handleMulterUpload } = require('../middleware/multerUpload');

// POST /api/registrations - Create registration
router.post('/', registrationController.create);

// POST /api/registrations/:regNumber/screenshot - Upload screenshot
router.post('/:regNumber/screenshot', handleMulterUpload, registrationController.uploadScreenshot);

// GET /api/registrations?regNumber=... - Public lookup by query param
// GET /api/registrations - Protected list of all (no query param)
router.get('/', (req, res, next) => {
  if (req.query.regNumber) {
    return registrationController.getByNumber(req, res, next);
  } else {
    return protect(req, res, () => registrationController.getAll(req, res, next));
  }
});

// GET /api/registrations/lookup?n=RPS/2026/123456
// This avoids the slash-in-path issue with Express
router.get('/lookup', (req, res, next) => {
  req.params.regNumber = req.query.n || '';
  return registrationController.getByNumber(req, res, next);
});

// PATCH /api/registrations/:id/status - Admin update status/role
router.patch('/:id/status', protect, registrationController.updateStatus);

// PUT /api/registrations/:id - Admin update registration
router.put('/:id', protect, registrationController.update);

// DELETE /api/registrations/:id - Admin delete registration
router.delete('/:id', protect, registrationController.delete);

module.exports = router;

