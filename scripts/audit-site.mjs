import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const site = 'https://www.anstelglobal.com';
const countries = ['Australia', 'India', 'Fiji', 'Papua New Guinea', 'New Zealand'];
const countryConsistencyPages = [
  'index.html', 'company/about/index.html', 'company/contact/index.html',
  'industries/transportation/index.html', 'industries/logistics-supply-chain/index.html',
  'industries/waste-management/index.html', 'industries/food-services-fmcg/index.html'
];
const excludedDirs = new Set(['.git', 'node_modules']);
const errors = [];
const warnings = [];
const canonicalOwners = new Map();
const titleOwners = new Map();
const descriptionOwners = new Map();

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory() && excludedDirs.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const htmlFiles = walk(root).filter(file => file.endsWith('.html'));
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const rel = file => path.relative(root, file).replaceAll('\\', '/');
const pageUrl = file => {
  const name = rel(file);
  return name === 'index.html' ? '/' : `/${name.replace(/index\.html$/, '')}`;
};
const textContent = html => html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ');
const decodeText = value => (value || '')
  .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
  .replace(/&nbsp;/gi, ' ').replace(/&ndash;/gi, '–').replace(/&mdash;/gi, '—')
  .replace(/&rsquo;/gi, '’').replace(/&ldquo;/gi, '“').replace(/&rdquo;/gi, '”')
  .replace(/[‘’]/g, "'").replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const attribute = (source, name) => source.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'))?.[2];
