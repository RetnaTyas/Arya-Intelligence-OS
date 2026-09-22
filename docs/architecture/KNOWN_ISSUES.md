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
  1. Dibuat endpoint backend nyata `POST /api/benchmark/diagnose` yang memproses dialog pembelajar melalui instruksi penilai kognitif model Gemini.
  2. Komponen `CentralHypothesisTestHarness.tsx` dihubungkan ke endpoint ini dengan mode pengujian nyata (*Live AI Assessment*) dan fallback teruji jika API key tidak tersedia.
  3. Menyediakan tombol toggle untuk membedakan mode **Evaluasi Live AI Gemini** vs **Ground Truth Deterministic Calibration**.

---

### 🔴 Temuan 2: Rangkaian Kalibrasi Feynman (`FeynmanCalibrationSuite.tsx`) Tidak Memanggil Inferensi Nyata
* **Kondisi Awal**: Lima kasus `BENCHMARK_CASES` memiliki diagnosis AI statis yang ditulis tangan bersamaan dengan diagnosis manusia. Tombol "Jalankan Uji Benchmark" hanya menjalankan timeout 700ms tanpa menghitung ulang data dari model.
* **Akar Masalah**: Komponen dibuat sebagai visualisasi statis desain sebelum integrasi API endpoint Feynman sensor di server selesai.
* **Tindakan Perbaikan**:
  1. Dibuat endpoint batch `POST /api/benchmark/feynman-suite` di `server.ts`.
  2. Tombol "Jalankan Uji Benchmark" kini mengirim kelima ujaran anak (*child utterances*) ke endpoint Feynman Sensor nyata.
  3. Skor keselarasan (*Human-AI Concordance*) dihitung secara dinamis dari hasil inferensi model berbanding standar emas pakar.

---

### 🔴 Temuan 3: Konfigurasi Model AI & Integrasi Cloudflare Workers AI (Qwen 3 30B)
* **Kondisi Awal**: Pada beberapa draf pemanggilan server dicantumkan penamaan model yang tidak konsisten dengan katalog runtime resmi `@google/genai`. Selain itu, penyebaran ke Cloudflare memerlukan dukungan penuh terhadap ekosistem Cloudflare Workers AI.
* **Akar Masalah**: Penulisan manual string model tanpa menyelaraskan dengan panduan SDK `@google/genai` dan arsitektur target Cloudflare.
* **Tindakan Perbaikan**:
  1. **Dukungan Penuh Cloudflare Workers AI**: Mengintegrasikan model canggih `@cf/qwen/qwen3-30b-a3b-fp8` (Qwen 3 30B FP8) sebagai penyedia AI utama untuk deployment Cloudflare.
  2. **Arsitektur Dual-Engine Resilien**: Jika kredensial Cloudflare Workers AI (`CLOUDFLARE_ACCOUNT_ID` & `CLOUDFLARE_API_TOKEN`) diset, sistem secara langsung menggunakan REST endpoint Workers AI. Jika tidak, sistem beralih ke `gemini-3.8-flash` (atau heuristik deterministik lokal bila offline).
  3. Seluruh endpoint penilai Feynman, Central Hypothesis Benchmark, dan Socratic Tutor kini memiliki penanganan status error transparan dan memberitahukan kepada klien apakah respons berasal dari `cloudflare-workers-ai (@cf/qwen/qwen3-30b-a3b-fp8)`, `gemini-3.8-flash`, atau `local-fallback-engine`.

---

### 🟠 Temuan 4: Keterbatasan Sensor Fallback Berbasis Aturan (*Rule-based Fallback*)
* **Kondisi Awal**: Saat `GEMINI_API_KEY` tidak tersedia, fallback `generateLocalFeynmanDiagnosis` mengandalkan pencocokan kata kunci (*keyword matching* sederhana).
* **Akar Masalah**: Pemrosesan bahasa alami deterministik murni tanpa inferensi semantik mendalam memiliki batas ekspresi.
* **Tindakan Perbaikan**:
  1. UI kini secara eksplisit melabeli sumber diagnosis: **[CLOUDFLARE WORKERS AI (QWEN 3 30B FP8)]**, **[LIVE GEMINI MODEL]**, atau **[HEURISTIC LOCAL ENGINE (OFFLINE)]** agar pendamping/peneliti tahu batas validitas data.
  2. Logika lokal ditingkatkan untuk menganalisis struktur kalimat sebab-akibat (relasi kausal, ada tidaknya variabel invarian, deteksi distraktor).

---

## 3. Komponen yang Terbukti Otentik (Non-Mock)

Audit mengonfirmasi bahwa mesin logika inti tidak menggunakan angka statis palsu:
- `src/engine/deterministicCore.ts`: Penentuan kelayakan prasyarat graf dan jalur belajar dihitung murni dari matriks penguasaan.
- `src/engine/evidenceTriangulation.ts`: Bobot triangulasi 60% empiris lab / 25% uji transfer / 15% sensor kognitif dihitung secara matematis.
- `src/engine/dynamicTelemetry.ts`: Peluruhan ingatan Ebbinghaus, skor stabilitas, dan rasio *Epistemic Debt* ($D = \sum (1 - M_i) \cdot W_i$) beroperasi dinamis atas IndexedDB dan telemetry aksi lab.
- `src/engine/narrowMathDomain.ts`: Pemodelan domain sempit sesuai kriteria Tahap 1.

---

## 4. Komitmen Rekayasa

Setiap metrik validasi yang ditampilkan pada dashboard pengujian harus dapat diaudit asal-usulnya:
- Apakah berasal dari observasi empiris simulasi,
- Inferensi inferensial model Gemini dengan prompt yang terdokumentasi,
- Atau kalibrasi manual teruji pakar.
