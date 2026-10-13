import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sanitizeHtml from 'sanitize-html';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiBase = (process.env.ANSTEL_BLOG_API || 'http://192.168.4.9:9814').replace(/\/$/, '');
const site = 'https://www.anstelglobal.com';
const eventsDir = path.join(root, 'events');
const template = fs.readFileSync(path.join(root, 'scripts', 'templates', 'event-page.tpl'), 'utf8');

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, character => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[character]);
}

function safePublicUrl(value) {
  const candidate = String(value || '').trim();
  if (!candidate || /[\u0000-\u001f\u007f]/.test(candidate)) return '';
  try {
    const parsed = new URL(candidate, site);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? candidate : '';
  } catch (_) {
    return '';
  }
}

function sanitizeRichHtml(value) {
  return sanitizeHtml(String(value || ''), {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'li', 'a', 'img', 'video', 'source', 'iframe', 'pre', 'code', 'span', 'div'],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'title'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding', 'class'],
      video: ['src', 'controls', 'playsinline', 'poster', 'preload', 'class'],
      source: ['src', 'type'],
      iframe: ['src', 'title', 'width', 'height', 'loading', 'allow', 'allowfullscreen', 'referrerpolicy', 'class'],
      '*': ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'], video: ['http', 'https'], source: ['http', 'https'], iframe: ['http', 'https'] },
    allowProtocolRelative: false,
    allowedIframeHostnames: ['youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
    transformTags: {
      a: (tagName, attributes) => ({
        tagName,
        attribs: attributes.target === '_blank' ? { ...attributes, rel: 'noopener noreferrer' } : { ...attributes, target: undefined, rel: undefined }
      }),
      img: (tagName, attributes) => ({
        tagName,
        attribs: { ...attributes, loading: attributes.loading || 'lazy', decoding: attributes.decoding || 'async' }
      }),
      iframe: (tagName, attributes) => ({
        tagName,
        attribs: { ...attributes, title: attributes.title || 'Embedded video', loading: 'lazy', referrerpolicy: 'strict-origin-when-cross-origin', allowfullscreen: '' }
      })
    }
  });
}

function decodeEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&ndash;/gi, '–').replace(/&mdash;/gi, '—')
    .replace(/&rsquo;/gi, '’').replace(/&lsquo;/gi, '‘').replace(/&rdquo;/gi, '”').replace(/&ldquo;/gi, '“')
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)));
}

