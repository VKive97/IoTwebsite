import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const site = 'https://www.anstelglobal.com';
const excluded = new Set(['.git', 'node_modules']);
const today = new Date().toISOString().slice(0, 10);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory() && excluded.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const fallbackNav = `<header class="static-site-nav" data-static-nav><a href="/" class="static-site-logo" aria-label="Anstel home"><img src="/images/anstel.svg" width="115" height="40" alt="Anstel"></a><nav aria-label="Primary navigation"><a href="/platform/">Autonautics</a><a href="/solutions/fleet-management/">Solutions</a><a href="/industries/">Industries</a><a href="/company/knowledge-center/">Knowledge Centre</a><a href="/company/customer-stories/">Customer Stories</a><a href="/regions/">Regions</a><a href="/company/contact/">Contact</a></nav></header>`;

const htmlFiles = walk(root).filter(file => file.endsWith('.html'));
for (const file of htmlFiles) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  if (rel.startsWith('admin/')) continue;
  let html = fs.readFileSync(file, 'utf8');

  // Keep the corporate website identity distinct from page-level product naming.
  html = html.replace(/(<meta\s+property=["']og:site_name["']\s+content=["'])[^"']*(["']\s*\/?>)/gi, '$1Anstel$2');
  if (/<meta\s+property=["']og:type["']/i.test(html) && !/<meta\s+property=["']og:site_name["']/i.test(html)) {
    html = html.replace(/(<meta\s+property=["']og:type["'][^>]*>)/i, '$1<meta property="og:site_name" content="Anstel">');
  }

  html = html.replaceAll('"brand":{"@type":"Brand","name":"Autonautics"}', '"brand":{"@id":"https://www.anstelglobal.com/#autonautics"}');
  html = html.replaceAll('"provider":{"@type":"Organization","name":"Anstel","brand":{"@id":"https://www.anstelglobal.com/#autonautics"}}', '"provider":{"@id":"https://www.anstelglobal.com/#organization"}');

  // Product and capability pages identify Autonautics as the brand and Anstel as publisher.
  if (/^(?:platform|solutions)\//.test(rel)) {
    html = html.replace(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi, (script, source) => {
      try {
        const data = JSON.parse(source);
        if (data['@type'] !== 'SoftwareApplication') return script;
        data.brand = { '@type': 'Brand', '@id': `${site}/#autonautics`, name: 'Autonautics' };
        data.publisher = { '@id': `${site}/#organization` };
        if (rel !== 'platform/index.html') data.isPartOf = { '@id': `${site}/#autonautics` };
        return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
      } catch { return script; }
    });
  }

  if (rel === 'company/knowledge-center/gps-tracking-papua-new-guinea/index.html') {
    html = html.replace(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi, (script, source) => {
      try {
        const data = JSON.parse(source);
        if (data['@type'] !== 'BlogPosting') return script;
        data.publisher = { '@id': `${site}/#organization` };
        const autonauticsId = `${site}/#autonautics`;
        const topics = Array.isArray(data.about)
          ? data.about.filter(item =>
              item !== 'Autonautics' &&
              item?.['@id'] !== autonauticsId
            )
          : [];
        data.about = [{ '@id': autonauticsId }, ...topics];
        return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
      } catch { return script; }
    });
  }

  html = html.replaceAll('Which industries use Anstel?', 'Which industries does Anstel serve?');

  // Resolve or remove unfinished links without leaving empty anchors.
  html = html.replace(/href=["']#["'](?=[^>]*>\s*Customer Success\s*<)/gi, 'href="/company/customer-stories/"');
  if (rel === 'platform/index.html') {
    html = html.replace(/href=["']#["'](?=[^>]*class=["'][^"']*cta-action-card)/i, 'href="/demo/"');
    html = html.replace(/href=["']#["'](?=[^>]*class=["'][^"']*cta-action-card)/i, 'href="/company/contact/"');
  }
  html = html.replace(/<a\b[^>]*href=["']#["'][^>]*>[\s\S]*?<\/a>/gi, '');
  html = html.replace(/<a\b[^>]*href=["']\/shop\/["'][^>]*>\s*Shop\s*<\/a>/gi, '');

  // Give every content page a keyboard-accessible route past repeated navigation.
  if (/<(?:main|section)(?:\s|>)/i.test(html) && !/class=["'][^"']*skip-link/.test(html)) {
    html = html.replace(/<body([^>]*)>/i, '<body$1><a class="skip-link" href="#main-content">Skip to main content</a>');
  }

  // Add an HTML navigation fallback to pages whose enhanced navbar is JS-generated.
  if (/\/js\/navbar\.js/.test(html) && !/id=["']site-nav["']/.test(html) && !/data-static-nav/.test(html)) {
    html = html.replace(/<body([^>]*)>/i, `<body$1>${fallbackNav}`);
  }
  if (!/id=["']main-content["']/.test(html)) {
    if (/<main(?:\s|>)/i.test(html)) html = html.replace(/<main(\s|>)/i, '<main id="main-content"$1');
    else html = html.replace(/<section(\s|>)/i, '<section id="main-content"$1');
  }

  html = html.replace(/By submitting, you agree that Anstel may contact you about your inquiry\.(?: See our <a href="\/privacy-policy\/">Privacy Policy<\/a>\.)*/g, 'By submitting, you agree that Anstel may contact you about your inquiry. See our <a href="/privacy-policy/">Privacy Policy</a>.');
  html = html.replace(/We(?:'|&rsquo;|’)ll only use your details to respond to this request\.(?: See our <a href="\/privacy-policy\/">Privacy Policy<\/a>\.)*/g, 'We&rsquo;ll only use your details to respond to this request. See our <a href="/privacy-policy/">Privacy Policy</a>.');

  // Every footer exposes both legal documents.
  if (/<footer\b/i.test(html)) {
    html = html.replace(/<footer\b([\s\S]*?)<\/footer>/gi, footer => {
      if (footer.includes('/privacy-policy/')) return footer;
      return footer.replace(/<\/footer>/i, '<a href="/privacy-policy/" class="footer-privacy-link">Privacy Policy</a></footer>');
    });
  }

  // Add BreadcrumbList to the country pages.
  if (/^regions\/[^/]+\/index\.html$/.test(rel) && !html.includes('"@type":"BreadcrumbList"')) {
    const country = html.match(/<h1[^>]*>GPS tracking and fleet management in ([^.<]+)[^<]*<\/h1>/i)?.[1];
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    if (country && canonical) {
      const schema = `<script type="application/ld+json">${JSON.stringify({ '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:[{ '@type':'ListItem', position:1, name:'Home', item:`${site}/` },{ '@type':'ListItem', position:2, name:'Regions', item:`${site}/regions/` },{ '@type':'ListItem', position:3, name:country, item:canonical }] })}</script>`;
      html = html.replace('</head>', `${schema}</head>`);
    }
  }

  html = html.replace(/[ \t]+$/gm, '');
  fs.writeFileSync(file, html);
}

// Generate a minimal sitemap from indexable pages. Git dates are used for clean
// files; modified/untracked pages receive today's date before they are committed.
const urls = [];
for (const file of htmlFiles) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  if (rel.startsWith('admin/')) continue;
  const html = fs.readFileSync(file, 'utf8');
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)/i)?.[1];
  if (!canonical?.startsWith(site)) continue;
  let lastmod = today;
  try {
    const dirty = execFileSync('git', ['status', '--porcelain', '--', rel], { cwd: root, encoding:'utf8' }).trim();
    if (!dirty) lastmod = execFileSync('git', ['log', '-1', '--format=%cs', '--', rel], { cwd: root, encoding:'utf8' }).trim() || today;
  } catch {}
  urls.push({ loc: canonical, lastmod });
}
urls.sort((a,b) => a.loc === `${site}/` ? -1 : b.loc === `${site}/` ? 1 : a.loc.localeCompare(b.loc));
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u.loc.replaceAll('&','&amp;')}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);
console.log(`Built static navigation and sitemap for ${urls.length} indexable pages.`);
