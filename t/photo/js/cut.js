/* 누끼따기 · 도장/서명 · 상품 사진 · 증명사진 */
/* 배경 빼기가 필요한 도구가 함께 쓰는 줄 세우기 */
SD.cutQueue = (B, st, done) => {
  const q = []; let on = false;
  const run = async () => {
    if (on) return; on = true;
    while (q.length) {
      const p = q.shift(); if (p._gone) continue;
      p.state = '처리 중'; p.maskFail = false; B.drawThumbs(); B.prog(0);
      try { await SD.ai.mask(p, st.engine, d => { if (d.t) B.msg(`${p.name} — ${d.t}`); if (d.prog != null) B.prog(d.prog); }); if (!SD.cover01(p.mask)) { p.state = '! 못 찾음'; B.msg(`${p.name} — 도드라진 대상을 못 찾았습니다. 다른 방식을 고르거나, 붓의 「되살리기」로 칠해 주세요.`); } else { p.state = '✓'; B.msg(`${p.name} 완료 — ${(p.ms / 1000).toFixed(1)}초${p.ep === 'webgpu' ? '(그래픽 가속)' : ''}${q.length ? ` · 남은 사진 ${q.length}장` : ''}`); } done && done(p); }
      catch (e) { p.state = '! 실패'; p.maskFail = true; B.msg(e.message); SD.toast(e.message); }
      B.prog(null); B.drawThumbs(); if (p === B.sel) B.refresh();
    }
    on = false;
  };
  return { add(p) { if (!q.includes(p)) { p.state = '기다림'; q.push(p); B.drawThumbs(); run(); } }, redo() { B.photos.forEach(p => { p.mask = null; this.add(p); }); B.refresh(); } };
};
SD.engineSpec = v => ({ k: 'engine', type: 'chips', label: '누끼 방식', v, opts: [['fast', '빠르게(사람)'], ['fine', '정밀하게(무엇이든)']] });
SD.engineHint = { type: 'html', t: '빠르게: 엔진 26MB, 한두 사람이 또렷한 사진용. 정밀하게: 엔진 99MB를 처음 한 번 받고, 물건·음식·단체 사진도 됩니다.' };
SD.waitMask = async (p, preview) => { if (p.mask) return true; if (preview || p.maskFail) return false; throw new Error('아직 누끼가 안 끝난 사진이 있습니다. 왼쪽 목록의 ✓ 표시를 기다려 주세요.'); };
/* 남은 부분이 너무 적으면 못 찾은 것 */
SD.cover01 = m => { const t = SD.cv(64, 64); SD.x(t).drawImage(m, 0, 0, 64, 64); const d = SD.x(t).getImageData(0, 0, 64, 64).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i]; return n / 255 / 4096 > .004; };
SD.cover = (x, im, w, h, fx = .5, fy = .5) => { const s = Math.max(w / im.width, h / im.height), W = im.width * s, H = im.height * s; x.drawImage(im, SD.clamp(w / 2 - fx * W, w - W, 0), SD.clamp(h / 2 - fy * H, h - H, 0), W, H); };
SD.editBtn = B => SD.$('button', { class: 'btn s', textContent: '붓으로 다듬기', onclick: async () => { const p = B.sel; if (!p || !p.mask) return SD.toast('누끼가 끝난 다음에 다듬을 수 있습니다.'); if (await SD.editMask(p)) B.refresh(); } });

