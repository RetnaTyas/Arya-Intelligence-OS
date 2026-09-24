import React, { useEffect, useRef, useState } from 'react';

interface Ripple {
  id: number;
  bornAt: number;
}

interface WaterSurfaceFXProps {
  /** Fill level of the tank, 0-100 (% from bottom). */
  levelPercent: number;
  /** Bump this number to trigger a new splash ripple (e.g. every parameter change). */
  splashTrigger: number;
  colorFrom?: string;
  colorTo?: string;
}

/**
 * Replaces a flat, static "water level" <div> with an animated wavy
 * surface (sine-driven SVG path) plus expanding ripple rings whenever
 * `splashTrigger` changes. Pure CSS/SVG + rAF — no images, no libraries.
 */
export const WaterSurfaceFX: React.FC<WaterSurfaceFXProps> = ({
  levelPercent,
  splashTrigger,
  colorFrom = '#0e7490',
  colorTo = '#22d3ee',
}) => {
  const [phase, setPhase] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTrigger = useRef(splashTrigger);

  useEffect(() => {
    let raw = 0;
    const loop = () => {
      raw += 0.05;
      setPhase(raw);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (splashTrigger !== lastTrigger.current) {
      lastTrigger.current = splashTrigger;
      const id = Date.now() + Math.random();
      setRipples((r) => [...r, { id, bornAt: performance.now() }]);
      const timeout = setTimeout(() => {
        setRipples((r) => r.filter((rp) => rp.id !== id));
      }, 900);
      return () => clearTimeout(timeout);
    }
  }, [splashTrigger]);

  const waveY = (x: number, amplitude = 3) => Math.sin(x / 18 + phase) * amplitude;

  const width = 200;
  const points: string[] = [];
  for (let x = 0; x <= width; x += 10) {
    points.push(`${x},${8 + waveY(x)}`);
  }
  const wavePath = `M0,20 L0,${8 + waveY(0)} L${points.join(' L')} L${width},20 Z`;

  return (
    <div
      className="absolute inset-x-0 bottom-0 pointer-events-none"
      style={{ height: `${levelPercent}%`, transition: 'height 0.7s cubic-bezier(0.34,1.2,0.4,1)' }}
    >
      {/* Body of water */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${colorFrom}99, ${colorTo}55)`,
        }}
      />
      {/* Animated wavy surface line */}
      <svg
        className="absolute -top-3 left-0 w-full h-6"
        viewBox={`0 0 ${width} 24`}
        preserveAspectRatio="none"
      >
        <path d={wavePath} fill={colorTo} fillOpacity={0.55} />
      </svg>

      {/* Ripple rings from splashes */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute left-1/2 -top-1 -translate-x-1/2 rounded-full border-2 animate-lab-ripple"
          style={{ borderColor: colorTo }}
        />
      ))}

      <style>{`
        @keyframes lab-ripple {
          0% { width: 6px; height: 6px; opacity: 0.9; }
          100% { width: 140px; height: 46px; opacity: 0; }
        }
        .animate-lab-ripple {
          animation: lab-ripple 0.85s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
