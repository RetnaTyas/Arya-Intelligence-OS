# Pola Diadopsi dari Perbandingan Eksternal (eduadapt-ai)
### Adendum Arsitektur — Personal Intelligence OS

**Status:** Draf v0.1 · **Sifat:** Dokumen hidup · **Referensi Fondasi:** `intelligence-os-foundation.md` (Bagian 4, 5, 6), `KNOWN_ISSUES.md`

---

## 1. Ringkasan

Dokumen ini mencatat hasil perbandingan arsitektur dengan repo eksternal [`mwasifanwar/eduadapt-ai`](https://github.com/mwasifanwar/eduadapt-ai) dan menyaring **pola matematis/struktural** yang layak diadopsi ke Personal Intelligence OS — terlepas dari kredibilitas hasil eksperimen repo tersebut, yang tidak terverifikasi (lihat Bagian 5).

Dua kesenjangan konkret di arsitektur saat ini yang dokumen ini jawab:

1. **Cold-start di setiap node graph.** `deterministicCore.ts` menghitung mastery dari evidence langsung, tapi tidak punya mekanisme prior untuk node yang belum pernah disentuh anak — bertentangan dengan Prinsip Desain #7 (*forward motion + backward repair*), yang mengasumsikan sistem tahu ke mana anak "kemungkinan besar" sudah siap.
2. **Logika pemilihan lab implisit.** Urutan/pemilihan pengalaman belajar berikutnya (lab mana yang disodorkan) berisiko tersebar sebagai logika ad-hoc di komponen UI (`LabHub.tsx`), bukan fungsi skor eksplisit yang bisa diaudit — bertentangan dengan Prinsip #4 (*simpan bukti, bukan progress bar*) dan semangat auditability yang sudah dibuktikan lewat `KNOWN_ISSUES.md`.

---

## 2. Pola 1 — Prior-Based Mastery Estimation Lintas-Node

### 2.1 Masalah

Knowledge Graph (`initialKnowledgeGraph.ts`) sudah menyimpan struktur dependency antar-concept, tapi Learner Model hanya terisi dari node yang punya evidence langsung. Akibatnya: anak yang sudah master *Bar Model* tidak otomatis punya estimasi prior mastery di *Aljabar Simbolik*, walau graph tahu keduanya terhubung erat.

### 2.2 Formulasi yang Diadaptasi

Berbasis Deep Knowledge Tracing (Piech et al., 2015), diadaptasi untuk beroperasi di atas Knowledge Graph yang sudah ada, bukan sebagai model tersendiri:

$$\hat{k}_{t}(c) = \sigma\left(\sum_{c' \in \text{Parents}(c)} w_{c',c} \cdot M(c') \cdot \text{Decay}(c')\right)$$

di mana:
- $c$ = node concept target (belum ada evidence langsung)
- $\text{Parents}(c)$ = concept prerequisite langsung di graph (relasi yang sudah ada di `initialKnowledgeGraph.ts`)
- $M(c')$ = mastery aktual node parent (dari `deterministicCore.ts`, sumber kebenaran — bukan model terpisah)
- $\text{Decay}(c')$ = faktor peluruhan Ebbinghaus dari `dynamicTelemetry.ts` (dipakai ulang, bukan dihitung baru)
- $w_{c',c}$ = bobot kekuatan dependency antar-node — **dimulai manual/dikonfigurasi per-edge di graph**, bukan dipelajari dari data (lihat Bagian 5 soal kenapa)

Ini **bukan** LSTM. Tidak ada jaringan neural, tidak ada training data besar yang dibutuhkan. Ini murni propagasi tertimbang di atas graph yang sudah ada — konsisten dengan Prinsip #2 (*graph adalah sumber kebenaran*).

### 2.3 Titik Integrasi

| Berkas | Perubahan |
|---|---|
| `src/engine/deterministicCore.ts` | Tambah fungsi `estimatePriorMastery(nodeId)` yang dipanggil hanya ketika `M(node) === null` (belum ada evidence) |
| `src/data/initialKnowledgeGraph.ts` | Tambah field opsional `dependencyWeight` per edge (default 0.5 jika tidak diset) |
| `src/types.ts` | Tambah flag `isPrior: boolean` pada output mastery, supaya UI (`ParentTelemetryDashboard.tsx`) bisa membedakan visual "mastery teruji" vs "estimasi prior" |

**Syarat non-negosiasi:** field `isPrior` wajib tampil di Parent View. Prior tidak boleh disamarkan sebagai evidence — itu akan mengulang kesalahan *epistemic theater* yang sudah pernah diaudit dan diperbaiki di `KNOWN_ISSUES.md` Temuan #1 dan #2.

---

## 3. Pola 2 — Multi-Kriteria Next-Best-Experience Scoring

### 3.1 Masalah

Dengan ~15 labs (`BarModelAlgebraLab`, `BuoyancyLab`, `CalculusRateLab`, dst.), keputusan "lab mana selanjutnya" butuh fungsi skor eksplisit, bukan urutan hardcode atau heuristik tersembunyi di `LabHub.tsx`.

### 3.2 Formulasi yang Diadaptasi

$$S(l) = \alpha \cdot \text{Kesiapan}(l) + \beta \cdot \text{PerbaikanDebt}(l) + \gamma \cdot \text{Kebaruan}(l) + \delta \cdot \text{Transfer}(l)$$

di mana untuk setiap lab $l$:
- $\text{Kesiapan}(l)$ — apakah prerequisite graph untuk lab ini sudah terpenuhi (dari mastery matrix, termasuk prior di Pola 1)
- $\text{PerbaikanDebt}(l)$ — seberapa besar lab ini menutup *epistemic debt* kritis yang sudah terdeteksi (`dynamicTelemetry.ts`, formula $D=\sum(1-M_i)\cdot W_i$ yang sudah ada — dipakai ulang sebagai input, bukan dihitung ulang)
- $\text{Kebaruan}(l)$ — sudah berapa lama/berapa kali lab ini diulang (anti-pengulangan pasif)
- $\text{Transfer}(l)$ — potensi lab ini menguji transfer ke domain lain di graph (selaras Prinsip #10, *no content without cognitive purpose*)

Bobot $\alpha,\beta,\gamma,\delta$ **wajib** berada di file konfigurasi terpisah (lihat Pola 3), bukan hardcode di komponen React.

### 3.3 Titik Integrasi

| Berkas | Perubahan |
|---|---|
| `src/engine/` | Modul baru `nextBestExperience.ts` — fungsi murni, tidak menyentuh state React langsung |
| `src/components/labs/LabHub.tsx` | Konsumsi output `nextBestExperience.ts` sebagai daftar terurut; hapus logika pengurutan implisit apa pun yang saat ini ada di komponen |

---

## 4. Pola 3 — Eksternalisasi Bobot Konfigurasi

### 4.1 Masalah

Perlu diverifikasi: apakah bobot triangulasi di `evidenceTriangulation.ts` (60% empiris lab / 25% uji transfer / 15% sensor kognitif) sudah dikonfigurasi eksternal atau masih hardcode di TypeScript.

### 4.2 Tindakan

Jika hardcode: pindahkan ke satu berkas konfigurasi (`config/weights.json` atau setara), dengan struktur:

```json
{
  "evidenceTriangulation": { "empirisLab": 0.60, "ujiTransfer": 0.25, "sensorKognitif": 0.15 },
  "nextBestExperience": { "kesiapan": 0.4, "perbaikanDebt": 0.3, "kebaruan": 0.15, "transfer": 0.15 },
  "priorMastery": { "defaultDependencyWeight": 0.5 }
}
```

**Alasan:** setiap angka yang memengaruhi keputusan sistem terhadap anak harus bisa diaudit tanpa membaca kode — ini langsung mendukung Bagian 4 `KNOWN_ISSUES.md` (*Komitmen Rekayasa*: setiap metrik harus bisa diaudit asal-usulnya).

---

## 5. Yang Secara Sadar TIDAK Diadopsi

| Dari eduadapt-ai | Kenapa ditolak |
|---|---|
| LSTM Knowledge Tracing (model neural terlatih) | Butuh volume data interaksi besar untuk tidak overfit/noise; skala proyek saat ini (evidence dari sedikit anak) tidak cukup. Melanggar Prinsip #2 — AI/model belajar tidak boleh jadi penentu struktur graph sebelum cukup data untuk dipercaya |
| Reinforcement Learning policy gradient untuk pemilihan jalur | Sama — RL sebagai black-box penentu jalur belajar adalah pengulangan langsung dari kesalahan yang coba dihindari Prinsip #2 (*AI bukan Supreme Curriculum God*) |
| Klaim metrik hasil (92.8% akurasi, +42.7% engagement, dll.) | Tidak ada dataset, kode evaluasi, atau notebook yang dapat diverifikasi di repo sumber — tidak layak dijadikan basis desain apa pun |

Pola 1 dan 2 di atas sengaja dirumuskan sebagai **propagasi tertimbang deterministik di atas graph yang sudah ada**, bukan model yang dipelajari dari data — supaya tetap konsisten dengan Prinsip #2 dan #4, dan tetap bisa diaudit baris-per-baris seperti komponen `deterministicCore.ts` dan `evidenceTriangulation.ts` yang sudah dikonfirmasi otentik di `KNOWN_ISSUES.md` Bagian 3.

---

## 6. Urutan Implementasi yang Disarankan

1. Pola 3 (eksternalisasi config) — paling murah, tidak berisiko, prasyarat untuk dua pola lainnya
2. Pola 1 (prior mastery) — butuh flag `isPrior` di UI sebelum dirilis, supaya tidak jadi epistemic theater baru
3. Pola 2 (scoring next-best-experience) — bergantung pada Pola 1 untuk input `Kesiapan(l)` yang akurat

---

*Dokumen ini adalah adendum, bukan pengganti `intelligence-os-foundation.md`. Setelah pola di atas diimplementasi dan diverifikasi (bukan mock), pindahkan ringkasannya ke Bagian 12 (Peta Jalan) dokumen fondasi utama.*
