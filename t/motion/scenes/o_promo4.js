/* 즉석 모션그래픽 — 장면: 4차 홍보 — 사진 콜라주·폴라로이드·전후 사진·영업시간·메뉴판·채용 공고 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA;
  function splitBar(l) { return l.split('|').map(function (x) { return x.trim(); }); }
  function emoji(ctx, s, x, y, size) { ctx.font = size + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
  function noPhoto(ctx, F, p, msg) { F.bg(p, 0, null, { plain: true }); F.text(msg, F.cx, F.cy, { size: 50 * F.u, weight: 600, color: p._tx, maxW: F.W * .85, alpha: .8 }); }
  // 벤토 격자: 장 수별 칸 배치(가로 12, 세로 8 격자 기준 [x,y,w,h])
  var BENTO = { 1: [[0, 0, 12, 8]], 2: [[0, 0, 6, 8], [6, 0, 6, 8]], 3: [[0, 0, 7, 8], [7, 0, 5, 4], [7, 4, 5, 4]], 4: [[0, 0, 7, 5], [7, 0, 5, 5], [0, 5, 5, 3], [5, 5, 7, 3]], 5: [[0, 0, 6, 5], [6, 0, 3, 5], [9, 0, 3, 5], [0, 5, 7, 3], [7, 5, 5, 3]], 6: [[0, 0, 5, 4], [5, 0, 4, 4], [9, 0, 3, 4], [0, 4, 3, 4], [3, 4, 4, 4], [7, 4, 5, 4]], 7: [[0, 0, 5, 4], [5, 0, 4, 4], [9, 0, 3, 4], [0, 4, 3, 4], [3, 4, 3, 4], [6, 4, 3, 4], [9, 4, 3, 4]], 8: [[0, 0, 4, 4], [4, 0, 4, 4], [8, 0, 4, 4], [0, 4, 3, 4], [3, 4, 3, 4], [6, 4, 3, 4], [9, 4, 3, 2], [9, 6, 3, 2]] };

  MG.add([
    /* 사진 콜라주 그리드 */
    {
      id: 'collage', group: '마무리·홍보', icon: '🧩', name: '사진 콜라주 — 칸이 톡톡 채워짐',
      desc: '크기가 다른 칸에 사진이 차례로 채워지고 전체가 천천히 커집니다(2~8장). 행사 하이라이트, 부서 소개, 소식지 첫 장.',
      fields: [
        { k: 'imgs', label: '사진 여러 장(2~8장)', type: 'images' },
        { k: 'title', label: '가운데 제목(선택)', def: '2026 성과공유회 하이라이트', max: 30 }
      ],
      dur: function (p) { return 1 + ((p.imgs && p.imgs.length) || 4) * .4 + 3; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, imgs = (p.imgs || []).slice(0, 8), n = imgs.length;
        if (!n) { noPhoto(ctx, F, p, '사진을 여러 장 넣어 주세요(2~8장)'); return; }
        F.bg(p, t, null, { plain: true }); var cells = BENTO[n], gap = 14 * u, zoom = 1 + .04 * E.out(seg(t, 1, 4));
        ctx.save(); ctx.translate(cx, cy); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy);
        var gw = (W - gap * 13) / 12, gh = (H - gap * 9) / 8;
        cells.forEach(function (c, i) { var g = E.back(seg(t, .3 + i * .4, .45)); if (g <= 0) return; var x = gap + c[0] * (gw + gap), y = gap + c[1] * (gh + gap), w = c[2] * gw + (c[2] - 1) * gap, h = c[3] * gh + (c[3] - 1) * gap; ctx.save(); ctx.translate(x + w / 2, y + h / 2); var s = Math.max(.01, g); ctx.scale(s, s); ctx.translate(-(x + w / 2), -(y + h / 2)); ctx.beginPath(); F.rr(x, y, w, h, 18 * u); ctx.clip(); F.imgCover(imgs[i], x, y, w, h, 1.05, .5, .5); ctx.restore(); });
        ctx.restore();
        if (p.title) { var a = seg(t, .6 + n * .4, .6); ctx.save(); ctx.globalAlpha = a; ctx.font = F.font(900, 72 * u); var tw = Math.min(W * .8, ctx.measureText(p.title).width + 100 * u); ctx.fillStyle = 'rgba(0,0,0,.55)'; F.rr(cx - tw / 2, cy - 70 * u, tw, 140 * u, 24 * u); ctx.fill(); ctx.restore(); F.text(p.title, cx, cy + 4 * u, { size: 72 * u, weight: 900, color: '#fff', maxW: W * .76, alpha: a, shadow: true }); }
      }
    },
    /* 폴라로이드 떨어뜨리기 */
    {
      id: 'polaroid', group: '마무리·홍보', icon: '📸', name: '폴라로이드 — 사진이 툭툭 쌓임',
      desc: '흰 테두리 사진이 한 장씩 떨어져 비스듬히 쌓이고, 아래에 손글씨 메모가 붙습니다(8장까지). 행사 스케치, 참가자 사진 모음.',
      fields: [
        { k: 'imgs', label: '사진 여러 장(8장까지)', type: 'images' },
        { k: 'caps', label: '사진 아래 글(한 줄에 한 장, 선택)', type: 'lines', def: '', max: 8 },
        { k: 'title', label: '제목(선택)', def: '오늘의 순간들', max: 24 }
      ],
      dur: function (p) { return 1 + ((p.imgs && p.imgs.length) || 4) * .7 + 2.5; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, imgs = (p.imgs || []).slice(0, 8), n = imgs.length, caps = lines(p.caps, 8);
        F.bg(p, t, null, { plain: true });
        F.text(p.title, cx, H * .1, { size: 64 * u, weight: 800, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) });
        if (!n) { F.text('사진을 여러 장 넣어 주세요', cx, cy, { size: 50 * u, weight: 600, color: p._tx, alpha: .8 }); return; }
        var r = rnd(12), pw = Math.min(W * .3, 560 * u), ph = pw * 1.18;
        imgs.forEach(function (img, i) { var g = E.out(seg(t, .5 + i * .7, .6)); if (g <= 0) return; var tx = cx + (r() - .5) * W * .56, ty = cy + 40 * u + (r() - .5) * H * .32, rot = (r() - .5) * .5, y = lerp(-ph, ty, g), s = lerp(1.25, 1, g); ctx.save(); ctx.translate(tx, y); ctx.rotate(rot * g); ctx.scale(s, s); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 40 * u; ctx.shadowOffsetY = 12 * u; ctx.fillStyle = '#fff'; ctx.fillRect(-pw / 2, -ph / 2, pw, ph); ctx.shadowColor = 'transparent'; F.imgCover(img, -pw / 2 + pw * .06, -ph / 2 + pw * .06, pw * .88, pw * .88, 1, .5, .5); if (caps[i]) F.text(caps[i], 0, ph / 2 - (ph - pw * .94) / 2, { size: 34 * u, weight: 600, color: '#3A2F10', maxW: pw * .85 }); ctx.restore(); });
      }
    },
    /* 전·후 사진 2장 비교 */
    {
      id: 'photocmp', group: '마무리·홍보', icon: '🪞', name: '전 / 후 사진 비교 — 가르는 선', dur: 7,
      desc: '「전」 사진 위로 세로 선이 지나가며 「후」 사진이 드러납니다. 공간 개선, 청소·정리 전후, 부서 변화.',
      fields: [
        { k: 'img1', label: '전 사진', type: 'image' }, { k: 'img2', label: '후 사진', type: 'image' },
        { k: 'l1', label: '왼쪽 글', def: '전', max: 10 }, { k: 'l2', label: '오른쪽 글', def: '후', max: 10 },
        { k: 'title', label: '제목(선택)', def: '', max: 30 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy;
        if (!(p.img1 && p.img1.naturalWidth) || !(p.img2 && p.img2.naturalWidth)) { noPhoto(ctx, F, p, '전·후 사진 두 장을 넣어 주세요'); return; }
        var s = E.io(seg(t, 1, 3)), x = lerp(W * .04, W * .96, s), back = 1 - E.io(seg(t, 5.2, 1.2)), xx = lerp(W * .5, x, 1); if (t > 5.2) xx = lerp(x, W * .5, 1 - back);
        F.imgCover(p.img2, 0, 0, W, H, 1, .5, .5);
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, xx, H); ctx.clip(); F.imgCover(p.img1, 0, 0, W, H, 1, .5, .5); ctx.restore();
        ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 20 * u; ctx.fillRect(xx - 4 * u, 0, 8 * u, H); ctx.shadowColor = 'transparent'; F.circle(xx, cy, 44 * u, '#fff'); ctx.restore(); F.text('◀ ▶', xx, cy + 2 * u, { size: 26 * u, weight: 900, color: '#1A2B50' });
        function tag(txt, lx, col, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = F.font(900, 56 * u); var tw = ctx.measureText(txt).width + 70 * u; ctx.fillStyle = col; F.rr(lx - tw / 2, H * .08, tw, 100 * u, 24 * u); ctx.fill(); ctx.restore(); F.text(txt, lx, H * .08 + 52 * u, { size: 56 * u, weight: 900, color: '#fff', alpha: a }); }
        tag(p.l1, W * .2, 'rgba(60,60,60,.85)', Math.min(1, xx / (W * .4))); tag(p.l2, W * .8, p._c1, Math.min(1, (W - xx) / (W * .4)));
        if (p.title) F.text(p.title, cx, H * .92, { size: 48 * u, weight: 800, color: '#fff', maxW: W * .8, shadow: true });
      }
    },
    /* 영업시간·휴무 안내 */
    {
      id: 'hours', group: '마무리·홍보', icon: '🕰️', name: '영업시간·휴무 안내판', dur: 6,
      desc: '가게 이름 아래 요일별 시간이 한 줄씩 켜지고 휴무·연락처가 붙습니다. 카페·식당·매장 안내.',
      fields: [
        { k: 'name', label: '가게·부서 이름', def: '칼퇴 카페 본점', max: 24 },
        { k: 'rows', label: '시간(한 줄에 「요일 | 시간」, 7줄까지)', type: 'lines', def: '월~금 | 09:00 ~ 18:00\n토 | 10:00 ~ 15:00\n일·공휴일 | 휴무', max: 7 },
        { k: 'closed', label: '휴무·안내 한 줄(선택)', def: '12월 25일(목) 성탄절 휴무', max: 40 },
        { k: 'tel', label: '전화(선택)', def: '02-000-0000', max: 20 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy; F.bg(p, t);
        var rows = lines(p.rows, 7).map(splitBar), n = rows.length || 1, bw = Math.min(W * .7, 1100 * u), bh = H * .8, x0 = cx - bw / 2, y0 = H * .1, g0 = E.out(seg(t, 0, .6));
        ctx.save(); ctx.globalAlpha = g0; F.panel(x0, y0, bw, bh, 30 * u, p); ctx.strokeStyle = hexA(p._c1, .5); ctx.lineWidth = 3 * u; F.rr(x0 + 18 * u, y0 + 18 * u, bw - 36 * u, bh - 36 * u, 22 * u); ctx.stroke(); ctx.restore();
        F.text('OPEN HOURS · 영업시간', cx, y0 + 70 * u, { size: 30 * u, weight: 700, color: p._c1, alpha: g0 });
        F.text(p.name, cx, y0 + 140 * u, { size: 64 * u, weight: 900, color: p._tx, maxW: bw - 80 * u, alpha: g0 });
        var top = y0 + 220 * u, rh = Math.min(96 * u, (bh - 400 * u) / n);
        rows.forEach(function (r, i) { var a = E.out(seg(t, .6 + i * .35, .4)), y = top + rh * i + rh / 2, off = /휴무|쉼|closed/i.test(r[1] || ''); ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([4 * u, 10 * u]); ctx.strokeStyle = hexA(p._tx, .35); ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.moveTo(x0 + 70 * u, y + rh * .4); ctx.lineTo(x0 + bw - 70 * u, y + rh * .4); ctx.stroke(); ctx.restore(); F.text(r[0] || '', x0 + 80 * u, y, { size: Math.min(44 * u, rh * .5), weight: 700, color: p._tx, align: 'left', maxW: bw * .4, alpha: a }); F.text(r[1] || '', x0 + bw - 80 * u, y, { size: Math.min(44 * u, rh * .5), weight: 800, color: off ? '#E63946' : p._c1, align: 'right', maxW: bw * .5, alpha: a }); });
        var a2 = seg(t, .8 + n * .35, .5); if (p.closed) { ctx.save(); ctx.globalAlpha = a2; ctx.fillStyle = hexA('#E63946', .12); F.rr(x0 + 60 * u, y0 + bh - 170 * u, bw - 120 * u, 64 * u, 16 * u); ctx.fill(); ctx.restore(); F.text('⚠ ' + p.closed, cx, y0 + bh - 138 * u, { size: 32 * u, weight: 700, color: '#E63946', maxW: bw - 160 * u, alpha: a2 }); }
        F.text(p.tel ? '☎ ' + p.tel : '', cx, y0 + bh - 70 * u, { size: 34 * u, weight: 600, color: p._tx, alpha: a2 * .85 });
      }
    },
    /* 메뉴판 보드 */
    {
      id: 'menu', group: '마무리·홍보', icon: '🍽️', name: '메뉴판 — 이름·가격·설명',
      desc: '메뉴 줄이 하나씩 나타나고 가격이 점선으로 이어집니다(8개까지). 카페·식당, 행사 다과 안내.',
      fields: [
        { k: 'title', label: '제목', def: '오늘의 메뉴', max: 24 },
        { k: 'items', label: '메뉴(한 줄에 「이름 | 가격 | 설명(선택)」, 8개까지)', type: 'lines', def: '아메리카노 | 2,500 | 직접 볶은 원두\n카페라떼 | 3,000 |\n샐러드 | 6,500 | 오늘 아침 채소\n도시락 | 5,000 | 국 포함', max: 8 },
        { k: 'note', label: '아래 글(선택)', def: '오늘도 정시에 문을 닫습니다', max: 40 }
      ],
      dur: function (p) { return 1 + lines(p.items, 8).length * .4 + 2.5; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx; F.bg(p, t);
        var its = lines(p.items, 8).map(splitBar), n = its.length || 1, bw = Math.min(W * .76, 1200 * u), x0 = cx - bw / 2;
        F.text(p.title, cx, H * .12, { size: 70 * u, weight: 900, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) });
        ctx.save(); ctx.globalAlpha = seg(t, .2, .4); ctx.fillStyle = p._c2; ctx.fillRect(cx - 60 * u, H * .18, 120 * u, 6 * u); ctx.restore();
        var top = H * .24, rh = Math.min(120 * u, H * .62 / n);
        its.forEach(function (it, i) { var a = E.out(seg(t, .5 + i * .4, .45)), y = top + rh * i + rh / 2, nm = it[0] || '', pr = it[1] || '', ds = it[2] || ''; ctx.save(); ctx.globalAlpha = a; ctx.translate((1 - a) * -40 * u, 0); ctx.font = F.font(800, Math.min(46 * u, rh * .42)); var nw = ctx.measureText(nm).width; ctx.font = F.font(900, Math.min(46 * u, rh * .42)); var pw = ctx.measureText(pr).width; ctx.setLineDash([3 * u, 9 * u]); ctx.strokeStyle = hexA(p._tx, .4); ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(x0 + nw + 24 * u, y - (ds ? 10 * u : 0) + 12 * u); ctx.lineTo(x0 + bw - pw - 24 * u, y - (ds ? 10 * u : 0) + 12 * u); ctx.stroke(); ctx.restore(); F.text(nm, x0, y - (ds ? 14 * u : 0), { size: Math.min(46 * u, rh * .42), weight: 800, color: p._tx, align: 'left', maxW: bw * .6, alpha: a }); F.text(pr, x0 + bw, y - (ds ? 14 * u : 0), { size: Math.min(46 * u, rh * .42), weight: 900, color: p._c1, align: 'right', maxW: bw * .3, alpha: a }); if (ds) F.text(ds, x0, y + rh * .3, { size: Math.min(28 * u, rh * .26), weight: 500, color: p._tx, align: 'left', maxW: bw * .7, alpha: a * .7 }); });
        F.text(p.note, cx, H * .92, { size: 32 * u, weight: 500, color: p._tx, maxW: W * .8, alpha: seg(t, .8 + n * .4, .6) * .8 });
      }
    },
    /* 채용 공고 카드 */
    {
      id: 'hire', group: '마무리·홍보', icon: '🧑‍💼', name: '채용·모집 공고 — 분야·조건',
      desc: '「채용」 띠와 직무 이름이 크게, 아래에 인원·자격·근무·기간·문의가 한 줄씩. 직원 채용, 동호회·행사 도우미 모집.',
      fields: [
        { k: 'badge', label: '띠 글', def: '채용 공고', max: 12 },
        { k: 'job', label: '직무·모집 이름', def: '총무팀 사무직 1명', max: 40 },
        { k: 'items', label: '조건(한 줄에 「항목 | 내용」, 6개까지)', type: 'lines', def: '자격 | 엑셀을 다룰 줄 아는 분\n근무 | 주 5일 09:00~18:00\n급여 | 회사 내규\n접수 | 2026. 12. 1.(월) ~ 12. 12.(금)\n방법 | 이메일 접수 · 서류 → 면접\n문의 | 02-000-0000 (총무부)', max: 6 },
        { k: 'org', label: '회사 이름', def: '칼퇴상사', max: 24 }
      ],
      dur: function (p) { return 1.6 + lines(p.items, 6).length * .5 + 2; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, tall = H > W * 1.1; F.bg(p, t);
        var its = lines(p.items, 6).map(splitBar), n = its.length || 1;
        var gb = E.back(seg(t, .1, .5)); if (gb > 0) { ctx.save(); ctx.translate(W * .12, H * .12); var s = Math.max(.01, gb); ctx.scale(s, s); ctx.font = F.font(800, 36 * u); var bw = ctx.measureText(p.badge).width + 70 * u; ctx.fillStyle = p._c2; F.rr(0, -32 * u, bw, 64 * u, 14 * u); ctx.fill(); F.text(p.badge, bw / 2, 2 * u, { size: 36 * u, weight: 800, color: '#fff' }); ctx.restore(); }
        F.para(p.job, W * .12, H * .27, { size: 84 * u, weight: 900, color: p._tx, maxW: W * .76, maxLines: 2, align: 'left', alpha: seg(t, .5, .6) });
        var top = H * .4, rh = Math.min(84 * u, H * .46 / n), kw = 150 * u;
        its.forEach(function (it, i) { var a = E.out(seg(t, 1.2 + i * .5, .5)), y = top + rh * i + rh / 2; ctx.save(); ctx.globalAlpha = a; ctx.translate((1 - a) * 40 * u, 0); ctx.fillStyle = hexA(p._c1, .95); F.rr(W * .12, y - rh * .34, kw, rh * .68, 12 * u); ctx.fill(); ctx.restore(); F.text(it[0] || '', W * .12 + kw / 2, y + 2 * u, { size: Math.min(30 * u, rh * .38), weight: 800, color: '#fff', maxW: kw - 16 * u, alpha: a }); F.text(it[1] || '', W * .12 + kw + 26 * u, y + 2 * u, { size: Math.min(38 * u, rh * .44), weight: 600, color: p._tx, align: 'left', maxW: W * .7, alpha: a }); });
        var lh = 70 * u; ctx.save(); ctx.globalAlpha = seg(t, 1.2 + n * .5, .6); if (!F.logo(p._logo, W * .88 - lh * 2.4, H * .9 - lh / 2, lh * 2.4, lh)) F.text(p.org, W * .88, H * .9, { size: 38 * u, weight: 700, color: p._tx, align: 'right', maxW: W * .5 }); ctx.restore();
      }
    }
  ]);
})();
