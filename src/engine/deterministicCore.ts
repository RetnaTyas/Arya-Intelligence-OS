import {
  KnowledgeNode,
  LearnerNodeState,
  MasteryHierarchy,
  ActiveTrajectory,
} from '../types';

/**
 * DETERMINISTIC CORE ENGINE
 *
 * Sesuai intelligence-os-foundation.md:
 * - Prinsip Desain #2: Graph adalah sumber kebenaran struktural. AI bukan "Supreme Curriculum God".
 * - Bagian 4.3: Batasan peran AI adalah tutor, diagnostician, generator, simulator interface.
 *   AI TIDAK MENULIS ULANG GRAPH ATAU MEMUTUSKAN ATURAN DETERMINISTIK.
 * - Bagian 7.4 & 11: Debt Risk, Decay, Spaced Repetition, Prerequisite Gating, dan Next-Experience
 *   adalah aturan deterministik matematis.
 */

// 1. Thresholds untuk Prerequisite Gating
export const PREREQUISITE_MASTERY_THRESHOLDS = {
  MIN_UNDERSTANDING: 0.70,
  MIN_APPLICATION: 0.60,
  MIN_RECALL: 0.60,
  MAX_ALLOWED_DECAY: 0.12,
};

// 2. Evaluasi apakah Prerequisite suatu node terpenuhi secara deterministik
export interface PrerequisiteStatus {
  isUnlocked: boolean;
  satisfactionRatio: number; // 0.0 to 1.0
  unmetPrerequisites: {
    nodeId: string;
    nodeName: string;
    currentUnderstanding: number;
    requiredUnderstanding: number;
    decayRate: number;
    reason: string;
  }[];
}

export function evaluatePrerequisites(
  node: KnowledgeNode,
  allNodes: KnowledgeNode[],
  learnerStates: Record<string, LearnerNodeState>
): PrerequisiteStatus {
  if (!node.prerequisites || node.prerequisites.length === 0) {
    return {
      isUnlocked: true,
      satisfactionRatio: 1.0,
      unmetPrerequisites: [],
    };
  }

  const unmet: PrerequisiteStatus['unmetPrerequisites'] = [];
  let totalScore = 0;

  for (const prereqId of node.prerequisites) {
    const prereqNode = allNodes.find((n) => n.id === prereqId);
    const prereqState = learnerStates[prereqId];
    const nodeName = prereqNode ? prereqNode.name : prereqId;

    if (!prereqState) {
      unmet.push({
        nodeId: prereqId,
        nodeName,
        currentUnderstanding: 0,
        requiredUnderstanding: PREREQUISITE_MASTERY_THRESHOLDS.MIN_UNDERSTANDING,
        decayRate: 0,
        reason: 'Belum pernah dipelajari / data penguasaan kosong',
      });
      continue;
    }

    const { understanding, application, recall } = prereqState.mastery;
    const isUnderstood = understanding >= PREREQUISITE_MASTERY_THRESHOLDS.MIN_UNDERSTANDING;
    const isApplied = application >= PREREQUISITE_MASTERY_THRESHOLDS.MIN_APPLICATION;
    const isNotDecayed = prereqState.decayRate <= PREREQUISITE_MASTERY_THRESHOLDS.MAX_ALLOWED_DECAY;

    // Prerequisite score contribution
    const nodeScore = (understanding * 0.5) + (application * 0.3) + (recall * 0.2);
    totalScore += Math.max(0, Math.min(1, nodeScore));

    if (!isUnderstood || !isApplied || !isNotDecayed) {
      let reason = '';
      if (!isUnderstood) {
        reason = `Understanding (${(understanding * 100).toFixed(0)}%) di bawah ambang ${(PREREQUISITE_MASTERY_THRESHOLDS.MIN_UNDERSTANDING * 100).toFixed(0)}%`;
      } else if (!isApplied) {
        reason = `Application (${(application * 100).toFixed(0)}%) di bawah ambang ${(PREREQUISITE_MASTERY_THRESHOLDS.MIN_APPLICATION * 100).toFixed(0)}%`;
      } else if (!isNotDecayed) {
        reason = `Decay (${(prereqState.decayRate * 100).toFixed(0)}%) melebihi toleransi ${(PREREQUISITE_MASTERY_THRESHOLDS.MAX_ALLOWED_DECAY * 100).toFixed(0)}%`;
      }

      unmet.push({
        nodeId: prereqId,
        nodeName,
        currentUnderstanding: understanding,
        requiredUnderstanding: PREREQUISITE_MASTERY_THRESHOLDS.MIN_UNDERSTANDING,
        decayRate: prereqState.decayRate,
        reason,
      });
    }
  }

  const satisfactionRatio = totalScore / node.prerequisites.length;
  const isUnlocked = unmet.length === 0;

  return {
    isUnlocked,
    satisfactionRatio: Math.min(1, satisfactionRatio),
    unmetPrerequisites: unmet,
  };
}

