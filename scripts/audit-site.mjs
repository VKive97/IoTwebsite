import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const countries = ['Australia', 'India', 'Fiji', 'Papua New Guinea', 'New Zealand'];
const countryConsistencyPages = [
  'index.html', 'company/about/index.html', 'company/contact/index.html',
  'industries/transportation/index.html', 'industries/logistics-supply-chain/index.html',
  'industries/waste-management/index.html', 'industries/food-services-fmcg/index.html'
];
const excludedDirs = new Set(['.git', 'node_modules']);
const errors = [];
const warnings = [];

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

for (const file of htmlFiles) {
  const name = rel(file);
  if (name.startsWith('admin/')) continue;
  const html = fs.readFileSync(file, 'utf8');
  const isNoindex = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);
  const siteName = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i)?.[1];
  if (/<meta\s+property=["']og:type["']/i.test(html) && siteName !== 'Anstel') errors.push(`${name}: og:site_name must be Anstel`);
  if (/alternateName["']?\s*:\s*["']Autonautics by Anstel/i.test(html)) errors.push(`${name}: Autonautics must not be an Organization alternateName`);
  if (/"brand":\{"@type":"Organization","name":"Anstel"\}/.test(html)) errors.push(`${name}: product brand must reference Autonautics`);
  if (/href=["']#["']/i.test(html)) errors.push(`${name}: unfinished href="#" link`);
  if (/<footer\b/i.test(html) && !/<footer\b[\s\S]*?href=["']\/privacy-policy\//i.test(html)) errors.push(`${name}: footer missing Privacy Policy link`);
  if (/\/js\/navbar\.js/.test(html) && !/id=["']site-nav["']/.test(html) && !/data-static-nav/.test(html)) errors.push(`${name}: missing static navigation fallback`);
  if (/<main(?:\s|>)/i.test(html) && !/class=["'][^"']*skip-link/.test(html)) errors.push(`${name}: missing skip-to-content link`);
  if (/class=["'][^"']*skip-link/.test(html) && !/id=["']main-content["']/.test(html)) errors.push(`${name}: skip link target is missing`);
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim();
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1];
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (!isNoindex) {
    if (!title) errors.push(`${name}: missing title`);
    if (!description) errors.push(`${name}: missing meta description`);
    if (!canonical) errors.push(`${name}: missing canonical URL`);
    if (h1Count !== 1) errors.push(`${name}: expected one H1, found ${h1Count}`);
    for (const property of ['og:title', 'og:description', 'og:url', 'og:image']) {
      if (!new RegExp(`<meta\\s+property=["']${property}["']`, 'i').test(html)) warnings.push(`${name}: missing ${property}`);
    }
  }
  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[1]);
      if (/^(?:platform|solutions)\//.test(name) && data['@type'] === 'SoftwareApplication') {
        if (data.brand?.['@id'] !== 'https://www.anstelglobal.com/#autonautics' || data.brand?.name !== 'Autonautics') errors.push(`${name}: SoftwareApplication brand hierarchy is incorrect`);
        if (data.publisher?.['@id'] !== 'https://www.anstelglobal.com/#organization') errors.push(`${name}: SoftwareApplication publisher hierarchy is incorrect`);
      }
    } catch (error) { errors.push(`${name}: invalid JSON-LD (${error.message})`); }
  }
  for (const img of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt\s*=\s*["'][^"']*["']/i.test(img[1])) warnings.push(`${name}: image missing alt text`);
  }
  for (const link of html.matchAll(/(?:href|src)=["'](\/[^"'#?]*)/gi)) {
    const target = decodeURIComponent(link[1]);
    if (target === '/' || target.startsWith('//')) continue;
    const local = path.join(root, target.replace(/^\//, ''));
    const exists = fs.existsSync(local) || fs.existsSync(path.join(local, 'index.html'));
    if (!exists) errors.push(`${name}: broken internal reference ${target}`);
  }
  if (!isNoindex && !name.includes('/post/') && !sitemap.includes(`https://www.anstelglobal.com${pageUrl(file)}`)) {
    warnings.push(`${name}: not included in sitemap.xml`);
  }
  if (countryConsistencyPages.includes(name)) {
    const visibleAndSchema = textContent(html) + html.match(/<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/gi)?.join(' ');
    for (const country of countries) if (!visibleAndSchema.includes(country)) warnings.push(`${name}: country consistency missing ${country}`);
  }
}

if (/<(?:priority|changefreq)>/i.test(sitemap)) errors.push('sitemap.xml: obsolete priority/changefreq field');

console.log(`Audited ${htmlFiles.length} HTML files.`);
if (errors.length) console.log(`\nErrors (${errors.length}):\n- ${[...new Set(errors)].join('\n- ')}`);
if (warnings.length) console.log(`\nWarnings (${warnings.length}):\n- ${[...new Set(warnings)].join('\n- ')}`);
if (!errors.length && !warnings.length) console.log('All checks passed.');
process.exitCode = errors.length ? 1 : 0;
