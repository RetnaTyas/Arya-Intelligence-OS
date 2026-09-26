// ============================================================================
// ⚠️ EKSPERIMEN PARALEL OUT-OF-SEQUENCE (DI LUAR JALUR UTAMA TAHAP 1)
// Rujukan: docs/architecture/KNOWN_ISSUES.md (Temuan 6) & intelligence-os-foundation.md Bagian 12
// Status: Eksperimen riset paralel (Domain Logika & Kesetaraan Relasional).
// CATATAN DISIPLIN: Modul ini TIDAK dihitung dalam pemenuhan Gerbang Tahap 1 & Tahap 2.
// Domain Aktif Resmi Tahap 1: Matematika Sempit (Pecahan → Persamaan Linear: narrowMathDomain.ts)
// ============================================================================

import React, { useState } from 'react';
import {
  GitCommit,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Link,
  ArrowRight,
  ShieldCheck,
  Scale,
  Brain,
  Activity,
} from 'lucide-react';
import { useLabTelemetry } from '../../engine/useLabTelemetry';
import { deriveEmpiricalEvidenceFromTelemetry } from '../../engine/empiricalEvidenceDerivation';
import { EmpiricalSimulationEvidence } from '../../engine/evidenceTriangulation';

interface CausalLogicLabProps {
  onMasteryEvidence: (details: string) => void;
  onEmpiricalEvidence?: (evidence: EmpiricalSimulationEvidence) => void;
}

