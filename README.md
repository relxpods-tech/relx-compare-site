# RELX Device Compare + Help Center (standalone site)

Static site for Netlify, built from `relxpod-tool-build-spec.md`. No dependencies, no external requests at runtime.

## Edit
- **Facts:** `data/relx.js` only (spec section 6). Every value is `{ value, status }`; `not_confirmed` always renders as "Not confirmed". Bump `updated_at` when you change data.
- **SEO titles and target keywords:** `data/seo.js`. Keywords come from a UAE GSC export (only queries that already get impressions); the raw export and source notes stay local in `research/`, which is not in the repo.
- **Site settings:** `site.config.js` (site URL, shop URL, WhatsApp number, age line).
- **Look:** color tokens at the top of `src/site.css`.

## Run locally
```bash
npm run dev
```
Opens a Netlify-like preview at http://localhost:8888 (clean URLs, `_redirects`, `_headers`, 404 page).

## Deploy on Netlify
1. Push this folder to a Git repo and connect it in Netlify (build command and publish dir come from `netlify.toml`).
2. In Site settings > Environment variables, set:
   - `WHATSAPP_NUMBER`: digits only, for example `9715XXXXXXXX`
   - `SITE_URL`: your custom domain, for example `https://example.com` (otherwise Netlify's `URL` is used)
3. Deploy. `npm run build` runs `check.js`, which fails the deploy if any QA rule from spec section 11 breaks.
4. Submit `/sitemap.xml` in Google Search Console.

## Differences from the spec (standalone, no shopkit)
- **No live price or stock.** The price row links to the relxpod.ae category ("See today's price"); price per pod is not shown, since it may not be hardcoded.
- Answer sentences say "stocked at RelxPods" rather than "in stock today", since stock can't be checked from a static site.
- Added a homepage, `/tools`, `/about` and a 404 page. `sitemap.xml` is an index of `sitemap-tools.xml` (the 25 tool URLs) and `sitemap-pages.xml`.
- The embed credit links to this site's compare hub, so backlinks land here.
- Analytics events push to `window.dataLayer` if you add your own analytics; nothing is loaded by default.
- Device pictures are simple SVG placeholders. Swap in real photos (self-hosted) if you have them.
