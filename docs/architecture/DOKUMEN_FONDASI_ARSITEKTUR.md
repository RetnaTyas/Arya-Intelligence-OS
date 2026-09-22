# Personal Intelligence OS
## Dokumen Fondasi: Konsep, Prinsip, dan Arsitektur
**Status:** Draf v0.1 (konsolidasi) · **Sifat:** Dokumen hidup · **Cakupan:** Konsep, arsitektur logis, model bisnis, risiko. Belum mencakup UI, implementasi teknis, atau konten.

---

## 1. Ringkasan

### Tesis
Pendidikan pasca-COVID hanya mendigitalkan birokrasi abad ke-19: manusia diproses per *batch* berdasarkan tahun lahir, kurikulum linear, dan hafalan. Perubahan medium (papan tulis → layar) tidak mengubah logika dasarnya.

### Gagasan
Proyek ini bukan LMS dan bukan "sekolah online". Ini adalah **Personal Intelligence OS**: sebuah sistem yang memelihara perkembangan intelektual seorang manusia sebagai lintasan yang unik. Pendidikan hanya menjadi *interface* pertamanya.

### Pembagian Fungsi Inti

| Lapisan | Fungsi | Dioptimalkan untuk |
| :--- | :--- | :--- |
| **Sekolah (Social Sandbox)** | Belajar hidup bersama manusia | Interaksi, kalibrasi sosial, lingkungan fisik |
| **Intelligence OS** | Membangun kapabilitas intelektual sendiri | Lintasan individu, *mastery*, akselerasi |
| **Rumah** | Budaya, nilai, kebiasaan, observasi | Karakter |
| **AI** | Tutor Socratic, simulasi, umpan balik, navigasi pengetahuan | Diagnosis dan pendampingan |
| **Orang tua** | Arsitek, pengamat, pengambil keputusan | Arah dan pengawasan |

> **Prinsip satu kalimat:** *Mass education tidak harus berarti standardized education. Satu mesin yang sama, jutaan jalur berbeda.*

---

## 2. Masalah yang Dipecahkan

1. **Batch processing manusia.** Umur menentukan apa yang boleh dipelajari, terlepas dari kesiapan anak.
2. **Kurikulum linear.** Kelas 1 → Kelas 2, walau anak bosan atau tertinggal.
3. **Kelulusan semu.** Nilai 70% dianggap lulus, padahal 30% fondasi yang hilang menjadi bom waktu.
4. **Epistemic Debt.** Celah fondasi (misalnya pecahan yang rapuh) menumpuk diam-diam lalu meruntuhkan materi tingkat lanjut.
5. **Remedial yang memalukan.** Kelas perbaikan memicu rasa malu dan resistensi belajar.
6. **Ukuran statis.** Rapor dan skor IQ adalah artefak historis, bukan gambaran lintasan yang hidup.

---

## 3. Prinsip Desain
*Prinsip-prinsip ini bersifat mengikat bagi keputusan arsitektur dan produk berikutnya.*

1. **Ukur observable learning state, bukan IQ.** Sistem mengukur *mastery*, transfer, retensi, kedalaman penalaran, pola kesalahan, dan *learning rate*. IQ paling jauh hanya satu hipotesis, bukan variabel *master* di database.
2. **Graph adalah sumber kebenaran.** Knowledge Graph menentukan struktur. AI bukan *"Supreme Curriculum God"*.
3. **Pisahkan peta ilmu dari peta anak.** Knowledge Graph (dunia ilmu) dan Learner Model (posisi anak terhadap dunia itu) adalah dua entitas berbeda. Jangan dicampur.
4. **Simpan bukti, bukan progress bar.** Yang disimpan adalah *evidence*: apa yang dilakukan anak, bagaimana ia menjelaskan, di mana transfernya gagal.
5. **Kesalahan adalah data emas.** Sistem harus tahu bagaimana anak salah, bukan hanya bahwa ia salah.
6. **Umur adalah metadata, kemampuan adalah ukuran.** Umur menunjukkan di mana manusia berada. Kapabilitas menunjukkan apa yang bisa ia lakukan.
7. **Forward motion + backward repair.** Anak terus maju, fondasi diperbaiki sambil berjalan. Tidak ada "turun ke kelas 4".
8. **Zero Critical Epistemic Debt, bukan Zero Debt.** Manusia memang lupa. Yang dijaga adalah *decay* pada *prerequisite* yang berbahaya bagi lintasan.
9. **Why-first.** Aturan → Prinsip → Derivasi. Setiap konsep berakar pada pertanyaan "kenapa".
10. **No content without a cognitive purpose.** Setiap materi harus membangun konsep, memperbaiki miskonsepsi, melatih kemampuan, membuka prerequisite, atau membuktikan transfer. Selain itu dibuang.
11. **Voluntary engagement, bukan behavioral exploitation.** Tanpa FOMO, loot box, streak anxiety, scarcity buatan, atau notifikasi spam.
12. **Tidak ada endpoint.** Dunia tidak "ditutup" karena kurikulum selesai. Penguasaan membuka kapabilitas baru.

