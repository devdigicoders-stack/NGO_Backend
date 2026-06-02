const { validationResult } = require('express-validator');
const DonationQuery = require('../models/DonationQuery');
const DonationQuerySettings = require('../models/DonationQuerySettings');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const donationQueryController = {
  async getSettings(req, res) {
    try {
      const settings = await DonationQuerySettings.getSettings();
      return sendSuccess(res, settings, 'Donation query form settings fetched');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch donation query settings', 500);
    }
  },

  async updateSettings(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }
      const settings = await DonationQuerySettings.updateSettings(req.body);
      return sendSuccess(res, settings, 'Donation query form settings updated');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to update donation query settings', 500);
    }
  },

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }

      const query = await DonationQuery.createQuery(req.body);
      return sendSuccess(res, query, 'आपका संदेश सफलतापूर्वक भेज दिया गया है', 201);
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to submit query', 500);
    }
  },

  async getAll(req, res) {
    try {
      const filters = {
        status: req.query.status || 'all',
        search: req.query.search?.trim() || '',
      };
      const data = await DonationQuery.getAll(filters);
      return sendSuccess(res, data, 'Donation queries fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch queries', 500);
    }
  },

  async getStats(req, res) {
    try {
      const stats = await DonationQuery.getStats();
      return sendSuccess(res, stats, 'Query stats fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch query stats', 500);
    }
  },

  async getById(req, res) {
    try {
      const item = await DonationQuery.findById(req.params.id);
      if (!item) {
        return sendError(res, 'Query not found', 404);
      }
      return sendSuccess(res, item, 'Query fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch query', 500);
    }
  },

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }

      const allowed = {};
      if (req.body.status !== undefined) allowed.status = req.body.status;
      if (req.body.adminNotes !== undefined) allowed.adminNotes = req.body.adminNotes;

      const updated = await DonationQuery.updateQuery(req.params.id, allowed);
      if (!updated) {
        return sendError(res, 'Query not found', 404);
      }
      return sendSuccess(res, updated, 'Query updated successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to update query', 500);
    }
  },

  async remove(req, res) {
    try {
      const deleted = await DonationQuery.deleteQuery(req.params.id);
      if (!deleted) {
        return sendError(res, 'Query not found', 404);
      }
      return sendSuccess(res, deleted, 'Query deleted successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to delete query', 500);
    }
  },
};

module.exports = donationQueryController;
