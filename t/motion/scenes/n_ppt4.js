/* 즉석 모션그래픽 — 장면: 4차 PPT 꾸밈 — 사람 아이콘 통계·목표 온도계·투표 결과·핵심 3칸·배지 벽·판단 나무·신청 절차·화면 스포트라이트·펜 판서 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA, fmtNum = MG.fmtNum, withComma = MG.withComma;
  function emoji(ctx, s, x, y, size) { ctx.font = size + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
  function splitBar(l) { return l.split('|').map(function (x) { return x.trim(); }); }
  function person(ctx, x, y, h, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - h * .32, h * .17, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); var w = h * .5, r = w / 2; ctx.moveTo(x - w / 2, y + h * .5); ctx.lineTo(x - w / 2, y - h * .08 + r); ctx.arc(x - w / 2 + r, y - h * .08 + r, r, Math.PI, 0); ctx.lineTo(x + w / 2, y + h * .5); ctx.closePath(); ctx.fill(); }
  function arrow(ctx, x1, y1, x2, y2, w, color, g) { var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ex = x1 + dx * g, ey = y1 + dy * g, ux = dx / L, uy = dy / L; ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey); ctx.stroke(); if (g > .95) { var h = w * 3.2; ctx.beginPath(); ctx.moveTo(ex + ux * h * .6, ey + uy * h * .6); ctx.lineTo(ex - ux * h * .6 - uy * h * .6, ey - uy * h * .6 + ux * h * .6); ctx.lineTo(ex - ux * h * .6 + uy * h * .6, ey - uy * h * .6 - ux * h * .6); ctx.closePath(); ctx.fill(); } ctx.restore(); }
  var _mask = null;
  function spotMask(W, H, px, py, R) { if (!_mask) _mask = document.createElement('canvas'); var c = _mask; if (c.width !== W || c.height !== H) { c.width = W; c.height = H; } var x = c.getContext('2d'); x.clearRect(0, 0, W, H); x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'destination-out'; var gr = x.createRadialGradient(px, py, R * .85, px, py, R); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.beginPath(); x.arc(px, py, R, 0, Math.PI * 2); x.fill(); x.globalCompositeOperation = 'source-over'; return c; }
  function wobble(ctx, pts, g, u, seed) { var r = rnd(seed || 3), n = Math.max(2, Math.floor(pts.length * clamp(g, 0, 1))); ctx.beginPath(); for (var i = 0; i < n; i++) { var x = pts[i][0] + (r() - .5) * 4 * u, y = pts[i][1] + (r() - .5) * 4 * u; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke(); }

  MG.add([
    /* 사람 아이콘 통계 */
    {
      id: 'people', group: 'PPT 꾸밈', icon: '🧍', name: '사람 아이콘 통계 — 10명 중 7명', dur: 6,
      desc: '사람 모양 아이콘이 줄지어 서고 해당 수만큼 색이 차례로 채워집니다. 「10명 중 7명이 찬성」처럼 비율을 한눈에.',
      fields: [
        { k: 'title', label: '제목', def: '직원 10명 중 7명이 정시에 퇴근합니다', max: 50 },
        { k: 'total', label: '전체(아이콘 수, 5~50)', type: 'number', def: 10, min: 5, max: 50 },
        { k: 'count', label: '해당 수', type: 'number', def: 7, min: 0, max: 50 },
        { k: 'sub', label: '아래 글(선택)', def: '2026년 칼퇴상사 직원 126명 기준', max: 60 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy; F.bg(p, t);
        var total = clamp(Math.round(+p.total || 10), 5, 50), count = clamp(Math.round(+p.count || 0), 0, total), perRow = total <= 10 ? total : total <= 20 ? 10 : total <= 30 ? 10 : Math.ceil(total / 4), rows = Math.ceil(total / perRow);
        F.para(p.title, cx, H * .16, { size: 66 * u, weight: 800, color: p._tx, maxW: W * .9, maxLines: 2, alpha: seg(t, 0, .5) });
        var areaW = W * .84, areaH = H * .5, ih = Math.min(areaH / rows * .8, areaW / perRow * 1.5, 230 * u), gapx = areaW / perRow, y0 = cy + 30 * u - (rows - 1) * (ih * 1.15) / 2;
        for (var i = 0; i < total; i++) { var r = Math.floor(i / perRow), c = i % perRow, x = cx - areaW / 2 + gapx * (c + .5), y = y0 + r * ih * 1.15, on = i < count, g = E.out(seg(t, .6 + i * (2.4 / total), .35)), a0 = seg(t, .3 + i * .03, .3); ctx.save(); ctx.globalAlpha = a0; person(ctx, x, y, ih, hexA(p._tx, .18)); if (on && g > 0) { ctx.save(); ctx.translate(x, y); ctx.scale(1 + (1 - g) * .3, 1 + (1 - g) * .3); ctx.globalAlpha = g; person(ctx, 0, 0, ih, p._c1); ctx.restore(); } ctx.restore(); }
        var pct = Math.round(count / total * 100 * E.out(seg(t, .6, 2.4)));
        F.text(count + ' / ' + total + '  ·  ' + pct + '%', cx, H * .84, { size: 54 * u, weight: 900, color: p._c1, alpha: seg(t, .6, .4) });
        F.text(p.sub, cx, H * .93, { size: 34 * u, weight: 500, color: p._tx, maxW: W * .9, alpha: seg(t, 3, .6) * .8 });
      }
    },
    /* 목표 달성 온도계 */
    {
      id: 'thermo', group: 'PPT 꾸밈', icon: '🌡️', name: '목표 달성 온도계', dur: 6,
      desc: '온도계가 목표 대비 달성만큼 차오르고 숫자가 올라갑니다. 모금, 매출, 참가자 모집, 연간 목표 현황.',
      fields: [
        { k: 'title', label: '제목', def: '2026년 목표 달성 현황', max: 30 },
        { k: 'goal', label: '목표(숫자)', def: '10,000,000', max: 16 },
        { k: 'cur', label: '지금까지(숫자)', def: '7,350,000', max: 16 },
        { k: 'unit', label: '단위', def: '원', max: 8 },
        { k: 'sub', label: '아래 글(선택)', def: '11월 15일 기준', max: 50 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy; F.bg(p, t);
        var G = fmtNum(p.goal) || { v: 100, dec: 0 }, C = fmtNum(p.cur) || { v: 0, dec: 0 }, pct = G.v > 0 ? C.v / G.v : 0, g = E.out(seg(t, .5, 2.6)), fill = Math.min(1, pct) * g;
        F.text(p.title, cx, H * .11, { size: 64 * u, weight: 800, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) });
        var tx = W * .3, top = H * .22, bot = H * .78, tw = 90 * u, bulbR = 95 * u;
        ctx.save(); ctx.lineWidth = 8 * u; ctx.strokeStyle = hexA(p._tx, .35); ctx.fillStyle = F.card(p); F.rr(tx - tw / 2, top, tw, bot - top, tw / 2); ctx.fill(); ctx.stroke(); F.circle(tx, bot + bulbR * .4, bulbR, F.card(p)); ctx.beginPath(); ctx.arc(tx, bot + bulbR * .4, bulbR, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        var innerTop = top + 20 * u, innerBot = bot - 10 * u, lvl = lerp(innerBot, innerTop, fill);
        ctx.save(); ctx.beginPath(); F.rr(tx - tw / 2 + 14 * u, innerTop, tw - 28 * u, innerBot - innerTop, (tw - 28 * u) / 2); ctx.clip(); var grd = ctx.createLinearGradient(0, innerBot, 0, innerTop); grd.addColorStop(0, p._c2); grd.addColorStop(1, p._c1); ctx.fillStyle = grd; ctx.fillRect(tx - tw / 2, lvl, tw, innerBot - lvl + 40 * u); ctx.restore(); F.circle(tx, bot + bulbR * .4, bulbR - 14 * u, p._c2);
        for (var k = 0; k <= 10; k++) { var yy = lerp(innerBot, innerTop, k / 10); ctx.fillStyle = hexA(p._tx, .5); ctx.fillRect(tx + tw / 2 + 8 * u, yy - 1.5 * u, (k % 5 === 0 ? 30 : 16) * u, 3 * u); if (k % 5 === 0) F.text(k * 10 + '%', tx + tw / 2 + 50 * u, yy, { size: 24 * u, weight: 600, color: p._tx, align: 'left', alpha: .7 }); }
        var cv = withComma(C.v * g, C.dec), rx = W * .66;
        F.text(Math.round(pct * 100 * g) + '%', rx, H * .38, { size: 190 * u, weight: 900, color: p._c1, maxW: W * .5 });
        F.text(cv + ' ' + p.unit, rx, H * .56, { size: 60 * u, weight: 800, color: p._tx, maxW: W * .5 });
        F.text('목표 ' + withComma(G.v, G.dec) + ' ' + p.unit, rx, H * .65, { size: 38 * u, weight: 500, color: p._tx, maxW: W * .5, alpha: .75 });
        if (pct >= 1 && g > .99) F.text('🎉 목표 달성!', rx, H * .76, { size: 54 * u, weight: 900, color: '#F2B705' });
        F.text(p.sub, rx, H * .9, { size: 34 * u, weight: 500, color: p._tx, maxW: W * .5, alpha: seg(t, 3, .6) * .8 });
      }
    },
    /* 투표·설문 결과 */
    {
      id: 'poll', group: 'PPT 꾸밈', icon: '🗳️', name: '투표·설문 결과 그래프', dur: 6,
      desc: '보기별 가로 막대가 동시에 자라고 1등에 왕관이 붙습니다. 만족도 결과 발표, 현장 투표 결과.',
      fields: [
        { k: 'title', label: '질문·제목', def: '다음 워크숍은 어디로 갈까요?', max: 50 },
        { k: 'items', label: '보기(한 줄에 「보기 | 표수」, 6개까지)', type: 'lines', def: '바다 | 42\n산 | 27\n도심 전시 | 18\n온천 | 33', max: 6 },
        { k: 'unit', label: '단위', def: '표', max: 6 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx; F.bg(p, t);
        var its = lines(p.items, 6).map(function (l) { var a = splitBar(l); return { l: a[0] || '', v: parseFloat((a[1] || '0').replace(/[^\d.]/g, '')) || 0 }; }), n = its.length || 1, sum = its.reduce(function (s, x) { return s + x.v; }, 0) || 1, max = Math.max.apply(null, its.map(function (x) { return x.v; }).concat([1])), g = E.out(seg(t, .6, 2.2));
        F.para(p.title, cx, H * .13, { size: 62 * u, weight: 800, color: p._tx, maxW: W * .9, maxLines: 2, alpha: seg(t, 0, .5) });
        var top = H * .26, rh = Math.min(120 * u, H * .68 / n), lx = W * .08, bx = W * .3, bw = W * .56;
        its.forEach(function (it, i) { var y = top + rh * i + rh / 2, win = it.v === max && g > .98, w = bw * (it.v / max) * g, a = seg(t, .3 + i * .1, .4); F.text(it.l, lx, y, { size: Math.min(44 * u, rh * .42), weight: 700, color: p._tx, align: 'left', maxW: bx - lx - 20 * u, alpha: a }); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = hexA(p._tx, .1); F.rr(bx, y - rh * .3, bw, rh * .6, rh * .3); ctx.fill(); ctx.fillStyle = win ? p._c2 : p._c1; F.rr(bx, y - rh * .3, Math.max(rh * .6, w), rh * .6, rh * .3); ctx.fill(); ctx.restore(); F.text(Math.round(it.v * g) + p.unit + ' · ' + Math.round(it.v / sum * 100 * g) + '%', bx + Math.max(rh * .6, w) + 16 * u, y, { size: Math.min(36 * u, rh * .36), weight: 800, color: p._tx, align: 'left', alpha: a }); if (win) { ctx.save(); ctx.translate(bx + w - rh * .1, y - rh * .55); ctx.rotate(-.2 + Math.sin(t * 3) * .1); emoji(ctx, '👑', 0, 0, rh * .6); ctx.restore(); } });
      }
    },
    /* 핵심 3칸 요약 */
    {
      id: 'three', group: 'PPT 꾸밈', icon: '3️⃣', name: '핵심 3칸 요약', dur: 6,
      desc: '「오늘의 핵심 3가지」 칸이 하나씩 나타납니다(2~4칸). 교육 마무리, 보고 요약, 당부 세 가지.',
      fields: [
        { k: 'title', label: '제목', def: '오늘 기억할 세 가지', max: 30 },
        { k: 'items', label: '칸(한 줄에 「제목 | 설명」, 2~4개)', type: 'lines', def: '기록 | 회의는 당일에 적기\n확인 | 급여 전 근태 한 번 더\n연락 | 변동은 그날 담당자에게', max: 4 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, tall = H > W * 1.1; F.bg(p, t);
        var its = lines(p.items, 4).map(splitBar), n = its.length || 1;
        F.text(p.title, cx, H * .14, { size: 68 * u, weight: 800, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) });
        var gap = 36 * u, cw = tall ? W * .84 : Math.min(520 * u, (W * .9 - gap * (n - 1)) / n), ch = tall ? Math.min(260 * u, (H * .7 - gap * (n - 1)) / n) : H * .56, x0 = tall ? cx - cw / 2 : cx - (cw * n + gap * (n - 1)) / 2, y0 = tall ? H * .22 : H * .28;
        its.forEach(function (it, i) { var x = tall ? x0 : x0 + i * (cw + gap), y = tall ? y0 + i * (ch + gap) : y0, g = E.back(seg(t, .5 + i * .6, .5)); if (g <= 0) return; ctx.save(); ctx.translate(x + cw / 2, y + ch / 2); var s = Math.max(.01, g); ctx.scale(s, s); ctx.translate(-(x + cw / 2), -(y + ch / 2)); F.panel(x, y, cw, ch, 28 * u, p); F.circle(x + cw / 2, y + (tall ? ch * .5 : 90 * u), 46 * u, p._c1); F.text(i + 1, x + cw / 2, y + (tall ? ch * .5 : 90 * u) + 3 * u, { size: 50 * u, weight: 900, color: '#fff' }); if (tall) { F.text(it[0] || '', x + 130 * u, y + ch * .36, { size: 50 * u, weight: 900, color: p._tx, align: 'left', maxW: cw - 160 * u }); F.text(it[1] || '', x + 130 * u, y + ch * .66, { size: 34 * u, weight: 500, color: p._tx, align: 'left', maxW: cw - 160 * u, alpha: .85 }); } else { F.text(it[0] || '', x + cw / 2, y + 200 * u, { size: 58 * u, weight: 900, color: p._tx, maxW: cw - 50 * u }); F.para(it[1] || '', x + cw / 2, y + ch * .66, { size: 36 * u, weight: 500, color: p._tx, maxW: cw - 60 * u, maxLines: 4, lh: 1.45, alpha: .85 }); } ctx.restore(); });
      }
    },
    /* 인증·수상 배지 벽 */
    {
      id: 'badges', group: 'PPT 꾸밈', icon: '🏅', name: '인증·수상 배지 벽',
      desc: '수상·인증·선정 마크가 벽에 하나씩 「탁」 붙습니다(8개까지, 「글 | 연도」). 회사·부서 소개, 연혁 자랑.',
      fields: [
        { k: 'title', label: '제목', def: '우리 회사가 받은 것들', max: 30 },
        { k: 'items', label: '배지(한 줄에 「글 | 연도·준 곳(선택)」, 8개까지)', type: 'lines', def: '우수 기업 상 | 2024\n가족친화 인증 | 2023\n고용 우수 | 2025\n안전보건 인증 | 2026\n정시 퇴근 상 | 2022', max: 8 }
      ],
      dur: function (p) { return 1 + lines(p.items, 8).length * .55 + 2.5; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx; F.bg(p, t);
        var its = lines(p.items, 8).map(splitBar), n = its.length || 1, cols = n <= 3 ? n : n <= 6 ? 3 : 4, rows = Math.ceil(n / cols);
        F.text(p.title, cx, H * .12, { size: 66 * u, weight: 800, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) });
        var R = Math.min(150 * u, W * .84 / cols * .32, H * .72 / rows * .3), cols2 = [p._c1, p._c2, '#B07200', '#1F9D5C', '#8A6BE0'];
        its.forEach(function (it, i) { var r = Math.floor(i / cols), c = i % cols, inRow = Math.min(cols, n - r * cols), x = cx + (c - (inRow - 1) / 2) * (W * .84 / cols), y = H * .24 + r * (H * .72 / rows) + R * 1.1, g = E.back(seg(t, .6 + i * .55, .45)), col = cols2[i % cols2.length]; if (g <= 0) return; ctx.save(); ctx.translate(x, y); var s = Math.max(.01, lerp(1.8, 1, clamp(g, 0, 1.3))); ctx.scale(s, s); ctx.globalAlpha = clamp(g * 2, 0, 1);
          ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-R * .45, R * .55); ctx.lineTo(-R * .3, R * 1.35); ctx.lineTo(0, R * 1.1); ctx.lineTo(R * .3, R * 1.35); ctx.lineTo(R * .45, R * .55); ctx.closePath(); ctx.fill();
          ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = R * .16; ctx.setLineDash([R * .16, R * .1]); ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); F.circle(0, 0, R * .88, col); F.circle(0, 0, R * .74, '#fff'); ctx.strokeStyle = col; ctx.lineWidth = R * .04; ctx.beginPath(); ctx.arc(0, 0, R * .66, 0, Math.PI * 2); ctx.stroke();
          F.para(it[0] || '', 0, -R * .02, { size: R * .3, weight: 900, color: col, maxW: R * 1.2, maxLines: 2, lh: 1.15 }); F.text(it[1] || '', 0, R * .4, { size: R * .17, weight: 600, color: '#5B6885', maxW: R * 1.2 });
          ctx.restore(); });
      }
    },
    /* 예/아니오 판단 나무 */
    {
      id: 'tree', group: 'PPT 꾸밈', icon: '🌳', name: '예 / 아니오 판단 나무', dur: 7,
      desc: '질문 상자에서 「예」「아니오」 가지가 뻗어 각 결과 상자로 이어집니다. 절차 안내, 「이럴 땐 이렇게」 교육.',
      fields: [
        { k: 'q', label: '질문', def: '오늘 안에 끝내야 하는 일인가요?', max: 50 },
        { k: 'yes', label: '「예」일 때', def: '지금 바로 시작, 다른 일은 잠시 미루기', max: 60 },
        { k: 'no', label: '「아니오」일 때', def: '메모에 적고 내일 아침 첫 일로', max: 60 },
        { k: 'yl', label: '예 글자', def: '예', max: 8 }, { k: 'nl', label: '아니오 글자', def: '아니오', max: 8 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx; F.bg(p, t);
        var qw = Math.min(W * .62, 1000 * u), qh = 170 * u, qy = H * .12, g0 = E.back(seg(t, .2, .5));
        if (g0 > 0) { ctx.save(); ctx.translate(cx, qy + qh / 2); var s = Math.max(.01, g0); ctx.scale(s, s); F.panel(-qw / 2, -qh / 2, qw, qh, 26 * u, p, { hot: true }); F.para(p.q, 0, 0, { size: 50 * u, weight: 800, color: '#fff', maxW: qw - 60 * u, maxLines: 2 }); ctx.restore(); }
        var ly = H * .62, lw = Math.min(W * .4, 760 * u), lh = H * .3, xs = [W * .27, W * .73], labels = [p.yl || '예', p.nl || '아니오'], cols = ['#1F9D5C', '#E63946'], txts = [p.yes, p.no];
        [0, 1].forEach(function (i) { var ag = E.io(seg(t, .9 + i * .9, .6)); arrow(ctx, cx + (i ? 1 : -1) * 60 * u, qy + qh, xs[i], ly - 20 * u, 10 * u, cols[i], ag); if (ag > .5) { var mx = lerp(cx + (i ? 1 : -1) * 60 * u, xs[i], .5), my = lerp(qy + qh, ly - 20 * u, .5); ctx.save(); ctx.globalAlpha = seg(ag, .5, .5); ctx.fillStyle = cols[i]; F.rr(mx - 70 * u, my - 32 * u, 140 * u, 64 * u, 32 * u); ctx.fill(); ctx.restore(); F.text(labels[i], mx, my + 2 * u, { size: 34 * u, weight: 900, color: '#fff', alpha: seg(ag, .5, .5) }); } var bg = E.back(seg(t, 1.6 + i * .9, .5)); if (bg > 0) { ctx.save(); ctx.translate(xs[i], ly + lh / 2); var s2 = Math.max(.01, bg); ctx.scale(s2, s2); F.panel(-lw / 2, -lh / 2, lw, lh, 26 * u, p); ctx.fillStyle = cols[i]; F.rr(-lw / 2, -lh / 2, lw, 14 * u, 7 * u); ctx.fill(); F.para(txts[i], 0, 10 * u, { size: 42 * u, weight: 700, color: p._tx, maxW: lw - 60 * u, maxLines: 4, lh: 1.4 }); ctx.restore(); } });
      }
    },
    /* 신청 절차 흐름도 */
    {
      id: 'apply', group: 'PPT 꾸밈', icon: '📝', name: '신청 절차 — 단계·할 일·어디서',
      desc: '단계 번호 원이 차례로 켜지고, 아래에 「신청자가 할 일」과 「어디서」가 붙습니다(5단계까지). 참여 신청·서비스 이용 안내.',
      fields: [
        { k: 'title', label: '제목', def: '연차 신청, 이렇게 합니다', max: 40 },
        { k: 'steps', label: '단계(한 줄에 「단계 | 할 일 | 어디서」, 5개까지)', type: 'lines', def: '날짜 정하기 | 팀 일정 보고 고르기 | 달력\n알리기 | 팀장께 미리 말하기 | 메신저\n신청 | 휴가 신청서 올리기 | 결재 시스템\n넘기기 | 급한 일 동료에게 | 업무 정리판\n쉬기 | 알림 끄기 | 집', max: 5 }
      ],
      dur: function (p) { return 1 + lines(p.steps, 5).length * .9 + 2; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, tall = H > W * 1.1; F.bg(p, t);
        var its = lines(p.steps, 5).map(splitBar), n = its.length || 1;
        F.text(p.title, cx, H * .11, { size: 62 * u, weight: 800, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) });
        if (tall) { var rh = Math.min(260 * u, H * .78 / n); its.forEach(function (it, i) { var y = H * .18 + rh * i, g = E.back(seg(t, .6 + i * .9, .5)); if (g <= 0) return; ctx.save(); ctx.globalAlpha = clamp(g, 0, 1); F.panel(W * .06, y + 10 * u, W * .88, rh - 20 * u, 20 * u, p); F.circle(W * .17, y + rh / 2, 44 * u, p._c1); F.text(i + 1, W * .17, y + rh / 2 + 3 * u, { size: 44 * u, weight: 900, color: '#fff' }); F.text(it[0] || '', W * .28, y + rh * .32, { size: 42 * u, weight: 900, color: p._tx, align: 'left', maxW: W * .6 }); F.text('할 일: ' + (it[1] || ''), W * .28, y + rh * .58, { size: 30 * u, weight: 600, color: p._tx, align: 'left', maxW: W * .62, alpha: .9 }); F.text('어디서: ' + (it[2] || ''), W * .28, y + rh * .8, { size: 28 * u, weight: 500, color: p._c1, align: 'left', maxW: W * .62 }); ctx.restore(); }); return; }
        var x1 = W * .1, x2 = W * .9, ly = H * .32, pg = E.io(seg(t, .4, n * .9));
        ctx.save(); ctx.lineWidth = 10 * u; ctx.lineCap = 'round'; ctx.strokeStyle = hexA(p._tx, .15); ctx.beginPath(); ctx.moveTo(x1, ly); ctx.lineTo(x2, ly); ctx.stroke(); ctx.strokeStyle = p._c1; ctx.beginPath(); ctx.moveTo(x1, ly); ctx.lineTo(lerp(x1, x2, pg), ly); ctx.stroke(); ctx.restore();
        var slot = (x2 - x1) / Math.max(1, n - 1), cw = Math.min(slot * .92, 380 * u);
        its.forEach(function (it, i) { var x = n === 1 ? cx : lerp(x1, x2, i / (n - 1)), g = E.back(seg(t, .6 + i * .9, .5)); if (g <= 0) return; ctx.save(); ctx.translate(x, ly); var s = Math.max(.01, g); ctx.scale(s, s); F.circle(0, 0, 52 * u, p._c1); F.text(i + 1, 0, 4 * u, { size: 50 * u, weight: 900, color: '#fff' }); ctx.restore(); F.text(it[0] || '', x, ly + 100 * u, { size: 44 * u, weight: 900, color: p._tx, maxW: cw, alpha: clamp(g, 0, 1) }); var a = seg(t, .9 + i * .9, .5); ctx.save(); ctx.globalAlpha = a; F.panel(x - cw / 2, ly + 150 * u, cw, 250 * u, 20 * u, p); ctx.restore(); F.text('할 일', x - cw / 2 + 24 * u, ly + 190 * u, { size: 26 * u, weight: 800, color: p._c2, align: 'left', alpha: a }); F.para(it[1] || '', x, ly + 250 * u, { size: 32 * u, weight: 600, color: p._tx, maxW: cw - 40 * u, maxLines: 2, alpha: a }); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = hexA(p._c1, .15); F.rr(x - cw / 2 + 20 * u, ly + 330 * u, cw - 40 * u, 50 * u, 12 * u); ctx.fill(); ctx.restore(); F.text('📍 ' + (it[2] || ''), x, ly + 356 * u, { size: 28 * u, weight: 700, color: p._c1, maxW: cw - 60 * u, alpha: a }); });
      }
    },
    /* 화면 줌 + 스포트라이트 */
    {
      id: 'spot', group: 'PPT 꾸밈', icon: '🔦', name: '화면 스포트라이트 — 「여기를 누르세요」', dur: 6,
      desc: '화면 캡처(사진)에서 한 곳만 밝게 남기고 살짝 확대하며 안내 글이 붙습니다. 사용법 영상, 신청 화면 안내. 위치는 가로·세로 %로.',
      fields: [
        { k: 'img', label: '화면 캡처·사진', type: 'image' },
        { k: 'x', label: '가로 위치(%, 왼쪽 0 ~ 오른쪽 100)', type: 'number', def: 70, min: 0, max: 100 },
        { k: 'y', label: '세로 위치(%, 위 0 ~ 아래 100)', type: 'number', def: 40, min: 0, max: 100 },
        { k: 'r', label: '밝은 원 크기(%)', type: 'number', def: 14, min: 4, max: 40 },
        { k: 'zoom', label: '확대 배율', type: 'number', def: 1.4, min: 1, max: 2.5, step: 0.1 },
        { k: 'text', label: '안내 글', def: '여기를 누르세요', max: 30 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, px = clamp(+p.x || 0, 0, 100) / 100 * W, py = clamp(+p.y || 0, 0, 100) / 100 * H, R = clamp(+p.r || 14, 4, 40) / 100 * W, z = lerp(1, clamp(+p.zoom || 1.4, 1, 2.5), E.io(seg(t, .8, 1.4)));
        ctx.save(); ctx.translate(px, py); ctx.scale(z, z); ctx.translate(-px, -py);
        if (p.img && p.img.naturalWidth) F.imgCover(p.img, 0, 0, W, H, 1, .5, .5); else { F.bg(p, t, null, { plain: true }); for (var i = 0; i < 6; i++) { ctx.fillStyle = hexA(p._tx, .08); F.rr(W * .08, H * .12 + i * H * .13, W * (i % 2 ? .55 : .84), H * .08, 10 * u); ctx.fill(); } ctx.fillStyle = hexA(p._c1, .6); F.rr(W * .62, H * .33, W * .16, H * .14, 12 * u); ctx.fill(); F.text('보내기', W * .7, H * .4, { size: 36 * u, weight: 800, color: '#fff' }); F.text('← 화면 캡처를 넣어 주세요', W * .4, H * .85, { size: 36 * u, weight: 600, color: p._tx, alpha: .6 }); }
        var dim = E.out(seg(t, .3, .8));
        // 어둡게 덮되 원 안만 뚫기 — 같은 캔버스에서 뚫으면 사진까지 지워지므로 따로 만든 덮개를 얹음
        var ov = spotMask(W, H, px, py, R); ctx.save(); ctx.globalAlpha = .62 * dim; ctx.drawImage(ov, 0, 0); ctx.restore();
        ctx.save(); ctx.strokeStyle = p._c2; ctx.lineWidth = 6 * u / z; ctx.globalAlpha = dim; ctx.beginPath(); ctx.arc(px, py, R + 6 * u + Math.sin(t * 4) * 4 * u, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        ctx.restore();
        var a = seg(t, 1.6, .5), below = py < H * .55, lx = clamp(px, W * .2, W * .8), ly = below ? py + R * z + 90 * u : py - R * z - 90 * u; ly = clamp(ly, 70 * u, H - 70 * u);
        ctx.save(); ctx.globalAlpha = a; ctx.font = F.font(800, 44 * u); var tw = Math.min(W * .7, ctx.measureText(p.text).width + 80 * u); ctx.fillStyle = p._c2; F.rr(lx - tw / 2, ly - 44 * u, tw, 88 * u, 44 * u); ctx.fill(); ctx.restore(); F.text(p.text, lx, ly + 2 * u, { size: 44 * u, weight: 800, color: '#fff', maxW: W * .66, alpha: a });
        if (a > 0) arrow(ctx, lx, below ? ly - 44 * u : ly + 44 * u, px, below ? py + R * z + 10 * u : py - R * z - 10 * u, 8 * u, p._c2, a);
      }
    },
    /* 펜 판서 */
    {
      id: 'pen', group: 'PPT 꾸밈', icon: '🖊️', name: '펜 판서 — 동그라미·밑줄 그리기', dur: 5,
      desc: '사진·문서 캡처 위에 손으로 그리듯 동그라미·밑줄·네모가 그려지고 메모가 붙습니다. 자료 강조, 서식 작성 안내.',
      fields: [
        { k: 'img', label: '사진·문서 캡처(선택, 없으면 글 배경)', type: 'image' },
        { k: 'shape', label: '모양', type: 'select', def: 'circle', opts: [['circle', '동그라미'], ['under', '밑줄'], ['box', '네모']] },
        { k: 'x', label: '가로 위치(%)', type: 'number', def: 50, min: 0, max: 100 },
        { k: 'y', label: '세로 위치(%)', type: 'number', def: 45, min: 0, max: 100 },
        { k: 'w', label: '너비(%)', type: 'number', def: 36, min: 5, max: 100 },
        { k: 'h', label: '높이(%)', type: 'number', def: 18, min: 3, max: 100 },
        { k: 'color', label: '펜 색', type: 'select', def: 'red', opts: [['red', '빨강'], ['blue', '파랑'], ['yellow', '형광 노랑'], ['c1', '주색']] },
        { k: 'note', label: '메모(선택)', def: '여기에 서명!', max: 30 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, x = clamp(+p.x || 50, 0, 100) / 100 * W, y = clamp(+p.y || 45, 0, 100) / 100 * H, w = clamp(+p.w || 36, 5, 100) / 100 * W, h = clamp(+p.h || 18, 3, 100) / 100 * H;
        if (p.img && p.img.naturalWidth) F.imgCover(p.img, 0, 0, W, H, 1, .5, .5); else { ctx.fillStyle = p._trans ? 'rgba(0,0,0,0)' : '#FFFDF8'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(0,0,0,.08)'; for (var i = 0; i < 9; i++) F.rr(W * .1, H * .14 + i * H * .085, W * (i % 3 === 2 ? .5 : .8), H * .04, 6 * u), ctx.fill(); F.text('문서·사진 캡처를 넣으면 그 위에 그립니다', W / 2, H * .92, { size: 34 * u, weight: 600, color: '#5B6885', alpha: .8 }); }
        var cols = { red: '#E63946', blue: '#1A6EFF', yellow: 'rgba(255,230,0,.55)', c1: p._c1 }, col = cols[p.color] || cols.red, g = E.io(seg(t, .4, 1.4)), pts = [];
        if (p.shape === 'circle') { for (var k = 0; k <= 64; k++) { var a = -Math.PI * .6 + k / 64 * Math.PI * 2.15; pts.push([x + Math.cos(a) * w / 2 * (1 + .02 * Math.sin(k)), y + Math.sin(a) * h / 2]); } }
        else if (p.shape === 'under') { for (var k2 = 0; k2 <= 40; k2++) pts.push([x - w / 2 + k2 / 40 * w, y + h / 2 + Math.sin(k2 * .8) * 3 * u]); }
        else { var c4 = [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2], [x - w / 2, y - h / 2 - 4 * u]]; for (var e = 0; e < 4; e++) for (var k3 = 0; k3 < 12; k3++) pts.push([lerp(c4[e][0], c4[e + 1][0], k3 / 12), lerp(c4[e][1], c4[e + 1][1], k3 / 12)]); pts.push(c4[4]); }
        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = (p.color === 'yellow' ? 34 : 9) * u; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; wobble(ctx, pts, g, u, 9); ctx.restore();
        if (p.note) { var a2 = seg(t, 1.9, .5), nx = clamp(x + w / 2 + 40 * u, 60 * u, W - 60 * u), ny = clamp(y - h / 2 - 60 * u, 60 * u, H - 60 * u); ctx.save(); ctx.globalAlpha = a2; ctx.translate(nx, ny); ctx.rotate(-.06); ctx.fillStyle = p.color === 'yellow' ? '#FFE766' : '#FFF4A3'; ctx.shadowColor = 'rgba(0,0,0,.2)'; ctx.shadowBlur = 16 * u; ctx.font = F.font(700, 40 * u); var tw = Math.min(W * .5, ctx.measureText(p.note).width + 60 * u); F.rr(-tw / 2, -40 * u, tw, 80 * u, 8 * u); ctx.fill(); ctx.restore(); F.text(p.note, nx, ny + 2 * u, { size: 40 * u, weight: 700, color: '#3A2F10', maxW: W * .46, alpha: a2 }); }
      }
    }
  ]);
})();