---

## 4. Arsitektur Logis

### 4.1 Gambaran Umum

```text
                    PERSONAL INTELLIGENCE OS
                              │
             ┌────────────────┴────────────────┐
             │                                 │
      KNOWLEDGE GRAPH                    LEARNER MODEL
      (peta dunia ilmu)                  (peta anak terhadap ilmu)
             │                                 │
   ┌─────────┼─────────┐              ┌────────┼────────┐
 Concept   Skill   Dependency      Mastery  Errors  Learning Rate
             │                                 │
             └────────────────┬────────────────┘
                              │
                       ADAPTIVE ENGINE
                              │
             ┌────────────────┼────────────────┐
         Challenge          Tutor          Simulation
             └────────────────┼────────────────┘
                              │
                         EVIDENCE LOG
                              │
                   ┌──────────┴──────────┐
              Parent View           Child View
```

### 4.2 Komponen

| Komponen | Peran | Catatan |
| :--- | :--- | :--- |
| **Knowledge Graph** | Peta konsep, skill, prerequisite, dan lapisan WHY | Source of truth struktur |
| **Learner Model** | Keadaan anak per node: mastery, retensi, transfer, miskonsepsi | Diperbarui dari evidence |
| **Evidence Log** | Rekam jejak interaksi bermakna | Aset jangka panjang, dapat dibuka kembali bertahun-tahun kemudian |
| **Misconception Graph** | Peta cara berpikir yang keliru dan koreksinya | Lihat bagian 6.3 |
| **Adaptive Engine** | Memilih pengalaman belajar berikutnya yang paling informatif | Membaca graph + learner state |
| **AI Tutor** | Bertanya, mendengar, mendiagnosis, menghasilkan simulasi | Bukan penentu kurikulum |
| **Parent View / Child View** | Tampilan berbeda atas data yang sama | Transparansi ke orang tua |

### 4.3 Aliran Data Utama

```text
Knowledge Graph
       ↓
  Learner State
       ↓
    AI Tutor
       ↓
  Interaction
       ↓
    Evidence
       ↓
   Assessment
       ↓
Learner State Update
       ↓
Next Best Learning Experience
```

**Batasan peran AI:** *tutor + diagnostician + generator + simulator interface*. AI membaca *graph*, melihat *learner state*, memilih intervensi, bertanya, membaca jawaban, menghasilkan *evidence*, dan memperbarui *learner model*. AI tidak menulis ulang *graph* secara otonom.

---

## 5. Knowledge Graph

### 5.1 Struktur
Kurikulum linear diganti **Dynamic Knowledge Graph ("Skill Tree")**. Domain saling memberi makan:

```text
Bar Model (visual logic)
   └→ Aljabar Simbolik
          ├→ Fisika Mekanik
          ├→ Pemrograman / Algoritma
          └→ Kalkulus
```

Anak bisa berada di node pemrograman sambil tetap pada level usia untuk motorik halus. Sistem beradaptasi, anak tidak ditahan oleh "batch"-nya.

### 5.2 Lapisan WHY
Graph menyimpan bukan hanya *apa*, tapi juga *kenapa*:

