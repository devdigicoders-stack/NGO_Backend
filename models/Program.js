// backend/models/Program.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ProgramSchema = new mongoose.Schema({
  _id: { type: String, default: () => `prog-${uuidv4().slice(0, 8)}` },
  title: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String, default: '/images/about_child1.png' },
  tag: { type: String, default: '' },
  tagBg: { type: String, default: '#1a5c38' },
  tagColor: { type: String, default: '#fff' },
  raised: { type: String, default: '₹0' },
  goal: { type: String, default: '₹1,00,000' },
  percentage: { type: Number, default: 0 },
  accentColor: { type: String, default: '#1a5c38' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id;
      return ret;
    }
  }
});

// Virtual getter for "id" mapped to "_id"
ProgramSchema.virtual('id').get(function () {
  return this._id;
});

// Static helpers matching the old file‑based API
ProgramSchema.statics.getAll = function () {
  return this.find().sort({ order: 1 }).exec();
};

ProgramSchema.statics.getActive = function () {
  return this.find({ isActive: true }).sort({ order: 1 }).exec();
};

// Note: Mongoose already provides a built‑in findById(). No custom override needed.

ProgramSchema.statics.createProgram = async function (payload) {
  const prog = new this({
    _id: payload.id || undefined, // Mongoose default will generate if undefined
    title: payload.title,
    desc: payload.desc,
    image: payload.image || '/images/about_child1.png',
    tag: payload.tag || '',
    tagBg: payload.tagBg || '#1a5c38',
    tagColor: payload.tagColor || '#fff',
    raised: payload.raised || '₹0',
    goal: payload.goal || '₹1,00,000',
    percentage: Number(payload.percentage) || 0,
    accentColor: payload.accentColor || '#1a5c38',
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    order: payload.order !== undefined ? Number(payload.order) : 0,
  });
  return prog.save();
};

ProgramSchema.statics.updateProgram = function (id, payload) {
  const update = { ...payload, updatedAt: new Date() };
  return this.findByIdAndUpdate(id, update, { new: true }).exec();
};

ProgramSchema.statics.toggleActive = async function (id) {
  const prog = await this.findOne({ _id: id }).exec();
  if (!prog) return null;
  prog.isActive = !prog.isActive;
  prog.updatedAt = new Date();
  return prog.save();
};

ProgramSchema.statics.deleteProgram = function (id) {
  return this.findByIdAndDelete(id).exec();
};

ProgramSchema.statics.reorder = async function (orderedIds) {
  // Update the `order` field based on the array position
  for (let i = 0; i < orderedIds.length; i++) {
    await this.findByIdAndUpdate(orderedIds[i], { order: i }).exec();
  }
  // Return the freshly ordered list
  return this.find().sort({ order: 1 }).exec();
};

module.exports = mongoose.model('Program', ProgramSchema);
