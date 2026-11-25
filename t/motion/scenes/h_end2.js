/* 즉석 모션그래픽 — 장면: 마무리·홍보 (2차) QR 안내 단독 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA;
  function emoji(ctx, s, x, y, size) { ctx.font = size + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
  MG.add([
    /* 45. QR 안내 단독 */
    {
      id: 'qr', group: '마무리·홍보', icon: '📱', name: 'QR 안내 — 설문·출석·신청', dur: 8,
      desc: '큰 QR과 「휴대폰 카메라로 찍어 주세요」 안내, 휴대폰 아이콘이 흔들립니다. 설문·출석 체크·신청 안내. 끝과 처음이 이어져 반복 재생에 좋습니다.',
      fields: [
        { k: 'title', label: '큰 글', def: '만족도 설문에 참여해 주세요', max: 30 },
        { k: 'url', label: 'QR에 담을 주소', type: 'url', def: 'https://jahwalktg.github.io/kaltoe/', max: 300 },
        { k: 'sub', label: '작은 글', def: '휴대폰 카메라를 QR에 가져다 대면 열립니다 · 약 1분', max: 60 },
        { k: 'short', label: '주소 글자(선택, QR 아래 표시)', def: '', max: 60 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, tall = H > W * 1.1, ph = (t / 8) * Math.PI * 2;
        if (!p._trans) { F.bg(p, t, p._c1, { deco: false }); ctx.save(); ctx.globalAlpha = .15; F.circle(W * .85 + Math.sin(ph) * 20 * u, H * .2, 320 * u, p._c1); F.circle(W * .12, H * .85 + Math.cos(ph) * 20 * u, 260 * u, p._c2); ctx.restore(); }
        var qx = tall ? cx : W * .3, qy = tall ? H * .42 : cy + 20 * u, qs = (tall ? 620 : 560) * u, tx = tall ? cx : W * .7, maxW = tall ? W * .9 : W * .5;
        if (window.qrcode && p.url && p.url.trim()) { try { var q = window.qrcode(0, 'M'); q.addData(p.url.trim()); q.make(); var cnt = q.getModuleCount(), pad = 30 * u, cell = (qs - pad * 2) / cnt; ctx.save(); ctx.translate(qx - qs / 2, qy - qs / 2); ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 30 * u; ctx.fillStyle = '#fff'; F.rr(0, 0, qs, qs, 28 * u); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.fillStyle = '#1A2B50'; for (var r = 0; r < cnt; r++) for (var c = 0; c < cnt; c++) if (q.isDark(r, c)) ctx.fillRect(pad + c * cell, pad + r * cell, cell + .5, cell + .5); ctx.restore(); } catch (e) { F.text('주소가 너무 깁니다', qx, qy, { size: 40 * u, color: p._tx }); } }
        // 스캔 선
        var sy = qy - qs / 2 + ((t * .5) % 1) * qs; ctx.save(); ctx.globalAlpha = .5; ctx.fillStyle = p._c1; ctx.fillRect(qx - qs / 2 + 10 * u, sy - 3 * u, qs - 20 * u, 6 * u); ctx.restore();
        if (p.short) F.text(p.short, qx, qy + qs / 2 + 50 * u, { size: 32 * u, weight: 500, color: p._tx, maxW: qs, alpha: .8 });
        ctx.save(); ctx.translate(tx, tall ? H * .8 : cy - 230 * u); ctx.rotate(Math.sin(t * 5) * 8 * Math.PI / 180); emoji(ctx, '📱', 0, 0, 120 * u); ctx.restore();
        F.para(p.title, tx, tall ? H * .1 : cy - 60 * u, { size: 80 * u, weight: 900, color: p._tx, maxW: maxW, maxLines: 2 });
        F.para(p.sub, tx, tall ? H * .9 : cy + 110 * u, { size: 40 * u, weight: 500, color: p._tx, maxW: maxW, maxLines: 2, alpha: .9 });
      }
    }
  ]);
})();
