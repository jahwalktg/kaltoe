/* 뚝딱 한엑피 공방 — 엑셀 도구 공통 부품 XK.* (SheetJS 필요, 엑셀 쓰기는 Xlsxw)
   읽기·머리글 찾기·값 모양 지키기·표 넣기 화면(picker)·숫자/날짜 읽기·한글 붙일 표. tools/xlmerge.html의 함수를 옮겨 와 공통으로. */
(function () {
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var O = window.Office;
  function readBook(f) {
    return O.readBuf(f).then(function (buf) {
      var u8 = new Uint8Array(buf);
      if (/\.csv$/i.test(f.name)) {   // 한글 csv는 대개 CP949 — UTF-8로 안 풀리면 euc-kr로
        var txt; try { txt = new TextDecoder('utf-8', { fatal: true }).decode(u8); } catch (e) { txt = new TextDecoder('euc-kr').decode(u8); }
        return XLSX.read(txt.replace(/^﻿/, ''), { type: 'string', cellNF: true });
      }
      return XLSX.read(u8, { type: 'array', cellNF: true });
    });
  }
  /* 시트 → 칸 객체 2차원 배열 { v, t, z, w } (합친 칸은 첫 칸 값만) */
  function grid(ws) {
    if (!ws || !ws['!ref']) return [];
    var rg = XLSX.utils.decode_range(ws['!ref']), out = [];
    for (var r = rg.s.r; r <= rg.e.r; r++) {
      var row = [];
      for (var c = rg.s.c; c <= rg.e.c; c++) { var x = ws[XLSX.utils.encode_cell({ r: r, c: c })]; row.push(x && x.v != null && x.v !== '' ? { v: x.v, t: x.t, z: x.z, w: x.w != null ? String(x.w) : String(x.v) } : null); }
      out.push(row);
    }
    return out;
  }
  function txt(x) { return x ? String(x.w != null ? x.w : x.v).trim() : ''; }
  function isNumLike(s) { return /^[-+]?[\d,]*\.?\d+%?$/.test(s); }
  /* 머리글 줄 찾기: 위 20줄 중 글자 칸이 가장 많은 줄 근처에서 처음 나오는 줄 */
  function findHead(g) {
    var lim = Math.min(g.length, 20), cnt = [], mx = 0;
    for (var r = 0; r < lim; r++) { var ne = 0, tx = 0; g[r].forEach(function (x) { var t = txt(x); if (t) { ne++; if (!isNumLike(t)) tx++; } }); cnt[r] = tx >= ne * .6 ? ne : 0; mx = Math.max(mx, cnt[r]); }
    for (var k = 0; k < lim; k++) if (mx >= 2 && cnt[k] >= Math.max(2, mx * .7)) return k;
    return 0;
  }
  function headNames(g, h) {
    var row = g[h] || [], seen = {};
    return row.map(function (x, i) { var n = txt(x).replace(/\s*\n\s*/g, ' ') || ('칸' + (i + 1)); if (seen[n]) { seen[n]++; n = n + '(' + seen[n] + ')'; } else seen[n] = 1; return n; });
  }
  function keyOf(n) { return String(n).replace(/[\s()（）\[\]·.]/g, '').toLowerCase(); }
  /* 흔히 같은 뜻인 머리글 — 처음부터 같은 「합칠 이름」으로 (고칠 수 있음) */
  var SYN = [['성명', '이름', '성함', '참여자명', '참여자', '대상자명', '대상자'], ['생년월일', '생일', '출생일'], ['연락처', '전화번호', '휴대폰', '휴대전화', '핸드폰', '전화'], ['사업단', '사업단명', '사업단이름'], ['비고', '메모', '특이사항'], ['연번', '번호', '순번', 'no']];
  function synOf(n) { var k = keyOf(n); for (var i = 0; i < SYN.length; i++) if (SYN[i].indexOf(k) >= 0) return SYN[i][0]; return null; }
  var SUMRE = /^(합\s*계|소\s*계|총\s*계|계|누\s*계|total|sum)$/i;
  function rowEmpty(r) { return !r.some(function (x) { return txt(x); }); }
  /* 엑셀 쓰기용 칸: 원래 숫자 모양 따라 */
  function outCell(x) {
    if (!x) return { v: '', s: 'textL' };
    if (x.t === 'n') {
      if (x.z && XLSX.SSF.is_date(x.z)) return { v: x.v, s: 'date' };
      if (/%/.test(x.z || '')) return { v: x.v, s: /\.0/.test(x.z) ? 'pct2' : 'pct' };
      return { v: x.v, s: /[#0],[#0]/.test(x.z || '') ? 'num' : 'gen' };
    }
    if (x.t === 'b') return { v: x.v ? 'TRUE' : 'FALSE', s: 'text' };
    return { v: txt(x), s: 'textL' };
  }
  function vlen(s) { var n = 0; s = String(s); for (var i = 0; i < s.length && i < 80; i++) n += s.charCodeAt(i) > 0x2e80 ? 2 : 1; return n; }
  function widths(rows) { var w = []; rows.slice(0, 400).forEach(function (r) { r.forEach(function (c, i) { var t = c && c.v != null ? (c.s === 'num' && typeof c.v === 'number' ? c.v.toLocaleString() : c.s === 'date' ? '2026-01-01' : /^pct/.test(c.s) ? '100.00%' : c.v) : ''; w[i] = Math.max(w[i] || 8, Math.min(44, vlen(t) + 2)); }); }); return w; }
  function sheetName(n, used) { var s = String(n || '빈 값').replace(/[\[\]:*?\/\\]/g, ' ').trim().slice(0, 28) || '빈 값', b = s, k = 2; while (used[s.toLowerCase()]) s = b.slice(0, 25) + '(' + (k++) + ')'; used[s.toLowerCase()] = 1; return s; }
  function fileSafe(n) { return String(n || '빈 값').replace(/[\\\/:*?"<>|]/g, ' ').trim().slice(0, 60) || '빈 값'; }
  function bookSheet(name, head, body, top) {
    var rows = [], merges = [], W = head.length;
    (top || []).forEach(function (t) { rows.push([{ v: t, s: 'bold' }]); });
    var hr = rows.length; rows.push(head.map(function (h) { return { v: h, s: 'head' }; }));
    body.forEach(function (r) { rows.push(r); });
    var last = XLSX.utils.encode_col(Math.max(0, W - 1));
    return { name: name, cols: widths(rows.slice(hr)), rows: rows, freeze: hr + 1, filter: 'A' + (hr + 1) + ':' + last + (rows.length), printTitles: (hr + 1) + ':' + (hr + 1), landscape: W > 7 };
  }


  /* ---------- 숫자 읽기: 숫자 칸이면 그대로, 글자면 「1,234」「1,234원」「25%」「(1,200)」「₩1,000」까지. 앞자리 0(계좌·전화)은 숫자 아님 ---------- */
  function num(x) {
    if (x == null) return null;
    if (typeof x === 'number') return isFinite(x) ? x : null;
    if (typeof x === 'object') { if (x.t === 'n' && typeof x.v === 'number') return x.v; x = x.w != null ? x.w : x.v; }
    var s = String(x).replace(/ /g, ' ').trim(); if (!s) return null;
    var pct = /%$/.test(s); s = s.replace(/^[₩\\]\s*/, '').replace(/\s*(원|명|개|건|회|%)$/, '').trim();
    var neg = /^\(.*\)$/.test(s) || /^[-−]/.test(s); s = s.replace(/^\(|\)$/g, '').replace(/^[-−+]/, '').trim();
    if (!/^[\d,]*\.?\d+$/.test(s)) return null;
    if (/,/.test(s) && !/^\d{1,3}(,\d{3})*(\.\d+)?$/.test(s)) return null;
    if (/^0\d/.test(s)) return null;
    var v = parseFloat(s.replace(/,/g, '')); if (isNaN(v)) return null;
    if (neg) v = -v; if (pct) v = v / 100;
    return v;
  }
  /* 글자 날짜 → 엑셀 날짜 일련번호 (2026.1.5 / 2026-01-05 / 2026/1/5 / 2026년 1월 5일 / 26.01.05 / 20260105) */
  function dateSerial(s) {
    s = String(s == null ? '' : s).trim(); var m, y, mo, d;
    if ((m = s.match(/^(\d{4})\s*[.\-\/년]\s*(\d{1,2})\s*[.\-\/월]\s*(\d{1,2})\s*[.일]?$/))) { y = +m[1]; mo = +m[2]; d = +m[3]; }
    else if ((m = s.match(/^(\d{2})\.(\d{1,2})\.(\d{1,2})\.?$/))) { y = 2000 + +m[1]; mo = +m[2]; d = +m[3]; }
    else if ((m = s.match(/^(19|20)(\d{2})(\d{2})(\d{2})$/))) { y = +(m[1] + m[2]); mo = +m[3]; d = +m[4]; }
    else return null;
    if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return null;
    var t = Date.UTC(y, mo - 1, d); if (new Date(t).getUTCDate() !== d) return null;
    return Math.round(t / 86400000) + 25569;
  }
  function serialYMD(v) { var p = XLSX.SSF.parse_date_code(v); return p ? { y: p.y, m: p.m, d: p.d } : null; }   // cellDates 쓰지 않음(한국 시간 하루 밀림)
  function isDateCell(x) { return !!(x && x.t === 'n' && x.z && XLSX.SSF.is_date(x.z)); }
  /* 시트 → { g, merges } (합친 칸은 첫 칸에만 값, 나머지는 null) */
  function sheetGrid(ws) {
    var g = grid(ws), merges = [];
    if (ws && ws['!ref']) { var rg = XLSX.utils.decode_range(ws['!ref']); (ws['!merges'] || []).forEach(function (m) { merges.push({ r: m.s.r - rg.s.r, c: m.s.c - rg.s.c, rs: m.e.r - m.s.r + 1, cs: m.e.c - m.s.c + 1 }); }); }
    return { g: g, merges: merges };
  }
  function tcell(t) { t = String(t == null ? '' : t); return t === '' ? null : { v: t, t: 's', w: t }; }
  /* 엑셀에서 복사한 HTML 표 (합친 칸 살림) */
  function fromHtml(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html'), tb = doc.querySelector('table'); if (!tb) return null;
    var g = [], merges = [], occ = {};
    [].forEach.call(tb.rows, function (tr, r) {
      g[r] = g[r] || []; var c = 0;
      [].forEach.call(tr.cells, function (td) {
        while (occ[r + ',' + c]) c++;
        var cs = Math.max(1, +td.colSpan || 1), rs = Math.max(1, +td.rowSpan || 1);
        td.querySelectorAll('br').forEach(function (b) { b.replaceWith('\n'); });
        var t = td.textContent.replace(/ /g, ' ').replace(/[ \t\r]*\n[ \t\r]*/g, '\n').trim();
        g[r][c] = tcell(t);
        if (cs > 1 || rs > 1) merges.push({ r: r, c: c, rs: rs, cs: cs });
        for (var i = 0; i < rs; i++) for (var j = 0; j < cs; j++) { occ[(r + i) + ',' + (c + j)] = 1; if (i || j) { g[r + i] = g[r + i] || []; g[r + i][c + j] = null; } }
        c += cs;
      });
    });
    return squareUp(g, merges);
  }
  function fromText(txt) {
    var rows = [], row = [], cell = '', q = false; txt = String(txt).replace(/\r\n?/g, '\n').replace(/\n+$/, '');
    var sep = txt.indexOf('\t') >= 0 ? '\t' : (txt.indexOf(',') >= 0 ? ',' : '\t');
    for (var i = 0; i < txt.length; i++) {
      var ch = txt[i];
      if (q) { if (ch === '"') { if (txt[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; continue; }
      if (ch === '"' && cell === '') { q = true; continue; }
      if (ch === sep) { row.push(cell); cell = ''; continue; }
      if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; continue; }
      cell += ch;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return squareUp(rows.map(function (r) { return r.map(function (t) { return tcell(t.trim()); }); }), []);
  }
  function squareUp(g, merges) {
    var W = g.reduce(function (a, r) { return Math.max(a, r ? r.length : 0); }, 0);
    g = g.map(function (r) { r = r || []; for (var c = 0; c < W; c++) if (r[c] === undefined) r[c] = null; return r; });
    return g.length && W ? { g: g, merges: merges } : null;
  }

  /* ---------- 표 넣기 부품: XK.picker(자리, { sample: () => File, onData: d => … }) ----------
     d = { g, merges, h(머리글 줄, 0부터), name, sheet, from: 'file'|'paste' } */
  var pk = 0;
  function picker(el, opt) {
    var id = 'xkp' + (++pk), wb = null, name = '', cur = null;
    el.innerHTML = '<div class="drop" id="' + id + 'd"><b>엑셀에서 표를 복사(Ctrl+C)해 아래 칸에 붙이거나, 파일을 끌어다 놓기</b>' +
      '<textarea id="' + id + 't" rows="4" placeholder="여기에 붙여 넣기(Ctrl+V) — 엑셀에서 복사하면 합친 칸도 살아 있습니다" style="min-height:90px;font-family:Consolas,monospace;font-size:.82rem"></textarea>' +
      '<div class="row" style="justify-content:center;margin-top:8px"><label class="btn"><input type="file" id="' + id + 'f" accept=".xlsx,.xls,.xlsm,.csv" hidden>파일 고르기 (xlsx·xls·csv)</label>' + (opt.sample ? '<button type="button" class="btn" id="' + id + 's">예시 표로 해 보기</button>' : '') + '</div></div>' +
      '<div class="row" id="' + id + 'r" hidden style="margin-top:10px"><label class="f">시트<select id="' + id + 'sh"></select></label><label class="f">머리글 줄 (몇 번째 줄)<input type="number" id="' + id + 'h" min="1" max="60" value="1" style="width:90px"></label></div>' +
      '<p class="hint" id="' + id + 'i" style="margin:8px 0 0"></p>';
    var $ = function (s) { return document.getElementById(id + s); };
    function emit(d, msg) {
      cur = d;
      if (!d) { $('i').textContent = msg || '표를 읽지 못했습니다.'; opt.onData(null); return; }
      $('r').hidden = false;
      var ne = d.g.slice(d.h + 1).filter(function (r) { return !rowEmpty(r); }).length;
      $('i').innerHTML = '✓ ' + esc(d.name || '붙여 넣은 표') + (d.sheet ? ' › ' + esc(d.sheet) : '') + ' · ' + d.g.length + '줄 × ' + (d.g[0] || []).length + '칸 · 머리글 ' + (d.h + 1) + '번째 줄 아래 ' + ne + '줄' + (d.merges.length ? ' · 합친 칸 ' + d.merges.length + '곳' : '') + ' <span>(머리글 줄이 틀리면 위 숫자를 고치세요)</span>';
      opt.onData(d);
    }
    function fromSheet() { var sn = $('sh').value, sg = sheetGrid(wb.Sheets[sn]); if (!sg.g.length) { emit(null, '빈 시트입니다.'); return; } var h = findHead(sg.g); $('h').value = h + 1; emit({ g: sg.g, merges: sg.merges, h: h, name: name, sheet: sn, from: 'file' }); }
    function load(f) {
      readBook(f).then(function (w) {
        wb = w; name = f.name.replace(/\.[^.]+$/, ''); $('t').value = '';
        $('sh').innerHTML = w.SheetNames.map(function (s) { return '<option>' + esc(s) + '</option>'; }).join(''); $('sh').disabled = w.SheetNames.length < 2;
        fromSheet();
      }, function (e) { emit(null, '파일을 열지 못했습니다(암호가 걸렸거나 다른 형식): ' + (e && e.message || '')); });
    }
    function pasted(m) { if (!m) { emit(null); return; } wb = null; name = ''; $('sh').innerHTML = '<option>(붙여 넣은 표)</option>'; $('sh').disabled = true; var h = findHead(m.g); $('h').value = h + 1; emit({ g: m.g, merges: m.merges, h: h, name: '', sheet: '', from: 'paste' }); }
    $('t').addEventListener('paste', function (e) {
      var cd = e.clipboardData; if (!cd) return; var html = cd.getData('text/html');
      if (html && /<table/i.test(html)) { var m = fromHtml(html); if (m) { e.preventDefault(); $('t').value = cd.getData('text/plain') || '(표를 붙였습니다)'; pasted(m); } }
    });
    var tt = 0; $('t').addEventListener('input', function () { clearTimeout(tt); tt = setTimeout(function () { var v = $('t').value; if (!v.trim()) return; pasted(fromText(v)); }, 300); });
    Office.bindDrop($('d'), $('f'), function (fs) { var f = fs.filter(function (x) { return /\.(xlsx|xlsm|xls|csv)$/i.test(x.name); })[0]; if (!f) { Office.toast('엑셀(xlsx·xls)이나 csv 파일을 넣어 주세요.'); return; } load(f); });
    $('sh').onchange = function () { if (wb) fromSheet(); };
    $('h').onchange = function () { if (!cur) return; cur.h = Math.max(0, Math.min(cur.g.length - 1, (+$('h').value || 1) - 1)); emit(cur); };
    if (opt.sample) $('s').onclick = function () { load(opt.sample()); };
    return { load: load, paste: function (t) { pasted(/<table/i.test(t) ? fromHtml(t) : fromText(t)); }, get: function () { return cur; } };
  }
  /* 시험·예시용: 2차원 배열 → xlsx File */
  function aoaFile(name, aoa, extra) {
    var wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(aoa); if (extra) extra(ws); XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return new File([XLSX.write(wb, { type: 'array', bookType: 'xlsx' })], name);
  }
  /* 한글에 붙일 표 HTML (mm 폭) — rows: [[{ t, align, gray, bold, cs, rs }]] */
  function hwpTableHtml(rows, widths, pt) {
    var h = '<table style="border-collapse:collapse;table-layout:fixed;width:' + widths.reduce(function (a, x) { return a + x; }, 0).toFixed(1) + 'mm;font-family:\'맑은 고딕\',\'Malgun Gothic\',sans-serif"><colgroup>' + widths.map(function (w) { return '<col style="width:' + w + 'mm">'; }).join('') + '</colgroup>';
    rows.forEach(function (r) { h += '<tr>'; r.forEach(function (c) { h += '<td' + (c.cs > 1 ? ' colspan="' + c.cs + '"' : '') + (c.rs > 1 ? ' rowspan="' + c.rs + '"' : '') + ' style="border:0.5pt solid #000;color:#000;font-size:' + (pt || 9) + 'pt;padding:1pt 3pt;vertical-align:middle;text-align:' + (c.align || 'left') + ';' + (c.gray ? 'background:#d9d9d9;font-weight:bold;' : c.bold ? 'font-weight:bold;' : '') + '">' + esc(c.t).replace(/\n/g, '<br>') + '</td>'; }); h += '</tr>'; });
    return h + '</table>';
  }
  function copyHtml(html, plain) {
    function fallback() { var d = document.createElement('div'); d.contentEditable = 'true'; d.style.cssText = 'position:fixed;left:-9999px;top:0;background:#fff'; d.innerHTML = html; document.body.appendChild(d); var rg = document.createRange(); rg.selectNodeContents(d); var s = getSelection(); s.removeAllRanges(); s.addRange(rg); var ok = false; try { ok = document.execCommand('copy'); } catch (e) { } s.removeAllRanges(); d.remove(); Office.toast(ok ? '복사했습니다. 붙일 곳에서 Ctrl+V 하세요.' : '복사가 막혔습니다. 파일로 받아 주세요.'); }
    if (navigator.clipboard && window.ClipboardItem) navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob(['<html><body>' + html + '</body></html>'], { type: 'text/html' }), 'text/plain': new Blob([plain || ''], { type: 'text/plain' }) })]).then(function () { Office.toast('복사했습니다. 붙일 곳에서 Ctrl+V 하세요.'); }, fallback);
    else fallback();
  }
  function fmtNum(v, dec) { if (dec == null) dec = Math.abs(v - Math.round(v)) > 1e-9 ? Math.min(2, (String(v).split('.')[1] || '').length) : 0; return v.toLocaleString('ko-KR', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }

  window.XK = { readBook: readBook, grid: grid, sheetGrid: sheetGrid, txt: txt, findHead: findHead, headNames: headNames, keyOf: keyOf, SYN: SYN, synOf: synOf, SUMRE: SUMRE, rowEmpty: rowEmpty,
    outCell: outCell, vlen: vlen, widths: widths, sheetName: sheetName, fileSafe: fileSafe, bookSheet: bookSheet, num: num, dateSerial: dateSerial, serialYMD: serialYMD, isDateCell: isDateCell,
    fromHtml: fromHtml, fromText: fromText, picker: picker, aoaFile: aoaFile, hwpTableHtml: hwpTableHtml, copyHtml: copyHtml, fmtNum: fmtNum };
})();
