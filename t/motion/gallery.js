/* 즉석 모션그래픽 — 전체 장면 한눈에 보기(갤러리)
   왼쪽 목록은 「빨리 고르기」용으로 그대로 두고, 처음 온 사람이 둘러볼 수 있게 화면 전체를 덮는 갤러리를 하나 더 둠.
   묶음별 격자 · 큰 미리보기(320×180, 지금 테마·색) · 이름 · 한 줄 설명 · 찾는 말 — 마우스를 올리면 그 칸에서 실제로 움직이고, 누르면 그 장면으로. */
(function () {
  var S = window.MG; function M() { return window._mg; } function $(id) { return document.getElementById(id); }
  var open = false, hover = null, raf = 0, drawn = {}, q = '', sit = '';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function thumb(cv, id, t) { var m = M(), st = m.state, keep = st.ratio; st.ratio = '16:9'; try { var ctx = cv.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); if (st.bgMode === 'trans') { ctx.fillStyle = '#333'; ctx.fillRect(0, 0, cv.width, cv.height); } m.drawFrame(ctx, cv.width, cv.height, t, id, false); } catch (e) { } st.ratio = keep; }
  function midT(id) { var sc = S.BY[id], d = M().dur(id); return sc.liveOnly ? 100 : Math.min(d * .62, d - .1); }
  function card(sc) {
    var tags = (S.TAGS[sc.id] || '').split(' ').filter(Boolean).slice(0, 5).join(' · ');
    return '<div class="gc" data-id="' + sc.id + '" role="button" tabindex="0"><div class="gth"><canvas width="320" height="180" data-gth="' + sc.id + '"></canvas>' + (sc.liveOnly ? '<span class="gtag">현장 재생용</span>' : '') + (sc.marks ? '<span class="gtag">단계 넘김</span>' : '') + '<span class="ghint">▶ 올리면 움직임</span></div><div class="gb"><b>' + sc.icon + ' ' + esc(sc.name) + '</b>' + ((S.WHEN || {})[sc.id] ? '<span class="gw">이럴 때 · ' + esc(S.WHEN[sc.id]) + '</span>' : '') + '<p>' + esc(sc.desc) + '</p><small>' + esc(tags) + '</small></div><div class="gops"><button type="button" class="btn main" data-pick="' + sc.id + '">이 장면 쓰기</button>' + (sc.liveOnly ? '' : '<button type="button" class="btn" data-gadd="' + sc.id + '" title="PPT 묶음에 담기">＋ 담기</button>') + '</div></div>';
  }
  function visibleIds() {
    var ids = S.SCENES.map(function (s) { return s.id; });
    if (q) { var r = M().searchIds(q); ids = ids.filter(function (id) { return r.indexOf(id) >= 0; }); }
    if (sit) { var st = (S.SITUATIONS || []).filter(function (x) { return x.id === sit; })[0]; if (st) ids = st.scenes.filter(function (id) { return ids.indexOf(id) >= 0; }); }
    return ids;
  }
  function render() {
    var body = $('galBody'), ids = visibleIds(), h = '';
    if (sit) { var st = S.SITUATIONS.filter(function (x) { return x.id === sit; })[0]; h += '<div class="gsec"><h3>' + st.icon + ' ' + st.name + ' <small>' + st.desc + ' — 순서대로</small></h3><div class="ggrid">' + ids.map(function (id, i) { return card(S.BY[id]).replace('<div class="gth">', '<div class="gth"><span class="gnum">' + (i + 1) + '</span>'); }).join('') + '</div></div>'; }
    else { S.GROUPS.forEach(function (g) { var list = ids.filter(function (id) { return S.BY[id].group === g; }); if (!list.length) return; h += '<div class="gsec" id="gsec_' + g + '"><h3>' + g + ' <small>' + list.length + '개</small></h3><div class="ggrid">' + list.map(function (id) { return card(S.BY[id]); }).join('') + '</div></div>'; }); }
    if (!ids.length) h = '<p class="hint" style="padding:30px;text-align:center">맞는 장면이 없습니다. 다른 말로 찾아보세요(예: 시상, 타이머, QR, 국기).</p>';
    body.innerHTML = h; $('galCnt').textContent = ids.length + ' / ' + S.SCENES.length;
    drawn = {}; queueDraw();
    body.querySelectorAll('[data-pick]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); pick(b.dataset.pick); }; });
    body.querySelectorAll('[data-gadd]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); if (window.MGBundle) MGBundle.add(b.dataset.gadd); }; });
    body.querySelectorAll('.gc').forEach(function (c) { c.onclick = function () { pick(c.dataset.id); }; c.onkeydown = function (e) { if (e.key === 'Enter') pick(c.dataset.id); }; c.onmouseenter = function () { startHover(c); }; c.onmouseleave = function () { stopHover(c); }; });
  }
  var dq = [], dt = 0;
  function queueDraw() { dq = [].slice.call($('galBody').querySelectorAll('canvas[data-gth]')); if (!dt) dt = setTimeout(drawSome, 20); }
  function drawSome() { dt = 0; var n = 0; while (dq.length && n < 4) { var cv = dq.shift(); var id = cv.dataset.gth; if (!drawn[id]) { thumb(cv, id, midT(id)); drawn[id] = true; } n++; } if (dq.length) dt = setTimeout(drawSome, 16); }
  function startHover(c) { stopHover(); var cv = c.querySelector('canvas'), id = c.dataset.id, d = M().dur(id), t0 = performance.now(); hover = { c: c, cv: cv, id: id }; c.classList.add('live'); (function loop(now) { if (!hover || hover.c !== c) return; var t = ((now - t0) / 1000) % Math.max(.5, d); thumb(cv, id, t); raf = requestAnimationFrame(loop); })(t0); }
  function stopHover(c) { if (raf) cancelAnimationFrame(raf); raf = 0; if (hover) { hover.c.classList.remove('live'); thumb(hover.cv, hover.id, midT(hover.id)); } hover = null; }
  function pick(id) { close(); M().selectScene(id); }
  function show() { open = true; $('gal').classList.add('on'); document.body.classList.add('noscroll'); $('galQ').value = q; sitRow(); render(); setTimeout(function () { $('galQ').focus(); }, 50); }
  function close() { open = false; stopHover(); $('gal').classList.remove('on'); document.body.classList.remove('noscroll'); }
  function sitRow() { var h = '<button type="button" class="gt' + (sit === '' ? ' on' : '') + '" data-gsit="">전체</button>'; (S.SITUATIONS || []).forEach(function (st) { h += '<button type="button" class="gt' + (sit === st.id ? ' on' : '') + '" data-gsit="' + st.id + '">' + st.icon + ' ' + st.name + '</button>'; }); $('galSits').innerHTML = h; $('galSits').querySelectorAll('[data-gsit]').forEach(function (b) { b.onclick = function () { sit = b.dataset.gsit; sitRow(); render(); }; }); }
  /* 내 사진으로 미리보기: 사진 칸이 비어 있는 장면에 시험용으로 넣어 갤러리에서 한꺼번에 봄 */
  var sampleKeys = [];
  function photoFields() { var out = []; S.SCENES.forEach(function (sc) { sc.fields.forEach(function (f) { if (f.type === 'image' || f.type === 'images') out.push({ id: sc.id, f: f }); }); }); return out; }
  function setSample(img) { clearSample(false); var fi = M().fieldImgs; photoFields().forEach(function (x) { var k = x.id + '.' + x.f.k; if (fi[k] && !(Array.isArray(fi[k]) && !fi[k].length)) return; fi[k] = x.f.type === 'images' ? [img, img, img, img] : img; sampleKeys.push(k); }); $('galPhotoNote').textContent = '내 사진을 ' + sampleKeys.length + '곳에 시험으로 넣었습니다(원래 넣어 둔 사진은 그대로). 「사진 빼기」로 되돌립니다.'; $('galPhotoDel').hidden = false; render(); M().refreshThumbs(); }
  function clearSample(re) { var fi = M().fieldImgs; sampleKeys.forEach(function (k) { delete fi[k]; }); sampleKeys = []; $('galPhotoNote').textContent = '「내 사진으로 미리보기」: 사진 한 장을 고르면 사진 칸이 비어 있는 장면에 시험으로 들어가, 내 사진으로 어떻게 보일지 한꺼번에 볼 수 있습니다. 원래 넣어 둔 사진은 건드리지 않습니다.'; $('galPhotoDel').hidden = true; if (re !== false) { render(); M().refreshThumbs(); } }
  function init() {
    if (!$('gal')) return;
    $('galPhoto').onchange = function () { var f = this.files && this.files[0]; if (!f) return; var url = URL.createObjectURL(f), img = new Image(); img.onload = function () { setSample(img); }; img.src = url; };
    $('galPhotoDel').onclick = function () { clearSample(true); };
    $('galBtn').onclick = show; $('galClose').onclick = close;
    $('galQ').addEventListener('input', function () { q = this.value.trim(); render(); });
    document.addEventListener('keydown', function (e) { if (open && e.key === 'Escape') close(); });
    $('gal').addEventListener('click', function (e) { if (e.target === $('gal')) close(); });
    // 테마·색이 바뀐 뒤 다시 열면 새로 그림(render가 drawn을 비움)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.MGGallery = { show: show, close: close };
})();
