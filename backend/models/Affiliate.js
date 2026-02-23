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
    enum: ['Amazon', 'Flipkart', 'Meesho', 'Myntra', 'Ajio', 'Nykaa', 'Custom', 'Other'],
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
    default: 0,
    comment: 'Creator manually inputs earnings'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  utmSource: { type: String, default: '' },
  utmMedium: { type: String, default: '' },
  utmCampaign: { type: String, default: '' }
}, {
  timestamps: true
});

AffiliateLinkSchema.index({ creatorId: 1 });
AffiliateLinkSchema.index({ slug: 1 }, { unique: true });

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
  ip: {
    type: String,
    default: ''
  },
  device: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet', 'unknown'],
    default: 'unknown'
  },
  browser: {
    type: String,
    default: ''
  },
  os: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  referrer: {
    type: String,
    default: ''
  },
  hour: {
    type: Number, // 0-23 for heatmap
    default: 0
  }
}, {
  timestamps: false
});

ClickAnalyticsSchema.index({ linkId: 1, timestamp: -1 });
ClickAnalyticsSchema.index({ creatorId: 1, timestamp: -1 });

const AffiliateLink = mongoose.model('AffiliateLink', AffiliateLinkSchema);
const ClickAnalytics = mongoose.model('ClickAnalytics', ClickAnalyticsSchema);

module.exports = { AffiliateLink, ClickAnalytics };
