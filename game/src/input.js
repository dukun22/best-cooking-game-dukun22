// input.js — keyboard dan mouse Warung Rush.
// WASD/panah untuk gerak, E/Spasi untuk pakai stasiun, klik untuk jalan + pakai.
// P jeda, R ulang, M bisu. Semua state tombol tinggal di objek `keys`.

'use strict';

// Tombol yang sedang ditekan (key = e.code).
const keys = {};

// Daftarkan listener keyboard + mouse pada kanvas.
function setupInput(canvas, handlers) {
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (e.repeat) return;
    keys[e.code] = true;
    if (e.code === 'KeyP' && handlers.onPause) handlers.onPause();
    if (e.code === 'KeyR' && handlers.onRestart) handlers.onRestart();
    if (e.code === 'KeyM' && handlers.onMute) handlers.onMute();
    if ((e.code === 'KeyE' || e.code === 'Space') && handlers.onUse) handlers.onUse();
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  window.addEventListener('blur', () => {
    for (const k in keys) keys[k] = false;
  });

  canvas.addEventListener('mousedown', (e) => {
    const pos = canvasPosition(canvas, e.clientX, e.clientY);
    if (handlers.onClick) handlers.onClick(pos);
  });
}

// Ubah koordinat layar (client) menjadi koordinat kanvas 1280x720.
function canvasPosition(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height),
  };
}

// Arah gerak dari keyboard (-1..1 per sumbu). (0,0) bila tidak ada tombol.
function moveDirection() {
  let dx = 0, dy = 0;
  if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) dx += 1;
  if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
  if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
  return { dx, dy };
}

// Apakah tombol pakai (E / Spasi) sedang ditahan?
function useHeld() {
  return !!(keys['KeyE'] || keys['Space']);
}
