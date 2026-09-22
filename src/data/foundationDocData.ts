// Data content for Foundation Document Viewer
// Source: /docs/architecture/intelligence-os-foundation.md

export interface RiskItem {
  no: number;
  title: string;
  impact: string;
  mitigation: string;
}

export interface GlossaryItem {
  term: string;
  def: string;
}

export const RISKS_21: RiskItem[] = [
  {
    no: 1,
    title: 'Reliabilitas Feynman Sensor',
    impact: 'Seluruh learner model bergantung padanya. Diagnosis noise → intervensi salah.',
    mitigation: 'Uji akurasi diagnosis vs penilaian manusia sebelum membangun lapisan lain.',
  },
  {
    no: 2,
    title: 'Debt Risk belum operasional',
    impact: 'Prediksi tampak presisi, sebenarnya tebakan.',
    mitigation: 'Mulai dari Decay × Dependency Centrality pada jalur aktif; perlakukan Uncertainty sebagai interval kepercayaan, bukan pengali.',
  },
  {
    no: 3,
    title: 'Metrik tampak presisi tanpa definisi',
    impact: 'Risiko Goodhart: anak mengoptimalkan dasbor. Curiosity sulit diukur tanpa merusaknya.',
    mitigation: 'Definisi operasional tiap metrik; tandai metrik eksperimental; tampilkan ketidakpastian.',
  },
  {
    no: 4,
    title: 'Capability Stage bisa diam-diam berbasis umur',
    impact: 'Kembali ke ukuran batch lama.',
    mitigation: 'Kalibrasi terhadap graph dan evidence, bukan populasi sekolah.',
  },
  {
    no: 5,
    title: 'Retensi vs. tanpa dark pattern',
    impact: 'Churn tinggi jika tak ada pengait.',
    mitigation: 'Uji apakah desain intrinsik cukup menahan retensi; jangan menyelundupkan mekanisme eksploitatif.',
  },
  {
    no: 6,
    title: 'Belajar mandiri tidak cocok untuk semua anak',
    impact: 'Melebarkan ketimpangan.',
    mitigation: 'Peran orang tua/mentor; desain untuk anak berbagai tingkat motivasi awal.',
  },
  {
    no: 7,
    title: 'Ketimpangan akses',
    impact: 'Sistem memperkuat kesenjangan sebelum mengoreksinya.',
    mitigation: 'Strategi akses dan penetapan harga sejak awal.',
  },
  {
    no: 8,
    title: 'Kepemilikan dan privasi Learner Model',
    impact: 'Profil kognitif seumur hidup seorang anak adalah aset sekaligus risiko privasi terbesar.',
    mitigation: 'Tetapkan pemilik data, kontrol orang tua, hak hapus/ekspor mutlak, audit sebelum data dikumpulkan.',
  },
  {
    no: 9,
    title: 'Etika stealth insertion',
    impact: 'Sistem yang mengarahkan pengalaman anak secara diam-diam bisa menjadi manipulasi tanpa izin.',
    mitigation: 'Transparansi penuh ke orang tua; keterbukaan bertahap ke anak seiring usia.',
  },
  {
    no: 10,
    title: '"Pressure from below" adalah rantai asumsi',
    impact: 'Adopsi tidak terjadi jika terhambat sertifikasi dan gerbang universitas.',
    mitigation: 'Definisikan bukti hasil penalaran yang dapat diverifikasi pihak luar.',
  },
  {
    no: 11,
    title: 'Visi ≠ bukti',
    impact: 'Overinvestasi pada hipotesis.',
    mitigation: 'Validasi bertahap melalui peta jalan tahap demi tahap.',
  },
  {
    no: 12,
    title: 'Scope creep epistemologis',
    impact: 'Perturbation testing dan epistemic-state primitive (6.5) bisa membesar tanpa batas hingga sistem tak pernah selesai untuk pengguna nyata.',
    mitigation: 'Perturbation testing jadi penguat validasi Tahap 2 di roadmap, bukan gerbang tambahan sebelum Tahap 1 dimulai.',
  },
  {
    no: 13,
    title: 'Label epistemik tidak otomatis valid',
    impact: 'Kemampuan mengucapkan "known/believed/hypothesized/unknown" hanya jadi hedging linguistik kosong tanpa kalibrasi nyata.',
    mitigation: 'Wajib uji kalibrasi lintas instance sebelum primitive ini dipakai sebagai ukuran learner model.',
  },
  {
    no: 14,
    title: 'World-Ω menguji rule-following, bukan abduction murni',
    impact: 'Klaim "menguji reasoning tanpa anchor" terlalu kuat dan bisa menyesatkan desain benchmark.',
    mitigation: 'Pisahkan eksplisit: uji belief-revision (World-Ω cocok) vs uji ontology-formation/abduction (butuh metode berbeda, lihat 6.5.4).',
  },
  {
    no: 15,
    title: 'Kriteria evaluasi hipotesis (6.5.4) adalah anchor tingkat-meta, bukan netral',
    impact: 'Minimality dan falsifiability membawa komitmen filsafat ilmu (Occam, Popper) yang bisa saling bertentangan tanpa aturan penyelesaian.',
    mitigation: 'Buat decision rule eksplisit untuk konflik antar-kriteria; dokumentasikan komitmen filosofis yang dipilih, jangan sembunyikan sebagai "netral".',
  },
  {
    no: 16,
    title: 'Kalibrasi epistemic-state butuh N besar, tapi learner model personal punya N kecil dan non-stationary',
    impact: 'Klaim "label terkalibrasi" (6.5.2) tidak bisa diuji secara statistik bermakna pada skala satu anak.',
    mitigation: 'Pakai kalibrasi populasi sebagai prior, atau ukur konsistensi diri jangka panjang (6.5.5) — tunda validasi formal sampai salah satu tersedia.',
  },
  {
    no: 17,
    title: 'Kerangka modal Layer 1 (wujūb/istiḥālah/jawāz, 6.5.6) adalah anchor filosofis yang dideklarasikan, bukan kerangka netral',
    impact: 'Berasal dari tradisi kalām rasionalis; berisiko diperlakukan seolah satu-satunya cara sah membangun lapisan modal.',
    mitigation: 'Selalu nyatakan sebagai komitmen yang dipilih sadar; jangan campur gradasi Layer 1 dengan evidence (Layer 2) atau belief (Layer 3).',
  },
  {
    no: 18,
    title: 'Warrant Pipeline (6.5.7) digambar sebagai rantai linear padahal warrant bersifat non-linear dan defeasible',
    impact: 'Implementasi yang memaksa "mulai ulang dari atas" tiap revisi akan salah memodelkan cara warrant sebenarnya berubah.',
    mitigation: 'Representasikan sebagai graph dengan feedback edges, bukan linked-list satu arah.',
  },
  {
    no: 19,
    title: 'Prinsip "status tidak boleh diwariskan otomatis dari sumber" terlalu kuat jika dipaksa berlaku pada semua proposisi',
    impact: 'Memicu infinite regress operasional — audit penuh untuk setiap klaim, termasuk yang remeh, melumpuhkan sistem secara praktis.',
    mitigation: 'Terapkan default entitlement (status provisional dari keandalan sumber) untuk klaim biasa; jalur warrant penuh hanya dipaksa terbuka saat proposisi dikontes, naik ke status bertaruhan tinggi, atau ada evidence baru.',
  },
  {
    no: 20,
    title: 'Model warrant rantai (naqlī/isnād) dan model warrant konvergensi (replikasi ilmiah) tidak paralel — disamakan bisa salah memodelkan sains',
    impact: 'Rantai melemah dari satu titik lemah; konvergensi menguat dari banyak jalur independen. Skema provenance generik tunggal akan salah merepresentasikan kekuatan bukti ilmiah.',
    mitigation: 'Dukung kedua tipe warrant secara eksplisit berbeda dalam skema data, bukan satu model untuk semua.',
  },
  {
    no: 21,
    title: 'Detail terminologi kalām spesifik belum ditelusuri dari teks primer',
    impact: 'Risiko menempelkan istilah klasik seolah struktur otoritatif ulama/mazhab tertentu padahal belum diverifikasi ke sumber (Umm al-Barahin, dll).',
    mitigation: 'Sebelum detail spesifik dipakai lebih jauh, bedah langsung dari teks primer dan pisahkan tegas mana teks asli vs rekonstruksi Intelligence OS.',
  },
];

