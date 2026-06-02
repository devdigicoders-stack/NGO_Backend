const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const {
  createTeamMemberRules,
  updateTeamMemberRules,
  updateTeamSettingsRules,
} = require('../middleware/validate');

router.patch('/reorder', teamController.reorder);

router.get('/settings', teamController.getSettings);
router.put('/settings', updateTeamSettingsRules, teamController.updateSettings);

router.get('/', teamController.getAll);
router.post('/', createTeamMemberRules, teamController.create);

router.get('/:id', teamController.getById);
router.put('/:id', updateTeamMemberRules, teamController.update);
router.patch('/:id/toggle', teamController.toggleActive);
router.delete('/:id', teamController.remove);

module.exports = router;
