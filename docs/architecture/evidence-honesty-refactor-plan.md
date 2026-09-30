# Rencana Arsitektur & Refactor: Epistemic Honesty & Single Implementation Gateway

**Status:** Disetujui & Dikunci · **Tanggal:** 2026-09-30  
**Rujukan Utama:** `docs/architecture/intelligence-os-foundation.md`

---

## 1. Temuan Lapangan & Latar Belakang

Pada audit integritas nilai awal, perbaikan *"node baru mulai kosong"* di `App.tsx` baru mencakup callback Feynman. Namun ditemukan celah kritis pada alur lab:
1. **Callback Telemetri Lab (`App.tsx` baris 108–140):** Saat event lab selesai diterima untuk node yang belum ada di state, state diinisialisasi dengan mastery karangan (`recognition: 0.8, recall: 0.7, understanding: 0.7, application: 0.6, transfer: 0.5, explanation: 0.5, creation: 0.3`, `decayRate: 0.02`, `confidence: 'medium'`, `evidenceCount: 2`).
2. **Callback Tantangan Lab (`App.tsx` baris 586–594):** Callback kedua membuat objek literal identik dengan mastery karangan yang sama.
3. **Pencemaran Operasi `||` (`App.tsx` baris 130–132 dan 602–604):** Penggunaan operator `(current.mastery.application || 0.5)` memperlakukan angka `0` sebagai *falsy*. Akibatnya, node kosong murni (penguasaan 0) langsung dinaikkan ke baseline default `0.5` dan `0.6` begitu aksi lab pertama kali dijalankan.
4. **Pemicu Kenaikan Datar (`App.tsx` baris 602–604):** Kenaikan flat `+0.15` dan `+0.1` tanpa verifikasi gating deterministik menabrak aturan penjaminan bukti.

---

## 2. Keputusan Arsitektur yang Dikunci

1. **Implementasi Tunggal di Worker:**
   Worker `worker/index.ts` (`arya-ai-gateway`) adalah satu-satunya implementasi logika inferensi AI. Cloudflare Pages Functions (`functions/api/`) hanya bertindak sebagai reverse proxy transparan menuju Worker via service binding `AI_GATEWAY`.
2. **Kegagalan Binding Berarti `unobserved` (Zero-Fallback Heuristic):**
   Jika binding Workers AI tidak tersedia, model melempar exception, atau keluaran tidak dapat di-parse, sistem **TIDAK BOLEH** menghasilkan angka tebakan dari sensor heuristik lokal. Berkas `worker/lib/fallback-heuristics.ts` dihapus sepenuhnya.
3. **Pembersihan Stack Duplikat:**
   `server.ts`, `@google/genai`, `express`, `dotenv`, `@types/express`, serta variabel `GATEWAY_AUTH_KEY` / header `X-Gateway-Auth` dihapus dari arsitektur.
4. **Kontrak Respons Baru:**
   - **Endpoint Tunggal** (`/diagnose/feynman`, `/tutor/socratic`): Mengembalikan HTTP 503 dengan payload `{ unobserved: true, reason: string }` bila inferensi AI gagal atau binding tidak tersedia.
   - **Endpoint Batch / Probes** (`/benchmark/central-hypothesis`, `/benchmark/feynman-suite`): Mengembalikan item probe dengan flag `{ unobserved: true, reason: string }` tanpa field skor numerik, disertai agregasi `unobservedCount`.
   - Menghilangkan field warisan `usedFallback` dan label sumber `'gemini'` / `'local'`.

---

## 3. Rencana Bertahap (Fase 0 – Fase 7)

### Fase 0: Bersih-bersih & Penyelarasan Fondasi
- Hapus lockfile ganda (`bun.lock`), pastikan hanya `package-lock.json` yang aktif (standar npm Cloudflare Pages).
- Hapus artefak sementara `docs/Temp files/arya-evidence-honesty.patch`.
- Tambahkan `"functions"` dan `"worker"` ke array `include` di `tsconfig.json`.
- Dokumentasikan tabel tiga kategori klasifikasi hardcode (**Tidak Ada**, **Diasumsikan**, **Diklaim**) ke `docs/architecture/intelligence-os-foundation.md`.

