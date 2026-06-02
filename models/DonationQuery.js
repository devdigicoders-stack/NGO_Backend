const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const STATUSES = ['pending', 'in_progress', 'resolved', 'closed'];

const DonationQuerySchema = new mongoose.Schema({
  _id: { type: String, default: () => `dq-${uuidv4().slice(0, 8)}` },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, default: '', trim: true },
  address: { type: String, default: '', trim: true },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: STATUSES, default: 'pending' },
  adminNotes: { type: String, default: '' },
  source: { type: String, default: 'about_page', trim: true },
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

DonationQuerySchema.virtual('id').get(function () {
  return this._id;
});

DonationQuerySchema.statics.STATUSES = STATUSES;

DonationQuerySchema.statics.buildQuery = function (filters = {}) {
  const query = {};
  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }
  if (filters.search) {
    const re = new RegExp(filters.search, 'i');
    query.$or = [
      { email: re },
      { phone: re },
      { address: re },
      { message: re },
    ];
  }
  return query;
};

DonationQuerySchema.statics.getAll = function (filters = {}) {
  const query = this.buildQuery(filters);
  return this.find(query).sort({ createdAt: -1 }).exec();
};

DonationQuerySchema.statics.getStats = async function () {
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

DonationQuerySchema.statics.createQuery = function (payload) {
  const doc = new this({
    email: payload.email,
    phone: payload.phone || '',
    address: payload.address || '',
    message: payload.message,
    source: payload.source || 'about_page',
  });
  return doc.save();
};

DonationQuerySchema.statics.updateQuery = function (id, payload) {
  const update = { ...payload, updatedAt: new Date() };
  delete update.id;
  return this.findByIdAndUpdate(id, update, { new: true }).exec();
};

DonationQuerySchema.statics.deleteQuery = function (id) {
  return this.findByIdAndDelete(id).exec();
};

module.exports = mongoose.model('DonationQuery', DonationQuerySchema);
