# Desain: Lab Interaction Telemetry & Empirical Evidence Derivation

**Tujuan:** mengganti empat konstanta tetap (`accuracyScore: 0.85, manipulationPrecision: 0.80, trialCount: 3, isTrialAndErrorGuesswork: false`) di `App.tsx` dengan angka yang benar-benar dihitung dari interaksi anak di lab — konsisten secara arsitektur dengan `deterministicCore.ts` (formula matematis, tidak ada LLM, tidak ada mock).

**Catatan implementasi:** saya tidak punya kredensial push ke repo GitHub kalian, jadi ini disampaikan sebagai spesifikasi + kode siap-tempel, bukan commit langsung. Referensi implementasi penuh saya buat untuk `BuoyancyLab.tsx` (karena itu yang kita audit), dengan pola yang sama berlaku ke lab lain.

---

## Masalah desain yang harus diselesaikan lebih dulu

Sebelum menulis kode: `BuoyancyLab` saat ini adalah **sandbox eksplorasi bebas** — anak menggeser massa/volume/bentuk/jenis fluida tanpa target yang harus dicapai. Tanpa target, konsep "seberapa dekat percobaan ke jawaban benar" (`manipulationPrecision`) tidak punya makna — tidak ada yang bisa diukur jaraknya.

**Perubahan yang diperlukan:** lab butuh mode **Tantangan** (challenge) dengan target state eksplisit dan tombol "Uji Konfigurasi Ini", di samping mode eksplorasi bebas yang sudah ada. Ini bukan cuma syarat teknis untuk telemetri — ini juga cocok dengan filosofi 6.2 (Feynman Sensor sebagai sensor berkelanjutan) dan pola *evidence-based mastery* di seluruh dokumen fondasi: bukti penguasaan butuh titik keberhasilan/kegagalan yang bisa diperiksa, bukan cuma observasi pasif.

Contoh tantangan untuk BuoyancyLab: *"Buat benda ini melayang tepat di tengah kolam (bukan mengapung penuh, bukan tenggelam) — atur massa dan volume sampai kepadatannya sama dengan air."* Target: `objectDensity ≈ fluidDensity` dalam toleransi tertentu.

Lab lain (CausalLogicLab, BarModelAlgebraLab) sudah punya struktur verifikasi diskrit (`hasVerifiedTransitive`, dst.) — mereka tidak butuh perubahan struktural, tinggal disambungkan ke telemetri yang sama.

---

## 1. Skema Telemetri Interaksi Lab (Generik)

Prinsip desain: **rekam fakta mentah interaksi, bukan skor.** Skor dihitung belakangan lewat fungsi murni yang bisa diperiksa (poin 2) — supaya formulanya transparan dan bisa dikalibrasi ulang tanpa mengubah setiap lab satu per satu.

```ts
// src/types/telemetry.ts

export interface LabInteractionEvent {
  timestamp: number; // Date.now(), ms sejak sesi mulai
  eventType: 'parameter_change' | 'verification_attempt' | 'hint_requested' | 'reset';

  // eventType === 'parameter_change': anak menggeser slider/toggle/input
  paramId?: string;
  paramValue?: number | string | boolean;

  // eventType === 'verification_attempt': anak menekan "uji konfigurasi ini"
  // atau lab men-check kondisi (mis. hasVerifiedTransitive menjadi true/false)
  isCorrect?: boolean;
  distanceFromTarget?: number; // dinormalisasi 0 (tepat) – 1 (jauh). Lab yang mendefinisikan cara hitungnya.
}

export interface LabTelemetrySession {
  simulationId: string;
  startedAt: number;
  events: LabInteractionEvent[];
  completedAt?: number;
}
```

### Hook generik untuk semua lab

```ts
// src/engine/useLabTelemetry.ts
import { useRef, useCallback } from 'react';
import { LabTelemetrySession, LabInteractionEvent } from '../types/telemetry';

export function useLabTelemetry(simulationId: string) {
  const sessionRef = useRef<LabTelemetrySession>({
    simulationId,
    startedAt: Date.now(),
    events: [],
  });

  const push = useCallback((event: Omit<LabInteractionEvent, 'timestamp'>) => {
    sessionRef.current.events.push({ ...event, timestamp: Date.now() });
  }, []);

  const recordParameterChange = useCallback(
    (paramId: string, value: number | string | boolean) =>
      push({ eventType: 'parameter_change', paramId, paramValue: value }),
    [push]
  );

  const recordVerificationAttempt = useCallback(
    (isCorrect: boolean, distanceFromTarget: number) =>
      push({ eventType: 'verification_attempt', isCorrect, distanceFromTarget }),
    [push]
  );

  const recordHintRequested = useCallback(() => push({ eventType: 'hint_requested' }), [push]);

  const recordReset = useCallback(() => push({ eventType: 'reset' }), [push]);

  const finalizeSession = useCallback((): LabTelemetrySession => {
    sessionRef.current.completedAt = Date.now();
    return sessionRef.current;
  }, []);

  return {
    recordParameterChange,
    recordVerificationAttempt,
    recordHintRequested,
    recordReset,
    finalizeSession,
  };
}
```

