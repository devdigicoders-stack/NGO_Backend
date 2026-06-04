/**
 * Migration script: Convert base64 photos in registrations to actual files
 * Run: node migrate_photos.js
 */
const mongoose = require('./node_modules/mongoose');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const DB_URI = "mongodb+srv://digicodersdevelopment_db_user:KoJGvdKsGU9IQQvk@cluster0.9ssqshr.mongodb.net/ngo?retryWrites=true&w=majority";
const UPLOAD_DIR = path.join(__dirname, 'uploads', 'registrations');

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(DB_URI);
  console.log('Connected!\n');

  const Registration = mongoose.model('Registration', new mongoose.Schema({
    regNumber: String,
    orgId: String,
    formData: mongoose.Schema.Types.Mixed,
    createdAt: Date
  }), 'registrations');

  // Ensure upload dir exists
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const regs = await Registration.find({});
  let converted = 0;
  let skipped = 0;

  for (const reg of regs) {
    const photo = reg.formData?.photo || '';

    // Only process base64 images
    if (!photo.startsWith('data:image/')) {
      skipped++;
      continue;
    }

    try {
      // Parse base64
      const matches = photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches) { skipped++; continue; }

      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const ext = mimeType.includes('png') ? '.png' : mimeType.includes('gif') ? '.gif' : mimeType.includes('webp') ? '.webp' : '.jpg';
      const filename = `registrations_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
      const filePath = path.join(UPLOAD_DIR, filename);

      // Write file
      fs.writeFileSync(filePath, buffer);
      const url = `/uploads/registrations/${filename}`;

      // Update document using updateOne (avoids schema validation issues)
      await Registration.updateOne(
        { _id: reg._id },
        { $set: { 'formData.photo': url } }
      );

      console.log(`✅ [${reg.regNumber}] Base64 → ${url}`);
      converted++;
    } catch (err) {
      console.error(`❌ [${reg.regNumber}] Error: ${err.message}`);
    }
  }

  console.log(`\nMigration done! Converted: ${converted}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
