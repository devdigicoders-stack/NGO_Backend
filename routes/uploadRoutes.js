const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { handleMulterUpload } = require('../middleware/multerUpload');

// Admin-only uploads
router.post('/', protect, handleMulterUpload, uploadController.uploadImage);

module.exports = router;
