// Static site generator for the RELX device guide. Zero dependencies.
// Usage: node build.js   ->   writes ./dist
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cfg = require('./site.config');
const data = require('./data/relx');
const seo = require('./data/seo');

const DIST = path.join(__dirname, 'dist');
const SRC = path.join(__dirname, 'src');

// ---------- helpers ----------
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const abs = (p) => cfg.siteUrl + p;
const shop = (p = '/') => cfg.shopUrl + p;
const wa = (text) => `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(text)}`;
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const listAnd = (items) => (items.length < 2 ? items.join('') : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]);
const prettyDate = (iso) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

const devices = data.devices;
const byId = Object.fromEntries(devices.map((d) => [d.id, d]));
const order = Object.fromEntries(devices.map((d, i) => [d.id, i]));
const pods = data.pods;
const stocked = devices.filter((d) => d.stocked);
const has = (v) => v && v.value != null && v.status !== 'not_confirmed' && v.status !== 'not_applicable';

const HUB = '/tools/relx-device-compare';
const HELP = '/help';
const pairSlug = (a, b) => (order[a] <= order[b] ? `${a}-vs-${b}` : `${b}-vs-${a}`);
const pairPath = (a, b) => `${HUB}/${pairSlug(a, b)}`;
const helpPath = (slug) => `${HELP}/relx-${slug}`;
const DEV = '/devices';
const devicePath = (id) => `${DEV}/relx-${id}`;
const MODES = helpPath(seo.modesGuide.slug);

const pairs = [];
for (let i = 0; i < devices.length; i++)
  for (let j = i + 1; j < devices.length; j++) pairs.push([devices[i], devices[j]]);

// ---------- assets ----------
const files = {}; // relative dist path -> content
const css = fs.readFileSync(path.join(SRC, 'site.css'), 'utf8');
const js = fs.readFileSync(path.join(SRC, 'tool.js'), 'utf8');
// Inline the stylesheet: it is small, and inlining removes the only render-blocking request.
const cssMin = css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,>])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();
const jsUrl = `/assets/tool.js?v=${hash(js)}`;
files['assets/tool.js'] = js;
for (const f of fs.readdirSync(path.join(SRC, 'img'))) files[`assets/img/${f}`] = fs.readFileSync(path.join(SRC, 'img', f));
files['favicon.ico'] = files['assets/img/favicon-32.png']; // browsers that ask for /favicon.ico accept PNG data

// ---------- value rendering ----------
// The only path from data to HTML. not_confirmed can never render as a fact.
function val(v) {
  if (!v || v.status === 'not_confirmed' || v.value == null) {
    if (v && v.status === 'not_applicable') return '<span class="na" aria-label="Not applicable">—</span>';
    return '<span class="nc">Not confirmed</span>';
  }
  return esc(v.value);
}

function fitBadge(f) {
  if (!f || f.status === 'not_confirmed') return '<span class="fit fit-nc">Not confirmed</span>';
  if (f.fit === 'fits') return '<span class="fit fit-yes">Fits</span>';
  if (f.fit === 'usually') return '<span class="fit fit-maybe">Usually fits, check the pack</span>';
  return '<span class="fit fit-nc">Not confirmed</span>';
}

function fitCell(deviceId, podId) {
  const f = data.fits[deviceId] && data.fits[deviceId][podId];
  let out = fitBadge(f);
  if (f && has(f.note)) out += `<small class="sub">${esc(f.note.value)}</small>`;
  return out;
}

function fitText(deviceId, podId) {
  const f = data.fits[deviceId][podId];
  if (f.fit === 'fits') return 'fits';
  if (f.fit === 'usually') return 'usually fits; check the pack';
  return 'not confirmed';
}

const modeNames = (d) => {
  const v = d.specs.modes.value || '';
  return v.includes(':') ? v.split(':')[1].trim().split(/,\s*/) : [];
};
const modeCount = (d) => (has(d.specs.modes) ? d.specs.modes.count : null); // null = unknown
const chargeMinutes = (d) => {
  if (!has(d.specs.chargeTime)) return null;
  const mm = d.specs.chargeTime.value.match(/(\d+)/);
  return mm ? Number(mm[1]) : null;
};

// ---------- device art ----------
const TONES = {
  'infinity-2': ['#1f2937', '#60a5fa'],
  'infinity-2-plus': ['#334155', '#a78bfa'],
  infinity: ['#374151', '#34d399'],
  'infinity-plus': ['#475569', '#f472b6'],
  essential: ['#6b7280', '#fbbf24'],
  artisan: ['#78350f', '#fcd34d'],
};
function deviceArt(id) {
  const [body, glow] = TONES[id] || ['#374151', '#9ca3af'];
  return `<svg class="art" viewBox="0 0 40 96" width="28" height="68" aria-hidden="true" focusable="false"><rect x="12" y="2" width="16" height="22" rx="6" fill="#d1d5db"/><rect x="8" y="20" width="24" height="72" rx="10" fill="${body}"/><circle cx="20" cy="78" r="3" fill="${glow}"/></svg>`;
}

// ---------- icons ----------
const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
const ICONS = {
  compare: svg('<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>'),
  device: svg('<rect x="8" y="6" width="8" height="16" rx="3"/><path d="M10 6V3h4v3"/><circle cx="12" cy="17" r="1"/>'),
  help: svg('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z"/>'),
  bag: svg('<path d="M6 7h12l1 14H5z"/><path d="M9 7a3 3 0 0 1 6 0"/>'),
};

// ---------- layout ----------
function breadcrumbs(items) {
  const html = `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items
    .map((it, i) =>
      i === items.length - 1 ? `<li aria-current="page">${esc(it.name)}</li>` : `<li><a href="${it.path}">${esc(it.name)}</a></li>`
    )
    .join('')}</ol></nav>`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  };
  return { html, schema };
}

function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

const ORG = { '@type': 'Organization', name: cfg.brand, url: shop('/'), logo: abs('/assets/img/apple-touch-icon.png'), sameAs: cfg.social };

const pages = []; // { path, title, desc, indexable }

