import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = 'https://www.anstelglobal.com';

const stories = [
  {
    slug: 'suva-last-mile-visibility',
    region: 'Fiji',
    focus: 'Last-Mile Delivery',
    title: 'Suva: A Clearer Day for Last-Mile Dispatch',
    description: 'An illustrative Suva delivery workflow showing how live dispatch, driver navigation and proof of delivery can work together.',
    image: 'customer-story-suva-last-mile-v1.jpg',
    alt: 'Fijian delivery driver and operations colleague coordinating beside a right-hand-drive van in Suva',
    challenge: [
      'A busy delivery day can change before the first vehicle leaves the depot. New jobs arrive, traffic affects the original sequence, and dispatchers need to know which driver can respond without creating another delay.',
      'When assignments, calls and delivery evidence sit in separate tools, the team spends the day reconstructing what is happening instead of managing the next exception.'
    ],
    approach: [
      'In this scenario, Autonautics Last Mile gives dispatchers one view of active jobs, vehicles and route progress. Drivers receive their assigned stops and navigation on the Android devices they already use.',
      'Status updates and proof of delivery return to the same workflow, while the dispatcher focuses on late, incomplete or reassigned stops rather than calling every driver.'
    ],
    outcome: [
      'A connected workflow can give the operations team a shared answer to three everyday questions: what is assigned, where is it now, and has it been completed?',
      'Customers can receive more consistent updates, and drivers can spend less time relaying routine status information while keeping the final decision with the dispatcher.'
    ],
    products: 'Autonautics Last Mile and Connected Fleet',
    helps: 'Urban delivery teams coordinating changing routes, drivers and proof of delivery'
  },
  {
    slug: 'fiji-connected-field-operations',
    region: 'Fiji',
    focus: 'Connected Field Operations',
    title: 'Fiji: Connecting Vehicles, Assets and Field Work',
    description: 'An illustrative Fiji field-operation scenario bringing vehicles, assets and sensor alerts into one connected view.',
    image: 'customer-story-fiji-connected-field-v1.jpg',
    alt: 'Fijian field technicians inspecting a connected sensor beside a service vehicle',
    challenge: [
      'A field operation may depend on vehicles, generators, equipment and remote assets that do not all report through the same system. Connectivity can also vary between urban areas, worksites and outer locations.',
      'When each asset type has a separate portal, teams receive fragments of the operating picture and must match events manually.'
    ],
    approach: [
      'In this scenario, Autonautics Connected Monitor brings supported trackers, sensors and gateways into the same environment as fleet visibility. Rules can surface a device event or threshold breach for review instead of requiring constant screen watching.',
      'Compatible devices can retain and forward data after connectivity returns, with the exact behaviour depending on the selected hardware and network configuration.'
    ],
    outcome: [
      'A connected view can help the team understand which vehicles and assets are active, which devices need attention and where an exception occurred.',
      'That gives field and office teams a common operational record while allowing the deployment to grow one compatible device or workflow at a time.'
    ],
    products: 'Autonautics Connected Monitor and Connected Fleet',
    helps: 'Utilities, service teams and distributed operations using mixed vehicles and equipment'
  },
  {
    slug: 'papua-new-guinea-remote-fleet-safety',
    region: 'Papua New Guinea',
    focus: 'Remote Fleet Safety',
    title: 'Papua New Guinea: Keeping Remote Fleet Movements in View',
    description: 'An illustrative Papua New Guinea fleet-safety workflow for remote routes, variable coverage and security exceptions.',
    image: 'customer-story-png-remote-fleet-v1.jpg',
    alt: 'Papua New Guinean field coordinator monitoring fleet vehicles on a remote highlands road',
    challenge: [
      'Vehicles working between depots, project sites and remote communities can move through areas where coverage and response options vary. A control team needs useful context when a vehicle is overdue, leaves an expected area or triggers a supported SOS device.',
      'Location alone is not a response plan. Teams also need agreed contacts, escalation steps and a record of what happened.'
    ],
    approach: [
      'In this scenario, compatible tracking hardware supplies location and event data to Autonautics. Geofences, movement rules and supported safety inputs can notify authorised operators when configured conditions occur.',
      'Patrol Connect can help the team review the available vehicle context and coordinate its own response procedure. Coverage, hardware support and local emergency arrangements are confirmed during deployment.'
    ],
    outcome: [
      'The operating team can move from a vague concern to a defined exception with a vehicle, location, time and response record attached to it.',
      'This does not replace emergency services or guarantee connectivity, but it can provide a more organised foundation for remote-fleet awareness and escalation.'
    ],
    products: 'Connected Fleet, Patrol Connect and compatible tracking hardware',
    helps: 'Project, logistics and service fleets operating across remote or variable-coverage routes'
  }
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[character]);
}

function paragraphs(items) {
  return items.map(item => `<p>${escapeHtml(item)}</p>`).join('\n            ');
}

function imageVariant(filename, width) {
  return filename.replace(/(\.[^.]+)$/, `-${width}$1`);
}

