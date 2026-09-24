// Tahap 2 Harness: Uji Hipotesis Pusat & Semantic Perturbation Testing (Layer 0–2)
// Sesuai Section 6.5.1, Section 11 (Risiko #1, #12, #13), dan docs/architecture/tahap2-perturbation-fix.md

export interface PerturbationProbe {
  type: string;
  prompt: string;
  childUtterance: string;               // Jawaban anak sintetis, konsisten dgn expectedBehavior
  expectedHasMisconception: boolean;    // Target biner untuk pembanding mesin
  expectedScoreRange: [number, number]; // Rentang skor structural mastery yang wajar [min, max]
  expectedBehavior: string;             // Dokumentasi pedagogis manusia
  contrastDifference?: string;          // Khusus Layer 2 (Minimal Contrast Pair)
}

export interface HumanGoldStandardItem {
  id: string;
  domain: string;
  prompt: string;
  childUtterance: string;
  humanExpertDiagnosis: {
    hasMisconception: boolean;
    misconceptionId?: string;
    misconceptionName: string;
    structuralMasteryScore: number; // 0.0 - 1.0 (Skor pemahaman struktur sejati)
    confidence: number;
    explanation: string;
  };
  perturbations: {
    layer0: PerturbationProbe;
    layer1: PerturbationProbe;
    layer2: PerturbationProbe;
  };
}

export interface DiagnosisShape {
  hasMisconception: boolean;
  misconceptionName: string;
  structuralMasteryScore: number;
  explanation: string;
}

export interface PerturbationEvaluationResult {
  itemId: string;
  domain: string;
  prompt: string;
  aiDiagnosis: DiagnosisShape;
  layerResults: {
    layer0: DiagnosisShape;
    layer1: DiagnosisShape;
    layer2: DiagnosisShape;
  };
  humanExpert: {
    hasMisconception: boolean;
    misconceptionName: string;
    structuralMasteryScore: number;
  };
  agreementScore: number; // 0.0 - 1.0 concordansi
  isConcordant: boolean;
  perturbationSurvival: {
    layer0Pass: boolean;
    layer1Pass: boolean;
    layer2Pass: boolean;
    layer2ContrastRecognized: boolean;
  };
  epistemicVerdict: 'ROBUST_STRUCTURAL' | 'FRAGILE_SURFACE' | 'SUPERFICIALLY_FLUENT' | 'MISCONCEPTION_CONFIRMED';
  calibrationScore: number;
}

