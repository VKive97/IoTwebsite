import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const excluded = new Set(['.git', 'node_modules']);
const warnings = [];
const errors = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory() && excluded.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function attribute(source, name) {
  return source.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'))?.[2];
}

function localAsset(url) {
  if (!url?.startsWith('/') || url.startsWith('//')) return null;
  const file = path.join(root, decodeURIComponent(url.split(/[?#]/)[0]).replace(/^\//, ''));
  return fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
}

const htmlFiles = walk(root).filter(file => file.endsWith('.html'));
let responsiveImages = 0;
let lazyImages = 0;
let checkedImages = 0;

for (const file of htmlFiles) {
  const name = path.relative(root, file).replaceAll('\\', '/');
  if (name.startsWith('admin/')) continue;
  const html = fs.readFileSync(file, 'utf8');
  const htmlKb = Math.round(Buffer.byteLength(html) / 1024);
  if (htmlKb > 250) warnings.push(`${name}: HTML payload is ${htmlKb} KB`);

  let highPriorityImages = 0;
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    checkedImages += 1;
    const attrs = match[1];
    const src = attribute(attrs, 'src');
    const srcset = attribute(attrs, 'srcset');
    const loading = attribute(attrs, 'loading');
    const priority = attribute(attrs, 'fetchpriority');
    if (srcset) responsiveImages += 1;
    if (loading === 'lazy') lazyImages += 1;
    if (priority === 'high') highPriorityImages += 1;

    const asset = localAsset(src);
    if (!asset) continue;
    const kb = Math.round(fs.statSync(asset).size / 1024);
    if (kb > 250 && !srcset) warnings.push(`${name}: ${src} is ${kb} KB and has no responsive srcset`);
    if (loading === 'lazy' && priority === 'high') errors.push(`${name}: ${src} is both lazy-loaded and high priority`);
  }
  if (highPriorityImages > 1) warnings.push(`${name}: ${highPriorityImages} images use fetchpriority=high`);

  const head = html.match(/<head\b[\s\S]*?<\/head>/i)?.[0] || '';
  for (const match of head.matchAll(/<script\b([^>]*)\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    const attrs = match[1] + match[0];
    if (!/\b(?:defer|async|type=["']module["'])\b/i.test(attrs)) {
      warnings.push(`${name}: head script is render-blocking (${match[2]})`);
    }
  }
}

console.log(`Performance-audited ${htmlFiles.length} HTML files and ${checkedImages} image elements.`);
console.log(`${lazyImages} images are lazy-loaded; ${responsiveImages} have responsive srcsets.`);
if (errors.length) console.log(`\nErrors (${errors.length}):\n- ${[...new Set(errors)].join('\n- ')}`);
if (warnings.length) console.log(`\nWarnings (${warnings.length}):\n- ${[...new Set(warnings)].join('\n- ')}`);
if (!errors.length && !warnings.length) console.log('All performance checks passed.');
process.exitCode = errors.length ? 1 : 0;
