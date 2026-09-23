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