// 3. Deterministic Mastery Gating across 7 Tiers
// Tier k cannot exceed Tier k-1 by arbitrary leaps.
export function applyMasteryGating(
  current: MasteryHierarchy,
  incomingDelta: Partial<MasteryHierarchy>
): MasteryHierarchy {
  // Candidate updates
  let recognition = Math.max(current.recognition, incomingDelta.recognition ?? current.recognition);
  let recall = Math.max(current.recall, incomingDelta.recall ?? current.recall);
  let understanding = Math.max(current.understanding, incomingDelta.understanding ?? current.understanding);
  let application = Math.max(current.application, incomingDelta.application ?? current.application);
  let transfer = Math.max(current.transfer, incomingDelta.transfer ?? current.transfer);
  let explanation = Math.max(current.explanation, incomingDelta.explanation ?? current.explanation);
  let creation = Math.max(current.creation, incomingDelta.creation ?? current.creation);

  // Gating Rules:
  // Rule A: Recall cannot exceed recognition + 0.1
  recall = Math.min(recall, recognition + 0.1);

  // Rule B: Understanding requires solid recognition (>= 0.6) and recall (>= 0.5)
  if (recognition < 0.6 || recall < 0.5) {
    understanding = Math.min(understanding, 0.55);
  }

  // Rule C: Application requires understanding >= 0.65
  if (understanding < 0.65) {
    application = Math.min(application, understanding + 0.15);
  }

  // Rule D: Transfer cannot be unlocked without application >= 0.70 & understanding >= 0.75
  if (understanding < 0.75 || application < 0.70) {
    transfer = Math.min(transfer, 0.50);
  }

  // Rule E: Creation requires transfer >= 0.70 and explanation >= 0.70
  if (transfer < 0.70 || explanation < 0.70) {
    creation = Math.min(creation, 0.45);
  }

  return {
    recognition: Number(Math.min(1, Math.max(0, recognition)).toFixed(2)),
    recall: Number(Math.min(1, Math.max(0, recall)).toFixed(2)),
    understanding: Number(Math.min(1, Math.max(0, understanding)).toFixed(2)),
    application: Number(Math.min(1, Math.max(0, application)).toFixed(2)),
    transfer: Number(Math.min(1, Math.max(0, transfer)).toFixed(2)),
    explanation: Number(Math.min(1, Math.max(0, explanation)).toFixed(2)),
    creation: Number(Math.min(1, Math.max(0, creation)).toFixed(2)),
  };
}

// 4. Spaced Repetition & Decay Formulation (Ebbinghaus / Two-Component Model)
// R(t) = exp( - deltaT / S )
// S = BaseStability * (1 + repetitions * 0.25) * (transferBonus)
export interface SpacedRepetitionResult {
  daysElapsed: number;
  memoryStabilityDays: number;
  retentionProbability: number; // 0.0 to 1.0 (R)
  decayRate: number;            // 1 - R
  isRepetitionDue: boolean;
  optimalNextReviewDays: number;
}