SD.tool({
  id: 'cut', title: '누끼따기', icon: 'cut', group: 1, when: '사람·물건만 남기고 배경을 지울 때. 여러 장 한꺼번에',
  mount(root) {
    let st, Q;
    const B = SD.bench(root, {
      id: 'cut', title: '누끼따기', suf: '_누끼', fmt: () => st.bg === 'none' || st.fmt === 'png' ? ['image/png'] : ['image/jpeg', .93],
      sample: () => [[SD.demo.cup(), '컵.png'], [SD.demo.person(), '사람.png']],
      onAdd: p => Q.add(p),
      process: async (p, { preview, src }) => {
        if (!await SD.waitMask(p, preview)) return preview ? src : null;
        const c = SD.cutout(src, p, st), w = src.width, h = src.height, k = Math.max(w, h) / 1200; let out = c;
        if (st.outline || st.shadow) {
          out = SD.cv(w, h); const x = SD.x(out);
          if (st.outline) { const sil = SD.copy(c), sx = SD.x(sil); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = st.ocolor; sx.fillRect(0, 0, w, h); const r = st.outline * k, o2 = SD.cv(w, h), ox = SD.x(o2); for (let i = 0; i < 36; i++) ox.drawImage(sil, Math.cos(i * Math.PI / 18) * r, Math.sin(i * Math.PI / 18) * r); if (st.shadow) { x.shadowColor = '#0007'; x.shadowBlur = st.shadow * k; x.shadowOffsetY = st.shadow * k * .4; } x.drawImage(o2, 0, 0); x.shadowColor = 'transparent'; x.drawImage(c, 0, 0); }
          else { x.shadowColor = '#0007'; x.shadowBlur = st.shadow * k; x.shadowOffsetY = st.shadow * k * .4; x.drawImage(c, 0, 0); x.shadowColor = 'transparent'; x.drawImage(c, 0, 0); }
        }
        if (st.trim) { const s = SD.fit(out, 600), b = SD.bbox(s); if (b) { const z = out.width / s.width, m = 12 * k; const X = Math.max(0, b.x * z - m), Y = Math.max(0, b.y * z - m); out = SD.crop(out, { x: X, y: Y, w: Math.min(w - X, b.w * z + 2 * m), h: Math.min(h - Y, b.h * z + 2 * m) }); } }
        if (st.bg !== 'none') {
          const f = SD.cv(out.width, out.height), x = SD.x(f);
          if (st.bg === 'color') { x.fillStyle = st.color; x.fillRect(0, 0, f.width, f.height); }
          else if (st.bg === 'grad') { const g = x.createLinearGradient(0, 0, 0, f.height); g.addColorStop(0, st.color); g.addColorStop(1, st.color2); x.fillStyle = g; x.fillRect(0, 0, f.width, f.height); }
          else if (st.bg === 'blur') { const sm = SD.fit(src, 400); x.filter = `blur(${(10 * f.width / sm.width).toFixed(1)}px)`; SD.cover(x, sm, f.width * 1.1, f.height * 1.1); x.filter = 'none'; }
          else if (st.photo) SD.cover(x, st.photo, f.width, f.height);
          x.drawImage(out, 0, 0); out = f;
        }
        return out;
      },
      after: p => { B.cv.classList.toggle('chk', !!p.mask && (st.bg === 'none' || (st.bg === 'photo' && !st.photo))); }
    });
    st = SD.form(B.panel, 'cut', [
      SD.engineSpec('fine'), SD.engineHint,
      { k: 'bg', type: 'chips', label: '배경', v: 'none', opts: [['none', '투명'], ['color', '한 가지 색'], ['grad', '번지는 색'], ['photo', '다른 사진'], ['blur', '원래 배경 흐리게']] },
      { k: 'color', type: 'color', label: '배경색', v: '#ffffff', show: s => s.bg === 'color' || s.bg === 'grad' }, { k: 'color2', type: 'color', label: '아래쪽 색', v: '#bfe3dd', show: s => s.bg === 'grad' },
      { k: 'photo', type: 'file', label: '배경 사진', nosave: 1, show: s => s.bg === 'photo' },
      { k: 'shrink', type: 'range', label: '윤곽 안쪽·바깥쪽', min: -6, max: 6, v: 0 }, { k: 'feather', type: 'range', label: '윤곽 부드럽게', min: 0, max: 6, step: .5, v: 0 },
      { k: 'clean', type: 'check', label: '가장자리에 묻은 배경색 빼기', v: true }, { k: 'trim', type: 'check', label: '빈 둘레 잘라 내기', v: true },
      { k: 'outline', type: 'range', label: '둘레선(스티커처럼)', min: 0, max: 30, v: 0 }, { k: 'ocolor', type: 'color', label: '둘레선 색', v: '#ffffff', show: s => s.outline > 0 }, { k: 'shadow', type: 'range', label: '그림자', min: 0, max: 40, v: 0 },
      { k: 'fmt', type: 'chips', label: '파일', v: 'jpg', opts: [['jpg', 'JPG'], ['png', 'PNG']], show: s => s.bg !== 'none' }
    ], (s, k) => k === 'engine' ? Q.redo() : B.refresh());
    Q = SD.cutQueue(B, st); B.tbar.append(SD.editBtn(B)); B.outBar();
  }
});

