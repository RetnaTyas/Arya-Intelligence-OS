// Domain Sempit: Fraksi, Rasio, sampai Persamaan Linear (±50 Node Koridor Vertikal)
// Tahap 1 Peta Jalan: Dokumen Fondasi intelligence-os-foundation.md

import { KnowledgeNode } from '../types';

export const NARROW_DOMAIN_MATH_NODES: KnowledgeNode[] = [
  // 1. Fondasi Pembagian & Part-Whole
  {
    id: 'math-frac-01-part-whole',
    name: 'Part-Whole & Pembagian Bagian Sama',
    domain: 'Matematika',
    description: 'Konsep dasar pecahan sebagai bagian sama besar dari satu kesatuan utuh.',
    prerequisites: [],
    explanationLevels: {
      concrete: 'Memotong 1 balok kue menjadi 4 potongan sama besar.',
      visual: 'Diagram pizza lingkaran atau balok fraksi yang diarsir 1 dari 4.',
      symbolic: '1/4, dengan angka bawah adalah jumlah total bagian sama.',
      formal: 'a/b di mana b ≠ 0 mewakili pembagian himpunan terukur S ke b partisi ekuivalen.',
    },
    whyChain: [
      'Pecahan lahir karena bilangan bulat tidak cukup membagi hal yang tidak pas habis',
      'Ukuran bagian harus identik agar perbandingan adil dan konsisten',
    ],
    masteryEvidenceRequired: ['predict', 'explain', 'transfer'],
    commonMisconceptions: [
      {
        misconception: 'Ukuran potongan tidak perlu sama asalkan jumlah potongannya benar',
        counterExample: 'Memotong pizza jadi 2 potong tapi satu besar sekali dan satu sangat kecil.',
        remedyStrategy: 'Uji keadilan pembagian: apakah kedua anak mendapat volume pizza yang sama?',
      },
    ],
    centrality: 0.95,
    futureRelevance: 0.98,
  },
  // 2. Pembilang dan Penyebut
  {
    id: 'math-frac-02-num-denom',
    name: 'Peran Pembilang (Numerator) vs Penyebut (Denominator)',
    domain: 'Matematika',
    description: 'Penyebut menentukan ukuran partisi; pembilang menghitung berapa partisi yang diambil.',
    prerequisites: ['math-frac-01-part-whole'],
    explanationLevels: {
      concrete: 'Piring berisi 3 potong martabak dari cetakan 8 potong.',
      visual: 'Strip pita terbagi 8, 3 petak diwarnai biru.',
      symbolic: '3/8 (3 yang diambil, 8 total partisi identik).',
      formal: 'n/d: d adalah unitasi partisi, n adalah skalar kardinalitas partisi terpilih.',
    },
    whyChain: [
      'Jika penyebut makin besar, setiap bagian justru makin kecil',
      'Pembilang bertindak sebagai pencacah unit partisi tersebut',
    ],
    masteryEvidenceRequired: ['solve', 'predict', 'transfer'],
    commonMisconceptions: [
      {
        misconception: 'Penyebut lebih besar berarti nilai pecahan lebih besar (misal 1/8 dianggap > 1/4)',
        counterExample: '1/8 potongan semangka lebih kecil daripada 1/4 potongan semangka yang sama.',
        remedyStrategy: 'Tunjukkan visual perbandingan partisi kue yang sama jika dibagi ke 4 orang vs 8 orang.',
      },
    ],
    centrality: 0.92,
    futureRelevance: 0.96,
  },
  // 3. Pecahan Ekuivalen
  {
    id: 'math-frac-03-equivalent',
    name: 'Pecahan Ekuivalen & Skalasi Nilai',
    domain: 'Matematika',
    description: 'Pecahan dengan angka berbeda yang merepresentasikan proporsi besaran yang sama persis.',
    prerequisites: ['math-frac-02-num-denom'],
    explanationLevels: {
      concrete: '1 dari 2 potongan roti sama banyaknya dengan 2 dari 4 potongan roti yang sama.',
      visual: 'Dua batang pecahan sejajar: 1/2 tepat berhimpitan dengan 2/4 dan 4/8.',
      symbolic: '1/2 = 2/4 = (1×k)/(2×k) untuk k ≠ 0.',
      formal: 'Relasi ekuivalensi a/b ~ c/d iff a·d = b·c pada lapangan bilangan rasional Q.',
    },
    whyChain: [
      'Memotong lebih halus tidak mengubah total kuantitas materi',
      'Mengalikan pembilang dan penyebut dengan angka yang sama ekuivalen mengalikan dengan 1',
    ],
    masteryEvidenceRequired: ['solve', 'predict', 'create'],
    commonMisconceptions: [
      {
        misconception: 'Menambahkan angka yang sama ke atas dan bawah menghasilkan pecahan ekuivalen (misal 1/2 = 2/3 karena +1/+1)',
        counterExample: '1/2 kue adalah setengah kue. 2/3 kue sudah lebih dari setengah (tambah 1/6).',
        remedyStrategy: 'Tumpuk diagram luas 1/2 dan 2/3 untuk melihat luas arsir tidak sama.',
      },
    ],
    centrality: 0.90,
    futureRelevance: 0.95,
  },
  // 4. Penjumlahan Pecahan Penyebut Sama vs Beda
  {
    id: 'math-frac-04-addition',
    name: 'Penjumlahan Pecahan & Penyelarasan Unit Satuan',
    domain: 'Matematika',
    description: 'Hanya pecahan dengan penyebut (unit satuan) sama yang dapat dijumlahkan langsung pembilangnya.',
    prerequisites: ['math-frac-03-equivalent'],
    explanationLevels: {
      concrete: 'Menggabungkan 1 potong per-empat dan 2 potong per-empat menjadi 3 potong per-empat.',
      visual: 'Mengubah 1/2 menjadi 2/4 sebelum menggabungkannya dengan 1/4.',
      symbolic: '1/4 + 2/4 = 3/4; a/b + c/d = (ad + bc)/(bd).',
      formal: 'Operasi penambahan pada medan rasional Q: penjumlahan mensyaratkan basis ukuran yang komensurabel.',
    },
    whyChain: [
      'Tidak bisa menjumlahkan 1 apel dan 2 motor menjadi 3 apa pun tanpa unit bersama',
      'Penyebut adalah nama satuan unit; pembilang adalah kuantitasnya',
    ],
    masteryEvidenceRequired: ['solve', 'explain', 'predict'],
    commonMisconceptions: [
      {
        misconception: 'Menjumlahkan pembilang dengan pembilang dan penyebut dengan penyebut (misal 1/2 + 1/3 = 2/5)',
        counterExample: '1/2 (setengah) ditambah 1/3 harusnya sudah mendekati 1 penuh, tetapi 2/5 justru kurang dari setengah!',
        remedyStrategy: 'Gunakan bar model pecahan untuk melihat bahwa hasil harus lebih besar dari 1/2.',
      },
    ],
    centrality: 0.88,
    futureRelevance: 0.94,
  },
  // 5. Rasio dan Proporsi
  {
    id: 'math-ratio-05-proportions',
    name: 'Rasio, Skala, dan Hubungan Multiplikatif',
    domain: 'Matematika',
    description: 'Perbandingan relasi relatif antara dua kuantitas yang membesar secara proporsional.',
    prerequisites: ['math-frac-03-equivalent'],
    explanationLevels: {
      concrete: 'Resep sirup: 2 sendok gula untuk setiap 3 gelas air. Jika air 6 gelas, gula harus 4 sendok.',
      visual: 'Tabel rasio dua baris yang dikalikan faktor pengali yang sama.',
      symbolic: 'a : b = c : d atau a/b = c/d.',
      formal: 'Pemetaan linier f(x) = k·x di mana k adalah konstanta proporsionalitas.',
    },
    whyChain: [
      'Rasio mempertahankan rasa/kepekatan/kemiringan terlepas dari skala total',
      'Ini adalah jembatan dari aritmatika menuju aljabar fungsi linier',
    ],
    masteryEvidenceRequired: ['solve', 'transfer', 'predict'],
    commonMisconceptions: [
      {
        misconception: 'Berpikir aditif bukan multiplikatif (misal 2:3 dinaikkan menjadi 3:4 dengan menambah 1 pada keduanya)',
        counterExample: 'Sirup 2:3 rasanya manis seimbang. Campuran 3:4 perbandingannya 75% bukan 66.7%, rasa berubah!',
        remedyStrategy: 'Uji ekstrem: bandingkan rasio 1:2 (50%) dengan menambah 10 ke keduanya (11:12 = 91.6%).',
      },
    ],
    centrality: 0.86,
    futureRelevance: 0.95,
  },
  // 6. Variabel & Model Timbangan
  {
    id: 'math-alg-06-balance-variable',
    name: 'Variabel x & Model Neraca Timbangan (Equality as Balance)',
    domain: 'Matematika',
    description: 'Tanda sama dengan (=) bukan tanda "hitung hasilnya", melainkan titik seimbang neraca kiri dan kanan.',
    prerequisites: ['math-ratio-05-proportions', 'math-frac-04-addition'],
    explanationLevels: {
      concrete: 'Timbangan dua lengan: 1 kantong misteri (x) + 3 batu seimbang dengan 7 batu.',
      visual: 'Bar model dengan kotak bertanda tanya x yang panjangnya menyamai sisa panjang balok.',
      symbolic: 'x + 3 = 7 ➔ x = 4.',
      formal: 'Relasi ekuivalensi simetris pada persamaan f(x) = g(x) yang diawetkan oleh operasi invarian aljabar.',
    },
    whyChain: [
      'Apapun perlakuan pada lengan kiri harus dilakukan persis sama pada lengan kanan agar tetap seimbang',
      'Tanda sama dengan adalah jembatan keseimbangan statis',
    ],
    masteryEvidenceRequired: ['solve', 'explain', 'predict', 'create'],
    commonMisconceptions: [
      {
        misconception: 'Tanda sama dengan diartikan sebagai "lakukan operasi sekarang dan tulis jawabannya"',
        counterExample: 'Pada persamaan 5 = x + 2, anak bingung karena tanda = tidak ada di akhir.',
        remedyStrategy: 'Tunjukkan timbangan neraca fisik di mana lengan bisa ditukar tanpa mengubah keseimbangan.',
      },
    ],
    centrality: 0.94,
    futureRelevance: 0.99,
  },
  // 7. Persamaan Linear Satu Variabel
  {
    id: 'math-alg-07-linear-equations',
    name: 'Persamaan Linear Satu Variabel & Operasi Balikan (Inverse)',
    domain: 'Matematika',
    description: 'Menemukan nilai x dengan membatalkan operasi secara simetris di kedua ruas.',
    prerequisites: ['math-alg-06-balance-variable'],
    explanationLevels: {
      concrete: 'Membongkar kado berlapis: buka pita terakhir dulu sebelum membuka kotak.',
      visual: 'Alur diagram panah mundur: x dikali 2 lalu ditambah 3 jadi 11 ➔ (11-3)/2 = 4.',
      symbolic: '2x + 3 = 11 ➔ 2x = 8 ➔ x = 4.',
      formal: 'Penyelesaian persamaan polinomial berderajat 1 pada lapangan F: ax + b = c di mana x = (c - b)/a untuk a ≠ 0.',
    },
    whyChain: [
      'Operasi penjumlahan dibatalkan dengan pengurangan; perkalian dibatalkan dengan pembagian',
      'Semua aljabar lanjutan dan kalkulus bersandar pada manipulasi invarian ini',
    ],
    masteryEvidenceRequired: ['solve', 'explain', 'transfer'],
    commonMisconceptions: [
      {
        misconception: 'Memindahkan angka ke ruas seberang tanpa membalik tandanya (aturan mekanis tanpa makna timbangan)',
        counterExample: '2x + 3 = 11 jika 3 dipindah tanpa ganti tanda jadi 2x = 11 + 3 = 14 (x = 7), saat dicek 2(7)+3 = 17 ≠ 11.',
        remedyStrategy: 'Hapus istilah "pindah ruas". Gunakan prinsip "kurangkan kedua ruas dengan 3".',
      },
    ],
    centrality: 0.96,
    futureRelevance: 1.0,
  },
];
