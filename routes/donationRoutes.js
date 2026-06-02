const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { protect } = require('../middleware/auth');
const {
  createDonationRules,
  updateDonationRules,
  updateDonationSettingsRules,
} = require('../middleware/validate');

router.get('/settings', donationController.getSettings);
router.put('/settings', protect, updateDonationSettingsRules, donationController.updateSettings);

router.post('/', createDonationRules, donationController.create);

router.get('/stats', protect, donationController.getStats);
router.get('/', protect, donationController.getAll);
router.get('/:id', protect, donationController.getById);
router.patch('/:id', protect, updateDonationRules, donationController.update);
router.delete('/:id', protect, donationController.remove);

module.exports = router;
