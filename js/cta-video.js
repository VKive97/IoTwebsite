/* Load ambient CTA videos when visible, with a still image as the fallback. */
(function () {
  'use strict';
  document.querySelectorAll('[data-cta-video]').forEach(function (container) {
    var video = container.querySelector('video');
    var source = video && video.querySelector('source[data-src]');
    var toggle = container.querySelector('.cta-video-toggle');
    if (!video || !source || !toggle) return;
    var videoLabel = container.dataset.videoLabel || 'delivery video';

    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var pausedByUser = motion.matches;
    var inView = !('IntersectionObserver' in window);
    var failed = false;
    video.muted = true;

    function updateToggle() {
      container.dataset.paused = String(video.paused);
      toggle.setAttribute('aria-label', (video.paused ? 'Play ' : 'Pause ') + videoLabel);
    }

    function syncPlayback() {
      if (failed) return;
      if (pausedByUser || !inView || document.hidden) {
        video.pause();
        updateToggle();
        return;
      }
      if (source.dataset.src) {
        source.src = source.dataset.src;
        delete source.dataset.src;
        video.load();
      }
      var play = video.play();
      if (play && play.catch) play.catch(updateToggle);
    }

    function showFallback() {
      failed = true;
      video.pause();
      container.dataset.videoReady = 'false';
      toggle.hidden = true;
    }

    video.addEventListener('playing', function () {
      container.dataset.videoReady = 'true';
      updateToggle();
    });
    video.addEventListener('pause', updateToggle);
    video.addEventListener('error', showFallback);
    source.addEventListener('error', showFallback);
    toggle.addEventListener('click', function () {
      pausedByUser = !video.paused;
      syncPlayback();
    });
    motion.addEventListener('change', function () {
      pausedByUser = motion.matches;
      syncPlayback();
    });
    document.addEventListener('visibilitychange', syncPlayback);

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        syncPlayback();
      }, { threshold: 0.1 });
      observer.observe(container);
    }
    toggle.hidden = false;
    updateToggle();
    syncPlayback();
  });
})();
