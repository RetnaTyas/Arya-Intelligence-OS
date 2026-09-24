import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Send,
  Target,
  Activity,
  Compass,
} from 'lucide-react';
import { FeynmanDiagnosisResult } from '../../types';
import { useLabTelemetry } from '../../engine/useLabTelemetry';
import { deriveEmpiricalEvidenceFromTelemetry } from '../../engine/empiricalEvidenceDerivation';
import { EmpiricalSimulationEvidence } from '../../engine/evidenceTriangulation';
import { useSpringValue, playSplash, playChime } from '../../engine/labMotionFX';
import { WaterSurfaceFX } from './WaterSurfaceFX';

interface BuoyancyLabProps {
  onFeynmanDiagnosed?: (result: FeynmanDiagnosisResult, explanation: string) => void;
  onMasteryEvidence?: (details: string) => void;
  onEmpiricalEvidence?: (evidence: EmpiricalSimulationEvidence) => void;
}

export const BuoyancyLab: React.FC<BuoyancyLabProps> = ({
  onFeynmanDiagnosed,
  onMasteryEvidence,
  onEmpiricalEvidence,
}) => {
  // Mode: Challenge or Free Exploration
  const [labMode, setLabMode] = useState<'challenge' | 'exploration'>('challenge');

  // Object properties
  const [mass, setMass] = useState<number>(3.0); // kg
  const [volume, setVolume] = useState<number>(4.0); // Liters
  const [shape, setShape] = useState<'solid' | 'hollow_hull'>('solid');
  const [fluidType, setFluidType] = useState<'fresh' | 'salt'>('fresh');

  // Telemetry Engine integration
  const telemetry = useLabTelemetry('buoyancy');
  const [liveEmpirical, setLiveEmpirical] = useState<EmpiricalSimulationEvidence | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    tested: boolean;
    isCorrect: boolean;
    message: string;
  } | null>(null);

  // Simulation state
  const [childExplanation, setChildExplanation] = useState<string>('');
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [lastDiagnosis, setLastDiagnosis] = useState<FeynmanDiagnosisResult | null>(null);

  // Constants
  const g = 9.8;
  const fluidDensity = fluidType === 'fresh' ? 1.0 : 1.03; // kg / L
  const TARGET_TOLERANCE = 0.05; // kg/L tolerance for neutral buoyancy target

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

  // Check if object is neutrally buoyant (hovering in middle)
  const isNeutralBuoyancy = Math.abs(objectDensity - fluidDensity) <= TARGET_TOLERANCE;

  // Position of object in tank: 0 (top floating) to 70 (bottom)
  const targetObjectY = isNeutralBuoyancy
    ? 40 // exactly hovering in the middle
    : willFloat
    ? Math.max(10, 48 - (1 - submergedFraction) * 20)
    : 72; // bottom

  // Real spring-damper motion instead of a linear CSS glide: the object
  // now overshoots and bobs before settling, the way an actual floating
  // or sinking body does (underdamped = visible bob, matches "mengapung
  // & terombang-ambing" much more convincingly for a child watching it).
  const { value: objectY, kick: kickObjectY } = useSpringValue(targetObjectY, {
    stiffness: 70,
    damping: 8,
  });

  // Bumped on every parameter change / test so the water surface knows
  // to fire a splash ripple, and so we can trigger a synced sound cue.
  const [splashTrigger, setSplashTrigger] = useState(0);
  const triggerSplash = () => {
    setSplashTrigger((n) => n + 1);
    kickObjectY(willFloat ? 18 : 40); // heavier drop sinks in harder before settling
    playSplash();
  };

  // Telemetry-aware parameter handlers
  const handleMassChange = (newMass: number) => {
    setMass(newMass);
    telemetry.recordParameterChange('mass', newMass);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    telemetry.recordParameterChange('volume', newVolume);
  };

  const handleShapeChange = (newShape: 'solid' | 'hollow_hull') => {
    setShape(newShape);
    telemetry.recordParameterChange('shape', newShape);
    triggerSplash(); // re-shaping the hull is the most visually dramatic change — worth a splash
  };

  const handleFluidChange = (newFluid: 'fresh' | 'salt') => {
    setFluidType(newFluid);
    telemetry.recordParameterChange('fluidType', newFluid);
    triggerSplash();
  };

  const handleReset = () => {
    setMass(3.0);
    setVolume(4.0);
    setShape('solid');
    setFluidType('fresh');
    setVerificationFeedback(null);
    telemetry.recordReset();
  };

  // Empirical Challenge Verification
  const handleTestConfiguration = () => {
    const densityDiff = Math.abs(objectDensity - fluidDensity);
    // Normalized distance from target: 0 (exact match) up to 1 (off by 0.5 kg/L or more)
    const distance = Math.min(1.0, densityDiff / 0.5);
    const isCorrect = densityDiff <= TARGET_TOLERANCE;

    telemetry.recordVerificationAttempt(isCorrect, distance);
    triggerSplash();
    playChime(isCorrect);

    const session = telemetry.getCurrentSession();
    const derived = deriveEmpiricalEvidenceFromTelemetry(session);
    setLiveEmpirical(derived);

    if (onEmpiricalEvidence) {
      onEmpiricalEvidence(derived);
    }

    if (isCorrect) {
      setVerificationFeedback({
        tested: true,
        isCorrect: true,
        message: `✓ Target Tercapai! Kerapatan benda (${objectDensity.toFixed(2)} kg/L) seimbang dengan fluida (${fluidDensity.toFixed(2)} kg/L). Benda melayang di tengah!`,
      });
      if (onMasteryEvidence) {
        onMasteryEvidence(
          `Berhasil mencapai melayang stabil (kepadatan seimbang: ${objectDensity.toFixed(2)} kg/L) dengan akurasi empiris ${(derived.accuracyScore * 100).toFixed(0)}% (${derived.trialCount}x uji).`
        );
      }
    } else {
      setVerificationFeedback({
        tested: true,
        isCorrect: false,
        message:
          objectDensity > fluidDensity
            ? `Benda tenggelam (selisih +${densityDiff.toFixed(2)} kg/L). Perbesar volume atau kurangi massa.`
            : `Benda mengapung terlalu tinggi (selisih -${densityDiff.toFixed(2)} kg/L). Perbesar massa atau kurangi rongga.`,
      });
    }
  };

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
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP error ${res.status}`);
      }
      setLastDiagnosis(data);

      // Finalize telemetry session and derive deterministic empirical evidence
      const session = telemetry.finalizeSession();
      const empiricalEvidence = deriveEmpiricalEvidenceFromTelemetry(session);
      setLiveEmpirical(empiricalEvidence);

      // Send both empirical evidence and Feynman diagnosis
      if (onEmpiricalEvidence) onEmpiricalEvidence(empiricalEvidence);
      if (onFeynmanDiagnosed) onFeynmanDiagnosed(data, childExplanation);

      if (onMasteryEvidence) {
        onMasteryEvidence(
          `Feynman: "${childExplanation}" | Empiris: ${empiricalEvidence.trialCount}x percobaan, akurasi ${(empiricalEvidence.accuracyScore * 100).toFixed(0)}%, presisi ${(empiricalEvidence.manipulationPrecision * 100).toFixed(0)}%`
        );
      }
    } catch (e: any) {
      console.error(e);
      setLastDiagnosis({
        conceptualUnderstanding: 0.0,
        causalReasoning: 0.0,
        transferScore: 0.0,
        analogyDetected: false,
        misconceptions: ['Workers AI Error'],
        feedbackSummary: `[Cloudflare Workers AI Error]: ${e.message}`,
        nextBestProbe: 'Periksa binding Pages Functions "AiOS AI" atau kredensial API Cloudflare Workers AI.',
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div id="buoyancy-lab-container" className="space-y-6">
      {/* Top Banner / Cognitive Purpose & Mode Switch */}
      <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Lab Simulasi Eksperimen & Telemetri
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Mekanika Fluida & Teka-teki Kapal Baja
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Tujuan Kognitif: Mengurai miskonsepsi <span className="text-amber-300 font-semibold">"benda berat pasti tenggelam"</span> melalui hukum desakan fluida Archimedes & telemetri empiris nyata.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          <button
            id="mode-challenge-btn"
            onClick={() => setLabMode('challenge')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition ${
              labMode === 'challenge'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Mode Tantangan</span>
          </button>
          <button
            id="mode-explore-btn"
            onClick={() => setLabMode('exploration')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition ${
              labMode === 'exploration'
                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Eksplorasi Bebas</span>
          </button>
        </div>
      </div>

      {/* Challenge Mission Banner (When in Challenge Mode) */}
      {labMode === 'challenge' && (
        <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-blue-950/60 border border-cyan-500/40 rounded-xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Misi Tantangan: Rekayasa Melayang Seimbang (Neutral Buoyancy)</span>
            </div>
            <p className="text-xs text-slate-300">
              Atur massa dan volume sampai kepadatan benda sama persis dengan kerapatan air (<strong className="text-cyan-300">{fluidDensity} kg/L ±{TARGET_TOLERANCE}</strong>) agar benda melayang di tengah tangki!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-[10px] text-slate-400">Selisih Kepadatan:</div>
              <div
                className={`font-mono text-sm font-bold ${
                  isNeutralBuoyancy ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {Math.abs(objectDensity - fluidDensity).toFixed(2)} kg/L
              </div>
            </div>
            <button
              id="test-configuration-btn"
              onClick={handleTestConfiguration}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Uji Konfigurasi Ini</span>
            </button>
          </div>
        </div>
      )}

      {/* Verification Feedback Notice */}
      {verificationFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fade-in ${
            verificationFeedback.isCorrect
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {verificationFeedback.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{verificationFeedback.message}</span>
          </div>
          {liveEmpirical && (
            <span className="text-[10px] font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
              Percobaan ke-{liveEmpirical.trialCount} · Presisi: {(liveEmpirical.manipulationPrecision * 100).toFixed(0)}%
            </span>
          )}
        </div>
      )}

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
            {/* Water body: real animated waves + splash ripples instead of a static gradient block */}
            <WaterSurfaceFX
              levelPercent={Math.min(95, baseWaterLevel + displacedRise)}
              splashTrigger={splashTrigger}
            />
            <div className="absolute left-2 top-2 text-[10px] text-cyan-200/50 font-mono z-10">Permukaan Air (Displaced +{displacedRise.toFixed(1)}%)</div>
            {isNeutralBuoyancy && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-emerald-300 font-mono bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/40 z-10">
                Target: Zona Melayang Seimbang
              </div>
            )}
            <div className="absolute left-2 bottom-2 text-[10px] text-cyan-200/40 font-mono z-10">Dasar Tangki Tekanan</div>

            {/* Test Object Inside/Over Tank — position driven by spring physics (bobs & settles, no linear glide) */}
            <div
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-20"
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

          {/* Real-time Force Balance Meter & Telemetry Strip */}
          <div className="space-y-2">
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

            {/* Live Telemetry Sensor Panel */}
            {liveEmpirical && (
              <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-lg p-2.5 flex items-center justify-between text-[11px] font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-300 font-semibold">Telemetri Empiris Nyata:</span>
                  <span>Uji: <strong>{liveEmpirical.trialCount}x</strong></span>
                  <span>Akurasi: <strong>{(liveEmpirical.accuracyScore * 100).toFixed(0)}%</strong></span>
                  <span>Presisi: <strong>{(liveEmpirical.manipulationPrecision * 100).toFixed(0)}%</strong></span>
                </div>
                <div className="text-[10px]">
                  Pola: <span className={liveEmpirical.isTrialAndErrorGuesswork ? 'text-rose-400' : 'text-emerald-400 font-semibold'}>
                    {liveEmpirical.isTrialAndErrorGuesswork ? 'Tebak Acak (Penalti)' : 'Eksplorasi Konvergen'}
                  </span>
                </div>
              </div>
            )}
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
                onClick={handleReset}
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
                  onClick={() => handleShapeChange('solid')}
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
                  onClick={() => handleShapeChange('hollow_hull')}
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
                onChange={(e) => handleMassChange(parseFloat(e.target.value))}
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
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Fluid Type */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Jenis Fluida:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  id="fluid-fresh-btn"
                  onClick={() => handleFluidChange('fresh')}
                  className={`py-1.5 px-3 rounded-lg border font-medium transition ${
                    fluidType === 'fresh'
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Air Tawar (1.0 kg/L)
                </button>
                <button
                  id="fluid-salt-btn"
                  onClick={() => handleFluidChange('salt')}
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
