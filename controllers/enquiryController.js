const { validationResult } = require('express-validator');
const Enquiry = require('../models/Enquiry');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const enquiryController = {
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }

      const enquiry = await Enquiry.createEnquiry(req.body);
      return sendSuccess(res, enquiry, 'आपका संदेश सफलतापूर्वक भेज दिया गया है', 201);
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to submit enquiry', 500);
    }
  },

  async getAll(req, res) {
    try {
      const filters = {
        status: req.query.status || 'all',
        search: req.query.search?.trim() || '',
      };
      const data = await Enquiry.getAll(filters);
      return sendSuccess(res, data, 'Enquiries fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch enquiries', 500);
    }
  },

  async getStats(req, res) {
    try {
      const stats = await Enquiry.getStats();
      return sendSuccess(res, stats, 'Enquiry stats fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch enquiry stats', 500);
    }
  },

  async getById(req, res) {
    try {
      const item = await Enquiry.findById(req.params.id);
      if (!item) {
        return sendError(res, 'Enquiry not found', 404);
      }
      return sendSuccess(res, item, 'Enquiry fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch enquiry', 500);
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

      const updated = await Enquiry.updateEnquiry(req.params.id, allowed);
      if (!updated) {
        return sendError(res, 'Enquiry not found', 404);
      }
      return sendSuccess(res, updated, 'Enquiry updated successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to update enquiry', 500);
    }
  },

  async remove(req, res) {
    try {
      const deleted = await Enquiry.deleteEnquiry(req.params.id);
      if (!deleted) {
        return sendError(res, 'Enquiry not found', 404);
      }
      return sendSuccess(res, deleted, 'Enquiry deleted successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to delete enquiry', 500);
    }
  },
};

module.exports = enquiryController;
