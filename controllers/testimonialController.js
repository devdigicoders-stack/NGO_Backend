const { validationResult } = require('express-validator');
const Testimonial = require('../models/Testimonial');
const TestimonialSettings = require('../models/TestimonialSettings');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const testimonialController = {
  async getAll(req, res) {
    try {
      const { activeOnly } = req.query;
      const data = activeOnly === 'true'
        ? await Testimonial.getActive()
        : await Testimonial.getAll();
      return sendSuccess(res, data, 'Testimonials fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch testimonials', 500);
    }
  },

  async getById(req, res) {
    try {
      const item = await Testimonial.findById(req.params.id);
      if (!item) {
        return sendError(res, 'Testimonial not found', 404);
      }
      return sendSuccess(res, item, 'Testimonial fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch testimonial', 500);
    }
  },

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }
      const item = await Testimonial.createTestimonial(req.body);
      return sendSuccess(res, item, 'Testimonial created successfully', 201);
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to create testimonial', 500);
    }
  },

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }
      const updated = await Testimonial.updateTestimonial(req.params.id, req.body);
      if (!updated) {
        return sendError(res, 'Testimonial not found', 404);
      }
      return sendSuccess(res, updated, 'Testimonial updated successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to update testimonial', 500);
    }
  },

  async toggleActive(req, res) {
    try {
      const item = await Testimonial.toggleActive(req.params.id);
      if (!item) {
        return sendError(res, 'Testimonial not found', 404);
      }
      const msg = item.isActive
        ? 'Testimonial activated successfully'
        : 'Testimonial deactivated successfully';
      return sendSuccess(res, item, msg);
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to toggle testimonial status', 500);
    }
  },

  async remove(req, res) {
    try {
      const deleted = await Testimonial.deleteTestimonial(req.params.id);
      if (!deleted) {
        return sendError(res, 'Testimonial not found', 404);
      }
      return sendSuccess(res, deleted, 'Testimonial deleted successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to delete testimonial', 500);
    }
  },

  async reorder(req, res) {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        return sendError(res, 'orderedIds must be a non-empty array', 400);
      }
      const items = await Testimonial.reorder(orderedIds);
      return sendSuccess(res, items, 'Testimonials reordered successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to reorder testimonials', 500);
    }
  },

  async getSettings(req, res) {
    try {
      const settings = await TestimonialSettings.getSettings();
      return sendSuccess(res, settings, 'Testimonials section settings fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch testimonials settings', 500);
    }
  },

  async updateSettings(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }
      const settings = await TestimonialSettings.updateSettings(req.body);
      return sendSuccess(res, settings, 'Testimonials section settings updated successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to update testimonials settings', 500);
    }
  },
};

module.exports = testimonialController;
