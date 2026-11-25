/* 전후 비교 · 로고 표시 · 크기별 맞춤 자르기 */
SD.tool({
  id: 'ba', title: '전후 비교 사진', icon: 'ba', group: 3, nocarry: true, when: '청소·집수리 전과 후를 나란히. 날짜·장소 표시',
  mount(root) {
    const L = { a: [], b: [] }; let st, cur = 0;
    const mk = (k, t) => { const list = SD.$('div', { class: 'grid' }), d = SD.drop({ mini: true, text: `${t} 사진을 넣으세요(여러 장)`, add: f => add(k, f) }); d.addEventListener('paste', () => { }); return [SD.$('div', {}, d, list), list]; };
    const [ea, la] = mk('a', '「전」'), [eb, lb] = mk('b', '「후」'); const top = SD.$('div', { class: 'two' }, ea, eb), panel = SD.$('div', { class: 'panel' }), cv = SD.$('canvas', { class: 'cv' }), msg = SD.$('p', { class: 'msg' }), nav = SD.$('div', { class: 'tbar' }), stage = SD.$('div', { class: 'stage' }, nav, cv, msg), body = SD.$('div', { class: 'bench', hidden: true }, stage, panel); body.style.gridTemplateColumns = innerWidth > 1000 ? 'minmax(0,1fr) 310px' : '';
    root.append(top, SD.$('p', {}, SD.$('button', { class: 'btn', textContent: '예시로 해 보기', onclick: async () => { L.a.push(await SD.photo(SD.demo.room(false), '전.png')); L.b.push(await SD.photo(SD.demo.room(true), '후.png')); upd(); } })), body);
    const add = async (k, fs) => { for (const f of fs) try { L[k].push(await SD.photo(f)); } catch (e) { SD.toast(e.message); } L[k].sort((p, q) => (p.meta.date || '').localeCompare(q.meta.date || '') || p.name.localeCompare(q.name, 'ko', { numeric: true })); upd(); };
    SD.cur = { add: fs => add(L.a.length <= L.b.length ? 'a' : 'b', fs) };
    const n = () => Math.min(L.a.length, L.b.length);
    const upd = () => {
      [['a', la], ['b', lb]].forEach(([k, el]) => el.replaceChildren(...L[k].map((p, i) => { const c = SD.copy(p.th), mv = d => () => { const j = i + d; if (j < 0 || j >= L[k].length) return;[L[k][i], L[k][j]] = [L[k][j], L[k][i]]; upd(); }; return SD.$('figure', {}, c, SD.$('figcaption', { textContent: `${i + 1}번 ${p.name}` }), SD.$('button', { class: 'btn s', textContent: '←', ariaLabel: '앞으로', onclick: mv(-1) }), SD.$('button', { class: 'btn s', textContent: '→', ariaLabel: '뒤로', onclick: mv(1) }), SD.$('button', { class: 'btn s', textContent: '빼기', onclick: () => { L[k].splice(i, 1); upd(); } })); })));
      const m = n(); body.hidden = !m; cur = SD.clamp(cur, 0, Math.max(0, m - 1)); nav.replaceChildren(...Array.from({ length: m }, (_, i) => SD.$('button', { class: 'btn s' + (i === cur ? ' p' : ''), textContent: `${i + 1}번 짝`, onclick: () => { cur = i; upd(); } })));
      msg.textContent = L.a.length !== L.b.length && m ? `전 ${L.a.length}장, 후 ${L.b.length}장 — 짝이 없는 사진은 빠집니다.` : '같은 번호끼리 짝이 됩니다. 순서는 ← →로 바꾸세요.'; draw();
    };
    const pair = (pa, pb, A, Bc, W) => {
      const [rw, rh] = st.ratio.split(':').map(Number), ver = st.dir === 'v', g = st.gap * W / 1000, pad = st.frame ? W * .02 : 0, cw = ver ? W - 2 * pad : (W - 2 * pad - g) / 2, ch = cw * rh / rw, hd = st.title.trim() ? W * .062 : 0, info = [st.place.trim(), st.date].filter(Boolean).join('  ·  '), ft = info ? W * .045 : 0, f = SD.cv(W, 2 * pad + hd + ft + (ver ? ch * 2 + g : ch)), x = SD.x(f); x.imageSmoothingQuality = 'high'; x.fillStyle = st.bg; x.fillRect(0, 0, f.width, f.height);
      const fam = 'Pretendard,"Malgun Gothic",sans-serif', dk = parseInt(st.bg.slice(1, 3), 16) * .3 + parseInt(st.bg.slice(3, 5), 16) * .59 + parseInt(st.bg.slice(5, 7), 16) * .11 < 130, fg = dk ? '#fff' : '#1d2b2d'; x.textBaseline = 'middle';
      const tx = (t, X, Y, size, max, al) => { let s = size; x.textAlign = al; do { x.font = `700 ${s}px ${fam}`; s *= .95; } while (x.measureText(t).width > max && s > 8); x.fillText(t, X, Y); };
      x.fillStyle = fg; if (hd) tx(st.title.trim(), W / 2, pad + hd / 2, W * .036, W * .94, 'center'); if (ft) tx(info, W / 2, f.height - pad - ft / 2, W * .024, W * .94, 'center');
      [[A, st.la, '#5b6b6d', pa], [Bc, st.lb, '#0f6b66', pb]].forEach(([im, t, col, p], i) => { const X = pad + (ver ? 0 : i * (cw + g)), Y = pad + hd + (ver ? i * (ch + g) : 0); x.save(); x.beginPath(); x.rect(X, Y, cw, ch); x.clip(); x.translate(X, Y); SD.cover(x, im, cw, ch, p.st.fx ?? .5, p.st.fy ?? .5); x.restore(); if (t.trim()) { const s = W * .026; x.font = `700 ${s}px ${fam}`; const tw = x.measureText(t).width + s * 1.4, h = s * 1.8; x.fillStyle = col; x.fillRect(X, Y, tw, h); x.fillStyle = '#fff'; x.textAlign = 'center'; x.fillText(t, X + tw / 2, Y + h / 2); } p._r = [X / f.width, Y / f.height, cw / f.width, ch / f.height]; }); return f;
    };
    const draw = () => { if (!n() || !st) return; const a = L.a[cur], b = L.b[cur], f = pair(a, b, a.pv, b.pv, 1200); cv.width = f.width; cv.height = f.height; SD.x(cv).drawImage(f, 0, 0); };
    cv.onclick = e => { const r = cv.getBoundingClientRect(), X = (e.clientX - r.left) / r.width, Y = (e.clientY - r.top) / r.height; [L.a[cur], L.b[cur]].forEach(p => { const [x, y, w, h] = p._r, u = (X - x) / w, v = (Y - y) / h; if (u >= 0 && u <= 1 && v >= 0 && v <= 1) { const cw = w * cv.width, ch = h * cv.height, s = Math.max(cw / p.pv.width, ch / p.pv.height), W = p.pv.width * s, H = p.pv.height * s, ox = SD.clamp(cw / 2 - (p.st.fx ?? .5) * W, cw - W, 0), oy = SD.clamp(ch / 2 - (p.st.fy ?? .5) * H, ch - H, 0); p.st.fx = (u * cw - ox) / W; p.st.fy = (v * ch - oy) / H; } }); draw(); };
    st = SD.form(panel, 'ba', [{ k: 'dir', type: 'chips', label: '놓는 방향', v: 'h', opts: [['h', '좌우'], ['v', '위아래']] }, { k: 'ratio', type: 'chips', label: '칸 모양', v: '4:3', opts: [['4:3', '가로'], ['1:1', '정사각'], ['3:4', '세로']] }, { type: 'html', t: '사진을 누르면 그곳이 칸 가운데로 옵니다.' }, { k: 'title', type: 'text', label: '제목', v: '', placeholder: '예: 주거환경 개선', nosave: 1 }, { k: 'place', type: 'text', label: '장소', v: '', placeholder: '개인 주소는 쓰지 마세요', nosave: 1 }, { k: 'date', type: 'date', label: '날짜', v: '', nosave: 1 }, { k: 'la', type: 'text', label: '앞 이름표', v: '전' }, { k: 'lb', type: 'text', label: '뒤 이름표', v: '후' }, { k: 'gap', type: 'range', label: '사이 간격', min: 0, max: 40, v: 10 }, { k: 'frame', type: 'check', label: '테두리 여백', v: true }, { k: 'bg', type: 'color', label: '바탕색', v: '#ffffff' }], draw);
    const all = async () => { const out = []; for (let i = 0; i < n(); i++) { const a = L.a[i], b = L.b[i]; out.push({ name: `${st.title.trim() || '전후비교'}_${i + 1}`, canvas: pair(a, b, await a.get(), await b.get(), 2000) }); } draw(); return out; };
    panel.append(SD.$('div', { class: 'out' }, SD.$('button', { class: 'btn p', textContent: '전체 받기(여러 짝은 zip)', onclick: async () => { try { const a = await all(), bl = []; for (const i of a) bl.push({ name: i.name + '.jpg', blob: await SD.blob(i.canvas, 'image/jpeg', .93) }); bl.length === 1 ? SD.save(bl[0].blob, SD.safe(bl[0].name)) : SD.save(await SD.zip(bl), `전후비교_${bl.length}장.zip`); } catch (e) { SD.toast(e.message); } } }), SD.next('ba', all)));
  }
});

