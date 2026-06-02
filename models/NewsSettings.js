const mongoose = require('mongoose');

const SETTINGS_ID = 'news-section-settings';

const NewsSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: SETTINGS_ID },
  blogSectionSubtitle: {
    type: String,
    default: 'ज़रूरतमंदों को दान देना शुरू करें',
  },
  blogSectionTitlePrefix: {
    type: String,
    default: 'हमारे नवीनतम ',
  },
  blogSectionTitleHighlight: {
    type: String,
    default: 'समाचार',
  },
  blogSectionTitleSuffix: {
    type: String,
    default: ' और प्रेरणादायक लेख',
  },
  blogSectionCtaText: {
    type: String,
    default: 'सभी लेख देखें',
  },
  homeDisplayLimit: { type: Number, default: 3 },
  newsPageHeroTitle: {
    type: String,
    default: 'ताज़ा समाचार',
  },
  newsPageHeroSubtitle: {
    type: String,
    default: '✍️ जरूरतमंदों की सेवा में समर्पित',
  },
  updatedAt: { type: Date, default: Date.now },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      return ret;
    },
  },
});

NewsSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findById(SETTINGS_ID).exec();
  if (!settings) {
    settings = await this.create({ _id: SETTINGS_ID });
  }
  return settings;
};

NewsSettingsSchema.statics.updateSettings = async function (payload) {
  const update = {
    blogSectionSubtitle: payload.blogSectionSubtitle,
    blogSectionTitlePrefix: payload.blogSectionTitlePrefix,
    blogSectionTitleHighlight: payload.blogSectionTitleHighlight,
    blogSectionTitleSuffix: payload.blogSectionTitleSuffix,
    blogSectionCtaText: payload.blogSectionCtaText,
    homeDisplayLimit: payload.homeDisplayLimit !== undefined
      ? Number(payload.homeDisplayLimit)
      : 3,
    newsPageHeroTitle: payload.newsPageHeroTitle,
    newsPageHeroSubtitle: payload.newsPageHeroSubtitle,
    updatedAt: new Date(),
  };
  return this.findByIdAndUpdate(
    SETTINGS_ID,
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).exec();
};

module.exports = mongoose.model('NewsSettings', NewsSettingsSchema);
