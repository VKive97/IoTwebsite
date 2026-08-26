/* Injects shared navbar + mega-overlay + schedule bar + loc-modal into product pages */
document.addEventListener('DOMContentLoaded', function () {

  var staticNav = document.querySelector('[data-static-nav]');
  if (staticNav) staticNav.remove();

  /* ── Navbar HTML ── */
  var header = document.createElement('header');
  header.id = 'site-nav';
  header.className = 'position-fixed top-0 start-0 end-0 bg-white';
  header.style.cssText = 'z-index:1050';
  header.innerHTML = `
    <div class="d-flex align-items-center px-4 px-md-5" style="height:56px;max-width:1536px;margin:auto">
      <a href="/" class="flex-shrink-0"><img src="/images/anstel.svg" height="40" alt="Anstel"></a>
      <nav class="d-none d-lg-flex align-items-center gap-1 mx-auto">
        <button class="nav-btn" data-mega="autonautics" aria-expanded="false" aria-controls="mega-autonautics">Autonautics</button>
        <button class="nav-btn" data-mega="solutions" aria-expanded="false" aria-controls="mega-solutions">Solutions</button>
        <button class="nav-btn" data-mega="industries" aria-expanded="false" aria-controls="mega-industries">Industries</button>
        <button class="nav-btn" data-mega="discover" aria-expanded="false" aria-controls="mega-discover">Discover</button>
      </nav>
      <div class="d-none d-lg-flex align-items-center gap-1">
        <a class="icon-btn" href="/company/contact/" aria-label="Contact Anstel for help"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg></a>
        <a class="icon-btn" href="/regions/" aria-label="View Autonautics operating regions"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></a>
      </div>
      <button class="icon-btn d-lg-none ms-auto" id="mobile-toggle" aria-label="Open primary navigation" aria-expanded="false" aria-controls="mobile-menu">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Mega: Autonautics -->
    <div id="mega-autonautics" class="mega-menu">
      <div class="d-flex gap-4 px-4 py-4" style="max-width:1280px;margin:auto">
        <div class="flex-grow-1">
          <div class="row g-4">
            <div class="col-6 col-md-4 col-lg-3"><a href="/platform/connected-fleet/" class="mega-product-card d-block"><img src="/images/connected fleet.webp" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Connected Fleet</p><p class="text-muted" style="font-size:.7rem">Fleet tracking &amp; operations</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-4 col-lg-3"><a href="/platform/last-mile/" class="mega-product-card d-block"><img src="/images/Lastmile.webp" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Last Mile</p><p class="text-muted" style="font-size:.7rem">Delivery execution platform</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-4 col-lg-3"><a href="/platform/security-monitor/" class="mega-product-card d-block"><img src="/images/Security.webp" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Security Monitor</p><p class="text-muted" style="font-size:.7rem">Vehicle &amp; driver security</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-4 col-lg-3"><a href="/platform/merchant/" class="mega-product-card d-block"><img src="/images/Merchant.webp" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Merchant</p><p class="text-muted" style="font-size:.7rem">Fleet services marketplace</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-4 col-lg-3"><a href="/platform/iot/" class="mega-product-card d-block"><img src="/images/IoTLogo.webp" alt=""><p class="fw-semibold small text-dark mt-2 card-name">IoT</p><p class="text-muted" style="font-size:.7rem">Connected devices &amp; sensors</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-4 col-lg-3"><a href="/platform/job-scheduling/" class="mega-product-card d-block"><img src="/images/job-scheduling-logo.webp" alt="Job Scheduling"><p class="fw-semibold small text-dark mt-2 card-name">Job Scheduling</p><p class="text-muted" style="font-size:.7rem">Plan, dispatch &amp; track jobs</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
          </div>
        </div>
        <div class="border-start ps-4 flex-shrink-0" style="width:176px">
          <p class="text-uppercase fw-semibold text-muted mb-3" style="font-size:.68rem;letter-spacing:.1em">Explore</p>
          <ul class="list-unstyled mb-0">
            <li class="mb-2"><a href="/platform/" class="small text-secondary text-decoration-none">Platform Overview</a></li>
            <li class="mb-2"><a href="/platform/#products" class="small text-secondary text-decoration-none">Compare Products</a></li>
            <li class="mb-2"><a href="/platform/device-ecosystem/" class="small text-secondary text-decoration-none">Device Ecosystem</a></li>
            <li class="mb-2"><a href="/company/customer-stories/" class="small text-secondary text-decoration-none">Customer Success</a></li>
            <li><a href="/demo/" class="small text-secondary text-decoration-none">Request a Demo</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Mega: Solutions -->
    <div id="mega-solutions" class="mega-menu">
      <div class="d-flex gap-4 px-4 py-4" style="max-width:1280px;margin:auto">
        <div class="flex-grow-1">
          <div class="row g-4">
            <div class="col-6 col-md-3"><a href="/solutions/fleet-management/" class="mega-product-card d-block"><img src="/images/solution-fleet-management.webp" alt="Fleet Management"><p class="fw-semibold small text-dark mt-2 card-name">Fleet Management</p><p class="text-muted" style="font-size:.7rem">Complete fleet operations.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="/solutions/fleet-tracking/" class="mega-product-card d-block"><img src="/images/solution-fleet-tracking.webp" alt="Fleet Tracking"><p class="fw-semibold small text-dark mt-2 card-name">Fleet Tracking</p><p class="text-muted" style="font-size:.7rem">Real-time fleet visibility.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="/solutions/driver-management/" class="mega-product-card d-block"><img src="/images/solution-driver-management.webp" alt="Driver Management"><p class="fw-semibold small text-dark mt-2 card-name">Driver Management</p><p class="text-muted" style="font-size:.7rem">Driver safety &amp; performance.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="/solutions/asset-management/" class="mega-product-card d-block"><img src="/images/solution-asset-management.webp" alt="Asset Management"><p class="fw-semibold small text-dark mt-2 card-name">Asset Management</p><p class="text-muted" style="font-size:.7rem">Fleet &amp; operational assets.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="/solutions/maintenance-management/" class="mega-product-card d-block"><img src="/images/solution-maintenance-management.webp" alt="Maintenance Management"><p class="fw-semibold small text-dark mt-2 card-name">Maintenance Management</p><p class="text-muted" style="font-size:.7rem">Fleet &amp; asset maintenance.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="/solutions/dispatch-management/" class="mega-product-card d-block"><img src="/images/solution-dispatch-management.webp" alt="Dispatch Management"><p class="fw-semibold small text-dark mt-2 card-name">Dispatch Management</p><p class="text-muted" style="font-size:.7rem">Intelligent workforce dispatch.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="/solutions/inventory-management/" class="mega-product-card d-block"><img src="/images/solution-inventory-management.webp" alt="Inventory Management"><p class="fw-semibold small text-dark mt-2 card-name">Inventory Management</p><p class="text-muted" style="font-size:.7rem">Field inventory &amp; assets.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="/solutions/fleet-security/" class="mega-product-card d-block"><img src="/images/solution-fleet-security.webp" alt="Fleet Security"><p class="fw-semibold small text-dark mt-2 card-name">Fleet Security</p><p class="text-muted" style="font-size:.7rem">Security operations.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
          </div>
        </div>
        <div class="border-start ps-4 flex-shrink-0" style="width:192px">
          <p class="text-uppercase fw-semibold text-muted mb-3" style="font-size:.68rem;letter-spacing:.1em">Advanced Capabilities</p>
          <ul class="list-unstyled mb-0">
            <li class="mb-2"><a href="/solutions/video-telematics/" class="small text-secondary text-decoration-none">Video Telematics</a></li>
            <li class="mb-2"><a href="/solutions/fuel-management/" class="small text-secondary text-decoration-none">Fuel Management</a></li>
            <li class="mb-2"><a href="/solutions/route-optimization/" class="small text-secondary text-decoration-none">Route Optimization</a></li>
            <li class="mb-2"><a href="/solutions/compliance/" class="small text-secondary text-decoration-none">Compliance</a></li>
            <li class="mb-2"><a href="/solutions/emergency-response/" class="small text-secondary text-decoration-none">Emergency Response</a></li>
            <li class="mb-2"><a href="/solutions/reports-analytics/" class="small text-secondary text-decoration-none">Reports &amp; Analytics</a></li>
            <li class="mb-2"><a href="/solutions/alerts-notifications/" class="small text-secondary text-decoration-none">Alerts &amp; Notifications</a></li>
            <li><a href="/solutions/api-integrations/" class="small text-secondary text-decoration-none">API &amp; Integrations</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Mega: Industries -->
    <div id="mega-industries" class="mega-menu">
      <div class="px-4 py-4" style="max-width:1280px;margin:auto">
        <div class="row g-4">
          <div class="col-6 col-md-3"><a href="/industries/transportation/" class="mega-product-card d-block"><img src="/images/industry-transportation.webp" alt="Transportation"><p class="fw-semibold small text-dark mt-2 card-name">Transportation</p><p class="text-muted" style="font-size:.7rem">Tracking, telematics &amp; route optimization.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
          <div class="col-6 col-md-3"><a href="/industries/waste-management/" class="mega-product-card d-block"><img src="/images/industry-waste-management.webp" alt="Waste Management"><p class="fw-semibold small text-dark mt-2 card-name">Waste Management</p><p class="text-muted" style="font-size:.7rem">Route &amp; collection optimization.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
          <div class="col-6 col-md-3"><a href="/industries/food-services-fmcg/" class="mega-product-card d-block"><img src="/images/industry-food-services-fmcg.webp" alt="Food Services &amp; FMCG"><p class="fw-semibold small text-dark mt-2 card-name">Food Services &amp; FMCG</p><p class="text-muted" style="font-size:.7rem">Cold-chain &amp; sensor monitoring.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
          <div class="col-6 col-md-3"><a href="/industries/logistics-supply-chain/" class="mega-product-card d-block"><img src="/images/industry-logistics-supply-chain.webp" alt="Logistics &amp; Supply Chain"><p class="fw-semibold small text-dark mt-2 card-name">Logistics &amp; Supply Chain</p><p class="text-muted" style="font-size:.7rem">Dispatch, tracking &amp; delivery.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
        </div>
        <div class="text-center mt-3">
          <a href="/industries/" class="small fw-semibold text-decoration-none" style="color:#171a20">View All Industries &rarr;</a>
        </div>
      </div>
    </div>

    <!-- Mega: Discover -->
    <div id="mega-discover" class="mega-menu">
      <div class="px-4 py-4" style="max-width:1280px;margin:auto">
        <div class="row g-4 justify-content-center">
          <div class="col-6 col-md-3">
            <p class="text-uppercase fw-semibold text-muted mb-3" style="font-size:.68rem;letter-spacing:.1em">Resources</p>
            <ul class="list-unstyled mb-0">
              <li class="mb-2"><a href="/company/knowledge-center/" class="small text-secondary text-decoration-none">Knowledge Center</a></li>
              <li class="mb-2"><a href="/company/customer-stories/" class="small text-secondary text-decoration-none">Customer Stories</a></li>
              <!-- <li><a href="/events/" class="small text-secondary text-decoration-none">Events</a></li> -->
            </ul>
          </div>
          <div class="col-6 col-md-3">
            <p class="text-uppercase fw-semibold text-muted mb-3" style="font-size:.68rem;letter-spacing:.1em">Company</p>
            <ul class="list-unstyled mb-0">
              <li class="mb-2"><a href="/company/about/" class="small text-secondary text-decoration-none">About Anstel</a></li>
              <li class="mb-2"><a href="/company/locations/" class="small text-secondary text-decoration-none">Locations</a></li>
              <li class="mb-2"><a href="/regions/" class="small text-secondary text-decoration-none">Regions</a></li>
              <li><a href="/company/contact/" class="small text-secondary text-decoration-none">Contact Us</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu (Tesla-style full-screen slide panel) -->
    <div id="mobile-menu" class="mob-panel d-lg-none">
      <div class="mob-panel-topbar">
        <button class="mob-close-btn" data-mob-close aria-label="Close menu"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>
      </div>
      <div class="mob-view-stack">
        <div class="mob-view mob-view-main active">
          <ul class="list-unstyled mb-0">
            <li><button class="mob-row" data-mob-open="autonautics">Autonautics <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/></svg></button></li>
            <li><button class="mob-row" data-mob-open="solutions">Solutions <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/></svg></button></li>
            <li><button class="mob-row" data-mob-open="industries">Industries <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/></svg></button></li>
            <li><button class="mob-row" data-mob-open="discover">Discover <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/></svg></button></li>
          </ul>
          <div class="mob-utility">
            <a class="mob-util-btn" href="/company/contact/" aria-label="Contact Anstel for help">Help</a>
            <a class="mob-util-btn" href="/regions/" aria-label="View Autonautics operating regions">Regions <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/></svg></a>
          </div>
        </div>

        <div class="mob-view mob-view-sub" data-mob-view="autonautics">
          <div class="mob-subheader">
            <button class="mob-back-btn" data-mob-back aria-label="Back"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6"/></svg></button>
            <span class="mob-subtitle">Autonautics</span>
            <button class="mob-close-btn" data-mob-close aria-label="Close menu"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>
          </div>
          <div class="mob-sub-content">
            <div class="row g-3">
              <div class="col-6"><a href="/platform/connected-fleet/" class="mob-product-card"><img src="/images/connected fleet.webp" alt=""><p class="mob-product-name">Connected Fleet</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/platform/last-mile/" class="mob-product-card"><img src="/images/Lastmile.webp" alt=""><p class="mob-product-name">Last Mile</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/platform/security-monitor/" class="mob-product-card"><img src="/images/Security.webp" alt=""><p class="mob-product-name">Security Monitor</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/platform/merchant/" class="mob-product-card"><img src="/images/Merchant.webp" alt=""><p class="mob-product-name">Merchant</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/platform/iot/" class="mob-product-card"><img src="/images/IoTLogo.webp" alt=""><p class="mob-product-name">IoT</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/platform/job-scheduling/" class="mob-product-card"><img src="/images/job-scheduling-logo.webp" alt="Job Scheduling"><p class="mob-product-name">Job Scheduling</p><span class="mob-product-link">Learn More</span></a></div>
            </div>
            <div class="mob-sub-links">
              <p class="mob-sub-heading">Explore</p>
              <a href="/platform/">Platform Overview</a>
              <a href="/platform/#products">Compare Products</a>
              <a href="/platform/device-ecosystem/">Device Ecosystem</a>
              <a href="/company/customer-stories/">Customer Success</a>
              <a href="/demo/">Request a Demo</a>
            </div>
          </div>
        </div>

        <div class="mob-view mob-view-sub" data-mob-view="solutions">
          <div class="mob-subheader">
            <button class="mob-back-btn" data-mob-back aria-label="Back"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6"/></svg></button>
            <span class="mob-subtitle">Solutions</span>
            <button class="mob-close-btn" data-mob-close aria-label="Close menu"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>
          </div>
          <div class="mob-sub-content">
            <div class="row g-3">
              <div class="col-6"><a href="/solutions/fleet-management/" class="mob-product-card"><img src="/images/solution-fleet-management.webp" alt="Fleet Management"><p class="mob-product-name">Fleet Management</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/solutions/fleet-tracking/" class="mob-product-card"><img src="/images/solution-fleet-tracking.webp" alt="Fleet Tracking"><p class="mob-product-name">Fleet Tracking</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/solutions/driver-management/" class="mob-product-card"><img src="/images/solution-driver-management.webp" alt="Driver Management"><p class="mob-product-name">Driver Management</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/solutions/asset-management/" class="mob-product-card"><img src="/images/solution-asset-management.webp" alt="Asset Management"><p class="mob-product-name">Asset Management</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/solutions/maintenance-management/" class="mob-product-card"><img src="/images/solution-maintenance-management.webp" alt="Maintenance Management"><p class="mob-product-name">Maintenance Management</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/solutions/dispatch-management/" class="mob-product-card"><img src="/images/solution-dispatch-management.webp" alt="Dispatch Management"><p class="mob-product-name">Dispatch Management</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/solutions/inventory-management/" class="mob-product-card"><img src="/images/solution-inventory-management.webp" alt="Inventory Management"><p class="mob-product-name">Inventory Management</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/solutions/fleet-security/" class="mob-product-card"><img src="/images/solution-fleet-security.webp" alt="Fleet Security"><p class="mob-product-name">Fleet Security</p><span class="mob-product-link">Learn More</span></a></div>
            </div>
            <div class="mob-sub-links">
              <p class="mob-sub-heading">Advanced Capabilities</p>
              <a href="/solutions/video-telematics/">Video Telematics</a>
              <a href="/solutions/fuel-management/">Fuel Management</a>
              <a href="/solutions/route-optimization/">Route Optimization</a>
              <a href="/solutions/compliance/">Compliance</a>
              <a href="/solutions/emergency-response/">Emergency Response</a>
              <a href="/solutions/reports-analytics/">Reports &amp; Analytics</a>
              <a href="/solutions/alerts-notifications/">Alerts &amp; Notifications</a>
              <a href="/solutions/api-integrations/">API &amp; Integrations</a>
            </div>
          </div>
        </div>

        <div class="mob-view mob-view-sub" data-mob-view="industries">
          <div class="mob-subheader">
            <button class="mob-back-btn" data-mob-back aria-label="Back"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6"/></svg></button>
            <span class="mob-subtitle">Industries</span>
            <button class="mob-close-btn" data-mob-close aria-label="Close menu"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>
          </div>
          <div class="mob-sub-content">
            <div class="row g-3">
              <div class="col-6"><a href="/industries/transportation/" class="mob-product-card"><img src="/images/industry-transportation.webp" alt="Transportation"><p class="mob-product-name">Transportation</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/industries/waste-management/" class="mob-product-card"><img src="/images/industry-waste-management.webp" alt="Waste Management"><p class="mob-product-name">Waste Management</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/industries/food-services-fmcg/" class="mob-product-card"><img src="/images/industry-food-services-fmcg.webp" alt="Food Services &amp; FMCG"><p class="mob-product-name">Food Services &amp; FMCG</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="/industries/logistics-supply-chain/" class="mob-product-card"><img src="/images/industry-logistics-supply-chain.webp" alt="Logistics &amp; Supply Chain"><p class="mob-product-name">Logistics &amp; Supply Chain</p><span class="mob-product-link">Learn More</span></a></div>
            </div>
            <div class="mob-sub-links">
              <a href="/industries/">View All Industries</a>
            </div>
          </div>
        </div>

        <div class="mob-view mob-view-sub" data-mob-view="discover">
          <div class="mob-subheader">
            <button class="mob-back-btn" data-mob-back aria-label="Back"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6"/></svg></button>
            <span class="mob-subtitle">Discover</span>
            <button class="mob-close-btn" data-mob-close aria-label="Close menu"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>
          </div>
          <div class="mob-sub-content">
            <div class="mob-sub-links" style="margin-top:0;border-top:0;padding-top:0">
              <p class="mob-sub-heading">Resources</p>
              <a href="/company/knowledge-center/">Knowledge Center</a>
              <a href="/company/customer-stories/">Customer Stories</a>
              <!-- <a href="/events/">Events</a> -->
            </div>
            <div class="mob-sub-links">
              <p class="mob-sub-heading">Company</p>
              <a href="/company/about/">About Anstel</a>
              <a href="/company/locations/">Locations</a>
              <a href="/regions/">Regions</a>
              <a href="/company/contact/">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  /* ── Overlay div ── */
  var overlay = document.createElement('div');
  overlay.id = 'mega-overlay';

  /* ── Schedule bar ── */
  var bar = document.createElement('div');
  bar.className = 'schedule-bar';
  bar.innerHTML = `
    <div class="flex-fill d-flex align-items-center gap-3 px-4 px-md-5 border-end">
      <svg width="20" height="20" fill="none" stroke="#6b7280" stroke-width="1.8" viewBox="0 0 24 24" class="flex-shrink-0">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <span class="small fw-medium text-secondary d-none d-sm-inline">Ask a Question</span>
      <div class="flex-fill d-flex align-items-center rounded-pill px-3 py-1" style="background:#f3f4f6">
        <input type="text" placeholder="&ldquo;What&rsquo;s Pet Mode?&rdquo;" class="flex-fill border-0 bg-transparent small text-secondary" style="outline:none">
      </div>
    </div>
    <button class="d-flex align-items-center gap-2 px-4 border-0 bg-white" style="cursor:pointer">
      <svg width="20" height="20" fill="none" stroke="#4b5563" stroke-width="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 9V2M5.27 16.5l6.07-4.08M18.73 16.5l-6.07-4.08" />
      </svg>
      <span class="small fw-medium text-dark">Schedule a Drive Today</span>
    </button>
  `;

  document.body.insertBefore(header, document.body.firstChild);
  document.body.insertBefore(overlay, header.nextSibling);
  // document.body.appendChild(bar); // schedule-bar disabled sitewide
});
