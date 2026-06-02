// backend/config/db.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { DB_URI, NODE_ENV } = require('./index');

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('╔══════════════════════════════════════════════╗');
    console.log(`║   MongoDB Connected  —  ${NODE_ENV.toUpperCase()}      ║`);
    console.log('╚══════════════════════════════════════════════╝');

    // ── Migrate programs from JSON if DB is empty ────────────
    const Program = require('../models/Program');
    const count = await Program.countDocuments();
    if (count === 0) {
      const jsonPath = path.join(__dirname, '..', 'data', 'programs.json');
      if (fs.existsSync(jsonPath)) {
        console.log('🔄 No programs found. Migrating from programs.json...');
        try {
          const programs = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          for (let i = 0; i < programs.length; i++) {
            await Program.createProgram({ ...programs[i], order: i });
          }
          console.log(`✅ Migrated ${programs.length} programs into MongoDB!`);
        } catch (e) {
          console.error('⚠️ Program migration failed:', e);
        }
      }
    }

    // ── Migrate team from JSON if DB is empty ────────────────
    const TeamMember = require('../models/TeamMember');
    const TeamSettings = require('../models/TeamSettings');
    const teamCount = await TeamMember.countDocuments();
    if (teamCount === 0) {
      const teamJsonPath = path.join(__dirname, '..', 'data', 'team.json');
      if (fs.existsSync(teamJsonPath)) {
        console.log('🔄 No team members found. Migrating from team.json...');
        try {
          const teamData = JSON.parse(fs.readFileSync(teamJsonPath, 'utf8'));
          await TeamSettings.updateSettings({
            sectionTitle: teamData.sectionTitle,
            sectionSubtitle: teamData.sectionSubtitle,
          });
          const members = teamData.members || [];
          for (let i = 0; i < members.length; i++) {
            await TeamMember.createMember({ ...members[i], order: i });
          }
          console.log(`✅ Migrated ${members.length} team members into MongoDB!`);
        } catch (e) {
          console.error('⚠️ Team migration failed:', e);
        }
      }
    }

    // ── Migrate testimonials from JSON if DB is empty ─────────
    const Testimonial = require('../models/Testimonial');
    const TestimonialSettings = require('../models/TestimonialSettings');
    const testimonialCount = await Testimonial.countDocuments();
    if (testimonialCount === 0) {
      const testimonialsJsonPath = path.join(__dirname, '..', 'data', 'testimonials.json');
      if (fs.existsSync(testimonialsJsonPath)) {
        console.log('🔄 No testimonials found. Migrating from testimonials.json...');
        try {
          const data = JSON.parse(fs.readFileSync(testimonialsJsonPath, 'utf8'));
          await TestimonialSettings.updateSettings({
            sectionSubtitle: data.sectionSubtitle,
            sectionTitlePrefix: data.sectionTitlePrefix,
            sectionTitleHighlight: data.sectionTitleHighlight,
            sectionTitleSuffix: data.sectionTitleSuffix,
          });
          const items = data.items || [];
          for (let i = 0; i < items.length; i++) {
            await Testimonial.createTestimonial({ ...items[i], order: i });
          }
          console.log(`✅ Migrated ${items.length} testimonials into MongoDB!`);
        } catch (e) {
          console.error('⚠️ Testimonials migration failed:', e);
        }
      }
    }

    // ── Migrate news from JSON if DB is empty ──────────────────
    const News = require('../models/News');
    const NewsSettings = require('../models/NewsSettings');
    const newsCount = await News.countDocuments();
    if (newsCount === 0) {
      const newsJsonPath = path.join(__dirname, '..', 'data', 'news.json');
      if (fs.existsSync(newsJsonPath)) {
        console.log('🔄 No news articles found. Migrating from news.json...');
        try {
          const data = JSON.parse(fs.readFileSync(newsJsonPath, 'utf8'));
          await NewsSettings.updateSettings({
            blogSectionSubtitle: data.blogSectionSubtitle,
            blogSectionTitlePrefix: data.blogSectionTitlePrefix,
            blogSectionTitleHighlight: data.blogSectionTitleHighlight,
            blogSectionTitleSuffix: data.blogSectionTitleSuffix,
            blogSectionCtaText: data.blogSectionCtaText,
            homeDisplayLimit: data.homeDisplayLimit,
            newsPageHeroTitle: data.newsPageHeroTitle,
            newsPageHeroSubtitle: data.newsPageHeroSubtitle,
          });
          const articles = data.articles || [];
          for (let i = 0; i < articles.length; i++) {
            await News.createArticle({ ...articles[i], order: i });
          }
          console.log(`✅ Migrated ${articles.length} news articles into MongoDB!`);
        } catch (e) {
          console.error('⚠️ News migration failed:', e);
        }
      }
    }

    // ── Migrate donation settings from JSON if not seeded ───
    const DonationSettings = require('../models/DonationSettings');
    const existingDonationSettings = await DonationSettings.findById('donate-page-settings').exec();
    if (!existingDonationSettings) {
      const donationsJsonPath = path.join(__dirname, '..', 'data', 'donations.json');
      if (fs.existsSync(donationsJsonPath)) {
        console.log('🔄 Seeding donation page settings from donations.json...');
        try {
          const data = JSON.parse(fs.readFileSync(donationsJsonPath, 'utf8'));
          await DonationSettings.updateSettings(data);
          console.log('✅ Donation settings seeded!');
        } catch (e) {
          console.error('⚠️ Donation settings migration failed:', e);
        }
      }
    }

    // ── Auto-seed default Admin account if none exists ───────
    const Admin = require('../models/Admin');
    const bcrypt = require('bcryptjs');
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('🔄 No admin accounts found. Seeding default admin...');
      const hashed = await bcrypt.hash('admin123', 12);
      await Admin.create({
        name: 'Parveen Singh Chauhan',
        email: 'parveen@ngo.org',
        password: hashed,
        phone: '+91 98765 43210',
        location: 'Delhi, India',
        bio: 'Founding member coordinating regional development initiatives and operations across Northern regions.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        prefs: {
          memberAlerts: true,
          weeklyDigest: false,
          serverAlerts: true,
          twoFactor: false,
          layout: 'fluid'
        }
      });
      console.log('✅ Default admin seeded: parveen@ngo.org / admin123');
    }

  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = { connectDB };
