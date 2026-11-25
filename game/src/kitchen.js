// kitchen.js — semua gambar Warung Rush: HUD, papan pesanan, stasiun dapur,
// koki, dan layar akhir. Semua digambar dengan bentuk canvas (tanpa aset luar).

'use strict';

const CANVAS_W = 1280;
const CANVAS_H = 720;

// ---- util gambar -----------------------------------------------------------

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.fillStyle = color || '#3a2418';
  ctx.font = (weight || 'bold') + ' ' + size + 'px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function formatRupiah(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}

// ---- ikon makanan (bentuk canvas sederhana, original) ----------------------

function drawIngredientIcon(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  const c = componentColor(id);
  switch (id) {
    case 'nasi': // mangkuk nasi putih
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(0, 2, r, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#dfe9f2';
      ctx.fillRect(-r, -2, r * 2, 3);
      ctx.fillStyle = '#fff8e7';
      ctx.beginPath(); ctx.arc(0, -2, r * 0.7, Math.PI, 0); ctx.fill();
      break;
    case 'mie': // gulungan mie
      ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2); ctx.stroke();
      break;
    case 'ayam': // paha ayam
      ctx.fillStyle = '#f2998a';
      ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.1, r * 0.62, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(r * 0.3, r * 0.3); ctx.lineTo(r * 0.85, r * 0.85); ctx.stroke();
      break;
    case 'sayur': // daun hijau
      ctx.fillStyle = '#6fbf44';
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.9, r * 0.5, -0.6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3f7d24'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-r * 0.7, r * 0.4); ctx.lineTo(r * 0.7, -r * 0.4); ctx.stroke();
      break;
    case 'tahu': // kubus tahu
      ctx.fillStyle = '#f7e3b0';
      ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.rect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4); ctx.fill(); ctx.stroke();
      break;
    case 'telur': // telur
      ctx.fillStyle = '#ffe9a8';
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.62, r * 0.85, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#d9b96a'; ctx.lineWidth = 2; ctx.stroke();
      break;
    case 'kecap': // botol kecap
    case 'bumbu': // botol bumbu
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.rect(-r * 0.45, -r * 0.4, r * 0.9, r * 1.1); ctx.fill();
      ctx.fillRect(-r * 0.25, -r, r * 0.5, r * 0.7);
      ctx.fillStyle = '#f7e8c9';
      ctx.fillRect(-r * 0.45, -r * 0.1, r * 0.9, r * 0.35);
      break;
    case 'kuah': // panci kuah
      ctx.fillStyle = '#5b3a1e';
      ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#e8a13a';
      ctx.beginPath(); ctx.ellipse(0, -1, r * 0.7, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      break;
    case 'gosong': // makanan gosong: gumpalan hitam berasap
      ctx.fillStyle = '#2b2b2b';
      ctx.beginPath(); ctx.arc(-r * 0.3, r * 0.1, r * 0.55, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.35, 0, r * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#888888'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -r * 0.5); ctx.quadraticCurveTo(r * 0.2, -r * 0.9, 0, -r * 1.1); ctx.stroke();
      break;
    case 'mie-goreng': // mie goreng di piring
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e8a13a'; ctx.lineWidth = r * 0.25; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2); ctx.stroke();
      break;
    case 'ayam-potong': // potongan ayam
      ctx.fillStyle = '#ef8f7d';
      ctx.beginPath(); ctx.arc(-r * 0.3, 0, r * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.1, r * 0.5, 0, Math.PI * 2); ctx.fill();
      break;
    case 'sayur-potong': // sayur cincang
      ctx.fillStyle = '#57a838';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, r * 0.32, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'tahu-goreng': // tahu goreng keemasan
      ctx.fillStyle = '#e0a44a';
      ctx.strokeStyle = '#a86f1e'; ctx.lineWidth = 2;
      ctx.save(); ctx.rotate(0.4);
      ctx.beginPath(); ctx.rect(-r * 0.6, -r * 0.6, r * 1.2, r * 1.2); ctx.fill(); ctx.stroke();
      ctx.restore();
      break;
    case 'telur-goreng': // telur mata sapi
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.9, r * 0.7, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd94d';
      ctx.beginPath(); ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2); ctx.fill();
      break;
    case 'sate-bakar': // tusuk sate
      ctx.strokeStyle = '#d9b96a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-r * 0.9, r * 0.7); ctx.lineTo(r * 0.9, -r * 0.7); ctx.stroke();
      ctx.fillStyle = '#a05a2c';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.arc(-r * 0.5 + i * r * 0.5, r * 0.35 - i * r * 0.35, r * 0.32, 0, Math.PI * 2); ctx.fill();
      }
      break;
    default: // hidangan jadi: piring berisi makanan
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.2, r * 0.22, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// Piring dengan komponen di atasnya (dipakai di Meja Plating).
function drawPlate(ctx, x, y, r, parts) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9b896'; ctx.lineWidth = 2; ctx.stroke();
  const n = parts.length;
  parts.forEach((part, i) => {
    const a = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
    drawIngredientIcon(ctx, part, x + Math.cos(a) * r * 0.42, y + Math.sin(a) * r * 0.42, r * 0.42);
  });
}

