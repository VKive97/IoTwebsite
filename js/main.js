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

  /* ── Mobile menu toggle ── */
  $('#mobile-toggle').on('click', function () {
    $('#mobile-menu').slideToggle(200);
  });

  /* ── Mobile accordion ── */
  $('.mob-acc-btn').on('click', function () {
    var $body = $(this).siblings('.mob-acc-body');
    $body.slideToggle(200);
    $(this).find('.acc-arrow').toggleClass('rotated');
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

    // Normalise carousel to proper bleed track
    var $first = $track.find('[data-card]:first');
    if ($first.length) {
      var msClasses = ($first.attr('class') || '').split(' ').filter(function(c) {
        return c.startsWith('ms-');
      });
      if (msClasses.length) {
        $first.removeClass(msClasses.join(' '));
        var pxClasses = msClasses.map(function(c) { return c.replace('ms-', 'px-'); }).join(' ');
        $track.addClass(pxClasses);
      }
    }
    // Remove the fixed spacer div to let padding-right do the work
    $track.children('[aria-hidden="true"]').remove();

    function cw() {
      var $firstCard = $track.find('[data-card]:first');
      var gapStr = $track.css('gap');
      var gap = gapStr === 'normal' ? 0 : (parseFloat(gapStr) || 0);
      return ($firstCard.outerWidth() || 0) + gap;
    }
    function total() { return $track.find('[data-card]').length; }

    function go(i) {
      idx = Math.max(0, Math.min(i, total() - 1));
      $track[0].scrollTo({ left: idx * cw(), behavior: 'smooth' });
      $dots.removeClass('active').eq(idx).addClass('active');
      $prev.toggleClass('d-none', idx === 0);
      $next.toggleClass('d-none', idx >= total() - 1);
    }

    $prev.on('click', function () { go(idx - 1); });
    $next.on('click', function () { go(idx + 1); });
    $dots.on('click', function () { go($(this).index()); });

    $track.on('scroll', function () {
      var i = Math.round(this.scrollLeft / cw());
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

});
