const express = require('express');
const router = express.Router();
const donationQueryController = require('../controllers/donationQueryController');
const { protect } = require('../middleware/auth');
const {
  createDonationQueryRules,
  updateDonationQueryRules,
  updateDonationQuerySettingsRules,
} = require('../middleware/validate');

router.get('/settings', donationQueryController.getSettings);
router.put('/settings', protect, updateDonationQuerySettingsRules, donationQueryController.updateSettings);

router.post('/', createDonationQueryRules, donationQueryController.create);

router.get('/stats', protect, donationQueryController.getStats);
router.get('/', protect, donationQueryController.getAll);
router.get('/:id', protect, donationQueryController.getById);
router.patch('/:id', protect, updateDonationQueryRules, donationQueryController.update);
router.delete('/:id', protect, donationQueryController.remove);

module.exports = router;
