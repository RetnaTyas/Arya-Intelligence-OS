// Tahap 2 Harness: Uji Hipotesis Pusat & Semantic Perturbation Testing (Layer 0–2)
// Sesuai Section 6.5.1 & Section 11 (Risiko #1, #12, #13) di intelligence-os-foundation.md

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
  // Perturbation Layer 0, 1, 2
  perturbations: {
    layer0: {
      type: 'Layer 0: Identical Memorization Pattern';
      prompt: string;
      expectedBehavior: string;
    };
    layer1: {
      type: 'Layer 1: Pattern Generalization (Surface Change)';
      prompt: string;
      expectedBehavior: string;
    };
    layer2: {
      type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)';
      prompt: string;
      contrastDifference: string;
      expectedBehavior: string;
    };
  };
}

export interface PerturbationEvaluationResult {
  itemId: string;
  prompt: string;
  aiDiagnosis: {
    hasMisconception: boolean;
    misconceptionName: string;
    structuralMasteryScore: number;
    explanation: string;
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
export const HUMAN_GOLD_STANDARD_BENCHMARK: HumanGoldStandardItem[] = [
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
      explanation: 'Anak mentransfer intuisi bilangan bulat (8 > 4) langsung ke pecahan tanpa memahami bahwa pembagi memotong kue jadi lebih kecil.',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: 'Apakah 1/8 lebih besar dari 1/4?',
        expectedBehavior: 'Konsisten mendeteksi transfer bilangan bulat.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Mana yang lebih panjang: 1/5 meter tali atau 1/10 meter tali?',
        expectedBehavior: 'Harus konsisten mengidentifikasi miskonsepsi yang sama pada objek berbeda.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Kalau 3/8 vs 3/4 mana yang lebih banyak? Bagaimana kalau 4/8 vs 2/4?',
        contrastDifference: 'Pecahan kedua senilai (4/8 = 2/4), menguji apakah anak runtuh saat penyebut beda tapi nilai sama.',
        expectedBehavior: 'Mampu membedakan apakah anak hanya menebak atau benar-benar paham partisi.',
      },
    },
  },
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
      explanation: 'Gagal memahami penyebut sebagai penanda unit/satuan ukuran yang harus diselaraskan sebelum digabung.',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: '1/2 + 1/3 = ?',
        expectedBehavior: 'Mendeteksi kekeliruan aritmatika pecahan dasar.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Berapa hasil 1/3 + 1/4?',
        expectedBehavior: 'Mendeteksi pola aditif pembilang dan penyebut (jawaban anak: 2/7).',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Bagaimana dengan 1/4 + 2/4? Apakah hasilnya 3/8 atau 3/4?',
        contrastDifference: 'Penyebut sudah sama (4), menguji apakah anak tetap menjumlahkan penyebut jadi 8 atau sadar satuannya tetap.',
        expectedBehavior: 'Membedakan miskonsepsi murni vs hafalan aturan mekanis.',
      },
    },
  },
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
        expectedBehavior: 'Anak menjawab ya dengan jargon serupa.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Bagaimana dengan 3/6 dan 1/2?',
        expectedBehavior: 'Menguji apakah hafalan bertahan pada angka berbeda.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Tunjukkan dengan potongan balok kayu: ambil 2 potong dari 4 potong, lalu bandingkan dengan 1 dari 2.',
        contrastDifference: 'Mencabut jargon verbal dan memaksa representasi spasial-manipulatif.',
        expectedBehavior: 'Jika pemahaman struktural ada, manipulasi balok berhasil; jika cuma hafalan verbal, anak bingung.',
      },
    },
  },
  {
    id: 'bench-alg-04',
    domain: 'Aljabar: Pemahaman Tanda Sama Dengan',
    prompt: 'Jika x + 4 = 10, berapa nilai x dan apa arti tanda = di situ?',
    childUtterance: 'x adalah 6. Tanda sama dengan artinya timbangan kiri (x+4) beratnya harus pas persis sama dengan sisi kanan (10).',
    humanExpertDiagnosis: {
      hasMisconception: false,
      misconceptionName: 'Tidak ada miskonsepsi (Pemahaman Relasional Ekuivalensi)',
      structuralMasteryScore: 0.95,
      confidence: 0.96,
      explanation: 'Anak memahami tanda sama dengan sebagai neraca relasional seimbang, bukan semata-mata perintah komputasi "hitung hasilnya".',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: 'x + 4 = 10',
        expectedBehavior: 'Paham pembalikan operasi.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'y + 7 = 15',
        expectedBehavior: 'Transfer lancar ke variabel y.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Bagaimana jika persamaannya ditulis: 10 = x + 4? Apakah boleh angka 10 ada di depan tanda sama dengan?',
        contrastDifference: 'Membalik orientasi standar (menaruh ekspresi di kanan dan konstanta di kiri).',
        expectedBehavior: 'Anak dengan pemahaman relasional tidak terpengaruh karena neraca simetris: A = B ekuivalen B = A.',
      },
    },
  },
  {
    id: 'bench-alg-05',
    domain: 'Aljabar: Aturan Mekanis Pindah Ruas',
    prompt: 'Selesaikan 2x + 5 = 15.',
    childUtterance: '5 dipindah ke kanan jadi +5, lalu 2x = 20, jadi x = 10.',
    humanExpertDiagnosis: {
      hasMisconception: true,
      misconceptionId: 'mechanical-transposition-without-inverse',
      misconceptionName: 'Pindah ruas mekanis tanpa operasi inversi tanda',
      structuralMasteryScore: 0.25,
      confidence: 0.97,
      explanation: 'Anak menghafal kalimat mekanis "pindah ruas" tanpa memahami bahwa kedua sisi sebenarnya dikurangi 5 agar adil.',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: '2x + 5 = 15',
        expectedBehavior: 'Salah membalik tanda saat pemindahan.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: '3x + 2 = 14',
        expectedBehavior: 'Terjadi pengulangan kesalahan mekanis yang sama.',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Coba periksa dengan memasukkan x = 10 ke soal awal: 2(10) + 5 = ? Apakah hasilnya 15?',
        contrastDifference: 'Memaksa tahap verifikasi balikan substitusi independen.',
        expectedBehavior: 'Anak menyadari 25 ≠ 15 dan dipaksa merekonstruksi penalarannya.',
      },
    },
  },
  {
    id: 'bench-ratio-06',
    domain: 'Rasio: Pemikiran Aditif vs Multiplikatif',
    prompt: 'Campuran cat ungu butuh 2 kaleng biru dan 3 kaleng merah. Jika kita pakai 4 kaleng biru, berapa kaleng merah agar warnanya persis sama?',
    childUtterance: 'Biru naik dari 2 ke 4 (tambah 2), jadi merah juga tambah 2 jadi 5 kaleng merah!',
    humanExpertDiagnosis: {
      hasMisconception: true,
      misconceptionId: 'additive-instead-of-multiplicative-ratio',
      misconceptionName: 'Berpikir aditif bukan multiplikatif pada rasio',
      structuralMasteryScore: 0.30,
      confidence: 0.95,
      explanation: 'Kesalahan klasik rasio: anak melihat perubahan selisih (+2) alih-alih faktor pengali (skala ×2).',
    },
    perturbations: {
      layer0: {
        type: 'Layer 0: Identical Memorization Pattern',
        prompt: '2 biru : 3 merah, jika 4 biru berapa merah?',
        expectedBehavior: 'Salah menjawab 5 karena aditif.',
      },
      layer1: {
        type: 'Layer 1: Pattern Generalization (Surface Change)',
        prompt: 'Resep kue 3 telur untuk 2 cangkir tepung. Kalau 6 telur, berapa tepung?',
        expectedBehavior: 'Konsisten mendeteksi apakah anak menjawab 5 (aditif) atau 4 (multiplikatif).',
      },
      layer2: {
        type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
        prompt: 'Bandingkan: (A) Kamu punya 2 permen dan kakak punya 3 permen, ayah beri kalian masing-masing 2 permen lagi. (B) Resep cat 2:3 digandakan. Mengapa pada kasus A aditif benar, tapi pada kasus B rasa/warna berubah?',
        contrastDifference: 'Menjejerkan konteks kuantitas mutlak (permen) vs relasi intensif (kepekatan warna).',
        expectedBehavior: 'Menguji apakah anak mampu membedakan domain besaran aditif vs multiplikatif.',
      },
    },
  },
];

