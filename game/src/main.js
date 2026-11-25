// main.js — boot dan loop Warung Rush: gerak koki, interaksi stasiun,
// staging screenshot (?shot=), dan layar mulai/akhir.

'use strict';

const PLAYER_SPEED = 260;      // px/detik
const INTERACT_RANGE = 56;     // jarak pakai stasiun
const KITCHEN_TOP = 240;       // batas atas area jalan (atas Meja Bahan tak terjangkau)
const KITCHEN_BOTTOM = 688;    // batas bawah area jalan

let state = createGameState();
let sfx = createSfx();
let activeStation = null;
let lastTime = 0;
let lastTickSecond = -1;
let chopHeld = false;
// Stasiun yang diklik: dipakai otomatis begitu koki sampai dalam jangkauan.
let pendingUseStation = null;
// Argumen pakai yang diklik (mis. bin bahan) — dipakai apa adanya, bukan dari
// posisi koki saat tiba (koki bisa sampai dalam jangkauan lebih dulu).
let pendingUseArg = null;
// Rute klik saat ini (daftar titik jalan); null bila tidak ada.
let route = null;

// ---- staging screenshot (?shot=cover|chopping|plating|rush) ----------------
// Keadaan beku yang disusun dari state game sendiri — render nyata kode game.

function applyShotMode(shot) {
  if (!shot) return;
  state.phase = 'playing';
  if (shot === 'cover') {
    state.timeLeft = 151; state.score = 1450; state.coins = 38000; state.combo = 3;
    state.bestCombo = 3; state.served = 9;
    state.orders = [
      { id: 1, recipe: RECIPES[0], patience: 28, max: 45 },
      { id: 2, recipe: RECIPES[2], patience: 19, max: 45 },
      { id: 3, recipe: RECIPES[3], patience: 35, max: 45 },
    ];
    state.player.x = 270; state.player.y = 640;
    state.player.carry = ['kecap'];
    // Piring di Meja Plating sudah jadi (siap disajikan) + wok masih memasak
    // (hidangan mid-assembly) — keduanya terbaca di cover.
    state.plate = ['nasi', 'telur-goreng', 'kecap'];
    state.dishReady = 'nasi-goreng';
    state.cooking.wok = { station: 'wok', input: 'mie', output: 'mie-goreng', progress: 0.6, done: false, doneTimer: 0, burnt: false };
  } else if (shot === 'chopping') {
    state.timeLeft = 132; state.score = 620; state.coins = 15000; state.combo = 1;
    state.served = 4;
    state.orders = [
      { id: 1, recipe: RECIPES[3], patience: 30, max: 45 },
      { id: 2, recipe: RECIPES[1], patience: 22, max: 45 },
    ];
    state.player.x = 400; state.player.y = 440;
    state.player.carry = ['sayur-potong'];
    state.cooking.board = { station: 'board', input: 'ayam', output: 'ayam-potong', progress: 0.55, done: false, doneTimer: 0, burnt: false };
  } else if (shot === 'plating') {
    state.timeLeft = 72; state.score = 1980; state.coins = 47000; state.combo = 4;
    state.bestCombo = 4; state.served = 12;
    state.orders = [
      { id: 1, recipe: RECIPES[4], patience: 26, max: 45 },
      { id: 2, recipe: RECIPES[0], patience: 12, max: 45 },
    ];
    state.player.x = 270; state.player.y = 640;
    state.player.carry = ['kuah'];
    state.plate = ['sate-bakar', 'nasi'];
  } else if (shot === 'rush') {
    state.timeLeft = 47; state.score = 3200; state.coins = 86000; state.combo = 5;
    state.bestCombo = 6; state.served = 19;
    state.orders = [
      { id: 1, recipe: RECIPES[0], patience: 8, max: 45 },
      { id: 2, recipe: RECIPES[2], patience: 14, max: 45 },
      { id: 3, recipe: RECIPES[4], patience: 21, max: 45 },
      { id: 4, recipe: RECIPES[1], patience: 33, max: 45 },
    ];
    state.player.x = 840; state.player.y = 458;
    state.player.carry = ['nasi-goreng'];
    state.cooking.wok = { station: 'wok', input: 'tahu', output: 'tahu-goreng', progress: 0.8, done: false, doneTimer: 0, burnt: false };
    state.cooking.grill = { station: 'grill', input: 'ayam-potong', output: 'sate-bakar', progress: 0.45, done: false, doneTimer: 0, burnt: false };
    state.message = 'Rush hour! 4 pesanan sekaligus!';
    state.messageTimer = 99;
  }
  // Bekukan waktu: screenshot deterministik.
  state.frozen = true;
}

