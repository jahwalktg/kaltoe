/* 즉석 모션그래픽 — 장면: PPT 꾸밈 (3차) 제목 등장·전/후 비교·흐름도·타임라인·조직도 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA;
  function arrow(ctx, x1, y1, x2, y2, w, color, g) { var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ex = x1 + dx * g, ey = y1 + dy * g, ux = dx / L, uy = dy / L; ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey); ctx.stroke(); if (g > .95) { var h = w * 3.2; ctx.beginPath(); ctx.moveTo(ex + ux * h * .6, ey + uy * h * .6); ctx.lineTo(ex - ux * h * .6 - uy * h * .6, ey - uy * h * .6 + ux * h * .6); ctx.lineTo(ex - ux * h * .6 + uy * h * .6, ey - uy * h * .6 - ux * h * .6); ctx.closePath(); ctx.fill(); } ctx.restore(); }
  function splitKV(l) { var a = l.split('|').map(function (x) { return x.trim(); }); return a.length > 1 ? { k: a[0], v: a.slice(1).join(' | ') } : { k: '', v: a[0] }; }

  MG.add([
    /* 29. 제목 등장 */
    {
      id: 'title', group: 'PPT 꾸밈', icon: '🔠', name: '제목 등장 — 한 글자씩·밑줄', dur: 4,
      desc: '제목이 한 글자씩 나타나고(또는 떠오르고) 아래에 밑줄이 그어집니다. 슬라이드 제목 자리에.',
      fields: [
        { k: 'title', label: '제목', def: '2026년 사업 추진 성과', max: 30 },
        { k: 'sub', label: '작은 글(선택)', def: '칼퇴상사', max: 40 },
        { k: 'style', label: '등장 방식', type: 'select', def: 'type', opts: [['type', '한 글자씩'], ['rise', '글자가 떠오름'], ['wipe', '왼쪽에서 드러남']] },
        { k: 'align', label: '정렬', type: 'select', def: 'c', opts: [['c', '가운데'], ['l', '왼쪽']] }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy; F.bg(p, t);
        var size = 120 * u; ctx.font = F.font(900, size); while (ctx.measureText(p.title).width > W * .86 && size > 40 * u) { size -= 4 * u; ctx.font = F.font(900, size); }
        var tw = ctx.measureText(p.title).width, left = p.align === 'l' ? W * .1 : cx - tw / 2, y = cy - 20 * u, prog = seg(t, .2, 1.6);
        if (p.style === 'wipe') { ctx.save(); ctx.beginPath(); ctx.rect(left - 10 * u, y - size, tw * E.io(prog) + 20 * u, size * 2); ctx.clip(); F.text(p.title, left, y, { size: size, weight: 900, color: p._tx, align: 'left' }); ctx.restore(); }
        else { var chars = p.title.split(''), n = chars.length, x = left; for (var i = 0; i < n; i++) { var cw = ctx.measureText(chars[i]).width, g = seg(prog * (n + 3), i, 3), a = p.style === 'type' ? (g > .3 ? 1 : 0) : E.out(g), dy = p.style === 'rise' ? (1 - E.out(g)) * 60 * u : 0; ctx.font = F.font(900, size); F.text(chars[i], x, y + dy, { size: size, weight: 900, color: p._tx, align: 'left', alpha: a }); x += cw; } }
        var ul = E.io(seg(t, 1.6, .7)); ctx.save(); ctx.fillStyle = p._c1; F.rr(left, y + size * .62, tw * ul, 12 * u, 6 * u); ctx.fill(); ctx.restore();
        if (p.style === 'type' && t < 1.9 && Math.floor(t * 3) % 2 === 0) { var cxr = left + ctx.measureText(p.title.slice(0, Math.min(p.title.length, Math.floor(prog * (p.title.length + 3))))).width; ctx.fillStyle = p._c2; ctx.fillRect(cxr + 6 * u, y - size * .5, 8 * u, size); }
        F.text(p.sub, p.align === 'l' ? left : cx, y + size * .62 + 80 * u, { size: 44 * u, weight: 500, color: p._tx, align: p.align === 'l' ? 'left' : 'center', maxW: W * .8, alpha: seg(t, 2.3, .6) * .85 });
      }
    },
    /* 32. 전/후 비교 */
    {
      id: 'compare', group: 'PPT 꾸밈', icon: '↔️', name: '전 / 후 비교', dur: 7,
      desc: '왼쪽 「전」 카드가 뜨고 화살표가 그어진 뒤 오른쪽 「후」 카드가 색으로 뜹니다. 개선 전후, 작년과 올해.',
      fields: [
        { k: 'title', label: '제목(선택)', def: '업무 도구 도입 전과 후', max: 30 },
        { k: 'lt', label: '왼쪽 제목', def: '도입 전', max: 12 },
        { k: 'll', label: '왼쪽 내용(한 줄에 하나, 4개까지)', type: 'lines', def: '엑셀에서 한 줄씩 복사\n한글 표에 다시 붙이기\n매달 반나절', max: 4 },
        { k: 'rt', label: '오른쪽 제목', def: '도입 후', max: 12 },
        { k: 'rl', label: '오른쪽 내용(4개까지)', type: 'lines', def: '파일 넣으면 표 완성\n붙여넣기 한 번\n10분', max: 4 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, tall = H > W * 1.1; F.bg(p, t);
        F.text(p.title, cx, H * .12, { size: 64 * u, weight: 800, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) });
        var cw = tall ? W * .8 : W * .38, ch = tall ? H * .3 : H * .56, lx = tall ? cx - cw / 2 : W * .06, ly = tall ? H * .2 : H * .26, rx = tall ? lx : W - W * .06 - cw, ry = tall ? H * .62 : ly;
        function box(x, y, title, items, g, hot, t0) { if (g <= 0) return; ctx.save(); ctx.globalAlpha = g; ctx.translate(0, (1 - g) * 40 * u); F.panel(x, y, cw, ch, 28 * u, p); ctx.fillStyle = hot ? p._c1 : hexA(p._tx, .35); F.rr(x, y, cw, 96 * u, 28 * u); ctx.fill(); ctx.fillRect(x, y + 60 * u, cw, 36 * u); ctx.restore(); F.text(title, x + cw / 2, y + 48 * u, { size: 50 * u, weight: 800, color: '#fff', maxW: cw * .9, alpha: g }); var its = lines(items, 4), lh = Math.min(100 * u, (ch - 130 * u) / Math.max(1, its.length)); its.forEach(function (s, i) { var a = seg(t, t0 + i * .3, .4); F.text((hot ? '✓ ' : '• ') + s, x + 40 * u, y + 130 * u + lh * i + lh / 2, { size: Math.min(46 * u, lh * .5), weight: hot ? 700 : 500, color: p._tx, align: 'left', maxW: cw - 80 * u, alpha: a * g }); }); }
        box(lx, ly, p.lt, p.ll, E.out(seg(t, .3, .6)), false, .8);
        var ag = E.io(seg(t, 2.2, .7)); if (tall) arrow(ctx, cx, ly + ch + 20 * u, cx, ry - 20 * u, 14 * u, p._c2, ag); else arrow(ctx, lx + cw + 30 * u, cy + 40 * u, rx - 30 * u, cy + 40 * u, 14 * u, p._c2, ag);
        box(rx, ry, p.rt, p.rl, E.out(seg(t, 3.0, .6)), true, 3.5);
      }
    },
    /* 33. 흐름도 */
    {
      id: 'flow', group: 'PPT 꾸밈', icon: '➡️', name: '흐름도 — 상자가 차례로',
      desc: '단계 상자가 화살표를 따라 하나씩 나타납니다(6개까지). 업무 절차, 참여 과정, 사업 흐름. 「이름 | 작은 설명」으로 두 줄.',
      fields: [
        { k: 'title', label: '제목(선택)', def: '신입사원 적응 과정', max: 30 },
        { k: 'items', label: '단계(한 줄에 하나, 6개까지, 「이름 | 설명」)', type: 'lines', def: '입사 | 총무팀\n첫 면담 | 팀장\n교육 | 문서·엑셀 교실\n부서 배치 | 업무 시작\n한 달 뒤 | 되돌아보기', max: 6 }
      ],
      dur: function (p) { return 1 + lines(p.items, 6).length * .9 + 1.5; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, tall = H > W * 1.1; F.bg(p, t);
        var its = lines(p.items, 6).map(splitKV), n = its.length || 1;
        F.text(p.title, cx, H * .12, { size: 64 * u, weight: 800, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) });
        var gap = 70 * u, bw, bh, x0, y0; if (tall) { bh = Math.min(200 * u, (H * .7 - gap * (n - 1)) / n); bw = W * .76; x0 = cx - bw / 2; y0 = H * .2; } else { bw = Math.min(420 * u, (W * .9 - gap * (n - 1)) / n); bh = 240 * u; x0 = cx - (bw * n + gap * (n - 1)) / 2; y0 = cy - bh / 2 + 40 * u; }
        its.forEach(function (it, i) {
          var x = tall ? x0 : x0 + i * (bw + gap), y = tall ? y0 + i * (bh + gap) : y0, g = E.back(seg(t, .6 + i * .9, .5)), hot = i === n - 1;
          if (i) { var ag = E.io(seg(t, .3 + i * .9, .4)); if (tall) arrow(ctx, cx, y - gap + 8 * u, cx, y - 10 * u, 10 * u, p._c2, ag); else arrow(ctx, x - gap + 8 * u, y + bh / 2, x - 10 * u, y + bh / 2, 10 * u, p._c2, ag); }
          if (g <= 0) return; ctx.save(); ctx.translate(x + bw / 2, y + bh / 2); var s = Math.max(.01, g); ctx.scale(s, s); ctx.translate(-(x + bw / 2), -(y + bh / 2));
          ctx.fillStyle = hot ? p._c1 : F.card(p); F.rr(x, y, bw, bh, 24 * u); ctx.fill(); if (!hot) { ctx.strokeStyle = hexA(p._c1, .6); ctx.lineWidth = 4 * u; ctx.stroke(); }
          F.circle(x + 36 * u, y + 36 * u, 24 * u, hot ? 'rgba(255,255,255,.3)' : p._c1); F.text(i + 1, x + 36 * u, y + 38 * u, { size: 28 * u, weight: 800, color: '#fff' });
          var k = it.k || it.v, v = it.k ? it.v : '';
          F.text(k, x + bw / 2, y + bh / 2 - (v ? 22 * u : 0), { size: Math.min(50 * u, bh * .24), weight: 800, color: hot ? '#fff' : p._tx, maxW: bw - 50 * u });
          F.text(v, x + bw / 2, y + bh / 2 + 36 * u, { size: Math.min(32 * u, bh * .15), weight: 500, color: hot ? 'rgba(255,255,255,.9)' : p._tx, maxW: bw - 50 * u, alpha: .85 });
          ctx.restore();
        });
      }
    },
    /* 38. 일정 타임라인 */
    {
      id: 'timeline', group: 'PPT 꾸밈', icon: '📅', name: '일정 타임라인 — 점이 이어짐',
      desc: '선 위에 점이 차례로 켜지고 「때 | 내용」이 위아래로 번갈아 뜹니다(8개까지). 연간 계획, 사업 일정, 추진 경과.',
      fields: [
        { k: 'title', label: '제목(선택)', def: '2026년 추진 일정', max: 30 },
        { k: 'items', label: '일정(한 줄에 「때 | 내용」, 8개까지)', type: 'lines', def: '1월 | 사업 계획\n3월 | 조직 개편\n6월 | 상반기 평가\n9월 | 성과 공유회\n11월 | 수료식\n12월 | 결과 보고', max: 8 },
        { k: 'now', label: '현재 위치 번호(선택, 그 점을 강조)', def: '', max: 2 }
      ],
      dur: function (p) { return 1 + lines(p.items, 8).length * .7 + 1.5; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, tall = H > W * 1.1; F.bg(p, t);
        var its = lines(p.items, 8).map(splitKV), n = its.length || 1, now = parseInt(p.now, 10);
        F.text(p.title, cx, H * .12, { size: 64 * u, weight: 800, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) });
        var x1 = W * .08, x2 = W * .92, ly = cy + 40 * u, y1 = H * .22, y2 = H * .92, lx = W * .18;
        var prog = E.io(seg(t, .5, n * .7)); ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 10 * u; ctx.strokeStyle = hexA(p._tx, .15); ctx.beginPath(); if (tall) { ctx.moveTo(lx, y1); ctx.lineTo(lx, y2); } else { ctx.moveTo(x1, ly); ctx.lineTo(x2, ly); } ctx.stroke(); ctx.strokeStyle = p._c1; ctx.beginPath(); if (tall) { ctx.moveTo(lx, y1); ctx.lineTo(lx, lerp(y1, y2, prog)); } else { ctx.moveTo(x1, ly); ctx.lineTo(lerp(x1, x2, prog), ly); } ctx.stroke(); ctx.restore();
        its.forEach(function (it, i) {
          var f = n === 1 ? .5 : i / (n - 1), px = tall ? lx : lerp(x1 + 40 * u, x2 - 40 * u, f), py = tall ? lerp(y1 + 30 * u, y2 - 30 * u, f) : ly, g = E.back(seg(t, .6 + i * .7, .45)), hot = now === i + 1;
          if (g <= 0) return; var R = (hot ? 30 : 20) * u * Math.max(.01, g);
          F.circle(px, py, R + 10 * u, hexA(hot ? p._c2 : p._c1, .25)); F.circle(px, py, R, hot ? p._c2 : p._c1); if (hot) F.circle(px, py, R * .4, '#fff');
          var up = i % 2 === 0, a = seg(t, .8 + i * .7, .4), lab = Math.min(40 * u, (tall ? 46 : W * .9 / n * .2) * u), slot = tall ? W * .7 : W * .84 / n * 1.6;
          if (tall) { F.text(it.k || (i + 1), lx + 70 * u, py - 26 * u, { size: 40 * u, weight: 800, color: p._c1, align: 'left', maxW: W * .7, alpha: a }); F.text(it.v, lx + 70 * u, py + 28 * u, { size: 38 * u, weight: 600, color: p._tx, align: 'left', maxW: W * .72, alpha: a }); }
          else { var ty = up ? py - 70 * u : py + 70 * u; F.text(it.k || (i + 1), px, up ? ty - 50 * u : ty + 50 * u, { size: lab, weight: 800, color: hot ? p._c2 : p._c1, maxW: slot, alpha: a }); F.text(it.v, px, ty, { size: Math.min(36 * u, lab * .95), weight: 600, color: p._tx, maxW: slot, alpha: a }); }
        });
      }
    },
    /* 39. 조직도 — 들여쓰기 트리(열·행·단계 자유) */
    {
      id: 'org', group: 'PPT 꾸밈', icon: '🏢', name: '조직도 — 줄 들여쓰기로 자유롭게',
      desc: '한 줄이 상자 하나. 앞에 띄어쓰기 두 칸(또는 -)을 넣을수록 한 단계 아래로 들어갑니다. 「이름 | 작은 글」. 줄을 더하면 열·행이 늘고 단계도 제한 없음(30상자까지). 같은 부모 아래 끝 상자가 3개 이상이면 세로로 쌓입니다.',
      fields: [
        { k: 'title', label: '제목(선택)', def: '', max: 30 },
        { k: 'tree', label: '조직(한 줄 = 상자, 들여쓰기 2칸 = 한 단계 아래, 「이름 | 작은 글」)', type: 'lines', def: '칼퇴상사 | 대표\n  영업부 | 과장\n    국내영업\n    해외영업\n    고객지원\n    온라인\n  기획부 | 과장\n    기획\n    홍보\n    디자인\n  총무부 | 과장\n    회계\n    총무\n    인사', max: 30 },
        { k: 'speed', label: '나타나는 속도', type: 'select', def: 'n', opts: [['n', '보통'], ['f', '빠르게'], ['s', '천천히']] }
      ],
      parse: function (p) {
        var raw = String(p.tree || '').split(/\r?\n/).filter(function (l) { return l.trim(); }).slice(0, 30), nodes = [], stack = [];
        raw.forEach(function (l) { var m = /^([\s\-–>·]*)(.*)$/.exec(l), ind = m[1].replace(/\t/g, '  '), depth = Math.floor(ind.replace(/[^\s]/g, '  ').length / 2), a = m[2].split('|').map(function (x) { return x.trim(); }), nd = { name: a[0] || '', sub: a[1] || '', depth: depth, ch: [], idx: nodes.length }; while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop(); if (stack.length) { nd.parent = stack[stack.length - 1]; nd.parent.ch.push(nd); nd.depth = nd.parent.depth + 1; } else nd.depth = 0; stack.push(nd); nodes.push(nd); });
        var roots = nodes.filter(function (n) { return !n.parent; });
        // 끝 상자만 3개↑ 가진 부모 → 세로로 쌓기(list)
        nodes.forEach(function (n) { n.list = n.ch.length >= 3 && n.ch.every(function (c) { return !c.ch.length; }); });
        function wu(n) { if (!n.ch.length || n.list) return n.w = 1; return n.w = Math.max(1, n.ch.reduce(function (s, c) { return s + wu(c); }, 0)); }
        var total = roots.reduce(function (s, r) { return s + wu(r); }, 0) || 1, cur = 0;
        function place(n, x0) { n.x0 = x0; n.x1 = x0 + n.w; n.cx = (n.x0 + n.x1) / 2; if (n.list) { n.ch.forEach(function (c, i) { c.cx = n.cx; c.x0 = n.x0; c.x1 = n.x1; c.row = i; }); } else { var a = x0; n.ch.forEach(function (c) { place(c, a); a += c.w; }); } }
        roots.forEach(function (r) { place(r, cur); cur += r.w; });
        var maxDepth = 0, order = []; (function walk(ns) { ns.forEach(function (n) { order.push(n); if (n.depth > maxDepth) maxDepth = n.depth; walk(n.ch); }); })(roots);
        // 세로 쌓인 줄 수 중 가장 큰 것(높이 계산용)
        var maxList = 0; nodes.forEach(function (n) { if (n.list && n.ch.length > maxList) maxList = n.ch.length; });
        return { nodes: nodes, roots: roots, total: total, maxDepth: maxDepth, order: order, maxList: maxList };
      },
      dur: function (p) { var T = this.parse(p), k = p.speed === 'f' ? .25 : p.speed === 's' ? .7 : .45; return 1 + T.nodes.length * k + 2; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, T = this.parse(p), k = p.speed === 'f' ? .25 : p.speed === 's' ? .7 : .45; F.bg(p, t);
        if (!T.nodes.length) { F.text('조직을 한 줄에 하나씩 적어 주세요', cx, F.cy, { size: 50 * u, weight: 600, color: p._tx, alpha: .8 }); return; }
        var top = p.title ? H * .2 : H * .08; if (p.title) F.text(p.title, cx, H * .1, { size: 60 * u, weight: 800, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) });
        var levels = T.maxDepth + 1 + (T.maxList ? Math.max(0, (T.maxList * .55) - 1) : 0), lvH = Math.min(230 * u, (H * .92 - top) / levels), slotW = W * .94 / T.total, bw = Math.min(slotW * .9, 420 * u), bh = Math.min(lvH * .5, 110 * u), listH = Math.min(bh * .72, lvH * .5);
        function xy(n) { return { x: W * .03 + n.cx * slotW, y: n.parent && n.parent.list ? (top + (n.depth - 1) * lvH + bh + 30 * u + n.row * (listH + 10 * u) + listH / 2) : (top + n.depth * lvH + bh / 2) }; }
        var appear = {}; T.order.forEach(function (n, i) { appear[n.idx] = E.back(seg(t, .3 + i * k, .5)); });
        // 연결선
        ctx.save(); ctx.strokeStyle = hexA(p._tx, .4); ctx.lineWidth = 4 * u; ctx.lineCap = 'round';
        T.nodes.forEach(function (n) { if (!n.ch.length) return; var P = xy(n), ga = clamp(appear[n.idx], 0, 1); if (ga <= 0) return; ctx.globalAlpha = ga; if (n.list) { var last = xy(n.ch[n.ch.length - 1]); var lg = clamp(appear[n.ch[0].idx], 0, 1); ctx.setLineDash([8 * u, 8 * u]); ctx.beginPath(); ctx.moveTo(P.x, P.y + bh / 2); ctx.lineTo(P.x, lerp(P.y + bh / 2, last.y, lg)); ctx.stroke(); ctx.setLineDash([]); return; } var midY = P.y + bh / 2 + (lvH - bh) / 2, c0 = xy(n.ch[0]), c1 = xy(n.ch[n.ch.length - 1]), g = clamp(appear[n.ch[0].idx], 0, 1); ctx.beginPath(); ctx.moveTo(P.x, P.y + bh / 2); ctx.lineTo(P.x, lerp(P.y + bh / 2, midY, Math.min(1, g * 2))); ctx.stroke(); if (g > .5) { var gg = (g - .5) * 2; ctx.beginPath(); ctx.moveTo(lerp(P.x, c0.x, gg), midY); ctx.lineTo(lerp(P.x, c1.x, gg), midY); ctx.stroke(); } n.ch.forEach(function (c) { var C = xy(c), cg = clamp(appear[c.idx], 0, 1); if (cg <= 0) return; ctx.beginPath(); ctx.moveTo(C.x, midY); ctx.lineTo(C.x, lerp(midY, C.y - (c.parent.list ? listH : bh) / 2, cg)); ctx.stroke(); }); });
        ctx.restore();
        // 상자
        T.nodes.forEach(function (n) { var g = appear[n.idx]; if (g <= 0) return; var P = xy(n), isList = n.parent && n.parent.list, w = isList ? bw * .86 : bw, h = isList ? listH : bh, rootLike = n.depth === 0; ctx.save(); ctx.translate(P.x, P.y); var s = Math.max(.01, g); ctx.scale(s, s); if (rootLike) { F.panel(-w / 2, -h / 2, w, h, 20 * u, p, { hot: true }); } else { F.panel(-w / 2, -h / 2, w, h, isList ? 12 * u : 16 * u, p); if (!isList) { ctx.fillStyle = n.depth === 1 ? p._c2 : hexA(p._c1, .7); F.rr(-w / 2, -h / 2, w, 10 * u, 5 * u); ctx.fill(); } } var two = !!n.sub && !isList, nameSize = Math.min(isList ? 30 * u : (n.depth === 0 ? 46 * u : 38 * u), h * (two ? .36 : .44)); F.text(n.name, 0, two ? -h * .14 : 2 * u, { size: nameSize, weight: rootLike ? 900 : isList ? 600 : 800, color: rootLike ? '#fff' : p._tx, maxW: w - 30 * u }); if (two) F.text(n.sub, 0, h * .24, { size: Math.min(26 * u, h * .26), weight: 500, color: rootLike ? 'rgba(255,255,255,.9)' : p._tx, maxW: w - 30 * u, alpha: .85 }); else if (isList && n.sub) F.text(n.name + ' · ' + n.sub, 0, 2 * u, { size: nameSize, weight: 600, color: p._tx, maxW: w - 30 * u }); ctx.restore(); });
      }
    }
  ]);
})();
