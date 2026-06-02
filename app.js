// ─────────────────────────────────────────────────────────────
// app.js  —  Express application factory
//
// Creates and configures the Express app.
// Kept separate from server.js so it can be easily tested.
// ─────────────────────────────────────────────────────────────
const express      = require('express');
const path         = require('path');
const cors         = require('cors');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const { CORS_ORIGINS, API_PREFIX } = require('./config');
const { ensureUploadDirs } = require('./config/upload');
const routes       = require('./routes');
const notFound     = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

ensureUploadDirs();

const app = express();

// ── 1. Security / CORS ──────────────────────────────────────
app.use(cors({
  origin:         CORS_ORIGINS,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:    true,   // required for cross-origin cookies
}));

// ── 1b. Cookie parser (for HTTPOnly session tokens) ──────────
app.use(cookieParser());

// ── 2. Request logging ───────────────────────────────────────
// 'dev' format: METHOD URL STATUS RESPONSE_TIME
app.use(morgan('dev'));

// ── 3. Body parsers ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));

// ── 4. Static uploads (local images saved by backend) ─────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── 5. API routes ────────────────────────────────────────────
app.use(API_PREFIX, routes);

// ── 6. Root route (basic info) ───────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    name:    'NGO Backend API',
    version: '1.0.0',
    docs:    `Hit ${API_PREFIX}/health for status`,
  });
});

// ── 7. 404 handler (must come after all routes) ──────────────
app.use(notFound);

// ── 8. Global error handler (must be last) ───────────────────
app.use(errorHandler);

module.exports = app;
