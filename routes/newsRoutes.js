const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const {
  createNewsRules,
  updateNewsRules,
  updateNewsSettingsRules,
} = require('../middleware/validate');

router.patch('/reorder', newsController.reorder);

router.get('/settings', newsController.getSettings);
router.put('/settings', updateNewsSettingsRules, newsController.updateSettings);

router.get('/categories', newsController.getCategories);

router.get('/', newsController.getAll);
router.post('/', createNewsRules, newsController.create);

router.get('/:id', newsController.getById);
router.put('/:id', updateNewsRules, newsController.update);
router.patch('/:id/toggle', newsController.toggleActive);
router.delete('/:id', newsController.remove);

module.exports = router;