// 12 Kasus Uji Ground Truth Standar Emas Pakar Pendidikan Matematika
// Meliputi Pecahan, Rasio, Timbangan Aljabar, dan Kasus Kontrol Positif (anak yang benar-benar paham)
export const HUMAN_GOLD_STANDARD_BENCHMARK: HumanGoldStandardItem[] = [
  // 1. Pecahan: Besar Nilai vs Penyebut (Miskonsepsi Transfer Bilangan Bulat)
  {
    id: 'bench-frac-01',
    domain: 'Pecahan: Besar Nilai vs Penyebut',
    prompt: 'Manakah yang lebih banyak: 1/4 potong semangka atau 1/8 potong semangka yang sama?',
    childUtterance: '1/8 lebih banyak dong, kan angka 8 lebih besar dari angka 4!',
    humanExpertDiagnosis: {
      hasMisconception: true,
      misconceptionId: 'larger-denominator-means-larger-value',
      misconceptionName: 'Penyebut lebih besar dianggap nilai pecahan lebih besar',
      structuralMasteryScore: 0.15,
      confidence: 0.98,
      explanation: 'Anak mentransfer intuisi bilangan bulat (8 > 4) langsung ke pecahan tanpa memahami bahwa pembagi memotong semangka menjadi bagian yang lebih kecil.',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: 'Apakah 1/8 lebih besar dari 1/4?',
        childUtterance: 'Iya, 1/8 lebih besar, soalnya 8 lebih besar dari 4.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.30],
        expectedBehavior: 'Konsisten mendeteksi transfer bilangan bulat pada bentuk pertanyaan biner langsung.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Mana yang lebih panjang: 1/5 meter tali atau 1/10 meter tali?',
        childUtterance: '1/10 meter lebih panjang, kan 10 lebih besar dari 5.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.30],
        expectedBehavior: 'Harus konsisten mengidentifikasi miskonsepsi yang sama pada objek berbeda (tali dan meteran).',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Kalau 4/8 dibandingkan 2/4, menurutmu mana yang lebih banyak?',
        childUtterance: '4/8 lebih banyak, kan 8 potong lebih banyak dari 4 potong.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.35],
        contrastDifference: 'Pecahan kedua senilai (4/8 = 2/4 = 1/2), menguji apakah anak tetap terkecoh penyebut 8 padahal proporsi nilainya identik.',
        expectedBehavior: 'AI harus mendeteksi miskonsepsi partisi dan tidak tertipu oleh klaim anak.',
      },
    },
  },

  // 2. Pecahan: Penjumlahan Pembilang & Penyebut (Atas Tambah Atas, Bawah Tambah Bawah)
  {
    id: 'bench-frac-02',
    domain: 'Pecahan: Penjumlahan Pembilang & Penyebut',
    prompt: 'Berapa hasil dari 1/2 + 1/3?',
    childUtterance: 'Tinggal ditambah saja atas tambah atas jadi 2, bawah tambah bawah jadi 5, hasilnya 2/5!',
    humanExpertDiagnosis: {
      hasMisconception: true,
      misconceptionId: 'add-numerators-and-denominators',
      misconceptionName: 'Menjumlahkan pembilang dengan pembilang dan penyebut dengan penyebut',
      structuralMasteryScore: 0.20,
      confidence: 0.99,
      explanation: 'Gagal memahami penyebut sebagai penanda unit/satuan ukuran yang harus diselaraskan sebelum digabung. Hasil 2/5 bahkan lebih kecil dari 1/2.',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: 'Hitunglah: 1/2 + 1/3 = ?',
        childUtterance: '2/5, karena 1+1=2 dan 2+3=5.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.30],
        expectedBehavior: 'Mendeteksi kekeliruan aritmatika pecahan dasar pada notasi formal.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Berapa hasil 1/3 + 1/4?',
        childUtterance: 'Hasilnya 2/7, kan 1 tambah 1 jadi 2, 3 tambah 4 jadi 7.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.30],
        expectedBehavior: 'Mendeteksi pola aditif pembilang dan penyebut pada bilangan berbeda.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Bagaimana dengan 1/4 + 2/4? Apakah hasilnya 3/8 atau 3/4?',
        childUtterance: 'Jawabannya 3/8, kan atasnya 1+2=3, bawahnya 4+4=8.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.30],
        contrastDifference: 'Penyebut sudah sama persis (4), menguji apakah anak tetap menjumlahkan penyebut jadi 8 secara mekanis alih-alih menyadari satuannya tetap per-empat.',
        expectedBehavior: 'Membedakan miskonsepsi murni vs kepatuhan mekanis.',
      },
    },
  },

  // 3. Pecahan: Buzzword Dropping tanpa Struktur (Hafalan Istilah Formal)
  {
    id: 'bench-frac-03',
    domain: 'Pecahan: Buzzword Dropping tanpa Struktur',
    prompt: 'Mengapa 2/4 sama nilainya dengan 1/2?',
    childUtterance: 'Karena itu pecahan ekuivalen yang dikalikan konstan skalar pada lapangan medan bilangan rasional.',
    humanExpertDiagnosis: {
      hasMisconception: true,
      misconceptionId: 'superficial-jargon-dropping',
      misconceptionName: 'Penghafalan istilah teknis (buzzwords) tanpa intuisi partisi konkret',
      structuralMasteryScore: 0.35,
      confidence: 0.92,
      explanation: 'Anak menghafal kalimat formal tinggi tapi ketika diminta menggambar diagram kue gagal menunjukkan relasi luas.',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: 'Apakah 2/4 dan 1/2 ekuivalen?',
        childUtterance: 'Iya ekuivalen skalar linear pada medan bilangan rasional.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.20, 0.45],
        expectedBehavior: 'Mendeteksi pengulangan jargon tanpa elaborasi makna.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Bagaimana dengan 3/6 dan 1/2?',
        childUtterance: 'Sama juga, itu transformasi rasional ekuivalensi isomorfik.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.20, 0.45],
        expectedBehavior: 'Menguji apakah hafalan verbal bertumpuk terus muncul pada angka pecahan baru.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Tunjukkan dengan potongan balok kayu: ambil 2 potong dari 4 potong, lalu bandingkan dengan 1 dari 2.',
        childUtterance: 'Saya tidak tahu kalau balok kayu, tapi di buku rumusnya memang ekuivalen skalar.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.15, 0.40],
        contrastDifference: 'Mencabut domain verbal formal dan memaksakan uji representasi spasial-manipulatif.',
        expectedBehavior: 'AI harus mengonfirmasi kekosongan struktural saat anak menolak manipulasi visual.',
      },
    },
  },

  // 4. KONTROL POSITIF: Pecahan Part-Whole (Pemahaman Partisi Sejati)
  {
    id: 'bench-frac-04-control',
    domain: 'Pecahan: Part-Whole & Partisi (Kontrol Positif)',
    prompt: 'Manakah yang lebih banyak: 1/3 loyang brownies atau 1/6 loyang brownies yang sama besar?',
    childUtterance: '1/3 loyang jauh lebih banyak! Karena loyangnya dibagi ke 3 orang, jadi tiap orang dapat potongan besar. Kalau dibagi ke 6 orang, kuenya harus dipotong kecil-kecil.',
    humanExpertDiagnosis: {
      hasMisconception: false,
      misconceptionName: 'Tidak ada miskonsepsi (Pemahaman Partisi & Unit Invers)',
      structuralMasteryScore: 0.95,
      confidence: 0.99,
      explanation: 'Anak memahami relasi terbalik antara jumlah partisi dan ukuran tiap partisi secara intuitif dan tepat sasaran.',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: 'Apakah 1/3 lebih besar dari 1/6?',
        childUtterance: 'Iya benar, 1/3 lebih besar karena potongannya cuma dibagi 3 bagian, bukan 6.',
        expectedHasMisconception: false,
        expectedScoreRange: [0.85, 1.0],
        expectedBehavior: 'AI konsisten mengakui kebenaran konseptual anak tanpa salah diagnosis.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Mana yang lebih banyak: 1/5 liter air atau 1/10 liter air dalam gelas ukur yang sama?',
        childUtterance: '1/5 liter lebih banyak. Kalau air 1 liter dibagi ke 5 wadah, masing-masing dapat 200 ml, lebih penuh daripada dibagi ke 10 wadah yang cuma 100 ml.',
        expectedHasMisconception: false,
        expectedScoreRange: [0.85, 1.0],
        expectedBehavior: 'Anak mentransfer prinsip partisi ke volume fluida, AI harus memberikan skor tinggi.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Bagaimana kalau 2/6 dibandingkan dengan 1/3? Mana yang lebih banyak?',
        childUtterance: 'Dua-duanya sama persis banyaknya! Kan 1 potongan per-tiga kalau kita belah dua pas jadi 2 potongan per-enam. Jadi 2/6 itu sama dengan 1/3.',
        expectedHasMisconception: false,
        expectedScoreRange: [0.85, 1.0],
        contrastDifference: 'Nilai pecahan sama (2/6 = 1/3), menguji apakah anak goyah atau mampu menjelaskan sub-partisi.',
        expectedBehavior: 'AI mengonfirmasi ketahanan struktural mendalam anak.',
      },
    },
  },

  // 5. Pecahan: Ukuran Potongan Tidak Sama (Miskonsepsi Partisi Adil)
  {
    id: 'bench-frac-05',
    domain: 'Pecahan: Syarat Luas Partisi Harus Sama',
    prompt: 'Ibu memotong martabak jadi 4 potong, tapi 2 potong besar sekali dan 2 potong kecil. Adik mengambil 1 potong kecil. Apakah adik mengambil 1/4 martabak?',
    childUtterance: 'Iya 1/4, kan martabaknya ada 4 potong dan adik ambil 1 potong.',
    humanExpertDiagnosis: {
      hasMisconception: true,
      misconceptionId: 'equal-parts-ignored',
      misconceptionName: 'Mengabaikan syarat kesamaan ukuran partisi pada pecahan',
      structuralMasteryScore: 0.20,
      confidence: 0.97,
      explanation: 'Anak hanya mencacah jumlah potongan fisik (kardinalitas partisi) tanpa memeriksa invariansi luas/volume bagian.',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: 'Jika kue dipotong 4 secara acak tidak rata, apakah 1 potong disebut 1/4?',
        childUtterance: 'Iya tetap 1/4 karena jumlahnya empat potong.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.30],
        expectedBehavior: 'Mendeteksi pengabaian ukuran partisi pada pertanyaan langsung.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Kertas persegi dipotong jadi 2 secara miring tidak tepat di tengah. Apakah potongan itu 1/2 kertas?',
        childUtterance: 'Iya 1/2, kan kertasnya sudah jadi 2 bagian.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.30],
        expectedBehavior: 'Konsisten mendeteksi kesalahan pada domain geometri 2D.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Bandingkan: jika adik dapat potongan kecil dan kakak dapat potongan besar, apakah pembagian itu adil dan kuantitasnya sama?',
        childUtterance: 'Nggak adil sih, tapi kan namanya tetap 1/4 karena ada 4 potong.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.35],
        contrastDifference: 'Menghadapkan persepsi keadilan fisik vs label fraksi verbal: anak memisahkan istilah matematis dari realitas fisik.',
        expectedBehavior: 'AI mendiagnosis kegagalan menghubungkan fraksi dengan ukuran terukur.',
      },
    },
  },

  // 6. Pecahan: Aditif pada Ekuivalensi (+1/+1 Trap)
  {
    id: 'bench-frac-06',
    domain: 'Pecahan: Aditif vs Multiplikatif pada Ekuivalensi',
    prompt: 'Apakah 1/2 sama nilainya dengan 2/3?',
    childUtterance: 'Iya sama, kan pembilang ditambah 1 jadi 2, penyebut ditambah 1 jadi 3. Karena atas dan bawah ditambah angka yang sama, nilainya tetap sama!',
    humanExpertDiagnosis: {
      hasMisconception: true,
      misconceptionId: 'additive-equivalent-fractions',
      misconceptionName: 'Menganggap penambahan bilangan sama pada pembilang & penyebut mempertahankan nilai',
      structuralMasteryScore: 0.18,
      confidence: 0.98,
      explanation: 'Anak memperlakukan ekuivalensi secara aditif (+1/+1) bukan skalasi multiplikatif (×k/×k). 2/3 (66.7%) jauh lebih besar dari 1/2 (50%).',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: '1/2 dan 2/3 apakah ekuivalen?',
        childUtterance: 'Iya ekuivalen, kan sama-sama naik 1.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.30],
        expectedBehavior: 'Deteksi aturan aditif keliru pada fraksi sederhana.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Bagaimana dengan 2/5 dan 3/6? Apakah nilainya sama?',
        childUtterance: 'Sama dong, 2 ke 3 tambah 1, 5 ke 6 juga tambah 1, jadi sama persis.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.30],
        expectedBehavior: 'Konsisten mendeteksi pola aditif pembilang-penyebut pada angka berbeda.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Coba bandingkan: 1/2 jika atas bawah dikali 2 menjadi 2/4. Mana yang benar-benar setengah: 2/4 atau 2/3?',
        childUtterance: '2/4 dan 2/3 itu sama-sama setengah, kan dua-duanya dibikin dari 1/2 yang ditambah atau dikali.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.30],
        contrastDifference: 'Membandingkan bentuk multiplikatif sejati (2/4) dengan bentuk aditif semu (2/3).',
        expectedBehavior: 'AI harus mendeteksi anak tidak membedakan operasi invarian perkalian dengan penjumlahan.',
      },
    },
  },

  // 7. KONTROL POSITIF: Pecahan Ekuivalen Multiplikatif Sejati
  {
    id: 'bench-frac-07-control',
    domain: 'Pecahan: Ekuivalensi Multiplikatif (Kontrol Positif)',
    prompt: 'Mengapa 2/4 senilai dengan 1/2? Jelaskan alasannya.',
    childUtterance: 'Karena tiap potongan pada 1/2 kita potong lagi jadi 2 bagian yang lebih kecil. Jadi jumlah potongannya jadi dua kali lipat (2), tapi ukuran tiap potongannya juga setengahnya. Mengalikan pembilang dan penyebut dengan 2 itu sama dengan mengalikan dengan 2/2 alias satu utuh!',
    humanExpertDiagnosis: {
      hasMisconception: false,
      misconceptionName: 'Tidak ada miskonsepsi (Pemahaman Skalasi Identitas Multiplikatif)',
      structuralMasteryScore: 0.98,
      confidence: 0.99,
      explanation: 'Pemahaman tingkat tinggi: anak menyadari bahwa ×2/×2 adalah perkalian dengan elemen identitas 1 yang menjaga proporsi partisi.',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: 'Apakah 2/4 sama dengan 1/2?',
        childUtterance: 'Sama persis, karena 2/4 itu setengah kue yang dipotong jadi dua irisan.',
        expectedHasMisconception: false,
        expectedScoreRange: [0.85, 1.0],
        expectedBehavior: 'AI menilai akurat pemahaman anak pada kasus identik.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Bagaimana dengan 4/10 dan 2/5? Mengapa nilainya sama?',
        childUtterance: 'Sama, karena 4/10 itu 2/5 yang atas dan bawahnya sama-sama dikali 2. Kuotanya tetap sama persis.',
        expectedHasMisconception: false,
        expectedScoreRange: [0.85, 1.0],
        expectedBehavior: 'Pemahaman bertahan saat angka dan unit pecahan berubah.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Kalau 3/6 dibandingkan dengan 4/8, mana yang lebih banyak?',
        childUtterance: 'Nilainya sama persis! 3/6 itu setengah, 4/8 juga setengah. Walaupun pembilang dan penyebutnya beda angka, proporsinya tetap satu banding dua.',
        expectedHasMisconception: false,
        expectedScoreRange: [0.90, 1.0],
        contrastDifference: 'Membandingkan dua pecahan ekuivalen berbeda angka dasar (3/6 vs 4/8) tanpa menyebutkan 1/2.',
        expectedBehavior: 'AI mengonfirmasi ketahanan penalaran ekuivalensi relasional anak.',
      },
    },
  },

  // 8. KONTROL POSITIF: Aljabar - Model Neraca Seimbang
  {
    id: 'bench-alg-08-control',
    domain: 'Aljabar: Tanda Sama Dengan sebagai Neraca (Kontrol Positif)',
    prompt: 'Jika x + 4 = 10, berapa nilai x dan apa arti tanda = di situ?',
    childUtterance: 'x adalah 6. Tanda sama dengan artinya timbangan kiri (x+4) beratnya harus pas persis sama dengan sisi kanan (10). Kalau di kiri kita ambil 4 batu, di kanan juga harus kita ambil 4 batu biar tetap seimbang, jadi sisa x = 6.',
    humanExpertDiagnosis: {
      hasMisconception: false,
      misconceptionName: 'Tidak ada miskonsepsi (Pemahaman Relasional Ekuivalensi)',
      structuralMasteryScore: 0.96,
      confidence: 0.98,
      explanation: 'Anak memahami tanda sama dengan sebagai neraca relasional seimbang dua arah, bukan semata-mata perintah komputasi hitung.',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: 'Selesaikan x + 4 = 10 menggunakan prinsip timbangan.',
        childUtterance: 'Kedua sisi dikurangi 4, jadi x = 6.',
        expectedHasMisconception: false,
        expectedScoreRange: [0.85, 1.0],
        expectedBehavior: 'Paham pembalikan operasi secara adil pada kedua ruas.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Selesaikan y + 7 = 15.',
        childUtterance: 'y = 8, karena timbangan kiri dan kanan sama-sama dikurangi 7.',
        expectedHasMisconception: false,
        expectedScoreRange: [0.85, 1.0],
        expectedBehavior: 'Transfer lancar ke variabel y dan angka berbeda.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Bagaimana jika persamaannya ditulis terbalik: 10 = x + 4? Apakah boleh angka 10 ada di depan tanda sama dengan?',
        childUtterance: 'Boleh banget! Timbangan itu kan simetris. Mau piringan 10 ditaruh di kiri atau di kanan, beratnya tetap seimbang sama persis dengan x+4.',
        expectedHasMisconception: false,
        expectedScoreRange: [0.90, 1.0],
        contrastDifference: 'Membalik orientasi standar (konstanta di kiri, variabel di kanan), menguji apakah anak terpaku orientasi kiri-ke-kanan.',
        expectedBehavior: 'AI mengonfirmasi pemahaman relasi ekuivalensi simetris yang kokoh.',
      },
    },
  },

  // 9. Aljabar: Pindah Ruas Mekanis tanpa Inversi Tanda
  {
    id: 'bench-alg-09',
    domain: 'Aljabar: Aturan Mekanis Pindah Ruas',
    prompt: 'Selesaikan 2x + 5 = 15.',
    childUtterance: '5 dipindah ke kanan jadi +5, lalu 2x = 20, jadi x = 10.',
    humanExpertDiagnosis: {
      hasMisconception: true,
      misconceptionId: 'mechanical-transposition-without-inverse',
      misconceptionName: 'Pindah ruas mekanis tanpa operasi inversi tanda',
      structuralMasteryScore: 0.25,
      confidence: 0.97,
      explanation: 'Anak menghafal slogan "pindah ruas" tanpa memahami bahwa kedua sisi sebenarnya dikurangi 5 agar neraca tetap seimbang.',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: 'Selesaikan 2x + 5 = 15.',
        childUtterance: '5 pindah ke seberang jadi tambah 5, x = 10.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.10, 0.35],
        expectedBehavior: 'Salah membalik tanda saat pemindahan.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Selesaikan 3x + 2 = 14.',
        childUtterance: '2 dipindah ke kanan jadi 14 + 2 = 16, lalu x = 16/3.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.10, 0.35],
        expectedBehavior: 'Terjadi pengulangan kesalahan mekanis yang sama pada koefisien 3.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Coba periksa dengan memasukkan x = 10 ke soal awal: 2(10) + 5 = ? Apakah hasilnya 15?',
        childUtterance: '2 kali 10 itu 20, tambah 5 jadi 25. Kok nggak cocok ya? Tapi kan tadi aturannya cuma dipindah ke kanan.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.15, 0.40],
        contrastDifference: 'Memaksa tahap verifikasi substitusi balikan independen.',
        expectedBehavior: 'AI mendeteksi kebingungan anak yang terjebak hafalan aturan tanpa konsep neraca.',
      },
    },
  },

  // 10. Aljabar: Tanda Sama Dengan Diartikan Perintah "Hitung Sekarang"
  {
    id: 'bench-alg-10',
    domain: 'Aljabar: Sama Dengan sebagai Perintah Operasi',
    prompt: 'Berapa nilai x pada persamaan 8 = x + 3?',
    childUtterance: 'x adalah 11, kan 8 ditambah 3 hasilnya 11!',
    humanExpertDiagnosis: {
      hasMisconception: true,
      misconceptionId: 'equals-as-do-operation',
      misconceptionName: 'Tanda sama dengan diartikan sebagai perintah "lakukan operasi dan hitung"',
      structuralMasteryScore: 0.20,
      confidence: 0.98,
      explanation: 'Anak melihat dua angka (8 dan 3) dan lambang tambah (+), lalu langsung menjumlahkannya menjadi 11 tanpa memahami relasi penyeimbang.',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: '8 = x + 3, cari x.',
        childUtterance: 'x = 11, tinggal 8 ditambah 3.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.30],
        expectedBehavior: 'Deteksi salah interpretasi tanda sama dengan.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Berapa nilai y pada 12 = y + 5?',
        childUtterance: 'y = 17, karena 12 + 5 = 17.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.30],
        expectedBehavior: 'Konsisten melakukan komputasi langsung pada posisi angka terbalik.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Bandingkan: jika soalnya ditulis x + 3 = 8 kamu jawab x = 5. Mengapa saat ditulis 8 = x + 3 jawabanmu berubah jadi 11?',
        childUtterance: 'Karena kalau 8 di depan, kita harus menghitung 8 tambah 3. Tanda sama dengan itu kan tombol sama dengan di kalkulator buat ngitung.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.0, 0.30],
        contrastDifference: 'Mengontraskan x+3=8 vs 8=x+3 untuk membongkar interpretasi "tombol kalkulator".',
        expectedBehavior: 'AI mengonfirmasi miskonsepsi operasional kalkulator secara tegas.',
      },
    },
  },

  // 11. Rasio: Pemikiran Aditif vs Multiplikatif (Warna Cat)
  {
    id: 'bench-ratio-11',
    domain: 'Rasio: Pemikiran Aditif vs Multiplikatif',
    prompt: 'Campuran cat ungu butuh 2 kaleng biru dan 3 kaleng merah. Jika kita pakai 4 kaleng biru, berapa kaleng merah agar warna ungunya persis sama?',
    childUtterance: 'Biru naik dari 2 ke 4 (tambah 2), jadi merah juga tambah 2 jadi 5 kaleng merah!',
    humanExpertDiagnosis: {
      hasMisconception: true,
      misconceptionId: 'additive-instead-of-multiplicative-ratio',
      misconceptionName: 'Berpikir aditif bukan multiplikatif pada rasio',
      structuralMasteryScore: 0.28,
      confidence: 0.96,
      explanation: 'Kesalahan klasik rasio: anak melihat perubahan selisih mutlak (+2) alih-alih faktor pengali skala multiplikatif (skala ×2). Campuran 4:5 akan lebih merah daripada 2:3.',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: '2 kaleng biru : 3 kaleng merah. Jika 4 kaleng biru, berapa merah?',
        childUtterance: '5 kaleng merah, kan sama-sama ditambah dua kaleng.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.10, 0.35],
        expectedBehavior: 'Salah menjawab 5 karena penalaran aditif.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Resep sirup butuh 3 sendok gula untuk 2 gelas air. Kalau pakai 6 sendok gula, butuh berapa gelas air agar manisnya sama?',
        childUtterance: 'Gula dari 3 ke 6 tambah 3, jadi air juga tambah 3 jadi 5 gelas air.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.10, 0.35],
        expectedBehavior: 'Konsisten mendeteksi penalaran aditif pada konteks resep rasa.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Bandingkan: (A) Kamu punya 2 permen dan kakak punya 3 permen, ayah memberi kalian masing-masing 2 permen lagi. (B) Resep cat 2 biru : 3 merah. Mengapa pada kasus A adil ditambah 2, tetapi pada cat warna ungu jadi berubah?',
        childUtterance: 'Harusnya warna cat nggak berubah dong, kan sama-sama ditambah 2 kaleng seperti permen.',
        expectedHasMisconception: true,
        expectedScoreRange: [0.10, 0.35],
        contrastDifference: 'Menjejerkan konteks kuantitas mutlak (permen) vs relasi intensif (kepekatan warna cat).',
        expectedBehavior: 'AI mendeteksi ketidakmampuan anak membedakan besaran ekstensif vs intensif.',
      },
    },
  },

  // 12. KONTROL POSITIF: Rasio & Skala Multiplikatif Sejati
  {
    id: 'bench-ratio-12-control',
    domain: 'Rasio: Penalaran Multiplikatif Skalasi (Kontrol Positif)',
    prompt: 'Resep roti butuh 2 cangkir terigu untuk 3 cangkir susu. Jika koki memakai 6 cangkir terigu, berapa cangkir susu yang dibutuhkan agar adonan tetap lembut sempurna?',
    childUtterance: 'Butuh 9 cangkir susu! Karena terigunya dikali 3 (2×3=6), maka susunya juga harus dikali 3 (3×3=9) biar perbandingannya tetap sama 2 banding 3 dan kuenya nggak bantat.',
    humanExpertDiagnosis: {
      hasMisconception: false,
      misconceptionName: 'Tidak ada miskonsepsi (Penalaran Proporsional Multiplikatif)',
      structuralMasteryScore: 0.97,
      confidence: 0.99,
      explanation: 'Pemahaman proporsional sempurna: anak secara sadar menggunakan faktor pengali skala (×3) untuk menjaga invarian intensif adonan roti.',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: '2 terigu : 3 susu. Jika 6 terigu, berapa susu?',
        childUtterance: '9 susu, karena skala resepnya dilipatgandakan 3 kali.',
        expectedHasMisconception: false,
        expectedScoreRange: [0.85, 1.0],
        expectedBehavior: 'AI mengonfirmasi keakuratan komputasi proporsional.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Campuran cat hijau butuh 4 kaleng kuning dan 5 kaleng biru. Kalau dipakai 12 kaleng kuning, berapa kaleng biru?',
        childUtterance: 'Butuh 15 kaleng biru, karena kuningnya dikali 3 (4×3=12), jadi birunya juga dikali 3 (5×3=15).',
        expectedHasMisconception: false,
        expectedScoreRange: [0.85, 1.0],
        expectedBehavior: 'Transfer mulus ke warna cat dengan faktor pengali yang sama.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Mengapa kita tidak boleh hanya menambah 4 kaleng saja ke keduanya (dari 4:5 menjadi 8:9)? Kan sama-sama bertambah 4?',
        childUtterance: 'Jangan! Kalau ditambah 4, perbandingannya jadi 8:9 (hampir 1 banding 1), warnanya pasti berubah jauh jadi terlalu biru. Yang harus dijaga itu perbandingan kelipatannya, bukan selisih penambahannya.',
        expectedHasMisconception: false,
        expectedScoreRange: [0.90, 1.0],
        contrastDifference: 'Menguji apakah anak dapat menolak jebakan aditif dan mengartikulasikan perbedaan antara selisih mutlak dan relasi kelipatan.',
        expectedBehavior: 'AI mengonfirmasi bahwa penalaran multiplikatif anak kokoh dan tahan terhadap provokasi kontras.',
      },
    },
  },
];

