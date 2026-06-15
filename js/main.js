/* ============================================================
 * main.js  -  Shared UI interactions + event log panel
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- Toast helper ---------- */
  function toast(msg, dur) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 300);
    }, dur || 2400);
  }
  window.toast = toast;

  /* ---------- Tracking log panel ---------- */
  function buildPanel() {
    if (document.getElementById('track-panel')) return;
    var panel = document.createElement('div');
    panel.id = 'track-panel';
    panel.innerHTML =
      '<div class="track-head">' +
        '<strong><span class="dot"></span>埋码事件 / Events</strong>' +
        '<div class="track-actions">' +
          '<button id="track-clear">清空</button>' +
          '<button id="track-toggle">收起</button>' +
        '</div>' +
      '</div>' +
      '<div id="track-log"></div>';
    document.body.appendChild(panel);

    var log = panel.querySelector('#track-log');
    function fmt(e) {
      var div = document.createElement('div');
      div.className = 'track-entry ' + (e.type === 'page_view' ? 'pv' : (e.type === 'conversion' ? 'conv' : ''));
      var t = new Date(e.timestamp).toTimeString().slice(0, 8);
      var dataStr = e.payload && Object.keys(e.payload).length
        ? JSON.stringify(e.payload) : '';
      div.innerHTML =
        '<span class="te-time">' + t + '</span>' +
        '<span class="te-platform">' + e.type + '</span>' +
        '<span class="te-event">' + (e.payload.event || '') + '</span>' +
        (dataStr ? '<span class="te-data">' + dataStr + '</span>' : '');
      return div;
    }
    window.Tracker.on(function (e) {
      log.appendChild(fmt(e));
      log.scrollTop = log.scrollHeight;
    });

    panel.querySelector('.track-head').addEventListener('click', function (ev) {
      if (ev.target.tagName === 'BUTTON') return;
      panel.classList.toggle('collapsed');
      panel.querySelector('#track-toggle').textContent =
        panel.classList.contains('collapsed') ? '展开' : '收起';
    });
    panel.querySelector('#track-clear').addEventListener('click', function () {
      log.innerHTML = '';
      window.Tracker.event('panel_cleared');
    });
  }

  /* ---------- FAQ accordion (support page) ---------- */
  function bindFaq() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  /* ---------- Buy form ---------- */
  function bindBuyForm() {
    var form = document.getElementById('buy-form');
    if (!form) return;
    var variant = form.querySelector('[name="variant"]');
    var colorInput = form.querySelector('[name="color"]');
    var priceEl = document.getElementById('price-display');
    var prices = { 8: 3999, 12: 4499, 16: 4999 };
    function updatePrice() {
      if (!priceEl) return;
      priceEl.textContent = '¥' + prices[variant.value].toLocaleString();
    }
    variant && variant.addEventListener('change', function () {
      updatePrice();
      window.Tracker.event('select_variant', {
        variant: variant.value,
        color: colorInput ? colorInput.value : null,
        value: prices[variant.value]
      });
    });
    document.querySelectorAll('.color-dot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        document.querySelectorAll('.color-dot').forEach(function (d) { d.classList.remove('active'); });
        dot.classList.add('active');
        if (colorInput) colorInput.value = dot.dataset.color;
        window.Tracker.event('select_color', { color: dot.dataset.color });
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = Object.fromEntries(new FormData(form).entries());
      window.Tracker.conversion('purchase_submit', prices[variant.value], {
        variant: data.variant,
        color: data.color,
        quantity: data.quantity
      });
      toast('已提交预订！订单号: X' + Math.floor(Math.random() * 1e8));
    });
  }

  /* ---------- Theme color dots on product page ---------- */
  function bindColorPreview() {
    document.querySelectorAll('.color-dot[data-preview]').forEach(function (dot) {
      dot.addEventListener('click', function () {
        document.querySelectorAll('.color-dot[data-preview]').forEach(function (d) { d.classList.remove('active'); });
        dot.classList.add('active');
        var phone = document.querySelector('.phone-mock');
        if (phone) phone.style.background = dot.dataset.preview;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildPanel();
    bindFaq();
    bindBuyForm();
    bindColorPreview();
  });
})();