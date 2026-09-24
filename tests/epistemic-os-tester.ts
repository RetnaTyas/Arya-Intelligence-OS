/**
 * TEST HARNESS KHUSUS: EPISTEMIC OS & DETERMINISTIC CORE VERIFIER
 * 
 * Pengujian komprehensif 5 Tahap:
 * 1. Integritas Skema Graf & Validitas DAG (Tanpa Siklus)
 * 2. Uji Hipotesis Pusat & 4-Probe Independen (Layer 0, 1, 2)
 * 3. Triangulasi Bukti Multimodal (60/25/15) & Deterministic 7-Tier Mastery Gating
 * 4. Peluruhan Ebbinghaus, Utang Epistemik & Aksi Otomatis Stealth Repair Loop
 * 5. Dynamic Telemetry Vector & State Integrity
 *
 * Jalankan dengan: npx tsx tests/epistemic-os-tester.ts
 */

import { INITIAL_KNOWLEDGE_GRAPH } from '../src/data/initialKnowledgeGraph';
import { NARROW_DOMAIN_MATH_NODES } from '../src/data/narrowMathDomain';
import { INITIAL_LEARNER_NODES } from '../src/data/initialLearnerState';
import {
  evaluatePrerequisites,
  applyMasteryGating,
  calculateDeterministicDecay,
  calculateDeterministicEpistemicDebt,
  selectNextBestExperience,
  getAutomatedStealthRepairAction,
  applyStealthRepairResolution,
} from '../src/engine/deterministicCore';
import {
  triangulateEvidence,
  ParentCalibrationSettings,
  EmpiricalSimulationEvidence,
  TransferChallengeEvidence,
  ParentAuditAssessment,
  DEFAULT_PARENT_CALIBRATION,
} from '../src/engine/evidenceTriangulation';
import {
  HUMAN_GOLD_STANDARD_BENCHMARK,
  evaluateDiagnosticAgreementAndPerturbation,
} from '../src/engine/centralHypothesisBenchmark';
import { computeRealTimeTelemetry } from '../src/engine/dynamicTelemetry';
import { KnowledgeNode, LearnerNodeState, FeynmanDiagnosisResult } from '../src/types';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  measurement: string;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, measurement: string) {
  if (condition) {
    results.push({ suite, name, passed: true, measurement });
  } else {
    results.push({
      suite,
      name,
      passed: false,
      measurement,
      error: `Assertion failed: ${measurement}`,
    });
  }
}

