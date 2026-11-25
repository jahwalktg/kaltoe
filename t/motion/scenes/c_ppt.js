/* 즉석 모션그래픽 — 장면: PPT 꾸밈 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA, fmtNum = MG.fmtNum, withComma = MG.withComma;
  MG.add([
    /* 7. 숫자 올라가기 */
    {
      id: 'nums', group: 'PPT 꾸밈', icon: '📈', name: '숫자 올라가기 — 성과 수치', dur: 6,
      desc: '수치가 0에서 목표까지 올라갑니다(최대 3개). 직원 수, 매출, 교육 시간 같은 성과 보고.',
      fields: [
        { k: 'title', label: '제목(선택)', def: '2026년 우리 회사 한 해', max: 30 },
        { k: 'items', label: '항목(한 줄에 「이름 | 숫자 | 단위」, 3개까지)', type: 'lines', def: '직원 | 126 | 명\n연간 매출 | 3,680 | 만 원\n교육 시간 | 1,240 | 시간', max: 3 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy;
        F.bg(p, t, p._c1);
        var items = lines(p.items, 3).map(function (l) { var a = l.split('|').map(function (x) { return x.trim(); }); return { label: a[0] || '', num: fmtNum(a[1] || '0'), unit: a[2] || '' }; });
        var tall = H > W * 1.1, n = items.length || 1;
        F.text(p.title, cx, H * (tall ? .14 : .17), { size: 72 * u, weight: 800, color: p._tx, maxW: W * .86, alpha: seg(t, 0, .6) });
        items.forEach(function (it, i) {
          var g = E.out(seg(t, .6 + i * .35, 2.2)), ga = seg(t, .6 + i * .35, .5);
          var x, y, boxW;
          if (tall) { x = cx; y = H * .3 + i * (H * .62 / n) + (H * .62 / n) / 2; boxW = W * .82; }
          else { boxW = Math.min(W * .9 / n - 30 * u, 560 * u); x = cx + (i - (n - 1) / 2) * (boxW + 40 * u); y = cy + 60 * u; }
          ctx.save(); ctx.globalAlpha = ga; F.panel(x - boxW / 2, y - 170 * u, boxW, 340 * u, 26 * u, p);
          ctx.fillStyle = p._c2; F.rr(x - 40 * u, y - 170 * u, 80 * u, 8 * u, 4 * u); ctx.fill(); ctx.restore();
          F.text(it.label, x, y - 95 * u, { size: 44 * u, weight: 600, color: p._tx, maxW: boxW - 60 * u, alpha: ga });
          var v = it.num ? withComma(it.num.v * g, it.num.dec) : '';
          ctx.font = F.font(900, 120 * u); var nw = ctx.measureText((it.num ? it.num.pre : '') + v).width; ctx.font = F.font(600, 44 * u); var uw = ctx.measureText(it.unit).width;
          var sc = Math.min(1, (boxW - 60 * u) / (nw + uw + 16 * u)), left = x - (nw + uw + 16 * u) * sc / 2;
          F.text((it.num ? it.num.pre : '') + v, left, y + 20 * u, { size: 120 * u * sc, weight: 900, color: p._c1, align: 'left', alpha: ga });
          F.text(it.unit, left + (nw + 16 * u) * sc, y + 40 * u, { size: 44 * u * sc, weight: 600, color: p._tx, align: 'left', alpha: ga });
        });
      }
    },,
    /* 8. 비교 막대 */
    {
      id: 'bars', group: 'PPT 꾸밈', icon: '📊', name: '비교 막대 — 전후·항목 비교', dur: 6,
      desc: '막대가 자라며 값이 표시됩니다(최대 5개). 작년과 올해, 부서별 비교.',
      fields: [
        { k: 'title', label: '제목', def: '직원 수 변화', max: 30 },
        { k: 'items', label: '항목(한 줄에 「이름 | 값」, 5개까지)', type: 'lines', def: '2024년 | 98\n2025년 | 112\n2026년 | 126', max: 5 },
        { k: 'unit', label: '단위(선택)', def: '명', max: 8 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx;
        F.bg(p, t, p._c2);
        var items = lines(p.items, 5).map(function (l) { var a = l.split('|').map(function (x) { return x.trim(); }); return { label: a[0] || '', num: fmtNum(a[1] || '0') || { v: 0, dec: 0, pre: '', suf: '' } }; });
        var n = items.length || 1, mx = Math.max.apply(null, items.map(function (i) { return Math.abs(i.num.v); }).concat([1]));
        var tall = H > W * 1.1;
        F.text(p.title, cx, H * (tall ? .12 : .14), { size: 76 * u, weight: 800, color: p._tx, maxW: W * .86, alpha: seg(t, 0, .6) });
        var areaTop = H * (tall ? .24 : .3), areaH = H * (tall ? .58 : .5), base = areaTop + areaH, areaW = W * .8, x0 = cx - areaW / 2;
        var slot = areaW / n, bw = Math.min(slot * .6, 260 * u);
        ctx.fillStyle = hexA(p._tx, .25); ctx.fillRect(x0, base, areaW, 3 * u);
        items.forEach(function (it, i) {
          var g = E.out(seg(t, .6 + i * .3, 1.6)), x = x0 + slot * i + slot / 2, h = areaH * .9 * (Math.abs(it.num.v) / mx) * g;
          var last = i === n - 1; ctx.fillStyle = last ? p._c1 : hexA(p._c1, .55); F.rr(x - bw / 2, base - h, bw, h, 14 * u); ctx.fill();
          F.text(it.num.pre + withComma(it.num.v * g, it.num.dec) + (p.unit || it.num.suf), x, base - h - 44 * u, { size: Math.min(52 * u, slot * .3), weight: 800, color: p._tx, maxW: slot * .95, alpha: seg(t, .6 + i * .3, .4) });
          F.text(it.label, x, base + 50 * u, { size: Math.min(40 * u, slot * .25), weight: 600, color: p._tx, maxW: slot * .95, alpha: seg(t, .3 + i * .3, .4) });
        });
      }
    },,
    /* 11. 사진 켄 번스 */
    {
      id: 'photo', group: 'PPT 꾸밈', icon: '🖼️', name: '사진 켄 번스 — 천천히 움직이는 사진', dur: 8,
      desc: '사진 한 장이 천천히 확대되며 한쪽으로 흐르고 자막이 뜹니다. 소식지 사진, 현장 사진 소개.',
      fields: [
        { k: 'img', label: '사진', type: 'image' },
        { k: 'cap', label: '자막(선택)', def: '2026년 가을 야유회', max: 40 },
        { k: 'dir', label: '움직임', type: 'select', def: 'in', opts: [['in', '가운데로 다가가기'], ['out', '멀어지기'], ['lr', '왼쪽에서 오른쪽으로'], ['rl', '오른쪽에서 왼쪽으로']] }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, g = seg(t, 0, 8);
        ctx.fillStyle = p._trans ? 'rgba(0,0,0,0)' : '#111'; ctx.fillRect(0, 0, W, H);
        var img = p.img;
        if (img) {
          var z, px = .5, py = .5;
          if (p.dir === 'out') z = lerp(1.18, 1.0, g); else z = lerp(1.0, 1.18, g);
          if (p.dir === 'lr') { z = 1.15; px = lerp(.15, .85, g); } if (p.dir === 'rl') { z = 1.15; px = lerp(.85, .15, g); }
          F.imgCover(img, 0, 0, W, H, z, px, py);
        } else {
          ctx.fillStyle = hexA(p._c1, .5); ctx.fillRect(0, 0, W, H);
          F.text('사진을 넣어 주세요 (왼쪽 「사진」 칸)', cx, F.cy, { size: 54 * u, weight: 600, color: '#fff', maxW: W * .8 });
        }
        if (p.cap) {
          var a = seg(t, 1.2, .8) * (1 - seg(t, 7.3, .6));
          ctx.save(); ctx.globalAlpha = a; var gr = ctx.createLinearGradient(0, H * .7, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.7)'); ctx.fillStyle = gr; ctx.fillRect(0, H * .7, W, H * .3); ctx.restore();
          F.text(p.cap, cx, H - 110 * u, { size: 54 * u, weight: 700, color: '#fff', maxW: W * .85, alpha: a, shadow: true });
        }
      }
    },
  ]);
})();
