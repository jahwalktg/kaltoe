/* 즉석 모션그래픽 — 장면: 진행 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA, fmtNum = MG.fmtNum, withComma = MG.withComma;
  MG.add([
    /* 3. 하단 자막 띠 */
    {
      id: 'lower', group: '진행', icon: '🪪', name: '하단 자막 띠 — 이름·소속', dur: function (p) { return p.stay === 'y' ? 5 : 7; },
      desc: '화면 아래 왼쪽에서 이름 띠가 들어오고(머물다 나갑니다). 발표자 소개, 인터뷰 영상 위 자막. 배경을 「투명(GIF)」으로 하면 영상 위에 얹을 수 있습니다.',
      fields: [
        { k: 'name', label: '이름', def: '김○○', max: 20 },
        { k: 'role', label: '소속·직함', def: '칼퇴상사 팀장', max: 40 },
        { k: 'tag', label: '작은 꼬리표(선택)', def: '발표', max: 10 },
        { k: 'stay', label: '끝날 때', type: 'select', def: 'n', opts: [['n', '들어왔다 나감'], ['y', '들어와서 머묾(마지막 그림 유지)']] }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, dur = p.stay === 'y' ? 5 : 7;
        F.bg(p, t, null, { plain: true });
        var gin = E.out(seg(t, 0, .7)), gout = p.stay === 'y' ? 0 : E.in(seg(t, dur - .7, .6));
        var barH = 150 * u, barW = Math.min(W * .62, 1000 * u), x0 = W * .06, y0 = H - barH - H * .1;
        var x = x0 - barW * (1 - gin) - barW * 1.2 * gout;
        ctx.save(); ctx.translate(x, y0);
        ctx.fillStyle = p._c1; F.rr(0, 0, 18 * u, barH, 6 * u); ctx.fill();
        ctx.fillStyle = p._trans ? 'rgba(255,255,255,.96)' : (F.light(p._bg) ? '#fff' : 'rgba(255,255,255,.96)'); F.rr(18 * u, 0, barW - 18 * u, barH, 14 * u); ctx.fill();
        ctx.shadowColor = 'transparent';
        var tx = 50 * u, ta = seg(t, .5, .4);
        if (p.tag) { ctx.font = F.font(700, 28 * u); var tw = ctx.measureText(p.tag).width + 30 * u; ctx.globalAlpha = ta; ctx.fillStyle = p._c2; F.rr(tx, 26 * u, tw, 42 * u, 10 * u); ctx.fill(); ctx.globalAlpha = 1; F.text(p.tag, tx + tw / 2, 47 * u, { size: 28 * u, weight: 700, color: '#fff', alpha: ta }); tx += tw + 20 * u; }
        F.text(p.name, tx, 47 * u, { size: 52 * u, weight: 800, color: '#1A2B50', align: 'left', maxW: barW - tx - 30 * u, alpha: ta });
        F.text(p.role, 50 * u, 108 * u, { size: 32 * u, weight: 500, color: '#5B6885', align: 'left', maxW: barW - 90 * u, alpha: seg(t, .7, .4) });
        ctx.restore();
      }
    },,
    /* 6. 호명 카드 */
    {
      id: 'call', group: '진행', icon: '🎤', name: '호명 카드 — 발표자·수상자', dur: 5.5,
      desc: '「다음 발표」 같은 꼬리표가 먼저 뜨고 이름이 크게 드러납니다. 시상, 발표 순서, 부서 소개.',
      fields: [
        { k: 'label', label: '꼬리표', def: '우수 사원', max: 14 },
        { k: 'name', label: '이름(크게)', def: '김 ○ ○', max: 16 },
        { k: 'sub', label: '소속·설명(선택)', def: '영업팀', max: 40 },
        { k: 'note', label: '아래 작은 글(선택)', def: '큰 박수로 맞아 주세요 👏', max: 30 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy;
        if (!p._trans) { ctx.fillStyle = F.grad(hexA(p._c1, .9), p._bg); ctx.fillRect(0, 0, W, H); }
        // 반짝임
        var r = rnd(7); ctx.save();
        for (var i = 0; i < 40; i++) { var sx = r() * W, sy = r() * H, ph = r() * 6.28, sp = .6 + r(); var a = (Math.sin(t * sp * 3 + ph) + 1) / 2 * seg(t, .8, .8); ctx.globalAlpha = a * .8; F.circle(sx, sy, (2 + r() * 4) * u, '#fff'); }
        ctx.restore();
        var g1 = seg(t, 0, .5);
        ctx.font = F.font(700, 40 * u); var lw = ctx.measureText(p.label).width + 70 * u;
        ctx.save(); ctx.globalAlpha = g1; ctx.fillStyle = p._c2; F.rr(cx - lw / 2, cy - 300 * u - (1 - E.out(g1)) * 20 * u, lw, 72 * u, 36 * u); ctx.fill(); ctx.restore();
        F.text(p.label, cx, cy - 264 * u - (1 - E.out(g1)) * 20 * u, { size: 40 * u, weight: 700, color: '#fff', alpha: g1 });
        var g2 = seg(t, .7, .8); ctx.save(); ctx.beginPath(); ctx.rect(cx - W * .5 * E.out(g2), cy - 200 * u, W * E.out(g2), 400 * u); ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, cy - 140 * u, W, 280 * u);
        F.text(p.name, cx, cy, { size: 190 * u, weight: 900, color: '#fff', maxW: W * .85, shadow: true }); ctx.restore();
        F.text(p.sub, cx, cy + 210 * u, { size: 56 * u, weight: 600, color: '#fff', maxW: W * .8, alpha: seg(t, 1.5, .6) * .95 });
        F.text(p.note, cx, H - 120 * u, { size: 40 * u, weight: 500, color: '#fff', maxW: W * .8, alpha: seg(t, 2.1, .6) * .85 });
      }
    },,
    /* 5. 쉬는 시간 타이머 (전체화면 재생 전용) */
    {
      id: 'timer', group: '진행', icon: '☕', name: '쉬는 시간 타이머', liveOnly: true, dur: function (p) { return (parseFloat(p.min) || 10) * 60 + 6; },
      desc: '남은 시간이 큰 글자로 줄어들고 끝나면 안내 글이 깜빡입니다. 파일로 받지 않고 「전체화면으로 재생」을 눌러 현장에서 바로 띄우는 장면입니다.',
      fields: [
        { k: 'min', label: '쉬는 시간(분)', type: 'number', def: 10, min: 1, max: 90, step: 0.5 },
        { k: 'msg', label: '위 글', def: '잠시 쉬는 시간입니다 ☕', max: 30 },
        { k: 'end', label: '끝났을 때 글', def: '곧 다시 시작합니다. 자리로 돌아와 주세요.', max: 40 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, total = (parseFloat(p.min) || 10) * 60, rem = Math.max(0, total - t);
        if (p._trans) { ctx.fillStyle = p._bg; ctx.fillRect(0, 0, W, H); } F.bg(p, t * .2);
        F.text(p.msg, cx, cy - 330 * u, { size: 60 * u, weight: 600, color: p._tx, maxW: W * .85 });
        var R = 280 * u; ctx.save(); ctx.lineWidth = 22 * u; ctx.strokeStyle = hexA(p._c2, .25); ctx.beginPath(); ctx.arc(cx, cy + 20 * u, R, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = rem < 60 ? '#E63946' : p._c1; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy + 20 * u, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (rem / total)); ctx.stroke(); ctx.restore();
        var m = Math.floor(rem / 60), s = Math.floor(rem % 60), txt = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        if (rem > 0) F.text(txt, cx, cy + 20 * u, { size: 190 * u, weight: 900, color: p._tx });
        else { var bl = Math.sin(t * 6) > 0 ? 1 : .35; F.text('00:00', cx, cy + 20 * u, { size: 190 * u, weight: 900, color: '#E63946', alpha: bl }); }
        if (rem <= 0) F.para(p.end, cx, cy + 400 * u, { size: 56 * u, weight: 700, color: p._tx, maxW: W * .85, maxLines: 2 });
        else if (rem < 60) F.text('1분 남았습니다', cx, cy + 400 * u, { size: 48 * u, weight: 600, color: '#E63946' });
      }
    },,
    /* 12. 롤링 공지 자막 */
    {
      id: 'ticker', group: '진행', icon: '📢', name: '흐르는 공지 자막', dur: function (p) { var n = String(p.text || '').length; return Math.max(6, Math.min(40, 4 + n * 0.22)); },
      desc: '아래 띠를 따라 공지가 흐릅니다. 행사 중 안내(주차·식사·설문), 대기 화면. 배경 「투명(GIF)」이면 영상·슬라이드 위에 얹기.',
      fields: [
        { k: 'tag', label: '머리 글', def: '안내', max: 8 },
        { k: 'text', label: '흐를 글(한 줄)', def: '행사 뒤 1층 로비에서 다과가 준비되어 있습니다 · 주차권은 안내 데스크에서 받아 가세요 · 설문은 QR로 참여해 주세요', max: 300 },
        { k: 'pos', label: '위치', type: 'select', def: 'b', opts: [['b', '아래'], ['t', '위']] }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, dur = MG.BY.ticker.dur(p);
        F.bg(p, t, null, { plain: true });
        var barH = 110 * u, y = p.pos === 't' ? H * .06 : H - barH - H * .06;
        ctx.fillStyle = p._trans ? 'rgba(26,43,80,.92)' : hexA(F.light(p._bg) ? '#1A2B50' : '#000', .85); ctx.fillRect(0, y, W, barH);
        ctx.font = F.font(800, 40 * u); var tagW = p.tag ? ctx.measureText(p.tag).width + 70 * u : 0;
        if (p.tag) { ctx.fillStyle = p._c1; ctx.fillRect(0, y, tagW, barH); F.text(p.tag, tagW / 2, y + barH / 2 + 2 * u, { size: 40 * u, weight: 800, color: '#fff' }); }
        var txt = String(p.text || ''); ctx.font = F.font(600, 46 * u); var tw = ctx.measureText(txt).width, dist = W - tagW + tw, x = tagW + (W - tagW) - (t / dur) * dist;
        ctx.save(); ctx.beginPath(); ctx.rect(tagW, y, W - tagW, barH); ctx.clip();
        F.text(txt, x, y + barH / 2 + 2 * u, { size: 46 * u, weight: 600, color: '#fff', align: 'left' }); ctx.restore();
      }
    }
  ]);
})();
