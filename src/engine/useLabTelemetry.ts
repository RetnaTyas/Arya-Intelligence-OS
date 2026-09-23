import { useRef, useCallback } from 'react';
import { LabTelemetrySession, LabInteractionEvent } from '../types/telemetry';

export function useLabTelemetry(simulationId: string) {
  const sessionRef = useRef<LabTelemetrySession>({
    simulationId,
    startedAt: Date.now(),
    events: [],
  });

  const push = useCallback((event: Omit<LabInteractionEvent, 'timestamp'>) => {
    sessionRef.current.events.push({ ...event, timestamp: Date.now() });
  }, []);

  const recordParameterChange = useCallback(
    (paramId: string, value: number | string | boolean) =>
      push({ eventType: 'parameter_change', paramId, paramValue: value }),
    [push]
  );

  const recordVerificationAttempt = useCallback(
    (isCorrect: boolean, distanceFromTarget: number) =>
      push({ eventType: 'verification_attempt', isCorrect, distanceFromTarget }),
    [push]
  );

  const recordHintRequested = useCallback(() => push({ eventType: 'hint_requested' }), [push]);

  const recordReset = useCallback(() => push({ eventType: 'reset' }), [push]);

  const finalizeSession = useCallback((): LabTelemetrySession => {
    sessionRef.current.completedAt = Date.now();
    return {
      ...sessionRef.current,
      events: [...sessionRef.current.events],
    };
  }, []);

  const getCurrentSession = useCallback((): LabTelemetrySession => {
    return {
      ...sessionRef.current,
      events: [...sessionRef.current.events],
    };
  }, []);

  return {
    recordParameterChange,
    recordVerificationAttempt,
    recordHintRequested,
    recordReset,
    finalizeSession,
    getCurrentSession,
  };
}