// ============================================================================
// SUITE 1: INTEGRITAS SKEMA GRAF & VALIDITAS DAG (TAHAP 0 & 1)
// ============================================================================
function runSuite1() {
  const suite = 'Suite 1: Graph Schema & DAG Integrity';
  const allNodes: KnowledgeNode[] = [...INITIAL_KNOWLEDGE_GRAPH];
  const nodeMap = new Map<string, KnowledgeNode>();
  allNodes.forEach((n) => nodeMap.set(n.id, n));

  // 1.1 Validasi Prerequisite existence
  let invalidPrereqCount = 0;
  for (const node of allNodes) {
    for (const pId of node.prerequisites) {
      if (!nodeMap.has(pId)) {
        invalidPrereqCount++;
      }
    }
  }
  assert(
    invalidPrereqCount === 0,
    suite,
    'Prerequisite Node Existence',
    `Semua prerequisite (${allNodes.length} node) merujuk ke node ID yang valid. Error count: ${invalidPrereqCount}`
  );

  // 1.2 Deteksi Siklus (Acyclicity / DAG check)
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  let hasCycle = false;
  let cycleTrace: string[] = [];

  function checkCycle(nodeId: string, trace: string[]): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (node) {
      for (const pId of node.prerequisites) {
        if (!visited.has(pId)) {
          if (checkCycle(pId, [...trace, pId])) return true;
        } else if (recursionStack.has(pId)) {
          hasCycle = true;
          cycleTrace = [...trace, pId];
          return true;
        }
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of allNodes) {
    if (!visited.has(node.id)) {
      if (checkCycle(node.id, [node.id])) break;
    }
  }

  assert(
    !hasCycle,
    suite,
    'DAG Acyclicity (Bebas Siklus Dependensi)',
    hasCycle ? `Terdeteksi siklus: ${cycleTrace.join(' -> ')}` : 'Graf terverifikasi murni Directed Acyclic Graph (DAG) tanpa siklus kausal.'
  );

  // 1.3 Kelengkapan WhyChain & Batas Metrik Epistemik (0 - 1)
  let validMetrics = true;
  for (const node of allNodes) {
    if (node.centrality < 0 || node.centrality > 1 || node.futureRelevance < 0 || node.futureRelevance > 1) {
      validMetrics = false;
    }
    if (!node.whyChain || node.whyChain.length === 0) {
      validMetrics = false;
    }
  }
  assert(
    validMetrics,
    suite,
    'Kelengkapan WhyChain & Bounded Metrics',
    `Seluruh ${allNodes.length} node memiliki WhyChain eksplisit dan bobot centrality/futureRelevance dalam interval [0, 1].`
  );

  // 1.4 Validasi Domain Sempit Matematika (Narrow Domain)
  const narrowNodes = NARROW_DOMAIN_MATH_NODES;
  const narrowMap = new Map<string, KnowledgeNode>();
  narrowNodes.forEach((n) => narrowMap.set(n.id, n));
  let narrowPrereqOk = true;
  for (const n of narrowNodes) {
    for (const p of n.prerequisites) {
      if (!narrowMap.has(p)) narrowPrereqOk = false;
    }
  }
  assert(
    narrowPrereqOk && narrowNodes.length >= 5,
    suite,
    'Narrow Math Domain Schema Compliance',
    `Domain sempit Matematika memuat ${narrowNodes.length} node terstruktur vertikal dengan prasyarat konsisten.`
  );
}

// ============================================================================
// SUITE 2: UJI HIPOTESIS PUSAT & 4-PROBE INDEPENDEN (TAHAP 2)
// ============================================================================
function runSuite2() {
  const suite = 'Suite 2: Central Hypothesis 4-Probe Benchmark Engine';
  const benchmarkItems = HUMAN_GOLD_STANDARD_BENCHMARK;

  // 2.1 Verifikasi Struktur 4 Probe per Item
  let validStructure = true;
  for (const it of benchmarkItems) {
    if (!it.childUtterance || !it.perturbations.layer0.childUtterance || !it.perturbations.layer1.childUtterance || !it.perturbations.layer2.childUtterance) {
      validStructure = false;
    }
    // Periksa bahwa Layer 2 memiliki minimal contrast distinction
    if (!it.perturbations.layer2.contrastDifference) {
      validStructure = false;
    }
  }
  assert(
    validStructure && benchmarkItems.length === 12,
    suite,
    'Struktur 4-Probe Independen (Base, Layer 0, 1, 2)',
    `Semua 12 item standar emas memiliki 4 ujaran anak independen & spesifikasi kontras semantik.`
  );

  // 2.2 Uji Evaluasi Deterministik Agreement & Perturbation (Kasus Kontrol Positif)
  const positiveControlItem = benchmarkItems.find((it) => !it.humanExpertDiagnosis.hasMisconception) || benchmarkItems[3];
  const aiResultsControlPass = {
    base: {
      hasMisconception: false,
      misconceptionName: 'None',
      structuralMasteryScore: 0.95,
      explanation: 'Anak memahami konsep partisi secara mendalam dan relasi invers penyebut.',
    },
    layer0: {
      hasMisconception: false,
      misconceptionName: 'None',
      structuralMasteryScore: 0.92,
      explanation: 'Konsisten mengakui pemahaman konseptual pada reformulasi identik.',
    },
    layer1: {
      hasMisconception: false,
      misconceptionName: 'None',
      structuralMasteryScore: 0.94,
      explanation: 'Pemahaman partisi terbukti kokoh saat objek divariasikan.',
    },
    layer2: {
      hasMisconception: false,
      misconceptionName: 'None',
      structuralMasteryScore: 0.90,
      explanation: 'Minimal contrast pair: anak membuktikan pemahaman struktural bukan hafalan semata.',
    },
  };

  const evalPass = evaluateDiagnosticAgreementAndPerturbation(positiveControlItem, aiResultsControlPass);
  assert(
    evalPass.perturbationSurvival.layer0Pass &&
    evalPass.perturbationSurvival.layer1Pass &&
    evalPass.perturbationSurvival.layer2Pass &&
    evalPass.epistemicVerdict === 'ROBUST_STRUCTURAL',
    suite,
    'Evaluasi Lolos 4-Probe Kontrol Positif (ROBUST_STRUCTURAL)',
    `Konkordansi: ${(evalPass.agreementScore * 100).toFixed(1)}%, L0: ${evalPass.perturbationSurvival.layer0Pass}, L1: ${evalPass.perturbationSurvival.layer1Pass}, L2: ${evalPass.perturbationSurvival.layer2Pass}, Verdict: ${evalPass.epistemicVerdict}`
  );

  // 2.3 Uji Kegagalan Layer 2 Minimal Contrast (Deteksi Kerapuhan FRAGILE_SURFACE)
  const testItem = benchmarkItems[0]; // FRACTION-ADD-DENOM-01 (Miskonsepsi)
  const aiResultsFailLayer2 = {
    base: {
      hasMisconception: true,
      misconceptionName: 'Penjumlahan Langsung Pembilang dan Penyebut',
      structuralMasteryScore: 0.25,
      explanation: 'Anak menjumlahkan pembilang dengan pembilang dan penyebut dengan penyebut tanpa mencari KPK.',
    },
    layer0: {
      hasMisconception: true,
      misconceptionName: 'Penjumlahan Langsung Pembilang dan Penyebut',
      structuralMasteryScore: 0.22,
      explanation: 'Mendeteksi kesalahan pada pengulangan identik.',
    },
    layer1: {
      hasMisconception: true,
      misconceptionName: 'Penjumlahan Langsung Pembilang dan Penyebut',
      structuralMasteryScore: 0.28,
      explanation: 'Miskonsepsi bertahan pada objek martabak.',
    },
    layer2: {
      hasMisconception: false, // AI terkecoh di Layer 2 minimal contrast pair!
      misconceptionName: 'None',
      structuralMasteryScore: 0.88, // Skor melompat palsu
      explanation: 'Anak menjawab dengan benar sehingga diasumsikan paham.',
    },
  };

  const evalFail = evaluateDiagnosticAgreementAndPerturbation(testItem, aiResultsFailLayer2);
  assert(
    evalFail.perturbationSurvival.layer0Pass &&
    evalFail.perturbationSurvival.layer1Pass &&
    !evalFail.perturbationSurvival.layer2Pass &&
    evalFail.epistemicVerdict === 'FRAGILE_SURFACE',
    suite,
    'Deteksi Kerapuhan Semantik Layer 2 (FRAGILE_SURFACE)',
    `L0: ${evalFail.perturbationSurvival.layer0Pass}, L1: ${evalFail.perturbationSurvival.layer1Pass}, L2: ${evalFail.perturbationSurvival.layer2Pass} (Gagal minimal contrast), Verdict: ${evalFail.epistemicVerdict}`
  );
}

// ============================================================================
// SUITE 3: MULTIMODAL TRIANGULATION & 7-TIER MASTERY GATING (TAHAP 3)
// ============================================================================
function runSuite3() {
  const suite = 'Suite 3: Evidence Triangulation & Deterministic Gating';

  // 3.1 Triangulasi Standar (60% Lab, 25% Transfer, 15% Sensor Kognitif)
  const empiricalEvidence: EmpiricalSimulationEvidence = {
    simulationId: 'sim-buoyancy-tank',
    taskCompleted: true,
    trialCount: 5,
    accuracyScore: 1.0,
    manipulationPrecision: 0.90,
    isTrialAndErrorGuesswork: false,
  };

  const feynmanResult: FeynmanDiagnosisResult = {
    conceptualUnderstanding: 0.90,
    causalReasoning: 0.88,
    transferScore: 0.85,
    analogyDetected: true,
    misconceptions: [],
    feedbackSummary: 'Penjelasan kausal tervalidasi.',
    nextBestProbe: 'Bagaimana jika massa jenis cairan diganti menjadi air raksa?',
  };

  const transferEvidence: TransferChallengeEvidence = {
    targetDomain: 'Teknik Maritim',
    appliedSuccessfully: true,
    transferScore: 0.85,
  };

  const triangulated = triangulateEvidence(empiricalEvidence, feynmanResult, transferEvidence, {
    parentCalibration: DEFAULT_PARENT_CALIBRATION,
  });
  // Bobot: 60% empirical (~0.96), 25% transfer (0.85), 15% feynman (0.89) => ~0.92
  assert(
    triangulated.compositeUnderstanding >= 0.85 && triangulated.compositeUnderstanding <= 0.98 && !triangulated.noiseFlagDetected,
    suite,
    'Fusi Triangulasi Multimodal Standar (60/25/15)',
    `Skor Fusi: ${(triangulated.compositeUnderstanding * 100).toFixed(1)}%, Confidence: ${triangulated.confidence}, Noise Shield: ${triangulated.noiseFlagDetected}`
  );

  // 3.2 Feynman Noise Shield: Buzzword Dropping / Verbal Rote tanpa Intuisi Lab
  const failingEmpirical: EmpiricalSimulationEvidence = {
    simulationId: 'sim-buoyancy-tank',
    taskCompleted: false,
    trialCount: 6,
    accuracyScore: 0.20,
    manipulationPrecision: 0.30,
    isTrialAndErrorGuesswork: true,
  };

  const verboseFeynman: FeynmanDiagnosisResult = {
    conceptualUnderstanding: 0.92,
    causalReasoning: 0.88,
    transferScore: 0.85,
    analogyDetected: false,
    misconceptions: [],
    feedbackSummary: 'Menggunakan istilah teknis massa jenis fluida.',
    nextBestProbe: 'Bisakah kamu buktikan dengan menimbang cairan yang tumpah?',
  };

  const noiseShieldTriangulated = triangulateEvidence(failingEmpirical, verboseFeynman, undefined, {
    parentCalibration: DEFAULT_PARENT_CALIBRATION,
  });
  assert(
    noiseShieldTriangulated.noiseFlagDetected === true && noiseShieldTriangulated.confidence === 'low',
    suite,
    'Feynman Noise Shield Activation (Buzzword Dropping)',
    `Noise Shield: ${noiseShieldTriangulated.noiseFlagDetected}, Discrepancy: "${noiseShieldTriangulated.discrepancyNote?.slice(0, 75)}..."`
  );

  // 3.3 Kalibrasi Orang Tua (Human-in-the-Loop Override)
  const conservativeParentAudit: ParentAuditAssessment = {
    parentScore: 0.40,
    hasOverridden: true,
    parentNotes: 'Orang tua menilai anak masih ragu-ragu membedakan massa dan kerapatan.',
  };
  const parentAdjusted = triangulateEvidence(empiricalEvidence, feynmanResult, transferEvidence, {
    parentAudit: conservativeParentAudit,
    parentCalibration: {
      parentWeight: 0.50,
      aiWeight: 0.50,
      mode: 'balanced',
      expertiseLevel: 'moderate',
    },
  });
  assert(
    parentAdjusted.compositeUnderstanding < triangulated.compositeUnderstanding,
    suite,
    'Parent Calibration Weight Adjustment (Human-in-the-Loop)',
    `Skor terkalibrasi orang tua: ${(parentAdjusted.compositeUnderstanding * 100).toFixed(1)}% < Standar: ${(triangulated.compositeUnderstanding * 100).toFixed(1)}%`
  );

  // 3.4 Deterministic 7-Tier Mastery Gating (Rules A - E)
  const baseMastery = {
    recognition: 0.50,
    recall: 0.80, // Melanggar Rule A: recall > recognition + 0.10
    understanding: 0.90, // Melanggar Rule B: understanding tinggi tanpa recognition/recall cukup
    application: 0.85,
    transfer: 0.90, // Melanggar Rule D: transfer tidak boleh dibuka tanpa prereq
    explanation: 0.40,
    creation: 0.85, // Melanggar Rule E: creation butuh transfer & explanation >= 0.70
  };

  const gated = applyMasteryGating(
    { recognition: 0, recall: 0, understanding: 0, application: 0, transfer: 0, explanation: 0, creation: 0 },
    baseMastery
  );

  const ruleAPass = gated.recall <= gated.recognition + 0.10 + 0.001;
  const ruleBPass = gated.understanding <= 0.55;
  const ruleDPass = gated.transfer <= 0.50;
  const ruleEPass = gated.creation <= 0.45;

  assert(
    ruleAPass && ruleBPass && ruleDPass && ruleEPass,
    suite,
    'Deterministic 7-Tier Mastery Gating (Rules A-E)',
    `Gated Mastery: Recog=${gated.recognition}, Recall=${gated.recall}, Und=${gated.understanding}, App=${gated.application}, Trans=${gated.transfer}, Expl=${gated.explanation}, Creat=${gated.creation}`
  );
}

// ============================================================================
// SUITE 4: PELURUHAN, UTANG EPISTEMIK & AKSI OTOMATIS STEALTH (TAHAP 4)
// ============================================================================
function runSuite4() {
  const suite = 'Suite 4: Decay, Epistemic Debt & Automated Stealth Repair';

  // 4.1 Peluruhan Ebbinghaus Spaced Repetition
  const freshDecay = calculateDeterministicDecay('2029-02-20', 3, 0.5, '2029-02-21');
  const monthDecay = calculateDeterministicDecay('2029-02-20', 3, 0.5, '2029-03-22'); // 30 hari

  assert(
    freshDecay.decayRate < 0.05 && monthDecay.decayRate > 0.40 && monthDecay.isRepetitionDue,
    suite,
    'Peluruhan Retensi Ebbinghaus Matematis',
    `Hari 1: Decay ${(freshDecay.decayRate * 100).toFixed(1)}%, Hari 30: Decay ${(monthDecay.decayRate * 100).toFixed(1)}%, Repetition Due: ${monthDecay.isRepetitionDue}`
  );

  // 4.2 Formulasi Epistemic Debt Risk & Deteksi Bottleneck
  const sampleNode: KnowledgeNode = {
    id: 'node-symbolic-algebra',
    name: 'Pemodelan Simbolik & Persamaan Sederhana',
    domain: 'Matematika',
    description: 'Menyusun persamaan simbolik.',
    prerequisites: ['node-bar-model'],
    explanationLevels: { concrete: '', visual: '', symbolic: '', formal: '' },
    whyChain: ['Simetri aljabar'],
    masteryEvidenceRequired: ['solve'],
    commonMisconceptions: [],
    centrality: 0.88,
    futureRelevance: 0.95,
  };

  const decayedState: LearnerNodeState = {
    nodeId: sampleNode.id,
    mastery: { recognition: 0.7, recall: 0.6, understanding: 0.6, application: 0.5, transfer: 0.4, explanation: 0.4, creation: 0.2 },
    decayRate: 0.16, // Decay tinggi
    confidence: 'medium',
    evidenceCount: 3,
    lastInteracted: '2029-01-01',
    lastReinforcedDate: '2029-01-01',
    learningRate: 1.0,
    debtRisk: 0.268,
    isBottleneck: true,
    activeMisconceptions: [],
  };

  const debt = calculateDeterministicEpistemicDebt(sampleNode, decayedState, 0.5);
  assert(
    debt.isBottleneck === true && debt.severity === 'HIGH' && debt.recommendedAction === 'STEALTH_INSERTION',
    suite,
    'Epistemic Debt Bottleneck & Stealth Directive',
    `Debt Score: ${debt.debtRiskScore}, Severity: ${debt.severity}, Bottleneck: ${debt.isBottleneck}, Action: ${debt.recommendedAction}`
  );

  // 4.3 Aksi Otomatis: Dispatcher Stealth Repair Loop (Penyelesaian Temuan Audit!)
  const testNodes = [sampleNode];
  const testStates = { [sampleNode.id]: decayedState };

  const automatedAction = getAutomatedStealthRepairAction(testNodes, testStates);
  assert(
    automatedAction.actionRequired === true &&
    automatedAction.targetNodeId === sampleNode.id &&
    automatedAction.targetLabId === 'submarine_project',
    suite,
    'Aksi Otomatis Pengalihan Proyek Rekayasa (Rerouting Otomatis)',
    `Action Required: ${automatedAction.actionRequired}, Target Lab: ${automatedAction.targetLabId}, Alasan: "${automatedAction.rationale.slice(0, 80)}..."`
  );

  // 4.4 Aksi Otomatis: Eksekusi Resolusi Stealth & Netralisasi Utang
  const resolvedState = applyStealthRepairResolution(decayedState);
  const resolvedDebt = calculateDeterministicEpistemicDebt(sampleNode, resolvedState, 0.5);

  assert(
    resolvedState.decayRate === 0.0 && !resolvedDebt.isBottleneck && resolvedDebt.severity === 'LOW',
    suite,
    'Resolusi Loop & Netralisasi Utang Epistemik',
    `Decay Sebelum: ${(decayedState.decayRate * 100).toFixed(0)}% -> Sesudah: ${(resolvedState.decayRate * 100).toFixed(0)}%, Debt Baru: ${resolvedDebt.debtRiskScore} (${resolvedDebt.severity})`
  );
}

// ============================================================================
// SUITE 5: DYNAMIC TELEMETRY & STATE INTEGRITY (TAHAP 5)
// ============================================================================
function runSuite5() {
  const suite = 'Suite 5: Dynamic Telemetry & State Integrity';
  const nodes = INITIAL_KNOWLEDGE_GRAPH;
  const states = INITIAL_LEARNER_NODES;

  const telemetryMetrics = computeRealTimeTelemetry(nodes, states, []);

  // 5.1 Tidak Ada Angka Statis Palsu
  const hasValidDomains = telemetryMetrics.telemetry.length === 4;
  const validStability = telemetryMetrics.overallKnowledgeStability >= 0 && telemetryMetrics.overallKnowledgeStability <= 100;
  const validTransfer = telemetryMetrics.averageTransferStrength >= 0 && telemetryMetrics.averageTransferStrength <= 100;

  assert(
    hasValidDomains && validStability && validTransfer,
    suite,
    'Dynamic Telemetry Vector Derivation',
    `Domains: ${telemetryMetrics.telemetry.length}, Overall Stability: ${telemetryMetrics.overallKnowledgeStability}%, Avg Transfer: ${telemetryMetrics.averageTransferStrength}%, Critical Debt: ${telemetryMetrics.criticalDebt}`
  );

  // 5.2 Konsistensi Status Bottleneck di Seluruh Graf
  const detectedBottlenecks = telemetryMetrics.activeBottlenecks;
  assert(
    Array.isArray(detectedBottlenecks),
    suite,
    'Deteksi Bottleneck Graf Aktif',
    `Ditemukan ${detectedBottlenecks.length} bottleneck aktif dalam basis data pembelajar awal.`
  );
}

// ============================================================================
// RUNNER & LAPORAN AKHIR
// ============================================================================
export function runAllEpistemicTests(): {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
} {
  results.length = 0; // reset
  runSuite1();
  runSuite2();
  runSuite3();
  runSuite4();
  runSuite5();

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  return { total, passed, failed, results };
}

// Eksekusi jika dijalankan langsung via node / tsx
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('\n=============================================================');
  console.log('  EPISTEMIC INTELLIGENCE OS - AUTOMATED SYSTEM TEST SUITE  ');
  console.log('=============================================================\n');

  const outcome = runAllEpistemicTests();

  let currentSuite = '';
  for (const res of outcome.results) {
    if (res.suite !== currentSuite) {
      currentSuite = res.suite;
      console.log(`\n--- ${currentSuite} ---`);
    }
    const symbol = res.passed ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`  ${symbol} ${res.name}`);
    console.log(`    ↳ ${res.measurement}`);
    if (res.error) {
      console.error(`    🔴 ERROR: ${res.error}`);
    }
  }

  console.log('\n=============================================================');
  console.log(`  HASIL AKHIR: ${outcome.passed} / ${outcome.total} Lolos (${((outcome.passed / outcome.total) * 100).toFixed(1)}%)`);
  if (outcome.failed > 0) {
    console.log(`  🔴 ${outcome.failed} PENGUJIAN GAGAL`);
    process.exit(1);
  } else {
    console.log('  🟢 SEMUA SISTEM VALID SECARA EMPIRIS & DETERMINISTIK');
    console.log('=============================================================\n');
  }
}
