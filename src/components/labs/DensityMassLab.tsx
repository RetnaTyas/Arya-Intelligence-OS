import React, { useState } from 'react';
import {
  Scale,
  Droplets,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FlaskConical,
  Eye,
  Layers,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useLabTelemetry } from '../../engine/useLabTelemetry';
import { deriveEmpiricalEvidenceFromTelemetry } from '../../engine/empiricalEvidenceDerivation';
import { EmpiricalSimulationEvidence } from '../../engine/evidenceTriangulation';

interface MaterialBlock {
  id: string;
  name: string;
  material: string;
  mass: number; // in grams
  volume: number; // in cm³
  color: string;
  border: string;
  emoji: string;
  textureLabel: string;
}

const EXPERIMENT_BLOCKS: MaterialBlock[] = [
  {
    id: 'giant-sponge',
    name: 'Spons Busa Raksasa',
    material: 'Busa Polimer Berpori',
    mass: 50,
    volume: 1000,
    color: 'bg-yellow-500/20 text-yellow-300',
    border: 'border-yellow-500/40',
    emoji: '🧽',
    textureLabel: 'Volume Raksasa (1000 cm³), Massa Sangat Ringan (50 g)',
  },
  {
    id: 'iron-cube',
    name: 'Kubus Besi Murni',
    material: 'Logam Besi Padat',
    mass: 390,
    volume: 50,
    color: 'bg-slate-400/20 text-slate-200',
    border: 'border-slate-400/40',
    emoji: '🔩',
    textureLabel: 'Volume Mini (50 cm³), Massa Sangat Berat (390 g)',
  },
  {
    id: 'teak-wood',
    name: 'Balok Kayu Jati',
    material: 'Serat Kayu Alami',
    mass: 140,
    volume: 200,
    color: 'bg-amber-600/20 text-amber-300',
    border: 'border-amber-600/40',
    emoji: '🪵',
    textureLabel: 'Volume Sedang (200 cm³), Massa Cukup Berat (140 g)',
  },
  {
    id: 'wax-block',
    name: 'Balok Lilin Parafin',
    material: 'Lilin Hidrokarbon',
    mass: 90,
    volume: 100,
    color: 'bg-indigo-400/20 text-indigo-300',
    border: 'border-indigo-400/40',
    emoji: '🕯️',
    textureLabel: 'Volume 100 cm³, Massa 90 g (Mendekati Air!)',
  },
];

interface DensityMassLabProps {
  onMasteryEvidence?: (concept: string, details: string) => void;
  onEmpiricalEvidence?: (evidence: EmpiricalSimulationEvidence) => void;
}