// ---- geometri --------------------------------------------------------------

// Titik terdekat pada rect stasiun dari posisi pemain.
function nearestPointOnRect(px, py, st) {
  const x = Math.max(st.x, Math.min(px, st.x + st.w));
  const y = Math.max(st.y, Math.min(py, st.y + st.h));
  return { x, y };
}

function distToStation(px, py, st) {
  const n = nearestPointOnRect(px, py, st);
  return Math.hypot(px - n.x, py - n.y);
}

// Stasiun terdekat yang masih dalam jangkauan interaksi.
function findActiveStation() {
  let best = null, bestD = INTERACT_RANGE + 1;
  for (const key in STATIONS) {
    const d = distToStation(state.player.x, state.player.y, STATIONS[key]);
    if (d < bestD) { bestD = d; best = key; }
  }
  return best;
}

// Apakah lingkaran pemain di (x, y) menabrak stasiun mana pun?
function hitsStation(x, y, r) {
  for (const key in STATIONS) {
    const st = STATIONS[key];
    if (x + r > st.x && x - r < st.x + st.w &&
        y + r > st.y && y - r < st.y + st.h) return true;
  }
  return false;
}

// Gerak pemain; sumbu x dan y dicoba terpisah supaya koki bergeser menyusuri
// tepi stasiun (bisa memutar) alih-alih mentok. Klik mengikuti rute lorong.
function movePlayer(dt) {
  const p = state.player;
  let { dx, dy } = moveDirection();
  if (dx !== 0 || dy !== 0) {
    route = null; // keyboard mengambil alih
    pendingUseStation = null;
    pendingUseArg = null;
  }
  if (route && route.length > 0) {
    const wp = route[0];
    const ddx = wp.x - p.x, ddy = wp.y - p.y;
    const len = Math.hypot(ddx, ddy);
    if (len <= 8) route.shift();
    else { dx = ddx / len; dy = ddy / len; }
  }
  if (dx === 0 && dy === 0) return;
  const step = PLAYER_SPEED * dt;
  if (dx !== 0) p.face = dx > 0 ? 1 : -1;
  const nx = Math.max(24 + p.r, Math.min(CANVAS_W - 24 - p.r, p.x + dx * step));
  if (!hitsStation(nx, p.y, p.r)) p.x = nx;
  const ny = Math.max(KITCHEN_TOP + p.r, Math.min(KITCHEN_BOTTOM - p.r, p.y + dy * step));
  if (!hitsStation(p.x, ny, p.r)) p.y = ny;
}

// Jalur dapur: tiga lorong horizontal bebas stasiun, dan kanal vertikal
// (celah antar stasiun) untuk pindah lorong. Klik selalu dirutekan lewat sini.
const LANE_Y = { 1: 274, 2: 458, 3: 648 };
const CHANNELS = { '1-2': [30, 420, 840, 1240], '2-3': [30, 520, 940, 1240] };

function laneOf(y) { return y < 308 ? 1 : y < 492 ? 2 : 3; }

// Rute titik jalan dari `from` ke `to` lewat lorong + kanal terdekat.
function clickRoute(from, to) {
  const pts = [];
  const fromLane = laneOf(from.y), toLane = laneOf(to.y);
  const nearestChannel = (a, b, x) =>
    CHANNELS[a + '-' + b].reduce((best, cx) => Math.abs(cx - x) < Math.abs(best - x) ? cx : best);
  let cur = { x: from.x, y: from.y };
  let lane = fromLane;
  if (Math.abs(cur.y - LANE_Y[lane]) > 10) pts.push({ x: cur.x, y: LANE_Y[lane] });
  while (lane < toLane) {
    const ch = nearestChannel(lane, lane + 1, to.x);
    pts.push({ x: ch, y: LANE_Y[lane] });
    pts.push({ x: ch, y: LANE_Y[lane + 1] });
    lane++;
  }
  while (lane > toLane) {
    const ch = nearestChannel(lane - 1, lane, to.x);
    pts.push({ x: ch, y: LANE_Y[lane] });
    pts.push({ x: ch, y: LANE_Y[lane - 1] });
    lane--;
  }
  pts.push({ x: to.x, y: LANE_Y[toLane] });
  pts.push(to);
  return pts;
}