/* 도장·서명: 종이의 밝기 얼룩을 지우고 잉크만 남긴다 */
SD.ink = (src, st) => {
  const w = src.width, h = src.height, c = SD.copy(src), x = SD.x(c), im = x.getImageData(0, 0, w, h), d = im.data, n = w * h, k = Math.min(1, 160 / Math.max(w, h)), sw = Math.max(4, Math.round(w * k)), sh = Math.max(4, Math.round(h * k));
  const s = SD.cv(sw, sh); SD.x(s).imageSmoothingQuality = 'high'; SD.x(s).drawImage(src, 0, 0, sw, sh); const sd = SD.x(s).getImageData(0, 0, sw, sh).data;
  /* 종이 색: 넓은 이웃에서 가장 밝은 쪽을 골라 번지게 한 것 */
  const paper = [0, 1, 2].map(ch => { let a = new Float32Array(sw * sh); for (let i = 0; i < a.length; i++) a[i] = sd[i * 4 + ch]; const R = Math.round(Math.max(sw, sh) / 5), mx = (a, dx, dy) => { const o = new Float32Array(a.length); for (let y = 0; y < sh; y++) for (let X = 0; X < sw; X++) { let m = 0; for (let t = -R; t <= R; t++) { const u = X + dx * t, v = y + dy * t; if (u >= 0 && v >= 0 && u < sw && v < sh) m = Math.max(m, a[v * sw + u]); } o[y * sw + X] = m; } return o; }, mn = (a, dx, dy) => { const o = new Float32Array(a.length); for (let y = 0; y < sh; y++) for (let X = 0; X < sw; X++) { let m = 255; for (let t = -R; t <= R; t++) { const u = X + dx * t, v = y + dy * t; if (u >= 0 && v >= 0 && u < sw && v < sh) m = Math.min(m, a[v * sw + u]); } o[y * sw + X] = m; } return o; }; a = mx(mx(a, 1, 0), 0, 1); a = mn(mn(a, 1, 0), 0, 1); return SD.boxBlur(a, sw, sh, 6); });
  const hex = [1, 3, 5].map(i => parseInt(st.color.slice(i, i + 2), 16)), lo = st.th / 100, hi = lo + .28 * (1 - st.strong / 130);
  const at = (a, X, Y) => { const fx = SD.clamp((X + .5) * sw / w - .5, 0, sw - 1), fy = SD.clamp((Y + .5) * sh / h - .5, 0, sh - 1), x0 = fx | 0, y0 = fy | 0, x1 = Math.min(sw - 1, x0 + 1), y1 = Math.min(sh - 1, y0 + 1), tx = fx - x0, ty = fy - y0; return (a[y0 * sw + x0] * (1 - tx) + a[y0 * sw + x1] * tx) * (1 - ty) + (a[y1 * sw + x0] * (1 - tx) + a[y1 * sw + x1] * tx) * ty; };
  for (let i = 0; i < n; i++) {
    const X = i % w, Y = (i / w) | 0, r = Math.min(1, d[i * 4] / Math.max(40, at(paper[0], X, Y))), g = Math.min(1, d[i * 4 + 1] / Math.max(40, at(paper[1], X, Y))), b = Math.min(1, d[i * 4 + 2] / Math.max(40, at(paper[2], X, Y)));
    let v; if (st.kind === 'red') v = Math.max(0, r - (g + b) / 2); else if (st.kind === 'blue') v = Math.max(0, b - r) * 1.3; else v = 1 - (r * .3 + g * .59 + b * .11);
    const a = SD.clamp((v - lo) / Math.max(.03, hi - lo), 0, 1);
    if (st.recolor) { d[i * 4] = hex[0]; d[i * 4 + 1] = hex[1]; d[i * 4 + 2] = hex[2]; }
    else { const A = Math.max(.35, a); d[i * 4] = SD.clamp((r - (1 - A)) / A * 255, 0, 255); d[i * 4 + 1] = SD.clamp((g - (1 - A)) / A * 255, 0, 255); d[i * 4 + 2] = SD.clamp((b - (1 - A)) / A * 255, 0, 255); }
    d[i * 4 + 3] = a * 255 * (d[i * 4 + 3] / 255);
  }
  x.putImageData(im, 0, 0); return c;
};
SD.tool({
  id: 'stamp', title: '도장·서명 투명하게', icon: 'stamp', group: 1, when: '종이에 찍은 도장·서명 사진을 투명 PNG로. 견적서·수료증에 바로',
  mount(root) {
    let st;
    const kindOf = p => { if (!p.st.kind) { const s = SD.fit(p.pv, 160), d = SD.x(SD.copy(s)).getImageData(0, 0, s.width, s.height).data; let r = 0, b = 0; for (let i = 0; i < d.length; i += 4) { if (d[i] - (d[i + 1] + d[i + 2]) / 2 > 60) r++; if (d[i + 2] - d[i] > 60) b++; } const n = d.length / 4; p.st.kind = r > n * .004 ? 'red' : b > n * .004 ? 'blue' : 'black'; } };
    const B = SD.bench(root, {
      id: 'stamp', title: '도장서명', suf: '_투명', sample: () => [[SD.demo.stamp(), '도장.png'], [SD.demo.sign(), '서명.png']],
      text: '흰 종이에 찍은 도장이나 서명을 가까이서 찍어 넣으세요. 도장이 든 PDF도 됩니다.',
      onPick: p => { kindOf(p); st.$set('kind', p.st.kind); },
      process: (p, { preview, src }) => {
        kindOf(p); const o = { ...st, kind: p.st.kind }; let c = SD.ink(src, o);
        if (o.island) SD.islands(c, o.island / 1000);
        const b = SD.bbox(c, 30); if (b) { const m = Math.round(Math.max(b.w, b.h) * .03) + 1; b.x = Math.max(0, b.x - m); b.y = Math.max(0, b.y - m); b.w = Math.min(c.width - b.x, b.w + 2 * m); b.h = Math.min(c.height - b.y, b.h + 2 * m); c = SD.crop(c, b); }
        if (o.rot) { const r = o.rot * Math.PI / 180, q = SD.cv(c.width * Math.abs(Math.cos(r)) + c.height * Math.abs(Math.sin(r)), c.width * Math.abs(Math.sin(r)) + c.height * Math.abs(Math.cos(r))), x = SD.x(q); x.translate(q.width / 2, q.height / 2); x.rotate(r); x.drawImage(c, -c.width / 2, -c.height / 2); c = q; }
        return preview ? c : SD.fit(c, o.px, true);
      }
    });
    B.cv.classList.add('chk');
    st = SD.form(B.panel, 'stamp', [
      { type: 'html', cls: 'note', t: '본인 도장이나 우리 기관 도장만 쓰세요. 남의 도장·서명을 따서 쓰면 문서위조가 될 수 있습니다.' },
      { k: 'kind', type: 'chips', label: '잉크 색(사진마다)', v: 'red', nosave: 1, opts: [['red', '빨간 도장'], ['black', '검은 서명'], ['blue', '파란 잉크']] },
      { k: 'th', type: 'range', label: '얼룩 지우기', min: 2, max: 50, v: 12 }, { k: 'strong', type: 'range', label: '진하게', min: 0, max: 100, v: 50 },
      { k: 'recolor', type: 'check', label: '한 가지 색으로 또렷하게', v: false }, { k: 'color', type: 'color', label: '색', v: '#c8202c', show: s => s.recolor },
      { k: 'island', type: 'range', label: '떨어진 점 지우기', min: 0, max: 100, v: 0, fmt: v => v ? v : '안 함' },
      { k: 'rot', type: 'range', label: '기울기', min: -20, max: 20, step: .5, v: 0, u: '°', nosave: 1 }, { k: 'px', type: 'select', label: '크기(긴 쪽)', v: '600', opts: [['300', '300px'], ['600', '600px'], ['1000', '1000px']] }
    ], (s, k) => { if (k === 'kind' && B.sel) B.sel.st.kind = s.kind; B.refresh(); });
    B.outBar();
  }
});

