const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');
const {
  createEnquiryRules,
  updateEnquiryRules,
} = require('../middleware/validate');

router.post('/', createEnquiryRules, enquiryController.create);

router.get('/stats', protect, enquiryController.getStats);
router.get('/', protect, enquiryController.getAll);
router.get('/:id', protect, enquiryController.getById);
router.patch('/:id', protect, updateEnquiryRules, enquiryController.update);
router.delete('/:id', protect, enquiryController.remove);

module.exports = router;
