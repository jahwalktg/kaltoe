/* 즉석 모션그래픽 — 장면: 의식·개회 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA, fmtNum = MG.fmtNum, withComma = MG.withComma;
  MG.add([
    /* 1. 오프닝: 로고 + 행사명 */
    {
      id: 'open', group: '의식·개회', icon: '🎬', name: '오프닝 — 로고와 행사명', dur: 6,
      desc: '로고가 떠오르고 행사명·부제·날짜가 차례로 나타나 마지막 그림에 멈춥니다. PPT 첫 장이나 행사 시작 화면.',
      fields: [
        { k: 'title', label: '행사명·제목', def: '2026년 직원 역량강화 교육', max: 40 },
        { k: 'sub', label: '부제(선택)', def: '함께 배우고 함께 자라는 하루', max: 50 },
        { k: 'date', label: '날짜·장소 한 줄(선택)', def: '2026. 11. 28.(금) 14:00 · 3층 교육장', max: 50 },
        { k: 'org', label: '회사 이름(로고가 없을 때 글자로)', def: '칼퇴상사', max: 24 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx;
        F.bg(p, t, p._c1);
        var tall = H > W * 1.1;
        var a1 = E.back(seg(t, .15, .9)), al = seg(t, .15, .5);
        var logoH = (tall ? 300 : 260) * u, logoY = (tall ? H * .22 : H * .18);
        ctx.save(); ctx.translate(cx, logoY + logoH / 2); ctx.scale(Math.max(.01, a1), Math.max(.01, a1)); ctx.globalAlpha = al;
        if (!F.logo(p._logo, -logoH * 1.2, -logoH / 2, logoH * 2.4, logoH, al)) F.text(p.org, 0, 0, { size: 72 * u, weight: 800, color: p._tx, maxW: W * .8, alpha: al });
        ctx.restore();
        // 가로 선
        var lw = seg(t, .8, .7); ctx.fillStyle = p._c2; ctx.fillRect(cx - 160 * u * E.out(lw), logoY + logoH + 60 * u, 320 * u * E.out(lw), 6 * u);
        var y1 = logoY + logoH + (tall ? 220 : 180) * u;
        var a2 = seg(t, 1.0, .7); F.para(p.title, cx, y1 + (1 - E.out(a2)) * 40 * u, { size: (tall ? 92 : 110) * u, weight: 800, color: p._tx, maxW: W * .86, maxLines: 2, alpha: a2 });
        var a3 = seg(t, 1.6, .7); F.text(p.sub, cx, y1 + (tall ? 190 : 150) * u + (1 - E.out(a3)) * 30 * u, { size: 50 * u, weight: 500, color: p._tx, maxW: W * .8, alpha: a3 * .9 });
        var a4 = seg(t, 2.1, .7);
        if (p.date) { ctx.save(); ctx.globalAlpha = a4; var tw = Math.min(W * .7, 60 * u + ctx.measureText(p.date).width); F.rr(cx - tw / 2, y1 + (tall ? 290 : 240) * u, tw, 76 * u, 38 * u); ctx.fillStyle = hexA(p._c1, .9); ctx.fill(); ctx.restore(); F.text(p.date, cx, y1 + (tall ? 328 : 278) * u, { size: 38 * u, weight: 600, color: '#fff', maxW: tw - 60 * u, alpha: a4 }); }
      }
    },,
    /* 2. 카운트다운 */
    {
      id: 'count', group: '의식·개회', icon: '⏱', name: '시작 카운트다운', dur: function (p) { return (parseInt(p.n, 10) || 5) + 2; },
      desc: '5·4·3·2·1이 큰 숫자로 바뀌고 「시작합니다」가 뜹니다. 행사 시작 직전, 쉬는 시간 끝.',
      fields: [
        { k: 'n', label: '시작 숫자', type: 'number', def: 5, min: 3, max: 10 },
        { k: 'top', label: '위 글(선택)', def: '잠시 후 시작합니다', max: 30 },
        { k: 'end', label: '끝 글', def: '시작합니다!', max: 20 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, n = parseInt(p.n, 10) || 5;
        F.bg(p, t, null, { plain: true });
        F.text(p.top, cx, cy - 330 * u, { size: 56 * u, weight: 600, color: p._tx, maxW: W * .8, alpha: seg(t, 0, .5) * .9 });
        var R = 250 * u;
        if (t < n) {
          var i = Math.floor(t), f = t - i, num = n - i;
          ctx.save(); ctx.lineWidth = 18 * u; ctx.strokeStyle = hexA(p._c2, .25); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = p._c1; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - f)); ctx.stroke(); ctx.restore();
          var sc = 1 + (1 - E.out(clamp(f * 2.5, 0, 1))) * .35, al = f < .85 ? 1 : 1 - (f - .85) / .15;
          ctx.save(); ctx.translate(cx, cy + 10 * u); ctx.scale(sc, sc); F.text(String(num), 0, 0, { size: 300 * u, weight: 900, color: p._tx, alpha: al }); ctx.restore();
        } else {
          var g = seg(t, n, .6);
          ctx.save(); ctx.translate(cx, cy); ctx.scale(E.back(g), E.back(g)); F.circle(0, 0, R + 30 * u, hexA(p._c1, .95)); ctx.restore();
          F.text(p.end, cx, cy, { size: 120 * u, weight: 900, color: '#fff', maxW: R * 1.7, alpha: seg(t, n + .2, .4) });
        }
      }
    },,
    /* 4. 순서 안내 */
    {
      id: 'steps', group: '의식·개회', icon: '🔢', name: '순서 안내 1→2→3', dur: function (p) { return 1.2 + lines(p.items, 6).length * .8 + 2; },
      desc: '제목 아래 순서가 번호와 함께 하나씩 나타납니다. 오늘 일정, 진행 순서, 절차 안내.',
      fields: [
        { k: 'title', label: '제목', def: '오늘의 순서', max: 30 },
        { k: 'items', label: '순서(한 줄에 하나, 6개까지)', type: 'lines', def: '개회 및 인사\n사업 성과 보고\n우수 사원 시상\n수상 소감 나눔\n폐회', max: 6 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, items = lines(p.items, 6), n = items.length || 1;
        F.bg(p, t, p._c1);
        var tall = H > W * 1.1;
        F.text(p.title, cx, H * (tall ? .12 : .14) - (1 - E.out(seg(t, 0, .6))) * 30 * u, { size: 84 * u, weight: 800, color: p._tx, maxW: W * .86, alpha: seg(t, 0, .6) });
        var top = H * (tall ? .22 : .27), avail = H * (tall ? .72 : .66), gap = Math.min(avail / n, (tall ? 180 : 150) * u), size = Math.min(60 * u, gap * .42);
        var boxW = Math.min(W * .84, 1300 * u), x0 = cx - boxW / 2;
        items.forEach(function (s, i) {
          var g = E.out(seg(t, 1.0 + i * .8, .6)), y = top + gap * i + gap / 2;
          if (g <= 0) return;
          ctx.save(); ctx.globalAlpha = g; ctx.translate((1 - g) * -60 * u, 0);
          F.panel(x0, y - gap * .38, boxW, gap * .76, 18 * u, p);
          F.circle(x0 + gap * .38, y, gap * .27, p._c1);
          F.text(String(i + 1), x0 + gap * .38, y + 2 * u, { size: gap * .3, weight: 800, color: '#fff' });
          F.text(s, x0 + gap * .8, y, { size: size, weight: 700, color: p._tx, align: 'left', maxW: boxW - gap * 1.0 });
          ctx.restore();
        });
      }
    },
  ]);
})();
