const { validationResult } = require('express-validator');
const News = require('../models/News');
const NewsSettings = require('../models/NewsSettings');
const { sendSuccess, sendError } = require('../utils/apiResponse');

function parseFilters(query) {
  return {
    activeOnly: query.activeOnly === 'true',
    showOnHome: query.showOnHome === 'true',
    featuredOnly: query.featuredOnly === 'true',
    category: query.category && query.category !== 'सभी' ? query.category : null,
    limit: query.limit ? parseInt(query.limit, 10) : null,
  };
}

const newsController = {
  async getAll(req, res) {
    try {
      const filters = parseFilters(req.query);
      const data = await News.getAll(filters);
      return sendSuccess(res, data, 'News articles fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch news', 500);
    }
  },

  async getCategories(req, res) {
    try {
      const articles = await News.getAll({ activeOnly: true });
      const categories = [...new Set(articles.map((a) => a.category).filter(Boolean))];
      return sendSuccess(res, categories, 'News categories fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch categories', 500);
    }
  },

  async getById(req, res) {
    try {
      const article = await News.findById(req.params.id);
      if (!article) {
        return sendError(res, 'News article not found', 404);
      }
      return sendSuccess(res, article, 'News article fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch news article', 500);
    }
  },

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }
      const article = await News.createArticle(req.body);
      return sendSuccess(res, article, 'News article created successfully', 201);
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to create news article', 500);
    }
  },

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }
      const updated = await News.updateArticle(req.params.id, req.body);
      if (!updated) {
        return sendError(res, 'News article not found', 404);
      }
      return sendSuccess(res, updated, 'News article updated successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to update news article', 500);
    }
  },

  async toggleActive(req, res) {
    try {
      const article = await News.toggleActive(req.params.id);
      if (!article) {
        return sendError(res, 'News article not found', 404);
      }
      const msg = article.isActive
        ? 'News article activated successfully'
        : 'News article deactivated successfully';
      return sendSuccess(res, article, msg);
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to toggle news status', 500);
    }
  },

  async remove(req, res) {
    try {
      const deleted = await News.deleteArticle(req.params.id);
      if (!deleted) {
        return sendError(res, 'News article not found', 404);
      }
      return sendSuccess(res, deleted, 'News article deleted successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to delete news article', 500);
    }
  },

  async reorder(req, res) {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        return sendError(res, 'orderedIds must be a non-empty array', 400);
      }
      const articles = await News.reorder(orderedIds);
      return sendSuccess(res, articles, 'News articles reordered successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to reorder news', 500);
    }
  },

  async getSettings(req, res) {
    try {
      const settings = await NewsSettings.getSettings();
      return sendSuccess(res, settings, 'News settings fetched successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to fetch news settings', 500);
    }
  },

  async updateSettings(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 422, errors.array());
      }
      const settings = await NewsSettings.updateSettings(req.body);
      return sendSuccess(res, settings, 'News settings updated successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 'Failed to update news settings', 500);
    }
  },
};

module.exports = newsController;
