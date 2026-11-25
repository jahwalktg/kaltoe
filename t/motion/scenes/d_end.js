/* 즉석 모션그래픽 — 장면: 마무리·홍보 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA, fmtNum = MG.fmtNum, withComma = MG.withComma;
  MG.add([
    /* 9. 마무리 감사 + QR */
    {
      id: 'thanks', group: '마무리·홍보', icon: '🙏', name: '마무리 — 감사 인사와 QR', dur: 6,
      desc: '감사 문구가 떠오르고 설문·소식 주소 QR이 나타납니다. 행사 마지막 장, 설문 안내.',
      fields: [
        { k: 'title', label: '큰 글', def: '함께해 주셔서 감사합니다', max: 30 },
        { k: 'sub', label: '작은 글(선택)', def: '오늘 교육 만족도 설문에 참여해 주세요', max: 50 },
        { k: 'url', label: 'QR에 담을 주소(선택, 비우면 QR 없음)', type: 'url', def: '', ph: 'https://…', max: 300 },
        { k: 'org', label: '회사 이름(로고 없을 때)', def: '칼퇴상사', max: 24 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, tall = H > W * 1.1;
        F.bg(p, t, p._c1);
        var hasQ = !!(p.url && p.url.trim());
        var tx = hasQ && !tall ? W * .36 : cx, maxW = hasQ && !tall ? W * .56 : W * .86;
        var g1 = seg(t, .2, .8);
        F.para(p.title, tx, (tall ? H * .22 : cy - 80 * u) + (1 - E.out(g1)) * 30 * u, { size: 104 * u, weight: 800, color: p._tx, maxW: maxW, maxLines: 2, alpha: g1 });
        F.para(p.sub, tx, (tall ? H * .36 : cy + 90 * u), { size: 46 * u, weight: 500, color: p._tx, maxW: maxW, maxLines: 2, alpha: seg(t, .9, .7) * .9 });
        var lg = seg(t, 1.4, .6);
        if (!F.logo(p._logo, tx - 200 * u, (tall ? H * .46 : cy + 190 * u), 400 * u, 110 * u, lg)) F.text(p.org, tx, (tall ? H * .5 : cy + 245 * u), { size: 40 * u, weight: 700, color: p._tx, maxW: maxW, alpha: lg * .8 });
        if (hasQ && window.qrcode) {
          var gq = E.back(seg(t, 1.2, .9)); var qs = (tall ? 520 : 460) * u, qx = tall ? cx : W * .75, qy = tall ? H * .72 : cy;
          try {
            var q = window.qrcode(0, 'M'); q.addData(p.url.trim()); q.make(); var cnt = q.getModuleCount(), pad = 28 * u, cell = (qs - pad * 2) / cnt;
            ctx.save(); ctx.translate(qx, qy); ctx.scale(Math.max(.01, gq), Math.max(.01, gq)); ctx.translate(-qs / 2, -qs / 2);
            ctx.fillStyle = '#fff'; F.rr(0, 0, qs, qs, 24 * u); ctx.fill(); ctx.fillStyle = '#1A2B50';
            for (var r = 0; r < cnt; r++) for (var c = 0; c < cnt; c++) if (q.isDark(r, c)) ctx.fillRect(pad + c * cell, pad + r * cell, cell + .5, cell + .5);
            ctx.restore();
            F.text('카메라로 찍으면 열립니다', qx, qy + qs / 2 + 50 * u, { size: 30 * u, weight: 500, color: p._tx, alpha: seg(t, 2, .5) * .8 });
          } catch (e) { F.text('주소가 너무 길어 QR을 못 만듭니다', qx, qy, { size: 30 * u, color: p._tx }); }
        }
      }
    },,
    /* 10. 축하 콘페티 */
    {
      id: 'party', group: '마무리·홍보', icon: '🎉', name: '축하 — 콘페티', dur: 6,
      desc: '종이 꽃가루가 쏟아지며 축하 문구가 뜁니다. 시상, 수료, 개소 축하. 끝과 처음이 이어져 GIF 반복에 좋습니다.',
      fields: [
        { k: 'title', label: '큰 글', def: '축하합니다!', max: 20 },
        { k: 'sub', label: '작은 글(선택)', def: '2026년 사내 교육 수료를 진심으로 축하드립니다', max: 50 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy;
        F.bg(p, t, null, { plain: true });
        var r = rnd(2026), cols = [p._c1, p._c2, '#F2B705', '#E63946', '#1F9D5C', '#8A6BE0'], dur = 6;
        ctx.save();
        for (var i = 0; i < 160; i++) {
          var x0 = r() * W, sp = (.6 + r() * .6), ph = r() * dur, w = (10 + r() * 14) * u, h = (14 + r() * 20) * u, col = cols[Math.floor(r() * cols.length)], sw = (r() - .5) * 2, rot = r() * 6.28, rs = (r() - .5) * 6;
          var tt = ((t + ph) % dur) / dur;                 // 0~1 반복 (끝·처음 이음)
          var y = -h * 2 + tt * (H + h * 4) * sp / .9, x = x0 + Math.sin(tt * 6.28 * 2 + ph) * 60 * u * sw;
          ctx.save(); ctx.translate(x, y); ctx.rotate(rot + tt * rs); ctx.scale(Math.cos(tt * 6.28 * 3 + ph), 1); ctx.fillStyle = col; ctx.globalAlpha = .95; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
        }
        ctx.restore();
        var bounce = 1 + Math.abs(Math.sin(t * 2.2)) * .06;
        ctx.save(); ctx.translate(cx, cy - 20 * u); ctx.scale(bounce, bounce);
        F.text(p.title, 0, 0, { size: 170 * u, weight: 900, color: p._tx, maxW: W * .85 / bounce, shadow: true }); ctx.restore();
        F.para(p.sub, cx, cy + 170 * u, { size: 50 * u, weight: 600, color: p._tx, maxW: W * .8, maxLines: 2 });
      }
    },
  ]);
})();
