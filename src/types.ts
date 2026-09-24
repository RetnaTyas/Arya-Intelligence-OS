export type ExplanationLevel = 'concrete' | 'visual' | 'symbolic' | 'formal';
export type MasteryEvidenceType = 'solve' | 'explain' | 'predict' | 'transfer' | 'create';
export type AgeBracket = '1-3' | '4-6' | '7-9' | '10-12';
export type CognitiveTier = 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4';

export interface CognitiveTierMeta {
  id: AgeBracket;
  tier: CognitiveTier;
  code: string;
  name: string;
  tagline: string;
  description: string;
  piagetStage: string;
}

export const COGNITIVE_TIERS: Record<AgeBracket, CognitiveTierMeta> = {
  '1-3': {
    id: '1-3',
    tier: 'tier-1',
    code: 'Tier I',
    name: 'Sensori-Motorik & Enaktif',
    tagline: 'Eksplorasi Kinestetik & Permanensi Objek',
    description: 'Pemahaman fisik berakar dari tindakan sensorik langsung: sentuhan, hilangnya benda di balik layar, aksi-reaksi instan tanpa abstraksi simbolik.',
    piagetStage: 'Sensori-Motorik (Enactive)',
  },
  '4-6': {
    id: '4-6',
    tier: 'tier-2',
    code: 'Tier II',
    name: 'Pra-Operasional & Ikonik',
    tagline: 'Representasi Visual & Penalaran Spasial Intuitif',
    description: 'Eksplorasi pola mental, perbandingan visual, dan analogi spasial konkret sebelum pengenalan rumus formal.',
    piagetStage: 'Pra-Operasional (Iconic)',
  },
  '7-9': {
    id: '7-9',
    tier: 'tier-3',
    code: 'Tier III',
    name: 'Operasional Konkret',
    tagline: 'Konservasi Invarian & Pemodelan Relasional',
    description: 'Penalaran logis pada objek konkret: kekekalan volume, neraca seimbang, dan model batang relasional.',
    piagetStage: 'Operasional Konkret (Relational)',
  },
  '10-12': {
    id: '10-12',
    tier: 'tier-4',
    code: 'Tier IV',
    name: 'Operasional Formal & Komputasional',
    tagline: 'Penalaran Hipotesis-Deduktif & Algoritma',
    description: 'Manipulasi variabel abstrak, kerapatan massa jenis hidrostatik, kekekalan energi mekanik, dan kompleksitas pencarian data.',
    piagetStage: 'Operasional Formal (Formal-Abstract)',
  },
};

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
  // Section 6.5.6 & 6.5.7: Epistemic Object Schema Preparedness
  epistemicProfile?: {
    modalGate: 'wujub' | 'istihalah' | 'jawaz';
    epistemicStatus: 'known' | 'supported' | 'hypothesized' | 'unknown' | 'underdetermined' | 'contradicted' | 'revised';
    beliefStatus: 'preferred' | 'plausible' | 'weak' | 'suspended';
    discriminatingEvidenceUnknown?: boolean;
    entailmentScope?: string;
  };
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
  // Section 6.5.7: Epistemic warrant tracking
  epistemicVerification?: {
    warrantModel: 'chain' | 'convergence';
    modalCoherence: 'valid' | 'self_contradictory';
    layer0Tested?: boolean;
    layer1Tested?: boolean;
    layer2Perturbed?: boolean;
  };
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
