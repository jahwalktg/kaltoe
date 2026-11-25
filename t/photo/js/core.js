/* 공통 부품: 사진 읽기, 목록·미리보기 틀(bench), 설정 칸(form), zip·pdf, 이어서 손질 */
const SD = { tools: [], carry: null };
SD.tool = t => SD.tools.push(t);
SD.$ = (tag, props = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const k in props) {
    if (k === 'class') e.className = props[k];
    else if (k.startsWith('on')) e[k] = props[k];
    else if (k in e) e[k] = props[k];
    else e.setAttribute(k, props[k]);
  }
  e.append(...kids.filter(x => x != null)); return e;
};
SD.cv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
SD.x = c => c.getContext('2d');
SD.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
let toastT;
SD.toast = s => { const t = document.getElementById('toast'); t.textContent = s; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 4200); };
SD.fit = (src, max, up) => { const s = Math.min(up ? 9 : 1, max / Math.max(src.width, src.height)); if (s === 1) return src; const c = SD.cv(src.width * s, src.height * s), x = SD.x(c); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, c.width, c.height); return c; };
SD.copy = src => { const c = SD.cv(src.width, src.height); SD.x(c).drawImage(src, 0, 0); return c; };
SD.base = n => n.replace(/\.[^.]+$/, '');
SD.size = b => b >= 1048576 ? (b / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(b / 1024)) + 'KB';
SD.blob = (c, type = 'image/png', q = .92) => new Promise((ok, no) => c.toBlob(b => b ? ok(b) : no(new Error('그림을 만들지 못했습니다')), type, q));
SD.ext = t => ({ 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'application/pdf': '.pdf' })[t];
SD.save = (blob, name) => { const u = URL.createObjectURL(blob), a = SD.$('a', { href: u, download: name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 30000); SD.lastSaved = { name, size: blob.size, blob }; };
SD.flat = (c, color = '#fff') => { const o = SD.cv(c.width, c.height), x = SD.x(o); x.fillStyle = color; x.fillRect(0, 0, o.width, o.height); x.drawImage(c, 0, 0); return o; };
SD.bbox = (c, th = 12) => {
  const { width: w, height: h } = c, d = SD.x(c).getImageData(0, 0, w, h).data; let l = w, t = h, r = -1, b = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > th) { if (x < l) l = x; if (x > r) r = x; if (y < t) t = y; if (y > b) b = y; }
  return r < 0 ? null : { x: l, y: t, w: r - l + 1, h: b - t + 1 };
};
SD.crop = (c, b) => { const o = SD.cv(b.w, b.h); SD.x(o).drawImage(c, b.x, b.y, b.w, b.h, 0, 0, o.width, o.height); return o; };
SD.safe = n => n.replace(/[\\/:*?"<>|]/g, '_');
SD.uniq = names => { const seen = new Set(); return names.map(n => { n = SD.safe(n); let r = n, m = 1; while (seen.has(r.toLowerCase())) { m++; r = /\.[^.]+$/.test(n) ? n.replace(/(\.[^.]+)$/, ` (${m})$1`) : `${n} (${m})`; } seen.add(r.toLowerCase()); return r; }); };

/* zip (무압축) */
SD.zip = async files => {
  if (!SD._crc) { SD._crc = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; SD._crc[n] = c; } }
  const names = SD.uniq(files.map(f => f.name)), parts = [], cen = []; let off = 0;
  for (let i = 0; i < files.length; i++) {
    const d = new Uint8Array(await files[i].blob.arrayBuffer()), nm = new TextEncoder().encode(names[i]); let c = -1;
    for (let k = 0; k < d.length; k++) c = SD._crc[(c ^ d[k]) & 255] ^ (c >>> 8);
    c = (c ^ -1) >>> 0;
    const h = new DataView(new ArrayBuffer(30)); h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x800, true); h.setUint16(12, 33, true); h.setUint32(14, c, true); h.setUint32(18, d.length, true); h.setUint32(22, d.length, true); h.setUint16(26, nm.length, true);
    const e = new DataView(new ArrayBuffer(46)); e.setUint32(0, 0x02014b50, true); e.setUint16(4, 20, true); e.setUint16(6, 20, true); e.setUint16(8, 0x800, true); e.setUint16(14, 33, true); e.setUint32(16, c, true); e.setUint32(20, d.length, true); e.setUint32(24, d.length, true); e.setUint16(28, nm.length, true); e.setUint32(42, off, true);
    parts.push(h.buffer, nm, d); cen.push(e.buffer, nm); off += 30 + nm.length + d.length;
  }
  const cl = cen.reduce((a, p) => a + p.byteLength, 0), z = new DataView(new ArrayBuffer(22));
  z.setUint32(0, 0x06054b50, true); z.setUint16(8, files.length, true); z.setUint16(10, files.length, true); z.setUint32(12, cl, true); z.setUint32(16, off, true);
  return new Blob([...parts, ...cen, z.buffer], { type: 'application/zip' });
};
/* 사진 여러 장 → PDF. pages: [{canvas, mmW, mmH}] */
SD.pdf = async pages => {
  const enc = s => new TextEncoder().encode(s), out = [], pos = []; let off = 0;
  const put = u => { out.push(u); off += u.length; }, obj = (n, ...b) => { pos[n] = off; put(enc(`${n} 0 obj\n`)); b.forEach(x => put(typeof x === 'string' ? enc(x) : x)); put(enc('\nendobj\n')); };
  put(enc('%PDF-1.4\n')); obj(1, '<</Type/Catalog/Pages 2 0 R>>');
  obj(2, `<</Type/Pages/Count ${pages.length}/Kids[${pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}]>>`);
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i], n = 3 + i * 3, W = (p.mmW * 72 / 25.4).toFixed(2), H = (p.mmH * 72 / 25.4).toFixed(2), j = new Uint8Array(await (await SD.blob(SD.flat(p.canvas), 'image/jpeg', .92)).arrayBuffer()), s = `q ${W} 0 0 ${H} 0 0 cm /I Do Q`;
    obj(n, `<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${W} ${H}]/Contents ${n + 1} 0 R/Resources<</XObject<</I ${n + 2} 0 R>>>>>>`);
    obj(n + 1, `<</Length ${s.length}>>stream\n${s}\nendstream`);
    obj(n + 2, `<</Type/XObject/Subtype/Image/Width ${p.canvas.width}/Height ${p.canvas.height}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${j.length}>>stream\n`, j, '\nendstream');
  }
  const x = off, N = pos.length;
  put(enc(`xref\n0 ${N}\n0000000000 65535 f \n` + pos.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer<</Size ${N}/Root 1 0 R>>\nstartxref\n${x}\n%%EOF`));
  return new Blob(out, { type: 'application/pdf' });
};
/* 사진에 숨은 정보(위치·찍은 때) */
SD.exif = async file => {
  const r = { gps: false, date: '' }; if (!/jpe?g/i.test(file.type)) return r;
  try {
    const v = new DataView(await file.slice(0, 262144).arrayBuffer()); let p = 2;
    while (p < v.byteLength - 4) {
      const m = v.getUint16(p), len = v.getUint16(p + 2); if ((m & 0xff00) !== 0xff00 || m === 0xffda) break;
      if (m === 0xffe1 && v.getUint32(p + 4) === 0x45786966) {
        const t = p + 10, le = v.getUint16(t) === 0x4949, g16 = o => v.getUint16(o, le), g32 = o => v.getUint32(o, le);
        const ifd = o => { const n = g16(t + o); for (let i = 0; i < n; i++) { const e = t + o + 2 + i * 12, tag = g16(e); if (tag === 0x8825) r.gps = g16(t + g32(e + 8)) > 1; if (tag === 0x8769) ifd(g32(e + 8)); if (tag === 0x9003 || (tag === 0x0132 && !r.date)) { let s = ''; const a = t + g32(e + 8); for (let k = 0; k < 19; k++) s += String.fromCharCode(v.getUint8(a + k)); if (/^\d{4}:\d\d/.test(s)) r.date = s.slice(0, 10).replace(/:/g, '-'); } } };
        ifd(g32(t + 4)); break;
      }
      p += 2 + len;
    }
  } catch (e) { /* 정보가 없거나 깨진 사진 */ }
  return r;
};
/* 사진 한 장. 원본은 필요할 때만 펼쳐 메모리를 아낀다 */
let pid = 0; const opened = [];
SD.photo = async (file, name, cap = 3000) => {
  const isFile = file instanceof Blob, p = { id: ++pid, name: name || file.name || '붙여 넣은 사진.png', file: isFile ? file : null, st: {}, meta: {} };
  if (isFile) {
    p.meta = await SD.exif(file);
    p.get = async () => {
      if (p._c) { const i = opened.indexOf(p); if (i >= 0) { opened.splice(i, 1); opened.push(p); } return p._c; }
      let b;
      try { b = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
      catch (e) {
        b = new Image(); const u = URL.createObjectURL(file);
        try { b.src = u; await b.decode(); }
        catch (e2) { throw new Error(/hei[cf]/i.test(p.name + file.type) ? '아이폰 사진(HEIC)은 이 브라우저가 못 엽니다. 사진 앱에서 JPG로 저장하거나, 아이폰 설정 › 카메라 › 포맷 › 「높은 호환성」으로 바꿔 주세요.' : '열 수 없는 그림 파일입니다.'); }
        finally { setTimeout(() => URL.revokeObjectURL(u), 2000); }
      }
      const w = b.width, h = b.height, s = Math.min(1, cap / Math.max(w, h)), c = SD.cv(w * s, h * s), x = SD.x(c);
      x.imageSmoothingQuality = 'high'; x.drawImage(b, 0, 0, c.width, c.height); b.close && b.close();
      p._c = c; p.ow = w; p.oh = h; opened.push(p); if (opened.length > 5) { const o = opened.shift(); o._c = null; } return c;
    };
  } else { p._c = file; p.ow = file.width; p.oh = file.height; p.get = async () => p._c; }
  const c = await p.get(); p.w = c.width; p.h = c.height; p.pv = SD.copy(SD.fit(c, 1200)); p.th = SD.copy(SD.fit(c, 220)); return p;
};
/* 설정 칸 */
SD.form = (root, key, spec, onchange) => {
  let saved = {}; try { saved = JSON.parse(localStorage.getItem('sonjil.' + key)) || {}; } catch (e) { saved = {}; }
  const st = {}, rows = [];
  spec.forEach(f => { if (f.k) st[f.k] = !f.nosave && saved[f.k] !== undefined ? saved[f.k] : f.v; });
  const vis = () => rows.forEach(([el, f]) => { if (f.show) el.hidden = !f.show(st); });
  const fire = k => { try { const o = {}; spec.forEach(f => { if (f.k && !f.nosave && f.type !== 'file') o[f.k] = st[f.k]; }); localStorage.setItem('sonjil.' + key, JSON.stringify(o)); } catch (e) { /* 저장 안 되어도 쓸 수 있음 */ } vis(); onchange(st, k); };
  st.$set = (k, v) => { st[k] = v; rows.forEach(([, f, sync]) => f.k === k && sync && sync()); };
  spec.forEach(f => {
    let el, sync; const id = 'f_' + key + '_' + f.k;
    if (f.type === 'html') { el = SD.$('p', { class: f.cls || 'hint' }); el.textContent = f.t; }
    else if (f.type === 'button') el = SD.$('div', { class: 'f' }, SD.$('button', { class: 'btn s', textContent: f.label, onclick: f.on }));
    else if (f.type === 'check') { const i = SD.$('input', { type: 'checkbox', id, onchange: () => { st[f.k] = i.checked; fire(f.k); } }); sync = () => { i.checked = !!st[f.k]; }; el = SD.$('div', { class: 'f ck' }, SD.$('label', { htmlFor: id }, i, SD.$('span', { textContent: f.label }))); }
    else if (f.type === 'chips') {
      const box = SD.$('div', { class: 'chips', role: 'group', ariaLabel: f.label });
      f.opts.forEach(([v, t]) => { const b = SD.$('button', { type: 'button', textContent: t, onclick: () => { if (f.multi) { const s = new Set(st[f.k]); s.has(v) ? s.delete(v) : s.add(v); st[f.k] = [...s]; } else st[f.k] = v; sync(); fire(f.k); } }); b._v = v; box.append(b); });
      sync = () => [...box.children].forEach(b => { const on = f.multi ? st[f.k].includes(b._v) : st[f.k] === b._v; b.classList.toggle('on', on); b.ariaPressed = on; });
      el = SD.$('div', { class: 'f' }, SD.$('div', { class: 'l', textContent: f.label }), box);
    }
    else if (f.type === 'file') {
      const i = SD.$('input', { type: 'file', accept: 'image/*' + (f.pdf ? ',application/pdf,.pdf' : ''), hidden: true, onchange: async () => { const pick = i.files[0]; i.value = ''; if (!pick) return; try { let p; if (f.pdf && SD.isPdf(pick)) { const a = await SD.pdfPick(pick, key, true); if (!a.length) return; p = await SD.photo(a[0].canvas, a[0].name); } else p = await SD.photo(pick); st[f.k] = await p.get(); b.textContent = '✓ ' + p.name; fire(f.k); } catch (e) { SD.toast(e.message); } } });
      const b = SD.$('button', { class: 'btn s', textContent: f.btn || '그림 고르기', onclick: () => i.click() });
      el = SD.$('div', { class: 'f' }, SD.$('div', { class: 'l', textContent: f.label }), b, i);
    }
    else if (f.type === 'select') { const i = SD.$('select', { id, onchange: () => { st[f.k] = i.value; fire(f.k); } }); f.opts.forEach(([v, t]) => i.append(new Option(t, v))); sync = () => { i.value = st[f.k]; }; el = SD.$('div', { class: 'f' }, SD.$('label', { htmlFor: id, textContent: f.label }), i); }
    else {
      const o = SD.$('output'), i = SD.$(f.type === 'area' ? 'textarea' : 'input', { id }); if (f.type !== 'area') i.type = f.type; else i.rows = 2;
      ['min', 'max', 'step', 'placeholder'].forEach(a => { if (f[a] != null) i[a] = f[a]; });
      const num = f.type === 'range' || f.type === 'number', show = () => { if (f.type === 'range') o.textContent = f.fmt ? f.fmt(st[f.k]) : st[f.k] + (f.u || ''); };
      i.oninput = () => { if (num && i.value === '') return; st[f.k] = num ? +i.value : i.value; show(); fire(f.k); };
      sync = () => { i.value = st[f.k]; show(); };
      el = SD.$('div', { class: 'f' }, SD.$('label', { htmlFor: id }, f.label, o), i);
    }
    sync && sync(); root.append(el); rows.push([el, f, sync]);
  });
  vis(); return st;
};
/* 사진 받는 칸 */
SD.isPic = f => /^image\//.test(f.type) || /\.(jpe?g|png|webp|gif|bmp|hei[cf]|avif)$/i.test(f.name);
SD.isPdf = f => f.type === 'application/pdf' || /\.pdf$/i.test(f.name || '');
SD.okFile = (f, pdf) => SD.isPic(f) || (pdf && SD.isPdf(f));
SD.drop = opt => {
  const add = fs => { const n = fs.length; fs = fs.filter(f => SD.okFile(f, opt.pdf)); if (!fs.length) return SD.toast(opt.pdf ? '사진(JPG·PNG 등)이나 PDF 파일을 넣어 주세요.' : '사진 파일(JPG·PNG 등)을 넣어 주세요.'); if (fs.length < n) SD.toast(`쓸 수 없는 파일 ${n - fs.length}개는 뺐습니다.`); opt.add(fs); };
  const inp = SD.$('input', { type: 'file', accept: 'image/*,.heic,.heif' + (opt.pdf ? ',application/pdf,.pdf' : ''), multiple: opt.multiple !== false, hidden: true, onchange: () => { add([...inp.files]); inp.value = ''; } });
  const el = SD.$('div', { class: 'drop ' + (opt.mini ? 'mini' : '') }, SD.$('div', { textContent: opt.text || (opt.pdf ? '여기에 사진이나 PDF를 끌어다 놓거나, 복사한 그림을 붙여 넣으세요(Ctrl+V)' : '여기에 사진을 끌어다 놓거나, 복사한 그림을 붙여 넣으세요(Ctrl+V)') }), SD.$('button', { class: 'btn' + (opt.mini ? ' s' : ' p'), textContent: opt.btn || (opt.pdf ? '사진·PDF 고르기' : '사진 고르기'), onclick: () => inp.click() }), opt.sample ? SD.$('button', { class: 'btn' + (opt.mini ? ' s' : ''), textContent: '예시로 해 보기', onclick: opt.sample }) : null, inp);
  el.ondragover = e => { e.preventDefault(); el.classList.add('on'); }; el.ondragleave = () => el.classList.remove('on');
  el.ondrop = e => { e.preventDefault(); e.stopPropagation(); el.classList.remove('on'); add([...e.dataTransfer.files]); };
  return el;
};
/* 결과 이어서 손질하기 */
SD.next = (cur, getItems) => {
  const s = SD.$('select', { class: 'btn', ariaLabel: '이 결과로 이어서 손질하기' }); s.append(new Option('이 결과로 이어서 손질 →', ''));
  SD.tools.filter(t => t.id !== cur && !t.nocarry).forEach(t => s.append(new Option(t.title, t.id)));
  s.onchange = async () => { const id = s.value; s.value = ''; if (!id) return; try { const a = await getItems(); if (!a.length) return SD.toast('먼저 사진을 넣어 주세요.'); SD.carry = a; location.hash = id; } catch (e) { SD.toast(e.message); } };
  return s;
};
/* 사진 목록 + 미리보기 + 설정 틀 */
SD.bench = (root, o) => {
  const B = { photos: [], sel: null, root };
  const thumbs = SD.$('div', { class: 'thumbs' }), stage = SD.$('div', { class: 'stage' }), panel = SD.$('div', { class: 'panel' }), body = SD.$('div', { class: 'bench', hidden: true }, thumbs, stage, panel);
  const tbar = SD.$('div', { class: 'tbar' }), view = SD.$('div'), cv = SD.$('canvas', { class: 'cv' }), msg = SD.$('p', { class: 'msg', role: 'status' }), bar = SD.$('div', { class: 'bar', hidden: true }, SD.$('i'));
  view.append(cv); stage.append(tbar, view, bar, msg); Object.assign(B, { stage, panel, tbar, view, cv, body });
  B.msg = s => { msg.textContent = s || ''; };
  B.prog = v => { bar.hidden = v == null; if (v != null) bar.firstChild.style.width = Math.round(v * 100) + '%'; };
  const sample = o.sample && (async () => { for (const [c, n] of await o.sample()) await B.addCanvas(c, n); });
  const drop = SD.drop({ add: f => B.add(f), sample, text: o.text, pdf: !o.nopdf }); root.append(drop, body);
  const mini = SD.drop({ mini: true, add: f => B.add(f), text: '더 넣기', btn: '고르기', pdf: !o.nopdf });
  B.drawThumbs = () => {
    thumbs.replaceChildren(mini);
    B.photos.forEach(p => {
      const t = SD.$('div', { class: 'th' + (p === B.sel ? ' on' : ''), tabIndex: 0, role: 'button', onclick: () => B.pick(p), onkeydown: e => { if (e.key === 'Enter' && e.target === t) B.pick(p); } });
      const c = SD.copy(p.th), s = SD.$('small');
      if (p.state) s.append(SD.$('span', { class: 'st ' + (p.state[0] === '✓' ? 'ok' : p.state[0] === '!' ? 'no' : ''), textContent: p.state + ' ' }));
      s.append(p.name); t.title = p.name;
      t.append(c, s, SD.$('button', { class: 'x', textContent: '×', ariaLabel: p.name + ' 빼기', onclick: e => { e.stopPropagation(); const i = B.photos.indexOf(p); B.photos.splice(i, 1); p._gone = true; if (B.sel === p) B.sel = null; if (B.photos.length) B.pick(B.sel || B.photos[Math.max(0, i - 1)]); else empty(); } }));
      thumbs.append(t);
    });
  };
  const empty = () => { B.sel = null; body.hidden = true; drop.hidden = false; };
  const took = async p => { B.photos.push(p); drop.hidden = true; body.hidden = false; if (!B.sel) await B.pick(p); else B.drawThumbs(); o.onAdd && o.onAdd(p); };
  B.add = async fs => { let i = 0; for (const f of fs) { if (fs.length > 3) SD.toast(`사진 여는 중 ${++i} / ${fs.length}`); try { if (SD.isPdf(f)) { if (o.nopdf) throw new Error('이 기능은 사진 파일만 받습니다.'); for (const q of await SD.pdfPick(f, o.id)) await B.addCanvas(q.canvas, q.name, q.full); continue; } await took(await SD.photo(f, f.name, o.cap)); } catch (e) { SD.toast((f.name || '') + ' — ' + e.message); } } };
  B.addCanvas = async (c, n, full) => { const p = await SD.photo(c, n); if (full) Object.assign(p.st, { q: [[0, 0], [1, 0], [1, 1], [0, 1]], sure: true }); return took(p); };
  B.pdf = !o.nopdf;
  B.pick = async p => { B.sel = p; B.drawThumbs(); if (o.onPick) await o.onPick(p); B.refresh(); };
  let busy = 0, again = 0;
  B.refresh = () => {
    if (busy) { again = 1; return; } busy = 1;
    setTimeout(async () => {
      const p = B.sel;
      try { if (p) { const r = await o.process(p, { preview: true, src: p.pv }); if (p === B.sel && r) { cv.width = r.width; cv.height = r.height; SD.x(cv).drawImage(r, 0, 0); } o.after && o.after(p); } }
      catch (e) { B.msg(e.message); console.error(e); }
      busy = 0; if (again) { again = 0; B.refresh(); }
    }, 16);
  };
  B.items = async (list = B.photos) => {
    const out = []; let i = 0;
    for (const p of list) {
      B.msg(`만드는 중 ${++i} / ${list.length}`); await new Promise(r => setTimeout(r));
      const r = await o.process(p, { preview: false, src: await p.get(), no: B.photos.indexOf(p) + 1 }); if (!r) continue;
      (Array.isArray(r) ? r : [{ canvas: r, suf: o.suf || '' }]).forEach(q => out.push({ name: q.name || SD.base(p.name) + q.suf, canvas: q.canvas, blob: q.blob }));
    }
    B.msg(''); return out;
  };
  B.blobs = async list => {
    const its = await B.items(list), f = o.fmt ? o.fmt() : ['image/png'], out = [];
    for (const it of its) { const b = it.blob || await SD.blob(f[0] === 'image/jpeg' ? SD.flat(it.canvas) : it.canvas, f[0], f[1]); out.push({ name: it.name + SD.ext(b.type), blob: b }); }
    return out;
  };
  B.download = async list => { try { if (!B.photos.length) return; const a = await B.blobs(list); if (!a.length) return SD.toast('받을 결과가 없습니다.'); if (a.length === 1) SD.save(a[0].blob, SD.safe(a[0].name)); else SD.save(await SD.zip(a), `${o.title}_${a.length}장.zip`); SD.toast(`${a.length}장을 받았습니다.`); } catch (e) { SD.toast(e.message); console.error(e); } };
  const copyNow = async () => {
    try { if (!document.hasFocus()) throw 0; const p = B.items([B.sel]).then(a => { if (!a[0] || !a[0].canvas) throw new Error('x'); return SD.blob(a[0].canvas); }); await navigator.clipboard.write([new ClipboardItem({ 'image/png': p })]); SD.toast('복사했습니다. 한글·PPT에 붙여 넣으세요.'); }
    catch (e) { SD.toast('복사하지 못했습니다. 받기를 써 주세요.'); }
  };
  B.outBar = (...extra) => {
    panel.append(SD.$('div', { class: 'out' },
      SD.$('button', { class: 'btn p', textContent: '지금 사진 받기', onclick: () => B.sel && B.download([B.sel]) }),
      SD.$('button', { class: 'btn', textContent: '전체 받기(여러 장은 zip)', onclick: () => B.download() }),
      o.nocopy ? null : SD.$('button', { class: 'btn', textContent: '지금 그림 복사', onclick: copyNow }), ...extra,
      SD.next(o.id, async () => { const a = await B.items(); for (const i of a) if (!i.canvas) { const b = await createImageBitmap(i.blob); i.canvas = SD.cv(b.width, b.height); SD.x(i.canvas).drawImage(b, 0, 0); } return a; })));
  };
  SD.cur = B;
  if (SD.carry) { const a = SD.carry; SD.carry = null; setTimeout(async () => { for (const i of a) await B.addCanvas(i.canvas, i.name + '.png'); }); }
  return B;
};
addEventListener('paste', e => { const f = [...((e.clipboardData && e.clipboardData.files) || [])].filter(SD.isPic); if (f.length && SD.cur && !document.querySelector('dialog[open]')) { e.preventDefault(); SD.cur.add(f.map(x => new File([x], '붙여 넣은 사진.png', { type: x.type }))); } });
['dragover', 'drop'].forEach(t => addEventListener(t, e => { if ([...((e.dataTransfer && e.dataTransfer.types) || [])].includes('Files')) { e.preventDefault(); if (t === 'drop' && SD.cur && !document.querySelector('dialog[open]')) SD.cur.add([...e.dataTransfer.files].filter(f => SD.okFile(f, SD.cur.pdf))); } }));
