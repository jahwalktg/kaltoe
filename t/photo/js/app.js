/* 첫 화면과 화면 옮기기 */
const IC = {
  cut: '<rect x="6" y="6" width="40" height="40" rx="5" fill="none" stroke-dasharray="4 4"/><circle cx="26" cy="20" r="7" fill="#ffb454"/><path d="M12 45c1-12 7-16 14-16s13 4 14 16z" fill="#0f6b66"/>',
  stamp: '<rect x="11" y="11" width="30" height="30" rx="3" fill="none" stroke="#c8202c" stroke-width="4"/><path d="M19 19v14M26 19h8v6h-8zM26 33h8" stroke="#c8202c" stroke-width="3" fill="none"/>',
  box: '<path d="M8 18l18-8 18 8v20l-18 8-18-8z" fill="#e3f0ee"/><path d="M8 18l18 8 18-8M26 26v20" fill="none"/>',
  id: '<rect x="11" y="6" width="30" height="40" rx="3" fill="#cfe3f5"/><circle cx="26" cy="21" r="7" fill="#ffb454"/><path d="M14 45c1-10 6-13 12-13s11 3 12 13z" fill="#0f6b66"/>',
  stack: '<rect x="16" y="6" width="30" height="24" rx="3" fill="#fff3d6"/><rect x="11" y="13" width="30" height="24" rx="3" fill="#e3f0ee"/><rect x="6" y="20" width="30" height="25" rx="3" fill="#fff"/><path d="M9 41l8-10 6 6 4-4 6 8z" fill="#0f6b66"/>',
  scan: '<path d="M15 8l26 4-6 34-26-5z" fill="#eee"/><path d="M18 16l17 3M16 24l17 3M15 32l12 2"/><path d="M6 14V6h8M38 6h8v8M46 38v8h-8M14 46H6v-8" fill="none" stroke="#1679d0" stroke-width="3"/>',
  sun: '<circle cx="26" cy="26" r="10" fill="#ffb454"/><path d="M26 5v7M26 40v7M5 26h7M40 26h7M11 11l5 5M36 36l5 5M41 11l-5 5M16 36l-5 5"/>',
  ba: '<rect x="5" y="11" width="20" height="30" fill="#b9ae98"/><rect x="27" y="11" width="20" height="30" fill="#bfe3dd"/><path d="M31 26l5 5 8-10" fill="none" stroke-width="3"/>',
  mark: '<rect x="5" y="9" width="42" height="34" rx="3" fill="#e3f0ee"/><circle cx="36" cy="33" r="7" fill="#c2491d"/><path d="M33 33l2 2 4-4" stroke="#fff" fill="none"/>',
  crop: '<path d="M14 4v34h34M4 14h34v34" fill="none" stroke-width="4"/>'
};
const svgOf = k => { const s = SD.$('span', { ariaHidden: 'true' }); s.innerHTML = `<svg viewBox="0 0 52 52" fill="none" stroke="#1d2b2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg>`; return s; };
const G = { 1: '배경을 빼고 새로 쓰기', 2: '찍은 사진 고치기', 3: '알리고 보여 주기' };
const J = 'https://jahwalktg.github.io/';
const LINKS = [['얼굴 가리기', '../face-mask/index.html'], ['개인정보 가리기', '../mask-privacy/index.html'], ['소식지·카드뉴스', '../newsletter/index.html'], ['인사장 만들기', '../greeting/index.html'], ['사진 앨범 PPT', '../office/tools/album.html']];
function go() {
  const id = decodeURIComponent(location.hash.slice(1)), t = SD.tools.find(q => q.id === id), app = document.getElementById('app'); app.replaceChildren(); SD.cur = null; scrollTo(0, 0);
  if (t) {
    document.title = t.title + ' | 사진 손질방'; const root = SD.$('div');
    app.append(SD.$('div', { class: 'head' }, SD.$('div', {}, SD.$('h1', { textContent: t.title }), SD.$('p', { class: 'lead', textContent: t.when })), SD.$('button', { class: 'btn', textContent: '비우기', onclick: go }), SD.$('a', { class: 'btn', href: '#', textContent: '← 처음 화면으로' })), root); t.mount(root); return;
  }
  SD.carry = null; document.title = '사진 손질방 — 누끼따기부터 증명사진까지';
  app.append(SD.$('h1', { textContent: '사진, 무엇을 해 드릴까요?' }), SD.$('p', { class: 'lead', textContent: '하려는 일을 고르고 사진을 넣으면 됩니다(PDF도 됩니다). 끝난 사진은 다른 손질로 바로 이어집니다.' }));
  Object.keys(G).forEach(g => app.append(SD.$('h2', { textContent: G[g] }), SD.$('div', { class: 'cards' }, ...SD.tools.filter(q => q.group == g).map(q => SD.$('a', { class: 'card', href: '#' + q.id }, svgOf(q.icon), SD.$('div', {}, SD.$('b', { textContent: q.title }), SD.$('span', { textContent: q.when })))))));
  app.append(SD.$('h2', { textContent: '손질한 사진을 쓸 곳 · 먼저 할 일' }), SD.$('div', { class: 'links' }, ...LINKS.map(([a, b]) => SD.$('a', { href: b, textContent: a }))));
}
addEventListener('hashchange', go); go();
