const mongoose = require('mongoose');

const SETTINGS_ID = 'testimonials-section-settings';

const TestimonialSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: SETTINGS_ID },
  sectionSubtitle: {
    type: String,
    default: 'ज़रूरतमंदों को दान देना शुरू करें',
  },
  sectionTitlePrefix: {
    type: String,
    default: 'हमारे दानदाताओं और ',
  },
  sectionTitleHighlight: {
    type: String,
    default: 'शुभचिंतकों',
  },
  sectionTitleSuffix: {
    type: String,
    default: ' के विचार',
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

TestimonialSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findById(SETTINGS_ID).exec();
  if (!settings) {
    settings = await this.create({ _id: SETTINGS_ID });
  }
  return settings;
};

TestimonialSettingsSchema.statics.updateSettings = async function (payload) {
  const update = {
    sectionSubtitle: payload.sectionSubtitle,
    sectionTitlePrefix: payload.sectionTitlePrefix,
    sectionTitleHighlight: payload.sectionTitleHighlight,
    sectionTitleSuffix: payload.sectionTitleSuffix,
    updatedAt: new Date(),
  };
  return this.findByIdAndUpdate(
    SETTINGS_ID,
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).exec();
};

module.exports = mongoose.model('TestimonialSettings', TestimonialSettingsSchema);
