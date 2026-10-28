// Site-wide settings. Edit here, not in templates.
module.exports = {
  // Netlify sets process.env.URL to the site's primary URL at build time.
  // Set SITE_URL in Netlify env vars (or edit the fallback) once the domain is chosen.
  siteUrl: (process.env.SITE_URL || process.env.URL || 'https://relx-guide.netlify.app').replace(/\/$/, ''),
  siteName: 'RelxPods Guide',
  brand: 'RelxPods',

  // The store this guide sends buyers to.
  shopUrl: 'https://relxpod.ae',

  // WhatsApp number in international format, digits only (for example 9715XXXXXXXX).
  // TODO: replace with the real RelxPods WhatsApp number before launch.
  whatsappNumber: process.env.WHATSAPP_NUMBER || '971000000000',

  ageLine: 'For existing adult smokers and vapers aged 18+.',
};