function page({ urlPath, file, title, desc, body, schema = [], robots = 'index, follow', waText, main = 'main', extraHead = '', hero = '' }) {
  const cur = (p) => (urlPath === p || urlPath.startsWith(p + '/') ? ' aria-current="page"' : '');
  const canonical = abs(urlPath === '/' ? '/' : urlPath);
  const ld = schema.map((s) => `<script type="application/ld+json">${JSON.stringify(s).replace(/</g, '\\u003c')}</script>`).join('\n');
  const waLink = wa(waText || `Hi, I'm on the ${title} page.`);
  const html = `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${esc(cfg.siteName)}">
<meta property="og:image" content="${abs('/assets/img/og-image.jpg')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#162d4a">
<link rel="icon" href="/assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/assets/img/favicon-64.png" sizes="64x64" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<style>${cssMin}</style>
<script>document.documentElement.className='js'</script>
${extraHead}${ld}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap bar">
    <a class="logo" href="/" aria-label="${esc(cfg.siteName)} home"><img src="/assets/img/logo-mark.webp" width="28" height="48" alt=""><span class="wordmark"><b>RELX</b><span>PODS</span></span><span class="logo-tag">Guide</span></a>
    <nav class="nav" aria-label="Main">
      <ul>
        <li><a href="/"${urlPath === '/' ? ' aria-current="page"' : ''}>Home</a></li>
        <li><a href="${DEV}"${cur(DEV)}>Devices</a></li>
        <li><a href="${HUB}"${cur(HUB)}>Compare</a></li>
        <li><a href="${HELP}"${cur(HELP)}>Help center</a></li>
      </ul>
    </nav>
    <a class="btn btn-sm header-shop" href="${shop('/')}">${ICONS.bag}Shop RELX Dubai</a>
  </div>
</header>
${hero}
<${main} id="main" class="wrap">
${body}
</${main}>
<footer class="site-footer">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <a class="logo" href="/"><img src="/assets/img/logo-mark.webp" width="28" height="48" alt="" loading="lazy"><span class="wordmark"><b>RELX</b><span>PODS</span></span></a>
      <p>Free, fact-checked RELX guides for the UAE: compare devices, see which pods fit, and fix common problems.</p>
      <p class="age">${esc(cfg.ageLine)}</p>
    </div>
    <div>
      <p class="foot-h">Guides</p>
      <ul class="foot-links">
        <li><a href="${DEV}">Kinds of RELX devices</a></li>
        <li><a href="${HUB}">RELX device comparison</a></li>
        <li><a href="${HUB}#compatible-pods">Pod compatibility chart</a></li>
      </ul>
    </div>
    <div>
      <p class="foot-h">Help</p>
      <ul class="foot-links">
        <li><a href="${HELP}">Help center</a></li>
        <li><a href="${MODES}">Change modes on Infinity 2</a></li>
        <li><a href="/about">About this guide</a></li>
      </ul>
    </div>
    <div>
      <p class="foot-h">Shop</p>
      <ul class="foot-links">
        <li>Shop at&nbsp;<a href="${shop('/')}">RELX Dubai</a></li>
        <li><a href="${waLink}" data-track="whatsapp_click" data-page="${esc(urlPath)}">WhatsApp us</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap foot-bottom">
    <p>Data updated <time datetime="${data.updated_at}">${prettyDate(data.updated_at)}</time>. Specs show only what UAE sources confirm or most of them agree on.</p>
  </div>
</footer>
<script src="${jsUrl}" defer></script>
</body>
</html>
`;
  files[file] = html;
  pages.push({ path: urlPath, file, title, desc, indexable: robots.startsWith('index') });
}

// ---------- compare: shared pieces ----------
function devicePicker(name, label, selected) {
  return `<fieldset class="picker" role="radiogroup" aria-labelledby="lbl-${name}">
  <legend id="lbl-${name}">${esc(label)}</legend>
  <div class="cards">${devices
    .map(
      (d) => `
    <label class="card-opt"><input type="radio" name="${name}" value="${d.id}"${d.id === selected ? ' checked' : ''}>
      <span class="card-face">${deviceArt(d.id)}<span class="card-name">${esc(d.short)}</span>${d.stocked ? '<span class="card-tag">At RelxPods</span>' : ''}</span></label>`
    )
    .join('')}
  </div>
</fieldset>`;
}

function pickers(a, b) {
  return `<form class="pickers" id="pickers" action="${HUB}" onsubmit="return false">
  ${devicePicker('a', 'First device', a)}
  <p class="vs" aria-hidden="true">vs</p>
  ${devicePicker('b', 'Second device', b)}
</form>
<p class="same-warn" id="same-warn" role="alert" hidden>Pick two different devices.</p>`;
}

function answerSentence(a, b) {
  const ca = modeCount(a);
  const cb = modeCount(b);
  // 1. Only one device has power modes (the other must be known to have none).
  if (ca > 0 && cb === 0) return `The ${a.name} has three power modes; the ${b.name} doesn't.`;
  if (cb > 0 && ca === 0) return `The ${b.name} has three power modes; the ${a.name} doesn't.`;
  // 2. Only one device is stocked.
  if (a.stocked !== b.stocked) {
    const [s, o] = a.stocked ? [a, b] : [b, a];
    return `The ${s.name} is available from RelxPods with 1-hour Dubai delivery; the ${o.name} isn't stocked.`;
  }
  // 3. Both stocked.
  if (a.stocked && b.stocked) {
    const [p, q] = ca > 0 ? [a, b] : [b, a];
    const reasons = [];
    if (modeCount(p) > 0) reasons.push('power modes');
    const mp = chargeMinutes(p);
    const mq = chargeMinutes(q);
    if (mp != null && mq != null && mp < mq) reasons.push('faster charging');
    if (reasons.length && has(q.specs.body))
      return `Both are stocked at RelxPods. Choose the ${p.name} for ${listAnd(reasons)}, or the ${q.name} for a premium finish.`;
    return `Both are stocked at RelxPods, and both take RELX Pod Pro.`;
  }
  // 4. Fallback.
  return 'Both take RELX Pod Pro; check below for RELX Pod Pro 2.';
}

function specRow(label, va, vb, id) {
  if (!has(va) && !has(vb)) return ''; // hide only when neither device has data
  return `<tr${id ? ` id="${id}"` : ''}><th scope="row">${esc(label)}</th><td>${val(va)}</td><td>${val(vb)}</td></tr>`;
}

function priceCell(d) {
  return d.stocked
    ? `<a href="${shop(d.category)}" data-track="buy_click" data-device="${d.id}">See today's price</a>`
    : '<span class="muted">Not stocked</span>';
}