export const CausalLogicLab: React.FC<CausalLogicLabProps> = ({
  onMasteryEvidence,
  onEmpiricalEvidence,
}) => {
  // Telemetry Engine
  const telemetry = useLabTelemetry('causal_logic');

  // Scenario 1: Transitive property (A = B and B = C => A = C)
  // Scenario 2: Bilateral symmetry (A = B <=> B = A)
  // Scenario 3: Non-destructive transformation (f(A) = f(B))
  const [selectedProperty, setSelectedProperty] = useState<'transitive' | 'symmetric' | 'invariant'>('transitive');
  
  // Transitive chain states
  const [weightA, setWeightA] = useState<number>(12);
  const [termB1, setTermB1] = useState<number>(7);
  const [termB2, setTermB2] = useState<number>(5); // 7 + 5 = 12
  const [termC1, setTermC1] = useState<number>(3);
  const [termC2, setTermC2] = useState<number>(4); // multiplier or 3 * 4 = 12
  const [transitiveFeedback, setTransitiveFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  
  // Symmetry demo
  const [flippedSymmetry, setFlippedSymmetry] = useState<boolean>(false);

  // Helper for generating dynamic transfer test instances (v2 architecture)
  const generateRandomPair = () => {
    const a = Math.floor(Math.random() * 8) + 2; // 2..9
    const b = Math.floor(Math.random() * 8) + 2; // 2..9
    return { a, b, sum: a + b };
  };

  // Transfer test states for Symmetric mode
  const [transferPair, setTransferPair] = useState(() => generateRandomPair());
  const [transferAnswer, setTransferAnswer] = useState<number | ''>('');
  const [transferChecked, setTransferChecked] = useState<boolean>(false);
  const [transferFeedback, setTransferFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  // Invariant transformation operator
  const [invariantOp, setInvariantOp] = useState<number>(0); // e.g. +3 on both sides

  // Predict-before-reveal states for Invariant mode
  const [predictedResult, setPredictedResult] = useState<number | ''>('');
  const [hasPredicted, setHasPredicted] = useState<boolean>(false);
  const [predictionFeedback, setPredictionFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const [hasVerifiedTransitive, setHasVerifiedTransitive] = useState<boolean>(false);
  const [hasVerifiedSymmetric, setHasVerifiedSymmetric] = useState<boolean>(false);
  const [hasVerifiedInvariant, setHasVerifiedInvariant] = useState<boolean>(false);

  const weightB = termB1 + termB2;
  const weightC = termC1 * termC2;

  const isABEqual = weightA === weightB;
  const isBCEqual = weightB === weightC;
  const isACEqual = weightA === weightC;

  const handleTestTransitive = () => {
    const isCorrect = isABEqual && isBCEqual;
    const distance = Math.min(
      1.0,
      (Math.abs(weightA - weightB) + Math.abs(weightB - weightC)) / Math.max(1, weightA)
    );
    telemetry.recordVerificationAttempt(isCorrect, distance);

    if (isCorrect) {
      setHasVerifiedTransitive(true);
      setTransitiveFeedback({
        ok: true,
        message: `Rantai transitif terbukti valid! Wadah A (${weightA}) = Wadah B (${weightB}) = Wadah C (${weightC}). Maka A = C mutlak!`,
      });
      const session = telemetry.finalizeSession();
      const evidence = deriveEmpiricalEvidenceFromTelemetry(session);
      if (onEmpiricalEvidence) onEmpiricalEvidence(evidence);

      onMasteryEvidence(
        `Membuktikan sifat transitif relasional kesetaraan: Karena Wadah A (nilai ${weightA}) identik dengan Wadah B (${termB1} + ${termB2}), dan Wadah B identik dengan Wadah C (${termC1} × ${termC2}), maka secara mutlak Wadah A identik dengan Wadah C tanpa kalkulasi ulang (Akurasi: ${(evidence.accuracyScore * 100).toFixed(0)}%, Presisi: ${(evidence.manipulationPrecision * 100).toFixed(0)}%).`
      );
    } else {
      setTransitiveFeedback({
        ok: false,
        message: `Rantai kesetaraan belum terhubung sempurna. Pastikan A = B (${weightA} vs ${weightB}) DAN B = C (${weightB} vs ${weightC}) sebelum menyimpulkan A = C.`,
      });
    }
  };

  const handleFlipSymmetry = () => {
    const nextFlipped = !flippedSymmetry;
    setFlippedSymmetry(nextFlipped);
    // Demonstrasi murni — TIDAK lagi dicatat sebagai verification_attempt.
    // Dicatat sebagai parameter_change untuk analisis keterlibatan eksplorasi:
    telemetry.recordParameterChange('symmetry_flip_toggle', nextFlipped);
  };

  const handleCheckTransfer = () => {
    if (transferAnswer === '') return;
    const isCorrect = Number(transferAnswer) === transferPair.sum;
    const distance = Math.min(
      1,
      Math.abs(Number(transferAnswer) - transferPair.sum) / Math.max(1, transferPair.sum)
    );
    telemetry.recordVerificationAttempt(isCorrect, distance);
    setTransferChecked(true);

    if (isCorrect) {
      setHasVerifiedSymmetric(true);
      setTransferFeedback({
        ok: true,
        message: `Tepat sekali! Membalik posisi ruas (${transferPair.sum} = ${transferPair.a} + ${transferPair.b}) mempertahankan kesetaraan secara absolut.`,
      });
      const session = telemetry.finalizeSession();
      const evidence = deriveEmpiricalEvidenceFromTelemetry(session);
      if (onEmpiricalEvidence) onEmpiricalEvidence(evidence);
      onMasteryEvidence(
        `Memverifikasi transfer sifat simetri pada kasus baru (${transferPair.a} + ${transferPair.b} = ${transferPair.sum}) tanpa dituntun contoh sebelumnya (Akurasi: ${(evidence.accuracyScore * 100).toFixed(0)}%, Presisi: ${(evidence.manipulationPrecision * 100).toFixed(0)}%).`
      );
    } else {
      setTransferFeedback({
        ok: false,
        message: `Jawabanmu ${transferAnswer} belum setara dengan ${transferPair.a} + ${transferPair.b} (${transferPair.sum}). Diberikan ronde baru dengan angka berbeda!`,
      });
      // Beri ronde baru dengan angka berbeda supaya tidak bisa dihafal
      setTransferPair(generateRandomPair());
      setTransferAnswer('');
    }
  };

  const handleApplyInvariant = (delta: number) => {
    const nextVal = invariantOp + delta;
    setInvariantOp(nextVal);
    setHasPredicted(false); // wajib prediksi ulang sebelum hasil baru terungkap
    setPredictionFeedback(null);
    telemetry.recordParameterChange('invariantOp', nextVal);
  };

  const handleCheckPrediction = () => {
    if (predictedResult === '') return;
    const actual = 8 + invariantOp;
    const error = Math.abs(Number(predictedResult) - actual);
    const distance = Math.min(1, error / Math.max(1, Math.abs(actual)));
    const isCorrect = Number(predictedResult) === actual;

    telemetry.recordVerificationAttempt(isCorrect, distance);
    setHasPredicted(true);

    if (isCorrect) {
      setHasVerifiedInvariant(true);
      setPredictionFeedback({
        ok: true,
        message: `Luar biasa! Prediksimu (${predictedResult}) terbukti persis sama dengan hasil neraca (${actual}).`,
      });
      const session = telemetry.finalizeSession();
      const evidence = deriveEmpiricalEvidenceFromTelemetry(session);
      if (onEmpiricalEvidence) onEmpiricalEvidence(evidence);
      onMasteryEvidence(
        `Membuktikan invarian kesetaraan dengan memprediksi hasil (${actual}) sebelum sistem menampilkannya (Akurasi: ${(evidence.accuracyScore * 100).toFixed(0)}%, Presisi: ${(evidence.manipulationPrecision * 100).toFixed(0)}%).`
      );
    } else {
      setPredictionFeedback({
        ok: false,
        message: `Prediksimu ${predictedResult} belum tepat. Perhatikan operasi di kedua ruas: 8 ${invariantOp >= 0 ? `+ ${invariantOp}` : `- ${Math.abs(invariantOp)}`} = ${actual}.`,
      });
    }
  };

  return (
    <div id="causal-logic-lab-container" className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Domain Logika & Kausal
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Lab Kesetaraan Relasional & Rantai Kausalitas (Simpul: node-equality)
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Prinsip WHY: <em>"Tanda sama dengan (=) bukan tombol hitung kalkulator, melainkan pernyataan relasi keadaan setara yang menghubungkan dua realitas."</em>
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setSelectedProperty('transitive')}
            className={`px-3 py-1 rounded transition ${
              selectedProperty === 'transitive'
                ? 'bg-cyan-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rantai Transitif (A=B=C)
          </button>
          <button
            onClick={() => setSelectedProperty('symmetric')}
            className={`px-3 py-1 rounded transition ${
              selectedProperty === 'symmetric'
                ? 'bg-cyan-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Simetri Relasi
          </button>
          <button
            onClick={() => setSelectedProperty('invariant')}
            className={`px-3 py-1 rounded transition ${
              selectedProperty === 'invariant'
                ? 'bg-cyan-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Transformasi Invarian
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      {selectedProperty === 'transitive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Visual 3-Node Transitive Chain */}
          <div className="lg:col-span-8 bg-[#0d121f] border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-4">
                <span className="text-slate-400">Verifikasi Rantai Kausalitas Relasional:</span>
                <span className={`px-2.5 py-1 rounded-full font-semibold ${
                  isABEqual && isBCEqual
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {isABEqual && isBCEqual ? '⚖️ Rantai Logika Koheren (A = C)' : '⚠️ Rantai Terputus (≠)'}
                </span>
              </div>

              {/* Graphical Nodes Bridge */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center my-6">
                {/* Node A */}
                <div className={`p-4 rounded-xl border transition-all ${
                  isABEqual ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-950/50' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span className="font-bold text-cyan-300">Entitas A</span>
                    <span className="font-mono text-[11px]">Nilai Tunggal</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white text-center py-3">
                    {weightA}
                  </div>
                  <div className="text-[10px] text-center text-slate-400 font-mono">
                    Bobot Statis: {weightA} unit
                  </div>
                </div>

                {/* Relational Link 1 */}
                <div className="hidden md:flex flex-col items-center justify-center">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isABEqual ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {isABEqual ? '= (SAMA DENGAN)' : '≠ (TIDAK SAMA)'}
                  </span>
                  <div className={`h-0.5 w-full my-2 ${isABEqual ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </div>

                {/* Node B */}
                <div className={`p-4 rounded-xl border transition-all ${
                  isABEqual && isBCEqual ? 'bg-indigo-950/40 border-indigo-500/50' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span className="font-bold text-indigo-300">Entitas B</span>
                    <span className="font-mono text-[11px]">Bentuk Penjumlahan</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white text-center py-3">
                    {termB1} + {termB2} = <span className="text-indigo-300">{weightB}</span>
                  </div>
                  <div className="text-[10px] text-center text-slate-400 font-mono">
                    Representasi Komposit
                  </div>
                </div>

                {/* Relational Link 2 */}
                <div className="hidden md:flex flex-col items-center justify-center md:col-start-2">
                  <div className={`h-0.5 w-full my-2 ${isBCEqual ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isBCEqual ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {isBCEqual ? '= (SAMA DENGAN)' : '≠ (TIDAK SAMA)'}
                  </span>
                </div>

                {/* Node C */}
                <div className={`p-4 rounded-xl border transition-all md:col-start-3 ${
                  isBCEqual && isACEqual ? 'bg-purple-950/40 border-purple-500/50' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span className="font-bold text-purple-300">Entitas C</span>
                    <span className="font-mono text-[11px]">Bentuk Perkalian</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white text-center py-3">
                    {termC1} × {termC2} = <span className="text-purple-300">{weightC}</span>
                  </div>
                  <div className="text-[10px] text-center text-slate-400 font-mono">
                    Representasi Faktorial
                  </div>
                </div>
              </div>
            </div>

            {/* Logical Deduction Box */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Kesimpulan Logika:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  Jika A = B ({weightA} = {weightB}) dan B = C ({weightB} = {weightC}) ➔ Maka A = C ({weightA} = {weightC})
                </span>
              </div>
              <button
                id="test-transitive-btn"
                onClick={handleTestTransitive}
                className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow transition active:scale-95"
              >
                Uji Rantai Kesetaraan
              </button>
            </div>

            {/* Transitive Feedback */}
            {transitiveFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-fade-in ${
                  transitiveFeedback.ok
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                {transitiveFeedback.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Activity className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{transitiveFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Controls for Adjusting Terms */}
          <div className="lg:col-span-4 bg-[#0f1424] border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span>Manipulasi Parameter Entitas</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Nilai Entitas A:</span>
                  <span className="text-cyan-300 font-mono font-bold">{weightA}</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="24"
                  value={weightA}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setWeightA(val);
                    telemetry.recordParameterChange('weightA', val);
                  }}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Pecahan B1 + B2:</span>
                  <span className="text-indigo-300 font-mono font-bold">{termB1} + {termB2} = {weightB}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={termB1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTermB1(val);
                      telemetry.recordParameterChange('termB1', val);
                    }}
                    className="w-full accent-indigo-400"
                  />
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={termB2}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTermB2(val);
                      telemetry.recordParameterChange('termB2', val);
                    }}
                    className="w-full accent-indigo-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Faktor C1 × C2:</span>
                  <span className="text-purple-300 font-mono font-bold">{termC1} × {termC2} = {weightC}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={termC1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTermC1(val);
                      telemetry.recordParameterChange('termC1', val);
                    }}
                    className="w-full accent-purple-400"
                  />
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={termC2}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTermC2(val);
                      telemetry.recordParameterChange('termC2', val);
                    }}
                    className="w-full accent-purple-400"
                  />
                </div>
              </div>
            </div>

            {hasVerifiedTransitive && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bukti Penalaran Transitif Tersimpan ke Telemetri!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Symmetric Mode */}
      {selectedProperty === 'symmetric' && (
        <div className="bg-[#0d121f] border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="max-w-xl mx-auto text-center space-y-2">
            <h4 className="text-base font-bold text-white">Sifat Simetri Kesetaraan: A = B ekuivalen mutlak dengan B = A</h4>
            <p className="text-xs text-slate-300">
              Di sekolah tradisional, anak sering bingung ketika melihat <code className="text-amber-300">10 = x + 3</code> dibanding <code className="text-amber-300">x + 3 = 10</code> karena mengira ruas kiri adalah input dan ruas kanan adalah hasil. Kesetaraan bersifat bilateral simetris!
            </p>
          </div>

          {/* Pure Visual Demonstration (Eksplorasi) */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-6">
            <div className={`p-6 rounded-2xl border text-center transition-all min-w-[200px] ${
              flippedSymmetry ? 'bg-indigo-950/60 border-indigo-500/60' : 'bg-cyan-950/60 border-cyan-500/60'
            }`}>
              <span className="text-[11px] text-slate-400 font-mono block mb-1">Ruas Kiri</span>
              <span className="text-3xl font-mono font-bold text-white">
                {flippedSymmetry ? '3 + 7' : '10'}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-teal-400">=</span>
              <button
                id="flip-symmetry-btn"
                type="button"
                onClick={handleFlipSymmetry}
                className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition border border-slate-700 shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Putar Ruas (Swap Sides)</span>
              </button>
            </div>

            <div className={`p-6 rounded-2xl border text-center transition-all min-w-[200px] ${
              flippedSymmetry ? 'bg-cyan-950/60 border-cyan-500/60' : 'bg-indigo-950/60 border-indigo-500/60'
            }`}>
              <span className="text-[11px] text-slate-400 font-mono block mb-1">Ruas Kanan</span>
              <span className="text-3xl font-mono font-bold text-white">
                {flippedSymmetry ? '10' : '3 + 7'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 max-w-xl mx-auto text-xs text-center">
            <span className="text-slate-300">
              Demonstrasi: Hubungan relasional tidak terpengaruh oleh orientasi spasial kiri atau kanan.
            </span>
          </div>

          {/* Genuine Transfer Test (Layer 5 Verify: Instance Baru yang Bisa Salah) */}
          <div className="max-w-xl mx-auto p-5 bg-indigo-950/30 border border-indigo-500/40 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                  Uji Transfer Simetri (Kasus Baru Tanpa Panduan)
                </h5>
              </div>
              <span className="text-[11px] font-mono text-cyan-300">Ronde Acak</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Jika diketahui <span className="font-mono text-amber-300 font-bold">{transferPair.a} + {transferPair.b} = {transferPair.sum}</span>, berapa nilai ruas kanan jika posisinya dibalik menjadi <span className="font-mono text-cyan-300 font-bold">{transferPair.sum} = ?</span>
            </p>

            <div className="flex items-center gap-2">
              <input
                id="transfer-answer-input"
                type="number"
                placeholder="Tulis nilainya..."
                value={transferAnswer}
                onChange={(e) => setTransferAnswer(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-400"
              />
              <button
                id="check-transfer-btn"
                type="button"
                onClick={handleCheckTransfer}
                disabled={transferAnswer === ''}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition disabled:opacity-40"
              >
                Cek Jawaban
              </button>
            </div>

            {transferFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-fade-in ${
                  transferFeedback.ok
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                {transferFeedback.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Activity className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{transferFeedback.message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invariant Transformation Mode */}
      {selectedProperty === 'invariant' && (
        <div className="bg-[#0d121f] border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="max-w-xl mx-auto text-center space-y-2">
            <h4 className="text-base font-bold text-white">Invariansi Kesetaraan terhadap Operasi Bersama</h4>
            <p className="text-xs text-slate-300">
              Jika sebuah persamaan ditransformasikan dengan menambahkan atau mengurangkan kuantitas yang sama persis di kedua sisi, nilai kebenarannya tidak pernah berubah.
            </p>
          </div>

          {/* Interactive Balance Simulation (Predict-Before-Reveal) */}
          <div className="max-w-2xl mx-auto p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex justify-between items-center text-xs font-mono">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center flex-1 mr-2">
                <span className="text-slate-400 block text-[10px]">Ruas Kiri:</span>
                <div className="text-base font-bold text-cyan-300 font-mono mt-1">
                  8 {invariantOp !== 0 && (invariantOp > 0 ? `+ ${invariantOp}` : `- ${Math.abs(invariantOp)}`)} ={' '}
                  {hasPredicted ? (
                    <span className="text-emerald-300">{8 + invariantOp}</span>
                  ) : (
                    <span className="text-amber-300 italic text-xs">[Terkunci: Prediksi Dulu]</span>
                  )}
                </div>
              </div>

              <span className="text-xl font-bold text-teal-400 px-3">=</span>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center flex-1 ml-2">
                <span className="text-slate-400 block text-[10px]">Ruas Kanan:</span>
                <div className="text-base font-bold text-indigo-300 font-mono mt-1">
                  (5 + 3) {invariantOp !== 0 && (invariantOp > 0 ? `+ ${invariantOp}` : `- ${Math.abs(invariantOp)}`)} ={' '}
                  {hasPredicted ? (
                    <span className="text-emerald-300">{8 + invariantOp}</span>
                  ) : (
                    <span className="text-amber-300 italic text-xs">[Terkunci: Prediksi Dulu]</span>
                  )}
                </div>
              </div>
            </div>

            {/* Invariant Operation Exploratory Controls */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                id="invariant-minus-2-btn"
                type="button"
                onClick={() => handleApplyInvariant(-2)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs font-mono transition"
              >
                Kurangi 2 dari Kedua Sisi
              </button>
              <button
                id="invariant-reset-btn"
                type="button"
                onClick={() => handleApplyInvariant(-invariantOp)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-400 text-xs font-mono transition"
              >
                Reset (0)
              </button>
              <button
                id="invariant-plus-5-btn"
                type="button"
                onClick={() => handleApplyInvariant(5)}
                className="px-3 py-1.5 bg-cyan-900/60 hover:bg-cyan-800/60 border border-cyan-500/40 rounded text-cyan-200 text-xs font-mono font-bold transition"
              >
                Tambah 5 ke Kedua Sisi
              </button>
            </div>

            {/* Predict-Before-Reveal Verification Step */}
            <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-200">
                  Uji Prediksi Kausal (Predict-Before-Reveal):
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Operasi aktif: {invariantOp >= 0 ? `+${invariantOp}` : invariantOp}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Sebelum sistem membuka hasil timbangan, menurutmu berapa nilai akhir kedua ruas setelah operasi ini?
              </p>
              <div className="flex items-center gap-2">
                <input
                  id="predicted-result-input"
                  type="number"
                  placeholder="Hasil prediksimu..."
                  value={predictedResult}
                  onChange={(e) => setPredictedResult(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  id="check-prediction-btn"
                  type="button"
                  onClick={handleCheckPrediction}
                  disabled={predictedResult === ''}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg transition disabled:opacity-40"
                >
                  Cek Prediksi
                </button>
              </div>

              {predictionFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-fade-in ${
                    predictionFeedback.ok
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}
                >
                  {predictionFeedback.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Activity className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{predictionFeedback.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
