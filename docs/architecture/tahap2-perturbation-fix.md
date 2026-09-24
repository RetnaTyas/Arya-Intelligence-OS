# Perbaikan Tahap 2: Perturbation Layer 0–2 yang Sungguhan

**Masalah:** `layer0Pass`/`layer1Pass`/`layer2Pass` saat ini diturunkan secara matematis dari SATU `aiTrainedDiagnosis` (hasil dari `item.prompt` dasar). `layer0.prompt`, `layer1.prompt`, `layer2.prompt` tersimpan di data tapi tidak pernah dikirim ke AI. Hipotesis pusat Tahap 2 belum pernah diuji.

**Temuan tambahan saat mendesain perbaikan ini:** skema data `layer0`/`layer1`/`layer2` saat ini cuma punya `prompt` + `expectedBehavior` (teks bebas untuk dibaca manusia) — **tidak ada `childUtterance` atau target yang bisa dibandingkan mesin**. Supaya Layer 1/2 benar-benar bisa "lolos/gagal" secara terukur (bukan cuma "AI menjawab sesuatu"), setiap layer butuh: (a) ucapan anak sintetis yang konsisten dengan `expectedBehavior`, dan (b) target ringan yang bisa dibandingkan otomatis. Ini bukan sekadar bug kode — ini kekosongan di skema data yang harus diisi lebih dulu.

---

## 1. Perluas skema `HumanGoldStandardItem`

```ts
// src/engine/centralHypothesisBenchmark.ts

export interface PerturbationProbe {
  type: string;
  prompt: string;
  childUtterance: string;              // BARU — jawaban anak sintetis, konsisten dgn expectedBehavior
  expectedHasMisconception: boolean;   // BARU — target ringan utk pembanding mesin
  expectedScoreRange: [number, number]; // BARU — rentang skor structural yang wajar
  expectedBehavior: string;            // tetap ada, untuk dokumentasi manusia
  contrastDifference?: string;         // khusus layer2
}

export interface HumanGoldStandardItem {
  id: string;
  domain: string;
  prompt: string;
  childUtterance: string;
  humanExpertDiagnosis: { /* tidak berubah — ini anchor utama */ };
  perturbations: {
    layer0: PerturbationProbe;
    layer1: PerturbationProbe;
    layer2: PerturbationProbe;
  };
}
```

Contoh pengisian untuk `bench-frac-01` (pola pecahan 1/4 vs 1/8):

```ts
perturbations: {
  layer0: {
    type: 'Layer 0: Identical Memorization Pattern',
    prompt: 'Apakah 1/8 lebih besar dari 1/4?',
    childUtterance: 'Iya, 1/8 lebih besar, soalnya 8 lebih besar dari 4.',
    expectedHasMisconception: true,
    expectedScoreRange: [0.0, 0.30],
    expectedBehavior: 'Konsisten mendeteksi transfer bilangan bulat.',
  },
  layer1: {
    type: 'Layer 1: Pattern Generalization (Surface Change)',
    prompt: 'Mana yang lebih panjang: 1/5 meter tali atau 1/10 meter tali?',
    childUtterance: '1/10 meter lebih panjang, kan 10 lebih besar dari 5.',
    expectedHasMisconception: true,
    expectedScoreRange: [0.0, 0.30],
    expectedBehavior: 'Harus konsisten mengidentifikasi miskonsepsi yang sama pada objek berbeda.',
  },
  layer2: {
    type: 'Layer 2: Semantic Perturbation (Minimal Contrast Pair)',
    prompt: 'Kalau 4/8 dibandingkan 2/4, menurutmu mana yang lebih banyak?',
    childUtterance: '4/8 lebih banyak, soalnya 8 lebih besar dari 4.',
    // Di sini anak TETAP menerapkan miskonsepsi yang sama walau nilainya sebenarnya SAMA (4/8=2/4) —
    // targetnya AI tetap mendeteksi miskonsepsi transfer-bilangan-bulat, BUKAN percaya anak "benar kebetulan".
    expectedHasMisconception: true,
    expectedScoreRange: [0.0, 0.30],
    expectedBehavior: 'Mampu membedakan apakah anak hanya menebak atau benar-benar paham partisi.',
    contrastDifference: 'Pecahan kedua senilai (4/8 = 2/4), menguji apakah anak runtuh saat penyebut beda tapi nilai sama.',
  },
},
```

**Prinsip pengisian:** `childUtterance` di tiap layer BUKAN ditulis untuk "membantu AI menjawab benar" — ia mensimulasikan apa yang akan dikatakan anak yang *masih* punya miskonsepsi yang sama (atau, untuk beberapa kasus uji, anak yang *sudah* sembuh — supaya benchmark juga menguji AI tidak over-diagnosing). Idealnya, di antara 12 item, sisipkan variasi: beberapa layer1/layer2 probe menunjukkan anak yang **sudah tidak lagi** menunjukkan miskonsepsi (expectedHasMisconception: false) — supaya AI diuji dua arah, bukan cuma "selalu bilang ada miskonsepsi".

---

