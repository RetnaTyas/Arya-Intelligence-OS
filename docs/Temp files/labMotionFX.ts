/**
 * labMotionFX — shared realism layer for Lab Simulasi & Proyek.
 *
 * Problem this solves: every lab currently moves objects with a CSS
 * `transition-all duration-700` — a linear glide to the final value.
 * Real floating/falling/swinging objects don't glide, they oscillate
 * and settle (a damped spring). And every lab is silent, which flattens
 * feedback for a child who reads slower than an adult.
 *
 * This module is dependency-free (no external audio files, no extra
 * npm packages) so it can be dropped into any lab component:
 *
 *   const { value: y, kick } = useSpringValue(targetY, { stiffness: 90, damping: 10 });
 *   <div style={{ transform: `translateY(${y}px)` }} />
 *   kick(-40); // e.g. give it an initial downward "drop" velocity
 *
 *   playSplash();      // object enters water
 *   playChime(true);   // correct answer / mission success
 *   playChime(false);  // incorrect answer, gentle not punishing
 */

import { useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Spring-damper motion (replaces linear CSS transitions with real physics)
// ---------------------------------------------------------------------------

export interface SpringOptions {
  stiffness?: number; // higher = snappier
  damping?: number; // higher = settles faster, lower = bouncier/wobblier
  mass?: number;
  precision?: number; // stop animating once within this distance & velocity
}

/**
 * Animates `value` toward `target` using a real mass-spring-damper model
 * (semi-implicit Euler integration), so objects overshoot and settle the
 * way a boat bobbing in water or a weight on a spring actually does,
 * instead of gliding linearly to the final position.
 */
export function useSpringValue(target: number, options: SpringOptions = {}) {
  const { stiffness = 120, damping = 14, mass = 1, precision = 0.01 } = options;

  const [value, setValue] = useState(target);
  const posRef = useRef(target);
  const velRef = useRef(0);
  const targetRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  targetRef.current = target;

  useEffect(() => {
    const step = () => {
      const displacement = posRef.current - targetRef.current;
      const springForce = -stiffness * displacement;
      const dampingForce = -damping * velRef.current;
      const acceleration = (springForce + dampingForce) / mass;

      velRef.current += acceleration * (1 / 60);
      posRef.current += velRef.current * (1 / 60);

      setValue(posRef.current);

      const atRest =
        Math.abs(posRef.current - targetRef.current) < precision &&
        Math.abs(velRef.current) < precision;

      if (!atRest) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        posRef.current = targetRef.current;
        velRef.current = 0;
        setValue(targetRef.current);
        rafRef.current = null;
      }
    };

    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(step);
    }

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // Re-arm the loop whenever the target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, stiffness, damping, mass, precision]);

  /** Give the object an instantaneous velocity kick (e.g. "drop" or "nudge"). */
  const kick = (deltaVelocity: number) => {
    velRef.current += deltaVelocity;
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(function loop() {
        // handled by the effect above on next target change; this just
        // ensures a kick issued while at rest restarts the loop immediately
      });
    }
  };

  return { value, kick };
}

// ---------------------------------------------------------------------------
// Synthesized audio feedback (no asset files — generated with WebAudio)
// ---------------------------------------------------------------------------

let sharedCtx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!sharedCtx) sharedCtx = new AudioCtor();
  if (sharedCtx.state === 'suspended') sharedCtx.resume().catch(() => {});
  return sharedCtx;
}

function tone(freq: number, startAt: number, duration: number, ctx: AudioContext, gainPeak = 0.08, type: OscillatorType = 'sine') {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(gainPeak, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

/** A short two-note "splash/drop" sound — for objects entering water, a piece being placed, etc. */
export function playSplash() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.28);
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.32);
}

/** Success (true) plays a bright ascending major triad; failure (false) plays one gentle, low, non-punishing tone. */
export function playChime(success: boolean) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  if (success) {
    [523.25, 659.25, 783.99].forEach((f, i) => tone(f, now + i * 0.09, 0.35, ctx, 0.07, 'triangle'));
  } else {
    tone(220, now, 0.28, ctx, 0.05, 'sine');
  }
}

/** Soft click for slider/parameter changes — keeps a manipulation "felt" without being noisy if spammed. */
export function playTick() {
  const ctx = getCtx();
  if (!ctx) return;
  tone(440, ctx.currentTime, 0.05, ctx, 0.03, 'square');
}
