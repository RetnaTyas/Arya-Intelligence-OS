# Perbaikan Telemetri Lab v2: BarModelAlgebraLab & CausalLogicLab

**Konteks:** Audit ulang menemukan dua pola masalah berbeda di dua lab:

1. **BarModelAlgebraLab** — telemetri "nyata" tapi datanya *degenerate*: `isCorrect`/`distance` ditulis literal di kode (`0.4`, `0.0`), dan UI tidak punya jalur bagi anak untuk salah. Perbaikannya: beri anak input yang benar-benar bisa salah.
2. **CausalLogicLab (mode Symmetric & Invariant)** — ini bukan sekadar data degenerate, tapi **kesalahan kategori**. Membalik sisi persamaan (`A=B → B=A`) dan menambah angka sama ke kedua sisi **memang selalu benar secara definisi** — itulah properti yang sedang diajarkan. Tidak ada cara membuatnya "bisa salah" tanpa merusak makna pedagogisnya. Yang salah adalah mencatatnya sebagai `verification_attempt`. Perbaikannya bukan "buat lebih variatif", tapi **pisahkan demonstrasi (yang memang selalu benar) dari uji transfer (yang baru punya kemungkinan salah)**.

---

## 1. BarModelAlgebraLab — dari tombol tunggal ke input yang bisa salah

### Masalah spesifik

```ts
const handleSubtractFour = () => {
  if (currentStep === 0) {
    telemetry.recordVerificationAttempt(true, 0.4); // konstanta, bukan hasil hitung
    setCurrentStep(1);
  }
};
```

Tombol hanya aktif kalau `currentStep === 0`, jadi begitu diklik pasti benar. Tidak ada ruang bagi anak untuk salah.

### Desain baru: anak memilih operasi DAN nilainya sendiri

```ts
interface AlgebraStepSpec {
  expectedOp: 'subtract' | 'divide';
  expectedValue: number;
  promptLabel: string;
}

const STEPS: AlgebraStepSpec[] = [
  { expectedOp: 'subtract', expectedValue: 4, promptLabel: 'Langkah 1: Operasi apa yang menjaga neraca tetap seimbang di sini?' },
  { expectedOp: 'divide',   expectedValue: 2, promptLabel: 'Langkah 2: Operasi apa yang menjaga neraca tetap seimbang di sini?' },
];

const [currentStep, setCurrentStep] = useState(0);
const [proposedOp, setProposedOp] = useState<'subtract' | 'add' | 'divide' | 'multiply'>('subtract');
const [proposedValue, setProposedValue] = useState<number>(1);
const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

const handleApplyOperation = () => {
  const step = STEPS[currentStep];
  if (!step) return;

  const opMatches = proposedOp === step.expectedOp;
  const valueError = Math.abs(proposedValue - step.expectedValue);

  // Kesalahan jenis operasi = kesalahan struktural (bobot lebih berat).
  // Kesalahan nilai = kesalahan magnitudo (bobot lebih ringan, proporsional).
  const opPenalty = opMatches ? 0 : 0.6;
  const valuePenalty = Math.min(0.4, (valueError / Math.max(1, step.expectedValue)) * 0.4);
  const distance = Math.min(1, opPenalty + valuePenalty);
  const isCorrect = opMatches && valueError === 0;

  telemetry.recordVerificationAttempt(isCorrect, distance);

  if (isCorrect) {
    setFeedback({ ok: true, message: `Tepat! Menerapkan operasi yang sama di kedua sisi menjaga neraca tetap seimbang.` });
    const next = currentStep + 1;
    setCurrentStep(next);

    if (next >= STEPS.length) {
      setHasCompleted(true);
      const session = telemetry.finalizeSession();
      const evidence = deriveEmpiricalEvidenceFromTelemetry(session);
      if (onEmpiricalEvidence) onEmpiricalEvidence(evidence);
      onMasteryEvidence(
        `Menyelesaikan reduksi 2x + 4 = 14 (Akurasi: ${(evidence.accuracyScore * 100).toFixed(0)}%, Presisi: ${(evidence.manipulationPrecision * 100).toFixed(0)}%).`
      );
    }
  } else {
    setFeedback({
      ok: false,
      message: !opMatches
        ? `Operasi "${proposedOp}" tidak pas di langkah ini. Perhatikan apa yang perlu dihilangkan dari kedua sisi neraca.`
        : `Jenis operasinya sudah tepat, tapi nilainya belum pas — neraca masih akan miring.`,
    });
  }
};
```

