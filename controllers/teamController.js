const { validationResult } = require('express-validator');
const TeamMember = require('../models/TeamMember');
const TeamSettings = require('../models/TeamSettings');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const teamController = {
  async getAll(req, res) {
    try {
      const { activeOnly } = req.query;
      const data = activeOnly === 'true'
        ? await TeamMember.getActive()
        : await TeamMember.getAll();
      return sendSuccess(res, data, 'Team members fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch team members', 500);
    }
  },

  async getById(req, res) {
    try {
      const member = await TeamMember.findById(req.params.id);
      if (!member) {
        return sendError(res, 'Team member not found', 404);
      }
      return sendSuccess(res, member, 'Team member fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch team member', 500);
    }
  },

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }
      const member = await TeamMember.createMember(req.body);
      return sendSuccess(res, member, 'Team member created successfully', 201);
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to create team member', 500);
    }
  },

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }
      const updated = await TeamMember.updateMember(req.params.id, req.body);
      if (!updated) {
        return sendError(res, 'Team member not found', 404);
      }
      return sendSuccess(res, updated, 'Team member updated successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to update team member', 500);
    }
  },

  async toggleActive(req, res) {
    try {
      const member = await TeamMember.toggleActive(req.params.id);
      if (!member) {
        return sendError(res, 'Team member not found', 404);
      }
      const msg = member.isActive
        ? 'Team member activated successfully'
        : 'Team member deactivated successfully';
      return sendSuccess(res, member, msg);
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to toggle team member status', 500);
    }
  },

  async remove(req, res) {
    try {
      const deleted = await TeamMember.deleteMember(req.params.id);
      if (!deleted) {
        return sendError(res, 'Team member not found', 404);
      }
      return sendSuccess(res, deleted, 'Team member deleted successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to delete team member', 500);
    }
  },

  async reorder(req, res) {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        return sendError(res, 'orderedIds must be a non-empty array', 400);
      }
      const members = await TeamMember.reorder(orderedIds);
      return sendSuccess(res, members, 'Team members reordered successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to reorder team members', 500);
    }
  },

  async getSettings(req, res) {
    try {
      const settings = await TeamSettings.getSettings();
      return sendSuccess(res, settings, 'Team section settings fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch team settings', 500);
    }
  },

  async updateSettings(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }
      const settings = await TeamSettings.updateSettings(req.body);
      return sendSuccess(res, settings, 'Team section settings updated successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to update team settings', 500);
    }
  },
};

module.exports = teamController;
