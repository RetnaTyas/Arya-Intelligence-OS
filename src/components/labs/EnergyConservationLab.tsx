import React, { useState, useEffect } from 'react';
import {
  Flame,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Zap,
  Layers,
} from 'lucide-react';
import { playChime, playTick } from '../../engine/labMotionFX';

interface EnergyConservationLabProps {
  onMasteryEvidence: (details: string) => void;
}

export const EnergyConservationLab: React.FC<EnergyConservationLabProps> = ({ onMasteryEvidence }) => {
  // Simulation parameters
  const [initialHeight, setInitialHeight] = useState<number>(20); // meters (max 25)
  const [cartMass, setCartMass] = useState<number>(100); // kg
  const [hasFriction, setHasFriction] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trackPosition, setTrackPosition] = useState<number>(0); // 0 (start) to 100 (end)
  const [hasRecordedEvidence, setHasRecordedEvidence] = useState<boolean>(false);

  const gravity = 9.8; // m/s^2

  // Track profile function: returns height y(x) given x in [0, 100]
  // Generates a dynamic roller coaster track with a dip and a second hill
  const getTrackHeight = (pos: number) => {
    // normalized pos 0 to 1
    const p = pos / 100;
    // initial height at p=0, valley around p=0.45, second hill around p=0.75, end at p=1.0
    const profile =
      0.3 * Math.cos(p * Math.PI * 2.5) +
      0.4 * Math.sin(p * Math.PI * 3.2) * (1 - p * 0.5) +
      0.5;
    // Map to scale with initialHeight
    return Math.max(1, Math.min(initialHeight, initialHeight * (1 - 0.9 * Math.sin(p * Math.PI * 0.95))));
  };

  const currentHeight = getTrackHeight(trackPosition);

  // Total Initial Mechanical Energy (Joules)
  const initialPotentialEnergy = cartMass * gravity * initialHeight;

  // Energy calculations at current point
  const currentPotentialEnergy = cartMass * gravity * currentHeight;

  // Accumulated friction loss if friction enabled
  const frictionLoss = hasFriction ? initialPotentialEnergy * 0.25 * (trackPosition / 100) : 0;

  // Kinetic Energy is the remainder
  const currentKineticEnergy = Math.max(
    0,
    initialPotentialEnergy - currentPotentialEnergy - frictionLoss
  );

  // Instantaneous velocity: v = sqrt(2 * Ek / m)
  const currentVelocity = Math.sqrt((2 * currentKineticEnergy) / cartMass);

  // Total Energy accounting
  const calculatedTotalEnergy = currentPotentialEnergy + currentKineticEnergy + frictionLoss;

  // Animation step loop
  useEffect(() => {
    let animFrame: number;
    if (isPlaying) {
      const interval = setInterval(() => {
        setTrackPosition((prev) => {
          if (prev >= 99) {
            setIsPlaying(false);
            return 100;
          }
          // Speed scales with current velocity
          const step = Math.max(0.4, (currentVelocity / 20) * 1.5 + 0.5);
          return Math.min(100, prev + step);
        });
      }, 30);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentVelocity]);

  const handleVerifyConservation = () => {
    setHasRecordedEvidence(true);
    playChime(true);
    onMasteryEvidence(
      `Membuktikan Hukum Kekekalan Energi Mekanik: Di setiap titik lintasan (posisi ${trackPosition.toFixed(0)}%), jumlah total energi (Potensial ${Math.round(currentPotentialEnergy)} J + Kinetik ${Math.round(currentKineticEnergy)} J + Termal/Gesek ${Math.round(frictionLoss)} J) bernilai persis konstan sebesar ${Math.round(initialPotentialEnergy)} J, membuktikan bahwa energi bertransformasi tanpa pernah musnah.`
    );
  };

  const handleReset = () => {
    playTick();
    setIsPlaying(false);
    setTrackPosition(0);
  };

  // SVG Track plotting coordinates
  const svgWidth = 500;
  const svgHeight = 220;

  const trackPoints: string[] = [];
  for (let x = 0; x <= 100; x += 2) {
    const px = 20 + (x / 100) * (svgWidth - 40);
    const py = svgHeight - 20 - (getTrackHeight(x) / 25) * (svgHeight - 60);
    trackPoints.push(`${px},${py}`);
  }
  const trackPath = `M ${trackPoints.join(' L ')}`;

  const currentCartX = 20 + (trackPosition / 100) * (svgWidth - 40);
  const currentCartY = svgHeight - 20 - (currentHeight / 25) * (svgHeight - 60);

  return (
    <div id="energy-conservation-lab-container" className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Domain Fisika & Dinamika
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Lab Hukum Kekekalan Energi Mekanik (Simpul: node-energy-conservation)
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Prinsip WHY: <em>"Teorema Emmy Noether: Energi kekal bukan karena kebetulan magis, melainkan karena hukum alam bekerja identik kemarin, hari ini, dan besok (simetri translasi waktu)."</em>
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-emerald-300 flex items-center gap-1 self-start md:self-auto transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Ulangi Lintasan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Roller Coaster Simulation */}
        <div className="lg:col-span-8 bg-[#0d121f] border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[440px]">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Lintasan Roller Coaster Konservasi Energi:</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                Kecepatan: <strong className="text-cyan-300">{currentVelocity.toFixed(1)} m/s</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold">
                E_Total: {Math.round(calculatedTotalEnergy).toLocaleString()} J
              </span>
            </div>
          </div>

          {/* Graphical Track Canvas */}
          <div className="my-2 relative flex flex-col items-center">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-xl h-auto overflow-visible select-none">
              {/* Ground level */}
              <line x1="10" y1={svgHeight - 15} x2={svgWidth - 10} y2={svgHeight - 15} stroke="#1e293b" strokeWidth="3" />

              {/* Height grid lines */}
              <line x1="20" y1="20" x2={svgWidth - 20} y2="20" stroke="#334155" strokeDasharray="2 3" opacity="0.4" />
              <text x="25" y="32" fill="#64748b" fontSize="9" fontFamily="monospace">
                Puncak Awal: {initialHeight}m
              </text>

              {/* Roller coaster structural struts */}
              {[40, 100, 160, 220, 280, 340, 400, 460].map((sx, idx) => {
                const normX = ((sx - 20) / (svgWidth - 40)) * 100;
                const sy = svgHeight - 20 - (getTrackHeight(normX) / 25) * (svgHeight - 60);
                return (
                  <line key={idx} x1={sx} y1={sy} x2={sx} y2={svgHeight - 15} stroke="#1e293b" strokeWidth="1.5" />
                );
              })}

              {/* Main Rail Track Path */}
              <path d={trackPath} fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
              <path d={trackPath} fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Animated Cart / Roller Sphere */}
              <g transform={`translate(${currentCartX}, ${currentCartY})`}>
                <circle cx="0" cy="0" r="10" fill="#10b981" stroke="#ffffff" strokeWidth="2" className="shadow-lg" />
                {/* Wheels */}
                <circle cx="-5" cy="8" r="3" fill="#0f172a" />
                <circle cx="5" cy="8" r="3" fill="#0f172a" />
                {/* Motion glow if high velocity */}
                {currentVelocity > 8 && (
                  <circle cx="0" cy="0" r="14" fill="#34d399" opacity="0.3" className="animate-ping" />
                )}
              </g>
            </svg>
          </div>

          {/* Live Energy Breakdown Bars */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Komposisi Energi Sistem Saat Ini:</span>
              <span className="text-slate-300">
                Tinggi: <strong className="text-emerald-400">{currentHeight.toFixed(1)} m</strong>
              </span>
            </div>

            {/* Split Energy Bar */}
            <div className="w-full h-5 bg-slate-900 rounded-lg overflow-hidden flex border border-slate-800">
              {/* Potential Energy (Blue/Cyan) */}
              <div
                style={{ width: `${(currentPotentialEnergy / initialPotentialEnergy) * 100}%` }}
                className="bg-cyan-500 flex items-center justify-center text-[10px] font-bold text-slate-950 transition-all duration-150"
                title="Energi Potensial"
              >
                {((currentPotentialEnergy / initialPotentialEnergy) * 100) > 15 && 'Ep'}
              </div>
              {/* Kinetic Energy (Emerald) */}
              <div
                style={{ width: `${(currentKineticEnergy / initialPotentialEnergy) * 100}%` }}
                className="bg-emerald-400 flex items-center justify-center text-[10px] font-bold text-slate-950 transition-all duration-150"
                title="Energi Kinetik"
              >
                {((currentKineticEnergy / initialPotentialEnergy) * 100) > 15 && 'Ek'}
              </div>
              {/* Friction / Thermal (Amber/Rose) */}
              {hasFriction && (
                <div
                  style={{ width: `${(frictionLoss / initialPotentialEnergy) * 100}%` }}
                  className="bg-amber-500 flex items-center justify-center text-[10px] font-bold text-slate-950 transition-all duration-150"
                  title="Energi Termal (Gesekan)"
                >
                  {((frictionLoss / initialPotentialEnergy) * 100) > 10 && 'Q'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500" />
                <span className="text-cyan-300">Ep: {Math.round(currentPotentialEnergy)} J</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
                <span className="text-emerald-300">Ek: {Math.round(currentKineticEnergy)} J</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                <span className="text-amber-300">Termal: {Math.round(frictionLoss)} J</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="lg:col-span-4 bg-[#0f1424] border border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Kontrol Peluncuran Gerobak</span>
            </span>
          </h4>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                playTick();
                setIsPlaying(!isPlaying);
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" /> <span>Jeda Gerakan</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> <span>Luncurkan Kereta</span>
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Parameter Sliders */}
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Ketinggian Rilis Awal (h):</span>
                <span className="text-emerald-300 font-mono font-bold">{initialHeight} m</span>
              </div>
              <input
                type="range"
                min="10"
                max="25"
                value={initialHeight}
                onChange={(e) => {
                  playTick();
                  setInitialHeight(parseInt(e.target.value));
                }}
                disabled={isPlaying}
                className="w-full accent-emerald-400"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Massa Kereta (m):</span>
                <span className="text-cyan-300 font-mono font-bold">{cartMass} kg</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={cartMass}
                onChange={(e) => {
                  playTick();
                  setCartMass(parseInt(e.target.value));
                }}
                disabled={isPlaying}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Toggle Friction */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-200 block font-semibold text-xs">Disipasi Gesekan Rel & Udara:</span>
                <span className="text-[10px] text-slate-400">Konversi ke energi panas termal</span>
              </div>
              <button
                onClick={() => {
                  playTick();
                  setHasFriction(!hasFriction);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  hasFriction
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {hasFriction ? 'Gesekan AKTIF' : 'Vakum Ideal (0 Gesekan)'}
              </button>
            </div>

            {/* Manual Scrub position slider */}
            <div>
              <div className="flex justify-between mb-1 pt-1">
                <span className="text-slate-400 text-[11px]">Scrub Posisi Lintasan:</span>
                <span className="text-indigo-300 font-mono text-[11px]">{trackPosition.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={trackPosition}
                onChange={(e) => {
                  playTick();
                  setIsPlaying(false);
                  setTrackPosition(parseInt(e.target.value));
                }}
                className="w-full accent-indigo-400"
              />
            </div>
          </div>

          {/* Verification CTA */}
          <button
            onClick={handleVerifyConservation}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow transition"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Kirim Bukti Kekekalan Energi</span>
          </button>

          {hasRecordedEvidence && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bukti Kekekalan Energi Tersimpan ke Evidence Log!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
