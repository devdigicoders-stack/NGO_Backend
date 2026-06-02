const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const {
  createTestimonialRules,
  updateTestimonialRules,
  updateTestimonialSettingsRules,
} = require('../middleware/validate');

router.patch('/reorder', testimonialController.reorder);

router.get('/settings', testimonialController.getSettings);
router.put('/settings', updateTestimonialSettingsRules, testimonialController.updateSettings);

router.get('/', testimonialController.getAll);
router.post('/', createTestimonialRules, testimonialController.create);

router.get('/:id', testimonialController.getById);
router.put('/:id', updateTestimonialRules, testimonialController.update);
router.patch('/:id/toggle', testimonialController.toggleActive);
router.delete('/:id', testimonialController.remove);

module.exports = router;
