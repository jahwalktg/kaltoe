/* 즉석 모션그래픽 — 장면: PPT 꾸밈 (2차) 챕터 전환·형광펜·인용·체크리스트·원형 퍼센트·사진 여러 장 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA, fmtNum = MG.fmtNum;

  MG.add([
    /* 28. 챕터 전환 카드 */
    {
      id: 'chapter', group: 'PPT 꾸밈', icon: '📑', name: '장(챕터) 전환 카드', dur: 4,
      desc: '큰 번호와 제목이 미끄러져 들어와 멈춥니다. 발표를 구역으로 나눌 때 각 장 앞에.',
      fields: [
        { k: 'num', label: '번호', def: '01', max: 4 },
        { k: 'title', label: '장 제목', def: '사업 개요', max: 30 },
        { k: 'sub', label: '작은 글(선택)', def: '추진 배경 · 목표 · 대상', max: 50 },
        { k: 'total', label: '전체 장 수(선택, 「01 / 04」 표시)', def: '04', max: 4 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy; F.bg(p, t);
        var g = E.out(seg(t, 0, .8));
        ctx.save(); ctx.globalAlpha = .12; F.text(p.num, W * .78, cy, { size: 700 * u, weight: 900, color: p._c1, alpha: g * .12 }); ctx.restore();
        ctx.fillStyle = p._c2; ctx.fillRect(W * .12, cy - 150 * u, 10 * u, 300 * u * g);
        var x = W * .12 + 50 * u + (1 - g) * 60 * u;
        F.text(p.num + (p.total ? '  /  ' + p.total : ''), x, cy - 110 * u, { size: 44 * u, weight: 700, color: p._c1, align: 'left', alpha: g });
        F.text(p.title, x, cy, { size: 120 * u, weight: 900, color: p._tx, align: 'left', maxW: W * .7, alpha: seg(t, .2, .6) });
        F.text(p.sub, x, cy + 120 * u, { size: 44 * u, weight: 500, color: p._tx, align: 'left', maxW: W * .7, alpha: seg(t, .6, .6) * .85 });
      }
    },
    /* 30. 형광펜 강조 */
    {
      id: 'marker', group: 'PPT 꾸밈', icon: '🖍️', name: '핵심 문장 형광펜', dur: 5,
      desc: '문장이 뜨고 강조할 부분에 형광펜이 왼쪽에서 오른쪽으로 칠해집니다. 핵심 한 줄 강조.',
      fields: [
        { k: 'text', label: '문장', def: '잘 쉬는 사람이 잘 일합니다', max: 60 },
        { k: 'hi', label: '칠할 부분(문장 안 글자 그대로, 비우면 전체)', def: '사람을 세우는 과정', max: 40 },
        { k: 'color', label: '형광펜 색', type: 'select', def: 'y', opts: [['y', '노랑'], ['g', '연두'], ['p', '분홍'], ['b', '하늘']] },
        { k: 'who', label: '아래 작은 글(선택)', def: '', max: 40 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy; F.bg(p, t);
        var cols = { y: 'rgba(255,230,0,.75)', g: 'rgba(170,255,120,.75)', p: 'rgba(255,150,200,.75)', b: 'rgba(130,210,255,.75)' }, hc = cols[p.color] || cols.y;
        var size = 76 * u; ctx.font = F.font(800, size); var ls = F.wrap(p.text, W * .84, size, 800); while (ls.length > 3 && size > 30 * u) { size -= 4 * u; ls = F.wrap(p.text, W * .84, size, 800); }
        var lh = size * 1.5, y0 = cy - (ls.length - 1) * lh / 2 - (p.who ? 30 * u : 0), hi = (p.hi || '').trim(), prog = E.io(seg(t, .9, 1.2));
        // 칠할 구간 찾기(줄마다)
        var chars = ls.join('\n'), full = ls.join(''), hs = hi ? full.indexOf(hi.replace(/\s+/g, '')) : -1;
        var hiStart, hiEnd; if (hi) { var compact = full.replace(/\s+/g, ''); var cs = compact.indexOf(hi.replace(/\s+/g, '')); if (cs >= 0) { var map = [], k = 0; for (var i = 0; i < full.length; i++) { if (!/\s/.test(full[i])) map[k++] = i; } hiStart = map[cs]; hiEnd = map[cs + hi.replace(/\s+/g, '').length - 1] + 1; } }
        if (!hi || hiStart == null) { hiStart = 0; hiEnd = full.length; }
        var pos = 0, totalW = 0, segsL = [];
        ls.forEach(function (l, li) { ctx.font = F.font(800, size); var lw = ctx.measureText(l).width, x0 = cx - lw / 2, y = y0 + li * lh; var a = Math.max(hiStart, pos), b = Math.min(hiEnd, pos + l.length); if (b > a) { var pre = ctx.measureText(l.slice(0, a - pos)).width, w = ctx.measureText(l.slice(a - pos, b - pos)).width; segsL.push({ x: x0 + pre, y: y, w: w }); totalW += w; } pos += l.length; });
        var left = totalW * prog; ctx.save(); segsL.forEach(function (s) { var w = Math.min(s.w, Math.max(0, left)); left -= s.w; if (w <= 0) return; ctx.fillStyle = hc; ctx.beginPath(); ctx.moveTo(s.x - 6 * u, s.y - size * .5); ctx.lineTo(s.x + w + 4 * u, s.y - size * .55); ctx.lineTo(s.x + w + 8 * u, s.y + size * .5); ctx.lineTo(s.x - 2 * u, s.y + size * .55); ctx.closePath(); ctx.fill(); }); ctx.restore();
        ls.forEach(function (l, li) { F.text(l, cx, y0 + li * lh, { size: size, weight: 800, color: p._tx, alpha: seg(t, 0, .5) }); });
        F.text(p.who, cx, y0 + ls.length * lh + 20 * u, { size: 38 * u, weight: 500, color: p._tx, maxW: W * .8, alpha: seg(t, 2.2, .5) * .8 });
      }
    },
    /* 31. 인용·소감 카드 */
    {
      id: 'quote', group: 'PPT 꾸밈', icon: '💬', name: '인용·소감 카드', dur: 7,
      desc: '큰따옴표와 함께 직원·고객의 말이 뜨고 이름이 따라옵니다. 사업 보고·소식지. 실명 대신 가명·이니셜을 권합니다.',
      fields: [
        { k: 'text', label: '말', type: 'lines', def: '두 시간 걸리던 표가 이제 십 분이면 끝나요.\n저녁을 집에서 먹는 게 제일 좋아요.', max: 4 },
        { k: 'who', label: '누구', def: '— 총무팀 김○○ 님 (입사 8개월)', max: 50 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy; F.bg(p, t, p._c2);
        var g = E.back(seg(t, 0, .7)); ctx.save(); ctx.globalAlpha = .25 * clamp(g, 0, 1); F.text('“', W * .14, H * .28, { size: 400 * u, weight: 900, color: p._c1 }); ctx.restore();
        var card = F.card(p);
        ctx.save(); ctx.globalAlpha = seg(t, .2, .5); ctx.fillStyle = card; F.rr(W * .1, H * .22, W * .8, H * .56, 36 * u); ctx.fill(); ctx.fillStyle = p._c1; F.rr(W * .1, H * .22, 14 * u, H * .56, 7 * u); ctx.fill(); ctx.restore();
        var txt = lines(p.text, 4).join('\n'), n = Math.floor(seg(t, .5, 2.5) * txt.length);
        F.para(txt.slice(0, n), cx + 20 * u, cy, { size: 58 * u, weight: 600, color: p._tx, maxW: W * .66, maxLines: 5, lh: 1.5 });
        F.text(p.who, W * .86, H * .72, { size: 38 * u, weight: 500, color: p._tx, align: 'right', maxW: W * .7, alpha: seg(t, 3.4, .6) * .85 });
      }
    },
    /* 34. 체크리스트 */
    {
      id: 'check', group: 'PPT 꾸밈', icon: '✅', name: '체크리스트 — ✓가 차례로',
      desc: '항목이 보이고 ✓가 하나씩 찍힙니다(8개까지). 준비 사항·점검 결과·완료 보고.',
      fields: [
        { k: 'title', label: '제목', def: '행사 준비 점검', max: 30 },
        { k: 'items', label: '항목(한 줄에 하나, 8개까지, 끝에 「x」를 붙이면 미완료)', type: 'lines', def: '행사장 대관·좌석 배치\n현수막·명패 제작\n참가자 안내 문자 발송\n기념품·다과 준비\n사진 촬영 동의서 x', max: 8 }
      ],
      dur: function (p) { return 1.5 + lines(p.items, 8).length * .7 + 2.5; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, its = lines(p.items, 8).map(function (l) { var no = /\s[xX✕]$/.test(l); return { t: l.replace(/\s[xX✕]$/, ''), no: no }; }); F.bg(p, t);
        F.text(p.title, cx, H * .13, { size: 76 * u, weight: 800, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) });
        var n = its.length || 1, top = H * .24, gap = Math.min((H * .72) / n, 130 * u), boxW = Math.min(W * .8, 1300 * u), x0 = cx - boxW / 2;
        its.forEach(function (it, i) {
          var y = top + gap * i + gap / 2, a = E.out(seg(t, .5 + i * .25, .4)), ck = E.back(seg(t, 1.5 + i * .7, .4));
          ctx.save(); ctx.globalAlpha = a; F.panel(x0, y - gap * .4, boxW, gap * .8, 18 * u, p);
          ctx.lineWidth = 5 * u; ctx.strokeStyle = hexA(p._tx, .5); F.rr(x0 + gap * .2, y - gap * .24, gap * .48, gap * .48, 10 * u); ctx.stroke(); ctx.restore();
          if (ck > 0) { ctx.save(); ctx.translate(x0 + gap * .44, y); ctx.scale(Math.max(.01, ck), Math.max(.01, ck)); if (it.no) { F.text('✕', 0, 0, { size: gap * .42, weight: 900, color: '#E63946' }); } else { ctx.fillStyle = '#1F9D5C'; F.rr(-gap * .24, -gap * .24, gap * .48, gap * .48, 10 * u); ctx.fill(); F.text('✓', 0, 2 * u, { size: gap * .38, weight: 900, color: '#fff' }); } ctx.restore(); }
          F.text(it.t, x0 + gap * .85, y, { size: Math.min(50 * u, gap * .38), weight: 700, color: p._tx, align: 'left', maxW: boxW - gap * 1.1, alpha: a * (ck > 0 && it.no ? .6 : 1) });
        });
      }
    },
    /* 35. 원형 퍼센트 */
    {
      id: 'pct', group: 'PPT 꾸밈', icon: '🎯', name: '원형 퍼센트 — 달성률', dur: 5,
      desc: '고리가 채워지며 퍼센트가 올라갑니다(3개까지). 100%를 넘으면 고리는 꽉 차고 위에 「목표 초과 +N%」 표가 붙습니다. 목표 달성률·만족도·취업률.',
      fields: [
        { k: 'title', label: '제목(선택)', def: '2026년 목표 달성', max: 30 },
        { k: 'items', label: '항목(한 줄에 「이름 | 퍼센트」, 3개까지)', type: 'lines', def: '교육 신청 | 112\n수료 | 86\n교육 만족도 | 94', max: 3 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy; F.bg(p, t);
        var its = lines(p.items, 3).map(function (l) { var a = l.split('|').map(function (x) { return x.trim(); }); return { l: a[0] || '', v: parseFloat((a[1] || '0').replace(/[^\d.\-]/g, '')) || 0 }; }), n = its.length || 1, tall = H > W * 1.1;
        F.text(p.title, cx, H * (tall ? .12 : .15), { size: 72 * u, weight: 800, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) });
        its.forEach(function (it, i) {
          var x, y, R; if (tall) { x = cx; y = H * .3 + i * (H * .62 / n) + (H * .62 / n) / 2; R = Math.min(200 * u, H * .62 / n * .36); } else { var slot = W * .9 / n; x = cx - W * .45 + slot * i + slot / 2; y = cy + 50 * u; R = Math.min(220 * u, slot * .3); }
          var g = E.out(seg(t, .5 + i * .3, 2)), v = Math.min(it.v, 999), fill = Math.min(1, v / 100) * g;
          ctx.save(); ctx.lineWidth = R * .22; ctx.lineCap = 'round'; ctx.strokeStyle = hexA(p._tx, .12); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = i === 0 ? p._c1 : i === 1 ? p._c2 : '#1F9D5C'; ctx.beginPath(); ctx.arc(x, y, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fill); ctx.stroke();
          ctx.restore();
          if (v > 100 && g > .99) { ctx.save(); ctx.globalAlpha = seg(t, 2.6 + i * .3, .4); ctx.fillStyle = '#F2B705'; F.rr(x - 120 * u, y - R - 80 * u, 240 * u, 50 * u, 25 * u); ctx.fill(); ctx.restore(); F.text('목표 초과 +' + Math.round(v - 100) + '%', x, y - R - 55 * u, { size: 28 * u, weight: 800, color: '#1A2B50', maxW: 220 * u, alpha: seg(t, 2.6 + i * .3, .4) }); }
          F.text(Math.round(v * g) + '%', x, y + 4 * u, { size: R * .58, weight: 900, color: p._tx, maxW: R * 1.4 });
          F.text(it.l, x, y + R + 70 * u, { size: Math.min(44 * u, R * .32), weight: 600, color: p._tx, maxW: R * 2.6, alpha: seg(t, .5 + i * .3, .5) });
        });
      }
    },
    /* 40. 사진 여러 장 */
    {
      id: 'slides', group: 'PPT 꾸밈', icon: '🎞️', name: '사진 여러 장 넘김',
      desc: '사진 2~8장이 켄 번스로 움직이며 차례로 넘어갑니다. 자막은 한 줄에 한 장씩. 현장 사진 소개, 사업 돌아보기.',
      fields: [
        { k: 'imgs', label: '사진 여러 장(한 번에 고르기, 8장까지)', type: 'images' },
        { k: 'caps', label: '자막(한 줄에 한 장, 선택)', type: 'lines', def: '', max: 8 },
        { k: 'each', label: '한 장 초', type: 'number', def: 3.5, min: 2, max: 8, step: 0.5 },
        { k: 'title', label: '처음 제목(선택)', def: '', max: 30 }
      ],
      dur: function (p) { var n = (p.imgs && p.imgs.length) || 3; return (p.title ? 1.5 : 0) + n * (+p.each || 3.5); },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, imgs = p.imgs || [], caps = lines(p.caps, 8), e = +p.each || 3.5, t0 = p.title ? 1.5 : 0;
        ctx.fillStyle = p._trans ? 'rgba(0,0,0,0)' : '#111'; ctx.fillRect(0, 0, W, H);
        if (!imgs.length) { ctx.fillStyle = hexA(p._c1, .5); ctx.fillRect(0, 0, W, H); F.text('사진을 여러 장 넣어 주세요 (왼쪽 「사진 여러 장」 칸)', cx, F.cy, { size: 54 * u, weight: 600, color: '#fff', maxW: W * .85 }); return; }
        if (t < t0) { F.bg(p, t); F.text(p.title, cx, F.cy, { size: 100 * u, weight: 900, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) }); return; }
        var tt = t - t0, i = Math.min(imgs.length - 1, Math.floor(tt / e)), f = (tt - i * e) / e, r = rnd(i + 3);
        function kb(img, f, k) { var r2 = rnd(k + 3), dirx = r2() > .5 ? 1 : -1, z = lerp(1.0, 1.14, f); F.imgCover(img, 0, 0, W, H, z, .5 + dirx * (f - .5) * .3, .5); }
        kb(imgs[i], f, i);
        if (i > 0 && f < .2) { ctx.save(); ctx.globalAlpha = 1 - f / .2; kb(imgs[i - 1], 1, i - 1); ctx.restore(); }
        var cap = caps[i]; if (cap) { var gr = ctx.createLinearGradient(0, H * .72, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.7)'); ctx.fillStyle = gr; ctx.fillRect(0, H * .72, W, H * .28); F.text(cap, cx, H - 100 * u, { size: 52 * u, weight: 700, color: '#fff', maxW: W * .85, alpha: seg(f, .1, .2), shadow: true }); }
        ctx.save(); ctx.globalAlpha = .7; for (var k = 0; k < imgs.length; k++) F.circle(cx + (k - (imgs.length - 1) / 2) * 30 * u, H - 36 * u, 7 * u, k === i ? '#fff' : 'rgba(255,255,255,.4)'); ctx.restore();
      }
    }
  ]);
})();