const addOwner = (map, value, name) => {
  if (!value) return;
  if (!map.has(value)) map.set(value, []);
  map.get(value).push(name);
};
const localPathForUrl = value => {
  try {
    const url = new URL(value, site);
    if (url.origin !== site) return null;
    return path.join(root, decodeURIComponent(url.pathname).replace(/^\//, ''));
  } catch { return null; }
};
const hasUnlinkedAnstelOrganization = value => {
  if (!value || typeof value !== 'object') return false;
  if (value['@type'] === 'Organization' && value.name === 'Anstel' && value['@id'] !== `${site}/#organization`) return true;
  return Object.values(value).some(hasUnlinkedAnstelOrganization);
};

for (const file of htmlFiles) {
  const name = rel(file);
  const html = fs.readFileSync(file, 'utf8');
  if (/\son[a-z]+\s*=/i.test(html)) errors.push(`${name}: inline event handler is blocked by the site CSP`);
  for (const tag of html.matchAll(/<(?:script|link)\b[^>]*cdn\.jsdelivr\.net[^>]*>/gi)) {
    if (/^<link/i.test(tag[0]) && !/\brel=["']stylesheet["']/i.test(tag[0])) continue;
    if (!/\bintegrity=["']sha384-[^"']+["']/i.test(tag[0]) || !/\bcrossorigin=["']anonymous["']/i.test(tag[0])) {
      errors.push(`${name}: CDN asset is missing verified integrity/crossorigin attributes`);
    }
  }
  if (/\/js\/blog\.js/.test(html) && !/\/js\/vendor\/purify\.min\.js/.test(html)) errors.push(`${name}: blog content renderer is missing DOMPurify`);
  if (name.startsWith('admin/')) continue;
  const staticMarkup = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
  const isNoindex = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
  const idSet = new Set(ids);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];

  if (!/^<!doctype html>/i.test(html.trimStart())) errors.push(`${name}: missing HTML5 doctype`);
  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) errors.push(`${name}: html element is missing lang`);
  if (!/<meta\s+charset=["']?utf-8/i.test(html)) errors.push(`${name}: missing UTF-8 charset declaration`);
  if (!/<meta\s+name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i.test(html)) errors.push(`${name}: missing responsive viewport metadata`);
  if (/<(?:nav|ol)\b(?=[^>]*(?:\bclass=["'][^"']*breadcrumb[^"']*["']|\baria-label=["'][^"']*breadcrumb[^"']*["']))/i.test(staticMarkup)) errors.push(`${name}: visual breadcrumb navigation must not be rendered`);
  if (/^regions(?:\/[^/]+)?\/index\.html$/.test(name) && !html.includes('"@type":"BreadcrumbList"')) errors.push(`${name}: missing BreadcrumbList structured data`);
  if (duplicateIds.length) errors.push(`${name}: duplicate IDs (${duplicateIds.join(', ')})`);
  if (/\btabindex=["'][1-9]\d*["']/i.test(html)) errors.push(`${name}: positive tabindex disrupts keyboard order`);
  for (const control of html.matchAll(/\baria-controls=["']([^"']+)["']/gi)) {
    for (const target of control[1].split(/\s+/)) if (target && !idSet.has(target)) errors.push(`${name}: aria-controls target #${target} is missing`);
  }
  for (const reference of html.matchAll(/\baria-(?:labelledby|describedby)=["']([^"']+)["']/gi)) {
    for (const target of reference[1].split(/\s+/)) if (target && !idSet.has(target)) errors.push(`${name}: ARIA reference #${target} is missing`);
  }
  const mainCount = (html.match(/<main\b/gi) || []).length;
  if (mainCount !== 1) errors.push(`${name}: expected one main landmark, found ${mainCount}`);
  if (/<nav\b/i.test(html) && !/<nav\b[^>]*aria-label=["'][^"']+/i.test(html)) errors.push(`${name}: navigation landmark is missing a label`);
  if (!/<footer\b/i.test(html)) errors.push(`${name}: missing footer landmark`);

  const siteName = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i)?.[1];
  if (/<meta\s+property=["']og:type["']/i.test(html) && siteName !== 'Anstel') errors.push(`${name}: og:site_name must be Anstel`);
  if (/alternateName["']?\s*:\s*["']Autonautics by Anstel/i.test(html)) errors.push(`${name}: Autonautics must not be an Organization alternateName`);
  if (/"brand":\{"@type":"Organization","name":"Anstel"\}/.test(html)) errors.push(`${name}: product brand must reference Autonautics`);
  if (/href=["']#["']/i.test(html)) errors.push(`${name}: unfinished href="#" link`);
  if (/<footer\b/i.test(html) && !/<footer\b[\s\S]*?href=["']\/privacy-policy\//i.test(html)) errors.push(`${name}: footer missing Privacy Policy link`);
  if (/\/js\/navbar\.js/.test(html) && !/id=["']site-nav["']/.test(html) && !/data-static-nav/.test(html)) errors.push(`${name}: missing static navigation fallback`);
  if (/\/js\/main\.js/.test(html)) {
    const jqueryPosition = html.search(/jquery(?:\.min)?\.js/i);
    const mainPosition = html.search(/\/js\/main\.js/i);
    if (jqueryPosition < 0 || jqueryPosition > mainPosition) errors.push(`${name}: jQuery must load before main.js`);
  }
  if (/<main(?:\s|>)/i.test(html) && !/class=["'][^"']*skip-link/.test(html)) errors.push(`${name}: missing skip-to-content link`);
  if (/class=["'][^"']*skip-link/.test(html) && !/id=["']main-content["']/.test(html)) errors.push(`${name}: skip link target is missing`);

  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim();
  const descriptionTag = html.match(/<meta\s+name=["']description["'][^>]*>/i)?.[0];
  const description = descriptionTag && attribute(descriptionTag, 'content');
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (!isNoindex) {
    if (!title) errors.push(`${name}: missing title`);
    if (!description) errors.push(`${name}: missing meta description`);
    if (!canonical) errors.push(`${name}: missing canonical URL`);
    if (h1Count !== 1) errors.push(`${name}: expected one H1, found ${h1Count}`);
    const plainTitle = decodeText(title);
    const plainDescription = decodeText(description);
    if (plainTitle && (plainTitle.length < 25 || plainTitle.length > 65)) warnings.push(`${name}: title length is ${plainTitle.length} characters`);
    if (plainDescription && (plainDescription.length < 70 || plainDescription.length > 170)) warnings.push(`${name}: meta description length is ${plainDescription.length} characters`);
    if (canonical) {
      const expected = `${site}${pageUrl(file)}`;
      if (canonical !== expected) errors.push(`${name}: canonical URL must be ${expected}`);
      addOwner(canonicalOwners, canonical, name);
    }
    addOwner(titleOwners, plainTitle, name);
    addOwner(descriptionOwners, plainDescription, name);
    for (const property of ['og:title', 'og:description', 'og:url', 'og:image']) {
      if (!new RegExp(`<meta\\s+property=["']${property}["']`, 'i').test(html)) errors.push(`${name}: missing ${property}`);
    }
    for (const property of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
      if (!new RegExp(`<meta\\s+name=["']${property}["']`, 'i').test(html)) errors.push(`${name}: missing ${property}`);
    }
    if (!/<meta\s+property=["']og:locale["']\s+content=["']en_AU["']/i.test(html)) warnings.push(`${name}: missing og:locale en_AU`);
    const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)/i)?.[1] || '';
    for (const directive of ['index', 'follow', 'max-image-preview:large', 'max-snippet:-1', 'max-video-preview:-1']) {
      if (!robots.toLowerCase().includes(directive)) warnings.push(`${name}: robots metadata missing ${directive}`);
    }
    const ogUrl = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)/i)?.[1];
    if (canonical && ogUrl && ogUrl !== canonical) errors.push(`${name}: og:url does not match canonical`);
    const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)/i)?.[1];
    const twitterImage = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)/i)?.[1];
    if (ogImage && twitterImage && ogImage !== twitterImage) warnings.push(`${name}: social image URLs differ`);
    const imagePath = ogImage && localPathForUrl(ogImage);
    if (imagePath && !fs.existsSync(imagePath)) errors.push(`${name}: og:image file is missing (${ogImage})`);
  }

  for (const anchor of staticMarkup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = attribute(anchor[1], 'href');
    const label = attribute(anchor[1], 'aria-label');
    if (href === '#') errors.push(`${name}: unfinished href="#" link`);
    if (attribute(anchor[1], 'tabindex') !== '-1' && !label && !decodeText(anchor[2]).length && !/<img\b[^>]*alt=["'][^"']+/i.test(anchor[2])) errors.push(`${name}: link has no accessible name (${href || 'no href'})`);
    if (/^https?:\/\//i.test(href || '') && attribute(anchor[1], 'target') === '_blank' && !/\bnoopener\b/i.test(attribute(anchor[1], 'rel') || '')) {
      errors.push(`${name}: external target=_blank link is missing rel=noopener`);
    }
    if (/^https?:\/\//i.test(href || '') && attribute(anchor[1], 'target') === '_blank' && !/\bnoreferrer\b/i.test(attribute(anchor[1], 'rel') || '')) {
      errors.push(`${name}: external target=_blank link is missing rel=noreferrer`);
    }
  }
  for (const button of staticMarkup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    if (!attribute(button[1], 'aria-label') && !attribute(button[1], 'title') && !decodeText(button[2]).length) errors.push(`${name}: button has no accessible name (${attribute(button[1], 'class') || 'no class'})`);
  }
  for (const frame of staticMarkup.matchAll(/<iframe\b([^>]*)>/gi)) if (!attribute(frame[1], 'title')) errors.push(`${name}: iframe is missing a title`);
  for (const media of staticMarkup.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
    const tag = media[1].toLowerCase();
    const attrs = media[2];
    const type = (attribute(attrs, 'type') || '').toLowerCase();
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type) || attribute(attrs, 'aria-hidden') === 'true') continue;
    const id = attribute(attrs, 'id');
    const escapedId = id?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const labelled = attribute(attrs, 'aria-label') || attribute(attrs, 'aria-labelledby') || (id && new RegExp(`<label\\b[^>]*for=["']${escapedId}["']`, 'i').test(html));
    if (!labelled) errors.push(`${name}: ${tag}${id ? `#${id}` : ''} has no accessible label`);
  }

  let jsonLdCount = 0;
  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    jsonLdCount += 1;
    try {
      const data = JSON.parse(match[1]);
      if (hasUnlinkedAnstelOrganization(data)) errors.push(`${name}: Anstel Organization object must reuse #organization`);
      if (/^(?:platform|solutions)\//.test(name) && data['@type'] === 'SoftwareApplication') {
        if (data.brand?.['@id'] !== `${site}/#autonautics` || data.brand?.name !== 'Autonautics') errors.push(`${name}: SoftwareApplication brand hierarchy is incorrect`);
        if (data.publisher?.['@id'] !== `${site}/#organization`) errors.push(`${name}: SoftwareApplication publisher hierarchy is incorrect`);
      }
      if (/^industries\/(?:transportation|logistics-supply-chain|waste-management|food-services-fmcg)\/index\.html$/.test(name) && data['@type'] === 'Service') {
        if (data.provider?.brand?.['@id'] !== `${site}/#autonautics`) errors.push(`${name}: industry provider must reference the Autonautics brand`);
      }
      if (name === 'index.html' && data['@type'] === 'WebSite' && data.name !== 'Anstel') errors.push(`${name}: WebSite schema name must be Anstel`);
      if (Array.isArray(data.about)) {
        const aboutIds = data.about.map(item => item?.['@id']).filter(Boolean);
        if (new Set(aboutIds).size !== aboutIds.length) errors.push(`${name}: duplicate JSON-LD about @id`);
      }
      if (data['@type'] === 'FAQPage') {
        const visible = decodeText(textContent(html));
        for (const question of data.mainEntity || []) if (question.name && !visible.includes(decodeText(question.name))) errors.push(`${name}: FAQ schema question is not visible: ${question.name}`);
      }
    } catch (error) { errors.push(`${name}: invalid JSON-LD (${error.message})`); }
  }
  if (!isNoindex && jsonLdCount === 0) warnings.push(`${name}: no JSON-LD structured data`);

  for (const img of staticMarkup.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt\s*=\s*["'][^"']*["']/i.test(img[1])) errors.push(`${name}: image missing alt text`);
    if (!/\bwidth\s*=\s*["']?\d+/i.test(img[1]) || !/\bheight\s*=\s*["']?\d+/i.test(img[1])) warnings.push(`${name}: image missing intrinsic width/height`);
  }
  for (const video of staticMarkup.matchAll(/<video\b([^>]*)>/gi)) {
    if (/\bautoplay\b/i.test(video[1]) && (!/\bmuted\b/i.test(video[1]) || !/\bplaysinline\b/i.test(video[1]))) errors.push(`${name}: autoplay video must be muted and playsinline`);
  }
  for (const link of staticMarkup.matchAll(/(?:href|src)=["'](\/[^"'#?]*)/gi)) {
    const target = decodeURIComponent(link[1]);
    if (target === '/' || target.startsWith('//')) continue;
    const local = path.join(root, target.replace(/^\//, ''));
    const exists = fs.existsSync(local) || fs.existsSync(path.join(local, 'index.html'));
    if (!exists) errors.push(`${name}: broken internal reference ${target}`);
  }
  if (!isNoindex && !name.includes('/post/') && !sitemap.includes(`${site}${pageUrl(file)}`)) warnings.push(`${name}: not included in sitemap.xml`);
  if (countryConsistencyPages.includes(name)) {
    const visibleAndSchema = textContent(html) + html.match(/<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/gi)?.join(' ');
    for (const country of countries) if (!visibleAndSchema.includes(country)) warnings.push(`${name}: country consistency missing ${country}`);
  }
}

for (const [canonical, owners] of canonicalOwners) if (owners.length > 1) errors.push(`duplicate canonical ${canonical}: ${owners.join(', ')}`);
for (const [title, owners] of titleOwners) if (title && owners.length > 1) warnings.push(`duplicate title "${title}": ${owners.join(', ')}`);
for (const [description, owners] of descriptionOwners) if (description && owners.length > 1) warnings.push(`duplicate meta description: ${owners.join(', ')}`);

if (/<(?:priority|changefreq)>/i.test(sitemap)) errors.push('sitemap.xml: obsolete priority/changefreq field');
const styles = fs.readFileSync(path.join(root, 'css', 'styles.css'), 'utf8');
if (!/:focus-visible/i.test(styles)) errors.push('css/styles.css: missing visible keyboard focus treatment');
if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/i.test(styles)) errors.push('css/styles.css: missing reduced-motion treatment');
if (!/scroll-padding-top/i.test(styles)) warnings.push('css/styles.css: fixed navigation has no global scroll-padding-top safeguard');

const robotsTxt = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
if (!/Sitemap:\s*https:\/\/www\.anstelglobal\.com\/sitemap\.xml/i.test(robotsTxt)) errors.push('robots.txt: missing absolute sitemap URL');
for (const bot of ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot']) {
  if (!new RegExp(`User-agent:\\s*${bot}[\\s\\S]*?Allow:\\s*\\/`, 'i').test(robotsTxt)) warnings.push(`robots.txt: ${bot} is not explicitly allowed`);
}
if (!fs.existsSync(path.join(root, 'llms.txt'))) warnings.push('llms.txt: file is missing');

const headers = fs.readFileSync(path.join(root, '_headers'), 'utf8');
for (const header of ['Content-Security-Policy', 'Strict-Transport-Security', 'Referrer-Policy', 'Permissions-Policy', 'X-Content-Type-Options', 'X-Frame-Options']) {
  if (!new RegExp(`^\\s*${header}:`, 'mi').test(headers)) errors.push(`_headers: missing ${header}`);
}
for (const directive of ["default-src 'self'", "object-src 'none'", "frame-ancestors 'none'", "base-uri 'self'", "script-src-attr 'none'"]) {
  if (!headers.includes(directive)) errors.push(`_headers: Content-Security-Policy missing ${directive}`);
}
if (!fs.existsSync(path.join(root, 'js', 'vendor', 'purify.min.js'))) errors.push('js/vendor/purify.min.js: local sanitizer asset is missing');
const blogJs = fs.readFileSync(path.join(root, 'js', 'blog.js'), 'utf8');
const eventsJs = fs.readFileSync(path.join(root, 'js', 'events.js'), 'utf8');
const adminBlogJs = fs.readFileSync(path.join(root, 'js', 'admin-blog.js'), 'utf8');
const mainJs = fs.readFileSync(path.join(root, 'js', 'main.js'), 'utf8');
if (/return\s+post\.content\s*\|\|/.test(blogJs)) errors.push('js/blog.js: post content is returned without sanitizing');
if (/innerHTML\s*=\s*event\.content/.test(eventsJs)) errors.push('js/events.js: event content is inserted without sanitizing');
if (/quill\.root\.innerHTML\s*=\s*post\.content/.test(adminBlogJs)) errors.push('js/admin-blog.js: API content is loaded into the editor without sanitizing');
if (/https:\/\/(?:code\.iconify\.design|unpkg\.com)\//.test(mainJs)) errors.push('js/main.js: runtime libraries must be served from the pinned local vendor directory');

console.log(`Audited ${htmlFiles.length} HTML files.`);
if (errors.length) console.log(`\nErrors (${errors.length}):\n- ${[...new Set(errors)].join('\n- ')}`);
if (warnings.length) console.log(`\nWarnings (${warnings.length}):\n- ${[...new Set(warnings)].join('\n- ')}`);
if (!errors.length && !warnings.length) console.log('All checks passed.');
process.exitCode = errors.length ? 1 : 0;
