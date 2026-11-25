// recipes.js — data resep dan bahan Warung Rush (semua nama dan harga original).
// Satu bahan mentah berubah wujud di satu stasiun: potong di talenan, goreng di
// wok, bakar di panggangan. Tiga komponen yang benar di piring jadi satu hidangan.

'use strict';

// Bahan mentah yang bisa diambil dari Meja Bahan. `prep` = stasiun yang mengubahnya.
const INGREDIENTS = {
  nasi:   { name: 'Nasi',      color: '#fff8e7', prep: null,      icon: 'bowl' },
  mie:    { name: 'Mie',       color: '#f2c94c', prep: 'wok',     icon: 'noodle' },
  ayam:   { name: 'Ayam',      color: '#f2998a', prep: 'board',   icon: 'drumstick' },
  sayur:  { name: 'Sayur',     color: '#6fbf44', prep: 'board',   icon: 'leaf' },
  tahu:   { name: 'Tahu',      color: '#f7e3b0', prep: 'wok',     icon: 'cube' },
  telur:  { name: 'Telur',     color: '#ffe9a8', prep: 'wok',     icon: 'egg' },
  kecap:  { name: 'Kecap',     color: '#5b3a1e', prep: null,      icon: 'bottle' },
  kuah:   { name: 'Kuah',      color: '#e8a13a', prep: null,      icon: 'pot' },
  bumbu:  { name: 'Bumbu Kacang', color: '#b06a2e', prep: null,   icon: 'bottle' },
};

// Hasil olahan: kunci = bahan mentah + stasiun.
const PREPARED = {
  'mie+wok':    { id: 'mie-goreng',   name: 'Mie Goreng',   color: '#e8a13a' },
  'ayam+board': { id: 'ayam-potong',  name: 'Ayam Potong',  color: '#ef8f7d' },
  'sayur+board':{ id: 'sayur-potong', name: 'Sayur Potong', color: '#57a838' },
  'tahu+wok':   { id: 'tahu-goreng',  name: 'Tahu Goreng',  color: '#e0a44a' },
  'telur+wok':  { id: 'telur-goreng', name: 'Telur Goreng', color: '#ffd94d' },
  'ayam-potong+grill': { id: 'sate-bakar', name: 'Sate Bakar', color: '#a05a2c' },
};

// Resep: tiga komponen (bahan mentah yang sudah diolah / langsung pakai).
const RECIPES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', price: 12000,
    parts: ['nasi', 'telur-goreng', 'kecap'], color: '#e07840',
    blurb: 'Nasi + telur goreng + kecap manis' },
  { id: 'mie-goreng', name: 'Mie Goreng', price: 11000,
    parts: ['mie-goreng', 'sayur-potong', 'kecap'], color: '#e8a13a',
    blurb: 'Mie goreng + sayur potong + kecap' },
  { id: 'sate-ayam', name: 'Sate Ayam', price: 15000,
    parts: ['sate-bakar', 'bumbu', 'nasi'], color: '#a05a2c',
    blurb: 'Sate bakar + bumbu kacang + nasi' },
  { id: 'gado-gado', name: 'Gado-Gado', price: 13000,
    parts: ['sayur-potong', 'tahu-goreng', 'bumbu'], color: '#57a838',
    blurb: 'Sayur potong + tahu goreng + bumbu kacang' },
  { id: 'soto-ayam', name: 'Soto Ayam', price: 14000,
    parts: ['sate-bakar', 'kuah', 'nasi'], color: '#e8c33a',
    blurb: 'Ayam bakar + kuah soto + nasi' },
];

// Nama tampilan sebuah komponen (mentah, olahan, atau hidangan jadi).
function componentName(id) {
  if (INGREDIENTS[id]) return INGREDIENTS[id].name;
  for (const key in PREPARED) if (PREPARED[key].id === id) return PREPARED[key].name;
  const dish = RECIPES.find(r => r.id === id);
  if (dish) return dish.name;
  return id;
}

// Warna tampilan sebuah komponen.
function componentColor(id) {
  if (INGREDIENTS[id]) return INGREDIENTS[id].color;
  for (const key in PREPARED) if (PREPARED[key].id === id) return PREPARED[key].color;
  const dish = RECIPES.find(r => r.id === id);
  if (dish) return dish.color;
  return '#cccccc';
}

// Cari resep dari tiga komponen (urutan bebas). null bila bukan resep.
function recipeForParts(parts) {
  if (!parts || parts.length !== 3) return null;
  const sorted = parts.slice().sort().join('|');
  return RECIPES.find(r => r.parts.slice().sort().join('|') === sorted) || null;
}

// Acak satu resep (dipakai untuk pesanan baru).
function randomRecipe() {
  return RECIPES[Math.floor(Math.random() * RECIPES.length)];
}

// Stasiun dapur: posisi dan ukuran di kanvas 1280x720.
// Koridor 68px di antara baris stasiun supaya koki bisa lewat (diameter 44px).
const STATIONS = {
  counter: { name: 'Meja Bahan', x: 24,  y: 164, w: 1232, h: 76,
             hint: 'Ambil bahan mentah (E)' },
  board:   { name: 'Talenan',    x: 60,  y: 308, w: 300, h: 116,
             hint: 'Tahan E: potong sayur / ayam' },
  wok:     { name: 'Wok',        x: 480, y: 308, w: 300, h: 116,
             hint: 'E: masak di wok (2 detik)' },
  grill:   { name: 'Panggangan', x: 900, y: 308, w: 300, h: 116,
             hint: 'E: bakar sate (3 detik)' },
  plating: { name: 'Meja Plating', x: 60, y: 492, w: 420, h: 116,
             hint: 'E: rakit 3 komponen jadi hidangan' },
  window:  { name: 'Jendela Antar', x: 560, y: 492, w: 340, h: 116,
             hint: 'E: antar hidangan ke pelanggan' },
  trash:   { name: 'Tong Sampah', x: 980, y: 492, w: 220, h: 116,
             hint: 'E: buang bahan gosong / salah' },
};

// Bin bahan di Meja Bahan: 9 bin sejajar.
const COUNTER_BINS = ['nasi', 'mie', 'ayam', 'sayur', 'tahu', 'telur', 'kecap', 'kuah', 'bumbu'];

// Lama olah (detik) per stasiun; gosong bila dibiarkan 4 detik setelah matang.
const COOK_TIME = { wok: 2.0, grill: 3.0, board: 1.2 };
const BURN_AFTER = 4.0;
