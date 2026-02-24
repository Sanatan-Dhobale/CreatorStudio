const express = require('express');
const router = express.Router();
const MediaKit = require('../models/MediaKit');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const Creator = require('../models/Creator');

// GET /api/media-kit/me
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

// PUT /api/media-kit/me
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

// GET /api/media-kit/public/:slug
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

// GET /api/media-kit/download?token=JWT
// Returns a self-printing HTML page. No Puppeteer needed.
// Token passed as query param because window.open() cannot send Authorization headers.
router.get('/download', async (req, res) => {
  try {
    const token = req.query.token || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).send('<h2 style="font-family:sans-serif;padding:40px">Unauthorized. Please log in again.</h2>');

    const secret = process.env.JWT_SECRET || 'creatorhub_dev_secret_change_in_production_min32chars';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return res.status(401).send('<h2 style="font-family:sans-serif;padding:40px">Session expired. Please log in again.</h2>');
    }

    const creator = await Creator.findById(decoded.id);
    if (!creator) return res.status(404).send('<h2 style="font-family:sans-serif;padding:40px">Creator not found.</h2>');

    const mediaKit = await MediaKit.findOne({ creatorId: creator._id });
    if (!mediaKit) return res.status(404).send('<h2 style="font-family:sans-serif;padding:40px">Media kit not set up yet. Please fill in your details first.</h2>');

    const html = generateMediaKitHTML(creator, mediaKit);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(500).send(`<h2 style="font-family:sans-serif;padding:40px">Error: ${err.message}</h2>`);
  }
});

function generateMediaKitHTML(creator, kit) {
  const themes = {
    minimal:  { bg: '#FFFFFF', accent: '#6C63FF', text: '#1A1A2E', secondary: '#F0F2FF' },
    bold:     { bg: '#1A1A2E', accent: '#FF6B6B', text: '#FFFFFF', secondary: '#2D2D4E' },
    gradient: { bg: '#667eea', accent: '#FFD700', text: '#FFFFFF', secondary: 'rgba(255,255,255,0.18)' },
    elegant:  { bg: '#FDF8F0', accent: '#C9A227', text: '#2C2C2C', secondary: '#FAF0E0' }
  };

  const theme = themes[kit.theme] || themes.minimal;
  const followersRaw  = Number(kit.followers?.instagram) || 0;
  const engagementRate = Number(kit.engagementRate) || 0;
  const reelViews     = Number(kit.avgViews?.reels) || 0;
  const storyViews    = Number(kit.avgViews?.stories) || 0;

  const ageGroupsHTML = Object.entries(kit.demographics?.ageGroups || {})
    .filter(([, pct]) => Number(pct) > 0)
    .map(([age, pct]) => `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:13px;">
        <span style="width:45px;">${age}</span>
        <div style="flex:1;margin:0 10px;height:5px;background:${theme.secondary};border-radius:3px;">
          <div style="width:${Math.min(Number(pct), 100)}%;height:100%;background:${theme.accent};border-radius:3px;"></div>
        </div>
        <span style="font-weight:600;width:32px;text-align:right;">${pct}%</span>
      </div>
    `).join('');

  const locationsHTML = (kit.demographics?.topLocations || [])
    .filter(l => l.city)
    .map(l => `
      <div style="display:flex;justify-content:space-between;font-size:13px;padding:5px 0;border-bottom:1px solid ${theme.secondary};">
        <span>${l.city}</span>
        <span style="font-weight:600;">${l.percentage}%</span>
      </div>
    `).join('') || '<p style="font-size:13px;opacity:0.5;">Not specified</p>';

  const brandsHTML = (kit.brandsWorkedWith || [])
    .filter(b => b.name)
    .map(b => `<span style="display:inline-block;background:${theme.secondary};border-radius:8px;padding:6px 14px;font-size:13px;font-weight:500;margin:4px;">${b.name}</span>`)
    .join('');

  const servicesHTML = (kit.services || [])
    .filter(s => s.name)
    .map(s => `
      <tr>
        <td style="padding:10px;font-weight:600;font-size:13px;border-bottom:1px solid ${theme.secondary};">${s.name}</td>
        <td style="padding:10px;font-size:12px;opacity:0.7;border-bottom:1px solid ${theme.secondary};">${s.description || ''}</td>
        <td style="padding:10px;font-size:13px;font-weight:700;color:${theme.accent};border-bottom:1px solid ${theme.secondary};">Rs.${Number(s.price || 0).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

  const statsCards = [
    { value: followersRaw.toLocaleString('en-IN'), label: 'Instagram Followers' },
    { value: engagementRate + '%',                  label: 'Engagement Rate' },
    { value: reelViews.toLocaleString('en-IN'),     label: 'Avg Reel Views' },
    { value: storyViews.toLocaleString('en-IN'),    label: 'Avg Story Views' },
  ].map(s => `
    <div style="background:${theme.secondary};border-radius:12px;padding:20px;text-align:center;">
      <div style="font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:${theme.accent};">${s.value}</div>
      <div style="font-size:10px;opacity:0.6;margin-top:5px;text-transform:uppercase;letter-spacing:0.5px;">${s.label}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${creator.name} - Media Kit</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', sans-serif;
      background: ${theme.bg};
      color: ${theme.text};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 794px;
      min-height: 1123px;
      margin: 0 auto;
      padding: 48px;
    }
    .save-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${theme.accent};
      color: white;
      border: none;
      padding: 13px 28px;
      border-radius: 10px;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      z-index: 9999;
    }
    .save-btn:hover { opacity: 0.88; }
    .instructions {
      position: fixed;
      top: 68px;
      right: 20px;
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: #888;
      text-align: right;
      line-height: 1.5;
    }
    @media print {
      .save-btn, .instructions { display: none !important; }
      body { background: ${theme.bg} !important; }
      .page { width: 100%; padding: 32px; margin: 0; }
    }
  </style>
