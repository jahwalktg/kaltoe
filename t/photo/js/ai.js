/* 누끼 엔진 부르기 + 가장자리 다듬기(사진 윤곽에 맞추기) + 붓 편집기 */
SD.ai = { seq: 0, wait: {} };
SD.ai.call = (k, rgba, w, h, onp) => new Promise((ok, no) => {
  if (!SD.ai.w) {
    SD.ai.w = new Worker('js/ai-worker.js?v=3' + (/cpu/.test(location.search) ? '&cpu' : ''), { type: 'module' });
    SD.ai.w.onmessage = e => { const d = e.data, q = SD.ai.wait[d.id]; if (!q) return; if (d.a) { delete SD.ai.wait[d.id]; q.ok(d); } else if (d.err) { delete SD.ai.wait[d.id]; q.no(new Error('누끼를 따지 못했습니다: ' + d.err)); } else if (q.onp) q.onp(d); };
    SD.ai.w.onerror = () => { Object.values(SD.ai.wait).forEach(q => q.no(new Error('누끼 엔진을 시작하지 못했습니다. 인터넷 연결이나 브라우저(크롬·엣지 최신)를 확인해 주세요.'))); SD.ai.wait = {}; SD.ai.w = null; };
  }
  const id = ++SD.ai.seq; SD.ai.wait[id] = { ok, no, onp }; SD.ai.w.postMessage({ id, k, rgba, w, h });
});
SD.boxBlur = (a, w, h, r) => {
  const t = new Float32Array(w * h), o = new Float32Array(w * h);
  for (let y = 0; y < h; y++) { let s = 0, n = 0; for (let x = 0; x < Math.min(r, w); x++) { s += a[y * w + x]; n++; } for (let x = 0; x < w; x++) { if (x + r < w) { s += a[y * w + x + r]; n++; } if (x - r - 1 >= 0) { s -= a[y * w + x - r - 1]; n--; } t[y * w + x] = s / n; } }
  for (let x = 0; x < w; x++) { let s = 0, n = 0; for (let y = 0; y < Math.min(r, h); y++) { s += t[y * w + x]; n++; } for (let y = 0; y < h; y++) { if (y + r < h) { s += t[(y + r) * w + x]; n++; } if (y - r - 1 >= 0) { s -= t[(y - r - 1) * w + x]; n--; } o[y * w + x] = s / n; } }
  return o;
};
/* 엔진이 낸 거친 윤곽을 사진의 실제 윤곽에 붙인다(guided filter) */
SD.ai.refine = (src, a, aw, ah) => {
  const g = SD.copy(SD.fit(src, 1600)), w = g.width, h = g.height, d = SD.x(g).getImageData(0, 0, w, h).data, n = w * h, I = new Float32Array(n), P = new Float32Array(n);
  for (let y = 0; y < h; y++) {
    const fy = SD.clamp((y + .5) * ah / h - .5, 0, ah - 1), y0 = fy | 0, y1 = Math.min(ah - 1, y0 + 1), ty = fy - y0;
    for (let x = 0; x < w; x++) {
      const i = y * w + x, fx = SD.clamp((x + .5) * aw / w - .5, 0, aw - 1), x0 = fx | 0, x1 = Math.min(aw - 1, x0 + 1), tx = fx - x0;
      P[i] = (a[y0 * aw + x0] * (1 - tx) + a[y0 * aw + x1] * tx) * (1 - ty) + (a[y1 * aw + x0] * (1 - tx) + a[y1 * aw + x1] * tx) * ty;
      I[i] = (d[i * 4] * .299 + d[i * 4 + 1] * .587 + d[i * 4 + 2] * .114) / 255;
    }
  }
  const r = Math.max(2, Math.round(Math.max(w, h) / 320)), mul = (p, q) => { const o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = p[i] * q[i]; return o; }, bb = q => SD.boxBlur(q, w, h, r);
  const mI = bb(I), mP = bb(P), cIP = bb(mul(I, P)), cII = bb(mul(I, I)), A = new Float32Array(n), Bq = new Float32Array(n);
  for (let i = 0; i < n; i++) { A[i] = (cIP[i] - mI[i] * mP[i]) / (cII[i] - mI[i] * mI[i] + 4e-4); Bq[i] = mP[i] - A[i] * mI[i]; }
  const mA = bb(A), mB = bb(Bq), c = SD.cv(w, h), im = SD.x(c).createImageData(w, h);
  for (let i = 0; i < n; i++) { let v = mA[i] * I[i] + mB[i]; if (P[i] > .97) v = Math.max(v, P[i]); else if (P[i] < .03) v = Math.min(v, P[i]); v = SD.clamp((v - .06) / .88, 0, 1); im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = 255; im.data[i * 4 + 3] = v * 255; }
  SD.x(c).putImageData(im, 0, 0); return c;
};
SD.ai.mask = async (p, k, onp) => {
  const src = await p.get(); let w = 512, h = 512;
  if (k === 'fast') { const s = 512 / Math.min(src.width, src.height), lim = Math.min(1, 1024 / (Math.max(src.width, src.height) * s)); w = Math.max(32, Math.round(src.width * s * lim / 32) * 32); h = Math.max(32, Math.round(src.height * s * lim / 32) * 32); }
  let s0 = src; /* 크게 줄일 때 계단이 지지 않게 나눠 줄인다 */
  while (s0.width > w * 2.2 && s0.height > h * 2.2) { const n = SD.cv(s0.width / 2, s0.height / 2); SD.x(n).drawImage(s0, 0, 0, n.width, n.height); s0 = n; }
  const t = SD.cv(w, h), x = SD.x(t); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.imageSmoothingQuality = 'high'; x.drawImage(s0, 0, 0, w, h);
  const r = await SD.ai.call(k, x.getImageData(0, 0, w, h).data, w, h, onp);
  p.mask = SD.ai.refine(src, r.a, r.w, r.h); p.mv = (p.mv || 0) + 1; p.maskBy = k; p.ms = r.ms; p.ep = r.ep; return p.mask;
};
/* 윤곽 조절(안쪽으로·부드럽게)한 마스크 */
SD.lut = (c, f) => { const o = SD.copy(c), x = SD.x(o), d = x.getImageData(0, 0, o.width, o.height); for (let i = 3; i < d.data.length; i += 4) d.data[i] = f(d.data[i]); x.putImageData(d, 0, 0); return o; };
SD.maskOf = (p, shrink = 0, feather = 0) => {
  const key = p.mv + '/' + shrink + '/' + feather; if (p._mk === key) return p._mm; let m = p.mask;
  const bl = r => { const o = SD.cv(m.width, m.height), x = SD.x(o); x.filter = `blur(${r}px)`; x.drawImage(m, 0, 0); return o; };
  if (shrink) { m = bl(Math.abs(shrink)); m = SD.lut(m, shrink > 0 ? a => SD.clamp((a - 150) * 2.6, 0, 255) : a => SD.clamp((a - 20) * 2.6, 0, 255)); }
  if (feather) m = bl(feather);
  p._mk = key; p._mm = m; p._hard = SD.lut(m, a => SD.clamp((a - 190) * 5, 0, 255)); return m;
};
/* 누끼 결과(투명). 가장자리에 남은 배경색은 안쪽 색으로 바꿔 준다 */
SD.cutout = (src, p, o = {}) => {
  const m = SD.maskOf(p, o.shrink, o.feather), w = src.width, h = src.height, out = SD.cv(w, h), x = SD.x(out); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0);
  if (o.clean !== false && 'filter' in x) {
    const s = SD.fit(src, 700), core = SD.cv(s.width, s.height), cx = SD.x(core); cx.drawImage(s, 0, 0); cx.globalCompositeOperation = 'destination-in'; cx.drawImage(p._hard, 0, 0, core.width, core.height);
    const e = SD.copy(core), ex = SD.x(e); ex.globalCompositeOperation = 'destination-over'; [1, 2, 4, 8].forEach(r => { ex.filter = `blur(${r}px)`; for (let i = 0; i < 4; i++) ex.drawImage(core, 0, 0); });
    x.drawImage(e, 0, 0, w, h);
    const top = SD.cv(w, h), tx = SD.x(top); tx.drawImage(src, 0, 0); tx.globalCompositeOperation = 'destination-in'; tx.drawImage(p._hard, 0, 0, w, h); x.drawImage(top, 0, 0);
  }
  x.globalCompositeOperation = 'destination-in'; x.drawImage(m, 0, 0, w, h); return out;
};
/* 떨어진 작은 조각 지우기 */
SD.islands = (c, frac = .04) => {
  const x = SD.x(c), w = c.width, h = c.height, im = x.getImageData(0, 0, w, h), d = im.data, lab = new Int32Array(w * h), st = new Int32Array(w * h), sz = [0]; let n = 0;
  for (let i = 0; i < w * h; i++) {
    if (lab[i] || d[i * 4 + 3] < 40) continue; n++; let q = 0, k = 0; st[q++] = i; lab[i] = n;
    while (q) { const j = st[--q]; k++; const X = j % w; for (const t of [X > 0 ? j - 1 : -1, X < w - 1 ? j + 1 : -1, j - w, j + w]) if (t >= 0 && t < w * h && !lab[t] && d[t * 4 + 3] >= 40) { lab[t] = n; st[q++] = t; } }
    sz[n] = k;
  }
  const mx = sz.reduce((a, b) => Math.max(a, b), 0); for (let i = 0; i < w * h; i++) if (lab[i] && sz[lab[i]] < mx * frac) d[i * 4 + 3] = 0; x.putImageData(im, 0, 0);
};
/* 붓으로 다듬기 */
SD.editMask = async p => {
  const src = SD.fit(await p.get(), 1600), dlg = SD.$('dialog', { ariaLabel: '누끼 다듬기' }), v = SD.$('div', { class: 'v chk' }), cv = SD.$('canvas');
  let mode = 'erase', size = 40, soft = .4, tol = 28, z = 1, ox = 0, oy = 0, last = null, pos = null, pan = null, dirty = true; const undo = [];
  const work = SD.copy(p.mask), wx = SD.x(work), cut = SD.cv(work.width, work.height);
  const bt = (t, f) => SD.$('button', { class: 'btn s', textContent: t, onclick: f });
  const draw = () => {
    const w = v.clientWidth, h = v.clientHeight; if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const x = SD.x(cv); x.clearRect(0, 0, w, h);
    if (dirty) { const q = SD.x(cut); q.globalCompositeOperation = 'copy'; q.drawImage(src, 0, 0, cut.width, cut.height); q.globalCompositeOperation = 'destination-in'; q.drawImage(work, 0, 0); dirty = false; }
    x.globalAlpha = .22; x.drawImage(src, ox, oy, work.width * z, work.height * z); x.globalAlpha = 1; x.drawImage(cut, ox, oy, work.width * z, work.height * z);
    if (pos && (mode === 'erase' || mode === 'keep')) { x.beginPath(); x.arc(pos[0], pos[1], size / 2, 0, 7); x.lineWidth = 2; x.strokeStyle = mode === 'erase' ? '#c2491d' : '#0f6b66'; x.stroke(); }
    cv.style.cursor = mode === 'pan' ? 'grab' : mode === 'wand' ? 'crosshair' : 'none';
  };
  const modes = [['erase', '지우기'], ['keep', '되살리기'], ['wand', '비슷한 색 지우기'], ['pan', '옮기기']].map(([k, t]) => { const b = bt(t, () => { mode = k; modes.forEach(q => q.classList.toggle('on', q === b)); draw(); }); if (k === mode) b.classList.add('on'); return b; });
  const rg = (t, a, b, val, f, st = 1) => SD.$('label', {}, t, SD.$('input', { type: 'range', min: a, max: b, step: st, value: val, oninput: e => { f(+e.target.value); draw(); } }));
  const snap = () => { undo.push(SD.copy(work)); if (undo.length > 12) undo.shift(); };
  const fitv = () => { const w = v.clientWidth, h = v.clientHeight; z = Math.min(w / work.width, h / work.height) * .94; ox = (w - work.width * z) / 2; oy = (h - work.height * z) / 2; draw(); };
  const back = () => { if (undo.length) { wx.clearRect(0, 0, work.width, work.height); wx.drawImage(undo.pop(), 0, 0); dirty = true; draw(); } };
  const dab = (X, Y) => { const r = size / 2 / z, g = wx.createRadialGradient(X, Y, r * (1 - soft), X, Y, r); g.addColorStop(0, '#fff'); g.addColorStop(1, '#fff0'); wx.globalCompositeOperation = mode === 'erase' ? 'destination-out' : 'source-over'; wx.fillStyle = g; wx.beginPath(); wx.arc(X, Y, r, 0, 7); wx.fill(); wx.globalCompositeOperation = 'source-over'; dirty = true; };
  const im = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left - ox) / z, (e.clientY - r.top - oy) / z]; };
  const wand = (X, Y) => {
    X |= 0; Y |= 0; const w = work.width, h = work.height; if (X < 0 || Y < 0 || X >= w || Y >= h) return; snap();
    const s = SD.cv(w, h); SD.x(s).drawImage(src, 0, 0, w, h); const d = SD.x(s).getImageData(0, 0, w, h).data, mi = wx.getImageData(0, 0, w, h), i0 = (Y * w + X) * 4, C = [d[i0], d[i0 + 1], d[i0 + 2]], seen = new Uint8Array(w * h), st = [Y * w + X];
    while (st.length) { const j = st.pop(); if (seen[j]) continue; seen[j] = 1; const q = j * 4; if (Math.abs(d[q] - C[0]) + Math.abs(d[q + 1] - C[1]) + Math.abs(d[q + 2] - C[2]) > tol * 3) continue; mi.data[q + 3] = 0; const x = j % w; if (x > 0) st.push(j - 1); if (x < w - 1) st.push(j + 1); if (j >= w) st.push(j - w); if (j < w * (h - 1)) st.push(j + w); }
    wx.putImageData(mi, 0, 0); dirty = true; draw();
  };
  cv.onpointerdown = e => { try { cv.setPointerCapture(e.pointerId); } catch (er) { /* 시험용 이벤트 */ } if (mode === 'pan' || e.button === 1 || e.button === 2) { pan = [e.clientX - ox, e.clientY - oy]; return; } const q = im(e); if (mode === 'wand') return wand(...q); snap(); last = q; dab(...q); draw(); };
  cv.onpointermove = e => { const r = cv.getBoundingClientRect(); pos = [e.clientX - r.left, e.clientY - r.top]; if (pan) { ox = e.clientX - pan[0]; oy = e.clientY - pan[1]; } else if (last) { const q = im(e), dx = q[0] - last[0], dy = q[1] - last[1], n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / Math.max(1, size / z / 8))); for (let i = 1; i <= n; i++) dab(last[0] + dx * i / n, last[1] + dy * i / n); last = q; } draw(); };
  cv.onpointerup = cv.onpointercancel = () => { last = pan = null; }; cv.onpointerleave = () => { pos = null; draw(); }; cv.oncontextmenu = e => e.preventDefault();
  cv.onwheel = e => { e.preventDefault(); const r = cv.getBoundingClientRect(), X = e.clientX - r.left, Y = e.clientY - r.top, k = e.deltaY < 0 ? 1.15 : 1 / 1.15; ox = X - (X - ox) * k; oy = Y - (Y - oy) * k; z *= k; draw(); };
  return new Promise(ok => {
    let done = false; const end = s => { if (done) return; done = true; removeEventListener('resize', draw); dlg.close(); dlg.remove(); if (s) { p.mask = work; p.mv++; } ok(s); };
    dlg.onkeydown = e => { if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); back(); } };
    dlg.oncancel = e => { e.preventDefault(); end(false); };
    v.append(cv);
    dlg.append(SD.$('div', { class: 'ed' }, SD.$('div', { class: 'tbar' }, ...modes, rg('붓 크기', 6, 200, size, q => { size = q; }), rg('부드럽게', 0, 1, soft, q => { soft = q; }, .1), rg('색 비슷한 정도', 5, 80, tol, q => { tol = q; }), bt('작은 조각 지우기', () => { snap(); SD.islands(work); dirty = true; draw(); }), bt('↶ 되돌리기', back), bt('화면에 맞춤', fitv), bt('취소', () => end(false)), SD.$('button', { class: 'btn p', textContent: '다 다듬었어요', onclick: () => end(true) })), v));
    document.body.append(dlg); dlg.showModal(); addEventListener('resize', draw); fitv();
  });
};
