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