</head>
<body>

  <button class="save-btn" onclick="window.print()">Save as PDF</button>
  <div class="instructions">Click "Save as PDF"<br>in the print dialog</div>

  <div class="page">

    <!-- Header -->
    <div style="display:flex;align-items:center;gap:28px;margin-bottom:36px;">
      <div style="width:90px;height:90px;border-radius:50%;background:${theme.accent};display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:700;color:white;flex-shrink:0;">
        ${creator.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <div style="font-family:'Playfair Display',serif;font-size:30px;font-weight:700;margin-bottom:5px;">${creator.name}</div>
        <div style="font-size:14px;opacity:0.65;margin-bottom:10px;">@${creator.instagramHandle || creator.username} &bull; ${kit.niche || creator.niche || 'Creator'}</div>
        <span style="background:${theme.accent};color:white;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;">Content Creator</span>
      </div>
    </div>

    <!-- Stats -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:32px;">
      ${statsCards}
    </div>

    <!-- Divider -->
    <div style="height:1px;background:${theme.secondary};margin-bottom:24px;opacity:0.6;"></div>

    ${creator.bio ? `
    <div style="margin-bottom:24px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;opacity:0.45;font-weight:600;margin-bottom:8px;">About</div>
      <p style="font-size:14px;line-height:1.75;opacity:0.8;">${creator.bio}</p>
    </div>
    ` : ''}

    <!-- Demographics -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:24px;">
      <div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;opacity:0.45;font-weight:600;margin-bottom:12px;">Audience Age Groups</div>
        ${ageGroupsHTML || '<p style="font-size:13px;opacity:0.5;">Not specified</p>'}
      </div>
      <div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;opacity:0.45;font-weight:600;margin-bottom:12px;">Gender Split</div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px;">
          <span>Female</span>
          <span style="font-weight:700;color:${theme.accent};">${kit.demographics?.genderSplit?.female || 50}%</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:20px;">
          <span>Male</span>
          <span style="font-weight:700;color:${theme.accent};">${kit.demographics?.genderSplit?.male || 50}%</span>
        </div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;opacity:0.45;font-weight:600;margin-bottom:8px;">Top Locations</div>
        ${locationsHTML}
      </div>
    </div>

    ${brandsHTML ? `
    <div style="margin-bottom:24px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;opacity:0.45;font-weight:600;margin-bottom:10px;">Brands Worked With</div>
      <div>${brandsHTML}</div>
    </div>
    ` : ''}

    ${servicesHTML ? `
    <div style="margin-bottom:24px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;opacity:0.45;font-weight:600;margin-bottom:10px;">Services & Rates</div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:${theme.secondary};">
            <th style="text-align:left;padding:10px;font-size:11px;text-transform:uppercase;opacity:0.5;">Service</th>
            <th style="text-align:left;padding:10px;font-size:11px;text-transform:uppercase;opacity:0.5;">Description</th>
            <th style="text-align:left;padding:10px;font-size:11px;text-transform:uppercase;opacity:0.5;">Starting Price</th>
          </tr>
        </thead>
        <tbody>${servicesHTML}</tbody>
      </table>
    </div>
    ` : ''}

    <!-- Contact Bar -->
    <div style="background:${theme.accent};border-radius:12px;padding:16px 28px;display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
      <span style="color:white;font-size:13px;font-weight:600;">
        &#128248; @${creator.instagramHandle || creator.username}
      </span>
      <span style="color:white;font-size:13px;font-weight:600;">
        &#127760; creatorhub.app/${creator.username}
      </span>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:20px;opacity:0.35;font-size:11px;">
      Generated with CreatorHub &bull; ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
    </div>

  </div>
</body>
</html>`;
}

module.exports = router;