## 2. Backend — kirim 4 probe per item (base + layer0 + layer1 + layer2) dalam satu batch

```ts
// functions/api/benchmark/central-hypothesis.ts

const systemInstruction = `
You are the Cognitive Epistemic Assessor evaluating student utterances in Personal Intelligence OS (Tahap 2 Central Hypothesis Test).

Each row below is INDEPENDENT — a separate probe with its own prompt and student utterance.
Diagnose each row purely on its own content. Do NOT let your answer to one row be influenced by
your answer to another row, even if they share a probeGroupId (they test the SAME underlying concept
from different angles — your job is to answer each fresh, not to make them look consistent).

For each row, determine:
1. hasMisconception: boolean
2. misconceptionName: string ("None" if none)
3. structuralMasteryScore: number 0.00–1.00 (deep causal understanding vs superficial rote)
4. explanation: concise rationale (2-3 sentences)

Output strictly a JSON array:
[{ "probeId": string, "hasMisconception": boolean, "misconceptionName": string, "structuralMasteryScore": number, "explanation": string }]
`;

// Setiap item menghasilkan 4 baris probe independen
const promptRows = items.flatMap((it: any) => [
  { probeId: `${it.id}::base`,   probeGroupId: it.id, prompt: it.prompt,               studentUtterance: it.childUtterance },
  { probeId: `${it.id}::layer0`, probeGroupId: it.id, prompt: it.perturbations.layer0.prompt, studentUtterance: it.perturbations.layer0.childUtterance },
  { probeId: `${it.id}::layer1`, probeGroupId: it.id, prompt: it.perturbations.layer1.prompt, studentUtterance: it.perturbations.layer1.childUtterance },
  { probeId: `${it.id}::layer2`, probeGroupId: it.id, prompt: it.perturbations.layer2.prompt, studentUtterance: it.perturbations.layer2.childUtterance },
]);

const response: any = await aiBinding.run(model, {
  messages: [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: `Evaluasi setiap probe berikut secara independen:\n${JSON.stringify(promptRows)}` },
  ],
  temperature: 0.1,
});

// ...parsing sama seperti sebelumnya, tapi map berdasarkan probeId, bukan itemId...

const resultsByItem = items.map((item: any) => {
  const get = (suffix: string) => {
    const found = parsedArray.find((p: any) => p.probeId === `${item.id}::${suffix}`);
    if (!found) throw new Error(`Probe ${item.id}::${suffix} tidak ditemukan dalam respons Workers AI.`);
    return {
      hasMisconception: Boolean(found.hasMisconception),
      misconceptionName: found.misconceptionName || 'Tidak teridentifikasi',
      structuralMasteryScore: typeof found.structuralMasteryScore === 'number' ? Math.min(1, Math.max(0, found.structuralMasteryScore)) : 0.5,
      explanation: found.explanation || '',
    };
  };

  return {
    itemId: item.id,
    base: get('base'),
    layer0: get('layer0'),
    layer1: get('layer1'),
    layer2: get('layer2'),
  };
});
```

**Catatan jujur soal batching:** mengirim keempat probe dalam satu panggilan (bukan 4 panggilan API terpisah) lebih efisien secara biaya/latensi, dan instruksi sistem eksplisit meminta model menjawab tiap baris independen. Tapi ini bukan isolasi sempurna — secara teknis model tetap "melihat" keempat baris dalam satu context window yang sama, jadi ada risiko kecil ia menjaga jawabannya "konsisten terlihat rapi" alih-alih benar-benar independen. Untuk isolasi ketat, ganti jadi 4 panggilan `aiBinding.run()` terpisah per item (4x lebih mahal/lambat). Rekomendasi: pakai versi batch dulu (cukup untuk mendeteksi kegagalan besar), naikkan ke isolasi penuh kalau hasil awal meragukan.

---

## 3. Evaluasi — bandingkan 4 diagnosis independen, bukan turunkan dari satu skor

