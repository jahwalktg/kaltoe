/* 칼퇴용 뚝딱 사무도구 — 첫 화면 틀. 도구는 t/ 아래 화면을 이 안에서 열고, 열어 둔 채 오간다(적던 것이 남게). */
(function () {
  var M = window.KTMini, CATS = window.KT_CATS, $ = function (i) { return document.getElementById(i); };
  var ALL = {}, PATH = {}, opened = [], cur = '', MAX = 8;
  CATS.forEach(function (c) { c.tools.forEach(function (t) { ALL[t.id] = { t: t, c: c }; PATH[t.p] = t.id; }); });
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  $('fb').href = 'https://docs.google.com/forms/d/e/1FAIpQLSeLbEHToGS4f1OqD_MUcwBTR7lm_tWQ6YiQonG1BaHVspLeZQ/viewform?usp=pp_url&entry.743554503=' + encodeURIComponent('칼퇴용 뚝딱 사무도구');

  function star(t, fav) {
    var on = fav.indexOf(t.id) >= 0, s = el('button', 'star', on ? '★' : '☆');
    s.type = 'button'; s.setAttribute('aria-pressed', String(on)); s.setAttribute('aria-label', t.t + ' 즐겨찾기'); s.title = '즐겨찾기(작은 창에도 나와요)';
    s.addEventListener('click', function () { var f = M.get('fav', []), i = f.indexOf(t.id); if (i >= 0) f.splice(i, 1); else f.push(t.id); M.set('fav', f); });
    return s;
  }
  document.querySelectorAll('.cnt').forEach(function (e) { e.textContent = Object.keys(ALL).length; });

  document.querySelectorAll('[data-ic]').forEach(function (e) { e.replaceWith(window.KT_ICON(e.getAttribute('data-ic'))); });

  /* 전체 보기 */
  var allCat = '';
  function drawAllView() {
    var q = $('allQ').value.trim().toLowerCase().replace(/\s+/g, ''), fav = M.get('fav', []), box = $('allBody'), chips = $('allChips'), n = 0, act = document.activeElement, keep = act && act.getAttribute('data-k');
    chips.textContent = ''; box.textContent = '';
    [{ id: '', name: '모두' }].concat(CATS).forEach(function (c) {
      var b = el('button', 'chp' + (allCat === c.id ? ' on' : ''), c.name + (c.tools ? ' ' + c.tools.length : '')); b.type = 'button'; b.setAttribute('aria-pressed', String(allCat === c.id)); b.setAttribute('data-k', 'c' + c.id);
      b.addEventListener('click', function () { allCat = c.id; drawAllView(); }); chips.append(b);
    });
    CATS.forEach(function (c) {
      if (allCat && allCat !== c.id) return;
      var ts = c.tools.filter(function (t) { return !q || (t.t + t.d + t.w + (t.k || '') + c.name + c.cry).toLowerCase().replace(/\s+/g, '').indexOf(q) >= 0; });
      if (!ts.length) return; n += ts.length;
      var s = el('section', 'ag'), h = el('h2', '', c.name), ul = el('ul'); h.append(el('small', '', c.cry)); s.append(h, ul);
      ts.forEach(function (t) {
        var li = el('li'), a = el('a'), st = star(t, fav), w = el('p', 'aw'), nm = el('div', 'an'); a.href = '#' + t.id; st.setAttribute('data-k', 's' + t.id);
        nm.append(el('b', '', t.t), el('span', '', t.d)); w.append(el('em', '', '이럴 때 쓰면 좋아요'), el('span', '', t.w)); a.append(window.KT_ICON(t.id), nm, w); li.append(a, st); ul.append(li);
      });
      box.append(s);
    });
    $('allNone').hidden = n > 0;
    if (keep) { var f = document.querySelector('#all [data-k="' + keep + '"]'); if (f) f.focus(); }
  }
  $('allQ').addEventListener('input', drawAllView);

  /* 왼쪽 목록 */
  var openGrp = M.get('grp', ['xl']);
  function drawList() {
    var q = $('q').value.trim().toLowerCase().replace(/\s+/g, ''), box = $('list'), fav = M.get('fav', []), n = 0; box.textContent = '';
    CATS.forEach(function (c) {
      var ts = c.tools.filter(function (t) { return !q || (t.t + t.d + t.w + (t.k || '') + c.name).toLowerCase().replace(/\s+/g, '').indexOf(q) >= 0; });
      if (!ts.length) return; n += ts.length;
      var on = !!q || openGrp.indexOf(c.id) >= 0 || (cur && ALL[cur].c === c), g = el('div', 'grp' + (on ? ' on' : '')), b = el('button'), ul = el('ul');
      b.type = 'button'; b.setAttribute('aria-expanded', String(on));
      b.append(el('span', '', c.name), el('i', '', '›'));
      b.addEventListener('click', function () { var i = openGrp.indexOf(c.id), now = g.classList.toggle('on'); if (now && i < 0) openGrp.push(c.id); if (!now && i >= 0) openGrp.splice(i, 1); b.setAttribute('aria-expanded', String(now)); try { localStorage.setItem('kaltoe.grp', JSON.stringify(openGrp)); } catch (e) {} });
      ts.forEach(function (t) {
        var li = el('li', t.id === cur ? 'cur' : ''), a = el('a', '', t.t), s = star(t, fav);
        a.href = '#' + t.id; a.title = t.d; if (t.id === cur) a.setAttribute('aria-current', 'page');
        li.append(a, s); ul.append(li);
      });
      g.append(b, ul); box.append(g);
    });
    if (!n) box.append(el('p', 'nores', '찾는 도구가 없어요. 다른 말로 찾아보세요.'));
  }
  $('q').addEventListener('input', drawList);
  $('q').addEventListener('keydown', function (e) { if (e.key === 'Enter') { var a = document.querySelector('#list a'); if (a) location.hash = a.getAttribute('href'); } });

  /* 첫 화면 */
  CATS.forEach(function (c) {
    var s = el('section', 'cat'), h = el('h3', '', c.cry), ul = el('ul', 'cards');
    h.append(el('small', '', c.name)); s.append(h, ul);
    c.tools.forEach(function (t) { var li = el('li'), a = el('a', 'card'), x = el('span'); a.href = '#' + t.id; x.append(el('b', '', t.t), el('span', 'dd1', t.d)); a.append(window.KT_ICON(t.id), x); li.append(a); ul.append(li); });
    $('cats').append(s);
  });
  function saved() { var s = M.get('saved', {}), k = M.ymd(new Date()); return s.d === k ? s : { d: k, n: 0, m: 0 }; }
  function hm(m) { return m >= 60 ? Math.floor(m / 60) + '시간' + (m % 60 ? ' ' + m % 60 + '분' : '') : m + '분'; }
  function drawRecent() {
    var r = M.get('recent', []).filter(function (i) { return ALL[i]; }), b = $('recent'); b.textContent = ''; b.hidden = !r.length; if (!r.length) return;
    b.append('요즘 연 도구'); r.slice(0, 6).forEach(function (i) { var a = el('a', 'pill', ALL[i].t.t); a.href = '#' + i; b.append(a); });
  }
  function drawSky() {
    var d = M.day(), w = d.st === 'work' || d.st === 'soon', s = saved();
    var tone = d.st === 'after' ? 4 : d.st === 'soon' ? 3 : d.st === 'off' || d.st === 'before' ? 0 : d.r < .35 ? 0 : d.r < .7 ? 1 : 2;
    $('sky').setAttribute('data-t', tone);
    var r = w ? d.r : d.st === 'after' ? .8 : .3;
    $('sun').style.left = (54 + r * 34) + '%'; $('sun').style.top = (d.st === 'after' ? 26 : 24 + Math.pow(Math.abs(r - .4) / .6, 2) * 46) + '%';
    $('skyK').textContent = M.dateText(d.now) + ' ' + M.clock(d.now);
    $('skyH').textContent = w ? '퇴근까지 ' + d.msg : d.st === 'after' ? '이제 집에 갑시다' : d.msg;
    $('skyS').textContent = s.n ? '오늘 뚝딱 ' + s.n + '번, 어림 ' + hm(s.m) + ' 아꼈어요' : w ? '귀찮은 일은 뚝딱 끝내고, 정시에 나가요' : d.st === 'after' ? '남은 일은 내일의 내가 뚝딱 해낼 거예요' : '오늘은 마음 편히 쉬세요';
    if (d.st === 'before') $('skyS').textContent = '커피 한 잔 하고 시작해요';
    $('chip').textContent = M.clock(d.now).slice(0, 5) + (w ? ' · 퇴근까지 ' + d.msg : '');
  }
  setInterval(drawSky, 1000);

  /* 도구 열기 */
  function show(id) {
    cur = ALL[id] ? id : '';
    var all = id === 'all'; $('all').hidden = !all; $('allLink').classList.toggle('cur', all); if (all) drawAllView();
    $('home').hidden = !!cur || all; $('work').hidden = !cur; $('side').classList.remove('on'); $('menuBtn').setAttribute('aria-expanded', 'false');
    document.title = (cur ? ALL[cur].t.t + ' — ' : all ? '전체 보기 — ' : '') + '칼퇴용 뚝딱 사무도구';
    if (cur) {
      var o = opened.filter(function (x) { return x.id === cur; })[0];
      if (!o) {
        if (opened.length >= MAX) { var old = opened.filter(function (x) { return !x.dirty; })[0]; if (old) drop(old); }
        var f = el('iframe'); f.title = ALL[cur].t.t; f.src = 't/' + ALL[cur].t.p; f.allow = 'clipboard-write; clipboard-read; fullscreen; screen-wake-lock';
        o = { id: cur, f: f, dirty: false }; opened.push(o); $('frames').append(f);
      }
      opened.forEach(function (x) { x.f.classList.toggle('off', x.id !== cur); });
      var r = M.get('recent', []).filter(function (i) { return i !== cur; }); r.unshift(cur); try { localStorage.setItem('kaltoe.recent', JSON.stringify(r.slice(0, 8))); } catch (e) {}
    }
    drawTabs(); drawList(); drawRecent(); drawSky();
  }
  function drop(o) { o.f.remove(); opened.splice(opened.indexOf(o), 1); }
  function drawTabs() {
    var b = $('tabs'); b.textContent = '';
    opened.forEach(function (o) {
      var d = el('div', 'tab' + (o.id === cur ? ' on' : '')), t = el('button', '', ALL[o.id].t.t), x = el('button', 'x', '×');
      t.type = x.type = 'button'; t.setAttribute('role', 'tab'); t.setAttribute('aria-selected', String(o.id === cur)); x.setAttribute('aria-label', ALL[o.id].t.t + ' 닫기');
      t.addEventListener('click', function () { location.hash = o.id; });
      x.addEventListener('click', function () {
        if (o.dirty && !confirm('「' + ALL[o.id].t.t + '」에 넣은 것이 있어요. 닫을까요?')) return;
        drop(o); if (o.id === cur) location.hash = opened.length ? opened[opened.length - 1].id : ''; else drawTabs();
      });
      d.append(t, x); b.append(d); if (o.id === cur) d.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }
  function route() { show(decodeURIComponent(location.hash.slice(1))); }
  window.addEventListener('hashchange', route);
  $('homeLink').addEventListener('click', function (e) { e.preventDefault(); location.hash = ''; });
  window.KT_OPEN = function (id) { location.hash = id; };
  window.name = window.name || 'kaltoe-main';
  window.addEventListener('beforeunload', function (e) { if (opened.some(function (o) { return o.dirty; })) e.preventDefault(); });

  /* 도구 화면이 보내는 소식 */
  var st = 0;
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || !e.data.kt) return;
    var o = opened.filter(function (x) { return x.f.contentWindow === e.source; })[0]; if (!o) return;
    if (e.data.k === 'dirty') o.dirty = true;
    if (e.data.k === 'open') { var m = String(e.data.to).match(/\/t\/(.+)$/), id = m && PATH[m[1].replace(/\/$/, '/index.html')]; if (id) location.hash = id; }
    if (e.data.k === 'done') {
      var m1 = ALL[o.id].t.m, s = saved(); s.n++; s.m += m1; M.set('saved', s);
      var b = $('stamp'); b.textContent = ''; var im = el('img'); im.src = 'img/gyun.webp'; im.alt = ''; im.width = im.height = 54; var tx = el('div'); tx.append(el('b', '', '뚝딱!'), el('span', '', '어림 ' + hm(m1) + ' 아꼈어요 · 오늘 모두 ' + hm(s.m))); b.append(im, tx);
      b.classList.add('on'); clearTimeout(st); st = setTimeout(function () { b.classList.remove('on'); }, 3200);
    }
  });

  /* 오른쪽 시계·달력·메모 + 작은 창 */
  var un = M.mount($('dockMini'), { open: window.KT_OPEN }), pip = null;
  var narrow = matchMedia('(max-width:1180px)'), dockOn = narrow.matches ? false : M.get('dock', true);
  function dock(on, keep) { dockOn = on; $('dock').classList.toggle('hide', !on); $('dockBtn').setAttribute('aria-pressed', String(on)); if (keep && !narrow.matches) try { localStorage.setItem('kaltoe.dock', JSON.stringify(on)); } catch (e) {} }
  dock(dockOn); var wasNarrow = narrow.matches; window.addEventListener('resize', function () { var n = innerWidth <= 1180; if (n !== wasNarrow) { wasNarrow = n; dock(n ? false : M.get('dock', true)); } }); $('dockBtn').addEventListener('click', function () { dock(!dockOn, true); });
  function setAway(on) { $('dockMini').hidden = on; $('away').hidden = !on; }
  async function pop() {
    if (pip && !pip.closed) { pip.focus(); return; }
    if ('documentPictureInPicture' in window) {
      try {
        var w = await window.documentPictureInPicture.requestWindow({ width: 330, height: 640 });
        pip = w; var dd = w.document; dd.documentElement.lang = 'ko'; dd.title = '칼퇴 작은 창';
        var th = document.documentElement.getAttribute('data-theme'); if (th) dd.documentElement.setAttribute('data-theme', th);
        ['app.css?v=3', 'mini.css?v=2'].forEach(function (h) { var l = dd.createElement('link'); l.rel = 'stylesheet'; l.href = new URL(h, location.href).href; dd.head.append(l); });
        dd.body.className = 'mini-win'; var box = dd.createElement('div'); dd.body.append(box);
        var off = M.mount(box, { open: function (id) { window.focus(); window.KT_OPEN(id); } });
        setAway(true); w.addEventListener('pagehide', function () { off(); pip = null; setAway(false); });
        return;
      } catch (e) {}
    }
    var v = window.open('mini.html', 'kaltoe-mini', 'popup,width=340,height=680');
    if (!v) alert('작은 창이 막혔어요. 주소창 옆의 팝업 차단을 풀고 다시 눌러 주세요.');
  }
  $('popBtn').addEventListener('click', pop);
  $('popBtn').title = 'documentPictureInPicture' in window ? '시계·달력·메모를 다른 프로그램 위에 늘 띄워 둡니다' : '시계·달력·메모를 작은 창으로 엽니다(늘 위에 두기는 크롬·엣지에서)';
  $('backBtn').addEventListener('click', function () { if (pip) pip.close(); });

  $('themeBtn').addEventListener('click', function () {
    var h = document.documentElement, now = h.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'), nx = now === 'dark' ? 'light' : 'dark';
    var docs = [document].concat(opened.map(function (o) { return o.f.contentDocument; })); if (pip) docs.push(pip.document);
    docs.forEach(function (d) { if (d) d.documentElement.setAttribute('data-theme', nx); });
    try { localStorage.setItem('kaltoe.theme', nx); } catch (e) {}
  });
  $('menuBtn').addEventListener('click', function () { var on = $('side').classList.toggle('on'); this.setAttribute('aria-expanded', String(on)); });
  M.on(function () { drawList(); drawSky(); if (!$('all').hidden) drawAllView(); });
  route();
})();