export const GLOSSARY_ALL: GlossaryItem[] = [
  { term: 'Intelligence OS', def: 'Sistem operasi personal untuk perkembangan intelektual; lapisan intelektual dari model dua lapis (dengan Social Sandbox).' },
  { term: 'Social Sandbox', def: 'Lingkungan fisik untuk konflik, negosiasi, kepemimpinan, empati, dan kerja tim nyata antar manusia.' },
  { term: 'Knowledge Graph', def: 'Peta konsep, skill, prerequisite, dan rantai penalaran WHY (source of truth kurikulum).' },
  { term: 'Learner Model', def: 'Representasi keadaan belajar seorang anak per node: mastery, retensi, transfer, miskonsepsi.' },
  { term: 'Evidence Log', def: 'Catatan bukti kemampuan, prediksi, eksperimen, dan cara berpikir anak yang tahan audit.' },
  { term: 'Misconception Graph', def: 'Peta cara berpikir keliru yang lazim dan jalur koreksi berbasis counterexample.' },
  { term: 'Feynman Sensor', def: 'Mekanisme diagnosis pemahaman lewat dialog penjelasan Socratic terpandu (sensor, bukan ujian).' },
  { term: 'Epistemic Debt', def: 'Akumulasi celah fondasi yang menjadi bottleneck di materi lanjutan.' },
  { term: 'Critical Epistemic Debt', def: 'Debt pada prerequisite yang berbahaya bagi lintasan belajar yang sedang aktif.' },
  { term: 'Stealth Insertion / Passive Contextual Remediation', def: 'Menyisipkan perbaikan fondasi ke dalam proyek yang menarik tanpa label remedial yang memalukan.' },
  { term: 'Cognitive Bottleneck Prediction', def: 'Memperkirakan node yang akan sulit jika decay pada prasyarat dibiarkan berlanjut.' },
  { term: 'Capability Stage', def: 'Tahap kemampuan per domain berdasarkan evidence, bebas dari pembatasan batch umur.' },
  { term: 'Unbatching Cognition', def: 'Melepas lintasan intelektual dari pengelompokan kaku berdasarkan usia biologis.' },
  { term: 'Pressure from Below', def: 'Perubahan sistem pendidikan yang didorong adopsi organik keluarga, bukan mandat birokrasi atas.' },
  { term: 'Perturbation Testing', def: 'Enam-layer pengujian (Learn → Perturb → Transfer → Contradict → Reconstruct → Verify) untuk membedakan pemahaman struktural dari hafalan/pattern-matching.' },
  { term: 'Epistemic State Primitive', def: 'Empat status keyakinan (Known / Believed / Hypothesized / Unknown) yang harus dinyatakan secara eksplisit dan terkalibrasi, bukan sekadar diucapkan.' },
  { term: 'World-Ω', def: 'Metode uji berbasis dunia-aksioma-buatan untuk menilai rule-following dan belief revision; bukan pengujian abduction murni karena tetap punya source-of-truth lokal.' },
  { term: 'Jalur Knowledge / Jalur Discovery', def: 'Dua alur pengujian terpisah — Knowledge menguji pemahaman struktur yang sudah diberikan (deduksi), Discovery menguji kemampuan membangun struktur dari fenomena mentah (abduksi).' },
  { term: 'Truth-undisclosed (vs truth-absent)', def: 'Prinsip bahwa observasi dalam Open-World Abduction Test tetap dihasilkan oleh proses generatif yang konsisten — hanya tidak diungkap ke sistem yang diuji, bukan benar-benar tanpa ground truth.' },
  { term: 'Meta-anchor', def: 'Anchor pada level kriteria evaluasi (mis. minimality, falsifiability) yang tetap ada meski anchor konten (jawaban benar) dihilangkan.' },
  { term: 'Wujūb / Istiḥālah / Jawāz', def: 'Tiga status modal dari ʿilm al-kalām (niscaya / mustahil / mungkin), dipakai sebagai Layer 1 (gerbang koherensi logis a priori) dalam model tiga-layer status hipotesis — dideklarasikan sebagai anchor filosofis, bukan kerangka netral.' },
  { term: 'Tiga Layer Status (Modal / Epistemik / Belief)', def: 'Pemisahan status "mungkinkah secara logis" (Layer 1, dari akal) dari "apa yang diketahui" (Layer 2, dari evidence) dan "seberapa kuat dipegang" (Layer 3, komitmen sementara agen) — mencegah satu output tunggal mencampur tiga kategori berbeda.' },
  { term: 'Epistemic preservation', def: 'Menahan diri dari memaksa satu hipotesis "menang" ketika evidence belum cukup mendiskriminasi antar-kandidat yang masih sama-sama jawāz.' },
  { term: 'Universal Warrant Pipeline', def: 'Kerangka penyatuan Epistemic Object (6.5.2), Modal Gate (6.5.6 Layer 1), Evaluation Contract (6.5.4), dan Epistemic/Belief State (6.5.6 Layer 2–3) dalam satu graph warrant (ʿaqlī/naqlī → thubūt → dalālah → entailment → scope → status → belief → revision).' },
  { term: 'Warrant rantai vs konvergensi', def: 'Dua tipe warrant berbeda — rantai (mis. isnād/thubūt) melemah dari satu titik lemah transmisi; konvergensi (mis. replikasi ilmiah) menguat dari banyak jalur independen. Tidak boleh disamakan dalam satu skema provenance.' },
  { term: 'Default entitlement', def: 'Prinsip bahwa proposisi biasa mendapat status provisional dari keandalan sumber tanpa audit penuh; jalur warrant lengkap hanya dipaksa terbuka saat proposisi dikontes, naik ke status bertaruhan tinggi, atau menghadapi evidence baru.' },
  { term: 'Scope expansion error', def: 'Kesalahan memperluas proposisi yang valid dalam kondisi tertentu (P dalam scope C) menjadi klaim universal (P selalu berlaku) tanpa warrant tambahan.' },
];

