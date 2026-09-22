import {
  FeynmanDiagnosisResult,
  LearnerNodeState,
  MasteryHierarchy,
} from '../types';
import { applyMasteryGating } from './deterministicCore';

/**
 * MULTI-MODAL EVIDENCE TRIANGULATION & FEYNMAN NOISE SHIELD
 *
 * Mengatasi Risiko #1 (Section 11 DOKUMEN_FONDASI_ARSITEKTUR.md):
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

export interface TriangulatedAssessmentResult {
  compositeUnderstanding: number; // 0.0 to 1.0
  compositeApplication: number;
  compositeTransfer: number;
  confidence: 'high' | 'medium' | 'low';
  noiseFlagDetected: boolean;
  discrepancyNote?: string;
  evidenceBreakdown: {
    empiricalWeight: number; // e.g. 0.60
    empiricalContribution: number;
    transferWeight: number;  // e.g. 0.25
    transferContribution: number;
    feynmanWeight: number;   // e.g. 0.15
    feynmanContribution: number;
  };
  recommendedMasteryDelta: Partial<MasteryHierarchy>;
  shouldUpdateLearnerModel: boolean;
}

// Konfigurasi Bobot Triangulasi Default
export const DEFAULT_TRIANGULATION_WEIGHTS = {
  EMPIRICAL_SIMULATION: 0.60, // Sumber bukti utama: anak bertindak di lab
  TRANSFER_CHALLENGE: 0.25,   // Ujian transfer lintas domain
  FEYNMAN_AI_DIALOG: 0.15,    // Diagnosis dialog Socratic (dibatasi agar tidak jadi SPOF)
};

// Ambang Batas Noise & Diskrepansi
export const DISCREPANCY_THRESHOLDS = {
  MAX_ALLOWED_DIVERGENCE: 0.35, // Selisih maksimal klaim AI vs bukti empiris lab
  MIN_WORD_COUNT_FOR_AI: 12,    // Kalimat di bawah 12 kata tidak valid untuk AI diagnosis penuh
  GUESSWORK_PENALTY: 0.25,      // Penalti jika telemetri menunjukkan tebak-tebak acak
};

export function triangulateEvidence(
  empirical?: EmpiricalSimulationEvidence,
  feynman?: FeynmanDiagnosisResult,
  transfer?: TransferChallengeEvidence,
  options: {
    customWeights?: typeof DEFAULT_TRIANGULATION_WEIGHTS;
    childUtteranceWordCount?: number;
  } = {}
): TriangulatedAssessmentResult {
  const weights = options.customWeights || DEFAULT_TRIANGULATION_WEIGHTS;
  const wordCount = options.childUtteranceWordCount ?? 20;

  // 1. Ekstraksi Skor Empiris (Lab Simulasi)
  let empiricalScore = 0.5; // fallback netral jika belum ada tes lab
  if (empirical) {
    empiricalScore = (empirical.accuracyScore * 0.6) + (empirical.manipulationPrecision * 0.4);
    if (empirical.isTrialAndErrorGuesswork) {
      empiricalScore = Math.max(0, empiricalScore - DISCREPANCY_THRESHOLDS.GUESSWORK_PENALTY);
    }
  }

  // 2. Ekstraksi Skor Transfer
  let transferScore = 0.4;
  if (transfer) {
    transferScore = transfer.transferScore;
  }

  // 3. Ekstraksi Skor Feynman Sensor (AI Dialog)
  let feynmanScore = 0.5;
  let isAiNoiseSuspect = false;
  let discrepancyNote: string | undefined;

  if (feynman) {
    feynmanScore = (feynman.conceptualUnderstanding * 0.5) + (feynman.causalReasoning * 0.5);

    // Filter A: Deteksi kalimat terlalu singkat (terlalu sedikit data untuk analisis bahasa bermakna)
    if (wordCount < DISCREPANCY_THRESHOLDS.MIN_WORD_COUNT_FOR_AI) {
      isAiNoiseSuspect = true;
      discrepancyNote = `Kalimat anak terlalu singkat (${wordCount} kata). AI diagnosis diragukan karena kurangnya konteks linguistik.`;
      feynmanScore = empiricalScore; // Downweight: ikuti bukti empiris
    }

    // Filter B: Diskrepansi "Buzzword Dropping / Hafalan Semu"
    // AI memberi nilai tinggi (> 0.8), tapi di simulasi empiris anak gagal manipulasi (< 0.45)
    if (feynmanScore >= 0.80 && empirical && empiricalScore < 0.45) {
      isAiNoiseSuspect = true;
      discrepancyNote = `Terdeteksi diskrepansi: AI mendeteksi pemahaman verbal (${(feynmanScore * 100).toFixed(0)}%), namun manipulasi empiris di lab gagal (${(empiricalScore * 100).toFixed(0)}%). Kemungkinan pengucapan istilah (buzzwords) tanpa intuisi kausal.`;
      // Redam skor AI agar tidak mencemari model
      feynmanScore = empiricalScore + 0.1;
    }

    // Filter C: Diskrepansi "Anak Paham tapi Typo / Canggung Mengetik"
    // AI memberi nilai rendah (< 0.4), tapi di simulasi empiris anak sempurna (0.95)
    if (feynmanScore < 0.40 && empirical && empiricalScore >= 0.85) {
      discrepancyNote = `Anak mahir secara empiris (${(empiricalScore * 100).toFixed(0)}%), namun penjelasan verbalnya minim (${(feynmanScore * 100).toFixed(0)}%). Skor tidak diturunkan secara drastis demi keadilan kognitif.`;
      feynmanScore = Math.max(feynmanScore, 0.65);
    }
  }

  // 4. Perhitungan Triangulasi Tertimbang (Weighted Multi-Modal Fusion)
  const compUnderstanding =
    (empiricalScore * weights.EMPIRICAL_SIMULATION) +
    (transferScore * weights.TRANSFER_CHALLENGE) +
    (feynmanScore * weights.FEYNMAN_AI_DIALOG);

  const compApplication = empirical ? empiricalScore : compUnderstanding * 0.9;
  const compTransfer = transfer ? transferScore : (compUnderstanding * 0.7);

  // Confidence level
  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (isAiNoiseSuspect) {
    confidence = 'low';
  } else if (!empirical || !transfer) {
    confidence = 'medium';
  }

  // Siapkan rekomendasi update mastery dengan gating deterministik
  const recommendedMasteryDelta: Partial<MasteryHierarchy> = {
    understanding: Number(compUnderstanding.toFixed(2)),
    application: Number(compApplication.toFixed(2)),
    transfer: Number(compTransfer.toFixed(2)),
    explanation: Number(feynmanScore.toFixed(2)),
  };

  return {
    compositeUnderstanding: Number(compUnderstanding.toFixed(2)),
    compositeApplication: Number(compApplication.toFixed(2)),
    compositeTransfer: Number(compTransfer.toFixed(2)),
    confidence,
    noiseFlagDetected: isAiNoiseSuspect,
    discrepancyNote,
    evidenceBreakdown: {
      empiricalWeight: weights.EMPIRICAL_SIMULATION,
      empiricalContribution: Number((empiricalScore * weights.EMPIRICAL_SIMULATION).toFixed(3)),
      transferWeight: weights.TRANSFER_CHALLENGE,
      transferContribution: Number((transferScore * weights.TRANSFER_CHALLENGE).toFixed(3)),
      feynmanWeight: weights.FEYNMAN_AI_DIALOG,
      feynmanContribution: Number((feynmanScore * weights.FEYNMAN_AI_DIALOG).toFixed(3)),
    },
    recommendedMasteryDelta,
    shouldUpdateLearnerModel: !isAiNoiseSuspect || (empirical !== undefined && empirical.taskCompleted),
  };
}
