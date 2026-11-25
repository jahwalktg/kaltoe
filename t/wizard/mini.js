/* 문서 변신 마법사(시제품) — 공통 도우미. 한엑피 공방 core.js에서 필요한 것만 추림.
   모든 파일은 이 컴퓨터 브라우저 안에서만 읽고 만든다 — 어디로도 보내지 않는다. */
(function () {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var MIME = { hwpx: 'application/hwp+zip', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', zip: 'application/zip' };
  function download(name, data, mime) {
    var ext = (name.split('.').pop() || '').toLowerCase();
    var blob = data instanceof Blob ? data : new Blob([data], { type: mime || MIME[ext] || 'application/octet-stream' });
    if (window._onDownload) { try { if (window._onDownload(name, blob) === true) return; } catch (e) { } }   // 시험용 입구
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }
  var tt = 0;
  function toast(msg, ms) { var t = $('toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(function () { t.hidden = true; }, ms || 2800); }
  function bindDrop(zone, input, cb) {
    function take(list) { var a = [].slice.call(list || []); if (a.length) cb(a); }
    input.addEventListener('change', function () { take(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('over'); }); });
    zone.addEventListener('drop', function (e) { take(e.dataTransfer.files); });
  }
  function readBuf(f) { return f.arrayBuffer ? f.arrayBuffer() : new Promise(function (ok, no) { var r = new FileReader(); r.onload = function () { ok(r.result); }; r.onerror = no; r.readAsArrayBuffer(f); }); }
  window.Office = { $: $, esc: esc, download: download, toast: toast, bindDrop: bindDrop, readBuf: readBuf, markDirty: function () { } };
})();
