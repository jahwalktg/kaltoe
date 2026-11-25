'use strict';
/* 서식 있는 엑셀(xlsx) 만들기 — 테두리·굵은 글씨·회색 머리·숫자 쉼표·글자 계좌·병합·인쇄 설정.
   SheetJS 무료판은 서식을 못 써서 직접 만든다. zip은 Hwpx.zip (hwpx.html)을 같이 쓴다.
   Xlsxw.book({ name, cols: [너비], rows: [[cell|null]], heights: {행번호: 높이}, merges: ['A1:M1'], landscape, printTitles: '2:3' })
   cell: { v, s: 스타일, f: 수식 } — 스타일: title head text textL num sumL sumN acct box(테두리·위 정렬·줄바꿈) right bold plain(테두리 없음) */
const X_PO = '<' + '?', X_PC = '?' + '>', X_HT = 'http:' + '/' + '/';   // XML 머리 시작·끝 조각 (Apps Script가 이 모양을 소스에서 바꿔 버려서 나눠 둠)
const Xlsxw = (() => {
  const S = { def: 0, title: 1, head: 2, text: 3, textL: 4, num: 5, sumL: 6, sumN: 7, acct: 8, box: 9, right: 10, bold: 11, plain: 12, gen: 13, date: 14, pct: 15, pct2: 16 };   // (공방) gen = 일반 숫자(소수 그대로), date = yyyy-mm-dd
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const col = n => { let s = ''; n++; while (n) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  const STYLES = `${X_PO}xml version="1.0" encoding="UTF-8" standalone="yes"${X_PC}
<styleSheet xmlns="${X_HT}schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="yyyy\-mm\-dd"/></numFmts>
<fonts count="3"><font><sz val="10"/><name val="맑은 고딕"/><family val="3"/><charset val="129"/></font><font><b/><sz val="10"/><name val="맑은 고딕"/><family val="3"/><charset val="129"/></font><font><b/><sz val="15"/><name val="맑은 고딕"/><family val="3"/><charset val="129"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE7E6E6"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color auto="1"/></left><right style="thin"><color auto="1"/></right><top style="thin"><color auto="1"/></top><bottom style="thin"><color auto="1"/></bottom><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="17">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
<xf numFmtId="3" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="3" fontId="1" fillId="2" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
<xf numFmtId="49" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="9" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
<xf numFmtId="10" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="표준" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
  function sheetXml(o){
    const rows = o.rows, maxC = Math.max(...rows.map(r => r.length));
    let x = `${X_PO}xml version="1.0" encoding="UTF-8" standalone="yes"${X_PC}
<worksheet xmlns="${X_HT}schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${X_HT}schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="A1:${col(maxC - 1)}${rows.length}"/><sheetViews><sheetView workbookViewId="0">${o.freeze ? `<pane ySplit="${o.freeze}" topLeftCell="A${o.freeze + 1}" activePane="bottomLeft" state="frozen"/>` : ''}</sheetView></sheetViews><sheetFormatPr defaultRowHeight="16.5"/>`;
    x += '<cols>' + o.cols.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('') + '</cols><sheetData>';
    rows.forEach((r, ri) => {
      const h = o.heights && o.heights[ri + 1];
      x += `<row r="${ri + 1}"${h ? ` ht="${h}" customHeight="1"` : ''}>`;
      r.forEach((c, ci) => {
        if (!c) return;
        const ref = col(ci) + (ri + 1), s = S[c.s || 'def'] || 0;
        if (c.f) x += `<c r="${ref}" s="${s}"><f>${esc(c.f)}</f><v>${Number(c.v) || 0}</v></c>`;
        else if (typeof c.v === 'number' && c.s !== 'acct') x += `<c r="${ref}" s="${s}"><v>${c.v}</v></c>`;
        else if (c.v == null || c.v === '') x += `<c r="${ref}" s="${s}"/>`;
        else x += `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${esc(c.v)}</t></is></c>`;
      });
      x += '</row>';
    });
    x += '</sheetData>';
    if (o.filter) x += `<autoFilter ref="${o.filter}"/>`;   // (공방) 머리글 거르기 단추
    if (o.merges && o.merges.length) x += `<mergeCells count="${o.merges.length}">` + o.merges.map(m => `<mergeCell ref="${m}"/>`).join('') + '</mergeCells>';
    x += `<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="${o.landscape ? 'landscape' : 'portrait'}" fitToWidth="1" fitToHeight="0"/></worksheet>`;
    return x;
  }
  /* 시트 하나: book({ name, cols, rows, … }) / 여러 장: book({ sheets: [{ name, cols, rows, … }, …] }) */
  function book(o){
    const sheets = o.sheets || [o], used = new Set();
    const names = sheets.map((s, i) => {
      let n = String(s.name || 'Sheet' + (i + 1)).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31), k = 2;
      while (used.has(n)) n = n.slice(0, 27) + ' (' + k++ + ')';
      used.add(n); return n;
    });
    const titles = sheets.map((s, i) => s.printTitles ? `<definedName name="_xlnm.Print_Titles" localSheetId="${i}">'${esc(names[i])}'!$${s.printTitles.replace(':', ':$')}</definedName>` : '').join('');
    const files = [
      ['[Content_Types].xml', '' + X_PO + 'xml version="1.0" encoding="UTF-8" standalone="yes"' + X_PC + `<Types xmlns="${X_HT}schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>`
        + sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')
        + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
      ['_rels/.rels', '' + X_PO + 'xml version="1.0" encoding="UTF-8" standalone="yes"' + X_PC + `<Relationships xmlns="${X_HT}schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${X_HT}schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
      ['xl/workbook.xml', `${X_PO}xml version="1.0" encoding="UTF-8" standalone="yes"${X_PC}<workbook xmlns="${X_HT}schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${X_HT}schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names.map((n, i) => `<sheet name="${esc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>${titles ? `<definedNames>${titles}</definedNames>` : ''}</workbook>`],
      ['xl/_rels/workbook.xml.rels', '' + X_PO + 'xml version="1.0" encoding="UTF-8" standalone="yes"' + X_PC + `<Relationships xmlns="${X_HT}schemas.openxmlformats.org/package/2006/relationships">`
        + sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${X_HT}schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')
        + `<Relationship Id="rId${sheets.length + 1}" Type="${X_HT}schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
      ['xl/styles.xml', STYLES]
    ].concat(sheets.map((s, i) => ['xl/worksheets/sheet' + (i + 1) + '.xml', sheetXml(s)]));
    return Hwpx.zip(files);
  }
  return { book, col };
})();