for (const story of stories) {
  const canonical = `${site}/company/customer-stories/${story.slug}/`;
  const image = `${site}/images/${story.image}`;
  const schema = {
    '@context':'https://schema.org', '@type':'Article', headline:story.title,
    description:story.description, image, articleSection:story.focus,
    genre:'Illustrative operational scenario', isAccessibleForFree:true,
    isPartOf:{ '@id':`${site}/company/customer-stories/#webpage` },
    publisher:{ '@id':`${site}/#organization` }, about:{ '@id':`${site}/#autonautics` },
    mainEntityOfPage:{ '@type':'WebPage', '@id':canonical }
  };
  const breadcrumb = {
    '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:[
      { '@type':'ListItem', position:1, name:'Home', item:`${site}/` },
      { '@type':'ListItem', position:2, name:'Customer Stories', item:`${site}/company/customer-stories/` },
      { '@type':'ListItem', position:3, name:story.title, item:canonical }
    ]
  };
  const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(story.title)} | Anstel</title>
  <meta name="description" content="${escapeHtml(story.description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${canonical}">
  <link rel="preload" as="image" href="/images/${story.image}" imagesrcset="/images/${imageVariant(story.image, 640)} 640w, /images/${imageVariant(story.image, 1280)} 1280w, /images/${story.image} 1672w" imagesizes="(max-width:1080px) 100vw,1080px" fetchpriority="high">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="/css/styles.css?v=image-ratio-1">
  <link rel="stylesheet" href="/css/customer-story.css">
  <meta property="og:type" content="article"><meta property="og:site_name" content="Anstel">
  <meta property="og:url" content="${canonical}"><meta property="og:title" content="${escapeHtml(story.title)} | Anstel">
  <meta property="og:description" content="${escapeHtml(story.description)}"><meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(story.title)} | Anstel">
  <meta name="twitter:description" content="${escapeHtml(story.description)}"><meta name="twitter:image" content="${image}">
  <link rel="icon" href="/images/icon.svg" type="image/svg+xml">
  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumb).replace(/</g, '\\u003c')}</script>
</head>
<body style="padding-top:56px;padding-bottom:56px">
  <main id="main-content" tabindex="-1">
    <div class="cs-shell"><a href="/company/customer-stories/" class="cs-back">&larr; All stories</a></div>
    <header class="cs-masthead"><div class="cs-shell">
      <p class="cs-eyebrow">Illustrative Operational Story &middot; ${escapeHtml(story.region)}</p>
      <h1>${escapeHtml(story.title)}</h1><p class="cs-lede">${escapeHtml(story.description)}</p>
      <p class="cs-disclosure" role="note"><strong>About this story:</strong> This is an illustrative scenario based on supported Autonautics workflows. It does not identify, quote or claim measured results for a specific customer.</p>
    </div></header>
    <div class="cs-shell"><figure class="cs-hero mb-0"><img src="/images/${story.image}" srcset="/images/${imageVariant(story.image, 640)} 640w, /images/${imageVariant(story.image, 1280)} 1280w, /images/${story.image} 1672w" sizes="(max-width:1080px) 100vw,1080px" alt="${escapeHtml(story.alt)}" width="1672" height="941" loading="eager" decoding="async" fetchpriority="high"></figure></div>
    <div class="cs-shell"><div class="cs-body">
      <article class="cs-article">
        <section><h2>The operational challenge</h2>${paragraphs(story.challenge)}</section>
        <section><h2>A connected approach</h2>${paragraphs(story.approach)}</section>
        <section><h2>What this workflow makes possible</h2>${paragraphs(story.outcome)}</section>
        <div class="cs-nextprev"><a href="/company/customer-stories/"><span>Explore</span>View all operational stories</a></div>
      </article>
      <aside class="cs-aside" aria-label="Story overview"><dl>
        <dt>Region</dt><dd>${escapeHtml(story.region)}</dd><dt>Focus</dt><dd>${escapeHtml(story.focus)}</dd>
        <dt>Products</dt><dd>${escapeHtml(story.products)}</dd><dt>Where it helps</dt><dd>${escapeHtml(story.helps)}</dd>
      </dl></aside>
    </div></div>
    <section class="cs-cta-wrap" aria-labelledby="scenario-cta"><div class="cs-cta">
      <div><h2 id="scenario-cta">Explore this workflow with your operation.</h2><p>Bring your routes, vehicles and requirements to a guided Autonautics demonstration.</p></div>
      <div class="cs-actions"><a href="/demo/" class="cs-button cs-button-primary">Request a Demo</a><a href="/company/contact/" class="cs-button cs-button-secondary">Talk to Anstel</a></div>
    </div></section>
  </main>
  <footer></footer>
  <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="/js/navbar.js"></script><script src="/js/main.js"></script>
</body>
</html>`;
  const directory = path.join(root, 'company', 'customer-stories', story.slug);
  fs.mkdirSync(directory, { recursive:true });
  fs.writeFileSync(path.join(directory, 'index.html'), page);
}

console.log(`Built ${stories.length} illustrative operational stories.`);
