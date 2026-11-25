/* 즉석 모션그래픽 — ⑥ 발표 뼈대 만들기 (수정 가능한 PPT)
   용도를 고르고 제목·장 목록만 넣으면 표지·목차·장 전환·본문·마무리까지 15~25장 뼈대를 PowerPoint 도형·글상자·표로 만든다.
   - 테마: 지금 고른 디자인 테마의 배경(무늬 포함)을 그림으로 그려 슬라이드 마스터 배경에 넣고, 카드 색·테두리·둥글기·글꼴을 번역해 씀.
     → PowerPoint에서 「새 슬라이드」를 더해도 같은 배경(마스터)이 나옴.
   - 움직이는 장면 끼우기: 표지·목차·장 전환·숫자·인용·마무리에 모션 장면(MP4, 자동 실행)을 넣고, 뒤에 같은 내용 정지 장표를 한 장 더(선택).
   - 내용은 비워 두면 회색 「채울 자리」 글이 들어감. 저장: 입력만 localStorage(kaltoe.motion.v1.deck).
   라이브러리(PptxGenJS·JSZip)·MP4 자동 실행 처리는 bundle.js(MGBundle.libs/postProcess)를 함께 씀. */
(function () {
  var S = window.MG, KEY = 'kaltoe.motion.v1.deck';
  function M() { return window._mg; } function $(id) { return document.getElementById(id); }
  var SHAPES = { '글머리': 'bullets', '글': 'bullets', '숫자3': 'numbers', '숫자': 'numbers', '표': 'table', '사진': 'photo', '인용': 'quote', '소감': 'quote' };
  var SHAPE_NAME = { bullets: '글머리', numbers: '숫자3', table: '표', photo: '사진', quote: '인용' };
  var HINT = {
    bullets: '한 줄에 한 가지(8줄까지). 비우면 「채울 자리」 3줄',
    numbers: '한 줄에 「이름 | 숫자 | 단위」, 3줄. 예) 직원 | 126 | 명',
    table: '첫 줄은 머리글, 칸은 | 로 나눔(8줄·5칸까지). 예) 부서 | 인원 | 매출',
    photo: '사진 옆 설명(몇 줄). 사진은 PowerPoint에서 「삽입 › 그림」으로',
    quote: '첫 줄: 말 / 둘째 줄: 누구(가명 권장)'
  };
  var PURPOSES = [
    { id: 'report', name: '성과보고회 발표', title: '2026년 성과보고회', sub: '함께 일하고 함께 자라는 한 해', toc: true, brk: false,
      chapters: '인사말 | 글머리\n사업 개요 | 글머리\n참여 현황 | 숫자3, 표\n부서별 성과 | 표, 사진\n직원 이야기 | 인용, 사진\n내년 계획 | 글머리' },
    { id: 'board', name: '경영회의 보고', title: '2026년 4분기 경영회의', sub: '사업 추진 현황 보고', toc: true, brk: false,
      chapters: '지난 회의 결과 | 글머리\n사업 추진 현황 | 숫자3, 표\n예산 집행 현황 | 표\n심의 안건 | 글머리\n기타 논의 | 글머리' },
    { id: 'ot', name: '신입사원 교육(OT)', title: '신입사원 교육', sub: '함께 시작하는 첫날', toc: true, brk: true,
      chapters: '회사 소개 | 글머리, 사진\n우리가 하는 일 | 글머리\n근무 수칙 | 글머리\n급여와 4대보험 | 표\n안전과 건강 | 글머리\n궁금할 때 | 글머리' },
    { id: 'edu', name: '직원 교육·워크숍', title: '실무자 역량강화 워크숍', sub: '현장에서 바로 쓰는 일하는 방식', toc: true, brk: true,
      chapters: '오늘의 목표 | 글머리\n핵심 내용 하나 | 글머리\n핵심 내용 둘 | 글머리, 인용\n함께 해 보기 | 글머리\n정리 | 숫자3' },
    { id: 'partner', name: '사업 설명회·협약', title: '○○ 업무협약 사업 설명회', sub: '함께 만드는 새 일', toc: true, brk: false,
      chapters: '회사 소개 | 글머리, 사진\n사업 내용 | 글머리\n기대 효과 | 숫자3\n협력 방안 | 표\n앞으로의 일정 | 표' },
    { id: 'ceremony', name: '수료식·시상식 식순', title: '2026년 사내 교육 수료식', sub: '한 해의 땀을 함께 축하합니다', toc: true, brk: false,
      chapters: '개회 선언\n국민의례\n인사말 | 글머리\n수료증 수여 | 표\n시상 | 표\n축사\n기념 촬영\n폐회' }
  ];
  var BYP = {}; PURPOSES.forEach(function (p) { BYP[p.id] = p; });
  var MOTIONS = [['cover', '표지', 'open', true], ['toc', '목차', 'steps', false], ['section', '장 전환', 'chapter', true], ['numbers', '숫자', 'nums', false], ['quote', '인용', 'quote', false], ['end', '마무리', 'thanks', true]];

  var deck = null;
  function fresh(pid) { var P = BYP[pid] || PURPOSES[0]; return { purpose: P.id, title: P.title, sub: P.sub, date: '', org: '', who: '', tel: '', url: '', chapters: P.chapters, toc: P.toc, brk: P.brk, motion: MOTIONS.reduce(function (o, m) { o[m[0]] = m[3]; return o; }, {}), still: true, contents: {} }; }
  function load() { try { deck = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { deck = null; } if (!deck || !BYP[deck.purpose]) deck = fresh('report'); if (!deck.motion) deck.motion = fresh(deck.purpose).motion; if (!deck.contents) deck.contents = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(deck)); } catch (e) { } }
  function lines(s, max) { return String(s || '').split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, max || 99); }
  function parseChapters(txt) { return lines(txt, 12).map(function (l) { var a = l.split('|'), t = a[0].trim(), sh = []; if (a.length > 1) a.slice(1).join('|').split(/[,·、]/).forEach(function (w) { w = w.trim(); if (SHAPES[w]) sh.push(SHAPES[w]); else if (w) sh.push('bullets'); }); return { title: t, shapes: sh.slice(0, 3) }; }); }
  function two(n) { return (n < 10 ? '0' : '') + n; }

  /* ---- 장표 차례 만들기 ---- */
  function plan() {
    var ch = parseChapters(deck.chapters), out = [], n = ch.length;
    var dateLine = [deck.date].filter(Boolean).join(' · ');
    out.push({ kind: 'cover', motion: 'cover' });
    if (deck.toc && n) out.push({ kind: 'toc', items: ch.map(function (c) { return c.title; }), motion: 'toc' });
    var brkAt = deck.brk && n > 1 ? Math.ceil(n / 2) - 1 : -1;
    ch.forEach(function (c, ci) {
      out.push({ kind: 'section', num: two(ci + 1), title: c.title, total: two(n), motion: 'section' });
      c.shapes.forEach(function (sh, si) { var key = ci + '-' + si, txt = deck.contents[key] || ''; out.push({ kind: sh, title: c.title, key: key, text: txt, motion: (sh === 'numbers' || sh === 'quote') && txt.trim() ? (sh === 'numbers' ? 'numbers' : 'quote') : null }); });
      if (ci === brkAt) out.push({ kind: 'break' });
    });
    out.push({ kind: 'end', motion: 'end' });
    return out;
  }
  function countSlides() { var pl = plan(), n = 0, mv = 0; pl.forEach(function (s) { var on = s.motion && deck.motion[s.motion]; if (on) { mv++; n += deck.still ? 2 : 1; } else n++; }); return { n: n, mv: mv }; }

  /* ---- 화면 ---- */
  function fillForm() {
    $('dPurpose').innerHTML = PURPOSES.map(function (p) { return '<option value="' + p.id + '">' + p.name + '</option>'; }).join('');
    $('dPurpose').value = deck.purpose;
    [['dTitle', 'title'], ['dSub', 'sub'], ['dDate', 'date'], ['dOrg', 'org'], ['dWho', 'who'], ['dTel', 'tel'], ['dUrl', 'url'], ['dChapters', 'chapters']].forEach(function (x) { $(x[0]).value = deck[x[1]] || ''; });
    $('dToc').checked = !!deck.toc; $('dBrk').checked = !!deck.brk; $('dStill').checked = deck.still !== false;
    $('dMotions').innerHTML = MOTIONS.map(function (m) { return '<label class="t" style="display:inline-flex;gap:4px;align-items:center"><input type="checkbox" data-mv="' + m[0] + '"' + (deck.motion[m[0]] ? ' checked' : '') + '> ' + m[1] + '</label>'; }).join(' ');
    renderContents(); updateCount();
  }
  function renderContents() {
    var ch = parseChapters(deck.chapters), h = '';
    ch.forEach(function (c, ci) { c.shapes.forEach(function (sh, si) { var key = ci + '-' + si; h += '<label class="fld"><span>' + (ci + 1) + '장 ' + M().esc(c.title) + ' · ' + SHAPE_NAME[sh] + '</span><textarea rows="' + (sh === 'table' ? 4 : 3) + '" data-ck="' + key + '" placeholder="' + M().esc(HINT[sh]) + '">' + M().esc(deck.contents[key] || '') + '</textarea></label>'; }); });
    $('dContents').innerHTML = h || '<p class="hint">모양을 정한 장이 없습니다. 장 목록에 「장 제목 | 글머리」처럼 모양을 붙이면 여기서 내용을 적을 수 있습니다.</p>';
  }
  function updateCount() { var c = countSlides(); $('dCount').textContent = '모두 ' + c.n + '장' + (c.mv ? ' · 움직이는 장면 ' + c.mv + '개' : '') + ' · 16:9'; }
  var rt = 0;
  function bind() {
    $('dPurpose').onchange = function () {
      var old = BYP[deck.purpose], nw = BYP[this.value], changed = deck.chapters.trim() !== old.chapters.trim() || Object.keys(deck.contents).some(function (k) { return deck.contents[k]; });
      if (changed && !confirm('「' + nw.name + '」 기본 장 목록으로 바꿀까요? 지금 적은 장 목록과 내용은 지워집니다.\n(취소하면 용도 이름만 바뀝니다)')) { deck.purpose = nw.id; save(); return; }
      var keep = { date: deck.date, org: deck.org, who: deck.who, tel: deck.tel, url: deck.url, motion: deck.motion, still: deck.still }; deck = Object.assign(fresh(nw.id), keep); save(); fillForm();
    };
    [['dTitle', 'title'], ['dSub', 'sub'], ['dDate', 'date'], ['dOrg', 'org'], ['dWho', 'who'], ['dTel', 'tel'], ['dUrl', 'url']].forEach(function (x) { $(x[0]).addEventListener('input', function () { deck[x[1]] = this.value; save(); }); });
    $('dChapters').addEventListener('input', function () { deck.chapters = this.value; save(); updateCount(); clearTimeout(rt); rt = setTimeout(renderContents, 500); });
    $('dContents').addEventListener('input', function (e) { var k = e.target.dataset && e.target.dataset.ck; if (!k) return; deck.contents[k] = e.target.value; save(); updateCount(); });
    $('dToc').onchange = function () { deck.toc = this.checked; save(); updateCount(); };
    $('dBrk').onchange = function () { deck.brk = this.checked; save(); updateCount(); };
    $('dStill').onchange = function () { deck.still = this.checked; save(); updateCount(); };
    $('dMotions').addEventListener('change', function (e) { var k = e.target.dataset && e.target.dataset.mv; if (!k) return; deck.motion[k] = e.target.checked; save(); updateCount(); });
    $('dReset').onclick = function () { if (!confirm('이 용도의 기본 제목·장 목록으로 되돌릴까요? 적은 내용은 지워집니다.')) return; var keep = { date: deck.date, org: deck.org, who: deck.who, tel: deck.tel, url: deck.url }; deck = Object.assign(fresh(deck.purpose), keep); save(); fillForm(); };
    $('dBuild').onclick = build;
  }

  /* ---- 테마 → PowerPoint 색·모양 ---- */
  function hex(c) { return String(c || '#000000').replace('#', '').toUpperCase().slice(0, 6); }
  function rgba(str) { // 'rgba(r,g,b,a)' 또는 '#RRGGBB' → {color, transparency}
    str = String(str || ''); var m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\)/.exec(str);
    if (m) { var to = function (n) { var h = (+n).toString(16).toUpperCase(); return h.length < 2 ? '0' + h : h; }; return { color: to(m[1]) + to(m[2]) + to(m[3]), transparency: Math.round((1 - (m[4] == null ? 1 : +m[4])) * 100) }; }
    return { color: hex(str), transparency: 0 };
  }
  function lookOf() {
    var st = M().state, th = S.themeOf(st.theme), cv = document.createElement('canvas'); cv.width = 16; cv.height = 9;
    var F = S.makeF(cv.getContext('2d'), 1920, 1080, 'sans-serif', st.theme), p = { _bg: st.bg, _c1: st.c1, _c2: st.c2, _trans: false };
    var light = F.light(st.bg), card = rgba(F.card(p)), stroke = th.glow ? rgba(st.c1 + '') : (th.stroke ? rgba(th.stroke) : null);
    if (th.glow) stroke = { color: hex(st.c1), transparency: 35 };
    return { th: th, bg: hex(st.bg), c1: hex(st.c1), c2: hex(st.c2), tx: light ? '1A2B50' : 'FFFFFF', sub: light ? '5B6885' : 'C9D3EE', ph: light ? '9AA4B8' : '7F8BA8', light: light,
      card: card, stroke: stroke, radius: Math.max(.04, .12 * (th.radius == null ? 1 : th.radius)), font: (th.font || '').indexOf('Serif') >= 0 ? '바탕' : '맑은 고딕' };
  }
  function bgImage(plain) { var st = M().state, cv = document.createElement('canvas'); cv.width = 1920; cv.height = 1080; var ctx = cv.getContext('2d'); var F = S.makeF(ctx, 1920, 1080, 'sans-serif', st.theme); var p = { _bg: st.bg, _c1: st.c1, _c2: st.c2, _tx: '#fff', _trans: false, _logo: null }; ctx.fillStyle = st.bg; ctx.fillRect(0, 0, 1920, 1080); F.bg(p, 0, null, plain ? { plain: true } : {}); return cv.toDataURL('image/jpeg', .9).replace(/^data:/, ''); }
  function imgData(img, maxW) { if (!img || !img.naturalWidth) return null; var r = Math.min(1, maxW / img.naturalWidth), cv = document.createElement('canvas'); cv.width = Math.round(img.naturalWidth * r); cv.height = Math.round(img.naturalHeight * r); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); return { data: cv.toDataURL('image/png').replace(/^data:/, ''), ar: cv.width / cv.height }; }
  function qrData(url) { if (!url || !window.qrcode) return null; try { var q = window.qrcode(0, 'M'); q.addData(url.trim()); q.make(); var n = q.getModuleCount(), cell = 10, pad = 4 * cell, size = n * cell + pad * 2, cv = document.createElement('canvas'); cv.width = cv.height = size; var x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, size, size); x.fillStyle = '#1A2B50'; for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) x.fillRect(pad + c * cell, pad + r * cell, cell, cell); return cv.toDataURL('image/png').replace(/^data:/, ''); } catch (e) { return null; } }

  /* ---- 장표 그리기 (16:9 = 10 × 5.625 인치) ---- */
  function drawSlide(pptx, L, s, ctx) {
    var cover = s.kind === 'cover' || s.kind === 'end' || s.kind === 'section' || s.kind === 'break';
    var sl = pptx.addSlide({ masterName: cover ? 'MG_COVER' : 'MG_BODY' }), F = L.font;
    function T(text, o) { sl.addText(text, Object.assign({ fontFace: F, color: L.tx, margin: 0, valign: 'middle', fit: 'shrink' }, o)); }
    function card(x, y, w, h, o) { o = o || {}; var fill = o.hot ? { color: L.c1 } : { color: L.card.color, transparency: L.card.transparency }; var line = o.hot || !L.stroke ? { type: 'none' } : { color: L.stroke.color, transparency: L.stroke.transparency, width: 1 }; sl.addShape(pptx.ShapeType.roundRect, { x: x, y: y, w: w, h: h, fill: fill, line: line, rectRadius: L.radius, shadow: L.th.shadow ? { type: 'outer', blur: 8, offset: 2, angle: 90, color: '000000', opacity: .12 } : undefined }); }
    function head(title) { T(title, { x: .6, y: .32, w: 8.8, h: .7, fontSize: 26, bold: true }); sl.addShape(pptx.ShapeType.rect, { x: .6, y: 1.04, w: .8, h: .06, fill: { color: L.c2 }, line: { type: 'none' } }); }
    var notes = { cover: '표지 — 제목·부제·날짜는 글상자를 눌러 바로 고치세요. 로고는 공통 칸에서 넣은 것이 들어갑니다.', toc: '목차 — 장 제목이 바뀌면 여기도 함께 고치세요.', section: '장 전환(간지) — 이 장의 시작을 알립니다.', bullets: '글머리 — 한 줄에 한 가지. 회색 글은 채울 자리이니 지우고 적으세요.', numbers: '숫자 3칸 — 큰 숫자·단위·이름을 고치세요. 칸을 줄이려면 상자를 지우면 됩니다.', table: '표 — PowerPoint 표라 줄·칸 더하기(표 레이아웃)가 됩니다.', photo: '사진 — 회색 상자 자리에 「삽입 › 그림」으로 사진을 넣고 회색 상자는 지우세요.', quote: '인용 — 실명 대신 가명·이니셜을 권합니다.', 'break': '쉬는 시간 — 현장에서는 모션 도구의 「쉬는 시간 타이머」를 전체화면으로 띄워도 좋습니다.', end: '마무리 — 연락처·QR을 확인하세요.' };
    if (s.kind === 'cover') {
      if (ctx.logo) { var lh = .8, lw = Math.min(2.6, lh * ctx.logo.ar); if (lw === 2.6) lh = lw / ctx.logo.ar; sl.addImage({ data: ctx.logo.data, x: 5 - lw / 2, y: .5, w: lw, h: lh }); }
      else if (deck.org) T(deck.org, { x: 1, y: .55, w: 8, h: .55, fontSize: 18, bold: true, align: 'center', color: L.sub });
      T(deck.title || '발표 제목', { x: .8, y: 1.55, w: 8.4, h: 1.3, fontSize: 40, bold: true, align: 'center' });
      sl.addShape(pptx.ShapeType.rect, { x: 4.4, y: 2.98, w: 1.2, h: .05, fill: { color: L.c2 }, line: { type: 'none' } });
      if (deck.sub) T(deck.sub, { x: 1, y: 3.12, w: 8, h: .55, fontSize: 20, align: 'center', color: L.sub });
      if (deck.date) { sl.addShape(pptx.ShapeType.roundRect, { x: 2.6, y: 3.9, w: 4.8, h: .5, fill: { color: L.c1 }, line: { type: 'none' }, rectRadius: .25 }); T(deck.date, { x: 2.6, y: 3.9, w: 4.8, h: .5, fontSize: 16, align: 'center', color: 'FFFFFF', bold: true }); }
      if (deck.who) T(deck.who, { x: 1, y: 4.6, w: 8, h: .4, fontSize: 14, align: 'center', color: L.sub });
    } else if (s.kind === 'toc') {
      T(deck.purpose === 'ceremony' ? '식순' : '목차', { x: .6, y: .32, w: 8.8, h: .7, fontSize: 28, bold: true });
      var its = s.items, cols = its.length > 6 ? 2 : 1, per = Math.ceil(its.length / cols), colW = cols === 2 ? 4.3 : 8.8, rh = Math.min(.62, 3.9 / per);
      its.forEach(function (t, i) { var c = Math.floor(i / per), r = i % per, x = .6 + c * 4.5, y = 1.35 + r * rh; sl.addShape(pptx.ShapeType.ellipse, { x: x, y: y + (rh - .44) / 2, w: .44, h: .44, fill: { color: L.c1 }, line: { type: 'none' } }); T(String(i + 1), { x: x, y: y + (rh - .44) / 2, w: .44, h: .44, fontSize: 15, bold: true, align: 'center', color: 'FFFFFF' }); T(t, { x: x + .62, y: y, w: colW - .7, h: rh, fontSize: 20 }); });
    } else if (s.kind === 'section') {
      T(s.num, { x: .8, y: 1.0, w: 3, h: 1.5, fontSize: 88, bold: true, color: L.c1, valign: 'bottom' });
      sl.addShape(pptx.ShapeType.rect, { x: .85, y: 2.62, w: .12, h: 1.1, fill: { color: L.c2 }, line: { type: 'none' } });
      T(s.title, { x: 1.15, y: 2.55, w: 8.2, h: 1.25, fontSize: 40, bold: true });
      T(s.num + ' / ' + s.total, { x: 1.15, y: 3.85, w: 4, h: .4, fontSize: 14, color: L.sub });
    } else if (s.kind === 'bullets') {
      head(s.title); card(.6, 1.35, 8.8, 3.8);
      var ls = lines(s.text, 8), ph = !ls.length; if (ph) ls = ['첫 번째 내용을 적으세요', '두 번째 내용을 적으세요', '세 번째 내용을 적으세요'];
      sl.addText(ls.map(function (t) { return { text: t, options: { bullet: { indent: 18 }, breakLine: true } }; }), { x: .95, y: 1.55, w: 8.1, h: 3.4, fontFace: F, fontSize: ls.length > 5 ? 18 : 22, color: ph ? L.ph : L.tx, italic: ph, valign: 'top', paraSpaceAfter: 10, fit: 'shrink' });
    } else if (s.kind === 'numbers') {
      head(s.title); var rows = lines(s.text, 3).map(function (l) { return l.split('|').map(function (x) { return x.trim(); }); }), ph2 = !rows.length; if (ph2) rows = [['항목 이름', '00', '명'], ['항목 이름', '00', '%'], ['항목 이름', '00', '건']];
      var nn = rows.length, gap = .35, w = (8.8 - gap * (nn - 1)) / nn;
      rows.forEach(function (r, i) { var x = .6 + i * (w + gap); card(x, 1.5, w, 3.3); sl.addText([{ text: r[1] || '0', options: { fontSize: 44, bold: true, color: ph2 ? L.ph : L.c1 } }, { text: r[2] ? ' ' + r[2] : '', options: { fontSize: 20, color: ph2 ? L.ph : L.tx } }], { x: x + .1, y: 1.95, w: w - .2, h: 1.2, fontFace: F, align: 'center', valign: 'middle', margin: 0, fit: 'shrink' }); sl.addShape(pptx.ShapeType.rect, { x: x + w / 2 - .3, y: 3.3, w: .6, h: .04, fill: { color: L.c2 }, line: { type: 'none' } }); T(r[0] || '', { x: x + .15, y: 3.5, w: w - .3, h: .8, fontSize: 18, align: 'center', color: ph2 ? L.ph : L.tx, italic: ph2 }); });
    } else if (s.kind === 'table') {
      head(s.title); var tr = lines(s.text, 8).map(function (l) { return l.split('|').map(function (x) { return x.trim(); }); }), ph3 = !tr.length; if (ph3) tr = [['구분', '내용', '비고'], ['채울 자리', '', ''], ['채울 자리', '', ''], ['채울 자리', '', '']];
      var nc = Math.min(5, Math.max.apply(null, tr.map(function (r) { return r.length; }))), body = tr.map(function (r, ri) { var cells = []; for (var c = 0; c < nc; c++) cells.push({ text: r[c] || '', options: ri === 0 ? { bold: true, color: 'FFFFFF', fill: { color: L.c1 }, align: 'center' } : { color: ph3 ? L.ph : L.tx, fill: { color: L.card.color, transparency: L.card.transparency }, align: c === 0 ? 'left' : 'center' } }); return cells; });
      var rhh = Math.min(.5, 3.8 / tr.length);
      sl.addTable(body, { x: .6, y: 1.38, w: 8.8, rowH: rhh, fontFace: F, fontSize: tr.length > 6 ? 13 : 16, valign: 'middle', border: { type: 'solid', pt: .75, color: L.light ? 'C9D3E6' : '3B4A7A' }, margin: .06, autoPage: false });
    } else if (s.kind === 'photo') {
      head(s.title); sl.addShape(pptx.ShapeType.roundRect, { x: .6, y: 1.35, w: 5.5, h: 3.8, fill: { color: L.light ? 'E3E8F2' : '2A3560' }, line: { color: L.ph, width: 1, dashType: 'dash' }, rectRadius: L.radius });
      T('사진 넣을 자리\n(삽입 › 그림으로 넣은 뒤 이 상자는 지우세요)', { x: .8, y: 2.6, w: 5.1, h: 1.2, fontSize: 14, align: 'center', color: L.ph });
      card(6.35, 1.35, 3.05, 3.8); var cap = s.text.trim(); T(cap || '사진 설명을 적으세요', { x: 6.55, y: 1.55, w: 2.65, h: 3.4, fontSize: 16, valign: 'top', color: cap ? L.tx : L.ph, italic: !cap });
    } else if (s.kind === 'quote') {
      head(s.title); var ql = lines(s.text, 2), ph4 = !ql.length; if (ph4) ql = ['참가자의 말을 적으세요', '— 참가자 ○○○ 님'];
      card(.9, 1.5, 8.2, 3.2); sl.addShape(pptx.ShapeType.rect, { x: .9, y: 1.5, w: .1, h: 3.2, fill: { color: L.c1 }, line: { type: 'none' } });
      T('“', { x: 1.2, y: 1.6, w: .8, h: .8, fontSize: 60, bold: true, color: L.c1, valign: 'top' });
      T(ql[0], { x: 1.5, y: 2.2, w: 7.2, h: 1.65, fontSize: 24, color: ph4 ? L.ph : L.tx, italic: ph4 });
      T(ql[1] || '', { x: 1.4, y: 3.95, w: 7.3, h: .5, fontSize: 15, align: 'right', color: L.sub });
    } else if (s.kind === 'break') {
      T('☕', { x: 4, y: 1.0, w: 2, h: 1.1, fontSize: 60, align: 'center' });
      T('잠시 쉬어 가겠습니다', { x: 1, y: 2.25, w: 8, h: .9, fontSize: 36, bold: true, align: 'center' });
      T('10분 뒤에 다시 시작합니다', { x: 1, y: 3.2, w: 8, h: .55, fontSize: 20, align: 'center', color: L.sub });
    } else if (s.kind === 'end') {
      var qx = ctx.qr ? 1 : 0, tw = qx ? 5.6 : 8;
      T('감사합니다', { x: qx ? .8 : 1, y: 1.3, w: tw, h: 1.1, fontSize: 48, bold: true, align: qx ? 'left' : 'center' });
      var info = [deck.who, deck.org, deck.tel].filter(Boolean).join('  ·  ');
      if (info) T(info, { x: qx ? .8 : 1, y: 2.55, w: tw, h: .5, fontSize: 16, align: qx ? 'left' : 'center', color: L.sub });
      if (deck.title) T(deck.title, { x: qx ? .8 : 1, y: 3.1, w: tw, h: .45, fontSize: 14, align: qx ? 'left' : 'center', color: L.sub });
      if (ctx.qr) { card(6.9, 1.25, 2.4, 2.9); sl.addImage({ data: ctx.qr, x: 7.15, y: 1.4, w: 1.9, h: 1.9 }); T('휴대폰 카메라로 찍어 주세요', { x: 6.9, y: 3.4, w: 2.4, h: .5, fontSize: 11, align: 'center', color: L.sub }); }
    }
    sl.addNotes('[발표 뼈대] ' + (notes[s.kind] || ''));
    return sl;
  }
  function poster(id) { var m = M(), cv = document.createElement('canvas'); cv.width = 1280; cv.height = 720; var d = m.dur(id); m.drawFrame(cv.getContext('2d'), 1280, 720, Math.max(0, d - .15), id, false); return cv.toDataURL('image/jpeg', .85); }
  function addMotionSlide(pptx, L, blob64, s, link, cover) { var sl = pptx.addSlide({ masterName: 'MG_COVER' }); sl.background = { color: L.bg }; sl.addMedia({ type: 'video', data: blob64, cover: cover, x: 0, y: 0, w: 10, h: 5.625 }); sl.addNotes('[움직이는 장면] 슬라이드가 열리면 자동으로 재생됩니다. 글자를 고치려면 아래 링크를 열어 고친 뒤 다시 받아 비디오를 바꿔 넣으세요(영상 안 글자는 PowerPoint에서 못 고칩니다).\n' + link); return sl; }
  function motionParams(s, chN) {
    var ch = parseChapters(deck.chapters);
    if (s.motion === 'cover') return ['open', { title: deck.title, sub: deck.sub, date: deck.date, org: deck.org || ' ' }];
    if (s.motion === 'toc') return ['steps', { title: deck.purpose === 'ceremony' ? '식순' : '오늘의 순서', items: ch.slice(0, 6).map(function (c) { return c.title; }).join('\n') }];
    if (s.motion === 'section') return ['chapter', { num: s.num, title: s.title, sub: '', total: s.total }];
    if (s.motion === 'numbers') return ['nums', { title: s.title, items: lines(s.text, 3).join('\n') }];
    if (s.motion === 'quote') { var q = lines(s.text, 2); return ['quote', { text: q[0] || '', who: q[1] || '' }]; }
    if (s.motion === 'end') return ['thanks', { title: '감사합니다', sub: [deck.who, deck.tel].filter(Boolean).join(' · ') || deck.title || '', url: deck.url || '', org: deck.org || ' ' }];
    return null;
  }

  /* ---- 만들기 ---- */
  async function build() {
    var m = M(), st = m.state; if (m.isBusy()) return;
    var pl = plan(); if (pl.length < 3) { m.toast('장 목록을 한 줄 이상 적어 주세요.'); return; }
    m.setBusy(true); m.progress(true, '발표 뼈대 준비 중(라이브러리 불러오기)…', 0);
    var keepRatio = st.ratio, keepP = {}, ok = true, out = null, durs = [];
    try {
      await MGBundle.libs(); await m.fontsReady();
      var L = lookOf(), pptx = new PptxGenJS(); pptx.layout = 'LAYOUT_16x9'; pptx.title = deck.title || '발표 뼈대'; pptx.author = deck.org || '즉석 모션그래픽'; pptx.theme = { headFontFace: L.font, bodyFontFace: L.font };
      pptx.defineSlideMaster({ title: 'MG_COVER', background: { data: bgImage(false) }, objects: [] });
      pptx.defineSlideMaster({ title: 'MG_BODY', background: { data: bgImage(true) }, objects: deck.org ? [{ text: { text: deck.org, options: { x: .6, y: 5.18, w: 5, h: .3, fontFace: L.font, fontSize: 10, color: L.sub } } }] : [], slideNumber: { x: 9.0, y: 5.18, w: .6, h: .3, fontFace: L.font, fontSize: 10, color: L.sub, align: 'right' } });
      var ctx = { logo: imgData(m.images.logo, 600), qr: qrData(deck.url) };
      st.ratio = '16:9';
      var total = pl.length, mvTotal = pl.filter(function (s) { return s.motion && deck.motion[s.motion]; }).length, mvDone = 0;
      for (var i = 0; i < pl.length; i++) {
        var s = pl[i];
        if (s.motion && deck.motion[s.motion]) {
          var mp = motionParams(s); if (mp) {
            var id = mp[0]; if (!(id in keepP)) keepP[id] = st.p[id]; st.p[id] = Object.assign({}, st.p[id] || {}, mp[1]);
            var blob = await m.renderMp4(id, 1280, 720, '(움직이는 장면 ' + (++mvDone) + '/' + mvTotal + ')', 2500000);
            if (m.cancelled()) { ok = false; break; }
            if (blob) { var sp = new URLSearchParams(); Object.keys(mp[1]).forEach(function (k) { sp.set(k, mp[1][k]); }); ['theme', 'c1', 'c2', 'bg'].forEach(function (k) { sp.set(k, st[k]); }); sp.set('ratio', '16:9'); addMotionSlide(pptx, L, (await MGBundle.blobToDataURL(blob)).replace(/^data:/, ''), s, 'https://jahwalktg.github.io/kaltoe/t/motion/index.html#' + id + '&' + sp.toString(), poster(id)); durs.push(m.dur(id)); if (!deck.still) continue; }
          }
        }
        m.progress(true, '장표 그리는 중… ' + (i + 1) + ' / ' + total, (i + 1) / total);
        drawSlide(pptx, L, s, ctx); durs.push(0);
      }
      if (ok) { m.progress(true, 'PPT 파일 묶는 중…', .98); out = await pptx.write({ outputType: 'blob' }); if (durs.some(function (d) { return d > 0; })) out = await MGBundle.postProcess(out, durs, false); }
    } catch (e) { console.error(e); m.toast('발표 뼈대를 만들지 못했습니다: ' + e.message); ok = false; }
    st.ratio = keepRatio; Object.keys(keepP).forEach(function (id) { if (keepP[id]) st.p[id] = keepP[id]; else delete st.p[id]; });
    if (ok && out) { var nm = '[발표 뼈대] ' + String(deck.title || '발표').replace(/[\\/:*?"<>|]/g, '').slice(0, 30) + '.pptx'; m.download(out, nm); m.toast('발표 뼈대 PPT를 받았습니다 (' + durs.length + '장, ' + (out.size / 1048576).toFixed(1) + 'MB). PowerPoint에서 글상자를 눌러 바로 고치세요.'); }
    m.setBusy(false); m.progress(false);
  }

  function init() { if (!$('deckBox')) return; load(); fillForm(); bind(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.MGDeck = { build: build, plan: plan, deck: function () { return deck; }, PURPOSES: PURPOSES, reset: function (pid) { deck = fresh(pid || 'report'); save(); fillForm(); } };
})();