function compareTable(a, b) {
  const rows = [
    `<tr id="row-fits"><th scope="row">Fits RELX Pod Pro</th><td>${fitCell(a.id, 'pod-pro')}</td><td>${fitCell(b.id, 'pod-pro')}</td></tr>`,
    `<tr><th scope="row">Fits RELX Pod Pro 2</th><td>${fitCell(a.id, 'pod-pro-2')}</td><td>${fitCell(b.id, 'pod-pro-2')}</td></tr>`,
    specRow('Power modes', a.specs.modes, b.specs.modes),
    specRow('Mode output', a.specs.modeOutput, b.specs.modeOutput),
    specRow('Mode light colors', a.specs.modeLights, b.specs.modeLights),
    specRow('Battery', a.specs.battery, b.specs.battery),
    specRow('Charge time', a.specs.chargeTime, b.specs.chargeTime),
    specRow('Charging port', a.specs.port, b.specs.port),
    specRow('Body', a.specs.body, b.specs.body),
    `<tr><th scope="row">Price at RelxPods</th><td>${priceCell(a)}</td><td>${priceCell(b)}</td></tr>`,
  ];
  if (a.stocked || b.stocked) {
    const buy = (d) =>
      d.stocked
        ? `<a class="btn btn-buy" href="${shop(d.category)}" data-track="buy_click" data-device="${d.id}">Buy ${esc(d.short)}</a>`
        : '<span class="na" aria-label="Not stocked">—</span>';
    rows.push(`<tr class="row-buy"><th scope="row">Buy</th><td>${buy(a)}</td><td>${buy(b)}</td></tr>`);
  }
  const head = (d) =>
    `<th scope="col">${deviceArt(d.id)}<a class="th-name" href="${devicePath(d.id)}">${esc(d.name)}</a><small class="sub">${esc(d.generation)}${
      d.alias ? `, also sold as ${esc(d.alias)}` : ''
    }</small></th>`;
  return `<div class="table-wrap"><table class="compare">
  <caption class="vh">RELX ${esc(a.short)} vs ${esc(b.short)} comparison</caption>
  <thead><tr><td></td>${head(a)}${head(b)}</tr></thead>
  <tbody>${rows.filter(Boolean).join('\n')}</tbody>
</table></div>`;
}

function podCards(a, b) {
  return `<div class="pod-cards">${pods
    .map(
      (p) => `
  <article class="pod-card">
    <h3>${esc(p.name)}</h3>
    <ul class="pod-fit">
      <li><span>${esc(a.short)}</span>${fitBadge(data.fits[a.id][p.id])}</li>
      <li><span>${esc(b.short)}</span>${fitBadge(data.fits[b.id][p.id])}</li>
    </ul>
    <dl class="facts">
      <div><dt>E-liquid</dt><dd>${val(p.liquid)} per pod</dd></div>
      <div><dt>Pack</dt><dd>${val(p.perPack)}</dd></div>
      <div><dt>Nicotine at RelxPods</dt><dd>${esc(p.nicotine.value)}</dd></div>
      <div><dt>Puffs per pod</dt><dd>${val(p.puffs)}</dd></div>
      <div><dt>Coil</dt><dd>${val(p.coil)}</dd></div>
    </dl>
    <a class="btn" href="${shop(p.category)}" data-track="buy_click" data-device="${p.id}">Shop ${esc(p.name)} flavors</a>
  </article>`
    )
    .join('')}
</div>`;
}

function compareResult(a, b) {
  return `<section id="compare-result" class="result" aria-live="polite" data-pair="${pairSlug(a.id, b.id)}">
  <p class="answer">${esc(answerSentence(a, b))}</p>
  ${compareTable(a, b)}
  <h2 class="h3">Pods that fit both</h2>
  ${podCards(a, b)}
</section>`;
}

function pairFaqs(a, b) {
  const pp2 = [a, b].map((d) => {
    const f = data.fits[d.id]['pod-pro-2'];
    if (f.fit === 'fits')
      return `The ${d.name} takes RELX Pod Pro 2${has(f.note) ? ', which is needed for its power modes' : ''}.`;
    if (f.fit === 'usually') return `RELX Pod Pro 2 usually fits the ${d.name}; check the pack.`;
    return `RELX Pod Pro 2 fit for the ${d.name} is not confirmed.`;
  });
  const modes = [a, b].map((d) => {
    const n = modeCount(d);
    if (n > 0) return `The ${d.name} has three power modes: ${listAnd(modeNames(d))}.`;
    if (n === 0) return `The ${d.name} has a single output and no power modes.`;
    return `Power modes for the ${d.name} are not confirmed.`;
  });
  let buy;
  if (a.stocked && b.stocked) buy = `Yes. RelxPods stocks both the ${a.name} and the ${b.name}, with 1-hour Dubai delivery.`;
  else if (a.stocked || b.stocked) {
    const [s, o] = a.stocked ? [a, b] : [b, a];
    buy = `RelxPods stocks the ${s.name}, with 1-hour Dubai delivery. The ${o.name} isn't stocked.`;
  } else
    buy = `Neither is stocked at RelxPods. RelxPods stocks the ${listAnd(stocked.map((d) => d.name))}, and both devices also take RELX Pod Pro.`;
  return [
    { q: `Do the RELX ${a.short} and RELX ${b.short} use the same pods?`, a: `Yes, both take RELX Pod Pro. ${pp2.join(' ')}` },
    { q: `Which has power modes, the RELX ${a.short} or the RELX ${b.short}?`, a: modes.join(' ') },
    { q: `Can I buy the RELX ${a.short} or the RELX ${b.short} at RelxPods?`, a: buy },
  ];
}

function faqHtml(faqs) {
  return `<div class="faq">${faqs
    .map((f) => `<details><summary><h3>${esc(f.q)}</h3></summary><p>${esc(f.a)}</p></details>`)
    .join('')}</div>`;
}

function relatedPairs(a, b, n = 3) {
  return pairs
    .filter(([x, y]) => !(x === a && y === b) && (x === a || y === a || x === b || y === b))
    .sort((p, q) => (q[0].stocked + q[1].stocked) - (p[0].stocked + p[1].stocked))
    .slice(0, n);
}

function compatChart() {
  return `<div class="table-wrap"><table class="compare compat">
  <caption class="vh">Which RELX pods fit each RELX device</caption>
  <thead><tr><td><span class="vh">Device</span></td>${pods.map((p) => `<th scope="col">${esc(p.name)}</th>`).join('')}</tr></thead>
  <tbody>${devices
    .map((d) => `<tr><th scope="row"><a href="${devicePath(d.id)}">${esc(d.name)}</a></th>${pods.map((p) => `<td>${fitCell(d.id, p.id)}</td>`).join('')}</tr>`)
    .join('\n')}</tbody>
</table></div>`;
}

const pairLink = ([x, y]) => `<a href="${pairPath(x.id, y.id)}">RELX ${esc(x.short)} vs ${esc(y.short)}</a>`;
const allPairsList = () => `<ul class="link-grid">${pairs.map((p) => `<li>${pairLink(p)}</li>`).join('')}</ul>`;