// Titik akses sebuah stasiun: di luar rect, pada sisi yang menghadap pemain
// (atas bila pemain di atas, bawah bila di bawah), x mengikuti titik klik.
function accessPoint(key, clickX) {
  const st = STATIONS[key];
  const x = Math.max(st.x + 30, Math.min(clickX, st.x + st.w - 30));
  if (state.player.y < st.y + st.h / 2) return { x, y: st.y - 28 };
  return { x, y: st.y + st.h + 28 };
}

// ---- interaksi -------------------------------------------------------------

// Bin bahan dari posisi x pemain: koki berdiri di bawah Meja Bahan, bin yang
// diambil adalah kolom tepat di atasnya (klik pada bin = jalan ke kolom itu).
function binAt(x) {
  const st = STATIONS.counter;
  const bw = 118, gap = 14;
  let idx = Math.floor((x - (st.x + 16)) / (bw + gap));
  if (idx < 0) idx = 0;
  if (idx > COUNTER_BINS.length - 1) idx = COUNTER_BINS.length - 1;
  return COUNTER_BINS[idx];
}

function useStation() {
  if (state.phase !== 'playing') return;
  sfx.ensure();
  const key = activeStation;
  if (!key) return;
  const p = state.player;

  if (key === 'counter') {
    const bin = pendingUseArg || binAt(p.x);
    pendingUseArg = null;
    if (takeItem(state, bin)) sfx.pickup();
    return;
  }

  if (key === 'board' || key === 'wok' || key === 'grill') {
    const job = state.cooking[key];
    if (job && job.done) {
      if (job.burnt) {
        showMessage(state, 'Gosong! Bawa ke Tong Sampah dulu.');
        sfx.wrong();
        return;
      }
      if (takeItem(state, job.output)) {
        state.cooking[key] = null;
        sfx.pickup();
      }
      return;
    }
    if (job) return; // sedang berproses
    // Mulai olah: butuh bahan yang cocok di tangan.
    const idx = p.carry.findIndex(item => {
      const prep = PREPARED[item + '+' + key];
      return !!prep;
    });
    if (idx < 0) {
      showMessage(state, 'Bawa bahan yang bisa diolah di ' + STATIONS[key].name + '.');
      return;
    }
    const input = p.carry.splice(idx, 1)[0];
    const output = PREPARED[input + '+' + key].id;
    state.cooking[key] = { station: key, input, output, progress: 0, done: false, doneTimer: 0, burnt: false };
    if (key === 'board') sfx.chop(); else sfx.sizzle();
    return;
  }

  if (key === 'plating') {
    if (state.dishReady) {
      if (takeItem(state, state.dishReady)) {
        state.dishReady = null;
        state.plate = [];
        sfx.pickup();
      }
      return;
    }
    if (p.carry.length > 0) {
      const item = p.carry.pop();
      state.plate.push(item);
      sfx.pickup();
      if (state.plate.length === 3) {
        const dish = recipeForParts(state.plate);
        if (dish) {
          state.dishReady = dish.id;
          showMessage(state, dish.name + ' jadi! Antar ke Jendela Antar.');
          sfx.ding();
        } else {
          showMessage(state, 'Bukan resep! Ambil kembali komponennya (E).');
        }
      }
    } else if (state.plate.length > 0) {
      // Ambil kembali komponen terakhir dari piring.
      const item = state.plate.pop();
      p.carry.push(item);
      sfx.pickup();
    }
    return;
  }

  if (key === 'window') {
    const dishIdx = p.carry.findIndex(item => RECIPES.some(r => r.id === item));
    if (dishIdx < 0) {
      showMessage(state, 'Bawa hidangan jadi ke sini!');
      return;
    }
    const dishId = p.carry.splice(dishIdx, 1)[0];
    const result = serveDish(state, dishId);
    if (result === 'served') sfx.serve(); else sfx.wrong();
    return;
  }

  if (key === 'trash') {
    if (p.carry.length === 0) {
      showMessage(state, 'Tangan kosong — tidak ada yang dibuang.');
      return;
    }
    const gone = dropItem(state, p.carry.length - 1);
    showMessage(state, componentName(gone) + ' dibuang.');
    sfx.chop();
    return;
  }
}