```text
Kenapa aljabar ada?
   ↓ Bagaimana manusia merepresentasikan kuantitas yang belum diketahui?
   ↓ Kenapa representasi simbolik?
   ↓ Kenapa persamaan?
   ↓ Kenapa transformasi mempertahankan kesetaraan?
   ↓ Asumsi apa yang membuatnya valid?
```

*Hasilnya:* anak tidak belajar "pindahkan x ke sebelah kanan", tetapi "kita melakukan operasi yang sama pada kedua sisi karena ingin mempertahankan hubungan kesetaraan".

### 5.3 Skema Node (Draf)

```json
{
  "concept": "equality",
  "prerequisites": ["quantity", "comparison"],
  "explanation_levels": ["concrete", "visual", "symbolic", "formal"],
  "mastery_evidence": ["solve", "explain", "predict", "transfer", "create"],
  "why_chain": ["..."]
}
```

**Entitas skema minimum:** `Concept`, `Skill`, `Prerequisite`, `Evidence`, `Misconception`, `Assessment`, `Resource`, `Experiment`, `Project`, `Learner State`.

---

## 6. Learner Model dan Mastery

### 6.1 Hierarki Penguasaan
*Mastery* bukan skor biner atau persentase tunggal, melainkan hierarki 7 tingkat:

$$\text{Recognition} \rightarrow \text{Recall} \rightarrow \text{Understanding} \rightarrow \text{Application} \rightarrow \text{Transfer} \rightarrow \text{Explanation} \rightarrow \text{Creation}$$

*Contoh (pecahan):* mengenali $1/2$ (95%), menghitung $1/2 + 1/4$ (90%), menjelaskan mengapa (70%), memakai pada masalah baru (40%), menemukan aplikasi sendiri (belum teruji).

Sistem tidak berkata *"belum lulus pecahan"*, tetapi: *"Konsep dikuasai untuk aplikasi rutin, kemampuan transfer belum terverifikasi."*

### 6.2 Feynman Sensor
Teknik Feynman dipakai sebagai sensor, bukan ujian akhir. AI mengajukan pertanyaan Socratic (misalnya: *"kenapa kapal besi mengapung, sedangkan besi yang dimasukkan begitu saja tenggelam?"*), lalu menganalisis jawaban:

```text
Concept:        Buoyancy ✓  Density ✓  Displacement ✓
Reasoning:      Causal chain ✓  Analogy ✓  Transfer ?
Misconception:  "berat menentukan tenggelam/mengapung" (terdeteksi)
```

Output bukan nilai 8/10, melainkan pembaruan *learner model*:

```text
Buoyancy
├── conceptual understanding  0.91
├── causal reasoning          0.83
├── transfer                  0.54
└── misconception             detected
```

*Adaptive Engine* lalu memilih pengalaman berikutnya yang paling informatif.

### 6.3 Misconception Graph

```text
Anak
 ├── memahami density
 ├── memahami mass
 └── miskonsepsi: "lebih berat → tenggelam"
          ↓ counterexample
          ↓ revised model
```

### 6.4 Evidence Log
Contoh entri log jangka panjang:

```text
2029-03-14 · Concept: Conservation of Energy
Evidence:
 - memprediksi hasil sebelum simulasi
 - menjalankan eksperimen
 - menjelaskan hasil
 - membuat analogi
 - mentransfer prinsip ke roller coaster
 - gagal mentransfer ke rangkaian listrik
Confidence: high · Retention: pending
```

Bertahun-tahun kemudian, log ini memperlihatkan bagaimana cara berpikir anak berevolusi.

---

## 7. Self-Healing Learning

### 7.1 Epistemic Debt
Istilah desain sistem (bukan diagnosis psikologis formal) untuk akumulasi celah fondasi yang menjadi *bottleneck* di materi lanjutan.

### 7.2 Mekanisme