SD.tool({
  id: 'mark', title: '로고·저작권 표시', icon: 'mark', group: 3, when: '여러 사진에 회사 로고나 이름을 한꺼번에',
  mount(root) {
    let st;
    const B = SD.bench(root, {
      id: 'mark', title: '로고표시', suf: '_표시', fmt: () => ['image/jpeg', .93], sample: () => [[SD.demo.scene(), '활동사진.png'], [SD.demo.food(), '도시락.png']],
      process: (p, { src }) => {
        const f = SD.copy(src), x = SD.x(f), W = f.width, H = f.height, base = Math.min(W, H), fam = 'Pretendard,"Malgun Gothic",sans-serif'; let m;
        if (st.kind === 'logo') { if (!st.logo) return f; const k = base * st.size / 100 * 2.2 / Math.max(st.logo.width, st.logo.height); m = SD.cv(st.logo.width * k, st.logo.height * k); SD.x(m).imageSmoothingQuality = 'high'; SD.x(m).drawImage(st.logo, 0, 0, m.width, m.height); }
        else { const t = st.text.trim(); if (!t) return f; const s = base * st.size / 100 * .5; x.font = `700 ${s}px ${fam}`; const ls = t.split('\n'), w = Math.max(...ls.map(l => x.measureText(l).width)); m = SD.cv(w + s * .8, ls.length * s * 1.3 + s * .4); const q = SD.x(m); q.font = `700 ${s}px ${fam}`; q.textBaseline = 'middle'; q.textAlign = 'center'; q.lineJoin = 'round'; ls.forEach((l, i) => { const Y = s * .85 + i * s * 1.3; if (st.edge) { q.lineWidth = s * .14; q.strokeStyle = '#0009'; q.strokeText(l, m.width / 2, Y); } q.fillStyle = st.color; q.fillText(l, m.width / 2, Y); }); }
        x.globalAlpha = st.alpha / 100;
        if (st.pos === 'tile') { x.translate(W / 2, H / 2); x.rotate(-.45); const R = Math.hypot(W, H) / 2, gx = m.width * 1.5, gy = m.height * 2.6; for (let y = -Math.ceil(R / gy); y <= R / gy; y++) for (let i = -Math.ceil(R / gx) - 1; i <= R / gx + 1; i++) x.drawImage(m, i * gx + (y % 2 ? gx / 2 : 0) - m.width / 2, y * gy - m.height / 2); }
        else { const g = base * st.gap / 100, X = st.pos[1] === 'l' ? g : st.pos[1] === 'r' ? W - m.width - g : (W - m.width) / 2, Y = st.pos[0] === 't' ? g : st.pos[0] === 'b' ? H - m.height - g : (H - m.height) / 2; x.drawImage(m, X, Y); }
        return f;
      }
    });
    st = SD.form(B.panel, 'mark', [{ k: 'kind', type: 'chips', label: '무엇을', v: 'text', opts: [['text', '글자'], ['logo', '로고 그림']] }, { k: 'text', type: 'area', label: '글자', v: '© 우리 센터', show: s => s.kind === 'text' }, { k: 'logo', type: 'file', label: '로고(투명한 PNG가 좋아요, PDF도 됨)', pdf: 1, nosave: 1, show: s => s.kind === 'logo' }, { k: 'color', type: 'color', label: '글자색', v: '#ffffff', show: s => s.kind === 'text' }, { k: 'edge', type: 'check', label: '어두운 테두리(잘 보이게)', v: true, show: s => s.kind === 'text' }, { k: 'pos', type: 'chips', label: '자리', v: 'br', opts: [['tl', '왼쪽 위'], ['tr', '오른쪽 위'], ['cc', '가운데'], ['bl', '왼쪽 아래'], ['bc', '아래 가운데'], ['br', '오른쪽 아래'], ['tile', '빗금으로 가득']] }, { k: 'size', type: 'range', label: '크기', min: 3, max: 40, v: 10 }, { k: 'alpha', type: 'range', label: '진하기', min: 10, max: 100, v: 85, u: '%' }, { k: 'gap', type: 'range', label: '가장자리에서', min: 0, max: 15, v: 3, u: '%', show: s => s.pos !== 'tile' }], () => B.refresh());
    B.outBar();
  }
});

