/* 도구 그림 — 사진 손질방과 같은 손그림 선(52×52, 선 두께 2). 새 도구를 넣으면 여기에도 하나 그린다. */
(function () {
  var IC = {
    xlmerge: '<rect x="5" y="7" width="17" height="15" rx="2" fill="#e3f0ee"/><rect x="5" y="30" width="17" height="15" rx="2" fill="#fff3d6"/><rect x="33" y="14" width="14" height="24" rx="2" fill="#0f6b66"/><path d="M36 22h8M36 30h8" stroke="#fff"/><path d="M22 14l7 8M22 38l7-8"/>',
    xlclean: '<rect x="5" y="17" width="28" height="28" rx="3" fill="#fff"/><path d="M5 26h28M5 35h28M19 17v28"/><path d="M47 5L34 20"/><path d="M30 18l8 6-6 8-10-8z" fill="#ffb454"/>',
    xlsum: '<rect x="8" y="5" width="36" height="42" rx="3" fill="#e3f0ee"/><path d="M33 17v-3H18l9 12-9 12h15v-3" stroke="#0f6b66" stroke-width="4"/>',
    xlchart: '<rect x="4" y="7" width="44" height="31" rx="3" fill="#fff"/><rect x="11" y="24" width="7" height="10" fill="#ffb454"/><rect x="22" y="17" width="7" height="17" fill="#0f6b66"/><rect x="33" y="12" width="7" height="22" fill="#c2491d"/><path d="M26 38v4M17 46l9-4 9 4"/>',
    excel: '<rect x="5" y="9" width="42" height="34" rx="3" fill="#e3f0ee"/><path d="M5 19h42"/><path d="M13 37c5 0 4-13 10-13M14 30h9" stroke="#0f6b66" stroke-width="3"/><path d="M29 28l9 10M38 28l-9 10" stroke="#c2491d" stroke-width="3"/>',
    'list-compare': '<rect x="4" y="8" width="18" height="36" rx="2" fill="#fff"/><rect x="30" y="8" width="18" height="36" rx="2" fill="#fff"/><path d="M8 16h10M8 24h10M34 16h10M34 34h10"/><path d="M8 34h10" stroke="#c2491d" stroke-width="4"/><path d="M34 25h10" stroke="#0f6b66" stroke-width="4"/>',
    'survey-tally': '<rect x="8" y="6" width="36" height="40" rx="3" fill="#fff"/><path d="M15 14v10M20 14v10M25 14v10M30 14v10M12 22l21-6" stroke="#c2491d"/><path d="M14 33h22" stroke="#0f6b66" stroke-width="5"/><path d="M14 40h13" stroke="#ffb454" stroke-width="5"/>',
    xl2hwp: '<rect x="4" y="8" width="22" height="22" rx="2" fill="#e3f0ee"/><path d="M4 15h22M4 22h22M15 8v22"/><rect x="28" y="20" width="20" height="26" rx="2" fill="#cfe3f5"/><path d="M32 28h12v10H32zM38 28v10M32 33h12"/><path d="M10 36c1 7 6 8 12 7M19 39l4 4-5 3" stroke="#c2491d"/>',
    wizard: '<rect x="12" y="22" width="30" height="24" rx="3" fill="#fff"/><path d="M18 31h18M18 38h12"/><path d="M8 14L26 5l3 5-18 9z" fill="#0f6b66"/><path d="M38 5v8M34 9h8M45 15v6M42 18h6" stroke="#ffb454" stroke-width="3"/>',
    hwp2hwpx: '<path d="M6 8h14l5 5v21H6z" fill="#fff"/><path d="M28 18h13l5 5v23H28z" fill="#cfe3f5"/><path d="M11 20h9M11 26h9M33 30l8 9M41 30l-8 9" /><path d="M30 10h8v5M14 42h-5v-4" stroke="#c2491d"/>',
    'form-overlay': '<rect x="6" y="5" width="32" height="42" rx="2" fill="#fff"/><path d="M12 14h20M12 34h20"/><rect x="12" y="20" width="20" height="8" fill="#fff3d6"/><path d="M46 15L31 30l-5 2 2-5 15-15z" fill="#ffb454"/>',
    'doc-check': '<rect x="7" y="5" width="32" height="42" rx="2" fill="#fff"/><path d="M13 14h20M13 22h20M13 30h9"/><circle cx="35" cy="36" r="10" fill="#0f6b66"/><path d="M30 36l4 4 7-8" stroke="#fff" stroke-width="3"/>',
    aitext: '<path d="M6 6h20l7 7v22H6z" fill="#fff"/><path d="M12 16h14M12 23h14"/><rect x="24" y="30" width="23" height="16" rx="5" fill="#0f6b66"/><circle cx="32" cy="38" r="2.5" fill="#fff" stroke="none"/><circle cx="40" cy="38" r="2.5" fill="#fff" stroke="none"/><path d="M36 30v-5"/>',
    'mask-privacy': '<rect x="5" y="8" width="42" height="36" rx="3" fill="#fff"/><path d="M11 17h8M11 35h16"/><rect x="11" y="23" width="30" height="7" fill="#1d2b2d"/><path d="M33 12h8v7" stroke="none"/><path d="M33 35h8" stroke="#c2491d" stroke-width="4"/>',
    album: '<rect x="4" y="9" width="44" height="32" rx="3" fill="#fff3d6"/><rect x="9" y="14" width="15" height="10" fill="#cfe3f5"/><rect x="28" y="14" width="15" height="10" fill="#e3f0ee"/><rect x="9" y="28" width="15" height="8" fill="#e3f0ee"/><rect x="28" y="28" width="15" height="8" fill="#ffb454"/>',
    pptslim: '<rect x="11" y="6" width="30" height="20" rx="3" fill="#fff3d6"/><path d="M4 33h44" stroke-dasharray="4 4"/><rect x="18" y="38" width="16" height="9" rx="2" fill="#c2491d"/><path d="M26 11v11M21 18l5 5 5-5"/>',
    'file-tools': '<path d="M7 6h15l6 6v24H7z" fill="#fff"/><path d="M24 16h15l6 6v24H24z" fill="#e3f0ee"/><path d="M13 18h7M13 25h7"/><path d="M30 31h9M30 38h9" stroke="#c2491d" stroke-width="3"/>',
    photo: '<rect x="4" y="13" width="44" height="31" rx="4" fill="#e3f0ee"/><path d="M16 13l4-6h12l4 6" fill="#fff"/><circle cx="26" cy="28" r="9" fill="#fff"/><circle cx="26" cy="28" r="4" fill="#0f6b66"/><circle cx="41" cy="20" r="2" fill="#ffb454"/>',
    'face-mask': '<rect x="5" y="6" width="42" height="40" rx="3" fill="#cfe3f5"/><circle cx="26" cy="24" r="11" fill="#ffb454"/><path d="M11 46c2-9 8-11 15-11s13 2 15 11" fill="#0f6b66"/><path d="M17 18h6v6h-6zM29 18h6v6h-6zM23 24h6v6h-6z" fill="#1d2b2d" stroke="none"/>',
    attendance: '<rect x="8" y="8" width="36" height="39" rx="3" fill="#fff"/><rect x="18" y="4" width="16" height="8" rx="2" fill="#ffb454"/><path d="M14 21l3 3 5-6M14 34l3 3 5-6" stroke="#0f6b66" stroke-width="3"/><path d="M27 22h11M27 35h11"/>',
    'cert-print': '<rect x="4" y="8" width="44" height="30" rx="3" fill="#fff3d6"/><path d="M14 17h24M18 24h16"/><circle cx="37" cy="35" r="7" fill="#c2491d"/><path d="M33 41l-2 7 6-3 6 3-2-7" fill="#c2491d"/>',
    'group-maker': '<circle cx="12" cy="14" r="6" fill="#ffb454"/><circle cx="40" cy="14" r="6" fill="#0f6b66"/><circle cx="12" cy="38" r="6" fill="#0f6b66"/><circle cx="40" cy="38" r="6" fill="#ffb454"/><path d="M20 15c8 1 12 18 12 21M32 16c-8 2-12 16-13 20" stroke-dasharray="3 4"/>',
    'random-pick': '<path d="M9 20h34l-3 26H12z" fill="#e3f0ee"/><circle cx="18" cy="14" r="6" fill="#ffb454"/><circle cx="31" cy="11" r="6" fill="#c2491d"/><path d="M6 20h40"/><path d="M23 30c0-5 7-5 7 0 0 3-4 3-4 6M26 41v0" stroke-width="3"/>',
    'show-vote': '<rect x="6" y="22" width="40" height="24" rx="3" fill="#e3f0ee"/><path d="M16 22h20"/><path d="M19 5h18l-2 21H21z" fill="#fff"/><path d="M23 14l4 4 7-8" stroke="#c2491d" stroke-width="3"/><path d="M14 37h24"/>',
    greeting: '<rect x="4" y="12" width="44" height="31" rx="3" fill="#fff"/><path d="M4 15l22 16 22-16"/><path d="M26 27c-8-6-9-12-4-13 2 0 4 2 4 3 0-1 2-3 4-3 5 1 4 7-4 13z" fill="#c2491d"/>',
    newsletter: '<rect x="5" y="6" width="36" height="41" rx="2" fill="#fff"/><path d="M41 15h6v28a4 4 0 0 1-6 4" fill="#e3f0ee"/><rect x="10" y="17" width="12" height="11" fill="#cfe3f5"/><path d="M10 11h26" stroke-width="4"/><path d="M26 19h10M26 26h10M10 34h26M10 41h26"/>',
    motion: '<rect x="4" y="10" width="44" height="32" rx="3" fill="#1d2b2d"/><path d="M4 17h44M4 35h44" stroke="#fff" stroke-dasharray="4 4"/><path d="M21 20v12l11-6z" fill="#ffb454" stroke="#ffb454"/>',
    map: '<path d="M5 12l14-5 14 5 14-5v33l-14 5-14-5-14 5z" fill="#e3f0ee"/><path d="M19 7v33M33 12v33" stroke-dasharray="3 4"/><path d="M26 34c-6-8-8-11-8-14a8 8 0 0 1 16 0c0 3-2 6-8 14z" fill="#c2491d"/><circle cx="26" cy="20" r="3" fill="#fff"/>',
    qr: '<rect x="6" y="6" width="15" height="15" rx="2" fill="#fff"/><rect x="31" y="6" width="15" height="15" rx="2" fill="#fff"/><rect x="6" y="31" width="15" height="15" rx="2" fill="#fff"/><path d="M11 11h5v5h-5zM36 11h5v5h-5zM11 36h5v5h-5z" fill="#1d2b2d"/><path d="M31 31h5v5h-5zM41 31h5v5h-5zM36 41h5v5h-5z" fill="#0f6b66" stroke="none"/><path d="M46 41v5M31 41v5"/>',
    labels: '<rect x="5" y="6" width="42" height="40" rx="2" fill="#fff3d6"/><rect x="9" y="11" width="15" height="13" rx="2" fill="#fff"/><rect x="28" y="11" width="15" height="13" rx="2" fill="#fff"/><rect x="9" y="29" width="15" height="13" rx="2" fill="#fff"/><rect x="28" y="29" width="15" height="13" rx="2" fill="#fff"/><path d="M12 16h8M12 20h5M31 16h8M31 20h5M12 34h8M12 38h5M31 34h8M31 38h5" stroke-width="1.5"/>',
    'meeting-timer': '<circle cx="26" cy="20" r="14" fill="#fff"/><path d="M26 20V6a14 14 0 0 1 13 18z" fill="#c2491d"/><path d="M26 12v8l5 3"/><path d="M6 46c0-6 4-8 8-8s8 2 8 8M30 46c0-6 4-8 8-8s8 2 8 8" fill="#e3f0ee"/>',
    'repeat-checklist': '<rect x="6" y="7" width="34" height="40" rx="3" fill="#fff"/><path d="M12 17l3 3 5-6M12 29l3 3 5-6" stroke="#0f6b66" stroke-width="3"/><path d="M25 18h9M25 30h9M12 40h14"/><path d="M33 41a7 7 0 1 1 5 5M33 46v-5h5" stroke="#c2491d"/>',
    'work-board': '<path d="M5 14h14l4 5h24v27H5z" fill="#fff3d6"/><path d="M14 6h24v13H23l-4-5h-5z" fill="#fff"/><path d="M14 33h20M28 27l7 6-7 6" stroke="#0f6b66" stroke-width="3"/>',
    'leave-tracker': '<path d="M8 25a18 16 0 0 1 36 0z" fill="#ffb454"/><path d="M26 9v34c0 4 6 4 6 0M20 25c0-8 2-13 6-16 4 3 6 8 6 16" /><path d="M6 47h40"/>',
    'date-calc': '<rect x="6" y="9" width="40" height="37" rx="3" fill="#fff"/><path d="M6 19h40" /><path d="M6 12a3 3 0 0 1 3-3h34a3 3 0 0 1 3 3v7H6z" fill="#0f6b66"/><path d="M16 5v8M36 5v8"/><circle cx="17" cy="33" r="4" fill="#ffb454"/><path d="M22 33h10M28 29l5 4-5 4"/><circle cx="38" cy="33" r="3" fill="#c2491d"/>',
    'focus-timer': '<circle cx="26" cy="26" r="20" fill="#fff"/><circle cx="26" cy="26" r="12" fill="#e3f0ee"/><circle cx="26" cy="26" r="5" fill="#c2491d"/><path d="M26 26L45 7M39 7h6v6"/>',
    'break-timer': '<path d="M9 20h27v15a10 10 0 0 1-10 10h-7a10 10 0 0 1-10-10z" fill="#e3f0ee"/><path d="M36 24h4a5 5 0 0 1 0 12h-4"/><path d="M16 6c-3 4 3 5 0 9M23 6c-3 4 3 5 0 9M30 6c-3 4 3 5 0 9" stroke="#c2491d"/><path d="M6 48h34"/>',
    'break-reminder': '<circle cx="26" cy="9" r="5" fill="#ffb454"/><path d="M9 8l11 12v12l-7 15M43 8L32 20v12l7 15M20 20h12" /><path d="M20 20h12v13H20z" fill="#0f6b66"/>',
    shortcuts: '<rect x="4" y="13" width="44" height="27" rx="4" fill="#fff"/><path d="M11 21h3M19 21h3M27 21h3M36 21h5M11 28h3M19 28h3M27 28h3M36 28h5" stroke-width="4"/><path d="M15 35h22" stroke="#0f6b66" stroke-width="4"/>',
    'prompt-minutes': '<path d="M5 8h30v21H20l-8 8v-8H5z" fill="#fff"/><path d="M11 15h18M11 22h12"/><path d="M25 35h16l5 5v7H25z" fill="#ffb454"/><path d="M30 41h10"/>',
    'prompt-notice': '<path d="M6 20v12h8l20 10V10L14 20z" fill="#ffb454"/><path d="M14 32l3 13h6l-3-10"/><path d="M40 20c3 3 3 9 0 12M44 15c6 6 6 16 0 22"/>',
    'prompt-survey': '<path d="M6 46V8M6 46h40"/><rect x="12" y="30" width="7" height="16" fill="#e3f0ee"/><rect x="23" y="22" width="7" height="24" fill="#0f6b66"/><rect x="34" y="14" width="7" height="32" fill="#ffb454"/><path d="M12 18l9-8 8 4 12-9"/>',
    _pin: '<path d="M19 6h14l-2 14 8 8H13l8-8z" fill="#ffb454"/><path d="M26 28v18"/>',
    _cal: '<rect x="6" y="9" width="40" height="37" rx="4" fill="#fff"/><path d="M6 20h40M16 5v8M36 5v8M15 28h5M24 28h5M33 28h5M15 37h5M24 37h5" stroke-width="3"/>',
    _moon: '<circle cx="26" cy="26" r="18" fill="#fff"/><path d="M26 8a18 18 0 0 1 0 36z" fill="#1d2b2d"/>',
    _all: '<rect x="6" y="7" width="17" height="17" rx="3" fill="#e3f0ee"/><rect x="29" y="7" width="17" height="17" rx="3" fill="#ffb454"/><rect x="6" y="29" width="17" height="17" rx="3" fill="#fff"/><rect x="29" y="29" width="17" height="17" rx="3" fill="#0f6b66"/>'
  };
  window.KT_ICON = function (id, doc) {
    var s = (doc || document).createElement('span'); s.className = 'pic'; s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<svg viewBox="0 0 52 52" fill="none" stroke="#1d2b2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (IC[id] || IC._all) + '</svg>';
    return s;
  };
  /* 하소연하는 칼퇴상사 사람들 (96×96) — 묶음마다 한 사람 */
  var SKIN = '#ffdcb5', head = '<circle cx="48" cy="42" r="23" fill="' + SKIN + '"/>';
  function body(c) { return '<path d="M12 96c2-21 16-29 36-29s34 8 36 29z" fill="' + c + '"/>'; }
  var WHO = {
    // 눈이 빙글빙글, 머리 쥐어뜯기
    xl: body('#0f6b66') + head + '<path d="M25 40c-1-17 10-25 23-25s24 8 23 25c-4-7-9-10-14-11l-3-6-5 6c-11 0-19 3-24 11z" fill="#1d2b2d"/><path d="M30 18l-7-8M48 14V4M66 18l7-8" stroke-width="3"/><path d="M34 43c0-6 10-6 10 0 0 5-7 5-7 1 0-2 3-2 3 0M54 43c0-6 10-6 10 0 0 5-7 5-7 1 0-2 3-2 3 0"/><path d="M40 57c3-4 5 2 8-1s5 2 8-1"/><path d="M16 84c-4-16 0-34 9-42M80 84c4-16 0-34-9-42" stroke="#1d2b2d" stroke-width="9"/><path d="M16 84c-4-16 0-34 9-42M80 84c4-16 0-34-9-42" stroke="' + SKIN + '" stroke-width="5"/>',
    // 눈물, 단발
    doc: '<path d="M22 66c-5-30 2-54 26-54s31 24 26 54z" fill="#7a4a2b"/>' + body('#cfe3f5') + head + '<path d="M26 38c4-9 10-14 16-15 6 8 18 11 28 12-2-13-10-19-22-19S27 24 26 38z" fill="#7a4a2b"/><path d="M33 41l8 3M63 41l-8 3" stroke-width="3"/><path d="M36 47c-5 7-5 11-1 11s4-5 1-11zM60 47c5 7 5 11 1 11s-4-5-1-11z" fill="#8cc9ef"/><path d="M42 59c3-4 9-4 12 0"/>',
    // 무거운 상자에 깔림, 땀
    pic: body('#ffb454') + head + '<path d="M26 38c0-12 8-19 22-19s22 7 22 19c-12-6-32-6-44 0z" fill="#4b3a2f"/><rect x="18" y="2" width="60" height="22" rx="3" fill="#fff3d6"/><path d="M18 11h60M42 2v9h12V2"/><path d="M34 46l7-4-7-3M62 46l-7-4 7-3" stroke-width="2.5"/><path d="M41 56h14M45 53v6M51 53v6"/><path d="M77 34c-4 6-4 9 0 9s4-3 0-9z" fill="#8cc9ef"/>',
    // 놀란 얼굴, 올림머리
    ev: '<circle cx="48" cy="11" r="9" fill="#1d2b2d"/>' + body('#c2491d') + head + '<path d="M25 41c0-16 9-24 23-24s23 8 23 24c-5-5-8-9-9-14-9 4-21 4-28 1-1 5-4 9-9 13z" fill="#1d2b2d"/><circle cx="39" cy="43" r="5" fill="#fff"/><circle cx="57" cy="43" r="5" fill="#fff"/><circle cx="39" cy="43" r="1.6" fill="#1d2b2d"/><circle cx="57" cy="43" r="1.6" fill="#1d2b2d"/><ellipse cx="48" cy="57" rx="5" ry="6" fill="#7a1f12"/><path d="M14 22l6 4M12 34h7M82 22l-6 4M84 34h-7" stroke="#c2491d" stroke-width="3"/>',
    // 졸려서 눈 풀림, 안경
    day: body('#e3f0ee') + head + '<path d="M25 37c2-15 11-21 24-21s21 7 22 20c-8-2-14-6-17-10-6 6-18 9-29 11z" fill="#6b6f72"/><rect x="30" y="38" width="15" height="12" rx="5" fill="#fff"/><rect x="51" y="38" width="15" height="12" rx="5" fill="#fff"/><path d="M45 43h6M32 44h11M53 44h11"/><path d="M42 58c4 3 8 3 12 0"/><path d="M74 12h9l-9 10h9M84 2h6l-6 7h6" stroke-width="2.5"/><path d="M42 69l6 8 6-8" fill="#fff"/><path d="M48 77l-4 14h8z" fill="#c2491d"/>',
    // 의자에 기대 부탁하는 미소, 로봇
    ai: body('#ffcf5a') + head + '<path d="M25 44c-3-20 9-29 24-29 14 0 24 10 22 28-3-8-7-12-12-14-10 3-27 1-34 15z" fill="#a5562b"/><path d="M34 43c2-3 6-3 8 0M54 43c2-3 6-3 8 0" stroke-width="3"/><path d="M40 53c4 6 12 6 16 0" fill="#fff"/><circle cx="33" cy="51" r="3" fill="#f2a08a" stroke="none"/><circle cx="63" cy="51" r="3" fill="#f2a08a" stroke="none"/><rect x="66" y="66" width="26" height="22" rx="5" fill="#0f6b66"/><circle cx="74" cy="76" r="2.5" fill="#fff" stroke="none"/><circle cx="84" cy="76" r="2.5" fill="#fff" stroke="none"/><path d="M79 66v-7M75 83h8" /><circle cx="79" cy="57" r="2.5" fill="#ffb454"/>'
  };
  window.KT_WHO = function (id) {
    var s = document.createElement('span'); s.className = 'who'; s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<svg viewBox="0 0 96 96" fill="none" stroke="#1d2b2d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' + (WHO[id] || '') + '</svg>';
    return s;
  };
  window.KT_ICON_HAS = function (id) { return !!IC[id]; };
})();