// ---------- compare pair pages ----------
for (const [a, b] of pairs) {
  const slug = pairSlug(a.id, b.id);
  const urlPath = `${HUB}/${slug}`;
  const faqs = pairFaqs(a, b);
  const crumbs = breadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: 'RELX Device Compare', path: HUB },
    { name: `${a.short} vs ${b.short}`, path: urlPath },
  ]);
  const waText = `Hi, I'm on the ${a.short} vs ${b.short} page.`;
  const body = `${crumbs.html}
<h1>RELX ${esc(a.short)} vs ${esc(b.short)}</h1>
${seo.pairs[slug] ? `<p class="muted">${esc(seo.pairs[slug].also)}</p>` : ''}
${pickers(a.id, b.id)}
${compareResult(a, b)}
<section>
  <h2>More comparisons</h2>
  <ul class="link-grid">${relatedPairs(a, b).map((p) => `<li>${pairLink(p)}</li>`).join('')}</ul>
  <p><a href="${HUB}">See all RELX device comparisons</a></p>
</section>
<section>
  <h2>FAQ</h2>
  ${faqHtml(faqs)}
</section>
<aside class="cta-band">
  <p>Questions about the ${esc(a.short)} or ${esc(b.short)}? Ask us before you order.</p>
  <a class="btn btn-wa" href="${wa(waText)}" data-track="whatsapp_click" data-page="${urlPath}">Chat on WhatsApp</a>
</aside>`;
  page({
    urlPath,
    file: `tools/relx-device-compare/${slug}.html`,
    title: `RELX ${a.short} vs ${b.short}: Which Should You Buy?`,
    desc: `RELX ${a.short} vs ${b.short} compared: pods that fit, power modes, battery and charging, and price in the UAE.`,
    body,
    schema: [crumbs.schema, faqSchema(faqs)],
    waText,
  });
}

// ---------- compare hub ----------
{
  const [a, b] = [byId['infinity-2'], byId['artisan']];
  const crumbs = breadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: 'RELX Device Compare', path: HUB },
  ]);
  const embedCode = `<iframe src="${abs('/embed/relx-device-chart')}" title="RELX device comparison chart" width="100%" height="520" style="border:0;max-width:720px" loading="lazy"></iframe>
<p>Source: <a href="${abs(HUB)}">RELX device comparison by RelxPods</a></p>`;
  const body = `${crumbs.html}
<h1>RELX Device Comparison</h1>
<p class="lead">${esc(seo.compareHub.lead)}</p>
${pickers(a.id, b.id)}
${compareResult(a, b)}
<section id="compatible-pods">
  <h2>Which pods are compatible with RELX devices?</h2>
  <p>Every RELX device here takes RELX Pod Pro. RELX Pod Pro 2 fits most of them and is needed for the power modes on the Infinity 2 and Infinity 2 Plus.</p>
  ${compatChart()}
</section>
<section>
  <h2>Popular comparisons</h2>
  <ul class="link-grid">${data.popular
    .map((s) => {
      const [x, y] = s.split('-vs-').map((id) => byId[id]);
      return `<li>${pairLink([x, y])}</li>`;
    })
    .join('')}</ul>
</section>
<section>
  <h2>All RELX device comparisons</h2>
  ${allPairsList()}
</section>
<section id="embed">
  <h2>Add this chart to your site</h2>
  <p>Free to use. Copy the code below to show the RELX device chart on your blog or store.</p>
  <textarea class="embed-code" id="embed-code" rows="4" readonly aria-label="Embed code">${esc(embedCode)}</textarea>
  <button class="btn" type="button" id="embed-copy" data-track="embed_copy">Copy embed code</button>
  <span class="muted" id="embed-copied" role="status"></span>
</section>`;
  page({
    urlPath: HUB,
    file: 'tools/relx-device-compare.html',
    title: seo.compareHub.title,
    desc: seo.compareHub.desc,
    body,
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'RELX Device Compare',
        url: abs(HUB),
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'AED' },
        publisher: ORG,
      },
      crumbs.schema,
    ],
    waText: "Hi, I'm on the RELX device compare page.",
  });
}

// ---------- help ----------
const deviceChoices = [...devices.map((d) => ({ id: d.id, label: d.short, name: d.name })), { id: 'unsure', label: "I'm not sure", name: 'RELX device' }];

function deviceSelector(name, legend, selected = 'unsure') {
  return `<fieldset class="chips" role="radiogroup" aria-labelledby="lbl-${name}">
  <legend id="lbl-${name}">${esc(legend)}</legend>
  ${deviceChoices
    .map(
      (d) =>
        `<label class="chip"><input type="radio" name="${name}" value="${d.id}" data-name="${esc(d.name)}"${d.id === selected ? ' checked' : ''}><span>${esc(d.label)}</span></label>`
    )
    .join('')}
</fieldset>`;
}

function replaceBlock() {
  return `<div class="replace">
  <div><h3>Replace the pod if</h3><ul>${data.replace_rules.pod.map((r) => `<li>${esc(r)}.</li>`).join('')}</ul></div>
  <div><h3>Replace the device if</h3><ul>${data.replace_rules.device.map((r) => `<li>${esc(r)}.</li>`).join('')}</ul></div>
</div>`;
}
const replaceText = () =>
  `Replace the pod if: ${data.replace_rules.pod.join(', ').toLowerCase()}. Replace the device if: ${data.replace_rules.device
    .join(', ')
    .replace(/^I/, 'i')
    .toLowerCase()}.`;

const DEFAULT_DEVICE = 'RELX device';
const fill = (s) => s.replace(/\{device\}/g, DEFAULT_DEVICE);
const fillHtml = (s) => esc(s).replace(/\{device\}/g, `<span data-device>${DEFAULT_DEVICE}</span>`);

for (const s of data.symptoms) {
  const urlPath = helpPath(s.slug);
  const crumbs = breadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Help center', path: HELP },
    { name: s.h1.replace(/^RELX /, ''), path: urlPath },
  ]);
  const stepsText = s.steps.map((st, i) => `${i + 1}. ${fill(st)}`).join(' ') + ' ' + s.then;
  const faqs = [
    { q: s.question, a: `Likely causes: ${s.causes.join('; ').toLowerCase()}.` },
    { q: 'How do I fix it?', a: stepsText },
    { q: 'Should I replace the pod or the device?', a: replaceText() },
  ];
  const steps = s.steps
    .map((st, i) => {
      let li = fillHtml(st);
      if (i === s.compatStep) li += ` <a href="${HUB}#compatible-pods">See which pods are compatible with each RELX device</a>.`;
      return `<li>${li}</li>`;
    })
    .join('');
  let thenHtml = esc(s.then);
  if (s.thenLink) {
    const t = data.symptoms.find((x) => x.slug === s.thenLink);
    thenHtml += ` <a href="${helpPath(t.slug)}">${esc(t.h1)}: fixes</a>`;
  }
  const ctas =
    s.kind === 'pod'
      ? pods.map((p) => `<a class="btn" href="${shop(p.category)}" data-track="buy_click" data-device="${p.id}">Shop ${esc(p.name)}</a>`)
      : stocked.map((d) => `<a class="btn" href="${shop(d.category)}" data-track="buy_click" data-device="${d.id}">Shop ${esc(d.name)}</a>`);
  const waText = `Hi, my ${DEFAULT_DEVICE} has this problem: ${s.problem}.`;
  const body = `${crumbs.html}
<h1>${esc(s.h1)}</h1>
<p class="lead">Fixes for your <span data-device>${DEFAULT_DEVICE}</span>. The steps are the same for every RELX device in this guide.</p>
${deviceSelector('device', 'Your device')}
<section>
  <h2>${esc(s.question)}</h2>
  <p>Likely causes:</p>
  <ul>${s.causes.map((cz) => `<li>${esc(cz)}</li>`).join('')}</ul>
</section>
<section>
  <h2>How do I fix it?</h2>
  <ol class="steps">${steps}</ol>
  <p class="then"><strong>Then:</strong> ${thenHtml}</p>
</section>
<section>
  <h2>Should I replace the pod or the device?</h2>
  ${replaceBlock()}
</section>
<aside class="cta-band">
  <div class="cta-shop">${ctas.join('')}</div>
  <p><strong>Still stuck?</strong> Message us and we'll help.</p>
  <a class="btn btn-wa" id="wa-help" href="${wa(waText)}" data-problem="${esc(s.problem)}" data-track="whatsapp_click" data-page="${urlPath}">Chat on WhatsApp</a>
</aside>
<section>
  <h2>Other RELX problems</h2>
  <ul class="link-grid">${data.symptoms
    .filter((x) => x !== s)
    .map((x) => `<li><a href="${helpPath(x.slug)}">${esc(x.h1)}</a></li>`)
    .join('')}</ul>
</section>`;
  page({
    urlPath,
    file: `help/relx-${s.slug}.html`,
    title: `${s.h1}? Causes and Fixes`,
    desc: `Why your RELX ${s.phrase} and how to fix it, step by step, for Infinity, Essential and Artisan devices.`,
    body,
    schema: [crumbs.schema, faqSchema(faqs)],
    waText,
  });
}

