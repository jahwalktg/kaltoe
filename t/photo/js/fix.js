/* 한꺼번에 손질 · 종이 반듯하게 · 밝기 보정 */
SD.tool({
  id: 'batch', title: '한꺼번에 손질', icon: 'stack', group: 2, when: '크기·용량 줄이기, 형식 바꾸기, 돌리기, 이름 바꾸기, 위치정보 지우기',
  mount(root) {
    let st; const cache = new Map();
    const turn = (src, r) => { if (!r) return src; const q = r % 180 ? SD.cv(src.height, src.width) : SD.cv(src.width, src.height), x = SD.x(q); x.translate(q.width / 2, q.height / 2); x.rotate(r * Math.PI / 180); x.drawImage(src, -src.width / 2, -src.height / 2); return q; };
    const make = async (p, src) => {
      let c = turn(src, ((p.st.r || 0) + (+st.rot)) % 360); if (st.size !== '0') c = SD.fit(c, +st.size); if (st.size === 'pct') c = SD.fit(c, 1e9);
      const type = st.fmt === 'same' ? (/png$/i.test(p.name) ? 'image/png' : /webp$/i.test(p.name) ? 'image/webp' : 'image/jpeg') : 'image/' + st.fmt; if (type === 'image/jpeg') c = SD.flat(c);
      let b = await SD.blob(c, type, st.q / 100), warn = '';
      if (st.limit !== '0') {
        const lim = +st.limit * 1000000; let t = type, w = c;
        for (let round = 0; b.size > lim && round < 10; round++) { if (t !== 'image/png') { let lo = .35, hi = .92, best = null; for (let i = 0; i < 6; i++) { const m = (lo + hi) / 2, q = await SD.blob(w, t, m); if (q.size <= lim) { best = q; lo = m; } else hi = m; } if (best) { b = best; break; } } w = SD.fit(w, Math.max(w.width, w.height) * .82); b = await SD.blob(w, t, .8); }
        if (b.size > lim) warn = '목표보다 큽니다'; c = w;
      }
      return { blob: b, w: c.width, h: c.height, warn };
    };
    const key = () => [st.size, st.fmt, st.q, st.limit, st.rot].join('|');
    const B = SD.bench(root, {
      id: 'batch', title: '손질한 사진', cap: 6000, nocopy: true, sample: () => [[SD.demo.scene(), 'IMG_0001.png'], [SD.demo.food(), 'IMG_0002.png']],
      process: async (p, { preview, src, no }) => {
        if (preview) {
          const r = await make(p, await p.get()); cache.set(p.id, { k: key() + (p.st.r || 0), r });
          B.msg(`${p.ow}×${p.oh}${p.file ? ' ' + SD.size(p.file.size) : ''}  →  ${r.w}×${r.h} ${SD.size(r.blob.size)}${r.warn ? ' · ' + r.warn : ''}${p.meta.gps ? ' · 찍은 위치(GPS) 정보가 있어 지웁니다' : ''}`);
          const bm = await createImageBitmap(r.blob), v = SD.cv(bm.width, bm.height); SD.x(v).drawImage(bm, 0, 0); bm.close(); return SD.fit(v, 1200);
        }
        const r = await make(p, src), date = p.meta.date || '날짜없음'; return [{ blob: r.blob, name: st.name.trim() ? st.name.replace(/\{번호\}/g, String(no).padStart(3, '0')).replace(/\{원래이름\}/g, SD.base(p.name)).replace(/\{날짜\}/g, date) : SD.base(p.name) }];
      }
    });
    st = SD.form(B.panel, 'batch', [
      { k: 'size', type: 'select', label: '크기(긴 쪽)', v: '1920', opts: [['0', '그대로'], ['3000', '3000px(인쇄)'], ['1920', '1920px(발표·홈페이지)'], ['1280', '1280px(블로그)'], ['800', '800px(문자·메신저)']] },
      { k: 'limit', type: 'select', label: '한 장 용량을', v: '0', opts: [['0', '제한 없음'], ['5', '5MB 아래로'], ['2', '2MB 아래로'], ['1', '1MB 아래로'], ['0.5', '500KB 아래로'], ['0.2', '200KB 아래로']] },
      { k: 'fmt', type: 'select', label: '파일 형식', v: 'jpeg', opts: [['same', '원래대로'], ['jpeg', 'JPG(사진에 알맞음)'], ['png', 'PNG(투명 유지)'], ['webp', 'WebP(작은 용량)']] }, { k: 'q', type: 'range', label: '화질', min: 50, max: 98, v: 88, show: s => s.fmt !== 'png' },
      { k: 'rot', type: 'chips', label: '모두 돌리기', v: 0, nosave: 1, opts: [[0, '안 함'], [90, '오른쪽'], [180, '뒤집기'], [270, '왼쪽']] },
      { k: 'name', type: 'text', label: '새 파일 이름', v: '', placeholder: '비우면 원래 이름', nosave: 1 }, { type: 'html', t: '{번호} {원래이름} {날짜}를 넣을 수 있어요. 예: 나들이_{날짜}_{번호}' }, { type: 'html', cls: 'note', t: '받는 사진에서는 찍은 위치·기기 정보가 모두 지워집니다. 긴 쪽 6000px보다 큰 사진은 6000px로 줄어듭니다.' }
    ], () => B.refresh());
    B.tbar.append(SD.$('button', { class: 'btn s', textContent: '↻ 이 사진만 돌리기', onclick: () => { B.sel.st.r = ((B.sel.st.r || 0) + 90) % 360; B.refresh(); } })); B.outBar();
  }
});

