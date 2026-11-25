/* 즉석 모션그래픽 — 장면 정의
   모든 장면은 draw(ctx, t, p, F) 하나로 그린다. t = 초(0 ~ dur). 같은 t면 언제나 같은 그림(미리보기·MP4·GIF·전체화면이 같음).
   좌표는 F.W × F.H(16:9는 1920×1080, 1:1은 1080×1080, 9:16은 1080×1920). F.u = 크기 단위(16:9에서 1).
   p = 입력값(fields의 k) + 공통값(p._c1 주색, p._c2 보조색, p._bg 배경색, p._tx 글자색, p._logo 로고 Image|null, p._trans 투명 배경 여부). */
(function () {
  var E = {
    out: function (x) { return 1 - Math.pow(1 - x, 3); },
    in: function (x) { return x * x * x; },
    io: function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
    back: function (x) { var c = 1.70158, d = c + 1; return 1 + d * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
    elastic: function (x) { return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (2 * Math.PI / 3)) + 1; }
  };
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function seg(t, start, dur) { return clamp((t - start) / dur, 0, 1); }   // 구간 진행률 0~1
  function lerp(a, b, x) { return a + (b - a) * x; }
  function rnd(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function lines(s, max) { return String(s || '').split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, max || 99); }
  function hexA(hex, a) { var h = hex.replace('#', ''); if (h.length === 3) h = h.replace(/./g, function (c) { return c + c; }); var n = parseInt(h, 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function fmtNum(str) { // "1,234.5" 같은 글자 → {v, dec, prefix, suffix}
    var m = /^([^\d\-]*)(-?[\d,]*\.?\d*)(.*)$/.exec(String(str || '').trim());
    if (!m || !m[2]) return null;
    var raw = m[2].replace(/,/g, ''), dec = (raw.split('.')[1] || '').length;
    return { v: parseFloat(raw) || 0, dec: dec, pre: m[1], suf: m[3] };
  }
  function withComma(v, dec) { var s = v.toFixed(dec); var parts = s.split('.'); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return parts.join('.'); }

  /* ---- 그리기 도우미 (F에 붙음) ---- */
  function makeF(ctx, W, H, fontName, themeId) {
    var u = Math.min(W, H * 16 / 9) / 1920;
    var th = (window.MG && MG.themeOf) ? MG.themeOf(themeId) : null;
    if (th && th.font) fontName = th.font;
    var F = { W: W, H: H, u: u, cx: W / 2, cy: H / 2, E: E, seg: seg, lerp: lerp, clamp: clamp, rnd: rnd, lines: lines, hexA: hexA, theme: th };
    // 테마: 배경 / 카드 색 / 판(카드 모양 통째로)
    F.bg = function (p, t, c, o) { if (p._trans) return; o = o || {}; if (th) th.bg(ctx, p, F, t || 0, c, o); else { ctx.fillStyle = F.grad(p._bg, hexA(c || p._c1, .35), true); ctx.fillRect(0, 0, W, H); if (!o.plain && o.deco !== false) F.deco(p._c1, p._c2, t || 0); } };
    F.card = function (p) { return th ? th.card(p, F) : (F.light(p._bg) && !p._trans ? 'rgba(255,255,255,.88)' : 'rgba(255,255,255,.1)'); };
    F.panel = function (x, y, w, h, r, p, o) { o = o || {}; var rr = r * (th && th.radius != null ? th.radius : 1); ctx.save(); if (th && th.shadow && !o.hot) { ctx.shadowColor = 'rgba(0,0,0,.1)'; ctx.shadowBlur = 30 * u; ctx.shadowOffsetY = 8 * u; } if (th && th.glow && o.hot) { ctx.shadowColor = p._c1; ctx.shadowBlur = 40 * u; } ctx.fillStyle = o.hot ? p._c1 : (o.fill || F.card(p)); F.rr(x, y, w, h, rr); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; var st = o.hot ? null : (th && th.stroke); if (th && th.glow && !o.hot) st = hexA(p._c1, .6); if (st) { ctx.strokeStyle = st; ctx.lineWidth = (th.strokeW || 2) * u; ctx.stroke(); } ctx.restore(); };
    F.font = function (weight, size) { return weight + ' ' + Math.max(1, size) + 'px ' + fontName; };
    F.rr = function (x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
    // 글자 한 줄: maxW 안에 들어오게 자동 축소. 돌려주는 값 = 실제 크기
    F.text = function (s, x, y, o) {
      s = String(s == null ? '' : s); if (!s) return o.size;
      var size = o.size, min = o.min || Math.max(12, o.size * 0.4);
      ctx.font = F.font(o.weight || 700, size);
      if (o.maxW) { while (size > min && ctx.measureText(s).width > o.maxW) { size -= Math.max(1, size * 0.04); ctx.font = F.font(o.weight || 700, size); } }
      ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.baseline || 'middle';
      ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * (o.alphaMul == null ? 1 : o.alphaMul);
      if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 18 * u; ctx.shadowOffsetY = 4 * u; }
      ctx.fillStyle = o.color || '#fff'; ctx.fillText(s, x, y);
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.globalAlpha = 1;
      return size;
    };
    // 긴 글 줄 바꿈 (낱말 단위, 안 되면 글자 단위)
    F.wrap = function (s, maxW, size, weight) {
      ctx.font = F.font(weight || 700, size); var out = [];
      lines(s).forEach(function (line) {
        var words = line.split(' '), cur = '';
        words.forEach(function (w) {
          var test = cur ? cur + ' ' + w : w;
          if (ctx.measureText(test).width <= maxW) { cur = test; return; }
          if (cur) out.push(cur);
          if (ctx.measureText(w).width <= maxW) { cur = w; return; }
          cur = ''; for (var i = 0; i < w.length; i++) { if (ctx.measureText(cur + w[i]).width > maxW && cur) { out.push(cur); cur = ''; } cur += w[i]; }
        });
        if (cur) out.push(cur);
      });
      return out;
    };
    // 여러 줄 글 상자: 줄 수에 맞게 크기 조절, 가운데 기준 y
    F.para = function (s, x, y, o) {
      var size = o.size, min = o.min || o.size * 0.5, ls;
      do { ls = F.wrap(s, o.maxW, size, o.weight); if (ls.length <= (o.maxLines || 4)) break; size -= Math.max(1, size * 0.06); } while (size > min);
      var lh = size * (o.lh || 1.35), total = lh * ls.length, y0 = y - total / 2 + lh / 2;
      ls.forEach(function (l, i) { F.text(l, x, y0 + i * lh, { size: size, weight: o.weight, color: o.color, align: o.align, alpha: o.alpha }); });
      return { size: size, h: total, n: ls.length };
    };
    F.imgContain = function (img, x, y, w, h, alpha) {
      if (!img || !img.naturalWidth) return;
      var r = Math.min(w / img.naturalWidth, h / img.naturalHeight), dw = img.naturalWidth * r, dh = img.naturalHeight * r;
      ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); ctx.globalAlpha = 1;
    };
    F.imgCover = function (img, x, y, w, h, zoom, px, py) { // zoom≥1, px/py 0~1 초점
      if (!img || !img.naturalWidth) return;
      var r = Math.max(w / img.naturalWidth, h / img.naturalHeight) * (zoom || 1), dw = img.naturalWidth * r, dh = img.naturalHeight * r;
      var dx = x - (dw - w) * (px == null ? .5 : px), dy = y - (dh - h) * (py == null ? .5 : py);
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.drawImage(img, dx, dy, dw, dh); ctx.restore();
    };
    F.circle = function (x, y, r, color) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); };
    F.grad = function (c1, c2, vertical) { var g = vertical ? ctx.createLinearGradient(0, 0, 0, H) : ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, c1); g.addColorStop(1, c2); return g; };
    // 배경 장식: 은은한 원 두 개 (주색 계열)
    F.deco = function (c1, c2, t) {
      ctx.save(); ctx.globalAlpha = .18;
      F.circle(W * .85 + Math.sin(t * .5) * 20 * u, H * .2, 320 * u, c1);
      F.circle(W * .12, H * .85 + Math.cos(t * .4) * 20 * u, 260 * u, c2);
      ctx.restore();
    };
    // 로고 (공통 입력) — 없으면 아무것도 안 그림. 돌려주는 값 = 그렸는지
    F.logo = function (img, x, y, w, h, alpha) { if (!img) return false; F.imgContain(img, x, y, w, h, alpha); return true; };
    F.light = function (hex) { var h = hex.replace('#', ''); if (h.length === 3) h = h.replace(/./g, function (c) { return c + c; }); var n = parseInt(h, 16); return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) > 160; };
    return F;
  }

  var GROUPS = ['의식·개회', '진행', 'PPT 꾸밈', '마무리·홍보'];
  var SCENES = [], SCENES_BY = {};
  function add(list) { list.forEach(function (sc) { if (SCENES_BY[sc.id]) return; SCENES.push(sc); SCENES_BY[sc.id] = sc; }); }
  window.MG = { SCENES: SCENES, BY: SCENES_BY, GROUPS: GROUPS, add: add, makeF: makeF, E: E, seg: seg, lerp: lerp, clamp: clamp, rnd: rnd, lines: lines, hexA: hexA, fmtNum: fmtNum, withComma: withComma };
})();