export const PERTURBATION_LAYERS = [
  { layer: 'Layer 0 — Memorization', test: 'Pernah lihat pola persis', example: '"6÷0 tidak terdefinisi" (hafalan definisi)' },
  { layer: 'Layer 1 — Pattern Generalization', test: 'Permukaan berubah, struktur tetap familiar', example: 'Soal serupa dengan angka berbeda (8÷0)' },
  { layer: 'Layer 2 — Semantic Perturbation', test: 'Satu hubungan penting digeser', example: 'Bedakan 6÷0 (no solution) vs 0÷0 (infinitely many solutions)' },
  { layer: 'Layer 3 — Counterfactual Transfer', test: 'Asumsi fundamental diubah', example: 'Bedakan nilai 1/0 vs batas limit lim(x→0⁺) 1/x' },
  { layer: 'Layer 4 — Contradiction Handling', test: 'Dua klaim tampak bertentangan diberikan sekaligus', example: '"1/x→∞ saat x→0⁺" vs "1/0 undefined" — objek matematis apa yang berbeda?' },
  { layer: 'Layer 5 — Reconstruction', test: 'Jelaskan ulang tanpa istilah kunci', example: 'Jelaskan tanpa kata "undefined", "limit", atau "infinity"' },
  { layer: 'Layer Verify', test: 'Instance baru yang belum pernah muncul', example: 'Uji apakah rekonstruksi menghasilkan konsekuensi benar pada kasus baru' },
];

