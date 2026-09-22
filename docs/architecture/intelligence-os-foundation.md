# Personal Intelligence OS
### Dokumen Fondasi: Konsep, Prinsip, dan Arsitektur

**Status:** Draf v0.1 (konsolidasi) · **Sifat:** Dokumen hidup · **Cakupan:** Konsep, arsitektur logis, model bisnis, risiko. Belum mencakup UI, implementasi teknis, atau konten.

---

## 1. Ringkasan

**Tesis.** Pendidikan pasca-COVID hanya mendigitalkan birokrasi abad ke-19: manusia diproses per batch berdasarkan tahun lahir, kurikulum linear, dan hafalan. Perubahan medium (papan tulis → layar) tidak mengubah logika dasarnya.

**Gagasan.** Proyek ini bukan LMS dan bukan "sekolah online". Ini adalah **Personal Intelligence OS**: sebuah sistem yang memelihara perkembangan intelektual seorang manusia sebagai lintasan yang unik. Pendidikan hanya menjadi *interface* pertamanya.

**Pembagian fungsi inti:**

| Lapisan | Fungsi | Dioptimalkan untuk |
|---|---|---|
| **Sekolah (Social Sandbox)** | Belajar hidup bersama manusia | Interaksi, kalibrasi sosial, lingkungan fisik |
| **Intelligence OS** | Membangun kapabilitas intelektual sendiri | Lintasan individu, mastery, akselerasi |
| **Rumah** | Budaya, nilai, kebiasaan, observasi | Karakter |
| **AI** | Tutor Socratic, simulasi, umpan balik, navigasi pengetahuan | Diagnosis dan pendampingan |
| **Orang tua** | Arsitek, pengamat, pengambil keputusan | Arah dan pengawasan |

**Prinsip satu kalimat:** *Mass education tidak harus berarti standardized education. Satu mesin yang sama, jutaan jalur berbeda.*

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

Prinsip-prinsip ini bersifat mengikat bagi keputusan arsitektur dan produk berikutnya.

1. **Ukur *observable learning state*, bukan IQ.** Sistem mengukur mastery, transfer, retensi, kedalaman penalaran, pola kesalahan, dan learning rate. IQ paling jauh hanya satu hipotesis, bukan variabel master di database.
2. **Graph adalah sumber kebenaran.** Knowledge Graph menentukan struktur. AI bukan "Supreme Curriculum God".
3. **Pisahkan peta ilmu dari peta anak.** Knowledge Graph (dunia ilmu) dan Learner Model (posisi anak terhadap dunia itu) adalah dua entitas berbeda. Jangan dicampur.
4. **Simpan bukti, bukan progress bar.** Yang disimpan adalah *evidence*: apa yang dilakukan anak, bagaimana ia menjelaskan, di mana transfernya gagal.
5. **Kesalahan adalah data emas.** Sistem harus tahu *bagaimana* anak salah, bukan hanya *bahwa* ia salah.
6. **Umur adalah metadata, kemampuan adalah ukuran.** Umur menunjukkan *di mana manusia berada*. Kapabilitas menunjukkan *apa yang bisa ia lakukan*.
7. **Forward motion + backward repair.** Anak terus maju, fondasi diperbaiki sambil berjalan. Tidak ada "turun ke kelas 4".
8. **Zero *Critical* Epistemic Debt, bukan Zero Debt.** Manusia memang lupa. Yang dijaga adalah decay pada prerequisite yang berbahaya bagi lintasan.
9. **Why-first.** Aturan → Prinsip → Derivasi. Setiap konsep berakar pada pertanyaan "kenapa".
10. **No content without a cognitive purpose.** Setiap materi harus membangun konsep, memperbaiki miskonsepsi, melatih kemampuan, membuka prerequisite, atau membuktikan transfer. Selain itu dibuang.
11. **Voluntary engagement, bukan behavioral exploitation.** Tanpa FOMO, loot box, streak anxiety, scarcity buatan, atau notifikasi spam.
12. **Tidak ada endpoint.** Dunia tidak "ditutup" karena kurikulum selesai. Penguasaan membuka kapabilitas baru.

---

## 4. Arsitektur Logis

### 4.1 Gambaran umum

```
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
|---|---|---|
| **Knowledge Graph** | Peta konsep, skill, prerequisite, dan lapisan WHY | Source of truth struktur |
| **Learner Model** | Keadaan anak per node: mastery, retensi, transfer, miskonsepsi | Diperbarui dari evidence |
| **Evidence Log** | Rekam jejak interaksi bermakna | Aset jangka panjang, dapat dibuka kembali bertahun-tahun kemudian |
| **Misconception Graph** | Peta cara berpikir yang keliru dan koreksinya | Lihat 6.3 |
| **Adaptive Engine** | Memilih pengalaman belajar berikutnya yang paling informatif | Membaca graph + learner state |
| **AI Tutor** | Bertanya, mendengar, mendiagnosis, menghasilkan simulasi | Bukan penentu kurikulum |
| **Parent View / Child View** | Tampilan berbeda atas data yang sama | Transparansi ke orang tua |

### 4.3 Aliran data utama

```
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

Peran AI dibatasi: **tutor + diagnostician + generator + simulator interface**. AI membaca graph, melihat learner state, memilih intervensi, bertanya, membaca jawaban, menghasilkan evidence, dan memperbarui learner model. AI tidak menulis ulang graph secara otonom.

---

## 5. Knowledge Graph

### 5.1 Struktur

