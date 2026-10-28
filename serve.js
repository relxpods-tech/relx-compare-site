// Local preview that mimics Netlify: clean URLs, _redirects (exact 301s), _headers, 404.html.
// Usage: node serve.js [port]
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PORT = Number(process.argv[2] || process.env.PORT || 8888);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };

const redirects = new Map(
  fs.readFileSync(path.join(DIST, '_redirects'), 'utf8').split('\n').filter(Boolean).map((l) => l.trim().split(/\s+/))
    .map(([from, to, code]) => [from, { to, code: Number(code) }])
);
const headers = new Map();
for (const block of fs.readFileSync(path.join(DIST, '_headers'), 'utf8').split(/\n\n+/)) {
  const [p, ...lines] = block.split('\n').filter(Boolean);
  headers.set(p.trim(), lines.map((l) => l.trim().split(/:\s(.+)/).slice(0, 2)));
}

function resolve(urlPath) {
  const tries = urlPath.endsWith('/') ? [urlPath + 'index.html'] : [urlPath, urlPath + '.html', urlPath + '/index.html'];
  for (const t of tries) {
    const f = path.join(DIST, t);
    if (f.startsWith(DIST) && fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  }
  return null;
}

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = resolve(urlPath);
  if (!file && redirects.has(urlPath)) {
    const r = redirects.get(urlPath);
    res.writeHead(r.code, { Location: r.to });
    return res.end();
  }
  const out = file || path.join(DIST, '404.html');
  const h = { 'Content-Type': TYPES[path.extname(out)] || 'application/octet-stream' };
  for (const [p, list] of headers) {
    const match = p.endsWith('*') ? urlPath.startsWith(p.slice(0, -1)) : p === urlPath;
    if (match) for (const [k, v] of list) h[k] = v;
  }
  res.writeHead(file ? 200 : 404, h);
  fs.createReadStream(out).pipe(res);
}).listen(PORT, () => console.log(`Preview at http://localhost:${PORT}`));