// help hub
{
  const crumbs = breadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Help center', path: HELP },
  ]);
  const body = `${crumbs.html}
<h1>${esc(seo.helpHub.h1)}</h1>
<p class="lead">${esc(seo.helpHub.lead)}</p>
<div class="help-steps" id="help-picker">
  <section>
    <h2 class="h3">Step 1: Pick your device</h2>
    ${deviceSelector('device', 'Your device')}
  </section>
  <section>
    <h2 class="h3">Step 2: Pick what you see</h2>
    <ul class="symptoms">${data.symptoms
      .map((s) => `<li><a class="sym" href="${helpPath(s.slug)}" data-symptom="${s.slug}">${esc(s.h1.replace(/^RELX /, ''))}</a></li>`)
      .join('')}</ul>
  </section>
</div>
<section>
  <h2>Guides</h2>
  <ul class="link-grid"><li><a href="${MODES}">${esc(seo.modesGuide.h1)}</a></li></ul>
</section>
<section>
  <h2>When to replace the pod vs the device</h2>
  ${replaceBlock()}
</section>
<aside class="cta-band">
  <p><strong>Still stuck?</strong> Message us and we'll help.</p>
  <a class="btn btn-wa" href="${wa("Hi, I'm on the RELX help center and need help with my device.")}" data-track="whatsapp_click" data-page="${HELP}">Chat on WhatsApp</a>
</aside>`;
  page({
    urlPath: HELP,
    file: 'help.html',
    title: seo.helpHub.title,
    desc: seo.helpHub.desc,
    body,
    schema: [crumbs.schema],
    waText: "Hi, I'm on the RELX help center.",
  });
}

// ---------- devices ----------
function fitSentence(d) {
  const pp2 = data.fits[d.id]['pod-pro-2'];
  const pp = data.fits[d.id]['pod-pro'];
  let out = `The ${d.name} takes RELX Pod Pro${has(pp.note) ? ` (it ${pp.note.value.charAt(0).toLowerCase() + pp.note.value.slice(1)})` : ''}`;
  if (pp2.fit === 'fits') out += ` and RELX Pod Pro 2${has(pp2.note) ? `, which is needed for the power modes` : ''}.`;
  else if (pp2.fit === 'usually') out += '. RELX Pod Pro 2 usually fits too; check the pack.';
  else out += '. RELX Pod Pro 2 fit is not confirmed.';
  return out;
}

function deviceSummary(d) {
  const parts = [];
  if (has(d.specs.battery)) parts.push(`a ${d.specs.battery.value} battery`);
  const n = modeCount(d);
  if (n > 0) parts.push('three power modes');
  if (n === 0) parts.push('a single output with no power modes');
  if (has(d.specs.port)) parts.push(`${d.specs.port.value} charging`);
  return parts.length ? `The ${d.name} has ${listAnd(parts)}.` : `Most specs for the ${d.name} are not confirmed yet.`;
}

function deviceFaqs(d) {
  const faqs = [{ q: `What pods are compatible with the ${d.name}?`, a: fitSentence(d) }];
  if (has(d.specs.chargeTime))
    faqs.push({ q: `How long does the ${d.name} take to charge?`, a: `${d.specs.chargeTime.value}${has(d.specs.port) ? `, over ${d.specs.port.value}` : ''}.` });
  if (has(d.specs.battery)) faqs.push({ q: `What is the ${d.name} battery size?`, a: `The ${d.name} has a ${d.specs.battery.value} battery.` });
  const n = modeCount(d);
  if (n > 0) faqs.push({ q: `Does the ${d.name} have power modes?`, a: `Yes. The ${d.name} has three power modes: ${listAnd(modeNames(d))}.` });
  if (n === 0) faqs.push({ q: `Does the ${d.name} have power modes?`, a: `No. The ${d.name} has a single output and no power modes.` });
  return faqs;
}