### Fase 1: Gate Merah Dulu (TDD Contract Enforcement)
Perbarui dan tambahkan gerbang pengujian di `tests/evidence-gate.ts`:
- **G6b (Update):** Proxy Pages meneruskan request utuh; tanpa `AI_GATEWAY`, proxy merespons HTTP 503 `{ unobserved: true, reason }`.
- **G8:** `central-hypothesis` dengan respons parsial menghasilkan probe berstatus `unobserved: true` tanpa skor numerik.
- **G9:** `feynman-suite` dengan kasus hilang atau skor NaN menghasilkan `unobserved: true` tanpa nilai `0.7` atau skor rekaan.
- **G10:** Seluruh endpoint worker tanpa binding AI atau error menghasilkan status unobserved/503 tanpa field skor numerik.
- **G11:** Endpoint Socratic yang gagal menghasilkan HTTP 503 `{ unobserved: true, reason }`.
- **G12:** Fungsi helper tunggal `emptyLearnerState(nodeId)` di engine untuk inisialisasi state murni (mastery nol, decayRate undefined, evidenceCount 0), menggantikan tiga literal di `App.tsx`.

### Fase 2: Refactor Worker (`worker/index.ts`)
- Implementasi pencocokan granular per-probe dan per-kasus; data hilang menghasilkan `unobserved: true`.
- Hapus seluruh pemanggilan heuristik lokal dan hapus `worker/lib/fallback-heuristics.ts`.
- Hapus `GATEWAY_AUTH_KEY` dan header `X-Gateway-Auth`.
- Status `/health` menghasilkan `degraded` jika `hasAiBinding` bernilai false.

### Fase 3: Pages Sebagai Proxy Murni
- Ganti file-file duplikat di `functions/api/` dengan satu catch-all proxy `functions/api/[[path]].ts` yang meneruskan request ke service binding `env.AI_GATEWAY`.
- Sederhanakan `functions/types.ts` hanya untuk deklarasi `AI_GATEWAY`.

### Fase 4: Frontend & Eliminasi Default Fabrikasi
- Sesuaikan titik pemanggilan di komponen (`SocraticTutorView`, `Header`, `CentralHypothesisTestHarness`, `HumanVsAiAuditDashboard`, `BuoyancyLab`, `FeynmanCalibrationSuite`) untuk menampilkan label *"AI tidak tersedia (tidak teramati)"* saat respons berstatus `unobserved`.
- Sapu seluruh default fallback `|| 0.4`, `|| 0.5`, `|| 0.6`, `?? 0.70` di `App.tsx` dan harness.
- Ganti ketiga literal state awal dengan `emptyLearnerState()`, dan bungkus pembaruan telemetri lab dengan `applyMasteryGating`.

### Fase 5: Penghapusan Dependensi Server & Penyesuaian Build
- Hapus `server.ts` dan dependensi server Express/Gemini.
- Sesuaikan script npm (`dev`, `build`, `start`).

### Fase 6: Penyelesaian Temuan Minor
- Payload stealth insertion hanya menggunakan `state.decayRate` yang nyata; intervensi tidak dipicu jika decay tidak teramati.
- `activeMisconceptions` hanya diperbarui jika `triangulation.shouldUpdateLearnerModel === true`.

### Fase 7: Dokumentasi & Konsolidasi
- Hubungkan markdown dokumen fondasi secara dinamis.
- Perbarui `KNOWN_ISSUES.md` dan `README.md`.

---

## 4. Keputusan Kecil & Catatan Batasan

1. **Nilai Nol vs. Belum Teramati per Dimensi:**
   Saat lab selesai dan `application: 0.9`, nilai `transfer: 0` pada hierarki mastery saat ini merupakan keterbatasan representasi tipe numerik `MasteryHierarchy`. Perbaikan ke tipe `number | undefined` dicatat sebagai batas sistem di `KNOWN_ISSUES.md`.
2. **Slider Audit Orang Tua:**
   Nilai default awal slider `0.8` di `ParentTelemetryDashboard` dipertahankan sementara sebagai jangkar interaksi UI dan akan dievaluasi pada iterasi UX khusus.
