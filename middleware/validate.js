// ─────────────────────────────────────────────────────────────
// middleware/validate.js  —  express-validator rule sets
//
// Reusable validation chains for request bodies.
// Used inside route definitions before controller is called.
// ─────────────────────────────────────────────────────────────
const { body } = require('express-validator');

/** Validation rules for creating a new Program */
const createProgramRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Program title (शीर्षक) is required')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),

  body('tag')
    .trim()
    .notEmpty().withMessage('Category tag is required')
    .isLength({ max: 50 }).withMessage('Tag must be under 50 characters'),

  body('desc')
    .trim()
    .notEmpty().withMessage('Description (विवरण) is required')
    .isLength({ max: 1000 }).withMessage('Description must be under 1000 characters'),

  body('percentage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Percentage must be between 0 and 100'),

  body('tagBg')
    .optional()
    .matches(/^#([A-Fa-f0-9]{3,6})$/).withMessage('tagBg must be a valid hex color'),

  body('tagColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{3,6})$/).withMessage('tagColor must be a valid hex color'),

  body('accentColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{3,6})$/).withMessage('accentColor must be a valid hex color'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

/** Validation rules for updating a Program (same rules, all optional) */
const updateProgramRules = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),

  body('tag')
    .optional()
    .trim()
    .notEmpty().withMessage('Tag cannot be empty')
    .isLength({ max: 50 }).withMessage('Tag must be under 50 characters'),

  body('desc')
    .optional()
    .trim()
    .notEmpty().withMessage('Description cannot be empty')
    .isLength({ max: 1000 }).withMessage('Description must be under 1000 characters'),

  body('percentage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Percentage must be between 0 and 100'),

  body('tagBg')
    .optional()
    .matches(/^#([A-Fa-f0-9]{3,6})$/).withMessage('tagBg must be a valid hex color'),

  body('tagColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{3,6})$/).withMessage('tagColor must be a valid hex color'),

  body('accentColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{3,6})$/).withMessage('accentColor must be a valid hex color'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

const optionalUrl = (field) =>
  body(field)
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 }).withMessage(`${field} must be under 500 characters`);

/** Validation rules for creating a Team Member */
const createTeamMemberRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name (नाम) is required')
    .isLength({ max: 200 }).withMessage('Name must be under 200 characters'),

  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Designation must be under 100 characters'),

  body('image')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Image path must be under 500 characters'),

  optionalUrl('facebook'),
  optionalUrl('twitter'),
  optionalUrl('instagram'),
  optionalUrl('other'),

  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('order must be a non-negative integer'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

/** Validation rules for updating a Team Member */
const updateTeamMemberRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 200 }).withMessage('Name must be under 200 characters'),

  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Designation must be under 100 characters'),

  body('image')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Image path must be under 500 characters'),

  optionalUrl('facebook'),
  optionalUrl('twitter'),
  optionalUrl('instagram'),
  optionalUrl('other'),

  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('order must be a non-negative integer'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

/** Validation rules for team section headings */
const updateTeamSettingsRules = [
  body('sectionTitle')
    .optional()
    .trim()
    .notEmpty().withMessage('Section title cannot be empty')
    .isLength({ max: 300 }).withMessage('Section title must be under 300 characters'),

  body('sectionSubtitle')
    .optional()
    .trim()
    .notEmpty().withMessage('Section subtitle cannot be empty')
    .isLength({ max: 300 }).withMessage('Section subtitle must be under 300 characters'),
];

/** Validation rules for creating a Testimonial */
const createTestimonialRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name (नाम) is required')
    .isLength({ max: 200 }).withMessage('Name must be under 200 characters'),

  body('role')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Role must be under 150 characters'),

  body('quote')
    .trim()
    .notEmpty().withMessage('Quote (प्रतिक्रिया) is required')
    .isLength({ max: 2000 }).withMessage('Quote must be under 2000 characters'),

  body('image')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Image path must be under 500 characters'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('highlight')
    .optional()
    .isBoolean().withMessage('highlight must be a boolean'),

  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('order must be a non-negative integer'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

/** Validation rules for updating a Testimonial */
const updateTestimonialRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 200 }).withMessage('Name must be under 200 characters'),

  body('role')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Role must be under 150 characters'),

  body('quote')
    .optional()
    .trim()
    .notEmpty().withMessage('Quote cannot be empty')
    .isLength({ max: 2000 }).withMessage('Quote must be under 2000 characters'),

  body('image')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Image path must be under 500 characters'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('highlight')
    .optional()
    .isBoolean().withMessage('highlight must be a boolean'),

  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('order must be a non-negative integer'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

/** Validation rules for testimonials section headings */
const updateTestimonialSettingsRules = [
  body('sectionSubtitle')
    .optional()
    .trim()
    .notEmpty().withMessage('Section subtitle cannot be empty')
    .isLength({ max: 300 }).withMessage('Section subtitle must be under 300 characters'),

  body('sectionTitlePrefix')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title prefix must be under 200 characters'),

  body('sectionTitleHighlight')
    .optional()
    .trim()
    .notEmpty().withMessage('Highlighted word cannot be empty')
    .isLength({ max: 100 }).withMessage('Highlight must be under 100 characters'),

  body('sectionTitleSuffix')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title suffix must be under 200 characters'),
];

/** Validation rules for creating News */
const createNewsRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 300 }).withMessage('Title must be under 300 characters'),

  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Excerpt must be under 2000 characters'),

  body('content')
    .optional()
    .trim()
    .isLength({ max: 10000 }).withMessage('Content must be under 10000 characters'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ max: 100 }).withMessage('Category must be under 100 characters'),

  body('categoryEn').optional().trim().isLength({ max: 100 }),
  body('image').optional().trim().isLength({ max: 500 }),
  body('tag').optional().trim().isLength({ max: 50 }),
  body('dateLabel').optional().trim().isLength({ max: 50 }),
  body('author').optional().trim().isLength({ max: 150 }),

  body('commentCount')
    .optional()
    .isInt({ min: 0 }).withMessage('commentCount must be non-negative'),

  body('featured').optional().isBoolean(),
  body('showOnHome').optional().isBoolean(),
  body('order').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
];

