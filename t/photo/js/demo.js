/* 예시 그림(모두 직접 그린 가상 그림) */
SD.demo = {
  noise(c) { const x = SD.x(c), d = x.getImageData(0, 0, c.width, c.height); for (let i = 0; i < d.data.length; i += 4) { const n = (Math.random() - .5) * 10; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; } x.putImageData(d, 0, 0); return c; },
  cup(col = '#d9583b', bg = ['#8fa6a1', '#c9b48e']) {
    const c = SD.cv(1200, 900), x = SD.x(c); x.fillStyle = bg[0]; x.fillRect(0, 0, 1200, 560); x.fillStyle = bg[1]; x.fillRect(0, 560, 1200, 340); x.fillStyle = '#0003'; x.beginPath(); x.ellipse(620, 730, 230, 40, 0, 0, 7); x.fill();
    const g = x.createLinearGradient(420, 0, 780, 0); g.addColorStop(0, '#fff5'); g.addColorStop(.3, '#fff0'); g.addColorStop(1, '#0006'); const cup = () => { x.beginPath(); x.moveTo(430, 300); x.lineTo(470, 700); x.quadraticCurveTo(600, 760, 730, 700); x.lineTo(770, 300); x.closePath(); };
    x.lineWidth = 42; x.strokeStyle = col; x.beginPath(); x.ellipse(775, 480, 85, 105, 0, -1.4, 1.6); x.stroke(); x.fillStyle = col; cup(); x.fill(); x.fillStyle = g; cup(); x.fill(); x.fillStyle = '#f2ece2'; x.beginPath(); x.ellipse(600, 300, 170, 44, 0, 0, 7); x.fill(); x.fillStyle = '#4a2b1b'; x.beginPath(); x.ellipse(600, 306, 150, 34, 0, 0, 7); x.fill(); return this.noise(c);
  },
  person() {
    const c = SD.cv(900, 1100), x = SD.x(c), g = x.createLinearGradient(0, 0, 900, 1100); g.addColorStop(0, '#9fb7c4'); g.addColorStop(1, '#6d8794'); x.fillStyle = g; x.fillRect(0, 0, 900, 1100);
    x.fillStyle = '#27364f'; x.beginPath(); x.moveTo(130, 1100); x.quadraticCurveTo(150, 800, 360, 760); x.lineTo(540, 760); x.quadraticCurveTo(750, 800, 770, 1100); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(370, 755); x.lineTo(450, 900); x.lineTo(530, 755); x.fill(); x.fillStyle = '#e0ac8a'; x.fillRect(390, 640, 120, 140); x.fillStyle = '#eec1a0'; x.beginPath(); x.ellipse(450, 500, 140, 185, 0, 0, 7); x.fill();
    x.fillStyle = '#2b2320'; x.beginPath(); x.ellipse(450, 400, 165, 130, 0, Math.PI, 0); x.quadraticCurveTo(610, 520, 585, 540); x.quadraticCurveTo(570, 420, 450, 400); x.quadraticCurveTo(330, 420, 315, 540); x.quadraticCurveTo(290, 520, 285, 400); x.fill();
    [395, 505].forEach(a => { x.beginPath(); x.ellipse(a, 500, 13, 9, 0, 0, 7); x.fill(); x.fillRect(a - 28, 468, 56, 7); }); x.strokeStyle = '#b06f55'; x.lineWidth = 6; x.beginPath(); x.arc(450, 570, 40, .5, 2.6); x.stroke(); x.beginPath(); x.moveTo(450, 510); x.lineTo(440, 550); x.stroke(); return this.noise(c);
  },
  stamp() {
    const c = SD.cv(900, 700), x = SD.x(c), g = x.createLinearGradient(0, 0, 900, 700); g.addColorStop(0, '#f6f2e8'); g.addColorStop(1, '#b9b3a6'); x.fillStyle = g; x.fillRect(0, 0, 900, 700); x.translate(450, 340); x.rotate(-.06); x.strokeStyle = '#c8202c'; x.lineWidth = 16; x.strokeRect(-150, -150, 300, 300); x.fillStyle = '#c8202c'; x.font = '900 118px Batang,serif'; x.textAlign = 'center'; x.fillText('가상', 0, -15); x.fillText('인장', 0, 115); x.setTransform(1, 0, 0, 1, 0, 0);
    x.fillStyle = '#ded8ca'; for (let i = 0; i < 260; i++) x.fillRect(290 + Math.random() * 320, 180 + Math.random() * 320, 2, 2); return this.noise(c);
  },
  sign() { const c = SD.cv(900, 500), x = SD.x(c), g = x.createLinearGradient(0, 0, 900, 0); g.addColorStop(0, '#cfcabf'); g.addColorStop(1, '#f7f4ee'); x.fillStyle = g; x.fillRect(0, 0, 900, 500); x.strokeStyle = '#1b2340'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(180, 280); x.bezierCurveTo(240, 80, 330, 120, 280, 330); x.bezierCurveTo(400, 100, 430, 180, 420, 300); x.bezierCurveTo(500, 180, 560, 200, 540, 300); x.bezierCurveTo(620, 250, 660, 260, 740, 210); x.stroke(); return this.noise(c); },
  doc() {
    const p = SD.cv(800, 1100), x = SD.x(p); x.fillStyle = '#fdfcf8'; x.fillRect(0, 0, 800, 1100); x.fillStyle = '#222'; x.font = '700 46px Malgun Gothic'; x.fillText('물품 구입 영수증(예시)', 140, 130); x.font = '28px Malgun Gothic'; ['품명: 화장지 10개', '품명: 세제 4개', '합계: 45,000원', '날짜: 2026. 11. 25.'].forEach((t, i) => x.fillText(t, 110, 260 + i * 90)); for (let i = 0; i < 14; i++) x.fillRect(110, 660 + i * 26, 400 + (i * 97) % 180, 6);
    const c = SD.cv(1400, 1200), y = SD.x(c), g = y.createLinearGradient(0, 0, 1400, 1200); g.addColorStop(0, '#5b4636'); g.addColorStop(1, '#3a2c22'); y.fillStyle = g; y.fillRect(0, 0, 1400, 1200);
    y.drawImage(SD.warp(p, [[0, 0], [800, 0], [800, 1100], [0, 1100]], 1400, 1200, [[380, 120], [1010, 70], [1180, 1080], [210, 1010]]), 0, 0);
    const s = y.createLinearGradient(200, 900, 1100, 200); s.addColorStop(0, '#0007'); s.addColorStop(.6, '#0000'); y.fillStyle = s; y.fillRect(0, 0, 1400, 1200); return this.noise(c);
  },
  room(clean) {
    const c = SD.cv(1200, 900), x = SD.x(c); x.fillStyle = clean ? '#e9e4d6' : '#b9ae98'; x.fillRect(0, 0, 1200, 620); x.fillStyle = clean ? '#c99f6d' : '#8e7558'; x.fillRect(0, 620, 1200, 280); x.fillStyle = clean ? '#bfe0ef' : '#8fa1a6'; x.fillRect(420, 120, 360, 300); x.strokeStyle = '#fff'; x.lineWidth = 14; x.strokeRect(420, 120, 360, 300);
    if (!clean) for (let i = 0; i < 24; i++) { x.fillStyle = ['#6b5b4a', '#83909a', '#a5523d', '#4d5a44'][i % 4]; x.save(); x.translate(80 + i * 47, 690 + (i * 53) % 150); x.rotate(i); x.fillRect(-40, -25, 80, 50); x.restore(); }
    else { x.fillStyle = '#44776e'; x.fillRect(180, 520, 330, 190); x.fillStyle = '#5b9188'; x.fillRect(180, 440, 330, 110); } return this.noise(c);
  },
  scene(dark) {
    const c = SD.cv(1600, 1067), x = SD.x(c), g = x.createLinearGradient(0, 0, 0, 1067); g.addColorStop(0, '#8ec5e8'); g.addColorStop(.6, '#dcefe9'); g.addColorStop(.61, '#79a35c'); g.addColorStop(1, '#4f7a3f'); x.fillStyle = g; x.fillRect(0, 0, 1600, 1067);
    ['#c94f3d', '#e0a53c', '#3d6fa8', '#7a4f93', '#3f8f74'].forEach((k, i) => { const X = 560 + i * 130, Y = 560 + (i % 2) * 24; x.fillStyle = k; x.beginPath(); x.roundRect(X - 50, Y + 60, 100, 250, 30); x.fill(); x.fillStyle = '#eec1a0'; x.beginPath(); x.arc(X, Y, 48, 0, 7); x.fill(); x.fillStyle = '#2b2320'; x.beginPath(); x.arc(X, Y - 12, 50, Math.PI, 0); x.fill(); });
    if (dark) { x.fillStyle = '#1a1408a0'; x.fillRect(0, 0, 1600, 1067); } return this.noise(c);
  },
  food() { const c = SD.cv(1200, 900), x = SD.x(c); x.fillStyle = '#7c6a55'; x.fillRect(0, 0, 1200, 900); x.fillStyle = '#e4dfd2'; x.beginPath(); x.ellipse(600, 470, 400, 330, 0, 0, 7); x.fill(); x.fillStyle = '#cfc7b4'; x.beginPath(); x.ellipse(600, 470, 320, 260, 0, 0, 7); x.fill(); const k = ['#8fa35b', '#b0563f', '#c9a24a', '#6f8a45']; for (let i = 0; i < 90; i++) { const a = i * 2.4, r = Math.sqrt(i) * 27; x.fillStyle = k[i % 4]; x.beginPath(); x.ellipse(600 + Math.cos(a) * r, 470 + Math.sin(a) * r * .8, 46, 24, a, 0, 7); x.fill(); } return this.noise(c); }
};
