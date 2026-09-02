/* Wires #demo-form (/demo/) and #contact-form (/company/contact/) to the
   AutonauticsBlog.API service. NOTE: the API currently only has a LAN address
   (no public host yet), so these forms only submit successfully from machines
   on the same network as the API server — see js/blog.js for the same caveat. */
(function () {
  var API_BASE = 'http://192.168.4.9:9814';

  function fieldValue(form, id) {
    var el = form.querySelector('#' + id);
    return el ? el.value.trim() : '';
  }

  /* The Contactus API rejects an empty phone or one containing "+", so the demo
     form derives the dial code from the country <select> and submits a
     "+"-free number (e.g. "61 412345678"). */
  var DEMO_DIAL_CODES = {
    Australia: '61',
    India: '91',
    Fiji: '679',
    'Papua New Guinea': '675',
    'New Zealand': '64'
  };

  function composeDemoPhone(form) {
    var digits = (fieldValue(form, 'df-phone') || '').replace(/\D/g, '');
    if (!digits) return '';
    var code = DEMO_DIAL_CODES[fieldValue(form, 'df-country')] || '';
    if (!code) return digits;
    digits = digits.replace(/^0+/, '');
    var national = (digits.indexOf(code) === 0 && digits.length >= code.length + 5)
      ? digits.slice(code.length)
      : digits;
    return code + ' ' + national;
  }

  // Strip every character matching disallowedRe from the field as it is typed or pasted.
  function filterInput(el, disallowedRe) {
    if (!el) return;
    el.addEventListener('input', function () {
      var cleaned = el.value.replace(disallowedRe, '');
      if (cleaned === el.value) return;
      var drop = el.value.length - cleaned.length;
      var caret = Math.max(0, (el.selectionStart || cleaned.length) - drop);
      el.value = cleaned;
      try { el.setSelectionRange(caret, caret); } catch (error) { /* unsupported input type */ }
    });
  }

  function setupDemoPhonePrefix(form) {
    if (!form) return;
    var country = form.querySelector('#df-country');
    var codeEl = form.querySelector('#df-phone-code');

    if (country && codeEl) {
      var syncCode = function () {
        var code = DEMO_DIAL_CODES[country.value];
        codeEl.textContent = code ? '+' + code : '';
      };
      country.addEventListener('change', syncCode);
      syncCode();
    }

    // Phone: digits and dialling punctuation only. Name: letters, spaces, - ' . only.
    filterInput(form.querySelector('#df-phone'), /[^\d\s()+-]/g);
  }

  function setStatus(el, kind, message) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('form-status--success', 'form-status--error');
    if (kind) el.classList.add('form-status--' + kind);
  }

  function isHoneypotFilled(form) {
    var gotcha = form.querySelector('[name="_gotcha"]');
    return !!(gotcha && gotcha.value);
  }

  function submissionKey(form, opts) {
    if (!opts.uniqueEmailField) return '';
    var email = fieldValue(form, opts.uniqueEmailField).toLowerCase();
    if (!email) return '';
    var hash = 2166136261;
    for (var i = 0; i < email.length; i += 1) {
      hash ^= email.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return 'anstel-form-submitted:' + opts.endpoint + ':' + (hash >>> 0).toString(16);
  }

  function wasSubmitted(key) {
    if (!key) return false;
    try { return window.localStorage.getItem(key) === '1'; }
    catch (error) { return false; }
  }

  function rememberSubmission(key) {
    if (!key) return;
    try { window.localStorage.setItem(key, '1'); }
    catch (error) { /* Server-side duplicate protection remains authoritative. */ }
  }

  function bindForm(form, opts) {
    if (!form) return;
    var statusEl = form.querySelector('.form-status');
    var submitBtn = form.querySelector('[type="submit"]');
    var idleLabel = submitBtn ? submitBtn.textContent : 'Submit';

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (isHoneypotFilled(form)) {
        setStatus(statusEl, 'success', opts.successMessage);
        form.reset();
        return;
      }

      var uniqueKey = submissionKey(form, opts);
      if (wasSubmitted(uniqueKey)) {
        setStatus(statusEl, 'error', opts.duplicateMessage);
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }
      setStatus(statusEl, '', '');

      fetch(API_BASE + opts.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts.buildBody(form))
      }).then(function (res) {
        if (!res.ok) throw new Error('REQUEST_FAILED');
        rememberSubmission(uniqueKey);
        setStatus(statusEl, 'success', opts.successMessage);
        form.reset();
      }).catch(function () {
        setStatus(statusEl, 'error', opts.errorMessage);
      }).finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = idleLabel;
        }
      });
    });
  }

  bindForm(document.getElementById('demo-form'), {
    endpoint: '/api/Contactus/Create',
    uniqueEmailField: 'df-email',
    duplicateMessage: 'This email address has already requested a demo.',
    successMessage: "Thanks — we've received your request and will be in touch within one business day.",
    errorMessage: 'Something went wrong sending your request. Please email sales@anstelglobal.com directly.',
    buildBody: function (form) {
      return {
        fullName: fieldValue(form, 'df-name'),
        workEmail: fieldValue(form, 'df-email'),
        phoneNumber: composeDemoPhone(form) || null,
        companyName: fieldValue(form, 'df-company') || null,
        country: fieldValue(form, 'df-country') || null,
        fleetSize: fieldValue(form, 'df-fleet-size') || null,
        productInterest: fieldValue(form, 'df-product') || null,
        primaryUseCase: fieldValue(form, 'df-use-case') || null,
        operations: fieldValue(form, 'df-message') || null
      };
    }
  });

  bindForm(document.getElementById('contact-form'), {
    endpoint: '/api/Contactus/SendMessage',
    uniqueEmailField: 'cf-email',
    duplicateMessage: 'This email address has already submitted the contact form.',
    successMessage: "Thanks — your message has been sent. We'll get back to you within one business day.",
    errorMessage: 'Something went wrong sending your message. Please email sales@anstelglobal.com directly.',
    buildBody: function (form) {
      return {
        fullName: fieldValue(form, 'cf-name'),
        email: fieldValue(form, 'cf-email'),
        country: fieldValue(form, 'cf-country') || null,
        reason: fieldValue(form, 'cf-reason'),
        message: fieldValue(form, 'cf-message')
      };
    }
  });

  setupDemoPhonePrefix(document.getElementById('demo-form'));

  var NON_NAME_CHAR = /[^\p{L}\p{M}\s'.-]/gu;
  filterInput(document.querySelector('#df-name'), NON_NAME_CHAR);
  filterInput(document.querySelector('#cf-name'), NON_NAME_CHAR);
})();
