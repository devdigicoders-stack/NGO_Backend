// backend/routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// POST /api/registrations - Create registration
router.post('/', registrationController.create);

// GET /api/registrations - Get registration by query param
router.get('/', registrationController.getByNumber);

// GET /api/registrations/:regNumber - Get registration by path param
router.get('/:regNumber', registrationController.getByNumber);

module.exports = router;
