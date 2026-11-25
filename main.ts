// main.ts — program entri Warung Rush (make.fun best-cooking-game-20261125-0137).
// Menyalin game/ + screenshots/ dari repo ke direktori output, lalu menulis
// /output/dossier.json dengan buildDossier dari vendor/makefun-game.ts.
// Node 22+, standard library saja, tanpa network. Deterministik: dua run
// menulis byte yang sama.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
};

// Periksa bahan entri sebelum menyalin; gagal cepat dengan pesan yang jelas.
function validateInputs(repoRoot) {
  if (!existsSync(join(repoRoot, 'game', 'index.html'))) {
    throw new Error('game/index.html tidak ditemukan di ' + repoRoot);
  }
  const shots = readdirSync(join(repoRoot, 'screenshots'))
    .filter((name) => !name.startsWith('.'));
  if (shots.length < 3 || shots.length > 4) {
    throw new Error('screenshots/ harus berisi 3-4 gambar, ditemukan ' + shots.length);
  }
  return shots;
}

function main() {
  const repoRoot = dirname(fileURLToPath(import.meta.url));
  const out = process.env.MAKEFUN_OUTPUT_DIR || '/output';
  const shots = validateInputs(repoRoot);

  // Bersihkan output lama supaya hasil run selalu sama.
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  // Salin game/ dan screenshots/ apa adanya.
  cpSync(join(repoRoot, 'game'), join(out, 'game'), { recursive: true });
  cpSync(join(repoRoot, 'screenshots'), join(out, 'screenshots'), { recursive: true });

  // Tulis dossier.json persis seperti yang ditulis buildDossier.
  const dossier = buildDossier(out, CAPS);
  writeFileSync(join(out, 'dossier.json'), dossier);
  console.log('Warung Rush: ' + shots.length + ' screenshot, dossier.json ditulis (' + dossier.length + ' byte) ke ' + out);
}

main();