// ---- HUD -------------------------------------------------------------------

function drawHUD(ctx, state) {
  ctx.fillStyle = '#3a2418';
  ctx.fillRect(0, 0, CANVAS_W, 56);
  text(ctx, '🍳 WARUNG RUSH', 24, 29, 26, '#ffd94d', 'left');
  // Timer hari
  const urgent = state.timeLeft < 30;
  text(ctx, '⏱ ' + formatClock(state.timeLeft), 330, 29, 26, urgent ? '#ff6b5e' : '#ffffff', 'left');
  ctx.fillStyle = '#5b3a1e';
  ctx.fillRect(470, 20, 220, 16);
  ctx.fillStyle = urgent ? '#ff6b5e' : '#6fbf44';
  ctx.fillRect(470, 20, 220 * (state.timeLeft / DAY_LENGTH), 16);
  text(ctx, 'SKOR ' + state.score, 740, 29, 22, '#ffffff', 'left');
  text(ctx, formatRupiah(state.coins), 920, 29, 22, '#ffd94d', 'left');
  if (state.combo >= 2) {
    text(ctx, '🔥 KOMBO x' + state.combo, 1100, 29, 22, '#ff9a3d', 'left');
  } else {
    text(ctx, 'Hari 1 • Sajikan ' + state.served, 1100, 29, 18, '#d8c3a5', 'left');
  }
}

// ---- papan pesanan ---------------------------------------------------------

function drawOrderBoard(ctx, state) {
  text(ctx, 'PAPAN PESANAN', 24, 78, 15, '#8a6d4b', 'left');
  for (let i = 0; i < MAX_ORDERS; i++) {
    const x = 16 + i * 316;
    const order = state.orders[i];
    ctx.save();
    if (!order) {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      roundRect(ctx, x, 88, 296, 62, 10); ctx.fill();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#b39a78'; ctx.lineWidth = 2;
      roundRect(ctx, x, 88, 296, 62, 10); ctx.stroke();
      text(ctx, '— kosong —', x + 148, 119, 15, '#a08a6d');
      ctx.restore();
      continue;
    }
    const frac = order.patience / order.max;
    const low = frac < 0.3;
    ctx.fillStyle = low ? '#fff0e8' : '#fffdf5';
    roundRect(ctx, x, 88, 296, 62, 10); ctx.fill();
    ctx.strokeStyle = low ? '#ff6b5e' : '#c9a86a'; ctx.lineWidth = low ? 3 : 2;
    roundRect(ctx, x, 88, 296, 62, 10); ctx.stroke();
    drawIngredientIcon(ctx, order.recipe.id, x + 32, 112, 20);
    text(ctx, order.recipe.name, x + 60, 106, 17, '#3a2418', 'left');
    text(ctx, formatRupiah(order.recipe.price), x + 60, 128, 13, '#8a6d4b', 'left');
    // Tiga komponen resep sebagai ikon kecil.
    order.recipe.parts.forEach((part, j) => {
      drawIngredientIcon(ctx, part, x + 208 + j * 28, 108, 11);
    });
    // Bar kesabaran.
    ctx.fillStyle = '#e8dcc8';
    ctx.fillRect(x + 60, 136, 220, 7);
    ctx.fillStyle = frac > 0.5 ? '#6fbf44' : frac > 0.25 ? '#e8a13a' : '#ff6b5e';
    ctx.fillRect(x + 60, 136, 220 * frac, 7);
    if (low) text(ctx, Math.ceil(order.patience) + ' dtk!', x + 286, 128, 14, '#ff6b5e', 'right');
    ctx.restore();
  }
}