const CROP = { ig: [1080, 1080, '인스타 정사각'], igv: [1080, 1350, '인스타 세로'], story: [1080, 1920, '스토리·세로 화면'], blog: [1200, 630, '블로그·링크 대표'], yt: [1280, 720, '유튜브 썸네일'], ppt: [1920, 1080, 'PPT 16:9'], a4: [2480, 3508, 'A4 세로 인쇄'], a4h: [3508, 2480, 'A4 가로 인쇄'], ban: [3000, 600, '현수막 5:1'], x43: [1600, 1200, '가로 4:3'], own: [0, 0, '직접 정하기'] };
SD.tool({
  id: 'crop', title: '크기별 맞춤 자르기', icon: 'crop', group: 3, when: '한 장으로 인스타·블로그·현수막 크기를 한 번에. 잘릴 곳은 눌러서 정하기',
  mount(root) {
    let st;
    const sz = k => k === 'own' ? [SD.clamp(Math.round(st.w) || 100, 50, 6000), SD.clamp(Math.round(st.h) || 100, 50, 6000)] : CROP[k];
    const one = (p, src, k, max) => {
      let [W, H] = sz(k); if (max) { const z = Math.min(1, max / Math.max(W, H)); W = Math.round(W * z); H = Math.round(H * z); } const f = SD.cv(W, H), x = SD.x(f); x.imageSmoothingQuality = 'high'; const fx = p.st.fx ?? .5, fy = p.st.fy ?? .5;
      if (st.fit === 'cut') SD.cover(x, src, W, H, fx, fy); else { if (st.fit === 'blur') { const sm = SD.fit(src, 300); x.filter = `blur(${Math.max(4, W / 40).toFixed(1)}px)`; x.save(); x.translate(-W * .06, -H * .06); SD.cover(x, sm, W * 1.12, H * 1.12); x.restore(); x.filter = 'none'; } else { x.fillStyle = st.color; x.fillRect(0, 0, W, H); } const s = Math.min(W / src.width, H / src.height); x.drawImage(src, (W - src.width * s) / 2, (H - src.height * s) / 2, src.width * s, src.height * s); } return f;
    };
    const grid = SD.$('div', { class: 'grid' });
    const B = SD.bench(root, {
      id: 'crop', title: '크기별사진', nocopy: true, fmt: () => ['image/jpeg', .93], sample: () => [[SD.demo.scene(), '단체사진.png']],
      process: (p, { preview, src }) => { if (!preview) { if (!st.set.length) throw new Error('크기를 하나 이상 고르세요.'); return st.set.map(k => ({ canvas: one(p, src, k), suf: '_' + CROP[k][2].replace(/[·: ]/g, '') + '_' + sz(k).slice(0, 2).join('x') })); } const f = SD.copy(src), x = SD.x(f), X = (p.st.fx ?? .5) * f.width, Y = (p.st.fy ?? .5) * f.height; x.lineWidth = 4; x.strokeStyle = '#fff'; x.fillStyle = '#e2452b'; x.beginPath(); x.arc(X, Y, 16, 0, 7); x.fill(); x.stroke(); return f; },
      after: p => { grid.replaceChildren(...st.set.map(k => SD.$('figure', {}, one(p, p.pv, k, 320), SD.$('figcaption', { textContent: `${CROP[k][2]} ${sz(k).slice(0, 2).join('×')}${st.fit === 'cut' && Math.max(sz(k)[0] / p.w, sz(k)[1] / p.h) > 1.6 ? ' · 원본이 작아 흐릴 수 있음' : ''}` })))); B.msg('사진에서 꼭 나와야 할 곳(얼굴 등)을 누르면 빨간 점이 옮겨집니다.'); }
    });
    B.view.append(grid); B.cv.style.maxHeight = '40vh'; B.cv.style.cursor = 'crosshair'; B.cv.onclick = e => { const r = B.cv.getBoundingClientRect(); B.sel.st.fx = (e.clientX - r.left) / r.width; B.sel.st.fy = (e.clientY - r.top) / r.height; B.refresh(); };
    st = SD.form(B.panel, 'crop', [{ k: 'set', type: 'chips', multi: true, label: '만들 크기(여러 개)', v: ['ig', 'blog', 'ban'], opts: Object.entries(CROP).map(([k, v]) => [k, v[2]]) }, { k: 'w', type: 'number', label: '가로(px)', min: 50, max: 6000, v: 800, show: s => s.set.includes('own') }, { k: 'h', type: 'number', label: '세로(px)', min: 50, max: 6000, v: 600, show: s => s.set.includes('own') }, { k: 'fit', type: 'chips', label: '모양이 안 맞을 때', v: 'cut', opts: [['cut', '가득 채워 자르기'], ['blur', '안 자르고 흐린 배경'], ['color', '안 자르고 색 여백']] }, { k: 'color', type: 'color', label: '여백 색', v: '#ffffff', show: s => s.fit === 'color' }], () => B.refresh());
    B.outBar();
  }
});
