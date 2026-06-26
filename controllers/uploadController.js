const { sendSuccess, sendError } = require('../utils/apiResponse');
const { saveImageBuffer, parseBase64Input } = require('../utils/uploadService');
const { normalizeCategory } = require('../config/upload');
const { SERVER_URL } = require('../config');

function withFullUrl(result) {
  if (result.url.startsWith('http://') || result.url.startsWith('https://')) {
    return { ...result, fullUrl: result.url };
  }
  return { ...result, fullUrl: `${SERVER_URL}${result.url}` };
}

const uploadController = {
  /**
   * POST /api/upload
   * multipart: file + category
   * JSON: { base64Data, filename, category }
   */
  async uploadImage(req, res) {
    try {
      const category = normalizeCategory(req.body.category);

      if (req.file) {
        const result = await saveImageBuffer({
          buffer: req.file.buffer,
          category,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
        });
        return sendSuccess(res, withFullUrl(result), 'Image uploaded successfully', 201);
      }

      const { base64Data, filename } = req.body;
      if (!base64Data) {
        return sendError(res, 'No file provided. Send multipart file or base64Data.', 400);
      }

      const { buffer, mimeType } = parseBase64Input(base64Data);
      const result = await saveImageBuffer({
        buffer,
        category,
        originalName: filename || 'image.jpg',
        mimeType,
      });

      return sendSuccess(res, withFullUrl(result), 'Image uploaded successfully', 201);
    } catch (err) {
      console.error('Upload error:', err);
      return sendError(res, err.message || 'Failed to upload image', 400);
    }
  },
};

module.exports = uploadController;
