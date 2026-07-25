/* Injects shared navbar + mega-overlay + schedule bar + loc-modal into product pages */
document.addEventListener('DOMContentLoaded', function () {

  /* ── Navbar HTML ── */
  var header = document.createElement('header');
  header.id = 'site-nav';
  header.className = 'position-fixed top-0 start-0 end-0 bg-white';
  header.style.cssText = 'z-index:1050';
  header.innerHTML = `
    <div class="d-flex align-items-center px-4 px-md-5" style="height:56px;max-width:1536px;margin:auto">
      <a href="index.html" class="flex-shrink-0"><img src="images/anstel.svg" height="40" alt="Anstel"></a>
      <nav class="d-none d-lg-flex align-items-center gap-1 mx-auto">
        <button class="nav-btn" data-mega="autonautics">Autonautics</button>
        <button class="nav-btn" data-mega="solutions">Solutions</button>
        <button class="nav-btn">Charging</button>
        <button class="nav-btn" data-mega="discover">Discover</button>
        <button class="nav-btn">Shop</button>
      </nav>
      <div class="d-none d-lg-flex align-items-center gap-1">
        <button class="icon-btn" title="Help"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg></button>
        <button class="icon-btn" title="Region"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></button>
        <button class="icon-btn" title="Account"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg></button>
      </div>
      <button class="icon-btn d-lg-none ms-auto" id="mobile-toggle" aria-label="Menu">
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
            <div class="col-6 col-md-4 col-lg-3"><a href="connected-fleet.html" class="mega-product-card d-block"><img src="images/connected fleet.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Connected Fleet</p><p class="text-muted" style="font-size:.7rem">Fleet tracking &amp; operations</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-4 col-lg-3"><a href="last-mile.html" class="mega-product-card d-block"><img src="images/Lastmile.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Last Mile</p><p class="text-muted" style="font-size:.7rem">Delivery execution platform</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-4 col-lg-3"><a href="security-monitor.html" class="mega-product-card d-block"><img src="images/Security.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Security Monitor</p><p class="text-muted" style="font-size:.7rem">Vehicle &amp; driver security</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-4 col-lg-3"><a href="merchant.html" class="mega-product-card d-block"><img src="images/Merchant.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Merchant</p><p class="text-muted" style="font-size:.7rem">Fleet services marketplace</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-4 col-lg-3"><a href="iot.html" class="mega-product-card d-block"><img src="images/IoTLogo.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">IoT</p><p class="text-muted" style="font-size:.7rem">Connected devices &amp; sensors</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-4 col-lg-3"><a href="job-scheduling.html" class="mega-product-card d-block"><div class="d-flex align-items-center justify-content-center mx-auto rounded-4" style="height:80px;width:80px;background:rgba(13,110,253,.08)"><svg width="34" height="34" fill="none" stroke="#0d6efd" stroke-width="1.6" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path stroke-linecap="round" d="M16 2v4M8 2v4M3 9h18"/><path stroke-linecap="round" stroke-linejoin="round" d="M8.5 14l2 2 4-4"/></svg></div><p class="fw-semibold small text-dark mt-2 card-name">Job Scheduling</p><p class="text-muted" style="font-size:.7rem">Plan, dispatch &amp; track jobs</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
          </div>
        </div>
        <div class="border-start ps-4 flex-shrink-0" style="width:176px">
          <p class="text-uppercase fw-semibold text-muted mb-3" style="font-size:.68rem;letter-spacing:.1em">Explore</p>
          <ul class="list-unstyled mb-0">
            <li class="mb-2"><a href="autonautics.html" class="small text-secondary text-decoration-none">Platform Overview</a></li>
            <li class="mb-2"><a href="autonautics.html#products" class="small text-secondary text-decoration-none">Compare Products</a></li>
            <li class="mb-2"><a href="device-ecosystem.html" class="small text-secondary text-decoration-none">Device Ecosystem</a></li>
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Customer Success</a></li>
            <li><a href="request-demo.html" class="small text-secondary text-decoration-none">Request a Demo</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Mega: Solutions -->
    <div id="mega-solutions" class="mega-menu">
      <div class="d-flex gap-4 px-4 py-4" style="max-width:1280px;margin:auto">
        <div class="flex-grow-1">
          <div class="row g-4">
            <div class="col-6 col-md-3"><a href="fleet-management.html" class="mega-product-card d-block"><img src="images/connectedECO.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Fleet Management</p><p class="text-muted" style="font-size:.7rem">Complete fleet operations.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="fleet-tracking.html" class="mega-product-card d-block"><img src="images/connected fleet.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Fleet Tracking</p><p class="text-muted" style="font-size:.7rem">Real-time fleet visibility.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="driver-management.html" class="mega-product-card d-block"><img src="images/connectedECO.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Driver Management</p><p class="text-muted" style="font-size:.7rem">Driver safety &amp; performance.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="asset-management.html" class="mega-product-card d-block"><img src="images/connected fleet.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Asset Management</p><p class="text-muted" style="font-size:.7rem">Fleet &amp; operational assets.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="maintenance-management.html" class="mega-product-card d-block"><img src="images/connectedfleet-replay.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Maintenance Management</p><p class="text-muted" style="font-size:.7rem">Fleet &amp; asset maintenance.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="dispatch-management.html" class="mega-product-card d-block"><div class="d-flex align-items-center justify-content-center mx-auto rounded-4" style="height:80px;width:80px;background:rgba(13,110,253,.08)"><svg width="34" height="34" fill="none" stroke="#0d6efd" stroke-width="1.6" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l18-9-9 18-2-7-7-2z"/></svg></div><p class="fw-semibold small text-dark mt-2 card-name">Dispatch Management</p><p class="text-muted" style="font-size:.7rem">Intelligent workforce dispatch.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="inventory-management.html" class="mega-product-card d-block"><img src="images/LastmileECO.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Inventory Management</p><p class="text-muted" style="font-size:.7rem">Field inventory &amp; assets.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="fleet-security.html" class="mega-product-card d-block"><img src="images/SecurityECO.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Fleet Security</p><p class="text-muted" style="font-size:.7rem">Security operations.</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
          </div>
        </div>
        <div class="border-start ps-4 flex-shrink-0" style="width:192px">
          <p class="text-uppercase fw-semibold text-muted mb-3" style="font-size:.68rem;letter-spacing:.1em">Advanced Capabilities</p>
          <ul class="list-unstyled mb-0">
            <li class="mb-2"><a href="video-telematics.html" class="small text-secondary text-decoration-none">Video Telematics</a></li>
            <li class="mb-2"><a href="fuel-management.html" class="small text-secondary text-decoration-none">Fuel Management</a></li>
            <li class="mb-2"><a href="route-optimization.html" class="small text-secondary text-decoration-none">Route Optimization</a></li>
            <li class="mb-2"><a href="compliance.html" class="small text-secondary text-decoration-none">Compliance</a></li>
            <li class="mb-2"><a href="emergency-response.html" class="small text-secondary text-decoration-none">Emergency Response</a></li>
            <li class="mb-2"><a href="reports-analytics.html" class="small text-secondary text-decoration-none">Reports &amp; Analytics</a></li>
            <li class="mb-2"><a href="alerts-notifications.html" class="small text-secondary text-decoration-none">Alerts &amp; Notifications</a></li>
            <li><a href="api-integrations.html" class="small text-secondary text-decoration-none">API &amp; Integrations</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Mega: Discover -->
    <div id="mega-discover" class="mega-menu">
      <div class="px-4 py-4" style="max-width:1280px;margin:auto">
        <div class="row g-4">
          <div class="col-6 col-md-3">
            <p class="text-uppercase fw-semibold text-muted mb-3" style="font-size:.68rem;letter-spacing:.1em">Resources</p>
            <ul class="list-unstyled mb-0">
              <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Demo Drive</a></li>
              <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Insurance</a></li>
              <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Current Offers</a></li>
              <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Customer Stories</a></li>
              <li><a href="#" class="small text-secondary text-decoration-none">Safety</a></li>
            </ul>
          </div>
          <div class="col-6 col-md-3">
            <p class="text-uppercase fw-semibold text-muted mb-3" style="font-size:.68rem;letter-spacing:.1em">Location Services</p>
            <ul class="list-unstyled mb-0">
              <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Find Us</a></li>
              <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Find a Collision Center</a></li>
              <li><a href="#" class="small text-secondary text-decoration-none">Find a Certified Installer</a></li>
            </ul>
          </div>
          <div class="col-6 col-md-3">
            <p class="text-uppercase fw-semibold text-muted mb-3" style="font-size:.68rem;letter-spacing:.1em">Company</p>
            <ul class="list-unstyled mb-0">
              <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">About</a></li>
              <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Careers</a></li>
              <li><a href="#" class="small text-secondary text-decoration-none">Investor Relations</a></li>
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
            <li><a href="#" class="mob-row-link">Charging</a></li>
            <li><button class="mob-row" data-mob-open="discover">Discover <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/></svg></button></li>
            <li><a href="#" class="mob-row-link">Shop</a></li>
          </ul>
          <div class="mob-utility">
            <button class="mob-util-btn">Help</button>
            <button class="mob-util-btn">Region <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/></svg></button>
            <button class="mob-util-btn">Account</button>
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
              <div class="col-6"><a href="connected-fleet.html" class="mob-product-card"><img src="images/connected fleet.png" alt=""><p class="mob-product-name">Connected Fleet</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="last-mile.html" class="mob-product-card"><img src="images/Lastmile.png" alt=""><p class="mob-product-name">Last Mile</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="security-monitor.html" class="mob-product-card"><img src="images/Security.png" alt=""><p class="mob-product-name">Security Monitor</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="merchant.html" class="mob-product-card"><img src="images/Merchant.png" alt=""><p class="mob-product-name">Merchant</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="iot.html" class="mob-product-card"><img src="images/IoTLogo.png" alt=""><p class="mob-product-name">IoT</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="job-scheduling.html" class="mob-product-card"><div class="d-flex align-items-center justify-content-center mx-auto rounded-4" style="height:76px;width:76px;background:rgba(13,110,253,.08)"><svg width="30" height="30" fill="none" stroke="#0d6efd" stroke-width="1.6" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path stroke-linecap="round" d="M16 2v4M8 2v4M3 9h18"/><path stroke-linecap="round" stroke-linejoin="round" d="M8.5 14l2 2 4-4"/></svg></div><p class="mob-product-name">Job Scheduling</p><span class="mob-product-link">Learn More</span></a></div>
            </div>
            <div class="mob-sub-links">
              <p class="mob-sub-heading">Explore</p>
              <a href="autonautics.html">Platform Overview</a>
              <a href="autonautics.html#products">Compare Products</a>
              <a href="device-ecosystem.html">Device Ecosystem</a>
              <a href="#">Customer Success</a>
              <a href="request-demo.html">Request a Demo</a>
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
              <div class="col-6"><a href="fleet-management.html" class="mob-product-card"><img src="images/connectedECO.png" alt=""><p class="mob-product-name">Fleet Management</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="fleet-tracking.html" class="mob-product-card"><img src="images/connected fleet.png" alt=""><p class="mob-product-name">Fleet Tracking</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="driver-management.html" class="mob-product-card"><img src="images/connectedECO.png" alt=""><p class="mob-product-name">Driver Management</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="asset-management.html" class="mob-product-card"><img src="images/connected fleet.png" alt=""><p class="mob-product-name">Asset Management</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="maintenance-management.html" class="mob-product-card"><img src="images/connectedfleet-replay.png" alt=""><p class="mob-product-name">Maintenance Management</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="dispatch-management.html" class="mob-product-card"><div class="d-flex align-items-center justify-content-center mx-auto rounded-4" style="height:76px;width:76px;background:rgba(13,110,253,.08)"><svg width="30" height="30" fill="none" stroke="#0d6efd" stroke-width="1.6" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l18-9-9 18-2-7-7-2z"/></svg></div><p class="mob-product-name">Dispatch Management</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="inventory-management.html" class="mob-product-card"><img src="images/LastmileECO.png" alt=""><p class="mob-product-name">Inventory Management</p><span class="mob-product-link">Learn More</span></a></div>
              <div class="col-6"><a href="fleet-security.html" class="mob-product-card"><img src="images/SecurityECO.png" alt=""><p class="mob-product-name">Fleet Security</p><span class="mob-product-link">Learn More</span></a></div>
            </div>
            <div class="mob-sub-links">
              <p class="mob-sub-heading">Advanced Capabilities</p>
              <a href="video-telematics.html">Video Telematics</a>
              <a href="fuel-management.html">Fuel Management</a>
              <a href="route-optimization.html">Route Optimization</a>
              <a href="compliance.html">Compliance</a>
              <a href="emergency-response.html">Emergency Response</a>
              <a href="reports-analytics.html">Reports &amp; Analytics</a>
              <a href="alerts-notifications.html">Alerts &amp; Notifications</a>
              <a href="api-integrations.html">API &amp; Integrations</a>
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
              <a href="#">Demo Drive</a>
              <a href="#">Insurance</a>
              <a href="#">Current Offers</a>
              <a href="#">Customer Stories</a>
              <a href="#">Safety</a>
            </div>
            <div class="mob-sub-links">
              <p class="mob-sub-heading">Location Services</p>
              <a href="#">Find Us</a>
              <a href="#">Find a Collision Center</a>
              <a href="#">Find a Certified Installer</a>
            </div>
            <div class="mob-sub-links">
              <p class="mob-sub-heading">Company</p>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Investor Relations</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  /* ── Overlay div ── */
  var overlay = document.createElement('div');
  overlay.id = 'mega-overlay';

  /* ── Location Modal ── */
  var locModal = document.createElement('div');
  locModal.id = 'loc-modal';
  locModal.className = 'position-fixed bg-white rounded-3 shadow border';
  locModal.style.cssText = 'top:72px;right:16px;z-index:1060;width:320px;';
  locModal.innerHTML = `
    <div class="d-flex justify-content-between align-items-start px-4 pt-3 pb-2">
      <div>
        <p class="fw-semibold small mb-1">Confirm Your Location</p>
        <p class="text-muted" style="font-size:.75rem">Select region to see location-specific content</p>
      </div>
      <button class="loc-dismiss icon-btn ms-2 p-0 flex-shrink-0 border-0 bg-white text-secondary" style="margin-top:2px">&times;</button>
    </div>
    <div class="d-flex gap-2 px-4 pb-4">
      <button class="loc-btn flex-fill btn btn-dark btn-sm py-2">United States</button>
      <button class="loc-btn flex-fill btn btn-outline-secondary btn-sm py-2">India</button>
    </div>
  `;

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
  document.body.insertBefore(locModal, overlay.nextSibling);
  document.body.appendChild(bar);
});
