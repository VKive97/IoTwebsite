import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const imageFor = (relativePath) => {
  const page = relativePath.replaceAll('\\', '/');
  if (page === 'index.html' || page === 'platform/index.html') return 'cta-connected-operations.webp';
  if (page.startsWith('regions/')) return 'cta-regions.webp';
  if (page.startsWith('industries/')) return 'cta-industries.webp';
  if (page.startsWith('company/')) return 'cta-company-team.webp';
  if (/platform\/(?:iot|device-ecosystem)\//.test(page) || /solutions\/api-integrations\//.test(page)) return 'cta-industrial-iot.webp';
  if (/platform\/(?:last-mile|job-scheduling|merchant)\//.test(page) || /solutions\/(?:asset-management|inventory-management)\//.test(page)) return 'cta-field-operations.webp';
  if (/platform\/security-monitor\//.test(page) || /solutions\/(?:fleet-security|video-telematics|emergency-response|compliance)\//.test(page)) return 'cta-safety-security.webp';
  return 'cta-fleet-intelligence.webp';
};

const imageMeta = {
  'cta-connected-operations.webp': [1832, 859, 'Connected vehicles, assets and operations at a modern enterprise campus'],
  'cta-fleet-intelligence.webp': [1819, 865, 'Connected commercial fleet coordinated through live operational intelligence'],
  'cta-safety-security.webp': [1821, 864, 'Commercial fleet protected at a secure operations facility'],
  'cta-field-operations.webp': [1774, 887, 'Field service and delivery teams coordinating work at an urban operations hub'],
  'cta-industrial-iot.webp': [1823, 863, 'Connected industrial sensors and edge devices monitoring critical infrastructure'],
  'cta-industries.webp': [1823, 863, 'Transport, logistics, food distribution and service fleets operating from one campus'],
  'cta-regions.webp': [1823, 863, 'Connected transport operations moving through an Asia-Pacific logistics corridor'],
  'cta-company-team.webp': [1672, 941, 'Anstel operations team coordinating connected fleets across Asia-Pacific']
};

const figureFor = (image) => {
  const [width, height, alt] = imageMeta[image];
  const stem = image.replace(/\.webp$/, '');
  return `\n    <figure class="cta-band-media mb-0">\n      <img src="/images/${image}" alt="${alt}" width="${width}" height="${height}" decoding="async" srcset="/images/${stem}-640.webp 640w, /images/${stem}-1280.webp 1280w, /images/${image} ${width}w" sizes="100vw" loading="lazy">\n    </figure>\n`;
};

const normalizeBand = (section, image) => {
  const open = section.match(/^<section\b[^>]*>/)?.[0];
  if (!open) return section;
  let inner = section.slice(open.length, -'</section>'.length);
  inner = inner.replace(/\s*<figure\b[^>]*class="[^"]*cta-band-media[^"]*"[^>]*>[\s\S]*?<\/figure>\s*/g, '\n');
  inner = inner.replace(/\scta-band-content\b/g, '');
  return `${open}\n    <div class="cta-band-content">${inner.trimEnd()}\n    </div>${figureFor(image)}</section>`;
};

const htmlFiles = [];
const visit = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(fullPath);
    else if (entry.name === 'index.html') htmlFiles.push(fullPath);
  }
};
visit(root);

let updatedCount = 0;
for (const file of htmlFiles) {
  const relativePath = path.relative(root, file);
  const image = imageFor(relativePath);
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  html = html.replace(/<section\b(?=[^>]*class="[^"]*\bcta-band\b[^"]*")[^>]*>[\s\S]*?<\/section>/g, section => normalizeBand(section, image));
  html = html.replace(/<section\b(?=[^>]*class="[^"]*\bregion-cta\b[^"]*")[^>]*>[\s\S]*?<\/section>/g, section => {
    const withBand = section.replace(/class="([^"]*\bregion-cta\b[^"]*)"/, 'class="$1 cta-band"');
    return normalizeBand(withBand, image);
  });

  for (const customClass of ['locations-cta-wrap', 'stories-cta-wrap']) {
    const pattern = new RegExp(`<section\\b(?=[^>]*class="[^"]*\\b${customClass}\\b[^"]*")[^>]*>[\\s\\S]*?<\\/section>`, 'g');
    html = html.replace(pattern, section => {
      if (section.includes('cta-band-media')) return section;
      return section.replace('</section>', `${figureFor(image)}</section>`);
    });
  }

  if (html !== original) {
    fs.writeFileSync(file, html);
    updatedCount += 1;
  }
}

console.log(`Applied related CTA images to ${updatedCount} pages.`);
