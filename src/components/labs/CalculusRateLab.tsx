// ============================================================================
// ⚠️ EKSPERIMEN PARALEL OUT-OF-SEQUENCE (DI LUAR JALUR UTAMA TAHAP 1)
// Rujukan: docs/architecture/KNOWN_ISSUES.md (Temuan 6) & intelligence-os-foundation.md Bagian 12
// Status: Eksperimen riset paralel (Domain Kalkulus Lanjut: Laju Perubahan & Limit).
// CATATAN DISIPLIN: Modul ini TIDAK dihitung dalam pemenuhan Gerbang Tahap 1 & Tahap 2.
// Domain Aktif Resmi Tahap 1: Matematika Sempit (Pecahan → Persamaan Linear: narrowMathDomain.ts)
// ============================================================================

import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Gauge,
  ZoomIn,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface CalculusRateLabProps {
  onMasteryEvidence: (details: string) => void;
}

export const CalculusRateLab: React.FC<CalculusRateLabProps> = ({ onMasteryEvidence }) => {
  // Function: f(t) = 0.5 * t^2 (position of an accelerating rocket in meters)
  // Derivative: f'(t) = t (instantaneous velocity in m/s)
  const [tPoint, setTPoint] = useState<number>(4); // evaluate at t = 4s
  const [hInterval, setHInterval] = useState<number>(2.0); // delta t
  const [hasDiscoveredLimit, setHasDiscoveredLimit] = useState<boolean>(false);

  const f = (t: number) => 0.5 * t * t;
  const theoreticalInstantaneousRate = tPoint; // f'(t) = 0.5 * 2 * t = t

  const f_t = f(tPoint);
  const f_t_plus_h = f(tPoint + hInterval);
  const deltaY = f_t_plus_h - f_t;
  const averageRate = deltaY / hInterval; // secant slope: (f(t+h) - f(t)) / h

  const difference = Math.abs(averageRate - theoreticalInstantaneousRate);
  const isMicroscopic = hInterval <= 0.05;

  const handleTestLimit = () => {
    setHInterval(0.01);
    setHasDiscoveredLimit(true);
    onMasteryEvidence(
      `Membuktikan konsep limit turunan kalkulus: Saat interval waktu h menyusut mendekati nol (h = 0.01 detik), laju perubahan rata-rata Δy/Δx (${(
        (f(tPoint + 0.01) - f(tPoint)) /
        0.01
      ).toFixed(2)} m/s) berkonvergensi persis ke kecepatan sesaat teoritis f'(t) = ${tPoint.toFixed(2)} m/s tanpa memicu paradoks pembagian dengan nol 0/0.`
    );
  };

  // SVG coordinate transformation
  // X: 0 to 8s -> 40 to 440px
  // Y: 0 to 32m -> 260 to 40px
  const toSvgX = (t: number) => 40 + (t / 8) * 400;
  const toSvgY = (y: number) => 260 - (y / 32) * 220;

  // Path data for f(t) = 0.5 * t^2
  const points = [];
  for (let t = 0; t <= 8; t += 0.2) {
    points.push(`${toSvgX(t)},${toSvgY(f(t))}`);
  }
  const curvePath = `M ${points.join(' L ')}`;

  const p1X = toSvgX(tPoint);
  const p1Y = toSvgY(f_t);
  const p2X = toSvgX(tPoint + hInterval);
  const p2Y = toSvgY(f_t_plus_h);

  return (
    <div id="calculus-lab-container" className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Domain Matematika Lanjutan
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Lab Kalkulus: Laju Perubahan Sesaat & Limit Kontinu (Simpul: node-calculus-rate)
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Prinsip WHY: <em>"Bagaimana mengukur kecepatan tepat pada detik ini tanpa membagi jarak nol dengan waktu nol (0/0)? Dengan mendekati interval waktu hingga nyaris tak terhingga kecilnya!"</em>
          </p>
        </div>

        <button
          onClick={() => {
            setTPoint(4);
            setHInterval(2.0);
            setHasDiscoveredLimit(false);
          }}
          className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1 self-start md:self-auto transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Parameter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Coordinate Canvas */}
        <div className="lg:col-span-8 bg-[#0d121f] border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[420px]">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Kurva Posisi Roket: f(t) = 0.5 t²</span>
            <span className={`px-2.5 py-1 rounded-full font-semibold ${
              isMicroscopic
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}>
              {isMicroscopic ? '🎯 Garis Singgung (Tangent Tangensial)' : '📏 Garis Tali Busur (Secant)'}
            </span>
          </div>

          {/* Graphical SVG Plot */}
          <div className="my-2 relative flex flex-col items-center">
            <svg viewBox="0 0 480 290" className="w-full max-w-xl h-auto overflow-visible select-none">
              {/* Grid Lines */}
              <line x1="40" y1="260" x2="440" y2="260" stroke="#334155" strokeWidth="1.5" />
              <line x1="40" y1="40" x2="40" y2="260" stroke="#334155" strokeWidth="1.5" />

              {/* Ticks on X */}
              {[0, 2, 4, 6, 8].map((val) => (
                <g key={`x-${val}`}>
                  <line x1={toSvgX(val)} y1="260" x2={toSvgX(val)} y2="265" stroke="#64748b" />
                  <text x={toSvgX(val)} y="278" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    {val}s
                  </text>
                </g>
              ))}

              {/* Ticks on Y */}
              {[0, 8, 16, 24, 32].map((val) => (
                <g key={`y-${val}`}>
                  <line x1="35" y1={toSvgY(val)} x2="40" y2={toSvgY(val)} stroke="#64748b" />
                  <text x="30" y={toSvgY(val) + 3} fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">
                    {val}m
                  </text>
                </g>
              ))}

              {/* Parabolic Curve */}
              <path d={curvePath} fill="none" stroke="#6366f1" strokeWidth="2.5" />

              {/* Secant / Tangent Line extending across */}
              <line
                x1={p1X - 80}
                y1={p1Y + averageRate * (80 / (400 / 8)) * (220 / 32)}
                x2={p2X + 80}
                y2={p2Y - averageRate * (80 / (400 / 8)) * (220 / 32)}
                stroke={isMicroscopic ? '#10b981' : '#f59e0b'}
                strokeWidth="2"
                strokeDasharray={isMicroscopic ? 'none' : '4 2'}
              />

              {/* Secant Slope Triangle (Delta X & Delta Y) */}
              {hInterval > 0.3 && (
                <g opacity="0.6">
                  <line x1={p1X} y1={p1Y} x2={p2X} y2={p1Y} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1={p2X} y1={p1Y} x2={p2X} y2={p2Y} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x={(p1X + p2X) / 2} y={p1Y + 12} fill="#38bdf8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                    Δt = {hInterval.toFixed(1)}s
                  </text>
                  <text x={p2X + 6} y={(p1Y + p2Y) / 2} fill="#f43f5e" fontSize="9" textAnchor="start" fontFamily="monospace">
                    Δy = {deltaY.toFixed(1)}m
                  </text>
                </g>
              )}

              {/* Point 1 (t, f(t)) */}
              <circle cx={p1X} cy={p1Y} r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
              <text x={p1X - 8} y={p1Y - 10} fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                t = {tPoint}s
              </text>

              {/* Point 2 (t+h, f(t+h)) */}
              {hInterval > 0.05 && (
                <>
                  <circle cx={p2X} cy={p2Y} r="4" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.5" />
                  <text x={p2X + 8} y={p2Y + 4} fill="#f59e0b" fontSize="10" fontFamily="monospace">
                    t+h = {(tPoint + hInterval).toFixed(1)}s
                  </text>
                </>
              )}
            </svg>
          </div>

          {/* Telemetry Readout */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Interval Waktu (h = Δt):</span>
              <span className="text-cyan-300 font-bold text-sm">{hInterval.toFixed(2)} detik</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Laju Rata-Rata (Δy / Δt):</span>
              <span className="text-amber-300 font-bold text-sm">{averageRate.toFixed(2)} m/s</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Laju Sesaat Sejati (df/dt):</span>
              <span className="text-emerald-400 font-bold text-sm">{theoreticalInstantaneousRate.toFixed(2)} m/s</span>
            </div>
          </div>
        </div>

        {/* Controls and Exploration */}
        <div className="lg:col-span-4 bg-[#0f1424] border border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-indigo-400" />
              <span>Mikroskop Limit Kalkulus</span>
            </span>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
              h ➔ 0
            </span>
          </h4>

          {/* Sliders */}
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Titik Evaluasi Waktu (t):</span>
                <span className="text-indigo-300 font-mono font-bold">{tPoint} s</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={tPoint}
                onChange={(e) => setTPoint(parseInt(e.target.value))}
                className="w-full accent-indigo-400"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Penyusutan Interval (h):</span>
                <span className={`font-mono font-bold ${isMicroscopic ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {hInterval.toFixed(2)} s
                </span>
              </div>
              <input
                type="range"
                min="0.01"
                max="3.0"
                step="0.05"
                value={hInterval}
                onChange={(e) => setHInterval(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0.01 (Mikro)</span>
                <span>1.50</span>
                <span>3.00 (Makro)</span>
              </div>
            </div>
          </div>

          {/* Preset Interval Shortcuts */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Jalur Pendekatan Limit:</span>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
              <button
                onClick={() => setHInterval(2.0)}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 text-center transition"
              >
                h = 2.0
              </button>
              <button
                onClick={() => setHInterval(0.5)}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 text-center transition"
              >
                h = 0.5
              </button>
              <button
                onClick={() => setHInterval(0.1)}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 text-center transition"
              >
                h = 0.1
              </button>
              <button
                onClick={handleTestLimit}
                className="py-1.5 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/50 rounded text-emerald-300 text-center font-bold transition"
              >
                h = 0.01
              </button>
            </div>
          </div>

          {/* Mathematical Proof Card */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1.5">
            <div className="text-slate-400 text-[10px] uppercase">Turunan Aljabar Limit:</div>
            <div className="text-cyan-300">
              f'(t) = lim[h➔0] [0.5(t+h)² - 0.5t²] / h
            </div>
            <div className="text-indigo-300">
              = lim[h➔0] [0.5(t² + 2th + h²) - 0.5t²] / h
            </div>
            <div className="text-emerald-300 font-bold">
              = lim[h➔0] (th + 0.5h²) / h = t + 0 = {tPoint} m/s
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleTestLimit}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Verifikasi Konvergensi Limit</span>
          </button>

          {hasDiscoveredLimit && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bukti Penalaran Limit Tersimpan ke Evidence Log!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
