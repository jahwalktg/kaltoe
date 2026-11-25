/* 뚝딱 한엑피 공방 — 공통 도우미 + 도구 등록표
   새 도구 넣는 법: tools/아이디.html 하나 만들고 아래 TOOLS에 한 줄. (apps: 'xl' 엑셀 · 'hwp' 한글 · 'ppt' PPT, 여러 개면 그 칸마다 보임)
   모든 파일은 이 컴퓨터 브라우저 안에서만 읽고 만든다 — 어디로도 보내지 않는다. */
(function () {
  var TOOLS = [
    { id: 'xl2hwp', when: '운영보고·결과보고에 엑셀 표를 붙였더니 칸이 깨지고 테두리가 사라질 때', apps: ['xl', 'hwp'], icon: '📋', title: '엑셀 표 → 한글 표', desc: '엑셀에서 복사한 표나 xlsx 파일을 테두리·회색 머리·숫자 쉼표·합계 줄이 갖춰진 한글(hwpx) 표로. 가로·세로 쪽, 칸 폭도 맞춰 줍니다.' },
    { id: 'hwp2hwpx', apps: ['hwp'], icon: '🔄', title: 'HWP → HWPX 바꾸기', when: '메일에 hwp 첨부가 막히거나, 옛 hwp 파일 수십 개를 hwpx로 한꺼번에 바꿔야 할 때', desc: '옛 한글 파일(hwp)을 서식 그대로 hwpx로. 여러 개·폴더째 한 번에 바꿔 zip으로 받습니다. 국가표준 개방형 형식이라 AI도 읽을 수 있어요.' },
    { id: 'aitext', apps: ['hwp', 'xl'], icon: '🤖', title: 'AI에 붙일 글 꺼내기', when: '작년 보고서·회의록을 AI에 맡기고 싶은데, 표가 깨지거나 개인정보가 걱정될 때', desc: '한글(hwp·hwpx)·엑셀·워드 문서를 표까지 살린 글로 꺼내고, 이름·주민번호·전화·계좌를 가려 챗GPT 등에 바로 붙이도록 복사합니다.' },
    { id: 'album', when: '행사가 끝나고 사진 수십 장으로 결과 보고 PPT를 만들어야 할 때', apps: ['ppt'], icon: '🖼️', title: '사진 앨범 PPT', desc: '행사 사진 폴더를 넣으면 찍은 순서대로 한 장에 1~9장씩 배치한 PPT. 사진 크기를 줄여 파일도 가볍게.' },
    { id: 'pptslim', when: '메일·카톡에서 「파일이 너무 커서 보낼 수 없음」이 뜰 때', apps: ['ppt'], icon: '🪶', title: 'PPT 용량 줄이기', desc: '메일로 안 보내지는 무거운 PPT — 안에 든 큰 사진만 줄여서 다시 묶습니다. 글·도형·애니메이션은 그대로.' },
    { id: 'xlmerge', when: '부서·기관마다 따로 받은 명단을 하나로 모으거나, 전체 표를 부서별로 나눠 보낼 때', apps: ['xl'], icon: '🧩', title: '엑셀 합치기·나누기', desc: '부서별 파일 여러 개를 한 표로, 한 표를 부서별 시트·파일로. 맨 위 제목 줄·머리글 이름이 조금 달라도 맞춰서.' },
    { id: 'xlclean', when: '시스템에서 받은 엑셀이 합친 칸·합계 줄 때문에 정렬·필터가 안 될 때', apps: ['xl'], icon: '🧹', title: '표 청소기', desc: '합쳐진 칸 풀기, 빈 줄·중간 합계 줄 빼기, 숫자로 안 바뀐 숫자·날짜 고치기, 띄어쓰기 정리.' },
    { id: 'xlsum', when: '피벗 테이블은 어려운데 부서별·월별 합계를 내야 할 때', apps: ['xl', 'hwp'], icon: '🧮', title: '피벗 없이 집계표', desc: '「부서별·월별 합계」처럼 기준만 고르면 집계표 — 그대로 한글 표로도.' },
    { id: 'xlchart', when: '보고·발표에서 숫자를 표 대신 한눈에 보이는 차트로 보여 주고 싶을 때', apps: ['xl', 'ppt'], icon: '📊', title: '엑셀 숫자 → PPT 차트', desc: '표를 붙여 넣으면 고칠 수 있는 PowerPoint 차트 장표로.' },
  ];
  var APPS = { xl: { name: '엑셀', cls: 'xl' }, hwp: { name: '한글', cls: 'hwp' }, ppt: { name: 'PPT', cls: 'ppt' } };
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var MIME = { hwpx: 'application/hwp+zip', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', zip: 'application/zip' };
  function download(name, data, mime) {
    var ext = (name.split('.').pop() || '').toLowerCase();
    var blob = data instanceof Blob ? data : new Blob([data], { type: mime || MIME[ext] || 'application/octet-stream' });
    if (window._onDownload) { try { if (window._onDownload(name, blob) === true) return; } catch (e) { } }   // 시험용 입구: true를 돌려주면 저장 창 없이 확인용으로만
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }
  var tt = 0;
  function toast(msg, ms) { var t = $('toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(function () { t.hidden = true; }, ms || 2600); }
  /* 끌어다 놓기 + 고르기: zone(끌어 놓는 칸), input(file 입력), cb(파일 배열) — 폴더를 놓으면 안의 파일까지 */
  function bindDrop(zone, input, cb) {
    function take(list) { var a = [].slice.call(list || []); if (a.length) cb(a); }
    input.addEventListener('change', function () { take(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('over'); }); });
    zone.addEventListener('drop', function (e) {
      var items = e.dataTransfer.items, entries = [];
      if (items && items.length && items[0].webkitGetAsEntry) { for (var i = 0; i < items.length; i++) { var en = items[i].webkitGetAsEntry(); if (en) entries.push(en); } }
      if (!entries.some(function (en) { return en.isDirectory; })) { take(e.dataTransfer.files); return; }
      var out = [], pending = 0;
      function walk(en, path) {
        pending++;
        if (en.isFile) en.file(function (f) { try { Object.defineProperty(f, 'relPath', { value: path + f.name }); } catch (x) { } out.push(f); done(); }, done);
        else { var rd = en.createReader(), all = []; (function more() { rd.readEntries(function (es) { if (!es.length) { all.forEach(function (c) { walk(c, path + en.name + '/'); }); done(); } else { all = all.concat([].slice.call(es)); more(); } }, done); })(); }
      }
      function done() { if (--pending === 0) take(out); }
      entries.forEach(function (en) { walk(en, ''); });
    });
  }
  function readBuf(f) { return f.arrayBuffer ? f.arrayBuffer() : new Promise(function (ok, no) { var r = new FileReader(); r.onload = function () { ok(r.result); }; r.onerror = no; r.readAsArrayBuffer(f); }); }
  function fmtSize(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB'; }
  function today() { var d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); }
  function pref(key, val) { var k = 'kaltoe.office.' + key; try { if (val === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(val)); } catch (e) { return null; } }
  /* 도구 화면 머리: <header id="top"></header> 자리에 공방 이름 + 이 도구 이름 */
  function header(id) {
    var t = TOOLS.filter(function (x) { return x.id === id; })[0], el = $('top'); if (!el || !t) return;
    el.className = 'top';
    el.innerHTML = '<h1>' + t.icon + ' ' + esc(t.title) + '</h1>' + t.apps.map(function (a) { return '<span class="tag ' + a + '">' + APPS[a].name + '</span>'; }).join(' ');
    document.title = t.title + ' — 칼퇴용 뚝딱 사무도구';
  }
  /* 비우기: 파일·붙여 넣기·「예시」를 쓰면 머리와 예시 단추 옆에 「비우기」가 나타남 → 누르면 넣은 것 모두 지우고 처음 상태로
     (도구마다 따로 짜지 않도록 화면을 새로 여는 방식 — 넣은 자료는 어디에도 저장되지 않으므로 그대로 사라짐, 고른 설정은 유지) */
  var dirty = false;
  function clearAll() {
    if (!confirm('넣은 파일·표와 만든 결과를 모두 비우고 처음 상태로 돌아갈까요?')) return;
    location.replace(location.pathname + location.search);
  }
  function mkClear(big) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn jt-clear' + (big ? ' big' : ''); b.textContent = '🗑 비우기'; b.title = '넣은 것을 모두 지우고 처음 상태로'; b.onclick = clearAll; return b; }
  function markDirty() {
    if (dirty) return; dirty = true;
    var top = $('top'); if (top && top.className === 'top') top.appendChild(mkClear(true));
    [].slice.call(document.querySelectorAll('button')).forEach(function (b) {
      if (/예시/.test(b.textContent) && !b.classList.contains('jt-clear') && !(b.nextElementSibling && b.nextElementSibling.classList.contains('jt-clear'))) b.insertAdjacentElement('afterend', mkClear(false));
    });
  }
  document.addEventListener('change', function (e) { if (e.target.type === 'file' && e.target.files && e.target.files.length) markDirty(); }, true);
  document.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) markDirty(); }, true);
  document.addEventListener('input', function (e) { if (e.target.tagName === 'TEXTAREA' && e.target.value.trim()) markDirty(); }, true);
  document.addEventListener('paste', function (e) { if (e.target.tagName === 'TEXTAREA') setTimeout(markDirty, 0); }, true);
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('button'); if (b && /예시/.test(b.textContent) && !b.classList.contains('jt-clear')) setTimeout(markDirty, 0); }, true);
  window.Office = { TOOLS: TOOLS, APPS: APPS, $: $, esc: esc, download: download, toast: toast, bindDrop: bindDrop, readBuf: readBuf, fmtSize: fmtSize, today: today, pref: pref, header: header, markDirty: markDirty };
})();
