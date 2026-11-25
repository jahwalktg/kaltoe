/* 즉석 모션그래픽 — 장면: 4차 (1순위 ①) D-day·행사 시간표·순서 진행 바·OX 퀴즈·용어 카드 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA;
  function emoji(ctx, s, x, y, size) { ctx.font = size + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
  function stepsDur(segs) { return segs.reduce(function (a, s) { return a + s.d; }, 0); }
  function stepsMarks(segs) { var t = 0, m = []; segs.forEach(function (s, i) { if (i) m.push(t); t += s.d; }); return m; }
  function drawSteps(segs, ctx, t, p, F) { var acc = 0; for (var i = 0; i < segs.length; i++) { if (t < acc + segs[i].d || i === segs.length - 1) { segs[i].draw(ctx, Math.min(t - acc, segs[i].d), p, F); return; } acc += segs[i].d; } }
  function splitBar(l) { return l.split('|').map(function (x) { return x.trim(); }); }
  function daysTo(ymd) { var m = /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/.exec(String(ymd || '').trim()); if (!m) return null; var d = new Date(+m[1], +m[2] - 1, +m[3]), now = new Date(); now.setHours(0, 0, 0, 0); return Math.round((d - now) / 86400000); }

  MG.add([
    /* D-day 카운트다운 */
    {
      id: 'dday', group: '의식·개회', icon: '📆', name: 'D-day 카운트다운', dur: 5,
      desc: '「행사까지 D-7」 숫자가 돌아가다 멈춥니다. 날짜를 넣으면 오늘 기준으로 자동 계산(파일로 받으면 받은 날 숫자로 고정). 대기 화면·단톡 공지·주간 회의 첫 장.',
      fields: [
        { k: 'title', label: '무엇까지', def: '2026년 성과보고회', max: 30 },
        { k: 'date', label: '행사 날짜(YYYY-MM-DD, 비우면 아래 숫자)', def: '', max: 12 },
        { k: 'n', label: '직접 넣는 D-숫자(날짜 비웠을 때)', type: 'number', def: 7, min: 0, max: 999 },
        { k: 'sub', label: '아래 글(선택)', def: '12. 12.(금) 14:00 · 구민회관 대강당', max: 50 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy; F.bg(p, t);
        var n = daysTo(p.date); if (n == null) n = Math.max(0, Math.round(+p.n || 0));
        var g = E.out(seg(t, .3, 1.8)), shown = Math.round(lerp(Math.max(n + 30, 30), n, g)), txt = n === 0 ? 'D-DAY' : n < 0 ? 'D+' + (-n) : 'D-' + shown;
        F.text(p.title, cx, H * .2, { size: 66 * u, weight: 700, color: p._tx, maxW: W * .86, alpha: seg(t, 0, .5) });
        ctx.save(); ctx.lineWidth = 16 * u; ctx.lineCap = 'round'; ctx.strokeStyle = hexA(p._tx, .12); ctx.beginPath(); ctx.arc(cx, cy + 40 * u, 300 * u, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = p._c1; ctx.beginPath(); ctx.arc(cx, cy + 40 * u, 300 * u, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * g); ctx.stroke(); ctx.restore();
        var pop = g > .99 ? 1 + Math.max(0, .1 - (t - 2.1) * .3) * (t > 2.1 ? 1 : 0) : 1;
        ctx.save(); ctx.translate(cx, cy + 40 * u); ctx.scale(pop, pop); F.text(txt, 0, 10 * u, { size: n === 0 ? 170 * u : 220 * u, weight: 900, color: p._tx, maxW: 540 * u }); ctx.restore();
        F.text(n === 0 ? '오늘입니다!' : n < 0 ? '지난 날짜입니다' : '일 남았습니다', cx, cy + 40 * u + 150 * u, { size: 40 * u, weight: 600, color: p._tx, alpha: seg(t, 2.1, .5) * .85 });
        F.text(p.sub, cx, H * .9, { size: 42 * u, weight: 500, color: p._tx, maxW: W * .86, alpha: seg(t, 1, .5) * .9 });
      }
    },
    /* 행사 시간표 */
    {
      id: 'timetable', group: '의식·개회', icon: '🕒', name: '행사 시간표 — 시각·순서·장소',
      desc: '「시각 | 순서 | 장소」 줄이 하나씩 나타나고, 지금 순서는 색으로 강조됩니다(8줄까지). 대기 화면·교육 일정·워크숍 시간표.',
      fields: [
        { k: 'title', label: '제목', def: '오늘의 일정', max: 30 },
        { k: 'rows', label: '줄(한 줄에 「시각 | 순서 | 장소(선택)」, 8줄까지)', type: 'lines', def: '13:30 | 등록·접수 | 1층 로비\n14:00 | 개회·국민의례 | 대강당\n14:10 | 성과 보고 | 대강당\n15:00 | 쉬는 시간 | \n15:20 | 우수 사원 시상 | 대강당\n16:00 | 단체 사진·폐회 | 대강당', max: 8 },
        { k: 'now', label: '지금 순서 번호(선택, 강조)', def: '', max: 2 }
      ],
      dur: function (p) { return 1 + lines(p.rows, 8).length * .5 + 2.5; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx; F.bg(p, t);
        var rows = lines(p.rows, 8).map(splitBar), n = rows.length || 1, now = parseInt(p.now, 10);
        F.text(p.title, cx, H * .11, { size: 68 * u, weight: 800, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) });
        var bw = Math.min(W * .84, 1400 * u), x0 = cx - bw / 2, top = H * .2, rh = Math.min(110 * u, (H * .74) / n);
        rows.forEach(function (r, i) { var a = E.out(seg(t, .6 + i * .5, .5)), y = top + rh * i, hot = now === i + 1; if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate((1 - a) * 60 * u, 0); F.panel(x0, y + 6 * u, bw, rh - 12 * u, 16 * u, p, { hot: hot }); ctx.restore(); var tc = hot ? '#fff' : p._tx; F.text(r[0] || '', x0 + 40 * u, y + rh / 2, { size: Math.min(46 * u, rh * .42), weight: 800, color: hot ? '#fff' : p._c1, align: 'left', maxW: bw * .18, alpha: a }); F.text(r[1] || '', x0 + bw * .24, y + rh / 2, { size: Math.min(46 * u, rh * .42), weight: 700, color: tc, align: 'left', maxW: bw * .5, alpha: a }); F.text(r[2] || '', x0 + bw - 40 * u, y + rh / 2, { size: Math.min(36 * u, rh * .34), weight: 500, color: tc, align: 'right', maxW: bw * .24, alpha: a * .85 }); if (hot) F.text('▶ 지금', x0 + bw * .76, y + rh / 2, { size: Math.min(30 * u, rh * .3), weight: 800, color: '#fff', align: 'left', alpha: a * (.6 + .4 * Math.sin(t * 5)) }); });
      }
    },
    /* 순서 진행 바 */
    {
      id: 'progress', group: '진행', icon: '📍', name: '순서 진행 바 — 지금 몇 번째', dur: 6,
      desc: '전체 순서가 점으로 이어진 막대 위에 「지금 순서」가 켜지고, 아래에 「잠시 후 ○○」가 뜹니다. 행사 중간중간 어디까지 왔는지 보여 줄 때.',
      fields: [
        { k: 'items', label: '순서(한 줄에 하나, 8개까지)', type: 'lines', def: '개회\n국민의례\n성과 보고\n시상\n단체 사진\n폐회', max: 8 },
        { k: 'cur', label: '지금 순서 번호', type: 'number', def: 3, min: 1, max: 8 },
        { k: 'lead', label: '아래 글 앞말', def: '잠시 후', max: 10 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy; F.bg(p, t);
        var its = lines(p.items, 8), n = its.length || 1, cur = clamp(Math.round(+p.cur || 1), 1, n), x1 = W * .1, x2 = W * .9, y = H * .4, g = E.io(seg(t, .3, 1.2));
        ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 12 * u; ctx.strokeStyle = hexA(p._tx, .15); ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); ctx.strokeStyle = p._c1; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(lerp(x1, n === 1 ? x1 : lerp(x1, x2, (cur - 1) / (n - 1)), g), y); ctx.stroke(); ctx.restore();
        its.forEach(function (s, i) { var px = n === 1 ? cx : lerp(x1, x2, i / (n - 1)), done = i + 1 < cur, hot = i + 1 === cur, a = seg(t, .2 + i * .1, .3), R = hot ? 30 * u * (1 + .08 * Math.sin(t * 4)) : 18 * u; ctx.save(); ctx.globalAlpha = a; if (hot) F.circle(px, y, R + 14 * u, hexA(p._c2, .3)); F.circle(px, y, R, hot ? p._c2 : done ? p._c1 : hexA(p._tx, .25)); if (done) F.text('✓', px, y + 1 * u, { size: 22 * u, weight: 900, color: '#fff' }); if (hot) F.text(i + 1, px, y + 2 * u, { size: 30 * u, weight: 900, color: '#fff' }); ctx.restore(); F.text(s, px, y + 70 * u, { size: hot ? 40 * u : 32 * u, weight: hot ? 800 : 500, color: p._tx, maxW: (x2 - x1) / n * 1.4, alpha: a * (hot ? 1 : .65) }); });
        var nxt = its[cur - 1] || ''; F.text(p.lead, cx, H * .7, { size: 44 * u, weight: 600, color: p._tx, alpha: seg(t, 1.2, .5) * .8 }); F.text(nxt, cx, H * .7 + 90 * u, { size: 100 * u, weight: 900, color: p._tx, maxW: W * .86, alpha: seg(t, 1.5, .6) });
      }
    },
    /* OX 퀴즈 카운트다운 */
    {
      id: 'oxquiz', group: '진행', icon: '⭕', name: 'OX 퀴즈 — 타이머 → 정답 도장',
      desc: '문제와 O·X가 뜨고 원형 타이머가 줄어든 뒤 정답에 도장이 「쾅」 찍히고 해설이 나옵니다. 전체화면에서는 단계마다 멈춰 스페이스로 넘깁니다. 교육 중간 참여, 안전·보안 교육.',
      fields: [
        { k: 'q', label: '문제', def: '엑셀에서 되돌리기는 Ctrl + Z 이다?', max: 60 },
        { k: 'ans', label: '정답', type: 'select', def: 'O', opts: [['O', 'O (맞다)'], ['X', 'X (틀리다)']] },
        { k: 'sec', label: '생각할 시간(초)', type: 'number', def: 5, min: 3, max: 20 },
        { k: 'expl', label: '해설 한 줄', def: '정답 O · 다시 하기는 Ctrl + Y', max: 60 }
      ],
      segs: function (p) {
        var S = [], sec = clamp(+p.sec || 5, 3, 20);
        function base(ctx, tt, p, F, dim) { var W = F.W, H = F.H, u = F.u, cx = F.cx; F.bg(p, tt); F.para(p.q, cx, H * .22, { size: 70 * u, weight: 800, color: p._tx, maxW: W * .88, maxLines: 2 }); ['O', 'X'].forEach(function (c, i) { var x = cx + (i ? 1 : -1) * W * .2, y = H * .6, R = 170 * u, on = !dim || dim === c, col = c === 'O' ? '#1F9D5C' : '#E63946'; ctx.save(); ctx.globalAlpha = on ? 1 : .25; F.panel(x - R, y - R, R * 2, R * 2, 40 * u, p); ctx.lineWidth = 26 * u; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.beginPath(); if (c === 'O') ctx.arc(x, y, R * .5, 0, Math.PI * 2); else { ctx.moveTo(x - R * .45, y - R * .45); ctx.lineTo(x + R * .45, y + R * .45); ctx.moveTo(x + R * .45, y - R * .45); ctx.lineTo(x - R * .45, y + R * .45); } ctx.stroke(); ctx.restore(); }); }
        S.push({ d: 3, draw: function (ctx, tt, p, F) { base(ctx, tt, p, F); F.text('O일까요, X일까요?', F.cx, F.H * .92, { size: 40 * u(F), weight: 600, color: p._tx, alpha: seg(tt, .5, .5) * .8 }); } });
        S.push({ d: sec, draw: function (ctx, tt, p, F) { base(ctx, tt, p, F); var W = F.W, H = F.H, u = F.u, left = Math.ceil(sec - tt), R = 70 * u, x = F.cx, y = H * .6; ctx.save(); ctx.lineWidth = 12 * u; ctx.strokeStyle = hexA(p._tx, .15); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = left <= 3 ? '#E63946' : p._c1; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - tt / sec)); ctx.stroke(); ctx.restore(); F.text(Math.max(0, left), x, y + 4 * u, { size: 80 * u, weight: 900, color: p._tx }); } });
        S.push({ d: 4, draw: function (ctx, tt, p, F) { base(ctx, tt, p, F, p.ans); var W = F.W, H = F.H, u = F.u, x = F.cx + (p.ans === 'X' ? 1 : -1) * W * .2, y = H * .6, g = E.back(seg(tt, .1, .35)); if (g > 0) { ctx.save(); ctx.translate(x, y - 120 * u); ctx.rotate(-.18); ctx.scale(Math.max(.01, lerp(2, 1, clamp(g, 0, 1.2))), Math.max(.01, lerp(2, 1, clamp(g, 0, 1.2)))); ctx.strokeStyle = '#E63946'; ctx.lineWidth = 10 * u; F.rr(-170 * u, -60 * u, 340 * u, 120 * u, 18 * u); ctx.stroke(); F.text('정답!', 0, 4 * u, { size: 80 * u, weight: 900, color: '#E63946' }); ctx.restore(); } F.text(p.expl, F.cx, H * .92, { size: 40 * u, weight: 600, color: p._tx, maxW: W * .9, alpha: seg(tt, 1, .6) }); } });
        return S;
        function u(F) { return F.u; }
      },
      dur: function (p) { return stepsDur(this.segs(p)); }, marks: function (p) { return stepsMarks(this.segs(p)); },
      draw: function (ctx, t, p, F) { drawSteps(this.segs(p), ctx, t, p, F); }
    },
    /* 용어 팝업 카드 */
    {
      id: 'term', group: '진행', icon: '💡', name: '용어 카드 — 「이건 이런 뜻」', dur: 6,
      desc: '어려운 말이 나올 때 카드가 톡 튀어나와 쉬운 뜻을 보여 줍니다. 업무 용어 교육, 신입 안내.',
      fields: [
        { k: 'label', label: '꼬리표', def: '오늘의 용어', max: 12 },
        { k: 'term', label: '용어', def: '크로스체크', max: 20 },
        { k: 'en', label: '원어·풀어 쓴 이름(선택)', def: 'Cross-check', max: 40 },
        { k: 'mean', label: '쉬운 뜻', type: 'lines', def: '한 사람이 한 일을 다른 사람이 한 번 더 살펴,\n숫자와 글자가 맞는지 확인하는 일', max: 3 },
        { k: 'ex', label: '예시·한마디(선택)', def: '예) 견적서는 보내기 전에 꼭 크로스체크', max: 60 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy; F.bg(p, t);
        var g = E.back(seg(t, .1, .6)); if (g <= 0) return; var bw = Math.min(W * .8, 1300 * u), bh = H * .66;
        ctx.save(); ctx.translate(cx, cy + 20 * u); var s = Math.max(.01, g); ctx.scale(s, s); ctx.translate(-cx, -(cy + 20 * u));
        F.panel(cx - bw / 2, cy + 20 * u - bh / 2, bw, bh, 30 * u, p);
        ctx.fillStyle = p._c2; F.rr(cx - bw / 2 + 40 * u, cy + 20 * u - bh / 2 - 26 * u, 260 * u, 52 * u, 26 * u); ctx.fill(); F.text(p.label, cx - bw / 2 + 170 * u, cy + 20 * u - bh / 2, { size: 28 * u, weight: 800, color: '#fff', maxW: 230 * u });
        ctx.restore();
        var top = cy + 20 * u - bh / 2;
        F.text(p.term, cx, top + bh * .22, { size: 110 * u, weight: 900, color: p._c1, maxW: bw * .9, alpha: seg(t, .5, .4) });
        F.text(p.en, cx, top + bh * .36, { size: 36 * u, weight: 500, color: p._tx, maxW: bw * .9, alpha: seg(t, .8, .4) * .75 });
        ctx.save(); ctx.globalAlpha = seg(t, 1, .4); ctx.fillStyle = hexA(p._tx, .15); ctx.fillRect(cx - bw * .3, top + bh * .44, bw * .6, 3 * u); ctx.restore();
        F.para(lines(p.mean, 3).join('\n'), cx, top + bh * .62, { size: 46 * u, weight: 600, color: p._tx, maxW: bw * .86, maxLines: 3, lh: 1.5, alpha: seg(t, 1.2, .6) });
        F.text(p.ex, cx, top + bh * .9, { size: 34 * u, weight: 500, color: p._tx, maxW: bw * .86, alpha: seg(t, 2.2, .6) * .8 });
      }
    }
  ]);
})();
