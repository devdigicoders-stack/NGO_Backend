const { validationResult } = require('express-validator');
const Donation = require('../models/Donation');
const DonationSettings = require('../models/DonationSettings');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { saveImageBuffer } = require('../utils/uploadService');

const donationController = {
  async getSettings(req, res) {
    try {
      const settings = await DonationSettings.getSettings();
      return sendSuccess(res, settings, 'Donation settings fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch donation settings', 500);
    }
  },

  async updateSettings(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }
      const settings = await DonationSettings.updateSettings(req.body);
      return sendSuccess(res, settings, 'Donation settings updated successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to update donation settings', 500);
    }
  },

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }

      const donation = await Donation.createDonation(req.body);
      return sendSuccess(res, donation, 'दान का अनुरोध सफलतापूर्वक दर्ज हो गया', 201);
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to submit donation', 500);
    }
  },

  async uploadScreenshot(req, res) {
    try {
      const donationId = req.params.id;
      if (!donationId) {
        return sendError(res, 'Donation ID is required', 400);
      }

      const donation = await Donation.findById(donationId);
      if (!donation) {
        return sendError(res, 'Donation not found', 404);
      }

      if (!req.file) {
        return sendError(res, 'Screenshot file is required', 400);
      }

      const result = await saveImageBuffer({
        buffer: req.file.buffer,
        category: 'donations',
        originalName: req.file.originalname || 'screenshot.jpg',
        mimeType: req.file.mimetype,
      });

      donation.screenshotUrl = result.url;
      donation.updatedAt = new Date();
      await donation.save();

      return sendSuccess(res, donation, 'Screenshot uploaded successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, err.message || 'Screenshot upload failed', 500);
    }
  },

  async getAll(req, res) {
    try {
      const filters = {
        status: req.query.status || 'all',
        search: req.query.search?.trim() || '',
      };
      const data = await Donation.getAll(filters);
      return sendSuccess(res, data, 'Donations fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch donations', 500);
    }
  },

  async getStats(req, res) {
    try {
      const stats = await Donation.getStats();
      return sendSuccess(res, stats, 'Donation stats fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch donation stats', 500);
    }
  },

  async getById(req, res) {
    try {
      const item = await Donation.findById(req.params.id);
      if (!item) {
        return sendError(res, 'Donation not found', 404);
      }
      return sendSuccess(res, item, 'Donation fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch donation', 500);
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

      const updated = await Donation.updateDonation(req.params.id, allowed);
      if (!updated) {
        return sendError(res, 'Donation not found', 404);
      }
      return sendSuccess(res, updated, 'Donation updated successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to update donation', 500);
    }
  },

  async lookupPublic(req, res) {
    try {
      const searchId = req.query.id?.trim() || '';
      if (!searchId) {
        return sendError(res, 'कृपया रेफरेंस ID दर्ज करें।', 400);
      }
      const re = new RegExp(`^${searchId}$`, 'i');
      const item = await Donation.findOne({ _id: re });
      if (!item) {
        return sendError(res, 'रेफरेंस ID नहीं मिला। कृपया सही ID दर्ज करें।', 404);
      }
      return sendSuccess(res, item, 'Donation found successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'सर्च करने में त्रुटि हुई।', 500);
    }
  },

  async remove(req, res) {
    try {
      const deleted = await Donation.deleteDonation(req.params.id);
      if (!deleted) {
        return sendError(res, 'Donation not found', 404);
      }
      return sendSuccess(res, deleted, 'Donation deleted successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to delete donation', 500);
    }
  },
};

module.exports = donationController;

