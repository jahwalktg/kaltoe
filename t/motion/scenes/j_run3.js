/* 즉석 모션그래픽 — 장면: 진행 (3차) 다음 순서 예고·박수 유도·영상 위 자막 두 줄 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA;
  function emoji(ctx, s, x, y, size) { ctx.font = size + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }

  MG.add([
    /* 24. 다음 순서 예고 */
    {
      id: 'next', group: '진행', icon: '⏭️', name: '다음 순서 예고 — 작은 띠', dur: function (p) { return p.stay === 'y' ? 5 : 7; },
      desc: '「잠시 후」 꼬리표와 다음 순서가 모서리에 들어옵니다(머물거나 나감). 배경 「투명」으로 받아 발표 화면·영상 위에 얹기 좋습니다.',
      fields: [
        { k: 'lead', label: '꼬리표', def: '잠시 후', max: 10 },
        { k: 'title', label: '다음 순서', def: '부서 성과 발표가 이어집니다', max: 40 },
        { k: 'time', label: '시각·간격(선택)', def: '14:30 시작', max: 20 },
        { k: 'pos', label: '위치', type: 'select', def: 'br', opts: [['br', '오른쪽 아래'], ['bl', '왼쪽 아래'], ['tr', '오른쪽 위'], ['bc', '아래 가운데']] },
        { k: 'stay', label: '끝날 때', type: 'select', def: 'n', opts: [['n', '들어왔다 나감'], ['y', '들어와서 머묾']] }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, dur = p.stay === 'y' ? 5 : 7;
        F.bg(p, t, null, { plain: true });
        var gin = E.out(seg(t, 0, .6)), gout = p.stay === 'y' ? 0 : E.in(seg(t, dur - .7, .6)), a = Math.min(gin, 1 - gout);
        ctx.font = F.font(800, 46 * u); var tw = Math.min(W * .7, ctx.measureText(p.title).width + 60 * u); ctx.font = F.font(600, 30 * u); var lw = Math.max(ctx.measureText(p.lead).width + 40 * u, 120 * u), tmw = p.time ? ctx.measureText(p.time).width + 40 * u : 0;
        var bw = Math.max(tw, lw + tmw + 30 * u), bh = 150 * u, right = p.pos === 'br' || p.pos === 'tr', top = p.pos === 'tr';
        var x0 = p.pos === 'bc' ? (W - bw) / 2 : right ? W - bw - W * .05 : W * .05, y0 = top ? H * .08 : H - bh - H * .08;
        var slide = (1 - gin) * (p.pos === 'bc' ? 0 : 1) * (right ? 1 : -1) * (bw + W * .05) + gout * (right ? 1 : -1) * (bw + W * .06), ys = p.pos === 'bc' ? (1 - gin) * (bh + H * .1) + gout * (bh + H * .1) : 0;
        ctx.save(); ctx.translate(x0 + slide, y0 + ys); ctx.globalAlpha = 1;
        ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 24 * u; ctx.fillStyle = p._trans || !F.light(p._bg) ? 'rgba(255,255,255,.96)' : '#fff'; F.rr(0, 0, bw, bh, 20 * u); ctx.fill(); ctx.shadowColor = 'transparent';
        ctx.fillStyle = p._c1; F.rr(0, 0, bw, 8 * u, 4 * u); ctx.fill();
        ctx.fillStyle = p._c1; F.rr(26 * u, 24 * u, lw, 46 * u, 12 * u); ctx.fill(); F.text(p.lead, 26 * u + lw / 2, 47 * u, { size: 30 * u, weight: 700, color: '#fff' });
        if (p.time) { F.text('⏱ ' + p.time, 26 * u + lw + 20 * u, 47 * u, { size: 30 * u, weight: 600, color: '#5B6885', align: 'left', maxW: bw - lw - 60 * u }); }
        F.text(p.title, 30 * u, 108 * u, { size: 46 * u, weight: 800, color: '#1A2B50', align: 'left', maxW: bw - 60 * u, alpha: seg(t, .4, .4) });
        ctx.restore();
      }
    },
    /* 25. 박수 유도 */
    {
      id: 'clap', group: '진행', icon: '👏', name: '박수 유도(반복)', dur: 3, loop: true,
      desc: '손뼉 아이콘이 통통 뛰고 「큰 박수 부탁드립니다」가 뜁니다. 짧게 반복되는 GIF. 시상·소개 뒤 분위기 띄우기.',
      fields: [
        { k: 'text', label: '큰 글', def: '큰 박수 부탁드립니다!', max: 24 },
        { k: 'sub', label: '작은 글(선택)', def: '', max: 40 },
        { k: 'n', label: '손뼉 수', type: 'number', def: 3, min: 1, max: 5, step: 1 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, n = clamp(+p.n || 3, 1, 5), ph = (t / 3) * Math.PI * 2;
        F.bg(p, t, p._c1);
        var r = rnd(5); ctx.save(); for (var i = 0; i < 24; i++) { var sx = r() * W, sy = r() * H, o = r() * 6.28; ctx.globalAlpha = (Math.sin(t * 6 + o) + 1) / 2 * .5; F.circle(sx, sy, (3 + r() * 5) * u, i % 2 ? p._c2 : '#F2B705'); } ctx.restore();
        for (var k = 0; k < n; k++) { var x = cx + (k - (n - 1) / 2) * 240 * u, b = Math.abs(Math.sin(ph * 2 + k * 1.1)), y = cy - 120 * u - b * 60 * u, sc = 1 + b * .15; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate((k % 2 ? -1 : 1) * Math.sin(ph * 2 + k) * .12); emoji(ctx, '👏', 0, 0, 180 * u); ctx.restore(); }
        var bounce = 1 + Math.abs(Math.sin(ph * 2)) * .06;
        ctx.save(); ctx.translate(cx, cy + 140 * u); ctx.scale(bounce, bounce); F.text(p.text, 0, 0, { size: 120 * u, weight: 900, color: p._tx, maxW: W * .88 / bounce, shadow: true }); ctx.restore();
        F.text(p.sub, cx, cy + 270 * u, { size: 44 * u, weight: 500, color: p._tx, maxW: W * .8, alpha: .85 });
      }
    },
    /* 42. 영상 위 자막 두 줄 */
    {
      id: 'sub2', group: '진행', icon: '💬', name: '영상 위 자막 — 시간 지정',
      desc: '자막이 아래쪽 띠에 차례로 바뀝니다. 한 줄에 「윗줄 | 아랫줄(선택) | 초(선택)」. 배경 「투명」으로 GIF를 받아 영상 위에 얹거나, 질문·답 자막으로.',
      fields: [
        { k: 'items', label: '자막(한 줄에 하나, 12개까지)', type: 'lines', def: 'Q. 체육대회는 누가 참가할 수 있나요? | 직원 누구나 | 4\nA. 칼퇴상사 직원이면 누구나 참가합니다 | | 5\n자세한 내용은 총무팀에 물어보세요', max: 12 },
        { k: 'each', label: '기본 초(줄에 초가 없을 때)', type: 'number', def: 3.5, min: 1, max: 15, step: 0.5 },
        { k: 'style', label: '모양', type: 'select', def: 'box', opts: [['box', '어두운 띠(영상 위)'], ['bar', '색 띠(주색)'], ['plain', '글자만(그림자)']] }
      ],
      items: function (p) { var e = +p.each || 3.5; return lines(p.items, 12).map(function (l) { var a = l.split('|').map(function (x) { return x.trim(); }); var d = parseFloat(a[2]); return { a: a[0] || '', b: a[1] || '', d: d > 0 ? d : e }; }); },
      dur: function (p) { return Math.max(1, this.items(p).reduce(function (s, it) { return s + it.d; }, 0)); },
      marks: function (p) { var t = 0, m = []; this.items(p).forEach(function (it, i) { if (i) m.push(t); t += it.d; }); return m; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, its = this.items(p);
        if (!p._trans) { F.bg(p, t, null, { plain: true }); if (F.light(p._bg)) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, H); } }
        var acc = 0, cur = its[its.length - 1], f = 1; for (var i = 0; i < its.length; i++) { if (t < acc + its[i].d) { cur = its[i]; f = (t - acc) / its[i].d; break; } acc += its[i].d; }
        if (!cur) return;
        var two = !!cur.b, bh = (two ? 190 : 120) * u, y0 = H - bh - H * .07, a = Math.min(1, seg(f * cur.d, 0, .3) * 1) * (1 - seg(f * cur.d, cur.d - .25, .25) * (cur === its[its.length - 1] ? 0 : 1));
        ctx.font = F.font(700, 54 * u); var tw = Math.min(W * .9, Math.max(ctx.measureText(cur.a).width, two ? ctx.measureText(cur.b).width * .8 : 0) + 90 * u);
        ctx.save(); ctx.globalAlpha = a;
        if (p.style === 'box') { ctx.fillStyle = 'rgba(0,0,0,.6)'; F.rr(cx - tw / 2, y0, tw, bh, 18 * u); ctx.fill(); }
        else if (p.style === 'bar') { ctx.fillStyle = hexA(p._c1, .92); F.rr(cx - tw / 2, y0, tw, bh, 18 * u); ctx.fill(); }
        F.text(cur.a, cx, y0 + (two ? 62 : 60) * u, { size: 54 * u, weight: 700, color: '#fff', maxW: W * .86, shadow: p.style === 'plain' });
        if (two) F.text(cur.b, cx, y0 + 138 * u, { size: 40 * u, weight: 500, color: p.style === 'bar' ? 'rgba(255,255,255,.9)' : '#FFD166', maxW: W * .86, shadow: p.style === 'plain' });
        ctx.restore();
      }
    }
  ]);
})();