**Perubahan UI:** ganti tombol "Aksi Kausal: Kurangi 4 dari KEDUA sisi (-4)" (yang selalu benar) dengan: (a) pemilih operasi (4 tombol: kurangi/tambah/bagi/kali), (b) input angka, (c) tombol "Terapkan Operasi Ini". Anak sekarang bisa memilih "bagi 2" duluan (salah urutan) atau "kurangi 7" (salah nilai), dan itu tercatat sungguhan sebagai `isCorrect: false`.

**Bonus opsional:** panggil `telemetry.recordParameterChange('proposedOp', ...)` / `recordParameterChange('proposedValue', ...)` setiap anak mengubah pilihan sebelum menekan "Terapkan" — ini menangkap sinyal ragu-ragu/coba-coba yang berguna untuk `isTrialAndErrorGuesswork`.

---

## 2. CausalLogicLab — pisahkan demonstrasi dari uji transfer

### Mode Symmetric

**Yang salah bukan datanya, tapi kategorinya.** `handleFlipSymmetry` membalik sisi kiri/kanan — ini **selalu valid**, itulah properti yang didemonstrasikan. Mencatatnya sebagai `verification_attempt(true, 0)` keliru secara kategori: tidak ada dimensi benar/salah di situ sama sekali.

**Perbaikan:** klik "Putar Ruas" tetap ada sebagai demonstrasi murni — tapi **berhenti dicatat sebagai `verification_attempt`**. Sebagai gantinya, tambahkan **uji transfer** setelah anak mengeksplorasi: soal baru dengan angka acak (bukan `10` dan `3+7` yang tetap), tanyakan prediksi ke anak — di sinilah `isCorrect` baru punya makna, karena sekarang benar-benar mungkin salah.

```ts
// Angka baru tiap ronde, bukan konstanta tetap
const [transferPair, setTransferPair] = useState(() => generateRandomPair()); // { a, b, sum }
// generateRandomPair(): { a: rand(2,9), b: rand(2,9), sum: a+b }

const [transferAnswer, setTransferAnswer] = useState<number | ''>('');
const [transferChecked, setTransferChecked] = useState(false);

const handleFlipSymmetry = () => {
  setFlippedSymmetry((prev) => !prev);
  // Demonstrasi murni — TIDAK lagi dicatat sebagai verification_attempt.
  // Kalau ingin tetap terekam untuk analisis keterlibatan (engagement), catat sebagai parameter_change:
  telemetry.recordParameterChange('symmetry_flip_toggle', !flippedSymmetry);
};

const handleCheckTransfer = () => {
  const isCorrect = Number(transferAnswer) === transferPair.sum;
  const distance = Math.min(
    1,
    Math.abs(Number(transferAnswer) - transferPair.sum) / Math.max(1, transferPair.sum)
  );
  telemetry.recordVerificationAttempt(isCorrect, distance);
  setTransferChecked(true);

  if (isCorrect && !hasVerifiedSymmetric) {
    setHasVerifiedSymmetric(true);
    const session = telemetry.finalizeSession();
    const evidence = deriveEmpiricalEvidenceFromTelemetry(session);
    if (onEmpiricalEvidence) onEmpiricalEvidence(evidence);
    onMasteryEvidence(
      `Memverifikasi transfer sifat simetri pada kasus baru (${transferPair.a} + ${transferPair.b} = ${transferPair.sum}) tanpa dituntun contoh sebelumnya.`
    );
  } else if (!isCorrect) {
    // Beri ronde baru dengan angka berbeda supaya tidak bisa dihafal
    setTransferPair(generateRandomPair());
  }
};
```

