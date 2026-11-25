# Warung Rush — Game Masak Warung Indonesia

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/dukun22/best-cooking-game-dukun22/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/dukun22/best-cooking-game-dukun22/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Entry untuk [Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137) di [make.fun](https://make.fun/r/0y8y43sq).

**Warung Rush** adalah game masak 2D original bertema warung Indonesia. Kamu
adalah koki satu-satunya di sebuah warung kecil: ambil bahan dari Meja Bahan,
potong di Talenan, goreng di Wok, bakar di Panggangan, rakit hidangan di Meja
Plating, lalu antar ke Jendela Antar sebelum pelanggan kehabisan sabar. Satu
hari berlangsung 3 menit; pesanan datang makin cepat, kombo menaikkan skor.

## Cara main

Buka `game/index.html` di desktop Chrome (tanpa server pun bisa, semua file
lokal, tanpa network).

| Kontrol | Fungsi |
| --- | --- |
| WASD / panah | Gerakkan koki |
| E / Spasi | Pakai stasiun terdekat |
| Klik mouse | Jalan ke stasiun lalu pakai otomatis |
| P | Jeda |
| R | Ulang hari |
| M | Suara hidup/mati |

## Resep

| Hidangan | Komponen | Harga |
| --- | --- | --- |
| Nasi Goreng | Nasi + Telur Goreng + Kecap | Rp12.000 |
| Mie Goreng | Mie Goreng + Sayur Potong + Kecap | Rp11.000 |
| Sate Ayam | Sate Bakar + Bumbu Kacang + Nasi | Rp15.000 |
| Gado-Gado | Sayur Potong + Tahu Goreng + Bumbu Kacang | Rp13.000 |
| Soto Ayam | Sate Bakar + Kuah + Nasi | Rp14.000 |

Bahan mentah diolah di stasiun: sayur dan ayam dipotong di Talenan, mie/tahu/
telur digoreng di Wok, ayam potong dibakar di Panggangan. Masakan yang
dibiarkan terlalu lama jadi gosong dan harus dibuang ke Tong Sampah. Antar
hidangan yang tepat selagi pelanggan masih sabar untuk bonus kesabaran dan
kombo.

## Screenshot

Empat render asli dari kode game (`screenshots/`, yang pertama adalah cover):

1. `1-cover.png` — dapur lengkap: papan pesanan 3 order, bahan di Meja Bahan,
   mie sedang dimasak di Wok, timer hari, dan Nasi Goreng siap disajikan.
2. `2-chopping.png` — ayam sedang dipotong di Talenan (progres 55%).
3. `3-plating.png` — Sate Bakar + Nasi sudah di piring, tinggal satu komponen.
4. `4-rush.png` — rush hour: 4 pesanan sekaligus, Wok dan Panggangan sama-sama
   memasak, kombo x5, timer 0:47.

Keadaan tiap screenshot diatur lewat parameter URL game sendiri
(`?shot=cover|chopping|plating|rush`) — timer dibekukan supaya render
deterministik.

## Struktur kode

- `game/index.html` — halaman game (canvas 1280x720)
- `game/src/recipes.js` — data resep, bahan, dan stasiun
- `game/src/state.js` — state permainan: pesanan, skor, kombo, timer hari
- `game/src/input.js` — keyboard dan mouse
- `game/src/audio.js` — suara original (Web Audio, tanpa file suara)
- `game/src/kitchen.js` — semua gambar: HUD, papan pesanan, stasiun, koki
- `game/src/main.js` — boot, loop, interaksi, dan rute jalan koki
- `main.ts` — program entri: menyalin `game/` + `screenshots/` dan menulis
  `dossier.json` dengan `buildDossier` dari `vendor/makefun-game.ts`
- `screenshots/` — 4 render asli dari kode game sendiri

Semua gambar digambar dengan bentuk canvas dan semua suara dibuat dengan
Web Audio — tidak ada aset eksternal, tidak ada network request.

## Lisensi

MIT — lihat `LICENSE`.