for (const d of devices) {
  const urlPath = devicePath(d.id);
  const ds = seo.devices[d.id];
  const crumbs = breadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Devices', path: DEV },
    { name: d.name, path: urlPath },
  ]);
  const faqs = deviceFaqs(d);
  const specRows = [
    ['Battery', d.specs.battery],
    ['Charge time', d.specs.chargeTime],
    ['Charging port', d.specs.port],
    ['Power modes', d.specs.modes],
    ['Mode output', d.specs.modeOutput],
    ['Mode light colors', d.specs.modeLights],
    ['Body', d.specs.body],
  ]
    // Core specs always show (as "Not confirmed" if unknown); extras only when known.
    .filter(([label, v], i) => i < 4 || has(v))
    .map(([label, v]) => `<tr><th scope="row">${esc(label)}</th><td>${val(v)}</td></tr>`)
    .join('');
  const n = modeCount(d);
  let modesHtml = '';
  if (n > 0) {
    modesHtml = `<section>
  <h2>${esc(d.name)} power modes</h2>
  <p>The ${esc(d.name)} has three power modes: ${esc(listAnd(modeNames(d)))}.${has(d.specs.modeOutput) ? ` Output: ${esc(d.specs.modeOutput.value)}.` : ''}${has(d.specs.modeLights) ? ` Lights: ${esc(d.specs.modeLights.value)}.` : ''}</p>
  <p>The modes only unlock with RELX Pod Pro 2. <a href="${MODES}">How to change modes on the RELX Infinity 2</a></p>
</section>`;
  }
  const buy = d.stocked
    ? `<a class="btn btn-buy" href="${shop(d.category)}" data-track="buy_click" data-device="${d.id}">Buy the ${esc(d.name)} at RelxPods</a>`
    : `<p>The ${esc(d.name)} isn't stocked at RelxPods. RelxPods stocks the ${stocked
        .map((x) => `<a href="${devicePath(x.id)}">${esc(x.name)}</a>`)
        .join(' and ')}, which take the same pods.</p>`;
  const waText = `Hi, I have a question about the ${d.name}.`;
  const body = `${crumbs.html}
<div class="device-head">${deviceArt(d.id)}<div>
<h1>${esc(d.name)} Device</h1>
<p class="lead">${esc(deviceSummary(d))} ${esc(fitSentence(d))}</p>
</div></div>
<section>
  <h2>${esc(d.name)} specs</h2>
  <div class="table-wrap"><table class="compare spec-table"><caption class="vh">${esc(d.name)} specifications</caption><tbody>${specRows}</tbody></table></div>
</section>
<section>
  <h2>What pods fit the ${esc(d.name)}?</h2>
  <ul class="pod-fit pod-fit-lg">${pods
    .map((p) => `<li><a href="${shop(p.category)}" data-track="buy_click" data-device="${p.id}">${esc(p.name)}</a>${fitCell(d.id, p.id)}</li>`)
    .join('')}</ul>
  <p><a href="${HUB}#compatible-pods">See which pods fit every RELX device</a></p>
</section>
${modesHtml}
<section>
  <h2>Compare the ${esc(d.name)}</h2>
  <ul class="link-grid">${pairs
    .filter(([x, y]) => x === d || y === d)
    .map((p) => `<li>${pairLink(p)}</li>`)
    .join('')}</ul>
</section>
<section>
  <h2>${esc(d.name)} problems</h2>
  <ul class="link-grid">${data.symptoms
    .map((x) => `<li><a href="${helpPath(x.slug)}?device=${d.id}">${esc(x.h1.replace(/^RELX /, `RELX ${d.short} `))}</a></li>`)
    .join('')}</ul>
</section>
<section>
  <h2>FAQ</h2>
  ${faqHtml(faqs)}
</section>
<aside class="cta-band">
  ${buy}
  <a class="btn btn-wa" href="${wa(waText)}" data-track="whatsapp_click" data-page="${urlPath}">Ask us on WhatsApp</a>
</aside>`;
  page({
    urlPath,
    file: `devices/relx-${d.id}.html`,
    title: ds.title,
    desc: ds.desc,
    body,
    schema: [crumbs.schema, faqSchema(faqs)],
    waText,
  });
}

// devices index
{
  const crumbs = breadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Devices', path: DEV },
  ]);
  const body = `${crumbs.html}
<h1>${esc(seo.devicesHub.h1)}</h1>
<p class="lead">${esc(seo.devicesHub.lead)}</p>
<ul class="device-cards">${devices
    .map(
      (d) => `<li><a class="device-card" href="${devicePath(d.id)}">${deviceArt(d.id)}<span><strong>${esc(d.name)}</strong><span>${esc(
        deviceSummary(d)
      )}</span>${d.stocked ? '<span class="card-tag">At RelxPods</span>' : ''}</span></a></li>`
    )
    .join('')}</ul>
<section>
  <h2>Which is the best RELX device?</h2>
  <p>It depends on what you want. RelxPods stocks two: the <a href="${devicePath('infinity-2')}">RELX Infinity 2</a> has three power modes and charges faster, and the <a href="${devicePath('artisan')}">RELX Artisan</a> has a leather or metal finish. <a href="${pairPath('infinity-2', 'artisan')}">Compare the Infinity 2 vs Artisan</a>.</p>
</section>
<section>
  <h2>Which pods are compatible with RELX devices?</h2>
  ${compatChart()}
</section>
<p><a href="${HUB}">Compare any two RELX devices side by side</a></p>`;
  page({
    urlPath: DEV,
    file: 'devices.html',
    title: seo.devicesHub.title,
    desc: seo.devicesHub.desc,
    body,
    schema: [crumbs.schema],
    waText: "Hi, I'm choosing a RELX device.",
  });
}

// Infinity 2 modes guide
{
  const g = data.modes_guide;
  const sg = seo.modesGuide;
  const d = byId['infinity-2'];
  const crumbs = breadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Help center', path: HELP },
    { name: 'Change modes on Infinity 2', path: MODES },
  ]);
  const faqs = [
    { q: 'How do I change modes on the RELX Infinity 2?', a: g.steps.join(' ') },
    { q: 'What do the RELX Infinity 2 mode colors mean?', a: g.modes.map((x) => `${x.light} is ${x.name} (${x.output}).`).join(' ') },
    { q: "Why won't my RELX Infinity 2 change modes?", a: `${g.needs} ${g.stuck.join(' ')}` },
  ];
  const body = `${crumbs.html}
<h1>${esc(sg.h1)}</h1>
<p class="lead">${esc(g.needs)}</p>
<section>
  <h2>${esc(faqs[0].q)}</h2>
  <ol class="steps">${g.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
</section>
<section>
  <h2>${esc(faqs[1].q)}</h2>
  <div class="table-wrap"><table class="compare modes-table">
    <thead><tr><th scope="col">Mode</th><th scope="col">Light</th><th scope="col">Output</th><th scope="col">Best for</th></tr></thead>
    <tbody>${g.modes.map((x) => `<tr><th scope="row">${esc(x.name)}</th><td>${esc(x.light)}</td><td>${esc(x.output)}</td><td>${esc(x.use)}</td></tr>`).join('')}</tbody>
  </table></div>
</section>
<section>
  <h2>${esc(faqs[2].q)}</h2>
  <p>${esc(g.needs)}</p>
  <ul>${g.stuck.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  <p>Using the Infinity 2 Plus? It also needs RELX Pod Pro 2 for its modes, with higher output: ${esc(byId['infinity-2-plus'].specs.modeOutput.value)}.</p>
</section>
<aside class="cta-band">
  <div class="cta-shop">
    <a class="btn" href="${shop(pods[1].category)}" data-track="buy_click" data-device="pod-pro-2">Shop RELX Pod Pro 2</a>
    <a class="btn btn-buy" href="${shop(d.category)}" data-track="buy_click" data-device="${d.id}">Shop RELX Infinity 2</a>
  </div>
  <p><strong>Still stuck?</strong> Message us and we'll help.</p>
  <a class="btn btn-wa" href="${wa("Hi, my RELX Infinity 2 won't change modes.")}" data-track="whatsapp_click" data-page="${MODES}">Chat on WhatsApp</a>
</aside>
<section>
  <h2>More about the Infinity 2</h2>
  <ul class="link-grid">
    <li><a href="${devicePath(d.id)}">RELX Infinity 2 device guide</a></li>
    <li>${pairLink([d, byId['infinity-2-plus']])}</li>
    <li>${pairLink([d, byId['artisan']])}</li>
  </ul>
</section>`;
  page({
    urlPath: MODES,
    file: `help/relx-${sg.slug}.html`,
    title: sg.title,
    desc: sg.desc,
    body,
    schema: [crumbs.schema, faqSchema(faqs)],
    waText: "Hi, my RELX Infinity 2 won't change modes.",
  });
}

