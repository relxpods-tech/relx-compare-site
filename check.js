// QA checks from spec section 11 that can run on the built HTML. Fails the build on any error.
const fs = require('fs');
const path = require('path');
const cfg = require('./site.config');
const data = require('./data/relx');

const DIST = path.join(__dirname, 'dist');
const { pages, toolPaths } = require('./.build/pages.json');
const errors = [];
const fail = (msg) => errors.push(msg);

const shopHost = new URL(cfg.shopUrl).host;
const siteHost = new URL(cfg.siteUrl).host;
const allowedHosts = new Set([shopHost, siteHost, 'wa.me']);

const titles = new Map();
const descs = new Map();
const h1s = new Map();

for (const p of pages) {
  const html = fs.readFileSync(path.join(DIST, p.file), 'utf8');
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');

  // US English
  for (const w of ['colour', 'flavour', 'labelled', 'specialise']) if (new RegExp(w, 'i').test(text)) fail(`${p.path}: UK spelling "${w}"`);
  // Never "all RELX devices"
  if (/all RELX devices/i.test(text)) fail(`${p.path}: says "all RELX devices"`);
  // Health claims
  for (const w of ['safer', 'healthier', 'helps you quit']) if (new RegExp(`\\b${w}\\b`, 'i').test(text)) fail(`${p.path}: health claim "${w}"`);
  // Age line
  if (!html.includes(cfg.ageLine)) fail(`${p.path}: missing age line`);
  // Links only to own site, the shop, and WhatsApp
  for (const m of html.matchAll(/href="(https?:[^"]+)"/g)) {
    const host = new URL(m[1].replace(/&amp;/g, '&')).host;
    if (!allowedHosts.has(host)) fail(`${p.path}: external link to ${host}`);
  }
  // No external runtime requests (scripts, styles, images, fonts, iframes)
  for (const m of html.matchAll(/<(?:script|img|iframe|source)[^>]*\ssrc="(https?:[^"]+)"/g)) fail(`${p.path}: external src ${m[1]}`);
  for (const m of html.matchAll(/<link[^>]*rel="(?:stylesheet|preload|preconnect|dns-prefetch)"[^>]*href="(https?:[^"]+)"/g)) fail(`${p.path}: external asset ${m[1]}`);
  if (/@import|url\(\s*["']?https?:/i.test(html)) fail(`${p.path}: external CSS url()`);
  // Pod lines are never called devices
  if (/Pod Pro 2? device/i.test(text)) fail(`${p.path}: pod line called a device`);
  // Size budget (raw; gzip is far smaller)
  if (Buffer.byteLength(html) > 60 * 1024) fail(`${p.path}: HTML over 60 KB raw`);

  if (p.embed) {
    if (!/<meta name="robots" content="noindex, follow">/.test(html)) fail(`${p.path}: embed must be noindex, follow`);
    if (!/Chart by <a href="[^"]+\/tools\/relx-device-compare" target="_blank"/.test(html)) fail(`${p.path}: embed credit link`);
    continue;
  }

  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const h1 = (html.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1];
  const decode = (s) => s.replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  if (!title) fail(`${p.path}: no title`);
  else if (decode(title).length > 60) fail(`${p.path}: title ${decode(title).length} chars: ${title}`);
  if (!desc) fail(`${p.path}: no meta description`);
  else if (decode(desc).length > 155) fail(`${p.path}: meta description ${decode(desc).length} chars`);
  if ((html.match(/<h1>/g) || []).length !== 1) fail(`${p.path}: needs exactly one h1`);
  if (!html.includes(`<link rel="canonical" href="${cfg.siteUrl}${p.path === '/' ? '/' : p.path}">`)) fail(`${p.path}: canonical`);
  if (p.indexable) {
    for (const [map, v, k] of [[titles, title, 'title'], [descs, desc, 'description'], [h1s, h1, 'h1']]) {
      if (map.has(v)) fail(`${p.path}: duplicate ${k} with ${map.get(v)}`);
      map.set(v, p.path);
    }
  }
  // JSON-LD parses, and FAQ answers appear as visible text
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let ld;
    try { ld = JSON.parse(m[1]); } catch (e) { fail(`${p.path}: bad JSON-LD`); continue; }
    if (ld['@type'] === 'FAQPage') {
      const visible = decode(text.replace(/\s+/g, ' '));
      for (const q of ld.mainEntity) {
        if (!visible.includes(q.name)) fail(`${p.path}: FAQ question not visible: ${q.name}`);
        if ((p.path.startsWith('/tools/') || p.path.startsWith('/devices/')) && !visible.includes(q.acceptedAnswer.text)) fail(`${p.path}: FAQ answer not visible: ${q.name}`);
      }
    }
  }
}

// Counts
const pairPages = pages.filter((p) => /^\/tools\/relx-device-compare\/.+-vs-.+/.test(p.path));
const helpPages = pages.filter((p) => p.path.startsWith('/help/relx-') && data.symptoms.some((s) => p.path === `/help/relx-${s.slug}`));
const devicePages = pages.filter((p) => p.path.startsWith('/devices/relx-'));
if (pairPages.length !== 15) fail(`expected 15 pair pages, got ${pairPages.length}`);
if (helpPages.length !== 8) fail(`expected 8 help pages, got ${helpPages.length}`);
if (devicePages.length !== data.devices.length) fail(`expected ${data.devices.length} device pages, got ${devicePages.length}`);
// hub + 15 pairs + help hub + 8 symptoms (spec: 25) + modes guide + devices index + device pages
const expectTools = 25 + 2 + data.devices.length;
if (toolPaths.length !== expectTools) fail(`sitemap-tools.xml should list ${expectTools} URLs, got ${toolPaths.length}`);
const sm = fs.readFileSync(path.join(DIST, 'sitemap-tools.xml'), 'utf8');
if ((sm.match(/<url>/g) || []).length !== expectTools) fail('sitemap-tools.xml URL count');
if (!fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8').includes('/sitemap-tools.xml')) fail('sitemap index missing sitemap-tools.xml');

// Redirects cover every reversed pair
const redirects = fs.readFileSync(path.join(DIST, '_redirects'), 'utf8');
const ids = data.devices.map((d) => d.id);
for (let i = 0; i < ids.length; i++)
  for (let j = i + 1; j < ids.length; j++)
    if (!redirects.includes(`/tools/relx-device-compare/${ids[j]}-vs-${ids[i]}  /tools/relx-device-compare/${ids[i]}-vs-${ids[j]}  301`))
      fail(`missing redirect for ${ids[j]}-vs-${ids[i]}`);

// Headers: embed is frameable, nothing else is
const headers = fs.readFileSync(path.join(DIST, '_headers'), 'utf8');
if (!/\/embed\/relx-device-chart\n  Content-Security-Policy: frame-ancestors \*/.test(headers)) fail('_headers: embed frame-ancestors *');

// JS budget
const jsSize = fs.statSync(path.join(DIST, 'assets/tool.js')).size;
if (jsSize > 15 * 1024) fail(`tool.js is ${jsSize} bytes (budget 15 KB)`);

if (errors.length) {
  console.error(`QA failed with ${errors.length} error(s):\n- ` + errors.join('\n- '));
  process.exit(1);
}
console.log(`QA passed: ${pages.length} pages, 15 pairs, 8 help pages, ${devicePages.length} device pages, ${expectTools} tool URLs in sitemap, tool.js ${jsSize} bytes.`);
