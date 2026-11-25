/* 즉석 모션그래픽 — 화면 동작 */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var S = window.MG, SCENES = S.SCENES;
  var FONT = '"Pretendard", "Pretendard Variable", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
  var RATIOS = { '16:9': [1920, 1080], '1:1': [1080, 1080], '9:16': [1080, 1920] };
  var CHROMA = '#00FF00'; // GIF 투명 배경용 키 색
  var KEY = 'kaltoe.motion.v1';

  var state = { scene: 'open', ratio: '16:9', theme: 'classic', c1: '#1A6EFF', c2: '#F28C28', bg: '#0E1630', bgMode: 'color', p: {}, playing: true, t: 0 };
  var images = { logo: null };   // 공통 로고
  var fieldImgs = {};            // 장면별 사진 (저장 안 함)
  var favs = {}; try { favs = JSON.parse(localStorage.getItem(KEY + '.fav') || '{}'); } catch (e) { }
  var listQ = '', listG = '', listSit = '';   // 찾기 글자, 묶음(''=전체), 상황(''=없음)
  var thumbQ = [];               // 미리보기 그림 대기열
  var prev = $('prev'), pctx = prev.getContext('2d');
  var lastTs = 0, raf = 0, busy = false;

  /* ---- 저장·복원(글자·색만, 사진·로고는 저장 안 함) ---- */
  function save() { try { var o = { scene: state.scene, ratio: state.ratio, theme: state.theme, c1: state.c1, c2: state.c2, bg: state.bg, bgMode: state.bgMode, p: {} }; SCENES.forEach(function (s) { o.p[s.id] = state.p[s.id] || {}; }); localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
  function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o) { ['scene', 'ratio', 'theme', 'c1', 'c2', 'bg', 'bgMode'].forEach(function (k) { if (o[k]) state[k] = o[k]; }); if (!S.THEMES[state.theme]) state.theme = 'classic'; state.p = o.p || {}; } } catch (e) { } if (!S.BY[state.scene]) state.scene = 'open'; }
  function params(id) { var s = S.BY[id], p = state.p[id] || (state.p[id] = {}); s.fields.forEach(function (f) { if (f.type === 'image' || f.type === 'images') return; if (p[f.k] == null) p[f.k] = f.def == null ? '' : f.def; }); return p; }
  function dur(s, p) { if (s.audioCues) p = fullParams(s.id); return typeof s.dur === 'function' ? s.dur(p) : s.dur; }   // 음원이 길이를 정하는 장면은 음원 정보(_aud)까지 넣어 계산
  function textColor() { if (state.bgMode === 'trans') return '#1A2B50'; var h = state.bg.replace('#', ''), n = parseInt(h, 16); return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) > 160 ? '#1A2B50' : '#FFFFFF'; }
  function fullParams(id) {
    var p = Object.assign({}, params(id)); var s = S.BY[id];
    s.fields.forEach(function (f) { if (f.type === 'image') p[f.k] = fieldImgs[id + '.' + f.k] || null; if (f.type === 'images') p[f.k] = fieldImgs[id + '.' + f.k] || []; });
    p._aud = {}; s.fields.forEach(function (f) { if (f.type === 'audio') { var a = fieldAud[id + '.' + f.k]; p._aud[f.k] = a ? { duration: a.buffer.duration, name: a.name } : null; } });
    p._c1 = state.c1; p._c2 = state.c2; p._bg = state.bg; p._theme = state.theme; p._tx = textColor(); p._logo = images.logo; p._trans = state.bgMode === 'trans';
    return p;
  }
  /* 한 프레임 그리기: 캔버스 크기와 무관하게 논리 좌표(RATIOS)로 */
  function drawFrame(ctx, cw, ch, t, id, chroma) {
    var s = S.BY[id], dims = RATIOS[state.ratio], W = dims[0], H = dims[1], p = fullParams(id);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cw, ch);
    if (p._trans && chroma) { ctx.fillStyle = CHROMA; ctx.fillRect(0, 0, cw, ch); }
    ctx.save(); ctx.scale(cw / W, ch / H);
    var F = S.makeF(ctx, W, H, FONT, state.theme);
    try { s.draw(ctx, Math.max(0, t), p, F); } catch (e) { console.error(e); }
    ctx.restore();
  }

  /* ---- 장면 목록 (찾기·묶음·★·미리보기 그림) ---- */
  function norm(x) { return String(x || '').replace(/\s+/g, '').toLowerCase(); }
  function expandQ(q) { // 비슷한 말 묶음까지 넓힘
    var qs = [norm(q)]; (S.SYN || []).forEach(function (g) { var hit = g.some(function (w) { return norm(w).indexOf(norm(q)) >= 0 || norm(q).indexOf(norm(w)) >= 0; }); if (hit) g.forEach(function (w) { qs.push(norm(w)); }); });
    return qs;
  }
  function hay(sc) { var sits = (S.SITUATIONS || []).filter(function (st) { return st.scenes.indexOf(sc.id) >= 0; }).map(function (st) { return st.name; }).join(' '); return norm(sc.name + ' ' + sc.desc + ' ' + sc.group + ' ' + sc.id + ' ' + (S.TAGS[sc.id] || '') + ' ' + ((S.WHEN || {})[sc.id] || '') + ' ' + sits); }
  function matches(sc) {
    if (listG === '★') { if (!favs[sc.id]) return false; } else if (listG && sc.group !== listG) return false;
    if (!listQ) return true;
    var h = hay(sc), words = listQ.split(/\s+/).filter(Boolean);
    return words.every(function (w) { return expandQ(w).some(function (q) { return q && h.indexOf(q) >= 0; }); });
  }
  function sitRow() {
    var h = '<button type="button" class="gt sit' + (listSit === '' ? ' on' : '') + '" data-sit="">상황 고르기 ▾</button>';
    (S.SITUATIONS || []).forEach(function (st) { h += '<button type="button" class="gt sit' + (listSit === st.id ? ' on' : '') + '" data-sit="' + st.id + '" title="' + st.desc + '">' + st.icon + ' ' + st.name + '</button>'; });
    $('sits').innerHTML = h;
  }
  function card(sc, num) { return '<div class="sc' + (sc.id === state.scene ? ' on' : '') + '" data-id="' + sc.id + '" role="button" tabindex="0">' + (num ? '<span class="num">' + num + '</span>' : '') + '<canvas class="th" width="160" height="90" data-th="' + sc.id + '"></canvas><span class="nm">' + sc.icon + ' ' + sc.name + (sc.liveOnly ? ' <em>현장 재생용</em>' : '') + (sc.marks ? ' <em>스페이스로 단계 넘김</em>' : '') + ((S.WHEN || {})[sc.id] ? '<em class="when">이럴 때 · ' + S.WHEN[sc.id] + '</em>' : '') + '</span><button type="button" class="fav' + (favs[sc.id] ? ' on' : '') + '" data-fav="' + sc.id + '" title="자주 쓰는 장면">★</button>' + (sc.liveOnly ? '' : '<button type="button" class="addc" data-add="' + sc.id + '" title="PPT 묶음에 담기(지금 입력·디자인 그대로)">＋</button>') + '</div>'; }
  function renderList() {
    var tabs = '<button type="button" class="gt' + (listG === '' ? ' on' : '') + '" data-g="">전체 ' + SCENES.length + '</button>';
    S.GROUPS.forEach(function (g) { var n = SCENES.filter(function (x) { return x.group === g; }).length; if (n) tabs += '<button type="button" class="gt' + (listG === g ? ' on' : '') + '" data-g="' + g + '">' + g + ' ' + n + '</button>'; });
    var nf = Object.keys(favs).filter(function (k) { return favs[k] && S.BY[k]; }).length; tabs += '<button type="button" class="gt' + (listG === '★' ? ' on' : '') + '" data-g="★">★ 자주 ' + nf + '</button>';
    $('gtabs').innerHTML = tabs; sitRow();
    var h = '', shown = 0, lastG = '';
    var st = listSit && (S.SITUATIONS || []).filter(function (x) { return x.id === listSit; })[0];
    if (st && !listQ) {
      h += '<div class="sitHead">' + st.icon + ' <b>' + st.name + '</b> — ' + st.desc + '. 아래 순서대로 쓰면 한 행사가 됩니다.</div>';
      st.scenes.forEach(function (id, i) { var sc = S.BY[id]; if (!sc) return; if (listG && !matches(sc)) return; shown++; h += card(sc, '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳'[i] || (i + 1)); });
      var rest = SCENES.filter(function (sc) { return st.scenes.indexOf(sc.id) < 0 && matches(sc); });
      if (rest.length) { h += '<details class="more"><summary>이 상황에 없는 나머지 ' + rest.length + '개</summary>'; rest.forEach(function (sc) { h += card(sc); }); h += '</details>'; }
    } else {
      SCENES.forEach(function (sc) {
        if (!matches(sc)) return; shown++;
        if (!listG && !listQ && sc.group !== lastG) { h += '<div class="grp">' + sc.group + '</div>'; lastG = sc.group; }
        h += card(sc);
      });
    }
    if (!shown) h = '<p class="hint">맞는 장면이 없습니다. 다른 말로 찾아보세요(예: 시상, 타이머, QR, 국기). 없는 장면은 아래 「의견 보내기」로 알려 주세요.</p>';
    $('list').innerHTML = h;
    thumbQ = [].slice.call($('list').querySelectorAll('canvas[data-th]')); if (!thumbTimer) thumbTimer = setTimeout(drawThumbs, 30);
  }
  var thumbTimer = 0, thumbCache = {};
  function drawThumbs() { // 한 번에 몇 개씩, 장면 중간 시점 그림 (16:9 기준, 캐시)
    thumbTimer = 0; var n = 0;
    while (thumbQ.length && n < 4) {
      var cv = thumbQ.shift(), id = cv.dataset.th, sc = S.BY[id]; n++;
      var key = id + '|' + state.theme + state.c1 + state.c2 + state.bg + state.bgMode;
      if (thumbCache[key]) { cv.getContext('2d').drawImage(thumbCache[key], 0, 0); continue; }
      var off = document.createElement('canvas'); off.width = 160; off.height = 90; var ctx = off.getContext('2d');
      var saveRatio = state.ratio; state.ratio = '16:9';
      try { var p = fullParams(id), d = dur(sc, p); var t = sc.liveOnly ? 100 : Math.min(d * .62, d - .1); ctx.save(); ctx.scale(160 / 1920, 90 / 1080); if (p._trans) { ctx.fillStyle = '#333'; ctx.fillRect(0, 0, 1920, 1080); } sc.draw(ctx, t, p, S.makeF(ctx, 1920, 1080, FONT, state.theme)); ctx.restore(); } catch (e) { }
      state.ratio = saveRatio; thumbCache[key] = off; cv.getContext('2d').drawImage(off, 0, 0);
    }
    if (thumbQ.length) thumbTimer = setTimeout(drawThumbs, 16);
  }
  function refreshThumbs() { thumbCache = {}; thumbQ = [].slice.call($('list').querySelectorAll('canvas[data-th]')); if (!thumbTimer) thumbTimer = setTimeout(drawThumbs, 200); }
  $('list').addEventListener('click', function (e) { var ad = e.target.closest('[data-add]'); if (ad) { if (window.MGBundle) MGBundle.add(ad.dataset.add); return; } var f = e.target.closest('[data-fav]'); if (f) { favs[f.dataset.fav] = !favs[f.dataset.fav]; try { localStorage.setItem(KEY + '.fav', JSON.stringify(favs)); } catch (x) { } renderList(); return; } var b = e.target.closest('.sc'); if (!b) return; selectScene(b.dataset.id); });
  $('list').addEventListener('keydown', function (e) { if (e.key !== 'Enter' && e.key !== ' ') return; var b = e.target.closest('.sc'); if (!b) return; e.preventDefault(); selectScene(b.dataset.id); });
  $('gtabs').addEventListener('click', function (e) { var b = e.target.closest('.gt'); if (!b) return; listG = b.dataset.g; renderList(); });
  $('sits').addEventListener('click', function (e) { var b = e.target.closest('.sit'); if (!b) return; listSit = (b.dataset.sit === listSit) ? '' : b.dataset.sit; if (listSit) listG = ''; renderList(); });
  $('list').addEventListener('toggle', function (e) { if (e.target.classList && e.target.classList.contains('more')) { thumbQ = [].slice.call($('list').querySelectorAll('canvas[data-th]')); if (!thumbTimer) thumbTimer = setTimeout(drawThumbs, 30); } }, true);
  $('q').addEventListener('input', function () { listQ = this.value.trim(); renderList(); });
  function selectScene(id) { state.scene = id; state.t = 0; state.playing = true; renderList(); renderForm(); fitPreview(); save(); try { history.replaceState(null, '', '#' + id); } catch (e) { } if (window.innerWidth < 900) $('form').scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  /* ---- 입력 칸 ---- */
  function renderForm() {
    var s = S.BY[state.scene], p = params(s.id), h = '';
    h += '<h3 class="scName">' + s.icon + ' ' + s.name + '</h3>' + ((S.WHEN || {})[s.id] ? '<p class="when">이럴 때 · ' + S.WHEN[s.id] + '</p>' : '') + '<p class="desc">' + s.desc + '</p>';
    s.fields.forEach(function (f) {
      var id = 'f_' + f.k;
      h += '<label class="fld"><span>' + f.label + '</span>';
      if (f.type === 'lines') h += '<textarea id="' + id + '" rows="' + Math.min(6, Math.max(3, (f.max || 4))) + '" data-k="' + f.k + '">' + esc(p[f.k]) + '</textarea>';
      else if (f.type === 'select') { h += '<select id="' + id + '" data-k="' + f.k + '">'; f.opts.forEach(function (o) { h += '<option value="' + o[0] + '"' + (p[f.k] === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }); h += '</select>'; }
      else if (f.type === 'number') h += '<input id="' + id + '" type="number" data-k="' + f.k + '" value="' + esc(p[f.k]) + '" min="' + (f.min || 0) + '" max="' + (f.max || 999) + '" step="' + (f.step || 1) + '">';
      else if (f.type === 'image') h += '<input id="' + id + '" type="file" accept="image/*" data-img="' + f.k + '"><small class="hint">' + (fieldImgs[s.id + '.' + f.k] ? '사진이 들어 있습니다. 바꾸려면 다시 고르세요.' : '사진은 이 브라우저 안에서만 쓰고 어디에도 보내지 않습니다.') + '</small>';
      else if (f.type === 'images') h += '<input id="' + id + '" type="file" accept="image/*" multiple data-imgs="' + f.k + '"><small class="hint">' + ((fieldImgs[s.id + '.' + f.k] || []).length ? (fieldImgs[s.id + '.' + f.k].length + '장 들어 있습니다(고른 순서대로). 바꾸려면 다시 고르세요.') : '여러 장을 한 번에 고르세요(Ctrl 누르고 클릭). 브라우저 안에서만 씁니다.') + '</small>';
      else if (f.type === 'audio') { var cur = fieldAud[s.id + '.' + f.k]; h += '<select id="' + id + '" data-aud-sel="' + f.k + '">' + (f.builtin || [['', '없음(화면만)']]).map(function (o) { return '<option value="' + o[0] + '"' + (cur && cur.src === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '<option value="__file"' + (cur && cur.src === '__file' ? ' selected' : '') + '>내 음원 파일 넣기(mp3·wav·m4a)</option></select>'; h += '<input id="' + id + '_f" type="file" accept="audio/*" data-aud="' + f.k + '"' + (cur && cur.src === '__file' ? '' : ' hidden') + '>'; h += '<small class="hint" data-aud-note="' + f.k + '">' + (cur ? '음원 들어옴: ' + esc(cur.name) + ' (' + fmtT(cur.buffer.duration) + ') — 전체화면 재생과 MP4에 소리가 들어갑니다.' : '음원을 고르면 화면 길이가 음원에 맞춰지고, 전체화면 재생·MP4에 소리가 들어갑니다. GIF에는 소리가 없습니다.') + '</small>'; }
      else h += '<input id="' + id + '" type="text" data-k="' + f.k + '" value="' + esc(p[f.k]) + '" maxlength="' + (f.max || 60) + '" placeholder="' + esc(f.ph || '') + '">';
      h += '</label>';
    });
    $('form').innerHTML = h;
    $('form').querySelectorAll('[data-k]').forEach(function (el) { el.addEventListener('input', function () { params(s.id)[el.dataset.k] = el.value; state.t = Math.min(state.t, dur(s, params(s.id))); save(); updateDurLabel(); }); });
    $('form').querySelectorAll('[data-img]').forEach(function (el) { el.addEventListener('change', function () { var f = el.files && el.files[0]; if (!f) return; loadImg(f, function (img) { fieldImgs[s.id + '.' + el.dataset.img] = img; state.t = 0; renderForm(); }); }); });
    $('form').querySelectorAll('[data-imgs]').forEach(function (el) { el.addEventListener('change', function () { var fs = [].slice.call(el.files || []).slice(0, 8); if (!fs.length) return; var out = new Array(fs.length), left = fs.length; fs.forEach(function (f, i) { loadImg(f, function (img) { out[i] = img; if (!--left) { fieldImgs[s.id + '.' + el.dataset.imgs] = out.filter(Boolean); state.t = 0; renderForm(); updateDurLabel(); } }); }); }); });
    $('form').querySelectorAll('[data-aud-sel]').forEach(function (el) { el.addEventListener('change', function () { var k = el.dataset.audSel, fin = $('f_' + k + '_f'); if (el.value === '__file') { fin.hidden = false; fin.click(); return; } fin.hidden = true; if (!el.value) { delete fieldAud[s.id + '.' + k]; state.t = 0; renderForm(); return; } loadAudioUrl(el.value, el.options[el.selectedIndex].textContent, function (buf, name) { fieldAud[s.id + '.' + k] = { buffer: buf, name: name, src: el.value }; state.t = 0; renderForm(); }); }); });
    $('form').querySelectorAll('[data-aud]').forEach(function (el) { el.addEventListener('change', function () { var f = el.files && el.files[0]; if (!f) return; f.arrayBuffer().then(function (ab) { return actx().decodeAudioData(ab); }).then(function (buf) { fieldAud[s.id + '.' + el.dataset.aud] = { buffer: buf, name: f.name, src: '__file' }; state.t = 0; renderForm(); }, function () { toast('음원 파일을 읽지 못했습니다. mp3·wav·m4a 파일인지 확인해 주세요.'); }); }); });
    $('shareBtn').onclick = function () { var sp = new URLSearchParams(); var pp = params(s.id); s.fields.forEach(function (f) { if (f.type === 'image' || f.type === 'images') return; if (pp[f.k] != null && String(pp[f.k]) !== String(f.def == null ? '' : f.def)) sp.set(f.k, pp[f.k]); }); ['ratio', 'theme', 'c1', 'c2', 'bg', 'bgMode'].forEach(function (k) { sp.set(k, state[k]); }); var url = location.origin + location.pathname + '#' + s.id + '&' + sp.toString(); copyText(url, '이 장면의 설정 링크를 복사했습니다. 동료에게 보내면 같은 화면이 열립니다(사진·로고는 빠짐).'); };
    $('liveOnlyNote').hidden = !s.liveOnly; $('stepNote').hidden = !s.marks; $('dlBox').classList.toggle('dim', !!s.liveOnly);
    updateDurLabel();
  }
  function copyText(t, msg) { var done = function () { toast(msg); }; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, function () { fallbackCopy(t); done(); }); else { fallbackCopy(t); done(); } }
  function fallbackCopy(t) { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) { } ta.remove(); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  /* ---- 음원: 읽기·재생(전체화면·미리보기)·MP4 합성 ---- */
  var fieldAud = {}, _actx = null;
  function actx() { if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 }); return _actx; }
  function loadAudioUrl(url, label, cb) { toast('음원을 불러오는 중…'); fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(function (ab) { return actx().decodeAudioData(ab); }).then(function (buf) { cb(buf, label); toast('음원 준비됨: ' + label); }, function (e) { toast('기본 음원을 아직 불러올 수 없습니다(' + e.message + '). 「내 음원 파일 넣기」로 직접 넣어 주세요.'); }); }
  function audioCues(id) { var sc = S.BY[id]; if (!sc.audioCues) return []; var p = fullParams(id); return sc.audioCues(p).map(function (c) { var a = fieldAud[id + '.' + c.k]; return a ? { at: c.at, buffer: a.buffer } : null; }).filter(Boolean); }
  var aud = { on: false, srcs: [], startT: 0, startAt: 0, scene: '' };
  function audioStop() { aud.srcs.forEach(function (x) { try { x.stop(); } catch (e) { } }); aud.srcs = []; aud.on = false; }
  function audioStart(fromT) { audioStop(); var cues = audioCues(state.scene); if (!cues.length) return; var ac = actx(); if (ac.state === 'suspended') ac.resume(); cues.forEach(function (c) { var off = fromT - c.at; if (off >= c.buffer.duration) return; var src = ac.createBufferSource(); src.buffer = c.buffer; src.connect(ac.destination); if (off >= 0) src.start(0, off); else src.start(ac.currentTime - off); aud.srcs.push(src); }); aud.on = true; aud.startT = fromT; aud.startAt = ac.currentTime; aud.scene = state.scene; }
  function audioSync() { var want = state.playing && !busy && (live.on || ($('sndPrev') && $('sndPrev').checked)) && audioCues(state.scene).length > 0; if (!want) { if (aud.on) audioStop(); return; } if (!aud.on || aud.scene !== state.scene) { audioStart(state.t); return; } var expect = aud.startT + (actx().currentTime - aud.startAt); if (Math.abs(expect - state.t) > .35) audioStart(state.t); }
  // 장면 길이 d초의 섞인 소리 → AudioBuffer(48k, 2ch)
  function mixAudio(id, d) { var cues = audioCues(id); if (!cues.length) return Promise.resolve(null); var sr = 48000, len = Math.ceil(d * sr); var oc = new OfflineAudioContext(2, len, sr); cues.forEach(function (c) { var src = oc.createBufferSource(); src.buffer = c.buffer; src.connect(oc.destination); src.start(Math.max(0, c.at)); }); return oc.startRendering(); }
  function loadImg(file, cb) { var url = URL.createObjectURL(file), img = new Image(); img.onload = function () { cb(img); }; img.onerror = function () { toast('이미지를 읽지 못했습니다.'); }; img.src = url; }
  function updateDurLabel() { var s = S.BY[state.scene], d = dur(s, params(s.id)); $('durLbl').textContent = fmtT(d); $('seek').max = d; }
  function fmtT(x) { x = Math.max(0, x); var m = Math.floor(x / 60), s = x - m * 60; return m ? m + '분 ' + Math.floor(s) + '초' : (Math.round(s * 10) / 10) + '초'; }

  /* ---- 공통 설정 ---- */
  function applyTheme(id, keepColors) {
    var th = S.themeOf(id); state.theme = th.id; $('theme').value = th.id; $('themeNote').textContent = th.desc;
    if (!keepColors) { state.c1 = th.palette.c1; state.c2 = th.palette.c2; state.bg = th.palette.bg; $('c1').value = state.c1; $('c2').value = state.c2; $('bg').value = state.bg; }
    save(); refreshThumbs(); fontsReady().then(function () { refreshThumbs(); });
  }
  function bindGlobals() {
    $('theme').innerHTML = S.THEME_ORDER.map(function (id) { var th = S.THEMES[id]; return '<option value="' + id + '">' + th.name + '</option>'; }).join('');
    $('theme').value = state.theme; $('themeNote').textContent = S.themeOf(state.theme).desc;
    $('theme').onchange = function () { applyTheme(this.value, false); };
    $('themeColors').onclick = function () { applyTheme(state.theme, false); };
    $('ratio').value = state.ratio; $('c1').value = state.c1; $('c2').value = state.c2; $('bg').value = state.bg; $('bgMode').value = state.bgMode;
    $('ratio').onchange = function () { state.ratio = this.value; fitPreview(); save(); };
    ['c1', 'c2', 'bg'].forEach(function (k) { $(k).oninput = function () { state[k] = this.value; save(); clearTimeout(thumbRe); thumbRe = setTimeout(refreshThumbs, 400); }; }); var thumbRe = 0;
    $('bgMode').onchange = function () { state.bgMode = this.value; $('bg').disabled = state.bgMode === 'trans'; save(); refreshThumbs(); };
    $('bg').disabled = state.bgMode === 'trans';
    $('logo').onchange = function () { var f = this.files && this.files[0]; if (!f) return; loadImg(f, function (img) { images.logo = img; $('logoNote').textContent = '로고 들어옴 (' + img.naturalWidth + '×' + img.naturalHeight + ')'; $('logoDel').hidden = false; }); };
    $('logoDel').onclick = function () { images.logo = null; $('logo').value = ''; $('logoNote').textContent = ''; this.hidden = true; };
    document.querySelectorAll('.preset').forEach(function (b) { b.onclick = function () { var c = b.dataset.c.split(','); state.c1 = c[0]; state.c2 = c[1]; state.bg = c[2]; $('c1').value = c[0]; $('c2').value = c[1]; $('bg').value = c[2]; save(); refreshThumbs(); }; });
  }

  /* ---- 미리보기 재생 ---- */
  function fitPreview() {
    var dims = RATIOS[state.ratio], box = $('prevBox'), bw = box.clientWidth, bh = Math.max(200, Math.min(window.innerHeight * .6, bw * dims[1] / dims[0]));
    var sc = Math.min(bw / dims[0], bh / dims[1]); var w = Math.round(dims[0] * sc), h = Math.round(dims[1] * sc), dpr = Math.min(2, window.devicePixelRatio || 1);
    prev.style.width = w + 'px'; prev.style.height = h + 'px'; prev.width = Math.round(w * dpr); prev.height = Math.round(h * dpr);
    box.style.height = h + 'px';
  }
  function tick(ts) {
    raf = requestAnimationFrame(tick);
    var dt = lastTs ? (ts - lastTs) / 1000 : 0; lastTs = ts; if (dt > .25) dt = .25;
    var s = S.BY[state.scene], d = dur(s, params(s.id));
    if (state.playing && !busy) { var before = state.t; state.t += dt;
      if (live.on && s.marks && live.step) { var ms = s.marks(s.audioCues ? fullParams(s.id) : params(s.id)); for (var mi = 0; mi < ms.length; mi++) { if (before < ms[mi] && state.t >= ms[mi]) { state.t = ms[mi]; state.playing = false; live.waiting = true; break; } } } if (state.t >= d) { if (live.on || s.liveOnly) state.t = s.liveOnly ? Math.min(state.t, d) : 0; else { state.t = d; state.playing = false; setTimeout(function () { if (!state.playing && state.t >= d) { state.t = 0; state.playing = true; } }, 1200); } } }
    drawFrame(pctx, prev.width, prev.height, state.t, state.scene, false); try { audioSync(); } catch (e) { }
    $('seek').value = state.t; $('tLbl').textContent = fmtT(state.t); $('play').textContent = state.playing ? '⏸' : '▶';
    if (live.on) drawLive();
  }
  $('play').onclick = function () { state.playing = !state.playing; if (state.playing && state.t >= dur(S.BY[state.scene], params(state.scene))) state.t = 0; };
  $('restart').onclick = function () { state.t = 0; state.playing = true; };
  $('seek').oninput = function () { state.t = parseFloat(this.value); state.playing = false; };

  /* ---- 전체화면 재생 ---- */
  var live = { on: false, step: true, waiting: false, cv: $('liveCv'), ctx: $('liveCv').getContext('2d') };
  function drawLive() { var cv = live.cv, dims = RATIOS[state.ratio], sw = window.innerWidth, sh = window.innerHeight, sc = Math.min(sw / dims[0], sh / dims[1]), w = Math.round(dims[0] * sc), h = Math.round(dims[1] * sc); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } cv.style.width = w + 'px'; cv.style.height = h + 'px'; drawFrame(live.ctx, w, h, state.t, state.scene, false); var sc = S.BY[state.scene]; $('liveHelp').textContent = (sc.marks ? (live.waiting ? '▶ 스페이스: 다음 단계' : '스페이스: 멈춤/다음 단계') : '스페이스 멈춤/재생') + ' · R 처음부터 · Esc 나가기'; $('liveHelp').classList.toggle('wait', !!live.waiting); }
  $('liveBtn').onclick = function () { live.on = true; live.waiting = false; live.step = $('stepMode').checked; state.t = 0; state.playing = true; $('live').classList.add('on'); document.body.classList.add('noscroll'); var el = $('live'); if (el.requestFullscreen) el.requestFullscreen().catch(function () { }); };
  function exitLive() { live.on = false; audioStop(); $('live').classList.remove('on'); document.body.classList.remove('noscroll'); if (document.fullscreenElement) document.exitFullscreen().catch(function () { }); }
  $('liveExit').onclick = exitLive;
  document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement && live.on) exitLive(); });
  document.addEventListener('keydown', function (e) { if (!live.on) return; if (e.key === 'Escape') exitLive(); if (e.key === ' ') { e.preventDefault(); if (live.waiting) { live.waiting = false; state.t += 0.001; state.playing = true; } else state.playing = !state.playing; } if (e.key === 'r' || e.key === 'R') { state.t = 0; state.playing = true; } });
  $('live').addEventListener('click', function (e) { if (e.target === live.cv) { if (live.waiting) { live.waiting = false; state.t += 0.001; state.playing = true; } else state.playing = !state.playing; } });

  /* ---- 내려받기 ---- */
  function outSize() { var dims = RATIOS[state.ratio], q = $('vq').value; if (q === 'hd') return [Math.round(dims[0] * 2 / 3), Math.round(dims[1] * 2 / 3)]; return dims; }
  function fileBase() { var s = S.BY[state.scene], p = params(s.id), cand = s.fields.filter(function (f) { return f.type !== 'image' && f.type !== 'images' && f.type !== 'select' && f.type !== 'number' && f.type !== 'url' && p[f.k]; }), pref = ['title', 'name', 'text', 'prize', 'q', 'hello'], first = cand.filter(function (f) { return pref.indexOf(f.k) >= 0; }).sort(function (x, y) { return pref.indexOf(x.k) - pref.indexOf(y.k); })[0] || cand[0]; var name = (first ? String(p[first.k]).split('\n')[0] : '').replace(/[\\/:*?"<>|]/g, '').slice(0, 20).trim(); return '[모션] ' + s.name.split(' — ')[0] + (name ? '_' + name : ''); }
  function download(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
  function progress(on, txt, pct) { $('prog').classList.toggle('on', !!on); if (txt != null) $('progTxt').textContent = txt; if (pct != null) $('progBar').style.width = Math.round(pct * 100) + '%'; }
  var cancelFlag = false; $('progCancel').onclick = function () { cancelFlag = true; };
  function yieldUI() { return new Promise(function (r) { setTimeout(r, 0); }); }
  function fontsReady() { var fam = (S.themeOf(state.theme).font || '').indexOf('Serif') >= 0 ? '"Noto Serif KR"' : 'Pretendard'; return Promise.all([document.fonts.load('900 40px ' + fam), document.fonts.load('700 40px ' + fam), document.fonts.load('500 40px ' + fam), document.fonts.load('700 40px Pretendard')]).catch(function () { }); }
  function liveOnlyGuard() { var s = S.BY[state.scene]; if (s.liveOnly) { toast('이 장면은 파일로 받지 않고 「전체화면으로 재생」으로 현장에서 바로 띄우는 장면입니다.'); return true; } return false; }

  // PNG(지금 보이는 순간)
  $('dlPng').onclick = async function () {
    if (busy) return; var sz = outSize(), cv = document.createElement('canvas'); cv.width = sz[0]; cv.height = sz[1];
    await fontsReady(); drawFrame(cv.getContext('2d'), sz[0], sz[1], state.t, state.scene, false);
    cv.toBlob(function (b) { download(b, fileBase() + '_' + Math.round(state.t * 10) / 10 + 's.png'); toast('PNG를 받았습니다.'); }, 'image/png');
  };

  // MP4 (WebCodecs + mp4-muxer) — 장면 하나를 Blob으로. 소리 큐가 있으면 AAC로 함께 넣음. 실패·취소면 null
  async function renderMp4(id, W, H, label, bitrate) {
    var br = bitrate || 10000000;
    var s = S.BY[id], d = dur(s, params(id)), fps = 30, total = Math.ceil(d * fps), pre = label ? label + ' ' : '';
    var canWC = !!(window.VideoEncoder && window.Mp4Muxer); var cfg = null;
    if (canWC) { var cands = ['avc1.64002A', 'avc1.4D402A', 'avc1.42E02A', 'avc1.640028']; for (var i = 0; i < cands.length; i++) { try { var r = await VideoEncoder.isConfigSupported({ codec: cands[i], width: W, height: H, bitrate: br, framerate: fps }); if (r.supported) { cfg = r.config; break; } } catch (e) { } } }
    if (!cfg) return null;
    cancelFlag = false; progress(true, pre + 'MP4 만드는 중… 0 / ' + total, 0);
    await fontsReady();
    var mixed = null; try { mixed = await mixAudio(id, d); } catch (e) { console.error(e); }
    var acfg = null; if (mixed && window.AudioEncoder) { try { var ar = await AudioEncoder.isConfigSupported({ codec: 'mp4a.40.2', sampleRate: 48000, numberOfChannels: 2, bitrate: 128000 }); if (ar.supported) acfg = ar.config; } catch (e) { } }
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var ctx = cv.getContext('2d');
    var mopt = { target: new Mp4Muxer.ArrayBufferTarget(), video: { codec: 'avc', width: W, height: H }, fastStart: 'in-memory', firstTimestampBehavior: 'offset' };
    if (acfg) mopt.audio = { codec: 'aac', sampleRate: 48000, numberOfChannels: 2 };
    var muxer = new Mp4Muxer.Muxer(mopt);
    var err = null, enc = new VideoEncoder({ output: function (chunk, meta) { muxer.addVideoChunk(chunk, meta); }, error: function (e) { err = e; } });
    enc.configure(Object.assign({}, cfg, { latencyMode: 'quality' }));
    var aenc = null;
    try {
      if (acfg) {
        aenc = new AudioEncoder({ output: function (chunk, meta) { muxer.addAudioChunk(chunk, meta); }, error: function (e) { err = e; } }); aenc.configure(acfg);
        var L = mixed.length, step = 1024, ch0 = mixed.getChannelData(0), ch1 = mixed.getChannelData(1);
        for (var off = 0; off < L; off += step) { var n = Math.min(step, L - off), buf = new Float32Array(n * 2); buf.set(ch0.subarray(off, off + n), 0); buf.set(ch1.subarray(off, off + n), n); var ad = new AudioData({ format: 'f32-planar', sampleRate: 48000, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round(off * 1e6 / 48000), data: buf }); aenc.encode(ad); ad.close(); if (off % (step * 64) === 0) await yieldUI(); }
        await aenc.flush();
      }
      for (var f = 0; f < total; f++) {
        if (cancelFlag || err) break;
        drawFrame(ctx, W, H, f / fps, id, false);
        var frame = new VideoFrame(cv, { timestamp: Math.round(f * 1e6 / fps), duration: Math.round(1e6 / fps) });
        enc.encode(frame, { keyFrame: f % (fps * 2) === 0 }); frame.close();
        if (enc.encodeQueueSize > 4 || f % 5 === 0) { progress(true, pre + 'MP4 만드는 중… ' + (f + 1) + ' / ' + total, f / total); await yieldUI(); }
        while (enc.encodeQueueSize > 8) await yieldUI();
      }
      if (!cancelFlag && !err) { await enc.flush(); muxer.finalize(); try { enc.close(); if (aenc) aenc.close(); } catch (e) { } return new Blob([muxer.target.buffer], { type: 'video/mp4' }); }
      if (err) console.error(err);
    } catch (e) { console.error(e); toast('MP4 만들기에 실패했습니다: ' + e.message); }
    try { enc.close(); if (aenc) aenc.close(); } catch (e) { }
    return null;
  }
  $('dlMp4').onclick = async function () {
    if (busy || liveOnlyGuard()) return;
    var s = S.BY[state.scene], d = dur(s, params(s.id)), sz = outSize(), W = sz[0], H = sz[1];
    busy = true; state.playing = false; audioStop();
    var blob = await renderMp4(s.id, W, H, '');
    if (blob) { download(blob, fileBase() + '.mp4'); toast('MP4를 받았습니다 (' + (blob.size / 1048576).toFixed(1) + 'MB, ' + W + '×' + H + ', ' + fmtT(d) + (audioCues(s.id).length ? ', 소리 포함' : '') + ')'); busy = false; progress(false); state.playing = true; return; }
    busy = false; progress(false);
    if (cancelFlag) { state.playing = true; return; }
    if (!(window.VideoEncoder && window.Mp4Muxer)) return webmFallback(s, d, 30, W, H);
    toast('MP4 만들기에 실패했습니다. WebM으로 다시 시도합니다.'); return webmFallback(s, d, 30, W, H);
  };
  // WebM 대체 (MediaRecorder, 실시간)
  function webmFallback(s, d, fps, W, H) {
    return new Promise(async function (resolve) {
      if (!window.MediaRecorder) { toast('이 브라우저는 영상 만들기를 지원하지 않습니다. 크롬·엣지에서 열어 주세요.'); return resolve(); }
      busy = true; cancelFlag = false; state.playing = false; progress(true, 'WebM 만드는 중(이 브라우저는 MP4를 직접 못 만들어 WebM으로 받습니다)…', 0);
      await fontsReady();
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var ctx = cv.getContext('2d');
      var stream = cv.captureStream(fps), chunks = [], mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      var rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8000000 });
      rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
      rec.onstop = function () { var blob = new Blob(chunks, { type: 'video/webm' }); if (!cancelFlag) { download(blob, fileBase() + '.webm'); toast('WebM을 받았습니다. PPT에 넣으려면 MP4가 필요할 수 있어 크롬·엣지를 권합니다.'); } busy = false; progress(false); state.playing = true; resolve(); };
      rec.start(200); var t0 = performance.now();
      (function loop() { var t = (performance.now() - t0) / 1000; if (t >= d || cancelFlag) { drawFrame(ctx, W, H, d, s.id, false); setTimeout(function () { rec.stop(); }, 150); return; } drawFrame(ctx, W, H, t, s.id, false); progress(true, 'WebM 만드는 중… ' + fmtT(t) + ' / ' + fmtT(d), t / d); requestAnimationFrame(loop); })();
    });
  }

  // GIF (gif.js — 워커 스크립트는 같은 출처가 아니어서 받아서 Blob URL로)
  var gifWorkerUrl = null;
  async function gifWorker() { if (gifWorkerUrl) return gifWorkerUrl; var r = await fetch('../../lib/gif.worker.js'); var txt = await r.text(); gifWorkerUrl = URL.createObjectURL(new Blob([txt], { type: 'application/javascript' })); return gifWorkerUrl; }
  function renderGif(id, gw, gh, label) {
    return new Promise(async function (resolve) {
      var s = S.BY[id], d = dur(s, params(id)), fps = 12, total = Math.ceil(d * fps), pre = label ? label + ' ' : '';
      cancelFlag = false; progress(true, pre + 'GIF 준비 중…', 0);
      try {
        await fontsReady(); var wurl = await gifWorker();
        var trans = state.bgMode === 'trans';
        var gif = new GIF({ workers: 3, quality: trans ? 6 : 8, width: gw, height: gh, workerScript: wurl, transparent: trans ? parseInt(CHROMA.slice(1), 16) : null, dither: trans ? false : 'FloydSteinberg-serpentine', repeat: 0 });
        var cv = document.createElement('canvas'); cv.width = gw; cv.height = gh; var ctx = cv.getContext('2d');
        for (var f = 0; f < total; f++) {
          if (cancelFlag) break;
          drawFrame(ctx, gw, gh, f / fps, id, true);
          gif.addFrame(ctx, { copy: true, delay: Math.round(1000 / fps) });
          if (f % 6 === 0) { progress(true, pre + 'GIF 그리는 중… ' + (f + 1) + ' / ' + total, f / total * .5); await yieldUI(); }
        }
        if (cancelFlag) return resolve(null);
        gif.on('progress', function (x) { progress(true, pre + 'GIF 묶는 중… ' + Math.round(x * 100) + '%', .5 + x * .5); });
        gif.on('finished', function (blob) { resolve(blob); });
        gif.render();
      } catch (e) { console.error(e); toast('GIF 만들기에 실패했습니다: ' + e.message); resolve(null); }
    });
  }
  $('dlGif').onclick = async function () {
    if (busy || liveOnlyGuard()) return;
    if (!window.GIF) { toast('GIF 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.'); return; }
    var s = S.BY[state.scene], d = dur(s, params(s.id)), dims = RATIOS[state.ratio], gw = parseInt($('gq').value, 10), gh = Math.round(gw * dims[1] / dims[0]);
    if (d > 20 && !confirm('이 장면은 ' + fmtT(d) + '라 GIF가 꽤 큽니다(수십 MB). 계속할까요? MP4를 권합니다.')) return;
    busy = true; state.playing = false; audioStop();
    var blob = await renderGif(s.id, gw, gh, '');
    if (blob) { download(blob, fileBase() + '.gif'); toast('GIF를 받았습니다 (' + (blob.size / 1048576).toFixed(1) + 'MB, ' + gw + '×' + gh + (state.bgMode === 'trans' ? ', 투명 배경' : '') + (audioCues(s.id).length ? ' — GIF에는 소리가 없습니다' : '') + ')'); }
    busy = false; progress(false); state.playing = true;
  };

  /* ---- 알림 ---- */
  var toastT = 0; function toast(m) { var el = $('toast'); el.textContent = m; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('on'); }, 4500); }

  /* ---- 시작 ---- */
  load();
  var hraw = (location.hash || '').replace('#', ''), hashId = hraw.split('&')[0];
  if (S.BY[hashId]) { state.scene = hashId; if (hraw.indexOf('&') > 0) { try { var sp = new URLSearchParams(hraw.slice(hraw.indexOf('&') + 1)); var pp = params(hashId); sp.forEach(function (v, k) { if (['ratio', 'theme', 'c1', 'c2', 'bg', 'bgMode'].indexOf(k) >= 0) state[k] = v; else pp[k] = v; }); } catch (e) { } } }
  renderList(); renderForm(); bindGlobals(); fitPreview();
  window.addEventListener('resize', function () { fitPreview(); });
  if (!(window.VideoEncoder && window.Mp4Muxer)) $('mp4Note').hidden = false;
  $('stepMode').onchange = function () { live.step = this.checked; };
  raf = requestAnimationFrame(tick);
  function searchIds(q) { var kq = listQ, kg = listG; listQ = String(q || '').trim(); listG = ''; var r = SCENES.filter(matches).map(function (x) { return x.id; }); listQ = kq; listG = kg; return r; }
  window._mg = { searchIds: searchIds, images: images, state: state, drawFrame: drawFrame, selectScene: selectScene, RATIOS: RATIOS, params: params, fullParams: fullParams, renderMp4: renderMp4, renderGif: renderGif, download: download, progress: progress, toast: toast, save: save, renderForm: renderForm, renderList: renderList, refreshThumbs: refreshThumbs, fontsReady: fontsReady, dur: function (id) { return dur(S.BY[id], params(id)); }, fieldAud: fieldAud, fieldImgs: fieldImgs, audioCues: audioCues, setBusy: function (b) { busy = b; if (b) { state.playing = false; audioStop(); } else state.playing = true; }, isBusy: function () { return busy; }, cancelled: function () { return cancelFlag; }, fileBase: fileBase, esc: esc, fmtT: fmtT };
})();
