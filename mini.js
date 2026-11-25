/* 책상 위 작은 창 — 시계·퇴근까지·달력·메모·즐겨 쓰는 도구.
   같은 것을 세 자리에서 쓴다: 첫 화면 오른쪽 · 늘 위에 떠 있는 창(문서 PIP) · mini.html(보통 작은 창)
   KTMini.mount(담을 칸, { open: 도구를 여는 함수 }) */
(function () {
  var NS = 'kaltoe.';
  function get(k, d) { try { var v = JSON.parse(localStorage.getItem(NS + k)); return v == null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) { return false; } fire(); return true; }
  var subs = [];
  function fire() { subs.slice().forEach(function (f) { f(); }); }
  window.addEventListener('storage', function (e) { if (!e.key || e.key.indexOf(NS) === 0) fire(); });
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate()); }
  var WD = '일월화수목금토';
  // 공휴일: 2026·2027년 월력요항 (원본 업무 도구의 기준값 표와 같음)
  var HOL = {};
  ('2026-01-01 신정,2026-02-16 설날 연휴,2026-02-17 설날,2026-02-18 설날 연휴,2026-03-01 삼일절,2026-03-02 대체공휴일,2026-05-01 노동절,2026-05-05 어린이날,2026-05-24 부처님오신날,2026-05-25 대체공휴일,2026-06-03 지방선거,2026-06-06 현충일,2026-07-17 제헌절,2026-08-15 광복절,2026-08-17 대체공휴일,2026-09-24 추석 연휴,2026-09-25 추석,2026-09-26 추석 연휴,2026-10-03 개천절,2026-10-05 대체공휴일,2026-10-09 한글날,2026-12-25 성탄절,' +
   '2027-01-01 신정,2027-02-06 설날 연휴,2027-02-07 설날,2027-02-08 설날 연휴,2027-02-09 대체공휴일,2027-03-01 삼일절,2027-05-01 노동절,2027-05-03 대체공휴일,2027-05-05 어린이날,2027-05-13 부처님오신날,2027-06-06 현충일,2027-07-17 제헌절,2027-07-19 대체공휴일,2027-08-15 광복절,2027-08-16 대체공휴일,2027-09-14 추석 연휴,2027-09-15 추석,2027-09-16 추석 연휴,2027-10-03 개천절,2027-10-04 대체공휴일,2027-10-09 한글날,2027-10-11 대체공휴일,2027-12-25 성탄절,2027-12-27 대체공휴일').split(',').forEach(function (s) { HOL[s.slice(0, 10)] = s.slice(11); });

  /* 하루 시간: 출근·퇴근 (기본 9시~18시). 그날의 빛깔과 남은 시간을 여기서 한 번만 계산 */
  function day(now) {
    now = now || new Date();
    var h = get('hours', { in: '09:00', out: '18:00' });
    function at(s) { var p = String(s).split(':'); return new Date(now.getFullYear(), now.getMonth(), now.getDate(), +p[0] || 0, +p[1] || 0); }
    var a = at(h.in), b = at(h.out); if (b <= a) b = new Date(a.getTime() + 9 * 36e5);
    var key = ymd(now), off = now.getDay() === 0 || now.getDay() === 6 || !!HOL[key];
    var r = (now - a) / (b - a), left = Math.ceil((b - now) / 1000), msg, st;
    if (off) { st = 'off'; msg = HOL[key] ? HOL[key] + ', 쉬는 날' : '쉬는 날이에요'; }
    else if (r < 0) { st = 'before'; msg = '아직 출근 전이에요'; }
    else if (r >= 1) { st = 'after'; msg = '퇴근 시각이 지났어요'; }
    else {
      st = r > .94 ? 'soon' : 'work';
      var H = Math.floor(left / 3600), M = Math.floor(left % 3600 / 60), S = left % 60;
      msg = (H ? H + '시간 ' : '') + (H || M ? M + '분' : S + '초');
    }
    return { r: Math.max(0, Math.min(1, r)), left: left, st: st, msg: msg, h: h, now: now };
  }
  function clock(d) { return two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()); }
  function dateText(d) { return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + WD[d.getDay()] + '요일'; }

  function mount(box, opt) {
    opt = opt || {};
    var doc = box.ownerDocument, win = doc.defaultView, cur = new Date(), pick = '';
    cur.setDate(1);
    function el(tag, cls, txt) { var e = doc.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
    function btn(cls, txt, label, f) { var b = el('button', cls, txt); b.type = 'button'; if (label) { b.title = label; b.setAttribute('aria-label', label); } b.addEventListener('click', f); return b; }
    box.textContent = ''; box.classList.add('mini');

    var head = el('div', 'mi-head'), ck = el('div', 'mi-clock'), dt = el('div', 'mi-date');
    head.append(ck, dt);
    var go = el('div', 'mi-go'), gl = el('span', 'mi-gl'), gv = el('b'), bar = el('div', 'mi-bar'), fill = el('i');
    bar.append(fill); go.append(gl, gv);
    var hset = el('details', 'mi-hours'), sm = el('summary', '', '출퇴근 시각 고치기'), hr = el('div', 'mi-hr');
    function timeIn(k, label) {
      var l = el('label', '', label), i = el('input'); i.type = 'time'; i.value = day().h[k];
      i.addEventListener('change', function () { if (!i.value) return; var h = Object.assign({}, day().h); h[k] = i.value; set('hours', h); }); l.append(i); return l;
    }
    hr.append(timeIn('in', '출근 '), timeIn('out', '퇴근 ')); hset.append(sm, hr);
    box.append(head, go, bar, hset);

    var cal = el('section', 'mi-cal'); box.append(cal);
    function drawCal() {
      var keep = doc.activeElement && cal.contains(doc.activeElement) ? doc.activeElement.getAttribute('data-k') : null;
      cal.textContent = '';
      var top = el('div', 'mi-ct');
      var p = btn('ib', '‹', '지난달', function () { cur.setMonth(cur.getMonth() - 1); drawCal(); }); p.setAttribute('data-k', 'p');
      var n = btn('ib', '›', '다음 달', function () { cur.setMonth(cur.getMonth() + 1); drawCal(); }); n.setAttribute('data-k', 'n');
      var t = btn('mi-ym', cur.getFullYear() + '년 ' + (cur.getMonth() + 1) + '월', '이번 달로', function () { cur = new Date(); cur.setDate(1); pick = ''; drawAll(); }); t.setAttribute('data-k', 't');
      top.append(p, t, n); cal.append(top);
      var g = el('div', 'mi-grid'), i, first = cur.getDay(), last = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate(), today = ymd(new Date()), marks = {};
      get('memo', []).forEach(function (m) { if (m.d && !m.done) marks[m.d] = 1; });
      for (i = 0; i < 7; i++) g.append(el('span', 'wd' + (i === 0 ? ' sun' : i === 6 ? ' sat' : ''), WD[i]));
      for (i = 0; i < first; i++) g.append(el('span'));
      for (i = 1; i <= last; i++) (function (i) {
        var d = new Date(cur.getFullYear(), cur.getMonth(), i), k = ymd(d), w = d.getDay();
        var b = btn('dd' + (w === 0 || HOL[k] ? ' sun' : w === 6 ? ' sat' : '') + (k === today ? ' today' : '') + (k === pick ? ' pick' : '') + (marks[k] ? ' mk' : ''), String(i), (cur.getMonth() + 1) + '월 ' + i + '일' + (HOL[k] ? ' ' + HOL[k] : '') + (marks[k] ? ', 메모 있음' : ''), function () { pick = pick === k ? '' : k; drawAll(); });
        b.setAttribute('data-k', k); b.setAttribute('aria-pressed', String(k === pick)); g.append(b);
      })(i);
      cal.append(g);
      if (keep) { var f = cal.querySelector('[data-k="' + keep + '"]'); if (f) f.focus(); }
    }

    var memo = el('section', 'mi-memo'), mh = el('div', 'mi-mh'), form = el('form', 'mi-add'), inp = el('input'), list = el('ul');
    inp.type = 'text'; inp.maxLength = 120; inp.setAttribute('aria-label', '메모 적기'); inp.autocomplete = 'off';
    var add = el('button', 'mi-plus', '적기'); add.type = 'submit';
    form.append(inp, add);
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var t = inp.value.trim(); if (!t) return;
      var a = get('memo', []); a.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: t, d: pick || '', done: 0 });
      if (!set('memo', a.slice(0, 200))) { mh.textContent = '이 브라우저에 저장할 수 없어요'; return; }
      inp.value = ''; inp.focus();
    });
    memo.append(mh, form, list); box.append(memo);
    function drawMemo() {
      var a = get('memo', []), show = a.filter(function (m) { return !pick || m.d === pick; });
      show.sort(function (x, y) { return (x.done || 0) - (y.done || 0); });
      mh.textContent = '';
      mh.append(el('b', '', pick ? (+pick.slice(5, 7)) + '월 ' + (+pick.slice(8)) + '일' + (HOL[pick] ? ' · ' + HOL[pick] : '') : '메모'));
      if (pick) mh.append(btn('lk', '모두 보기', '', function () { pick = ''; drawAll(); }));
      else if (a.some(function (m) { return m.done; })) mh.append(btn('lk', '끝낸 것 지우기', '', function () { set('memo', get('memo', []).filter(function (m) { return !m.done; })); }));
      inp.placeholder = pick ? '이날 할 일을 적으세요' : '잊기 전에 적어 두세요';
      list.textContent = '';
      if (!show.length) list.append(el('li', 'none', pick ? '이날 메모가 없어요' : '적어 둔 메모가 없어요'));
      show.forEach(function (m) {
        var li = el('li', m.done ? 'done' : ''), lb = el('label'), c = el('input'); c.type = 'checkbox'; c.checked = !!m.done;
        c.addEventListener('change', function () { var x = get('memo', []); x.forEach(function (y) { if (y.id === m.id) y.done = c.checked ? 1 : 0; }); set('memo', x); });
        lb.append(c, el('span', '', m.t)); if (m.d && !pick) lb.append(el('small', '', (+m.d.slice(5, 7)) + '/' + (+m.d.slice(8))));
        li.append(lb, btn('ib del', '×', '메모 지우기: ' + m.t, function () { set('memo', get('memo', []).filter(function (y) { return y.id !== m.id; })); }));
        list.append(li);
      });
    }

    var fav = el('section', 'mi-fav'); box.append(fav);
    function drawFav() {
      fav.textContent = '';
      var ids = get('fav', []), all = {};
      (window.KT_CATS || []).forEach(function (c) { c.tools.forEach(function (t) { all[t.id] = { t: t, c: c }; }); });
      ids = ids.filter(function (i) { return all[i]; });
      if (!ids.length) { fav.append(el('p', 'none', '도구의 ☆를 누르면 여기에 모여요')); return; }
      ids.slice(0, 8).forEach(function (i) { var b = btn('mi-tool', all[i].t.t, '', function () { if (opt.open) opt.open(i); }); fav.append(b); });
    }

    function tick() {
      var d = day(); ck.textContent = clock(d.now); dt.textContent = dateText(d.now);
      var lab = d.st === 'work' || d.st === 'soon';
      gl.textContent = lab ? '퇴근까지' : ''; gv.textContent = d.msg;
      bar.hidden = !lab; fill.style.width = (d.r * 100).toFixed(2) + '%'; box.setAttribute('data-st', d.st);
    }
    function drawAll() { drawCal(); drawMemo(); drawFav(); tick(); }
    drawAll();
    var iv = win.setInterval(tick, 1000), day0 = ymd(new Date());
    var iv2 = win.setInterval(function () { var k = ymd(new Date()); if (k !== day0) { day0 = k; drawCal(); } }, 30000);
    subs.push(drawAll);
    return function () { win.clearInterval(iv); win.clearInterval(iv2); var i = subs.indexOf(drawAll); if (i >= 0) subs.splice(i, 1); };
  }
  window.KTMini = { mount: mount, get: get, set: set, day: day, clock: clock, dateText: dateText, ymd: ymd, on: function (f) { subs.push(f); } };
})();
