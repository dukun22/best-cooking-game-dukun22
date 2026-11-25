// audio.js — suara original Warung Rush, semuanya dibuat dengan Web Audio
// (oscillator + noise), tanpa file suara eksternal. Bunyi pertama dibuat
// setelah interaksi pemain, sesuai aturan autoplay browser.

'use strict';

// Satu pengeras suara untuk seluruh game.
function createSfx() {
  return {
    ctx: null,
    muted: false,

    // Buat AudioContext bila belum ada (dipanggil saat interaksi pertama).
    ensure() {
      if (!this.ctx) {
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AC();
        } catch (err) { this.ctx = null; }
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },

    // Satu nada pendek: frekuensi, durasi, jenis gelombang, volume.
    tone(freq, dur, type, vol, when) {
      if (this.muted) return;
      const ctx = this.ensure();
      if (!ctx) return;
      const t0 = ctx.currentTime + (when || 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(vol || 0.12, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    },

    // Derau pendek untuk bunyi potong / desis.
    noise(dur, vol) {
      if (this.muted) return;
      const ctx = this.ensure();
      if (!ctx) return;
      const len = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = vol || 0.08;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1200;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    },

    pickup() { this.tone(520, 0.08, 'triangle', 0.10); },
    chop() { this.noise(0.06, 0.14); this.tone(180, 0.05, 'square', 0.05); },
    sizzle() { this.noise(0.25, 0.05); },
    ding() { this.tone(880, 0.18, 'sine', 0.12); this.tone(1320, 0.22, 'sine', 0.08, 0.08); },
    serve() {
      this.tone(523, 0.12, 'triangle', 0.12);
      this.tone(659, 0.12, 'triangle', 0.12, 0.09);
      this.tone(784, 0.2, 'triangle', 0.12, 0.18);
    },
    wrong() { this.tone(220, 0.25, 'sawtooth', 0.08); this.tone(165, 0.3, 'sawtooth', 0.08, 0.1); },
    tick() { this.tone(980, 0.05, 'square', 0.05); },
    orderIn() { this.tone(660, 0.1, 'sine', 0.09); this.tone(880, 0.14, 'sine', 0.09, 0.07); },
  };
}
