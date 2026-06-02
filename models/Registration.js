// backend/models/Registration.js
const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  orgId: { type: String, required: true },
  formData: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model('Registration', RegistrationSchema);
