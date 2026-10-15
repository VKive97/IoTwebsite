/* Office maps on /company/locations/ — Leaflet + OpenStreetMap tiles (free, no
   API key). Leaflet is vendored in /js/vendor/leaflet/ and is only loaded once a
   map scrolls near the viewport. Each map reads its position and pin colour from
   data-lat / data-lng / data-color / data-label on a .office-leaflet element. */
(function () {
  var maps = document.querySelectorAll('.office-leaflet');
  if (!maps.length) return;

  function pinIcon(color) {
    return L.divIcon({
      className: 'office-pin',
      iconSize: [30, 42],
      iconAnchor: [15, 41],
      tooltipAnchor: [0, -38],
      html: '<svg width="30" height="42" viewBox="0 0 30 42" aria-hidden="true">' +
        '<path d="M15 1C7.3 1 1 7.2 1 14.9 1 25.3 15 41 15 41s14-15.7 14-26.1C29 7.2 22.7 1 15 1z" fill="' + color + '" stroke="#fff" stroke-width="2"/>' +
        '<circle cx="15" cy="15" r="5.5" fill="#fff"/></svg>'
    });
  }

  function init(el) {
    if (el.dataset.ready) return;
    el.dataset.ready = '1';
    var lat = parseFloat(el.dataset.lat);
    var lng = parseFloat(el.dataset.lng);
    var map = L.map(el, { scrollWheelZoom: false }).setView([lat, lng], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    L.marker([lat, lng], { icon: pinIcon(el.dataset.color), keyboard: false })
      .addTo(map)
      .bindTooltip(el.dataset.label, { permanent: true, direction: 'top', className: 'office-pin-label' });
  }

  function initAll() { maps.forEach(init); }

  function loadLeaflet() {
    if (window.L) { initAll(); return; }
    if (!document.querySelector('link[data-leaflet-deferred]')) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = '/js/vendor/leaflet/leaflet.css';
      css.dataset.leafletDeferred = '';
      document.head.appendChild(css);
    }
    var js = document.createElement('script');
    js.src = '/js/vendor/leaflet/leaflet.js';
    js.addEventListener('load', initAll, { once: true });
    document.head.appendChild(js);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) {
        io.disconnect();
        loadLeaflet();
      }
    }, { rootMargin: '300px' });
    maps.forEach(function (m) { io.observe(m); });
  } else {
    loadLeaflet();
  }
})();