// Tahan E di dekat talenan untuk memotong lebih cepat (umpan balik langsung).
function holdChop(dt) {
  if (state.phase !== 'playing') return;
  const job = state.cooking.board;
  if (!job || job.done) return;
  if (useHeld() && activeStation === 'board') {
    job.progress += dt / COOK_TIME.board * 0.6;
    if (Math.random() < dt * 6) sfx.chop();
    if (job.progress >= 1) { job.progress = 1; job.done = true; job.doneTimer = 0; sfx.ding(); }
  }
}

// ---- loop ------------------------------------------------------------------

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  if (state.phase === 'playing' && !state.frozen) {
    movePlayer(dt);
    // Klik pada stasiun menang atas stasiun terdekat saat sudah dalam jangkauan.
    if (pendingUseStation) {
      const d = distToStation(state.player.x, state.player.y, STATIONS[pendingUseStation]);
      if (d <= INTERACT_RANGE) {
        activeStation = pendingUseStation;
        pendingUseStation = null;
        useStation();
      } else {
        activeStation = findActiveStation();
      }
    } else {
      activeStation = findActiveStation();
    }
    holdChop(dt);
    const ordersBefore = state.orders.length;
    tickGame(state, dt);
    if (state.orders.length > ordersBefore) sfx.orderIn();
    const sec = Math.ceil(state.timeLeft);
    if (sec !== lastTickSecond) {
      lastTickSecond = sec;
      if (sec <= 10 && sec > 0) sfx.tick();
    }
    if (state.phase === 'over') sfx.wrong();
  } else if (state.phase === 'playing' && state.frozen) {
    activeStation = findActiveStation();
  }

  drawGame(ctx, state, activeStation);
  requestAnimationFrame(frame);
}

function restartDay() {
  const muted = state.muted;
  state = createGameState();
  state.muted = muted;
  sfx.muted = muted;
  activeStation = null;
  lastTickSecond = -1;
  applyShotMode(new URLSearchParams(window.location.search).get('shot'));
}

function boot() {
  const canvas = document.getElementById('game');
  setupInput(canvas, {
    onUse: useStation,
    onPause: () => {
      if (state.phase === 'playing') state.phase = 'paused';
      else if (state.phase === 'paused') state.phase = 'playing';
    },
    onRestart: () => { if (state.phase === 'over' || state.phase === 'paused') restartDay(); },
    onMute: () => {
      state.muted = !state.muted;
      sfx.muted = state.muted;
      showMessage(state, state.muted ? 'Suara mati.' : 'Suara hidup.');
    },
    onClick: (pos) => {
      sfx.ensure();
      // Klik pada stasiun: rutenya ke titik akses, pakai saat sampai.
      // Klik di lantai kosong: jalan ke titik itu.
      if (state.phase !== 'playing') return;
      for (const key in STATIONS) {
        const st = STATIONS[key];
        if (pos.x >= st.x && pos.x <= st.x + st.w && pos.y >= st.y && pos.y <= st.y + st.h) {
          route = clickRoute({ x: state.player.x, y: state.player.y }, accessPoint(key, pos.x));
          pendingUseStation = key;
          pendingUseArg = key === 'counter' ? binAt(pos.x) : null;
          return;
        }
      }
      pendingUseStation = null;
      pendingUseArg = null;
      route = clickRoute({ x: state.player.x, y: state.player.y }, pos);
    },
  });
  // Klik saat fase berakhir = mulai lagi.
  canvas.addEventListener('click', () => {
    if (state.phase === 'over') restartDay();
  });
  applyShotMode(new URLSearchParams(window.location.search).get('shot'));
  requestAnimationFrame(frame);
}

boot();
