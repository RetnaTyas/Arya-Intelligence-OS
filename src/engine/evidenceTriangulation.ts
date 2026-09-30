import {
  AssessmentModality,
  FeynmanDiagnosisResult,
  LearnerNodeState,
  MasteryHierarchy,
} from '../types';
import { applyMasteryGating } from './deterministicCore';

/**
 * MULTI-MODAL EVIDENCE TRIANGULATION & FEYNMAN NOISE SHIELD
 *
 * Mengatasi Risiko #1 (Section 11 intelligence-os-foundation.md):
 * "Feynman Sensor adalah single point of failure. Mendiagnosis pemahaman dari dialog
 * adalah masalah riset terbuka. Jika diagnosisnya noise, adaptive engine akan salah
 * memilih intervensi."
 *
 * Solusi Arsitektural:
 * 1. Learner Model TIDAK PERNAH bergantung pada satu sumber dialog AI saja.
 * 2. Triangulasi 3 Sumber Bukti:
 *    - Telemetri Empiris Simulasi / Manipulasi Nyata (Bobot 60%)
 *    - Kemampuan Transfer Lintas Konteks (Bobot 25%)
 *    - Feynman Sensor Dialog Socratic AI (Bobot 15%)
 * 3. Noise Filter & Discrepancy Gate:
 *    - Jika AI mendiagnosis pemahaman tinggi (buzzword dropping) tapi tugas manipulasi empiris gagal,
 *      sistem memicu DISCREPANCY FLAG dan menolak pembaruan mastery sepihak!
 */

export interface EmpiricalSimulationEvidence {
  simulationId: string;
  taskCompleted: boolean;
  accuracyScore: number; // 0.0 to 1.0
  manipulationPrecision: number; // 0.0 to 1.0 (e.g. avoided buoyancy instability, balanced equation)
  trialCount: number;
  isTrialAndErrorGuesswork: boolean;
}

export interface TransferChallengeEvidence {
  targetDomain: string;
  appliedSuccessfully: boolean;
  transferScore: number; // 0.0 to 1.0
}

export interface ParentAuditAssessment {
  parentScore: number; // 0.0 to 1.0 (Skor penilaian observasi orang tua)
  parentNotes?: string;
  hasOverridden: boolean;
}

export interface ParentCalibrationSettings {
  parentWeight: number; // 0.0 to 1.0 (Bobot Pakar Manusia / Ortu)
  aiWeight: number;     // 1.0 - parentWeight (Bobot Evaluasi AI)
  mode: 'human_dominant' | 'balanced' | 'ai_delegated';
  expertiseLevel: 'expert' | 'moderate' | 'novice';
}

export const DEFAULT_PARENT_CALIBRATION: ParentCalibrationSettings = {
  parentWeight: 0.50,
  aiWeight: 0.50,
  mode: 'balanced',
  expertiseLevel: 'moderate',
};

