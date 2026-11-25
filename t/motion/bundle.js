/* 즉석 모션그래픽 — PPT 묶음(장바구니)
   장면 카드의 ＋ → 지금 입력·디자인을 그대로 담음 → 순서 → 슬라이드마다 장면 하나(GIF 또는 MP4)인 PPTX 한 파일.
   - 담기는 글자 입력·테마·색만 저장(브라우저 localStorage). 사진·로고·음원은 만들 때 지금 들어 있는 것을 씀.
   - MP4는 PowerPoint가 「자동 실행」하도록 슬라이드 XML에 재생 타이밍을 써 넣음(GIF는 원래 저절로 움직임).
   - 라이브러리(PptxGenJS·JSZip)는 「PPT 파일로 받기」를 누를 때 처음 한 번 불러옴. */
(function () {
  var S = window.MG, KEY = 'kaltoe.motion.v1.cart', items = [], active = -1;
  function M() { return window._mg; }
  function $(id) { return document.getElementById(id); }
  try { items = JSON.parse(localStorage.getItem(KEY) || '[]'); if (!Array.isArray(items)) items = []; } catch (e) { items = []; }
  items = items.filter(function (it) { return it && S.BY[it.id]; });
  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { } }
  function textParams(id) { var sc = S.BY[id], p = M().params(id), o = {}; sc.fields.forEach(function (f) { if (['image', 'images', 'audio'].indexOf(f.type) < 0) o[f.k] = p[f.k]; }); return o; }
  function look() { var st = M().state; return { theme: st.theme, c1: st.c1, c2: st.c2, bg: st.bg, bgMode: st.bgMode }; }
  function snippet(it) { var sc = S.BY[it.id], pref = ['title', 'name', 'text', 'prize', 'q', 'hello', 'label'], keys = Object.keys(it.p || {}), k = pref.filter(function (x) { return it.p[x]; })[0] || keys.filter(function (x) { var f = sc.fields.filter(function (ff) { return ff.k === x; })[0]; return f && (!f.type || f.type === 'text' || f.type === 'lines') && it.p[x]; })[0]; var v = k ? String(it.p[k]).split('\n')[0] : ''; return v.length > 22 ? v.slice(0, 22) + '…' : v; }

  function add(id) {
    var sc = S.BY[id]; if (!sc || sc.liveOnly) return;
    items.push({ id: id, p: textParams(id), look: look(), ts: Date.now() }); save(); render();
    var hasMedia = sc.fields.some(function (f) { return f.type === 'image' || f.type === 'images' || f.type === 'audio'; });
    M().toast('PPT 묶음에 담았습니다 (' + items.length + '개). ' + (hasMedia ? '사진·음원은 저장되지 않아, 만들 때 지금 들어 있는 것을 씁니다.' : '오른쪽 아래 「④ PPT 묶음」에서 순서를 맞추세요.'));
  }
  function applyItem(i) {
    var it = items[i]; if (!it) return; var st = M().state, m = M();
    ['theme', 'c1', 'c2', 'bg', 'bgMode'].forEach(function (k) { if (it.look && it.look[k] != null) { st[k] = it.look[k]; var el = $(k); if (el) el.value = st[k]; } });
    if (!S.THEMES[st.theme]) st.theme = 'classic'; var tn = $('themeNote'); if (tn) tn.textContent = S.themeOf(st.theme).desc; $('bg').disabled = st.bgMode === 'trans';
    st.p[it.id] = Object.assign({}, st.p[it.id] || {}, it.p); active = i; m.selectScene(it.id); m.refreshThumbs(); render();
    m.toast('묶음 ' + (i + 1) + '번을 불러왔습니다. 고친 뒤 「이 설정으로 바꾸기」를 누르면 묶음에 반영됩니다.');
  }
  function render() {
    var box = $('cart'), n = $('cartN'); if (!box) return; n.textContent = items.length;
    if (!items.length) { box.innerHTML = '<p class="hint">아직 담은 장면이 없습니다. 왼쪽 장면 카드의 <b>＋</b>를 누르세요.</p>'; $('bBuild').disabled = true; return; }
    $('bBuild').disabled = false;
    var tot = 0, h = '';
    items.forEach(function (it, i) { var sc = S.BY[it.id], sn = snippet(it), th = S.themeOf(it.look && it.look.theme); h += '<div class="ci' + (i === active ? ' on' : '') + '" data-i="' + i + '"><span class="n">' + (i + 1) + '</span><button type="button" class="nm" data-load="' + i + '" title="이 장면을 불러와 고치기">' + sc.icon + ' ' + sc.name.split(' — ')[0] + (sn ? ' <em>' + M().esc(sn) + '</em>' : '') + '<small>' + th.name + ' · ' + M().fmtT(estDur(it)) + '</small></button><span class="ops"><button type="button" data-up="' + i + '" title="위로">↑</button><button type="button" data-dn="' + i + '" title="아래로">↓</button><button type="button" data-del="' + i + '" title="빼기">✕</button></span></div>'; tot += estDur(it); });
    h += '<div class="hint" style="margin-top:6px">' + items.length + '장면 · 모두 ' + M().fmtT(tot) + ' · 비율은 지금 고른 「화면 비율」(' + M().state.ratio + ')로 만듭니다.' + (active >= 0 ? ' <button type="button" class="btn" id="bUpd" style="min-height:30px;font-size:.78rem">' + (active + 1) + '번을 이 설정으로 바꾸기</button>' : '') + '</div>';
    box.innerHTML = h;
    box.querySelectorAll('[data-load]').forEach(function (b) { b.onclick = function () { applyItem(+b.dataset.load); }; });
    box.querySelectorAll('[data-up]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.up; if (i > 0) { var t = items[i - 1]; items[i - 1] = items[i]; items[i] = t; if (active === i) active = i - 1; else if (active === i - 1) active = i; save(); render(); } }; });
    box.querySelectorAll('[data-dn]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.dn; if (i < items.length - 1) { var t = items[i + 1]; items[i + 1] = items[i]; items[i] = t; if (active === i) active = i + 1; else if (active === i + 1) active = i; save(); render(); } }; });
    box.querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.del; items.splice(i, 1); if (active === i) active = -1; else if (active > i) active--; save(); render(); }; });
    var up = $('bUpd'); if (up) up.onclick = function () { if (active < 0) return; var it = items[active]; if (it.id !== M().state.scene) { M().toast('지금 고른 장면(' + S.BY[M().state.scene].name.split(' — ')[0] + ')과 ' + (active + 1) + '번(' + S.BY[it.id].name.split(' — ')[0] + ')이 다릅니다. 같은 장면일 때만 바꿀 수 있습니다.'); return; } it.p = textParams(it.id); it.look = look(); save(); render(); M().toast((active + 1) + '번을 지금 설정으로 바꿨습니다.'); };
  }
  function estDur(it) { var st = M().state, keep = st.p[it.id]; st.p[it.id] = Object.assign({}, keep || {}, it.p); var d = 0; try { d = M().dur(it.id); } catch (e) { } st.p[it.id] = keep; return d; }

  /* ---- 라이브러리 불러오기 ---- */
  function loadScript(src) { return new Promise(function (res, rej) { if (document.querySelector('script[src="' + src + '"]')) return res(); var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function () { rej(new Error(src)); }; document.head.appendChild(s); }); }
  async function libs() { if (!window.PptxGenJS) await loadScript('../../lib/pptxgen.bundle.js'); if (!window.JSZip) await loadScript('../../lib/jszip.min.js'); }
  function blobToDataURL(b) { return new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.readAsDataURL(b); }); }

  /* ---- MP4 자동 실행 타이밍 / 자동 넘김 (슬라이드 XML) ---- */
  function timingXml(spid, ms) {
    return '<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst><p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst><p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="5" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="withEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="6" dur="' + ms + '" fill="hold"/><p:tgtEl><p:spTgt spid="' + spid + '"/></p:tgtEl></p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq><p:video><p:cMediaNode vol="80000"><p:cTn id="7" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:endCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:endCondLst></p:cTn><p:tgtEl><p:spTgt spid="' + spid + '"/></p:tgtEl></p:cMediaNode></p:video></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>';
  }
  async function postProcess(blob, durs, adv) {
    var zip = await JSZip.loadAsync(blob), names = Object.keys(zip.files).filter(function (n) { return /^ppt\/slides\/slide\d+\.xml$/.test(n); });
    for (var i = 0; i < names.length; i++) {
      var n = names[i], idx = parseInt(n.match(/slide(\d+)\.xml/)[1], 10) - 1, xml = await zip.file(n).async('string'), ms = Math.round((durs[idx] || 5) * 1000), extra = '';
      if (adv) extra += '<p:transition spd="fast" advTm="' + (ms + 300) + '"/>';
      var vi = xml.indexOf('<a:videoFile');
      if (vi >= 0) { var head = xml.slice(0, vi), mm = head.match(/<p:cNvPr id="(\d+)"[^>]*>(?![\s\S]*<p:cNvPr id=")/); if (mm) extra += timingXml(mm[1], ms); }
      if (extra) { if (xml.indexOf('</p:clrMapOvr>') >= 0) xml = xml.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + extra); else xml = xml.replace('</p:sld>', extra + '</p:sld>'); zip.file(n, xml); }
    }
    return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', compression: 'DEFLATE' });
  }

  /* ---- 만들기 ---- */
  async function build() {
    var m = M(), st = m.state; if (!items.length || m.isBusy()) return;
    var fmt = $('bFmt').value, size = $('bSize').value, adv = $('bAdv').checked, dims = m.RATIOS[st.ratio];
    var W = size === 'hd' ? Math.round(dims[0] * 2 / 3) : dims[0], H = size === 'hd' ? Math.round(dims[1] * 2 / 3) : dims[1], gw = size === 'hd' ? 640 : 960, gh = Math.round(gw * dims[1] / dims[0]);
    m.setBusy(true); m.progress(true, 'PPT 준비 중(라이브러리 불러오기)…', 0);
    var keep = { look: look(), scene: st.scene, p: {} }; items.forEach(function (it) { keep.p[it.id] = st.p[it.id]; });
    var durs = [], ok = true;
    try {
      await libs();
      var pptx = new PptxGenJS(); pptx.author = '즉석 모션그래픽'; pptx.title = '모션 묶음';
      if (st.ratio === '16:9') pptx.layout = 'LAYOUT_16x9'; else if (st.ratio === '1:1') { pptx.defineLayout({ name: 'SQ', width: 7.5, height: 7.5 }); pptx.layout = 'SQ'; } else { pptx.defineLayout({ name: 'TALL', width: 5.625, height: 10 }); pptx.layout = 'TALL'; }
      for (var i = 0; i < items.length; i++) {
        var it = items[i], sc = S.BY[it.id], label = '(' + (i + 1) + '/' + items.length + ') ' + sc.name.split(' — ')[0];
        ['theme', 'c1', 'c2', 'bg', 'bgMode'].forEach(function (k) { if (it.look && it.look[k] != null) st[k] = it.look[k]; });
        st.p[it.id] = Object.assign({}, st.p[it.id] || {}, it.p);
        var d = m.dur(it.id); durs.push(d);
        var blob = fmt === 'gif' ? await m.renderGif(it.id, gw, gh, label) : await m.renderMp4(it.id, W, H, label);
        if (!blob) { ok = false; if (!m.cancelled()) m.toast((fmt === 'gif' ? 'GIF' : 'MP4') + ' 만들기에 실패해 멈췄습니다: ' + label); break; }
        var durl = await blobToDataURL(blob), data = durl.replace(/^data:/, '');
        var slide = pptx.addSlide(); slide.background = { color: (it.look && it.look.bgMode === 'trans') ? '000000' : String(it.look && it.look.bg || st.bg).replace('#', '') };
        if (fmt === 'gif') slide.addImage({ data: data, x: 0, y: 0, w: '100%', h: '100%' }); else { var pc = document.createElement('canvas'); pc.width = W; pc.height = H; m.drawFrame(pc.getContext('2d'), W, H, Math.max(0, d - .15), it.id, false); slide.addMedia({ type: 'video', data: data, cover: pc.toDataURL('image/jpeg', .85), x: 0, y: 0, w: '100%', h: '100%' }); }
        var sp = new URLSearchParams(); Object.keys(it.p).forEach(function (k) { var f = sc.fields.filter(function (ff) { return ff.k === k; })[0]; if (f && String(it.p[k]) !== String(f.def == null ? '' : f.def)) sp.set(k, it.p[k]); }); ['theme', 'c1', 'c2', 'bg', 'bgMode'].forEach(function (k) { if (it.look && it.look[k] != null) sp.set(k, it.look[k]); }); sp.set('ratio', st.ratio);
        var link = 'https://jahwalktg.github.io/kaltoe/t/motion/index.html#' + it.id + '&' + sp.toString();
        var lines = ['[즉석 모션그래픽] ' + sc.name, '길이 ' + m.fmtT(d) + ' · ' + (fmt === 'gif' ? 'GIF(슬라이드 쇼에서 저절로 움직임)' : 'MP4(슬라이드가 열리면 자동 실행, 소리 포함 가능)'), '', '■ 글자를 고치려면: 아래 링크를 열어 고친 뒤 다시 받아 이 슬라이드의 ' + (fmt === 'gif' ? '그림' : '비디오') + '을 바꿔 넣으세요(영상 안 글자는 PowerPoint에서 직접 못 고칩니다).', link, '', '■ 입력값'];
        Object.keys(it.p).forEach(function (k) { var f = sc.fields.filter(function (ff) { return ff.k === k; })[0]; if (f && it.p[k] !== '' && it.p[k] != null) lines.push('- ' + f.label.split('(')[0].trim() + ': ' + String(it.p[k]).replace(/\n/g, ' / ')); });
        slide.addNotes(lines.join('\n'));
      }
    } catch (e) { console.error(e); m.toast('PPT 만들기에 실패했습니다: ' + e.message); ok = false; }
    // 원래 설정으로
    ['theme', 'c1', 'c2', 'bg', 'bgMode'].forEach(function (k) { st[k] = keep.look[k]; var el = $(k); if (el) el.value = st[k]; }); Object.keys(keep.p).forEach(function (id) { if (keep.p[id]) st.p[id] = keep.p[id]; }); st.scene = keep.scene; m.renderForm(); m.renderList(); m.refreshThumbs();
    if (!ok) { m.setBusy(false); m.progress(false); return; }
    try {
      m.progress(true, 'PPT 파일 묶는 중…', .97);
      var out = await pptx.write({ outputType: 'blob' });
      if (fmt === 'mp4' || adv) out = await postProcess(out, durs, adv);
      var dt = new Date(), nm = '[모션] PPT 묶음_' + dt.getFullYear() + String(dt.getMonth() + 1).padStart(2, '0') + String(dt.getDate()).padStart(2, '0') + '_' + items.length + '장면.pptx';
      m.download(out, nm); m.toast('PPT를 받았습니다 (' + items.length + '슬라이드, ' + (out.size / 1048576).toFixed(1) + 'MB). PowerPoint에서 열어 슬라이드 쇼(F5)로 확인하세요.');
    } catch (e) { console.error(e); m.toast('PPT 파일을 만들지 못했습니다: ' + e.message); }
    m.setBusy(false); m.progress(false);
  }

  function init() {
    if (!$('cart')) return;
    $('bBuild').onclick = build;
    $('bClear').onclick = function () { if (!items.length) return; if (!confirm('담은 ' + items.length + '개 장면을 모두 비울까요?')) return; items = []; active = -1; save(); render(); };
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.MGBundle = { add: add, build: build, items: function () { return items; }, render: render, libs: libs, postProcess: postProcess, blobToDataURL: blobToDataURL };
})();
