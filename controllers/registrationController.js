// backend/controllers/registrationController.js
const Registration = require('../models/Registration');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { parseBase64Input, saveImageBuffer } = require('../utils/uploadService');

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
      const { orgId, regNumber: clientRegNumber } = req.body;
      // Clone formData so we can safely mutate (req.body may be sealed/frozen)
      const formData = { ...(req.body.formData || {}) };

      if (!orgId || !formData) {
        return sendError(res, 'orgId and formData are required', 400);
      }

      // Check if photo is base64 and save it to filesystem
      if (formData.photo && formData.photo.startsWith('data:image/')) {
        try {
          const { buffer, mimeType } = parseBase64Input(formData.photo);
          const result = saveImageBuffer({
            buffer,
            category: 'registrations',
            originalName: 'photo.jpg',
            mimeType
          });
          formData.photo = result.url; // Replace base64 with public URL path
          console.log('✅ Registration photo saved to:', result.path);
        } catch (uploadErr) {
          console.error('Error saving base64 registration photo:', uploadErr);
          return sendError(res, 'Failed to upload photo: ' + uploadErr.message, 400);
        }
      }

      // Use the regNumber sent by frontend if provided and not already used,
      // otherwise generate a new unique one
      let regNumber = '';
      if (clientRegNumber) {
        const exists = await Registration.findOne({ regNumber: clientRegNumber });
        if (!exists) {
          regNumber = clientRegNumber;
        }
      }

      if (!regNumber) {
        let attempts = 0;
        let exists = true;
        while (exists && attempts < 10) {
          regNumber = generateRegistrationNumber(orgId);
          const found = await Registration.findOne({ regNumber });
          if (!found) exists = false;
          attempts++;
        }
        if (exists) {
          return sendError(res, 'Failed to generate a unique registration number', 500);
        }
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

  async uploadScreenshot(req, res) {
    try {
      const regNumber = req.params.regNumber;
      if (!regNumber) {
        return sendError(res, 'Registration Number is required', 400);
      }

      const registration = await Registration.findOne({ regNumber });
      if (!registration) {
        return sendError(res, 'Registration not found', 404);
      }

      if (!req.file) {
        return sendError(res, 'Screenshot file is required', 400);
      }

      const result = saveImageBuffer({
        buffer: req.file.buffer,
        category: 'registrations',
        originalName: req.file.originalname || 'screenshot.jpg',
        mimeType: req.file.mimetype,
      });

      registration.screenshotUrl = result.url;
      if (req.body.amount) {
        registration.amount = Number(req.body.amount) || 0;
      }
      await registration.save();

      return sendSuccess(res, registration, 'Screenshot uploaded successfully');
    } catch (err) {
      console.error('Screenshot upload error:', err);
      return sendError(res, err.message || 'Screenshot upload failed', 500);
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
  },

  // GET /api/registrations (all - protected)
  async getAll(req, res) {
    try {
      const { orgId } = req.query;
      const filter = {};
      if (orgId) {
        filter.orgId = orgId;
      }
      const registrations = await Registration.find(filter).sort({ createdAt: -1 });
      return sendSuccess(res, registrations, 'Registrations fetched successfully');
    } catch (err) {
      console.error('Error fetching registrations:', err);
      return sendError(res, 'Failed to fetch registrations', 500);
    }
  },

  // PATCH /api/registrations/:id/status (admin only)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, role, validFrom, validUntil } = req.body;

      if (!status) {
        return sendError(res, 'Status is required', 400);
      }

      const updateData = { status };
      if (role) {
        updateData.role = role;
      }
      if (validFrom) {
        updateData.validFrom = validFrom;
      }
      if (validUntil) {
        updateData.validUntil = validUntil;
      }

      const updatedRegistration = await Registration.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!updatedRegistration) {
        return sendError(res, 'Registration not found', 404);
      }

      return sendSuccess(res, updatedRegistration, 'Status updated successfully');
    } catch (err) {
      console.error('Error updating registration status:', err);
      return sendError(res, 'Failed to update registration status', 500);
    }
  },

  // PUT /api/registrations/:id (admin only)
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if photo is base64 and save it to filesystem
      if (updateData.formData && updateData.formData.photo && updateData.formData.photo.startsWith('data:image/')) {
        try {
          const { buffer, mimeType } = parseBase64Input(updateData.formData.photo);
          const result = saveImageBuffer({
            buffer,
            category: 'registrations',
            originalName: 'photo.jpg',
            mimeType
          });
          updateData.formData.photo = result.url; // Replace base64 with public URL path
        } catch (uploadErr) {
          console.error('Error saving base64 registration photo:', uploadErr);
          return sendError(res, 'Failed to upload photo: ' + uploadErr.message, 400);
        }
      }

      const updatedRegistration = await Registration.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!updatedRegistration) {
        return sendError(res, 'Registration not found', 404);
      }

      return sendSuccess(res, updatedRegistration, 'Registration updated successfully');
    } catch (err) {
      console.error('Error updating registration:', err);
      return sendError(res, 'Failed to update registration', 500);
    }
  },

  // DELETE /api/registrations/:id (admin only)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedRegistration = await Registration.findByIdAndDelete(id);

      if (!deletedRegistration) {
        return sendError(res, 'Registration not found', 404);
      }

      return sendSuccess(res, null, 'Registration deleted successfully');
    } catch (err) {
      console.error('Error deleting registration:', err);
      return sendError(res, 'Failed to delete registration', 500);
    }
  }
};

module.exports = registrationController;
