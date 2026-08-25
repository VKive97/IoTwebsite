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

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      setStatus(statusEl, '', '');

      fetch(API_BASE + opts.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts.buildBody(form))
      }).then(function (res) {
        if (!res.ok) throw new Error('REQUEST_FAILED');
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
    successMessage: 'Thanks — we’ve received your request and will be in touch within one business day.',
    errorMessage: 'Something went wrong sending your request. Please email sales@anstelglobal.com directly.',
    buildBody: function (form) {
      return {
        fullName: fieldValue(form, 'df-name'),
        workEmail: fieldValue(form, 'df-email'),
        phoneNumber: fieldValue(form, 'df-phone') || null,
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
    successMessage: 'Thanks — your message has been sent. We’ll get back to you within one business day.',
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
})();
