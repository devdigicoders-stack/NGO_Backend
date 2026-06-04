const path = require('path');
const fs = require('fs');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

const UPLOAD_CATEGORIES = ['team', 'programs', 'profiles', 'testimonials', 'news', 'general', 'registrations', 'donations'];

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function ensureUploadDirs() {
  if (!fs.existsSync(UPLOAD_ROOT)) {
    fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
  }
  UPLOAD_CATEGORIES.forEach((category) => {
    const dir = path.join(UPLOAD_ROOT, category);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function normalizeCategory(category) {
  const value = String(category || 'general').toLowerCase().trim();
  return UPLOAD_CATEGORIES.includes(value) ? value : 'general';
}

module.exports = {
  UPLOAD_ROOT,
  UPLOAD_CATEGORIES,
  ALLOWED_MIME_TYPES,
  MIME_TO_EXT,
  MAX_FILE_SIZE,
  PUBLIC_UPLOAD_PATH: '/uploads',
  ensureUploadDirs,
  normalizeCategory,
};
