const express = require('express');
const router = express.Router();
const UAParser = require('ua-parser-js');
const { AffiliateLink, ClickAnalytics } = require('../models/Affiliate');

// GET /p/:username/:slug OR /p/:slug — Track click and redirect
router.get('/:slug', async (req, res) => {
  try {
    const link = await AffiliateLink.findOne({
      slug: req.params.slug,
      isActive: true
    });

    if (!link) {
      return res.status(404).send(`
        <html>
          <body style="font-family: sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; background:#f9f9f9;">
            <div style="text-align:center; padding:40px; background:white; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.1);">
              <h2 style="color:#333;">Link not found</h2>
              <p style="color:#888;">This link may have expired or been removed.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Parse UA
    const ua = new UAParser(req.headers['user-agent']);
    const uaResult = ua.getResult();

    const deviceType = uaResult.device.type === 'mobile' ? 'mobile' :
                       uaResult.device.type === 'tablet' ? 'tablet' :
                       uaResult.device.type ? uaResult.device.type : 'desktop';

    // Get IP
    const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();

    const hour = new Date().getHours();

    // Save analytics asynchronously
    ClickAnalytics.create({
      linkId: link._id,
      creatorId: link.creatorId,
      ip,
      device: deviceType,
      browser: uaResult.browser.name || '',
      os: uaResult.os.name || '',
      country: 'India', // integrate with ip-api.com for real geo
      referrer: req.headers.referer || '',
      hour
    }).catch(console.error);

    // Increment click count
    AffiliateLink.findByIdAndUpdate(link._id, { $inc: { totalClicks: 1 } }).catch(console.error);

    // Build redirect URL with UTM params if configured
    let redirectUrl = link.originalUrl;
    if (link.utmSource || link.utmMedium || link.utmCampaign) {
      const url = new URL(redirectUrl);
      if (link.utmSource) url.searchParams.set('utm_source', link.utmSource);
      if (link.utmMedium) url.searchParams.set('utm_medium', link.utmMedium);
      if (link.utmCampaign) url.searchParams.set('utm_campaign', link.utmCampaign);
      redirectUrl = url.toString();
    }

    res.redirect(302, redirectUrl);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).send('Redirect failed. Please try again.');
  }
});

module.exports = router;
