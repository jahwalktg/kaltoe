/* 즉석 모션그래픽 — 장면: 의식·개회 (2차) 국민의례·애국가·묵념·내빈 소개·대기 화면·안전 안내 */
(function () {
  var E = MG.E, seg = MG.seg, lerp = MG.lerp, clamp = MG.clamp, rnd = MG.rnd, lines = MG.lines, hexA = MG.hexA;

  /* 태극기 — 대한민국국기법 시행령 규격(가로:세로 3:2, 태극 지름 = 세로 1/2, 괘 길이 = 지름 1/2, 효 두께 = 지름 1/12, 효 사이 = 지름 1/24, 태극과 괘 사이 = 세로 1/8). 공공 도안을 직접 그림. */
  function flag(ctx, x, y, w, alpha) {
    var h = w * 2 / 3, cx = x + w / 2, cy = y + h / 2, r = h / 4;
    ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h);
    var ang = Math.atan2(h, w);               // 대각선 각도(왼쪽 위 → 오른쪽 아래)
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    // 위(빨강) 반원 + 왼쪽 작은 원, 아래(파랑) 반원 + 오른쪽 작은 원
    ctx.fillStyle = '#CD2E3A'; ctx.beginPath(); ctx.arc(0, 0, r, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0047A0'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#CD2E3A'; ctx.beginPath(); ctx.arc(-r / 2, 0, r / 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0047A0'; ctx.beginPath(); ctx.arc(r / 2, 0, r / 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // 괘: 건(왼쪽 위, 3 이어짐) 곤(오른쪽 아래, 3 끊어짐) 감(오른쪽 위, 끊·이음·끊) 리(왼쪽 아래, 이음·끊·이음)
    var L = r, th = h / 24, gap = h / 48, start = r + h / 8, kw = [[1, 1, 1], [0, 0, 0], [0, 1, 0], [1, 0, 1]], pos = [[-1, -1], [1, 1], [1, -1], [-1, 1]];
    ctx.fillStyle = '#000';
    for (var k = 0; k < 4; k++) {
      var a = Math.atan2(pos[k][1] * h, pos[k][0] * w);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
      for (var b = 0; b < 3; b++) {
        var d = start + b * (th + gap);
        if (kw[k][b]) ctx.fillRect(d, -L / 2, th, L);
        else { ctx.fillRect(d, -L / 2, th, L / 2 - gap / 2); ctx.fillRect(d, gap / 2, th, L / 2 - gap / 2); }
      }
      ctx.restore();
    }
    ctx.restore();
  }
  var PLEDGE = '나는 자랑스러운 태극기 앞에 자유롭고 정의로운 대한민국의 무궁한 영광을 위하여 충성을 다할 것을 굳게 다짐합니다.';
  var ANTHEM = [
    ['동해물과 백두산이 마르고 닳도록', '하느님이 보우하사 우리나라 만세'],
    ['남산 위에 저 소나무 철갑을 두른 듯', '바람서리 불변함은 우리 기상일세'],
    ['가을 하늘 공활한데 높고 구름 없이', '밝은 달은 우리 가슴 일편단심일세'],
    ['이 기상과 이 맘으로 충성을 다하여', '괴로우나 즐거우나 나라 사랑하세']
  ], CHORUS = ['무궁화 삼천리 화려강산', '대한사람 대한으로 길이 보전하세'];

  // 공통: 단계 목록으로 그리는 장면 만들기 — segs(p) → [{d: 초, draw(ctx, tt, p, F)}]
  function stepsDur(segs) { return segs.reduce(function (a, s) { return a + s.d; }, 0); }
  function stepsMarks(segs) { var t = 0, m = []; segs.forEach(function (s, i) { if (i) m.push(t); t += s.d; }); return m; }
  function drawSteps(segs, ctx, t, p, F) { var acc = 0; for (var i = 0; i < segs.length; i++) { if (t < acc + segs[i].d || i === segs.length - 1) { segs[i].draw(ctx, Math.min(t - acc, segs[i].d), p, F); return; } acc += segs[i].d; } }
  function bgFlag(ctx, p, F, t) { F.bg(p, t || 0, null, { plain: true }); }
  function centerFlag(ctx, F, t, scale, alpha) { var W = F.W, H = F.H, u = F.u, band = H * .58, fw = Math.min(W * .62, band * 1.5) * (scale || 1), fh = fw * 2 / 3; flag(ctx, F.cx - fw / 2, H * .08 + (band - fh) / 2, fw, alpha); }   // 태극기는 위쪽 띠(8%~66%) 안에만 — 아래 글(74%·80%·88%)과 안 겹치게

  MG.add([
    /* 3. 국민의례 */
    {
      id: 'rite', group: '의식·개회', icon: '🇰🇷', name: '국민의례 — 기립·국기에 대한 경례·착석',
      desc: '「국민의례가 있겠습니다」 → 「국기에 대하여 경례」(태극기 + 맹세문) → 「바로」 → 착석. 애국가·묵념까지 넣을 수도 있습니다. 전체화면에서는 단계마다 멈추고 스페이스로 넘어갑니다(사회자 속도에 맞춤).',
      fields: [
        { k: 'incl', label: '넣을 순서', type: 'select', def: 'a', opts: [['a', '국기에 대한 경례만'], ['b', '경례 + 애국가(1절 가사)'], ['c', '경례 + 애국가 + 묵념'], ['d', '경례 + 묵념']] },
        { k: 'standSec', label: '「일어나 주십시오」 머무는 초', type: 'number', def: 4, min: 2, max: 20 },
        { k: 'pledge', label: '맹세문 자막', type: 'select', def: 'y', opts: [['y', '맹세문 자막을 천천히 보여 줌(약 14초)'], ['n', '맹세문 없이 태극기만(8초)']] },
        { k: 'lineSec', label: '애국가 한 줄 머무는 초', type: 'number', def: 6, min: 3, max: 12 },
        { k: 'silSec', label: '묵념 초', type: 'number', def: 10, min: 5, max: 60 },
        { k: 'silText', label: '묵념 대상 글', def: '순국선열 및 호국영령에 대한 묵념', max: 40 },
        { k: 'aud1', label: '국기에 대한 경례 음원(선택)', type: 'audio', builtin: [['', '없음(화면만, 현장 음향 사용)'], ['audio/salute_pledge.m4a', '기본: 해군군악대 연주 + 맹세문 낭독 (공유마당 기증저작물)'], ['audio/salute_bgm.m4a', '기본: 연주만 (맹세문은 사회자가 낭독)']] },
        { k: 'aud2', label: '애국가 음원(선택, 애국가를 넣을 때)', type: 'audio', builtin: [['', '없음(화면만)'], ['audio/anthem_1.m4a', '기본: 2018 애국가 합창 1절 (공유마당 기증저작물)'], ['audio/anthem_1to4.m4a', '기본: 2018 애국가 합창 1~4절']] }
      ],
      audioCues: function (p) { var st = +p.standSec || 4, pd = this.pledgeSec(p), c = [{ k: 'aud1', at: st }]; if (p.incl === 'b' || p.incl === 'c') c.push({ k: 'aud2', at: st + pd + 3 + 3 }); return c; },
      pledgeSec: function (p) { var a = p._aud && p._aud.aud1; return a ? Math.max(6, a.duration) : (p.pledge === 'y' ? 14 : 8); },
      segs: function (p) {
        var S = [], u, self = this;
        S.push({ d: +p.standSec || 4, draw: function (ctx, tt, p, F) { bgFlag(ctx, p, F); centerFlag(ctx, F, tt, .8, seg(tt, 0, .8)); F.para('국민의례가 있겠습니다.\n모두 자리에서 일어나 주시기 바랍니다.', F.cx, F.H * .83, { size: 62 * F.u, weight: 700, color: p._tx, maxW: F.W * .9, maxLines: 2, alpha: seg(tt, .3, .6) }); } });
        var pd = self.pledgeSec(p), a2 = p._aud && p._aud.aud2;
        S.push({ d: pd, draw: function (ctx, tt, p, F) { bgFlag(ctx, p, F); centerFlag(ctx, F, tt, 1, 1); F.text('국기에 대하여 경례', F.cx, F.H * .74, { size: 76 * F.u, weight: 800, color: p._tx, maxW: F.W * .9, alpha: seg(tt, 0, .5) }); if (p.pledge === 'y') { var hasA = !!(p._aud && p._aud.aud1), n = Math.floor(seg(tt, pd * (hasA ? .36 : .12), pd * (hasA ? .26 : .62)) * PLEDGE.length); /* 기본 음원(44초)은 약 17~26초에 낭독 → 그 구간에 자막이 흐름 */ F.para(PLEDGE.slice(0, n), F.cx, F.H * .88, { size: 44 * F.u, weight: 500, color: p._tx, maxW: F.W * .9, maxLines: 2, alpha: .95 }); } } });
        S.push({ d: 3, draw: function (ctx, tt, p, F) { bgFlag(ctx, p, F); centerFlag(ctx, F, tt, 1, 1); F.text('바로', F.cx, F.H * .8, { size: 90 * F.u, weight: 900, color: p._tx, alpha: seg(tt, 0, .4) }); } });
        if (p.incl === 'b' || p.incl === 'c') {
          var ln = ANTHEM[0].concat(CHORUS), ls = a2 ? Math.max(2, a2.duration / ln.length) : (+p.lineSec || 6);
          S.push({ d: 3, draw: function (ctx, tt, p, F) { bgFlag(ctx, p, F); centerFlag(ctx, F, tt, .8, 1); F.text('애국가 제창', F.cx, F.H * .8, { size: 80 * F.u, weight: 800, color: p._tx, alpha: seg(tt, 0, .5) }); } });
          ln.forEach(function (line, i) { S.push({ d: ls, draw: function (ctx, tt, p, F) { bgFlag(ctx, p, F); centerFlag(ctx, F, tt, .62, 1); F.text(line, F.cx, F.H * .78, { size: 84 * F.u, weight: 800, color: p._tx, maxW: F.W * .92, alpha: seg(tt, 0, .5) }); F.text('애국가 1절 · ' + (i + 1) + '/4', F.cx, F.H * .92, { size: 34 * F.u, weight: 500, color: p._tx, alpha: .6 }); } }); });
        }
        if (p.incl === 'c' || p.incl === 'd') {
          var ss = +p.silSec || 10;
          S.push({ d: 3, draw: function (ctx, tt, p, F) { bgFlag(ctx, p, F); F.para(p.silText, F.cx, F.cy - 40 * F.u, { size: 72 * F.u, weight: 800, color: p._tx, maxW: F.W * .9, maxLines: 2, alpha: seg(tt, 0, .5) }); F.text('묵념', F.cx, F.cy + 120 * F.u, { size: 60 * F.u, weight: 600, color: p._tx, alpha: seg(tt, 1, .5) }); } });
          S.push({ d: ss, draw: function (ctx, tt, p, F) { bgFlag(ctx, p, F); var a = .5 + .5 * Math.sin(tt * 1.2); ctx.save(); ctx.globalAlpha = .25 + .2 * a; F.circle(F.cx, F.cy, (200 + 20 * a) * F.u, p._c1); ctx.restore(); F.text('묵념', F.cx, F.cy, { size: 120 * F.u, weight: 900, color: p._tx }); } });
          S.push({ d: 3, draw: function (ctx, tt, p, F) { bgFlag(ctx, p, F); F.text('바로', F.cx, F.cy, { size: 120 * F.u, weight: 900, color: p._tx, alpha: seg(tt, 0, .4) }); } });
        }
        S.push({ d: 4, draw: function (ctx, tt, p, F) { bgFlag(ctx, p, F); centerFlag(ctx, F, tt, .8, 1); F.para('자리에 앉아 주시기 바랍니다.', F.cx, F.H * .83, { size: 62 * F.u, weight: 700, color: p._tx, maxW: F.W * .9, maxLines: 2, alpha: seg(tt, 0, .5) }); } });
        return S;
      },
      dur: function (p) { return stepsDur(this.segs(p)); }, marks: function (p) { return stepsMarks(this.segs(p)); },
      draw: function (ctx, t, p, F) { drawSteps(this.segs(p), ctx, t, p, F); }
    },
    /* 4. 애국가 가사 자막 */
    {
      id: 'anthem', group: '의식·개회', icon: '🎵', name: '애국가 가사 자막',
      desc: '태극기 배경에 애국가 가사가 한 줄씩. 음원을 고르면 가사가 음원 길이에 맞춰 넘어가고 소리가 함께 들어갑니다(전체화면·MP4). 음원 없이는 현장 반주에 맞춰 스페이스로 넘기거나 줄마다 N초로 자동. 1절만 / 1·4절 / 1~4절.',
      fields: [
        { k: 'v', label: '절', type: 'select', def: '1', opts: [['1', '1절'], ['14', '1절·4절'], ['1234', '1~4절']] },
        { k: 'lineSec', label: '한 줄 머무는 초', type: 'number', def: 6, min: 3, max: 12 },
        { k: 'intro', label: '처음 안내 글', def: '애국가 제창', max: 20 },
        { k: 'aud', label: '애국가 음원(선택)', type: 'audio', builtin: [['', '없음(화면만, 현장 반주)'], ['audio/anthem_1.m4a', '기본: 2018 애국가 합창 1절 (공유마당 기증저작물)'], ['audio/anthem_1to4.m4a', '기본: 2018 애국가 합창 1~4절']] }
      ],
      audioCues: function (p) { return [{ k: 'aud', at: 3 }]; },
      segs: function (p) {
        var vs = String(p.v || '1').split('').map(Number), S = [], a = p._aud && p._aud.aud, nL = vs.reduce(function (t, v) { return t + ANTHEM[v - 1].length + CHORUS.length; }, 0), ls = a ? Math.max(2, a.duration / nL) : (+p.lineSec || 6);
        S.push({ d: 3, draw: function (ctx, tt, p, F) { bgFlag(ctx, p, F); centerFlag(ctx, F, tt, .8, seg(tt, 0, .6)); F.text(p.intro, F.cx, F.H * .8, { size: 80 * F.u, weight: 800, color: p._tx, maxW: F.W * .9, alpha: seg(tt, .3, .5) }); } });
        vs.forEach(function (v) { var ln = ANTHEM[v - 1].concat(CHORUS); ln.forEach(function (line, i) { S.push({ d: ls, draw: function (ctx, tt, p, F) { bgFlag(ctx, p, F); centerFlag(ctx, F, tt, .62, 1); F.text(line, F.cx, F.H * .78, { size: 84 * F.u, weight: 800, color: p._tx, maxW: F.W * .92, alpha: seg(tt, 0, .5) }); F.text(v + '절 · ' + (i + 1) + '/4', F.cx, F.H * .92, { size: 34 * F.u, weight: 500, color: p._tx, alpha: .6 }); } }); }); });
        return S;
      },
      dur: function (p) { return stepsDur(this.segs(p)); }, marks: function (p) { return stepsMarks(this.segs(p)); },
      draw: function (ctx, t, p, F) { drawSteps(this.segs(p), ctx, t, p, F); }
    },
    /* 5. 묵념 */
    {
      id: 'silence', group: '의식·개회', icon: '🕯️', name: '묵념',
      desc: '「○○에 대한 묵념」 → 조용한 N초 → 「바로」. 추모·기념식.',
      fields: [
        { k: 'text', label: '묵념 대상', def: '순국선열 및 호국영령에 대한 묵념', max: 40 },
        { k: 'sec', label: '묵념 초', type: 'number', def: 10, min: 5, max: 60 },
        { k: 'end', label: '끝 글', def: '바로', max: 10 }
      ],
      segs: function (p) {
        return [
          { d: 3, draw: function (ctx, tt, p, F) { bgFlag(ctx, p, F); F.para(p.text, F.cx, F.cy - 40 * F.u, { size: 72 * F.u, weight: 800, color: p._tx, maxW: F.W * .9, maxLines: 2, alpha: seg(tt, 0, .5) }); F.text('묵념', F.cx, F.cy + 130 * F.u, { size: 60 * F.u, weight: 600, color: p._tx, alpha: seg(tt, 1, .5) }); } },
          { d: +p.sec || 10, draw: function (ctx, tt, p, F) { bgFlag(ctx, p, F); var a = .5 + .5 * Math.sin(tt * 1.2); ctx.save(); ctx.globalAlpha = .2 + .2 * a; F.circle(F.cx, F.cy, (220 + 24 * a) * F.u, p._c1); ctx.restore(); F.text('묵념', F.cx, F.cy, { size: 130 * F.u, weight: 900, color: p._tx }); } },
          { d: 3, draw: function (ctx, tt, p, F) { bgFlag(ctx, p, F); F.text(p.end, F.cx, F.cy, { size: 130 * F.u, weight: 900, color: p._tx, alpha: seg(tt, 0, .4) }); } }
        ];
      },
      dur: function (p) { return stepsDur(this.segs(p)); }, marks: function (p) { return stepsMarks(this.segs(p)); },
      draw: function (ctx, t, p, F) { drawSteps(this.segs(p), ctx, t, p, F); }
    },
    /* 6. 내빈 소개 */
    {
      id: 'guests', group: '의식·개회', icon: '🤝', name: '내빈 소개 — 한 분씩',
      desc: '「내빈 소개」 뒤 이름·직함이 한 분씩 카드로 뜹니다(12명까지). 전체화면에서는 스페이스로 다음 분.',
      fields: [
        { k: 'title', label: '제목', def: '내빈 소개', max: 20 },
        { k: 'items', label: '내빈(한 줄에 「이름 | 직함·소속」, 12명까지)', type: 'lines', def: '김○○ | 뚝딱물산 이사\n이○○ | 정시기획 대표\n박○○ | 칼퇴상사 대표', max: 12 },
        { k: 'each', label: '한 분 머무는 초', type: 'number', def: 3, min: 2, max: 10 },
        { k: 'counter', label: '위쪽 작은 글', type: 'select', def: 'y', opts: [['y', '제목 + 숫자 (내빈 소개 · 3/12)'], ['t', '제목만 (내빈 소개)'], ['n', '숫자만 (3/12)'], ['x', '없음']] }
      ],
      segs: function (p) {
        var S = [], its = lines(p.items, 12), e = +p.each || 3;
        S.push({ d: 2.5, draw: function (ctx, tt, p, F) { F.bg(p, tt); F.text(p.title, F.cx, F.cy, { size: 110 * F.u, weight: 900, color: p._tx, maxW: F.W * .9, alpha: seg(tt, 0, .5) }); } });
        its.forEach(function (l, i) { var a = l.split('|').map(function (x) { return x.trim(); }); S.push({ d: e, draw: function (ctx, tt, p, F) { var W = F.W, H = F.H, u = F.u; F.bg(p, tt, null, { deco: false }); var hd = p.counter === 'x' ? '' : p.counter === 't' ? p.title : p.counter === 'n' ? (i + 1) + '/' + its.length : p.title + ' · ' + (i + 1) + '/' + its.length; F.text(hd, F.cx, H * .14, { size: 40 * u, weight: 600, color: p._tx, alpha: .7 }); var g = E.back(seg(tt, 0, .7)); ctx.save(); ctx.translate(F.cx, F.cy); ctx.scale(Math.max(.01, g), Math.max(.01, g)); F.panel(-W * .36, -170 * u, W * .72, 340 * u, 30 * u, p); ctx.fillStyle = p._c2; F.rr(-60 * u, -170 * u, 120 * u, 10 * u, 5 * u); ctx.fill(); ctx.restore(); F.text(a[0] || '', F.cx, F.cy - 40 * u, { size: 130 * u, weight: 900, color: p._tx, maxW: W * .66, alpha: seg(tt, .3, .4) }); F.text(a[1] || '', F.cx, F.cy + 95 * u, { size: 50 * u, weight: 500, color: p._tx, maxW: W * .66, alpha: seg(tt, .5, .4) * .9 }); } }); });
        return S;
      },
      dur: function (p) { return stepsDur(this.segs(p)); }, marks: function (p) { return stepsMarks(this.segs(p)); },
      draw: function (ctx, t, p, F) { drawSteps(this.segs(p), ctx, t, p, F); }
    },
    /* 9. 대기·환영 화면 */
    {
      id: 'wait', group: '의식·개회', icon: '🪧', name: '대기·환영 화면(반복)', dur: 12, loop: true,
      desc: '행사 전 빔에 띄워 두는 화면. 「○○에 오신 것을 환영합니다」 + 날짜·장소 + 로고가 천천히 숨 쉬듯 움직이고 끝과 처음이 이어집니다.',
      fields: [
        { k: 'title', label: '행사명', def: '2026년 성과보고회', max: 40 },
        { k: 'hello', label: '환영 글', def: '오신 것을 환영합니다', max: 30 },
        { k: 'info', label: '날짜·장소', def: '2026. 12. 12.(금) 14:00 · ○○구민회관 2층 대강당', max: 60 },
        { k: 'note', label: '아래 안내(선택)', def: '잠시 후 시작합니다. 휴대폰은 진동으로 바꿔 주세요.', max: 60 },
        { k: 'org', label: '회사 이름(로고 없을 때)', def: '칼퇴상사', max: 24 }
      ],
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, ph = (t / 12) * Math.PI * 2;
        F.bg(p, t, p._c1);
        ctx.save(); ctx.globalAlpha = .16; F.circle(W * .82 + Math.sin(ph) * 40 * u, H * .25 + Math.cos(ph) * 30 * u, 340 * u, p._c1); F.circle(W * .15 + Math.cos(ph) * 40 * u, H * .8 + Math.sin(ph) * 30 * u, 280 * u, p._c2); ctx.restore();
        var br = 1 + Math.sin(ph) * .03, lh = 220 * u;
        ctx.save(); ctx.translate(cx, H * .22); ctx.scale(br, br);
        if (!F.logo(p._logo, -lh * 1.2, -lh / 2, lh * 2.4, lh)) F.text(p.org, 0, 0, { size: 64 * u, weight: 800, color: p._tx, maxW: W * .8 });
        ctx.restore();
        F.para(p.title, cx, H * .47, { size: 104 * u, weight: 900, color: p._tx, maxW: W * .88, maxLines: 2 });
        F.text(p.hello, cx, H * .61, { size: 58 * u, weight: 600, color: p._tx, maxW: W * .8, alpha: .95 });
        ctx.save(); ctx.globalAlpha = .9; ctx.font = F.font(600, 40 * u); var tw = Math.min(W * .8, ctx.measureText(p.info).width + 70 * u); F.rr(cx - tw / 2, H * .7, tw, 80 * u, 40 * u); ctx.fillStyle = hexA(p._c1, .9); ctx.fill(); ctx.restore();
        F.text(p.info, cx, H * .7 + 40 * u, { size: 40 * u, weight: 600, color: '#fff', maxW: W * .76 });
        F.text(p.note, cx, H * .88, { size: 36 * u, weight: 500, color: p._tx, maxW: W * .86, alpha: .55 + .3 * Math.sin(ph * 2) });
      }
    },
    /* 10. 비상구·안전 안내 */
    {
      id: 'safety', group: '의식·개회', icon: '🚪', name: '행사 전 안전·예절 안내',
      desc: '비상구·화장실·휴대폰 진동·촬영 안내가 아이콘과 함께 차례로. 행사 시작 전 1분.',
      fields: [
        { k: 'title', label: '제목', def: '행사 전 안내 말씀', max: 30 },
        { k: 'items', label: '안내(한 줄에 「아이콘(이모지) | 글」, 5개까지)', type: 'lines', def: '🚪 | 비상구는 강당 양쪽 출입문입니다\n🚻 | 화장실은 복도 끝 왼쪽입니다\n📵 | 휴대폰은 진동으로 바꿔 주세요\n📸 | 행사 사진은 홍보에 쓰일 수 있습니다', max: 5 },
        { k: 'each', label: '하나 머무는 초', type: 'number', def: 3, min: 2, max: 8 }
      ],
      dur: function (p) { return 2 + lines(p.items, 5).length * (+p.each || 3) + 2; },
      draw: function (ctx, t, p, F) {
        var W = F.W, H = F.H, u = F.u, cx = F.cx, its = lines(p.items, 5).map(function (l) { var a = l.split('|'); return a.length > 1 ? [a[0].trim(), a.slice(1).join('|').trim()] : ['ℹ️', l.trim()]; }), e = +p.each || 3;
        F.bg(p, t, p._c2);
        F.text(p.title, cx, H * .14, { size: 76 * u, weight: 800, color: p._tx, maxW: W * .9, alpha: seg(t, 0, .5) });
        var tall = H > W * 1.1, n = its.length || 1, top = H * .26, gap = Math.min((H * .68) / n, 170 * u);
        its.forEach(function (it, i) {
          var st = 2 + i * e, g = E.out(seg(t, st, .6)); if (g <= 0) return;
          var y = top + gap * i + gap / 2, cur = t >= st && t < st + e;
          ctx.save(); ctx.globalAlpha = g; ctx.translate((1 - g) * 60 * u, 0);
          ctx.fillStyle = cur ? hexA(p._c1, .95) : F.card(p); F.rr(cx - W * .42, y - gap * .4, W * .84, gap * .8, 20 * u); ctx.fill();
          ctx.font = (gap * .5) + 'px "Segoe UI Emoji","Apple Color Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(it[0], cx - W * .42 + gap * .5, y + 4 * u);
          F.text(it[1], cx - W * .42 + gap * .95, y, { size: Math.min(52 * u, gap * .36), weight: 700, color: cur ? '#fff' : p._tx, align: 'left', maxW: W * .84 - gap * 1.1 });
          ctx.restore();
        });
      }
    }
  ]);
})();
