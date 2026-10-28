<div align="center">

<img src="src/img/og-image.jpg" alt="RELX PODS" width="100%">

# RELX Device Guide for the UAE

**Compare RELX devices, see which pods fit, and fix common problems in under a minute.**<br>
A free, fact-checked guide by [RelxPods](https://relxpod.ae).

[![Netlify](https://img.shields.io/badge/deploy-Netlify-00C7B7?logo=netlify&logoColor=white)](https://app.netlify.com/start/deploy?repository=https://github.com/relxpods-tech/relx-compare-site)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-162d4a)
![Pages](https://img.shields.io/badge/pages-38-c6612b)
![Page weight](https://img.shields.io/badge/page%20weight-~9%20KB%20gzip-162d4a)
![No third-party requests](https://img.shields.io/badge/third--party%20requests-0-15803d)

**[Live site](https://relxpods-guide.netlify.app)** · [Shop RELX Dubai](https://relxpod.ae) · [Features](#features) · [Quick start](#quick-start) · [Deploy](#deploy-on-netlify) · [Find us](#find-relxpods-online)

</div>

---

## Features

| | |
|---|---|
| **Device compare** | Pick any two of six RELX devices and get a side-by-side table: pods that fit, power modes, battery, charging and where to buy. All 15 pairs have their own indexable page. |
| **Help center** | Pick a device and a symptom (not charging, blinking red, burnt taste, leaking and more) and get the likely cause, numbered fix steps, and when to replace the pod or the device. |
| **Device guides** | One page per device with specs, pods that fit, power modes, comparisons, common problems and an FAQ. |
| **Pod compatibility chart** | Every device against RELX Pod Pro and Pod Pro 2 at a glance. |
| **Embeddable chart** | A frameable chart other sites can add with one line of code, with a credit link back here. |
| **Fact rules built in** | Specs show only what UAE sources confirm or most of them agree on. Anything else renders as "Not confirmed", never as fact. |

## What's inside

```
relx-compare-site/
├── data/
│   ├── relx.js        # The only facts the site may show (devices, pods, fits, fixes)
│   └── seo.js         # Page titles, descriptions and target keywords
├── src/
│   ├── site.css       # Design tokens and styles (inlined into every page at build)
│   ├── tool.js        # Pickers, help selectors, tracking (vanilla JS, ~6 KB)
│   └── img/           # Logo, icons, social image
├── build.js           # Static site generator, no dependencies
├── check.js           # QA checks from the spec; fails the build on any error
├── serve.js           # Local preview that mimics Netlify
├── site.config.js     # Site URL, shop URL, WhatsApp number, social profiles
└── netlify.toml       # Build settings
```

## Quick start

Needs Node 18 or newer. There is nothing to install.

```bash
npm run dev
```

Open http://localhost:8888. It serves clean URLs, redirects, headers and the 404 page the way Netlify does.

| Command | What it does |
|---|---|
| `npm run dev` | Build, then preview at http://localhost:8888 |
| `npm run build` | Build to `dist/` and run every QA check |
| `npm run check` | Run the QA checks on an existing build |

## Editing

| To change | Edit |
|---|---|
| A device spec, pod fit or fix | `data/relx.js`. Every value is `{ value, status }`. Bump `updated_at`. |
| A page title, description or keyword | `data/seo.js` |
| Site URL, shop URL, WhatsApp number | `site.config.js`, or Netlify environment variables |
| Colors, spacing, components | Tokens at the top of `src/site.css` |

The QA check (`check.js`) blocks a deploy if a page uses UK spelling, links to a third-party site, says "all RELX devices", makes a health claim, misses the age line, has a too-long title, or shows FAQ schema that doesn't match the page.

## Deploy on Netlify

The live site is [relxpods-guide.netlify.app](https://relxpods-guide.netlify.app), deployed by hand from the CLI:

```powershell
powershell -ExecutionPolicy Bypass -File deploy.ps1
```

To deploy on every push instead:

1. In Netlify, open the site and connect this repo under **Project configuration → Build & deploy**. Build settings come from `netlify.toml`.
2. In **Site settings → Environment variables**, add:

   | Variable | Example |
   |---|---|
   | `WHATSAPP_NUMBER` | `9715XXXXXXXX` (digits only) |
   | `SITE_URL` | `https://your-domain.com` |

3. Deploy, then submit `/sitemap.xml` in Google Search Console.

## Performance

- **No external requests:** no CDNs, no web fonts, no third-party scripts.
- **CSS inlined:** the stylesheet is minified and built into every page, so nothing blocks the first paint.
- **Small pages:** about 8 to 9 KB per page when compressed, plus a 6 KB script loaded with `defer`.
- **Images:** WebP, with set sizes so the layout doesn't shift. The large hero logo loads only on wide screens.

## Find RelxPods online

| Social | Writing | Code | Creative |
|---|---|---|---|
| [Bluesky](https://bsky.app/profile/relxpod.bsky.social) | [Medium](https://medium.com/@relxpods) | [GitHub](https://github.com/relxpods-tech) | [Behance](https://www.behance.net/relxpods) |
| [Mastodon](https://mastodon.social/@relxpod) | [Substack](https://substack.com/@relxpoduae) | [GitLab](https://gitlab.com/relx-pods) | [Dribbble](https://dribbble.com/mehmed2-tc/about) |
| [Reddit](https://www.reddit.com/user/relxpodsuae/) | [Blogger](https://relxdubai.blogspot.com/) | [Bitbucket](https://bitbucket.org/relxpods) | [Vimeo](https://vimeo.com/relxdubai) |
| [Tumblr](https://www.tumblr.com/relxpod) | [DEV](https://dev.to/relxpod) | | [Issuu](https://issuu.com/relxpods) |
| [Quora](https://bn.quora.com/profile/Relx-Pods/) | [Flipboard](https://flipboard.com/@relxpods/relx-dubai-pod-flavors-devices-guides-tj73llrgy) | | [Wakelet](https://wakelet.com/wake/t5X9sgcqutqPJBS2_0Lfx) |
| [Linktree](https://linktr.ee/relxpods) | | | [Gravatar](https://gravatar.com/relxpods) |
| [Carrd](https://relxdubai.carrd.co/) | | | |

### Read more

- [RELX Infinity vs Infinity 2: which device should you buy?](https://medium.com/@relxpods/relx-infinity-vs-infinity-2-which-device-should-you-buy-094a05132954) on Medium
- [RELX Dubai pod flavors and device guide](https://relxdubai.blogspot.com/2026/10/relx-dubai-pod-flavors-device-guide.html) on Blogger
- [RELX Pod Pro 2 flavor profiles, compatibility and what to check](https://dev.to/relxpod/relx-pod-pro-2-flavor-profiles-compatibility-and-what-to-check-165e) on DEV
- [Three RELX Pod Pro 2 flavors](https://www.tumblr.com/relxpod/831337847315365888/three-relx-pod-pro-2-flavors-for-people-who-are) on Tumblr
- [RELX compatibility guide](https://gitlab.com/relx-pods/relx-compatibility-guide) on GitLab
- [RELX devices](https://bitbucket.org/relxpods/relxdevices/src/main/) on Bitbucket

---

<div align="center">

**For existing adult smokers and vapers aged 18+.**<br>
Made by [RelxPods](https://relxpod.ae) · Shop at [RELX Dubai](https://relxpod.ae)

</div>
