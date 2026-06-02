const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const TeamMemberSchema = new mongoose.Schema({
  _id: { type: String, default: () => `team-${uuidv4().slice(0, 8)}` },
  name: { type: String, required: true, trim: true },
  designation: { type: String, default: 'स्वयंसेवक', trim: true },
  image: { type: String, default: '/images/team1.png' },
  facebook: { type: String, default: '' },
  twitter: { type: String, default: '' },
  instagram: { type: String, default: '' },
  other: { type: String, default: '' },
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

TeamMemberSchema.virtual('id').get(function () {
  return this._id;
});

TeamMemberSchema.statics.getAll = function () {
  return this.find().sort({ order: 1 }).exec();
};

TeamMemberSchema.statics.getActive = function () {
  return this.find({ isActive: true }).sort({ order: 1 }).exec();
};

TeamMemberSchema.statics.createMember = async function (payload) {
  const member = new this({
    name: payload.name,
    designation: payload.designation || 'स्वयंसेवक',
    image: payload.image || '/images/team1.png',
    facebook: payload.facebook || '',
    twitter: payload.twitter || '',
    instagram: payload.instagram || '',
    other: payload.other || '',
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    order: payload.order !== undefined ? Number(payload.order) : 0,
  });
  return member.save();
};

TeamMemberSchema.statics.updateMember = function (id, payload) {
  const update = { ...payload, updatedAt: new Date() };
  delete update.id;
  return this.findByIdAndUpdate(id, update, { new: true }).exec();
};

TeamMemberSchema.statics.toggleActive = async function (id) {
  const member = await this.findOne({ _id: id }).exec();
  if (!member) return null;
  member.isActive = !member.isActive;
  member.updatedAt = new Date();
  return member.save();
};

TeamMemberSchema.statics.deleteMember = function (id) {
  return this.findByIdAndDelete(id).exec();
};

TeamMemberSchema.statics.reorder = async function (orderedIds) {
  for (let i = 0; i < orderedIds.length; i++) {
    await this.findByIdAndUpdate(orderedIds[i], { order: i, updatedAt: new Date() }).exec();
  }
  return this.find().sort({ order: 1 }).exec();
};

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
