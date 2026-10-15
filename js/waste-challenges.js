/* Waste Management challenge showcase. */
(function () {
  'use strict';
  var carousel = document.querySelector('[data-waste-challenges]');
  if (!carousel) return;

  var slides = Array.from(carousel.querySelectorAll('[data-challenge-slide]'));
  var titles = Array.from(carousel.querySelectorAll('[data-challenge-title]'));
  var toggle = carousel.querySelector('[data-challenge-toggle]');
  var stage = carousel.querySelector('.waste-challenges-stage');
  if (!slides.length || slides.length !== titles.length || !toggle) return;

  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var current = 0, timer, paused = motion.matches, hovered = false;
  var inView = !('IntersectionObserver' in window), touchStart = null;
  var duration = 6000;
  carousel.style.setProperty('--challenge-duration', duration + 'ms');

  function hydrateSlide(index) {
    var slide = slides[index];
    slide.querySelectorAll('[data-srcset]').forEach(function (element) {
      element.srcset = element.dataset.srcset;
      element.removeAttribute('data-srcset');
    });
    var image = slide.querySelector('img[data-src]');
    if (image) {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    }
  }

  function schedule() {
    window.clearTimeout(timer);
    carousel.dataset.running = 'false';
    carousel.dataset.paused = String(paused);
    toggle.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    var running = !paused && !hovered && inView && !document.hidden;
    if (!running) return;
    // Restart the active title's progress bar with the same interval as the slide.
    void titles[current].offsetWidth;
    carousel.dataset.running = 'true';
    timer = window.setTimeout(function () { show(current + 1); }, duration);
  }

  function show(index) {
    current = (index + slides.length) % slides.length;
    hydrateSlide(current);
    slides.forEach(function (slide, i) {
      slide.setAttribute('aria-hidden', String(i !== current));
      titles[i].setAttribute('aria-pressed', String(i === current));
    });
    schedule();
  }

  titles.forEach(function (title, index) {
    title.addEventListener('click', function () {
      paused = true;
      show(index);
    });
    title.addEventListener('keydown', function (event) {
      var next;
      if (event.key === 'ArrowRight') next = (index + 1) % titles.length;
      else if (event.key === 'ArrowLeft') next = (index + titles.length - 1) % titles.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = titles.length - 1;
      else return;
      event.preventDefault();
      paused = true;
      show(next);
      titles[next].focus();
    });
  });

  toggle.hidden = false;
  toggle.addEventListener('click', function () { paused = !paused; schedule(); });
  carousel.addEventListener('mouseenter', function () { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', function () { hovered = false; schedule(); });
  carousel.addEventListener('focusin', function (event) {
    if (event.target !== toggle) { paused = true; schedule(); }
  });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', function () {
    if (motion.matches) paused = true;
    schedule();
  });

  stage.addEventListener('touchstart', function (event) {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  stage.addEventListener('touchcancel', function () { touchStart = null; }, { passive: true });
  stage.addEventListener('touchend', function (event) {
    if (!touchStart || !event.changedTouches.length) return;
    var dx = event.changedTouches[0].clientX - touchStart.x;
    var dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      paused = true;
      show(current + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      inView = entries[entries.length - 1].isIntersecting;
      schedule();
    }, { threshold: .25 });
    observer.observe(stage);
  }
  show(0);
}());
