const express = require('express');
const router = express.Router();
const UAParser = require('ua-parser-js');
const { AffiliateLink, ClickAnalytics } = require('../models/Affiliate');
const { generateDeepLink } = require('../utils/deepLink');

// POST /p/track — Called from deep link intercept page to record app vs fallback
router.post('/track', async (req, res) => {
  try {
    const { linkId, openedInApp } = req.body;
    if (!linkId) return res.json({ success: false });

    const field = openedInApp ? 'appOpenCount' : 'fallbackOpenCount';
    await AffiliateLink.findByIdAndUpdate(linkId, { $inc: { [field]: 1 } });

    // Update the most recent click analytics record for this link
    await ClickAnalytics.findOneAndUpdate(
      { linkId, deepLinkAttempted: true },
      { openedInApp },
      { sort: { timestamp: -1 } }
    );

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

// GET /p/:slug — Main redirect with optional deep link intercept
router.get('/:slug', async (req, res) => {
  try {
    const link = await AffiliateLink.findOne({ slug: req.params.slug, isActive: true });

    if (!link) {
      return res.status(404).send(notFoundHTML());
    }

    // ── Parse User-Agent ────────────────────────────────────────────────────
    const ua = new UAParser(req.headers['user-agent']);
    const uaResult   = ua.getResult();
    const deviceType = uaResult.device.type === 'mobile' ? 'mobile' :
                       uaResult.device.type === 'tablet' ? 'tablet' :
                       uaResult.device.type ? uaResult.device.type : 'desktop';
    const osName     = uaResult.os.name || '';
    const isIos      = /iOS|iPhone|iPad/.test(osName);
    const isAndroid  = /Android/.test(osName);
    const isMobile   = isIos || isAndroid;

    // ── Save click analytics ─────────────────────────────────────────────────
    const ip   = (req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '').split(',')[0].trim();
    const hour = new Date().getHours();

    ClickAnalytics.create({
      linkId:            link._id,
      creatorId:         link.creatorId,
      ip,
      device:            deviceType,
      browser:           uaResult.browser.name || '',
      os:                osName,
      country:           'India',
      referrer:          req.headers.referer || '',
      hour,
      deepLinkAttempted: link.openInApp && isMobile
    }).catch(console.error);

    AffiliateLink.findByIdAndUpdate(link._id, { $inc: { totalClicks: 1 } }).catch(console.error);

    // ── Build final redirect URL (with UTM params) ───────────────────────────
    let redirectUrl = link.originalUrl;
    try {
      if (link.utmSource || link.utmMedium || link.utmCampaign) {
        const u = new URL(redirectUrl);
        if (link.utmSource)   u.searchParams.set('utm_source',   link.utmSource);
        if (link.utmMedium)   u.searchParams.set('utm_medium',   link.utmMedium);
        if (link.utmCampaign) u.searchParams.set('utm_campaign', link.utmCampaign);
        redirectUrl = u.toString();
      }
    } catch {}

    // ── Deep Link Logic ──────────────────────────────────────────────────────
    if (link.openInApp && isMobile) {
      // Resolve deep link (use cached or compute fresh)
      let deepLinkInfo = null;

      if (link.deepLinkIos || link.deepLinkAndroid) {
        // Use cached values stored on the link document
        deepLinkInfo = {
          platform:    link.deepLinkPlatform || '',
          ios:         link.deepLinkIos,
          android:     link.deepLinkAndroid,
          fallback:    redirectUrl,
          storeIos:    null,
          storeAndroid: null
        };
      } else {
        // Compute fresh and cache for next time
        deepLinkInfo = generateDeepLink(link.originalUrl);
        if (deepLinkInfo) {
          AffiliateLink.findByIdAndUpdate(link._id, {
            deepLinkPlatform: deepLinkInfo.platform,
            deepLinkIos:      deepLinkInfo.ios,
            deepLinkAndroid:  deepLinkInfo.android
          }).catch(console.error);
        }
      }

      if (deepLinkInfo) {
        const deepLinkScheme = isIos ? deepLinkInfo.ios : deepLinkInfo.android;
        const storeUrl       = isIos ? deepLinkInfo.storeIos : deepLinkInfo.storeAndroid;
        return res.send(deepLinkHTML({
          link,
          deepLinkScheme,
          fallbackUrl:   redirectUrl,
          storeUrl,
          platform:      deepLinkInfo.platform,
          isIos,
          isAndroid
        }));
      }
    }

    // ── Standard redirect (no deep link / desktop / openInApp disabled) ──────
    res.redirect(302, redirectUrl);

  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).send('Redirect failed. Please try again.');
  }
});

// ── HTML Templates ─────────────────────────────────────────────────────────

function notFoundHTML() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Link Not Found</title></head>
  <body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f9f9f9;">
    <div style="text-align:center;padding:40px;background:white;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.1);max-width:320px;">
      <div style="font-size:48px;margin-bottom:12px;">🔗</div>
      <h2 style="color:#333;margin-bottom:8px;">Link not found</h2>
      <p style="color:#888;font-size:14px;">This link may have expired or been removed.</p>
    </div>
  </body></html>`;
}

function deepLinkHTML({ link, deepLinkScheme, fallbackUrl, storeUrl, platform, isIos, isAndroid }) {
  const platformIcons = {
    YouTube: '▶️', Twitter: '🐦', Instagram: '📸', Spotify: '🎵',
    TikTok: '🎵', Facebook: '📘', LinkedIn: '💼', Snapchat: '👻',
    Pinterest: '📌', WhatsApp: '💬', Telegram: '✈️', Reddit: '🤖', Netflix: '🎬'
  };
  const icon = platformIcons[platform] || '📱';
  const linkId = link._id.toString();
  const apiBase = process.env.API_URL || 'http://localhost:5000';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
  <title>Opening ${platform || 'App'}...</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #6C63FF 0%, #4ECDC4 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 24px;
      padding: 40px 32px;
      text-align: center;
      max-width: 360px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .app-icon {
      font-size: 56px;
      margin-bottom: 8px;
      display: block;
    }
    .platform-name {
      font-size: 22px;
      font-weight: 700;
      color: #1A1A2E;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 14px;
      color: #6B7280;
      margin-bottom: 32px;
      line-height: 1.5;
    }
    .btn-primary {
      display: block;
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #6C63FF, #4ECDC4);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      margin-bottom: 12px;
      transition: opacity 0.15s;
    }
    .btn-primary:hover { opacity: 0.9; }
    .btn-secondary {
      display: block;
      width: 100%;
      padding: 13px;
      background: transparent;
      color: #6B7280;
      border: 1.5px solid #E5E7EB;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s;
    }
    .btn-secondary:hover { background: #F9FAFB; color: #1A1A2E; }
    .status {
      margin-top: 20px;
      font-size: 12px;
      color: #9CA3AF;
    }
    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(108,99,255,0.2);
      border-top-color: #6C63FF;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      vertical-align: middle;
      margin-right: 6px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .instagram-warning {
      background: #FFF8E6;
      border: 1px solid #FFD700;
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 12px;
      color: #92610A;
      margin-bottom: 20px;
      text-align: left;
      line-height: 1.5;
    }
    .store-link {
      font-size: 11px;
      color: #9CA3AF;
      margin-top: 10px;
      display: block;
    }
    .store-link a { color: #6C63FF; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card" id="card">
    <span class="app-icon">${icon}</span>
    <div class="platform-name">Open in ${platform || 'App'}</div>
    <div class="subtitle" id="subtitle">Attempting to open ${platform || 'the app'}...</div>

    <!-- Instagram in-app browser warning (shown if detected) -->
    <div class="instagram-warning" id="igWarning" style="display:none;">
      ⚠️ You're in Instagram's browser. Tap <strong>"Open in App"</strong> below, then choose <strong>"Open"</strong> when prompted.
    </div>

    <button class="btn-primary" id="openBtn" onclick="tryOpenApp()">
      ${icon} Open in ${platform || 'App'}
    </button>

    <a href="${fallbackUrl}" class="btn-secondary" id="browserBtn" onclick="trackFallback()">
      Continue in Browser
    </a>

    ${storeUrl ? `<span class="store-link">App not installed? <a href="${storeUrl}" onclick="trackFallback()">Download from store</a></span>` : ''}

    <div class="status" id="status"></div>
  </div>

  <script>
    var DEEP_LINK    = ${JSON.stringify(deepLinkScheme)};
    var FALLBACK_URL = ${JSON.stringify(fallbackUrl)};
    var LINK_ID      = ${JSON.stringify(linkId)};
    var API_BASE     = ${JSON.stringify(apiBase)};
    var IS_IOS       = ${isIos};
    var IS_ANDROID   = ${isAndroid};
    var PLATFORM     = ${JSON.stringify(platform || '')};

    // ── Detect Instagram in-app browser ──────────────────────────────────────
    function isInstagramBrowser() {
      var ua = navigator.userAgent || '';
      return ua.indexOf('Instagram') > -1 || ua.indexOf('FBAN') > -1 || ua.indexOf('FBAV') > -1;
    }

    // ── Track analytics ───────────────────────────────────────────────────────
    function trackOpen(openedInApp) {
      try {
        fetch(API_BASE + '/p/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkId: LINK_ID, openedInApp: openedInApp })
        }).catch(function(){});
      } catch(e) {}
    }

    function trackFallback() { trackOpen(false); }

    // ── Deep link via invisible iframe ───────────────────────────────────────
    // NEVER use window.location.href = deepLink — it navigates away and shows
    // a "failed to load" error page when the app isn't installed.
    // An invisible iframe attempts the URI scheme silently — page stays visible.
    function launchViaIframe(scheme) {
      var iframe = document.createElement('iframe');
      iframe.style.cssText = 'display:none;width:0;height:0;border:0;position:absolute;top:-9999px;';
      iframe.src = scheme;
      document.body.appendChild(iframe);
      // Clean up after a few seconds
      setTimeout(function() {
        try { document.body.removeChild(iframe); } catch(e) {}
      }, 3000);
    }

    // Android Chrome also supports Intent URLs as a clean fallback
    function buildIntentUrl(scheme, fallback) {
      // intent://... format works in Chrome for Android and silently falls back
      // For iOS we always use iframe — no intent support
      if (!IS_ANDROID) return null;
      // Convert vnd.youtube://ID → intent scheme
      var encoded = encodeURIComponent(fallback);
      return scheme.replace(/^([a-z.]+):\/\//, 'intent://$1/') +
             '#Intent;scheme=' + scheme.split('://')[0] +
             ';S.browser_fallback_url=' + encoded + ';end';
    }

    // ── Main deep link attempt ─────────────────────────────────────────────────
    function tryOpenApp() {
      var btn    = document.getElementById('openBtn');
      var status = document.getElementById('status');

      btn.innerHTML = '<span class="spinner"></span> Opening...';
      btn.disabled = true;

      var appOpened = false;

      // Detect if app opened by watching visibility (tab goes to background)
      function onHide() {
        appOpened = true;
        trackOpen(true);
        cleanup();
      }
      function cleanup() {
        document.removeEventListener('visibilitychange', onVisChange);
        document.removeEventListener('pagehide', onHide);
        window.removeEventListener('blur', onHide);
      }
      function onVisChange() {
        if (document.hidden) onHide();
      }
      document.addEventListener('visibilitychange', onVisChange);
      document.addEventListener('pagehide', onHide);
      window.addEventListener('blur', onHide); // extra signal — window loses focus when app opens

      // ── Fire the deep link ──────────────────────────────────────────────────
      // iOS: iframe is most reliable — no page navigation, no error screen
      // Android Chrome: Intent URL is cleanest — built-in fallback support
      // Android other browsers: iframe fallback
      if (IS_ANDROID && navigator.userAgent.indexOf('Chrome') > -1) {
        // Intent URL — Chrome handles it natively, falls back to Play Store URL
        var intentUrl = buildIntentUrl(DEEP_LINK, FALLBACK_URL);
        if (intentUrl) {
          window.location.href = intentUrl; // Intent URLs don't cause "failed to load"
        } else {
          launchViaIframe(DEEP_LINK);
        }
      } else {
        // iOS Safari, Firefox, Samsung Internet, Instagram WebView — use iframe
        launchViaIframe(DEEP_LINK);
      }

      // ── Fallback timer: 2.5s — if still here, app not installed ─────────────
      setTimeout(function() {
        cleanup();
        if (!appOpened) {
          btn.innerHTML = '${icon} Open in ${platform || 'App'}';
          btn.disabled = false;
          status.innerHTML =
            'App not installed. ' +
            '<a href="' + FALLBACK_URL + '" style="color:#6C63FF;font-weight:600;" onclick="trackFallback()">Open in browser</a>';
          trackOpen(false);
        } else {
          status.textContent = '\u2713 Opened in ' + PLATFORM + '!';
          btn.innerHTML = '\u2713 Opened!';
        }
      }, 2500);
    }

    // ── On page load ──────────────────────────────────────────────────────────
    window.addEventListener('load', function() {
      var isIG = isInstagramBrowser();

      if (isIG) {
        // Instagram WebView blocks most URI schemes silently — require manual tap
        document.getElementById('igWarning').style.display = 'block';
        document.getElementById('subtitle').textContent =
          "Instagram's browser blocks app links. Tap the button below.";
        // Reset button to normal (don't auto-fire in Instagram)
        document.getElementById('openBtn').innerHTML = '${icon} Open in ${platform || 'App'}';
      } else {
        // Non-Instagram: auto-attempt after brief delay
        document.getElementById('subtitle').innerHTML =
          '<span class="spinner"></span> Attempting to open ' + PLATFORM + '...';
        setTimeout(tryOpenApp, 800);
      }
    });
  </script>
</body>
</html>`;
}

module.exports = router;