export const DensityMassLab: React.FC<DensityMassLabProps> = ({
  onMasteryEvidence,
  onEmpiricalEvidence,
}) => {
  const telemetry = useLabTelemetry('density_mass');

  const [selectedBlockId, setSelectedBlockId] = useState<string>('giant-sponge');
  const [testedInWater, setTestedInWater] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'tank' | 'scale' | 'microscope'>('tank');

  // Predict-before-reveal state: child must guess before dropping
  const [predictedBehavior, setPredictedBehavior] = useState<'floats' | 'sinks' | null>(null);
  const [droppedInTank, setDroppedInTank] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const selectedBlock = EXPERIMENT_BLOCKS.find((b) => b.id === selectedBlockId) || EXPERIMENT_BLOCKS[0];

  // Density = mass / volume (g/cm³)
  const density = selectedBlock.mass / selectedBlock.volume;
  const waterDensity = 1.0; // g/cm³

  // Floating physics:
  const floats = density < waterDensity;
  const submergedPercent = Math.min(100, Math.max(10, density * 100));

  const handleSelectBlock = (blockId: string) => {
    setSelectedBlockId(blockId);
    setDroppedInTank(false);
    setPredictedBehavior(null);
    setFeedback(null);
    telemetry.recordParameterChange('selectedBlockId', blockId);
  };

  const handlePredictBehavior = (choice: 'floats' | 'sinks') => {
    setPredictedBehavior(choice);
    telemetry.recordParameterChange('predictedBehavior', choice);
  };

  const handleDropAndVerify = () => {
    if (!predictedBehavior) return;

    const actualFloats = density < waterDensity;
    const isCorrect = (predictedBehavior === 'floats') === actualFloats;
    const distance = isCorrect ? 0 : Math.min(1.0, Math.abs(density - waterDensity) / waterDensity);

    telemetry.recordVerificationAttempt(isCorrect, distance);
    setDroppedInTank(true);

    const updatedTested = { ...testedInWater, [selectedBlock.id]: true };
    setTestedInWater(updatedTested);

    if (isCorrect) {
      setFeedback({
        ok: true,
        message: `Prediksi Tepat! ${selectedBlock.name} (${density.toFixed(2)} g/cm³) ${
          actualFloats ? 'terapung karena kerapatannya < 1.00 g/cm³' : 'tenggelam karena kerapatannya > 1.00 g/cm³'
        }.`,
      });
    } else {
      setFeedback({
        ok: false,
        message: `Ternyata berbeda! Walau ${selectedBlock.textureLabel}, kerapatannya adalah ${density.toFixed(2)} g/cm³ (air = 1.00 g/cm³). Maka benda ini ${
          actualFloats ? 'terapung' : 'tenggelam'
        }.`,
      });
    }

    const testedCount = Object.keys(updatedTested).length;
    if (testedCount >= 3) {
      const session = telemetry.finalizeSession();
      const evidence = deriveEmpiricalEvidenceFromTelemetry(session);
      if (onEmpiricalEvidence) onEmpiricalEvidence(evidence);

      if (onMasteryEvidence) {
        onMasteryEvidence(
          'Kerapatan Massa & Volume Fluida',
          `Anak menguji ${testedCount} benda uji dengan prediksi kausal terverifikasi (Akurasi: ${(evidence.accuracyScore * 100).toFixed(0)}%, Presisi: ${(evidence.manipulationPrecision * 100).toFixed(0)}%).`
        );
      }
    }
  };

  return (
    <div id="density-mass-lab" className="bg-[#0b0f1d] rounded-2xl border border-slate-800 p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Umur 7 - 9 Tahun (Operasional Konkret)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
              Domain: Fisika
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
            <span>Kerapatan Massa & Volume (Density vs Mass Inquiry Lab)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Membongkar miskonsepsi besar: "Benda berukuran besar pasti lebih berat" dan "Benda berat pasti tenggelam".
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto text-xs">
          <button
            onClick={() => setActiveTab('tank')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'tank' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tangki Air Akuarium
          </button>
          <button
            onClick={() => setActiveTab('scale')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'scale' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Timbangan & Gelas Ukur
          </button>
          <button
            onClick={() => setActiveTab('microscope')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'microscope' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mikroskop Partikel
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Stage View (7 Cols) */}
        <div className="lg:col-span-7 bg-[#070b16] rounded-2xl border border-slate-800/90 p-5 flex flex-col items-center justify-between min-h-[340px] relative overflow-hidden">
          {activeTab === 'tank' && (
            <div className="w-full flex flex-col items-center h-full justify-between">
              {/* Top Water Surface Indicators */}
              <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kerapatan Air Murni (ρ_air) = <strong>1.00 g/cm³</strong></span>
                </span>
                <span className="text-[11px] font-mono text-cyan-300">
                  Status: {floats ? 'TERAPUNG DI PERMUKAAN' : 'TENGGELAM KE DASAR'}
                </span>
              </div>

              {/* Water Tank Box */}
              <div className="w-full max-w-md h-56 bg-gradient-to-b from-cyan-950/40 via-cyan-900/30 to-blue-950/60 border-2 border-cyan-500/40 rounded-b-2xl relative my-3 overflow-hidden shadow-2xl flex flex-col justify-end">
                {/* Water Surface Wave Line */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-cyan-400/80 shadow-md shadow-cyan-400" />
                <span className="absolute top-2 right-3 text-[10px] font-mono text-cyan-400">
                  Permukaan Air (ρ = 1.00 g/cm³)
                </span>

                {/* Submerged / Floating Object Display */}
                {droppedInTank ? (
                  <div
                    className="w-full flex justify-center transition-all duration-700 ease-out"
                    style={{
                      transform: floats
                        ? `translateY(-${Math.max(10, 110 - submergedPercent)}px)`
                        : 'translateY(-10px)',
                    }}
                  >
                    <div className={`p-3 rounded-xl border ${selectedBlock.color} ${selectedBlock.border} shadow-2xl flex flex-col items-center max-w-[180px] text-center bg-slate-900/90 animate-fade-in`}>
                      <span className="text-3xl">{selectedBlock.emoji}</span>
                      <strong className="text-xs text-white mt-1">{selectedBlock.name}</strong>
                      <span className="text-[10px] font-mono mt-0.5">
                        ρ = {density.toFixed(2)} g/cm³
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute top-1 left-0 right-0 flex justify-center">
                    <div className={`p-2 rounded-lg border ${selectedBlock.color} ${selectedBlock.border} bg-slate-950/90 flex items-center gap-2 shadow-lg`}>
                      <span className="text-xl">{selectedBlock.emoji}</span>
                      <span className="text-xs text-white font-bold">{selectedBlock.name}</span>
                      <span className="text-[10px] text-amber-300 font-mono">[Di Meja]</span>
                    </div>
                  </div>
                )}

                {/* Tank Bottom Sediment */}
                <div className="h-4 bg-slate-900/80 border-t border-cyan-800/40 flex items-center justify-center">
                  <span className="text-[9px] text-slate-500 font-mono">Dasar Bejana Kaca</span>
                </div>
              </div>

              {/* Predict-Before-Reveal Step */}
              {!droppedInTank ? (
                <div className="w-full max-w-md p-3 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Prediksi Kausal Sebelum Dicelupkan:</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      Massa: {selectedBlock.mass}g | Vol: {selectedBlock.volume}cm³
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      id="predict-floats-btn"
                      type="button"
                      onClick={() => handlePredictBehavior('floats')}
                      className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition ${
                        predictedBehavior === 'floats'
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>Akan Terapung</span>
                    </button>
                    <button
                      id="predict-sinks-btn"
                      type="button"
                      onClick={() => handlePredictBehavior('sinks')}
                      className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition ${
                        predictedBehavior === 'sinks'
                          ? 'bg-rose-600 border-rose-400 text-white shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>Akan Tenggelam</span>
                    </button>
                  </div>

                  <button
                    id="drop-into-water-btn"
                    type="button"
                    onClick={handleDropAndVerify}
                    disabled={!predictedBehavior}
                    className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg transition disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <span>Celupkan ke Air & Uji Prediksi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-md space-y-2">
                  {feedback && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-fade-in ${
                        feedback.ok
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                          : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      }`}
                    >
                      {feedback.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setDroppedInTank(false);
                      setPredictedBehavior(null);
                      setFeedback(null);
                    }}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition"
                  >
                    Uji Ulang / Angkat Objek
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scale' && (
            <div className="w-full h-full flex flex-col justify-around items-center py-2 space-y-4">
              <div className="w-full grid grid-cols-2 gap-4">
                {/* Digital Mass Scale */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center space-y-2">
                  <Scale className="w-6 h-6 text-amber-400" />
                  <span className="text-xs text-slate-400">Timbangan Digital (Massa)</span>
                  <div className="text-2xl font-mono font-bold text-amber-300 bg-slate-950 px-4 py-1.5 rounded-lg border border-amber-500/30">
                    {selectedBlock.mass} <span className="text-xs">gram</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Massa Materi Nyata</span>
                </div>

                {/* Water Displacement Beaker */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center space-y-2">
                  <FlaskConical className="w-6 h-6 text-cyan-400" />
                  <span className="text-xs text-slate-400">Gelas Ukur (Volume Ruang)</span>
                  <div className="text-2xl font-mono font-bold text-cyan-300 bg-slate-950 px-4 py-1.5 rounded-lg border border-cyan-500/30">
                    {selectedBlock.volume} <span className="text-xs">cm³</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Ruang 3 Dimensi</span>
                </div>
              </div>

              {/* Formula Box */}
              <div className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Hukum Rasio Kerapatan (Density Formula):
                </span>
                <div className="text-sm font-mono text-white flex items-center justify-center gap-2">
                  <span>ρ = Massa ÷ Volume =</span>
                  <span className="text-amber-400">{selectedBlock.mass} g</span>
                  <span>÷</span>
                  <span className="text-cyan-400">{selectedBlock.volume} cm³</span>
                  <span>=</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-600/40">
                    {density.toFixed(2)} g/cm³
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'microscope' && (
            <div className="w-full h-full flex flex-col justify-between items-center py-2 space-y-3">
              <div className="w-full flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span>Susunan Partikel Molekul dalam Volume yang Sama</span>
                </span>
                <span className="font-mono text-purple-300 text-[11px]">
                  {density > 1 ? 'Partikel Sangat Rapat' : 'Partikel Sangat Renggang'}
                </span>
              </div>

              {/* Particle visual grid */}
              <div className="w-full h-44 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-wrap gap-2 items-center justify-center overflow-hidden">
                {Array.from({ length: Math.min(72, Math.max(6, Math.round(density * 18))) }).map((_, i) => (
                  <span
                    key={i}
                    className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/80 animate-pulse"
                    style={{ animationDelay: `${(i % 10) * 100}ms` }}
                  />
                ))}
              </div>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Di dalam volume yang sama, benda dengan kerapatan tinggi menjejalkan jauh lebih banyak partikel materi, sehingga menghasilkan massa yang jauh lebih besar!
              </p>
            </div>
          )}
        </div>

        {/* Right Selection & Misconception Matrix (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pilih Objek untuk Diuji di Air</span>
          </h4>

          <div className="space-y-2">
            {EXPERIMENT_BLOCKS.map((block) => {
              const isSelected = selectedBlockId === block.id;
              const hasTested = testedInWater[block.id];
              const bDensity = block.mass / block.volume;

              return (
                <button
                  key={block.id}
                  id={`select-block-${block.id}`}
                  type="button"
                  onClick={() => handleSelectBlock(block.id)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{block.emoji}</span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{block.name}</span>
                        {hasTested && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                            Terverifikasi
                          </span>
                        )}
                      </h5>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {block.textureLabel}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    {hasTested ? (
                      <>
                        <span className={`font-bold block ${bDensity < 1 ? 'text-emerald-300' : 'text-amber-300'}`}>
                          {bDensity < 1 ? 'Terapung' : 'Tenggelam'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {bDensity.toFixed(2)} g/cm³
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic block">
                        ? Belum Diuji
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Golden Cognitive Lesson */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
            <strong className="text-xs text-cyan-300 font-bold block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kesimpulan Kognitif Konkret:</span>
            </strong>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Spons berukuran 1000 cm³ (raksasa) tetap <strong>terapung</strong> karena kerapatannya hanya 0.05 g/cm³. Sebaliknya, kubus besi kecil hanya 50 cm³ langsung <strong>tenggelam</strong> karena kerapatannya 7.8 g/cm³. <em>Kerapatan materi, bukan ukuran geometris, yang menentukan hukum fisika fluida!</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
