/* 즉석 모션그래픽 — 장면: 의식·개회 (3차) 개회·폐회 선언·휴대폰·촬영 안내·로고 대기 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA;
  function emoji(ctx, s, x, y, size) { ctx.font = size + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }

  MG.add([
    /* 7. 개회·폐회 선언 */
    {
      id: 'declare', group: '의식·개회', icon: '📣', name: '개회·폐회 선언', dur: 5,
      desc: '행사명이 먼저 뜨고 「개회를 선언합니다」가 크게 찍히며 빛줄기가 퍼집니다. 마지막 그림에 멈춰 PPT에 넣기 좋습니다.',
      fields: [
        { k: 'kind', label: '종류', type: 'select', def: 'open', opts: [['open', '개회 선언'], ['close', '폐회 선언'], ['start', '시작 선언(「시작합니다」)'], ['custom', '직접 쓰기']] },
        { k: 'title', label: '행사명', def: '2026년 성과보고회', max: 40 },
        { k: 'text', label: '직접 쓸 문구(「직접 쓰기」일 때)', def: '○○의 출발을 선언합니다', max: 30 },
        { k: 'who', label: '선언하는 분(선택)', def: '', max: 30 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy; F.bg(p, t);
        var words = { open: '개회를 선언합니다', close: '폐회를 선언합니다', start: '지금부터 시작합니다' }, main = p.kind === 'custom' ? p.text : words[p.kind] || words.open;
        var g1 = E.out(seg(t, 0, .6)), hit = seg(t, 1.0, .35), gb = E.back(hit), glow = Math.max(0, 1 - seg(t, 1.3, 1.2));
        F.text(p.title, cx, cy - 200 * u + (1 - g1) * 40 * u, { size: 60 * u, weight: 700, color: p._tx, maxW: W * .86, alpha: g1 * .9 });
        ctx.save(); ctx.globalAlpha = .55 * g1; ctx.fillStyle = p._c2; ctx.fillRect(cx - 120 * u * g1, cy - 125 * u, 240 * u * g1, 6 * u); ctx.restore();
        // 빛줄기
        if (hit > 0) { ctx.save(); ctx.translate(cx, cy + 20 * u); ctx.globalAlpha = glow * .5; var r0 = rnd(11); for (var i = 0; i < 18; i++) { var a = (i / 18) * Math.PI * 2 + r0() * .2, len = (500 + r0() * 500) * u * E.out(hit) * (1 + (1 - glow) * .3); ctx.strokeStyle = i % 2 ? p._c1 : p._c2; ctx.lineWidth = (3 + r0() * 5) * u; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 160 * u, Math.sin(a) * 160 * u); ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len); ctx.stroke(); } ctx.restore(); }
        if (hit > 0) { ctx.save(); ctx.translate(cx, cy + 20 * u); var sc = Math.max(.01, lerp(1.6, 1, clamp(gb, 0, 2))); ctx.scale(sc, sc); F.text(main, 0, 0, { size: 150 * u, weight: 900, color: p._tx, maxW: W * .9 / sc, shadow: true, alpha: clamp(hit * 3, 0, 1) }); ctx.restore(); }
        F.text(p.who, cx, cy + 200 * u, { size: 44 * u, weight: 500, color: p._tx, maxW: W * .8, alpha: seg(t, 2.2, .6) * .85 });
      }
    },
    /* 27. 휴대폰·촬영 안내(반복) */
    {
      id: 'phone', group: '의식·개회', icon: '📵', name: '휴대폰·촬영 안내(반복)', dur: 9, loop: true,
      desc: '아이콘 3~4개가 차례로 커지며 한 줄 안내가 바뀝니다. 시작 전 1분 반복 재생. 「이모지 | 글」로 항목을 바꿀 수 있습니다.',
      fields: [
        { k: 'title', label: '제목', def: '시작 전 안내', max: 24 },
        { k: 'items', label: '항목(한 줄에 「이모지 | 글」, 4개까지)', type: 'lines', def: '📵 | 휴대폰은 진동이나 무음으로\n📷 | 사진·영상 촬영은 자유롭게\n🚪 | 비상구는 양쪽 뒤편', max: 4 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, tall = H > W * 1.1; F.bg(p, t);
        var its = lines(p.items, 4).map(function (l) { var a = l.split('|').map(function (x) { return x.trim(); }); return a.length > 1 ? { e: a[0], t: a.slice(1).join(' ') } : { e: '🔔', t: a[0] }; }), n = its.length || 1, each = 9 / n, cur = Math.floor((t % 9) / each), f = ((t % 9) - cur * each) / each;
        F.text(p.title, cx, tall ? H * .12 : H * .15, { size: 64 * u, weight: 800, color: p._tx, maxW: W * .9 });
        its.forEach(function (it, i) {
          var x, y; if (tall) { x = cx; y = H * .25 + i * (H * .5 / n) + (H * .5 / n) / 2; } else { var slot = W * .8 / n; x = cx - W * .4 + slot * i + slot / 2; y = cy + 10 * u; }
          var on = i === cur, pop = on ? 1 + Math.sin(f * Math.PI) * .18 : 1, R = Math.min(170 * u, (tall ? H * .5 / n : W * .8 / n) * .36);
          ctx.save(); ctx.globalAlpha = on ? 1 : .45; ctx.translate(x, y); ctx.scale(pop, pop);
          ctx.fillStyle = on ? hexA(p._c1, .95) : F.card(p); ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
          emoji(ctx, it.e, 0, 6 * u, R * 1.05); ctx.restore();
        });
        var it = its[cur] || its[0]; ctx.save(); ctx.globalAlpha = Math.min(1, Math.sin(f * Math.PI) * 2.5); F.text(it ? it.t : '', cx, tall ? H * .86 : H * .82, { size: 58 * u, weight: 700, color: p._tx, maxW: W * .88 }); ctx.restore();
        ctx.save(); ctx.globalAlpha = .6; for (var k = 0; k < n; k++) F.circle(cx + (k - (n - 1) / 2) * 34 * u, H - 40 * u, 8 * u, k === cur ? p._c1 : hexA(p._tx, .35)); ctx.restore();
      }
    },
    /* 43. 로고 대기(반복) */
    {
      id: 'logoloop', group: '의식·개회', icon: '🔄', name: '로고 대기(반복) — 숨 쉬는 로고', dur: 6, loop: true,
      desc: '로고(없으면 회사 이름)가 숨 쉬듯 커졌다 작아지고 고리가 돕니다. 빈 화면 대신 띄워 두는 장면. 끝과 처음이 이어집니다.',
      fields: [
        { k: 'org', label: '회사 이름(로고 없을 때 큰 글)', def: '칼퇴상사', max: 24 },
        { k: 'text', label: '아래 한 줄(선택)', def: '잠시만 기다려 주세요', max: 40 },
        { k: 'mode', label: '움직임', type: 'select', def: 'ring', opts: [['ring', '숨 쉬기 + 도는 고리'], ['breath', '숨 쉬기만'], ['dots', '숨 쉬기 + 점 세 개']] }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, ph = (t / 6) * Math.PI * 2;
        if (!p._trans) { F.bg(p, t, p._c1, { deco: false }); ctx.save(); ctx.globalAlpha = .12; F.circle(cx, cy, (520 + Math.sin(ph) * 30) * u, p._c1); ctx.restore(); }
        var br = 1 + Math.sin(ph) * .05, box = 420 * u, ly = cy - (p.text ? 40 * u : 0);
        if (p.mode === 'ring') { ctx.save(); ctx.translate(cx, ly); ctx.rotate(ph); ctx.lineWidth = 14 * u; ctx.lineCap = 'round'; ctx.strokeStyle = hexA(p._tx, .12); ctx.beginPath(); ctx.arc(0, 0, box * .78, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = p._c1; ctx.beginPath(); ctx.arc(0, 0, box * .78, 0, Math.PI * .6); ctx.stroke(); ctx.strokeStyle = p._c2; ctx.beginPath(); ctx.arc(0, 0, box * .78, Math.PI, Math.PI * 1.35); ctx.stroke(); ctx.restore(); }
        ctx.save(); ctx.translate(cx, ly); ctx.scale(br, br);
        if (!F.logo(p._logo, -box * .6, -box * .3, box * 1.2, box * .6)) F.text(p.org, 0, 0, { size: 96 * u, weight: 900, color: p._tx, maxW: box * 1.3 });
        ctx.restore();
        if (p.mode === 'dots') { for (var i = 0; i < 3; i++) { var a = (Math.sin(ph * 2 - i * 1.0) + 1) / 2; F.circle(cx + (i - 1) * 50 * u, ly + box * .55, (10 + a * 8) * u, hexA(p._c1, .4 + a * .6)); } }
        F.text(p.text, cx, ly + box * .55 + (p.mode === 'dots' ? 90 * u : 50 * u), { size: 44 * u, weight: 500, color: p._tx, maxW: W * .8, alpha: .6 + .3 * Math.sin(ph * 2) });
      }
    }
  ]);
})();