export interface TriangulatedAssessmentResult {
  // undefined = TIDAK TERAMATI (bukan 0, bukan 0.5). Lihat KLASIFIKASI HARDCODE di foundation doc.
  compositeUnderstanding?: number; // 0.0 to 1.0
  compositeApplication?: number;   // hanya ada jika lab empiris teramati
  compositeTransfer?: number;      // hanya ada jika tes transfer nyata teramati (§6.1: "belum teruji")
  confidence: 'high' | 'medium' | 'low';
  noiseFlagDetected: boolean;
  discrepancyNote?: string;
  /** Sumber bukti yang tidak ada — masukan untuk Evidence Debt (§7), bukan untuk ditambal angka. */
  evidenceGaps: Array<'empirical' | 'transfer' | 'feynman'>;
  /** true = tidak ada satu pun sumber non-model (lab / tes transfer / rating orang tua). */
  provisional: boolean;
  evidenceBreakdown: {
    // Bobot EFEKTIF: bobot nominal dinormalisasi hanya atas sumber yang teramati (0 = tidak teramati).
    empiricalWeight: number;
    empiricalContribution: number;
    transferWeight: number;
    transferContribution: number;
    feynmanWeight: number;
    feynmanContribution: number;
    /** Skor verbal sebelum Filter A/B/C menyesuaikannya (penyesuaian tidak menimpa observasi asli). */
    feynmanRawScore?: number;
    humanParentWeight?: number;
    humanParentContribution?: number;
  };
  recommendedMasteryDelta: Partial<MasteryHierarchy>;
  shouldUpdateLearnerModel: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// KATEGORI KONSTANTA (klasifikasi hardcode menurut arsitektur sendiri):
//   TIDAK ADA   → tidak boleh berupa angka; tidak ada konstanta di sini (kembalikan undefined).
//   POLICY_     → keputusan desain yang diakui; BUKAN hasil kalibrasi empiris.
//   (PRIOR_ untuk asumsi populasi ada di deterministicCore.ts.)
// ─────────────────────────────────────────────────────────────────────────────

// Konfigurasi Bobot Triangulasi (POLICY: bobot awal yang ditetapkan sengaja, belum terkalibrasi)
export const POLICY_TRIANGULATION_WEIGHTS = {
  EMPIRICAL_SIMULATION: 0.60, // Sumber bukti utama: anak bertindak di lab
  TRANSFER_CHALLENGE: 0.25,   // Ujian transfer lintas domain
  FEYNMAN_AI_DIALOG: 0.15,    // Diagnosis dialog Socratic (dibatasi agar tidak jadi SPOF)
};
/** @deprecated alias lama; gunakan POLICY_TRIANGULATION_WEIGHTS. */
export const DEFAULT_TRIANGULATION_WEIGHTS = POLICY_TRIANGULATION_WEIGHTS;

// POLICY: boleh tidaknya sinyal model SAJA menggerakkan mastery. Risiko #1: Feynman = SPOF → false.
export const POLICY_MODEL_ONLY_MAY_UPDATE_MASTERY = false;
// POLICY: koreksi Filter B (redam skor AI saat lab gagal) dan Filter C (keadilan kognitif).
export const POLICY_NOISE_DAMPING_OFFSET = 0.1;
export const POLICY_FAIRNESS_FLOOR = 0.65;

// Ambang Batas Noise & Diskrepansi (POLICY)
export const DISCREPANCY_THRESHOLDS = {
  MAX_ALLOWED_DIVERGENCE: 0.35, // Selisih maksimal klaim AI vs bukti empiris lab
  MIN_WORD_COUNT_FOR_AI: 12,    // Kalimat di bawah 12 kata tidak valid untuk AI diagnosis penuh
  GUESSWORK_PENALTY: 0.25,      // Penalti jika telemetri menunjukkan tebak-tebak acak
};

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const r2 = (n: number) => Number(n.toFixed(2));

export function triangulateEvidence(
  empirical?: EmpiricalSimulationEvidence,
  feynman?: FeynmanDiagnosisResult,
  transfer?: TransferChallengeEvidence,
  options: {
    customWeights?: typeof POLICY_TRIANGULATION_WEIGHTS;
    childUtteranceWordCount?: number;
    parentAudit?: ParentAuditAssessment;
    parentCalibration?: ParentCalibrationSettings;
    assessmentModality?: AssessmentModality;
  } = {}
): TriangulatedAssessmentResult {
  const modality = options.assessmentModality || 'socratic_feynman';

  // Penyesuaian bobot otomatis berdasarkan modalitas usia anak (Developmental Alignment) — POLICY
  let weights = options.customWeights || POLICY_TRIANGULATION_WEIGHTS;
  if (!options.customWeights) {
    if (modality === 'behavioral_observation') {
      // Tier I (1-3): Mengutamakan manipulasi fisik & observasi langsung, bukan dialog AI
      weights = { EMPIRICAL_SIMULATION: 0.70, TRANSFER_CHALLENGE: 0.20, FEYNMAN_AI_DIALOG: 0.10 };
    } else if (modality === 'visual_manipulation') {
      // Tier II (4-6): Kombinasi manipulasi visual dan intuisi konkret
      weights = { EMPIRICAL_SIMULATION: 0.65, TRANSFER_CHALLENGE: 0.20, FEYNMAN_AI_DIALOG: 0.15 };
    }
  }

  // Jumlah kata tidak diketahui ⇒ Filter A tidak dijalankan (bukan diasumsikan 20 kata).
  const wordCount = options.childUtteranceWordCount;
  const parentCalibration = options.parentCalibration || DEFAULT_PARENT_CALIBRATION;
  const parentAudit = options.parentAudit;

  // 1. Skor Empiris (Lab Simulasi) — undefined jika lab tidak teramati
  let empiricalScore: number | undefined;
  if (empirical) {
    empiricalScore = (empirical.accuracyScore * 0.6) + (empirical.manipulationPrecision * 0.4);
    if (empirical.isTrialAndErrorGuesswork) {
      empiricalScore = Math.max(0, empiricalScore - DISCREPANCY_THRESHOLDS.GUESSWORK_PENALTY);
    }
  }

  // 2. Skor Transfer — undefined jika tidak ada tes transfer nyata
  const transferScore: number | undefined = transfer ? transfer.transferScore : undefined;

  // 3. Skor Dialog Verbal (Feynman) — hanya dari field yang benar-benar dikembalikan sensor
  let rawAiScore: number | undefined;
  let isAiNoiseSuspect = false;
  let discrepancyNote: string | undefined;

  if (feynman) {
    const observed = [feynman.conceptualUnderstanding, feynman.causalReasoning].filter(isNum);
    if (observed.length > 0) {
      rawAiScore = observed.reduce((a, b) => a + b, 0) / observed.length;
    }
  }
  const feynmanRawScore = rawAiScore;

  if (rawAiScore !== undefined) {
    // Filter A: Deteksi kalimat terlalu singkat
    // Hanya berlaku untuk anak Tier III-IV (socratic_feynman). Untuk batita/balita, manipulasi tindakan adalah kuncinya.
    const isVerbalExpected = modality === 'socratic_feynman' || modality === 'relational_manipulation';
    if (isVerbalExpected && wordCount !== undefined && wordCount < DISCREPANCY_THRESHOLDS.MIN_WORD_COUNT_FOR_AI) {
      isAiNoiseSuspect = true;
      discrepancyNote = `Kalimat anak terlalu singkat (${wordCount} kata). AI diagnosis diragukan karena kurangnya konteks linguistik.`;
      if (empiricalScore !== undefined) rawAiScore = empiricalScore; // Downweight: ikuti bukti empiris
    }

    // Filter B: Diskrepansi "Buzzword Dropping / Hafalan Semu"
    if (rawAiScore >= 0.80 && empiricalScore !== undefined && empiricalScore < 0.45) {
      isAiNoiseSuspect = true;
      discrepancyNote = `Terdeteksi diskrepansi: AI mendeteksi pemahaman verbal (${(rawAiScore * 100).toFixed(0)}%), namun manipulasi empiris di lab gagal (${(empiricalScore * 100).toFixed(0)}%). Kemungkinan pengucapan istilah (buzzwords) tanpa intuisi kausal.`;
      rawAiScore = empiricalScore + POLICY_NOISE_DAMPING_OFFSET;
    }

    // Filter C: Diskrepansi "Anak Paham tapi Typo / Canggung Mengetik"
    if (rawAiScore < 0.40 && empiricalScore !== undefined && empiricalScore >= 0.85) {
      discrepancyNote = `Anak mahir secara empiris (${(empiricalScore * 100).toFixed(0)}%), namun penjelasan verbalnya minim (${(rawAiScore * 100).toFixed(0)}%). Skor tidak diturunkan secara drastis demi keadilan kognitif.`;
      rawAiScore = Math.max(rawAiScore, POLICY_FAIRNESS_FLOOR);
    }
  }

  // Fusi Verbal: Human-in-the-Loop (Orang Tua) vs AI
  let feynmanScore: number | undefined = rawAiScore;
  let humanParentContribution = 0;
  let humanParentEffectiveWeight = parentCalibration.parentWeight;

  if (parentAudit) {
    if (rawAiScore !== undefined) {
      const pWeight = parentCalibration.parentWeight;
      const aWeight = parentCalibration.aiWeight;
      feynmanScore = (parentAudit.parentScore * pWeight) + (rawAiScore * aWeight);
      humanParentContribution = parentAudit.parentScore * pWeight;
      if (parentAudit.hasOverridden) {
        discrepancyNote = `Audit Human-in-the-Loop diterapkan: Evaluasi Orang Tua (Bobot ${(pWeight * 100).toFixed(0)}%) diselaraskan dengan AI (Bobot ${(aWeight * 100).toFixed(0)}%).`;
      }
    } else {
      // Tidak ada estimasi model: kanal verbal sepenuhnya rating manusia.
      feynmanScore = parentAudit.parentScore;
      humanParentContribution = parentAudit.parentScore;
      humanParentEffectiveWeight = 1;
    }
  }

  // 4. Fusi tertimbang HANYA atas sumber yang teramati (bobot dinormalisasi; yang tidak ada tidak ikut).
  const sources = [
    { key: 'empirical' as const, w: weights.EMPIRICAL_SIMULATION, s: empiricalScore },
    { key: 'transfer' as const, w: weights.TRANSFER_CHALLENGE, s: transferScore },
    { key: 'feynman' as const, w: weights.FEYNMAN_AI_DIALOG, s: feynmanScore },
  ];
  const present = sources.filter((x): x is { key: typeof x.key; w: number; s: number } => x.s !== undefined);
  const totalW = present.reduce((a, x) => a + x.w, 0);
  const effW = (k: 'empirical' | 'transfer' | 'feynman') => {
    const x = present.find((p) => p.key === k);
    return x && totalW > 0 ? x.w / totalW : 0;
  };
  const compUnderstanding = totalW > 0 ? present.reduce((a, x) => a + x.s * (x.w / totalW), 0) : undefined;

  const evidenceGaps = sources.filter((x) => x.s === undefined).map((x) => x.key);

  // Kuorum: minimal satu sumber non-model (lab / tes transfer / rating orang tua).
  const hasNonModelSource = empiricalScore !== undefined || transferScore !== undefined || parentAudit !== undefined;
  const provisional = !hasNonModelSource;

  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (provisional) {
    confidence = 'low';
  } else if (isAiNoiseSuspect && (!parentAudit || parentCalibration.parentWeight < 0.5)) {
    confidence = 'low';
  } else if (empiricalScore === undefined || transferScore === undefined) {
    confidence = 'medium';
  }

  const noiseGate = !isAiNoiseSuspect
    || (empirical !== undefined && empirical.taskCompleted)
    || (parentAudit !== undefined && parentCalibration.parentWeight >= 0.5);
  const shouldUpdateLearnerModel = present.length > 0
    && (hasNonModelSource || POLICY_MODEL_ONLY_MAY_UPDATE_MASTERY)
    && noiseGate;

  // Delta hanya berisi dimensi yang teramati; jika tidak boleh update, delta kosong.
  const recommendedMasteryDelta: Partial<MasteryHierarchy> = {};
  if (shouldUpdateLearnerModel) {
    if (compUnderstanding !== undefined) recommendedMasteryDelta.understanding = r2(compUnderstanding);
    if (empiricalScore !== undefined) recommendedMasteryDelta.application = r2(empiricalScore);
    if (transferScore !== undefined) recommendedMasteryDelta.transfer = r2(transferScore);
    if (feynmanScore !== undefined) recommendedMasteryDelta.explanation = r2(feynmanScore);
  }

  const contrib = (s: number | undefined, k: 'empirical' | 'transfer' | 'feynman') =>
    s === undefined ? 0 : Number((s * effW(k)).toFixed(3));

  return {
    compositeUnderstanding: compUnderstanding !== undefined ? r2(compUnderstanding) : undefined,
    compositeApplication: empiricalScore !== undefined ? r2(empiricalScore) : undefined,
    compositeTransfer: transferScore !== undefined ? r2(transferScore) : undefined,
    confidence,
    noiseFlagDetected: isAiNoiseSuspect,
    discrepancyNote,
    evidenceGaps,
    provisional,
    evidenceBreakdown: {
      empiricalWeight: effW('empirical'),
      empiricalContribution: contrib(empiricalScore, 'empirical'),
      transferWeight: effW('transfer'),
      transferContribution: contrib(transferScore, 'transfer'),
      feynmanWeight: effW('feynman'),
      feynmanContribution: contrib(feynmanScore, 'feynman'),
      feynmanRawScore: feynmanRawScore !== undefined ? r2(feynmanRawScore) : undefined,
      humanParentWeight: parentAudit ? humanParentEffectiveWeight : undefined,
      humanParentContribution: parentAudit ? Number(humanParentContribution.toFixed(3)) : undefined,
    },
    recommendedMasteryDelta,
    shouldUpdateLearnerModel,
  };
}