**Kenapa `distanceFromTarget` diserahkan ke lab, bukan dihitung di engine:** tiap lab punya definisi "jarak ke target" yang berbeda secara domain (densitas vs kesetaraan aljabar vs transitivitas logika). Engine tidak boleh berasumsi domain — ini sama dengan prinsip 6.5.4 di dokumen fondasi (kriteria evaluasi harus dideklarasikan eksplisit oleh yang punya domain, bukan diam-diam diasumsikan generik).

---

## 2. Fungsi Derivasi Deterministik: Telemetri → Empirical Evidence

```ts
// src/engine/empiricalEvidenceDerivation.ts
import { LabTelemetrySession } from '../types/telemetry';
import { EmpiricalSimulationEvidence } from './evidenceTriangulation';

// Konstanta dideklarasikan eksplisit (bukan angka ajaib tersembunyi),
// mengikuti pola PREREQUISITE_MASTERY_THRESHOLDS di deterministicCore.ts
export const EMPIRICAL_DERIVATION_PARAMS = {
  // Berapa kali percobaan sebelum sukses dianggap "wajar" tanpa penalti besar
  TRIAL_PENALTY_SOFT_CAP: 8,
  MAX_TRIAL_PENALTY_WEIGHT: 0.6,
  MIN_ACCURACY_IF_COMPLETED: 0.3,
  ACCURACY_IF_NOT_COMPLETED: 0.15,
  // Rasio parameter_change : verification_attempt di atas ini dicurigai coba-coba acak,
  // KECUALI ada tren distanceFromTarget yang mengecil (menunjukkan penyesuaian terarah)
  GUESSWORK_PARAM_CHANGE_RATIO: 6,
};

export function deriveEmpiricalEvidenceFromTelemetry(
  session: LabTelemetrySession
): EmpiricalSimulationEvidence {
  const P = EMPIRICAL_DERIVATION_PARAMS;
  const verifications = session.events.filter((e) => e.eventType === 'verification_attempt');
  const paramChanges = session.events.filter((e) => e.eventType === 'parameter_change');

  const trialCount = Math.max(1, verifications.length);
  const firstSuccessIndex = verifications.findIndex((v) => v.isCorrect === true);
  const taskCompleted = firstSuccessIndex !== -1;

  // accuracyScore: sukses atau tidak, dan seberapa banyak percobaan sebelum sukses
  // (lebih sedikit percobaan sebelum berhasil = pemahaman lebih langsung, bukan coba-coba)
  let accuracyScore: number;
  if (taskCompleted) {
    const trialPenalty = Math.min(1, firstSuccessIndex / P.TRIAL_PENALTY_SOFT_CAP);
    accuracyScore = Math.max(
      P.MIN_ACCURACY_IF_COMPLETED,
      1 - trialPenalty * P.MAX_TRIAL_PENALTY_WEIGHT
    );
  } else {
    accuracyScore = P.ACCURACY_IF_NOT_COMPLETED;
  }

  // manipulationPrecision: rata-rata seberapa dekat SEMUA percobaan ke target
  // (bukan cuma percobaan yang berhasil — ini menangkap kualitas penalaran sepanjang sesi)
  const distances = verifications
    .map((v) => v.distanceFromTarget)
    .filter((d): d is number => typeof d === 'number');
  const avgDistance =
    distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 0.5;
  const manipulationPrecision = Math.max(0, Math.min(1, 1 - avgDistance));

  // isTrialAndErrorGuesswork: banyak perubahan parameter per satu verifikasi,
  // DAN tidak ada tren distanceFromTarget mengecil (artinya bukan penyesuaian terarah)
  const changeRatio =
    verifications.length > 0 ? paramChanges.length / verifications.length : paramChanges.length;
  const isConverging =
    distances.length >= 2 && distances[distances.length - 1] < distances[0];
  const isTrialAndErrorGuesswork = changeRatio > P.GUESSWORK_PARAM_CHANGE_RATIO && !isConverging;

  return {
    simulationId: session.simulationId,
    taskCompleted,
    accuracyScore: Number(accuracyScore.toFixed(2)),
    manipulationPrecision: Number(manipulationPrecision.toFixed(2)),
    trialCount,
    isTrialAndErrorGuesswork,
  };
}
```

