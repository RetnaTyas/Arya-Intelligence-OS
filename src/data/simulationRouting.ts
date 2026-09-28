// ============================================================================
// SISTEM ROUTING SIMULASI TERPUSAT (SATU SUMBER KEBENARAN TUNGGAL)
// Menjamin keselarasan deterministik antara Node Graph, LabHub, dan Lab Skenario
// ============================================================================

export type LabId =
  | 'number_line'
  | 'qualitative_balance'
  | 'bar_model'
  | 'part_whole'
  | 'piaget_conservation';

export interface SimulationRoute {
  labId: LabId;
  scenarioIndex: number;
  fit: 'strong' | 'weak';
  rationale: string;
  /** Wajib untuk 'strong': apa yang benar-benar DIVERIFIKASI skenario ini terkait node. */
  verifies?: string;
}

export const LAB_SCENARIO_COUNT: Record<LabId, number> = {
  number_line: 7,
  qualitative_balance: 3,
  bar_model: 1,
  part_whole: 1,
  piaget_conservation: 1,
};

export const SIMULATION_ROUTING: Record<string, SimulationRoute> = {
  // CLUSTER 1: PART-WHOLE & PARTISI ADIL
  'math-frac-01-part-whole': {
    labId: 'part_whole',
    scenarioIndex: 0,
    fit: 'strong',
    rationale: 'Simulasi interaktif langsung untuk partisi kue menjadi bagian-bagian sama besar.',
    verifies: 'Mempartisi kuantitas menjadi bagian-bagian sama besar.',
  },
  'math-frac-02-equal-sharing': {
    labId: 'part_whole',
    scenarioIndex: 0,
    fit: 'strong',
    rationale: 'Simulasi interaktif langsung untuk pembagian adil kuantitas fisik.',
    verifies: 'Membagi objek sama rata tanpa sisa.',
  },
  'math-frac-03-unit-fractions': {
    labId: 'part_whole',
    scenarioIndex: 0,
    fit: 'strong',
    rationale: 'Simulasi interaktif langsung untuk pembentukan fraksi satuan 1/n.',
    verifies: 'Mengidentifikasi 1 bagian dari n partisi sama.',
  },
  'math-frac-04-fraction-of-set': {
    labId: 'part_whole',
    scenarioIndex: 0,
    fit: 'strong',
    rationale: 'Simulasi interaktif langsung untuk pecahan dari himpunan diskrit.',
    verifies: 'Menghitung proporsi subset terhadap total himpunan.',
  },
  'math-frac-05-half-symmetry': {
    labId: 'piaget_conservation',
    scenarioIndex: 0,
    fit: 'strong',
    rationale: 'Simulasi interaktif langsung untuk simetri lipat setengah.',
    verifies: 'Konservasi luas pada belahan simetris.',
  },
  'math-frac-06-folding-geometry': {
    labId: 'piaget_conservation',
    scenarioIndex: 0,
    fit: 'strong',
    rationale: 'Simulasi interaktif langsung untuk geometri lipatan kertas.',
    verifies: 'Konservasi luas setelah pelipatan ganda.',
  },

  // CLUSTER 2: STRUKTUR FRAKSI & GARIS BILANGAN
  'math-frac-07-num-denom-roles': {
    labId: 'number_line',
    scenarioIndex: 4,
    fit: 'weak',
    rationale: 'Analogi spasial titik 1/2; manipulasi garis bilangan belum memisahkan peran pembilang dan penyebut secara terisolasi.',
  },
  'math-frac-08-denominator-inversion': {
    labId: 'number_line',
    scenarioIndex: 4,
    fit: 'weak',
    rationale: 'Analogi partisi spasial; posisi titik di antara 0 dan 1 menunjukkan ukuran interval namun belum membandingkan inversi penyebut ganda.',
  },
  'math-frac-09-numerator-counting': {
    labId: 'number_line',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi pencacahan langkah; lompatan maju mencerminkan penambahan unit namun belum memodelkan pembilang pecahan murni.',
  },
  'math-frac-10-unit-building': {
    labId: 'number_line',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi penyusunan unit; deret lompatan merepresentasikan akumulasi langkah namun dalam domain bilangan bulat.',
  },
  'math-frac-11-fraction-one-whole': {
    labId: 'number_line',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi pencapaian target jarak; lompatan mendarat di 5 satuan bulat, bukan partisi n/n = 1.',
  },
  'math-frac-12-number-line-fractions': {
    labId: 'number_line',
    scenarioIndex: 4,
    fit: 'strong',
    rationale: 'Node tentang titik pecahan di antara dua bilangan bulat pada sumbu riil.',
    verifies: 'Mendarat di 0,5 DAN mengidentifikasi 1/2 = 0,5 (langkah identifikasi).',
  },

  // CLUSTER 3: EKUIVALENSI & PERBANDINGAN PECAHAN
  'math-frac-13-equivalent-visual': {
    labId: 'number_line',
    scenarioIndex: 6,
    fit: 'strong',
    rationale: 'Menunjukkan ekuivalensi koordinat: titik 2.5 setara dengan 5/2 atau 2 1/2 pada sumbu kontinu.',
    verifies: 'Mendarat di 2,5 DAN mengidentifikasi ekuivalensi 5/2 = 2 1/2 = 2,5.',
  },
  'math-frac-14-multiplicative-scaling': {
    labId: 'number_line',
    scenarioIndex: 6,
    fit: 'weak',
    rationale: 'Analogi skala koordinat; titik 2.5 mencerminkan ekuivalensi namun belum memodelkan perkalian faktor k/k secara eksplisit.',
  },
  'math-frac-15-simplifying-fractions': {
    labId: 'number_line',
    scenarioIndex: 6,
    fit: 'weak',
    rationale: 'Analogi koordinat titik 2.5; lab belum memuat reduksi pembilang dan penyebut ke bentuk paling sederhana.',
  },
  'math-frac-16-comparing-same-denom': {
    labId: 'number_line',
    scenarioIndex: 4,
    fit: 'weak',
    rationale: 'Analogi urutan sumbu horizontal; belum menyediakan perbandingan dua pecahan berpenyebut sama berdampingan.',
  },
  'math-frac-17-comparing-same-num': {
    labId: 'number_line',
    scenarioIndex: 4,
    fit: 'weak',
    rationale: 'Analogi perbandingan jarak ke titik nol; belum membandingkan dua pecahan berpembilang sama secara terisolasi.',
  },
  'math-frac-18-benchmark-half': {
    labId: 'number_line',
    scenarioIndex: 4,
    fit: 'strong',
    rationale: 'Misi ini secara presisi menguji patokan tolok ukur setengah (1/2 = 0.5) di antara 0 dan 1.',
    verifies: 'Mendarat tepat di titik tengah 0,5 di antara 0 dan 1 serta memvalidasi nama 1/2.',
  },
  'math-frac-19-common-denominator': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi diagram balok; lab bar model aljabar belum memuat partisi KPK dua penyebut berbeda.',
  },

  // CLUSTER 4: OPERASI PENJUMLAHAN & PENGURANGAN PECAHAN
  'math-frac-20-add-same-denom': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi penggabungan balok visual; alur neraca aljabar belum mengisolasi penjumlahan berpenyebut sama.',
  },
  'math-frac-21-sub-same-denom': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi pengurangan ruas neraca; belum memodelkan pengurangan pecahan penyebut sama secara terpisah.',
  },
  'math-frac-22-add-diff-denom': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi penyeimbangan balok; belum memuat konversi penyebut berbeda sebelum penjumlahan.',
  },
  'math-frac-23-sub-diff-denom': {
    labId: 'number_line',
    scenarioIndex: 2,
    fit: 'weak',
    rationale: 'Analogi arah pengurangan mundur (8 - 3); menggunakan bilangan bulat, bukan operasi pecahan beda penyebut.',
  },
  'math-frac-24-improper-fractions': {
    labId: 'number_line',
    scenarioIndex: 5,
    fit: 'strong',
    rationale: 'Lompatan melewati angka 1 (menuju 1.5 atau 3/2) mendemonstrasikan pecahan tak murni > 1.',
    verifies: 'Mendarat di 1,5 melampaui 1 DAN mengidentifikasi 3/2 sebagai representasi pecahan tidak murni.',
  },
  'math-frac-25-mixed-numbers': {
    labId: 'number_line',
    scenarioIndex: 5,
    fit: 'strong',
    rationale: 'Posisi 1 1/2 (1 utuh + 1/2 = 1.5) membuktikan dekomposisi bilangan campuran pada garis spasial.',
    verifies: 'Mendarat di 1,5 DAN mengidentifikasi 1 1/2 sebagai bentuk bilangan campuran.',
  },
  'math-frac-26-mixed-operations': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi dekomposisi kuantitas balok; belum memodelkan operasi campuran pecahan secara terstruktur.',
  },

  // CLUSTER 5: PERKALIAN & PEMBAGIAN PECAHAN
  'math-frac-27-whole-times-fraction': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi kelipatan balok x; lab aljabar belum memodelkan perkalian bilangan bulat dengan pecahan terisolasi.',
  },
  'math-frac-28-fraction-of-quantity': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi pembagian balok kuantitas; belum memuat pengambilan porsi fraksional diskrit.',
  },
  'math-frac-29-fraction-times-fraction': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi penskalaan luas; alur neraca aljabar 2x+4=14 belum memodelkan irisan kisi dua dimensi (a/b × c/d).',
  },
  'math-frac-30-multiplication-scaling': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi pemanjangan balok; belum menguji efek penyusutan perkalian pecahan murni < 1.',
  },
  'math-frac-31-division-measurement': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi pembagian segmen balok; belum memodelkan pengukuran berapa kali 1/b termuat dalam a.',
  },
  'math-frac-32-division-partition': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi partisi ruas neraca; belum memodelkan pembagian partitif fraksional terisolasi.',
  },
  'math-frac-33-reciprocal-inverse': {
    labId: 'number_line',
    scenarioIndex: 3,
    fit: 'weak',
    rationale: 'Analogi keterbalikan; lompatan maju/mundur belum memodelkan balikan perkalian (reciprocal) pecahan.',
  },

  // CLUSTER 6: DESIMAL & PERSENTASE
  'math-dec-34-tenths-hundredths': {
    labId: 'number_line',
    scenarioIndex: 4,
    fit: 'weak',
    rationale: 'Analogi segmen garis [0, 1]; lab saat ini menguji 0.5 dan belum menyediakan partisi mikro perseratusan.',
  },
  'math-dec-35-fraction-decimal-link': {
    labId: 'number_line',
    scenarioIndex: 4,
    fit: 'strong',
    rationale: 'Menghubungkan 1/2 pecahan dengan 0.5 desimal di titik koordinat yang identik.',
    verifies: 'Mendarat di 0,5 DAN mengidentifikasi 1/2 = 0,5.',
  },
  'math-dec-36-comparing-decimals': {
    labId: 'number_line',
    scenarioIndex: 6,
    fit: 'weak',
    rationale: 'Analogi posisi desimal tunggal (2.5); lab belum memuat antarmuka perbandingan dua nilai desimal berdampingan.',
  },
  'math-pct-37-percentage-per-hundred': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi representasi balok kuantitas; lab bar model belum memuat kisi perseratusan skala penuh.',
  },
  'math-pct-38-percent-frac-dec-triangle': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi ekuivalensi representasi; lab bar model aljabar belum memuat konversi segitiga persentase-pecahan-desimal.',
  },
  'math-pct-39-percent-of-number': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi proporsi kuantitas balok; lab belum menyediakan kalkulasi persentase dari nilai acuan.',
  },

  // CLUSTER 7: RASIO & PENALARAN PROPORSIONAL
  'math-rat-40-ratio-part-to-part': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi perbandingan dua balok ruas; belum memodelkan notasi perbandingan rasio bagian-ke-bagian a:b.',
  },
  'math-rat-41-multiplicative-thinking': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi penskalaan ruas aljabar; belum membedakan penalaran aditif vs multiplikatif secara terisolasi.',
  },
  'math-rat-42-ratio-tables': {
    labId: 'number_line',
    scenarioIndex: 3,
    fit: 'weak',
    rationale: 'Analogi kelipatan; lompatan +2 berulang melatih intuisi kelipatan dasar, bukan tabel rasio formal.',
  },
  'math-rat-43-unit-rate': {
    labId: 'number_line',
    scenarioIndex: 3,
    fit: 'weak',
    rationale: 'Analogi laju kelipatan; lab melatih langkah seragam namun belum mengisolasi variabel waktu/satuan.',
  },
  'math-rat-44-proportional-reasoning': {
    labId: 'number_line',
    scenarioIndex: 3,
    fit: 'weak',
    rationale: 'Analogi kelipatan konstan; penalaran proporsional kompleks disederhanakan ke deret lompatan +2.',
  },
  'math-rat-45-constant-proportionality': {
    labId: 'qualitative_balance',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi kesetimbangan dasar; melatih keseimbangan massa namun belum memodelkan konstanta proporsionalitas formal k pada y = kx.',
  },

  // CLUSTER 8: TRANSISI ALJABAR & PERSAMAAN LINEAR
  'math-alg-46-relational-equals': {
    labId: 'qualitative_balance',
    scenarioIndex: 0,
    fit: 'strong',
    rationale: 'Tantangan 1 (Kiri = Kanan) adalah representasi langsung tanda sama dengan sebagai neraca relasional seimbang.',
    verifies: 'Menyeimbangkan bobot lengan kiri dan kanan pada neraca timbangan.',
  },
  'math-alg-47-bar-model-algebra': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Lab bar model saat ini memodelkan persamaan 2x+4=14 formal, bukan eksplorasi bebas diagram balok aljabar murni.',
  },
  'math-alg-48-balance-scale-unknown': {
    labId: 'qualitative_balance',
    scenarioIndex: 2,
    fit: 'strong',
    rationale: 'Tantangan 3 menguji nilai tak diketahui x (anak beruang) pada neraca timbangan.',
    verifies: 'Menyeimbangkan beban x (anak beruang bobot 3) dengan kombinasi balok 2 + apel 1.',
  },
  'math-alg-49-one-step-addition': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi aljabar; lab bar model aljabar menyajikan persamaan 2 langkah (2x+4=14) bukan persamaan satu langkah terisolasi.',
  },
  'math-alg-50-one-step-multiplication': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'weak',
    rationale: 'Analogi aljabar; lab bar model memodelkan 2x+4=14 bukan perkalian koefisien satu langkah terisolasi.',
  },
  'math-alg-51-two-step-linear': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'strong',
    rationale: 'Lab secara presisi memodelkan reduksi aljabar dua langkah seimbang: 2x + 4 = 14 menjadi x = 5.',
    verifies: 'Menyelesaikan reduksi seimbang 2x+4=14 menjadi x=5.',
  },
  'math-alg-52-distributive-equations': {
    labId: 'bar_model',
    scenarioIndex: 0,
    fit: 'strong',
    rationale: 'Lab memodelkan transformasi struktur kesetaraan aljabar dua ruas.',
    verifies: 'Menyelesaikan transformasi reduksi aljabar neraca.',
  },
};

export const alignmentOf = (r: SimulationRoute): 'direct' | 'analogy' =>
  r.fit === 'strong' ? 'direct' : 'analogy';

export const getRoute = (nodeId?: string, labId?: LabId): SimulationRoute | undefined => {
  const r = nodeId ? SIMULATION_ROUTING[nodeId] : undefined;
  return r && (!labId || r.labId === labId) ? r : undefined;
};