```ts
// src/engine/centralHypothesisBenchmark.ts

export function evaluateDiagnosticAgreementAndPerturbation(
  benchmarkItem: HumanGoldStandardItem,
  aiResults: {
    base: DiagnosisShape;
    layer0: DiagnosisShape;
    layer1: DiagnosisShape;
    layer2: DiagnosisShape;
  }
): PerturbationEvaluationResult {
  const human = benchmarkItem.humanExpertDiagnosis;

  // --- Base: konkordansi dengan human expert (seperti sebelumnya) ---
  const misconceptionMatches = aiResults.base.hasMisconception === human.hasMisconception;
  const scoreDelta = Math.abs(aiResults.base.structuralMasteryScore - human.structuralMasteryScore);
  const scoreProximity = Math.max(0, 1 - scoreDelta);
  const agreementScore = (misconceptionMatches ? 0.6 : 0) + (scoreProximity * 0.4);
  const isConcordant = agreementScore >= 0.75;

  // --- Fungsi pembanding generik untuk tiap layer probe ---
  const checkProbe = (probe: PerturbationProbe, result: DiagnosisShape) => {
    const misconceptionOk = result.hasMisconception === probe.expectedHasMisconception;
    const [min, max] = probe.expectedScoreRange;
    const scoreOk = result.structuralMasteryScore >= min && result.structuralMasteryScore <= max;
    return misconceptionOk && scoreOk;
  };

  // Layer 0: apakah AI konsisten pada reformulasi kasus yang sama (deteksi hafalan vs pemahaman)
  const layer0Pass = checkProbe(benchmarkItem.perturbations.layer0, aiResults.layer0);

  // Layer 1: apakah AI tetap konsisten saat objek/konteks permukaan berubah
  const layer1Pass = layer0Pass && checkProbe(benchmarkItem.perturbations.layer1, aiResults.layer1);

  // Layer 2: HIPOTESIS UTAMA — apakah AI bertahan saat satu relasi semantik digeser
  // (minimal contrast pair, mis. 4/8 vs 2/4 yang nilainya SAMA meski penyebutnya beda)
  const layer2Pass = layer1Pass && checkProbe(benchmarkItem.perturbations.layer2, aiResults.layer2);

  // "Contrast recognized" sekarang diukur dari kesamaan reasoning, bukan pencarian kata "hallucination"
  const layer2ContrastRecognized =
    layer2Pass && aiResults.layer2.hasMisconception === aiResults.layer0.hasMisconception;

  let epistemicVerdict: PerturbationEvaluationResult['epistemicVerdict'] = 'MISCONCEPTION_CONFIRMED';
  if (!human.hasMisconception && layer2Pass) {
    epistemicVerdict = 'ROBUST_STRUCTURAL';
  } else if (!human.hasMisconception && !layer2Pass) {
    epistemicVerdict = 'FRAGILE_SURFACE';
  } else if (human.hasMisconception && aiResults.base.structuralMasteryScore > 0.6) {
    epistemicVerdict = 'SUPERFICIALLY_FLUENT';
  } else if (human.hasMisconception && !layer2Pass) {
    epistemicVerdict = 'FRAGILE_SURFACE'; // AI benar di base tapi runtuh saat contrast digeser
  }

  return {
    itemId: benchmarkItem.id,
    prompt: benchmarkItem.prompt,
    aiDiagnosis: aiResults.base,
    humanExpert: { hasMisconception: human.hasMisconception, misconceptionName: human.misconceptionName, structuralMasteryScore: human.structuralMasteryScore },
    agreementScore: Number(agreementScore.toFixed(3)),
    isConcordant,
    perturbationSurvival: { layer0Pass, layer1Pass, layer2Pass, layer2ContrastRecognized },
    epistemicVerdict,
    calibrationScore: Number((agreementScore * (layer2Pass ? 1.0 : 0.7)).toFixed(3)),
  };
}
```

**Perbedaan paling penting dari versi lama:** `layer1Pass`/`layer2Pass` sekarang **tidak bisa lagi bernilai `true` tanpa AI benar-benar menjawab probe layer tersebut dengan benar**. Sebelumnya, `layer2Pass` bisa `true` murni karena `scoreDelta < 0.18` pada skor dasar — sekarang ia butuh `aiResults.layer2` (hasil dari prompt kontras `4/8 vs 2/4` yang sungguhan dikirim ke AI) cocok dengan target yang dideklarasikan.

---

## 4. Wiring di `CentralHypothesisTestHarness.tsx`

```ts
const aiResultsMap: Record<string, { base: any; layer0: any; layer1: any; layer2: any }> = {};
if (Array.isArray(data.results)) {
  data.results.forEach((r: any) => {
    aiResultsMap[r.itemId] = { base: r.base, layer0: r.layer0, layer1: r.layer1, layer2: r.layer2 };
  });
}

const computedResults = HUMAN_GOLD_STANDARD_BENCHMARK.map((item) => {
  const aiRes = aiResultsMap[item.id];
  if (!aiRes) throw new Error(`Hasil AI untuk item ${item.id} tidak lengkap.`);
  return evaluateDiagnosticAgreementAndPerturbation(item, aiRes);
});
```

---

## 5. Yang belum diselesaikan desain ini (jujur)

- **12 item benchmark perlu diisi ulang** dengan `childUtterance`/`expectedHasMisconception`/`expectedScoreRange` untuk tiap layer — ini kerja manual yang perlu ketelitian pedagogis (idealnya ditinjau oleh yang punya latar belakang pendidikan matematika, bukan cuma ditulis AI), konsisten dengan prinsip dokumen bahwa ground truth manusia harus tetap jadi anchor.
- **Isolasi context antar-probe** (poin batching di atas) adalah trade-off yang dideklarasikan, bukan diselesaikan sempurna — kalau hasil awal terlihat "terlalu rapi/konsisten", itu sinyal untuk pindah ke 4 panggilan terpisah.
- **Belum ada mekanisme untuk item yang sengaja menguji anak yang SUDAH paham** (expectedHasMisconception: false di beberapa layer) — desain di atas mendukungnya secara struktur, tapi 12 item saat ini semuanya berpusat pada anak yang salah. Perlu ditambah kasus kontrol positif supaya AI juga diuji tidak over-diagnosing anak yang sebenarnya sudah benar.