```text
LEARNING ACTIVITY → Evidence Engine
        ┌───────────┴───────────┐
   New Mastery             Decay Signal
                          ┌─────┴─────┐
                  Recall weakness   Dependency weakness
        └───────────┬───────────┘
              Adaptive Engine
                    ↓
      Cari titik penyisipan alami
        ┌───────────┴───────────┐
  Proyek berjalan          Konteks baru
                    ↓
            Reconsolidation
                    ↓
     Evidence baru → Update Knowledge Graph
```

### 7.3 Stealth Insertion (Passive Contextual Remediation)
Remedial tidak menjadi ruangan terpisah, melainkan fungsi tersembunyi dalam perjalanan belajar:

1. **Sinyal decay:** aljabar factoring turun 15%.
2. **Prediksi bottleneck:** decay ini akan menyulitkan modul fisika & kalkulus yang akan datang.
3. **Reconsolidation:** aljabar disisipkan ke proyek berminat tinggi (misalnya kapal selam: *"berapa volume air yang harus dipindahkan agar berat totalnya berubah menjadi X?"*).
4. **Hasil:** fondasi pulih sebagai efek samping penemuan, tanpa rasa malu.

### 7.4 Debt Risk
Formulasi konseptual:

$$\text{Debt Risk} = \text{Decay} \times \text{Dependency Centrality} \times \text{Future Relevance} \times \text{Uncertainty}$$

Yang penting bukan seberapa lupa suatu konsep, tetapi seberapa berbahaya kelupaan itu bagi masa depan graph. Contoh: penurunan kecil pada aritmetika tidak perlu dipanikan, tetapi decay besar pada aljabar linear ketika anak bergerak menuju komputasi kuantum harus memicu reaksi proaktif.

*Catatan status:* Dua faktor (*Future Relevance*, *Uncertainty*) belum punya definisi operasional (lihat Bagian 11).

### 7.5 Cognitive Bottleneck Prediction
Sistem tidak hanya berkata "anak lupa factoring", tetapi: *"jika decay berlanjut, node X/Y/Z pada lintasan aktif menjadi lebih sulit"*. Ini adalah *predictive maintenance* untuk pengetahuan: jangan menunggu *bearing* pecah baru diperbaiki.

---

## 8. Empat Loop Sistem

| Loop | Alur | Fungsi |
| :--- | :--- | :--- |
| **Curiosity** | Explore/Build → Kapabilitas baru → Rasa ingin tahu baru | Motivasi intrinsik, tanpa *endpoint* |
| **Mastery** | Evidence → Assessment → Mastery | Verifikasi penguasaan berlapis |
| **Repair** | Decay terdeteksi → Reconsolidation kontekstual → Pengetahuan pulih | Fondasi tidak retak (*self-healing*) |
| **Trajectory** | Analisis dependensi/bottleneck → Kapabilitas berikutnya terbuka → Abstraksi lebih tinggi | Arah perkembangan jangka panjang |

> **Pembeda dari LMS:** LMS menyimpan materi, **Intelligence OS memelihara perkembangan.**

---

## 9. Telemetri dan Profil Kognitif

### 9.1 Prinsip
*"Health telemetry untuk pengetahuan"* seperti *smartwatch*: bukan satu angka tunggal, melainkan profil per domain dan tren.

- **Per domain, bukan satu skor:** Matematika Advanced, Bahasa Typical, Motorik Developing.
- **Tren pribadi, bukan perbandingan antar anak:** Pertanyaannya: *"Apakah kemampuan anak ini berkembang?"*
- **Hindari "mental age" dan "IQ age":** Label ini membatasi anak secara artifisial.

### 9.2 Contoh Dasbor

```text
ARYA · INTELLIGENCE OS
Reasoning  ↑    Spatial ↑↑    Causal ↑↑↑    Algebra ↓

Knowledge Stability   91%
Critical Debt         LOW
Bottleneck Risk       LOW
Transfer Strength     78%

Active Trajectory: Fluid Mechanics → Engineering
System Action: Algebra disisipkan ke proyek buoyancy kapal selam
```

### 9.3 Capability Stage
Alih-alih "umur mental", dipakai **Capability Stage** per domain: berdasarkan *evidence*, kemampuan tertentu sudah menangani kompleksitas yang biasanya diperkenalkan pada tahap belajar tersebut. *Stage* tidak menetapkan batas atas (*ceiling*) berdasarkan umur.