Kurikulum linear diganti **Dynamic Knowledge Graph** ("Skill Tree"). Domain saling memberi makan:

```
Bar Model (visual logic)
   └→ Aljabar Simbolik
          ├→ Fisika Mekanik
          ├→ Pemrograman / Algoritma
          └→ Kalkulus
```

Anak bisa berada di node pemrograman sambil tetap pada level usia untuk motorik halus. Sistem beradaptasi, anak tidak ditahan oleh "batch"-nya.

### 5.2 Lapisan WHY

Graph menyimpan bukan hanya *apa*, tapi juga *kenapa*:

```
Kenapa aljabar ada?
   ↓ Bagaimana manusia merepresentasikan kuantitas yang belum diketahui?
   ↓ Kenapa representasi simbolik?
   ↓ Kenapa persamaan?
   ↓ Kenapa transformasi mempertahankan kesetaraan?
   ↓ Asumsi apa yang membuatnya valid?
```

Hasilnya: anak tidak belajar "pindahkan x ke sebelah kanan", tetapi "kita melakukan operasi yang sama pada kedua sisi karena ingin mempertahankan hubungan kesetaraan".

### 5.3 Skema node (draf)

```json
{
  "concept": "equality",
  "prerequisites": ["quantity", "comparison"],
  "explanation_levels": ["concrete", "visual", "symbolic", "formal"],
  "mastery_evidence": ["solve", "explain", "predict", "transfer", "create"],
  "why_chain": ["..."]
}
```

Entitas skema minimum: `Concept`, `Skill`, `Prerequisite`, `Evidence`, `Misconception`, `Assessment`, `Resource`, `Experiment`, `Project`, `Learner State`.

---

## 6. Learner Model dan Mastery

### 6.1 Hierarki penguasaan

Mastery bukan skor biner atau persentase tunggal, melainkan hierarki:

**Recognition → Recall → Understanding → Application → Transfer → Explanation → Creation**

Contoh (pecahan): mengenali 1/2 (95%), menghitung 1/2 + 1/4 (90%), menjelaskan mengapa (70%), memakai pada masalah baru (40%), menemukan aplikasi sendiri (belum teruji).

Sistem tidak berkata "belum lulus pecahan", tetapi: *"Konsep dikuasai untuk aplikasi rutin, kemampuan transfer belum terverifikasi."*

### 6.2 Feynman Sensor

Teknik Feynman dipakai sebagai **sensor**, bukan ujian akhir. AI mengajukan pertanyaan Socratic (misalnya "kenapa kapal besi mengapung, sedangkan besi yang dimasukkan begitu saja tenggelam?"), lalu menganalisis jawaban:

```
Concept:      Buoyancy ✓  Density ✓  Displacement ✓
Reasoning:    Causal chain ✓  Analogy ✓  Transfer ?
Misconception: "berat menentukan tenggelam/mengapung" (terdeteksi)
```

Output bukan nilai 8/10, melainkan pembaruan learner model:

```
Buoyancy
├── conceptual understanding  0.91
├── causal reasoning          0.83
├── transfer                  0.54
└── misconception             detected
```

Engine lalu memilih pengalaman berikutnya yang paling informatif.

### 6.3 Misconception Graph

```
Anak
 ├── memahami density
 ├── memahami mass
 └── miskonsepsi: "lebih berat → tenggelam"
          ↓ counterexample
          ↓ revised model
```

### 6.4 Evidence Log

Contoh entri:

```
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

Bertahun-tahun kemudian, log ini memperlihatkan *bagaimana cara berpikir anak berubah*.

---

## 6.5 Perturbation Testing & Epistemic State Primitive

Bagian ini memperluas mekanisme Feynman Sensor (6.2). Motivasinya: skor jawaban benar/salah tidak membuktikan *structural understanding* — baik pada anak maupun pada AI tutor itu sendiri. Kesamaan pola kegagalannya identik:

| Gejala | Anak | AI |
|---|---|---|
| Terlihat kompeten tanpa struktur | Hafal rumus | Hafal pola |
| Jawaban benar | Retrieval definisi | Output benar |
| Runtuh saat digeser sedikit | Bingung saat soal berubah | Semantic perturbation → hallucination |

Prinsip intinya: **jangan tanya "apakah dia tahu jawabannya", tanya "kalau karpetnya dicabut, apakah strukturnya masih berdiri".**

### 6.5.1 Enam layer perturbation

```
Learn → Perturb → Transfer → Contradict → Reconstruct → Verify
```

| Layer | Yang diuji | Contoh (division by zero) |
|---|---|---|
| 0 — Memorization | Pernah lihat pola persis | "6÷0 tidak terdefinisi" (hafalan) |
| 1 — Pattern Generalization | Permukaan berubah, struktur tetap familiar | Soal serupa dengan angka berbeda |
| 2 — Semantic Perturbation | Satu hubungan penting digeser | Bedakan 6÷0 (no solution) vs 0÷0 (infinitely many solutions) |
| 3 — Counterfactual Transfer | Asumsi fundamental diubah | Bedakan 1/0 vs lim(x→0⁺) 1/x |
| 4 — Contradiction Handling | Dua klaim tampak bertentangan diberikan sekaligus | "1/x→∞ saat x→0⁺" vs "1/0 undefined" — objek matematis apa yang berbeda? |
| 5 — Reconstruction | Jelaskan ulang tanpa istilah kunci | Jelaskan tanpa kata "undefined", "limit", "infinity" |
| — Verify | Instance baru yang belum pernah muncul | Uji apakah rekonstruksi menghasilkan konsekuensi benar pada kasus baru |

**Catatan penting:** Verify diletakkan terakhir karena Reconstruction saja tidak cukup — model (atau anak) bisa menghasilkan narasi yang *terdengar* koheren tanpa struktur di baliknya benar-benar stabil. Verify menutup celah itu dengan instance baru.

Implikasi desain: satu konsep sebaiknya disimpan sebagai **graph keluarga perturbation**, bukan satu soal-satu-jawaban. Contoh untuk *division by zero*:

```
Division
   ├── b ≠ 0 → ordinary
   └── b = 0
        ├── a ≠ 0 → no solution
        └── a = 0 → infinitely many solutions
             ├── exact point (a/0)
             └── approaching (lim a/x)
