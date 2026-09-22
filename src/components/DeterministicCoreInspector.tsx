import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  ShieldCheck,
  TrendingDown,
  Calendar,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Sliders,
  Sparkles,
  HelpCircle,
  Brain,
  ListFilter,
} from 'lucide-react';
import { KnowledgeNode, LearnerNodeState } from '../types';
import {
  evaluatePrerequisites,
  calculateDeterministicDecay,
  calculateDeterministicEpistemicDebt,
  selectNextBestExperience,
  PREREQUISITE_MASTERY_THRESHOLDS,
  RecommendedExperience,
} from '../engine/deterministicCore';
import { CentralHypothesisTestHarness } from './CentralHypothesisTestHarness';
import { NARROW_DOMAIN_MATH_NODES } from '../data/narrowMathDomain';

interface DeterministicCoreInspectorProps {
  nodes: KnowledgeNode[];
  learnerNodes: Record<string, LearnerNodeState>;
  onSelectNode: (nodeId: string) => void;
  onLaunchSimulation: (simulationId: string) => void;
}

export const DeterministicCoreInspector: React.FC<DeterministicCoreInspectorProps> = ({
  nodes,
  learnerNodes,
  onSelectNode,
  onLaunchSimulation,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-symbolic-algebra');
  const [simulatedDaysElapsed, setSimulatedDaysElapsed] = useState<number>(28);
  const [activeEngineTab, setActiveEngineTab] = useState<'queue' | 'prereq' | 'decay' | 'debt' | 'benchmark' | 'narrow_domain'>('benchmark');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const selectedState = learnerNodes[selectedNode.id];

  // Run deterministic algorithms
  const nextQueue: RecommendedExperience[] = selectNextBestExperience(nodes, learnerNodes);
  const prereqStatus = evaluatePrerequisites(selectedNode, nodes, learnerNodes);

  // Run spaced repetition decay calculation for simulated days
  const decayCalc = calculateDeterministicDecay(
    '2029-02-20',
    selectedState?.evidenceCount ?? 4,
    selectedState?.mastery.transfer ?? 0.5,
    new Date(new Date('2029-02-20').getTime() + simulatedDaysElapsed * 24 * 60 * 60 * 1000).toISOString()
  );

  const debtAssessment = selectedState
    ? calculateDeterministicEpistemicDebt(selectedNode, selectedState, 0.45)
    : null;

  return (
    <div id="deterministic-core-inspector" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0b0f1e] p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Deterministic Core Engine</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Prinsip Desain #2: Graph adalah sumber kebenaran struktural
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Aturan Prerequisite, Gating 7-Tier, Peluruhan Spaced Repetition, & Epistemic Debt
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              AI <strong>bukan penentu kurikulum</strong>. Pembaruan learner model, pembukaan prerequisite, peluruhan retensi, dan antrean pengalaman belajar berikutnya diatur oleh hukum deterministik matematis.
            </p>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              id="engine-tab-benchmark"
              onClick={() => setActiveEngineTab('benchmark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeEngineTab === 'benchmark'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Tahap 2: Uji Hipotesis & Perturbasi</span>
            </button>
            <button
              id="engine-tab-narrow-domain"
              onClick={() => setActiveEngineTab('narrow_domain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeEngineTab === 'narrow_domain'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Tahap 1: Koridor Domain Sempit</span>
            </button>
            <button
              onClick={() => setActiveEngineTab('queue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeEngineTab === 'queue'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Antrean Pengalaman ({nextQueue.length})
            </button>
            <button
              onClick={() => setActiveEngineTab('prereq')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeEngineTab === 'prereq'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Prerequisite Gating
            </button>
            <button
              onClick={() => setActiveEngineTab('decay')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeEngineTab === 'decay'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Formula Peluruhan Ebbinghaus
            </button>
            <button
              onClick={() => setActiveEngineTab('debt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeEngineTab === 'debt'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Epistemic Debt Risk
            </button>
          </div>
        </div>
      </div>

      {/* Tab Tahap 2: Central Hypothesis Test Harness & Perturbation Layer 0-2 */}
      {activeEngineTab === 'benchmark' && <CentralHypothesisTestHarness />}

      {/* Tab Tahap 1: Koridor Domain Sempit (Pecahan s/d Persamaan) */}
      {activeEngineTab === 'narrow_domain' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-[#0b1022] p-4 rounded-xl border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <strong className="text-cyan-300 font-bold block">
                Tahap 1 Peta Jalan: Domain Sempit Terfokus (Single-Learner Corridor)
              </strong>
              <p className="text-slate-400 mt-0.5 text-[11px]">
                Koridor vertikal pecahan ➔ rasio ➔ persamaan aljabar linear. Prinsip: data model solid untuk 1 pengguna pertama sebelum ekspansi ke multi-domain.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-cyan-950/70 text-cyan-300 font-mono text-[11px] border border-cyan-800/40 shrink-0">
              7 Node Vertikal Kunci
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {NARROW_DOMAIN_MATH_NODES.map((n, idx) => (
              <div key={n.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 font-mono text-[10px] font-bold">
                    Langkah #{idx + 1}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Centrality: {n.centrality}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{n.name}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{n.description}</p>
                <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1 text-[11px]">
                  <strong className="text-amber-300 block text-[10.5px]">Miskonsepsi Kunci:</strong>
                  <span className="text-slate-300 italic block">{n.commonMisconceptions[0]?.misconception}</span>
                  <span className="text-emerald-400 text-[10.5px] block mt-1">
                    <strong>Counterexample:</strong> {n.commonMisconceptions[0]?.counterExample}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 1: Deterministic Next Best Learning Experience Queue */}
      {activeEngineTab === 'queue' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-slate-200">
              Antrean Rekomendasi Terurut Matematis (Priority Queue):
            </span>
            <span className="font-mono text-[10px]">
              Formula: Bottleneck (100+) ➔ Frontier (70+) ➔ Transfer (50+) ➔ Retrieval (40+)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {nextQueue.map((item, idx) => {
              const isBottleneck = item.type === 'BOTTLENECK_REPAIR';
              const isFrontier = item.type === 'FRONTIER_EXPLORATION';
              const isTransfer = item.type === 'TRANSFER_CONSOLIDATION';

              return (
                <div
                  key={item.nodeId}
                  className={`p-4 rounded-xl border space-y-3 relative flex flex-col justify-between ${
                    isBottleneck
                      ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/30'
                      : isFrontier
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : isTransfer
                      ? 'bg-purple-950/20 border-purple-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300 border border-slate-800">
                          #{idx + 1}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isBottleneck
                              ? 'bg-amber-500/20 text-amber-300'
                              : isFrontier
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isTransfer
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {item.type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        Skor Prioritas: {item.priorityScore.toFixed(0)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {item.nodeName}
                    </h4>

                    <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed space-y-1">
                      <span className="text-[10px] font-mono text-cyan-400 block font-bold">
                        Alasan Deterministik:
                      </span>
                      <p>{item.deterministicReason}</p>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      <strong>Tujuan Pedagogis:</strong> {item.pedagogicalObjective}
                    </div>
                  </div>

                  {item.simulationId && (
                    <button
                      onClick={() => onLaunchSimulation(item.simulationId!)}
                      className="w-full mt-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
                    >
                      <span>Buka Simulasi Terkait</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Prerequisite Gating Evaluator */}
      {activeEngineTab === 'prereq' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Node Selector */}
          <div className="lg:col-span-5 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Pilih Node Untuk Menguji Gating Prerequisite:
            </span>
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {nodes.map((n) => {
                const isSelected = n.id === selectedNodeId;
                const status = evaluatePrerequisites(n, nodes, learnerNodes);

                return (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNodeId(n.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500/80 ring-2 ring-cyan-500/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{n.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {n.prerequisites.length === 0
                          ? 'Konsep Dasar (0 Prerequisite)'
                          : `${n.prerequisites.length} Prerequisite`}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {status.isUnlocked ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          <Unlock className="w-3 h-3" />
                          Terbuka
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                          <Lock className="w-3 h-3" />
                          Terkunci
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prerequisite Deep Breakdown */}
          <div className="lg:col-span-7 bg-[#0f1424] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  Analisis Prerequisite Deterministik
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedNode.name}
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                  prereqStatus.isUnlocked
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                Kepuasan: {(prereqStatus.satisfactionRatio * 100).toFixed(0)}%
              </span>
            </div>

            {/* Threshold Rules Reference */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div>
                <span className="text-slate-400 block">Min Understanding</span>
                <span className="text-cyan-300 font-bold">
                  {(PREREQUISITE_MASTERY_THRESHOLDS.MIN_UNDERSTANDING * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Min Application</span>
                <span className="text-indigo-300 font-bold">
                  {(PREREQUISITE_MASTERY_THRESHOLDS.MIN_APPLICATION * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Maksimal Decay</span>
                <span className="text-amber-300 font-bold">
                  {(PREREQUISITE_MASTERY_THRESHOLDS.MAX_ALLOWED_DECAY * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Prerequisite list */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-200 block">
                Daftar Prerequisite yang Dibutuhkan:
              </span>

              {selectedNode.prerequisites.length === 0 ? (
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-400">
                  Node ini adalah fondasi awal (root node), tidak memiliki prasyarat sebelumnya. Dapat diakses langsung oleh anak.
                </div>
              ) : (
                selectedNode.prerequisites.map((prereqId) => {
                  const prereqNode = nodes.find((n) => n.id === prereqId);
                  const prereqState = learnerNodes[prereqId];
                  const isUnmet = prereqStatus.unmetPrerequisites.some((u) => u.nodeId === prereqId);

                  return (
                    <div
                      key={prereqId}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        isUnmet
                          ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                          : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <strong className="text-white block font-semibold">
                          {prereqNode ? prereqNode.name : prereqId}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Understanding: {prereqState ? (prereqState.mastery.understanding * 100).toFixed(0) : 0}% · Decay: {prereqState ? (prereqState.decayRate * 100).toFixed(0) : 0}%
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isUnmet
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isUnmet ? 'Belum Terpenuhi' : 'Lolos Gating'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Spaced Repetition & Ebbinghaus Decay Simulator */}
      {activeEngineTab === 'decay' && (
        <div className="bg-[#0f1424] border border-slate-800 rounded-2xl p-5 space-y-5 animate-fade-in">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                Model Matematika Retensi Memori (Ebbinghaus / Two-Component)
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Formula: R(t) = exp( - Δt / S )
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Bukan Tebakan AI · Eksponensial Terkendali
            </span>
          </div>

          {/* Interactive Days Slider */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">
                Simulasi Waktu Berlalu Sejak Interaksi Terakhir (Δt):
              </span>
              <span className="font-mono text-amber-300 font-bold text-sm">
                {simulatedDaysElapsed} Hari
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={simulatedDaysElapsed}
              onChange={(e) => setSimulatedDaysElapsed(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 Hari (Fresh)</span>
              <span>30 Hari (1 Bulan)</span>
              <span>60 Hari (2 Bulan)</span>
              <span>90 Hari (3 Bulan)</span>
            </div>
          </div>

          {/* 4 Computed Retention Results */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Stabilitas Memori (S)</span>
              <div className="text-xl font-bold text-indigo-400 font-mono">
                {decayCalc.memoryStabilityDays} Hari
              </div>
              <span className="text-[10px] text-slate-500 block">Ditingkatkan bukti transfer</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Probabilitas Retensi R(t)</span>
              <div
                className={`text-xl font-bold font-mono ${
                  decayCalc.retentionProbability >= 0.85
                    ? 'text-emerald-400'
                    : decayCalc.retentionProbability >= 0.70
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {(decayCalc.retentionProbability * 100).toFixed(0)}%
              </div>
              <span className="text-[10px] text-slate-500 block">Target ambang: ≥85%</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Tingkat Peluruhan (Decay)</span>
              <div className="text-xl font-bold text-amber-400 font-mono">
                {(decayCalc.decayRate * 100).toFixed(0)}%
              </div>
              <span className="text-[10px] text-slate-500 block">1 - R(t)</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Status Spaced Retrieval</span>
              <div
                className={`text-base font-bold font-mono ${
                  decayCalc.isRepetitionDue ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {decayCalc.isRepetitionDue ? 'Wajib Review' : 'Optimal'}
              </div>
              <span className="text-[10px] text-slate-500 block">
                {decayCalc.isRepetitionDue
                  ? 'Retensi di bawah 85%'
                  : `Next review: d+${decayCalc.optimalNextReviewDays}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Epistemic Debt Risk Formulation (Section 7.4) */}
      {activeEngineTab === 'debt' && debtAssessment && (
        <div className="bg-[#0f1424] border border-slate-800 rounded-2xl p-5 space-y-5 animate-fade-in">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                Dokumen Fondasi Bagian 7.4
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Debt Risk = Decay × Centrality × Future Relevance × Uncertainty
              </h3>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                debtAssessment.severity === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : debtAssessment.severity === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              Severity: {debtAssessment.severity}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Decay (15%)</span>
              <div className="text-lg font-bold text-amber-400 font-mono">
                {(debtAssessment.components.decay * 100).toFixed(0)}%
              </div>
              <span className="text-[10px] text-slate-500 block">Sinyal kelupaan</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Centrality Graph</span>
              <div className="text-lg font-bold text-cyan-400 font-mono">
                {debtAssessment.components.centrality.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 block">Banyak node bergantung</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Future Relevance</span>
              <div className="text-lg font-bold text-purple-400 font-mono">
                {debtAssessment.components.futureRelevance.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 block">Relevansi lintasan aktif</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Uncertainty</span>
              <div className="text-lg font-bold text-slate-300 font-mono">
                {debtAssessment.components.uncertainty.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 block">Variansi bukti</span>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-white font-bold block">
                Tindakan Sistem: {debtAssessment.recommendedAction.replace(/_/g, ' ')}
              </span>
              <span className="text-slate-400 text-[11px]">
                {debtAssessment.isBottleneck
                  ? 'Konsep ini adalah bottleneck kritis! Sistem secara otomatis menyisipkan reconsolidation aljabar ke proyek kapal selam (Stealth Insertion) tanpa kelas remedial yang memalukan.'
                  : 'Tingkat debt dalam ambang aman toleransi normal.'}
              </span>
            </div>

            <span className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 font-mono font-bold shrink-0">
              Skor: {debtAssessment.debtRiskScore}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
