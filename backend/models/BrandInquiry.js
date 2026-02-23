const mongoose = require('mongoose');

const BrandInquirySchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true
  },
  brandName: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    default: ''
  },
  budgetRange: {
    type: String,
    enum: ['Under ₹5K', '₹5K–₹15K', '₹15K–₹50K', '₹50K–₹1L', 'Above ₹1L', 'To be discussed'],
    required: true
  },
  campaignType: {
    type: [String],
    enum: ['Reel', 'Story', 'Post', 'YouTube Video', 'Blog', 'Live', 'Multiple'],
    required: true
  },
  timeline: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  attachmentUrl: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Fashion', 'Beauty', 'Tech', 'Food', 'Travel', 'Fitness', 'Finance', 'Education', 'FMCG', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['New', 'Reviewing', 'Negotiating', 'Accepted', 'Rejected', 'Closed'],
    default: 'New'
  },
  dealValue: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  autoReplySent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
BrandInquirySchema.index({ creatorId: 1, status: 1 });
BrandInquirySchema.index({ creatorId: 1, createdAt: -1 });

module.exports = mongoose.model('BrandInquiry', BrandInquirySchema);
