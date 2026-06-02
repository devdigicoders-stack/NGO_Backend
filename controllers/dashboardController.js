const Program = require('../models/Program');
const TeamMember = require('../models/TeamMember');
const Testimonial = require('../models/Testimonial');
const News = require('../models/News');
const Donation = require('../models/Donation');
const Enquiry = require('../models/Enquiry');
const DonationQuery = require('../models/DonationQuery');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toMonthKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const aggregateByDay = async (Model, days) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const rows = await Model.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
  ]);

  const map = {};
  rows.forEach((r) => { map[r._id] = r.count; });
  return map;
};

const aggregateByMonth = async (Model, months) => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  start.setMonth(start.getMonth() - (months - 1));

  const rows = await Model.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
  ]);

  const map = {};
  rows.forEach((r) => { map[r._id] = r.count; });
  return map;
};

const buildWeeklyChart = (donationsMap, enquiriesMap, queriesMap) => {
  const points = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    const key = toDateKey(date);
    points.push({
      name: DAY_LABELS[date.getDay()],
      donations: donationsMap[key] || 0,
      enquiries: enquiriesMap[key] || 0,
      queries: queriesMap[key] || 0,
    });
  }
  return points;
};

const buildMonthlyChart = (donationsMap, enquiriesMap, queriesMap) => {
  const points = [];
  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - i);
    const key = toMonthKey(date);
    points.push({
      name: MONTH_LABELS[date.getMonth()],
      donations: donationsMap[key] || 0,
      enquiries: enquiriesMap[key] || 0,
      queries: queriesMap[key] || 0,
    });
  }
  return points;
};

const mapDonationActivity = (doc) => ({
  id: doc.id || doc._id,
  type: 'donation',
  typeLabel: 'Donation',
  title: doc.name,
  subtitle: doc.email,
  status: doc.status,
  amount: doc.amount,
  createdAt: doc.createdAt,
  path: '/donations',
});

const mapEnquiryActivity = (doc) => ({
  id: doc.id || doc._id,
  type: 'enquiry',
  typeLabel: 'Contact Enquiry',
  title: doc.name,
  subtitle: doc.subject || doc.email,
  status: doc.status,
  createdAt: doc.createdAt,
  path: '/enquiries',
});

const mapQueryActivity = (doc) => ({
  id: doc.id || doc._id,
  type: 'donation_query',
  typeLabel: 'Donation Query',
  title: doc.email,
  subtitle: doc.phone || doc.address || 'About page form',
  status: doc.status,
  createdAt: doc.createdAt,
  path: '/queries',
});

const countPair = async (Model) => {
  const [total, active] = await Promise.all([
    Model.countDocuments(),
    Model.countDocuments({ isActive: true }),
  ]);
  return { total, active, inactive: total - active };
};

const dashboardController = {
  async getOverview(req, res) {
    try {
      const [
        programs,
        team,
        testimonials,
        news,
        donationStats,
        enquiryStats,
        queryStats,
        recentDonations,
        recentEnquiries,
        recentQueries,
        weeklyDonations,
        weeklyEnquiries,
        weeklyQueries,
        monthlyDonations,
        monthlyEnquiries,
        monthlyQueries,
      ] = await Promise.all([
        countPair(Program),
        countPair(TeamMember),
        countPair(Testimonial),
        countPair(News),
        Donation.getStats(),
        Enquiry.getStats(),
        DonationQuery.getStats(),
        Donation.find().sort({ createdAt: -1 }).limit(5).lean(),
        Enquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
        DonationQuery.find().sort({ createdAt: -1 }).limit(5).lean(),
        aggregateByDay(Donation, 7),
        aggregateByDay(Enquiry, 7),
        aggregateByDay(DonationQuery, 7),
        aggregateByMonth(Donation, 12),
        aggregateByMonth(Enquiry, 12),
        aggregateByMonth(DonationQuery, 12),
      ]);

      const pendingDonations = donationStats.pending || 0;
      const pendingEnquiries = enquiryStats.pending || 0;
      const pendingQueries = queryStats.pending || 0;
      const totalPending = pendingDonations + pendingEnquiries + pendingQueries;

      const totalSubmissions =
        (donationStats.total || 0) +
        (enquiryStats.total || 0) +
        (queryStats.total || 0);

      const totalContent =
        programs.total + team.total + testimonials.total + news.total;

      const modules = [
        {
          key: 'programs',
          label: 'Programs',
          path: '/programs',
          total: programs.total,
          active: programs.active,
          pending: programs.inactive,
          metricLabel: 'Active on site',
        },
        {
          key: 'team',
          label: 'Team Members',
          path: '/team',
          total: team.total,
          active: team.active,
          pending: team.inactive,
          metricLabel: 'Active members',
        },
        {
          key: 'testimonials',
          label: 'Testimonials',
          path: '/testimonials',
          total: testimonials.total,
          active: testimonials.active,
          pending: testimonials.inactive,
          metricLabel: 'Published',
        },
        {
          key: 'news',
          label: 'News Articles',
          path: '/news',
          total: news.total,
          active: news.active,
          pending: news.inactive,
          metricLabel: 'Published',
        },
        {
          key: 'donations',
          label: 'Donations',
          path: '/donations',
          total: donationStats.total || 0,
          active: donationStats.confirmed || 0,
          pending: pendingDonations,
          metricLabel: 'Confirmed',
          extra: { confirmedAmount: donationStats.confirmedAmount || 0 },
        },
        {
          key: 'queries',
          label: 'Donation Queries',
          path: '/queries',
          total: queryStats.total || 0,
          active: queryStats.resolved || 0,
          pending: pendingQueries,
          metricLabel: 'Resolved',
        },
        {
          key: 'enquiries',
          label: 'Contact Enquiries',
          path: '/enquiries',
          total: enquiryStats.total || 0,
          active: enquiryStats.resolved || 0,
          pending: pendingEnquiries,
          metricLabel: 'Resolved',
        },
      ];

      const recentActivity = [
        ...recentDonations.map(mapDonationActivity),
        ...recentEnquiries.map(mapEnquiryActivity),
        ...recentQueries.map(mapQueryActivity),
      ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      const summary = {
        confirmedDonationAmount: donationStats.confirmedAmount || 0,
        totalDonations: donationStats.total || 0,
        pendingDonations,
        totalEnquiries: enquiryStats.total || 0,
        pendingEnquiries,
        totalQueries: queryStats.total || 0,
        pendingQueries,
        totalPending,
        totalSubmissions,
        totalContent,
        activeContent: programs.active + team.active + testimonials.active + news.active,
      };

      return sendSuccess(res, {
        admin: { name: req.admin?.name || 'Admin' },
        summary,
        modules,
        charts: {
          weekly: buildWeeklyChart(weeklyDonations, weeklyEnquiries, weeklyQueries),
          monthly: buildMonthlyChart(monthlyDonations, monthlyEnquiries, monthlyQueries),
        },
        recentActivity,
      }, 'Dashboard overview fetched');
    } catch (err) {
      console.error('Dashboard overview error:', err);
      return sendError(res, 'Failed to load dashboard overview', 500);
    }
  },
};

module.exports = dashboardController;