```

Sistem menguji apakah boundary antar-node ini dipertahankan, bukan menghafal satu jawaban.

### 6.5.2 Epistemic State Primitive

Target akhir Intelligence OS bukan membuat Arya *selalu punya jawaban*. Justru sebaliknya: Arya harus bisa membedakan status epistemiknya sendiri secara eksplisit.

```
Known ≠ Believed ≠ Hypothesized ≠ Unknown
```

Contoh ekspresi sehat: "Aku tahu." / "Aku bisa menurunkan ini secara logis." / "Ini hipotesisku." / "Ini asumsi yang sedang kupakai." / "Dua model masih mungkin, datanya belum cukup." / "Modelku baru saja runtuh." / "Aku tadi salah."

**Syarat validitas — kalibrasi, bukan sekadar pengucapan.** Label epistemik murah untuk diproduksi. Anak atau AI bisa belajar mengucapkan "ini hipotesisku" sebagai *hedging linguistik* tanpa itu mencerminkan derajat keyakinan internal yang berbeda. Kalau begitu, primitive ini hanya memindahkan masalah *illusion of competence* ke lapisan meta, bukan menyelesaikannya.

Maka syarat operasionalnya: **label harus terkalibrasi**. Sesuatu yang ditandai "hypothesized" harus, lintas banyak instance, secara statistik lebih sering salah dibanding yang ditandai "known". Tanpa uji kalibrasi ini, empat label tersebut hanya teater, bukan evidence.

### 6.5.3 World-Ω: batas metodologis pengujian tanpa source-of-truth eksternal

Ide menguji reasoning lewat "dunia aksioma baru" (mis. objek berwarna dengan aturan tarik-menolak fiktif) berguna untuk menguji **rule-following dan belief revision** — apakah sistem konsisten terhadap aksioma yang diberikan dan mampu merevisi model dunianya saat satu aksioma ternyata bersyarat.

Tapi ini **bukan** pengujian "reasoning tanpa source of truth". Begitu aksioma dunia itu dituliskan, sistem itu sendiri menjadi source-of-truth lokal — sumbernya cuma berpindah dari Wikipedia ke perancang dunia. Yang benar-benar dekat ke *abduction* (mengusulkan struktur dari fenomena mentah tanpa aksioma diberikan) adalah Layer ② "Ontology Formation" pada skema perturbation, dan itu justru yang paling sulit dirancang: penilai butuh cara menilai "struktur yang diusulkan model" tanpa penilai sendiri sudah tahu jawabannya — begitu penilai tahu jawabannya untuk menilai, masalahnya kembali berputar.

**Koreksi premis yang lebih mendasar:** "reasoning tanpa anchor sama sekali" kemungkinan bukan sekadar sulit, tapi *undefined* — untuk manusia maupun AI. Non-kontradiksi, kausalitas, dan identitas adalah anchor minimal yang dibutuhkan supaya ada sesuatu untuk ditalar sama sekali. Spektrum yang lebih defensible bukan *Anchor vs No-Anchor*, melainkan **seberapa minimal dan seberapa portabel anchor itu**. Keunggulan manusia kemungkinan besar bukan karena tanpa anchor, tapi karena anchornya sangat abstrak dan generik sehingga bisa dipasang cepat ke domain apa pun.

Spektrum yang lebih tepat:

```
Fixed Anchor → Local Anchor → Abstract Anchor → Portable Anchor →
Constructed Anchor → Revisable Anchor → Calibrated Anchor
```

Rumusan kerja: **Intelligence ≈ kemampuan membangun, memilih, mentransfer, merevisi, dan mengkalibrasi anchor** — bukan ketiadaan anchor.

### 6.5.4 Dua jalur pengujian: Knowledge vs Discovery

Framework 6.5.1 (Learn→Perturb→Transfer→Contradict→Reconstruct→Verify) menguji apakah sistem memahami struktur yang **sudah tersedia** (deduksi dari premis yang diberikan). Itu tidak menguji apakah sistem bisa **membangun** struktur ketika premis belum diberikan (abduksi dari fenomena mentah). Keduanya butuh mekanisme evaluasi berbeda dan tidak boleh dicampur:

```
Jalur Knowledge:  Learn → Perturb → Transfer → Contradict → Reconstruct → Verify
Jalur Discovery:  Observe → Hypothesize → Predict → Encounter → Revise → Re-predict
```

**Desain Jalur Discovery (Open-World Abduction Test).** Evaluator hanya menyediakan observasi O₁...Oₙ, tanpa mengungkap teori yang mendasarinya. Sistem menghasilkan hipotesis H₁, H₂, ... beserta asumsi, prediksi, confidence, dan kondisi falsifikasi. Evaluator lalu memberi observasi baru secara adaptif. Pertanyaannya bukan "apakah jawabanmu benar", tapi "bagaimana modelmu bertahan ketika realitas terus masuk" — dan yang lebih penting: **apakah sistem menyadari ketika hipotesisnya gagal**, lalu merevisi tanpa menghancurkan bagian yang masih valid.

**Batas metodologis #1 — ini bukan benar-benar "tanpa ground truth".** Observasi O₁...Oₙ tetap dihasilkan oleh sebuah proses generatif (simulasi, sistem nyata, atau aturan yang evaluator ketahui tapi tidak umumkan). Yang berubah bukan keberadaan ground truth, tapi *keterbukaannya*. Bingkai yang jujur: **truth-undisclosed, bukan truth-absent** — mirip ilmuwan yang menguji hipotesis terhadap alam tanpa "kunci jawaban", di mana alam tidak perlu tahu bahasa hipotesis model, ia cukup konsisten menghasilkan kejadian. Kalau tidak dibingkai begini, kita diam-diam mengulang kesalahan World-Ω (6.5.3) dengan penyamaran baru.

**Batas metodologis #2 — kriteria evaluasi hipotesis adalah anchor tingkat-meta.** Karena tidak ada H* (jawaban benar) untuk dibandingkan, hipotesis dinilai lewat propertinya sendiri:

| Kriteria | Pertanyaan |
|---|---|
| Constraint preservation | Menjelaskan seluruh observasi tanpa kontradiksi? |
| Minimality | Tidak menambah asumsi yang tak perlu? |
| Predictive discrimination | Menghasilkan prediksi berbeda dari hipotesis alternatif? |
| Counterfactual robustness | Tetap koheren saat kondisi diubah? |
| Falsifiability | Sistem bisa menyatakan observasi apa yang akan membuktikannya salah? |
| Revision cost | Bisa memperbaiki bagian salah tanpa menghancurkan bagian valid? |

Enam kriteria ini **bukan pilihan netral** — *minimality* mengandung Occam's Razor, *falsifiability* mengandung kriteria demarkasi Popperian, keduanya punya sejarah kontroversi filsafat ilmu sendiri (Kuhn, Lakatos). Menghapus anchor konten (H*) tidak menghapus anchor evaluasi — anchor hanya naik satu level, dari "apa jawaban benar" menjadi "apa yang membuat model dianggap baik". Tidak ada *view from nowhere*. Konsekuensi desain: ketika kriteria saling tarik (hipotesis paling minimal kadang paling tidak diskriminatif), sistem butuh **decision rule eksplisit** untuk konflik itu — enam kriteria ini tidak boleh diam-diam diasumsikan selalu sejalan.

### 6.5.5 Kalibrasi pada skala satu anak

Kalibrasi epistemic-state (6.5.2) — "yang ditandai Known harus secara statistik lebih sering benar dari yang ditandai Hypothesized" — valid sebagai prinsip, tapi butuh N besar untuk bermakna secara statistik. Learner model personal punya data kecil dan non-stationary (Arya usia 8 berbeda dari Arya usia 9), sehingga kalibrasi per-konsep dengan n=5-10 observasi nyaris tidak bermakna.

Dua jalan operasional yang realistis:
- **(a) Kalibrasi populasi sebagai prior.** Dihitung lintas banyak anak, diterapkan sebagai prior untuk Arya, lalu disesuaikan seiring data individunya bertambah.
- **(b) Konsistensi diri jangka panjang.** Melacak apakah pola "Known → benar" milik Arya sendiri stabil dari waktu ke waktu, bukan uji statistik formal per konsep.

Tanpa salah satu dari ini, klaim "label terkalibrasi" tidak bisa dioperasionalkan pada skala satu anak — primitive 6.5.2 tetap berharga sebagai struktur, tapi validasinya harus ditunda sampai salah satu jalur ini tersedia.

### 6.5.6 Tiga Layer Status: Modal, Epistemik, Belief

Pertanyaan "siapa yang menghakimi hakim?" (muncul dari kriteria evaluasi hipotesis di 6.5.4) tidak selesai dengan menambah satu evaluator lagi — evaluator baru pun membawa anchor sendiri, dan itu bisa berulang tanpa akhir. Jalan keluarnya bukan menghilangkan anchor, tapi **memaksa anchor untuk mendeklarasikan dirinya secara eksplisit**, dan memisahkan tiga kategori status yang selama ini sering tercampur dalam satu output "jawaban":

| Layer | Pertanyaan | Contoh nilai | Sumber warrant |
|---|---|---|---|
| **1 — Status Modal** | Apakah ini mungkin secara logis sama sekali? | Wujūb (niscaya) / Istiḥālah (mustahil) / Jawāz (mungkin) | Akal murni (a priori), independen dari evidence |
| **2 — Status Epistemik** | Apa yang kita ketahui tentangnya? | Known / Supported / Hypothesis / Unknown / Underdetermined / Contradicted / Revised | Evidence yang terkumpul |
| **3 — Belief State** | Seberapa kuat hipotesis ini dipegang sementara? | Preferred / Plausible / Weak / Suspended, atau derajat numerik | Komitmen sementara agen, revisable |

**Prinsip inti:** Layer 1 ≠ Layer 2 ≠ Layer 3. Ketiganya boleh punya nilai berbeda untuk satu hipotesis yang sama tanpa kontradiksi — misalnya H₁ bisa berstatus *jawāz* (Layer 1), *underdetermined* (Layer 2), dan *preferred dengan belief 0.6* (Layer 3) secara bersamaan.

**Kegunaan utama: epistemic preservation.** Ketika dua hipotesis sama-sama kompatibel dengan seluruh observasi yang ada, sistem tidak dipaksa memilih satu sebagai "benar". Ia menyatakan keduanya *jawāz*, mencatat bahwa belum ada observasi yang mendiskriminasi keduanya, dan menahan diri dari *collapse* prematur. Ini konsisten dengan prinsip *epistemic state primitive* (6.5.2) — bedanya, di sini pemisahannya lebih tajam: keputusan untuk *tidak memilih* itu sendiri punya struktur tiga-layer yang bisa diperiksa, bukan sekadar label "hipotesis" yang datar.

**Koreksi cakupan Layer 1 — bukan pembeda halus, tapi gerbang kasar.** Wujūb dan istiḥālah ditetapkan lewat konsistensi logis murni (dalīl ʿaqlī), bukan lewat kecocokan dengan observasi. Konsekuensinya: hampir seluruh hipotesis empiris yang koheren secara internal — termasuk H₁ dan H₂ pada kasus mekanisme fisik yang bersaing — akan sama-sama jatuh ke *jawāz*. Layer 1 **tidak** menjawab "mana yang lebih didukung"; ia hanya menjawab "apakah ini bahkan layak dipertimbangkan sama sekali" (menyingkirkan hipotesis yang self-contradictory sebelum evidence apa pun dilibatkan). Seluruh pekerjaan memilih di antara kandidat yang tersisa terjadi murni di Layer 2 dan 3. Implementasi Layer 1 harus berupa **gerbang biner koherensi logis**, bukan gradasi — begitu Layer 1 diberi "tingkat kejawāz-an" atau dicampur dengan evidence, ia diam-diam melebur ke Layer 2/3 dan pemisahan tiga-layer ini runtuh.

**Anchor yang dideklarasikan, bukan kerangka netral.** Konsisten dengan prinsip yang sudah ditetapkan di 6.5.4 (kriteria evaluasi hipotesis bukan netral, harus didokumentasikan sebagai komitmen filosofis eksplisit): memilih wujūb–istiḥālah–jawāz sebagai kerangka Layer 1 **juga** adalah komitmen epistemologis tertentu, berasal dari tradisi kalām rasionalis (via al-Sanūsī), bukan kerangka modal yang netral secara universal. Dokumen ini mengadopsinya secara sadar sebagai anchor Layer 1 yang dideklarasikan — bukan diklaim sebagai satu-satunya cara sah untuk membangun lapisan modal.

---

## 7. Self-Healing Learning

### 7.1 Epistemic Debt

Istilah desain sistem (bukan diagnosis psikologis formal) untuk akumulasi celah fondasi yang menjadi bottleneck di materi lanjutan.

### 7.2 Mekanisme

```
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

