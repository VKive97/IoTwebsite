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

function australianiseProse(value) {
  return value
    .replace(/\borganizations\b/g, 'organisations')
    .replace(/\borganization\b/g, 'organisation')
    .replace(/\bbehaviors\b/g, 'behaviours')
    .replace(/\bbehavior\b/g, 'behaviour')
    .replace(/\bcentralized\b/g, 'centralised')
    .replace(/\bauthorized\b/g, 'authorised')
    .replace(/\bunauthorized\b/g, 'unauthorised')
    .replace(/\boptimized\b/g, 'optimised')
    .replace(/\boptimizing\b/g, 'optimising')
    .replace(/\boptimize\b/g, 'optimise')
    .replace(/\boptimization\b/g, 'optimisation');
}

const navbarSource = fs.readFileSync(path.join(root, 'js', 'navbar.js'), 'utf8');
const navbarMarkup = navbarSource.match(/var navMarkup = `([\s\S]*?)`;\s*\n\s*\/\/ Apply lazy loading/)?.[1];
if (!navbarMarkup) throw new Error('Shared navbar markup could not be read from js/navbar.js.');
const staticNavbarMarkup = navbarMarkup.replace(
  /<img\s+src=(?!["']\/images\/anstel\.svg)/g,
  '<img loading="lazy" decoding="async" width="512" height="341" src='
);
const completeStaticNav = `<header id="site-nav" class="position-fixed top-0 start-0 end-0 bg-white" style="z-index:1050" data-static-nav>${staticNavbarMarkup}</header><div id="mega-overlay"></div>`;

const htmlFiles = walk(root).filter(file => file.endsWith('.html'));
const homepageSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sharedFooter = homepageSource.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0];
if (!sharedFooter) throw new Error('Homepage footer is required as the shared footer template.');

for (const file of htmlFiles) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  if (rel.startsWith('admin/')) continue;
  let html = fs.readFileSync(file, 'utf8');

  html = html.replace(/(<img src="\/images\/anstel\.svg" width=")115(" height="40")/g, '$1208$2');
  html = html.replace(/href=["']\/solutions\/fleet-management\/["'](?=[^>]*>\s*Solutions\s*<\/a>)/gi, 'href="/solutions/"');

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

  // Every solution detail page rolls up to the central Solutions collection.
  if (/^solutions\/[^/]+\/index\.html$/.test(rel)) {
    html = html
      .replaceAll('"name":"Advanced Capabilities","item":"https://www.anstelglobal.com/platform/#advanced-capabilities"', '"name":"Solutions","item":"https://www.anstelglobal.com/solutions/"')
      .replaceAll('"name":"Solutions","item":"https://www.anstelglobal.com/platform/#solutions"', '"name":"Solutions","item":"https://www.anstelglobal.com/solutions/"');
  }

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

  const copyCorrections = new Map([
    ['<p class="tesla-spec-value mb-0">4</p>\n          <p class="tesla-spec-label mb-0">Countries Served</p>', '<p class="tesla-spec-value mb-0">5</p>\n          <p class="tesla-spec-label mb-0">Operating Markets</p>'],
    ['Anstel supports connected fleet, asset, and IoT\n        operations across Australia, New Zealand, India, Papua New Guinea, and Fiji&mdash;with local teams and\n        support in each region.', 'Anstel supports connected fleet, asset, and IoT operations across Australia, New Zealand, India, Papua New Guinea, and Fiji. Operations across the five markets are coordinated by Anstel&rsquo;s teams in Sydney, Gurugram and Suva.'],
    ['fleet management and IoT product', 'connected fleet and IoT platform'],
    ['fleet management and connected IoT product', 'connected fleet and IoT platform'],
    ['our fleet management and IoT\n          product', 'our connected fleet and IoT platform'],
    ['a connected product designed around', 'a connected fleet and IoT platform designed around'],
    ['Fleet Services Marketplace | Anstel Merchant', 'Fleet Services Marketplace | Autonautics Merchant'],
    ['and complies with AIS-140 and other regional', 'and supports compatible AIS-140 devices and workflows alongside other regional'],
    ['fatigue indicators, detected automatically from GPS and telematics data with no extra hardware beyond the standard tracker.', 'fatigue and distraction indicators when compatible camera or DMS hardware is installed; tracker-based events such as speeding, harsh braking, rapid acceleration, harsh cornering, and excessive idling do not require camera hardware.'],
    ['fatigue indicators, detected automatically from GPS and telematics data\n              with no extra hardware beyond the standard tracker.', 'fatigue and distraction indicators when compatible camera or DMS hardware is installed; tracker-based events such as speeding, harsh braking, rapid acceleration, harsh cornering, and excessive idling do not require camera hardware.'],
    ['Remotely immobilize authorized vehicles when required to', 'When authorised, operators can remotely immobilise compatible vehicles to'],
    ['Remotely immobilize authorized vehicles during security', 'When authorised, operators can remotely immobilise compatible vehicles during security'],
    ['planning jobs, scheduling workforce, depots, and zones, and tracking every job live', 'planning jobs and scheduling teams across depots and zones, while tracking every job live'],
    ['planning jobs, scheduling workforce and depots/zones, and tracking live operational execution.', 'planning jobs and scheduling teams across depots and zones, with live operational execution tracking.'],
    ['Add products, services, and define', 'Add products and services, and define'],
    ['the right job to the right workforce', 'the right job to the right worker or team'],
    ['Know who&rsquo;s available, assigned, in progress, or\n              completed&mdash;all from one operational dashboard.', 'Know who is available or assigned, and which jobs are in progress or completed&mdash;all from one operational dashboard.'],
    ['helps Fiji organisations', 'helps organisations in Fiji'],
    ['cloud based', 'cloud-based'],
    ['insights&mdash;\n        helping', 'insights&mdash;helping'],
    ['&mdash;no forced hardware switch', ' &mdash; no forced hardware switch'],
    ['hardware sensors and cloud actionable insights', 'connected hardware and actionable cloud-based insights'],
    ['Consumer buying probability insight', 'Consumer buying-probability insights'],
    ['multi-national fleets', 'multinational fleets'],
    ['R&amp;D Backed Platform', 'R&amp;D-Backed Platform'],
    ['Government R&amp;D Backed', 'Government R&amp;D-Backed'],
    ['supports hardware from Teltonika, Queclink, and Jimi and 20+ device models', 'supports selected models from Teltonika, Ruptela, Queclink and Jimi IoT, with 20+ compatible device models overall']
    ,['Autonautics works with GPS and telematics hardware from Teltonika,\n        Queclink, and Jimi, plus 20+ supported device models, and supports compatible AIS-140 devices and workflows alongside other regional\n        standards&mdash;so you can keep the hardware you already run.', 'Autonautics works with selected GPS and telematics models and supports compatible AIS-140 devices and workflows, as well as other regional standards&mdash;so you can keep compatible hardware you already run.']
    ,['Connected Fleet is device-agnostic and supports Teltonika, Queclink, Jimi, and 20+ other models', 'Connected Fleet supports selected models from Teltonika, Ruptela, Queclink and Jimi IoT, with 20+ compatible device models overall']
    ,['Connected Fleet is device-agnostic and supports Teltonika,\n              Queclink, Jimi, and 20+ other models', 'Connected Fleet supports selected models from Teltonika, Ruptela, Queclink and Jimi IoT, with 20+ compatible device models overall']
    ,['When authorised, operators can remotely immobilise compatible vehicles to\n            help prevent unauthorised movement and support vehicle recovery during security incidents.', 'When authorised, operators can remotely immobilise compatible vehicles. This can help prevent unauthorised movement and support vehicle recovery during security incidents.']
    ,['When authorised, operators can remotely immobilise compatible vehicles during security\n              incidents or unauthorised activity to help prevent further movement and support vehicle recovery.', 'When authorised, operators can remotely immobilise compatible vehicles. This can help prevent further movement and support vehicle recovery during a security incident or unauthorised activity.']
    ,['consumer buying probability insights', 'consumer buying-probability insights']
  ]);
  for (const [before, after] of copyCorrections) html = html.replaceAll(before, after);

  if (rel === 'regions/index.html') {
    html = html.replace(
      '<img src="/images/industries-hero-v2.webp" width="1536" height="1024" alt="Autonautics connected fleet operations across Asia-Pacific" fetchpriority="high">',
      '<video id="regions-hero-video" poster="/images/industries-hero-v2-640.webp" muted loop playsinline autoplay preload="none" disablepictureinpicture disableremoteplayback aria-hidden="true"><source data-src="/videos/connected-operations-asia-pacific-hero.mp4" type="video/mp4"></video>'
    );
    if (!html.includes('function loadRegionsHeroVideo')) {
      const videoLoader = `<script>
  (function () {
    var video = document.getElementById('regions-hero-video');
    var source = video && video.querySelector('source[data-src]');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var reduceData = navigator.connection && navigator.connection.saveData;
    function loadRegionsHeroVideo() {
      if (!source || reduceMotion || reduceData) return;
      source.src = source.dataset.src;
      source.removeAttribute('data-src');
      video.load();
      video.play().catch(function () {});
    }
    function queueRegionsHeroVideo() {
      if ('requestIdleCallback' in window) requestIdleCallback(loadRegionsHeroVideo, { timeout: 1200 });
      else setTimeout(loadRegionsHeroVideo, 250);
    }
    if (document.readyState === 'complete') queueRegionsHeroVideo();
    else window.addEventListener('load', queueRegionsHeroVideo, { once: true });
    document.addEventListener('visibilitychange', function () {
      if (!video || !source || source.dataset.src) return;
      if (document.hidden) video.pause();
      else video.play().catch(function () {});
    });
  }());
</script>`;
      html = html.replace('</body>', `${videoLoader}</body>`);
    }
  }

  if (/^industries\/(?:transportation|logistics-supply-chain|waste-management|food-services-fmcg)\/index\.html$/.test(rel)) {
    const cardTypes = new Map([
      ['Connected Fleet', 'Product'], ['Last Mile', 'Product'], ['IoT Monitoring', 'Product'],
      ['Device Ecosystem', 'Platform'], ['Fleet Tracking', 'Solution'], ['Route Optimization', 'Solution'],
      ['Fuel Management', 'Solution'], ['Compliance', 'Solution'], ['Dispatch Management', 'Solution'],
      ['Asset Management', 'Solution'], ['Reports &amp; Analytics', 'Solution'], ['Alerts &amp; Notifications', 'Solution']
    ]);
    for (const [title, type] of cardTypes) {
      const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp('(<p class="text-muted fw-semibold text-uppercase mb-2"[^>]*>\\s*)(?:Product|Platform|Solution)(</p>\\s*<h3[^>]*>' + escaped + '</h3>)', 'g'), `$1${type}$2`);
    }
  }

  if (rel === 'privacy-policy/index.html') {
    const safeguards = '<h2>How Anstel protects customer information</h2><p>Anstel applies organisational and technical safeguards to protect customer information processed through Autonautics and its supporting systems.</p><ul><li><strong>Encryption:</strong> Information is protected during transmission and, where applicable, while stored.</li><li><strong>Secure authentication:</strong> Account controls help prevent unauthorised access to Autonautics.</li><li><strong>Role-based access:</strong> Users receive access according to their authorised responsibilities.</li><li><strong>Audit logs:</strong> Relevant account and system activities may be recorded to support security reviews and investigations.</li><li><strong>Backups and recovery:</strong> Operational data is backed up and supported by recovery processes designed to maintain service continuity.</li><li><strong>Security monitoring:</strong> Anstel monitors relevant systems and access activity to identify and respond to potential security issues.</li><li><strong>Privacy requests:</strong> Customers and individuals can submit privacy-related enquiries or requests through the <a href="/company/contact/">contact form</a> or using the contact details below.</li></ul>';
    html = html.replace('Effective 26 August 2026', 'Effective 9 September 2026');
    if (!html.includes('How Anstel protects customer information')) {
      html = html.replace('</p><h2>Your choices and rights</h2>', `</p>${safeguards}<h2>Your choices and rights</h2>`);
    }
  }

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

  // Keep the skip link first, then include the complete shared navigation in the
  // source HTML. JavaScript enhances this structure instead of replacing it.
  if (/\/js\/navbar\.js/.test(html)) {
    html = html
      .replace(/<a\b[^>]*class=["'][^"']*skip-link[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, '')
      .replace(/<header\b[^>]*(?:data-static-nav|id=["']site-nav["'])[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<div\b[^>]*id=["']mega-overlay["'][^>]*><\/div>/gi, '')
      .replace(/<body([^>]*)>/i, `<body$1><a class="skip-link" href="#main-content">Skip to main content</a>${completeStaticNav}`);
  } else if (/<(?:main|section)(?:\s|>)/i.test(html) && !/class=["'][^"']*skip-link/.test(html)) {
    html = html.replace(/<body([^>]*)>/i, '<body$1><a class="skip-link" href="#main-content">Skip to main content</a>');
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

  // Use Australian English in prose and descriptive metadata while retaining
  // official schema types, URLs, identifiers, and capitalised product names.
  html = html.replace(/<meta\b[^>]*>/gi, tag => {
    if (!/(?:name|property)=["'][^"']*description["']/i.test(tag)) return tag;
    return tag.replace(/content=(["'])([\s\S]*?)\1/i, (match, quote, value) => `content=${quote}${australianiseProse(value)}${quote}`);
  });
  html = html.replace(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi, (script, source) => {
    try {
      const data = JSON.parse(source);
      const proseKeys = new Set(['description', 'text', 'headline', 'serviceType']);
      const visit = value => {
        if (Array.isArray(value)) return value.forEach(visit);
        if (!value || typeof value !== 'object') return;
        for (const [key, item] of Object.entries(value)) {
          if (proseKeys.has(key) && typeof item === 'string') value[key] = australianiseProse(item);
          else visit(item);
        }
      };
      visit(data);
      return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
    } catch { return script; }
  });
  html = html.replace(/(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<[^>]+>)|([^<]+)/gi, (match, protectedMarkup, text) => protectedMarkup || australianiseProse(text));

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
