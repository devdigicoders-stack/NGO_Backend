const mongoose = require('mongoose');

const SETTINGS_ID = 'donation-query-form-settings';

const DonationQuerySettingsSchema = new mongoose.Schema({
  _id: { type: String, default: SETTINGS_ID },
  sectionTitle: { type: String, default: 'दान के लिए हमें संदेश भेजें' },
  sectionSubtitle: { type: String, default: '' },
  emailLabel: { type: String, default: 'ईमेल' },
  emailPlaceholder: { type: String, default: 'आपका ईमेल' },
  phoneLabel: { type: String, default: 'फ़ोन' },
  phonePlaceholder: { type: String, default: 'आपका फ़ोन नंबर' },
  addressLabel: { type: String, default: 'पता' },
  addressPlaceholder: { type: String, default: 'आपका पता' },
  messageLabel: { type: String, default: 'संदेश' },
  messagePlaceholder: { type: String, default: 'दान या सहयोग के बारे में लिखें' },
  submitButtonText: { type: String, default: 'संदेश भेजें' },
  successMessage: {
    type: String,
    default: 'धन्यवाद! आपका संदेश हमें मिल गया है। हम जल्द ही आपसे संपर्क करेंगे।',
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

DonationQuerySettingsSchema.statics.getSettings = async function () {
  let settings = await this.findById(SETTINGS_ID).exec();
  if (!settings) {
    settings = await this.create({ _id: SETTINGS_ID });
  }
  return settings;
};

DonationQuerySettingsSchema.statics.updateSettings = async function (payload) {
  const allowed = [
    'sectionTitle',
    'sectionSubtitle',
    'emailLabel',
    'emailPlaceholder',
    'phoneLabel',
    'phonePlaceholder',
    'addressLabel',
    'addressPlaceholder',
    'messageLabel',
    'messagePlaceholder',
    'submitButtonText',
    'successMessage',
  ];
  const update = { updatedAt: new Date() };
  allowed.forEach((key) => {
    if (payload[key] !== undefined) update[key] = payload[key];
  });
  return this.findByIdAndUpdate(
    SETTINGS_ID,
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).exec();
};

module.exports = mongoose.model('DonationQuerySettings', DonationQuerySettingsSchema);