// ---- stasiun ---------------------------------------------------------------

function drawStationBase(ctx, st, active, label) {
  ctx.fillStyle = active ? '#c98a4b' : '#a9743f';
  roundRect(ctx, st.x, st.y, st.w, st.h, 12); ctx.fill();
  ctx.strokeStyle = active ? '#ffd94d' : '#7a4a22'; ctx.lineWidth = active ? 4 : 3;
  roundRect(ctx, st.x, st.y, st.w, st.h, 12); ctx.stroke();
  text(ctx, label, st.x + st.w / 2, st.y + 15, 15, '#fff3d6');
}

function drawCounterBins(ctx, state, active) {
  const st = STATIONS.counter;
  drawStationBase(ctx, st, active, 'MEJA BAHAN — ambil bahan mentah');
  const bw = 118, gap = 14;
  COUNTER_BINS.forEach((id, i) => {
    const bx = st.x + 16 + i * (bw + gap);
    const by = st.y + 26;
    ctx.fillStyle = '#f7e8c9';
    roundRect(ctx, bx, by, bw, 42, 8); ctx.fill();
    ctx.strokeStyle = '#8a6d4b'; ctx.lineWidth = 2;
    roundRect(ctx, bx, by, bw, 42, 8); ctx.stroke();
    drawIngredientIcon(ctx, id, bx + bw / 2, by + 15, 12);
    text(ctx, INGREDIENTS[id].name, bx + bw / 2, by + 33, 10, '#3a2418');
  });
}

