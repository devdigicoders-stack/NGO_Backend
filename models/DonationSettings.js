const mongoose = require('mongoose');

const SETTINGS_ID = 'donate-page-settings';

const CauseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  icon: { type: String, default: '💚' },
}, { _id: false });

const TrustBadgeSchema = new mongoose.Schema({
  text: { type: String, required: true },
  icon: { type: String, default: 'shield' },
}, { _id: false });

const ImpactItemSchema = new mongoose.Schema({
  amountLabel: { type: String, required: true },
  impact: { type: String, required: true },
}, { _id: false });

const DonationSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: SETTINGS_ID },
  heroSubtitle: { type: String, default: '✍️ आपका दान किसी की जिंदगी बदल सकता है' },
  heroTitle: { type: String, default: 'दान करें' },
  upiId: { type: String, default: '' },
  upiPayeeName: { type: String, default: '' },
  presetAmounts: { type: [Number], default: [100, 500, 1000, 2500, 5000, 10000] },
  causes: {
    type: [CauseSchema],
    default: () => [
      { id: 'education', label: 'शिक्षा सहायता', icon: '📚' },
      { id: 'health', label: 'स्वास्थ्य सेवा', icon: '🏥' },
      { id: 'food', label: 'पौष्टिक भोजन', icon: '🍱' },
      { id: 'women', label: 'महिला सशक्तिकरण', icon: '👩' },
      { id: 'general', label: 'सामान्य दान', icon: '💚' },
    ],
  },
  trustBadges: {
    type: [TrustBadgeSchema],
    default: () => [
      { text: '100% सुरक्षित भुगतान', icon: 'shield' },
      { text: '80G कर-मुक्ति प्रमाणित', icon: 'award' },
      { text: '50,000+ लाभार्थी', icon: 'users' },
    ],
  },
  impactItems: {
    type: [ImpactItemSchema],
    default: () => [
      { amountLabel: '₹100', impact: '1 बच्चे को 1 महीने की स्टेशनरी' },
      { amountLabel: '₹500', impact: '1 परिवार को 1 सप्ताह का भोजन' },
      { amountLabel: '₹1,000', impact: '1 बच्चे की 1 महीने की शिक्षा' },
      { amountLabel: '₹5,000', impact: '5 बच्चों का स्वास्थ्य परीक्षण' },
    ],
  },
  taxExemptTitle: { type: String, default: '80G कर-मुक्ति' },
  taxExemptDescription: {
    type: String,
    default: 'आपका दान आयकर अधिनियम की धारा 80G के तहत कर-मुक्त है। दान के बाद 80G प्रमाण पत्र ईमेल पर भेजा जाएगा।',
  },
  paymentSteps: {
    type: [String],
    default: () => [
      'अपने UPI ऐप (PhonePe, GPay, Paytm) खोलें',
      'QR कोड स्कैन करें या UPI ID दर्ज करें',
      'राशि confirm करें',
      'भुगतान पूरा करें — रसीद ईमेल पर मिलेगी',
    ],
  },
  formStepBadge: { type: String, default: 'दान राशि चुनें' },
  formStepTitle: { type: String, default: 'आप कितना दान करना चाहते हैं?' },
  trustPanelTitle: { type: String, default: 'आपका दान सुरक्षित है' },
  impactPanelTitle: { type: String, default: 'आपके दान का प्रभाव' },
  updatedAt: { type: Date, default: Date.now },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      return ret;
    },
  },
});

DonationSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findById(SETTINGS_ID).exec();
  if (!settings) {
    settings = await this.create({ _id: SETTINGS_ID });
  }
  return settings;
};

DonationSettingsSchema.statics.updateSettings = async function (payload) {
  const update = { ...payload, updatedAt: new Date() };
  delete update.id;
  if (update.presetAmounts) {
    update.presetAmounts = update.presetAmounts.map((n) => Number(n)).filter((n) => n > 0);
  }
  return this.findByIdAndUpdate(
    SETTINGS_ID,
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).exec();
};

module.exports = mongoose.model('DonationSettings', DonationSettingsSchema);
