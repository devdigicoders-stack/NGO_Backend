const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const TestimonialSchema = new mongoose.Schema({
  _id: { type: String, default: () => `tmnl-${uuidv4().slice(0, 8)}` },
  name: { type: String, required: true, trim: true },
  role: { type: String, default: '', trim: true },
  image: { type: String, default: '/images/team1.png' },
  quote: { type: String, required: true, trim: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  highlight: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      return ret;
    },
  },
});

TestimonialSchema.virtual('id').get(function () {
  return this._id;
});

TestimonialSchema.statics.getAll = function () {
  return this.find().sort({ order: 1 }).exec();
};

TestimonialSchema.statics.getActive = function () {
  return this.find({ isActive: true }).sort({ order: 1 }).exec();
};

TestimonialSchema.statics.clearOtherHighlights = async function (exceptId) {
  const filter = exceptId ? { _id: { $ne: exceptId } } : {};
  await this.updateMany(filter, { highlight: false, updatedAt: new Date() }).exec();
};

TestimonialSchema.statics.createTestimonial = async function (payload) {
  if (payload.highlight) {
    await this.clearOtherHighlights();
  }
  const item = new this({
    name: payload.name,
    role: payload.role || '',
    image: payload.image || '/images/team1.png',
    quote: payload.quote,
    rating: Math.min(5, Math.max(1, Number(payload.rating) || 5)),
    highlight: Boolean(payload.highlight),
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    order: payload.order !== undefined ? Number(payload.order) : 0,
  });
  return item.save();
};

TestimonialSchema.statics.updateTestimonial = async function (id, payload) {
  if (payload.highlight) {
    await this.clearOtherHighlights(id);
  }
  const update = { ...payload, updatedAt: new Date() };
  delete update.id;
  if (update.rating !== undefined) {
    update.rating = Math.min(5, Math.max(1, Number(update.rating) || 5));
  }
  return this.findByIdAndUpdate(id, update, { new: true }).exec();
};

TestimonialSchema.statics.toggleActive = async function (id) {
  const item = await this.findOne({ _id: id }).exec();
  if (!item) return null;
  item.isActive = !item.isActive;
  item.updatedAt = new Date();
  return item.save();
};

TestimonialSchema.statics.deleteTestimonial = function (id) {
  return this.findByIdAndDelete(id).exec();
};

TestimonialSchema.statics.reorder = async function (orderedIds) {
  for (let i = 0; i < orderedIds.length; i++) {
    await this.findByIdAndUpdate(orderedIds[i], { order: i, updatedAt: new Date() }).exec();
  }
  return this.find().sort({ order: 1 }).exec();
};

module.exports = mongoose.model('Testimonial', TestimonialSchema);
