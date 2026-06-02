const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const {
  UPLOAD_ROOT,
  ALLOWED_MIME_TYPES,
  MIME_TO_EXT,
  MAX_FILE_SIZE,
  PUBLIC_UPLOAD_PATH,
  normalizeCategory,
  ensureUploadDirs,
} = require('../config/upload');

ensureUploadDirs();

function extFromFilename(filename) {
  const ext = path.extname(filename || '').toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    return ext === '.jpeg' ? '.jpg' : ext;
  }
  return '';
}

function detectMime(buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'image/jpeg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'image/gif';
  if (buffer[4] === 0x66 && buffer[5] === 0x74) return 'image/webp';
  return null;
}

function validateBuffer(buffer, mimeType) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid file data');
  }
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  const detected = mimeType || detectMime(buffer);
  if (!detected || !ALLOWED_MIME_TYPES.has(detected)) {
    throw new Error('Only JPG, PNG, GIF, and WEBP images are allowed');
  }
  return detected;
}

function buildFilename(category, mimeType, originalName) {
  const ext = extFromFilename(originalName) || MIME_TO_EXT[mimeType] || '.jpg';
  const random = crypto.randomBytes(4).toString('hex');
  return `${category}_${Date.now()}_${random}${ext}`;
}

/**
 * Save image buffer to backend/uploads/{category}/
 * @returns {{ url: string, path: string, filename: string, category: string }}
 */
function saveImageBuffer({ buffer, category = 'general', originalName = 'image.jpg', mimeType }) {
  const safeCategory = normalizeCategory(category);
  const validMime = validateBuffer(buffer, mimeType);
  const filename = buildFilename(safeCategory, validMime, originalName);
  const dir = path.join(UPLOAD_ROOT, safeCategory);
  const absolutePath = path.join(dir, filename);

  ensureUploadDirs();
  fs.writeFileSync(absolutePath, buffer);

  const url = `${PUBLIC_UPLOAD_PATH}/${safeCategory}/${filename}`;
  return { url, path: absolutePath, filename, category: safeCategory };
}

function parseBase64Input(base64Data) {
  const matches = String(base64Data).match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 image format');
  }
  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  return { buffer, mimeType };
}

function deleteFileByUrl(url) {
  if (!url || !url.startsWith(PUBLIC_UPLOAD_PATH)) return false;
  const relative = url.replace(PUBLIC_UPLOAD_PATH, '').replace(/^\//, '');
  const absolutePath = path.join(UPLOAD_ROOT, relative);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
    return true;
  }
  return false;
}

module.exports = {
  saveImageBuffer,
  parseBase64Input,
  deleteFileByUrl,
  ensureUploadDirs,
};
