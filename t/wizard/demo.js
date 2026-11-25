/* 문서 변신 마법사 — 화면 안에서 단계별로 보여 주는 시연(영상 대신)
   실제 도구 위에서 커서가 한 단계의 동작을 보여 준 뒤 멈추고, 「다음 ▶」(또는 Enter·→)을 눌러야 넘어간다.
   「◀ 이전」은 그 단계 직전까지 빠르게 다시 채운 뒤 보여 준다. 내려받기는 누르지 않는다. 멈추기: 「그만 보기」 또는 Esc.
   실제 화면을 그대로 쓰므로 화면을 고쳐도 다시 찍을 필요가 없다. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var running = false, stopFlag = false, fast = false, cur, cap, ring;
  var css = '.dm-cur{position:absolute;left:0;top:0;width:28px;height:28px;z-index:90;pointer-events:none;transition:transform .8s cubic-bezier(.4,0,.2,1);filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}' +
    '.dm-cur.fast{transition:none}.dm-click{position:absolute;width:36px;height:36px;margin:-18px 0 0 -18px;border:3px solid #FFB800;border-radius:50%;z-index:89;pointer-events:none;animation:dmc .55s ease-out forwards}' +
    '@keyframes dmc{from{transform:scale(.3);opacity:1}to{transform:scale(1.6);opacity:0}}' +
    '.dm-ring{position:absolute;z-index:88;pointer-events:none;border:3px solid #FFB800;border-radius:12px;box-shadow:0 0 0 9999px rgba(10,20,45,.28);transition:all .45s ease}' +
    '.dm-cap{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:95;width:min(740px,calc(100vw - 24px));background:#1A2B50;color:#fff;border-radius:14px;padding:12px 16px 10px;box-shadow:0 8px 28px rgba(0,0,0,.35);font-size:1rem;line-height:1.55}' +
    '.dm-cap b{color:#FFD166}.dm-cap .dm-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin-top:10px}' +
    '.dm-cap .dm-dots{display:flex;gap:5px}.dm-cap .dm-dots i{width:8px;height:8px;border-radius:50%;background:#56688f}.dm-cap .dm-dots i.on{background:#FFD166}' +
    '.dm-cap .dm-n{font-size:.84rem;color:#cfd8ef}.dm-cap .dm-btns{display:flex;gap:8px;flex-wrap:wrap}' +
    '.dm-cap button{background:#fff;color:#1A2B50;border:0;border-radius:8px;padding:7px 14px;font:inherit;font-size:.9rem;font-weight:700;cursor:pointer}' +
    '.dm-cap button.main{background:#FFD166}.dm-cap button.ghost{background:transparent;color:#cfd8ef;border:1px solid #56688f;font-weight:600}' +
    '.dm-cap button:disabled{opacity:.5;cursor:default}' +
    '@media (prefers-reduced-motion: reduce){.dm-cur{transition:none}.dm-ring{transition:none}}';
  function ensure() {
    if (cur) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    cur = document.createElement('div'); cur.className = 'dm-cur'; cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M4 2l15 9-6.5 1.6L9.6 19z" fill="#fff" stroke="#1A2B50" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    ring = document.createElement('div'); ring.className = 'dm-ring'; ring.hidden = true;
    cap = document.createElement('div'); cap.className = 'dm-cap'; cap.setAttribute('role', 'status'); cap.setAttribute('aria-live', 'polite');
    document.body.appendChild(ring); document.body.appendChild(cur); document.body.appendChild(cap);
  }
  function wait(ms) { return new Promise(function (ok, no) { if (stopFlag) { no('stop'); return; } if (fast) { ok(); return; } setTimeout(function () { stopFlag ? no('stop') : ok(); }, reduce ? Math.min(ms, 400) : ms); }); }
  function box(el) { var r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; }
  function show(el) { if (!el) return wait(0); el.scrollIntoView({ behavior: reduce || fast ? 'auto' : 'smooth', block: 'center' }); return wait(700); }
  function moveTo(el) { if (!el) return wait(0); var b = box(el); cur.style.transform = 'translate(' + Math.round(b.x + Math.min(b.w * 0.5, 60)) + 'px,' + Math.round(b.y + b.h * 0.55) + 'px)'; return wait(850); }
  function tap(el) {
    if (!el || fast) return wait(0);
    var b = box(el), c = document.createElement('div'); c.className = 'dm-click'; c.style.left = (b.x + Math.min(b.w * 0.5, 60)) + 'px'; c.style.top = (b.y + b.h * 0.55) + 'px';
    document.body.appendChild(c); setTimeout(function () { c.remove(); }, 600);
    return wait(250);
  }
  function hl(el, pad) { if (fast) return; if (!el) { ring.hidden = true; return; } var b = box(el), p = pad == null ? 6 : pad; ring.hidden = false; ring.style.left = (b.x - p) + 'px'; ring.style.top = (b.y - p) + 'px'; ring.style.width = (b.w + p * 2) + 'px'; ring.style.height = (b.h + p * 2) + 'px'; }
  function noHl() { if (ring) ring.hidden = true; }
  function settle() {   // 파일 읽기가 끝날 때까지(재료·그릇 수가 0.3초 동안 그대로일 때까지) 기다림 — 빠르게 다시 채울 때도
    var st = function () { var x = window._mm && window._mm.state(); return x ? x.srcs.length + ':' + x.tpls.length + ':' + x.baskets.length : ''; };
    return new Promise(function (ok, no) { var last = st(), same = 0, t = 0; (function tick() { if (stopFlag) { no('stop'); return; } var now = st(); same = now === last && now !== '0:0:0' ? same + 1 : 0; last = now; t++; if (same >= 3 || t > 60) ok(); else setTimeout(tick, 100); })(); });
  }
  function press(sel) { var el = typeof sel === 'string' ? $(sel) : sel; return show(el).then(function () { return moveTo(el); }).then(function () { return tap(el); }).then(function () { if (el) el.click(); return settle(); }).then(function () { return wait(500); }); }

  /* ---------- 단계 ---------- */
  var STEPS = [
    { t: '<b>문서 변신 마법사</b> — 흩어진 재료를 모아, 내가 쓰는 양식(그릇)에 맞춰 담아 줍니다. 한 단계씩 보여 드릴게요. 읽고 나서 <b>「다음 ▶」</b>을 누르세요. (키보드 Enter·→ 도 됩니다)' },
    { t: '<b>① 재료 넣기</b> — 엑셀·한글 파일을 한꺼번에 넣습니다. 예시로 <b>사람 재료 3개</b>(명단·주소록·비상연락 조사)와 <b>물품 재료 3개</b>를 넣었습니다. 내 파일은 이 칸에 끌어다 놓으면 됩니다.',
      act: function () { return press('#sampleIn').then(function () { return press('#sampleIn2'); }).then(function () { return show($('#dropIn')); }).then(function () { hl($('#dropIn'), 4); }); } },
    { t: '도구가 재료의 칸마다 무엇인지 알아봅니다. 확실한 칸은 <b>✓ 알아봄</b>, 애매한 칸은 <b>노랗게</b> 표시해 물어봅니다. 방금 「본인 번호」 칸을 연락처로 짐작해 물어봤고, <b>「맞아요」</b>를 눌러 확인했습니다.',
      act: function () {
        var row = $('#srcList tr.ask'), card = row && row.closest('.card'), sid = card && card.id;
        return show(row || card).then(function () { hl(row || card); return wait(1400); })
          .then(function () { var ok = row && row.querySelector('[data-ok]'); return ok ? moveTo(ok).then(function () { return tap(ok); }).then(function () { ok.click(); return wait(600); }) : null; })
          .then(function () { var c2 = sid && document.getElementById(sid); if (c2) hl(c2.querySelector('table.list'), 4); });
      } },
    { t: '<b>② 재료를 구분해 바구니에</b> — 종류가 다른 재료는 바구니를 나눕니다(사람 바구니·물품 바구니). 같은 사람·같은 물품은 <b>이름·관리번호</b>로 한 줄에 모으고, 칸 모양이 같은 재료는 아래로 이어 붙입니다.',
      act: function () {
        var cards = $('#basketList').querySelectorAll(':scope > .card');
        return show($('#basketPanel .step')).then(function () { hl(cards[0] && cards[0].querySelector('h3'), 4); return wait(1500); })
          .then(function () { if (!cards[1]) return null; return show(cards[1]).then(function () { hl(cards[1].querySelector('h3'), 4); }); });
      } },
    { t: '재료마다 값이 다르면(예: 연락처가 두 개) 도구가 마음대로 정하지 않고 <b>노란 칸에서 골라 달라고</b> 합니다. 여기서는 첫 번째 값을 골랐습니다. 표의 칸을 눌러 직접 고칠 수도 있어요.',
      act: function () {
        var sel = $('select[data-pick]'); if (!sel) return wait(300);
        var key = sel.getAttribute('data-pick');
        return show(sel).then(function () { hl(sel.closest('td'), 3); return moveTo(sel); }).then(function () { return tap(sel); })
          .then(function () { sel.value = '0'; sel.dispatchEvent(new Event('change', { bubbles: true })); return wait(400); })
          .then(function () { var s2 = [].filter.call(document.querySelectorAll('select[data-pick]'), function (x) { return x.getAttribute('data-pick') === key; })[0]; if (s2) hl(s2.closest('td'), 3); });
      } },
    { t: '<b>③ 그릇(내 양식) 넣기</b> — 우리 기관이 쓰는 엑셀·한글 양식을 그대로 넣습니다. 예시로 <b>비상연락망</b>(목록 모양)과 <b>개인별 카드</b>(한 사람에 한 장)를 넣었습니다. 양식의 칸과 바구니 항목의 짝을 알아서 맞춥니다.',
      act: function () { return press('#sampleTplX').then(function () { return press('#sampleTplF'); }).then(function () { var c = $('#tplList .card'), t = c && c.querySelector('table.list'); return show(t).then(function () { hl(t, 4); }); }); } },
    { t: '<b>④ 담아서 받기</b> — 원래 양식 파일을 그대로 열어 칸만 채웁니다. 글꼴·테두리·제목은 그대로, 빈 줄이 모자라면 같은 모양으로 늘립니다. 한 사람에 한 장 양식은 <b>파일 여러 개 묶음</b>이나 <b>한 파일(쪽마다 한 사람)</b>으로 받습니다.',
      act: function () {
        var btn = $('#tplList [data-fill]');
        return show(btn).then(function () { hl(btn, 5); return moveTo(btn); }).then(function () { return wait(1200); })
          .then(function () { var b2 = $('#tplList [data-fzip]'); if (!b2) return null; return show(b2).then(function () { hl(b2.parentNode, 5); return moveTo(b2); }); });
      } }
  ];
  var N = STEPS.length, nextOk = null;
  function bar(i, ready) {
    var dots = ''; for (var k = 0; k < N; k++) dots += '<i class="' + (k <= i ? 'on' : '') + '"></i>';
    cap.innerHTML = '<div>' + STEPS[i].t + '</div><div class="dm-row"><span style="display:flex;gap:10px;align-items:center"><span class="dm-dots">' + dots + '</span><span class="dm-n">' + (i + 1) + ' / ' + N + '</span></span>' +
      '<span class="dm-btns"><button type="button" class="ghost" id="dmStop">그만 보기</button>' + (i > 0 ? '<button type="button" class="ghost" id="dmPrev"' + (ready ? '' : ' disabled') + '>◀ 이전</button>' : '') +
      '<button type="button" class="main" id="dmNext"' + (ready ? '' : ' disabled') + '>' + (ready ? (i === N - 1 ? '마치기 ▶' : '다음 ▶') : '보여 주는 중…') + '</button></span></div>';
    $('#dmStop').onclick = stop;
    if (ready) {
      $('#dmNext').onclick = goNext; $('#dmNext').focus({ preventScroll: true });
      if ($('#dmPrev')) $('#dmPrev').onclick = function () { location.replace(location.pathname + '?demo=' + (i - 1)); };   // 이전 단계부터 다시
    }
  }
  function goNext() { var f = nextOk; nextOk = null; if (f) f(); }
  function playStep(i) {   // 자막 → 동작 → 멈춰서 「다음」 기다리기
    if (stopFlag) return Promise.reject('stop');
    noHl(); cur.hidden = false; bar(i, false);
    return Promise.resolve(STEPS[i].act ? STEPS[i].act() : wait(200)).then(function () { if (stopFlag) throw 'stop'; bar(i, true); return new Promise(function (ok) { nextOk = ok; }); });
  }
  function catchUp(upto) {   // 「이전」으로 왔을 때: upto 단계 직전까지 동작만 빠르게
    fast = true; var p = Promise.resolve();
    for (var i = 0; i < upto; i++) (function (k) { p = p.then(function () { return STEPS[k].act ? STEPS[k].act() : null; }); })(i);
    return p.then(function () { fast = false; }, function (e) { fast = false; throw e; });
  }
  function run(from) {
    if (running) return; running = true; stopFlag = false; ensure();
    document.addEventListener('keydown', onKey);
    from = Math.max(0, Math.min(N - 1, from || 0));
    var start = $('#demoBtn'), b0 = start ? box(start) : { x: 40, y: 40, w: 0, h: 0 };
    cur.classList.add('fast'); cur.style.transform = 'translate(' + Math.round(b0.x + 30) + 'px,' + Math.round(b0.y + 20) + 'px)'; cur.hidden = false;
    setTimeout(function () { cur.classList.remove('fast'); }, 50);
    var p = Promise.resolve();
    if (from) { cap.innerHTML = '<div>앞 단계를 다시 채우는 중…</div>'; p = catchUp(from); }
    for (var i = from; i < N; i++) (function (k) { p = p.then(function () { return playStep(k); }); })(i);
    p.then(function () {
      noHl(); cur.hidden = true;
      cap.innerHTML = '<div><b>여기까지가 전부입니다.</b> 이제 내 재료와 내 양식으로 해 보세요. 넣은 파일은 이 컴퓨터 밖으로 나가지 않습니다.</div><div class="dm-row"><span></span><span class="dm-btns"><button type="button" class="ghost" id="dmAgain">처음부터 다시 보기</button><button type="button" class="ghost" id="dmKeep">예시 그대로 두고 둘러보기</button><button type="button" class="main" id="dmClear">비우고 내 파일로 시작</button></span></div>';
      $('#dmAgain').onclick = function () { location.replace(location.pathname + '?demo'); };
      $('#dmKeep').onclick = closeAll;
      $('#dmClear').onclick = function () { location.replace(location.pathname); };
      running = false; document.removeEventListener('keydown', onKey);
    }).catch(function () { finish(); });
  }
  function onKey(e) {
    if (e.key === 'Escape') { stop(); return; }
    if ((e.key === 'Enter' || e.key === 'ArrowRight') && nextOk) { e.preventDefault(); goNext(); }
  }
  function stop() { stopFlag = true; nextOk = null; finish(); }
  function closeAll() { if (cap) cap.remove(); cap = null; if (cur) cur.remove(); cur = null; if (ring) ring.remove(); ring = null; }
  function finish() {
    running = false; document.removeEventListener('keydown', onKey);
    noHl(); if (cur) cur.hidden = true;
    if (cap) { cap.innerHTML = '<div>시연을 멈췄습니다. 넣어 둔 예시는 그대로 두었으니 이어서 눌러 보셔도 됩니다.</div><div class="dm-row"><span></span><span class="dm-btns"><button type="button" class="ghost" id="dmClose">닫기</button><button type="button" class="main" id="dmClear2">비우고 내 파일로 시작</button></span></div>'; $('#dmClose').onclick = closeAll; $('#dmClear2').onclick = function () { location.replace(location.pathname); }; }
  }
  function begin() {
    var used = window._mm && window._mm.state().srcs.length;
    if (used) { if (!confirm('시연은 빈 화면에서 시작합니다. 지금 넣은 재료와 그릇을 비울까요?')) return; location.replace(location.pathname + '?demo'); return; }
    window.scrollTo(0, 0); run(0);
  }
  var btn = document.getElementById('demoBtn'); if (btn) btn.onclick = begin;
  var m = /[?&]demo(?:=(\d+))?/.exec(location.search);
  if (m) { history.replaceState(null, '', location.pathname); setTimeout(function () { run(m[1] ? +m[1] : 0); }, 600); }
  window._demo = { run: run, stop: stop, next: goNext, steps: N };
})();
