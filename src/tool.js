// RELX guide: pickers, help selectors, tracking. Vanilla JS, no dependencies.
(function () {
  'use strict';

  // Events go to the site's own analytics only (dataLayer if present) plus a DOM event.
  function track(name, params) {
    params = params || {};
    try {
      if (window.dataLayer) window.dataLayer.push(Object.assign({ event: name }, params));
      document.dispatchEvent(new CustomEvent('relx:track', { detail: { name: name, params: params } }));
    } catch (e) {}
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-track]');
    if (!el) return;
    var name = el.getAttribute('data-track');
    if (name === 'buy_click') track(name, { device: el.getAttribute('data-device') });
    else if (name === 'whatsapp_click') track(name, { page: el.getAttribute('data-page') });
  });

  var checked = function (root, name) {
    var el = root.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  };

  // ---- Compare pickers ----
  var form = document.getElementById('pickers');
  if (form) {
    var HUB = '/tools/relx-device-compare';
    var order = Array.prototype.map.call(form.querySelectorAll('input[name="a"]'), function (i) { return i.value; });
    var warn = document.getElementById('same-warn');
    var result = document.getElementById('compare-result');
    var onHub = location.pathname.replace(/\/$/, '') === HUB;
    var cache = {};
    var latest = 0;

    var slugFor = function (a, b) {
      return order.indexOf(a) <= order.indexOf(b) ? a + '-vs-' + b : b + '-vs-' + a;
    };

    form.addEventListener('change', function () {
      var a = checked(form, 'a');
      var b = checked(form, 'b');
      if (!a || !b) return;
      if (a === b) {
        warn.hidden = false;
        result.hidden = true;
        return;
      }
      warn.hidden = true;
      var slug = slugFor(a, b);
      var url = HUB + '/' + slug;
      track('compare_select', { pair: slug });

      // Pair pages navigate so the H1, FAQ and links match the new pair.
      if (!onHub) {
        location.href = url;
        return;
      }
      if (result.getAttribute('data-pair') === slug) {
        result.hidden = false;
        history.replaceState(null, '', url);
        return;
      }
      var token = ++latest;
      var req = cache[url] || (cache[url] = fetch(url, { credentials: 'same-origin' }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      }));
      req.then(function (html) {
        if (token !== latest) return;
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var fresh = doc.getElementById('compare-result');
        if (!fresh) throw new Error('missing result');
        result.innerHTML = fresh.innerHTML;
        result.setAttribute('data-pair', slug);
        result.hidden = false;
        history.replaceState(null, '', url);
      }).catch(function () {
        delete cache[url];
        location.href = url;
      });
    });
  }

  // ---- Embed code copy ----
  var copyBtn = document.getElementById('embed-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var ta = document.getElementById('embed-code');
      var done = function () {
        document.getElementById('embed-copied').textContent = 'Copied.';
        track('embed_copy', {});
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); });
      } else {
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
      }
    });
  }

  // ---- Help hub: device choice is carried to the symptom page as ?device= ----
  var helpPicker = document.getElementById('help-picker');
  if (helpPicker) {
    var syms = helpPicker.querySelectorAll('a.sym');
    var updateLinks = function () {
      var d = checked(helpPicker, 'device');
      Array.prototype.forEach.call(syms, function (a) {
        var base = a.getAttribute('href').split('?')[0];
        a.setAttribute('href', d && d !== 'unsure' ? base + '?device=' + d : base);
      });
    };
    helpPicker.addEventListener('change', updateLinks);
    updateLinks();
    helpPicker.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a.sym');
      if (a) track('help_symptom', { symptom: a.getAttribute('data-symptom'), device: checked(helpPicker, 'device') || 'unsure' });
    });
  }

  // ---- Help symptom page: device selector fills in the device name ----
  var waHelp = document.getElementById('wa-help');
  var chips = document.querySelector('fieldset.chips');
  if (waHelp && chips) {
    var apply = function (push) {
      var input = chips.querySelector('input:checked');
      if (!input) return;
      var name = input.getAttribute('data-name');
      Array.prototype.forEach.call(document.querySelectorAll('[data-device]'), function (el) { el.textContent = name; });
      var base = waHelp.getAttribute('href').split('?')[0];
      var text = 'Hi, my ' + name + ' has this problem: ' + waHelp.getAttribute('data-problem') + '.';
      waHelp.setAttribute('href', base + '?text=' + encodeURIComponent(text));
      if (push) {
        var q = input.value === 'unsure' ? '' : '?device=' + input.value;
        history.replaceState(null, '', location.pathname + q);
      }
    };
    var param = new URLSearchParams(location.search).get('device');
    if (param) {
      var pre = chips.querySelector('input[value="' + param.replace(/[^a-z0-9-]/g, '') + '"]');
      if (pre) pre.checked = true;
    }
    apply(false);
    chips.addEventListener('change', function () { apply(true); });
    track('help_symptom', { symptom: location.pathname.split('/relx-').pop(), device: checked(chips, 'device') || 'unsure' });
  }
})();
