// backend/controllers/registrationController.js
const Registration = require('../models/Registration');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const prefixes = {
  patrakar: 'RPS',
  crime: 'RCIB',
  chikitsa: 'ABCS',
  hindu: 'RHM',
  journalist: 'ICJ',
  manav: 'RMA',
  bhrashtachar: 'BUAC',
  recall: 'RTR',
  muslim: 'BMM'
};

const generateRegistrationNumber = (orgId) => {
  const prefix = prefixes[orgId] || 'NGO';
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}/${year}/${random}`;
};

const registrationController = {
  // POST /api/registrations
  async create(req, res) {
    try {
      const { orgId, formData } = req.body;
      if (!orgId || !formData) {
        return sendError(res, 'orgId and formData are required', 400);
      }

      // Generate unique registration number and verify it doesn't exist
      let regNumber = '';
      let exists = true;
      let attempts = 0;
      
      while (exists && attempts < 10) {
        regNumber = generateRegistrationNumber(orgId);
        const found = await Registration.findOne({ regNumber });
        if (!found) {
          exists = false;
        }
        attempts++;
      }

      if (exists) {
        return sendError(res, 'Failed to generate a unique registration number', 500);
      }

      const registration = new Registration({
        regNumber,
        orgId,
        formData
      });

      await registration.save();
      return sendSuccess(res, registration, 'Registration successful', 201);
    } catch (err) {
      console.error('Error creating registration:', err);
      return sendError(res, 'Failed to save registration', 500);
    }
  },

  // GET /api/registrations/:regNumber (or via query param /api/registrations?regNumber=...)
  async getByNumber(req, res) {
    try {
      let searchNumber = req.params.regNumber || req.query.regNumber;
      if (!searchNumber) {
        return sendError(res, 'Registration number is required', 400);
      }

      searchNumber = decodeURIComponent(searchNumber).trim();

      const registration = await Registration.findOne({ regNumber: searchNumber });
      if (!registration) {
        return sendError(res, 'Registration not found', 404);
      }

      return sendSuccess(res, registration, 'Registration details fetched successfully');
    } catch (err) {
      console.error('Error fetching registration:', err);
      return sendError(res, 'Failed to fetch registration', 500);
    }
  }
};

module.exports = registrationController;
