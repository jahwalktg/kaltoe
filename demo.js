/* 움직이는 사용법 — 연습용으로 연 실제 도구 화면 위에서 커서가 움직이고 글자가 들어간다. 대본은 demos.js.
   한 단계를 보여 준 뒤 멈추고 「다음 ▶」을 기다린다(이어서 재생을 켜면 저절로). 이전은 처음부터 그 단계까지 빠르게 다시 채운다.
   도구 화면은 ?ktdemo 로 열어 저장값·내려받기·인쇄·복사를 막는다(frame.js). */
(function () {
  'use strict';
  var $ = function (i) { return document.getElementById(i); };
  var id = new URLSearchParams(location.search).get('id'), T = null, steps = [], at = -1, run = 0, fast = false, busy = false, W = 1120, sc = 1;
  window.KT_CATS.forEach(function (c) { c.tools.forEach(function (t) { if (t.id === id) T = t; }); });
  var fr = $('fr'), cur = $('cur'), ring = $('ring'), key = $('key'), scene = $('scene'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.KT_MISS = [];
  if (!T || !window.KT_DEMOS[id]) { $('cap').textContent = '이 도구의 움직이는 사용법을 찾지 못했어요.'; return; }
  document.title = T.t + ' 사용법 — 칼퇴용 뚝딱 사무도구';
  $('dmT').textContent = T.t; $('dmIcon').replaceWith(window.KT_ICON(id));
  steps = [['<b>이럴 때 쓰면 좋아요</b> — ' + T.w, ['card']]].concat(window.KT_DEMOS[id], [['끝! 이제 <b>내 것으로</b> 해 보세요. 창을 나란히 두고 보면서 따라 해도 좋아요.', ['card', 1]]]);

  function fit() {
    var s = $('stage'), w = s.clientWidth, h = s.clientHeight; sc = Math.min(1.25, w / W);
    var f = $('fit'); f.style.width = (w / sc) + 'px'; f.style.height = (h / sc) + 'px'; f.style.transform = 'scale(' + sc + ')';
  }
  window.addEventListener('resize', function () { fit(); ring.hidden = true; });
  function wait(ms, my) { return new Promise(function (ok, no) { setTimeout(function () { my !== run ? no('stop') : ok(); }, fast ? Math.min(ms, 15) : reduce ? Math.min(ms, 350) : ms); }); }
  function real(ms, my) { return new Promise(function (ok, no) { setTimeout(function () { my !== run ? no('stop') : ok(); }, ms); }); }

  /* 고르기: CSS · 「=글」 단추 글 · 「L:글」 이름표 안의 칸 · 「H:글」 그 제목이 든 묶음 · 뒤에 「::n」은 n번째(0부터) */
  function norm(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function seen(e) { return !!(e.offsetParent || e.getClientRects().length); }
  function q(sel) {
    var d = fr.contentDocument, n = 0, m = sel.match(/^(.*)::(\d+)$/), a; if (m) { sel = m[1]; n = +m[2]; }
    if (sel.charAt(0) === '=') { var t = sel.slice(1); a = [].slice.call(d.querySelectorAll('button,a,summary,label.btn,[role=button]')).filter(function (e) { return seen(e) && norm(e.textContent).indexOf(t) >= 0; }); }
    else if (sel.slice(0, 2) === 'L:') { var l = sel.slice(2); a = []; d.querySelectorAll('label').forEach(function (e) { if (seen(e) && norm(e.textContent).indexOf(l) >= 0) { var i = e.querySelector('input,textarea,select') || (e.htmlFor && d.getElementById(e.htmlFor)); if (i) a.push(i); } }); }
    else if (sel.slice(0, 2) === 'H:') { var h = sel.slice(2); a = [].slice.call(d.querySelectorAll('h2,h3,legend,summary')).filter(function (e) { return seen(e) && norm(e.textContent).indexOf(h) >= 0; }).map(function (e) { return e.closest('section,.panel,.card,fieldset,details') || e; }); }
    else if (sel.slice(0, 2) === 'P:') { var p = sel.slice(2); a = [].slice.call(d.querySelectorAll('h2,h3')).filter(function (e) { return seen(e) && norm(e.textContent).indexOf(p) >= 0; }).map(function (e) { return e.parentElement; }); }
    else a = [].slice.call(d.querySelectorAll(sel)).filter(seen);
    return a[n] || null;
  }
  async function find(sel, my, ms) {
    for (var i = 0, n = (ms || 4000) / 100; i < n; i++) { var e = q(sel); if (e) return e; await real(100, my); }
    window.KT_MISS.push(at + ': ' + sel); console.warn('[사용법] 못 찾음', id, at, sel); return null;
  }
  function rect(e) { var r = e.getBoundingClientRect(); return { x: r.left * sc, y: r.top * sc, w: r.width * sc, h: r.height * sc }; }
  async function show(e, my) {
    var w = fr.contentWindow, r = e.getBoundingClientRect(), H = w.innerHeight;
    if (r.top < 40 || r.bottom > H - 40) { e.scrollIntoView({ behavior: fast || reduce ? 'auto' : 'smooth', block: r.height > H * .8 ? 'start' : 'center' }); if (!fast) { var y = NaN; for (var i = 0; i < 16; i++) { await real(120, my); var n = e.getBoundingClientRect().top; if (Math.abs(n - y) < 1 && i > 1) break; y = n; } } }
    else await wait(60, my);
  }
  /* 강조 테두리: 화면이 움직여도 따라감 */
  var ringEl = null;
  function putRing() {
    if (!ringEl || !ringEl.isConnected) { ring.hidden = true; return; }
    var r = rect(ringEl), S = $('stage'), m = 6, t = Math.max(4, r.y - m), b = Math.min(S.clientHeight - 4, r.y + r.h + m), l = Math.max(4, r.x - m), g = Math.min(S.clientWidth - 4, r.x + r.w + m);
    if (b - t < 12 || g - l < 12) { ring.hidden = true; return; }
    ring.hidden = false; ring.style.cssText = 'left:' + l + 'px;top:' + t + 'px;width:' + (g - l) + 'px;height:' + (b - t) + 'px';
  }
  setInterval(function () { if (!ring.hidden) putRing(); }, 200);
  function place(x, y) { cur.hidden = false; cur.style.transform = 'translate(' + Math.round(x - 6) + 'px,' + Math.round(y - 3) + 'px)'; }
  async function move(e, my) { await show(e, my); if (fast) return; var r = rect(e); place(r.x + Math.min(r.w * .5, 90), r.y + Math.min(r.h * .55, 60)); await wait(800, my); }
  function ping(e) { if (fast) return; var r = rect(e), c = document.createElement('div'); c.className = 'dmclick'; c.style.left = (r.x + Math.min(r.w * .5, 90)) + 'px'; c.style.top = (r.y + Math.min(r.h * .55, 60)) + 'px'; $('stage').append(c); setTimeout(function () { c.remove(); }, 650); }
  function fire(e, n) { e.dispatchEvent(new (fr.contentWindow.Event)(n, { bubbles: true })); }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function win(title, lines) {
    scene.hidden = false;
    scene.innerHTML = '<div class="scw"><div class="scb"><i></i><i></i><i></i>' + esc(title) + '</div><div class="scc">' + lines.map(function (l, i) { return '<div class="ln" style="animation-delay:' + (i * .35) + 's">' + esc(l) + '</div>'; }).join('') + '</div></div>';
  }
  var A = {
    card: async function (my, end) {
      cur.hidden = ring.hidden = true; scene.hidden = false;
      var w = document.createElement('div'); w.className = 'scw sccard'; var x = document.createElement('div');
      x.innerHTML = end ? '<em>수고하셨어요</em><b>' + esc(T.t) + '</b><p>원래 창에서 「🧪 가상 예시」를 눌러 먼저 만져 보거나, 내 자료로 바로 시작하세요.</p>' : '<em>이럴 때 쓰면 좋아요</em><b>' + esc(T.t) + '</b><p>' + esc(T.w) + '</p>';
      w.append(window.KT_ICON(id), x); scene.replaceChildren(w); await wait(400, my);
    },
    move: async function (my, s) { var e = await find(s, my); if (e) await move(e, my); },
    show: async function (my, s) { var e = await find(s, my); if (e) { await show(e, my); await wait(500, my); } },
    ring: async function (my, s) { var e = await find(s, my, 8000); if (!e) return; await show(e, my); if (fast) return; ringEl = e; putRing(); await wait(1500, my); },
    click: async function (my, s) { var e = await find(s, my, 8000); if (!e) return; ring.hidden = true; await move(e, my); ping(e); await wait(180, my); if (e.tagName === 'INPUT' && e.type === 'radio' || e.type === 'checkbox') e.click(); else e.click(); await (fast ? real(60, my) : wait(700, my)); },
    type: async function (my, s, text) {
      var e = await find(s, my); if (!e) return; ring.hidden = true; await move(e, my); ping(e); e.value = ''; text = String(text);
      var n = text.length, k = fast || reduce ? n : n > 60 ? 4 : n > 25 ? 2 : 1;
      if (e.type === 'date' || e.type === 'time' || e.type === 'number') k = n;
      for (var i = 0; i < n; i += k) { e.value = text.slice(0, i + k); if (!/date|time|number/.test(e.type)) fire(e, 'input'); await wait(55, my); }
      e.value = text; fire(e, 'input'); fire(e, 'change'); await wait(450, my);
    },
    paste: async function (my, s, text) {
      var e = await find(s, my); if (!e) return; ring.hidden = true; await move(e, my); ping(e);
      if (!fast) { var r = rect(e); key.hidden = false; key.textContent = 'Ctrl + V'; key.style.left = (r.x + Math.min(r.w * .5, 160)) + 'px'; key.style.top = (r.y + Math.min(r.h * .5, 80)) + 'px'; await wait(800, my); key.hidden = true; }
      e.value = text; fire(e, 'input'); fire(e, 'change'); await wait(900, my);
    },
    set: async function (my, s, v) { var e = await find(s, my); if (!e) return; ring.hidden = true; await move(e, my); ping(e); e.value = v; fire(e, 'input'); fire(e, 'change'); await wait(800, my); },
    opt: async function (my, s, n) { var e = await find(s, my); if (e && e.options[n]) await A.set(my, s, e.options[n].value); },
    drop: async function (my, s, name, trig) {
      var e = await find(s, my); if (!e) return; ring.hidden = true; await show(e, my); cur.hidden = true;
      if (!fast) { var S = $('stage'), r = rect(e), f = document.createElement('div'); f.className = 'dmfile'; f.textContent = '📄 ' + name; S.append(f); f.style.transform = 'translate(' + (S.clientWidth - 260) + 'px,' + (S.clientHeight - 70) + 'px)'; f.getBoundingClientRect(); await wait(350, my); f.style.transform = 'translate(' + Math.max(8, r.x + r.w / 2 - 110) + 'px,' + Math.max(8, r.y + r.h / 2 - 10) + 'px)'; await wait(1250, my); f.style.opacity = 0; setTimeout(function () { f.remove(); }, 350); }
      var t = await find(trig || s, my); if (t) t.click(); await (fast ? real(500, my) : wait(1300, my));
    },
    waitfor: async function (my, s) { await find(s, my, 15000); },
    wait: async function (my, ms) { await wait(ms, my); },
    rest: async function (my, ms) { await real(fast ? Math.min(ms, 600) : ms, my); },
    win: async function (my, title) { var l = [].slice.call(arguments, 2); ring.hidden = cur.hidden = true; if (fast) return; win(title, l); await wait(700 + l.length * 400, my); }
  };
  /* 도구가 보내는 소식: 내려받기·인쇄·복사를 그림 장면으로 */
  window.addEventListener('message', function (e) {
    if (e.source !== fr.contentWindow || !e.data || !e.data.kt || e.data.k !== 'done' || fast) return;
    if (e.data.how === 'print') { ring.hidden = cur.hidden = true; scene.hidden = false; scene.innerHTML = '<div><div class="scpr">🖨 프린터</div><span class="scp"><u></u><u></u><u></u><u></u><u></u><u></u></span></div>'; }
    else if (e.data.how === 'file') win('내려받은 파일', ['📄 ' + (e.data.name || '결과 파일'), '내 컴퓨터의 「다운로드」 폴더에 저장돼요. (연습이라 실제로는 저장하지 않았어요)']);
    else if (e.data.how === 'copy') win('복사했어요', ['📋 이제 붙일 곳에서 Ctrl + V 를 누르면 돼요.']);
  });
  function open(my) { return new Promise(function (ok, no) { fr.onload = function () { fr.onload = null; setTimeout(function () { my !== run ? no('stop') : ok(); }, 700); }; fr.src = 'about:blank'; setTimeout(function () { fr.src = 't/' + T.p.replace(/(\?|#|$)/, '?ktdemo=' + my + '$1'); }, 0); var n = 0, f0 = fr.onload; fr.onload = function () { try { if (fr.contentWindow.location.href === 'about:blank') return; } catch (x) {} if (n++) return; f0(); }; }); }
  async function play(i, my, quick) {
    at = i; fast = !!quick; scene.hidden = key.hidden = true; scene.textContent = ''; document.querySelectorAll('.dmfile').forEach(function (x) { x.remove(); });
    ring.hidden = true;
    if (!quick) paint();
    var s = steps[i]; if (!quick) await wait(350, my);
    for (var k = 1; k < s.length; k++) { var a = s[k]; await A[a[0]].apply(null, [my].concat(a.slice(1))); if (a[0] === 'ring' && !fast) await wait(250, my); }
    fast = false;
  }
  function paint() {
    $('cap').innerHTML = '<span>' + steps[at][0] + '</span>'; $('cnt').textContent = (at + 1) + ' / ' + steps.length;
    $('dots').innerHTML = steps.map(function (x, i) { return '<i class="' + (i <= at ? 'on' : '') + '"></i>'; }).join('');
    $('prev').disabled = at <= 0; $('next').disabled = false; $('next').classList.remove('go'); $('next').textContent = at === steps.length - 1 ? '처음부터 다시' : '다음 ▶';
  }
  async function to(i, from) {
    var my = ++run; busy = true; fast = false;
    try {
      if (from === undefined) {
        at = i; paint(); cur.hidden = true; await open(my);
        for (var k = 0; k < i; k++) await play(k, my, true);
      }
      await play(i, my);
      busy = false; $('next').classList.add('go'); window.KT_READY = i;
      if ($('dmAuto').checked && i < steps.length - 1) { await real(Math.max(1500, steps[i][0].replace(/<[^>]+>/g, '').length * 75), my); to(i + 1, 1); }
    } catch (e) { if (e !== 'stop') { console.error(e); window.KT_MISS.push(at + ' 오류 ' + (e && e.message || e)); busy = false; } }
  }
  async function next() {
    if (at >= steps.length - 1) { to(0); return; }
    if (busy) { // 움직이는 중에 누르면 이 단계를 빠르게 마치고 다음으로
      fast = true; var n = 0; while (busy && n++ < 120) await new Promise(function (r) { setTimeout(r, 50); });
      if (busy) return;
    }
    to(at + 1, 1);
  }
  $('next').addEventListener('click', next);
  $('prev').addEventListener('click', function () { if (at > 0) to(at - 1); });
  $('first').addEventListener('click', function () { to(0); });
  $('dmClose').addEventListener('click', function () { window.close(); });
  $('dmAuto').addEventListener('change', function () { if (this.checked && !busy && at < steps.length - 1) to(at + 1, 1); });
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); } else if (e.key === 'ArrowLeft' && at > 0) { e.preventDefault(); to(at - 1); }
  });
  window.KT_TO = to; window.KT_N = steps.length;
  window.KT_TEST = async function () { // 시험: 모든 단계를 빠르게
    var my = ++run; window.KT_MISS = []; try { await open(my); for (var i = 0; i < steps.length; i++) await play(i, my, true); } catch (e) { window.KT_MISS.push('오류 ' + (e && e.message || e)); }
    return window.KT_MISS;
  };
  fit(); if (!/[?&]test/.test(location.search)) to(0);
})();
