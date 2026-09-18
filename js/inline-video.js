/* Native video playback stays available even when this enhancement cannot load. */
(function () {
  'use strict';
  if (!window.matchMedia) return;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('video[data-inline-video]').forEach(function (video) {
    function applyMotionPreference() {
      video.autoplay = !motion.matches;
      if (motion.matches) video.pause();
    }

    applyMotionPreference();
    if (motion.addEventListener) {
      motion.addEventListener('change', applyMotionPreference);
    } else if (motion.addListener) {
      motion.addListener(applyMotionPreference);
    }
  });
})();
