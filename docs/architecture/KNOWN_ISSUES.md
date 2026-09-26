# Masalah yang Diketahui (Known Issues) & Temuan Audit Epistemik

> **Status Dokumen**: Resmi Dicatat  
> **Kategori Audit**: Validasi Empiris Tahap 2, Kalibrasi Sensor AI, dan Integritas Arsitektur  
> **Referensi Fondasi**: `intelligence-os-foundation.md` (Bagian 6.5.1, 6.5.2, Bagian 11 Risiko #1 & #12)

---

## 1. Ringkasan Eksekutif

Audit independen terhadap implementasi kode menemukan kesenjangan struktural antara klaim arsitektur (khususnya *Tahap 2 Peta Jalan: Validasi Hipotesis Pusat & Ketahanan Semantic Perturbation*) dengan eksekusi kode aktual. Beberapa komponen pembuktian sebelumnya beroperasi sebagai *epistemic theater* (simulasi hasil tetap di sisi klien) dan bukan pemanggilan inferensi sensorik nyata.

**Pembaruan audit — fokus penutupan Gerbang Tahap 1 & Tahap 2.** Re-audit lanjutan (lihat Bagian 3, checklist kepatuhan) mengonfirmasi Temuan 1–5 di bawah sudah tuntas diremediasi pada level implementasi. Namun re-audit ini juga menemukan **dua celah baru yang belum tercatat sebelumnya** (Temuan 6 & 7): pelanggaran disiplin urutan Tahap 1 (ekspansi domain lab di luar domain aktif tanpa penandaan *out-of-sequence*) dan cakupan benchmark Tahap 2 yang belum merepresentasikan skala penuh domain 52-node. Kedua celah ini berarti **Tahap 1 dan Tahap 2 belum bisa dinyatakan tuntas** menurut definisi gerbangnya sendiri di `intelligence-os-foundation.md` Bagian 12, meskipun infrastruktur teknisnya sudah solid dan non-mock.

---

## 2. Rincian Temuan Kritis & Status Remediasi

### 🔴 Temuan 1: Test Harness Hipotesis Pusat (`CentralHypothesisTestHarness.tsx`) Sempat Bersifat Teatrikal
* **Kondisi Awal**: Pada versi draf awal, variabel `aiDiagnosis` disalin langsung dari `humanExpertDiagnosis` dengan delta statis manual ($\pm 0.03$) dan jeda waktu `setTimeout`. Hal ini menjamin skor konkordansi selalu tinggi secara artifisial tanpa menguji sensor apa pun.
* **Akar Masalah**: Pengerjaan UI mendahului sambungan endpoint benchmark diagnostik ke server backend LLM.
* **Tindakan Perbaikan**:
  1. Dibuat endpoint backend nyata `POST /api/benchmark/central-hypothesis` yang memproses dialog pembelajar melalui instruksi penilai kognitif model AI secara independen per probe (Base, Layer 0, Layer 1, Layer 2).
  2. Komponen `CentralHypothesisTestHarness.tsx` dihubungkan ke endpoint ini dengan mode pengujian nyata (*Live AI Assessment*) dan fallback teruji jika API key tidak tersedia.
  3. Menyediakan kontrol kalibrasi interaktif untuk membedakan mode **Evaluasi Live AI** vs **Ground Truth Deterministic Calibration** (bobot pakar manusia vs sensor AI).

---

### 🔴 Temuan 2: Rangkaian Kalibrasi Feynman (`FeynmanCalibrationSuite.tsx`) Tidak Memanggil Inferensi Nyata
* **Kondisi Awal**: Lima kasus `BENCHMARK_CASES` memiliki diagnosis AI statis yang ditulis tangan bersamaan dengan diagnosis manusia. Tombol "Jalankan Uji Benchmark" hanya menjalankan timeout 700ms tanpa menghitung ulang data dari model.
* **Akar Masalah**: Komponen dibuat sebagai visualisasi statis desain sebelum integrasi API endpoint Feynman sensor di server selesai.
* **Tindakan Perbaikan**:
  1. Dibuat endpoint batch `POST /api/benchmark/feynman-suite` di `server.ts` dan `functions/api/benchmark/feynman-suite.ts`.
  2. Tombol "Jalankan Uji Benchmark" kini mengirim kelima ujaran anak (*child utterances*) ke endpoint Feynman Sensor nyata.
  3. Skor keselarasan (*Human-AI Concordance*) dihitung secara dinamis dari hasil inferensi model berbanding standar emas pakar.

---

### 🔴 Temuan 3: Konfigurasi Model AI & Integrasi Cloudflare Pages Functions Workers AI Binding
* **Kondisi Awal**: Pada beberapa draf pemanggilan server dicantumkan penamaan model yang tidak konsisten dengan katalog runtime resmi `@google/genai`. Selain itu, penyebaran ke Cloudflare Pages memerlukan dukungan binding native Pages Functions.
* **Akar Masalah**: Penulisan manual string model tanpa menyelaraskan dengan panduan SDK `@google/genai` dan arsitektur target Cloudflare Pages Functions.
* **Tindakan Perbaikan**:
  1. **Pages Functions Workers AI Binding**: Mengonfigurasi dan mengimplementasikan endpoint Pages Functions native di folder `/functions/api/*` dengan binding spesifik:
     - **Type**: `Workers AI`
     - **Name**: `AiOS AI` (diakses via `env['AiOS AI']` atau `env.AI`)
     - **Value**: `Workers AI Catalog`
     - **Model Default**: `@cf/qwen/qwen3-30b-a3b-fp8` (Qwen 3 30B FP8)
  2. **Arsitektur Dual-Engine Resilien**:
     - Di Cloudflare Pages: Eksekusi langsung melalui Pages Functions Workers AI binding (`env['AiOS AI'].run(...)`).
     - Di Node.js / Container: Menjalankan REST gateway Workers AI via `CLOUDFLARE_ACCOUNT_ID` & `CLOUDFLARE_API_TOKEN`, dengan secondary fallback ke `gemini-2.5-flash`, atau fallback heuristik deterministik lokal.
  3. Seluruh endpoint penilai Feynman, Central Hypothesis Benchmark, dan Socratic Tutor kini memiliki penanganan status error transparan dan memberitahukan kepada klien apakah respons berasal dari `cloudflare-pages-binding (AiOS AI: @cf/qwen/qwen3-30b-a3b-fp8)`, `cloudflare-workers-ai`, `gemini-2.5-flash`, atau `deterministic-local-lookup` / `deterministic-local-heuristic`.
  4. Endpoint `/api/health` secara akurat mendeklarasikan arsitektur dual-engine nyata (`primaryProvider: 'cloudflare-workers-ai'`, `secondaryProvider: 'gemini-2.5-flash'`, `deterministicLocalFallback: true`).

---

### 🟢 Temuan 4: Mislabeling Sumber Diagnosis pada Jalur Fallback (*Tuntas Diremediasi*)
* **Status**: 🟢 **Tuntas Diremediasi**
* **Kondisi Awal**: Ketika inferensi model gagal mem-parse format JSON atau binding tidak merespons, backend sebelumnya mengeksekusi fallback lokal (`generateLocalProbeDiagnosis` / `generateLocalFeynmanDiagnosis`) namun respons berisiko tetap distempel dengan label penyedia AI (`cloudflare-workers-ai`). Akibatnya, badge UI "CLOUDFLARE WORKERS AI" dapat tampil di layar pendamping padahal skor di baliknya berasal dari lookup table heuristik hardcoded. Selain itu, `server.ts` sebelumnya melempar error 500 pada kegagalan Feynman suite sementara Cloudflare Pages mengembalikan HTTP 200.
* **Akar Masalah**: Ketidaksinkronan propagasi flag `usedFallback` per-probe dan per-kasus dari backend ke UI, serta ketiadaan standardisasi kontrak error antar lingkungan Node.js dan Pages Functions.
* **Tindakan Perbaikan yang Diselesaikan**:
  1. **Propagasi Metrik Provenance Per-Probe**: Seluruh endpoint diagnostik (`/api/benchmark/central-hypothesis`, `/api/benchmark/feynman-suite`, `/api/diagnose/feynman`) di `server.ts` dan `functions/api/*` kini memancarkan metadata eksplisit: `usedFallback: boolean`, `source: string`, dan `fallbackReason?: string` baik pada level akar respons maupun pada setiap objek probe/kasus individual (`item.base`, `item.layer0`, `item.layer1`, `item.layer2`, `evaluations[i]`).
  2. **Harmonisasi Dual-Engine**: `server.ts` kini mengadopsi arsitektur multi-tier yang identik dan berjenjang (Workers AI -> Gemini 2.5 Flash -> Fallback Heuristik Lokal), menghapus disparitas error 500 dan memastikan seluruh lingkungan runtime berperilaku konsisten.
  3. **Transparansi UI Tanpa Kebohongan (Zero-Lie Badges)**:
     - Header `CentralHypothesisTestHarness` dan `FeynmanCalibrationSuite` kini menampilkan badge jujur: `CLOUDFLARE WORKERS AI`, `GEMINI 2.5 FLASH`, `DETERMINISTIC LOCAL FALLBACK (HEURISTIC)`, atau `HYBRID INFERENCE (X AI / Y FALLBACK)`.
     - Setiap kartu kasus dan setiap baris probe pada Layer 0–2 memuat tag visual eksplisit `[FALLBACK]` (amber) vs `[AI]` (cyan/emerald) sehingga orang tua dan auditor dapat langsung memeriksa apakah skor tertentu berasal dari inferensi model atau tabel kalibrasi lokal.
     - Mode Custom Live Sandbox menampilkan catatan transparansi jika evaluasi dijalankan melalui heuristik offline.

---

### 🟢 Temuan 5: Pelanggaran Gerbang Urutan Tahap 1 — Perluasan Domain Mendahului Saturasi (*Tuntas Diremediasi*)
* **Status**: 🟢 **Tuntas Diremediasi**
* **Kondisi Awal**: Graf pengetahuan sebelumnya membagi fokus ke 4 domain umum sebelum satu domain sempit mencapai saturasi (≥50 node), sehingga melompati gerbang keluar Tahap 1 dokumen fondasi. Selain itu, 52 node domain sempit sempat terisolasi di file terpisah tanpa terintegrasi ke runtime penjelajahan graf utama.
* **Tindakan Perbaikan yang Diselesaikan**:
  1. **Ekspansi Domain Aktif Matematika (Tahap 1 Gate ≥50 Node)**: `src/data/narrowMathDomain.ts` telah diperkaya menjadi **52 node vertikal komprehensif** (dari *Part-Whole*, *Pecahan Satuan*, *Ekuivalensi*, *Operasi Penjumlahan/Pengurangan*, *Penskalaan Multiplikatif*, *Desimal & Persen*, *Rasio & Proporsi*, hingga *Persamaan Linear Dua Ruas*). Seluruh node terbukti membentuk DAG murni tanpa siklus, memuat 4 tingkat representasi Bruner, dan rantai alasan mendasar (*Why-Chain*).
  2. **Integrasi Penuh Runtime ke Knowledge Graph (Total 86 Node Otentik)**: `INITIAL_KNOWLEDGE_GRAPH` di `src/data/initialKnowledgeGraph.ts` kini menggabungkan `BASE_KNOWLEDGE_GRAPH` (34 node) dan `NARROW_DOMAIN_MATH_NODES` (52 node) secara permanen (total **86 node unik**). State aplikasi di `src/App.tsx` memuat graf 86 node ini secara langsung ke `knowledgeNodes`.
  3. **Penjelajahan Lengkap di UI (`KnowledgeGraphExplorer`)**: Seluruh 86 node dapat diakses tanpa ada node yang hilang:
     - Lapis 1 ("Sekarang"): 3 kartu rekomendasi teratas dari algoritma antrean deterministik.
     - Lapis 2 ("Bisa Kamu Coba Juga"): Sisa antrean ditambah seluruh node terbuka yang belum dikuasai (fallback in-progress agar tidak lenyap).
     - Lapis 3 ("Sudah Kamu Kuasai"): Node yang telah tervalidasi dengan rata-rata mastery ≥ 0.6.
     - Batasan 1-Hop: Node terkunci yang hanya membutuhkan tepat 1 prasyarat lagi untuk terbuka.
  4. **Pengayaan Benchmark Tahap 2 (20 Kasus Emas / 80 Probe Independen)**: `HUMAN_GOLD_STANDARD_BENCHMARK` di `src/engine/centralHypothesisBenchmark.ts` diperkaya dari 12 kasus menjadi **20 kasus ground truth standar emas** (total 80 probe diagnostik independen meliputi Base, Layer 0 Identical, Layer 1 Surface Change, dan Layer 2 Minimal Contrast Pair).
  5. **Pemuatan Awal Bersih (Clean Slate Default)**: Inisialisasi IndexedDB kini memuat profil kosong secara default agar pengguna baru tidak dibebani dataset contoh yang harus dihapus manual. Opsi pemulihan sampel demo tetap tersedia secara eksplisit melalui tombol di antarmuka orang tua.
  6. **Verifikasi Test Suite**: Pengujian `tests/epistemic-os-tester.ts` memvalidasi integritas 86 node (keterikatan prasyarat 100% valid, DAG bebas siklus, kelengkapan WhyChain, pemenuhan gerbang ≥50 node sempit) dan kelulusan evaluasi perturbation Layer 0–2 (17/17 lulus 100%).

---

### 🔴 Temuan 6: Modul Lab di Luar Domain Aktif Sudah Dibangun & Aktif Tanpa Penandaan *Out-of-Sequence* (Pelanggaran Disiplin Urutan Tahap 1)
* **Status**: 🔴 **Belum Diremediasi** (item terbuka)
* **Kondisi**: `intelligence-os-foundation.md` Bagian 12 mensyaratkan secara eksplisit: *"jangan tambah domain baru (fisika, komputasi, dst.) atau lab baru di luar domain aktif sampai domain aktif mencapai ≥50 node dan lolos uji Tahap 2 ... Modul lab di luar domain aktif yang sudah terlanjur dibangun boleh tetap ada sebagai eksperimen paralel, tapi harus ditandai eksplisit sebagai out-of-sequence di KNOWN_ISSUES.md, bukan diam-diam dianggap bagian dari jalur utama."* Domain aktif Tahap 1 adalah matematika sempit (pecahan → persamaan linear, `narrowMathDomain.ts`). Namun `src/components/labs/LabHub.tsx` mengimpor dan merender aktif modul-modul berikut, yang berada di luar domain itu:
  - **Fisika**: `BuoyancyLab`, `DensityMassLab`, `EnergyConservationLab`, `QualitativeBalanceLab`
  - **Komputasi**: `BinarySearchComplexityLab`, `ComputationalAlgorithmLab`
  - **Psikologi perkembangan / Piagetian**: `ObjectPermanenceLab`, `PiagetConservationLab`
  - **Domain berdekatan tapi di luar cakupan gerbang ("pecahan → persamaan linear")**: `CausalLogicLab`, `CalculusRateLab`
  Modul-modul ini bukan kode mati — semua di-*import* dan dipanggil aktif di `LabHub.tsx`, sehingga bisa diakses pengguna sebagai bagian dari alur utama, bukan sebagai eksperimen yang jelas dipisahkan.
* **Akar Masalah**: Modul lab dibangun paralel dengan pembangunan domain matematika sempit, tanpa gerbang teknis atau dokumentasi yang mencegah/mencatat ekspansi domain sebelum Tahap 1 dinyatakan tuntas. Pelanggaran bersifat diam-diam (silent), persis pola yang diperingatkan Risiko #12 di `intelligence-os-foundation.md` Bagian 11 (scope creep epistemologis) — dalam hal ini bukan pada riset epistemik, tapi pada jumlah domain aktif.
* **Dampak**: Tanpa penandaan eksplisit, status "Tahap 1 selesai" berisiko diklaim padahal disiplin urutan roadmap sudah dilanggar; investasi rekayasa berisiko tersebar ke banyak domain sebelum satu domain benar-benar tervalidasi di Tahap 2.
* **Tindakan Perbaikan yang Diperlukan (belum dilaksanakan)**:
  1. Tandai seluruh modul di atas sebagai *out-of-sequence experiment* — baik di dokumen ini maupun (disarankan) lewat penanda eksplisit di kode (mis. komentar header atau flag `isOutOfSequence: true` pada entri lab di `LabHub.tsx`) agar status ini tidak bergantung hanya pada dokumentasi yang bisa basi.
  2. Putuskan secara sadar salah satu dari dua jalur: (a) biarkan modul ini tetap ada tapi disembunyikan dari alur utama pengguna sampai domain matematika lolos Gerbang Tahap 2 secara penuh, atau (b) definisikan ulang cakupan Tahap 1 secara eksplisit untuk turut memasukkan domain-domain ini — dengan konsekuensi gerbang ≥50 node dan uji Layer 0–2 juga harus dipenuhi untuk masing-masing domain tersebut.
  3. Tidak menambah lab domain baru lagi sampai keputusan di atas diambil dan didokumentasikan.

---

### 🔴 Temuan 7: Cakupan Benchmark Tahap 2 Belum Merepresentasikan Skala Penuh Domain 52-Node
* **Status**: 🔴 **Belum Diremediasi** (item terbuka)
* **Kondisi**: Gerbang Tahap 2 di `intelligence-os-foundation.md` Bagian 12 mensyaratkan uji Layer 0–2 lolos *"pada skala itu — bukan pada sampel benchmark kecil."* `HUMAN_GOLD_STANDARD_BENCHMARK` di `src/engine/centralHypothesisBenchmark.ts` berisi 20 kasus (80 probe), namun seluruhnya hanya menyentuh 5 klaster konseptual (`bench-frac-*`, `bench-alg-*`, `bench-ratio-*`, `bench-dec-*`, `bench-pct-*`) dari domain sempit 52-node yang mencakup setidaknya 8 klaster (termasuk Part-Whole dasar, Ekuivalensi awal, Penskalaan Multiplikatif — lihat rincian klaster di Temuan 5). Sejumlah node tidak memiliki satu pun kasus benchmark yang mewakilinya.
* **Akar Masalah**: 20 kasus dirancang sebagai bukti-konsep untuk struktur 4-probe independen (Base/Layer 0/1/2) dan arsitektur endpoint live-AI, bukan sebagai instrumen validasi kelolosan gerbang skala-penuh. Cakupan klaster tidak pernah dipetakan secara eksplisit terhadap 52 node domain sebelum diklaim "lolos Tahap 2" di Temuan 5.
* **Dampak Tambahan (belum divalidasi)**: 20 kasus gold-standard ini ditulis oleh tim pengembang sendiri (sintetis), belum diverifikasi terhadap asesmen manusia riil pada anak sungguhan — sehingga Risiko #1 di `intelligence-os-foundation.md` Bagian 11 (*"reliabilitas Feynman Sensor adalah masalah riset terbuka ... uji akurasi diagnosis vs penilaian manusia sebelum membangun lapisan lain"*) secara substansi belum tersentuh, walau infrastruktur endpoint-nya sudah nyata.
* **Tindakan Perbaikan yang Diperlukan (belum dilaksanakan)**:
  1. Petakan eksplisit setiap dari 52 node ke minimal satu kasus benchmark; identifikasi dan tutup celah klaster yang saat ini nol representasi.
  2. Definisikan secara eksplisit dan tertulis apa yang dihitung sebagai "skala penuh" untuk keperluan gerbang ini (mis. persentase node minimum bercakupan, jumlah probe minimum per klaster), agar klaim lolos/tidak lolos tidak subjektif.
  3. Sebelum lanjut ke Tahap 3, jalankan minimal satu putaran validasi diagnosis-AI-vs-manusia pada data riil (bukan gold standard buatan sendiri) sesuai mitigasi Risiko #1.

---

## 3. Status Gerbang Tahap 1 & Tahap 2 (Checklist Kepatuhan Roadmap)

> Rujukan kriteria: `intelligence-os-foundation.md` Bagian 12. Bagian ini menjawab langsung pertanyaan "apakah Tahap 1 dan Tahap 2 benar-benar selesai" per kriteria individual, bukan sebagai satu kesimpulan tunggal.

### Gerbang Tahap 1 — Satu Domain Sempit

| Kriteria Gerbang | Status | Bukti / Rujukan |
|---|---|---|
| Domain aktif mencapai ≥50 node | ✅ Lolos | `narrowMathDomain.ts` = 52 node; terintegrasi ke `INITIAL_KNOWLEDGE_GRAPH` (total 86 node); diverifikasi `tests/epistemic-os-tester.ts` Suite 1 |
| DAG murni tanpa siklus, WhyChain lengkap di seluruh node | ✅ Lolos | Suite 1: 0 error prasyarat, 86/86 node ber-WhyChain, DAG acyclic terverifikasi |
| Tidak menambah domain/lab baru di luar domain aktif sebelum gerbang lolos | 🔴 **Gagal** | Lihat Temuan 6 — 9 modul lab lintas-domain sudah dibangun dan aktif di `LabHub.tsx` |
| Modul di luar domain yang terlanjur dibangun ditandai eksplisit *out-of-sequence* | 🔴 **Gagal (sampai revisi dokumen ini)** | Tidak ada penandaan sebelum Temuan 6 ditulis |

**Kesimpulan Tahap 1**: **Belum benar-benar tuntas.** Kriteria ukuran & integritas graf lolos, tapi kriteria disiplin urutan roadmap dilanggar secara aktif dan sebelumnya tidak tercatat.

### Gerbang Tahap 2 — Uji Hipotesis Pusat (Layer 0–2 Perturbation)

| Kriteria Gerbang | Status | Bukti / Rujukan |
|---|---|---|
| Endpoint diagnosis AI nyata (bukan simulasi client-side) | ✅ Lolos | Temuan 1 & 2 |
| Provenance/fallback badge jujur, tidak ada mislabeling sumber | ✅ Lolos | Temuan 4 |
| Struktur 4-probe independen (Base, Layer 0, 1, 2) per kasus | ✅ Lolos | 20 kasus / 80 probe; `tests/epistemic-os-tester.ts` Suite 2 |
| Diuji "pada skala itu" (skala domain 52-node), bukan sampel kecil | 🔴 **Gagal** | Lihat Temuan 7 — hanya 5 dari 8 klaster konseptual tercakup |
| Diagnosis AI diverifikasi vs asesmen manusia riil (bukan gold-standard buatan sendiri) | ⚠️ **Belum diverifikasi** | Lihat Temuan 7 — Risiko #1 (`intelligence-os-foundation.md` Bagian 11) belum tersentuh data lapangan |

**Kesimpulan Tahap 2**: **Solid secara infrastruktur, belum lolos secara substansi.** Rangkaian teknis (endpoint, provenance, struktur probe) sudah non-mock dan berfungsi, tapi cakupan skala dan validasi eksternal terhadap manusia riil — dua syarat eksplisit gerbang ini — masih kosong.

---

## 4. Komponen yang Terbukti Otentik (Non-Mock)

Audit mengonfirmasi bahwa mesin logika inti tidak menggunakan angka statis palsu:
- `src/engine/deterministicCore.ts`: Penentuan kelayakan prasyarat graf dan jalur belajar dihitung murni dari matriks penguasaan.
- `src/engine/evidenceTriangulation.ts`: Bobot triangulasi 60% empiris lab / 25% uji transfer / 15% sensor kognitif dihitung secara matematis.
- `src/engine/dynamicTelemetry.ts`: Peluruhan ingatan Ebbinghaus, skor stabilitas, dan rasio *Epistemic Debt* ($D = \sum (1 - M_i) \cdot W_i$) beroperasi dinamis atas IndexedDB dan telemetry aksi lab.
- `src/data/narrowMathDomain.ts`: Pemodelan domain sempit sesuai kriteria Tahap 1. *(Path dikoreksi dari `src/engine/` — file sudah dipindah ke `src/data/` tapi referensi dokumen belum disinkronkan ulang.)*

---

## 5. Komitmen Rekayasa

Setiap metrik validasi yang ditampilkan pada dashboard pengujian harus dapat diaudit asal-usulnya:
- Apakah berasal dari observasi empiris simulasi,
- Inferensi inferensial model Gemini dengan prompt yang terdokumentasi,
- Atau kalibrasi manual teruji pakar.