### 7.3 Stealth insertion (Passive Contextual Remediation)

Remedial tidak menjadi ruangan terpisah, melainkan fungsi tersembunyi dalam perjalanan belajar.

- **Sinyal decay:** aljabar factoring turun 15%.
- **Prediksi bottleneck:** decay ini akan menyulitkan modul yang akan datang.
- **Reconsolidation:** aljabar disisipkan ke proyek berminat tinggi (misalnya kapal selam: "berapa volume air yang harus dipindahkan agar berat totalnya berubah menjadi X?").
- **Hasil:** fondasi pulih sebagai efek samping penemuan, tanpa rasa malu.

### 7.4 Debt Risk

Formulasi konseptual:

```
Debt Risk = Decay × Dependency Centrality × Future Relevance × Uncertainty
```

Yang penting bukan seberapa lupa suatu konsep, tetapi seberapa berbahaya kelupaan itu bagi masa depan graph. Contoh: penurunan kecil pada aritmetika tidak perlu dipanik-kan, tetapi decay besar pada aljabar linear ketika anak bergerak menuju komputasi kuantum harus memicu reaksi.

> **Catatan status:** Dua faktor (*Future Relevance*, *Uncertainty*) belum punya definisi operasional. Lihat bagian 11.

### 7.5 Cognitive Bottleneck Prediction

