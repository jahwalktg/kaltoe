/* 즉석 모션그래픽 — 장면: 마무리·홍보 (3차) 문의처·SNS 모집 공고·생일 축하·명절·새해 인사 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA;
  function emoji(ctx, s, x, y, size) { ctx.font = size + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
  function confetti(ctx, F, t, p, dur, n) { var r = rnd(2026), cols = [p._c1, p._c2, '#F2B705', '#E63946', '#1F9D5C', '#8A6BE0'], W = F.W, H = F.H, u = F.u; ctx.save(); for (var i = 0; i < n; i++) { var x0 = r() * W, sp = (.6 + r() * .6), ph = r() * dur, w = (10 + r() * 14) * u, h = (14 + r() * 20) * u, col = cols[Math.floor(r() * cols.length)], sw = (r() - .5) * 2, rot = r() * 6.28, rs = (r() - .5) * 6; var tt = ((t + ph) % dur) / dur; var y = -h * 2 + tt * (H + h * 4) * sp / .9, x = x0 + Math.sin(tt * 6.28 * 2 + ph) * 60 * u * sw; ctx.save(); ctx.translate(x, y); ctx.rotate(rot + tt * rs); ctx.scale(Math.cos(tt * 6.28 * 3 + ph), 1); ctx.fillStyle = col; ctx.globalAlpha = .95; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore(); } ctx.restore(); }

  MG.add([
    /* 46. 문의처 카드 */
    {
      id: 'contact', group: '마무리·홍보', icon: '☎️', name: '문의처 카드', dur: 6,
      desc: '회사 이름(로고) 아래 담당자·전화·이메일·주소가 아이콘과 함께 한 줄씩 뜹니다. 안내 끝, 모집 공고 끝에.',
      fields: [
        { k: 'org', label: '회사 이름', def: '칼퇴상사', max: 24 },
        { k: 'title', label: '큰 글(선택)', def: '궁금한 점은 언제든 문의하세요', max: 30 },
        { k: 'who', label: '담당(선택)', def: '총무팀 김○○', max: 30 },
        { k: 'tel', label: '전화', def: '02-000-0000', max: 24 },
        { k: 'mail', label: '이메일(선택)', def: 'center@example.org', max: 40 },
        { k: 'addr', label: '주소(선택)', def: '서울 ○○구 ○○로 00, 3층', max: 50 },
        { k: 'hours', label: '시간(선택)', def: '평일 09:00 ~ 18:00', max: 30 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, tall = H > W * 1.1; F.bg(p, t);
        var rows = [['👤', p.who], ['📞', p.tel], ['✉️', p.mail], ['📍', p.addr], ['🕘', p.hours]].filter(function (r) { return r[1]; }), n = rows.length || 1;
        var g0 = E.out(seg(t, 0, .6)), lh = 120 * u;
        ctx.save(); ctx.translate(0, (1 - g0) * 30 * u); ctx.globalAlpha = g0; if (!F.logo(p._logo, cx - lh * 1.2, H * .1, lh * 2.4, lh)) F.text(p.org, cx, H * .15, { size: 60 * u, weight: 800, color: p._tx, maxW: W * .8 }); ctx.restore();
        F.text(p.title, cx, H * .29, { size: 56 * u, weight: 700, color: p._tx, maxW: W * .86, alpha: seg(t, .4, .5) });
        var bw = Math.min(W * .76, 1200 * u), rh = Math.min(110 * u, (H * .58) / n), x0 = cx - bw / 2, y0 = H * .37;
        ctx.save(); ctx.globalAlpha = seg(t, .6, .5); F.panel(x0, y0, bw, rh * n + 40 * u, 28 * u, p); ctx.restore();
        rows.forEach(function (r, i) { var a = E.out(seg(t, 1.0 + i * .45, .5)), y = y0 + 20 * u + rh * i + rh / 2; ctx.save(); ctx.globalAlpha = a; ctx.translate((1 - a) * -40 * u, 0); F.circle(x0 + 70 * u, y, rh * .36, hexA(p._c1, .95)); emoji(ctx, r[0], x0 + 70 * u, y + 3 * u, rh * .4); ctx.restore(); F.text(r[1], x0 + 140 * u, y + 2 * u, { size: Math.min(48 * u, rh * .44), weight: i === 1 ? 800 : 600, color: p._tx, align: 'left', maxW: bw - 180 * u, alpha: a }); });
      }
    },
    /* 48. SNS 모집 공고 */
    {
      id: 'recruit', group: '마무리·홍보', icon: '📢', name: 'SNS 모집 공고 — 움직이는 카드',
      desc: '「모집」 띠 → 제목 → 기간·대상·신청 방법이 한 줄씩 뜨고 멈춥니다. 비율을 1:1이나 9:16으로 바꾸면 인스타·카카오톡용. 카드뉴스 첫 장 대신.',
      fields: [
        { k: 'badge', label: '띠 글', def: '참가자 모집', max: 12 },
        { k: 'title', label: '제목', def: '사내 엑셀 교실 참가자를 모집합니다', max: 40 },
        { k: 'items', label: '내용(한 줄에 「항목 | 내용」, 6개까지)', type: 'lines', def: '기간 | 2026. 1. 5.(월) ~ 1. 23.(금)\n대상 | 칼퇴상사 직원 누구나\n내용 | 함수, 피벗, 차트\n신청 | 총무팀 메신저\n문의 | 02-000-0000', max: 6 },
        { k: 'org', label: '회사 이름(아래)', def: '칼퇴상사', max: 24 }
      ],
      dur: function (p) { return 1.8 + lines(p.items, 6).length * .6 + 2; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, tall = H > W * 1.1, sq = Math.abs(W - H) < W * .1; F.bg(p, t);
        var its = lines(p.items, 6).map(function (l) { var a = l.split('|').map(function (x) { return x.trim(); }); return a.length > 1 ? { k: a[0], v: a.slice(1).join(' | ') } : { k: '', v: a[0] }; }), n = its.length || 1;
        var gb = E.back(seg(t, .1, .5)); if (gb > 0) { ctx.save(); ctx.translate(cx, H * .1); var s = Math.max(.01, gb); ctx.scale(s, s); ctx.font = F.font(800, 40 * u); var bw = ctx.measureText(p.badge).width + 80 * u; ctx.fillStyle = p._c2; F.rr(-bw / 2, -36 * u, bw, 72 * u, 36 * u); ctx.fill(); F.text(p.badge, 0, 2 * u, { size: 40 * u, weight: 800, color: '#fff' }); ctx.restore(); }
        F.para(p.title, cx, H * (tall || sq ? .24 : .25), { size: (tall || sq ? 84 : 92) * u, weight: 900, color: p._tx, maxW: W * .86, maxLines: 2, alpha: seg(t, .6, .6) });
        var bw2 = W * .86, x0 = cx - bw2 / 2, y0 = H * (tall || sq ? .36 : .4), rh = Math.min(96 * u, (H * .5 - 40 * u) / n), kw = 180 * u;
        ctx.save(); ctx.globalAlpha = seg(t, 1.2, .5); F.panel(x0, y0, bw2, rh * n + 40 * u, 28 * u, p); ctx.restore();
        its.forEach(function (it, i) { var a = E.out(seg(t, 1.6 + i * .6, .5)), y = y0 + 20 * u + rh * i + rh / 2; if (it.k) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = hexA(p._c1, .95); F.rr(x0 + 30 * u, y - rh * .33, kw, rh * .66, 14 * u); ctx.fill(); ctx.restore(); F.text(it.k, x0 + 30 * u + kw / 2, y + 2 * u, { size: Math.min(34 * u, rh * .38), weight: 800, color: '#fff', maxW: kw - 20 * u, alpha: a }); } F.text(it.v, x0 + (it.k ? 30 * u + kw + 30 * u : 40 * u), y + 2 * u, { size: Math.min(40 * u, rh * .42), weight: 600, color: p._tx, align: 'left', maxW: bw2 - kw - 100 * u, alpha: a }); });
        var lh = 70 * u, ya = H * .93; ctx.save(); ctx.globalAlpha = seg(t, 1.6 + n * .6, .6); if (!F.logo(p._logo, cx - lh * 1.2, ya - lh / 2, lh * 2.4, lh)) F.text(p.org, cx, ya, { size: 40 * u, weight: 700, color: p._tx, maxW: W * .8 }); ctx.restore();
      }
    },
    /* 49. 생일·기념일 축하 */
    {
      id: 'birthday', group: '마무리·홍보', icon: '🎂', name: '생일·기념일 축하(반복)', dur: 6, loop: true,
      desc: '풍선이 떠오르고 케이크가 흔들리며 이름과 축하 글이 뜁니다. 끝과 처음이 이어지는 GIF. 참가자·직원 생일, 부서 기념일.',
      fields: [
        { k: 'name', label: '이름', def: '김○○ 님', max: 20 },
        { k: 'text', label: '축하 글', def: '생일 축하합니다!', max: 24 },
        { k: 'sub', label: '작은 글(선택)', def: '함께 일할 수 있어 고맙습니다', max: 40 },
        { k: 'icon', label: '아이콘', type: 'select', def: '🎂', opts: [['🎂', '케이크'], ['🎁', '선물'], ['🎈', '풍선'], ['🏅', '메달(기념일)'], ['🌸', '꽃']] }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, dur = 6, ph = (t / dur) * Math.PI * 2;
        F.bg(p, t, p._c2);
        var r = rnd(49), cols = [p._c1, p._c2, '#F2B705', '#E63946', '#1F9D5C', '#8A6BE0'];
        ctx.save(); for (var i = 0; i < 14; i++) { var x0 = r() * W, ph2 = r(), R = (36 + r() * 30) * u, col = cols[Math.floor(r() * cols.length)], sw = (r() - .5) * 80 * u; var tt = ((t / dur) + ph2) % 1; var y = H + R * 2 - tt * (H + R * 5), x = x0 + Math.sin(tt * 6.28 + ph2 * 6) * sw; ctx.globalAlpha = .9; ctx.strokeStyle = hexA(p._tx, .35); ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.moveTo(x, y + R); ctx.quadraticCurveTo(x + 10 * u, y + R * 2.2, x - 6 * u, y + R * 3.2); ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, R * .85, R, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(x - R * .3, y - R * .35, R * .2, R * .3, -.5, 0, Math.PI * 2); ctx.fill(); } ctx.restore();
        confetti(ctx, F, t, p, dur, 60);
        ctx.save(); ctx.translate(cx, cy - 200 * u); ctx.rotate(Math.sin(ph * 2) * .08); ctx.scale(1 + Math.sin(ph * 2) * .04, 1 + Math.sin(ph * 2) * .04); emoji(ctx, p.icon || '🎂', 0, 0, 220 * u); ctx.restore();
        F.text(p.name, cx, cy + 20 * u, { size: 80 * u, weight: 800, color: p._tx, maxW: W * .8 });
        var bounce = 1 + Math.abs(Math.sin(ph * 2)) * .06; ctx.save(); ctx.translate(cx, cy + 150 * u); ctx.scale(bounce, bounce); F.text(p.text, 0, 0, { size: 130 * u, weight: 900, color: p._tx, maxW: W * .88 / bounce, shadow: true }); ctx.restore();
        F.text(p.sub, cx, cy + 280 * u, { size: 44 * u, weight: 500, color: p._tx, maxW: W * .8, alpha: .85 });
      }
    },
    /* 50. 명절·새해 인사 */
    {
      id: 'season', group: '마무리·홍보', icon: '🌅', name: '명절·새해 인사 — 움직이는 인사장', dur: 8,
      desc: '해돋이(새해)·보름달(추석)·눈(송년)·꽃(봄) 배경이 움직이고 인사 글과 회사 이름이 뜹니다. 카카오톡·SNS에 보내는 움직이는 인사장. 비율 1:1 추천.',
      fields: [
        { k: 'kind', label: '배경', type: 'select', def: 'sun', opts: [['sun', '해돋이(새해·설)'], ['moon', '보름달(추석·한가위)'], ['snow', '눈(송년·성탄)'], ['bloom', '꽃잎(봄·감사)']] },
        { k: 'title', label: '큰 글', def: '새해 복 많이 받으세요', max: 20 },
        { k: 'msg', label: '인사말(선택)', type: 'lines', def: '언제나 건강하시고\n하시는 일마다 좋은 결실 맺으시길 바랍니다', max: 3 },
        { k: 'org', label: '보내는 곳', def: '칼퇴상사 임직원 일동', max: 30 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy, dur = 8, ph = (t / dur) * Math.PI * 2, k = p.kind || 'sun', r = rnd(50);
        var tall = H > W * 1.1;
        if (!p._trans) {
          var g = ctx.createLinearGradient(0, 0, 0, H);
          if (k === 'sun') { g.addColorStop(0, '#1B2A5E'); g.addColorStop(.55, '#C4486B'); g.addColorStop(1, '#F6A560'); }
          else if (k === 'moon') { g.addColorStop(0, '#0B1230'); g.addColorStop(1, '#2A3A6E'); }
          else if (k === 'snow') { g.addColorStop(0, '#15233F'); g.addColorStop(1, '#3B5484'); }
          else { g.addColorStop(0, '#FFF3F6'); g.addColorStop(1, '#FFD6E2'); }
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        }
        var tx = k === 'bloom' ? '#5A2A3C' : '#fff';
        if (k === 'sun') {
          var rise = E.out(seg(t, 0, 3.5)), sy = lerp(H * .78, H * .5, rise), R = 150 * u;
          ctx.save(); var gl = ctx.createRadialGradient(cx, sy, R * .5, cx, sy, R * 3.5); gl.addColorStop(0, 'rgba(255,214,102,.75)'); gl.addColorStop(1, 'rgba(255,214,102,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H); ctx.restore();
          ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H * .72); ctx.clip(); F.circle(cx, sy, R, '#FFD166'); ctx.restore();
          ctx.fillStyle = '#2A1F3D'; ctx.beginPath(); ctx.moveTo(0, H * .72); for (var x = 0; x <= W; x += W / 24) { ctx.lineTo(x, H * .72 - Math.abs(Math.sin(x / W * 9 + 1)) * 90 * u - Math.sin(x / W * 3) * 30 * u); } ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#1B1430'; ctx.beginPath(); ctx.moveTo(0, H * .8); for (var x2 = 0; x2 <= W; x2 += W / 20) { ctx.lineTo(x2, H * .8 - Math.abs(Math.sin(x2 / W * 6 + 2)) * 60 * u); } ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
          ctx.save(); for (var b = 0; b < 3; b++) { var bx = W * .25 + b * W * .25 + Math.sin(ph + b) * 20 * u, by = H * .3 + b * 20 * u - rise * 30 * u; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 4 * u; ctx.beginPath(); ctx.moveTo(bx - 40 * u, by + 10 * u); ctx.quadraticCurveTo(bx - 15 * u, by - 20 * u, bx, by); ctx.quadraticCurveTo(bx + 15 * u, by - 20 * u, bx + 40 * u, by + 10 * u); ctx.stroke(); } ctx.restore();
        } else if (k === 'moon') {
          ctx.save(); for (var s = 0; s < 80; s++) { var sx = r() * W, syy = r() * H * .7, o = r() * 6.28; ctx.globalAlpha = .4 + .6 * (Math.sin(t * 2 + o) + 1) / 2; F.circle(sx, syy, (1.5 + r() * 2.5) * u, '#fff'); } ctx.restore();
          var mx = W * .7, my = H * .3, MR = 170 * u; ctx.save(); var mg = ctx.createRadialGradient(mx, my, MR * .6, mx, my, MR * 3); mg.addColorStop(0, 'rgba(255,240,180,.55)'); mg.addColorStop(1, 'rgba(255,240,180,0)'); ctx.fillStyle = mg; ctx.fillRect(0, 0, W, H); ctx.restore(); F.circle(mx, my, MR, '#FFF1B8'); ctx.save(); ctx.globalAlpha = .12; F.circle(mx - MR * .3, my - MR * .2, MR * .25, '#C9B37A'); F.circle(mx + MR * .35, my + MR * .3, MR * .18, '#C9B37A'); ctx.restore();
          ctx.save(); ctx.globalAlpha = .85; for (var c = 0; c < 3; c++) { var cxx = ((t * (30 + c * 15) * u) + c * W * .4) % (W + 500 * u) - 250 * u, cyy = H * .42 + c * 70 * u; ctx.fillStyle = 'rgba(255,255,255,.18)'; F.rr(cxx, cyy, 420 * u, 50 * u, 25 * u); ctx.fill(); F.circle(cxx + 120 * u, cyy, 70 * u, 'rgba(255,255,255,.18)'); F.circle(cxx + 260 * u, cyy + 5 * u, 55 * u, 'rgba(255,255,255,.18)'); } ctx.restore();
          ctx.save(); ctx.strokeStyle = 'rgba(230,220,180,.8)'; ctx.lineWidth = 3 * u; for (var g2 = 0; g2 < 26; g2++) { var gx = r() * W, sway = Math.sin(ph * 2 + g2) * 25 * u, gh = (120 + r() * 120) * u; ctx.beginPath(); ctx.moveTo(gx, H); ctx.quadraticCurveTo(gx + sway * .5, H - gh * .6, gx + sway, H - gh); ctx.stroke(); F.circle(gx + sway, H - gh, 6 * u, 'rgba(240,230,200,.9)'); } ctx.restore();
        } else if (k === 'snow') {
          ctx.save(); for (var f = 0; f < 120; f++) { var fx = r() * W, fo = r(), fr = (3 + r() * 7) * u, sp = .5 + r(); var tt = ((t / dur) * sp + fo) % 1; var fy = tt * (H + 40 * u) - 20 * u, fxx = fx + Math.sin(tt * 6.28 * 2 + fo * 6) * 40 * u; ctx.globalAlpha = .5 + .5 * r(); F.circle(fxx, fy, fr, '#fff'); } ctx.restore();
          ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.moveTo(0, H * .86); for (var x3 = 0; x3 <= W; x3 += W / 16) ctx.lineTo(x3, H * .86 - Math.abs(Math.sin(x3 / W * 5)) * 40 * u); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
          ctx.save(); for (var tr = 0; tr < 5; tr++) { var txx = W * .1 + tr * W * .2 + (tr % 2) * 40 * u, th = (160 + (tr % 3) * 50) * u, base = H * .86 - Math.abs(Math.sin(txx / W * 5)) * 40 * u; ctx.fillStyle = '#1E5C3A'; for (var l = 0; l < 3; l++) { var ww = th * (.5 - l * .12), yy = base - l * th * .3; ctx.beginPath(); ctx.moveTo(txx, yy - th * .45); ctx.lineTo(txx - ww / 2, yy); ctx.lineTo(txx + ww / 2, yy); ctx.closePath(); ctx.fill(); ctx.fillStyle = l === 2 ? '#1E5C3A' : '#1E5C3A'; } ctx.fillStyle = 'rgba(255,255,255,.8)'; for (var l2 = 0; l2 < 3; l2++) { var ww2 = th * (.5 - l2 * .12), yy2 = base - l2 * th * .3; ctx.beginPath(); ctx.moveTo(txx, yy2 - th * .45); ctx.lineTo(txx - ww2 / 2 * .55, yy2 - th * .2); ctx.lineTo(txx + ww2 / 2 * .55, yy2 - th * .2); ctx.closePath(); ctx.fill(); } } ctx.restore();
        } else {
          ctx.save(); for (var q = 0; q < 70; q++) { var qx = r() * W, qo = r(), qs = (10 + r() * 14) * u, qsp = .4 + r() * .6, rot0 = r() * 6.28; var tt2 = ((t / dur) * qsp + qo) % 1; var qy = tt2 * (H + 80 * u) - 40 * u, qxx = qx + Math.sin(tt2 * 6.28 * 1.5 + qo * 6) * 90 * u + tt2 * 120 * u; ctx.save(); ctx.translate(qxx, qy); ctx.rotate(rot0 + tt2 * 8); ctx.globalAlpha = .85; ctx.fillStyle = q % 3 ? '#FF9DBB' : '#FF6F9A'; ctx.beginPath(); ctx.ellipse(0, 0, qs, qs * .55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } ctx.restore();
          ctx.save(); ctx.strokeStyle = '#7A4A3A'; ctx.lineWidth = 16 * u; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-20 * u, H * .25); ctx.quadraticCurveTo(W * .2, H * .18, W * .42, H * .08); ctx.stroke(); ctx.lineWidth = 9 * u; ctx.beginPath(); ctx.moveTo(W * .2, H * .18); ctx.quadraticCurveTo(W * .26, H * .3, W * .34, H * .34); ctx.stroke(); var r2 = rnd(51); for (var bl = 0; bl < 18; bl++) { var bt = r2(), bx2 = bt < .6 ? lerp(-20 * u, W * .42, bt / .6) : lerp(W * .2, W * .34, (bt - .6) / .4), by2 = bt < .6 ? lerp(H * .25, H * .08, bt / .6) + (r2() - .5) * 40 * u : lerp(H * .18, H * .34, (bt - .6) / .4) + (r2() - .5) * 30 * u, bs = (18 + r2() * 14) * u * (1 + Math.sin(ph * 2 + bl) * .06); for (var pt = 0; pt < 5; pt++) { var an = pt / 5 * 6.28; ctx.fillStyle = pt % 2 ? '#FFB3C9' : '#FF8FB0'; ctx.beginPath(); ctx.ellipse(bx2 + Math.cos(an) * bs * .5, by2 + Math.sin(an) * bs * .5, bs * .42, bs * .26, an, 0, Math.PI * 2); ctx.fill(); } F.circle(bx2, by2, bs * .18, '#FFE08A'); } ctx.restore();
        }
        var g0 = E.out(seg(t, .6, .8)), ty = tall ? H * .62 : (k === 'sun' ? H * .22 : H * .62);
        if (k === 'moon' || k === 'bloom') ty = tall ? H * .66 : H * .6; if (k === 'snow') ty = tall ? H * .4 : H * .36;
        ctx.save(); ctx.translate(0, (1 - g0) * 30 * u); F.text(p.title, cx, ty, { size: 120 * u, weight: 900, color: tx, maxW: W * .86, alpha: g0, shadow: k !== 'bloom' }); ctx.restore();
        F.para(lines(p.msg, 3).join('\n'), cx, ty + 150 * u, { size: 46 * u, weight: 500, color: tx, maxW: W * .82, maxLines: 3, alpha: seg(t, 1.6, .8) * .95, lh: 1.5 });
        var lh2 = 70 * u, oy = H * .93, oc = k === 'snow' ? '#24375E' : tx; ctx.save(); ctx.globalAlpha = seg(t, 2.6, .8); if (!F.logo(p._logo, cx - lh2 * 1.2, oy - lh2 / 2, lh2 * 2.4, lh2)) F.text(p.org, cx, oy, { size: 40 * u, weight: 700, color: oc, maxW: W * .8 }); ctx.restore();
      }
    }
  ]);
})();
