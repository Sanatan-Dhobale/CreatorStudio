const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const BrandInquiry = require('../models/BrandInquiry');
const Creator = require('../models/Creator');
const { protect } = require('../middleware/auth');
const { sendCreatorNotification, sendBrandAutoReply } = require('../utils/email');

// Multer for file uploads (brief attachments)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/briefs/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|ppt|pptx|png|jpg|jpeg/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF, Doc, PPT, and images allowed'));
  }
});

// POST /api/brand-inquiry/:creatorUsername — Public route (brands submit this)
router.post('/:creatorUsername', upload.single('attachment'), async (req, res) => {
  try {
    const creator = await Creator.findOne({ username: req.params.creatorUsername });
    if (!creator) return res.status(404).json({ success: false, error: 'Creator not found' });

    const {
      brandName, contactPerson, email, phone,
      budgetRange, campaignType, timeline, message, category
    } = req.body;

    const inquiry = await BrandInquiry.create({
      creatorId: creator._id,
      brandName,
      contactPerson,
      email,
      phone: phone || '',
      budgetRange,
      campaignType: Array.isArray(campaignType) ? campaignType : [campaignType],
      timeline,
      message,
      category: category || 'Other',
      attachmentUrl: req.file ? `/uploads/briefs/${req.file.filename}` : ''
    });

    // Send notifications (don't block response on this)
    if (creator.emailNotifications) {
      sendCreatorNotification(creator.email, creator.name, inquiry).catch(console.error);
    }
    sendBrandAutoReply(email, brandName, creator.name).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully! The creator will get back to you shortly.',
      inquiryId: inquiry._id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/brand-inquiry — Get all inquiries for logged-in creator
router.get('/', protect, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const query = { creatorId: req.creator._id };

    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (page - 1) * limit;
    const [inquiries, total] = await Promise.all([
      BrandInquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      BrandInquiry.countDocuments(query)
    ]);

    // Stats
    const stats = await BrandInquiry.aggregate([
      { $match: { creatorId: req.creator._id } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$dealValue' }
      }}
    ]);

    res.json({ success: true, inquiries, total, page: Number(page), stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/brand-inquiry/:id — Update status, add notes, deal value
router.put('/:id', protect, async (req, res) => {
  try {
    const inquiry = await BrandInquiry.findOne({
      _id: req.params.id,
      creatorId: req.creator._id
    });

    if (!inquiry) return res.status(404).json({ success: false, error: 'Inquiry not found' });

    const { status, notes, dealValue } = req.body;
    if (status) inquiry.status = status;
    if (notes !== undefined) inquiry.notes = notes;
    if (dealValue !== undefined) inquiry.dealValue = dealValue;

    await inquiry.save();
    res.json({ success: true, inquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/brand-inquiry/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await BrandInquiry.findOneAndDelete({ _id: req.params.id, creatorId: req.creator._id });
    res.json({ success: true, message: 'Inquiry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/brand-inquiry/export/csv — Export to CSV
router.get('/export/csv', protect, async (req, res) => {
  try {
    const inquiries = await BrandInquiry.find({ creatorId: req.creator._id }).sort({ createdAt: -1 });

    const headers = ['Brand Name', 'Contact', 'Email', 'Budget', 'Campaign Type', 'Status', 'Deal Value', 'Date'];
    const rows = inquiries.map(i => [
      i.brandName, i.contactPerson, i.email, i.budgetRange,
      i.campaignType.join('|'), i.status, i.dealValue,
      new Date(i.createdAt).toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inquiries.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
