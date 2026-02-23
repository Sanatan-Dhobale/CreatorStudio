const express = require('express');
const router = express.Router();
const MediaKit = require('../models/MediaKit');
const Creator = require('../models/Creator');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET /api/media-kit/me — Get creator's media kit
router.get('/me', protect, async (req, res) => {
  try {
    let mediaKit = await MediaKit.findOne({ creatorId: req.creator._id });
    if (!mediaKit) {
      mediaKit = await MediaKit.create({
        creatorId: req.creator._id,
        publicSlug: `${req.creator.username}-${uuidv4().substring(0, 6)}`
      });
    }
    res.json({ success: true, mediaKit });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/media-kit/me — Update media kit
router.put('/me', protect, async (req, res) => {
  try {
    const mediaKit = await MediaKit.findOneAndUpdate(
      { creatorId: req.creator._id },
      req.body,
      { new: true, upsert: true }
    );
    res.json({ success: true, mediaKit });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/media-kit/public/:slug — Public media kit
router.get('/public/:slug', async (req, res) => {
  try {
    const mediaKit = await MediaKit.findOne({ publicSlug: req.params.slug, isPublic: true })
      .populate('creatorId', 'name username bio profilePhoto niche instagramHandle');

    if (!mediaKit) return res.status(404).json({ success: false, error: 'Media kit not found or not public' });

    res.json({ success: true, mediaKit });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/media-kit/download — Generate and download PDF
router.get('/download', protect, async (req, res) => {
  try {
    const mediaKit = await MediaKit.findOne({ creatorId: req.creator._id });
    const creator = req.creator;

    if (!mediaKit) return res.status(404).json({ success: false, error: 'Media kit not found. Please set it up first.' });

    // Generate HTML for PDF
    const html = generateMediaKitHTML(creator, mediaKit);

    // Use puppeteer to generate PDF
    let puppeteer;
    try {
      puppeteer = require('puppeteer');
    } catch (e) {
      return res.status(500).json({ success: false, error: 'PDF generation service unavailable. Please install puppeteer.' });
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${creator.username}-media-kit.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function generateMediaKitHTML(creator, kit) {
  const themes = {
    minimal: { bg: '#FFFFFF', accent: '#6C63FF', text: '#1A1A2E', secondary: '#F8F9FF', card: '#FFFFFF' },
    bold: { bg: '#1A1A2E', accent: '#FF6B6B', text: '#FFFFFF', secondary: '#2D2D4E', card: '#2D2D4E' },
    gradient: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#FFD700', text: '#FFFFFF', secondary: 'rgba(255,255,255,0.15)', card: 'rgba(255,255,255,0.15)' },
    elegant: { bg: '#FDF8F0', accent: '#C9A227', text: '#2C2C2C', secondary: '#FAF0E0', card: '#FFFFFF' }
  };

  const theme = themes[kit.theme] || themes.minimal;
  const followers = kit.followers?.instagram?.toLocaleString() || '0';
  const engagementRate = kit.engagementRate || 0;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', sans-serif;
      background: ${typeof theme.bg === 'string' && theme.bg.includes('gradient') ? '#667eea' : theme.bg};
      color: ${theme.text};
      width: 794px;
      min-height: 1123px;
    }
    .page { padding: 48px; min-height: 1123px; }
    .header { display: flex; align-items: center; gap: 28px; margin-bottom: 40px; }
    .avatar { width: 90px; height: 90px; border-radius: 50%; background: ${theme.accent}; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 700; color: white; }
    .creator-info h1 { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; }
    .creator-info p { opacity: 0.7; font-size: 14px; margin-top: 4px; }
    .badge { display: inline-block; background: ${theme.accent}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: ${theme.secondary}; border-radius: 12px; padding: 20px; text-align: center; }
    .stat-card .value { font-size: 26px; font-weight: 700; color: ${theme.accent}; font-family: 'Playfair Display', serif; }
    .stat-card .label { font-size: 11px; opacity: 0.6; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin-bottom: 12px; font-weight: 600; }
    .demographics { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .brands { display: flex; flex-wrap: wrap; gap: 8px; }
    .brand-chip { background: ${theme.secondary}; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 500; }
    .services-table { width: 100%; border-collapse: collapse; }
    .services-table th { text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; opacity: 0.5; border-bottom: 1px solid ${theme.secondary}; }
    .services-table td { padding: 12px 10px; border-bottom: 1px solid ${theme.secondary}; font-size: 13px; }
    .price { color: ${theme.accent}; font-weight: 700; }
    .footer { text-align: center; padding-top: 32px; opacity: 0.4; font-size: 11px; }
    .contact-bar { background: ${theme.accent}; border-radius: 12px; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; margin-top: 24px; }
    .contact-bar span { color: white; font-size: 13px; }
    .divider { height: 1px; background: ${theme.secondary}; margin: 24px 0; opacity: 0.5; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="avatar">${creator.name.charAt(0).toUpperCase()}</div>
      <div class="creator-info">
        <h1>${creator.name}</h1>
        <p>@${creator.instagramHandle || creator.username} • ${kit.niche || creator.niche}</p>
        <span class="badge">Content Creator</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="value">${Number(followers).toLocaleString()}</div>
        <div class="label">Instagram Followers</div>
      </div>
      <div class="stat-card">
        <div class="value">${engagementRate}%</div>
        <div class="label">Engagement Rate</div>
      </div>
      <div class="stat-card">
        <div class="value">${(kit.avgViews?.reels || 0).toLocaleString()}</div>
        <div class="label">Avg Reel Views</div>
      </div>
      <div class="stat-card">
        <div class="value">${(kit.avgViews?.stories || 0).toLocaleString()}</div>
        <div class="label">Avg Story Views</div>
      </div>
    </div>

    <div class="divider"></div>

    ${creator.bio ? `
    <div class="section">
      <div class="section-title">About</div>
      <p style="font-size: 14px; line-height: 1.7; opacity: 0.8;">${creator.bio}</p>
    </div>
    ` : ''}

    <div class="demographics">
      <div class="section">
        <div class="section-title">Audience Age Groups</div>
        ${Object.entries(kit.demographics?.ageGroups || {}).map(([age, pct]) => `
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
            <span>${age}</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:80px; height:4px; background:${theme.secondary}; border-radius:2px;">
                <div style="width:${pct}%; height:100%; background:${theme.accent}; border-radius:2px;"></div>
              </div>
              <span>${pct}%</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="section">
        <div class="section-title">Gender Split</div>
        <div style="font-size:13px;">
          <div style="margin-bottom:8px; display:flex; justify-content:space-between;">
            <span>Female</span><span style="color:${theme.accent}; font-weight:700;">${kit.demographics?.genderSplit?.female || 50}%</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Male</span><span style="color:${theme.accent}; font-weight:700;">${kit.demographics?.genderSplit?.male || 50}%</span>
          </div>
        </div>
        <div class="section-title" style="margin-top:16px;">Top Locations</div>
        ${(kit.demographics?.topLocations || []).map(loc => `
          <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
            <span>${loc.city}</span><span>${loc.percentage}%</span>
          </div>
        `).join('') || '<p style="font-size:13px; opacity:0.5;">Not specified</p>'}
      </div>
    </div>

    ${(kit.brandsWorkedWith || []).length > 0 ? `
    <div class="section">
      <div class="section-title">Brands Worked With</div>
      <div class="brands">
        ${kit.brandsWorkedWith.map(b => `<div class="brand-chip">${b.name}</div>`).join('')}
      </div>
    </div>
    ` : ''}

    ${(kit.services || []).length > 0 ? `
    <div class="section">
      <div class="section-title">Services & Rates</div>
      <table class="services-table">
        <thead>
          <tr><th>Service</th><th>Description</th><th>Starting Price</th></tr>
        </thead>
        <tbody>
          ${kit.services.map(s => `
            <tr>
              <td><strong>${s.name}</strong></td>
              <td style="opacity:0.7;">${s.description || '—'}</td>
              <td class="price">₹${(s.price || 0).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <div class="contact-bar">
      <span>📧 ${creator.email}</span>
      ${creator.instagramHandle ? `<span>📸 @${creator.instagramHandle}</span>` : ''}
      <span>🌐 creatorhub.app/${creator.username}</span>
    </div>

    <div class="footer">Generated with CreatorHub • ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</div>
  </div>
</body>
</html>`;
}

module.exports = router;