// ---------- home, tools, about ----------
{
  const hero = `<section class="hero">
  <div class="wrap hero-in">
    <div>
      <p class="eyebrow">Free RELX guide for the UAE</p>
      <h1>Find the right RELX device and fix it fast</h1>
      <p class="lead">Compare RELX devices side by side, see which pods fit, and solve charging, blinking and taste problems. Every spec is checked against UAE stores.</p>
      <div class="hero-cta">
        <a class="btn" href="${HUB}">${ICONS.compare}Compare devices</a>
        <a class="btn btn-ghost" href="${HELP}">${ICONS.help}Fix a problem</a>
      </div>
      <ul class="hero-stats">
        <li><b>${devices.length}</b>devices</li>
        <li><b>${pairs.length}</b>comparisons</li>
        <li><b>${data.symptoms.length + 1}</b>fixes and guides</li>
      </ul>
      <ul class="chips-row" aria-label="Popular comparisons">${data.popular
        .slice(0, 3)
        .map((p) => {
          const [x, y] = p.split('-vs-').map((id) => byId[id]);
          return `<li><a href="${pairPath(x.id, y.id)}">${esc(x.short)} vs ${esc(y.short)}</a></li>`;
        })
        .join('')}</ul>
    </div>
    <div class="hero-mark" aria-hidden="true"></div>
  </div>
</section>`;
  const body = `<section>
  <h2 class="vh">What do you need?</h2>
  <div class="tool-cards">
    <a class="tool-card" href="${DEV}"><span class="icon">${ICONS.device}</span><strong>Kinds of RELX devices</strong><span>Battery, charging and power modes for the six devices in this guide.</span><span class="go">See devices →</span></a>
    <a class="tool-card" href="${HUB}"><span class="icon">${ICONS.compare}</span><strong>Compare two devices</strong><span>Infinity 2, Artisan, Essential and more, side by side.</span><span class="go">Start comparing →</span></a>
    <a class="tool-card" href="${HELP}"><span class="icon">${ICONS.help}</span><strong>Fix a RELX problem</strong><span>Not charging, blinking, burnt taste, leaking and more.</span><span class="go">Get the fix →</span></a>
  </div>
</section>
<section>
  <h2>Popular comparisons</h2>
  <ul class="link-grid">${data.popular
    .map((s) => {
      const [x, y] = s.split('-vs-').map((id) => byId[id]);
      return `<li>${pairLink([x, y])}</li>`;
    })
    .join('')}</ul>
</section>
<section>
  <h2>Kinds of RELX devices</h2>
  <ul class="link-grid">${devices.map((d) => `<li><a href="${devicePath(d.id)}">${esc(d.name)}</a></li>`).join('')}</ul>
  <p><a href="${DEV}">Compare specs and pods for every RELX device</a></p>
</section>
<section>
  <h2>Common RELX problems</h2>
  <ul class="link-grid">${data.symptoms.map((x) => `<li><a href="${helpPath(x.slug)}">${esc(x.h1)}</a></li>`).join('')}</ul>
</section>
<section>
  <h2>RELX Pod Pro vs Pod Pro 2</h2>
  <div class="table-wrap"><table class="compare">
    <thead><tr><td></td>${pods.map((p) => `<th scope="col">${esc(p.name)}</th>`).join('')}</tr></thead>
    <tbody>
      <tr><th scope="row">E-liquid per pod</th>${pods.map((p) => `<td>${val(p.liquid)}</td>`).join('')}</tr>
      <tr><th scope="row">Pods per pack</th>${pods.map((p) => `<td>${val(p.perPack)}</td>`).join('')}</tr>
      <tr><th scope="row">Nicotine at RelxPods</th>${pods.map((p) => `<td>${esc(p.nicotine.value)}</td>`).join('')}</tr>
      <tr><th scope="row">Puffs per pod</th>${pods.map((p) => `<td>${val(p.puffs)}</td>`).join('')}</tr>
      <tr><th scope="row">Coil</th>${pods.map((p) => `<td>${val(p.coil)}</td>`).join('')}</tr>
      <tr><th scope="row">Shop</th>${pods.map((p) => `<td><a href="${shop(p.category)}" data-track="buy_click" data-device="${p.id}">${esc(p.name)} at RelxPods</a></td>`).join('')}</tr>
    </tbody>
  </table></div>
  <p>Which devices take which pod? <a href="${HUB}">Check the RELX device comparison</a>.</p>
</section>
<aside class="cta-band">
  <p>Ready to order? Shop devices and pods at <a href="${shop('/')}">RELX Dubai</a>, with 1-hour Dubai delivery.</p>
</aside>`;
  page({
    urlPath: '/',
    file: 'index.html',
    hero,
    title: 'RELX Guide UAE: Compare Devices and Fix Problems',
    desc: 'Compare RELX devices side by side, see which pods fit, and fix charging, blinking and taste problems. A free guide by RelxPods.',
    body,
    schema: [
      { '@context': 'https://schema.org', '@type': 'WebSite', name: cfg.siteName, url: abs('/'), publisher: ORG },
      { '@context': 'https://schema.org', ...ORG },
    ],
    waText: "Hi, I'm on the RELX guide homepage.",
  });
}
{
  const crumbs = breadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
  ]);
  const body = `${crumbs.html}
<h1>Free RELX Tools</h1>
<div class="tool-cards">
  <a class="tool-card" href="${HUB}"><strong>RELX Device Compare</strong><span>Put any two RELX devices side by side.</span></a>
  <a class="tool-card" href="${HELP}"><strong>RELX Help Center</strong><span>Pick a device and a problem, get the fix.</span></a>
</div>`;
  page({
    urlPath: '/tools',
    file: 'tools.html',
    title: 'Free RELX Tools: Device Compare and Help Center',
    desc: 'Free RELX tools from RelxPods: compare any two RELX devices side by side, or pick a device and a problem to get the fix.',
    body,
    schema: [crumbs.schema],
  });
}
{
  const crumbs = breadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ]);
  const body = `${crumbs.html}
<h1>About This Guide</h1>
<p>This guide is made by RelxPods, a RELX store in the UAE. It answers the questions RELX owners ask most: how devices differ, which pods fit, and how to fix common problems.</p>
<h2>How we check the facts</h2>
<p>We compare what the leading RELX guides and stores say about each device. We only show a spec when the sources agree, or when most of them do. When sources conflict or too few cover a spec, we show "Not confirmed" instead of guessing.</p>
<p>We recheck the data every month. Last update: <time datetime="${data.updated_at}">${prettyDate(data.updated_at)}</time>.</p>
<h2>Contact</h2>
<p>Questions or corrections? <a href="${wa("Hi, I have a question about the RELX guide.")}" data-track="whatsapp_click" data-page="/about">Message us on WhatsApp</a>, or visit <a href="${shop('/')}">RELX Dubai</a>.</p>`;
  page({
    urlPath: '/about',
    file: 'about.html',
    title: 'About the RelxPods RELX Guide',
    desc: 'Who makes this RELX guide, how the device data is checked, and how to reach RelxPods.',
    body,
    schema: [crumbs.schema],
  });
}
{
  const body = `<h1>Page Not Found</h1>
<p>That page doesn't exist. Try one of these:</p>
<ul class="link-grid"><li><a href="${HUB}">RELX device comparison</a></li><li><a href="${HELP}">RELX help center</a></li><li><a href="/">Guide home</a></li></ul>`;
  page({ urlPath: '/404', file: '404.html', title: 'Page Not Found', desc: 'This page does not exist.', body, robots: 'noindex, follow' });
}

