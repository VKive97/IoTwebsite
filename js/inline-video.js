/* Native controls remain available without JavaScript or automatic playback. */
(function () {
  'use strict';
  var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var connection = navigator.connection;

  document.querySelectorAll('video[data-inline-video]').forEach(function (video) {
    var nearViewport = false;
    var attempted = false;

    function updatePlayback() {
      var allowed = !(motion && motion.matches) && !(connection && connection.saveData);
      if (!allowed) {
        if (attempted) video.pause();
        attempted = false;
        return;
      }
      if (nearViewport && !attempted) {
        attempted = true;
        var playback = video.play();
        if (playback && playback.catch) playback.catch(function () { /* Keep native play available. */ });
      }
    }

    // Leave playback manual on browsers without viewport observation.
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        nearViewport = entries.some(function (entry) { return entry.isIntersecting; });
        updatePlayback();
      }, { rootMargin: '200px 0px' });
      observer.observe(video);
    }
    if (motion && motion.addEventListener) motion.addEventListener('change', updatePlayback);
    else if (motion && motion.addListener) motion.addListener(updatePlayback);
    if (connection && connection.addEventListener) connection.addEventListener('change', updatePlayback);
  });
})();
