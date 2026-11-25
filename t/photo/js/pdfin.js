/* PDF 넣기: 쪽을 고르거나 필요한 부분만 네모로 잘라 그림으로 바꾼다(PC 안에서만) */
SD.pdfLib = async () => {
  if (SD._pdf) return SD._pdf;
  const base = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/';
  let m; try { m = await import(base + 'build/pdf.min.mjs'); } catch (e) { throw new Error('PDF 읽기 부품을 받지 못했습니다. 인터넷 연결이나 브라우저(크롬·엣지 최신)를 확인해 주세요.'); }
  m.GlobalWorkerOptions.workerSrc = base + 'build/pdf.worker.min.mjs';
  return SD._pdf = { m, base };
};
/* 한 쪽(또는 그 안의 네모)을 그림으로. rect는 0~1 비율, max는 긴 쪽 픽셀 */
SD.pdfDraw = async (page, rect, max) => {
  const v = page.getViewport({ scale: 1 }), r = rect || [0, 0, 1, 1], w = v.width * r[2], h = v.height * r[3], s = Math.min(10, max / Math.max(w, h)), c = SD.cv(w * s, h * s), x = SD.x(c);
  x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  await page.render({ canvasContext: x, viewport: page.getViewport({ scale: s }), transform: [1, 0, 0, 1, -v.width * s * r[0], -v.height * s * r[1]], intent: 'print' }).promise;
  return c;
};
/* 고르기 창. one이면 하나만 */
SD.pdfPick = async (file, tool, one) => {
  const { m, base } = await SD.pdfLib(); SD.toast('PDF를 여는 중입니다.');
  const task = m.getDocument({ data: await file.arrayBuffer(), cMapUrl: base + 'cmaps/', cMapPacked: true, standardFontDataUrl: base + 'standard_fonts/', isEvalSupported: false });
  let doc; try { doc = await task.promise; } catch (e) { throw new Error(e && e.name === 'PasswordException' ? '암호가 걸린 PDF입니다. 암호를 푼 파일을 넣어 주세요.' : '열 수 없는 PDF입니다.'); }
  const N = doc.numPages, name = SD.base(file.name || 'PDF'), dlg = SD.$('dialog', { ariaLabel: 'PDF에서 고르기' }), picks = [], pages = {}; let cur = 0, closed = false, drag = null;
  const page = n => pages[n] || (pages[n] = doc.getPage(n));
  const cv = SD.$('canvas'), wrap = SD.$('div', { class: 'wrap' }, cv), list = SD.$('div', { class: 'pl' }), li = SD.$('div', { class: 'li' }), live = SD.$('div', { class: 'bx', hidden: true }), info = SD.$('span', { class: 'msg' });
  const ok = SD.$('button', { class: 'btn p', disabled: true, textContent: '넣기' }), whole = SD.$('button', { class: 'btn s', textContent: '이 쪽 통째로' });
  const place = (el, r) => { el.style.left = r[0] * 100 + '%'; el.style.top = r[1] * 100 + '%'; el.style.width = r[2] * 100 + '%'; el.style.height = r[3] * 100 + '%'; };
  const draw = () => {
    wrap.querySelectorAll('.bx.ok').forEach(e => e.remove());
    picks.filter(p => p.n === cur).forEach(p => { const b = SD.$('div', { class: 'bx ok' }); place(b, p.r || [0, 0, 1, 1]); wrap.append(b); });
    li.replaceChildren(...picks.map(p => SD.$('figure', {}, p.th, SD.$('button', { class: 'x', textContent: '×', ariaLabel: `${p.n}쪽에서 고른 것 빼기`, onclick: () => { picks.splice(picks.indexOf(p), 1); draw(); } }))));
    if (!picks.length) li.append(SD.$('span', { class: 'hint', textContent: '아직 고른 것이 없습니다. 쪽에서 필요한 부분을 끌어 네모로 잡으세요.' }));
    ok.disabled = !picks.length; ok.textContent = picks.length ? (one ? '이것으로' : `${picks.length}개 넣기`) : '넣기'; info.textContent = `${cur} / ${N}쪽`;
  };
  const addPick = r => {
    if (!cv.width || cv._n !== cur) return; if (!r && picks.some(p => p.n === cur && !p.r)) return;
    const q = r || [0, 0, 1, 1], th = SD.copy(SD.fit(SD.crop(cv, { x: q[0] * cv.width, y: q[1] * cv.height, w: q[2] * cv.width, h: q[3] * cv.height }), 200));
    if (one) picks.length = 0; picks.push({ n: cur, r, th }); draw();
  };
  let turn = 0;
  const show = async n => {
    cur = n; const t = ++turn; [...list.children].forEach((b, i) => b.classList.toggle('on', i === n - 1)); draw();
    try { const c = await SD.pdfDraw(await page(n), null, 1400); if (t !== turn || closed) return; cv.width = c.width; cv.height = c.height; cv._n = n; SD.x(cv).drawImage(c, 0, 0); draw(); }
    catch (e) { if (!closed) SD.toast(`${n}쪽을 그리지 못했습니다.`); }
  };
  const at = e => { const r = cv.getBoundingClientRect(); return [SD.clamp((e.clientX - r.left) / r.width, 0, 1), SD.clamp((e.clientY - r.top) / r.height, 0, 1)]; };
  const box = (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])];
  wrap.onpointerdown = e => { if (e.button > 0) return; e.preventDefault(); drag = at(e); try { wrap.setPointerCapture(e.pointerId); } catch (er) { /* 시험용 이벤트 */ } };
  wrap.onpointermove = e => { if (!drag) return; live.hidden = false; place(live, box(drag, at(e))); };
  wrap.onpointerup = e => { if (!drag) return; const r = box(drag, at(e)); drag = null; live.hidden = true; if (r[2] * cv.clientWidth > 8 && r[3] * cv.clientHeight > 8) addPick(r); };
  wrap.onpointercancel = () => { drag = null; live.hidden = true; };
  whole.onclick = () => addPick(null); wrap.append(live);
  for (let n = 1; n <= N; n++) list.append(SD.$('button', { onclick: () => show(n), ariaLabel: n + '쪽' }, SD.$('small', { textContent: n + '쪽' })));
  /* 작은 그림은 보이는 쪽만 차례로 */
  const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; io.unobserve(e.target); const n = [...list.children].indexOf(e.target) + 1; chain = chain.then(async () => { if (closed) return; try { e.target.prepend(await SD.pdfDraw(await page(n), null, 180)); } catch (er) { /* 작은 그림은 없어도 됨 */ } }); }), { root: list, rootMargin: '200px' });
  let chain = Promise.resolve();
  const all = !one && N > 1 && N <= 30 ? SD.$('button', { class: 'btn s', textContent: `${N}쪽 모두`, onclick: async () => { all.disabled = true; for (let n = 1; n <= N && !closed; n++) if (!picks.some(p => p.n === n && !p.r)) picks.push({ n, r: null, th: await SD.pdfDraw(await page(n), null, 200) }); all.disabled = false; if (!closed) draw(); } }) : null;
  return new Promise((res, rej) => {
    const end = v => { if (closed) return; closed = true; io.disconnect(); dlg.close(); dlg.remove(); chain.then(() => task.destroy()).catch(() => { }); res(v); };
    ok.onclick = async () => {
      ok.disabled = true; ok.textContent = '만드는 중…';
      try {
        const out = [], cnt = {};
        for (const p of picks) { cnt[p.n] = (cnt[p.n] || 0) + 1; const c = await SD.pdfDraw(await page(p.n), p.r, p.r ? 2000 : 2600); out.push({ canvas: c, name: `${name}_${p.n}쪽${cnt[p.n] > 1 ? '-' + cnt[p.n] : ''}.png`, full: true }); }
        end(out);
      } catch (e) { SD.toast('그림으로 바꾸지 못했습니다.'); console.error(e); draw(); }
    };
    dlg.oncancel = e => { e.preventDefault(); end([]); };
    const tip = tool === 'stamp' ? '본인·우리 기관 도장만 쓰세요. 도장 둘레를 끌어 네모로 잡으면 됩니다.' : tool === 'scan' ? '스캔한 쪽은 「이 쪽 통째로」, 일부만 쓰려면 끌어서 네모로 잡으세요.' : '필요한 부분(로고·사진 등)을 끌어 네모로 잡으세요. 글자가 많은 쪽을 통째로 넣으면 누끼가 잘 안 됩니다.';
    dlg.append(SD.$('div', { class: 'pd' }, SD.$('div', { class: 'tbar' }, SD.$('b', { textContent: 'PDF에서 고르기' }), info, SD.$('span', { class: 'hint', style: 'margin:0', textContent: tip }), whole, all, SD.$('button', { class: 'btn s', textContent: '취소', onclick: () => end([]) })), list, SD.$('div', { class: 'pv' }, wrap), SD.$('div', { class: 'pk' }, li, ok)));
    document.body.append(dlg); dlg.showModal(); [...list.children].forEach(b => io.observe(b)); show(1);
  });
};
