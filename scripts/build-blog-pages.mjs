/* Turns every published post from the Blog API into a real, indexable page.

   Why: the admin publishes into the API, and the public pages used to render
   posts with JavaScript at /company/knowledge-center/post/?slug=... — marked
   noindex, missing from the sitemap and empty for crawlers. This script writes:

     - /company/knowledge-center/<slug>/index.html   (Knowledge Center posts)
     - /company/customer-stories/<slug>/index.html   ("Customer Stories" posts)

   each with the content in the HTML, a clean canonical URL, Open Graph/Twitter
   tags and BlogPosting/Article + BreadcrumbList structured data. It also:

     - copies images stored on the (LAN-only) API server into /images/blog/,
       so they load on the public HTTPS site;
     - lists the generated posts as plain links on the Knowledge Center and
       Customer Stories index pages (between "blog-pages" markers);
     - writes /js/blog-pages.js, a slug -> URL map the browser scripts use to
       link to (and redirect to) the real pages;
     - deletes pages it generated earlier for posts that were since
       unpublished or deleted. Hand-built pages are never touched.

   Run with:  npm run build-blog      (then deploy as usual)
   Needs the API to be reachable (office network). */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sanitizeHtml from 'sanitize-html';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = 'https://www.anstelglobal.com';
const API_BASE = (process.env.ANSTEL_API_BASE || 'http://192.168.4.9:9814').replace(/\/$/, '');
const GENERATOR = 'anstel-blog-pages';
const TEMPLATE = path.join(root, 'company/knowledge-center/gps-tracking-papua-new-guinea/index.html');
const SECTIONS = {
  knowledge: { dir: 'company/knowledge-center', label: 'Knowledge Center', back: '&larr; All Posts', schemaType: 'BlogPosting' },
  stories: { dir: 'company/customer-stories', label: 'Customer Stories', back: '&larr; All customer stories', schemaType: 'Article' }
};
const SKIP_CATEGORIES = ['events']; // published through the events pages instead

// ---------------------------------------------------------------- helpers
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isoDate = v => { const d = new Date(v); return isNaN(d) ? null : d.toISOString().slice(0, 10); };
const longDate = v => new Date(v).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const publishDate = p => isoDate(p.createdAt) || isoDate(p.updatedAt);

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}
const itemsOf = d => (Array.isArray(d) ? d : (d && Array.isArray(d.items) ? d.items : []));

async function fetchAllPosts() {
  let all = [];
  for (let page = 1; page <= 50; page++) {
    const data = await getJson(`${API_BASE}/api/Blog/GetAll?page=${page}&pageSize=100`);
    all = all.concat(itemsOf(data));
    if (Array.isArray(data) || page >= (data.totalPages || 1)) break;
  }
  return all;
}

// Width/height from the image header (PNG, GIF, JPEG, WebP) so pages can
// reserve space and don't jump while images load. Returns null if unknown.
function imageSize(buf) {
  try {
    if (buf.slice(1, 4).toString() === 'PNG') return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (buf.slice(0, 3).toString() === 'GIF') return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
    if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') {
      const kind = buf.slice(12, 16).toString();
      if (kind === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
      if (kind === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
      if (kind === 'VP8L') { const b = buf.readUInt32LE(21); return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 }; }
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      for (let i = 2; i < buf.length - 9;) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
  } catch { /* fall through */ }
  return null;
}

/* Copies an image into /images/blog/ and returns { src, w, h }. Every image is
   copied — uploads on the LAN-only API server (unreachable from the public
   site) and images still hosted on the old website alike — so each page is
   self-contained and keeps working if those hosts change or go away. */
const imageCache = new Map();
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
async function localiseImage(src) {
  if (!src) return null;
  let url;
  try { url = new URL(src, API_BASE); } catch { return null; }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  if (imageCache.has(url.href)) return imageCache.get(url.href);
  let res;
  try { res = await fetch(url.href); } catch (error) { console.warn(`  ! could not download image ${url.href}: ${error.message}`); return null; }
  if (!res.ok) { console.warn(`  ! could not download image ${url.href} (HTTP ${res.status})`); return null; }
  const type = (res.headers.get('content-type') || '').split(';')[0].trim();
  const ext = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif' }[type];
  if (!ext) { console.warn(`  ! skipped ${url.href}: not a PNG/JPEG/WebP/GIF image (${type || 'unknown type'})`); return null; }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_IMAGE_BYTES) { console.warn(`  ! skipped ${url.href}: larger than 15 MB`); return null; }
  const name = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 20) + ext;
  const dir = path.join(root, 'images/blog');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name);
  if (!fs.existsSync(file)) fs.writeFileSync(file, buf);
  const size = imageSize(buf);
  const result = { src: '/images/blog/' + name, w: size?.w || null, h: size?.h || null };
  imageCache.set(url.href, result);
  return result;
}
const dims = img => (img && img.w && img.h ? ` width="${img.w}" height="${img.h}"` : '');

