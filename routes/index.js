// ─────────────────────────────────────────────────────────────
// routes/index.js  —  Root router (mounts all sub-routers)
//
// Add new route modules here as the API grows.
// This file is mounted at API_PREFIX in app.js.
// ─────────────────────────────────────────────────────────────
const express        = require('express');
const router         = express.Router();
const programRoutes  = require('./programRoutes');
const teamRoutes     = require('./teamRoutes');
const testimonialRoutes = require('./testimonialRoutes');
const newsRoutes        = require('./newsRoutes');
const uploadRoutes   = require('./uploadRoutes');
const registrationRoutes = require('./registrationRoutes');
const donationQueryRoutes = require('./donationQueryRoutes');
const enquiryRoutes = require('./enquiryRoutes');
const donationRoutes = require('./donationRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const authRoutes     = require('./authRoutes');

// ── Health check ────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({
    success:   true,
    message:   'NGO Backend API is healthy ✅',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      programs: '/api/programs',
      team: '/api/team',
      testimonials: '/api/testimonials',
      news: '/api/news',
      donationQueries: '/api/donation-queries',
      donationQuerySettings: '/api/donation-queries/settings',
      enquiries: '/api/enquiries',
      donations: '/api/donations',
      upload: '/api/upload (auth required)',
      uploadsStatic: '/uploads/{category}/{filename}',
      avatar: 'POST /api/auth/avatar',
    },
  });
});

// ── Mount sub-routers ────────────────────────────────────────
router.use('/upload', uploadRoutes);
router.use('/programs', programRoutes);
router.use('/team', teamRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/news', newsRoutes);
router.use('/registrations', registrationRoutes);
router.use('/donation-queries', donationQueryRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/donations', donationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/auth', authRoutes);

module.exports = router;