export function calculateDeterministicDecay(
  lastReinforcedDateStr: string,
  evidenceCount: number = 3,
  transferScore: number = 0.5,
  referenceDateStr?: string
): SpacedRepetitionResult {
  const lastDate = new Date(lastReinforcedDateStr).getTime();
  const refDate = referenceDateStr ? new Date(referenceDateStr).getTime() : Date.now();
  const diffMs = Math.max(0, refDate - lastDate);
  const daysElapsed = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Memory Stability S in days:
  // Starts at 7 days, grows exponentially with verified evidence and cross-domain transfer
  const baseStability = 10;
  const repetitionFactor = 1 + (evidenceCount * 0.3);
  const transferMultiplier = transferScore >= 0.7 ? 1.6 : transferScore >= 0.4 ? 1.2 : 0.9;
  const memoryStabilityDays = Number((baseStability * repetitionFactor * transferMultiplier).toFixed(1));

  // Retention R(t) = exp( - t / S )
  const retentionProbability = Number(Math.exp(-daysElapsed / memoryStabilityDays).toFixed(3));
  const decayRate = Number(Math.max(0, 1 - retentionProbability).toFixed(3));

  // Spaced review is due when retention drops below 85%
  const isRepetitionDue = retentionProbability < 0.85;
  const optimalNextReviewDays = Math.max(1, Math.round(memoryStabilityDays * 0.16)); // Target 85% retention

  return {
    daysElapsed,
    memoryStabilityDays,
    retentionProbability,
    decayRate,
    isRepetitionDue,
    optimalNextReviewDays,
  };
}

// 5. Epistemic Debt Risk Formulation (Section 7.4)
// Debt Risk = Decay * Dependency Centrality * Future Relevance * Uncertainty
export interface EpistemicDebtAssessment {
  debtRiskScore: number; // 0.0 to 1.0
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  isBottleneck: boolean;
  components: {
    decay: number;
    centrality: number;
    futureRelevance: number;
    uncertainty: number;
  };
  recommendedAction: 'MAINTAIN' | 'SCHEDULE_RETRIEVAL' | 'STEALTH_INSERTION' | 'IMMEDIATE_PREREQUISITE_REPAIR';
}

export function calculateDeterministicEpistemicDebt(
  node: KnowledgeNode,
  state: LearnerNodeState,
  uncertaintyMetric: number = 0.5
): EpistemicDebtAssessment {
  const decay = state.decayRate ?? 0.02;
  const centrality = node.centrality ?? 0.5;
  const futureRelevance = node.futureRelevance ?? 0.5;
  const uncertainty = Math.max(0.1, Math.min(1.0, uncertaintyMetric));

  // Mathematical formula from Section 7.4
  const rawScore = decay * centrality * futureRelevance * uncertainty;
  // Normalized to 0.0 - 1.0 scale with reasonable scaling coefficient
  const debtRiskScore = Number(Math.min(1.0, rawScore * 4.0).toFixed(3));

  const isBottleneck = decay >= 0.10 && centrality >= 0.70;

  let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (debtRiskScore >= 0.20 || isBottleneck) {
    severity = 'HIGH';
  } else if (debtRiskScore >= 0.08) {
    severity = 'MEDIUM';
  }

  let recommendedAction: EpistemicDebtAssessment['recommendedAction'] = 'MAINTAIN';
  if (isBottleneck && decay >= 0.12) {
    recommendedAction = 'STEALTH_INSERTION';
  } else if (severity === 'HIGH') {
    recommendedAction = 'IMMEDIATE_PREREQUISITE_REPAIR';
  } else if (severity === 'MEDIUM' || decay >= 0.06) {
    recommendedAction = 'SCHEDULE_RETRIEVAL';
  }

  return {
    debtRiskScore,
    severity,
    isBottleneck,
    components: {
      decay,
      centrality,
      futureRelevance,
      uncertainty,
    },
    recommendedAction,
  };
}