**Sifat penting fungsi ini:** murni (`pure function`), sinkron, deterministik, bisa di-unit-test langsung dengan array event buatan — sama seperti `calculateDeterministicEpistemicDebt` yang sudah ada. Tidak ada panggilan API, tidak ada `Math.random()`, tidak ada `setTimeout` dekoratif.

---

## 3. Referensi Implementasi: `BuoyancyLab.tsx`

Perubahan yang dibutuhkan (diagram, bukan diff lengkap — supaya polanya jelas untuk diterapkan ke lab lain):

### 3a. Tambah mode Tantangan + telemetri

```tsx
// Tambahan di dalam BuoyancyLab.tsx
import { useLabTelemetry } from '../../engine/useLabTelemetry';
import { deriveEmpiricalEvidenceFromTelemetry } from '../../engine/empiricalEvidenceDerivation';
import { EmpiricalSimulationEvidence } from '../../engine/evidenceTriangulation';

interface BuoyancyLabProps {
  onFeynmanDiagnosed?: (result: FeynmanDiagnosisResult, explanation: string) => void;
  onMasteryEvidence?: (details: string) => void;
  onEmpiricalEvidence?: (evidence: EmpiricalSimulationEvidence) => void; // BARU
}

export const BuoyancyLab: React.FC<BuoyancyLabProps> = ({
  onFeynmanDiagnosed,
  onMasteryEvidence,
  onEmpiricalEvidence,
}) => {
  // ...state slider yang sudah ada (mass, volume, shape, fluidType)...

  const telemetry = useLabTelemetry('buoyancy');

  // Target tantangan: kepadatan benda mendekati kepadatan fluida (melayang di tengah)
  const TARGET_TOLERANCE = 0.05; // kg/L, seberapa dekat dianggap "tepat"

  // Panggil ini setiap slider berubah (tambahkan ke existing onChange handlers)
  const handleMassChange = (v: number) => {
    setMass(v);
    telemetry.recordParameterChange('mass', v);
  };
  const handleVolumeChange = (v: number) => {
    setVolume(v);
    telemetry.recordParameterChange('volume', v);
  };
  // (pola yang sama untuk setShape, setFluidType)

  // Tombol baru: "Uji Konfigurasi Ini" (di mode Tantangan)
  const handleTestConfiguration = () => {
    const distance = Math.min(1, Math.abs(objectDensity - fluidDensity) / TARGET_TOLERANCE);
    const isCorrect = distance <= 1.0 && Math.abs(objectDensity - fluidDensity) <= TARGET_TOLERANCE;
    telemetry.recordVerificationAttempt(isCorrect, distance);
    // ...feedback visual ke anak (opsional, tidak wajib untuk telemetri)...
  };
```

### 3b. Finalisasi sesi saat lab dianggap "selesai"

Titik penyelesaian yang natural: sama seperti sekarang, saat `handleRunDiagnosis` (Feynman Sensor) berhasil — tapi sekarang sertakan evidence empiris dari sesi yang sama:

```tsx
  const handleRunDiagnosis = async () => {
    // ...kode fetch ke /api/diagnose/feynman yang sudah ada, tidak berubah...

    setLastDiagnosis(data);
    if (onFeynmanDiagnosed) onFeynmanDiagnosed(data, childExplanation);

    // BARU: kirim bukti empiris dari sesi telemetri yang sama
    const session = telemetry.finalizeSession();
    const empiricalEvidence = deriveEmpiricalEvidenceFromTelemetry(session);
    if (onEmpiricalEvidence) onEmpiricalEvidence(empiricalEvidence);

    if (onMasteryEvidence) {
      onMasteryEvidence(
        `Feynman: "${childExplanation}" | Empiris: ${empiricalEvidence.trialCount}x percobaan, akurasi ${(empiricalEvidence.accuracyScore * 100).toFixed(0)}%`
      );
    }
  };
```

---

## 4. Wiring di `App.tsx`

Ganti objek konstanta dengan state yang diisi dari lab secara nyata:

