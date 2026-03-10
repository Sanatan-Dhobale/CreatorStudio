const mongoose = require('mongoose');

const AffiliateLinkSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  platform: {
    type: String,
    enum: ['Amazon', 'Flipkart', 'Meesho', 'Myntra', 'Ajio', 'Nykaa', 'YouTube', 'Twitter', 'Instagram', 'Spotify', 'TikTok', 'Custom', 'Other'],
    default: 'Other'
  },
  category: {
    type: String,
    default: 'General'
  },
  totalClicks: {
    type: Number,
    default: 0
  },
  revenueManual: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  utmSource:   { type: String, default: '' },
  utmMedium:   { type: String, default: '' },
  utmCampaign: { type: String, default: '' },

  // ─── Open in App ──────────────────────────────────────────────────────────
  openInApp: {
    type: Boolean,
    default: false
  },
  // Cached deep link info (resolved once on creation, avoids re-parsing every redirect)
  deepLinkPlatform: {
    type: String,
    default: ''
  },
  deepLinkIos: {
    type: String,
    default: ''
  },
  deepLinkAndroid: {
    type: String,
    default: ''
  },

  // Deep link analytics
  appOpenCount:      { type: Number, default: 0 }, // successful app opens
  fallbackOpenCount: { type: Number, default: 0 }  // opened in browser (app not installed)
}, {
  timestamps: true
});

AffiliateLinkSchema.index({ creatorId: 1 });
AffiliateLinkSchema.index({ slug: 1 }, { unique: true });

// ─── Click Analytics ──────────────────────────────────────────────────────
const ClickAnalyticsSchema = new mongoose.Schema({
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AffiliateLink',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip:       { type: String, default: '' },
  device:   { type: String, enum: ['mobile', 'desktop', 'tablet', 'unknown'], default: 'unknown' },
  browser:  { type: String, default: '' },
  os:       { type: String, default: '' },
  country:  { type: String, default: 'Unknown' },
  referrer: { type: String, default: '' },
  hour:     { type: Number, default: 0 }, // 0–23 for heatmap

  // Deep link tracking
  openedInApp: {
    type: Boolean,
    default: false   // true = native app, false = browser fallback
  },
  deepLinkAttempted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: false
});

ClickAnalyticsSchema.index({ linkId: 1, timestamp: -1 });
ClickAnalyticsSchema.index({ creatorId: 1, timestamp: -1 });

const AffiliateLink  = mongoose.model('AffiliateLink', AffiliateLinkSchema);
const ClickAnalytics = mongoose.model('ClickAnalytics', ClickAnalyticsSchema);

module.exports = { AffiliateLink, ClickAnalytics };
