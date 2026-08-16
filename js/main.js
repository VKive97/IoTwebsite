$(function () {

  /* ── Navbar scroll shadow ── */
  $(window).on('scroll', function () {
    $('#site-nav').toggleClass('shadow-sm', window.scrollY > 30);
  });

  /* ── Mega menu (desktop hover) + page blur overlay ── */
  var closeTimer;
  function hideMenu() {
    $('.mega-menu').fadeOut(150);
    $('#mega-overlay').fadeOut(200);
  }
  $('[data-mega]').on('mouseenter', function () {
    clearTimeout(closeTimer);
    var id = $(this).data('mega');
    $('.mega-menu').hide();
    $('#mega-' + id).stop(true).fadeIn(150);
    $('#mega-overlay').stop(true).fadeIn(200);
  }).on('mouseleave', function () {
    closeTimer = setTimeout(hideMenu, 200);
  });
  $('.mega-menu').on('mouseenter', function () {
    clearTimeout(closeTimer);
  }).on('mouseleave', function () {
    closeTimer = setTimeout(hideMenu, 200);
  });

  /* ── Mobile menu (Tesla-style full-screen slide panel) ── */
  function closeMobPanel() {
    $('#mobile-menu').removeClass('open');
    setTimeout(function () {
      $('.mob-view-sub').removeClass('active');
      $('.mob-view-main').removeClass('pushed');
    }, 320);
  }
  $('#mobile-toggle').on('click', function () {
    $('#mobile-menu').addClass('open');
  });
  $('[data-mob-close]').on('click', closeMobPanel);
  $('[data-mob-open]').on('click', function () {
    var target = $(this).data('mob-open');
    $('.mob-view-main').addClass('pushed');
    $('.mob-view-sub[data-mob-view="' + target + '"]').addClass('active');
  });
  $('[data-mob-back]').on('click', function () {
    $('.mob-view-sub').removeClass('active');
    $('.mob-view-main').removeClass('pushed');
  });

  /* ── Scroll carousel factory ── */
  /* Iconify icons mapped to the visible card label, never to incidental words in
     the description. This keeps every symbol semantically tied to its card. */
  var carouselCardIconMap = {};

  function mapCarouselIcon(icon, labels) {
    labels.forEach(function (label) { carouselCardIconMap[label.toLowerCase()] = icon; });
  }

  mapCarouselIcon('material-symbols:directions-car-outline', ['Fleet Management', 'Connected Fleet', 'See Every Vehicle.']);
  mapCarouselIcon('material-symbols:location-on-outline', ['Fleet Tracking', 'Location-Based Dispatch', 'Live Delivery Tracking', 'Relevant Where You Operate.', 'Zone Management']);
  mapCarouselIcon('material-symbols:inventory-2-outline', ['Asset Tracking', 'Vehicle Capacity Matching', 'Depot Management']);
  mapCarouselIcon('material-symbols:person-pin-circle-outline', ['Driver Management', 'Smart Driver Assignment', "Coach Before It's a Problem.", 'Workforce Management', 'Assign']);
  mapCarouselIcon('material-symbols:local-gas-station-outline', ['Fuel Management', 'Find the Waste.']);
  mapCarouselIcon('material-symbols:local-shipping-outline', ['Last Mile Delivery', 'Delivery Assignment', 'Delivery Completion', 'Keep Operations Moving.']);
  mapCarouselIcon('material-symbols:route-outline', ['Dispatch Management', 'Route Navigation', 'Scheduling & Dispatch', 'Operational Coordination', 'Dispatch', 'Execute', 'Services That Fit Your Journey.']);
  mapCarouselIcon('material-symbols:shield-outline', ['Fleet Security', 'Security Monitor', 'Stay in Command.', 'Fleet Risk Visibility', 'Insurance That Reflects Your Fleet.']);
  mapCarouselIcon('material-symbols:warning-outline', ['SOS Emergency Response', 'Take Action When It Matters.', 'Real-Time Incident Alerts', 'Be There When Needed.']);
  mapCarouselIcon('material-symbols:description-outline', ['Incident Management', 'Every Incident. One Mission.']);
  mapCarouselIcon('material-symbols:no-crash-outline', ['Vehicle Immobilization']);
  mapCarouselIcon('material-symbols:schedule-outline', ['Incident Timeline']);
  mapCarouselIcon('material-symbols:groups-outline', ['Deploy the Right Team.', 'Operator Coordination', 'Better Together.']);
  mapCarouselIcon('material-symbols:description-outline', ['Incident Documentation', 'Security Reports', 'Complete Service Records']);
  mapCarouselIcon('material-symbols:dashboard-outline', ['Decisions Backed by Intelligence.', 'Incident Analytics', 'Response Performance', 'Security Event Trends', 'Operational Insights', 'Transform Data Into Intelligence.', 'Itemized Service Costs', 'Support Business Growth.']);
  mapCarouselIcon('material-symbols:visibility-outline', ['See Every Mission Unfold.', 'See Every Operation in Real Time.']);
  mapCarouselIcon('material-symbols:sensors', ['IoT Monitoring', 'IoT Platform', 'Manage Every Connected Device.']);
  mapCarouselIcon('material-symbols:videocam-outline', ['Video Telematics']);
  mapCarouselIcon('material-symbols:device-thermostat', ['Cold Chain Monitoring', 'Protect Critical Conditions.']);
  mapCarouselIcon('material-symbols:bolt-outline', ['Generator Monitoring']);
  mapCarouselIcon('material-symbols:account-tree-outline', ['How the Autonautics Platform Works', 'Become Part of the Ecosystem.', 'Connect Without Complexity.', 'Built to Connect. Ready to Scale.']);
  mapCarouselIcon('material-symbols:calendar-month-outline', ['Job Scheduling']);
  mapCarouselIcon('material-symbols:task-alt', ['Job Management', 'Create']);
  mapCarouselIcon('material-symbols:task-alt', ['Complete']);
  mapCarouselIcon('material-symbols:storefront-outline', ['Merchant', 'List Your Services.', 'Explore Trusted Options.', 'Reach the Right Customers.', 'Discover Trusted Solutions.']);
  mapCarouselIcon('material-symbols:handshake-outline', ['Engage Directly.', 'Support Every Stage of Ownership.']);
  mapCarouselIcon('material-symbols:recommend-outline', ['Get Matched Intelligently.', 'Recommendations That Make Sense.']);
  mapCarouselIcon('material-symbols:verified-outline', ['Built on Quality, Not Quantity.']);
  mapCarouselIcon('material-symbols:health-and-safety-outline', ['Deliver Smarter Coverage.']);
  mapCarouselIcon('material-symbols:groups-outline', ['Be There When Needed.']);
  mapCarouselIcon('material-symbols:factory-outline', ['Connect the Factory Floor.']);
  mapCarouselIcon('material-symbols:factory-outline', ['Power Smarter Infrastructure.']);
  mapCarouselIcon('material-symbols:groups-outline', ['Create More Connected Communities.']);
  mapCarouselIcon('material-symbols:agriculture-outline', ['Monitor Every Growing Opportunity.']);
  mapCarouselIcon('material-symbols:bolt-outline', ['React Faster. Automate Smarter.']);
  mapCarouselIcon('material-symbols:build-outline', ['Cut Unexpected Breakdowns.', 'Repair & Parts History']);
  mapCarouselIcon('material-symbols:automation-outline', ['Let the Rules Do the Work.']);
  mapCarouselIcon('material-symbols:photo-camera-outline', ['Proof of Delivery']);

  function fallbackCarouselIcon(label) {
    var rules = [
      [/fuel/i, 'material-symbols:local-gas-station-outline'], [/cold|temperature/i, 'material-symbols:device-thermostat'],
      [/video|camera/i, 'material-symbols:videocam-outline'], [/driver|workforce|person/i, 'material-symbols:person-outline'],
      [/security|risk|protect/i, 'material-symbols:shield-outline'], [/incident|emergency|alert/i, 'material-symbols:warning-outline'],
      [/maintenance|repair|service/i, 'material-symbols:build-outline'], [/delivery|shipping/i, 'material-symbols:local-shipping-outline'],
      [/route|dispatch/i, 'material-symbols:route-outline'], [/track|location/i, 'material-symbols:location-on-outline'],
      [/schedule|calendar|job/i, 'material-symbols:calendar-month-outline'], [/report|analytic|insight|performance/i, 'material-symbols:dashboard-outline'],
      [/device|sensor|iot/i, 'material-symbols:sensors'], [/merchant|customer/i, 'material-symbols:storefront-outline']
    ];
    for (var i = 0; i < rules.length; i++) if (rules[i][0].test(label)) return rules[i][1];
    return 'material-symbols:widgets-outline';
  }

  function ensureIconify() {
    if (window.customElements && customElements.get('iconify-icon')) return;
    if (document.querySelector('script[data-iconify-cards]')) return;
    var script = document.createElement('script');
    script.src = 'https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js';
    script.async = true;
    script.dataset.iconifyCards = '';
    document.head.appendChild(script);
  }

  function addCarouselCardIcon($card) {
    if ($card.is('[data-no-card-icon]') || $card.find('.carousel-card-icon').length) return;

    var $overlay = $card.find('.position-absolute.bottom-0').filter(function () {
      return $(this).find('h1,h2,h3,h4,h5,h6,p,button,a').length > 0;
    }).first();
    var $heading = $card.find('h1,h2,h3,h4,h5,h6').first();
    var $title = $heading.length ? $heading : $card.find('p.fw-semibold').first();
    var label = $title.text().replace(/\s+/g, ' ').trim();
    var icon = carouselCardIconMap[label.toLowerCase()] || fallbackCarouselIcon(label);
    var $description = $card.find('p').not('.text-uppercase').not($title).first();
    var $leadingMedia = $card.children().first();
    var hasLeadingMedia = $leadingMedia.find('img,video,picture').length > 0;
    var isLight = $card.find('.text-white').length > 0;
    var className = 'carousel-card-icon' + (isLight ? ' carousel-card-icon--light' : '');
    var markup = '<span class="' + className + '" aria-hidden="true">' +
      '<iconify-icon icon="' + icon + '"></iconify-icon></span>';

    $title.addClass('carousel-card-title');
    $description.addClass('carousel-card-description');

    if ($overlay.length) {
      $overlay.prepend(markup);
    } else if (hasLeadingMedia) {
      $leadingMedia.after(markup);
    } else {
      $card.prepend(markup);
    }
  }

  ensureIconify();
  $('.scroll-carousel [data-card]').each(function () {
    addCarouselCardIcon($(this));
  });

  function initCarousel($wrap) {
    var $track = $wrap.find('.scroll-track');
    var $prev  = $wrap.find('.sc-prev');
    var $next  = $wrap.find('.sc-next');
    var $dots  = $wrap.find('.dot-btn');
    var idx    = 0;

    // The scrollLeft that would center each card in the visible track — matches the
    // CSS scroll-snap-align:center used for touch/drag scrolling, so clicking an arrow
    // and swiping land on the exact same resting position.
    function cardCenters() {
      var trackLeft = $track[0].getBoundingClientRect().left - $track[0].scrollLeft;
      var clientWidth = $track[0].clientWidth;
      return $track.find('[data-card]').map(function () {
        var rect = this.getBoundingClientRect();
        var cardLeft = rect.left - trackLeft;
        return cardLeft - (clientWidth - rect.width) / 2;
      }).get();
    }
    function total() { return $track.find('[data-card]').length; }

    function targetFor(i) {
      var maxScroll = Math.max(0, $track[0].scrollWidth - $track[0].clientWidth);
      var target;
      if (i <= 0) {
        target = 0;
      } else if (i >= total() - 1) {
        target = maxScroll;
      } else {
        target = cardCenters()[i] || 0;
      }
      return Math.max(0, Math.min(target, maxScroll));
    }

    function go(i) {
      idx = Math.max(0, Math.min(i, total() - 1));
      var target;
      if (idx === 0) {
        // Nothing precedes card 0, so centering it would require scrolling into
        // negative space — rest flush at 0 instead, showing the same left gutter as
        // every other section (no peek, matching a real first slide).
        target = 0;
      } else if (idx === total() - 1) {
        // Symmetric case at the other end: rest at the track's true max scroll so the
        // trailing gutter/spacer shows in full, rather than the last card's theoretical
        // center position (which can overshoot what the browser can actually scroll to).
        target = $track[0].scrollWidth - $track[0].clientWidth;
      } else {
        var centers = cardCenters();
        target = centers[idx] || 0;
      }
      $track[0].scrollTo({ left: target, behavior: 'smooth' });
      $dots.removeClass('active').eq(idx).addClass('active');
      $prev.toggleClass('d-none', idx === 0);
      $next.toggleClass('d-none', idx >= total() - 1);
    }

    // Three visible cards make the AI carousel's first two center positions nearly
    // identical. Arrow navigation skips such tiny stops so every click visibly moves.
    function arrowIndex(direction) {
      if (!$wrap.hasClass('ai-event-carousel')) return idx + direction;

      var $firstCard = $track.find('[data-card]').first();
      var minimumMove = ($firstCard.outerWidth() || 0) * 0.35;
      var currentTarget = targetFor(idx);
      var last = total() - 1;
      var candidate = idx + direction;

      while (candidate >= 0 && candidate <= last) {
        var candidateTarget = targetFor(candidate);
        if (Math.abs(candidateTarget - currentTarget) >= minimumMove || candidate === 0 || candidate === last) {
          if (direction > 0 && candidate < last && targetFor(last) - candidateTarget < minimumMove) return last;
          if (direction < 0 && candidate > 0 && candidateTarget - targetFor(0) < minimumMove) return 0;
          return candidate;
        }
        candidate += direction;
      }
      return direction > 0 ? last : 0;
    }

    // Center-mode carousel: only one card is ever in focus, so every arrow click
    // steps exactly one card at a time — no multi-card paging.
    $prev.on('click', function () { go(arrowIndex(-1)); });
    $next.on('click', function () { go(arrowIndex(1)); });
    $dots.on('click', function () { go($(this).index()); });

    // Find the card nearest a given scroll position. When the final page holds fewer
    // cards than fit on screen, the last card's centered position can sit further right
    // than the track's native max scrollLeft — the browser clamps the actual scroll
    // short of that target, so the nearest-center match alone would land one card early
    // and incorrectly bring the "next" arrow back. Snapping anything at-or-past the
    // track's real scroll limit to the last index fixes that.
    function nearestIndex(pos) {
      var centers = cardCenters();
      var i = 0, best = Infinity;
      for (var k = 0; k < centers.length; k++) {
        var d = Math.abs(centers[k] - pos);
        if (d < best) { best = d; i = k; }
      }
      var maxScroll = $track[0].scrollWidth - $track[0].clientWidth;
      if (pos >= maxScroll - 1) i = total() - 1;
      if (pos <= 1) i = 0;
      return i;
    }

    $track.on('scroll', function () {
      var i = nearestIndex(this.scrollLeft);
      if (i !== idx) {
        idx = i;
        $dots.removeClass('active').eq(i).addClass('active');
        $prev.toggleClass('d-none', i === 0);
        $next.toggleClass('d-none', i >= total() - 1);
      }
    });

    // Re-align the active card when device orientation or viewport width changes.
    var resizeTimer;
    $(window).on('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { go(idx); }, 120);
    });

    go(0);
  }

  $('.scroll-carousel').each(function () { initCarousel($(this)); });

  /* Platform operational intelligence engine */
  $('[data-intelligence-engine]').each(function () {
    var $engine = $(this), $steps = $engine.find('.intelligence-step');
    var $copy = $engine.find('.intelligence-stage-copy');
    var $index = $engine.find('.intelligence-stage-index');
    var $title = $engine.find('.intelligence-stage-title');
    var $description = $engine.find('.intelligence-stage-description');
    var $progress = $engine.find('.intelligence-stage-progress span');
    var current = 0, timer;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function selectStep(index, moveFocus) {
      current = (index + $steps.length) % $steps.length;
      var $step = $steps.eq(current);
      $steps.removeClass('active').attr({ 'aria-selected': 'false', tabindex: '-1' });
      $step.addClass('active').attr({ 'aria-selected': 'true', tabindex: '0' });
      $index.text(String(current + 1).padStart(2, '0'));
      $title.text($step.data('title'));
      $description.text($step.data('description'));
      $progress.css('width', ((current + 1) / $steps.length * 100) + '%');
      $copy.removeClass('is-changing');
      void $copy[0].offsetWidth;
      $copy.addClass('is-changing');
      if (moveFocus) $step.trigger('focus');
    }

    function startEngine() {
      if (reduceMotion) return;
      clearInterval(timer);
      timer = setInterval(function () { selectStep(current + 1, false); }, 5000);
    }

    $steps.on('click mouseenter', function (event) {
      selectStep(Number($(this).data('index')), event.type === 'click');
      startEngine();
    }).on('keydown', function (event) {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault(); selectStep(current + 1, true); startEngine();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault(); selectStep(current - 1, true); startEngine();
      }
    });

    $engine.on('mouseenter focusin', function () { clearInterval(timer); });
    $engine.on('mouseleave focusout', startEngine);
    selectStep(0, false);
    startEngine();
  });

  /* ── Global presence map (Leaflet) ── */
  var $presenceMap = $('#presence-map');
  if ($presenceMap.length && window.L) {
    var presenceLocations = [
      { name: 'India', lat: 20.5937, lng: 78.9629 },
      { name: 'Australia', lat: -25.2744, lng: 133.7751 },
      { name: 'New Zealand', lat: -40.9006, lng: 174.8860 },
      { name: 'Fiji', lat: -17.7134, lng: 178.0650 },
      { name: 'Papua New Guinea', lat: -6.3149, lng: 143.9555 }
    ];

    var presenceMap = L.map('presence-map', {
      dragging: false,
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      touchZoom: false,
      keyboard: false,
      attributionControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(presenceMap);

    var presenceBounds = L.latLngBounds(presenceLocations.map(function (loc) { return [loc.lat, loc.lng]; }));

    presenceLocations.forEach(function (loc) {
      L.circleMarker([loc.lat, loc.lng], {
        radius: 8,
        color: '#fff',
        weight: 2,
        fillColor: '#4169dc',
        fillOpacity: 1
      }).addTo(presenceMap).bindTooltip(loc.name, {
        permanent: true,
        direction: 'top',
        offset: [0, -10],
        className: 'presence-tooltip'
      });
    });

    // Fixed view: always re-fit the same five countries into frame, never left
    // panned/zoomed differently after a container-size change.
    function fitPresenceMap() {
      presenceMap.invalidateSize();
      presenceMap.fitBounds(presenceBounds, { padding: [30, 30] });
    }
    fitPresenceMap();

    var presenceResizeTimer;
    $(window).on('resize', function () {
      clearTimeout(presenceResizeTimer);
      presenceResizeTimer = setTimeout(fitPresenceMap, 150);
    });
  }

  /* ── Phone showcase + step tabs (About Anstel, Platform Principles, etc.) ──
     Each .about-phone-stage / .process-photo-stage on the page is its own scoped
     instance: phones + toggle live inside the stage element, steps live in a
     sibling row under the same section wrapper — so scope by that shared parent. */
  $('.about-phone-stage, .process-photo-stage').each(function () {
    var $stage = $(this), $scope = $stage.parent();
    var $steps = $scope.find('.about-step'), $phones = $stage.find('.about-phone-frame'), $toggle = $stage.find('.about-play-toggle');
    var cur = 0, timer, paused = false, dur = 4500;
    if (!$steps.length || !$phones.length) return;
    function restartFill() {
      var $fill = $steps.eq(cur).find('.about-step-fill');
      $fill.css('animation', 'none');
      void $fill[0].offsetWidth;
      $fill.css('animation', '');
    }
    function go(i) {
      cur = (i + $steps.length) % $steps.length;
      $steps.removeClass('active paused').eq(cur).addClass('active').toggleClass('paused', paused);
      $phones.removeClass('active').eq(cur).addClass('active');
      restartFill();

      var $rail = $steps.closest('.business-outcomes-steps');
      if ($rail.length) {
        var rail = $rail[0], step = $steps[cur];
        var stepLeft = step.offsetLeft, stepRight = stepLeft + step.offsetWidth;
        var viewLeft = rail.scrollLeft, viewRight = viewLeft + rail.clientWidth;
        var target = viewLeft;
        if (stepLeft < viewLeft) target = stepLeft;
        if (stepRight > viewRight) target = stepRight - rail.clientWidth;
        if (target !== viewLeft) rail.scrollTo({ left: target, behavior: 'smooth' });
      }
    }
    function schedule() {
      clearTimeout(timer);
      if (paused) return;
      timer = setTimeout(function () { go(cur + 1); schedule(); }, dur);
    }
    $steps.on('click', function () { go($(this).data('step')); schedule(); });
    $phones.on('click', function () { go($(this).data('phone')); schedule(); });
    $toggle.on('click', function () {
      paused = !paused;
      $steps.eq(cur).toggleClass('paused', paused);
      $toggle.find('.icon-pause').toggle(!paused);
      $toggle.find('.icon-play').toggle(paused);
      $toggle.attr('aria-label', paused ? 'Resume auto-play' : 'Pause auto-play');
      if (paused) { clearTimeout(timer); } else { schedule(); }
    });
    schedule();
  });

  /* Iconify symbols for the remaining informational cards. Matching is based
     only on the visible label and ordered from specific concepts to general ones. */
  (function alignFeatureIconsWithLabels() {
    var exactIcons = {
      'call us': 'material-symbols:call-outline',
      'email us': 'material-symbols:mail-outline',
      'one login for everything': 'material-symbols:login',
      'live data you can trust': 'material-symbols:sensors',
      'less manual work': 'material-symbols:automation-outline',
      'grows with you': 'material-symbols:rocket-launch-outline',
      '15+ years supporting operators': 'material-symbols:workspace-premium-outline',
      'driver id': 'material-symbols:badge-outline',
      'driver id (rfid)': 'material-symbols:badge-outline',
      'ignition & battery': 'material-symbols:battery-charging-full-outline',
      'door & pto sensors': 'material-symbols:sensor-door-outline',
      'idle & movement': 'material-symbols:sensors',
      'trip replay': 'material-symbols:sync-outline',
      'trip summary': 'material-symbols:summarize-outline',
      'event-based recording': 'material-symbols:emergency-recording-outline',
      'gps & video synchronization': 'material-symbols:sync-outline',
      'incident investigation': 'material-symbols:visibility-outline',
      'evidence management': 'material-symbols:folder-managed-outline',
      'video export & sharing': 'material-symbols:hub-outline',
      'driver coaching': 'material-symbols:school-outline',
      'performance comparison': 'material-symbols:compare-arrows',
      'utilization overview': 'material-symbols:dashboard-outline',
      'continuous monitoring': 'material-symbols:visibility-outline',
      'data-driven decision making': 'material-symbols:dashboard-outline',
      'custom alert rules': 'material-symbols:settings-outline',
      'notification preferences': 'material-symbols:settings-outline',
      'event configuration': 'material-symbols:settings-outline',
      'qr & barcode support': 'material-symbols:qr-code-scanner',
      'field accountability': 'material-symbols:description-outline',
      'open apis': 'material-symbols:api',
      'process automation': 'material-symbols:automation-outline',
      'pause & resume': 'material-symbols:pause-circle-outline',
      'proof of delivery': 'material-symbols:photo-camera-outline',
      'manual delivery updates': 'material-symbols:sync-outline',
      'smartphone ready': 'material-symbols:devices-other-outline',
      'country-specific offers': 'material-symbols:storefront-outline',
      'roadside assistance': 'material-symbols:car-repair-outline',
      'finance': 'material-symbols:account-balance-outline',
      'insurance': 'material-symbols:health-and-safety-outline',
      'registration & insurance management': 'material-symbols:health-and-safety-outline',
      'enterprise systems': 'material-symbols:hub-outline',
      'flexible platform': 'material-symbols:settings-outline',
      'one system, not five': 'material-symbols:hub-outline',
      'lower running costs': 'material-symbols:account-balance-outline',
      'intelligent planning': 'material-symbols:calendar-month-outline',
      'faster response': 'material-symbols:bolt-outline',
      'service catalog': 'material-symbols:description-outline',
      'smart discovery': 'material-symbols:visibility-outline'
    };

    var rules = [
      [/fuel/i, 'material-symbols:local-gas-station-outline'],
      [/temperature|cold chain/i, 'material-symbols:device-thermostat'],
      [/camera|video|playback/i, 'material-symbols:videocam-outline'],
      [/panic|sos|emergency/i, 'material-symbols:warning-outline'],
      [/incident/i, 'material-symbols:warning-outline'],
      [/unauthor|deviation|delayed|risk/i, 'material-symbols:warning-outline'],
      [/notification|alert/i, 'material-symbols:notifications-outline'],
      [/immobilization/i, 'material-symbols:no-crash-outline'],
      [/security|safety|compliance|protect/i, 'material-symbols:shield-outline'],
      [/audit|history|timeline/i, 'material-symbols:schedule-outline'],
      [/route|navigation|journey|trip|distance|geofence|map/i, 'material-symbols:route-outline'],
      [/eta|response time|shift hours|calendar|schedul/i, 'material-symbols:schedule-outline'],
      [/location|gps|tracking|visibility|live|real-time/i, 'material-symbols:location-on-outline'],
      [/report|document|records/i, 'material-symbols:description-outline'],
      [/analytics|insight|trend|performance|benchmark|analysis|intelligence/i, 'material-symbols:dashboard-outline'],
      [/api|extensible|code/i, 'material-symbols:api'],
      [/sync|synchronization/i, 'material-symbols:sync-outline'],
      [/cloud|availability|uptime|reliab/i, 'material-symbols:cloud-outline'],
      [/connectivity|network/i, 'material-symbols:hub-outline'],
      [/integration|connected ecosystem|connected platform/i, 'material-symbols:hub-outline'],
      [/inventory|stock|warehouse|asset|equipment|container/i, 'material-symbols:inventory-2-outline'],
      [/driver|workforce|team|people|operator|customer|recipient|partner/i, 'material-symbols:groups-outline'],
      [/maintenance|service|inspection|repair|infringement/i, 'material-symbols:build-outline'],
      [/delivery|dispatch/i, 'material-symbols:local-shipping-outline'],
      [/vehicle|fleet/i, 'material-symbols:directions-car-outline'],
      [/workflow|automat|process|job status|reassign|configuration/i, 'material-symbols:account-tree-outline'],
      [/device|sensor|hardware|iot|mobile|phone/i, 'material-symbols:devices-other-outline'],
      [/scale|scalab|future.ready|innovation/i, 'material-symbols:rocket-launch-outline'],
      [/centralized|administration|management|dashboard|control/i, 'material-symbols:dashboard-outline'],
      [/efficiency|productivity|accuracy|readiness|execution/i, 'material-symbols:task-alt'],
      [/insurance/i, 'material-symbols:health-and-safety-outline']
    ];

    $('.industry-icon, .feature-icon, .device-icon').each(function () {
      var $icon = $(this);
      var $label = $icon.nextAll('h2,h3,h4,h5,h6,p').first();
      if (!$label.length) $label = $icon.parent().find('h2,h3,h4,h5,h6').first();
      var label = $label.text().replace(/\s+/g, ' ').trim();
      if (!label) return;
      var iconName = exactIcons[label.toLowerCase()] || '';
      for (var i = 0; !iconName && i < rules.length; i++) {
        if (rules[i][0].test(label)) {
          iconName = rules[i][1];
          break;
        }
      }
      if (!iconName) iconName = 'material-symbols:widgets-outline';
      $icon.html('<iconify-icon icon="' + iconName + '" aria-hidden="true"></iconify-icon>')
        .attr('data-icon-for', label);
    });
  })();

});
