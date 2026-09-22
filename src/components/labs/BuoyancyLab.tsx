import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Sparkles, CheckCircle2, AlertTriangle, ArrowDown, ArrowUp, Send, HelpCircle } from 'lucide-react';
import { FeynmanDiagnosisResult } from '../../types';

interface BuoyancyLabProps {
  onFeynmanDiagnosed?: (result: FeynmanDiagnosisResult, explanation: string) => void;
  onMasteryEvidence?: (details: string) => void;
}

export const BuoyancyLab: React.FC<BuoyancyLabProps> = ({ onFeynmanDiagnosed, onMasteryEvidence }) => {
  // Object properties
  const [mass, setMass] = useState<number>(3.0); // kg
  const [volume, setVolume] = useState<number>(4.0); // Liters
  const [shape, setShape] = useState<'solid' | 'hollow_hull'>('solid');
  const [fluidType, setFluidType] = useState<'fresh' | 'salt'>('fresh');

  // Simulation state
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [childExplanation, setChildExplanation] = useState<string>('');
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [lastDiagnosis, setLastDiagnosis] = useState<FeynmanDiagnosisResult | null>(null);

  // Constants
  const g = 9.8;
  const fluidDensity = fluidType === 'fresh' ? 1.0 : 1.03; // kg / L

  // Calculations
  // Effective volume of hull if hollow: air trapped increases displaced volume without increasing mass
  const effectiveVolume = shape === 'hollow_hull' ? volume * 1.8 : volume;
  const objectDensity = mass / effectiveVolume; // kg / L

  const willFloat = objectDensity < fluidDensity;
  const submergedFraction = Math.min(1.0, objectDensity / fluidDensity);
  const displacedVolume = willFloat ? effectiveVolume * submergedFraction : effectiveVolume;
  const buoyantForce = displacedVolume * fluidDensity * g;
  const gravityForce = mass * g;
  const netForce = buoyantForce - gravityForce;

  // Water level in tank (visual)
  const baseWaterLevel = 55; // %
  const displacedRise = displacedVolume * 2.5; // visual %

  // Position of object in tank: 0 (top floating) to 70 (bottom)
  const objectY = willFloat
    ? Math.max(10, 48 - (1 - submergedFraction) * 20)
    : 72; // bottom

  const handleRunDiagnosis = async () => {
    if (!childExplanation.trim()) return;
    setIsDiagnosing(true);

    try {
      const res = await fetch('/api/diagnose/feynman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptName: 'Gaya Apung & Kerapatan (Archimedes)',
          studentExplanation: childExplanation,
          expectedPrinciple: 'Gaya apung sama dengan berat volume fluida yang didesak; lambung berongga mendesak lebih banyak air sehingga gaya ke atas melebihi berat total.',
        }),
      });
      const data: FeynmanDiagnosisResult = await res.json();
      setLastDiagnosis(data);
      if (onFeynmanDiagnosed) onFeynmanDiagnosed(data, childExplanation);
      if (onMasteryEvidence) {
        onMasteryEvidence(
          `Penjelasan Feynman Sensor Archimedes: "${childExplanation}" (Skor Kausal: ${(data.causalReasoning * 100).toFixed(0)}%, Transfer: ${(data.transferScore * 100).toFixed(0)}%)`
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div id="buoyancy-lab-container" className="space-y-6">
      {/* Top Banner / Cognitive Purpose */}
      <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Lab Simulasi Eksperimen
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Mekanika Fluida & Teka-teki Kapal Baja
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Tujuan Kognitif: Mengurai miskonsepsi <span className="text-amber-300 font-semibold">"benda berat pasti tenggelam"</span> melalui hukum desakan fluida Archimedes.
          </p>
        </div>
        <div className="text-right flex items-center gap-2">
          <span className="text-xs text-slate-400">Status Pembuktian:</span>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${willFloat ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
            {willFloat ? '✓ Mengapung / Melayang' : '✗ Tenggelam ke Dasar'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Tank Simulation Canvas */}
        <div className="lg:col-span-7 bg-[#0f1422] border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[460px]">
          {/* Header Indicators */}
          <div className="flex justify-between items-center z-10">
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">ρ Fluida: <strong className="text-cyan-300">{fluidDensity} kg/L</strong></span>
              <span className="text-slate-400">ρ Benda: <strong className={objectDensity > fluidDensity ? 'text-rose-400' : 'text-emerald-400'}>{objectDensity.toFixed(2)} kg/L</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Air Terdesak:</span>
              <span className="text-amber-300 font-bold">{displacedVolume.toFixed(2)} Liter</span>
            </div>
          </div>

          {/* Water Tank Representation */}
          <div className="relative flex-1 my-4 border-2 border-slate-700/60 rounded-lg overflow-hidden bg-slate-950/70 flex flex-col justify-end">
            {/* Water body */}
            <div
              className="w-full bg-gradient-to-t from-cyan-900/60 via-cyan-800/40 to-cyan-500/30 border-t-2 border-cyan-400/70 transition-all duration-700 ease-out relative"
              style={{ height: `${Math.min(95, baseWaterLevel + displacedRise)}%` }}
            >
              {/* Depth markers */}
              <div className="absolute left-2 top-2 text-[10px] text-cyan-200/50 font-mono">Permukaan Air (Displaced +{displacedRise.toFixed(1)}%)</div>
              <div className="absolute left-2 bottom-2 text-[10px] text-cyan-200/40 font-mono">Dasar Tangki Tekanan</div>

              {/* Water displacement waves */}
              <div className="absolute inset-x-0 top-0 h-2 bg-cyan-300/20 animate-pulse" />
            </div>

            {/* Test Object Inside/Over Tank */}
            <div
              className="absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-out flex flex-col items-center z-20"
              style={{ top: `${objectY}%` }}
            >
              {/* Force Vectors */}
              <div className="relative flex flex-col items-center">
                {/* Buoyant force arrow (UP) */}
                <div
                  className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 font-bold absolute -top-8 transition-all"
                  title={`Gaya Apung: ${buoyantForce.toFixed(1)} N`}
                >
                  <ArrowUp className="w-4 h-4 text-emerald-400 animate-bounce" />
                  <span>Fb {buoyantForce.toFixed(1)}N</span>
                </div>

                {/* The Object Body */}
                <div
                  className={`relative px-4 py-3 rounded-lg border-2 shadow-2xl transition-all duration-500 flex flex-col items-center justify-center ${
                    shape === 'hollow_hull'
                      ? 'w-44 h-16 rounded-b-3xl border-cyan-400 bg-gradient-to-b from-slate-800 to-slate-900 text-cyan-200'
                      : 'w-24 h-24 rounded-md border-amber-500 bg-gradient-to-br from-amber-800/90 to-amber-950 text-amber-200'
                  }`}
                >
                  <div className="text-xs font-bold text-center leading-tight">
                    {shape === 'hollow_hull' ? 'Lambung Kapal Baja' : 'Balok Besi Padat'}
                  </div>
                  <div className="text-[10px] font-mono opacity-80 mt-0.5">
                    {mass} kg · {volume} L
                  </div>
                  {shape === 'hollow_hull' && (
                    <div className="text-[9px] text-cyan-300/90 bg-cyan-950/70 px-1.5 py-0.5 rounded mt-0.5">
                      Rongga Udara Aktif
                    </div>
                  )}
                </div>

                {/* Gravity force arrow (DOWN) */}
                <div
                  className="flex items-center gap-1 text-[11px] font-mono text-rose-400 font-bold absolute -bottom-8 transition-all"
                  title={`Gaya Gravitasi: ${gravityForce.toFixed(1)} N`}
                >
                  <ArrowDown className="w-4 h-4 text-rose-400" />
                  <span>W {gravityForce.toFixed(1)}N</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Force Balance Meter */}
          <div className="grid grid-cols-3 gap-3 bg-slate-900/90 rounded-lg p-3 border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Berat Benda (W):</span>
              <span className="text-rose-400 font-bold text-sm">{gravityForce.toFixed(1)} N</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Gaya Angkat (Fb):</span>
              <span className="text-emerald-400 font-bold text-sm">{buoyantForce.toFixed(1)} N</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Gaya Bersih (Net):</span>
              <span className={`font-bold text-sm ${netForce >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                {netForce >= 0 ? `+${netForce.toFixed(1)} N (Ke Atas)` : `${netForce.toFixed(1)} N (Ke Bawah)`}
              </span>
            </div>
          </div>
        </div>

        {/* Experiment Controls & Socratic Feynman Sensor */}
        <div className="lg:col-span-5 space-y-4">
          {/* Controls Card */}
          <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span>Variabel Eksperimen</span>
              <button
                id="reset-lab-btn"
                onClick={() => {
                  setMass(3.0);
                  setVolume(4.0);
                  setShape('solid');
                  setFluidType('fresh');
                }}
                className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </h4>

            {/* Shape selection */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Bentuk Geometri Benda:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="shape-solid-btn"
                  onClick={() => setShape('solid')}
                  className={`py-2 px-3 text-xs rounded-lg border font-medium transition ${
                    shape === 'solid'
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Balok Padat (Solid)
                </button>
                <button
                  id="shape-hull-btn"
                  onClick={() => setShape('hollow_hull')}
                  className={`py-2 px-3 text-xs rounded-lg border font-medium transition ${
                    shape === 'hollow_hull'
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Lambung Berongga (Kapal)
                </button>
              </div>
            </div>

            {/* Mass slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Massa Benda:</span>
                <span className="font-mono text-amber-300 font-bold">{mass.toFixed(1)} kg</span>
              </div>
              <input
                id="mass-slider"
                type="range"
                min="0.5"
                max="10.0"
                step="0.5"
                value={mass}
                onChange={(e) => setMass(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Volume slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Volume Asli Benda:</span>
                <span className="font-mono text-cyan-300 font-bold">{volume.toFixed(1)} Liter</span>
              </div>
              <input
                id="volume-slider"
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Fluid Type */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Jenis Fluida:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setFluidType('fresh')}
                  className={`py-1.5 px-3 rounded-lg border font-medium transition ${
                    fluidType === 'fresh'
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Air Tawar (1.0 kg/L)
                </button>
                <button
                  onClick={() => setFluidType('salt')}
                  className={`py-1.5 px-3 rounded-lg border font-medium transition ${
                    fluidType === 'salt'
                      ? 'bg-teal-500/20 border-teal-500/60 text-teal-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Air Laut Asin (1.03 kg/L)
                </button>
              </div>
            </div>
          </div>

          {/* Socratic Feynman Sensor Card */}
          <div className="bg-[#121727] border border-cyan-500/40 rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <h4 className="text-sm font-bold text-white">Feynman Sensor: Uji Pemahaman Kausal</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              💡 <em>"Kenapa balok besi 3 kg tenggelam, tetapi jika besi yang sama kita tempa menjadi bentuk mangkuk kapal berongga, ia tiba-tiba mengapung dengan kokoh?"</em>
            </p>

            <textarea
              id="feynman-explanation-input"
              value={childExplanation}
              onChange={(e) => setChildExplanation(e.target.value)}
              placeholder="Jelaskan mekanisme sebab-akibat dengan bahasamu sendiri (misal: tentang apa yang terjadi pada air, gaya angkat, atau rongga udara)..."
              rows={3}
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />

            <button
              id="submit-feynman-btn"
              onClick={handleRunDiagnosis}
              disabled={isDiagnosing || !childExplanation.trim()}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-md transition"
            >
              {isDiagnosing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Feynman Sensor Sedang Mendiagnosis Penalaran...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Uji Penalaran Saya (Kirim Bukti Kognitif)</span>
                </>
              )}
            </button>

            {/* Diagnosis Result Feedback */}
            {lastDiagnosis && (
              <div className="mt-3 p-3.5 bg-slate-900/90 border border-cyan-500/40 rounded-lg text-xs space-y-2 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-semibold text-cyan-300">Hasil Telemetri Sensor Feynman:</span>
                  <span className="text-[10px] text-slate-400 font-mono">Terekam ke Evidence Log</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center py-1">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Konseptual</span>
                    <strong className="text-sm text-cyan-300 font-mono">
                      {(lastDiagnosis.conceptualUnderstanding * 100).toFixed(0)}%
                    </strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Kausalitas</span>
                    <strong className="text-sm text-emerald-300 font-mono">
                      {(lastDiagnosis.causalReasoning * 100).toFixed(0)}%
                    </strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Transfer</span>
                    <strong className="text-sm text-amber-300 font-mono">
                      {(lastDiagnosis.transferScore * 100).toFixed(0)}%
                    </strong>
                  </div>
                </div>

                {lastDiagnosis.misconceptions && lastDiagnosis.misconceptions.length > 0 && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-200 text-[11px] flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Miskonsepsi Terdeteksi: <strong>{lastDiagnosis.misconceptions.join(', ')}</strong></span>
                  </div>
                )}

                <p className="text-[11px] text-slate-300 italic">
                  "{lastDiagnosis.feedbackSummary}"
                </p>
                <div className="text-[11px] text-cyan-200 bg-cyan-950/40 p-2 rounded border border-cyan-800/40">
                  🎯 <strong>Langkah Penyelidikan Lanjutan:</strong> {lastDiagnosis.nextBestProbe}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