Sistem tidak hanya berkata "anak lupa factoring", tetapi "jika decay berlanjut, node X/Y/Z pada lintasan aktif menjadi lebih sulit". Ini *predictive maintenance* untuk pengetahuan: jangan menunggu bearing pecah baru diperbaiki.

---

## 8. Empat Loop Sistem

| Loop | Alur | Fungsi |
|---|---|---|
| **Curiosity** | Explore/Build → Kapabilitas baru → Rasa ingin tahu baru | Motivasi intrinsik, tanpa endpoint |
| **Mastery** | Evidence → Assessment → Mastery | Verifikasi penguasaan berlapis |
| **Repair** | Decay terdeteksi → Reconsolidation kontekstual → Pengetahuan pulih | Fondasi tidak retak |
| **Trajectory** | Analisis dependensi/bottleneck → Kapabilitas berikutnya terbuka → Abstraksi lebih tinggi | Arah perkembangan |

Inilah pembeda dari LMS: LMS menyimpan materi, Intelligence OS memelihara perkembangan.

---

## 9. Telemetri dan Profil Kognitif

### 9.1 Prinsip

"Health telemetry untuk pengetahuan" seperti smartwatch: bukan satu angka, melainkan **profil per domain** dan **tren**.

- **Per domain, bukan satu skor.** Matematika Advanced, Bahasa Typical, Motorik Developing.
- **Tren pribadi, bukan perbandingan antar anak.** Pertanyaannya: "apakah kemampuan anak ini berkembang?"
- **Hindari "mental age" dan "IQ age".** Label ini membatasi anak.

