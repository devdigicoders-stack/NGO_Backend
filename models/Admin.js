// backend/models/Admin.js
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  prefs: {
    memberAlerts: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false },
    serverAlerts: { type: Boolean, default: true },
    twoFactor: { type: Boolean, default: false },
    layout: { type: String, default: 'fluid' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model('Admin', AdminSchema);
