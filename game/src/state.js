// state.js — state permainan Warung Rush: pesanan, skor, kombo, timer hari.
// Semua aturan main tinggal di sini; render dan input hanya membaca state ini.

'use strict';

const DAY_LENGTH = 180;        // detik per hari
const MAX_ORDERS = 4;          // pesanan bersamaan paling banyak
const ORDER_PATIENCE = 45;     // detik sabar satu pesanan
const CARRY_SLOTS = 3;         // barang yang bisa dibawa koki
const BASE_SCORE = 100;        // skor dasar per hidangan terantar
const WRONG_PENALTY = 50;      // skor hilang bila salah antar
const COMBO_STEP = 0.1;        // +10% skor per tingkat kombo
const COMBO_MAX = 3.0;         // pengali kombo maksimal

// State awal satu hari baru.
function createGameState() {
  return {
    phase: 'playing',           // playing | paused | over
    timeLeft: DAY_LENGTH,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    missed: 0,
    orders: [],                 // { recipe, patience, max, id }
    nextOrderId: 1,
    spawnTimer: 6,              // detik sampai pesanan pertama
    spawnInterval: 14,          // jarak antar pesanan, makin cepat
    player: { x: 640, y: 458, r: 22, carry: [], face: 1 },
    // Isi stasiun yang sedang berproses: { station, item, progress, done, burnt }
    cooking: { board: null, wok: null, grill: null },
    plate: [],                  // komponen di atas piring (Meja Plating)
    dishReady: null,            // id hidangan yang sudah jadi di piring
    message: '',                // pesan singkat di layar
    messageTimer: 0,
    muted: false,
    elapsed: 0,
  };
}

// Tambah satu pesanan baru ke papan.
function spawnOrder(state) {
  if (state.orders.length >= MAX_ORDERS) return false;
  const recipe = randomRecipe();
  state.orders.push({
    id: state.nextOrderId++,
    recipe: recipe,
    patience: ORDER_PATIENCE,
    max: ORDER_PATIENCE,
  });
  return true;
}

// Majukan waktu permainan sebesar dt detik (dipanggil tiap frame).
function tickGame(state, dt) {
  if (state.phase !== 'playing') return;
  state.elapsed += dt;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.phase = 'over';
    return;
  }
  // Pesanan baru, makin cepat seiring hari berjalan.
  const rush = 1 - state.timeLeft / DAY_LENGTH;         // 0 -> 1
  state.spawnInterval = 14 - rush * 7;                  // 14 detik -> 7 detik
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    if (spawnOrder(state)) state.spawnTimer = state.spawnInterval;
    else state.spawnTimer = 2;
  }
  // Kesabaran pesanan menipis; habis = pelanggan pergi.
  for (let i = state.orders.length - 1; i >= 0; i--) {
    const order = state.orders[i];
    order.patience -= dt;
    if (order.patience <= 0) {
      state.orders.splice(i, 1);
      state.missed++;
      state.combo = 0;
      showMessage(state, 'Pelanggan pergi: ' + order.recipe.name + ' kehabisan sabar!');
    }
  }
  // Proses masak berjalan; gosong bila dibiarkan.
  for (const key of ['board', 'wok', 'grill']) {
    const job = state.cooking[key];
    if (!job) continue;
    if (!job.done) {
      job.progress += dt / COOK_TIME[key];
      if (job.progress >= 1) { job.progress = 1; job.done = true; job.doneTimer = 0; }
    } else {
      job.doneTimer += dt;
      if (job.doneTimer > BURN_AFTER) job.burnt = true;
    }
  }
  if (state.messageTimer > 0) {
    state.messageTimer -= dt;
    if (state.messageTimer <= 0) state.message = '';
  }
}

// Tampilkan pesan singkat (maks. 2,5 detik).
function showMessage(state, text) {
  state.message = text;
  state.messageTimer = 2.5;
}

// Antar hidangan jadi ke jendela. Mengembalikan 'served' | 'wrong' | 'none'.
function serveDish(state, dishId) {
  if (!dishId) return 'none';
  const idx = state.orders.findIndex(o => o.recipe.id === dishId);
  if (idx < 0) {
    state.score = Math.max(0, state.score - WRONG_PENALTY);
    state.combo = 0;
    showMessage(state, 'Salah pesanan! Tidak ada yang memesan ' + componentName(dishId) + '. -' + WRONG_PENALTY);
    return 'wrong';
  }
  const order = state.orders[idx];
  state.orders.splice(idx, 1);
  const patienceBonus = Math.round(50 * (order.patience / order.max));
  const comboMult = Math.min(COMBO_MAX, 1 + state.combo * COMBO_STEP);
  const gained = Math.round((BASE_SCORE + patienceBonus) * comboMult);
  state.score += gained;
  state.coins += order.recipe.price;
  state.combo++;
  if (state.combo > state.bestCombo) state.bestCombo = state.combo;
  state.served++;
  showMessage(state, order.recipe.name + ' terantar! +' + gained + ' poin, Rp' + order.recipe.price.toLocaleString('id-ID'));
  return 'served';
}

// Apakah koki bisa membawa satu barang lagi?
function canCarry(state) {
  return state.player.carry.length < CARRY_SLOTS;
}

// Ambil satu komponen ke tangan koki (false bila tangan penuh).
function takeItem(state, itemId) {
  if (!canCarry(state)) {
    showMessage(state, 'Tangan penuh! Antar atau buang dulu.');
    return false;
  }
  state.player.carry.push(itemId);
  return true;
}

// Buang satu komponen dari tangan (dipakai Tong Sampah).
function dropItem(state, index) {
  if (index < 0 || index >= state.player.carry.length) return null;
  return state.player.carry.splice(index, 1)[0];
}
