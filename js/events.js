/* Events reuse the existing Blog API and its existing fields. Published posts in
   the "Events" category become event cards; the YYYY-MM-DD slug prefix supplies
   a stable event date without adding an API or database field. */
(function () {
  'use strict';

  function safeUrl(value, allowContactSchemes) {
    return window.AnstelBlog ? window.AnstelBlog.safePublicUrl(value, allowContactSchemes) : '';
  }

  function eventDateFromSlug(slug) {
    var match = String(slug || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:-|$)/);
    if (!match) return null;
    var date = new Date(match[1] + '-' + match[2] + '-' + match[3] + 'T12:00:00');
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function textFromHtml(html) {
    var doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function labelledValue(html, label) {
    var doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    var wanted = label.toLowerCase();
    var blocks = doc.body.querySelectorAll('p,li,div');
    for (var i = 0; i < blocks.length; i += 1) {
      var value = (blocks[i].textContent || '').replace(/\s+/g, ' ').trim();
      if (value.toLowerCase().indexOf(wanted + ':') === 0) return value.slice(value.indexOf(':') + 1).trim();
    }
    return '';
  }

  function registrationUrl(html) {
    var doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    var links = doc.body.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i += 1) {
      var context = (links[i].closest('p,li,div') || links[i]).textContent || '';
      if (/register|registration|tickets?/i.test(context)) return links[i].href;
    }
    return '';
  }

  function summaryFromHtml(html) {
    var doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    var paragraphs = doc.body.querySelectorAll('p');
    for (var i = 0; i < paragraphs.length; i += 1) {
      var text = (paragraphs[i].textContent || '').replace(/\s+/g, ' ').trim();
      if (text && !/^(event date|location|registration):/i.test(text)) return text.slice(0, 190);
    }
    return textFromHtml(html).slice(0, 190);
  }

  function normaliseEvent(post, isStatic) {
    var date = post.date ? new Date(post.date + 'T12:00:00') : eventDateFromSlug(post.slug);
    var body = post.content || '';
    var summary = post.summary || summaryFromHtml(body);
    return {
      title: post.title || 'Anstel event',
      slug: post.slug || '',
      date: date && !Number.isNaN(date.getTime()) ? date : null,
      dateIso: date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : '',
      location: post.location || labelledValue(body, 'Location'),
      registrationUrl: safeUrl(post.registrationUrl || registrationUrl(body), false),
      coverImage: safeUrl(post.coverImage || '', false),
      summary: summary,
      content: body,
      url: safeUrl(post.url || (isStatic ? '/events/' + encodeURIComponent(post.slug) + '/' : '/events/event/?slug=' + encodeURIComponent(post.slug)), false) || '/events/'
    };
  }

  async function loadEvents() {
    var cached = [];
    var cacheLoaded = false;
    try {
      var response = await fetch('/events/events.json', { cache: 'no-store' });
      if (response.ok) {
        cached = await response.json();
        cacheLoaded = Array.isArray(cached);
      }
    } catch (_) { /* API fallback below */ }
    if (cacheLoaded) {
      var staticEvents = cached.map(function (event) { return normaliseEvent(event, true); });
      var detail = document.querySelector('[data-event-detail]');
      var requestedSlug = detail ? new URLSearchParams(window.location.search).get('slug') : '';
      if (!detail || !requestedSlug || staticEvents.some(function (event) { return event.slug === requestedSlug; })) return staticEvents;
    }
    if (!window.AnstelBlog) return [];
    try {
      var posts = await window.AnstelBlog.getPosts();
      return posts.filter(function (post) {
        return post.status === 'published' && String(post.category || '').trim().toLowerCase() === 'events';
      }).map(function (post) { return normaliseEvent(post, false); });
    } catch (_) { return []; }
  }

  function formatDate(date, options) {
    return date ? new Intl.DateTimeFormat('en-AU', options).format(date) : 'Date to be announced';
  }

  function eventCard(event) {
    var link = document.createElement('a');
    link.className = 'event-card';
    link.href = event.url;

    var media = document.createElement('div');
    media.className = 'event-card-media';
    if (event.coverImage) {
      var image = document.createElement('img');
      image.src = event.coverImage;
      image.alt = event.title;
      image.width = 1536;
      image.height = 864;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.fetchPriority = 'low';
      media.appendChild(image);
    } else {
      media.className += ' event-card-placeholder';
      media.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18"/></svg>';
    }

    var copy = document.createElement('div');
    copy.className = 'event-card-copy';
    var date = document.createElement('time');
    date.className = 'event-date';
    if (event.dateIso) date.dateTime = event.dateIso;
    if (event.date) {
      var day = document.createElement('strong');
      day.textContent = formatDate(event.date, { day: '2-digit' });
      date.append(day, document.createTextNode(formatDate(event.date, { month: 'short', year: 'numeric' })));
    } else {
      var tba = document.createElement('span');
      tba.textContent = 'Date TBA';
      date.appendChild(tba);
    }

    var details = document.createElement('div');
    var title = document.createElement('h3');
    title.textContent = event.title;
    details.appendChild(title);
    if (event.location) {
      var location = document.createElement('p');
      location.className = 'event-location';
      location.textContent = event.location;
      details.appendChild(location);
    }
    if (event.summary) {
      var summary = document.createElement('p');
      summary.className = 'event-summary';
      summary.textContent = event.summary;
      details.appendChild(summary);
    }
    var action = document.createElement('span');
    action.className = 'event-card-action';
    action.textContent = 'View event →';
    details.appendChild(action);
    copy.append(date, details);
    link.append(media, copy);
    return link;
  }

  function renderListing(events) {
    var upcomingGrid = document.getElementById('upcoming-events-grid');
    if (!upcomingGrid) return;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    events.sort(function (a, b) {
      return (a.date ? a.date.getTime() : Number.MAX_SAFE_INTEGER) - (b.date ? b.date.getTime() : Number.MAX_SAFE_INTEGER);
    });
    var upcoming = events.filter(function (event) { return !event.date || event.date >= today; });
    var past = events.filter(function (event) { return event.date && event.date < today; }).reverse();
    upcoming.forEach(function (event) { upcomingGrid.appendChild(eventCard(event)); });
    document.getElementById('events-empty').hidden = upcoming.length > 0;
    var pastSection = document.getElementById('past-events');
    if (past.length) {
      var pastGrid = document.getElementById('past-events-grid');
      past.forEach(function (event) { pastGrid.appendChild(eventCard(event)); });
      pastSection.hidden = false;
    }
    var status = document.getElementById('events-status');
    if (status) status.textContent = events.length ? '' : 'No published events are available yet.';
  }

  function renderDetail(events) {
    var detail = document.querySelector('[data-event-detail]');
    if (!detail) return;
    var slug = new URLSearchParams(window.location.search).get('slug') || detail.getAttribute('data-event-slug') || '';
    var event = events.find(function (item) { return item.slug === slug; });
    var loading = document.getElementById('event-loading');
    var missing = document.getElementById('event-not-found');
    if (!event) {
      if (loading) loading.hidden = true;
      if (missing) missing.hidden = false;
      return;
    }
    document.title = event.title + ' | Anstel Events';
    document.getElementById('event-title').textContent = event.title;
    var date = document.getElementById('event-date');
    date.textContent = formatDate(event.date, { day: 'numeric', month: 'long', year: 'numeric' });
    if (event.dateIso) date.dateTime = event.dateIso;
    var location = document.getElementById('event-location');
    location.textContent = event.location || 'Location to be announced';
    if (event.coverImage) {
      var cover = document.getElementById('event-cover');
      cover.src = event.coverImage;
      cover.alt = event.title;
      cover.hidden = false;
    }
    var content = document.getElementById('event-content');
    if (window.AnstelBlog && window.AnstelBlog.sanitizeRichHtml) content.innerHTML = window.AnstelBlog.sanitizeRichHtml(event.content);
    else content.textContent = textFromHtml(event.content);
    if (event.registrationUrl) {
      var register = document.getElementById('event-register');
      register.href = event.registrationUrl;
      register.hidden = false;
    }
    if (loading) loading.hidden = true;
    detail.hidden = false;
  }

  loadEvents().then(function (events) {
    renderListing(events);
    renderDetail(events);
  });
})();
