const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const STATUSES = ['pending', 'in_progress', 'resolved', 'closed'];

const EnquirySchema = new mongoose.Schema({
  _id: { type: String, default: () => `enq-${uuidv4().slice(0, 8)}` },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, default: '', trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: STATUSES, default: 'pending' },
  adminNotes: { type: String, default: '' },
  source: { type: String, default: 'contact_page', trim: true },
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

EnquirySchema.virtual('id').get(function () {
  return this._id;
});

EnquirySchema.statics.STATUSES = STATUSES;

EnquirySchema.statics.buildQuery = function (filters = {}) {
  const query = {};
  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }
  if (filters.search) {
    const re = new RegExp(filters.search, 'i');
    query.$or = [
      { name: re },
      { email: re },
      { phone: re },
      { subject: re },
      { message: re },
    ];
  }
  return query;
};

EnquirySchema.statics.getAll = function (filters = {}) {
  const query = this.buildQuery(filters);
  return this.find(query).sort({ createdAt: -1 }).exec();
};

EnquirySchema.statics.getStats = async function () {
  const rows = await this.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const stats = { total: 0, pending: 0, in_progress: 0, resolved: 0, closed: 0 };
  rows.forEach((r) => {
    if (stats[r._id] !== undefined) stats[r._id] = r.count;
    stats.total += r.count;
  });
  return stats;
};

EnquirySchema.statics.createEnquiry = function (payload) {
  const doc = new this({
    name: payload.name,
    email: payload.email,
    phone: payload.phone || '',
    subject: payload.subject,
    message: payload.message,
    source: payload.source || 'contact_page',
  });
  return doc.save();
};

EnquirySchema.statics.updateEnquiry = function (id, payload) {
  const update = { ...payload, updatedAt: new Date() };
  delete update.id;
  return this.findByIdAndUpdate(id, update, { new: true }).exec();
};

EnquirySchema.statics.deleteEnquiry = function (id) {
  return this.findByIdAndDelete(id).exec();
};

module.exports = mongoose.model('Enquiry', EnquirySchema);