### 9.4 Pergeseran dari Orang Tua
Dari *"hari ini anak saya belajar apa?"* menjadi *"bagaimana struktur kemampuan anak saya berubah minggu ini?"*.

---

## 10. Produk dan Model Bisnis

### 10.1 Positioning
Jangan jual "AI tutor" (mudah ditiru). Jual:
> **"Satu sistem yang tahu apa yang sudah Anda kuasai, apa yang belum, mengapa Anda salah, dan apa yang harus dipelajari berikutnya."**

Nilai sesungguhnya ada di **Knowledge Graph + Kualitas Konten + Assessment Engine + Learner Model + Adaptive Engine**. AI hanyalah salah satu mesin penggeraknya.

**DNA Produk:** *"Don't sell education. Sell the ability to learn anything."*

### 10.2 Tiga Mesin

```text
KNOWLEDGE ENGINE    ADAPTIVE ENGINE    DISCOVERY ENGINE
 "Apa yang ada?"    "Apa yang cocok?"   "Apa yang menarik?"
         └──────────────┼──────────────┘
                    CURIOSITY → VOLUNTARY USE → SUBSCRIPTION
```
*Subscription adalah konsekuensi nilai, bukan gerbang masuk yang membatasi rasa ingin tahu.*

### 10.3 Struktur Akses
- **Free:** Merasakan sistem dan eksplorasi dasar.
- **Subscriber:** Infrastruktur intelijen penuh (pembelajaran adaptif, eksplorasi tanpa batas, AI Socratic tutor, simulasi lanjutan, *personal knowledge graph*, *project lab*, riwayat *evidence*, alat riset).
- *Hindari "premium course":* Yang dibayar adalah mesin belajar yang lebih kuat, bukan tumpukan materi lebih banyak.

### 10.4 Psikologi Nilai Berulang
Orang membayar berulang bila (1) progres terasa milik mereka, dan (2) ada *continuous discovery*. Meniru *behavioral architecture* (keterlibatan sukarela), bukan mekanisme eksploitasi adiktif.

### 10.5 Efek Jaringan
*Backend* semakin cerdas seiring skala (pola miskonsepsi, kalibrasi soal, jalur belajar), namun *frontend* tetap personal: *massive scale di backend, personalized experience di frontend.*

### 10.6 Jalur Perubahan: "Pressure from Below"

```text
Platform → Anak belajar lebih cepat → Orang tua melihat hasil →
Lebih banyak pendaftar → Sekolah ditanya → Sekolah mengadopsi →
Guru memakai → Penerbit berubah → Kompetitor muncul → Standar bergeser
```

Perubahan mengalir dari *anak → keluarga → sekolah → industri → kebijakan* (*market-driven educational evolution*).

**Syarat Keras:** Materi harus jauh lebih baik, bukan sekadar 10% lebih rapi.
*Pola target:* **Eksperimen → Prediksi → Gagal → Visualisasi → Pertanyaan Socratic → Derivasi → Transfer → Proyek.**

---

## 11. Asumsi Terbuka dan Risiko

*Bagian ini sengaja jujur. Dokumen konsep yang tidak memuat kelemahannya sendiri akan menyesatkan keputusan berikutnya.*