### 9.2 Contoh dasbor

```
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

Alih-alih "umur mental", dipakai *Capability Stage* per domain: berdasarkan evidence, kemampuan tertentu sudah menangani kompleksitas yang biasanya diperkenalkan pada tahap belajar tersebut. Stage tidak menetapkan langit-langit berdasarkan umur.

> **Catatan status:** Basis kalibrasi Stage belum didefinisikan. Lihat bagian 11.

### 9.4 Pergeseran dari orang tua

Dari "hari ini anak saya belajar apa?" menjadi "bagaimana *struktur kemampuan* anak saya berubah minggu ini?"

---

## 10. Produk dan Model Bisnis

### 10.1 Positioning

Jangan jual "AI tutor" (mudah ditiru). Jual:

> *Satu sistem yang tahu apa yang sudah Anda kuasai, apa yang belum, mengapa Anda salah, dan apa yang harus dipelajari berikutnya.*

Nilai sesungguhnya ada di **Knowledge Graph + kualitas konten + Assessment Engine + Learner Model + Adaptive Engine**. AI hanya salah satu mesinnya.

DNA produk: **"Don't sell education. Sell the ability to learn anything."**

### 10.2 Tiga mesin

```
KNOWLEDGE ENGINE    ADAPTIVE ENGINE    DISCOVERY ENGINE
"Apa yang ada?"     "Apa yang cocok?"  "Apa yang menarik?"
         └──────────────┼──────────────┘
                    CURIOSITY → VOLUNTARY USE → SUBSCRIPTION
