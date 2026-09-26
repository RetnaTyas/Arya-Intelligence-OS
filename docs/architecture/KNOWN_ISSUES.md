# Masalah yang Diketahui (Known Issues) & Temuan Audit Epistemik

> **Status Dokumen**: Resmi Dicatat  
> **Kategori Audit**: Validasi Empiris Tahap 2, Kalibrasi Sensor AI, dan Integritas Arsitektur  
> **Referensi Fondasi**: `intelligence-os-foundation.md` (Bagian 6.5.1, 6.5.2, Bagian 11 Risiko #1 & #12)

---

## 1. Ringkasan Eksekutif

Audit independen terhadap implementasi kode menemukan kesenjangan struktural antara klaim arsitektur (khususnya *Tahap 2 Peta Jalan: Validasi Hipotesis Pusat & Ketahanan Semantic Perturbation*) dengan eksekusi kode aktual. Beberapa komponen pembuktian sebelumnya beroperasi sebagai *epistemic theater* (simulasi hasil tetap di sisi klien) dan bukan pemanggilan inferensi sensorik nyata.

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

## 3. Komponen yang Terbukti Otentik (Non-Mock)

Audit mengonfirmasi bahwa mesin logika inti tidak menggunakan angka statis palsu:
- `src/engine/deterministicCore.ts`: Penentuan kelayakan prasyarat graf dan jalur belajar dihitung murni dari matriks penguasaan.
- `src/engine/evidenceTriangulation.ts`: Bobot triangulasi 60% empiris lab / 25% uji transfer / 15% sensor kognitif dihitung secara matematis.
- `src/engine/dynamicTelemetry.ts`: Peluruhan ingatan Ebbinghaus, skor stabilitas, dan rasio *Epistemic Debt* ($D = \sum (1 - M_i) \cdot W_i$) beroperasi dinamis atas IndexedDB dan telemetry aksi lab.
- `src/data/narrowMathDomain.ts`: Pemodelan domain sempit sesuai kriteria Tahap 1. *(Path dikoreksi dari `src/engine/` — file sudah dipindah ke `src/data/` tapi referensi dokumen belum disinkronkan ulang.)*

---

## 4. Komitmen Rekayasa

Setiap metrik validasi yang ditampilkan pada dashboard pengujian harus dapat diaudit asal-usulnya:
- Apakah berasal dari observasi empiris simulasi,
- Inferensi inferensial model Gemini dengan prompt yang terdokumentasi,
- Atau kalibrasi manual teruji pakar.
