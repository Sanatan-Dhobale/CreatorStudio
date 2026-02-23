const express = require('express');
const router = express.Router();
const UAParser = require('ua-parser-js');
const { v4: uuidv4 } = require('uuid');
const { AffiliateLink, ClickAnalytics } = require('../models/Affiliate');
const { protect } = require('../middleware/auth');

// POST /api/affiliate/links — Create new link
router.post('/links', protect, async (req, res) => {
  try {
    const { title, originalUrl, slug, platform, category, utmSource, utmMedium, utmCampaign } = req.body;

    const finalSlug = slug || `${req.creator.username}-${uuidv4().substring(0, 8)}`;

    const existingSlug = await AffiliateLink.findOne({ slug: finalSlug });
    if (existingSlug) return res.status(400).json({ success: false, error: 'Slug already taken. Please choose another.' });

    const link = await AffiliateLink.create({
      creatorId: req.creator._id,
      title,
      originalUrl,
      slug: finalSlug,
      platform: platform || 'Other',
      category: category || 'General',
      utmSource, utmMedium, utmCampaign
    });

    res.status(201).json({ success: true, link });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/affiliate/links — Get all links with click stats
router.get('/links', protect, async (req, res) => {
  try {
    const links = await AffiliateLink.find({ creatorId: req.creator._id }).sort({ createdAt: -1 });

    // Attach 7-day click data for each link
    const linksWithStats = await Promise.all(links.map(async (link) => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentClicks = await ClickAnalytics.countDocuments({
        linkId: link._id,
        timestamp: { $gte: sevenDaysAgo }
      });
      return { ...link.toObject(), recentClicks };
    }));

    res.json({ success: true, links: linksWithStats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/affiliate/links/:id/analytics — Detailed analytics
router.get('/links/:id/analytics', protect, async (req, res) => {
  try {
    const link = await AffiliateLink.findOne({ _id: req.params.id, creatorId: req.creator._id });
    if (!link) return res.status(404).json({ success: false, error: 'Link not found' });

    const { days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [dailyClicks, deviceBreakdown, hourlyHeatmap, countryBreakdown] = await Promise.all([
      // Daily clicks
      ClickAnalytics.aggregate([
        { $match: { linkId: link._id, timestamp: { $gte: since } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          clicks: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]),

      // Device breakdown
      ClickAnalytics.aggregate([
        { $match: { linkId: link._id, timestamp: { $gte: since } } },
        { $group: { _id: '$device', count: { $sum: 1 } } }
      ]),

      // Hourly heatmap
      ClickAnalytics.aggregate([
        { $match: { linkId: link._id, timestamp: { $gte: since } } },
        { $group: { _id: '$hour', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),

      // Country breakdown
      ClickAnalytics.aggregate([
        { $match: { linkId: link._id, timestamp: { $gte: since } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      link,
      analytics: { dailyClicks, deviceBreakdown, hourlyHeatmap, countryBreakdown }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/affiliate/dashboard — Overview stats
router.get('/dashboard', protect, async (req, res) => {
  try {
    const links = await AffiliateLink.find({ creatorId: req.creator._id });
    const linkIds = links.map(l => l._id);

    const totalClicks = links.reduce((sum, l) => sum + l.totalClicks, 0);
    const totalRevenue = links.reduce((sum, l) => sum + l.revenueManual, 0);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recentClicks, topLinks] = await Promise.all([
      ClickAnalytics.countDocuments({ creatorId: req.creator._id, timestamp: { $gte: sevenDaysAgo } }),
      AffiliateLink.find({ creatorId: req.creator._id }).sort({ totalClicks: -1 }).limit(5)
    ]);

    res.json({
      success: true,
      stats: { totalLinks: links.length, totalClicks, recentClicks, totalRevenue },
      topLinks
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/affiliate/links/:id — Update link or revenue
router.put('/links/:id', protect, async (req, res) => {
  try {
    const link = await AffiliateLink.findOneAndUpdate(
      { _id: req.params.id, creatorId: req.creator._id },
      req.body,
      { new: true }
    );
    if (!link) return res.status(404).json({ success: false, error: 'Link not found' });
    res.json({ success: true, link });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/affiliate/links/:id
router.delete('/links/:id', protect, async (req, res) => {
  try {
    await AffiliateLink.findOneAndDelete({ _id: req.params.id, creatorId: req.creator._id });
    await ClickAnalytics.deleteMany({ linkId: req.params.id });
    res.json({ success: true, message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
