/* Independent intelligence stories with automatic and optional manual controls. */
(function () {
  'use strict';

  document.querySelectorAll('[data-intelligence-carousel]').forEach(function (carousel) {
    var phones = Array.from(carousel.querySelectorAll('[data-intelligence-slide]'));
    var dots = Array.from(carousel.querySelectorAll('[data-intelligence-dot]'));
    var stage = carousel.querySelector('[data-intelligence-stage], .intelligence-phones');
    var status = carousel.querySelector('.intelligence-status');
    var current = 0;
    var pointerStart = null;
    var toggle = carousel.querySelector('[data-intelligence-autoplay]');
    var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    var paused = motionPreference.matches;
    var hovered = false;
    var continuous = carousel.hasAttribute('data-intelligence-continuous');
    var focusPaused = false;
    var inView = !('IntersectionObserver' in window);
    var timer;
    var duration = 6000;
    if (!stage || !phones.length || (dots.length && dots.length !== phones.length)) return;

    function updateToggle() {
      if (!toggle) return;
      toggle.setAttribute('aria-label', paused ? 'Play automatic navigation' : 'Pause automatic navigation');
      toggle.querySelector('.intelligence-play-icon').hidden = !paused;
      toggle.querySelector('.intelligence-pause-icon').hidden = paused;
    }

    function schedule() {
      window.clearTimeout(timer);
      if (paused || hovered || focusPaused || pointerStart || document.hidden || !inView) return;
      timer = window.setTimeout(function () {
        showSlide(current + 1, false);
      }, duration);
    }

    function showSlide(index, announce) {
      current = (index + phones.length) % phones.length;
      phones.forEach(function (phone, i) { phone.classList.toggle('is-active', i === current); });
      dots.forEach(function (dot, i) {
        if (i === current) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      schedule();
      if (announce && status) {
        status.textContent = 'Slide ' + (current + 1) + ' of ' + phones.length + ': ' + phones[current].querySelector('h3, h4').textContent;
      }
    }

    var previous = carousel.querySelector('[data-intelligence-prev]');
    var next = carousel.querySelector('[data-intelligence-next]');
    if (previous) previous.addEventListener('click', function () { showSlide(current - 1, true); });
    if (next) next.addEventListener('click', function () { showSlide(current + 1, true); });
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () { showSlide(index, true); });
    });
    carousel.addEventListener('keydown', function (event) {
      if (event.key === ' ' && event.target === stage) {
        event.preventDefault();
        paused = !paused;
        if (!paused) focusPaused = false;
        updateToggle();
        schedule();
        if (status) status.textContent = paused ? 'Automatic navigation paused.' : 'Automatic navigation resumed.';
        return;
      }
      var index;
      if (event.key === 'ArrowLeft') index = current - 1;
      else if (event.key === 'ArrowRight') index = current + 1;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = phones.length - 1;
      else return;
      event.preventDefault();
      if (continuous) focusPaused = true;
      showSlide(index, true);
    });
    stage.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' || !event.isPrimary) return;
      pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
      schedule();
    });
    stage.addEventListener('pointerup', function (event) {
      if (!pointerStart || pointerStart.id !== event.pointerId) return;
      var dx = event.clientX - pointerStart.x;
      var dy = event.clientY - pointerStart.y;
      pointerStart = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) showSlide(current + (dx < 0 ? 1 : -1), true);
      else schedule();
    });
    stage.addEventListener('pointercancel', function () { pointerStart = null; schedule(); });
    stage.addEventListener('pointerenter', function (event) {
      if (!continuous && event.pointerType === 'mouse') { hovered = true; schedule(); }
    });
    stage.addEventListener('pointerleave', function (event) {
      if (!continuous && event.pointerType === 'mouse') { hovered = false; schedule(); }
    });
    // Pointer interaction should not strand autoplay on a focused tab. On touch
    // devices there is no hover-out or blur to resume it, so a tap never pauses.
    var lastTouch = false;
    carousel.addEventListener('pointerdown', function (event) {
      lastTouch = event.pointerType !== 'mouse';
      if (continuous || lastTouch) { focusPaused = false; schedule(); }
    });
    carousel.addEventListener('keydown', function () { lastTouch = false; }, true);
    carousel.addEventListener('focusin', function (event) {
      focusPaused = !lastTouch && (!continuous || event.target.matches(':focus-visible'));
      schedule();
    });
    carousel.addEventListener('focusout', function (event) {
      if (!carousel.contains(event.relatedTarget)) { focusPaused = false; schedule(); }
    });
    if (toggle) toggle.addEventListener('click', function () {
      paused = !paused;
      if (!paused) focusPaused = false;
      updateToggle();
      schedule();
    });
    document.addEventListener('visibilitychange', schedule);
    motionPreference.addEventListener('change', function (event) {
      if (event.matches) paused = true;
      updateToggle();
      schedule();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[entries.length - 1].isIntersecting;
        schedule();
      }, { threshold: 0 }).observe(stage);
    }

    stage.setAttribute('tabindex', '0');
    carousel.classList.add('is-enhanced');
    updateToggle();
    showSlide(0, false);
  });
}());
