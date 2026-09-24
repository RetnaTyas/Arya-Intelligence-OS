import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  Compass,
  ArrowRight,
  Zap,
  Activity,
  Sparkles,
  Layers,
  Scale,
  Brain,
} from 'lucide-react';
import { runAllEpistemicTests } from '../../tests/epistemic-os-tester';
import {
  getAutomatedStealthRepairAction,
  applyStealthRepairResolution,
  calculateDeterministicEpistemicDebt,
} from '../engine/deterministicCore';
import { KnowledgeNode, LearnerNodeState } from '../types';

interface EpistemicAutomatedTesterProps {
  nodes: KnowledgeNode[];
  learnerNodes: Record<string, LearnerNodeState>;
  onNavigateToStealthProject?: (labId: string) => void;
  onApplyStealthResolution?: (nodeId: string) => void;
}

export const EpistemicAutomatedTester: React.FC<EpistemicAutomatedTesterProps> = ({
  nodes,
  learnerNodes,
  onNavigateToStealthProject,
  onApplyStealthResolution,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testOutcome, setTestOutcome] = useState<ReturnType<typeof runAllEpistemicTests> | null>(null);
  const [selectedSuiteFilter, setSelectedSuiteFilter] = useState<string>('all');

  // Live Automated Action state
  const [simulatedStates, setSimulatedStates] = useState<Record<string, LearnerNodeState>>(learnerNodes);
  const [liveAction, setLiveAction] = useState(() => getAutomatedStealthRepairAction(nodes, learnerNodes));

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const outcome = runAllEpistemicTests();
      setTestOutcome(outcome);
      setIsRunning(false);
    }, 450);
  };

  const handleSimulateHighDebt = () => {
    const targetNodeId = 'node-symbolic-algebra';
    const current = simulatedStates[targetNodeId] || {
      nodeId: targetNodeId,
      mastery: { recognition: 0.8, recall: 0.7, understanding: 0.7, application: 0.6, transfer: 0.5, explanation: 0.5, creation: 0.3 },
      decayRate: 0.02,
      confidence: 'medium',
      evidenceCount: 3,
      lastInteracted: new Date().toISOString(),
      activeMisconceptions: [],
    };

    const decayed: LearnerNodeState = {
      ...current,
      decayRate: 0.16, // High decay triggers bottleneck (centrality >= 0.70 & decay >= 0.10)
      isBottleneck: true,
      lastInteracted: '2029-01-01',
    };

    const updated = {
      ...simulatedStates,
      [targetNodeId]: decayed,
    };
    setSimulatedStates(updated);
    setLiveAction(getAutomatedStealthRepairAction(nodes, updated));
  };

  const handleApplyLiveRepair = () => {
    if (!liveAction.targetNodeId) return;
    const current = simulatedStates[liveAction.targetNodeId];
    if (!current) return;

    const resolved = applyStealthRepairResolution(current);
    const updated = {
      ...simulatedStates,
      [liveAction.targetNodeId]: resolved,
    };
    setSimulatedStates(updated);
    setLiveAction(getAutomatedStealthRepairAction(nodes, updated));

    if (onApplyStealthResolution) {
      onApplyStealthResolution(liveAction.targetNodeId);
    }
  };

  const filteredResults = testOutcome
    ? testOutcome.results.filter((r) => selectedSuiteFilter === 'all' || r.suite.includes(selectedSuiteFilter))
    : [];

  return (
    <div id="epistemic-automated-tester-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0b101c] border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tester Khusus Epistemik & Aksi Otomatis</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Audit Kontrak Peta Jalan (Tahap 0 — 5)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              Rangkaian Pengujian Otomatis Sistem (Automated Epistemic Test Suite)
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Memverifikasi secara deterministik dan non-teatrikal: validitas DAG graf, ketahanan 4-probe hipotesis pusat (L0/L1/L2), perisai noise triangulasi, serta <strong className="text-cyan-300">aksi pengalihan otomatis (repair loop rerouting)</strong> saat terdeteksi peluruhan memori.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-run-all-epistemic-tests"
              onClick={handleRunTests}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg shadow-cyan-900/30 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Menjalankan Tes...' : 'Jalankan Semua 17 Pengujian'}
            </button>
          </div>
        </div>

        {/* Test Summary Cards */}
        {testOutcome && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Total Pengujian</div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">{testOutcome.total} Kasus</div>
            </div>
            <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30">
              <div className="text-[10px] uppercase font-mono text-emerald-400">Status Lolos</div>
              <div className="text-xl font-bold text-emerald-300 font-mono mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" />
                <span>{testOutcome.passed} Lolos</span>
              </div>
            </div>
            <div className="bg-rose-950/20 p-3 rounded-xl border border-rose-500/30">
              <div className="text-[10px] uppercase font-mono text-rose-400">Status Gagal</div>
              <div className="text-xl font-bold text-rose-300 font-mono mt-0.5 flex items-center gap-1.5">
                {testOutcome.failed === 0 ? (
                  <span className="text-slate-400 text-sm font-sans font-normal">Nol Gagal</span>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>{testOutcome.failed} Gagal</span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-cyan-950/20 p-3 rounded-xl border border-cyan-500/30">
              <div className="text-[10px] uppercase font-mono text-cyan-400">Integritas Sistem</div>
              <div className="text-xl font-bold text-cyan-300 font-mono mt-0.5">
                {((testOutcome.passed / testOutcome.total) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION: AKSI OTOMATIS STEALTH REPAIR LOOP (PENYELESAIAN TEMUAN AUDIT) */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0c1424] to-slate-950 border border-teal-500/40 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Aksi Otomatis: Dispatcher Stealth Repair Loop (Peta Jalan Tahap 4)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Menguji apakah hasil pengukuran matematis (Decay & Utang Epistemik) benar-benar memicu aksi pengalihan otomatis ke lab proyek nyata.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateHighDebt}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Simulasikan Peluruhan 16% (Memicu Utang Kritis)
            </button>
            <button
              onClick={handleApplyLiveRepair}
              disabled={!liveAction.actionRequired}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Terapkan Resolusi Stealth (Decay → 0%)
            </button>
          </div>
        </div>

        {/* Live Action Dispatch Box */}
        <div className={`p-4 rounded-xl border transition ${
          liveAction.actionRequired
            ? 'bg-amber-950/30 border-amber-500/50 text-amber-100'
            : 'bg-slate-950/60 border-slate-800 text-slate-300'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                  liveAction.actionRequired
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {liveAction.actionRequired ? '⚡ INTERVENSI OTOMATIS AKTIF' : '✓ STATUS STABIL (TANPA INTERVENSI)'}
                </span>
                {liveAction.targetNodeName && (
                  <span className="text-xs text-white font-medium">
                    Target Konsep: <strong className="text-cyan-300">{liveAction.targetNodeName}</strong>
                  </span>
                )}
                {liveAction.decayRate > 0 && (
                  <span className="text-xs text-amber-300 font-mono">
                    Decay: {(liveAction.decayRate * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                {liveAction.rationale}
              </p>
              {liveAction.actionRequired && (
                <div className="text-[11px] text-teal-300 font-mono flex items-center gap-2 pt-1">
                  <span>Misi Terjadwal:</span>
                  <span className="bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/30">
                    {liveAction.pedagogicalDirectives.stealthContext}
                  </span>
                </div>
              )}
            </div>

            {liveAction.actionRequired && onNavigateToStealthProject && (
              <button
                onClick={() => onNavigateToStealthProject(liveAction.targetLabId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md flex items-center gap-2 shrink-0 transition"
              >
                <span>Buka Lab Proyek ({liveAction.targetLabId})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs for Test Results */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <span className="text-xs text-slate-400 font-medium mr-2">Filter Suite:</span>
        {[
          { id: 'all', label: 'Semua Suite (17)' },
          { id: 'Suite 1', label: 'Tahap 1: Graf & DAG' },
          { id: 'Suite 2', label: 'Tahap 2: 4-Probe Benchmark' },
          { id: 'Suite 3', label: 'Tahap 3: Triangulasi & Gating' },
          { id: 'Suite 4', label: 'Tahap 4: Decay & Aksi Otomatis' },
          { id: 'Suite 5', label: 'Tahap 5: Dynamic Telemetry' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedSuiteFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedSuiteFilter === tab.id
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Test Results Table / Cards */}
      <div className="space-y-2.5">
        {!testOutcome ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center space-y-3">
            <Cpu className="w-10 h-10 text-cyan-500/50 mx-auto" />
            <div className="text-sm font-bold text-slate-300">Rangkaian Pengujian Belum Dijalankan</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Klik tombol "Jalankan Semua 17 Pengujian" di atas untuk mengeksekusi pemeriksaan menyeluruh terhadap seluruh modul epistemik deterministik.
            </p>
          </div>
        ) : (
          filteredResults.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                item.passed
                  ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  : 'bg-rose-950/20 border-rose-500/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`p-1 rounded-full ${item.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {item.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400">{item.suite}</span>
                  <span className="text-slate-600">•</span>
                  <strong className="text-xs text-white font-semibold">{item.name}</strong>
                </div>
                <div className="text-xs text-slate-300 pl-6 font-mono">
                  ↳ {item.measurement}
                </div>
                {item.error && (
                  <div className="text-xs text-rose-300 pl-6 font-mono">
                    🔴 {item.error}
                  </div>
                )}
              </div>

              <div className="shrink-0 pl-6 md:pl-0">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  item.passed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {item.passed ? 'PASSED (VERIFIED)' : 'FAILED'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
