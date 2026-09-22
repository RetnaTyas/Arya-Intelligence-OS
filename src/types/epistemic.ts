// Epistemic Object & Warrant Hierarchy Types
// According to sections 6.5.2, 6.5.6, and 6.5.7 in intelligence-os-foundation.md

export type ModalStatus = 'wujub' | 'istihalah' | 'jawaz';

export type EpistemicStatus =
  | 'known'
  | 'supported'
  | 'hypothesized'
  | 'unknown'
  | 'underdetermined'
  | 'contradicted'
  | 'revised';

export type BeliefStatus =
  | 'preferred'
  | 'plausible'
  | 'weak'
  | 'suspended';

export type WarrantType = 'aql' | 'naql' | 'empirical_convergence' | 'deductive_proof';

export interface EpistemicObject {
  claim: string;
  warrantType: WarrantType;
  modalStatus: ModalStatus; // Layer 1 (a priori logical gate)
  epistemicStatus: EpistemicStatus; // Layer 2 (empirical/observational evidence)
  beliefStatus: BeliefStatus; // Layer 3 (learner provisional commitment)
  beliefDegree?: number; // 0.0 to 1.0
  sourceProvenance?: {
    origin: string;
    thubutValidity?: 'verified' | 'provisional' | 'disputed';
    dallalahInterpretation?: string;
  };
  entailmentScope?: string; // Scope boundary preventing scope expansion error
  discriminatingEvidenceRequired?: string;
  revisionHistory?: {
    timestamp: string;
    previousState: string;
    triggerReason: string;
  }[];
}
