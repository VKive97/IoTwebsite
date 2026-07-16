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
          </div>
        </div>
        <div class="border-start ps-4 flex-shrink-0" style="width:176px">
          <p class="text-uppercase fw-semibold text-muted mb-3" style="font-size:.68rem;letter-spacing:.1em">Features</p>
          <ul class="list-unstyled mb-0">
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Reports &amp; Analytics</a></li>
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Fleet Intelligence</a></li>
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Predictive Maintenance</a></li>
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Compliance &amp; AIS-140</a></li>
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Emergency Response</a></li>
            <li><a href="#" class="small text-secondary text-decoration-none">Route Optimization</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Mega: Solutions -->
    <div id="mega-solutions" class="mega-menu">
      <div class="d-flex gap-4 px-4 py-4" style="max-width:1280px;margin:auto">
        <div class="flex-grow-1">
          <div class="row g-4">
            <div class="col-6 col-md-3"><a href="connected-fleet.html" class="mega-product-card d-block"><img src="images/connectedECO.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Fleet Management</p><p class="text-muted" style="font-size:.7rem">Full fleet operations platform</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="connected-fleet.html" class="mega-product-card d-block"><img src="images/connected fleet.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Fleet Tracking</p><p class="text-muted" style="font-size:.7rem">Live GPS vehicle tracking</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="connected-fleet.html" class="mega-product-card d-block"><img src="images/connectedECO.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Driver Management</p><p class="text-muted" style="font-size:.7rem">Driver behaviour &amp; scorecards</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="connected-fleet.html" class="mega-product-card d-block"><img src="images/connected fleet.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Asset Tracking</p><p class="text-muted" style="font-size:.7rem">Track any connected asset</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="last-mile.html" class="mega-product-card d-block"><img src="images/LastmileECO.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Last Mile Delivery</p><p class="text-muted" style="font-size:.7rem">Dispatch &amp; delivery execution</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="security-monitor.html" class="mega-product-card d-block"><img src="images/SecurityECO.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Fleet Security</p><p class="text-muted" style="font-size:.7rem">Vehicle &amp; depot security</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="iot.html" class="mega-product-card d-block"><img src="images/IoTLogo.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">IoT Monitoring</p><p class="text-muted" style="font-size:.7rem">Connected devices &amp; sensors</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
            <div class="col-6 col-md-3"><a href="connected-fleet.html" class="mega-product-card d-block"><img src="images/connectedECO.png" alt=""><p class="fw-semibold small text-dark mt-2 card-name">Fuel Management</p><p class="text-muted" style="font-size:.7rem">Monitor &amp; reduce fuel costs</p><span class="small text-secondary">Learn More &rarr;</span></a></div>
          </div>
        </div>
        <div class="border-start ps-4 flex-shrink-0" style="width:192px">
          <p class="text-uppercase fw-semibold text-muted mb-3" style="font-size:.68rem;letter-spacing:.1em">Specialized Solutions</p>
          <ul class="list-unstyled mb-0">
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Dispatch Management</a></li>
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Video Telematics</a></li>
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Cold Chain Monitoring</a></li>
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Industrial Asset Monitoring</a></li>
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Generator Monitoring</a></li>
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Reports &amp; Analytics</a></li>
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Fleet Intelligence</a></li>
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Predictive Maintenance</a></li>
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Route Optimization</a></li>
            <li class="mb-2"><a href="#" class="small text-secondary text-decoration-none">Compliance &amp; AIS-140</a></li>
            <li><a href="#" class="small text-secondary text-decoration-none">Emergency Response</a></li>
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

    <!-- Mobile menu -->
    <div id="mobile-menu" class="bg-white border-top d-lg-none" style="display:none!important;max-height:80vh;overflow-y:auto">
      <ul class="list-unstyled mb-0 border-bottom">
        <li class="border-bottom">
          <button class="mob-acc-btn w-100 d-flex justify-content-between align-items-center px-4 py-3 small fw-medium text-dark bg-white border-0">Autonautics <span class="acc-arrow">&#9662;</span></button>
          <div class="mob-acc-body px-4 pb-3 bg-light" style="display:none">
            <div class="row g-2">
              <div class="col-6"><a href="connected-fleet.html" class="small text-dark text-decoration-none fw-semibold">Connected Fleet</a></div>
              <div class="col-6"><a href="last-mile.html" class="small text-dark text-decoration-none fw-semibold">Last Mile</a></div>
              <div class="col-6"><a href="security-monitor.html" class="small text-dark text-decoration-none fw-semibold">Security Monitor</a></div>
              <div class="col-6"><a href="merchant.html" class="small text-dark text-decoration-none fw-semibold">Merchant</a></div>
              <div class="col-6"><a href="iot.html" class="small text-dark text-decoration-none fw-semibold">IoT</a></div>
            </div>
          </div>
        </li>
        <li class="border-bottom">
          <button class="mob-acc-btn w-100 d-flex justify-content-between align-items-center px-4 py-3 small fw-medium text-dark bg-white border-0">Solutions <span class="acc-arrow">&#9662;</span></button>
          <div class="mob-acc-body px-4 pb-3 bg-light" style="display:none">
            <div class="row g-2">
              <div class="col-6"><a href="connected-fleet.html" class="small text-dark text-decoration-none">Fleet Management</a></div>
              <div class="col-6"><a href="connected-fleet.html" class="small text-dark text-decoration-none">Fleet Tracking</a></div>
              <div class="col-6"><a href="connected-fleet.html" class="small text-dark text-decoration-none">Driver Management</a></div>
              <div class="col-6"><a href="last-mile.html" class="small text-dark text-decoration-none">Last Mile Delivery</a></div>
              <div class="col-6"><a href="security-monitor.html" class="small text-dark text-decoration-none">Fleet Security</a></div>
              <div class="col-6"><a href="iot.html" class="small text-dark text-decoration-none">IoT Monitoring</a></div>
            </div>
          </div>
        </li>
        <li class="border-bottom"><a href="#" class="d-block px-4 py-3 small fw-medium text-dark text-decoration-none">Charging</a></li>
        <li class="border-bottom"><a href="#" class="d-block px-4 py-3 small fw-medium text-dark text-decoration-none">Discover</a></li>
        <li><a href="#" class="d-block px-4 py-3 small fw-medium text-dark text-decoration-none">Shop</a></li>
      </ul>
      <div class="d-flex gap-4 px-4 py-3 border-top bg-light">
        <button class="small text-secondary bg-white border-0 p-0">Help</button>
        <button class="small text-secondary bg-white border-0 p-0">Region</button>
        <button class="small text-secondary bg-white border-0 p-0">Account</button>
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
