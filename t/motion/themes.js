/* 즉석 모션그래픽 — 디자인 테마
   테마 = 배경(무늬·장식)·카드(판) 모양·글꼴·기본 색 묶음. 장면은 F.bg / F.card / F.panel 만 부르고, 어떤 테마든 그대로 입는다.
   새 테마: 아래 THEMES에 한 덩어리. bg(ctx, p, F, t, c, o) — c = 배경에 섞을 강조색(선택), o.plain = 큰 장식 없이, o.deco === false = 장식 없이.
   무늬(종이 결·한지 섬유·점 격자)는 한 번 그려 캔버스에 두고(tex) 매 프레임 복사 — 매 프레임 픽셀 계산 안 함. */
(function () {
  var hexA = MG.hexA, rnd = MG.rnd;
  var texCache = {};
  function tex(key, w, h, draw) { var k = key + '|' + w + 'x' + h; if (texCache[k]) return texCache[k]; var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); draw(c.getContext('2d'), c.width, c.height); texCache[k] = c; return c; }
  function light(F, p) { return F.light(p._bg) && !p._trans; }
  function fill(ctx, F, style) { ctx.fillStyle = style; ctx.fillRect(0, 0, F.W, F.H); }

  var THEMES = {
    /* 1. 깔끔 네이비 — 처음부터 쓰던 모양 */
    classic: {
      id: 'classic', name: '깔끔 (기본)', desc: '배경색에서 주색으로 은은한 그라데이션, 흐린 원 두 개. 어느 장면에나 무난.',
      palette: { c1: '#1A6EFF', c2: '#F28C28', bg: '#0E1630' }, radius: 1,
      bg: function (ctx, p, F, t, c, o) { fill(ctx, F, F.grad(p._bg, hexA(c || p._c1, .35), true)); if (!o.plain && o.deco !== false) F.deco(p._c1, p._c2, t); },
      card: function (p, F) { return light(F, p) ? 'rgba(255,255,255,.88)' : 'rgba(255,255,255,.1)'; }
    },
    /* 2. 다크 글래스 */
    glass: {
      id: 'glass', name: '다크 글래스', desc: '어두운 바탕에 색 번짐과 가는 격자, 반투명 유리 카드. 발표·성과 보고에 세련된 느낌.',
      palette: { c1: '#7C6CF6', c2: '#22D3EE', bg: '#0B1020' }, radius: 1.3, stroke: 'rgba(255,255,255,.22)', strokeW: 2,
      bg: function (ctx, p, F, t, c, o) {
        var W = F.W, H = F.H, u = F.u; fill(ctx, F, p._bg);
        var dark = !F.light(p._bg);
        function blob(x, y, r, col, a) { var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, hexA(col, a)); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
        blob(W * .78 + Math.sin(t * .35) * 50 * u, H * .22 + Math.cos(t * .3) * 30 * u, W * .42, c || p._c1, dark ? .55 : .35);
        blob(W * .14 + Math.cos(t * .3) * 40 * u, H * .86, W * .38, p._c2, dark ? .45 : .3);
        if (!o.plain) { ctx.save(); ctx.globalAlpha = dark ? .05 : .08; ctx.strokeStyle = dark ? '#fff' : '#000'; ctx.lineWidth = 1; var gs = 96 * u; ctx.beginPath(); for (var x = (W % gs) / 2; x < W; x += gs) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (var y = (H % gs) / 2; y < H; y += gs) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke(); ctx.restore(); }
        var v = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.1); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, dark ? 'rgba(0,0,0,.55)' : 'rgba(0,0,0,.12)'); fill(ctx, F, v);
      },
      card: function (p, F) { return light(F, p) ? 'rgba(255,255,255,.72)' : 'rgba(255,255,255,.09)'; }
    },
    /* 3. 따뜻한 종이 */
    paper: {
      id: 'paper', name: '따뜻한 종이', desc: '크림색 종이 결에 테라코타·세이지 색, 명조 글꼴. 소식·인사·인용에 따뜻한 느낌.',
      palette: { c1: '#C96F3B', c2: '#4F7A5A', bg: '#FBF5EA' }, radius: .8, font: '"Noto Serif KR", "Pretendard", serif', shadow: true,
      bg: function (ctx, p, F, t, c, o) {
        var W = F.W, H = F.H, u = F.u; fill(ctx, F, p._bg);
        var grain = tex('grain', 256, 256, function (g, w, h) { var r = rnd(31); var im = g.createImageData(w, h); for (var i = 0; i < im.data.length; i += 4) { var v = 128 + (r() - .5) * 90; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 30; } g.putImageData(im, 0, 0); });
        ctx.save(); ctx.globalAlpha = .55; ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
        if (!o.plain && o.deco !== false) { ctx.save(); ctx.globalAlpha = .13; ctx.translate(W * .97, H * .04); ctx.rotate(.32 + Math.sin(t * .2) * .01); ctx.fillStyle = c || p._c1; F.rr(-760 * u, -90 * u, 760 * u, 180 * u, 90 * u); ctx.fill(); ctx.restore(); ctx.save(); ctx.globalAlpha = .5; ctx.fillStyle = p._c2; ctx.fillRect(W * .06, H * .94, W * .22, 5 * u); ctx.restore(); }
      },
      card: function (p, F) { return light(F, p) ? 'rgba(255,255,255,.96)' : 'rgba(255,255,255,.1)'; }
    },
    /* 4. 선명한 그라데이션 */
    vivid: {
      id: 'vivid', name: '선명한 그라데이션', desc: '주색→보조색 대각선 그라데이션에 떠다니는 빛. 오프닝·축하·SNS에 눈에 띄는 느낌.',
      palette: { c1: '#6D28D9', c2: '#F97316', bg: '#3B1D8F' }, radius: 1.4, stroke: 'rgba(255,255,255,.28)', strokeW: 2,
      bg: function (ctx, p, F, t, c, o) {
        var W = F.W, H = F.H, u = F.u; var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, p._c1); g.addColorStop(.55, hexA(p._bg, 1)); g.addColorStop(1, p._c2); fill(ctx, F, g);
        var l = ctx.createRadialGradient(W * .2 + Math.sin(t * .25) * 60 * u, H * .15, 0, W * .2, H * .15, W * .5); l.addColorStop(0, 'rgba(255,255,255,.22)'); l.addColorStop(1, 'rgba(255,255,255,0)'); fill(ctx, F, l);
        var d = ctx.createRadialGradient(W * .9, H, 0, W * .9, H, W * .6); d.addColorStop(0, 'rgba(0,0,0,.28)'); d.addColorStop(1, 'rgba(0,0,0,0)'); fill(ctx, F, d);
        if (!o.plain && o.deco !== false) { ctx.save(); ctx.fillStyle = 'rgba(255,255,255,.07)'; var r = rnd(44); for (var i = 0; i < 3; i++) { var bx = W * (.15 + r() * .7), by = H * (.2 + r() * .6), s = (260 + r() * 260) * u * (1 + Math.sin(t * .4 + i) * .05); ctx.save(); ctx.translate(bx + Math.sin(t * .3 + i * 2) * 30 * u, by + Math.cos(t * .25 + i) * 24 * u); ctx.rotate(.4 + i); F.rr(-s / 2, -s / 2, s, s, s * .3); ctx.fill(); ctx.restore(); } ctx.globalAlpha = .06; ctx.fillStyle = '#fff'; ctx.save(); ctx.translate(W * .6, H * .5); ctx.rotate(-.6); ctx.fillRect(-W, -40 * u, W * 2, 80 * u); ctx.fillRect(-W, 160 * u, W * 2, 30 * u); ctx.restore(); ctx.restore(); }
      },
      card: function (p, F) { return light(F, p) ? 'rgba(255,255,255,.8)' : 'rgba(0,0,0,.22)'; }
    },
    /* 5. 한지·전통 */
    hanji: {
      id: 'hanji', name: '한지·전통', desc: '한지 섬유 결에 오방색 띠와 모서리 선, 명조 글꼴. 기념식·국민의례·명절 인사에.',
      palette: { c1: '#B5312F', c2: '#1F4E9A', bg: '#F4ECDC' }, radius: .4, font: '"Noto Serif KR", "Pretendard", serif', stroke: 'rgba(90,62,43,.55)', strokeW: 2,
      bg: function (ctx, p, F, t, c, o) {
        var W = F.W, H = F.H, u = F.u; fill(ctx, F, p._bg);
        var fib = tex('fiber', 512, 512, function (g, w, h) { var r = rnd(52); g.strokeStyle = 'rgba(90,62,43,.07)'; g.lineWidth = 1; for (var i = 0; i < 900; i++) { var x = r() * w, y = r() * h, a = r() * 6.28, L = 6 + r() * 26; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L / 2 + (r() - .5) * 6, y + Math.sin(a) * L / 2, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); } });
        ctx.save(); ctx.fillStyle = ctx.createPattern(fib, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
        if (o.deco === false) return;
        var cols = ['#B5312F', '#E9B949', '#1F4E9A', '#3C8A5A', '#2B2B2B'], bw = 14 * u; ctx.save(); for (var i = 0; i < 5; i++) { ctx.fillStyle = cols[i]; ctx.globalAlpha = .85; ctx.fillRect(W * .06 + i * (W * .88 / 5), 0, W * .88 / 5, bw); if (!o.plain) ctx.fillRect(W * .06 + (4 - i) * (W * .88 / 5), H - bw, W * .88 / 5, bw); } ctx.restore();
        if (o.plain) return;
        ctx.save(); ctx.strokeStyle = 'rgba(90,62,43,.55)'; ctx.lineWidth = 3 * u; var m = 40 * u, L = 120 * u; [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(function (k) { ctx.beginPath(); ctx.moveTo(k[0], k[1] + k[3] * L); ctx.lineTo(k[0], k[1]); ctx.lineTo(k[0] + k[2] * L, k[1]); ctx.stroke(); }); ctx.restore();
      },
      card: function (p, F) { return light(F, p) ? 'rgba(255,253,247,.96)' : 'rgba(255,255,255,.1)'; }
    },
    /* 6. 흰 미니멀 */
    mono: {
      id: 'mono', name: '흰 미니멀', desc: '흰 바탕에 점 격자와 작은 강조 표시만. PPT 안에 그대로 넣어도 튀지 않는 깔끔한 모양.',
      palette: { c1: '#111827', c2: '#2563EB', bg: '#FFFFFF' }, radius: .5, stroke: 'rgba(0,0,0,.1)', strokeW: 2,
      bg: function (ctx, p, F, t, c, o) {
        var W = F.W, H = F.H, u = F.u; fill(ctx, F, p._bg); var dark = !F.light(p._bg);
        var dots = tex('dots' + (dark ? 'd' : 'l'), 64 * u, 64 * u, function (g, w, h) { g.fillStyle = dark ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.1)'; g.beginPath(); g.arc(w / 2, h / 2, Math.max(1, 2 * u), 0, Math.PI * 2); g.fill(); });
        ctx.save(); ctx.fillStyle = ctx.createPattern(dots, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
        if (o.plain || o.deco === false) return;
        ctx.save(); ctx.fillStyle = c || p._c2; ctx.fillRect(W * .05, H * .07, 26 * u, 26 * u); ctx.fillStyle = dark ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.18)'; ctx.fillRect(W * .05 + 40 * u, H * .07 + 11 * u, 120 * u, 4 * u); ctx.restore();
      },
      card: function (p, F) { return light(F, p) ? '#F3F4F6' : 'rgba(255,255,255,.08)'; }
    },
    /* 7. 네온 라인 */
    neon: {
      id: 'neon', name: '네온 라인', desc: '검은 바탕에 멀리 뻗는 빛 격자와 빛나는 테두리. 카운트다운·추첨·퀴즈에 긴장감.',
      palette: { c1: '#22D3EE', c2: '#F472B6', bg: '#05060F' }, radius: .6, stroke: null, strokeW: 2, glow: true,
      bg: function (ctx, p, F, t, c, o) {
        var W = F.W, H = F.H, u = F.u; fill(ctx, F, p._bg);
        var g = ctx.createRadialGradient(W / 2, H * .62, 0, W / 2, H * .62, W * .6); g.addColorStop(0, hexA(c || p._c1, .22)); g.addColorStop(1, 'rgba(0,0,0,0)'); fill(ctx, F, g);
        if (o.deco === false) return;
        ctx.save(); ctx.strokeStyle = hexA(p._c1, .35); ctx.lineWidth = 2 * u; var hz = H * .62, n = 14; ctx.beginPath(); for (var i = -n; i <= n; i++) { ctx.moveTo(W / 2 + i * 70 * u, hz); ctx.lineTo(W / 2 + i * 70 * u * 6, H + 50 * u); } ctx.stroke();
        var sp = ((t * .25) % 1); for (var k = 0; k < 9; k++) { var f = Math.pow((k + sp) / 9, 2.2), y = hz + f * (H - hz); ctx.globalAlpha = .15 + f * .4; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } ctx.restore();
        if (o.plain) return;
        ctx.save(); ctx.globalAlpha = .9; var r = rnd(77); for (var s = 0; s < 40; s++) { var sx = r() * W, sy = r() * hz, ph = r() * 6.28; ctx.globalAlpha = .3 + .6 * (Math.sin(t * 2 + ph) + 1) / 2; F.circle(sx, sy, (1.5 + r() * 2) * u, '#fff'); } ctx.restore();
      },
      card: function (p, F) { return light(F, p) ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.06)'; }
    }
  };
  var ORDER = ['classic', 'glass', 'paper', 'vivid', 'hanji', 'mono', 'neon'];
  MG.THEMES = THEMES; MG.THEME_ORDER = ORDER;
  MG.themeOf = function (id) { return THEMES[id] || THEMES.classic; };
})();
