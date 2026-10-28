// Site-wide settings. Edit here, not in templates.
module.exports = {
  // Netlify sets process.env.URL to the site's primary URL at build time.
  // Set SITE_URL in Netlify env vars (or edit the fallback) once the domain is chosen.
  siteUrl: (process.env.SITE_URL || process.env.URL || 'https://relxpods-guide.netlify.app').replace(/\/$/, ''),
  siteName: 'RelxPods Guide',
  brand: 'RelxPods',

  // The store this guide sends buyers to.
  shopUrl: 'https://relxpod.ae',

  // RelxPods WhatsApp number in international format, digits only.
  whatsappNumber: process.env.WHATSAPP_NUMBER || '971527039137',

  ageLine: 'For existing adult smokers and vapers aged 18+.',

  // Google Search Console HTML-tag verification for relxpods-guide.netlify.app.
  googleSiteVerification: '11uNG74p3rkXklgENk3-rjPW2W17engEB_liwE4Sugc',

  // RelxPods profiles. Used as schema.org sameAs only: the site links only to RelxPods and WhatsApp.
  social: [
    'https://bsky.app/profile/relxpod.bsky.social',
    'https://mastodon.social/@relxpod',
    'https://medium.com/@relxpods',
    'https://substack.com/@relxpoduae',
    'https://relxdubai.blogspot.com/',
    'https://www.tumblr.com/relxpod',
    'https://dev.to/relxpod',
    'https://github.com/relxpods-tech',
    'https://gitlab.com/relx-pods',
    'https://bitbucket.org/relxpods',
    'https://gravatar.com/relxpods',
    'https://linktr.ee/relxpods',
    'https://relxdubai.carrd.co/',
    'https://www.reddit.com/user/relxpodsuae/',
    'https://bn.quora.com/profile/Relx-Pods/',
    'https://flipboard.com/@relxpods',
    'https://vimeo.com/relxdubai',
    'https://www.behance.net/relxpods',
    'https://issuu.com/relxpods',
  ],
};