// 6. Next Best Learning Experience Selector (Deterministic Priority Queue)
export interface RecommendedExperience {
  nodeId: string;
  nodeName: string;
  domain: string;
  type: 'BOTTLENECK_REPAIR' | 'FRONTIER_EXPLORATION' | 'TRANSFER_CONSOLIDATION' | 'SPACED_RETRIEVAL';
  priorityScore: number; // Higher is more urgent
  simulationId?: string;
  deterministicReason: string;
  pedagogicalObjective: string;
}

export function selectNextBestExperience(
  nodes: KnowledgeNode[],
  learnerStates: Record<string, LearnerNodeState>
): RecommendedExperience[] {
  const recommendations: RecommendedExperience[] = [];

  for (const node of nodes) {
    const state = learnerStates[node.id];
    const prereqStatus = evaluatePrerequisites(node, nodes, learnerStates);

    if (!state) {
      // Node has never been visited
      if (prereqStatus.isUnlocked) {
        // Unlocked frontier!
        recommendations.push({
          nodeId: node.id,
          nodeName: node.name,
          domain: node.domain,
          type: 'FRONTIER_EXPLORATION',
          priorityScore: 70 + (node.centrality * 20),
          simulationId: node.activeSimulationId,
          deterministicReason: `Semua prerequisite (${node.prerequisites.length}) telah terpenuhi 100%. Node siap untuk dieksplorasi pertama kali.`,
          pedagogicalObjective: `Membangun pemahaman konsep konkret & visual untuk ${node.name}.`,
        });
      }
      continue;
    }

    const debt = calculateDeterministicEpistemicDebt(node, state);

    // 1. Critical Bottleneck / Repair Loop (Highest Priority)
    if (debt.isBottleneck || debt.severity === 'HIGH') {
      recommendations.push({
        nodeId: node.id,
        nodeName: node.name,
        domain: node.domain,
        type: 'BOTTLENECK_REPAIR',
        priorityScore: 100 + (debt.debtRiskScore * 50),
        simulationId: node.activeSimulationId,
        deterministicReason: `Terdeteksi decay ${(state.decayRate * 100).toFixed(0)}% pada konsep ber-centrality tinggi (${node.centrality}). Mencegah kerapuhan fondasi.`,
        pedagogicalObjective: `Reconsolidation tersembunyi (Stealth Insertion) tanpa remedial terpisah.`,
      });
      continue;
    }

    // 2. Transfer Consolidation Loop
    if (state.mastery.understanding >= 0.80 && state.mastery.transfer < 0.65) {
      recommendations.push({
        nodeId: node.id,
        nodeName: node.name,
        domain: node.domain,
        type: 'TRANSFER_CONSOLIDATION',
        priorityScore: 50 + (state.mastery.understanding * 20),
        simulationId: node.activeSimulationId,
        deterministicReason: `Pemahaman konseptual tinggi (${(state.mastery.understanding * 100).toFixed(0)}%), namun bukti transfer lintas bidang masih di bawah ambang 65%.`,
        pedagogicalObjective: `Menguji kemampuan transfer pada skenario interdisipliner baru.`,
      });
      continue;
    }

    // 3. Spaced Retrieval Loop
    if (state.decayRate >= 0.08) {
      recommendations.push({
        nodeId: node.id,
        nodeName: node.name,
        domain: node.domain,
        type: 'SPACED_RETRIEVAL',
        priorityScore: 40 + (state.decayRate * 100),
        simulationId: node.activeSimulationId,
        deterministicReason: `Retensi memori mulai melandai (${(state.decayRate * 100).toFixed(0)}% decay). Spaced retrieval dijadwalkan secara matematis.`,
        pedagogicalObjective: `Penyegaran memori jangka panjang melalui micro-challenge interaktif.`,
      });
    }
  }

  // Sort descending by deterministic priority score
  return recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
}

