/**
 * DeepLink Utility — generateDeepLink(url)
 *
 * Converts standard HTTPS URLs into native app URI schemes.
 * Easily extensible — just add entries to PLATFORM_MAP.
 *
 * Supported platforms:
 *   YouTube, Twitter/X, Instagram, Spotify, TikTok,
 *   Facebook, LinkedIn, Snapchat, Pinterest, WhatsApp,
 *   Telegram, Reddit, Netflix
 */

const PLATFORM_MAP = [
  // ─── YouTube ──────────────────────────────────────────────────────────────
  {
    name: 'YouTube',
    icon: '▶️',
    patterns: [/youtube\.com/, /youtu\.be/],
    convert: (url) => {
      try {
        const u = new URL(url);

        // youtu.be/VIDEO_ID
        if (u.hostname === 'youtu.be') {
          const videoId = u.pathname.replace('/', '');
          return {
            ios: `vnd.youtube://${videoId}`,
            android: `vnd.youtube://${videoId}`,
            storeIos: 'https://apps.apple.com/app/youtube/id544007664',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.google.android.youtube'
          };
        }

        // youtube.com/watch?v=VIDEO_ID
        const videoId = u.searchParams.get('v');
        if (videoId) {
          return {
            ios: `vnd.youtube://${videoId}`,
            android: `vnd.youtube://${videoId}`,
            storeIos: 'https://apps.apple.com/app/youtube/id544007664',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.google.android.youtube'
          };
        }

        // youtube.com/channel/CHANNEL_ID or youtube.com/@handle
        const channelMatch = u.pathname.match(/\/(@[\w.-]+|channel\/[\w-]+|c\/[\w-]+|user\/[\w-]+)/);
        if (channelMatch) {
          const path = channelMatch[1];
          return {
            ios: `vnd.youtube://${path}`,
            android: `vnd.youtube://${path}`,
            storeIos: 'https://apps.apple.com/app/youtube/id544007664',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.google.android.youtube'
          };
        }

        // Shorts
        const shortsMatch = u.pathname.match(/\/shorts\/([\w-]+)/);
        if (shortsMatch) {
          return {
            ios: `vnd.youtube://${shortsMatch[1]}`,
            android: `vnd.youtube://${shortsMatch[1]}`,
            storeIos: 'https://apps.apple.com/app/youtube/id544007664',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.google.android.youtube'
          };
        }
      } catch {}
      return null;
    }
  },

  // ─── Twitter / X ──────────────────────────────────────────────────────────
  {
    name: 'Twitter',
    icon: '🐦',
    patterns: [/twitter\.com/, /x\.com/],
    convert: (url) => {
      try {
        const u = new URL(url);
        const parts = u.pathname.replace(/^\//, '').split('/');

        // Status / tweet
        if (parts.length >= 3 && parts[1] === 'status') {
          return {
            ios: `twitter://status?id=${parts[2]}`,
            android: `twitter://status?id=${parts[2]}`,
            storeIos: 'https://apps.apple.com/app/twitter/id333903271',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.twitter.android'
          };
        }

        // User profile
        if (parts[0] && parts[0] !== 'home' && parts[0] !== 'explore') {
          const username = parts[0];
          return {
            ios: `twitter://user?screen_name=${username}`,
            android: `twitter://user?screen_name=${username}`,
            storeIos: 'https://apps.apple.com/app/twitter/id333903271',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.twitter.android'
          };
        }
      } catch {}
      return null;
    }
  },

  // ─── Instagram ────────────────────────────────────────────────────────────
  {
    name: 'Instagram',
    icon: '📸',
    patterns: [/instagram\.com/],
    convert: (url) => {
      try {
        const u = new URL(url);
        const parts = u.pathname.replace(/^\//, '').replace(/\/$/, '').split('/');

        // Post: /p/CODE
        if (parts[0] === 'p' && parts[1]) {
          return {
            ios: `instagram://media?id=${parts[1]}`,
            android: `instagram://media?id=${parts[1]}`,
            storeIos: 'https://apps.apple.com/app/instagram/id389801252',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.instagram.android'
          };
        }

        // Reel: /reel/CODE
        if (parts[0] === 'reel' && parts[1]) {
          return {
            ios: `instagram://reels?id=${parts[1]}`,
            android: `instagram://reels?id=${parts[1]}`,
            storeIos: 'https://apps.apple.com/app/instagram/id389801252',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.instagram.android'
          };
        }

        // User profile: /username
        if (parts[0] && !['explore', 'stories', 'tv', 'accounts'].includes(parts[0])) {
          return {
            ios: `instagram://user?username=${parts[0]}`,
            android: `instagram://user?username=${parts[0]}`,
            storeIos: 'https://apps.apple.com/app/instagram/id389801252',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.instagram.android'
          };
        }
      } catch {}
      return null;
    }
  },

  // ─── Spotify ──────────────────────────────────────────────────────────────
  {
    name: 'Spotify',
    icon: '🎵',
    patterns: [/open\.spotify\.com/, /spotify\.com/],
    convert: (url) => {
      try {
        const u = new URL(url);
        // /track/ID, /album/ID, /artist/ID, /playlist/ID
        const match = u.pathname.match(/\/(track|album|artist|playlist|episode|show)\/([\w]+)/);
        if (match) {
          return {
            ios: `spotify://${match[1]}:${match[2]}`,
            android: `spotify://${match[1]}:${match[2]}`,
            storeIos: 'https://apps.apple.com/app/spotify/id324684580',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.spotify.music'
          };
        }
      } catch {}
      return null;
    }
  },

  // ─── TikTok ───────────────────────────────────────────────────────────────
  {
    name: 'TikTok',
    icon: '🎵',
    patterns: [/tiktok\.com/],
    convert: (url) => {
      try {
        const u = new URL(url);
        // /video/ID
        const videoMatch = u.pathname.match(/\/video\/([\d]+)/);
        if (videoMatch) {
          return {
            ios: `snssdk1233://aweme/detail/${videoMatch[1]}`,
            android: `snssdk1233://aweme/detail/${videoMatch[1]}`,
            storeIos: 'https://apps.apple.com/app/tiktok/id835599320',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically'
          };
        }
        // @username profile
        const userMatch = u.pathname.match(/\/@([\w.]+)/);
        if (userMatch) {
          return {
            ios: `snssdk1233://user/profile/${userMatch[1]}`,
            android: `snssdk1233://user/profile/${userMatch[1]}`,
            storeIos: 'https://apps.apple.com/app/tiktok/id835599320',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically'
          };
        }
      } catch {}
      return null;
    }
  },

  // ─── Facebook ─────────────────────────────────────────────────────────────
  {
    name: 'Facebook',
    icon: '📘',
    patterns: [/facebook\.com/, /fb\.com/],
    convert: (url) => {
      try {
        const u = new URL(url);
        // Profile or page
        const parts = u.pathname.replace(/^\//, '').split('/');
        if (parts[0] && parts[0] !== 'pages') {
          return {
            ios: `fb://profile/${parts[0]}`,
            android: `fb://facewebmodal/f?href=${encodeURIComponent(url)}`,
            storeIos: 'https://apps.apple.com/app/facebook/id284882215',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.facebook.katana'
          };
        }
      } catch {}
      return null;
    }
  },

  // ─── LinkedIn ─────────────────────────────────────────────────────────────
  {
    name: 'LinkedIn',
    icon: '💼',
    patterns: [/linkedin\.com/],
    convert: (url) => {
      try {
        const u = new URL(url);
        const profileMatch = u.pathname.match(/\/in\/([\w-]+)/);
        if (profileMatch) {
          return {
            ios: `linkedin://profile/${profileMatch[1]}`,
            android: `linkedin://profile/${profileMatch[1]}`,
            storeIos: 'https://apps.apple.com/app/linkedin/id288429040',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.linkedin.android'
          };
        }
      } catch {}
      return null;
    }
  },

  // ─── Snapchat ─────────────────────────────────────────────────────────────
  {
    name: 'Snapchat',
    icon: '👻',
    patterns: [/snapchat\.com/],
    convert: (url) => {
      try {
        const u = new URL(url);
        const addMatch = u.pathname.match(/\/add\/([\w.]+)/);
        if (addMatch) {
          return {
            ios: `snapchat://add/${addMatch[1]}`,
            android: `snapchat://add/${addMatch[1]}`,
            storeIos: 'https://apps.apple.com/app/snapchat/id447188370',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.snapchat.android'
          };
        }
      } catch {}
      return null;
    }
  },

  // ─── Pinterest ────────────────────────────────────────────────────────────
  {
    name: 'Pinterest',
    icon: '📌',
    patterns: [/pinterest\.(com|co\.uk|in)/],
    convert: (url) => {
      try {
        const u = new URL(url);
        const parts = u.pathname.replace(/^\//, '').split('/');
        if (parts[0]) {
          return {
            ios: `pinterest://user/${parts[0]}`,
            android: `pinterest://user/${parts[0]}`,
            storeIos: 'https://apps.apple.com/app/pinterest/id429047995',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.pinterest'
          };
        }
      } catch {}
      return null;
    }
  },

  // ─── WhatsApp ─────────────────────────────────────────────────────────────
  {
    name: 'WhatsApp',
    icon: '💬',
    patterns: [/wa\.me/, /whatsapp\.com/],
    convert: (url) => {
      try {
        const u = new URL(url);
        // wa.me/PHONE
        const phone = u.pathname.replace('/', '');
        if (phone) {
          return {
            ios: `whatsapp://send?phone=${phone}`,
            android: `whatsapp://send?phone=${phone}`,
            storeIos: 'https://apps.apple.com/app/whatsapp-messenger/id310633997',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.whatsapp'
          };
        }
      } catch {}
      return null;
    }
  },

  // ─── Telegram ─────────────────────────────────────────────────────────────
  {
    name: 'Telegram',
    icon: '✈️',
    patterns: [/t\.me/, /telegram\.me/],
    convert: (url) => {
      try {
        const u = new URL(url);
        const username = u.pathname.replace('/', '');
        if (username) {
          return {
            ios: `tg://resolve?domain=${username}`,
            android: `tg://resolve?domain=${username}`,
            storeIos: 'https://apps.apple.com/app/telegram-messenger/id686449807',
            storeAndroid: 'https://play.google.com/store/apps/details?id=org.telegram.messenger'
          };
        }
      } catch {}
      return null;
    }
  },

  // ─── Reddit ───────────────────────────────────────────────────────────────
  {
    name: 'Reddit',
    icon: '🤖',
    patterns: [/reddit\.com/],
    convert: (url) => {
      try {
        const u = new URL(url);
        return {
          ios: `reddit://${u.pathname}`,
          android: `reddit://${u.pathname}`,
          storeIos: 'https://apps.apple.com/app/reddit/id1064216828',
          storeAndroid: 'https://play.google.com/store/apps/details?id=com.reddit.frontpage'
        };
      } catch {}
      return null;
    }
  },

  // ─── Netflix ──────────────────────────────────────────────────────────────
  {
    name: 'Netflix',
    icon: '🎬',
    patterns: [/netflix\.com/],
    convert: (url) => {
      try {
        const titleMatch = url.match(/\/title\/([\d]+)/);
        if (titleMatch) {
          return {
            ios: `nflx://www.netflix.com/title/${titleMatch[1]}`,
            android: `nflx://www.netflix.com/title/${titleMatch[1]}`,
            storeIos: 'https://apps.apple.com/app/netflix/id363590051',
            storeAndroid: 'https://play.google.com/store/apps/details?id=com.netflix.mediaclient'
          };
        }
      } catch {}
      return null;
    }
  }
];

/**
 * generateDeepLink(originalUrl)
 *
 * Returns:
 * {
 *   platform: 'YouTube',
 *   icon: '▶️',
 *   ios: 'vnd.youtube://abc123',
 *   android: 'vnd.youtube://abc123',
 *   fallback: 'https://youtube.com/watch?v=abc123',
 *   storeIos: 'https://...',
 *   storeAndroid: 'https://...'
 * }
 * or null if no platform matched.
 */
function generateDeepLink(originalUrl) {
  if (!originalUrl) return null;

  for (const platform of PLATFORM_MAP) {
    const matches = platform.patterns.some(pattern => pattern.test(originalUrl));
    if (matches) {
      try {
        const deepLinks = platform.convert(originalUrl);
        if (deepLinks) {
          return {
            platform: platform.name,
            icon: platform.icon,
            ios: deepLinks.ios,
            android: deepLinks.android,
            fallback: originalUrl,
            storeIos: deepLinks.storeIos || null,
            storeAndroid: deepLinks.storeAndroid || null
          };
        }
      } catch {}
    }
  }

  return null; // No matching platform found
}

/**
 * detectPlatformName(originalUrl)
 * Quick helper — just returns the platform name string or null.
 */
function detectPlatformName(originalUrl) {
  if (!originalUrl) return null;
  for (const platform of PLATFORM_MAP) {
    if (platform.patterns.some(p => p.test(originalUrl))) return platform.name;
  }
  return null;
}

module.exports = { generateDeepLink, detectPlatformName, PLATFORM_MAP };