SD.tool({
  id: 'product', title: '상품 사진', icon: 'box', group: 1, when: '물건을 흰 배경 가운데로. 여러 상품을 같은 크기로 맞춤',
  mount(root) {
    let st, Q;
    const B = SD.bench(root, {
      id: 'product', title: '상품사진', suf: '_상품', fmt: () => st.fmt === 'png' ? ['image/png'] : ['image/jpeg', .94],
      sample: () => [[SD.demo.cup(), '빨간 컵.png'], [SD.demo.cup('#2f7a8c', ['#b79f83', '#6e8794']), '파란 컵.png']],
      onAdd: p => Q.add(p),
      process: async (p, { preview, src }) => {
        if (!await SD.waitMask(p, preview)) return preview ? src : null;
        const c = SD.cutout(src, p, { shrink: 1, clean: true }), s = SD.fit(c, 600), b = SD.bbox(s, 40); if (!b) return src;
        const z = c.width / s.width, o = SD.crop(c, { x: b.x * z, y: b.y * z, w: b.w * z, h: b.h * z }), W = +st.px, H = Math.round(W * (st.ratio === '4:5' ? 1.25 : st.ratio === '4:3' ? .75 : 1)), f = SD.cv(W, H), x = SD.x(f); x.imageSmoothingQuality = 'high';
        if (st.bg !== 'none') { x.fillStyle = st.bg === 'white' ? '#fff' : st.color; x.fillRect(0, 0, W, H); }
        const m = st.margin / 100, k = Math.min(W * (1 - 2 * m) / o.width, H * (1 - 2 * m) / o.height), w = o.width * k, h = o.height * k, X = (W - w) / 2, Y = st.align === 'bottom' ? H * (1 - m) - h : (H - h) / 2;
        if (st.sh) { x.save(); x.filter = `blur(${(W * .016).toFixed(1)}px)`; x.globalAlpha = st.sh / 100; x.fillStyle = '#000'; x.beginPath(); x.ellipse(W / 2, Y + h * .985, w * .42, Math.max(W * .012, h * .03), 0, 0, 7); x.fill(); x.restore(); }
        x.drawImage(o, X, Y, w, h); return preview ? SD.fit(f, 900) : f;
      }, after: p => B.cv.classList.toggle('chk', !!p.mask && st.bg === 'none')
    });
    st = SD.form(B.panel, 'product', [SD.engineSpec('fine'), SD.engineHint,
      { k: 'bg', type: 'chips', label: '배경', v: 'white', opts: [['white', '흰색'], ['color', '다른 색'], ['none', '투명(PNG)']] }, { k: 'color', type: 'color', label: '배경색', v: '#f3efe7', show: s => s.bg === 'color' },
      { k: 'ratio', type: 'chips', label: '모양', v: '1:1', opts: [['1:1', '정사각'], ['4:5', '세로'], ['4:3', '가로']] }, { k: 'px', type: 'select', label: '가로 크기', v: '1000', opts: [['600', '600px'], ['860', '860px'], ['1000', '1000px(쇼핑몰)'], ['2000', '2000px(인쇄)']] },
      { k: 'margin', type: 'range', label: '둘레 여백', min: 2, max: 30, v: 12, u: '%' }, { k: 'align', type: 'chips', label: '자리', v: 'mid', opts: [['mid', '가운데'], ['bottom', '바닥에 맞춤']] }, { k: 'sh', type: 'range', label: '바닥 그림자', min: 0, max: 60, v: 28 },
      { k: 'fmt', type: 'chips', label: '파일', v: 'jpg', opts: [['jpg', 'JPG'], ['png', 'PNG']], show: s => s.bg !== 'none' }], (s, k) => { if (s.bg === 'none') s.fmt = 'png'; k === 'engine' ? Q.redo() : B.refresh(); });
    Q = SD.cutQueue(B, st); B.tbar.append(SD.editBtn(B)); B.outBar();
  }
});

