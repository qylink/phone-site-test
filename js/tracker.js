/* ============================================================
 * tracker.js  -  Unified tracking SDK (mock multi-platform pixel)
 * Simulates GA4 / Facebook Pixel / TikTok Pixel / Baidu Tongji.
 * All events are dispatched + logged to the on-page event panel.
 * Real deployment: replace the platform adapter bodies with the
 * actual SDK calls (gtag, fbq, ttq, _hmt).
 * ============================================================ */
(function (global) {
  'use strict';

  var CONFIG = {
    enableGA4: true,
    enableFB: true,
    enableTikTok: true,
    enableBaidu: true,
    debug: true,
    sendInterval: 0
  };

  var listeners = [];
  function emit(evt) {
    listeners.forEach(function (fn) { try { fn(evt); } catch (e) {} });
    if (CONFIG.debug && global.console) {
      console.log('%c[track]', 'color:#ff6700;font-weight:bold', evt);
    }
  }

  function makeEvent(type, payload) {
    return {
      type: type,
      timestamp: new Date().toISOString(),
      page: location.pathname,
      ref: document.referrer || '(direct)',
      sessionId: getSessionId(),
      payload: payload || {}
    };
  }

  var _sid = null;
  function getSessionId() {
    if (_sid) return _sid;
    _sid = sessionStorage.getItem('_sid');
    if (!_sid) {
      _sid = 's_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      sessionStorage.setItem('_sid', _sid);
    }
    return _sid;
  }

  // ---- platform adapters (mock) ----
  var platforms = {
    ga4: {
      name: 'GA4',
      pageView: function (p) { /* window.gtag('event','page_view',{page_location:p}) */ },
      event: function (name, params) { /* window.gtag('event', name, params) */ }
    },
    fb: {
      name: 'FB Pixel',
      pageView: function () { /* window.fbq('track','PageView') */ },
      event: function (name, params) { /* window.fbq('trackCustom', name, params) */ }
    },
    tiktok: {
      name: 'TikTok',
      pageView: function () { /* window.ttq.page() */ },
      event: function (name, params) { /* window.ttq.track(name, params) */ }
    },
    baidu: {
      name: 'Baidu',
      pageView: function (p) { /* _hmt.push(['_trackPageview', p]) */ },
      event: function (name, params) { /* _hmt.push(['_trackEvent', name, params]) */ }
    }
  };

  function dispatch(evt) {
    Object.keys(platforms).forEach(function (k) {
      if (!CONFIG['enable' + ({ga4:'GA4',fb:'FB',tiktok:'TikTok',baidu:'Baidu'})[k]]) return;
      var p = platforms[k];
      if (evt.type === 'page_view') p.pageView(evt.page);
      else p.event(evt.payload.event || evt.type, evt.payload);
    });
    emit(evt);
  }

  // ---- public API ----
  var tracker = {
    init: function (opts) { Object.assign(CONFIG, opts || {}); },
    on: function (fn) { listeners.push(fn); },
    pageView: function (extra) {
      dispatch(makeEvent('page_view', Object.assign({ page_title: document.title }, extra || {})));
    },
    event: function (name, params) {
      dispatch(makeEvent('event', Object.assign({ event: name }, params || {})));
    },
    conversion: function (name, value, params) {
      dispatch(makeEvent('conversion', Object.assign({
        event: name, value: value, currency: 'CNY'
      }, params || {})));
    },
    identify: function (uid, traits) {
      dispatch(makeEvent('identify', { user_id: uid, traits: traits || {} }));
    }
  };

  // auto-bind data-event-* attributes on every interactive element
  function bindDataEvents() {
    var selector = '[data-event]';
    document.addEventListener('click', function (e) {
      var el = e.target.closest(selector);
      if (!el) return;
      var payload = {
        event: el.getAttribute('data-event'),
        category: el.getAttribute('data-event-cat') || 'click',
        action: el.getAttribute('data-event-act') || el.tagName.toLowerCase(),
        label: el.getAttribute('data-event-label') || el.textContent.trim().slice(0, 50),
        value: parseFloat(el.getAttribute('data-event-value')) || 0,
        href: el.getAttribute('href') || null,
        id: el.id || null,
        position: el.getAttribute('data-event-pos') || null
      };
      tracker.event(payload.event, payload);
    });
  }

  // ---- UTM capture ----
  function captureUtm() {
    var params = new URLSearchParams(location.search);
    var utm = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(function (k) {
      if (params.get(k)) utm[k] = params.get(k);
    });
    if (Object.keys(utm).length) tracker.event('utm_capture', utm);
  }

  // ---- scroll depth ----
  function bindScrollDepth() {
    var marks = [25, 50, 75, 100];
    var fired = {};
    function check() {
      var h = document.documentElement;
      var pct = Math.round(((h.scrollTop || document.body.scrollTop) + window.innerHeight) /
                           h.scrollHeight * 100);
      marks.forEach(function (m) {
        if (pct >= m && !fired[m]) {
          fired[m] = true;
          tracker.event('scroll_depth', { percent: m });
        }
      });
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(function () { check(); ticking = false; }); ticking = true; }
    });
  }

  // ---- dwell time ----
  var startTs = Date.now();
  function flushDwell() {
    var ms = Date.now() - startTs;
    if (ms > 3000) tracker.event('page_dwell', { ms: ms });
  }
  window.addEventListener('beforeunload', flushDwell);
  window.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flushDwell();
  });

  // boot
  document.addEventListener('DOMContentLoaded', function () {
    captureUtm();
    bindDataEvents();
    bindScrollDepth();
    tracker.pageView();
  });

  global.Tracker = tracker;
})(window);