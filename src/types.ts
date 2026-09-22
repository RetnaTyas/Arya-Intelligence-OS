export type ExplanationLevel = 'concrete' | 'visual' | 'symbolic' | 'formal';
export type MasteryEvidenceType = 'solve' | 'explain' | 'predict' | 'transfer' | 'create';
export type AgeBracket = '1-3' | '4-6' | '7-9' | '10-12';

export interface KnowledgeNode {
  id: string;
  name: string;
  domain: 'Matematika' | 'Fisika' | 'Komputasi' | 'Logika & Kausal';
  description: string;
  prerequisites: string[]; // Node IDs
  ageBracket?: AgeBracket;
  developmentalStage?: string;
  explanationLevels: {
    concrete: string;
    visual: string;
    symbolic: string;
    formal: string;
  };
  whyChain: string[];
  masteryEvidenceRequired: MasteryEvidenceType[];
  commonMisconceptions: {
    misconception: string;
    counterExample: string;
    remedyStrategy: string;
  }[];
  centrality: number; // 0.0 to 1.0 (Dependency centrality in graph)
  futureRelevance: number; // 0.0 to 1.0
  activeSimulationId?: string;
}

export interface MasteryHierarchy {
  recognition: number; // 0 - 1
  recall: number;
  understanding: number;
  application: number;
  transfer: number;
  explanation: number;
  creation: number;
}

export interface LearnerNodeState {
  nodeId: string;
  mastery: MasteryHierarchy;
  decayRate: number; // e.g. 0.15 for 15% decay
  lastReinforcedDate: string;
  activeMisconceptions: string[];
  learningRate: number;
  confidence: 'low' | 'medium' | 'high';
  debtRisk: number; // Computed Debt Risk = Decay * Centrality * FutureRelevance * Uncertainty
  isBottleneck: boolean;
  stealthInsertionTargetProject?: string;
  evidenceCount?: number;
  lastInteracted?: string;
}

export interface EvidenceEntry {
  id: string;
  timestamp: string;
  conceptId: string;
  conceptName: string;
  actions: {
    actionType:
      | 'predict'
      | 'experiment'
      | 'explain'
      | 'analogy'
      | 'transfer_success'
      | 'transfer_fail'
      | 'explain_concept'
      | 'solve_challenge'
      | 'ask_socratic_question';
    description: string;
    timestamp?: string;
  }[];
  confidence: 'low' | 'medium' | 'high';
  retentionStatus: 'verified' | 'pending' | 'decay_alert' | 'fresh' | 'verified_transfer';
  feynmanDiagnosis?: {
    conceptualUnderstanding: number;
    causalReasoning: number;
    transferScore: number;
    misconceptionDetected?: string;
  };
  notes?: string;
}

export interface CognitiveDomainTelemetry {
  domain: string;
  trend: 'up' | 'up_double' | 'up_triple' | 'down' | 'stable';
  demonstratedStage: string;
  stabilityScore: number;
  nodeCount: number;
}

export interface ActiveTrajectory {
  id: string;
  title: string;
  fromNode: string;
  toNode: string;
  status: 'active' | 'accelerating' | 'repairing';
  bottleneckWarning?: string;
  systemActionNote?: string;
}

export interface FeynmanDiagnosisResult {
  conceptualUnderstanding: number;
  causalReasoning: number;
  transferScore: number;
  analogyDetected: boolean;
  misconceptions: string[];
  feedbackSummary: string;
  nextBestProbe: string;
}