/* 증명사진 */
const ID = { '3x4': [30, 40, '3×4cm 반명함'], '3.5x4.5': [35, 45, '3.5×4.5cm 여권 크기'], '2.5x3': [25, 30, '2.5×3cm'], '5x7': [50, 70, '5×7cm 명함판'] };
/* 윤곽에서 머리 꼭대기와 목을 찾는다 */
SD.headOf = p => {
  const m = SD.fit(p.mask, 300), w = m.width, h = m.height, d = SD.x(SD.copy(m)).getImageData(0, 0, w, h).data, W = [], C = []; let top = -1;
  for (let y = 0; y < h; y++) { let n = 0, s = 0; for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 128) { n++; s += x; } W.push(n); C.push(n ? s / n : 0); if (top < 0 && n > w * .02) top = y; }
  if (top < 0) return null;
  const S = W.map((_, i) => { let a = 0, k = 0; for (let j = Math.max(0, i - 3); j <= Math.min(h - 1, i + 3); j++) { a += W[j]; k++; } return a / k; });
  let mx = 0, pk = top, neck = 0; for (let y = top; y < h; y++) { if (S[y] > mx) { mx = S[y]; pk = y; } if (y - pk > 4 && S[y] < mx * .84) { let k = y; while (k < h - 1 && S[k + 1] <= S[k]) k++; neck = k; break; } }
  const hh = neck ? (neck - top) * .93 : Math.min(h - top, mx * 1.35) * .6; let cx = 0, k = 0; for (let y = top; y < top + hh && y < h; y++) if (W[y]) { cx += C[y]; k++; }
  return { top: top / h, head: hh / h, cx: cx / k / w, sure: !!neck };
};
SD.tool({
  id: 'idphoto', title: '증명사진·프로필', icon: 'id', group: 1, when: '배경색을 바꾸고 규격에 맞춰, A4·인화지에 여러 장 배열',
  mount(root) {
    let st, Q;
    const one = (p, src, W, H) => {
      const f = SD.cv(W, H), x = SD.x(f); x.imageSmoothingQuality = 'high'; x.fillStyle = st.color; x.fillRect(0, 0, W, H); if (!p.st.h) p.st.h = SD.headOf(p) || { top: .1, head: .4, cx: .5 };
      const h = p.st.h, c = SD.cutout(src, p, { shrink: 1 }), u = p.st.u || { dx: 0, dy: 0, z: 1 }, k = H * st.head / 100 / (h.head * c.height) * u.z; x.drawImage(c, W / 2 - h.cx * c.width * k + u.dx * W, H * st.top / 100 - h.top * c.height * k + u.dy * H, c.width * k, c.height * k); return f;
    };
    const dim = () => ID[st.size], px = mm => Math.round(mm / 25.4 * 300);
    const sheet = async () => {
      const [mw, mh] = dim(), [PW, PH] = st.paper === 'a4' ? [210, 297] : [102, 152], gap = 2, mg = st.paper === 'a4' ? 10 : 4, nx = Math.floor((PW - 2 * mg + gap) / (mw + gap)), ny = Math.floor((PH - 2 * mg + gap) / (mh + gap)), f = SD.cv(px(PW), px(PH)), x = SD.x(f); x.fillStyle = '#fff'; x.fillRect(0, 0, f.width, f.height);
      const list = st.who === 'all' ? B.photos.filter(p => p.mask) : [B.sel]; if (!list[0] || !list[0].mask) throw new Error('누끼가 끝난 사진이 없습니다.'); const ims = []; for (const p of list) ims.push(one(p, await p.get(), px(mw), px(mh)));
      const ox = (PW - nx * mw - (nx - 1) * gap) / 2, oy = (PH - ny * mh - (ny - 1) * gap) / 2; for (let i = 0; i < nx * ny; i++) { const X = px(ox + (i % nx) * (mw + gap)), Y = px(oy + Math.floor(i / nx) * (mh + gap)); x.drawImage(ims[Math.floor(i * ims.length / (nx * ny))], X, Y); x.strokeStyle = '#bbb'; x.lineWidth = 1; x.strokeRect(X - .5, Y - .5, px(mw) + 1, px(mh) + 1); }
      return { canvas: f, mmW: PW, mmH: PH, n: nx * ny };
    };
    const B = SD.bench(root, {
      id: 'idphoto', title: '증명사진', nopdf: true, suf: '_증명', fmt: () => ['image/jpeg', .95], sample: () => [[SD.demo.person(), '사람.png']], text: '얼굴과 어깨가 나온 사진을 넣으세요.', onAdd: p => Q.add(p),
      process: async (p, { preview, src }) => {
        if (!await SD.waitMask(p, preview)) return preview ? src : null; const [mw, mh] = dim(), W = preview ? Math.round(700 * mw / mh) : px(mw), H = preview ? 700 : px(mh), f = one(p, src, W, H);
        if (preview && st.guide) { const x = SD.x(f); x.setLineDash([8, 6]); x.strokeStyle = '#e2452b'; x.lineWidth = 1.5; [st.top, st.top + st.head].forEach(v => { x.beginPath(); x.moveTo(0, H * v / 100); x.lineTo(W, H * v / 100); x.stroke(); }); x.beginPath(); x.moveTo(W / 2, 0); x.lineTo(W / 2, H); x.stroke(); }
        return f;
      },
      after: p => { if (p.mask && p.st.h) B.msg('사진을 끌어 옮기고, 휠로 크기를 맞추세요.' + (p.st.h.sure === false ? ' 얼굴 위치를 확실히 못 찾았으니 맞춰 주세요.' : '')); }
    });
    let dr = null; const U = () => B.sel.st.u = B.sel.st.u || { dx: 0, dy: 0, z: 1 };
    B.cv.onpointerdown = e => { if (!B.sel || !B.sel.mask) return; dr = [e.clientX, e.clientY, { ...U() }]; B.cv.setPointerCapture(e.pointerId); }; B.cv.onpointermove = e => { if (!dr) return; const u = U(); u.dx = dr[2].dx + (e.clientX - dr[0]) / B.cv.clientWidth; u.dy = dr[2].dy + (e.clientY - dr[1]) / B.cv.clientHeight; B.refresh(); }; B.cv.onpointerup = () => { dr = null; };
    B.cv.addEventListener('wheel', e => { if (!B.sel || !B.sel.mask) return; e.preventDefault(); const u = U(); u.z = SD.clamp(u.z * (e.deltaY < 0 ? 1.03 : 1 / 1.03), .3, 4); B.refresh(); }, { passive: false });
    st = SD.form(B.panel, 'idphoto', [{ type: 'html', cls: 'note', t: '여권·운전면허는 접수하는 곳의 사진 기준을 꼭 확인하세요. 배경을 고친 사진을 받지 않는 곳도 있습니다.' }, SD.engineSpec('fast'),
      { k: 'size', type: 'select', label: '규격', v: '3x4', opts: Object.entries(ID).map(([k, v]) => [k, v[2]]) }, { k: 'color', type: 'color', label: '배경색', v: '#ffffff' },
      { type: 'button', label: '하늘색 배경', on: () => { st.$set('color', '#cfe3f5'); B.refresh(); } },
      { k: 'head', type: 'range', label: '머리 길이', min: 30, max: 85, v: 62, u: '%' }, { k: 'top', type: 'range', label: '머리 위 여백', min: 2, max: 30, v: 11, u: '%' }, { k: 'guide', type: 'check', label: '맞춤선 보기', v: true },
      { k: 'paper', type: 'chips', label: '배열할 종이', v: '4x6', opts: [['4x6', '인화지 4×6'], ['a4', 'A4']] }, { k: 'who', type: 'chips', label: '배열할 사진', v: 'one', opts: [['one', '지금 사진만'], ['all', '모두 섞어서']] }], (s, k) => k === 'engine' ? Q.redo() : B.refresh());
    Q = SD.cutQueue(B, st, p => { p.st.h = null; }); B.tbar.append(SD.editBtn(B), SD.$('button', { class: 'btn s', textContent: '처음 자리로', onclick: () => { B.sel.st.u = null; B.refresh(); } }));
    const go = pdf => async () => { try { const s = await sheet(); SD.save(pdf ? await SD.pdf([s]) : await SD.blob(s.canvas, 'image/jpeg', .95), `증명사진_${s.n}장_${st.paper}.${pdf ? 'pdf' : 'jpg'}`); SD.toast(`${s.n}장을 배열했습니다. 인쇄할 때 「실제 크기(100%)」를 고르세요.`); } catch (e) { SD.toast(e.message); } };
    B.outBar(SD.$('button', { class: 'btn', textContent: '종이에 배열해 PDF 받기', onclick: go(true) }), SD.$('button', { class: 'btn', textContent: '종이에 배열해 JPG 받기(인화)', onclick: go(false) }));
  }
});
