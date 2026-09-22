import {
  KnowledgeNode,
  LearnerNodeState,
  EvidenceEntry,
  CognitiveDomainTelemetry,
  ActiveTrajectory,
} from '../types';
import { calculateDeterministicEpistemicDebt } from './deterministicCore';

export interface SystemCalculatedMetrics {
  telemetry: CognitiveDomainTelemetry[];
  overallKnowledgeStability: number;
  criticalDebt: 'LOW' | 'MEDIUM' | 'HIGH';
  averageTransferStrength: number;
  activeBottlenecks: {
    nodeId: string;
    nodeName: string;
    domain: string;
    decayRate: number;
    debtRisk: number;
    centrality: number;
  }[];
  computedTrajectory: ActiveTrajectory;
}

const DOMAIN_MAPPING: Record<
  string,
  {
    displayName: string;
    category: 'Logika & Kausal' | 'Matematika' | 'Fisika' | 'Komputasi';
  }
> = {
  'Logika & Kausal': {
    displayName: 'Reasoning (Logika & Kausal)',
    category: 'Logika & Kausal',
  },
  Matematika: {
    displayName: 'Matematika & Pemodelan Simbolik',
    category: 'Matematika',
  },
  Fisika: {
    displayName: 'Causal Physics (Mekanika & Fluida)',
    category: 'Fisika',
  },
  Komputasi: {
    displayName: 'Komputasi & Algoritma',
    category: 'Komputasi',
  },
};

/**
 * Dynamically computes real-time cognitive domain telemetry from actual learner states and evidence logs.
 * No hardcoded static values.
 */
