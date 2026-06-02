const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const NewsSchema = new mongoose.Schema({
  _id: { type: String, default: () => `news-${uuidv4().slice(0, 8)}` },
  title: { type: String, required: true, trim: true },
  excerpt: { type: String, default: '', trim: true },
  content: { type: String, default: '' },
  category: { type: String, required: true, trim: true },
  categoryEn: { type: String, default: '', trim: true },
  image: { type: String, default: '/images/about_child1.png' },
  tag: { type: String, default: 'ताज़ा', trim: true },
  dateLabel: { type: String, default: '' },
  author: { type: String, default: 'सहायता फाउंडेशन', trim: true },
  commentCount: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false },
  showOnHome: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  publishedAt: { type: Date, default: Date.now },
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

NewsSchema.virtual('id').get(function () {
  return this._id;
});

NewsSchema.statics.buildQuery = function (filters = {}) {
  const query = {};
  if (filters.activeOnly) query.isActive = true;
  if (filters.showOnHome) query.showOnHome = true;
  if (filters.featuredOnly) query.featured = true;
  if (filters.category) query.category = filters.category;
  return query;
};

NewsSchema.statics.getAll = function (filters = {}) {
  const query = this.buildQuery(filters);
  let q = this.find(query).sort({ order: 1, publishedAt: -1 });
  if (filters.limit) q = q.limit(filters.limit);
  return q.exec();
};

NewsSchema.statics.clearOtherFeatured = async function (exceptId) {
  const filter = exceptId ? { _id: { $ne: exceptId } } : {};
  await this.updateMany(filter, { featured: false, updatedAt: new Date() }).exec();
};

NewsSchema.statics.createArticle = async function (payload) {
  if (payload.featured) {
    await this.clearOtherFeatured();
  }
  const article = new this({
    title: payload.title,
    excerpt: payload.excerpt || '',
    content: payload.content || '',
    category: payload.category,
    categoryEn: payload.categoryEn || '',
    image: payload.image || '/images/about_child1.png',
    tag: payload.tag || 'ताज़ा',
    dateLabel: payload.dateLabel || '',
    author: payload.author || 'सहायता फाउंडेशन',
    commentCount: payload.commentCount !== undefined ? Number(payload.commentCount) : 0,
    featured: Boolean(payload.featured),
    showOnHome: Boolean(payload.showOnHome),
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    order: payload.order !== undefined ? Number(payload.order) : 0,
    publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : new Date(),
  });
  return article.save();
};

NewsSchema.statics.updateArticle = async function (id, payload) {
  if (payload.featured) {
    await this.clearOtherFeatured(id);
  }
  const update = { ...payload, updatedAt: new Date() };
  delete update.id;
  if (update.publishedAt) update.publishedAt = new Date(update.publishedAt);
  if (update.commentCount !== undefined) {
    update.commentCount = Number(update.commentCount) || 0;
  }
  return this.findByIdAndUpdate(id, update, { new: true }).exec();
};

NewsSchema.statics.toggleActive = async function (id) {
  const article = await this.findOne({ _id: id }).exec();
  if (!article) return null;
  article.isActive = !article.isActive;
  article.updatedAt = new Date();
  return article.save();
};

NewsSchema.statics.deleteArticle = function (id) {
  return this.findByIdAndDelete(id).exec();
};

NewsSchema.statics.reorder = async function (orderedIds) {
  for (let i = 0; i < orderedIds.length; i++) {
    await this.findByIdAndUpdate(orderedIds[i], { order: i, updatedAt: new Date() }).exec();
  }
  return this.find().sort({ order: 1 }).exec();
};

module.exports = mongoose.model('News', NewsSchema);