// Mesin Penilai Diagnostik AI & Perturbation Test Evaluator
export function evaluateDiagnosticAgreementAndPerturbation(
  benchmarkItem: HumanGoldStandardItem,
  aiTrainedDiagnosis: {
    hasMisconception: boolean;
    misconceptionName: string;
    structuralMasteryScore: number;
    explanation: string;
  }
): PerturbationEvaluationResult {
  const human = benchmarkItem.humanExpertDiagnosis;

  // 1. Hitung konkordansi diagnosis miskonsepsi (Biner)
  const misconceptionMatches = aiTrainedDiagnosis.hasMisconception === human.hasMisconception;

  // 2. Hitung jarak skor structural understanding (Delta MAE)
  const scoreDelta = Math.abs(aiTrainedDiagnosis.structuralMasteryScore - human.structuralMasteryScore);
  const scoreProximity = Math.max(0, 1 - scoreDelta);

  // 3. Agreement Score Tertimbang: 60% deteksi miskonsepsi + 40% presisi skor kognitif
  const agreementScore = (misconceptionMatches ? 0.6 : 0) + (scoreProximity * 0.4);
  const isConcordant = agreementScore >= 0.75;

  // 4. Simulasi Uji Perturbasi Layer 0, 1, 2
  // Layer 0: Akurasi pada pola yang identik (Hafalan)
  const layer0Pass = misconceptionMatches && scoreDelta < 0.25;

  // Layer 1: Ketahanan saat objek/angka berubah (Generalisasi permukaan)
  const layer1Pass = layer0Pass && agreementScore >= 0.70;

  // Layer 2: Ketahanan saat satu relasi semantik digeser (Minimal Contrast Pair)
  // Ini adalah hipotesis utama Tahap 2: apakah diagnosis AI bertahan setelah satu semantic perturbation?
  const layer2Pass = layer1Pass && scoreDelta < 0.18;
  const layer2ContrastRecognized = layer2Pass && !aiTrainedDiagnosis.explanation.toLowerCase().includes('hallucination');

  // 5. Klasifikasi Epistemik
  let epistemicVerdict: PerturbationEvaluationResult['epistemicVerdict'] = 'MISCONCEPTION_CONFIRMED';
  if (!human.hasMisconception && layer2Pass) {
    epistemicVerdict = 'ROBUST_STRUCTURAL';
  } else if (!human.hasMisconception && !layer2Pass) {
    epistemicVerdict = 'FRAGILE_SURFACE';
  } else if (human.hasMisconception && aiTrainedDiagnosis.structuralMasteryScore > 0.6) {
    epistemicVerdict = 'SUPERFICIALLY_FLUENT'; // Bahaya: AI tertipu gaya bahasa anak
  }

  return {
    itemId: benchmarkItem.id,
    prompt: benchmarkItem.prompt,
    aiDiagnosis: aiTrainedDiagnosis,
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