| # | Risiko / Asumsi | Dampak | Arah Mitigasi |
| :---: | :--- | :--- | :--- |
| **1** | **Reliabilitas Feynman Sensor.** Mendiagnosis pemahaman dan miskonsepsi dari dialog adalah masalah riset terbuka. | Seluruh *learner model* bergantung padanya. *Diagnosis noise* → intervensi salah. | Uji akurasi diagnosis vs penilaian manusia sebelum membangun lapisan lain. |
| **2** | **Debt Risk belum operasional.** *Future Relevance* dan *Uncertainty* sulit dikuantifikasi; lintasan anak berubah-ubah. | Prediksi tampak presisi, padahal tebakan. | Mulai dari $\text{Decay} \times \text{Dependency Centrality}$ pada jalur aktif; perlakukan *Uncertainty* sebagai interval kepercayaan, bukan pengali. |
| **3** | **Metrik tampak presisi tanpa definisi.** (82%, 74%, "Curiosity 96"). | Risiko *Goodhart*: anak mengoptimalkan dasbor. *Curiosity* sulit diukur tanpa merusaknya. | Definisi operasional tiap metrik; tandai metrik eksperimental; tampilkan ketidakpastian. |
| **4** | **Capability Stage bisa diam-diam berbasis umur.** | Kembali ke ukuran *batch*. | Kalibrasi terhadap *graph* dan *evidence*, bukan populasi sekolah. |
| **5** | **Retensi vs tanpa dark pattern.** *Curiosity* anak tidak selalu konsisten. | *Churn* tinggi jika tak ada pengait artifisial. | Uji apakah desain intrinsik cukup menahan retensi; jangan menyelundupkan mekanisme eksploitatif. |
| **6** | **Belajar mandiri tidak cocok untuk semua anak.** Motivasi dan disiplin sering lahir dari konteks sosial. | Melebarkan ketimpangan performa. | Peran orang tua/mentor; desain adaptif untuk anak berbagai tingkat motivasi awal. |
| **7** | **Ketimpangan akses.** Keluarga berkemampuan tinggi mengadopsi lebih dulu. | Sistem memperkuat kesenjangan sebelum mengoreksinya. | Rumuskan strategi akses dan penetapan harga inklusif sejak awal. |
| **8** | **Kepemilikan dan privasi Learner Model.** Profil kognitif seumur hidup seorang anak. | Aset sekaligus risiko privasi terbesar. | Tetapkan pemilik data kedaulatan, kontrol orang tua, hak ekspor/hapus, dan audit ketat sebelum data dikumpulkan. |
| **9** | **Etika stealth insertion.** Menyembunyikan remedial baik secara psikologis, tapi sistem yang mengarahkan pengalaman secara diam-diam bisa menjadi manipulasi. | Mengancam integritas kepercayaan orang tua dan anak. | Transparansi penuh ke orang tua; keterbukaan bertahap kepada anak seiring bertambahnya usia. |
| **10** | **"Pressure from below" adalah rantai asumsi.** Celahnya: pengukuran hasil formal, akreditasi, gerbang seleksi perguruan tinggi. | Adopsi massal terhambat oleh sistem lama. | Definisikan bukti portofolio hasil penalaran yang dapat diverifikasi pihak luar secara objektif. |
| **11** | **Visi ≠ Bukti.** Belum ada data efektivitas empiris. Analogi (*"GitHub untuk pikiran"*) retoris, bukan teknis. | Risiko *over-investment* pada hipotesis yang belum teruji. | Validasi bertahap melalui peta jalan tahap demi tahap (lihat Bagian 12). |

---

## 12. Peta Jalan (Urutan Pembangunan)

> **Prinsip Urutan:** Data model dulu, antarmuka belakangan. Jangan mulai dari Open edX atau sekadar kosmetik UI. MVP pertama boleh jelek secara visual namun kokoh secara fondasi kausal.

- **Tahap 0 · Skema:** Rumuskan entitas *graph*, *evidence*, *misconception*, dan *learner state* (Bagian 5.3).
- **Tahap 1 · Satu Domain Sempit:** Contoh dari pecahan sampai persamaan, $\pm 50-100$ node. Uji dengan satu pengguna pertama.
- **Tahap 2 · Uji Hipotesis Pusat:** Apakah diagnosis miskonsepsi oleh AI cocok dengan penilaian manusia yang teliti? Jika ya, lapisan di atasnya layak dibangun. Jika tidak, perbaiki sensor sebelum menambah fitur lain.
- **Tahap 3 · Evidence + Learner Model:** Log bukti, pembaruan *state*, *next-best-experience*.
- **Tahap 4 · Repair Loop:** Deteksi *decay* dan *stealth insertion*, dimulai dari $\text{Decay} \times \text{Dependency Centrality}$.
- **Tahap 5 · Telemetri:** Dasbor terkalibrasi dengan metrik yang sudah terdefinisi.
- **Tahap 6 · Perluasan Domain dan Model Bisnis:** Dilakukan setelah nilai inti dan retensi organik terbukti.

