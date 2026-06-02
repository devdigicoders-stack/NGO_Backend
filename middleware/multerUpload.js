const multer = require('multer');
const { MAX_FILE_SIZE } = require('../config/upload');

const memoryStorage = multer.memoryStorage();

const uploadSingle = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(req, file, cb) {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
}).single('file');

function handleMulterUpload(req, res, next) {
  uploadSingle(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed',
    });
  });
}

module.exports = { handleMulterUpload };