export const THREE_STATUS_LAYERS = [
  {
    layer: 'Layer 1 — Status Modal',
    question: 'Apakah ini mungkin secara logis sama sekali?',
    example: 'Wujūb (niscaya) / Istiḥālah (mustahil) / Jawāz (mungkin)',
    source: 'Akal murni (a priori), independen dari evidence empiris',
  },
  {
    layer: 'Layer 2 — Status Epistemik',
    question: 'Apa yang kita ketahui tentangnya berdasarkan bukti?',
    example: 'Known / Supported / Hypothesis / Unknown / Underdetermined / Contradicted / Revised',
    source: 'Evidence empiris & eksperimen yang terkumpul',
  },
  {
    layer: 'Layer 3 — Belief State',
    question: 'Seberapa kuat hipotesis ini dipegang sementara oleh agen?',
    example: 'Preferred / Plausible / Weak / Suspended, atau derajat numerik kepercayaan',
    source: 'Komitmen operasional sementara agen, revisable kapan saja',
  },
];

export const WARRANT_COMPONENTS = [
  {
    component: 'A. Epistemic Object (6.5.2)',
    content: 'Claim + jalur warrant (ʿaqlī: premise/inference/modal result; naqlī: source/thubūt/dalālah/interpretation) + entailment + scope + status + belief + revision history',
    role: 'Apa yang disimpan dalam database (state & riwayat pembuktian)',
  },
  {
    component: 'B. Modal Gate (6.5.6 Layer 1)',
    content: 'Wujūb / Istiḥālah / Jawāz',
    role: 'Gerbang koherensi logis a priori — biner, bukan gradasi',
  },
  {
    component: 'C. Evaluation Contract (6.5.4)',
    content: 'Kriteria dideklarasikan (minimality, falsifiability, constraint preservation, dst.) + aturan resolusi konflik',
    role: 'Aturan main yang dideklarasikan SEBELUM evaluasi, bukan hasil evaluasi',
  },
  {
    component: 'D. Epistemic + Belief State (6.5.6 Layer 2–3)',
    content: 'Supported / Underdetermined / Contradicted / Unknown + preferred / plausible / suspended...',
    role: 'Hasil evaluasi dan cara agen memegangnya tanpa premature collapse',
  },
];