---

## 13. Log Keputusan Desain

| Keputusan | Alasan |
| :--- | :--- |
| **IQ bukan master variable** | Tidak dapat diobservasi langsung, berisiko menjadi label pembatas yang mematikan pertumbuhan. |
| **Graph sebagai source of truth, bukan AI** | Menjamin konsistensi, auditabilitas, validitas epistemik, dan keamanan struktural. |
| **Knowledge Graph dan Learner Model dipisah** | Peta dunia objektif berbeda dari posisi subyektif seorang individu. |
| **Mastery berlapis (7 level), bukan 100% biner** | Menangkap kedalaman transfer dan penjelasan kausal, bukan hanya ketepatan rutinitas mekanis. |
| **Feynman sebagai sensor, bukan ujian akhir** | Diagnosis berlangsung berkelanjutan tanpa memicu stres evaluasi formal. |
| **"Zero Critical Debt", bukan Zero Debt** | Realistis terhadap sifat lupa biologis manusia; fokus pada perlindungan node prasyarat kritis. |
| **Profil per domain + tren, tanpa "mental age"** | Menghindari label linier yang menyederhanakan ragam kecerdasan secara reduktif. |
| **Sekolah dipertahankan sebagai Social Sandbox** | Kompetensi sosial, empati, dan resolusi konflik nyata tidak sepenuhnya dapat disimulasikan AI. |
| **Tanpa dark pattern** | Selaras dengan tujuan etika pendidikan sejati; mendorong motivasi otonom. |
| **Free vs Subscriber dibedakan oleh kekuatan mesin** | Menghindari sistem terdegradasi kembali menjadi sekadar "sekolah online" atau kursus video pasif. |

---

## 14. Glosarium

- **Intelligence OS:** Sistem operasi personal untuk perkembangan intelektual; lapisan intelektual dari model dua lapis (bersama *Social Sandbox*).
- **Social Sandbox:** Lingkungan fisik untuk mengasah konflik, negosiasi, kepemimpinan, empati, dan kerja tim antar manusia.
- **Knowledge Graph:** Peta konsep, keterampilan (*skill*), prasyarat (*prerequisite*), dan rantai *WHY*.
- **Learner Model:** Representasi matematis dan kualitatif keadaan belajar seorang anak per node pengetahuan.
- **Evidence Log:** Catatan bukti kemampuan, tindakan eksperimental, dan cara berpikir anak yang tahan lama.
- **Misconception Graph:** Peta cara berpikir keliru yang lazim serta jalur intervensi koreksi (*counterexample*).
- **Feynman Sensor:** Mekanisme evaluasi pemahaman mendalam lewat penalaran dan penjelasan Socratic terpandu.
- **Epistemic Debt:** Akumulasi celah fondasi pemahaman yang menjadi *bottleneck* pada materi tingkat lanjut.
- **Critical Epistemic Debt:** *Epistemic debt* pada node prasyarat yang berisiko meruntuhkan lintasan belajar aktif.
- **Stealth Insertion / Passive Contextual Remediation:** Menyisipkan perbaikan fondasi ke dalam proyek berminat tinggi tanpa label remedial yang memalukan.
- **Cognitive Bottleneck Prediction:** Prediksi titik kritis yang akan terhambat jika *decay* pada prasyarat tidak segera dipulihkan.
- **Capability Stage:** Tahap penguasaan per domain berdasarkan *evidence* konkret, bebas dari pembatasan batch umur.
- **Unbatching Cognition:** Melepaskan lintasan perkembangan intelektual dari pengelompokan tahun lahir/usia biologis.
- **Pressure from Below:** Perubahan sistemik pendidikan yang didorong dari adopsi organik keluarga dan anak, bukan paksaan birokrasi dari atas.

---
*Dokumen ini adalah konsolidasi dari serangkaian diskusi konsep. Bagian 11 dan 12 wajib ditinjau ulang setiap kali arsitektur mengalami iterasi.*