// ---------- embed ----------
{
  const modesCell = (d) => {
    const n = modeCount(d);
    if (n > 0) return `${n} modes`;
    if (n === 0) return 'None';
    return '<span class="nc">Not confirmed</span>';
  };
  const html = `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RELX Device Chart</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${abs('/embed/relx-device-chart')}">
<style>
:root{--ink:#162d4a;--muted:#5b6678;--line:#e5e7eb;--yes:#15803d;--yes-bg:#dcfce7;--maybe:#92400e;--maybe-bg:#fef3c7;--nc:#4b5563;--nc-bg:#f3f4f6;--accent:#a8461a}
*{box-sizing:border-box}body{margin:0;padding:12px;font:15px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:var(--ink);background:#fff}
h1{font-size:17px;margin:0 0 10px}table{width:100%;border-collapse:collapse}th,td{padding:8px 6px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
thead th{font-size:13px;color:var(--muted);font-weight:600}tbody th{font-weight:600}
.fit,.nc{display:inline-block;padding:2px 8px;border-radius:999px;font-size:13px;font-weight:600}
.fit-yes{color:var(--yes);background:var(--yes-bg)}.fit-maybe{color:var(--maybe);background:var(--maybe-bg)}.fit-nc,.nc{color:var(--nc);background:var(--nc-bg)}
.credit{margin-top:10px;font-size:13px;color:var(--muted);display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.credit a{color:var(--accent);font-weight:600}
@media (max-width:480px){th,td{padding:6px 4px;font-size:13px}.fit,.nc{font-size:12px;padding:2px 6px}}
</style>
</head>
<body>
<h1>Which pods fit each RELX device?</h1>
<table>
<thead><tr><th scope="col">Device</th><th scope="col">RELX Pod Pro</th><th scope="col">RELX Pod Pro 2</th><th scope="col">Power modes</th></tr></thead>
<tbody>
${devices
  .map(
    (d) =>
      `<tr><th scope="row">${esc(d.name)}</th><td>${fitBadge(data.fits[d.id]['pod-pro'])}</td><td>${fitBadge(data.fits[d.id]['pod-pro-2'])}</td><td>${modesCell(d)}</td></tr>`
  )
  .join('\n')}
</tbody>
</table>
<p class="credit"><span>Chart by <a href="${abs(HUB)}" target="_blank" rel="noopener">RelxPods</a>. Updated ${prettyDate(data.updated_at)}.</span><span>${esc(cfg.ageLine)}</span></p>
</body>
</html>
`;
  files['embed/relx-device-chart.html'] = html;
  pages.push({ path: '/embed/relx-device-chart', file: 'embed/relx-device-chart.html', title: 'RELX Device Chart', indexable: false, embed: true });
}

// ---------- sitemaps, robots, Netlify config ----------
const urlset = (paths) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${abs(p)}</loc><lastmod>${data.updated_at}</lastmod></url>`).join('\n')}
</urlset>
`;
const toolPaths = [HUB, ...pairs.map(([a, b]) => pairPath(a.id, b.id)), HELP, ...data.symptoms.map((s) => helpPath(s.slug)), MODES, DEV, ...devices.map((d) => devicePath(d.id))];
files['sitemap-tools.xml'] = urlset(toolPaths);
files['sitemap-pages.xml'] = urlset(['/', '/tools', '/about']);
files['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${abs('/sitemap-pages.xml')}</loc><lastmod>${data.updated_at}</lastmod></sitemap>
  <sitemap><loc>${abs('/sitemap-tools.xml')}</loc><lastmod>${data.updated_at}</lastmod></sitemap>
</sitemapindex>
`;
files['robots.txt'] = `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`;

// Reversed pair URLs 301 to the canonical order. Trailing-slash variants 301 too.
const redirects = [];
for (const [a, b] of pairs) {
  redirects.push(`${HUB}/${b.id}-vs-${a.id}  ${pairPath(a.id, b.id)}  301`);
  redirects.push(`${HUB}/${a.id}-vs-${b.id}/  ${pairPath(a.id, b.id)}  301`);
}
for (const p of ['/tools', HUB, HELP, ...data.symptoms.map((s) => helpPath(s.slug)), MODES, DEV, ...devices.map((d) => devicePath(d.id)), '/about']) redirects.push(`${p}/  ${p}  301`);
files['_redirects'] = redirects.join('\n') + '\n';

// Frame policy: the embed may be framed anywhere; every other page only by itself.
// Listed per path because Netlify combines headers from every matching rule.
const headerBlocks = [
  `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin`,
  `/assets/*\n  Cache-Control: public, max-age=31536000, immutable`,
  `/embed/relx-device-chart\n  Content-Security-Policy: frame-ancestors *`,
];
for (const p of pages.filter((x) => !x.embed))
  headerBlocks.push(`${p.path}\n  X-Frame-Options: SAMEORIGIN\n  Content-Security-Policy: frame-ancestors 'self'`);
files['_headers'] = headerBlocks.join('\n\n') + '\n';

// ---------- write ----------
fs.rmSync(DIST, { recursive: true, force: true });
for (const [rel, content] of Object.entries(files)) {
  const out = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
}
fs.mkdirSync(path.join(__dirname, '.build'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '.build', 'pages.json'), JSON.stringify({ pages, toolPaths, pairs: pairs.map(([a, b]) => [a.id, b.id]) }, null, 2));

if (/^9710+$/.test(cfg.whatsappNumber)) console.warn('WARNING: whatsappNumber is a placeholder. Set WHATSAPP_NUMBER or edit site.config.js.');
console.log(`Built ${pages.length} pages into dist/ for ${cfg.siteUrl}`);