/* 네 모서리 펴기(투영 변환) */
SD.homo = (f, t) => { const A = []; for (let i = 0; i < 4; i++) { const [x, y] = f[i], [u, v] = t[i]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u], [0, 0, 0, x, y, 1, -v * x, -v * y, v]); } for (let i = 0; i < 8; i++) { let m = i; for (let r = i; r < 8; r++) if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r;[A[i], A[m]] = [A[m], A[i]]; for (let r = 0; r < 8; r++) if (r !== i) { const k = A[r][i] / A[i][i]; for (let c = i; c < 9; c++) A[r][c] -= k * A[i][c]; } } return A.map((r, i) => r[8] / r[i]).concat(1); };
SD.warp = (src, q, W, H, dst) => {
  W = Math.round(W); H = Math.round(H); const t = dst || [[0, 0], [W, 0], [W, H], [0, H]], m = SD.homo(t, q), sw = src.width, sh = src.height, s = SD.x(src).getImageData(0, 0, sw, sh).data, o = SD.cv(W, H), im = SD.x(o).createImageData(W, H), d = im.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = m[6] * x + m[7] * y + 1, u = (m[0] * x + m[1] * y + m[2]) / k, v = (m[3] * x + m[4] * y + m[5]) / k, x0 = Math.floor(u), y0 = Math.floor(v); if (x0 < 0 || y0 < 0 || x0 >= sw || y0 >= sh) continue;
    const x1 = Math.min(sw - 1, x0 + 1), y1 = Math.min(sh - 1, y0 + 1), a = u - x0, b = v - y0, i = (y * W + x) * 4, p = (y0 * sw + x0) * 4, q1 = (y0 * sw + x1) * 4, r = (y1 * sw + x0) * 4, z = (y1 * sw + x1) * 4;
    for (let c = 0; c < 4; c++) d[i + c] = (s[p + c] * (1 - a) + s[q1 + c] * a) * (1 - b) + (s[r + c] * (1 - a) + s[z + c] * a) * b;
  }
  SD.x(o).putImageData(im, 0, 0); return o;
};
/* 종이 모서리 찾기: 밝은 덩어리 중 가장 큰 것 */
SD.corners = src => {
  const s = SD.copy(SD.fit(src, 260)), w = s.width, h = s.height, d = SD.x(s).getImageData(0, 0, w, h).data, g = new Float32Array(w * h); for (let i = 0; i < g.length; i++) g[i] = Math.min(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]); const a = SD.boxBlur(g, w, h, 2), H = new Array(256).fill(0); a.forEach(v => H[v | 0]++);
  let tot = a.length, sum = H.reduce((p, v, i) => p + v * i, 0), sB = 0, wB = 0, best = 0, th = 128; for (let i = 0; i < 256; i++) { wB += H[i]; if (!wB || wB === tot) continue; sB += i * H[i]; const v = wB * (tot - wB) * (sB / wB - (sum - sB) / (tot - wB)) ** 2; if (v > best) { best = v; th = i; } }
  const lab = new Uint8Array(w * h); let big = []; for (let i = 0; i < lab.length; i++) { if (lab[i] || a[i] <= th) continue; const st = [i], l = []; lab[i] = 1; while (st.length) { const j = st.pop(); l.push(j); const x = j % w; for (const t of [x > 0 ? j - 1 : -1, x < w - 1 ? j + 1 : -1, j - w, j + w]) if (t >= 0 && t < lab.length && !lab[t] && a[t] > th) { lab[t] = 1; st.push(t); } } if (l.length > big.length) big = l; }
  const def = [[.06, .06], [.94, .06], [.94, .94], [.06, .94]]; if (big.length < w * h * .12 || big.length > w * h * .97) return { q: def, sure: false };
  const ex = [null, null, null, null], val = [1e9, -1e9, -1e9, 1e9]; big.forEach(j => { const x = j % w, y = (j / w) | 0; if (x + y < val[0]) { val[0] = x + y; ex[0] = [x, y]; } if (x - y > val[1]) { val[1] = x - y; ex[1] = [x, y]; } if (x + y > val[2]) { val[2] = x + y; ex[2] = [x, y]; } if (x - y < val[3]) { val[3] = x - y; ex[3] = [x, y]; } });
  const ar = Math.abs(ex.reduce((s2, [x, y], i) => { const [u, v] = ex[(i + 1) % 4]; return s2 + x * v - u * y; }, 0)) / 2; if (ar < big.length * .7) return { q: def, sure: false };
  return { q: ex.map(([x, y]) => [(x + .5) / w, (y + .5) / h]), sure: true };
};
/* 비스듬히 찍힌 네모의 실제 가로세로 비(가로/세로). 믿기 어려우면 null */
SD.aspect = (q, w, h) => {
  const m = q.map(([x, y]) => [x - w / 2, y - h / 2, 1]), cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], dt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const [m1, m2, m4, m3] = m, k2 = dt(cr(m1, m4), m3) / dt(cr(m2, m4), m3), k3 = dt(cr(m1, m4), m2) / dt(cr(m3, m4), m2), n2 = m2.map((v, i) => k2 * v - m1[i]), n3 = m3.map((v, i) => k3 * v - m1[i]);
  if (Math.abs(n2[2]) < .02 || Math.abs(n3[2]) < .02) return null;
  const f2 = -(n2[0] * n3[0] + n2[1] * n3[1]) / (n2[2] * n3[2]), L = Math.max(w, h); if (!(f2 > (L * .45) ** 2 && f2 < (L * 4) ** 2)) return null;
  const len = n => Math.sqrt((n[0] * n[0] + n[1] * n[1]) / f2 + n[2] * n[2]), r = len(n2) / len(n3); for (const t of [210 / 297, 297 / 210]) if (Math.abs(r / t - 1) < .06) return t; return r > .15 && r < 7 ? r : null;
};
/* 그늘 없애기: 종이 밝기를 나눠 준다 */
SD.unshade = (c, mode, power) => {
  const w = c.width, h = c.height, x = SD.x(c), im = x.getImageData(0, 0, w, h), d = im.data, k = Math.min(1, 220 / Math.max(w, h)), sw = Math.max(8, Math.round(w * k)), sh = Math.max(8, Math.round(h * k)), s = SD.cv(sw, sh); SD.x(s).drawImage(c, 0, 0, sw, sh); const sd = SD.x(s).getImageData(0, 0, sw, sh).data, R = 9;
  const bg = [0, 1, 2].map(ch => { const a = new Float32Array(sw * sh), o = new Float32Array(sw * sh); for (let y = 0; y < sh; y++) for (let X = 0; X < sw; X++) { let m = 0; for (let t = -R; t <= R; t++) { const u = X + t; if (u >= 0 && u < sw) m = Math.max(m, sd[(y * sw + u) * 4 + ch]); } a[y * sw + X] = m; } for (let y = 0; y < sh; y++) for (let X = 0; X < sw; X++) { let m = 0; for (let t = -R; t <= R; t++) { const v = y + t; if (v >= 0 && v < sh) m = Math.max(m, a[v * sw + X]); } o[y * sw + X] = m; } const b = SD.boxBlur(SD.boxBlur(o, sw, sh, 8), sw, sh, 8), n = SD.cv(sw, sh), q = SD.x(n).createImageData(sw, sh); for (let i = 0; i < b.length; i++) { q.data[i * 4] = q.data[i * 4 + 1] = q.data[i * 4 + 2] = b[i]; q.data[i * 4 + 3] = 255; } SD.x(n).putImageData(q, 0, 0); return n; });
  const up = bg.map(n => { const o = SD.cv(w, h); SD.x(o).drawImage(n, 0, 0, w, h); return SD.x(o).getImageData(0, 0, w, h).data; }), g = 1 + power / 60;
  for (let i = 0; i < d.length; i += 4) { let r = Math.min(1, d[i] / Math.max(30, up[0][i]) * 1.04), gg = Math.min(1, d[i + 1] / Math.max(30, up[1][i]) * 1.04), b = Math.min(1, d[i + 2] / Math.max(30, up[2][i]) * 1.04); if (mode === 'bw') { const v = r * .3 + gg * .59 + b * .11; r = gg = b = v; } const f = v => Math.pow(v, g) * 255; d[i] = f(r); d[i + 1] = f(gg); d[i + 2] = f(b); d[i + 3] = 255; }
  x.putImageData(im, 0, 0); return c;
};
SD.tool({
  id: 'scan', title: '종이·영수증 반듯하게', icon: 'scan', group: 2, when: '비스듬히 찍은 서류를 네 모서리 맞춰 펴고 그늘 지우기. PDF로 묶기',
  mount(root) {
    let st; const NS = 'http://www.w3.org/2000/svg';
    const out = (p, src, max) => { const q = p.st.q.map(([x, y]) => [x * src.width, y * src.height]), L = (a, b) => Math.hypot(q[a][0] - q[b][0], q[a][1] - q[b][1]); let W = Math.max(L(0, 1), L(3, 2)), H = Math.max(L(0, 3), L(1, 2)); const asp = SD.aspect(q, src.width, src.height); if (asp) { const A = W * H; W = Math.sqrt(A * asp); H = Math.sqrt(A / asp); } H *= st.tall / 100; if (st.ratio === 'a4') { const r = 297 / 210; if (H >= W) H = W * r; else W = H * r; } const k = Math.min(1, max / Math.max(W, H)); let c = SD.warp(src, q, Math.max(20, W * k), Math.max(20, H * k)); if (st.look !== 'photo') c = SD.unshade(c, st.look, st.power); if (p.st.r) { const r = p.st.r, n = r % 180 ? SD.cv(c.height, c.width) : SD.cv(c.width, c.height), x = SD.x(n); x.translate(n.width / 2, n.height / 2); x.rotate(r * Math.PI / 180); x.drawImage(c, -c.width / 2, -c.height / 2); c = n; } return c; };
    const B = SD.bench(root, {
      id: 'scan', title: '문서사진', suf: '_펴기', fmt: () => ['image/jpeg', .9], sample: () => [[SD.demo.doc(), '영수증.png']], text: '서류·영수증 사진이나 스캔한 PDF를 넣으세요. 사진은 종이가 다 나오게, 종이보다 어두운 바닥에서 찍으면 모서리를 잘 찾습니다.',
      onPick: p => { if (!p.st.q) { const r = SD.corners(p.pv); p.st.q = r.q; p.st.sure = r.sure; } show(p); },
      process: (p, { preview, src }) => out(p, src, preview ? 900 : 2400), after: p => B.msg(p.st.sure ? '파란 점을 끌어 모서리를 맞출 수 있습니다.' : '종이 모서리를 못 찾았습니다. 파란 점 네 개를 종이 모서리로 끌어 주세요.')
    });
    const sc = SD.$('canvas', { class: 'cv' }), svg = document.createElementNS(NS, 'svg'), wrap = SD.$('div', { class: 'wrap' }, sc, svg); const two = SD.$('div', { class: 'two' }, SD.$('figure', {}, SD.$('figcaption', { textContent: '원래 사진' }), wrap), SD.$('figure', {}, SD.$('figcaption', { textContent: '편 모습' }), B.cv)); B.view.append(two);
    const poly = document.createElementNS(NS, 'polygon'); poly.setAttribute('fill', '#1679d022'); poly.setAttribute('stroke', '#1679d0'); poly.setAttribute('stroke-width', '2'); poly.setAttribute('vector-effect', 'non-scaling-stroke'); svg.append(poly); svg.setAttribute('viewBox', '0 0 1 1'); svg.setAttribute('preserveAspectRatio', 'none');
    const dots = [0, 1, 2, 3].map(i => { const d = SD.$('button', { class: 'dot', ariaLabel: ['왼쪽 위', '오른쪽 위', '오른쪽 아래', '왼쪽 아래'][i] + ' 모서리' }); d.style.cssText = 'position:absolute;width:28px;height:28px;margin:-14px;border-radius:50%;border:3px solid #fff;background:#1679d0cc;box-shadow:0 0 0 1px #1679d0;cursor:grab;touch-action:none;padding:0'; let on = false; const set = (x, y) => { B.sel.st.q[i] = [SD.clamp(x, 0, 1), SD.clamp(y, 0, 1)]; B.sel.st.sure = true; lay(); B.refresh(); }; d.onpointerdown = e => { on = true; d.setPointerCapture(e.pointerId); }; d.onpointermove = e => { if (on) { const r = sc.getBoundingClientRect(); set((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); } }; d.onpointerup = () => { on = false; }; d.onkeydown = e => { const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (k) { e.preventDefault(); const q = B.sel.st.q[i]; set(q[0] + k[0] * .004, q[1] + k[1] * .004); } }; wrap.append(d); return d; });
    const lay = () => { const q = B.sel.st.q; poly.setAttribute('points', q.map(a => a.join(',')).join(' ')); dots.forEach((d, i) => { d.style.left = q[i][0] * 100 + '%'; d.style.top = q[i][1] * 100 + '%'; }); };
    const show = p => { sc.width = p.pv.width; sc.height = p.pv.height; SD.x(sc).drawImage(p.pv, 0, 0); lay(); };
    st = SD.form(B.panel, 'scan', [{ k: 'look', type: 'chips', label: '느낌', v: 'color', opts: [['color', '그늘 지운 컬러'], ['bw', '흑백 문서'], ['photo', '사진 그대로']] }, { k: 'power', type: 'range', label: '글씨 진하게', min: 0, max: 100, v: 30, show: s => s.look !== 'photo' }, { k: 'ratio', type: 'chips', label: '모양', v: 'auto', opts: [['auto', '보이는 대로'], ['a4', 'A4로 맞춤']] }, { k: 'tall', type: 'range', label: '세로 길이 맞추기', min: 60, max: 160, v: 100, u: '%', nosave: 1, show: s => s.ratio !== 'a4' }], () => B.refresh());
    B.tbar.append(SD.$('button', { class: 'btn s', textContent: '모서리 다시 찾기', onclick: () => { const r = SD.corners(B.sel.pv); Object.assign(B.sel.st, r); show(B.sel); B.refresh(); } }), SD.$('button', { class: 'btn s', textContent: '↻ 돌리기', onclick: () => { B.sel.st.r = ((B.sel.st.r || 0) + 90) % 360; B.refresh(); } }));
    B.outBar(SD.$('button', { class: 'btn', textContent: '모두 PDF 하나로 받기', onclick: async () => { try { for (const p of B.photos) if (!p.st.q) Object.assign(p.st, SD.corners(p.pv)); const a = await B.items(); SD.save(await SD.pdf(a.map(i => { const land = i.canvas.width > i.canvas.height; if (st.ratio === 'a4') return { canvas: i.canvas, mmW: land ? 297 : 210, mmH: land ? 210 : 297 }; const k = Math.min(210 / i.canvas.width, 297 / i.canvas.height); return { canvas: i.canvas, mmW: i.canvas.width * k, mmH: i.canvas.height * k }; })), `문서_${a.length}쪽.pdf`); } catch (e) { SD.toast(e.message); } } }));
    const it = B.items; B.items = async l => { for (const p of (l || B.photos)) if (!p.st.q) Object.assign(p.st, SD.corners(p.pv)); return it(l); };
  }
});

/* 밝기·색 보정 */
const LOOK = { none: ['그대로', {}], auto: ['자동', {}], food: ['음식 먹음직하게', { br: 10, ct: 12, sat: 24, warm: 14, shd: 10 }], dark: ['어두운 실내 밝게', { br: 22, ct: 6, sat: 6, warm: 0, shd: 45 }], out: ['바깥 활동 산뜻하게', { br: 6, ct: 12, sat: 16, warm: -2, shd: 18 }], soft: ['부드럽고 따뜻하게', { br: 10, ct: -8, sat: -4, warm: 12, shd: 15 }], white: ['누런 조명 빼기', { br: 4, ct: 4, sat: 0, warm: -22, shd: 6 }], mono: ['흑백', { br: 4, ct: 12, sat: -100, warm: 0, shd: 8 }] };
SD.adjust = (src, a, gain = [1, 1, 1], gam = 1) => {
  const c = SD.copy(src), x = SD.x(c), im = x.getImageData(0, 0, c.width, c.height), d = im.data, ct = 1 + a.ct / 100, L = [0, 1, 2].map(ch => { const t = new Float32Array(256); for (let i = 0; i < 256; i++) { let v = Math.pow(Math.min(1, i / 255 * gain[ch]), gam); v *= 1 + (ch === 0 ? a.warm : ch === 2 ? -a.warm : 0) / 220; v = Math.max(0, v); v += a.shd / 100 * .9 * v * Math.max(0, 1 - v) ** 2; v = v * (1 + a.br / 160) + a.br / 700; v = .5 + (v - .5) * ct; t[i] = SD.clamp(v, 0, 1) * 255; } return t; }), s = 1 + a.sat / 100;
  for (let i = 0; i < d.length; i += 4) { const r = L[0][d[i]], g = L[1][d[i + 1]], b = L[2][d[i + 2]], y = r * .299 + g * .587 + b * .114; d[i] = y + (r - y) * s; d[i + 1] = y + (g - y) * s; d[i + 2] = y + (b - y) * s; }
  x.putImageData(im, 0, 0); return c;
};
SD.stat = p => { if (p._stat) return p._stat; const s = SD.copy(SD.fit(p.pv, 200)), d = SD.x(s).getImageData(0, 0, s.width, s.height).data, m = [0, 0, 0], ys = []; for (let i = 0; i < d.length; i += 4) { for (let c = 0; c < 3; c++) m[c] += d[i + c]; ys.push(d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114); } ys.sort((a, b) => a - b); const n = ys.length; return p._stat = { m: m.map(v => v / n), lo: ys[n * .01 | 0], hi: ys[n * .99 | 0], mid: ys[n >> 1], low: ys[n * .25 | 0], y: ys.reduce((a, b) => a + b) / n }; };
SD.tool({
  id: 'tone', title: '밝기·색 보정', icon: 'sun', group: 2, when: '음식은 먹음직하게, 어두운 실내는 밝게. 여러 장을 같은 톤으로',
  mount(root) {
    let st, raw = false;
    const B = SD.bench(root, {
      id: 'tone', title: '보정사진', suf: '_보정', fmt: () => ['image/jpeg', .93], sample: () => [[SD.demo.food(), '도시락.png'], [SD.demo.scene(true), '어두운 활동사진.png']],
      process: (p, { src }) => {
        if (raw) return src; let gain = [1, 1, 1], gam = 1; const s = SD.stat(p), a = { br: st.br, ct: st.ct, sat: st.sat, warm: st.warm, shd: st.shd };
        if (st.look === 'auto') { const g = SD.clamp(250 / Math.max(60, s.hi), .9, 1.9); gain = [g, g, g]; gam = SD.clamp(Math.log(.44) / Math.log(SD.clamp((s.mid + s.low) / 510 * g, .05, .9)), .5, 1); a.sat += 8; a.ct += 5; a.shd += s.low * g < 60 ? 25 : 0; }
        if (st.same && B.photos.length > 1) { const base = SD.stat(B.photos.find(q => q.id === st.ref) || B.photos[0]), k = .85; gain = gain.map((g, c) => g * Math.pow(SD.clamp(base.m[c] / Math.max(8, s.m[c]), .4, 2.6), k)); }
        return SD.adjust(src, a, gain, gam);
      }
    });
    st = SD.form(B.panel, 'tone', [{ k: 'look', type: 'chips', label: '한 번에', v: 'auto', opts: Object.entries(LOOK).map(([k, v]) => [k, v[0]]) }, { k: 'br', type: 'range', label: '밝기', min: -60, max: 60, v: 0 }, { k: 'shd', type: 'range', label: '어두운 곳 살리기', min: 0, max: 100, v: 0 }, { k: 'ct', type: 'range', label: '또렷하게(대비)', min: -50, max: 50, v: 0 }, { k: 'sat', type: 'range', label: '색 진하게', min: -100, max: 80, v: 0 }, { k: 'warm', type: 'range', label: '차갑게 ↔ 따뜻하게', min: -50, max: 50, v: 0 }, { k: 'same', type: 'check', label: '여러 장을 같은 톤으로(기준 사진에 맞춤)', v: false }, { type: 'button', label: '지금 사진을 기준으로', on: () => { st.ref = B.sel.id; st.$set('same', true); SD.toast(B.sel.name + ' 톤에 맞춥니다.'); B.refresh(); } }, { type: 'html', t: '증빙 사진은 실제와 다르게 보일 만큼 바꾸지 마세요.' }], (s, k) => { if (k === 'look') { const v = LOOK[s.look][1];['br', 'ct', 'sat', 'warm', 'shd'].forEach(q => s.$set(q, v[q] || 0)); } B.refresh(); });
    const b = SD.$('button', { class: 'btn s', textContent: '누르고 있으면 원래 사진' }); b.onpointerdown = () => { raw = true; B.refresh(); }; b.onpointerup = b.onpointerleave = b.onpointercancel = () => { if (raw) { raw = false; B.refresh(); } }; B.tbar.append(b); B.outBar();
  }
});