**UI tambahan:** setelah area demo "Putar Ruas" yang sudah ada, tambahkan kartu baru: *"Sekarang giliranmu: kalau {a} + {b} = {sum}, berapa nilai ruas kiri kalau posisinya dibalik jadi {sum} = ... ?"* dengan input angka + tombol "Cek Jawaban". Ini konsisten dengan pola *predict-before-reveal* yang sudah dipakai di lab lain, dan cocok dengan prinsip Layer 5 "Verify" di dokumen fondasi (6.5.1) — instance baru yang belum pernah dilihat, bukan pengulangan contoh yang sama.

### Mode Invariant — pola yang sama

```ts
const [predictedResult, setPredictedResult] = useState<number | ''>('');
const [hasPredicted, setHasPredicted] = useState(false);

const handleApplyInvariant = (delta: number) => {
  const nextVal = invariantOp + delta;
  setInvariantOp(nextVal);
  setHasPredicted(false); // wajib prediksi ulang sebelum hasil baru terungkap
  telemetry.recordParameterChange('invariantOp', nextVal); // tetap parameter_change, ini eksplorasi
};

const handleCheckPrediction = () => {
  const actual = 8 + invariantOp;
  const error = Math.abs(Number(predictedResult) - actual);
  const distance = Math.min(1, error / Math.max(1, Math.abs(actual)));
  const isCorrect = Number(predictedResult) === actual;

  telemetry.recordVerificationAttempt(isCorrect, distance);
  setHasPredicted(true);

  if (isCorrect && !hasVerifiedInvariant) {
    setHasVerifiedInvariant(true);
    const session = telemetry.finalizeSession();
    const evidence = deriveEmpiricalEvidenceFromTelemetry(session);
    if (onEmpiricalEvidence) onEmpiricalEvidence(evidence);
    onMasteryEvidence(
      `Membuktikan invarian kesetaraan dengan memprediksi hasil (${actual}) sebelum sistem menampilkannya.`
    );
  }
};
```

**UI:** sembunyikan angka hasil (`8 + invariantOp`) sampai anak memasukkan prediksi dan menekan "Cek Prediksi" — baru setelah itu angka sebenarnya ditampilkan berdampingan dengan prediksi anak. Tombol -2/+5 yang sudah ada tetap dipakai untuk mengubah `invariantOp` (eksplorasi, `parameter_change`), tapi verifikasi sekarang terjadi di titik terpisah yang benar-benar bisa salah.

---

## 3. Prinsip umum yang perlu dipegang ke depan

Dua kesalahan ini punya sumber yang mirip tapi tidak identik, dan keduanya layak dijadikan aturan untuk lab-lab berikutnya:

1. **Sebelum menyambungkan `recordVerificationAttempt`, tanyakan: bisakah `isCorrect` benar-benar bernilai `false` di sini, lewat aksi anak yang wajar?** Kalau jawabannya tidak — karena UI membatasi (BarModelAlgebraLab) atau karena secara logis propertinya memang selalu benar (CausalLogicLab Symmetric/Invariant) — itu bukan titik verifikasi, itu observasi/demonstrasi. Catat sebagai `parameter_change`, bukan `verification_attempt`.
2. **Demonstrasi yang selalu benar tetap punya tempat** — properti matematis yang invarian memang layak ditunjukkan secara visual. Yang tidak boleh adalah memperlakukan interaksi dengan demonstrasi itu seolah-olah itu bukti penguasaan anak.
3. **Titik verifikasi sejati butuh instance baru setiap kali**, bukan nilai tetap yang bisa dihafal setelah satu kali dilihat (`transferPair` acak, bukan `10` dan `3+7` yang statis). Ini konsisten dengan prinsip Verify di 6.5.1 dokumen fondasi.
