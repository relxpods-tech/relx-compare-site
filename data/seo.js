// Keyword targets per page, picked from the UAE GSC export (research/gsc-relx-keywords.csv).
// Only queries that already earn impressions are used. Edit titles and copy here, not in templates.
// Title max 60 characters, description max 155 (check.js enforces).

module.exports = {
  compareHub: {
    // compare cluster + "best relx device", compatibility cluster
    keywords: ['relx device comparison', 'best relx device', 'pods compatible with relx', 'relx pod compatible', 'relx compatible pods'],
    title: 'RELX Device Comparison: Infinity 2, Artisan & More',
    desc: 'Compare any two RELX devices side by side: pods that fit, power modes, battery, and UAE price. Plus a chart of which pods are compatible with each RELX.',
    lead: 'Pick any two RELX devices to see which pods fit, power modes, battery and charging, and where to buy in the UAE. Not sure which is the best RELX device for you? Start with the two RelxPods stocks.',
  },

  helpHub: {
    // "my relx device is not working", "why is my relx vape not working", "relx not charging"
    keywords: ['relx not working', 'my relx device is not working', 'why is my relx vape not working'],
    title: 'RELX Not Working? Fix Charging, Blinking & Taste Issues',
    desc: 'RELX not working? Pick your device and the problem you see, from not charging to blinking or burnt taste. Get the likely cause and the fix in a minute.',
    h1: 'RELX Not Working? Help Center',
    lead: "Is your RELX device not working? Pick your device and the problem you see. You'll get the likely cause and the fix in under a minute.",
  },

  devicesHub: {
    // "kinds of relx device" (strongest device query), "relx devices", "latest relx device", "best relx device"
    keywords: ['kinds of relx device', 'relx devices', 'latest relx device', 'best relx device', 'relx device'],
    title: 'Kinds of RELX Devices: Specs, Pods and Which to Buy',
    desc: 'Every kind of RELX device sold in the UAE, from the latest Infinity 2 Plus to the Artisan: battery, charging, power modes and which pods fit each one.',
    h1: 'Kinds of RELX Devices',
    lead: 'These are the six RELX devices you will most often find in UAE stores, from the latest Infinity 2 Plus to the Artisan. Here is how they differ and which pods each one takes.',
  },

  // Device pages. Keywords are the top queries naming that device.
  devices: {
    'infinity-2': {
      keywords: ['relx infinity 2', 'relx infinity 2 device', 'relx infinity 2 battery', 'relx infinity 2 charging time', 'relx infinity 2 modes', 'relx pods for infinity 2'],
      title: 'RELX Infinity 2: Modes, Battery, Charging and Pods',
      desc: 'RELX Infinity 2 device guide: three power modes and their light colors, 440 mAh battery, charging time, and which RELX pods fit the Infinity 2.',
    },
    'infinity-2-plus': {
      keywords: ['relx infinity 2 plus', 'infinity 2 plus device', 'relx infinity 2 plus device', 'relx infinity 2 plus pods'],
      title: 'RELX Infinity 2 Plus Device: Modes, Charging and Pods',
      desc: 'RELX Infinity 2 Plus device guide: three power modes and their output, fast charging, and which RELX pods fit the Infinity 2 Plus.',
    },
    infinity: {
      keywords: ['relx infinity', 'relx infinity device', 'pods for relx infinity', 'relx infinity pods'],
      title: 'RELX Infinity Device: Battery, Charging and Pods That Fit',
      desc: 'RELX Infinity device guide: 380 mAh battery, USB-C charging, and which pods fit the RELX Infinity, including Pod Pro and Pod Pro 2.',
    },
    'infinity-plus': {
      keywords: ['infinity plus device', 'relx infinity plus', 'relx infinity plus device', 'relx infinity plus pods'],
      title: 'RELX Infinity Plus Device: Battery, Charging and Pods',
      desc: 'RELX Infinity Plus device guide: 380 mAh battery, charging time, and which RELX pods fit the Infinity Plus.',
    },
    essential: {
      keywords: ['relx essential', 'relx essential pods', 'relx pod essential', 'relx infinity and essential'],
      title: 'RELX Essential Device: Battery, Charging and Pods',
      desc: 'RELX Essential device guide: 350 mAh battery, about 40 minutes to charge, and which RELX pods fit the Essential.',
    },
    artisan: {
      keywords: ['relx artisan', 'artisan device', 'relx artisan device', 'relx artisan pods', 'relx artisan leather'],
      title: 'RELX Artisan Device: Leather and Metal, Specs and Pods',
      desc: 'RELX Artisan device guide: leather and metal editions, 380 mAh battery, charging time, and which RELX pods fit the Artisan.',
    },
  },

  // Extra wording for pair pages, matching how people search the pair.
  pairs: {
    'infinity-2-vs-infinity-2-plus': { also: 'Searching "Infinity 2 vs Plus"? This is the comparison you want.' },
  },

  modesGuide: {
    // "relx infinity 2 change mode", "how to unlock relx infinity 2", "relx infinity 2 how to adjust power", "relx infinity 2 modes color"
    keywords: ['relx infinity 2 change mode', 'how to unlock relx infinity 2', 'relx infinity 2 how to adjust power', 'relx infinity 2 modes color', 'relx infinity 2 adjustable power'],
    slug: 'infinity-2-change-mode',
    title: 'How to Change Modes on RELX Infinity 2 (Eco, Smooth, Boost)',
    desc: 'How to change modes and adjust power on the RELX Infinity 2: which pod unlocks the modes, how to switch, and what each light color means.',
    h1: 'How to Change Modes on RELX Infinity 2',
  },
};