function drawCookingStation(ctx, key, state, active) {
  const st = STATIONS[key];
  const job = state.cooking[key];
  drawStationBase(ctx, st, active, STATIONS[key].name.toUpperCase());
  const cx = st.x + st.w / 2, cy = st.y + 66;
  if (!job) {
    text(ctx, STATIONS[key].hint, cx, cy, 13, '#ffe9c4');
    return;
  }
  const outId = job.output;
  drawIngredientIcon(ctx, job.burnt ? 'gosong' : outId, cx, cy - 8, 26);
  // Cincin progres.
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(cx, cy - 8, 36, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = job.burnt ? '#ff6b5e' : job.done ? '#6fbf44' : '#ffd94d';
  ctx.beginPath(); ctx.arc(cx, cy - 8, 36, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * job.progress); ctx.stroke();
  if (job.burnt) text(ctx, 'GOSONG! Buang ke tong sampah', cx, st.y + st.h - 12, 13, '#ff8a7a');
  else if (job.done) text(ctx, componentName(outId) + ' matang — E: ambil', cx, st.y + st.h - 12, 13, '#b8f5a0');
  else text(ctx, 'Memasak ' + componentName(job.input) + '…', cx, st.y + st.h - 12, 13, '#ffe9c4');
}

function drawPlating(ctx, state, active) {
  const st = STATIONS.plating;
  drawStationBase(ctx, st, active, 'MEJA PLATING');
  if (state.dishReady) {
    drawPlate(ctx, st.x + 70, st.y + 68, 32, RECIPES.find(r => r.id === state.dishReady).parts);
    text(ctx, componentName(state.dishReady) + ' — SIAP DISAJIKAN!', st.x + 120, st.y + 58, 17, '#b8f5a0', 'left');
    text(ctx, 'E: ambil piring, antar ke Jendela Antar', st.x + 120, st.y + 82, 13, '#ffe9c4', 'left');
  } else if (state.plate.length > 0) {
    drawPlate(ctx, st.x + 70, st.y + 68, 32, state.plate);
    text(ctx, 'Di piring: ' + state.plate.map(componentName).join(' + '), st.x + 120, st.y + 58, 15, '#fff3d6', 'left');
    text(ctx, 'E: tambah komponen / ambil kembali', st.x + 120, st.y + 82, 13, '#ffe9c4', 'left');
  } else {
    text(ctx, 'Piring kosong — bawa 3 komponen resep ke sini (E)', st.x + st.w / 2, st.y + 68, 14, '#ffe9c4');
  }
}

function drawWindow(ctx, state, active) {
  const st = STATIONS.window;
  drawStationBase(ctx, st, active, 'JENDELA ANTAR');
  // Pelanggan menunggu di balik jendela.
  ctx.fillStyle = '#5b3a1e';
  roundRect(ctx, st.x + 24, st.y + 36, st.w - 48, 48, 8); ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('👥 PELANGGAN MENUNGGU', st.x + st.w / 2, st.y + 60);
  text(ctx, 'Bawa hidangan jadi ke sini (E)', st.x + st.w / 2, st.y + 98, 13, '#ffe9c4');
}

function drawTrash(ctx, state, active) {
  const st = STATIONS.trash;
  drawStationBase(ctx, st, active, 'TONG SAMPAH');
  ctx.fillStyle = '#6b6b6b';
  roundRect(ctx, st.x + st.w / 2 - 34, st.y + 36, 68, 52, 8); ctx.fill();
  ctx.fillStyle = '#9a9a9a';
  ctx.fillRect(st.x + st.w / 2 - 40, st.y + 28, 80, 12);
  text(ctx, 'E: buang barang di tangan', st.x + st.w / 2, st.y + 102, 12, '#ffe9c4');
}

function drawStations(ctx, state, activeStation) {
  drawCounterBins(ctx, state, activeStation === 'counter');
  drawCookingStation(ctx, 'board', state, activeStation === 'board');
  drawCookingStation(ctx, 'wok', state, activeStation === 'wok');
  drawCookingStation(ctx, 'grill', state, activeStation === 'grill');
  drawPlating(ctx, state, activeStation === 'plating');
  drawWindow(ctx, state, activeStation === 'window');
  drawTrash(ctx, state, activeStation === 'trash');
}

// ---- koki ------------------------------------------------------------------

function drawPlayer(ctx, state) {
  const p = state.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  // Bayangan.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(0, 20, 24, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Badan (celemek).
  ctx.fillStyle = '#2f7fb8';
  roundRect(ctx, -16, -6, 32, 26, 8); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-16, 2, 32, 12);
  // Kepala + topi koki.
  ctx.fillStyle = '#f2c09a';
  ctx.beginPath(); ctx.arc(0, -16, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-7, -26, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, -26, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -28, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a2418';
  ctx.beginPath(); ctx.arc(-5, -16, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -16, 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, -11, 4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // Barang bawaan di atas kepala.
  p.carry.forEach((item, i) => {
    const ox = (i - (p.carry.length - 1) / 2) * 26;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(ox, -46, 13, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 1.5; ctx.stroke();
    drawIngredientIcon(ctx, item, ox, -46, 9);
  });
  ctx.restore();
}

// ---- pesan & layar ---------------------------------------------------------

function drawMessage(ctx, state) {
  if (!state.message) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, state.messageTimer);
  ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
  const w = ctx.measureText(state.message).width + 40;
  ctx.fillStyle = 'rgba(58,36,24,0.92)';
  roundRect(ctx, CANVAS_W / 2 - w / 2, 640, w, 34, 17); ctx.fill();
  text(ctx, state.message, CANVAS_W / 2, 658, 16, '#ffd94d');
  ctx.restore();
}

function drawFloorHint(ctx) {
  text(ctx, 'WASD / panah: gerak   •   E / Spasi: pakai stasiun   •   Klik: jalan & pakai   •   P: jeda   •   R: ulang   •   M: suara',
    CANVAS_W / 2, 700, 14, '#8a6d4b');
}

function drawEndScreen(ctx, state) {
  ctx.fillStyle = 'rgba(43,29,22,0.82)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fff8e7';
  roundRect(ctx, 340, 110, 600, 470, 20); ctx.fill();
  ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 4;
  roundRect(ctx, 340, 110, 600, 470, 20); ctx.stroke();
  text(ctx, '🍳 HARI SELESAI!', 640, 160, 34, '#3a2418');
  text(ctx, 'Warung tutup — pelanggan pulang kenyang.', 640, 196, 16, '#8a6d4b');
  text(ctx, 'SKOR AKHIR', 640, 250, 18, '#8a6d4b');
  text(ctx, String(state.score), 640, 296, 52, '#e07840');
  text(ctx, 'Koin hari ini: ' + formatRupiah(state.coins), 640, 344, 20, '#3a2418');
  text(ctx, 'Hidangan terantar: ' + state.served + '   •   Pelanggan pergi: ' + state.missed, 640, 378, 18, '#3a2418');
  text(ctx, 'Kombo terbaik: x' + state.bestCombo, 640, 408, 18, '#3a2418');
  const verdict = state.served >= 12 ? 'Koki bintang lima! Warungmu legendaris. ⭐⭐⭐'
    : state.served >= 7 ? 'Koki andalan! Pelanggan pasti kembali. ⭐⭐'
    : state.served >= 3 ? 'Lumayan! Besok pasti lebih cepat. ⭐'
    : 'Hari pertama yang berat — coba lagi, koki!';
  text(ctx, verdict, 640, 452, 18, '#e07840');
  ctx.fillStyle = '#e07840';
  roundRect(ctx, 490, 490, 300, 52, 12); ctx.fill();
  text(ctx, 'MAIN LAGI  (R)', 640, 517, 20, '#ffffff');
}

function drawPauseOverlay(ctx) {
  ctx.fillStyle = 'rgba(43,29,22,0.6)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  text(ctx, '⏸ JEDA', 640, 340, 44, '#ffffff');
  text(ctx, 'Tekan P untuk lanjut', 640, 386, 18, '#ffd94d');
}

// ---- gambar utama ----------------------------------------------------------

function drawGame(ctx, state, activeStation) {
  // Lantai ubin warung.
  ctx.fillStyle = '#f7e8c9';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#f0dcb8';
  for (let y = 160; y < CANVAS_H; y += 56) {
    for (let x = ((y / 56) % 2) * 28; x < CANVAS_W; x += 56) {
      ctx.fillRect(x, y, 28, 28);
    }
  }
  // Dinding atas.
  ctx.fillStyle = '#8a5a3b';
  ctx.fillRect(0, 56, CANVAS_W, 8);
  drawHUD(ctx, state);
  drawOrderBoard(ctx, state);
  drawStations(ctx, state, activeStation);
  drawPlayer(ctx, state);
  drawMessage(ctx, state);
  drawFloorHint(ctx);
  if (state.phase === 'paused') drawPauseOverlay(ctx);
  if (state.phase === 'over') drawEndScreen(ctx, state);
}