// Same allow-list as the browser-side sanitiser in js/blog.js.
const VIDEO_HOSTS = ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'];
function cleanContent(html) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote', 'h2', 'h3', 'h4', 'ol', 'ul', 'li', 'a', 'img', 'video', 'source', 'iframe', 'pre', 'code', 'span', 'div'],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      video: ['src', 'controls', 'poster', 'preload', 'playsinline'],
      source: ['src', 'type'],
      iframe: ['src', 'title', 'allow', 'allowfullscreen', 'loading', 'referrerpolicy']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'], video: ['https'], source: ['https'], iframe: ['https'] },
    allowedIframeHostnames: VIDEO_HOSTS,
    allowProtocolRelative: false,
    transformTags: {
      h1: 'h2', // the page title is the only h1
      a: (tag, attribs) => {
        const out = { ...attribs };
        if (/^https?:/i.test(out.href || '') && !out.href.startsWith(site)) { out.target = '_blank'; out.rel = 'noopener noreferrer'; }
        return { tagName: 'a', attribs: out };
      }
    },
    // Drop empty paragraphs (editors leave many), but keep ones holding media.
    exclusiveFilter: frame => frame.tag === 'p' && !frame.text.trim() && !(frame.mediaChildren || []).length
  });
}

function excerpt(html, max = 155) {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

function isGeneratedPage(file) {
  try { return fs.readFileSync(file, 'utf8').includes(`<meta name="generator" content="${GENERATOR}">`); } catch { return false; }
}

// ---------------------------------------------------------------- template
const template = fs.readFileSync(TEMPLATE, 'utf8');
const headInner = template.match(/<head>([\s\S]*?)<\/head>/)[1];
const PAGE_SPECIFIC = [
  /<title>[\s\S]*?<\/title>/, /<meta name="description"[^>]*>/, /<link rel="canonical"[^>]*>/,
  /<meta property="og:(?!locale|site_name)[^>]*>/g, /<meta property="og:site_name"[^>]*>/, /<meta property="article:[^>]*>/g,
  /<meta name="twitter:[^>]*>/g, /<link rel="preload" as="image"[^>]*>/, /<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
  /<meta name="robots"[^>]*>/
];
let sharedHead = headInner;
for (const re of PAGE_SPECIFIC) sharedHead = sharedHead.replace(re, '');
sharedHead = sharedHead.split('\n').map(l => l.trimEnd()).filter(l => l.trim()).join('\n');
const bodyStart = template.slice(template.indexOf('<body'), template.indexOf('<article'));
const bodyEnd = template.slice(template.indexOf('</article>') + '</article>'.length);

function renderPage(post, section, category, cover, content) {
  const s = SECTIONS[section];
  const url = `${site}/${s.dir}/${post.slug}/`;
  const description = excerpt(post.content) || post.title;
  const published = isoDate(post.createdAt) || isoDate(post.updatedAt);
  const modified = isoDate(post.updatedAt) || published;
  const imageAbs = cover ? site + cover.src : `${site}/images/AutonauticsLanding.webp`;
  const eyebrow = section === 'stories' ? 'Customer Story' : (category || 'Knowledge Center');
  const ld = {
    '@context': 'https://schema.org', '@type': s.schemaType,
    headline: post.title.slice(0, 110), description, image: imageAbs,
    datePublished: published, dateModified: modified,
    author: { '@type': 'Organization', name: 'Anstel', '@id': `${site}/#organization` },
    publisher: { '@id': `${site}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    about: [{ '@id': `${site}/#autonautics` }].concat(category && section === 'knowledge' ? [category] : []),
    inLanguage: 'en'
  };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` },
    { '@type': 'ListItem', position: 2, name: s.label, item: `${site}/${s.dir}/` },
    { '@type': 'ListItem', position: 3, name: post.title, item: url }
  ] };
  // Browser/search title: keep within ~60 characters so Google doesn't cut it
  // mid-word; social cards and the on-page <h1> keep the full title.
  const shortTitle = post.title.length > 52 ? post.title.slice(0, 51).replace(/\s+\S*$/, '') + '…' : post.title;
  const title = `${shortTitle} | Anstel`;
  const head = `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="generator" content="${GENERATOR}">
  <link rel="canonical" href="${esc(url)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta property="og:type" content="article"><meta property="og:site_name" content="Anstel">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:image" content="${esc(imageAbs)}">
  <meta property="og:image:alt" content="${esc(post.title)}">${cover && cover.w ? `<meta property="og:image:width" content="${cover.w}"><meta property="og:image:height" content="${cover.h}">` : ''}
  <meta property="article:published_time" content="${published}"><meta property="article:modified_time" content="${modified}">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(imageAbs)}">
  <meta name="twitter:image:alt" content="${esc(post.title)}">
${sharedHead.replace(/^\s*<meta charset[^>]*>\s*/m, '').replace(/^\s*<meta name="viewport"[^>]*>\s*/m, '')}
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
  <script type="application/ld+json">${JSON.stringify(crumbs)}</script>
</head>`;
  const dates = published === modified
    ? `Published ${longDate(published)}`
    : `Published ${longDate(published)} &middot; Updated ${longDate(modified)}`;
  const article = `<article class="section-pad px-4"><div style="max-width:720px;margin:auto">
    <a href="/${s.dir}/" class="small fw-semibold text-decoration-none d-inline-block mb-4" style="color:#171a20">${s.back}</a>
    <p class="section-eyebrow">${esc(eyebrow)}</p>
    <h1 class="fw-bold mb-3" style="font-size:clamp(1.9rem,4.5vw,3rem);letter-spacing:-.03em;line-height:1.15">${esc(post.title)}</h1>
    <p class="text-muted mb-4">By ${esc(post.author || 'Anstel Team')} &middot; ${dates}</p>
    ${cover ? `<img src="${esc(cover.src)}"${dims(cover)} class="img-fluid w-100 mb-4 rounded-4" alt="${esc(post.title)}" decoding="async" fetchpriority="high" style="max-height:460px;object-fit:cover">` : ''}
    <div class="post-content">
${content}
    </div>
  </div></article>`;
  const html = `<!doctype html>\n<html lang="en">\n${head}\n${bodyStart}${article}${bodyEnd}`;
  return html.replace(/[ \t]+$/gm, '');
}

// Card / tile markup for the index pages (plain links crawlers can follow).
function knowledgeCard(p) {
  const img = p.cover ? `<div class="event-media blog-cover-media mb-3"><img src="${esc(p.cover.src)}"${dims(p.cover)} alt="${esc(p.title)}" loading="lazy" decoding="async"></div>` : '';
  return `        <div class="col" data-static-post="${esc(p.slug)}" data-published="${p.published}"${p.categoryId ? ` data-category-id="${p.categoryId}"` : ''}>
          <a href="/${SECTIONS.knowledge.dir}/${p.slug}/" class="text-decoration-none d-block">
            ${img}
            <h2 class="blog-card-title text-dark mb-1 line-clamp-2">${esc(p.title)}</h2>
            <p class="blog-card-date mb-0">${esc(new Date(p.published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}</p>
          </a>
        </div>`;
}
function storyTile(p) {
  const media = p.cover ? `<div class="story-media"><img src="${esc(p.cover.src)}"${dims(p.cover)} alt="${esc(p.title)}" loading="lazy" decoding="async"></div>` : '<div class="story-media"></div>';
  return `          <a class="story-tile" href="/${SECTIONS.stories.dir}/${p.slug}/">
            ${media}
            <h2>${esc(p.title)}</h2><span class="story-meta">${esc(new Date(p.published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}</span>
          </a>`;
}

// Replaces the block between <!-- blog-pages:start --> and <!-- blog-pages:end -->,
// inserting the markers right after `anchor` the first time.
function injectBlock(file, anchor, inner) {
  let html = fs.readFileSync(file, 'utf8');
  const block = `<!-- blog-pages:start (generated by scripts/build-blog-pages.mjs) -->\n${inner}\n<!-- blog-pages:end -->`;
  if (html.includes('<!-- blog-pages:start')) {
    html = html.replace(/<!-- blog-pages:start[\s\S]*?<!-- blog-pages:end -->/, block);
  } else {
    const at = html.indexOf(anchor);
    if (at < 0) throw new Error(`anchor not found in ${file}: ${anchor}`);
    html = html.slice(0, at + anchor.length) + '\n' + block + html.slice(at + anchor.length);
  }
  fs.writeFileSync(file, html);
}

// ---------------------------------------------------------------- main
const [posts, categoriesRaw] = await Promise.all([
  fetchAllPosts(),
  getJson(`${API_BASE}/api/Category/GetAllCategories`)
]);
const categories = new Map(itemsOf(categoriesRaw).map(c => [c.id, c.name]));
const generated = { knowledge: [], stories: [] };
const written = new Set();

for (const post of posts) {
  if (!post.isPublished) continue;
  const slug = String(post.slug || '');
  if (!SLUG_RE.test(slug) || slug.length > 200) { console.warn(`  ! skipped "${post.title}": slug "${slug}" isn't URL-safe`); continue; }
  const category = categories.get(post.categoryId) || '';
  const lc = category.trim().toLowerCase();
  if (SKIP_CATEGORIES.includes(lc)) continue;
  const section = lc === 'customer stories' ? 'stories' : 'knowledge';
  const dir = path.join(root, SECTIONS[section].dir, slug);
  const file = path.join(dir, 'index.html');
  if (fs.existsSync(file) && !isGeneratedPage(file)) { console.warn(`  ! skipped "${post.title}": a hand-built page already exists at /${SECTIONS[section].dir}/${slug}/`); continue; }

  // Copy every image (cover + inline) into the site, then rebuild each inline
  // <img> with its local path, real size and alt text (the post title when the
  // editor left none). Images that can't be copied are dropped.
  const cover = await localiseImage(post.thumbnailUrl === 'null' ? '' : post.thumbnailUrl);
  let html = post.content || '';
  for (const tag of [...new Set(html.match(/<img\b[^>]*>/gi) || [])]) {
    const src = (tag.match(/\ssrc="([^"]+)"/i) || [])[1];
    const alt = ((tag.match(/\salt="([^"]*)"/i) || [])[1] || '').trim();
    const img = src ? await localiseImage(src.replace(/&amp;/g, '&')) : null;
    html = html.split(tag).join(img ? `<img src="${img.src}" alt="${esc(alt || post.title)}"${dims(img)}>` : '');
  }
  const content = cleanContent(html).replace(/<img /g, '<img loading="lazy" decoding="async" ');

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, renderPage(post, section, category, cover, content));
  written.add(path.resolve(file));
  generated[section].push({ slug, title: post.title, cover, categoryId: post.categoryId, published: isoDate(post.createdAt) || isoDate(post.updatedAt) });
  if (publishDate(post) > new Date().toISOString().slice(0, 10)) {
    console.warn(`  ! "${post.title}" has a publish date in the future (${publishDate(post)}) — check the API server's clock`);
  }
  console.log(`  + /${SECTIONS[section].dir}/${slug}/`);
}

// Remove pages generated earlier for posts that are no longer published.
for (const s of Object.values(SECTIONS)) {
  const base = path.join(root, s.dir);
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.resolve(base, entry.name, 'index.html');
    if (!written.has(file) && isGeneratedPage(file)) {
      fs.rmSync(path.join(base, entry.name), { recursive: true, force: true });
      console.log(`  - /${s.dir}/${entry.name}/ (no longer published)`);
    }
  }
}

// Plain links on the index pages, newest first.
for (const list of Object.values(generated)) list.sort((a, b) => String(b.published).localeCompare(String(a.published)));
injectBlock(path.join(root, 'company/knowledge-center/index.html'), 'id="blog-grid">', generated.knowledge.map(knowledgeCard).join('\n'));
injectBlock(path.join(root, 'company/customer-stories/index.html'), 'id="story-grid">', generated.stories.map(storyTile).join('\n'));

// Slug -> URL map for the browser scripts.
const map = {};
for (const [section, list] of Object.entries(generated)) for (const p of list) map[p.slug] = `/${SECTIONS[section].dir}/${p.slug}/`;
fs.writeFileSync(path.join(root, 'js/blog-pages.js'),
  `/* Generated by scripts/build-blog-pages.mjs — do not edit by hand.\n   Published posts that have a real page: slug -> URL. */\nwindow.ANSTEL_BLOG_PAGES = ${JSON.stringify(map, null, 2)};\n`);

console.log(`Built ${generated.knowledge.length} Knowledge Center page(s) and ${generated.stories.length} Customer Story page(s).`);
