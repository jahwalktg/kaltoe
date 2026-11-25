/* 문서 변신 마법사 (시제품) — 재료를 넣으면 알아서 구분 → 바구니에 나눠 담기 → 원하는 그릇(내 양식) 모양에 맞춰 담기
   원칙: 자동으로 분류하되, 애매한 것은 전부 표시해 확인받는다. 못 읽는 재료는 바꿔 올 도구를 알려 준다. */
(function () {
  'use strict';
  var O = Office, $ = O.$, esc = O.esc, txt = XK.txt, keyOf = XK.keyOf;
  var TOOL = '../office/tools/', SEP = '¦';
  function pad(n) { return String(n).padStart(2, '0'); }

  /* ================= 낱말 사전 (머리글 → 항목). loose: 머리글에 그 낱말이 들어만 있어도 짐작. nokey: 기준 칸으로 쓰지 않음 ================= */
  var GROUPS = [
    ['사람', [
      { id: '이름', syn: ['성명', '이름', '성함', '참여자명', '참여자', '대상자명', '대상자', '직원명', '이용자명', '회원명'], pat: 'name' },
      { id: '생년월일', syn: ['생년월일', '생일', '출생일', '생년'], pat: 'date', loose: 1, nokey: 1 },
      { id: '성별', syn: ['성별'], pat: 'sex', nokey: 1 },
      { id: '연락처', syn: ['연락처', '전화번호', '휴대폰', '휴대전화', '핸드폰', '전화', '휴대폰번호', '핸드폰번호', 'hp', 'mobile', '본인연락처', '본인전화'], pat: 'phone', loose: 1, nokey: 1 },
      { id: '비상연락처', syn: ['비상연락처', '비상연락망', '긴급연락처', '보호자연락처', '비상전화', '비상연락', '가족연락처', '보호자전화'], pat: 'phone', loose: 1, nokey: 1 },
      { id: '관계', syn: ['관계', '보호자관계', '본인과의관계'], nokey: 1 },
      { id: '주소', syn: ['주소', '거주지', '자택주소', '현주소', '도로명주소', '집주소', '실거주지'], pat: 'addr', loose: 1, nokey: 1 },
      { id: '우편번호', syn: ['우편번호'], pat: 'zip', nokey: 1 },
      { id: '소속', syn: ['소속', '부서', '팀', '사업단', '사업단명', '부서명', '소속부서', '근무지'] },
      { id: '직위', syn: ['직위', '직급', '직책'], nokey: 1 },
      { id: '이메일', syn: ['이메일', '메일', 'email', 'e-mail', '전자우편', '메일주소'], pat: 'email', loose: 1, nokey: 1 }]],
    ['물건', [
      { id: '관리번호', syn: ['관리번호', '자산번호', '물품번호', '품목코드', '물품코드', '자산코드', '코드'] },
      { id: '품명', syn: ['품명', '품목', '물품명', '품목명', '상품명', '제품명', '자산명', '비품명', '물품'] },
      { id: '규격', syn: ['규격', '사양', '모델', '모델명'], nokey: 1 },
      { id: '단위', syn: ['단위'], nokey: 1 },
      { id: '수량', syn: ['수량', '개수', '갯수', '재고', '재고수량'], nokey: 1 },
      { id: '위치', syn: ['위치', '보관장소', '보관위치', '비치장소', '설치장소', '사용장소'], nokey: 1 },
      { id: '상태', syn: ['상태', '물품상태'], nokey: 1 },
      { id: '차량번호', syn: ['차량번호', '차번호'] }]],
    ['돈', [
      { id: '금액', syn: ['금액', '합계금액', '총액', '지급액', '결제금액', '총금액'], nokey: 1 },
      { id: '단가', syn: ['단가'], nokey: 1 },
      { id: '공급가액', syn: ['공급가액', '공급가'], nokey: 1 },
      { id: '부가세', syn: ['부가세', '세액'], nokey: 1 },
      { id: '수입', syn: ['수입', '입금', '입금액', '수입금액', '수입액'], nokey: 1 },
      { id: '지출', syn: ['지출', '출금', '출금액', '지출금액', '지출액'], nokey: 1 },
      { id: '잔액', syn: ['잔액'], nokey: 1 },
      { id: '적요', syn: ['적요', '내역', '거래내용', '사용내역', '지출내역'], nokey: 1 }]],
    ['날짜', [
      { id: '일자', syn: ['일자', '날짜', '거래일', '거래일자', '일시', '사용일', '사용일자', '년월일'], pat: 'date', nokey: 1 },
      { id: '구입일', syn: ['구입일', '구입일자', '취득일', '취득일자', '구매일'], pat: 'date', nokey: 1 },
      { id: '시작일', syn: ['시작일', '시작일자', '참여시작일', '입사일'], pat: 'date', nokey: 1 },
      { id: '종료일', syn: ['종료일', '종료일자', '참여종료일', '퇴사일'], pat: 'date', nokey: 1 }]],
    ['기관·기타', [
      { id: '거래처', syn: ['거래처', '거래처명', '상호', '업체', '업체명', '구입처', '기관명', '보낸분', '받는분'] },
      { id: '사업자번호', syn: ['사업자번호', '사업자등록번호'] },
      { id: '계좌번호', syn: ['계좌번호', '계좌'] },
      { id: '은행', syn: ['은행', '은행명'], nokey: 1 },
      { id: '담당자', syn: ['담당자', '담당', '담당자명'], nokey: 1 },
      { id: '구분', syn: ['구분', '분류', '종류', '유형'], nokey: 1 },
      { id: '비고', syn: ['비고', '메모', '특이사항', '참고'], nokey: 1 }]]
  ];
  var FIELDS = []; GROUPS.forEach(function (g) { g[1].forEach(function (F) { F.group = g[0]; FIELDS.push(F); }); });
  var KEYRANK = ['관리번호', '사업자번호', '차량번호', '계좌번호', '이름', '품명', '거래처', '소속'];
  var SEQRE = /^(연번|번호|순번|no|순서)$/;
  function fieldById(id) { return FIELDS.filter(function (F) { return F.id === id; })[0]; }
  var PAT = {
    phone: function (s) { var d = s.replace(/\D/g, ''); return /^[\d\-\s.()]+$/.test(s) && (/^0\d{8,10}$/.test(d) || /^1\d{8,9}$/.test(d)); },
    email: function (s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); },
    zip: function (s) { return /^\d{5}$/.test(s); },
    addr: function (s) { return /[가-힣]+(시|군|구)\s?[가-힣0-9]+/.test(s) && /(로|길|동|읍|면|리)\s?\d|\d+번지|\d+호/.test(s); },
    sex: function (s) { return /^(남|여|남자|여자|남성|여성|m|f)$/i.test(s); },
    date: function (s, x) { return XK.isDateCell(x) || XK.dateSerial(s) != null || /^\d{6}$/.test(s); },
    name: function (s) { return /^[가-힣]{2,4}$/.test(s.replace(/\s|\(.*?\)/g, '')); }
  };
  var PATNAME = { phone: '전화번호', email: '이메일', addr: '주소' };
  function fit(cells, pat) { var n = 0, ok = 0; cells.forEach(function (x) { var s = txt(x); if (!s) return; n++; if (PAT[pat](s, x)) ok++; }); return n ? ok / n : null; }
  /* 머리글 + 값 모양 → { sel: 사전 항목 | '__own'(머리글 그대로) | '__skip', conf: sure|ask|new|no, why } */
  function classify(head, cells) {
    var k = keyOf(head);
    if (!k || /^칸\d+$/.test(k)) return { sel: '__skip', conf: 'no', why: '머리글이 없는 칸' };
    if (SEQRE.test(k)) return { sel: '__skip', conf: 'no', why: '번호 칸' };
    var f = FIELDS.filter(function (F) { return F.syn.indexOf(k) >= 0; })[0], part = false;
    if (!f) {
      var best = 0;
      FIELDS.forEach(function (F) { if (!F.loose) return; F.syn.forEach(function (s) { if (s.length >= 2 && k.indexOf(s) >= 0 && s.length > best) { best = s.length; f = F; part = true; } }); });
    }
    if (f) {
      var r = f.pat ? fit(cells, f.pat) : null;
      if (r != null && r < 0.5) return { sel: f.id, conf: 'ask', why: '머리글은 「' + f.id + '」 같은데 값 모양이 다릅니다. 맞는지 봐 주세요.' };
      if (part) return { sel: f.id, conf: 'ask', why: '머리글이 정확히 같지 않아 「' + f.id + '」(으)로 짐작했습니다.' };
      return { sel: f.id, conf: 'sure' };
    }
    var g = ['phone', 'email', 'addr'].filter(function (p) { return (fit(cells, p) || 0) >= 0.8; })[0];
    if (g) { var id = { phone: '연락처', email: '이메일', addr: '주소' }[g]; return { sel: id, conf: 'ask', why: '처음 보는 머리글인데 값이 ' + PATNAME[g] + ' 모양이라 「' + id + '」(으)로 짐작했습니다.' }; }
    return { sel: '__own', conf: 'new' };
  }

  /* ================= 값 읽기 ================= */
  function fmtPhone(d) { if (/^02\d{7,8}$/.test(d)) return d.replace(/^(02)(\d{3,4})(\d{4})$/, '$1-$2-$3'); return d.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3'); }
  function isPhoneF(f) { return f === '연락처' || f === '비상연락처'; }
  function isDateF(f) { var F = fieldById(f); return !!(F && F.pat === 'date'); }
  function cellStr(x, field) {
    if (!x) return '';
    if (XK.isDateCell(x)) { var p = XK.serialYMD(x.v); if (p) return p.y + '-' + pad(p.m) + '-' + pad(p.d); }
    var s = txt(x).replace(/\s*\n\s*/g, ' ');
    if (isPhoneF(field)) { var d = s.replace(/\D/g, ''); if (/^\d+$/.test(s) && /^1\d{8,9}$/.test(d)) s = fmtPhone('0' + d); }   // 엑셀이 앞자리 0을 지운 전화번호
    if (isDateF(field)) { var n = XK.dateSerial(s); if (n != null) { var q = XK.serialYMD(n); if (q) s = q.y + '-' + pad(q.m) + '-' + pad(q.d); } }
    return s;
  }
  function cellNum(x, field) { return x && x.t === 'n' && typeof x.v === 'number' && !XK.isDateCell(x) && !isPhoneF(field) ? x.v : undefined; }   // 숫자 칸은 숫자로도 기억(엑셀 양식에 숫자로 넣기)
  function showNum(n) { return Math.abs(n) >= 1000 && Math.round(n) === n ? n.toLocaleString('ko-KR') : String(n); }
  function normVal(field, v) { return isPhoneF(field) ? v.replace(/\D/g, '') : field === '이름' ? normName(v) : v.replace(/\s/g, '').toLowerCase(); }
  function normName(s) { return s.replace(/\(.*?\)|（.*?）/g, '').replace(/\s/g, ''); }
  function dataRows(g, h) {
    return g.slice(h + 1).filter(function (r) {
      if (XK.rowEmpty(r)) return false;
      var first = r.filter(function (x) { return txt(x); })[0];
      return !(first && XK.SUMRE.test(txt(first).replace(/\s/g, '')));
    });
  }
  function colKind(cells) {   // 칸의 값 성격: num | date | text
    var n = 0, nu = 0, da = 0;
    cells.forEach(function (x) { var s = txt(x); if (!s) return; n++; if (XK.isDateCell(x) || XK.dateSerial(s) != null) da++; else if ((x.t === 'n' && typeof x.v === 'number') || XK.num(s) != null) nu++; });
    return !n ? 'text' : da / n >= 0.8 ? 'date' : nu / n >= 0.8 ? 'num' : 'text';
  }

  /* ================= 한글(hwpx) 표 읽기 ================= */
  function unx(s) { return s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&'); }
  function topTables(xml) {
    var re = /<hp:tbl\b|<\/hp:tbl>/g, m, d = 0, s = 0, out = [], nested = false;
    while ((m = re.exec(xml))) {
      if (m[0].charAt(1) !== '/') { if (d === 0) { s = m.index; nested = false; } else nested = true; d++; }
      else { d--; if (d === 0) out.push({ s: s, e: m.index + m[0].length, xml: xml.slice(s, m.index + m[0].length), nested: nested }); }
    }
    return out;
  }
  function tblGrid(tx) {
    var rowsXml = tx.match(/<hp:tr\b[^>]*>[\s\S]*?<\/hp:tr>/g) || [], g = [], merges = [], W = 0, cells = [];
    rowsXml.forEach(function (rx, ri) {
      (rx.match(/<hp:tc\b[\s\S]*?<\/hp:tc>/g) || []).forEach(function (tc) {
        var c = +(tc.match(/colAddr="(\d+)"/) || [0, 0])[1], r = +(tc.match(/rowAddr="(\d+)"/) || [0, ri])[1], cs = +(tc.match(/colSpan="(\d+)"/) || [0, 1])[1], rs = +(tc.match(/rowSpan="(\d+)"/) || [0, 1])[1];
        var t = (tc.match(/<hp:p\b[\s\S]*?<\/hp:p>/g) || []).map(function (p) { return (p.match(/<hp:t\b[^>]*>[\s\S]*?<\/hp:t>/g) || []).map(unx).join(''); }).join('\n').trim();
        (g[r] = g[r] || [])[c] = t ? { v: t, t: 's', w: t } : null; W = Math.max(W, c + cs);
        if (cs > 1 || rs > 1) merges.push({ r: r, c: c, rs: rs, cs: cs });
        cells.push({ r: r, c: c, rs: rs, cs: cs, t: t });
      });
    });
    for (var r = 0; r < rowsXml.length; r++) { g[r] = g[r] || []; for (var c = 0; c < W; c++) if (g[r][c] === undefined) g[r][c] = null; }
    return { g: g, merges: merges, rowsXml: rowsXml, cells: cells };
  }
  function parseHwpx(ab) {
    return JSZip.loadAsync(ab).then(function (zip) {
      var names = Object.keys(zip.files).filter(function (n) { return /^Contents\/section\d+\.xml$/.test(n); }).sort();
      return Promise.all(names.map(function (n) { return zip.file(n).async('string'); })).then(function (xmls) {
        var tabs = [], xmlOf = {};
        xmls.forEach(function (xml, si) {
          xmlOf[names[si]] = xml;
          topTables(xml).forEach(function (t) { var gr = tblGrid(t.xml); tabs.push({ name: '표 ' + (tabs.length + 1), path: names[si], s: t.s, e: t.e, tx: t.xml, g: gr.g, merges: gr.merges, nested: t.nested, rows: gr.rowsXml, cells: gr.cells }); });
        });
        return { zip: zip, tabs: tabs, xmlOf: xmlOf };
      });
    });
  }

  /* ================= ① 재료 ================= */
  var srcs = [], seq = 0, OWN = {};
  function ownName(head) { var k = keyOf(head); return OWN[k] || (OWN[k] = head.trim()); }
  function mkSrc(name, kind, tabs) {
    var s = { id: ++seq, name: name, kind: kind, tabs: tabs, tab: 0, h: null, over: {}, cols: [], bad: null, notes: [], force: null }, best = -1;
    tabs.forEach(function (t, i) {   // 아는 머리글이 가장 많은 시트·표를 고름
      var h = XK.findHead(t.g), sc = XK.headNames(t.g, h).filter(function (n) { return classify(n, []).conf === 'sure'; }).length + (dataRows(t.g, h).length ? 0.5 : 0);
      if (sc > best) { best = sc; s.tab = i; }
    });
    return s;
  }
  function badSrc(name, why, fixes, tail) { return { id: ++seq, name: name, bad: { why: why, fixes: fixes || [], tail: tail || '' } }; }
  function analyze(s) {
    if (s.bad) return;
    var t = s.tabs[s.tab], g = t.g; if (s.h == null) s.h = XK.findHead(g);
    var heads = XK.headNames(g, s.h), rows = dataRows(g, s.h), used = {};
    s.rows = rows; s.notes = []; s.F = {}; s.fields = [];
    s.cols = heads.map(function (hd, i) {
      var cells = rows.map(function (r) { return r[i]; }), c = classify(hd, cells), o = s.over[i];
      var col = { i: i, head: hd, cells: cells, ex: cells.map(function (x) { return txt(x); }).filter(Boolean).slice(0, 2).join(' · '), sel: c.sel, conf: c.conf, why: c.why || '', dup: false };
      if (o != null) { col.sel = o; col.conf = 'done'; col.why = ''; }
      col.f = col.sel === '__skip' ? null : col.sel === '__own' ? ownName(hd) : col.sel;
      return col;
    });
    s.cols.forEach(function (col) {
      if (!col.f) return;
      if (used[col.f] != null) { if (col.conf !== 'done') { col.conf = 'ask'; col.dup = true; col.why = '「' + col.f + '」 칸이 이 재료에 둘입니다. 이 칸은 무엇인지 골라 주세요(정하기 전에는 담지 않습니다).'; return; } }
      else used[col.f] = col.i;
      if (s.F[col.f] == null) { s.F[col.f] = col; s.fields.push(col.f); }
    });
    s.fields.forEach(function (f) {   // 기준 칸이 될 만한지: 값이 거의 안 겹치고, 숫자 금액·날짜·전화·주소가 아닌 칸
      var c = s.F[f], F = fieldById(f), vals = {}, n = 0;
      c.kind = colKind(c.cells);
      c.cells.forEach(function (x) { var v = cellStr(x, f); if (!v) return; n++; vals[normVal(f, v)] = 1; });
      c.set = vals; c.cnt = n; c.distinct = Object.keys(vals).length;
      var idish = /(번호|코드|id)$/i.test(keyOf(f));
      c.keyable = !(F && F.nokey) && c.kind !== 'date' && (c.kind !== 'num' || idish) && n >= Math.max(1, rows.length * 0.9) && c.distinct >= n * 0.9;
    });
    var mg = (t.merges || []).filter(function (m) { return m.r > s.h; }).length;
    if (mg) s.notes.push({ t: '재료 줄에 합친 칸이 ' + mg + '곳 있어 값이 빠질 수 있습니다. ', a: '표 청소기', u: TOOL + 'xlclean.html', t2: '로 풀어서 다시 넣으면 안전합니다.' });
    if (!rows.length) s.notes.push({ t: '머리글 줄 아래에 재료가 없는 빈 표라 바구니에 담지 않았습니다. 채울 그릇(양식)이라면 아래 ③에 넣어 주세요. 재료가 맞다면 머리글 줄 번호를 고쳐 주세요.' });
  }
  var EXT_HELP = '원본 엑셀·한글 파일을 넣거나, 그 표를 복사해 「표를 복사해 붙여 넣기」로 넣어 주세요.';
  function addFiles(files) {
    var jobs = files.filter(function (f) { return !/^~\$/.test(f.name); }).map(function (f) {
      if (srcs.some(function (s) { return s.name === f.name && s.size === f.size; })) return null;
      var ext = (f.name.split('.').pop() || '').toLowerCase(), done = function (s) { if (s) s.size = f.size; return s; };
      if (/^(xlsx|xlsm|xls|csv)$/.test(ext)) return XK.readBook(f).then(function (wb) {
        var tabs = wb.SheetNames.map(function (n) { var sg = XK.sheetGrid(wb.Sheets[n]); return { name: n, g: sg.g, merges: sg.merges }; }).filter(function (t) { return t.g.length; });
        return done(tabs.length ? mkSrc(f.name, '엑셀', tabs) : badSrc(f.name, '내용이 없는 파일입니다.'));
      }, function () { return done(badSrc(f.name, '파일을 열지 못했습니다. 암호가 걸려 있으면 엑셀에서 암호를 푼 뒤 다시 넣어 주세요.')); });
      if (ext === 'hwpx') return O.readBuf(f).then(parseHwpx).then(function (h) {
        var tabs = h.tabs.filter(function (t) { return !t.nested && t.g.length >= 2; });
        return done(tabs.length ? mkSrc(f.name, '한글', tabs) : badSrc(f.name, '이 한글 문서에서 읽을 수 있는 표를 찾지 못했습니다(표 안에 표가 든 문서는 아직 못 읽습니다). ' + EXT_HELP));
      }, function () { return done(badSrc(f.name, '한글 문서를 열지 못했습니다. 암호가 걸렸거나 깨진 파일일 수 있습니다.')); });
      if (ext === 'hwp') return Promise.resolve(done(badSrc(f.name, '옛 한글 형식(hwp)은 바로 읽지 못합니다. ', [{ a: 'HWP → HWPX 바꾸기', u: TOOL + 'hwp2hwpx.html' }], ' 도구로 hwpx로 바꾼 뒤 그 파일을 다시 넣어 주세요.')));
      if (/^(pdf|jpg|jpeg|png|gif|bmp|heic)$/.test(ext)) return Promise.resolve(done(badSrc(f.name, 'PDF·사진 속 표는 읽지 못합니다. ' + EXT_HELP)));
      if (/^(docx|doc|pptx|ppt)$/.test(ext)) return Promise.resolve(done(badSrc(f.name, '워드·PPT 파일은 아직 읽지 못합니다. ' + EXT_HELP)));
      return Promise.resolve(done(badSrc(f.name, '읽을 수 없는 형식입니다. ' + EXT_HELP)));
    }).filter(Boolean);
    return Promise.all(jobs).then(function (list) { list.forEach(function (s) { if (s) srcs.push(s); }); refresh(); });
  }
  var pasteN = 0;
  function addPasted(m) { if (!m || !m.g.length) { O.toast('표를 읽지 못했습니다. 표를 다시 복사해 붙여 주세요.'); return; } srcs.push(mkSrc('붙여 넣은 표 ' + (++pasteN), '붙여 넣기', [{ name: '표', g: m.g, merges: m.merges }])); refresh(); }
  function srcById(id) { return srcs.filter(function (s) { return s.id === +id; })[0]; }
  function shortNm(s) { return ((s && s.name) || '').replace(/\.[^.]+$/, ''); }

  /* ================= ② 바구니 — 재료 구분 =================
     · 칸 구성이 거의 같은 재료끼리 → 아래로 쌓기
     · 값이 겹치는 기준 칸(이름·관리번호…)을 함께 가진 재료끼리 → 옆으로 맞추기
     · 아무 관계가 없으면 → 바구니를 따로 */
  var baskets = [], bkOver = {}, ack = {}, pick = {}, edits = {}, off = {};
  function relate(a, b) {
    var shared = a.fields.filter(function (f) { return b.F[f]; }), jac = shared.length / Math.max(1, a.fields.length + b.fields.length - shared.length), best = null;
    shared.forEach(function (f) {
      var ca = a.F[f], cb = b.F[f]; if (!ca.keyable || !cb.keyable) return;
      var ov = 0; Object.keys(ca.set).forEach(function (v) { if (cb.set[v]) ov++; });
      var ratio = ov / Math.max(1, Math.min(ca.distinct, cb.distinct)); if (ratio < 0.3) return;
      var rank = KEYRANK.indexOf(f); if (rank < 0) rank = 99;
      if (!best || rank < best.rank || (rank === best.rank && ratio > best.ov)) best = { f: f, ov: ratio, rank: rank };
    });
    return { st: shared.length >= 2 && jac >= 0.6, key: best };
  }
  function plan() {
    var use = srcs.filter(function (s) { return !s.bad && s.rows.length > 0 && s.fields.length > 0; }), par = {}, rel = {};
    srcs.forEach(function (s) { s.bk = null; });
    use.forEach(function (s) { par[s.id] = s.id; });
    function find(x) { while (par[x] !== x) x = par[x] = par[par[x]]; return x; }
    function uni(a, b) { a = find(a); b = find(b); if (a !== b) par[Math.max(a, b)] = Math.min(a, b); }
    for (var i = 0; i < use.length; i++) for (var j = i + 1; j < use.length; j++) {
      var a = use[i], b = use[j]; if (a.force === 'solo' || b.force === 'solo') continue;
      var r = relate(a, b); rel[a.id + '-' + b.id] = r;
      if (r.st || r.key) uni(a.id, b.id);
    }
    use.forEach(function (s) { var m = /^with:(\d+)$/.exec(s.force || ''); if (m && par[+m[1]] != null) uni(s.id, +m[1]); });
    var by = {}, order = [];
    use.forEach(function (s) { var r = find(s.id); if (!by[r]) { by[r] = []; order.push(r); } by[r].push(s); });
    baskets = order.map(function (r, n) {
      var ss = by[r], b = { no: n + 1, srcs: ss, bid: ss.map(function (s) { return s.id; }).join('-'), amb: [] }, allStack = ss.length > 1, votes = {};
      for (var i = 0; i < ss.length; i++) for (var j = i + 1; j < ss.length; j++) {
        var q = rel[ss[i].id + '-' + ss[j].id] || { st: false, key: null };
        if (!q.st) allStack = false;
        if (q.key) votes[q.key.f] = (votes[q.key.f] || 0) + 1;
        if (q.st && q.key && q.key.ov >= 0.5) b.amb.push([ss[i], ss[j], q.key.f]);
      }
      function rk(f) { var x = KEYRANK.indexOf(f); return x < 0 ? 99 : x; }
      var kc = Object.keys(votes).sort(function (x, y) { return votes[y] - votes[x] || rk(x) - rk(y); });
      b.autoMode = ss.length === 1 || allStack || !kc.length ? 'stack' : 'join'; b.autoKey = kc[0] || null;
      b.common = [];   // 기준 칸 후보: 재료 둘 이상에 있는 칸
      var cnt = {}; ss.forEach(function (s) { s.fields.forEach(function (f) { cnt[f] = (cnt[f] || 0) + 1; }); });
      ss.forEach(function (s) { s.fields.forEach(function (f) { if (cnt[f] >= 2 && b.common.indexOf(f) < 0) b.common.push(f); }); });
      var o = bkOver[b.bid] || {};
      b.mode = o.mode || b.autoMode; b.key = b.mode === 'join' ? (o.key && b.common.indexOf(o.key) >= 0 ? o.key : b.autoKey || b.common[0] || null) : null;
      if (b.mode === 'join' && !b.key) b.mode = 'stack';
      b.key2 = b.mode === 'join' ? (o.key2 !== undefined ? o.key2 : (b.key === '이름' && cnt['생년월일'] >= 2 ? '생년월일' : '')) : '';
      if (b.key2 === b.key) b.key2 = '';
      var pp = {}; ss.forEach(function (s) { pp[s.id] = s.id; });   // 묶음: 칸 구성이 같은 재료끼리(팀별 대장처럼 원래 서로 다른 것을 담은 재료)
      function pf(x) { while (pp[x] !== x) x = pp[x]; return x; }
      for (var i2 = 0; i2 < ss.length; i2++) for (var j2 = i2 + 1; j2 < ss.length; j2++) { var q2 = rel[ss[i2].id + '-' + ss[j2].id]; if (q2 && q2.st && !(q2.key && q2.key.ov >= 0.5)) { var x1 = pf(ss[i2].id), x2 = pf(ss[j2].id); if (x1 !== x2) pp[Math.max(x1, x2)] = Math.min(x1, x2); } }
      var pm = {}; b.piles = []; ss.forEach(function (s) { var r2 = pf(s.id); if (!pm[r2]) { pm[r2] = []; b.piles.push(pm[r2]); } pm[r2].push(s); });
      fillBasket(b);
      ss.forEach(function (s) { s.bk = b; });
      return b;
    });
  }
  function entry(x, f, sid) { var v = cellStr(x, f); if (f === '이름') v = v.trim(); if (!v) return null; var e = { v: v, src: sid }, n = cellNum(x, f); if (n !== undefined) { e.n = n; if (v === String(n)) e.v = showNum(n); } return e; }
  function fillBasket(b) {
    var items = [], fields = [], P = b.bid + SEP;
    function addField(f) { if (fields.indexOf(f) < 0) fields.push(f); }
    b.noKey = []; b.homo = {};
    if (b.mode === 'join') {
      addField(b.key);
      var by = {};
      b.srcs.forEach(function (s) {
        var kc = s.F[b.key]; if (!kc) { b.noKey.push(s); return; }
        var k2 = b.key2 && s.F[b.key2] ? s.F[b.key2] : null;
        s.fields.forEach(addField);
        s.rows.forEach(function (r) {
          var disp = cellStr(r[kc.i], b.key).trim(), nk = normVal(b.key, disp); if (!nk) return;
          var sub = k2 ? cellStr(r[k2.i], b.key2) : '';
          var cands = by[nk] || (by[nk] = []), free = cands.filter(function (p) { return !p.seen[s.id]; }), m = null;
          if (sub) m = free.filter(function (p) { return p.sub === sub; })[0] || free.filter(function (p) { return !p.sub; })[0] || null; else m = free[0] || null;
          if (!m) { m = { label: disp, key: nk, sub: sub, vals: {}, seen: {}, n: cands.length }; cands.push(m); items.push(m); }
          if (cands.length > 1) b.homo[nk] = cands;
          m.seen[s.id] = 1; if (sub && !m.sub) m.sub = sub;
          s.fields.forEach(function (f) {
            var e = entry(r[s.F[f].i], f, s.id); if (!e) return;
            var a = m.vals[f] || (m.vals[f] = []), nv = normVal(f, e.v);
            if (!a.some(function (x) { return normVal(f, x.v) === nv; })) a.push(e);
          });
        });
      });
      items.forEach(function (p) { p.pid = P + p.key + SEP + p.n; });
    } else {
      b.srcs.forEach(function (s) {
        s.fields.forEach(addField);
        s.rows.forEach(function (r, ri) {
          var m = { vals: {}, seen: {}, pid: P + s.id + ':' + ri }; m.seen[s.id] = 1;
          s.fields.forEach(function (f) { var e = entry(r[s.F[f].i], f, s.id); if (e) m.vals[f] = [e]; });
          if (b.srcs.length > 1) m.vals['재료 이름'] = [{ v: shortNm(s), src: s.id }];
          m.label = (m.vals[fields[0]] || [{ v: '' }])[0].v;
          items.push(m);
        });
      });
      if (b.srcs.length > 1) addField('재료 이름');
    }
    b.items = items; b.fields = fields;
  }
  function bkById(bid) { return baskets.filter(function (b) { return b.bid === bid; })[0]; }
  function valueOf(p, f) { var k = p.pid + SEP + f; if (edits[k] != null) return edits[k]; var a = p.vals[f]; if (!a) return ''; return (a[pick[k] || 0] || a[0]).v; }
  function rawOf(p, f) { var k = p.pid + SEP + f; if (edits[k] != null) return edits[k]; var a = p.vals[f]; if (!a) return ''; var e = a[pick[k] || 0] || a[0]; return e.n !== undefined ? e.n : e.v; }
  function included(b) { return b.items.filter(function (p) { return !off[p.pid]; }); }
  function issues(b) {
    var L = [], inc = included(b), P = b.bid + SEP;
    b.srcs.forEach(function (s) {
      s.cols.forEach(function (c) { if (c.conf === 'ask') L.push({ id: P + 'col' + SEP + s.id + SEP + c.i, go: 'src' + s.id, col: s.id + SEP + c.i, dup: c.dup, t: '「' + s.name + '」의 「' + c.head + '」 칸 → ' + c.why }); });
    });
    if (b.mode === 'stack' && !(bkOver[b.bid] || {}).mode) b.amb.forEach(function (x) { L.push({ id: P + 'amb' + SEP + x[0].id + SEP + x[1].id, ackable: true, t: '「' + x[0].name + '」와 「' + x[1].name + '」는 칸 구성이 같으면서 「' + x[2] + '」 값도 많이 겹칩니다. 지금은 아래로 쌓았습니다. 같은 대상의 정보를 한 줄로 합치려면 위에서 「옆으로 맞추기」로 바꿔 주세요.' }); });
    b.noKey.forEach(function (s) { L.push({ id: P + 'nokey' + SEP + s.id, block: true, go: 'src' + s.id, t: '「' + s.name + '」에는 기준 칸 「' + b.key + '」이(가) 없어 이 바구니에 담지 못했습니다. 재료 카드에서 그 칸을 골라 주거나 「따로 담기」로 바꿔 주세요.' }); });
    if (b.mode === 'join') {
      inc.forEach(function (p) {
        b.fields.forEach(function (f) {
          var a = p.vals[f], k = p.pid + SEP + f;
          if (a && a.length > 1 && pick[k] == null && edits[k] == null) L.push({ id: 'cf' + SEP + k, need: true, t: '「' + p.label + '」의 「' + f + '」이(가) 재료마다 다릅니다 — ' + a.map(function (e) { return e.v + ' (' + shortNm(srcById(e.src)) + ')'; }).join(' / ') + '. 아래 표의 노란 칸에서 골라 주세요.' });
        });
      });
      Object.keys(b.homo).forEach(function (n) { var c = b.homo[n]; L.push({ id: P + 'homo' + SEP + n + SEP + c.length, ackable: true, t: '「' + b.key + '」이(가) 같은 「' + c[0].label + '」이(가) 한 재료 안에 ' + c.length + '줄입니다. 서로 다른 대상이 맞는지, 다른 재료의 정보가 맞는 줄에 붙었는지 봐 주세요.' }); });
      var piles = keyedPiles(b);
      if (piles.length > 1) piles.forEach(function (pl) {
        var miss = inc.filter(function (p) { return !pl.some(function (s) { return p.seen[s.id]; }); });
        if (miss.length) L.push({ id: P + 'miss' + SEP + pl[0].id + SEP + miss.map(function (p) { return p.key + p.n; }).join(','), ackable: true, t: '「' + pl.map(shortNm).join(' + ') + '」에 없는 것 ' + miss.length + '건: ' + miss.slice(0, 8).map(function (p) { return p.label; }).join(', ') + (miss.length > 8 ? ' …' : '') + ' — 그 재료의 칸은 비어 있습니다.' });
      });
    }
    L.forEach(function (i) { i.done = !!ack[i.id]; });
    return L;
  }
  function keyedPiles(b) { return b.piles.map(function (pl) { return pl.filter(function (s) { return s.F[b.key]; }); }).filter(function (pl) { return pl.length; }); }
  function todoCount(b) { return issues(b).filter(function (i) { return !i.done; }).length; }
  function okToGo(b, extra) {
    var n = todoCount(b) + (extra || 0);
    return !n || confirm('아직 확인하지 않은 것이 ' + n + '개 있습니다.\n확인하지 않은 채로 받으면 틀린 값이 들어갈 수 있습니다. 그래도 받을까요?');
  }

  /* ---------- 재료 카드 ---------- */
  function fieldOpts(sel, head) {
    var h = '<option value="__own"' + (sel === '__own' ? ' selected' : '') + '>「' + esc(head) + '」 그대로</option><option value="__skip"' + (sel === '__skip' ? ' selected' : '') + '>담지 않음</option>';
    GROUPS.forEach(function (g) { h += '<optgroup label="' + g[0] + '">' + g[1].map(function (F) { return '<option value="' + F.id + '"' + (sel === F.id ? ' selected' : '') + '>' + F.id + '</option>'; }).join('') + '</optgroup>'; });
    return h;
  }
  function chip(c) {
    if (c.conf === 'sure') return '<span class="st sure">✓ 알아봄</span>';
    if (c.conf === 'done') return '<span class="st done">✓ 확인함</span>';
    if (c.conf === 'ask') return '<span class="st ask">? 확인 필요</span>';
    if (c.conf === 'new') return '<span class="st new">머리글 그대로</span>';
    return '<span class="st no">담지 않음</span>';
  }
  function renderSrcs() {
    var h = '';
    srcs.forEach(function (s) {
      if (s.bad) {
        h += '<div class="card bad" id="src' + s.id + '"><h3>⚠ ' + esc(s.name) + ' <small>읽지 못함</small><button type="button" class="btn mini" data-del="' + s.id + '">빼기</button></h3><p class="fix">' + esc(s.bad.why) + s.bad.fixes.map(function (x) { return '<a href="' + x.u + '" target="_blank" rel="noopener">' + esc(x.a) + ' ↗</a>'; }).join(' ') + esc(s.bad.tail) + '</p></div>';
        return;
      }
      var ask = s.cols.filter(function (c) { return c.conf === 'ask'; }).length, b = s.bk;
      var others = srcs.filter(function (x) { return x !== s && !x.bad && x.rows.length; });
      h += '<div class="card' + (ask ? ' warn' : '') + '" id="src' + s.id + '"><h3>' + (s.kind === '한글' ? '📄' : '📗') + ' ' + esc(s.name) + ' <small>' + s.kind + ' · 재료 ' + s.rows.length + '줄</small>' +
        (s.tabs.length > 1 ? '<label class="hint">' + (s.kind === '한글' ? '표' : '시트') + ' <select data-tab="' + s.id + '">' + s.tabs.map(function (x, i) { return '<option value="' + i + '"' + (i === s.tab ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select></label>' : '') +
        '<label class="hint">머리글 줄 <input type="number" min="1" max="60" value="' + (s.h + 1) + '" data-head="' + s.id + '" style="width:64px;padding:3px 6px"></label>' +
        '<button type="button" class="btn mini" data-del="' + s.id + '">빼기</button></h3>';
      if (b) h += '<p class="fix"><span class="bk bk' + (b.no % 6) + '">🧺 바구니 ' + b.no + '</span> 에 담았습니다' + (b.srcs.length > 1 ? ' — ' + (b.mode === 'join' ? (s.F[b.key] ? '「' + esc(b.key) + '」(으)로 다른 재료와 옆으로 맞춤' : '기준 칸 「' + esc(b.key) + '」이(가) 없어 아직 담기지 않음') : '칸 구성이 같은 재료와 아래로 쌓음') : ' — 관계있는 다른 재료가 없어 혼자 담김') +
        (others.length ? ' <label class="hint">담는 곳 <select data-force="' + s.id + '"><option value="">자동</option><option value="solo"' + (s.force === 'solo' ? ' selected' : '') + '>따로 담기</option>' + others.map(function (x) { return '<option value="with:' + x.id + '"' + (s.force === 'with:' + x.id ? ' selected' : '') + '>「' + esc(shortNm(x)) + '」와 같은 바구니</option>'; }).join('') + '</select></label>' : '') + '</p>';
      s.notes.forEach(function (n) { h += '<p class="fix">⚠ ' + esc(n.t) + (n.a ? '<a href="' + n.u + '" target="_blank" rel="noopener">' + esc(n.a) + ' ↗</a>' + esc(n.t2 || '') : '') + '</p>'; });
      h += '<div class="scroll"><table class="list"><tr><th>재료의 머리글</th><th>들어 있는 값 (예)</th><th>바구니 항목</th><th>상태</th></tr>';
      s.cols.forEach(function (c) {
        h += '<tr class="' + (c.conf === 'ask' ? 'ask' : c.sel === '__skip' ? 'skip' : '') + '"><td><b>' + esc(c.head) + '</b></td><td class="ex" title="' + esc(c.ex) + '">' + esc(c.ex || '(빈 칸)') + '</td>' +
          '<td><select data-col="' + s.id + SEP + c.i + '" aria-label="' + esc(c.head) + ' 칸의 항목">' + fieldOpts(c.sel, c.head) + '</select></td>' +
          '<td>' + chip(c) + (c.conf === 'ask' ? ' <button type="button" class="btn mini" data-ok="' + s.id + SEP + c.i + '">' + (c.dup ? '이대로 둘 다 쓰기' : '맞아요') + '</button><div class="why">' + esc(c.why) + '</div>' : '') + '</td></tr>';
      });
      h += '</table></div></div>';
    });
    $('srcList').innerHTML = h;
  }
  $('srcList').addEventListener('change', function (e) {
    var el = e.target, d = el.dataset;
    if (d.col) { var a = d.col.split(SEP), s = srcById(a[0]); s.over[+a[1]] = el.value; refresh(); }
    else if (d.tab) { var s2 = srcById(d.tab); s2.tab = +el.value; s2.h = null; s2.over = {}; refresh(); }
    else if (d.head) { var s3 = srcById(d.head); s3.h = Math.max(0, Math.min(s3.tabs[s3.tab].g.length - 1, (+el.value || 1) - 1)); s3.over = {}; refresh(); }
    else if (d.force) { srcById(d.force).force = el.value || null; refresh(); }
  });
  $('srcList').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.del) { srcs = srcs.filter(function (s) { return s.id !== +b.dataset.del; }); refresh(); }
    else if (b.dataset.ok) { var a = b.dataset.ok.split(SEP), s = srcById(a[0]), c = s.cols[+a[1]]; s.over[c.i] = c.sel; refresh(); }
  });

  /* ---------- 바구니 화면 ---------- */
  var SHOWMAX = 300;
  function renderBaskets() {
    var has = srcs.some(function (s) { return !s.bad; });
    $('basketPanel').hidden = !has; $('tplPanel').hidden = !baskets.length;
    if (!has) return;
    if (!baskets.length) { $('basketList').innerHTML = '<p class="hint">아직 바구니에 담긴 것이 없습니다. 위 재료 카드의 안내를 봐 주세요.</p>'; return; }
    var h = baskets.length > 1 ? '<p class="fix">넣은 재료가 서로 다른 종류라 <b>바구니 ' + baskets.length + '개</b>로 나눠 담았습니다. 한 바구니로 합치려면 위 재료 카드의 「담는 곳」을 바꿔 주세요.</p>' : '';
    baskets.forEach(function (b) {
      var L = issues(b), todo = L.filter(function (i) { return !i.done; }).length, inc = included(b), B = esc(b.bid), o = bkOver[b.bid] || {};
      h += '<div class="card" id="bk' + B + '"><h3><span class="bk bk' + (b.no % 6) + '">🧺 바구니 ' + b.no + '</span> <small>' + b.srcs.map(function (s) { return esc(shortNm(s)); }).join(' + ') + '</small></h3>';
      if (b.srcs.length > 1) {
        h += '<div class="row" style="margin:8px 0 2px"><label class="hint">담는 방식 <select data-mode="' + B + '"><option value="join"' + (b.mode === 'join' ? ' selected' : '') + (b.common.length ? '' : ' disabled') + '>옆으로 맞추기 (같은 대상을 한 줄로)</option><option value="stack"' + (b.mode === 'stack' ? ' selected' : '') + '>아래로 쌓기 (줄을 이어 붙임)</option></select></label>';
        if (b.mode === 'join') h += '<label class="hint">기준 칸 <select data-key="' + B + '">' + b.common.map(function (f) { return '<option' + (f === b.key ? ' selected' : '') + '>' + esc(f) + '</option>'; }).join('') + '</select></label>' +
          '<label class="hint">함께 볼 칸 <select data-key2="' + B + '"><option value="">(없음)</option>' + b.common.filter(function (f) { return f !== b.key; }).map(function (f) { return '<option' + (f === b.key2 ? ' selected' : '') + '>' + esc(f) + '</option>'; }).join('') + '</select></label>';
        h += '</div><p class="hint" style="margin:2px 0 8px">' + (b.mode === 'join' ? '「' + esc(b.key) + '」이(가) 같으면 같은 대상으로 보고, 재료마다 흩어진 정보를 한 줄에 모았습니다.' + (b.key2 ? ' 같은 값이 여럿이면 「' + esc(b.key2) + '」도 함께 봅니다.' : '') : '칸 구성이 같은 재료라 줄을 그대로 이어 붙였습니다. 어느 재료에서 왔는지 「재료 이름」 칸에 적었습니다.') + (o.mode || o.key ? '' : ' <b>(자동으로 정함 — 다르면 위에서 바꾸세요)</b>') + '</p>';
      }
      h += '<div class="sum"><span class="pill">' + inc.length + '줄' + (inc.length < b.items.length ? ' (뺀 줄 ' + (b.items.length - inc.length) + ')' : '') + '</span><span class="pill">항목 ' + b.fields.length + '개</span>' + (todo ? '<span class="pill todo">확인할 것 ' + todo + '개</span>' : '<span class="pill ok">✓ 확인할 것 없음</span>') + '</div>';
      h += '<ul class="issues">' + L.map(function (i) {
        return '<li class="' + (i.done ? 'done' : i.block || i.need ? 'block' : '') + '"><span class="t">' + (i.done ? '✓ ' : '') + esc(i.t) + '</span>' +
          (i.done ? '' : i.col ? '<button type="button" class="btn mini" data-colok="' + i.col + '">' + (i.dup ? '이대로 둘 다 쓰기' : '맞아요') + '</button><button type="button" class="btn mini" data-go="' + i.go + '">재료에서 고치기</button>' : i.go ? '<button type="button" class="btn mini" data-go="' + i.go + '">재료로 가기</button>' : i.ackable ? '<button type="button" class="btn mini" data-ack="' + esc(i.id) + '">확인했어요</button>' : '') + '</li>';
      }).join('') + '</ul>';
      var keyed = b.mode === 'join' ? keyedPiles(b) : [], showSrc = keyed.length > 1;
      h += '<div class="pv"><table><tr><th>담기</th>' + b.fields.map(function (f) { return '<th>' + esc(f) + (f === b.key ? ' 🔑' : '') + '</th>'; }).join('') + (showSrc ? '<th>나온 재료</th>' : '') + '</tr>';
      b.items.slice(0, SHOWMAX).forEach(function (p) {
        h += '<tr class="' + (off[p.pid] ? 'off ' : '') + (b.homo[p.key] ? 'flag' : '') + '"><td style="text-align:center"><input type="checkbox" data-off="' + esc(p.pid) + '"' + (off[p.pid] ? '' : ' checked') + ' aria-label="' + esc(p.label) + ' 담기"></td>';
        b.fields.forEach(function (f) {
          var a = p.vals[f], k = p.pid + SEP + f, v = valueOf(p, f), num = a && a[0].n !== undefined && edits[k] == null;
          if (a && a.length > 1 && edits[k] == null) h += '<td class="' + (pick[k] == null ? 'cf' : 'picked') + '"><select data-pick="' + esc(k) + '" aria-label="' + esc(p.label + ' ' + f) + ' 고르기">' + (pick[k] == null ? '<option value="">— 골라 주세요 —</option>' : '') + a.map(function (e, i) { return '<option value="' + i + '"' + (pick[k] === i ? ' selected' : '') + '>' + esc(e.v) + ' (' + esc(shortNm(srcById(e.src))) + ')</option>'; }).join('') + '</select></td>';
          else h += '<td contenteditable="true" spellcheck="false" data-ed="' + esc(k) + '" class="' + (f === b.key ? 'who ' : '') + (num ? 'num ' : '') + (edits[k] != null ? 'edited' : v ? '' : 'none') + '">' + esc(v) + '</td>';
        });
        if (showSrc) h += '<td class="src">' + keyed.map(function (pl, i) { return pl.some(function (s) { return p.seen[s.id]; }) ? i + 1 : ''; }).filter(Boolean).join('·') + ' / ' + keyed.length + '</td>';
        h += '</tr>';
      });
      h += '</table>' + (b.items.length > SHOWMAX ? '<p class="hint" style="padding:4px 8px;margin:0">… 앞 ' + SHOWMAX + '줄만 보입니다(모두 ' + b.items.length + '줄). 받는 파일에는 모두 들어갑니다.</p>' : '') +
        (showSrc ? '<p class="hint" style="padding:4px 8px;margin:0">나온 재료 번호: ' + keyed.map(function (pl, i) { return (i + 1) + ' = ' + esc(pl.map(shortNm).join(' + ')); }).join(' · ') + '</p>' : '') + '</div>' +
        '<div class="row" style="margin-top:10px"><button type="button" class="btn" data-bx="' + B + '">이 바구니를 엑셀로 받기</button><span class="hint">그릇(양식) 없이 모은 표만 필요할 때</span></div></div>';
    });
    $('basketList').innerHTML = h;
  }
  $('basketList').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.ack) { ack[b.dataset.ack] = 1; renderBaskets(); renderTpls(); }
    else if (b.dataset.colok) { var a = b.dataset.colok.split(SEP), s = srcById(a[0]), c = s.cols[+a[1]]; s.over[c.i] = c.sel; refresh(); }
    else if (b.dataset.go) { var el = $(b.dataset.go); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.outline = '3px solid var(--blue)'; setTimeout(function () { el.style.outline = ''; }, 1600); } }
    else if (b.dataset.bx) {
      var bk = bkById(b.dataset.bx), inc = included(bk); if (!inc.length) { O.toast('바구니가 비어 있습니다.'); return; }
      if (!okToGo(bk)) return;
      var body = inc.map(function (p) { return bk.fields.map(function (f) { var v = rawOf(p, f); return typeof v === 'number' ? { v: v, s: 'num' } : { v: v, s: 'textL' }; }); });
      O.download('바구니 ' + bk.no + '_모은 표.xlsx', Xlsxw.book(XK.bookSheet('바구니', bk.fields, body))); O.toast(inc.length + '줄을 엑셀로 내려받았습니다.');
    }
  });
  $('basketList').addEventListener('change', function (e) {
    var d = e.target.dataset, v = e.target.value, o;
    if (d.pick != null) { if (v === '') delete pick[d.pick]; else pick[d.pick] = +v; renderBaskets(); renderTpls(); }
    else if (d.off != null) { if (e.target.checked) delete off[d.off]; else off[d.off] = 1; renderBaskets(); tpls.forEach(mapTpl); renderTpls(); }
    else if (d.mode) { (bkOver[d.mode] = bkOver[d.mode] || {}).mode = v; refresh(); }
    else if (d.key) { o = bkOver[d.key] = bkOver[d.key] || {}; o.mode = 'join'; o.key = v; refresh(); }
    else if (d.key2 != null) { (bkOver[d.key2] = bkOver[d.key2] || {}).key2 = v; refresh(); }
  });
  function findItem(pid) { for (var i = 0; i < baskets.length; i++) { var p = baskets[i].items.filter(function (x) { return x.pid === pid; })[0]; if (p) return p; } return null; }
  $('basketList').addEventListener('focusout', function (e) {
    var td = e.target; if (!td.dataset || td.dataset.ed == null) return;
    var k = td.dataset.ed, now = td.textContent.replace(/\s+/g, ' ').trim(), i = k.lastIndexOf(SEP), pid = k.slice(0, i), f = k.slice(i + 1), p = findItem(pid); if (!p) return;
    if (now === valueOf(p, f)) return;
    var base = p.vals[f] ? p.vals[f][pick[k] || 0].v : '';
    if (now === base) delete edits[k]; else edits[k] = now;
    renderBaskets(); renderTpls();
  });
  $('basketList').addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.ed != null) { e.preventDefault(); e.target.blur(); } });

  /* ================= ③ 그릇 (내 양식) ================= */
  var tpls = [], tseq = 0;
  function headScore(g) {   // 양식에서 머리글 줄 찾기: 바구니 항목·사전 낱말·번호 칸이 가장 많은 줄
    var known = {}; baskets.forEach(function (b) { b.fields.forEach(function (f) { known[keyOf(f)] = 1; }); });
    var best = -1, bs = 0;
    for (var r = 0; r < Math.min(g.length, 40); r++) {
      var sc = 0; (g[r] || []).forEach(function (x) { var t = txt(x); if (!t) return; var k = keyOf(t), c = classify(t, []); if (SEQRE.test(k) || known[k] || (c.sel.charAt(0) !== '_' && c.conf === 'sure')) sc++; });
      if (sc > bs) { bs = sc; best = r; }
    }
    return { h: best, score: bs };
  }
  function shape(t) {   // 머리글 아래 빈 줄 수(cap), 그 아래 다른 내용(footer)
    var tab = t.tabs[t.tab], g = tab.g, h = t.h, heads = XK.headNames(g, h);
    var seqC = heads.map(function (n, i) { return SEQRE.test(keyOf(n)) ? i : -1; }).filter(function (i) { return i >= 0; });
    function blank(r) { return !(g[r] || []).some(function (x, i) { var s = txt(x); return s && !(seqC.indexOf(i) >= 0 && /^\d+\.?$/.test(s)); }); }
    var start = h + 1; while (start < g.length && !blank(start)) start++;
    var cap = 0; while (start + cap < g.length && blank(start + cap)) cap++;
    var footer = false; for (var r = start + cap; r < g.length; r++) if (!blank(r)) { footer = true; break; }
    t.heads = heads; t.start = start; t.cap = cap; t.footer = footer; t.pre = start - (h + 1);
  }
  function matchField(b, hd) {   // 양식 칸 → 바구니 항목
    var k = keyOf(hd), c = classify(hd, []);
    if (SEQRE.test(k)) return { sel: '__seq', conf: 'sure' };
    if (c.sel === '__skip') return { sel: '__none', conf: 'no' };
    var same = b.fields.filter(function (x) { return keyOf(x) === k; })[0];
    if (same) return { sel: same, conf: 'sure' };
    var f = c.sel === '__own' ? null : c.sel;
    if (f && b.fields.indexOf(f) >= 0) return { sel: f, conf: c.conf === 'ask' ? 'ask' : 'sure', why: c.why || '' };
    if (f && f !== '비고') return { sel: '__none', conf: 'ask', why: '이 바구니에 「' + f + '」 항목이 없어 비워 둡니다. 다른 항목을 넣으려면 골라 주세요.' };
    return { sel: '__none', conf: 'new', why: '' };
  }
  function bestBasket(labels) {
    var best = null, bs = -1;
    baskets.forEach(function (b) { var sc = labels.filter(function (hd) { return matchField(b, hd).sel.charAt(0) !== '_'; }).length; if (sc > bs) { bs = sc; best = b; } });
    return best;
  }
  function formMatch(b, label) { var m = matchField(b, label); return m.sel === '__seq' ? { sel: '__none', conf: 'new', why: '' } : m; }
  function mapTpl(t) {
    if (t.bad) return;
    if (t.listOk) shape(t); else { t.heads = []; t.start = 0; t.cap = 0; t.footer = false; t.pre = 0; }
    var named = t.heads.filter(function (h) { return !/^칸\d+$/.test(h); }).length;
    t.autoShape = t.listOk && t.cap >= 1 && named >= t.heads.length * 0.6 ? 'list' : (t.cands.length >= 2 || t.places.length ? 'form' : 'list');
    t.canList = t.listOk; t.canForm = t.cands.length >= 1 || t.places.length >= 1;
    t.shape = t.forceShape || t.autoShape; if (t.shape === 'list' && !t.canList) t.shape = 'form'; if (t.shape === 'form' && !t.canForm) t.shape = 'list';
    var labels = t.shape === 'form' ? t.cands.map(function (c) { return c.label; }).concat(t.places) : t.heads;
    var b = (t.forceB && bkById(t.forceB)) || bestBasket(labels); t.b = b; t.notes = []; t.limit = 0; t.map = []; t.fmap = []; t.pmap = [];
    if (!b) return;
    if (t.shape === 'form') {
      var of = t.over[b.bid + '|f'] || {}, op = t.over[b.bid + '|p'] || {};
      var mk = function (label, o) { if (o != null && (o.charAt(0) === '_' || b.fields.indexOf(o) >= 0)) return { sel: o, conf: 'done', why: '' }; var m = formMatch(b, label); return { sel: m.sel, conf: m.conf, why: m.why || '' }; };
      t.fmap = t.cands.map(function (cd, i) { var m = mk(cd.label, of[i]); m.head = cd.label; return m; });
      t.pmap = t.places.map(function (n, i) { var m = mk(n, op[i]); m.head = '{' + n + '}'; m.name = n; return m; });
      t.limit = included(b).length;
      if (baskets.length > 1 && !t.forceB) t.notes.push({ t: '이 그릇의 칸과 가장 잘 맞는 바구니 ' + b.no + '을(를) 골랐습니다. 다른 바구니를 담으려면 위 「담을 바구니」를 바꿔 주세요.' });
      if (!t.fmap.concat(t.pmap).some(function (m) { return m.sel.charAt(0) !== '_'; })) t.notes.push({ warn: true, t: '이 그릇의 칸 가운데 바구니 항목과 짝이 맞는 것이 없습니다. 아래에서 칸마다 담을 항목을 골라 주세요.' });
      return;
    }
    var ov = t.over[b.bid] || {};
    t.map = t.heads.map(function (hd, j) {
      var m = matchField(b, hd), o = ov[j];
      if (o != null && (o.charAt(0) === '_' || b.fields.indexOf(o) >= 0)) return { head: hd, sel: o, conf: 'done', why: '' };
      return { head: hd, sel: m.sel, conf: m.conf, why: m.why || '' };
    });
    var need = included(b).length; t.limit = need;
    if (baskets.length > 1 && !t.forceB) t.notes.push({ t: '이 그릇의 칸과 가장 잘 맞는 바구니 ' + b.no + '을(를) 골랐습니다. 다른 바구니를 담으려면 위 「담을 바구니」를 바꿔 주세요.' });
    if (t.pre) t.notes.push({ warn: true, t: '양식에 이미 내용이 ' + t.pre + '줄 적혀 있습니다. 그 아래 빈 줄부터 채웁니다(빈 양식이 맞는지 확인해 주세요).' });
    if (!t.map.some(function (m) { return m.sel.charAt(0) !== '_'; })) t.notes.push({ warn: true, t: '이 그릇의 칸 가운데 바구니 항목과 짝이 맞는 것이 없습니다. 아래에서 칸마다 담을 항목을 골라 주세요.' });
    else if (b.key && !t.map.some(function (m) { return m.sel === b.key; })) t.notes.push({ warn: true, t: '기준 칸 「' + b.key + '」이(가) 들어갈 자리가 정해지지 않았습니다. 아래에서 골라 주세요.' });
    if (need > t.cap) {
      if (t.footer && t.kind === 'xlsx') { t.limit = t.cap; t.notes.push({ warn: true, t: '빈 줄은 ' + t.cap + '개인데 담을 것은 ' + need + '줄입니다. 표 아래에 다른 내용이 있어 줄을 늘리지 못하니 ' + t.cap + '줄만 채웁니다. 양식의 빈 줄을 늘려 다시 넣어 주세요.' }); }
      else if (t.cap === 0 && t.kind === 'hwpx') { t.limit = 0; t.notes.push({ warn: true, t: '머리글 아래에 빈 줄이 하나도 없어 본뜰 줄이 없습니다. 양식에 빈 줄을 하나 이상 남겨 다시 넣어 주세요.' }); }
      else t.notes.push({ t: '빈 줄은 ' + t.cap + '개, 담을 것은 ' + need + '줄 → 모자란 ' + (need - t.cap) + '줄은 마지막 빈 줄과 같은 모양으로 늘립니다.' });
    }
  }
  function tplRows(t, asText) {
    if (!t.b) return [];
    return included(t.b).slice(0, t.limit).map(function (p, i) { return t.map.map(function (m) { return m.sel === '__seq' ? i + 1 : m.sel === '__none' ? undefined : asText ? valueOf(p, m.sel) : rawOf(p, m.sel); }); });
  }
  /* ---------- 한 건마다 한 장: 이름표 칸(성명·주소…)의 오른쪽이나 아래 빈칸 찾기 ---------- */
  function gridCells(g, merges) {
    var cov = {}, mm = {}, out = [];
    merges.forEach(function (m) { mm[m.r + ',' + m.c] = m; for (var i = 0; i < m.rs; i++) for (var j = 0; j < m.cs; j++) if (i || j) cov[(m.r + i) + ',' + (m.c + j)] = 1; });
    g.forEach(function (row, r) { row.forEach(function (x, c) { if (cov[r + ',' + c]) return; var m = mm[r + ',' + c]; out.push({ r: r, c: c, rs: m ? m.rs : 1, cs: m ? m.cs : 1, t: txt(x) }); }); });
    return out;
  }
  function formCands(cells) {
    var at = {}, used = {}, out = [];
    cells.forEach(function (c) { for (var i = 0; i < c.rs; i++) for (var j = 0; j < c.cs; j++) at[(c.r + i) + ',' + (c.c + j)] = c; });
    cells.forEach(function (c) {
      var t = c.t.replace(/\s+/g, ' ').replace(/\s*[:：]\s*$/, '').trim(); if (!t || t.length > 14 || /^[\d\s.,\-()]+$/.test(t) || /[{}]/.test(t)) return;
      var tg = at[c.r + ',' + (c.c + c.cs)]; if (!(tg && tg !== c && !tg.t)) { tg = at[(c.r + c.rs) + ',' + c.c]; if (!(tg && tg !== c && !tg.t)) return; }
      var k = tg.r + ',' + tg.c; if (used[k]) return; used[k] = 1;
      out.push({ label: t, r: tg.r, c: tg.c });
    });
    return out;
  }
  function prepTpl(t) {   // 목록 모양인지, 한 건마다 한 장 모양인지 둘 다 살펴 둠
    t.listOk = pickTab(t); t.cands = []; t.places = [];
    if (t.kind === 'hwpx') {
      t.tabs.forEach(function (tab, i) { if (tab.nested) return; formCands(tab.cells).forEach(function (cd) { cd.tab = i; t.cands.push(cd); }); });
      var seen = {}; Object.keys(t.xmlOf).forEach(function (pth) { (t.xmlOf[pth].match(/\{[^{}<>]{1,20}\}/g) || []).forEach(function (m) { var n = m.slice(1, -1).trim(); if (n && !seen[n]) { seen[n] = 1; t.places.push(n); } }); });
    } else {
      var bi = t.listOk ? t.tab : 0, bn = -1;
      if (!t.listOk) t.tabs.forEach(function (tab, i) { var n = formCands(tab.cells).length; if (n > bn) { bn = n; bi = i; } });
      t.ftab = bi; formCands(t.tabs[bi].cells).forEach(function (cd) { cd.tab = bi; t.cands.push(cd); });
    }
    if (!t.listOk) { t.tab = t.kind === 'hwpx' ? 0 : t.ftab; t.h = 0; }
    return t.listOk || t.cands.length >= 2 || t.places.length ? t : badTpl(t.name, NOLIST);
  }
  function badTpl(name, why, fixes, tail) { return { id: ++tseq, name: name, bad: { why: why, fixes: fixes || [], tail: tail || '' } }; }
  var NOLIST = '담을 자리를 찾지 못했습니다. 목록 모양이면 머리글 줄 아래에 빈 줄을, 한 건마다 한 장 모양이면 「성명」 같은 이름표 칸 옆에 빈칸을 두거나 문장 속에 {이름}처럼 적어 주세요.';
  function pickTab(t) {
    var best = -1, bs = 1, bh = 0;
    t.tabs.forEach(function (tab, i) { if (tab.nested) return; var s = headScore(tab.g); if (s.score > bs) { bs = s.score; best = i; bh = s.h; } });
    if (best < 0) return false;
    t.tab = best; t.h = bh; return true;
  }
  function addTpls(files) {
    var jobs = files.filter(function (f) { return !/^~\$/.test(f.name); }).map(function (f) {
      var ext = (f.name.split('.').pop() || '').toLowerCase();
      if (ext === 'xlsx' || ext === 'xlsm') return O.readBuf(f).then(function (ab) {
        var wb = XLSX.read(new Uint8Array(ab), { type: 'array', cellNF: true, sheetStubs: true });
        var tabs = wb.SheetNames.map(function (n) { var ws = wb.Sheets[n], sg = XK.sheetGrid(ws), rg = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']) : { s: { r: 0, c: 0 } }; return { name: n, g: sg.g, merges: sg.merges, r0: rg.s.r, c0: rg.s.c, cells: gridCells(sg.g, sg.merges) }; });
        return prepTpl({ id: ++tseq, name: f.name, kind: 'xlsx', ab: ab, tabs: tabs, over: {} });
      }, function () { return badTpl(f.name, '양식을 열지 못했습니다. 암호가 걸려 있으면 풀고 다시 넣어 주세요.'); });
      if (ext === 'hwpx') return O.readBuf(f).then(function (ab) { return parseHwpx(ab).then(function (h) {
        return prepTpl({ id: ++tseq, name: f.name, kind: 'hwpx', ab: ab, tabs: h.tabs, xmlOf: h.xmlOf, over: {} });
      }); }, function () { return badTpl(f.name, '한글 양식을 열지 못했습니다.'); });
      if (ext === 'hwp') return Promise.resolve(badTpl(f.name, '옛 한글 형식(hwp) 양식은 바로 채우지 못합니다. ', [{ a: 'HWP → HWPX 바꾸기', u: TOOL + 'hwp2hwpx.html' }], ' 도구로 hwpx로 바꾼 뒤 다시 넣어 주세요. (한글에서 「다른 이름으로 저장 → hwpx」도 됩니다)'));
      if (ext === 'xls') return Promise.resolve(badTpl(f.name, '옛 엑셀 형식(xls) 양식은 서식을 지킨 채 채우지 못합니다. 엑셀에서 「다른 이름으로 저장 → xlsx」로 바꿔 다시 넣어 주세요.'));
      return Promise.resolve(badTpl(f.name, '양식은 엑셀(xlsx)이나 한글(hwpx) 파일이어야 합니다.'));
    });
    return Promise.all(jobs).then(function (list) { list.forEach(function (t) { tpls.push(t); }); tpls.forEach(mapTpl); renderTpls(); });
  }
  function tplOpts(b, sel) {
    return '<option value="__none"' + (sel === '__none' ? ' selected' : '') + '>(비워 둠)</option><option value="__seq"' + (sel === '__seq' ? ' selected' : '') + '>(번호 1, 2, 3 … 자동)</option>' +
      b.fields.map(function (f) { return '<option value="' + esc(f) + '"' + (sel === f ? ' selected' : '') + '>' + esc(f) + '</option>'; }).join('');
  }
  function tplAsk(t) { return t.bad ? 0 : (t.shape === 'form' ? t.fmap.concat(t.pmap) : t.map).filter(function (m) { return m.conf === 'ask'; }).length; }
  function outName(t) { return t.name.replace(/\.[^.]+$/, '') + '_채움.' + t.kind; }
  function renderTpls() {
    var h = '';
    tpls.forEach(function (t) {
      if (t.bad) { h += '<div class="card bad"><h3>⚠ ' + esc(t.name) + ' <small>담을 수 없음</small><button type="button" class="btn mini" data-tdel="' + t.id + '">빼기</button></h3><p class="fix">' + esc(t.bad.why) + t.bad.fixes.map(function (x) { return '<a href="' + x.u + '" target="_blank" rel="noopener">' + esc(x.a) + ' ↗</a>'; }).join(' ') + esc(t.bad.tail) + '</p></div>'; return; }
      if (!t.b) { h += '<div class="card warn"><h3>' + esc(t.name) + '<button type="button" class="btn mini" data-tdel="' + t.id + '">빼기</button></h3><p class="fix">담을 바구니가 없습니다. 먼저 재료를 넣어 주세요.</p></div>'; return; }
      var rows = tplRows(t, true), ask = tplAsk(t), tab = t.tabs[t.tab], b = t.b, form = t.shape === 'form';
      var shapeSel = t.canList && t.canForm ? '<label class="hint">담는 모양 <select data-shape="' + t.id + '"><option value="list"' + (form ? '' : ' selected') + '>목록 (한 표에 여러 줄)</option><option value="form"' + (form ? ' selected' : '') + '>한 건마다 한 장</option></select></label>' : '';
      h += '<div class="card' + (ask || t.notes.some(function (n) { return n.warn; }) ? ' warn' : '') + '"><h3>' + (t.kind === 'hwpx' ? '📄' : '📗') + ' ' + esc(t.name) + ' <small>' + (t.kind === 'hwpx' ? '한글' : '엑셀') + ' · ' + (form ? '한 건마다 한 장 · 채울 자리 ' + (t.fmap.length + t.pmap.length) + '곳' : esc(tab.name) + ' · 빈 줄 ' + t.cap + '개') + '</small>' + shapeSel +
        (baskets.length > 1 ? '<label class="hint">담을 바구니 <select data-tb="' + t.id + '">' + baskets.map(function (x) { return '<option value="' + esc(x.bid) + '"' + (x === b ? ' selected' : '') + '>바구니 ' + x.no + ' (' + esc(x.srcs.map(shortNm).join(' + ').slice(0, 40)) + ')</option>'; }).join('') + '</select></label>' : '') +
        (form ? '' : '<label class="hint">머리글 줄 <input type="number" min="1" max="60" value="' + (t.h + 1) + '" data-thead="' + t.id + '" style="width:64px;padding:3px 6px"></label>') + '<button type="button" class="btn mini" data-tdel="' + t.id + '">빼기</button></h3>';
      h += '<p class="fix"><span class="bk bk' + (b.no % 6) + '">🧺 바구니 ' + b.no + '</span> 을 이 그릇에 담습니다.' + (form ? ' 바구니의 한 줄마다 양식 한 장씩 만듭니다.' : '') + '</p>';
      t.notes.forEach(function (n) { h += '<p class="fix"' + (n.warn ? ' style="color:var(--amber)"' : '') + '>' + (n.warn ? '⚠ ' : 'ℹ ') + esc(n.t) + '</p>'; });
      if (form) {
        var inc = included(b), p0 = inc[0], all = t.fmap.map(function (m, i) { return { m: m, k: 'f', i: i }; }).concat(t.pmap.map(function (m, i) { return { m: m, k: 'p', i: i }; }));
        h += '<div class="scroll"><table class="list"><tr><th>그릇(양식)의 자리</th><th>여기에 담을 것</th><th>상태</th><th>첫 건이 담긴 모습</th></tr>';
        all.forEach(function (x) {
          var m = x.m, st = m.conf === 'sure' ? '<span class="st sure">✓ 짝 맞음</span>' : m.conf === 'done' ? '<span class="st done">✓ 확인함</span>' : m.conf === 'ask' ? '<span class="st ask">? 확인 필요</span> <button type="button" class="btn mini" data-fok="' + t.id + SEP + x.k + SEP + x.i + '">맞아요</button><div class="why">' + esc(m.why) + '</div>' : '<span class="st new">비워 둠</span>';
          h += '<tr class="' + (m.conf === 'ask' ? 'ask' : m.sel === '__none' ? 'skip' : '') + '"><td><b>' + esc(m.head) + '</b> <span class="hint">' + (x.k === 'p' ? '문장 속 자리' : '옆·아래 빈칸') + '</span></td><td><select data-fmap="' + t.id + SEP + x.k + SEP + x.i + '" aria-label="' + esc(m.head) + ' 자리에 담을 것"><option value="__none"' + (m.sel === '__none' ? ' selected' : '') + '>(비워 둠)</option>' + b.fields.map(function (f) { return '<option value="' + esc(f) + '"' + (m.sel === f ? ' selected' : '') + '>' + esc(f) + '</option>'; }).join('') + '</select></td><td>' + st + '</td><td class="ex">' + esc(p0 && m.sel !== '__none' ? valueOf(p0, m.sel) : '') + '</td></tr>';
        });
        h += '</table></div><div class="row" style="margin-top:10px"><button type="button" class="btn main" data-fzip="' + t.id + '"' + (inc.length ? '' : ' disabled') + '>' + inc.length + '건 → 파일 ' + inc.length + '개 묶음(zip)으로 받기</button>' +
          (t.kind === 'hwpx' ? '<button type="button" class="btn" data-fall="' + t.id + '"' + (inc.length ? '' : ' disabled') + '>한 파일로 받기 (쪽마다 한 건)</button>' : '') + '<span class="hint">원래 양식 파일을 그대로 열어 자리만 채웁니다</span></div></div>';
        return;
      }
      h += '<div class="scroll"><table class="list"><tr><th>그릇(양식)의 칸</th><th>여기에 담을 것</th><th>상태</th></tr>';
      t.map.forEach(function (m, j) {
        var st = m.conf === 'sure' ? '<span class="st sure">✓ 짝 맞음</span>' : m.conf === 'done' ? '<span class="st done">✓ 확인함</span>' : m.conf === 'ask' ? '<span class="st ask">? 확인 필요</span> <button type="button" class="btn mini" data-tok="' + t.id + SEP + j + '">맞아요</button><div class="why">' + esc(m.why) + '</div>' : '<span class="st new">비워 둠</span>';
        h += '<tr class="' + (m.conf === 'ask' ? 'ask' : '') + '"><td><b>' + esc(m.head) + '</b></td><td><select data-tmap="' + t.id + SEP + j + '" aria-label="' + esc(m.head) + ' 칸에 담을 것">' + tplOpts(b, m.sel) + '</select></td><td>' + st + '</td></tr>';
      });
      h += '</table></div><p class="hint" style="margin:10px 0 4px">담긴 모습 (앞 6줄)</p><div class="pv" style="max-height:230px"><table><tr>' + t.map.map(function (m) { return '<th>' + esc(m.head) + '</th>'; }).join('') + '</tr>' +
        rows.slice(0, 6).map(function (r) { return '<tr>' + r.map(function (v) { return '<td' + (v === undefined || v === '' ? ' class="none"' : '') + '>' + esc(v === undefined ? '' : v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div>' +
        '<div class="row" style="margin-top:10px"><button type="button" class="btn main" data-fill="' + t.id + '"' + (rows.length ? '' : ' disabled') + '>' + rows.length + '줄 담아서 받기</button><span class="hint">원래 양식 파일을 그대로 열어 칸만 채웁니다 → 「' + esc(outName(t)) + '」</span></div></div>';
    });
    $('tplList').innerHTML = h;
  }
  function tplById(id) { return tpls.filter(function (t) { return t.id === +id; })[0]; }
  $('tplList').addEventListener('change', function (e) {
    var d = e.target.dataset;
    if (d.tmap) { var a = d.tmap.split(SEP), t = tplById(a[0]); (t.over[t.b.bid] = t.over[t.b.bid] || {})[+a[1]] = e.target.value; mapTpl(t); renderTpls(); }
    else if (d.thead) { var t2 = tplById(d.thead); t2.h = Math.max(0, Math.min(t2.tabs[t2.tab].g.length - 1, (+e.target.value || 1) - 1)); t2.over = {}; mapTpl(t2); renderTpls(); }
    else if (d.tb) { var t3 = tplById(d.tb); t3.forceB = e.target.value; mapTpl(t3); renderTpls(); }
    else if (d.shape) { var t4 = tplById(d.shape); t4.forceShape = e.target.value; mapTpl(t4); renderTpls(); }
    else if (d.fmap) { var q = d.fmap.split(SEP), t5 = tplById(q[0]), kk = t5.b.bid + '|' + q[1]; (t5.over[kk] = t5.over[kk] || {})[+q[2]] = e.target.value; mapTpl(t5); renderTpls(); }
  });
  $('tplList').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tdel) { tpls = tpls.filter(function (t) { return t.id !== +b.dataset.tdel; }); renderTpls(); }
    else if (b.dataset.tok) { var a = b.dataset.tok.split(SEP), t = tplById(a[0]); (t.over[t.b.bid] = t.over[t.b.bid] || {})[+a[1]] = t.map[+a[1]].sel; mapTpl(t); renderTpls(); }
    else if (b.dataset.fok) { var q = b.dataset.fok.split(SEP), t5 = tplById(q[0]), kk = t5.b.bid + '|' + q[1]; (t5.over[kk] = t5.over[kk] || {})[+q[2]] = (q[1] === 'f' ? t5.fmap : t5.pmap)[+q[2]].sel; mapTpl(t5); renderTpls(); }
    else if (b.dataset.fzip || b.dataset.fall) {
      var one = !!b.dataset.fall, t6 = tplById(b.dataset.fzip || b.dataset.fall), n6 = included(t6.b).length, base6 = t6.name.replace(/\.[^.]+$/, '');
      if (!okToGo(t6.b, tplAsk(t6))) return;
      O.toast(n6 + '건을 담는 중입니다…', 8000);
      (one ? formAll(t6) : formZip(t6)).then(function (blob) { O.download(one ? base6 + '_' + n6 + '건.hwpx' : base6 + '_' + n6 + '건.zip', blob); O.toast(n6 + '건을 담아 내려받았습니다.'); }, function (err) { O.toast('담지 못했습니다: ' + (err && err.message || err), 6000); });
    }
    else if (b.dataset.fill) { var t3 = tplById(b.dataset.fill); if (!okToGo(t3.b, tplAsk(t3))) return; fill(t3).then(function (blob) { O.download(outName(t3), blob); O.toast(tplRows(t3).length + '줄을 담은 양식을 내려받았습니다.'); }, function (err) { O.toast('담지 못했습니다: ' + (err && err.message || err), 5000); }); }
  });

  /* ---------- 채우기: 한글 ---------- */
  function xe(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function setCell(tc, v) {   // 칸의 첫 문단 모양을 본떠 글자만 바꿈 (기관판 후원금 보고서에서 검증한 방식)
    if (v === undefined) return tc;
    var m = tc.match(/(<hp:subList\b[^>]*>)([\s\S]*?)(<\/hp:subList>)/); if (!m) return tc;
    var p = (m[2].match(/<hp:p\b[^>]*>[\s\S]*?<\/hp:p>/) || [''])[0]; if (!p) return tc;
    var open = p.match(/^<hp:p\b[^>]*>/)[0], cp = (p.match(/charPrIDRef="(\d+)"/) || [0, '0'])[1];
    var paras = String(v).split('\n').map(function (t) { return open + '<hp:run charPrIDRef="' + cp + '">' + (t ? '<hp:t>' + xe(t) + '</hp:t>' : '') + '</hp:run></hp:p>'; }).join('');
    return tc.replace(m[0], m[1] + paras + m[3]);
  }
  function setRow(row, vals) { return row.replace(/<hp:tc\b[\s\S]*?<\/hp:tc>/g, function (tc) { var c = +(tc.match(/colAddr="(\d+)"/) || [0, 0])[1]; return setCell(tc, vals[c]); }); }
  function fillHwpx(t, rowsOut) {
    var tab = t.tabs[t.tab], rows = tab.rows, H = rows.slice(0, t.start), B = rows.slice(t.start, t.start + t.cap), T = rows.slice(t.start + t.cap);
    if (!B.length) return Promise.reject(new Error('양식에 빈 줄이 없습니다.'));
    var body = rowsOut.map(function (vals, i) { return setRow(B[Math.min(i, B.length - 1)], vals); });
    var all = H.concat(body, B.slice(rowsOut.length), T).map(function (r, i) { return r.replace(/rowAddr="\d+"/g, 'rowAddr="' + i + '"'); });
    var pre = tab.tx.slice(0, tab.tx.search(/<hp:tr\b/));
    if (all.length !== rows.length) {
      var hgt = all.reduce(function (s, r) {
        var hs = (r.match(/<hp:tc\b[\s\S]*?<\/hp:tc>/g) || []).filter(function (c) { return /rowSpan="1"/.test(c); }).map(function (c) { return +(c.match(/<hp:cellSz width="\d+" height="(\d+)"/) || [0, 0])[1]; });
        return s + (hs.length ? Math.min.apply(null, hs) : 0);
      }, 0);
      pre = pre.replace(/rowCnt="\d+"/, 'rowCnt="' + all.length + '"');
      if (hgt) pre = pre.replace(/(<hp:sz width="\d+" widthRelTo="\w+" height=")\d+/, '$1' + hgt);
    }
    var xml = t.xmlOf[tab.path], out = xml.slice(0, tab.s) + pre + all.join('') + '</hp:tbl>' + xml.slice(tab.e);
    return JSZip.loadAsync(t.ab).then(function (zip) {
      var names = Object.keys(zip.files).filter(function (n) { return !zip.files[n].dir; });
      names.sort(function (a, b) { return (a === 'mimetype' ? 0 : 1) - (b === 'mimetype' ? 0 : 1); });   // mimetype 맨 앞
      return Promise.all(names.map(function (n) { return n === tab.path ? out : zip.file(n).async('uint8array'); })).then(function (datas) {
        var nz = new JSZip();
        names.forEach(function (n, i) { nz.file(n, datas[i], n === 'mimetype' ? { compression: 'STORE' } : { compression: 'DEFLATE' }); });
        return nz.generateAsync({ type: 'blob', mimeType: 'application/hwp+zip' });
      });
    });
  }
  /* ---------- 채우기: 엑셀 (시트 XML의 칸만 고침 → 글꼴·테두리·열 너비 그대로) ---------- */
  function sheetPath(zip, sheetName) {
    return Promise.all([zip.file('xl/workbook.xml').async('string'), zip.file('xl/_rels/workbook.xml.rels').async('string')]).then(function (a) {
      var wb = new DOMParser().parseFromString(a[0], 'application/xml'), rel = new DOMParser().parseFromString(a[1], 'application/xml'), rid = null;
      [].forEach.call(wb.getElementsByTagName('sheet'), function (s) { if (s.getAttribute('name') === sheetName) rid = s.getAttribute('r:id') || s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id'); });
      var target = null;
      [].forEach.call(rel.getElementsByTagName('Relationship'), function (r) { if (r.getAttribute('Id') === rid) target = r.getAttribute('Target'); });
      if (!target) throw new Error('시트를 찾지 못했습니다.');
      return target.charAt(0) === '/' ? target.slice(1) : 'xl/' + target;
    });
  }
  function fillXlsx(t, rowsOut) {
    return JSZip.loadAsync(t.ab).then(function (zip) {
      var tab = t.tabs[t.tab];
      return sheetPath(zip, tab.name).then(function (path) {
        return zip.file(path).async('string').then(function (xml) {
          var doc = new DOMParser().parseFromString(xml, 'application/xml'), ns = doc.documentElement.namespaceURI, sd = doc.getElementsByTagNameNS(ns, 'sheetData')[0];
          if (!sd) throw new Error('시트 내용을 읽지 못했습니다.');
          var colL = XLSX.utils.encode_col, r0 = tab.r0, c0 = tab.c0;
          function rowEl(R) { var kids = sd.children, i; for (i = 0; i < kids.length; i++) { var n = +kids[i].getAttribute('r'); if (n === R) return kids[i]; if (n > R) break; } var el = doc.createElementNS(ns, 'row'); el.setAttribute('r', R); sd.insertBefore(el, kids[i] || null); return el; }
          function cellEl(row, ci, R) { var ref = colL(ci) + R, kids = row.children, i; for (i = 0; i < kids.length; i++) { var a = kids[i].getAttribute('r'); if (a === ref) return kids[i]; if (XLSX.utils.decode_cell(a).c > ci) break; } var el = doc.createElementNS(ns, 'c'); el.setAttribute('r', ref); row.insertBefore(el, kids[i] || null); return el; }
          var model = t.cap > 0 ? rowEl(r0 + t.start + t.cap) : null, maxR = 0;   // 마지막 빈 줄(1부터 세는 줄 번호)
          var mAttr = {}, mCells = [];
          if (model) { ['ht', 'customHeight', 's', 'customFormat', 'spans'].forEach(function (a) { if (model.hasAttribute(a)) mAttr[a] = model.getAttribute(a); }); [].forEach.call(model.children, function (mc) { mCells.push({ c: XLSX.utils.decode_cell(mc.getAttribute('r')).c, s: mc.getAttribute('s') }); }); }
          rowsOut.forEach(function (vals, i) {
            var R = r0 + t.start + i + 1, row = rowEl(R); maxR = R;
            if (i >= t.cap && model) { Object.keys(mAttr).forEach(function (a) { row.setAttribute(a, mAttr[a]); }); mCells.forEach(function (mc) { var el = cellEl(row, mc.c, R); if (mc.s != null) el.setAttribute('s', mc.s); }); }
            vals.forEach(function (v, j) {
              if (v === undefined) return;
              var el = cellEl(row, c0 + j, R); while (el.firstChild) el.removeChild(el.firstChild);
              if (typeof v === 'number') { el.removeAttribute('t'); var ve = doc.createElementNS(ns, 'v'); ve.textContent = String(v); el.appendChild(ve); }
              else if (v === '') el.removeAttribute('t');
              else { el.setAttribute('t', 'inlineStr'); var is = doc.createElementNS(ns, 'is'), tt = doc.createElementNS(ns, 't'); tt.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve'); tt.textContent = v; is.appendChild(tt); el.appendChild(is); }
            });
          });
          var dim = doc.getElementsByTagNameNS(ns, 'dimension')[0];
          if (dim && dim.getAttribute('ref') && /:/.test(dim.getAttribute('ref'))) { var rg = XLSX.utils.decode_range(dim.getAttribute('ref')); if (maxR - 1 > rg.e.r) { rg.e.r = maxR - 1; dim.setAttribute('ref', XLSX.utils.encode_range(rg)); } }
          zip.file(path, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + new XMLSerializer().serializeToString(doc.documentElement));
          return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        });
      });
    });
  }
  function fill(t) { return t.kind === 'hwpx' ? fillHwpx(t, tplRows(t, true)) : fillXlsx(t, tplRows(t, false)); }
  /* ---------- 한 건마다 한 장 ---------- */
  function hwpxPack(t, xmlMap) {   // 바뀐 section XML만 갈아 끼워 다시 묶음 (mimetype 맨 앞·무압축)
    return JSZip.loadAsync(t.ab).then(function (zip) {
      var names = Object.keys(zip.files).filter(function (n) { return !zip.files[n].dir; });
      names.sort(function (a, b) { return (a === 'mimetype' ? 0 : 1) - (b === 'mimetype' ? 0 : 1); });
      return Promise.all(names.map(function (n) { return xmlMap[n] != null ? xmlMap[n] : zip.file(n).async('uint8array'); })).then(function (datas) {
        var nz = new JSZip();
        names.forEach(function (n, i) { nz.file(n, datas[i], n === 'mimetype' ? { compression: 'STORE' } : { compression: 'DEFLATE' }); });
        return nz.generateAsync({ type: 'blob', mimeType: 'application/hwp+zip' });
      });
    });
  }
  function formXml(t, p) {   // 한 건을 담은 section XML들
    var out = {}, byTab = {}, pv = {};
    t.fmap.forEach(function (m, i) { if (m.sel === '__none') return; var cd = t.cands[i]; (byTab[cd.tab] = byTab[cd.tab] || {})[cd.r + ',' + cd.c] = valueOf(p, m.sel); });
    t.pmap.forEach(function (m) { if (m.sel !== '__none') pv[m.name] = valueOf(p, m.sel); });
    Object.keys(t.xmlOf).forEach(function (pth) {
      var xml = t.xmlOf[pth];
      t.tabs.map(function (tab, i) { return { tab: tab, i: i }; }).filter(function (x) { return x.tab.path === pth && byTab[x.i]; }).sort(function (a, b) { return b.tab.s - a.tab.s; }).forEach(function (x) {
        var vals = byTab[x.i];
        var tx = x.tab.tx.replace(/<hp:tc\b[\s\S]*?<\/hp:tc>/g, function (tc) { var c = +(tc.match(/colAddr="(\d+)"/) || [0, 0])[1], r = +(tc.match(/rowAddr="(\d+)"/) || [0, 0])[1], v = vals[r + ',' + c]; return v === undefined ? tc : setCell(tc, v); });
        xml = xml.slice(0, x.tab.s) + tx + xml.slice(x.tab.e);
      });
      out[pth] = xml.replace(/\{([^{}<>]{1,20})\}/g, function (m, n) { n = n.trim(); return pv[n] !== undefined ? xe(pv[n]) : m; });
    });
    return out;
  }
  function formXlsx(t, p) {
    return JSZip.loadAsync(t.ab).then(function (zip) {
      var tab = t.tabs[t.ftab];
      return sheetPath(zip, tab.name).then(function (path) {
        return zip.file(path).async('string').then(function (xml) {
          var doc = new DOMParser().parseFromString(xml, 'application/xml'), ns = doc.documentElement.namespaceURI, sd = doc.getElementsByTagNameNS(ns, 'sheetData')[0];
          if (!sd) throw new Error('시트 내용을 읽지 못했습니다.');
          t.fmap.forEach(function (m, i) {
            if (m.sel === '__none') return;
            var cd = t.cands[i], R = tab.r0 + cd.r + 1, ci = tab.c0 + cd.c, ref = XLSX.utils.encode_col(ci) + R, v = rawOf(p, m.sel), kids = sd.children, k, row = null, el = null;
            for (k = 0; k < kids.length; k++) { var n = +kids[k].getAttribute('r'); if (n === R) { row = kids[k]; break; } if (n > R) break; }
            if (!row) { row = doc.createElementNS(ns, 'row'); row.setAttribute('r', R); sd.insertBefore(row, kids[k] || null); }
            kids = row.children;
            for (k = 0; k < kids.length; k++) { var a = kids[k].getAttribute('r'); if (a === ref) { el = kids[k]; break; } if (XLSX.utils.decode_cell(a).c > ci) break; }
            if (!el) { el = doc.createElementNS(ns, 'c'); el.setAttribute('r', ref); row.insertBefore(el, kids[k] || null); }
            while (el.firstChild) el.removeChild(el.firstChild);
            if (typeof v === 'number') { el.removeAttribute('t'); var ve = doc.createElementNS(ns, 'v'); ve.textContent = String(v); el.appendChild(ve); }
            else if (v === '') el.removeAttribute('t');
            else { el.setAttribute('t', 'inlineStr'); var is = doc.createElementNS(ns, 'is'), tt = doc.createElementNS(ns, 't'); tt.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve'); tt.textContent = v; is.appendChild(tt); el.appendChild(is); }
          });
          zip.file(path, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + new XMLSerializer().serializeToString(doc.documentElement));
          return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        });
      });
    });
  }
  function formOne(t, p) { return t.kind === 'hwpx' ? hwpxPack(t, formXml(t, p)) : formXlsx(t, p); }
  function formZip(t) {   // 건마다 파일 하나 → zip
    var items = included(t.b), nz = new JSZip(), used = {}, base = t.name.replace(/\.[^.]+$/, '');
    return items.reduce(function (pr, p, i) {
      return pr.then(function () { return formOne(t, p); }).then(function (blob) {
        var nm = XK.fileSafe(base + '_' + (p.label || (i + 1))), b0 = nm, k = 2; while (used[nm]) nm = b0 + '(' + (k++) + ')'; used[nm] = 1;
        nz.file(nm + '.' + t.kind, blob);
      });
    }, Promise.resolve()).then(function () { return nz.generateAsync({ type: 'blob', mimeType: 'application/zip' }); });
  }
  function formAll(t) {   // 한글: 한 파일에 쪽마다 한 건
    var paths = Object.keys(t.xmlOf); if (t.kind !== 'hwpx' || paths.length !== 1) return Promise.reject(new Error('구역이 여러 개인 문서는 한 파일로 잇지 못합니다. 묶음(zip)으로 받아 주세요.'));
    var pth = paths[0], filled = included(t.b).map(function (p) { return formXml(t, p)[pth]; }); if (!filled.length) return Promise.reject(new Error('담을 것이 없습니다.'));
    var open = (filled[0].match(/^[\s\S]*?<hs:sec\b[^>]*>/) || [''])[0], close = '</hs:sec>'; if (!open) return Promise.reject(new Error('문서 구조를 읽지 못했습니다.'));
    function inner(x) { return x.slice(open.length, x.lastIndexOf(close)); }
    var body = inner(filled[0]) + filled.slice(1).map(function (x, i) {
      return inner(x).replace(/(<hp:(?:tbl|pic|rect|line|ellipse|container|ole|equation|textart)\b[^>]*?\sid=")(\d+)/g, function (m, pre, id) { return pre + (+id + (i + 1) * 7); })   // 쪽마다 개체 번호가 겹치지 않게
        .replace(/<hp:secPr\b[\s\S]*?<\/hp:secPr>/, '').replace(/<hp:ctrl>\s*<hp:colPr\b[^>]*\/>\s*<\/hp:ctrl>/, '')
        .replace(/<hp:p\b[^>]*>/, function (m) { return /pageBreak="/.test(m) ? m.replace(/pageBreak="\d"/, 'pageBreak="1"') : m.replace(/>$/, ' pageBreak="1">'); });
    }).join('');
    var map = {}; map[pth] = open + body + close;
    return hwpxPack(t, map);
  }

  /* ================= 전체 다시 그리기 ================= */
  function refresh() { OWN = {}; srcs.forEach(analyze); plan(); renderSrcs(); renderBaskets(); tpls.forEach(mapTpl); renderTpls(); }

  /* ================= 넣기 연결 ================= */
  O.bindDrop($('dropIn'), $('fileIn'), addFiles);
  O.bindDrop($('dropTpl'), $('fileTpl'), addTpls);
  $('pasteBtn').onclick = function () { $('pasteBox').hidden = !$('pasteBox').hidden; if (!$('pasteBox').hidden) $('pasteArea').focus(); };
  $('pasteArea').addEventListener('paste', function (e) {
    var cd = e.clipboardData; if (!cd) return; e.preventDefault();
    var html = cd.getData('text/html'), m = html && /<table/i.test(html) ? XK.fromHtml(html) : XK.fromText(cd.getData('text/plain') || '');
    addPasted(m); $('pasteArea').value = '';
  });

  /* ================= 예시 (모두 가상 재료) ================= */
  var NAMES = ['김하늘', '이바다', '박구름', '최별', '정나무', '한들꽃', '오솔길', '윤햇살', '서은빛', '장마루'];
  var TEAMS = ['가나팀', '다라팀', '마바팀'], REL = ['배우자', '자녀', '부모', '형제', '자녀', '배우자', '친구', '자녀', '부모', '배우자'];
  var ROADS = ['나래로', '새솔길', '한빛로', '도담길', '온누리로'];
  function ph(i, base) { return '010-' + (base + i) + '-' + String(1000 + i * 37).slice(-4); }
  function sampleSrc() {   // 사람: 한 사람의 정보가 세 파일에 흩어짐 → 옆으로 맞추기
    var a = [['2026년 직원 명단(예시)'], [], ['연번', '부서', '성명', '휴대폰']];
    NAMES.forEach(function (n, i) { a.push([i + 1, TEAMS[i % 3], n, i === 2 ? 1020021074 : ph(i, 2000)]); });   // 한 명은 엑셀이 앞자리 0을 지운 번호
    var b = [['이름', '주소', '우편번호']];
    NAMES.forEach(function (n, i) { if (i === 8) return; b.push([n, '서울시 가람구 ' + ROADS[i % 5] + ' ' + (12 + i * 3) + ', ' + (101 + i) + '동 ' + (i + 2) + '02호', String(4500 + i * 11).padStart(5, '0')]); });
    var c = [['비상연락 조사(예시)'], ['성 명', '비상연락처', '관계', '본인 번호', '작성일']];
    NAMES.forEach(function (n, i) { if (i === 3) return; c.push([n, ph(i, 7000), REL[i], i === 4 ? '010-2004-9999' : ph(i, 2000), '2026-11-1' + (i % 5)]); });
    c.push(['강새벽', '010-7010-1370', '부모', '010-2010-1370', '2026-11-12']);
    return [XK.aoaFile('직원 명단(예시).xlsx', a), XK.aoaFile('주소록(예시).xlsx', b), XK.aoaFile('비상연락 조사(예시).xlsx', c)];
  }
  function sampleGoods() {   // 물건: 팀별 대장 두 개(같은 모양) + 위치 조사 → 관리번호로 맞추기
    var a = [['가나팀 물품 대장(예시)'], [], ['연번', '관리번호', '품명', '규격', '수량', '단가', '구입일'],
      [1, 'G-001', '노트북', '15인치', 2, 1200000, '2025-03-02'], [2, 'G-002', '복합기', 'A3 컬러', 1, 2450000, '2024-11-15'], [3, 'G-003', '회의용 탁자', '1800×900', 3, 320000, '2023-06-20'], [4, 'G-004', '빔프로젝터', '4000안시', 1, 890000, '2025-01-08']];
    var b = [['번호', '관리번호', '품 명', '규격', '수량', '단가', '구입일자'],
      [1, 'D-001', '냉장고', '500L', 1, 1350000, '2024-04-12'], [2, 'D-002', '작업대', '스테인리스 1500', 4, 280000, '2023-09-01'], [3, 'D-003', '포장기', '반자동', 2, 760000, '2025-05-27']];
    var c = [['관리번호', '보관 장소', '상태', '확인자'],
      ['G-001', '2층 사무실', '양호', '김하늘'], ['G-002', '2층 복도', '수리 필요', '김하늘'], ['G-003', '3층 회의실', '양호', '이바다'], ['G-004', '3층 회의실', '양호', '이바다'], ['D-001', '1층 작업장', '양호', '박구름'], ['D-002', '1층 작업장', '양호', '박구름']];
    return [XK.aoaFile('가나팀 물품 대장(예시).xlsx', a), XK.aoaFile('다라팀 물품 대장(예시).xlsx', b), XK.aoaFile('물품 위치 조사(예시).xlsx', c)];
  }
  $('sampleIn').onclick = function () { addFiles(sampleSrc()); };
  $('sampleIn2').onclick = function () { addFiles(sampleGoods()); };
  function tplX(name, title, heads, cols, n, leftCols) {
    var head = heads.map(function (v) { return { v: v, s: 'head' }; }), rows = [[{ v: title, s: 'title' }], [{ v: '(2026년 11월 기준)', s: 'plain' }], head];
    for (var i = 0; i < n; i++) rows.push(head.map(function (_, j) { return { v: '', s: leftCols.indexOf(j) >= 0 ? 'textL' : 'text' }; }));
    return new File([Xlsxw.book({ name: title.replace(/\s/g, ''), cols: cols, rows: rows, merges: ['A1:' + XLSX.utils.encode_col(heads.length - 1) + '1'], heights: { 1: 30 } })], name);
  }
  function sampleTplX() { return tplX('비상연락망 양식(예시).xlsx', '비 상 연 락 망', ['연번', '부서', '성명', 'H.P', '주소', '비상연락처', '관계', '확인'], [6, 11, 10, 16, 42, 16, 9, 9], 8, [4]); }
  function sampleTplG() { return tplX('물품 현황표 양식(예시).xlsx', '물 품 현 황 표', ['연번', '관리번호', '품명', '규격', '수량', '단가', '보관 위치', '상태', '비고'], [6, 11, 16, 18, 8, 13, 14, 11, 12], 5, [2, 3]); }
  function sampleTplH() {
    var head = ['연번', '성명', '연락처', '주소', '비상연락처', '비고'].map(function (v) { return { t: v, gray: true }; }), rows = [head];
    for (var i = 0; i < 5; i++) rows.push(head.map(function () { return { t: '', align: 'center' }; }));
    return new File([Hwpx.textDoc([{ k: 'p', t: '비 상 연 락 망', align: 'center', style: 'title' }, { k: 'p', t: '(2026년 11월 기준)', align: 'right', style: 'text' }, { k: 'table', widths: [12, 22, 30, 62, 30, 14], rows: rows, h: 8 }, { k: 'p', t: '' }, { k: 'p', t: '○○기관', align: 'center', style: 'sub' }], '비상연락망')], '비상연락망 양식(예시).hwpx');
  }
  function sampleTplF() {   // 한 건마다 한 장: 이름표 칸 옆 빈칸 + 문장 속 {자리}
    var L = function (t) { return { t: t, gray: true }; }, E = function (cs) { return { t: '', cs: cs || 1 }; };
    return new File([Hwpx.textDoc([{ k: 'p', t: '개 인 별  연 락 카 드', align: 'center', style: 'title' }, { k: 'p', t: '' },
      { k: 'table', widths: [28, 57, 28, 57], rows: [[L('성명'), E(), L('소속'), E()], [L('연락처'), E(), L('비상연락처'), E()], [L('주소'), E(3)], [L('비고'), E(3)]], h: 11 },
      { k: 'p', t: '' }, { k: 'p', t: '위 {이름} 님에게 급한 일이 생기면 {관계}({비상연락처})에게 먼저 연락합니다.', style: 'text' }, { k: 'p', t: '' }, { k: 'p', t: '○○기관', align: 'center', style: 'sub' }], '연락 카드')], '개인별 연락 카드 양식(예시).hwpx');
  }
  $('sampleTplF').onclick = function () { addTpls([sampleTplF()]); };
  $('sampleTplX').onclick = function () { addTpls([sampleTplX()]); };
  $('sampleTplH').onclick = function () { addTpls([sampleTplH()]); };
  $('sampleTplG').onclick = function () { addTpls([sampleTplG()]); };

  /* 시험 입구 */
  window._mm = { addFiles: addFiles, addTpls: addTpls, sampleSrc: sampleSrc, sampleGoods: sampleGoods, sampleTplX: sampleTplX, sampleTplH: sampleTplH, sampleTplG: sampleTplG, sampleTplF: sampleTplF, formOne: formOne, formZip: formZip, formAll: formAll, fill: fill, tplRows: tplRows, issues: issues, valueOf: valueOf, rawOf: rawOf, refresh: refresh,
    state: function () { return { srcs: srcs, baskets: baskets, tpls: tpls, pick: pick, ack: ack, edits: edits, off: off, bkOver: bkOver }; } };
})();
