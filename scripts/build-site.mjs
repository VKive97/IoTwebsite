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
const homepageSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sharedFooter = homepageSource.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0];
if (!sharedFooter) throw new Error('Homepage footer is required as the shared footer template.');

for (const file of htmlFiles) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  if (rel.startsWith('admin/')) continue;
  let html = fs.readFileSync(file, 'utf8');

  // Keep the corporate website identity distinct from page-level product naming.
  html = html.replace(/(<meta\s+property=["']og:site_name["']\s+content=["'])[^"']*(["']\s*\/?>)/gi, '$1Anstel$2');
  if (/<meta\s+property=["']og:type["']/i.test(html) && !/<meta\s+property=["']og:site_name["']/i.test(html)) {
    html = html.replace(/(<meta\s+property=["']og:type["'][^>]*>)/i, '$1<meta property="og:site_name" content="Anstel">');
  }

  // Reuse canonical entity IDs wherever page schemas describe Anstel.
  html = html.replace(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi, (script, source) => {
    try {
      const data = JSON.parse(source);
      let changed = false;
      if (/^industries\/(?:transportation|logistics-supply-chain|waste-management|food-services-fmcg)\/index\.html$/.test(rel) && data['@type'] === 'Service' && data.provider?.name === 'Anstel') {
        data.provider['@id'] = `${site}/#organization`;
        data.provider.brand = { '@id': `${site}/#autonautics` };
        changed = true;
      }
      if ((rel === 'company/contact/index.html' || rel === 'regions/index.html') && data.about?.name === 'Anstel') {
        data.about['@id'] = `${site}/#organization`;
        changed = true;
      }
      return changed ? `<script type="application/ld+json">${JSON.stringify(data)}</script>` : script;
    } catch { return script; }
  });

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
        if (data.author?.name === 'Anstel') data.author['@id'] = `${site}/#organization`;
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
  html = html.replaceAll('Autonautics supports compatible GPS tracking and telematics deployments across Papua New Guinea, subject to network and device coverage.', 'Anstel supports Autonautics GPS tracking and compatible telematics deployments across Papua New Guinea, subject to network and device coverage.');

  // Product and solution pages keep regional discovery in shared navigation and footer links.
  html = html.replace(/\s*<!-- Regional Availability -->\s*<section class="regional-availability">[\s\S]*?<\/section>/gi, '');

  // Shared navbar interactions depend on jQuery, which must load before main.js.
  if (/\/js\/main\.js/.test(html) && !/jquery(?:\.min)?\.js/i.test(html)) {
    html = html.replace(
      /<script src="\/js\/navbar\.js"><\/script>/i,
      '<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script><script src="/js/navbar.js"></script>'
    );
  }

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

  // Use the homepage footer as the single shared footer across every public page.
  if (/<footer\b/i.test(html)) html = html.replace(/<footer\b[\s\S]*?<\/footer>/i, sharedFooter);

  // Keep one Privacy Policy link and one clearly named Terms link in the footer row.
  if (/<footer\b/i.test(html)) {
    html = html.replace(/<footer\b([\s\S]*?)<\/footer>/gi, footer => {
      const privacyLink = '<a href="/privacy-policy/" class="footer-legal-link">Privacy Policy</a>';
      let normalized = footer
        .replace(/<a\b[^>]*href=["']\/privacy-policy\/["'][^>]*>\s*Privacy Policy\s*<\/a>/gi, '')
        .replace(/(<a\b[^>]*href=["']\/legal\/terms\/["'][^>]*>)\s*(?:Privacy\s*(?:&amp;|&)\s*Legal|Terms(?:\s*&amp;\s*Conditions)?)\s*(<\/a>)/gi, '$1Terms$2');
      if (/href=["']\/legal\/terms\//i.test(normalized)) {
        normalized = normalized.replace(/(<a\b[^>]*href=["']\/legal\/terms\/["'][^>]*>)/i, `${privacyLink}$1`);
      } else if (/<\/div>/i.test(normalized)) {
        normalized = normalized.replace(/<\/div>/i, `${privacyLink}</div>`);
      } else {
        normalized = normalized.replace(/<\/footer>/i, `${privacyLink}</footer>`);
      }
      return normalized;
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
