// backend/controllers/programController.js
// Business logic for Program (हमारे कार्यक्रम) endpoints using Mongoose models.
// All handlers are async and return proper JSON responses.

const { validationResult } = require('express-validator');
const Program = require('../models/Program'); // Mongoose model
const { sendSuccess, sendError } = require('../utils/apiResponse');

const programController = {
  // GET /api/v1/programs?activeOnly=true
  async getAll(req, res) {
    try {
      const { activeOnly } = req.query;
      const data = activeOnly === 'true'
        ? await Program.getActive()
        : await Program.getAll();
      return sendSuccess(res, data, 'Programs fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch programs', 500);
    }
  },

  // GET /api/v1/programs/:id
  async getById(req, res) {
    try {
      const program = await Program.findById(req.params.id);
      if (!program) {
        return sendError(res, 'Program not found', 404);
      }
      return sendSuccess(res, program, 'Program fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch program', 500);
    }
  },

  // POST /api/v1/programs
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }
      const program = await Program.createProgram(req.body);
      return sendSuccess(res, program, 'Program created successfully', 201);
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to create program', 500);
    }
  },

  // PUT /api/v1/programs/:id
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }
      const updated = await Program.updateProgram(req.params.id, req.body);
      if (!updated) {
        return sendError(res, 'Program not found', 404);
      }
      return sendSuccess(res, updated, 'Program updated successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to update program', 500);
    }
  },

  // PATCH /api/v1/programs/:id/toggle
  async toggleActive(req, res) {
    try {
      const program = await Program.toggleActive(req.params.id);
      if (!program) {
        return sendError(res, 'Program not found', 404);
      }
      const msg = program.isActive ? 'Program activated successfully' : 'Program deactivated successfully';
      return sendSuccess(res, program, msg);
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to toggle program status', 500);
    }
  },

  // DELETE /api/v1/programs/:id
  async remove(req, res) {
    try {
      const deleted = await Program.deleteProgram(req.params.id);
      if (!deleted) {
        return sendError(res, 'Program not found', 404);
      }
      return sendSuccess(res, deleted, 'Program deleted successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to delete program', 500);
    }
  },

  // PATCH /api/v1/programs/reorder
  async reorder(req, res) {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        return sendError(res, 'orderedIds must be a non‑empty array', 400);
      }
      const programs = await Program.reorder(orderedIds);
      return sendSuccess(res, programs, 'Programs reordered successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to reorder programs', 500);
    }
  },
};

module.exports = programController;