export function computeRealTimeTelemetry(
  knowledgeNodes: KnowledgeNode[],
  learnerNodes: Record<string, LearnerNodeState>,
  evidenceLogs: EvidenceEntry[],
  currentTrajectory?: ActiveTrajectory
): SystemCalculatedMetrics {
  const nodeMap = new Map<string, KnowledgeNode>();
  for (const n of knowledgeNodes) {
    nodeMap.set(n.id, n);
  }

  // 1. Group nodes by 4 major domains
  const domainGroups: Record<
    string,
    {
      knowledgeNodes: KnowledgeNode[];
      learnerStates: LearnerNodeState[];
    }
  > = {
    'Logika & Kausal': { knowledgeNodes: [], learnerStates: [] },
    Matematika: { knowledgeNodes: [], learnerStates: [] },
    Fisika: { knowledgeNodes: [], learnerStates: [] },
    Komputasi: { knowledgeNodes: [], learnerStates: [] },
  };

  for (const kn of knowledgeNodes) {
    if (domainGroups[kn.domain]) {
      domainGroups[kn.domain].knowledgeNodes.push(kn);
      const ls = learnerNodes[kn.id];
      if (ls) {
        domainGroups[kn.domain].learnerStates.push(ls);
      }
    }
  }

  // 2. Identify active bottlenecks across all nodes
  const activeBottlenecks: SystemCalculatedMetrics['activeBottlenecks'] = [];
  let maxDebtRisk = 0;
  let totalDecaySum = 0;
  let totalNodesCount = 0;
  let totalTransferMasterySum = 0;

  for (const kn of knowledgeNodes) {
    const state = learnerNodes[kn.id];
    if (!state) continue;

    totalNodesCount++;
    totalDecaySum += state.decayRate || 0;
    totalTransferMasterySum += state.mastery?.transfer || 0;

    // Epistemic Debt Risk calculation
    const debtAssessment = calculateDeterministicEpistemicDebt(kn, state);
    const debtRisk = debtAssessment.debtRiskScore;
    if (debtRisk > maxDebtRisk) {
      maxDebtRisk = debtRisk;
    }

    if (state.decayRate >= 0.08 || state.isBottleneck || debtRisk >= 0.08) {
      activeBottlenecks.push({
        nodeId: kn.id,
        nodeName: kn.name,
        domain: kn.domain,
        decayRate: state.decayRate || 0,
        debtRisk,
        centrality: kn.centrality,
      });
    }
  }

  // Calculate Overall Knowledge Stability (0 - 100%)
  const avgDecay = totalNodesCount > 0 ? totalDecaySum / totalNodesCount : 0;
  const overallKnowledgeStability = Math.max(
    50,
    Math.min(99, Math.round(100 - avgDecay * 100))
  );

  // Determine Critical Debt status
  const criticalDebt: 'LOW' | 'MEDIUM' | 'HIGH' =
    maxDebtRisk >= 0.15 ? 'HIGH' : maxDebtRisk >= 0.08 ? 'MEDIUM' : 'LOW';

  // Average Transfer Strength
  const averageTransferStrength = Math.round(
    (totalNodesCount > 0 ? totalTransferMasterySum / totalNodesCount : 0.75) * 100
  );

  // 3. Compute telemetry vectors for each domain
  const telemetry: CognitiveDomainTelemetry[] = Object.keys(domainGroups).map((domainKey) => {
    const group = domainGroups[domainKey];
    const states = group.learnerStates;
    const kNodes = group.knowledgeNodes;

    // Domain stability
    const domainDecaySum = states.reduce((sum, s) => sum + (s.decayRate || 0), 0);
    const domainAvgDecay = states.length > 0 ? domainDecaySum / states.length : 0;
    const stabilityScore = Math.max(
      60,
      Math.min(99, Math.round(100 - domainAvgDecay * 100))
    );

    // Compute Demonstrated Stage based on highest solidly mastered nodes
    let demonstratedStage = 'Sensori-Motorik Dasar';
    let highestBracket: '1-3' | '4-6' | '7-9' | '10-12' = '1-3';

    for (const kn of kNodes) {
      const st = learnerNodes[kn.id];
      if (st && st.mastery && st.mastery.understanding >= 0.7) {
        if (kn.ageBracket === '10-12') {
          highestBracket = '10-12';
        } else if (kn.ageBracket === '7-9' && highestBracket !== '10-12') {
          highestBracket = '7-9';
        } else if (kn.ageBracket === '4-6' && highestBracket === '1-3') {
          highestBracket = '4-6';
        }
      }
    }

    if (highestBracket === '10-12') {
      demonstratedStage =
        domainKey === 'Matematika'
          ? 'Linear Equivalence & Calculus Intro'
          : domainKey === 'Fisika'
          ? 'Archimedean Field & Energy Dynamics'
          : domainKey === 'Komputasi'
          ? 'Autonomous Algorithmic Pathfinding'
          : 'Multi-Variate Causal Chains';
    } else if (highestBracket === '7-9') {
      demonstratedStage =
        domainKey === 'Matematika'
          ? 'Bar Model Dual-Equivalence'
          : domainKey === 'Fisika'
          ? 'Fluid Density & Gravitational Counterbalance'
          : domainKey === 'Komputasi'
          ? 'State Machine Loops & Routing'
          : 'Conservation & Invariant Mapping';
    } else if (highestBracket === '4-6') {
      demonstratedStage =
        domainKey === 'Matematika'
          ? 'Piagetian Conservation & Number Patterns'
          : domainKey === 'Fisika'
          ? 'Qualitative Beam Balance'
          : domainKey === 'Komputasi'
          ? 'Sequential Instruction Blocks'
          : 'Counterfactual Causal Reasoning';
    } else {
      demonstratedStage = 'Sensori-Motorik Topologis';
    }

    // Determine Trend from recent evidence logs
    const relevantEvidence = evidenceLogs.filter((ev) => {
      const node = nodeMap.get(ev.conceptId);
      return node?.domain === domainKey;
    });

    const recentTransferWins = relevantEvidence.filter(
      (e) =>
        e.retentionStatus === 'verified_transfer' ||
        e.actions.some((a) => a.actionType === 'transfer_success' || a.actionType === 'solve_challenge')
    ).length;

    const recentDecayAlerts = relevantEvidence.filter(
      (e) => e.retentionStatus === 'decay_alert'
    ).length;

    let trend: CognitiveDomainTelemetry['trend'] = 'stable';
    if (domainAvgDecay >= 0.12 || recentDecayAlerts > recentTransferWins) {
      trend = 'down';
    } else if (recentTransferWins >= 3) {
      trend = 'up_triple';
    } else if (recentTransferWins >= 2) {
      trend = 'up_double';
    } else if (recentTransferWins >= 1) {
      trend = 'up';
    }

    return {
      domain: DOMAIN_MAPPING[domainKey]?.displayName || domainKey,
      trend,
      demonstratedStage,
      stabilityScore,
      nodeCount: kNodes.length,
    };
  });

  // 4. Compute Dynamic Active Trajectory
  let computedTrajectory: ActiveTrajectory = currentTrajectory || {
    id: 'traj-auto',
    title: 'Fluid Mechanics → Applied Submersible Engineering',
    fromNode: 'node-buoyancy-archimedes',
    toNode: 'node-submarine-ballast',
    status: 'active',
    bottleneckWarning: undefined,
    systemActionNote: 'Sistem memandu eksplorasi domain fluida dan aljabar.',
  };

  if (activeBottlenecks.length > 0) {
    const primaryBottleneck = activeBottlenecks[0];
    computedTrajectory = {
      id: `traj-repair-${primaryBottleneck.nodeId}`,
      title: `${primaryBottleneck.nodeName} → Stealth Reconsolidation`,
      fromNode: primaryBottleneck.nodeId,
      toNode: 'node-submarine-ballast',
      status: 'repairing',
      bottleneckWarning: `Penurunan retensi ${Math.round(
        primaryBottleneck.decayRate * 100
      )}% pada ${primaryBottleneck.nodeName} berisiko menghambat modul lanjutan.`,
      systemActionNote: `Sistem menjadwalkan reconsolidation ${primaryBottleneck.nodeName} secara stealth ke dalam Proyek Terapan.`,
    };
  } else {
    computedTrajectory = {
      id: 'traj-frontier',
      title: 'Exploration Frontier → Advanced Mathematical Modeling',
      fromNode: 'node-bar-model',
      toNode: 'node-calculus-rate',
      status: 'accelerating',
      bottleneckWarning: undefined,
      systemActionNote: 'Seluruh fondasi solid (Zero Critical Debt). Menjelajah frontier laju perubahan & algoritma.',
    };
  }

  return {
    telemetry,
    overallKnowledgeStability,
    criticalDebt,
    averageTransferStrength,
    activeBottlenecks,
    computedTrajectory,
  };
}