function textOnly(value) {
  return decodeEntities(String(value || '').replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function dateFromSlug(slug) {
  const match = String(slug || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:-|$)/);
  if (!match) return '';
  const iso = `${match[1]}-${match[2]}-${match[3]}`;
  const date = new Date(`${iso}T12:00:00+05:30`);
  return Number.isNaN(date.getTime()) ? '' : iso;
}

function labelledValue(content, label) {
  const blocks = [...String(content || '').matchAll(/<(p|li|div)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  const prefix = `${label.toLowerCase()}:`;
  for (const block of blocks) {
    const text = textOnly(block[2]);
    if (text.toLowerCase().startsWith(prefix)) return text.slice(text.indexOf(':') + 1).trim();
  }
  return '';
}

function registrationUrl(content) {
  const blocks = [...String(content || '').matchAll(/<(p|li|div)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  for (const block of blocks) {
    if (!/register|registration|tickets?/i.test(textOnly(block[2]))) continue;
    const href = block[2].match(/<a\b[^>]*href=["']([^"']+)["']/i)?.[1];
    if (href) return decodeEntities(href);
  }
  return '';
}

function summaryFromContent(content) {
  const paragraphs = [...String(content || '').matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(match => textOnly(match[1]))
    .filter(text => text && !/^(event date|location|registration):/i.test(text));
  return (paragraphs[0] || textOnly(content)).slice(0, 190);
}

function fillTemplate(values) {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => values[key] ?? '');
}

async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

const categories = await getJson(`${apiBase}/api/Category/GetAllCategories`);
const eventCategory = categories.find(category => String(category.name || '').trim().toLowerCase() === 'events');
if (!eventCategory) {
  console.log('No "Events" category exists yet. Create it in the current admin when you are ready to publish.');
  process.exit(0);
}

const posts = await getJson(`${apiBase}/api/Blog/GetByCategory?categoryId=${encodeURIComponent(eventCategory.id)}`);
const events = posts.filter(post => post.isPublished).map(post => {
  const slug = String(post.slug || '').trim().toLowerCase();
  const date = dateFromSlug(slug);
  if (!/^[a-z0-9-]+$/.test(slug) || !date) {
    console.warn(`Skipping event "${post.title || post.id}": slug must begin YYYY-MM-DD- and contain only letters, numbers and hyphens.`);
    return null;
  }
  const content = sanitizeRichHtml(post.content || '');
  const location = labelledValue(content, 'Location');
  const registration = safePublicUrl(registrationUrl(content));
  const summary = summaryFromContent(content);
  const coverImage = post.thumbnailUrl && post.thumbnailUrl !== 'null' ? safePublicUrl(post.thumbnailUrl) : '';
  return {
    title: post.title || 'Anstel event', slug, date, location,
    registrationUrl: registration, coverImage, summary, content,
    url: `/events/${slug}/`
  };
}).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date));

const publicEvents = events.map(({ content, ...event }) => event);
fs.writeFileSync(path.join(eventsDir, 'events.json'), `${JSON.stringify(publicEvents, null, 2)}\n`);

// Remove only stale pages previously created by this generator. Hand-authored
// content under /events is never touched.
const currentSlugs = new Set(events.map(event => event.slug));
for (const entry of fs.readdirSync(eventsDir, { withFileTypes:true })) {
  if (!entry.isDirectory() || currentSlugs.has(entry.name) || !/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(entry.name)) continue;
  const directory = path.resolve(eventsDir, entry.name);
  const indexFile = path.join(directory, 'index.html');
  if (path.dirname(directory) !== path.resolve(eventsDir) || !fs.existsSync(indexFile)) continue;
  const source = fs.readFileSync(indexFile, 'utf8');
  if (!source.startsWith('<!-- Generated by scripts/sync-events.mjs -->')) continue;
  fs.rmSync(directory, { recursive:true, force:true });
}

for (const event of events) {
  const canonical = `${site}${event.url}`;
  const dateLabel = new Intl.DateTimeFormat('en-AU', { day:'numeric', month:'long', year:'numeric', timeZone:'Asia/Kolkata' }).format(new Date(`${event.date}T12:00:00+05:30`));
  const description = (event.summary || `${event.title}, an Anstel event.`).slice(0, 160);
  const schema = {
    '@context':'https://schema.org', '@type':'Event', name:event.title,
    startDate:event.date, eventStatus:'https://schema.org/EventScheduled',
    eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',
    description, url:canonical, organizer:{ '@id':`${site}/#organization` }
  };
  if (event.location) schema.location = { '@type':'Place', name:event.location, address:event.location };
  if (event.coverImage) schema.image = [event.coverImage];
  if (event.registrationUrl) schema.offers = { '@type':'Offer', url:event.registrationUrl, availability:'https://schema.org/InStock' };
  const breadcrumb = {
    '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:[
      { '@type':'ListItem', position:1, name:'Home', item:`${site}/` },
      { '@type':'ListItem', position:2, name:'Events', item:`${site}/events/` },
      { '@type':'ListItem', position:3, name:event.title, item:canonical }
    ]
  };
  const page = fillTemplate({
    TITLE:escapeHtml(event.title), TITLE_TEXT:escapeHtml(event.title),
    DESCRIPTION:escapeHtml(description), CANONICAL:escapeHtml(canonical),
    DATE_ISO:escapeHtml(event.date), DATE_LABEL:escapeHtml(dateLabel),
    LOCATION:event.location ? `<span>${escapeHtml(event.location)}</span>` : '',
    SOCIAL_IMAGE:event.coverImage ? `<meta property="og:image" content="${escapeHtml(event.coverImage)}"><meta name="twitter:image" content="${escapeHtml(event.coverImage)}">` : '',
    COVER_IMAGE:event.coverImage ? `<img class="event-detail-media" src="${escapeHtml(event.coverImage)}" alt="${escapeHtml(event.title)}" width="1536" height="864" decoding="async" fetchpriority="high">` : '',
    CONTENT:event.content,
    REGISTER_LINK:event.registrationUrl ? `<a class="event-register" href="${escapeHtml(event.registrationUrl)}" target="_blank" rel="noopener noreferrer">Register for this event</a>` : '',
    EVENT_SCHEMA:JSON.stringify(schema).replace(/</g, '\\u003c'),
    BREADCRUMB_SCHEMA:JSON.stringify(breadcrumb).replace(/</g, '\\u003c')
  });
  const directory = path.join(eventsDir, event.slug);
  fs.mkdirSync(directory, { recursive:true });
  fs.writeFileSync(path.join(directory, 'index.html'), page);
}

console.log(`Synced ${events.length} published event${events.length === 1 ? '' : 's'} from the existing Events category.`);