// 7. Automated Stealth Repair Loop Dispatcher & Resolution (Tahap 4 Kontrak Peta Jalan)
export interface AutomatedStealthRepairAction {
  actionRequired: boolean;
  targetNodeId: string | null;
  targetNodeName: string | null;
  domain: string | null;
  decayRate: number;
  debtRiskScore: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  targetLabId: string;
  simulationId?: string;
  rationale: string;
  pedagogicalDirectives: {
    stealthContext: string;
    targetVariables: string[];
    successCriteria: string;
  };
}

export function getAutomatedStealthRepairAction(
  nodes: KnowledgeNode[],
  learnerStates: Record<string, LearnerNodeState>
): AutomatedStealthRepairAction {
  let worstBottleneck: {
    node: KnowledgeNode;
    state: LearnerNodeState;
    debt: EpistemicDebtAssessment;
  } | null = null;

  for (const node of nodes) {
    const state = learnerStates[node.id];
    if (!state) continue;
    const debt = calculateDeterministicEpistemicDebt(node, state);
    if (debt.isBottleneck || debt.severity === 'HIGH' || debt.recommendedAction === 'STEALTH_INSERTION') {
      if (!worstBottleneck || debt.debtRiskScore > worstBottleneck.debt.debtRiskScore) {
        worstBottleneck = { node, state, debt };
      }
    }
  }

  if (!worstBottleneck) {
    return {
      actionRequired: false,
      targetNodeId: null,
      targetNodeName: null,
      domain: null,
      decayRate: 0,
      debtRiskScore: 0,
      severity: 'LOW',
      targetLabId: 'buoyancy',
      rationale: 'Kondisi epistemik stabil. Tidak ada akumulasi utang epistemik kritis yang memicu intervensi stealth.',
      pedagogicalDirectives: {
        stealthContext: 'Eksplorasi Normal',
        targetVariables: [],
        successCriteria: 'Standar penguasaan berlanjut.',
      },
    };
  }

  const { node, state, debt } = worstBottleneck;
  let targetLabId = 'submarine_project';
  if (node.id === 'node-symbolic-algebra' || node.domain === 'Matematika') {
    targetLabId = 'submarine_project';
  } else if (node.domain === 'Komputasi') {
    targetLabId = 'computational_algorithm';
  } else if (node.domain === 'Logika & Kausal') {
    targetLabId = 'causal_logic';
  }

  return {
    actionRequired: true,
    targetNodeId: node.id,
    targetNodeName: node.name,
    domain: node.domain,
    decayRate: state.decayRate ?? 0,
    debtRiskScore: debt.debtRiskScore,
    severity: debt.severity,
    targetLabId,
    simulationId: node.activeSimulationId || 'sim-submarine-ballast',
    rationale: `Deteksi Utang Epistemik Kritis: Konsep "${node.name}" mengalami peluruhan ${(state.decayRate * 100).toFixed(0)}% dengan centrality tinggi (${node.centrality}). Sistem deterministik secara otomatis memicu pengalihan aksi stealth insertion tanpa label remedial terpisah.`,
    pedagogicalDirectives: {
      stealthContext: 'Misi Rekayasa Lapangan Nautica: Kontrol Kerapatan Tangki Ballast',
      targetVariables: ['Massa Balast (W_ballast)', 'Gaya Apung Netral (F_b)', 'Persamaan Keseimbangan Dua Sisi'],
      successCriteria: 'Pencapaian melayang netral di kedalaman 100m membuktikan rekonsolidasi transfer aljabar dan konsep gaya tanpa stres evaluasi.',
    },
  };
}

export function applyStealthRepairResolution(
  currentState: LearnerNodeState
): LearnerNodeState {
  return {
    ...currentState,
    decayRate: 0.0,
    isBottleneck: false,
    mastery: {
      ...currentState.mastery,
      application: Math.max(currentState.mastery.application, 0.88),
      transfer: Math.max(currentState.mastery.transfer, 0.85),
      understanding: Math.max(currentState.mastery.understanding, 0.85),
    },
    evidenceCount: (currentState.evidenceCount ?? 0) + 1,
    lastInteracted: new Date().toISOString(),
  };
}