```tsx
// State baru di App.tsx, di samping state yang sudah ada
const [pendingEmpiricalEvidence, setPendingEmpiricalEvidence] =
  useState<Record<string, EmpiricalSimulationEvidence>>({});

const handleEmpiricalEvidence = (simulationId: string, evidence: EmpiricalSimulationEvidence) => {
  setPendingEmpiricalEvidence((prev) => ({ ...prev, [simulationId]: evidence }));
};

// Di dalam handleFeynmanDiagnosed — GANTI konstanta hardcoded:
const handleFeynmanDiagnosed = (result: FeynmanDiagnosisResult, childExplanation: string) => {
  const wordCount = (childExplanation || '').split(/\s+/).filter(Boolean).length;

  const empirical = pendingEmpiricalEvidence['buoyancy']; // dari lab yang sama, bukan konstanta

  if (!empirical) {
    // Tidak ada bukti empiris tersedia — JANGAN diam-diam pakai angka optimis.
    // Turunkan confidence secara eksplisit alih-alih menyamarkan ketiadaan data.
    console.warn('Empirical evidence belum tersedia untuk simulationId=buoyancy; triangulasi berjalan tanpa bukti lab.');
  }

  const triangulation = triangulateEvidence(
    empirical, // undefined jika lab belum pernah dites — triangulateEvidence SUDAH menangani ini (empiricalScore = 0.5 default netral)
    result,
    {
      targetDomain: 'Fisika Fluida & Archimedes',
      appliedSuccessfully: result.transferScore >= 0.6,
      transferScore: result.transferScore,
    },
    { childUtteranceWordCount: wordCount }
  );

  // ...sisa kode tidak berubah...
};
```

Sambungkan prop baru ke komponen lab:

```tsx
<BuoyancyLab
  onFeynmanDiagnosed={handleFeynmanDiagnosed}
  onMasteryEvidence={handleGenericLabMasteryEvidence}
  onEmpiricalEvidence={(ev) => handleEmpiricalEvidence('buoyancy', ev)} // BARU
/>
```

**Poin penting:** `evidenceTriangulation.ts` sudah punya fallback netral (`empiricalScore = 0.5`) untuk kasus `empirical === undefined` — jadi tidak perlu diubah. Yang berubah hanya: App.tsx sekarang **jujur mengirim `undefined` ketika memang belum ada bukti**, alih-alih mengirim angka optimis (0.85/0.80) yang berpura-pura ada bukti padahal tidak.

---

## 5. Generalisasi ke Lab Non-Slider (CausalLogicLab, BarModelAlgebraLab)

Lab ini sudah punya titik verifikasi diskrit (`hasVerifiedTransitive`, dst.) — tinggal disambungkan langsung, tanpa perlu konsep "mode Tantangan" baru:

```tsx
// Di titik yang sudah ada di CausalLogicLab, mis. saat transitivitas terverifikasi:
const verifyTransitive = () => {
  const isCorrect = weightA === termB1 + termB2; // logika verifikasi yang sudah ada
  const distance = Math.min(1, Math.abs(weightA - (termB1 + termB2)) / weightA);
  telemetry.recordVerificationAttempt(isCorrect, distance);
  setHasVerifiedTransitive(isCorrect);
};
```

Pola yang sama berlaku untuk `hasVerifiedSymmetric`, `hasVerifiedInvariant`, dan tiap `currentStep` di `BarModelAlgebraLab`. Tidak ada perubahan pada `useLabTelemetry` atau fungsi derivasi — keduanya sudah domain-agnostic.

---

## 6. Yang Belum Diselesaikan Desain Ini (jujur, bukan celah tersembunyi)

- **Kalibrasi konstanta di `EMPIRICAL_DERIVATION_PARAMS` masih tebakan awal**, sama seperti bobot 60/25/15 di `evidenceTriangulation.ts` yang sudah ditandai belum tervalidasi di dokumen fondasi (risiko #2). Begitu ada data anak nyata, angka-angka ini (soft cap 8 percobaan, rasio guesswork 6x) perlu dikalibrasi ulang, bukan dianggap final.
- **`distanceFromTarget` untuk lab tanpa target numerik jelas** (mis. lab yang jawabannya kualitatif/kategorikal) butuh definisi per-lab sendiri — desain ini menyediakan mekanismenya, bukan resep otomatis untuk setiap domain.
- **Lab yang murni eksploratif tanpa tantangan sama sekali** (kalau ada yang sengaja dibiarkan begitu untuk tujuan pedagogis free-play) tidak akan pernah menghasilkan `verification_attempt`, sehingga `evidenceTriangulation` akan selalu jatuh ke default netral untuknya — itu perilaku yang benar (jujur menunjukkan tidak ada bukti), bukan bug, tapi perlu disadari saat memutuskan lab mana yang wajib punya mode Tantangan.