```

Subscription adalah *konsekuensi* nilai, bukan gerbang masuk.

### 10.3 Struktur akses

- **Free:** merasakan sistem.
- **Subscriber:** infrastruktur intelijen penuh (adaptive learning, eksplorasi tanpa batas, AI Socratic tutor, simulasi lanjutan, personal knowledge graph, project lab, riwayat evidence, alat riset).
- **Hindari "premium course".** Yang dibayar adalah *mesin belajar yang lebih kuat*, bukan materi lebih banyak.

### 10.4 Psikologi nilai berulang

Orang membayar berulang bila (1) progres terasa *milik mereka*, dan (2) ada *continuous discovery*. Referensi: game dan AI consumer. Yang ditiru adalah *behavioral architecture* (voluntary engagement), **bukan** mekanisme eksploitasi.

### 10.5 Efek jaringan

Backend semakin cerdas seiring skala (pola miskonsepsi, kalibrasi soal, jalur belajar), tetapi frontend tetap personal: *massive scale di backend, personalized experience di frontend*.

### 10.6 Jalur perubahan: "pressure from below"

```
Platform → anak belajar lebih cepat → orang tua melihat hasil →
lebih banyak pendaftar → sekolah ditanya → sekolah mengadopsi →
guru memakai → penerbit berubah → kompetitor muncul → standar bergeser
```

Perubahan mengalir anak → keluarga → sekolah → industri → kebijakan (market-driven educational evolution).

**Syarat keras:** materi harus *jauh* lebih baik, bukan 10%. Pengalaman target: "gue baru sadar selama ini gue belajar konsep ini dengan cara yang salah." Pola: eksperimen → prediksi → gagal → visualisasi → pertanyaan Socratic → derivasi → transfer → proyek.

---

## 11. Asumsi Terbuka dan Risiko

Bagian ini sengaja jujur. Dokumen konsep yang tidak memuat kelemahannya sendiri akan menyesatkan keputusan berikutnya.

| # | Risiko / Asumsi | Dampak | Arah mitigasi |
|---|---|---|---|
| 1 | **Reliabilitas Feynman Sensor.** Mendiagnosis *pemahaman* dan miskonsepsi dari dialog adalah masalah riset terbuka. | Seluruh learner model bergantung padanya. Diagnosis noise → intervensi salah. | Uji akurasi diagnosis vs penilaian manusia sebelum membangun lapisan lain |
| 2 | **Debt Risk belum operasional.** *Future Relevance* dan *Uncertainty* sulit dikuantifikasi; lintasan anak berubah-ubah. | Prediksi tampak presisi, sebenarnya tebakan. | Mulai dari Decay × Dependency Centrality pada jalur aktif; perlakukan Uncertainty sebagai interval kepercayaan, bukan pengali |
| 3 | **Metrik tampak presisi tanpa definisi.** (82%, 74%, "Curiosity 96") | Risiko Goodhart: anak mengoptimalkan dasbor. Curiosity sulit diukur tanpa merusaknya. | Definisi operasional tiap metrik; tandai metrik eksperimental; tampilkan ketidakpastian |
| 4 | **Capability Stage bisa diam-diam berbasis umur.** | Kembali ke ukuran batch. | Kalibrasi terhadap graph dan evidence, bukan populasi sekolah |
| 5 | **Retensi vs. tanpa dark pattern.** Curiosity anak tidak selalu konsisten. | Churn tinggi jika tak ada pengait. | Uji apakah desain intrinsik cukup menahan retensi; jangan menyelundupkan mekanisme eksploitatif |
| 6 | **Belajar mandiri tidak cocok untuk semua anak.** Motivasi dan disiplin sering lahir dari konteks sosial. | Melebarkan ketimpangan. | Peran orang tua/mentor; desain untuk anak berbagai tingkat motivasi |
| 7 | **Ketimpangan akses.** Keluarga mampu mengadopsi lebih dulu. | Sistem memperkuat kesenjangan sebelum mengoreksinya. | Strategi akses dan harga sejak awal |
| 8 | **Kepemilikan dan privasi Learner Model.** Profil kognitif seumur hidup seorang anak. | Aset sekaligus risiko privasi terbesar. | Tetapkan pemilik data, kontrol orang tua, hak hapus/ekspor, audit, sebelum data dikumpulkan |
| 9 | **Etika stealth insertion.** Menyembunyikan remedial baik secara psikologis, tapi sistem yang mengarahkan pengalaman anak secara diam-diam bisa menjadi manipulasi. | Kepercayaan orang tua dan anak. | Transparansi penuh ke orang tua; keterbukaan bertahap ke anak seiring usia |
| 10 | **"Pressure from below" adalah rantai asumsi.** Celahnya: pengukuran hasil, kredensial, gerbang universitas. | Adopsi tidak terjadi. | Definisikan bukti hasil yang dapat diverifikasi pihak luar |
| 11 | **Visi ≠ bukti.** Belum ada data efektivitas. Analogi ("GitHub untuk pikiran") retoris, bukan teknis. | Overinvestasi pada hipotesis. | Validasi bertahap (bagian 12) |
| 12 | **Scope creep epistemologis.** Perturbation testing dan epistemic-state primitive (6.5) adalah program riset besar yang bisa membesar tanpa batas — dan mudah dijadikan syarat sebelum sistem "layak" dipakai. | Sistem tidak pernah selesai dibangun untuk pengguna nyata. | Perturbation testing jadi *penguat* validasi Tahap 2 di roadmap (bagian 12), bukan gerbang tambahan sebelum Tahap 1 dimulai |
| 13 | **Label epistemik tidak otomatis valid.** Kemampuan mengucapkan "known/believed/hypothesized/unknown" tidak sama dengan kalibrasi yang benar. | Primitive 6.5.2 bisa jadi hedging kosong, bukan sinyal nyata. | Wajib uji kalibrasi lintas instance sebelum primitive ini dipakai sebagai ukuran learner model |
| 14 | **World-Ω menguji rule-following, bukan abduction murni.** Dunia aksioma buatan tetap punya source-of-truth lokal (perancangnya). | Klaim "menguji reasoning tanpa anchor" terlalu kuat dan bisa menyesatkan desain benchmark. | Pisahkan eksplisit: uji belief-revision (World-Ω cocok) vs uji ontology-formation/abduction (butuh metode berbeda, lihat 6.5.4) |
| 15 | **Kriteria evaluasi hipotesis (6.5.4) adalah anchor tingkat-meta, bukan netral.** Minimality dan falsifiability membawa komitmen filsafat ilmu (Occam, Popper) yang sendiri diperdebatkan. | Sistem bisa terlihat "objektif" padahal menyematkan bias filosofis tertentu; kriteria bisa saling bertentangan tanpa aturan penyelesaian. | Buat decision rule eksplisit untuk konflik antar-kriteria; dokumentasikan komitmen filosofis yang dipilih, jangan sembunyikan sebagai "netral" |
| 16 | **Kalibrasi epistemic-state butuh N besar, tapi learner model personal punya N kecil dan non-stationary.** | Klaim "label terkalibrasi" (6.5.2) tidak bisa diuji secara statistik bermakna pada satu anak. | Pakai kalibrasi populasi sebagai prior, atau ukur konsistensi diri jangka panjang (6.5.5) — tunda validasi formal sampai salah satu tersedia |
| 17 | **Kerangka modal Layer 1 (wujūb/istiḥālah/jawāz, 6.5.6) adalah anchor filosofis yang dideklarasikan, bukan kerangka netral.** Berasal dari tradisi kalām rasionalis tertentu. | Kalau tidak dideklarasikan eksplisit, berisiko diperlakukan seolah "satu-satunya cara sah" membangun lapisan modal — pengulangan masalah meta-anchor di risiko #15. | Selalu nyatakan sebagai komitmen yang dipilih sadar; jangan campur gradasi Layer 1 dengan evidence (Layer 2) atau belief (Layer 3) |

---

## 12. Peta Jalan (Urutan Pembangunan)

**Prinsip urutan:** data model dulu, antarmuka belakangan. Jangan mulai dari Open edX atau UI. MVP pertama boleh jelek secara visual.

**Tahap 0 · Skema.** Rumuskan entitas graph, evidence, misconception, learner state (bagian 5.3).

**Tahap 1 · Satu domain sempit.** Contoh: dari pecahan sampai persamaan, ±50-100 node. Satu pengguna pertama.

**Tahap 2 · Uji hipotesis pusat.** *Apakah diagnosis miskonsepsi oleh AI cocok dengan penilaian manusia yang teliti?* Jika ya, lapisan di atasnya layak dibangun. Jika tidak, perbaiki sensor sebelum menambah fitur.

Perluasan uji di tahap ini (bukan gerbang baru, tapi memperdalam Tahap 2 — lihat risiko #12): tambahkan minimal Layer 0–2 dari skema perturbation (6.5.1) pada domain sempit yang sama. Pertanyaannya bukan lagi hanya "apakah diagnosis AI cocok dengan manusia", tapi *"apakah diagnosis itu bertahan setelah satu semantic perturbation sederhana"* (mis. domain pecahan: bedakan kasus yang terlihat mirip tapi berbeda struktur). Layer 3–5 dan primitive epistemik (6.5.2) ditunda sampai Layer 0–2 terbukti stabil.

**Tahap 3 · Evidence + Learner Model.** Log bukti, pembaruan state, next-best-experience.

**Tahap 4 · Repair Loop.** Decay detection dan stealth insertion, dimulai dari Decay × Dependency Centrality.

**Tahap 5 · Telemetri.** Dasbor sederhana dengan metrik yang sudah terdefinisi.

**Tahap 6 · Perluasan domain dan model bisnis.** Baru setelah nilai inti terbukti.

---

## 13. Log Keputusan Desain

| Keputusan | Alasan |
|---|---|
| IQ bukan master variable | Tidak dapat diobservasi langsung, berisiko menjadi label pembatas |
| Graph sebagai source of truth, bukan AI | Konsistensi, auditabilitas, keamanan |
| Knowledge Graph dan Learner Model dipisah | Peta dunia berbeda dari peta individu |
| Mastery berlapis (7 level), bukan 100% | Menangkap transfer dan penjelasan, bukan hanya rutinitas |
| Feynman sebagai sensor, bukan ujian akhir | Diagnosis berkelanjutan |
| "Zero *Critical* Debt", bukan Zero Debt | Realistis terhadap sifat lupa manusia |
| Profil per domain + tren, tanpa "mental age" | Menghindari label pembatas |
| Sekolah dipertahankan sebagai Social Sandbox | Kompetensi sosial tidak sepenuhnya dapat disimulasikan AI |
| Tanpa dark pattern | Selaras dengan tujuan pendidikan |
| Free vs Subscriber dibedakan oleh kekuatan mesin | Menghindari kembali menjadi "sekolah online" |

---

## 14. Glosarium

- **Intelligence OS:** Sistem operasi personal untuk perkembangan intelektual; lapisan intelektual dari model dua lapis (dengan Social Sandbox).
- **Social Sandbox:** Lingkungan fisik untuk konflik, negosiasi, kepemimpinan, empati, dan kerja tim.
- **Knowledge Graph:** Peta konsep, skill, prerequisite, dan WHY.
- **Learner Model:** Representasi keadaan belajar seorang anak per node.
- **Evidence Log:** Catatan bukti kemampuan dan cara berpikir.
- **Misconception Graph:** Peta cara berpikir keliru dan koreksinya.
- **Feynman Sensor:** Mekanisme diagnosis pemahaman lewat penjelasan Socratic.
- **Epistemic Debt:** Akumulasi celah fondasi yang menjadi bottleneck di materi lanjutan.
- **Critical Epistemic Debt:** Debt pada prerequisite yang berbahaya bagi lintasan aktif.
- **Stealth insertion / Passive Contextual Remediation:** Menyisipkan perbaikan fondasi ke dalam proyek yang menarik.
- **Cognitive Bottleneck Prediction:** Memperkirakan node yang akan sulit jika decay berlanjut.
- **Capability Stage:** Tahap kemampuan per domain berdasarkan evidence.
- **Unbatching cognition:** Melepas lintasan intelektual dari pengelompokan usia.
- **Pressure from below:** Perubahan sistem yang didorong adopsi keluarga, bukan mandat atas.
- **Perturbation Testing:** Enam-layer pengujian (Learn → Perturb → Transfer → Contradict → Reconstruct → Verify) untuk membedakan pemahaman struktural dari hafalan/pattern-matching.
- **Epistemic State Primitive:** Empat status keyakinan (Known / Believed / Hypothesized / Unknown) yang harus dinyatakan secara eksplisit dan terkalibrasi, bukan sekadar diucapkan.
- **World-Ω:** Metode uji berbasis dunia-aksioma-buatan untuk menilai rule-following dan belief revision; bukan pengujian abduction murni karena tetap punya source-of-truth lokal.
- **Jalur Knowledge / Jalur Discovery:** Dua alur pengujian terpisah — Knowledge menguji pemahaman struktur yang sudah diberikan (deduksi), Discovery menguji kemampuan membangun struktur dari fenomena mentah (abduksi).
- **Truth-undisclosed (vs truth-absent):** Prinsip bahwa observasi dalam Open-World Abduction Test tetap dihasilkan oleh proses generatif yang konsisten — hanya tidak diungkap ke sistem yang diuji, bukan benar-benar tanpa ground truth.
- **Meta-anchor:** Anchor pada level kriteria evaluasi (mis. minimality, falsifiability) yang tetap ada meski anchor konten (jawaban benar) dihilangkan.
- **Wujūb / Istiḥālah / Jawāz:** Tiga status modal dari ʿilm al-kalām (niscaya / mustahil / mungkin), dipakai sebagai Layer 1 (gerbang koherensi logis a priori) dalam model tiga-layer status hipotesis — dideklarasikan sebagai anchor filosofis, bukan kerangka netral.
- **Tiga Layer Status (Modal / Epistemik / Belief):** Pemisahan status "mungkinkah secara logis" (Layer 1, dari akal) dari "apa yang diketahui" (Layer 2, dari evidence) dan "seberapa kuat dipegang" (Layer 3, komitmen sementara agen) — mencegah satu output tunggal mencampur tiga kategori berbeda.
- **Epistemic preservation:** Menahan diri dari memaksa satu hipotesis "menang" ketika evidence belum cukup mendiskriminasi antar-kandidat yang masih sama-sama jawāz.

---

*Dokumen ini adalah konsolidasi dari serangkaian diskusi konsep. Bagian 11 dan 12 wajib ditinjau ulang setiap kali arsitektur berubah.*
