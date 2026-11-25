/* 도구 화면(t/…) 공통 — 첫 화면 틀과 이어 주는 일
   1) 다른 도구로 가는 링크를 틀에서 열기  2) 파일을 내려받거나 인쇄하면 「뚝딱」 알림  3) 밝기 맞추기  4) 적던 것이 있는지 알리기 */
(function () {
  var inFrame = false, P = null;
  try { inFrame = window.parent !== window && window.parent.location.origin === location.origin; } catch (e) {}
  if (inFrame) { P = window.parent; document.documentElement.classList.add('kt-in'); }
  function say(o) { if (P) P.postMessage(Object.assign({ kt: 1, path: location.pathname }, o), location.origin); }
  var saved = null; try { saved = localStorage.getItem('kaltoe.theme'); } catch (e) {}
  if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-theme', saved);

  // 내려받기: a.download를 누르는 순간, 인쇄: window.print
  var last = 0;
  function done(how) { var n = Date.now(); if (n - last < 1500) return; last = n; say({ k: 'done', how: how }); }
  var click0 = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { if (this.hasAttribute('download')) done('file'); return click0.apply(this, arguments); };
  window.addEventListener('afterprint', function () { done('print'); });
  document.addEventListener('copy', function (e) {
    // 단추로 복사한 결과만(사람이 글을 끌어 복사한 것은 세지 않음)
    if (document.activeElement && document.activeElement.tagName === 'BUTTON') done('copy');
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    if (a.hasAttribute('download')) { done('file'); return; }
    var raw = a.getAttribute('href'); if (raw.charAt(0) === '#') return;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin) { if (/^http/.test(u.protocol)) { a.target = '_blank'; a.rel = 'noopener'; } return; }
    if (P && u.pathname !== location.pathname && u.protocol !== 'blob:' && u.protocol !== 'data:') { e.preventDefault(); say({ k: 'open', to: u.pathname }); }
  }, true);
  var told = false;
  document.addEventListener('input', function (e) { if (!told && e.isTrusted) { told = true; say({ k: 'dirty' }); } }, true);
  document.addEventListener('change', function (e) { if (!told && e.target.type === 'file') { told = true; say({ k: 'dirty' }); } }, true);
})();
