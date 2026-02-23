const mongoose = require('mongoose');

const MediaKitSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true,
    unique: true
  },
  followers: {
    instagram: { type: Number, default: 0 },
    youtube: { type: Number, default: 0 },
    twitter: { type: Number, default: 0 },
    tiktok: { type: Number, default: 0 }
  },
  engagementRate: {
    type: Number,
    default: 0,
    comment: 'Percentage, e.g. 4.5 for 4.5%'
  },
  avgViews: {
    reels: { type: Number, default: 0 },
    stories: { type: Number, default: 0 },
    posts: { type: Number, default: 0 }
  },
  niche: {
    type: String,
    default: ''
  },
  demographics: {
    ageGroups: {
      '13-17': { type: Number, default: 0 },
      '18-24': { type: Number, default: 0 },
      '25-34': { type: Number, default: 0 },
      '35-44': { type: Number, default: 0 },
      '45+': { type: Number, default: 0 }
    },
    topLocations: [{ city: String, percentage: Number }],
    genderSplit: {
      male: { type: Number, default: 50 },
      female: { type: Number, default: 50 }
    }
  },
  brandsWorkedWith: [{
    name: String,
    logoUrl: String,
    year: String
  }],
  services: [{
    name: String,
    price: Number,
    description: String
  }],
  achievements: [String],
  theme: {
    type: String,
    enum: ['minimal', 'bold', 'gradient', 'elegant'],
    default: 'minimal'
  },
  publicSlug: {
    type: String,
    unique: true,
    sparse: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MediaKit', MediaKitSchema);
