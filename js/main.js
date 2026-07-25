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

  /* ── Location modal ── */
  $('.loc-dismiss, .loc-btn').on('click', function () {
    $('#loc-modal').fadeOut(200);
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

  /* ── Global presence map (Leaflet) ── */
  var $presenceMap = $('#presence-map');
  if ($presenceMap.length && window.L) {
    var presenceLocations = [
      { name: 'India', lat: 20.5937, lng: 78.9629 },
      { name: 'Australia', lat: -25.2744, lng: 133.7751 },
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

    // Fixed view: always re-fit the same four countries into frame, never left
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

});
