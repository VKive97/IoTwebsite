/* Wires #demo-form (/demo/) and #contact-form (/company/contact/) to the
   same-origin API route provided by the local development server. */
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

  /* The Contactus API only accepts its own product / use-case names (see
     /api/Contactus/Getproductinterests and /GetPrimaryUseCases) and returns 400
     for anything else. The form shows the current website names, so translate
     them here. Labels that already match the API pass through unchanged. */
  var API_PRODUCT_NAMES = {
    'Patrol Connect': 'Security Monitor',
    'Security Monitor': 'Security Monitor',
    'Connected Monitor': 'IoT',
    'IoT Monitoring': 'IoT',
    'Autonautics Merchant': 'Merchant'
  };
  var API_USE_CASE_NAMES = {
    'Driver Safety & AI-Camera': 'Driver Safety & Video Telematics',
    'Other': 'Not Sure Yet'
  };

  function apiName(map, value) {
    return value ? (map[value] || value) : null;
  }

  /* National-number format per country (digits after the dial code, without a
     leading trunk "0"). Used to validate the demo form's phone field. */
  var DEMO_PHONE_RULES = {
    Australia: { re: /^[23478]\d{8}$/, example: '000 000 000', message: 'Enter a valid Australian number: 9 digits, e.g. 412 345 678 or 2 9416 0444.' },
    India: { re: /^[1-9]\d{9}$/, example: '00000 00000', message: 'Enter a valid Indian number: 10 digits, e.g. 96675 39207.' },
    Fiji: { re: /^\d{7}$/, example: '000 0000', message: 'Enter a valid Fiji number: 7 digits, e.g. 999 1234.' },
    'Papua New Guinea': { re: /^\d{7,8}$/, example: '0000 0000', message: 'Enter a valid Papua New Guinea number: 7 or 8 digits, e.g. 7123 4567.' },
    'New Zealand': { re: /^[2-9]\d{7,9}$/, example: '00 000 0000', message: 'Enter a valid New Zealand number: 8 to 10 digits, e.g. 21 123 4567.' }
  };
  var OTHER_PHONE_RULE = { re: /^\d{6,15}$/, example: '000000', message: 'Enter a valid phone number: 6 to 15 digits.' };

  /* The digits after the dial code. Accepts what people naturally type: spaces,
     brackets, a leading 0 (0412 345 678) or the country code (+61 412 345 678). */
  function demoNationalNumber(form) {
    var digits = (fieldValue(form, 'df-phone') || '').replace(/\D/g, '');
    var country = fieldValue(form, 'df-country');
    var code = DEMO_DIAL_CODES[country] || '';
    var rule = DEMO_PHONE_RULES[country];
    var national = digits.replace(/^0+/, '');
    if (code && rule && !rule.re.test(national) && national.indexOf(code) === 0) {
      var stripped = national.slice(code.length).replace(/^0+/, '');
      if (rule.re.test(stripped)) national = stripped;
    }
    return national;
  }

  function composeDemoPhone(form) {
    var national = demoNationalNumber(form);
    if (!national) return '';
    var code = DEMO_DIAL_CODES[fieldValue(form, 'df-country')] || '';
    return code ? code + ' ' + national : national;
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

    var phone = form.querySelector('#df-phone');

    // Country-specific check. Shown by the browser's own validation bubble when
    // the form is submitted, and cleared as soon as the number becomes valid.
    var validatePhone = function () {
      if (!phone || !country) return;
      var rule = DEMO_PHONE_RULES[country.value] || OTHER_PHONE_RULE;
      var national = demoNationalNumber(form);
      phone.setCustomValidity(!national || rule.re.test(national) ? '' : rule.message);
    };

    if (country) {
      var syncCountry = function () {
        var code = DEMO_DIAL_CODES[country.value];
        if (codeEl) codeEl.textContent = code ? '+' + code : '';
        if (phone) phone.placeholder = (DEMO_PHONE_RULES[country.value] || OTHER_PHONE_RULE).example;
        validatePhone();
      };
      country.addEventListener('change', function () {
        syncCountry();
        if (phone && phone.value) phone.reportValidity();
      });
      // form.reset() after a successful submit puts the country back to its
      // default without firing "change", which left the previous country's dial
      // code and placeholder showing. Re-sync once the reset has been applied.
      form.addEventListener('reset', function () { setTimeout(syncCountry, 0); });
      syncCountry();
    }

    // Phone: digits and dialling punctuation only. Name: letters, spaces, - ' . only.
    filterInput(phone, /[^\d\s()+-]/g);
    // Capture phase so it runs before the submit handler checks validity
    // (covers browser autofill, which doesn't always fire "input").
    form.addEventListener('submit', validatePhone, true);
    if (phone) {
      phone.addEventListener('input', validatePhone);
      phone.addEventListener('blur', function () {
        validatePhone();
        if (phone.value) phone.reportValidity();
      });
    }
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

  /* Every submission is also emailed to the support inbox through FormSubmit
     (https://formsubmit.co) — a free form-to-email relay that needs no API key
     and no backend change. ONE-TIME SETUP: the first submission makes FormSubmit
     send an activation email to this address; click "Activate Form" in it.
     After that, FormSubmit's email also offers a random alias that can replace
     the address below so it isn't visible in this file. */
  var NOTIFY_EMAIL_ENDPOINT = 'https://formsubmit.co/ajax/support@anstelglobal.com';

  /* ── Abuse / injection safeguards ─────────────────────────────────────────
     - Values are trimmed, length-capped and stripped of control characters
       before they go anywhere; one-line fields (and the email subject) also
       lose line breaks, so nothing can be smuggled into email headers.
     - "_honey" is FormSubmit's own spam trap; the page's hidden "_gotcha"
       field is copied into it, so a bot that fills it is dropped there too.
     - Bots that submit faster than a person can type, or that hammer the
       button, are silently ignored (see MIN_FILL_MS / RESUBMIT_COOLDOWN_MS).
     - Only plain values are sent: no _next redirect, no autoresponse, no
       file uploads, so the relay can't be turned into an open mailer. */
  var FIELD_LIMITS = { line: 200, text: 3000, subject: 120 };
  var MIN_FILL_MS = 3000;            // a human needs at least this long
  var RESUBMIT_COOLDOWN_MS = 30000;  // one submission per form per 30 s

  function cleanLine(value, max) {
    return String(value || '')
      .replace(/[\p{Cc}\p{Zl}\p{Zp}]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, max || FIELD_LIMITS.line);
  }

  function cleanText(value, max) {
    return String(value || '')
      .replace(/\r\n?/g, '\n')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]+/g, '')
      .replace(/\n{4,}/g, '\n\n\n')
      .trim()
      .slice(0, max || FIELD_LIMITS.text);
  }

  // Applies cleanLine/cleanText to every value of an email payload.
  function cleanEmailFields(fields) {
    var out = {};
    Object.keys(fields).forEach(function (key) {
      var multiline = key === 'message' || key === 'about_their_operation';
      out[key] = key === '_subject'
        ? cleanLine(fields[key], FIELD_LIMITS.subject)
        : (multiline ? cleanText(fields[key]) : cleanLine(fields[key]));
    });
    return out;
  }

  function cooldownKey(form) { return 'anstel-form-cooldown:' + (form.id || 'form'); }

  function inCooldown(form) {
    try {
      var last = Number(window.sessionStorage.getItem(cooldownKey(form)) || 0);
      return last && Date.now() - last < RESUBMIT_COOLDOWN_MS;
    } catch (error) { return false; }
  }

  function startCooldown(form) {
    try { window.sessionStorage.setItem(cooldownKey(form), String(Date.now())); }
    catch (error) { /* storage unavailable — the relay's own limits still apply */ }
  }

  // Resolves true if the email relay accepted the message, false otherwise.
  function sendNotificationEmail(fields, honeypotValue) {
    if (!fields) return Promise.resolve(false);
    var payload = cleanEmailFields(fields);
    payload._honey = honeypotValue || '';
    return fetch(NOTIFY_EMAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'omit',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        var ok = res.ok && String(data.success) === 'true';
        if (!ok) console.error('Notification email not sent:', res.status, data.message || data);
        return ok;
      });
    }).catch(function (error) {
      console.error('Notification email not sent:', error);
      return false;
    });
  }

  function bindForm(form, opts) {
    if (!form) return;
    var statusEl = form.querySelector('.form-status');
    var submitBtn = form.querySelector('[type="submit"]');
    var idleLabel = submitBtn ? submitBtn.textContent : 'Submit';
    var loadedAt = Date.now();
    var sending = false;

    // Once someone starts filling the form in again, the previous
    // "Thanks..." / error line no longer applies.
    var clearStatus = function () {
      if (statusEl && statusEl.textContent) setStatus(statusEl, '', '');
    };
    form.addEventListener('input', clearStatus);
    form.addEventListener('change', clearStatus);

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        setStatus(statusEl, '', '');
        form.reportValidity();
        return;
      }

      if (sending) return; // ignore double-clicks while a request is in flight

      // Bots: hidden field filled, or submitted faster than a person can type.
      // Pretend it worked so they get no signal, but send nothing anywhere.
      if (isHoneypotFilled(form) || Date.now() - loadedAt < MIN_FILL_MS) {
        setStatus(statusEl, 'success', opts.successMessage);
        form.reset();
        return;
      }

      if (inCooldown(form)) {
        setStatus(statusEl, 'error', 'Please wait a moment before sending another request.');
        return;
      }

      var uniqueKey = submissionKey(form, opts);
      if (wasSubmitted(uniqueKey)) {
        setStatus(statusEl, 'error', opts.duplicateMessage);
        return;
      }

      sending = true;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }
      setStatus(statusEl, '', '');

      // Read the values now: the form is reset as soon as it succeeds.
      var apiBody = opts.buildBody(form);
      var emailBody = opts.buildEmail ? opts.buildEmail(form) : null;
      var gotcha = form.querySelector('[name="_gotcha"]');
      var honeypotValue = gotcha ? gotcha.value : '';
      Object.keys(apiBody).forEach(function (key) {
        if (typeof apiBody[key] !== 'string') return;
        apiBody[key] = (key === 'message' || key === 'operations')
          ? cleanText(apiBody[key])
          : cleanLine(apiBody[key], key === 'fullName' ? 150 : FIELD_LIMITS.line);
      });

      // 1) Save to the Contactus API. Resolves to 'saved', 'duplicate' or
      //    'unavailable' (API down, or not reachable — e.g. the LAN-only API
      //    from the public HTTPS site).
      var saveToApi = fetch(API_BASE + opts.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiBody)
      }).then(function (res) {
        if (res.ok) return 'saved';
        // The API answers a repeat email with HTTP 400 and a plain-text body:
        // SendMessage says "...has already been submitted...", while Create
        // only says "Something went wrong". Field-validation failures come back
        // as a JSON problem document instead, so those are not mistaken for it.
        return res.text().then(function (body) {
          body = body || '';
          var isValidationProblem = /^\s*\{/.test(body) && /"errors"/.test(body);
          var isDuplicate = res.status === 400 && !isValidationProblem &&
            (/already/i.test(body) || opts.plainBadRequestIsDuplicate);
          if (isDuplicate) return 'duplicate';
          console.error('Contactus API rejected the form: HTTP ' + res.status + ': ' + body);
          return 'unavailable';
        });
      }).catch(function (error) {
        console.error('Contactus API not reachable:', error);
        return 'unavailable';
      });

      // 2) Email the details to the support inbox (skipped for a repeat email).
      saveToApi.then(function (apiResult) {
        if (apiResult === 'duplicate') return { apiResult: apiResult, emailed: false };
        return sendNotificationEmail(emailBody, honeypotValue).then(function (emailed) {
          return { apiResult: apiResult, emailed: emailed };
        });
      }).then(function (result) {
        if (result.apiResult === 'duplicate') {
          rememberSubmission(uniqueKey);
          setStatus(statusEl, 'error', opts.duplicateMessage);
          return;
        }
        // Delivered if either the API saved it or the email went out.
        if (result.apiResult === 'saved' || result.emailed) {
          rememberSubmission(uniqueKey);
          startCooldown(form);
          setStatus(statusEl, 'success', opts.successMessage);
          form.reset();
          return;
        }
        setStatus(statusEl, 'error', opts.errorMessage);
      }).finally(function () {
        sending = false;
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
    // Create returns a bare 400 "Something went wrong" for an email that has
    // already requested a demo (the field values themselves are checked and
    // mapped to the API's names before sending).
    plainBadRequestIsDuplicate: true,
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
        productInterest: apiName(API_PRODUCT_NAMES, fieldValue(form, 'df-product')),
        primaryUseCase: apiName(API_USE_CASE_NAMES, fieldValue(form, 'df-use-case')),
        operations: fieldValue(form, 'df-message') || null
      };
    },
    buildEmail: function (form) {
      var code = DEMO_DIAL_CODES[fieldValue(form, 'df-country')];
      var national = demoNationalNumber(form);
      return {
        _subject: 'New demo request — ' + fieldValue(form, 'df-name') + ' (' + (fieldValue(form, 'df-company') || 'no company') + ')',
        _template: 'table',
        _captcha: 'false',
        _replyto: fieldValue(form, 'df-email'),
        form: 'Request a Demo (anstelglobal.com/demo/)',
        name: fieldValue(form, 'df-name'),
        email: fieldValue(form, 'df-email'),
        phone: national ? (code ? '+' + code + ' ' : '') + national : '',
        company: fieldValue(form, 'df-company'),
        country: fieldValue(form, 'df-country'),
        fleet_size: fieldValue(form, 'df-fleet-size'),
        product_interest: fieldValue(form, 'df-product'),
        wants_to_improve: fieldValue(form, 'df-use-case'),
        about_their_operation: fieldValue(form, 'df-message') || '—'
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
        reason: fieldValue(form, 'cf-reason'),
        message: fieldValue(form, 'cf-message')
      };
    },
    buildEmail: function (form) {
      return {
        _subject: 'New contact message (' + fieldValue(form, 'cf-reason') + ') — ' + fieldValue(form, 'cf-name'),
        _template: 'table',
        _captcha: 'false',
        _replyto: fieldValue(form, 'cf-email'),
        form: 'Contact Us (anstelglobal.com/company/contact/)',
        name: fieldValue(form, 'cf-name'),
        email: fieldValue(form, 'cf-email'),
        country: fieldValue(form, 'cf-country'),
        how_can_we_help: fieldValue(form, 'cf-reason'),
        message: fieldValue(form, 'cf-message')
      };
    }
  });

  setupDemoPhonePrefix(document.getElementById('demo-form'));

  var NON_NAME_CHAR = /[^\p{L}\p{M}\s'.-]/gu;
  filterInput(document.querySelector('#df-name'), NON_NAME_CHAR);
  filterInput(document.querySelector('#cf-name'), NON_NAME_CHAR);
})();
