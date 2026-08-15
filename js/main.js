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

    // Center-mode carousel: only one card is ever in focus, so every arrow click
    // steps exactly one card at a time — no multi-card paging.
    $prev.on('click', function () { go(idx - 1); });
    $next.on('click', function () { go(idx + 1); });
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
      $steps.removeClass('active').eq(cur).addClass('active');
      $phones.removeClass('active').eq(cur).addClass('active');
      restartFill();
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

  /* Tesla-style semantic icons
     Select a clean outline symbol from the card's actual label so repeated,
     generic artwork is not used for unrelated features. */
  (function alignFeatureIconsWithLabels() {
    var icons = {
      analytics: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 39V24M18 39V15M29 39V28M40 39V8"/><path d="M5 39h38"/></svg>',
      alert: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6 44 41H4L24 6Z"/><path d="M24 18v11M24 35h.01"/></svg>',
      api: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m17 14-10 10 10 10M31 14l10 10-10 10M28 8 20 40"/></svg>',
      box: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="m7 15 17-9 17 9v19l-17 9-17-9V15Z"/><path d="m7 15 17 9 17-9M24 24v19M15 10l17 9"/></svg>',
      camera: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="12" width="29" height="25" rx="3"/><path d="m34 20 9-5v19l-9-5V20ZM12 12l3-6h9l3 6"/><circle cx="19.5" cy="24.5" r="6"/></svg>',
      cloud: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 38h23a8 8 0 0 0 1-15.9A14 14 0 0 0 11.5 18 10 10 0 0 0 14 38Z"/></svg>',
      document: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5h18l8 8v30H11V5Z"/><path d="M29 5v9h8M17 23h14M17 30h14M17 37h9"/></svg>',
      fuel: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 42V8h22v34M5 42h28M13 13h12v10H13z"/><path d="m30 14 6 6v15a4 4 0 0 0 8 0V18l-5-5M39 13v7h5"/></svg>',
      location: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M39 20c0 11-15 23-15 23S9 31 9 20a15 15 0 1 1 30 0Z"/><circle cx="24" cy="20" r="5"/></svg>',
      route: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="38" r="4"/><circle cx="38" cy="10" r="4"/><path d="M14 38h8a6 6 0 0 0 0-12h-2a6 6 0 0 1 0-12h14M29 6l5 4-5 4"/></svg>',
      security: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M24 5 41 12v11c0 10-7 17-17 21C14 40 7 33 7 23V12l17-7Z"/><path d="m17 24 5 5 10-11"/></svg>',
      sync: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M39 17A17 17 0 0 0 10 12l-3 5M9 31a17 17 0 0 0 29 5l3-5"/><path d="M7 9v8h8M41 39v-8h-8"/></svg>',
      team: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="19" cy="15" r="7"/><path d="M5 40c1-9 6-14 14-14s13 5 14 14"/><circle cx="35" cy="17" r="5"/><path d="M34 27c6 0 9 4 10 10"/></svg>',
      temperature: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 29V10a6 6 0 0 1 12 0v19a10 10 0 1 1-12 0Z"/><path d="M25 15v18"/><circle cx="25" cy="36" r="4"/></svg>',
      time: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="25" r="18"/><path d="M24 15v11l8 5M18 5h12"/></svg>',
      tools: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M30 8a10 10 0 0 0-12 13L6 33a6 6 0 0 0 9 9l12-12A10 10 0 0 0 40 18l-7 7-7-3-3-7 7-7Z"/></svg>',
      vehicle: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 34V20h25v14M30 24h7l6 7v3H30M3 34h42"/><circle cx="13" cy="36" r="5"/><circle cx="36" cy="36" r="5"/></svg>',
      workflow: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="6" width="14" height="11" rx="2"/><rect x="29" y="31" width="14" height="11" rx="2"/><path d="M12 17v12a6 6 0 0 0 6 6h11M36 31V19a6 6 0 0 0-6-6H19"/><path d="m25 9-6 4 6 4M23 31l6 4-6 4"/></svg>'
    };

    var rules = [
      [/fuel/i, 'fuel'], [/temperature|cold chain/i, 'temperature'], [/camera|video|evidence|playback/i, 'camera'],
      [/route|navigation|journey|trip|distance|geofence|location|map/i, 'route'], [/eta|time|history|timeline|delay|calendar|schedul/i, 'time'],
      [/alert|notification|panic|emergency|incident|risk|deviation|unauthor/i, 'alert'], [/security|safety|compliance|insurance|audit|protect/i, 'security'],
      [/report|analytics|insight|trend|performance|benchmark|comparison|intelligence/i, 'analytics'], [/document|proof/i, 'document'],
      [/api|extensible|integration/i, 'api'], [/sync|connected|connectivity|network/i, 'sync'], [/cloud|availability|uptime|reliab/i, 'cloud'],
      [/inventory|stock|warehouse|asset|equipment|container/i, 'box'], [/driver|workforce|team|people|operator|customer|recipient/i, 'team'],
      [/maintenance|service|inspection|repair|infringement/i, 'tools'], [/vehicle|fleet|delivery|dispatch|mobile|phone|tracking device/i, 'vehicle'],
      [/workflow|automat|process|job status|reassign|pause|configuration/i, 'workflow'], [/gps|monitor|visibility|live|real-time/i, 'location']
    ];

    $('.feature-icon, .device-icon').each(function () {
      var $icon = $(this);
      var $label = $icon.nextAll('h2,h3,h4,h5,h6,p').first();
      if (!$label.length) $label = $icon.parent().find('h2,h3,h4,h5,h6').first();
      var label = $label.text().replace(/\s+/g, ' ').trim();
      if (!label) return;
      for (var i = 0; i < rules.length; i++) {
        if (rules[i][0].test(label)) {
          $icon.html(icons[rules[i][1]]).attr('data-icon-for', label);
          break;
        }
      }
    });
  })();

});