// Mesin Penilai Diagnostik AI & Perturbation Test Evaluator
// Membandingkan 4 diagnosis independen (base, layer0, layer1, layer2) terhadap target terukur
export function evaluateDiagnosticAgreementAndPerturbation(
  benchmarkItem: HumanGoldStandardItem,
  aiResults: {
    base: DiagnosisShape;
    layer0: DiagnosisShape;
    layer1: DiagnosisShape;
    layer2: DiagnosisShape;
  }
): PerturbationEvaluationResult {
  const human = benchmarkItem.humanExpertDiagnosis;

  // 1. Base agreement dengan human expert
  const misconceptionMatches = aiResults.base.hasMisconception === human.hasMisconception;
  const scoreDelta = Math.abs(aiResults.base.structuralMasteryScore - human.structuralMasteryScore);
  const scoreProximity = Math.max(0, 1 - scoreDelta);
  const agreementScore = (misconceptionMatches ? 0.6 : 0) + (scoreProximity * 0.4);
  const isConcordant = agreementScore >= 0.75;

  // 2. Fungsi pembanding generik untuk tiap layer probe
  const checkProbe = (probe: PerturbationProbe, result: DiagnosisShape): boolean => {
    if (!result) return false;
    const misconceptionOk = result.hasMisconception === probe.expectedHasMisconception;
    const [min, max] = probe.expectedScoreRange;
    const scoreOk = result.structuralMasteryScore >= min && result.structuralMasteryScore <= max;
    return misconceptionOk && scoreOk;
  };

  // Layer 0: apakah AI konsisten pada reformulasi kasus yang sama (deteksi hafalan vs pemahaman)
  const layer0Pass = checkProbe(benchmarkItem.perturbations.layer0, aiResults.layer0);

  // Layer 1: apakah AI tetap konsisten saat objek/konteks permukaan berubah
  const layer1Pass = layer0Pass && checkProbe(benchmarkItem.perturbations.layer1, aiResults.layer1);

  // Layer 2: HIPOTESIS UTAMA — apakah AI bertahan saat satu relasi semantik digeser (Minimal Contrast Pair)
  const layer2Pass = layer1Pass && checkProbe(benchmarkItem.perturbations.layer2, aiResults.layer2);

  // Contrast recognized diukur dari kesesuaian deteksi layer2 dengan target expected
  const layer2ContrastRecognized =
    layer2Pass &&
    aiResults.layer2.hasMisconception === benchmarkItem.perturbations.layer2.expectedHasMisconception;

  // Klasifikasi Epistemik
  let epistemicVerdict: PerturbationEvaluationResult['epistemicVerdict'] = 'MISCONCEPTION_CONFIRMED';
  if (!human.hasMisconception && layer2Pass) {
    epistemicVerdict = 'ROBUST_STRUCTURAL';
  } else if (!human.hasMisconception && !layer2Pass) {
    epistemicVerdict = 'FRAGILE_SURFACE';
  } else if (human.hasMisconception && aiResults.base.structuralMasteryScore > 0.6) {
    epistemicVerdict = 'SUPERFICIALLY_FLUENT';
  } else if (human.hasMisconception && !layer2Pass) {
    epistemicVerdict = 'FRAGILE_SURFACE';
  }

  return {
    itemId: benchmarkItem.id,
    domain: benchmarkItem.domain,
    prompt: benchmarkItem.prompt,
    aiDiagnosis: aiResults.base,
    layerResults: {
      layer0: aiResults.layer0,
      layer1: aiResults.layer1,
      layer2: aiResults.layer2,
    },
    humanExpert: {
      hasMisconception: human.hasMisconception,
      misconceptionName: human.misconceptionName,
      structuralMasteryScore: human.structuralMasteryScore,
    },
    agreementScore: Number(agreementScore.toFixed(3)),
    isConcordant,
    perturbationSurvival: {
      layer0Pass,
      layer1Pass,
      layer2Pass,
      layer2ContrastRecognized,
    },
    epistemicVerdict,
    calibrationScore: Number((agreementScore * (layer2Pass ? 1.0 : 0.7)).toFixed(3)),
  };
}
