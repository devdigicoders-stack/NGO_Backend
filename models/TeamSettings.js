const mongoose = require('mongoose');

const SETTINGS_ID = 'team-section-settings';

const TeamSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: SETTINGS_ID },
  sectionSubtitle: {
    type: String,
    default: 'ज़रूरतमंदों को दान देना शुरू करें',
  },
  sectionTitle: {
    type: String,
    default: 'हमारे समर्पित स्वयंसेवक दल से मिलें',
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

TeamSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findById(SETTINGS_ID).exec();
  if (!settings) {
    settings = await this.create({ _id: SETTINGS_ID });
  }
  return settings;
};

TeamSettingsSchema.statics.updateSettings = async function (payload) {
  const update = {
    sectionSubtitle: payload.sectionSubtitle,
    sectionTitle: payload.sectionTitle,
    updatedAt: new Date(),
  };
  return this.findByIdAndUpdate(
    SETTINGS_ID,
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).exec();
};

module.exports = mongoose.model('TeamSettings', TeamSettingsSchema);
