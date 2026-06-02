// ─────────────────────────────────────────────────────────────
// config/index.js  —  Central configuration for the entire app
// ─────────────────────────────────────────────────────────────
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const config = {
  // Server
  // Server configuration – pulled from .env
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // CORS — allowed frontend origins (from .env, comma-separated)
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:5174'],

  // Data directory (JSON file storage)
  DATA_DIR: path.join(__dirname, '..', 'data'),

  // API versioning prefix
  API_PREFIX: process.env.API_PREFIX || '/api',
  SERVER_URL: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5002}`,
  DB_URI: process.env.DB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'sadhu_laxmi_trust_jwt_secret_key_2026',
};

module.exports = config;
