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

const cloudinary = require('cloudinary').v2;

let cloudinaryConfigured = false;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  cloudinaryConfigured = true;
}

/**
 * Save image buffer locally and optionally to Cloudinary
 * @returns {Promise<{ url: string, path: string, filename: string, category: string }>}
 */
async function saveImageBuffer({ buffer, category = 'general', originalName = 'image.jpg', mimeType }) {
  const safeCategory = normalizeCategory(category);
  const detectedMime = validateBuffer(buffer, mimeType);
  const filename = buildFilename(safeCategory, detectedMime, originalName);
  
  // 1. Save locally first
  const categoryDir = path.join(UPLOAD_ROOT, safeCategory);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }
  const localFilePath = path.join(categoryDir, filename);
  const localUrl = `${PUBLIC_UPLOAD_PATH}/${safeCategory}/${filename}`;
  
  fs.writeFileSync(localFilePath, buffer);

  // 2. Try Cloudinary if configured
  if (cloudinaryConfigured) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `ngo/${safeCategory}` },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
      
      return {
        url: result.secure_url,
        path: result.secure_url,
        filename: result.public_id,
        category: safeCategory
      };
    } catch (err) {
      console.error('Cloudinary upload failed, falling back to local storage:', err.message);
    }
  }

  // 3. Fallback to local URL
  return {
    url: localUrl,
    path: localUrl,
    filename: filename,
    category: safeCategory
  };
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

async function deleteFileByUrl(url) {
  if (!url) return false;
  
  if (url.includes('res.cloudinary.com')) {
    try {
      const uploadIndex = url.indexOf('/upload/');
      if (uploadIndex !== -1) {
          const afterUpload = url.substring(uploadIndex + 8);
          const parts = afterUpload.split('/');
          parts.shift(); // remove version
          const withoutExt = parts.join('/').replace(/\.[^/.]+$/, "");
          await cloudinary.uploader.destroy(withoutExt);
          return true;
      }
    } catch (e) {
      console.error('Cloudinary delete error:', e);
      return false;
    }
  }

  if (!url.startsWith(PUBLIC_UPLOAD_PATH)) return false;
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
