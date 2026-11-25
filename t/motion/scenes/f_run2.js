/* 즉석 모션그래픽 — 장면: 진행 (2차) 시상·명단 롤·조 편성·발표 타이머·알림·질문·정답 공개·식사·사진 촬영·추첨 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA;
  function stepsDur(segs) { return segs.reduce(function (a, s) { return a + s.d; }, 0); }
  function stepsMarks(segs) { var t = 0, m = []; segs.forEach(function (s, i) { if (i) m.push(t); t += s.d; }); return m; }
  function drawSteps(segs, ctx, t, p, F) { var acc = 0; for (var i = 0; i < segs.length; i++) { if (t < acc + segs[i].d || i === segs.length - 1) { segs[i].draw(ctx, Math.min(t - acc, segs[i].d), p, F); return; } acc += segs[i].d; } }
  function sparkle(ctx, F, t, n, seed, a0) { var r = rnd(seed || 7); ctx.save(); for (var i = 0; i < n; i++) { var sx = r() * F.W, sy = r() * F.H, ph = r() * 6.28, sp = .6 + r(); var a = (Math.sin(t * sp * 3 + ph) + 1) / 2 * (a0 == null ? 1 : a0); ctx.globalAlpha = a * .8; F.circle(sx, sy, (2 + r() * 4) * F.u, '#fff'); } ctx.restore(); }
  function confetti(ctx, F, t, p, dur, n) { var r = rnd(2026), cols = [p._c1, p._c2, '#F2B705', '#E63946', '#1F9D5C', '#8A6BE0'], W = F.W, H = F.H, u = F.u; ctx.save(); for (var i = 0; i < n; i++) { var x0 = r() * W, sp = (.6 + r() * .6), ph = r() * dur, w = (10 + r() * 14) * u, h = (14 + r() * 20) * u, col = cols[Math.floor(r() * cols.length)], sw = (r() - .5) * 2, rot = r() * 6.28, rs = (r() - .5) * 6; var tt = ((t + ph) % dur) / dur; var y = -h * 2 + tt * (H + h * 4) * sp / .9, x = x0 + Math.sin(tt * 6.28 * 2 + ph) * 60 * u * sw; ctx.save(); ctx.translate(x, y); ctx.rotate(rot + tt * rs); ctx.scale(Math.cos(tt * 6.28 * 3 + ph), 1); ctx.fillStyle = col; ctx.globalAlpha = .95; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore(); } ctx.restore(); }
  function emoji(ctx, s, x, y, size) { ctx.font = size + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }

  MG.add([
    /* 13. 시상 */
    {
      id: 'award', group: '진행', icon: '🏆', name: '시상 — 상 이름과 수상자',
      desc: '상 이름이 뜨고 수상자가 한 명씩 더해집니다(8명까지). 전체화면에서는 스페이스로 다음 사람. 마지막엔 전체 명단이 남습니다.',
      fields: [
        { k: 'prize', label: '상 이름', def: '우수 사원상', max: 20 },
        { k: 'giver', label: '수여(선택)', def: '칼퇴상사 대표', max: 30 },
        { k: 'names', label: '수상자(한 줄에 「이름 | 소속」, 8명까지)', type: 'lines', def: '김○○ | 영업팀\n이○○ | 총무팀\n박○○ | 기획팀', max: 8 },
        { k: 'each', label: '한 명 머무는 초', type: 'number', def: 2.5, min: 1, max: 8, step: 0.5 }
      ],
      segs: function (p) {
        var S = [], its = lines(p.names, 8).map(function (l) { var a = l.split('|').map(function (x) { return x.trim(); }); return [a[0] || '', a[1] || '']; }), e = +p.each || 2.5;
        function panel(ctx, tt, p, F, upto, cur) {
          var W = F.W, H = F.H, u = F.u, cx = F.cx;
          F.bg(p, tt, p._c2); sparkle(ctx, F, tt, 30, 11, .7);
          var g = E.back(seg(tt, 0, .6));
          F.text('🏆', cx, H * .13, { size: 70 * u, color: '#fff', alpha: 1 });
          ctx.save(); ctx.translate(cx, H * .24); ctx.scale(upto < 0 ? Math.max(.01, g) : 1, upto < 0 ? Math.max(.01, g) : 1); F.text(p.prize, 0, 0, { size: 96 * u, weight: 900, color: p._tx, maxW: W * .85, shadow: true }); ctx.restore();
          F.text(p.giver, cx, H * .34, { size: 38 * u, weight: 500, color: p._tx, maxW: W * .8, alpha: .8 });
          var n = Math.min(its.length, upto + 1), top = H * .42, gap = Math.min((H * .5) / Math.max(1, its.length), 120 * u);
          for (var i = 0; i < n; i++) {
            var a = i === cur ? E.back(seg(tt, 0, .6)) : 1, y = top + gap * i + gap / 2, isCur = i === cur;
            ctx.save(); ctx.globalAlpha = clamp(a, 0, 1); ctx.translate(cx, y); ctx.scale(Math.max(.01, a), Math.max(.01, a));
            ctx.fillStyle = isCur ? hexA(p._c1, .95) : F.card(p); F.rr(-W * .3, -gap * .42, W * .6, gap * .84, 18 * u); ctx.fill();
            F.text(its[i][0], -W * .3 + 40 * u, 0, { size: Math.min(60 * u, gap * .5), weight: 800, color: isCur ? '#fff' : p._tx, align: 'left', maxW: W * .32 });
            F.text(its[i][1], W * .3 - 40 * u, 0, { size: Math.min(36 * u, gap * .32), weight: 500, color: isCur ? '#fff' : p._tx, align: 'right', maxW: W * .24, alpha: .9 });
            ctx.restore();
          }
        }
        S.push({ d: 2.5, draw: function (ctx, tt, p, F) { panel(ctx, tt, p, F, -1, -1); } });
        its.forEach(function (_, i) { S.push({ d: e, draw: function (ctx, tt, p, F) { panel(ctx, tt, p, F, i, i); } }); });
        S.push({ d: 3, draw: function (ctx, tt, p, F) { panel(ctx, tt + 5, p, F, its.length - 1, -1); confetti(ctx, F, tt, p, 6, 90); } });
        return S;
      },
      dur: function (p) { return stepsDur(this.segs(p)); }, marks: function (p) { return stepsMarks(this.segs(p)); },
      draw: function (ctx, t, p, F) { drawSteps(this.segs(p), ctx, t, p, F); }
    },
    /* 14. 명단 롤 */
    {
      id: 'roll', group: '진행', icon: '📜', name: '명단 롤 — 이름이 흘러 올라감',
      desc: '수료자·참가자 명단이 영화 끝 자막처럼 아래에서 위로 흐릅니다(60명까지). 마지막에 제목이 남습니다.',
      fields: [
        { k: 'title', label: '제목', def: '2026년 사내 교육 수료자', max: 30 },
        { k: 'names', label: '이름(한 줄에 하나, 「이름 | 소속」도 됨, 60명까지)', type: 'lines', def: '김○○ | 영업팀\n이○○ | 총무팀\n박○○ | 기획팀\n최○○ | 물류팀\n정○○ | 홍보팀\n강○○ | 인사팀\n조○○ | 디자인팀\n윤○○ | 고객팀', max: 60 },
        { k: 'speed', label: '빠르기', type: 'select', def: '1', opts: [['0.7', '천천히'], ['1', '보통'], ['1.4', '빠르게']] },
        { k: 'cols', label: '열', type: 'select', def: '1', opts: [['1', '한 줄로'], ['2', '두 줄(많을 때)']] }
      ],
      dur: function (p) { var n = lines(p.names, 60).length, c = +p.cols || 1; return 2 + Math.ceil(n / c) * 1.1 / (+p.speed || 1) + 4; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, its = lines(p.names, 60), c = +p.cols || 1, sp = +p.speed || 1, rows = Math.ceil(its.length / c), lh = 96 * u;
        F.bg(p, t);
        var dur = this.dur(p), scrollDur = dur - 6, total = rows * lh;
        var prog = clamp((t - 2) / scrollDur, 0, 1), y0 = H + 60 * u - prog * (total + H * .6 + 60 * u);
        ctx.save(); ctx.beginPath(); ctx.rect(0, H * .2, W, H * .8); ctx.clip();
        its.forEach(function (s, i) { var a = s.split('|').map(function (x) { return x.trim(); }); var r = Math.floor(i / c), col = i % c, x = c === 1 ? cx : cx + (col - .5) * W * .42, y = y0 + r * lh; if (y < H * .15 || y > H + lh) return; var txt = a[0] + (a[1] ? '  ·  ' + a[1] : ''); F.text(txt, x, y, { size: 56 * u, weight: 700, color: p._tx, maxW: c === 1 ? W * .8 : W * .38 }); });
        ctx.restore();
        var fade = ctx.createLinearGradient(0, H * .18, 0, H * .32); fade.addColorStop(0, p._trans ? 'rgba(0,0,0,0)' : p._bg); fade.addColorStop(1, 'rgba(0,0,0,0)'); if (!p._trans) { ctx.fillStyle = fade; ctx.fillRect(0, H * .18, W, H * .14); }
        ctx.fillStyle = p._trans ? 'rgba(0,0,0,0)' : p._bg; ctx.fillRect(0, 0, W, H * .19);
        F.text(p.title, cx, H * .11, { size: 72 * u, weight: 800, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .6) });
        ctx.fillStyle = p._c2; ctx.fillRect(cx - 120 * u, H * .17, 240 * u, 5 * u);
        if (t > dur - 3.5) F.text('수고하셨습니다', cx, H * .6, { size: 90 * u, weight: 900, color: p._tx, alpha: seg(t, dur - 3.5, .8) });
      }
    },
    /* 15. 조 편성 발표 */
    {
      id: 'teams', group: '진행', icon: '👥', name: '조 편성 발표',
      desc: '조마다 카드가 넘어가며 이름이 보입니다(10조·조당 12명까지). 「조 이름: 이름, 이름, …」 한 줄이 한 조. 전체화면에서는 스페이스로 다음 조.',
      fields: [
        { k: 'title', label: '제목', def: '조 편성 안내', max: 20 },
        { k: 'items', label: '조(한 줄에 「조 이름 | 이름, 이름, 이름」, 10조까지)', type: 'lines', def: '1조 | 김○○, 이○○, 박○○, 최○○, 정○○\n2조 | 강○○, 조○○, 윤○○, 장○○, 임○○\n3조 | 한○○, 오○○, 서○○, 신○○, 권○○', max: 10 },
        { k: 'each', label: '한 조 머무는 초', type: 'number', def: 4, min: 2, max: 15 },
        { k: 'note', label: '아래 안내(선택)', def: '조별 자리는 테이블 번호를 확인해 주세요', max: 40 }
      ],
      segs: function (p) {
        var S = [], ts = lines(p.items, 10).map(function (l) { var a = l.split('|'); return { name: (a[0] || '').trim(), m: (a.slice(1).join('|') || '').split(/[,，·、]/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 12) }; }), e = +p.each || 4;
        S.push({ d: 2, draw: function (ctx, tt, p, F) { F.bg(p, tt); F.text(p.title, F.cx, F.cy, { size: 110 * F.u, weight: 900, color: p._tx, maxW: F.W * .9, alpha: seg(tt, 0, .5) }); F.text('총 ' + ts.length + '개 조', F.cx, F.cy + 130 * F.u, { size: 50 * F.u, weight: 500, color: p._tx, alpha: seg(tt, .6, .5) * .8 }); } });
        ts.forEach(function (tm, i) {
          S.push({ d: e, draw: function (ctx, tt, p, F) {
            var W = F.W, H = F.H, u = F.u, cx = F.cx; F.bg(p, tt);
            F.text(p.title + ' · ' + (i + 1) + '/' + ts.length, cx, H * .1, { size: 36 * u, weight: 600, color: p._tx, alpha: .7 });
            var g = E.out(seg(tt, 0, .5)); ctx.save(); ctx.globalAlpha = g; ctx.translate((1 - g) * 80 * u, 0);
            ctx.fillStyle = p._c1; F.rr(cx - 200 * u, H * .17, 400 * u, 110 * u, 55 * u); ctx.fill();
            F.text(tm.name, cx, H * .17 + 55 * u, { size: 60 * u, weight: 900, color: '#fff', maxW: 340 * u });
            var n = tm.m.length, cols = n > 6 ? 3 : n > 3 ? 2 : 1, rows = Math.ceil(n / cols), boxW = W * .8 / cols, gap = Math.min((H * .52) / rows, 130 * u), top = H * .36;
            tm.m.forEach(function (nm, k) { var a = seg(tt, .3 + k * .12, .4), r = Math.floor(k / cols), c = k % cols, x = cx - W * .4 + boxW * c + boxW / 2, y = top + gap * r + gap / 2; ctx.save(); ctx.globalAlpha = a * g; F.panel(x - boxW / 2 + 12 * u, y - gap * .4, boxW - 24 * u, gap * .8, 16 * u, p); ctx.restore(); F.text(nm, x, y, { size: Math.min(56 * u, gap * .45), weight: 800, color: p._tx, maxW: boxW - 60 * u, alpha: a * g }); });
            ctx.restore();
            F.text(p.note, cx, H * .93, { size: 34 * u, weight: 500, color: p._tx, maxW: W * .9, alpha: .6 });
          } });
        });
        return S;
      },
      dur: function (p) { return stepsDur(this.segs(p)); }, marks: function (p) { return stepsMarks(this.segs(p)); },
      draw: function (ctx, t, p, F) { drawSteps(this.segs(p), ctx, t, p, F); }
    },
    /* 17. 발표 타이머 (모서리) */
    {
      id: 'ptimer', group: '진행', icon: '⏲️', name: '발표 시간 타이머(모서리, 현장 재생)', liveOnly: true, dur: function (p) { return (parseFloat(p.min) || 10) * 60 + 6; },
      desc: '발표자가 보는 작은 카운트다운. 배경 「투명」으로 두면 발표 화면 위에 작게 얹기 좋고, 마지막 1분은 빨갛게. 전체화면 재생으로 보조 모니터에 띄웁니다.',
      fields: [
        { k: 'min', label: '발표 시간(분)', type: 'number', def: 10, min: 1, max: 120, step: 0.5 },
        { k: 'who', label: '발표자(선택)', def: '', max: 20 },
        { k: 'pos', label: '위치', type: 'select', def: 'br', opts: [['br', '오른쪽 아래'], ['tr', '오른쪽 위'], ['c', '가운데 크게']] }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, total = (parseFloat(p.min) || 10) * 60, rem = Math.max(0, total - t), m = Math.floor(rem / 60), s = Math.floor(rem % 60), txt = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        F.bg(p, t, null, { plain: true });
        var big = p.pos === 'c', R = big ? 260 * u : 110 * u, x = big ? F.cx : W - R - 60 * u, y = big ? F.cy : (p.pos === 'tr' ? R + 60 * u : H - R - 60 * u);
        var col = rem <= 60 ? '#E63946' : p._c1;
        ctx.save(); ctx.globalAlpha = .9; F.circle(x, y, R + 14 * u, p._trans ? 'rgba(20,30,60,.85)' : hexA(F.light(p._bg) ? '#1A2B50' : '#000', .5)); ctx.restore();
        ctx.save(); ctx.lineWidth = (big ? 20 : 10) * u; ctx.strokeStyle = hexA('#FFFFFF', .2); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (rem / total)); ctx.stroke(); ctx.restore();
        var bl = rem <= 0 ? (Math.sin(t * 6) > 0 ? 1 : .3) : 1;
        F.text(txt, x, y + (p.who ? -8 : 0) * u, { size: (big ? 150 : 64) * u, weight: 900, color: rem <= 60 ? '#FF7B76' : '#fff', alpha: bl });
        if (p.who) F.text(p.who, x, y + (big ? 110 : 44) * u, { size: (big ? 40 : 22) * u, weight: 600, color: '#fff', maxW: R * 1.6, alpha: .8 });
        if (rem <= 0 && big) F.text('시간이 다 되었습니다', x, y + 330 * u, { size: 56 * u, weight: 700, color: '#FF7B76' });
      }
    },
    /* 18. 알림 띄우기 */
    {
      id: 'alert', group: '진행', icon: '🔔', name: '알림 — 「5분 남았습니다」', dur: 5,
      desc: '오른쪽 아래에 작은 알림이 들어왔다 나갑니다. 배경 「투명」 GIF로 받아 발표 화면·영상 위에 얹기.',
      fields: [
        { k: 'text', label: '알림 글', def: '발표 시간 5분 남았습니다', max: 30 },
        { k: 'sub', label: '작은 글(선택)', def: '마무리 부탁드립니다', max: 30 },
        { k: 'icon', label: '아이콘(이모지)', def: '⏰', max: 2 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u; F.bg(p, t, null, { plain: true });
        var gin = E.back(seg(t, 0, .6)), gout = E.in(seg(t, 4.3, .6)), bw = Math.min(W * .5, 760 * u), bh = 150 * u, x = W - 60 * u - bw + (1 - gin) * (bw + 80 * u) + gout * (bw + 80 * u), y = H - 60 * u - bh;
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 24 * u; ctx.fillStyle = '#fff'; F.rr(x, y, bw, bh, 24 * u); ctx.fill(); ctx.restore();
        ctx.fillStyle = p._c1; F.rr(x, y, 14 * u, bh, 7 * u); ctx.fill();
        emoji(ctx, p.icon || '🔔', x + 80 * u, y + bh / 2, 64 * u);
        F.text(p.text, x + 150 * u, y + (p.sub ? 55 : 75) * u, { size: 44 * u, weight: 800, color: '#1A2B50', align: 'left', maxW: bw - 190 * u });
        F.text(p.sub, x + 150 * u, y + 105 * u, { size: 30 * u, weight: 500, color: '#5B6885', align: 'left', maxW: bw - 190 * u });
      }
    },
    /* 19. 질문 받기 */
    {
      id: 'ask', group: '진행', icon: '🙋', name: '질문 받기 — QR·손 들기', dur: 7,
      desc: '「질문 있으신가요?」 + 질문 폼 QR(선택) + 손 든 아이콘. 발표 끝 질의응답.',
      fields: [
        { k: 'title', label: '큰 글', def: '질문 있으신가요?', max: 24 },
        { k: 'sub', label: '작은 글', def: '손을 들어 주시거나 QR로 남겨 주세요', max: 50 },
        { k: 'url', label: 'QR 주소(선택)', type: 'url', def: '', ph: 'https://forms.gle/…', max: 300 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, hasQ = !!(p.url && p.url.trim() && window.qrcode), tall = H > W * 1.1;
        F.bg(p, t);
        var tx = hasQ && !tall ? W * .36 : cx, maxW = hasQ && !tall ? W * .56 : W * .86;
        var wob = Math.sin(t * 4) * 12; ctx.save(); ctx.translate(tx, tall ? H * .2 : H * .28); ctx.rotate(wob * Math.PI / 180); emoji(ctx, '🙋', 0, 0, 170 * u); ctx.restore();
        F.para(p.title, tx, tall ? H * .4 : H * .52, { size: 104 * u, weight: 900, color: p._tx, maxW: maxW, maxLines: 2, alpha: seg(t, .2, .6) });
        F.para(p.sub, tx, tall ? H * .52 : H * .68, { size: 46 * u, weight: 500, color: p._tx, maxW: maxW, maxLines: 2, alpha: seg(t, .7, .6) * .9 });
        if (hasQ) { try { var q = window.qrcode(0, 'M'); q.addData(p.url.trim()); q.make(); var cnt = q.getModuleCount(), qs = (tall ? 500 : 440) * u, pad = 26 * u, cell = (qs - pad * 2) / cnt, qx = tall ? cx : W * .75, qy = tall ? H * .76 : F.cy, g = E.back(seg(t, 1, .8)); ctx.save(); ctx.translate(qx, qy); ctx.scale(Math.max(.01, g), Math.max(.01, g)); ctx.translate(-qs / 2, -qs / 2); ctx.fillStyle = '#fff'; F.rr(0, 0, qs, qs, 24 * u); ctx.fill(); ctx.fillStyle = '#1A2B50'; for (var r = 0; r < cnt; r++) for (var c = 0; c < cnt; c++) if (q.isDark(r, c)) ctx.fillRect(pad + c * cell, pad + r * cell, cell + .5, cell + .5); ctx.restore(); } catch (e) { } }
      }
    },
    /* 20. 퀴즈 정답 공개 */
    {
      id: 'quiz', group: '진행', icon: '❓', name: '퀴즈 — 보기 보여 주고 정답 공개',
      desc: '문제와 보기(2~4개)가 뜨고, 두구두구 뒤 정답이 반짝입니다. 전체화면에서는 스페이스를 눌러야 정답이 열립니다(생각할 시간).',
      fields: [
        { k: 'q', label: '문제', def: '「보고서_최종_진짜최종」 다음 파일 이름은?', max: 80 },
        { k: 'opts', label: '보기(한 줄에 하나, 4개까지)', type: 'lines', def: '보고서_끝\n보고서_최최종\n보고서_부장님확인\n보고서_20261125', max: 4 },
        { k: 'ans', label: '정답 번호', type: 'number', def: 4, min: 1, max: 4 },
        { k: 'think', label: '생각할 시간(초, 파일로 받을 때)', type: 'number', def: 5, min: 2, max: 30 }
      ],
      segs: function (p) {
        var os = lines(p.opts, 4), ans = clamp(parseInt(p.ans, 10) || 1, 1, os.length) - 1, th = +p.think || 5;
        function board(ctx, tt, p, F, reveal, drum) {
          var W = F.W, H = F.H, u = F.u, cx = F.cx; F.bg(p, tt);
          F.para(p.q, cx, H * .2, { size: 64 * u, weight: 800, color: p._tx, maxW: W * .88, maxLines: 3, alpha: seg(tt, 0, .5) });
          var n = os.length, top = H * .38, gap = Math.min((H * .56) / n, 140 * u), boxW = Math.min(W * .78, 1200 * u);
          os.forEach(function (o, i) {
            var y = top + gap * i + gap / 2, a = reveal ? 1 : E.out(seg(tt, .6 + i * .25, .5)), hit = reveal && i === ans, dim = reveal && !hit;
            var jig = drum ? Math.sin(tt * 25 + i) * 6 * u : 0;
            ctx.save(); ctx.globalAlpha = a * (dim ? .35 : 1); ctx.translate(jig, 0);
            var sc = hit ? 1 + .06 * Math.abs(Math.sin(tt * 5)) : 1; ctx.translate(cx, y); ctx.scale(sc, sc);
            ctx.fillStyle = hit ? '#1F9D5C' : F.card(p); F.rr(-boxW / 2, -gap * .4, boxW, gap * .8, 20 * u); ctx.fill();
            F.circle(-boxW / 2 + gap * .4, 0, gap * .27, hit ? '#fff' : p._c1); F.text(hit ? '✓' : String(i + 1), -boxW / 2 + gap * .4, 2 * u, { size: gap * .3, weight: 800, color: hit ? '#1F9D5C' : '#fff' });
            F.text(o, -boxW / 2 + gap * .8, 0, { size: Math.min(50 * u, gap * .4), weight: 700, color: hit ? '#fff' : p._tx, align: 'left', maxW: boxW - gap * 1.0 });
            ctx.restore();
          });
          if (drum) F.text('정답은…', cx, H * .95, { size: 40 * u, weight: 700, color: p._tx, alpha: .5 + .5 * Math.sin(tt * 8) });
          if (reveal) F.text('정답: ' + (ans + 1) + '번', cx, H * .95, { size: 44 * u, weight: 800, color: '#5CCB8F', alpha: seg(tt, 0, .4) });
        }
        return [
          { d: 1.5 + os.length * .25 + th, draw: function (ctx, tt, p, F) { board(ctx, tt, p, F, false, false); } },
          { d: 1.5, draw: function (ctx, tt, p, F) { board(ctx, tt + 5, p, F, false, true); } },
          { d: 4, draw: function (ctx, tt, p, F) { board(ctx, tt, p, F, true, false); if (tt < 3) confetti(ctx, F, tt, p, 6, 60); } }
        ];
      },
      dur: function (p) { return stepsDur(this.segs(p)); }, marks: function (p) { var m = stepsMarks(this.segs(p)); return [m[0]]; },
      draw: function (ctx, t, p, F) { drawSteps(this.segs(p), ctx, t, p, F); }
    },
    /* 21. 식사 안내 */
    {
      id: 'meal', group: '진행', icon: '🍱', name: '점심·식사 안내', dur: 8,
      desc: '시간·장소·메뉴·돌아올 시간이 차례로. 교육 중 점심시간, 다과 안내.',
      fields: [
        { k: 'title', label: '제목', def: '점심시간 안내', max: 20 },
        { k: 'time', label: '시간', def: '12:00 ~ 13:00', max: 30 },
        { k: 'place', label: '장소', def: '1층 구내식당 (식권은 안내 데스크)', max: 40 },
        { k: 'menu', label: '메뉴(선택, 한 줄에 하나)', type: 'lines', def: '제육볶음 · 된장국 · 나물 반찬', max: 3 },
        { k: 'back', label: '돌아올 시간 글', def: '13:00까지 자리로 돌아와 주세요', max: 40 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx; F.bg(p, t, p._c2);
        var sway = Math.sin(t * 2) * 6; ctx.save(); ctx.translate(cx, H * .17); ctx.rotate(sway * Math.PI / 180); emoji(ctx, '🍱', 0, 0, 120 * u); ctx.restore();
        F.text(p.title, cx, H * .34, { size: 84 * u, weight: 900, color: p._tx, maxW: W * .9, alpha: seg(t, .2, .5) });
        var rows = [['🕛', p.time, .6], ['📍', p.place, 1.0]].concat(lines(p.menu, 3).map(function (m, i) { return ['🍽️', m, 1.4 + i * .3]; }));
        rows.forEach(function (r, i) { var a = E.out(seg(t, r[2], .5)), y = H * .47 + i * 110 * u; ctx.save(); ctx.globalAlpha = a; ctx.translate((1 - a) * -40 * u, 0); emoji(ctx, r[0], cx - W * .3, y, 54 * u); F.text(r[1], cx - W * .3 + 60 * u, y, { size: 50 * u, weight: i < 2 ? 800 : 500, color: p._tx, align: 'left', maxW: W * .62 }); ctx.restore(); });
        var a2 = seg(t, 2.6, .6); ctx.save(); ctx.globalAlpha = a2; ctx.fillStyle = p._c1; F.rr(cx - W * .35, H * .86, W * .7, 90 * u, 45 * u); ctx.fill(); ctx.restore();
        F.text(p.back, cx, H * .86 + 45 * u, { size: 42 * u, weight: 700, color: '#fff', maxW: W * .64, alpha: a2 });
      }
    },
    /* 22. 사진 촬영 */
    {
      id: 'shot', group: '진행', icon: '📸', name: '단체 사진 촬영 — 3·2·1 찰칵', dur: 9,
      desc: '「단체 사진 촬영이 있겠습니다」 → 자리 안내 → 3·2·1 → 찰칵(흰 섬광). 전체화면에서는 스페이스로 카운트 시작.',
      fields: [
        { k: 'title', label: '안내 글', def: '단체 사진 촬영이 있겠습니다', max: 30 },
        { k: 'sub', label: '자리 안내(선택)', def: '앞줄은 앉고, 뒷줄은 서 주세요. 카메라를 봐 주세요!', max: 60 },
        { k: 'end', label: '찍은 뒤 글', def: '감사합니다 😊', max: 20 }
      ],
      marks: function () { return [4]; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy; F.bg(p, t);
        if (t < 4) {
          emoji(ctx, '📸', cx, H * .25, 150 * u);
          F.text(p.title, cx, H * .5, { size: 90 * u, weight: 900, color: p._tx, maxW: W * .9, alpha: seg(t, .2, .5) });
          F.para(p.sub, cx, H * .68, { size: 46 * u, weight: 500, color: p._tx, maxW: W * .85, maxLines: 2, alpha: seg(t, .8, .5) * .9 });
        } else if (t < 7) {
          var i = Math.floor(t - 4), f = t - 4 - i, num = 3 - i, sc = 1 + (1 - E.out(clamp(f * 2.5, 0, 1))) * .4;
          ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); F.text(String(num), 0, 0, { size: 400 * u, weight: 900, color: p._tx, alpha: f < .85 ? 1 : 1 - (f - .85) / .15 }); ctx.restore();
          F.text('카메라를 봐 주세요', cx, H * .85, { size: 50 * u, weight: 600, color: p._tx, alpha: .8 });
        } else {
          var fl = 1 - seg(t, 7, .7); ctx.fillStyle = 'rgba(255,255,255,' + fl + ')'; ctx.fillRect(0, 0, W, H);
          F.text('찰칵!', cx, cy - 40 * u, { size: 160 * u, weight: 900, color: p._tx, alpha: seg(t, 7.2, .3) });
          F.text(p.end, cx, cy + 130 * u, { size: 60 * u, weight: 600, color: p._tx, alpha: seg(t, 7.6, .4) });
        }
      }
    },
    /* 23. 경품 추첨 */
    {
      id: 'draw', group: '진행', icon: '🎁', name: '경품 추첨 — 돌다가 당첨 번호에 멈춤',
      desc: '번호(또는 이름 목록)가 빠르게 돌다가 입력한 당첨 번호·이름에 멈추고 축하합니다. 실제 추첨은 따로 하고 화면 연출용입니다. 전체화면에서는 스페이스로 멈춤 시작.',
      fields: [
        { k: 'title', label: '제목', def: '행운권 추첨', max: 20 },
        { k: 'mode', label: '무엇을 돌릴까', type: 'select', def: 'n', opts: [['n', '번호 (1~N)'], ['l', '이름 목록']] },
        { k: 'max', label: '번호 범위 N(번호일 때)', type: 'number', def: 120, min: 2, max: 9999 },
        { k: 'names', label: '이름 목록(이름일 때, 한 줄에 하나)', type: 'lines', def: '김○○\n이○○\n박○○\n최○○\n정○○\n강○○', max: 60 },
        { k: 'win', label: '당첨 번호 또는 이름', def: '37', max: 20 },
        { k: 'prize', label: '경품(선택)', def: '커피 쿠폰', max: 20 }
      ],
      dur: 11, marks: function () { return [3]; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, cy = F.cy; F.bg(p, t, p._c2);
        var pool = p.mode === 'l' ? lines(p.names, 60) : null, N = Math.max(2, parseInt(p.max, 10) || 100), r = rnd(99);
        F.text(p.title, cx, H * .14, { size: 76 * u, weight: 800, color: p._tx, maxW: W * .9 });
        if (p.prize) F.text('🎁 ' + p.prize, cx, H * .25, { size: 44 * u, weight: 600, color: p._tx, maxW: W * .8, alpha: .85 });
        var spin = t < 3 ? 1 : clamp(1 - (t - 3) / 4, 0, 1), done = t >= 7;
        var txt;
        if (done) txt = p.win;
        else { var speed = 2 + 38 * spin * spin, idx = Math.floor(t * speed * 7 + r() * 100); txt = pool ? pool[idx % pool.length] : String(1 + (idx * 37) % N); }
        var g = done ? E.back(seg(t, 7, .6)) : 1;
        ctx.save(); ctx.translate(cx, cy + 40 * u); ctx.scale(g, g); ctx.fillStyle = done ? '#F2B705' : F.card(p); F.rr(-W * .3, -150 * u, W * .6, 300 * u, 40 * u); ctx.fill();
        F.text(txt, 0, 0, { size: pool ? 150 * u : 220 * u, weight: 900, color: done ? '#1A2B50' : p._tx, maxW: W * .54 }); ctx.restore();
        if (t < 3) F.text('두구두구…', cx, H * .85, { size: 48 * u, weight: 700, color: p._tx, alpha: .5 + .5 * Math.sin(t * 8) });
        else if (!done) F.text('멈춥니다…', cx, H * .85, { size: 48 * u, weight: 700, color: p._tx, alpha: .8 });
        if (done) { confetti(ctx, F, t - 7, p, 6, 120); F.text('축하합니다! 🎉', cx, H * .85, { size: 70 * u, weight: 900, color: p._tx, alpha: seg(t, 7.3, .4) }); }
      }
    }
  ]);
})();
