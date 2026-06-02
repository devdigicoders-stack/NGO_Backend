// ─────────────────────────────────────────────────────────────
// routes/programRoutes.js  —  Program API routes
//
// All routes are prefixed with /api/v1/programs (set in app.js)
// Pattern: route → validation middleware → controller method
// ─────────────────────────────────────────────────────────────
const express           = require('express');
const router            = express.Router();
const programController = require('../controllers/programController');
const { createProgramRules, updateProgramRules } = require('../middleware/validate');

// ── SPECIAL routes (must come BEFORE /:id to avoid conflicts) ──

/**
 * PATCH /api/v1/programs/reorder
 * Body: { orderedIds: ["prog-abc", "prog-xyz"] }
 */
router.patch('/reorder', programController.reorder);

// ── COLLECTION routes ───────────────────────────────────────

/**
 * GET  /api/v1/programs            → list all programs (admin)
 * GET  /api/v1/programs?activeOnly=true  → list active (website)
 */
router.get('/', programController.getAll);

/**
 * POST /api/v1/programs            → create new program
 */
router.post('/', createProgramRules, programController.create);

// ── ITEM routes (by :id) ────────────────────────────────────

/**
 * GET  /api/v1/programs/:id        → get single program
 */
router.get('/:id', programController.getById);

/**
 * PUT  /api/v1/programs/:id        → update program (full update)
 */
router.put('/:id', updateProgramRules, programController.update);

/**
 * PATCH /api/v1/programs/:id/toggle  → toggle active/inactive
 */
router.patch('/:id/toggle', programController.toggleActive);

/**
 * DELETE /api/v1/programs/:id      → delete program
 */
router.delete('/:id', programController.remove);

module.exports = router;
