import React, { useState } from 'react';
import { Scale, ArrowRight, RotateCcw, CheckCircle2, Lightbulb, Sparkles, Activity } from 'lucide-react';
import { useLabTelemetry } from '../../engine/useLabTelemetry';
import { deriveEmpiricalEvidenceFromTelemetry } from '../../engine/empiricalEvidenceDerivation';
import { EmpiricalSimulationEvidence } from '../../engine/evidenceTriangulation';

interface BarModelAlgebraLabProps {
  onMasteryEvidence: (details: string) => void;
  onEmpiricalEvidence?: (evidence: EmpiricalSimulationEvidence) => void;
}

interface AlgebraStepSpec {
  expectedOp: 'subtract' | 'divide';
  expectedValue: number;
  promptLabel: string;
}

const STEPS: AlgebraStepSpec[] = [
  {
    expectedOp: 'subtract',
    expectedValue: 4,
    promptLabel: 'Langkah 1: Operasi apa yang menjaga neraca seimbang sekaligus melenyapkan +4?',
  },
  {
    expectedOp: 'divide',
    expectedValue: 2,
    promptLabel: 'Langkah 2: Operasi apa yang menyederhanakan 2x menjadi 1 buah x di ruas kiri?',
  },
];

export const BarModelAlgebraLab: React.FC<BarModelAlgebraLabProps> = ({
  onMasteryEvidence,
  onEmpiricalEvidence,
}) => {
  const telemetry = useLabTelemetry('bar_model');

  // Target equation: 2x + 4 = 14
  // Step 0: 2x + 4 = 14
  // Step 1: subtract 4 from both sides => 2x = 10
  // Step 2: divide both sides by 2 => x = 5
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [customXValue, setCustomXValue] = useState<number>(5);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);

  // Active operation choice
  const [proposedOp, setProposedOp] = useState<'subtract' | 'add' | 'divide' | 'multiply'>('subtract');
  const [proposedValue, setProposedValue] = useState<number>(1);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  // Left & right pan quantities for active step
  const leftXCount = currentStep === 2 ? 1 : 2;
  const leftUnits = currentStep === 0 ? 4 : 0;
  const rightUnits = currentStep === 0 ? 14 : currentStep === 1 ? 10 : 5;

  const leftTotalWeight = leftXCount * customXValue + leftUnits;
  const rightTotalWeight = rightUnits;
  const isBalanced = leftTotalWeight === rightTotalWeight;

  // Scale tilt calculation (-10 to +10 degrees)
  const diff = leftTotalWeight - rightTotalWeight;
  const tiltDegrees = Math.max(-12, Math.min(12, diff * 1.5));

  const handleSelectOp = (op: 'subtract' | 'add' | 'divide' | 'multiply') => {
    setProposedOp(op);
    telemetry.recordParameterChange('proposedOp', op);
  };

  const handleChangeValue = (val: number) => {
    const num = isNaN(val) ? 1 : Math.max(1, Math.min(20, val));
    setProposedValue(num);
    telemetry.recordParameterChange('proposedValue', num);
  };

  const handleApplyOperation = () => {
    const step = STEPS[currentStep];
    if (!step) return;

    const opMatches = proposedOp === step.expectedOp;
    const valueError = Math.abs(proposedValue - step.expectedValue);

    // Kesalahan jenis operasi = kesalahan struktural (bobot lebih berat).
    // Kesalahan nilai = kesalahan magnitudo (bobot lebih ringan, proporsional).
    const opPenalty = opMatches ? 0 : 0.6;
    const valuePenalty = Math.min(0.4, (valueError / Math.max(1, step.expectedValue)) * 0.4);
    const distance = Math.min(1, opPenalty + valuePenalty);
    const isCorrect = opMatches && valueError === 0;

    telemetry.recordVerificationAttempt(isCorrect, distance);

    if (isCorrect) {
      const next = currentStep + 1;
      setFeedback({
        ok: true,
        message: `Tepat! Menerapkan operasi ${proposedOp === 'subtract' ? 'kurang (-)' : proposedOp === 'divide' ? 'bagi (÷)' : proposedOp} ${proposedValue} di kedua sisi menjaga neraca tetap datar.`,
      });
      setCurrentStep(next);

      if (next >= STEPS.length) {
        setHasCompleted(true);
        const session = telemetry.finalizeSession();
        const evidence = deriveEmpiricalEvidenceFromTelemetry(session);
        if (onEmpiricalEvidence) onEmpiricalEvidence(evidence);
        onMasteryEvidence(
          `Menyelesaikan reduksi 2x + 4 = 14 (Akurasi: ${(evidence.accuracyScore * 100).toFixed(0)}%, Presisi: ${(evidence.manipulationPrecision * 100).toFixed(0)}%).`
        );
      }
    } else {
      setFeedback({
        ok: false,
        message: !opMatches
          ? `Operasi "${proposedOp === 'add' ? 'Tambah (+)' : proposedOp === 'multiply' ? 'Kali (×)' : proposedOp === 'divide' ? 'Bagi (÷)' : 'Kurang (-)'}" tidak pas di langkah ini. Perhatikan apa yang perlu dihilangkan dari kedua sisi neraca.`
          : `Jenis operasi sudah tepat, tetapi nilainya (${proposedValue}) belum pas. Nilai yang diperlukan untuk menjaga simetri adalah ${step.expectedValue}.`,
      });
    }
  };

  const handleReset = () => {
    telemetry.recordReset();
    setCurrentStep(0);
    setHasCompleted(false);
    setFeedback(null);
    setProposedOp('subtract');
    setProposedValue(1);
  };

  return (
    <div id="bar-model-lab-container" className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Lab Logika & Kesetaraan
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Bar Model ke Aljabar: Mengapa Dua Ruas Berubah Bersama?
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Prinsip WHY: <em>"Kita tidak memindahkan angka melompati gerbang gaib tanda (=). Kita menjaga neraca tetap seimbang dengan menerapkan operasi yang identik di kedua sisi."</em>
          </p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1 self-start md:self-auto transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Ulangi Eksperimen
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Balance Scale Visualizer */}
        <div className="lg:col-span-7 bg-[#0f1322] border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[440px]">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Status Neraca:</span>
            <span className={`px-2.5 py-1 rounded-full font-semibold ${isBalanced ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
              {isBalanced ? '⚖️ Seimbang Sempurna (=)' : '⚠️ Neraca Miring (≠)'}
            </span>
          </div>

          {/* Dynamic Mechanical Balance Rig (SVG) */}
          <div className="my-6 relative flex flex-col items-center">
            <svg viewBox="0 0 500 240" className="w-full max-w-md h-auto overflow-visible">
              {/* Central Pivot Stand */}
              <polygon points="250,90 235,210 265,210" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <rect x="200" y="210" width="100" height="15" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              <circle cx="250" cy="90" r="8" fill="#6366f1" />

              {/* Tilting Beam */}
              <g
                style={{
                  transformOrigin: '250px 90px',
                  transform: `rotate(${tiltDegrees}deg)`,
                  transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {/* Horizontal Beam */}
                <rect x="70" y="86" width="360" height="8" rx="4" fill="#475569" stroke="#64748b" strokeWidth="1" />

                {/* Left Pan Suspension Cables */}
                <line x1="100" y1="90" x2="100" y2="150" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M 60 150 Q 100 170 140 150 Z" fill="#1e293b" stroke="#6366f1" strokeWidth="2" />

                {/* Right Pan Suspension Cables */}
                <line x1="400" y1="90" x2="400" y2="150" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M 360 150 Q 400 170 440 150 Z" fill="#1e293b" stroke="#0ea5e9" strokeWidth="2" />
              </g>
            </svg>

            {/* Visual Contents of the Pans */}
            <div className="w-full flex justify-between px-8 -mt-16 z-10 text-xs">
              {/* Left Pan Contents */}
              <div className="w-40 bg-slate-900/90 border border-indigo-500/40 rounded-lg p-2.5 shadow-xl text-center space-y-1.5">
                <span className="text-[10px] text-indigo-300 font-mono block">Ruas Kiri</span>
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {Array.from({ length: leftXCount }).map((_, i) => (
                    <div key={`x-${i}`} className="w-8 h-8 rounded bg-indigo-600/80 border border-indigo-400 text-white font-bold flex items-center justify-center text-xs shadow">
                      x
                    </div>
                  ))}
                  {Array.from({ length: leftUnits }).map((_, i) => (
                    <div key={`u-${i}`} className="w-5 h-5 rounded bg-amber-500/30 border border-amber-400/60 text-amber-200 text-[10px] flex items-center justify-center font-mono">
                      1
                    </div>
                  ))}
                </div>
                <div className="text-[11px] font-mono text-slate-300">
                  {currentStep === 2 ? 'x' : (currentStep === 1 ? '2x' : '2x + 4')}
                </div>
              </div>

              {/* Right Pan Contents */}
              <div className="w-40 bg-slate-900/90 border border-sky-500/40 rounded-lg p-2.5 shadow-xl text-center space-y-1.5">
                <span className="text-[10px] text-sky-300 font-mono block">Ruas Kanan</span>
                <div className="flex flex-wrap items-center justify-center gap-1 max-h-16 overflow-y-auto">
                  {Array.from({ length: rightUnits }).map((_, i) => (
                    <div key={`ru-${i}`} className="w-5 h-5 rounded bg-sky-500/30 border border-sky-400/60 text-sky-200 text-[10px] flex items-center justify-center font-mono">
                      1
                    </div>
                  ))}
                </div>
                <div className="text-[11px] font-mono text-slate-300">
                  {rightUnits}
                </div>
              </div>
            </div>
          </div>

          {/* Synchronized Bar Model Representation */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Model Batang (Bar Model Visual):</span>
              <span className="text-[11px] font-mono text-indigo-300">Panjang Total Ekuivalen</span>
            </div>
            {/* Top Bar: 2x + 4 */}
            <div className="flex h-7 rounded overflow-hidden border border-indigo-500/40 text-[11px] font-mono text-white">
              {currentStep < 2 && (
                <>
                  <div className="flex-1 bg-indigo-600/70 border-r border-indigo-400/40 flex items-center justify-center">x</div>
                  <div className="flex-1 bg-indigo-600/70 border-r border-indigo-400/40 flex items-center justify-center">x</div>
                </>
              )}
              {currentStep === 2 && (
                <div className="flex-1 bg-indigo-600/90 flex items-center justify-center font-bold">x = 5</div>
              )}
              {currentStep === 0 && (
                <div className="w-16 bg-amber-500/50 flex items-center justify-center text-amber-200">+4</div>
              )}
            </div>
            {/* Bottom Bar: 14 */}
            <div className="flex h-7 rounded overflow-hidden border border-sky-500/40 text-[11px] font-mono text-white">
              <div className="w-full bg-sky-600/60 flex items-center justify-center font-bold">
                {rightUnits}
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-step Transformation Controller */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0f1322] border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Derivasi Langkah Demi Langkah</span>
            </h4>

            {/* Active Operation Selector & Step Workspace */}
            {currentStep < STEPS.length ? (
              <div className="p-4 rounded-xl border border-indigo-500/40 bg-indigo-950/30 space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-200">
                    Tantangan Langkah {currentStep + 1} dari {STEPS.length}
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {currentStep === 0 ? '2x + 4 = 14' : '2x = 10'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {STEPS[currentStep].promptLabel}
                </p>

                {/* Operation Picker */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                    1. Pilih Jenis Operasi Simetris di Kedua Sisi:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      id="op-subtract-btn"
                      type="button"
                      onClick={() => handleSelectOp('subtract')}
                      className={`py-2 px-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition ${
                        proposedOp === 'subtract'
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>Kurangi (-)</span>
                    </button>
                    <button
                      id="op-add-btn"
                      type="button"
                      onClick={() => handleSelectOp('add')}
                      className={`py-2 px-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition ${
                        proposedOp === 'add'
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>Tambah (+)</span>
                    </button>
                    <button
                      id="op-divide-btn"
                      type="button"
                      onClick={() => handleSelectOp('divide')}
                      className={`py-2 px-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition ${
                        proposedOp === 'divide'
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>Bagi (÷)</span>
                    </button>
                    <button
                      id="op-multiply-btn"
                      type="button"
                      onClick={() => handleSelectOp('multiply')}
                      className={`py-2 px-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition ${
                        proposedOp === 'multiply'
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>Kali (×)</span>
                    </button>
                  </div>
                </div>

                {/* Magnitude Input */}
                <div>
                  <div className="flex justify-between items-center text-[11px] mb-1.5">
                    <label className="text-slate-400 font-medium">2. Masukkan Angka Besaran:</label>
                    <span className="font-mono text-cyan-300 font-bold text-xs">{proposedValue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="proposed-value-slider"
                      type="range"
                      min="1"
                      max="14"
                      step="1"
                      value={proposedValue}
                      onChange={(e) => handleChangeValue(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                    <input
                      id="proposed-value-input"
                      type="number"
                      min="1"
                      max="20"
                      value={proposedValue}
                      onChange={(e) => handleChangeValue(parseInt(e.target.value, 10))}
                      className="w-14 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  id="apply-algebra-op-btn"
                  type="button"
                  onClick={handleApplyOperation}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                >
                  <span>Terapkan Operasi Ini ({proposedOp === 'subtract' ? '-' : proposedOp === 'add' ? '+' : proposedOp === 'divide' ? '÷' : '×'} {proposedValue})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-emerald-100 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Solusi Kesetaraan Terbukti: x = 5</span>
                </div>
                <p className="text-[11px] text-emerald-200/90">
                  Nilai x = 5 telah terbukti secara logis melalui dua transformasi simetris tanpa menghafal aturan mekanis.
                </p>
              </div>
            )}

            {/* Diagnostic Feedback */}
            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-fade-in ${
                  feedback.ok
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                {feedback.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Activity className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Step Progress Checklist */}
            <div className="space-y-2 text-xs">
              <div className={`p-2.5 rounded-lg border flex items-center justify-between ${currentStep > 0 ? 'bg-slate-900/60 border-emerald-500/40 text-emerald-300' : 'bg-slate-900/30 border-slate-800 text-slate-400'}`}>
                <span>Langkah 1: Menghilangkan +4 dengan -4 di kedua ruas</span>
                <span className="font-mono text-[11px]">{currentStep > 0 ? '✓ Selesai' : 'Belum'}</span>
              </div>
              <div className={`p-2.5 rounded-lg border flex items-center justify-between ${currentStep > 1 ? 'bg-slate-900/60 border-emerald-500/40 text-emerald-300' : 'bg-slate-900/30 border-slate-800 text-slate-400'}`}>
                <span>Langkah 2: Menghilangkan koefisien 2 dengan ÷2 di kedua ruas</span>
                <span className="font-mono text-[11px]">{currentStep > 1 ? '✓ Selesai' : 'Belum'}</span>
              </div>
            </div>

            {hasCompleted && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-200 text-xs flex items-start gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-300 font-semibold">Bukti Penalaran Terverifikasi:</strong>
                  <span>Kamu memahami prinsip simetri aljabar. Bukan aturan hafalan kaku, melainkan perlindungan hukum kesetaraan.</span>
                </div>
              </div>
            )}
          </div>

          {/* Socratic WHY-First Explanation Box */}
          <div className="bg-[#121626] border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold">
              <Lightbulb className="w-4 h-4" />
              <span>Mengapa Buku Sekolah Mengatakan "Pindah Ruas"?</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              "Pindah ruas" adalah singkatan praktis para juru tulis abad ke-16. Namun jika anak hanya menghafal kata itu tanpa memahami neraca, saat bertemu rumus seperti <code className="text-cyan-300">3x = 12</code>, mereka sering bingung apakah 3 harus dikurang atau dibagi. Dengan melihat neraca, kamu tahu 3x harus dibagi 3!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
