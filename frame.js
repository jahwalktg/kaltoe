/* 도구 화면(t/…) 공통 — 첫 화면 틀과 이어 주는 일
   1) 다른 도구로 가는 링크를 틀에서 열기  2) 파일을 내려받거나 인쇄하면 「뚝딱」 알림  3) 밝기 맞추기  4) 적던 것이 있는지 알리기
   5) 「▶ 움직이는 사용법」 단추  6) ?ktdemo 로 열리면 연습용(저장값은 따로, 내려받기·인쇄·복사는 흉내만) */
(function () {
  var inFrame = false, P = null, DEMO = /[?&]ktdemo=/.test(location.search);
  try { inFrame = window.parent !== window && window.parent.location.origin === location.origin; } catch (e) {}
  if (inFrame) { P = window.parent; document.documentElement.classList.add('kt-in'); }
  function say(o) { if (P) P.postMessage(Object.assign({ kt: 1, path: location.pathname }, o), location.origin); }
  var saved = null; try { saved = localStorage.getItem('kaltoe.theme'); } catch (e) {}
  if (DEMO) saved = 'light';
  if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-theme', saved);

  var last = 0;
  function done(how, name) { var n = Date.now(); if (n - last < 1500) return; last = n; say({ k: 'done', how: how, name: name || '' }); }

  if (DEMO && inFrame) {
    var mk = function () { var m = {}; return { getItem: function (k) { return k in m ? m[k] : null; }, setItem: function (k, v) { m[k] = String(v); }, removeItem: function (k) { delete m[k]; }, clear: function () { m = {}; }, key: function (i) { return Object.keys(m)[i] || null; }, get length() { return Object.keys(m).length; } }; };
    try { Object.defineProperty(window, 'localStorage', { value: mk(), configurable: true }); Object.defineProperty(window, 'sessionStorage', { value: mk(), configurable: true }); } catch (e) {}
    window.confirm = function () { return true; }; window.alert = function () {}; window.prompt = function (a, b) { return b || ''; };
    window.print = function () { done('print'); }; window.open = function () { done('print'); return null; };
    try { Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: function () { done('copy'); return Promise.resolve(); }, write: function () { done('copy'); return Promise.resolve(); } } }); } catch (e) {}
    var ex0 = document.execCommand; document.execCommand = function (c) { if (c === 'copy') { done('copy'); return true; } return ex0.apply(document, arguments); };
    window.KT_DEMO_MODE = 1;
  }

  // 내려받기: a.download를 누르는 순간, 인쇄: window.print
  var click0 = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { if (this.hasAttribute('download')) { done('file', this.download); if (DEMO) return; } return click0.apply(this, arguments); };
  var disp0 = HTMLAnchorElement.prototype.dispatchEvent;
  if (DEMO) HTMLAnchorElement.prototype.dispatchEvent = function (e) { if (e.type === 'click' && this.hasAttribute('download')) { done('file', this.download); return true; } return disp0.apply(this, arguments); };
  window.addEventListener('afterprint', function () { done('print'); });
  document.addEventListener('copy', function (e) {
    // 단추로 복사한 결과만(사람이 글을 끌어 복사한 것은 세지 않음)
    if (document.activeElement && document.activeElement.tagName === 'BUTTON') done('copy');
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    if (a.hasAttribute('download')) { done('file', a.download); if (DEMO) e.preventDefault(); return; }
    var raw = a.getAttribute('href'); if (raw.charAt(0) === '#') return;
    if (DEMO) { e.preventDefault(); return; }
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin) { if (/^http/.test(u.protocol)) { a.target = '_blank'; a.rel = 'noopener'; } return; }
    if (P && u.pathname !== location.pathname && u.protocol !== 'blob:' && u.protocol !== 'data:') { e.preventDefault(); say({ k: 'open', to: u.pathname }); }
  }, true);
  if (DEMO) return;
  var told = false;
  document.addEventListener('input', function (e) { if (!told && e.isTrusted) { told = true; say({ k: 'dirty' }); } }, true);
  document.addEventListener('change', function (e) { if (!told && e.target.type === 'file') { told = true; say({ k: 'dirty' }); } }, true);

  /* 「▶ 움직이는 사용법」 — 가상 예시 단추 옆(없는 도구는 머리 줄)에 */
  function how() {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'kt-how'; b.textContent = '▶ 움직이는 사용법'; b.title = '커서가 움직이며 쓰는 법을 보여 주는 창을 따로 엽니다';
    b.addEventListener('click', function () { try { P.KT_DEMO(location.pathname); } catch (e) {} }); return b;
  }
  function mount(n) {
    if (!P || typeof P.KT_DEMO !== 'function' || document.querySelector('.kt-how')) return;
    var s = document.querySelector('.jt-sample');
    if (s) { var c = s.querySelector('.jt-clear') || s.querySelector('button'); c.insertAdjacentElement('afterend', how()); return; }
    if (n < 8) { setTimeout(function () { mount(n + 1); }, 150); return; }
    var top = document.querySelector('#top, header.top, .hero'), h = document.querySelector('h1');
    if (top) top.appendChild(how()); else if (h) h.insertAdjacentElement('afterend', how());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(0); }); else mount(0);
})();