const updateNewsRules = [
  body('title').optional().trim().notEmpty().isLength({ max: 300 }),
  body('excerpt').optional().trim().isLength({ max: 2000 }),
  body('content').optional().trim().isLength({ max: 10000 }),
  body('category').optional().trim().notEmpty().isLength({ max: 100 }),
  body('categoryEn').optional().trim().isLength({ max: 100 }),
  body('image').optional().trim().isLength({ max: 500 }),
  body('tag').optional().trim().isLength({ max: 50 }),
  body('dateLabel').optional().trim().isLength({ max: 50 }),
  body('author').optional().trim().isLength({ max: 150 }),
  body('commentCount').optional().isInt({ min: 0 }),
  body('featured').optional().isBoolean(),
  body('showOnHome').optional().isBoolean(),
  body('order').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
];

const updateNewsSettingsRules = [
  body('blogSectionSubtitle').optional().trim().isLength({ max: 300 }),
  body('blogSectionTitlePrefix').optional().trim().isLength({ max: 200 }),
  body('blogSectionTitleHighlight').optional().trim().isLength({ max: 100 }),
  body('blogSectionTitleSuffix').optional().trim().isLength({ max: 200 }),
  body('blogSectionCtaText').optional().trim().isLength({ max: 100 }),
  body('homeDisplayLimit').optional().isInt({ min: 1, max: 12 }),
  body('newsPageHeroTitle').optional().trim().isLength({ max: 200 }),
  body('newsPageHeroSubtitle').optional().trim().isLength({ max: 300 }),
];

const createDonationQueryRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email is required')
    .isLength({ max: 200 }).withMessage('Email must be under 200 characters'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 30 }).withMessage('Phone must be under 30 characters'),

  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Address must be under 500 characters'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 3000 }).withMessage('Message must be under 3000 characters'),

  body('source')
    .optional()
    .trim()
    .isLength({ max: 50 }),
];

const updateDonationQueryRules = [
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),

  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Admin notes must be under 2000 characters'),
];

const updateDonationQuerySettingsRules = [
  body('sectionTitle').optional().trim().isLength({ max: 300 }),
  body('sectionSubtitle').optional().trim().isLength({ max: 300 }),
  body('emailLabel').optional().trim().isLength({ max: 100 }),
  body('emailPlaceholder').optional().trim().isLength({ max: 200 }),
  body('phoneLabel').optional().trim().isLength({ max: 100 }),
  body('phonePlaceholder').optional().trim().isLength({ max: 200 }),
  body('addressLabel').optional().trim().isLength({ max: 100 }),
  body('addressPlaceholder').optional().trim().isLength({ max: 200 }),
  body('messageLabel').optional().trim().isLength({ max: 100 }),
  body('messagePlaceholder').optional().trim().isLength({ max: 300 }),
  body('submitButtonText').optional().trim().isLength({ max: 100 }),
  body('successMessage').optional().trim().isLength({ max: 500 }),
];

const createEnquiryRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 150 }).withMessage('Name must be under 150 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email is required')
    .isLength({ max: 200 }),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 30 }),

  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ max: 300 }).withMessage('Subject must be under 300 characters'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 3000 }),

  body('source')
    .optional()
    .trim()
    .isLength({ max: 50 }),
];

const createDonationRules = [
  body('amount')
    .isInt({ min: 1 }).withMessage('Amount must be at least ₹1'),

  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 150 }),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 30 }),

  body('causeId').optional().trim().isLength({ max: 50 }),
  body('causeLabel').optional().trim().isLength({ max: 100 }),
  body('paymentMethod').optional().trim().isLength({ max: 30 }),
];

const updateDonationRules = [
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled']),

  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 2000 }),
];

const updateDonationSettingsRules = [
  body('heroSubtitle').optional().trim().isLength({ max: 300 }),
  body('heroTitle').optional().trim().isLength({ max: 100 }),
  body('upiId').optional().trim().isLength({ max: 100 }),
  body('upiPayeeName').optional().trim().isLength({ max: 150 }),
  body('presetAmounts').optional().isArray(),
  body('causes').optional().isArray(),
  body('trustBadges').optional().isArray(),
  body('impactItems').optional().isArray(),
  body('taxExemptTitle').optional().trim().isLength({ max: 200 }),
  body('taxExemptDescription').optional().trim().isLength({ max: 1000 }),
  body('paymentSteps').optional().isArray(),
  body('formStepBadge').optional().trim().isLength({ max: 100 }),
  body('formStepTitle').optional().trim().isLength({ max: 200 }),
  body('trustPanelTitle').optional().trim().isLength({ max: 200 }),
  body('impactPanelTitle').optional().trim().isLength({ max: 200 }),
];

const updateEnquiryRules = [
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'resolved', 'closed']),

  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 2000 }),
];

module.exports = {
  createProgramRules,
  updateProgramRules,
  createTeamMemberRules,
  updateTeamMemberRules,
  updateTeamSettingsRules,
  createTestimonialRules,
  updateTestimonialRules,
  updateTestimonialSettingsRules,
  createNewsRules,
  updateNewsRules,
  updateNewsSettingsRules,
  createDonationQueryRules,
  updateDonationQueryRules,
  updateDonationQuerySettingsRules,
  createEnquiryRules,
  updateEnquiryRules,
  createDonationRules,
  updateDonationRules,
  updateDonationSettingsRules,
};
