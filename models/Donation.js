const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const STATUSES = ['pending', 'confirmed', 'cancelled'];

const DonationSchema = new mongoose.Schema({
  _id: { type: String, default: () => `don-${uuidv4().slice(0, 8)}` },
  amount: { type: Number, required: true, min: 1 },
  causeId: { type: String, default: 'general', trim: true },
  causeLabel: { type: String, default: '', trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, default: '', trim: true, lowercase: true },
  phone: { type: String, default: '', trim: true },
  status: { type: String, enum: STATUSES, default: 'pending' },
  adminNotes: { type: String, default: '' },
  paymentMethod: { type: String, default: 'upi', trim: true },
  screenshotUrl: { type: String, default: '' },
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

DonationSchema.virtual('id').get(function () {
  return this._id;
});

DonationSchema.statics.STATUSES = STATUSES;

DonationSchema.statics.buildQuery = function (filters = {}) {
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
      { causeLabel: re },
    ];
  }
  return query;
};

DonationSchema.statics.getAll = function (filters = {}) {
  const query = this.buildQuery(filters);
  return this.find(query).sort({ createdAt: -1 }).exec();
};

DonationSchema.statics.getStats = async function () {
  const [statusRows, totalAmount] = await Promise.all([
    this.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    this.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const stats = { total: 0, pending: 0, confirmed: 0, cancelled: 0, confirmedAmount: 0 };
  statusRows.forEach((r) => {
    if (stats[r._id] !== undefined) stats[r._id] = r.count;
    stats.total += r.count;
  });
  stats.confirmedAmount = totalAmount[0]?.total || 0;
  return stats;
};

DonationSchema.statics.createDonation = function (payload) {
  const doc = new this({
    amount: Number(payload.amount),
    causeId: payload.causeId || 'general',
    causeLabel: payload.causeLabel || '',
    name: payload.name,
    email: payload.email,
    phone: payload.phone || '',
    paymentMethod: payload.paymentMethod || 'upi',
  });
  return doc.save();
};

DonationSchema.statics.updateDonation = function (id, payload) {
  const update = { ...payload, updatedAt: new Date() };
  delete update.id;
  return this.findByIdAndUpdate(id, update, { new: true }).exec();
};

DonationSchema.statics.deleteDonation = function (id) {
  return this.findByIdAndDelete(id).exec();
};

module.exports = mongoose.model('Donation', DonationSchema);
