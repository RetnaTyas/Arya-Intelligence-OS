import React, { useState } from 'react';
import { KnowledgeNode, LearnerNodeState, AgeBracket } from '../types';
import {
  Network,
  Sparkles,
  ChevronRight,
  AlertCircle,
  ArrowUpRight,
  HelpCircle,
  Layers,
  CheckCircle2,
  Baby,
  Calendar,
} from 'lucide-react';

interface KnowledgeGraphExplorerProps {
  nodes: KnowledgeNode[];
  learnerNodes: Record<string, LearnerNodeState>;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onLaunchSimulation: (simulationId: string) => void;
  onTriggerFeynman: (node: KnowledgeNode) => void;
}

export const KnowledgeGraphExplorer: React.FC<KnowledgeGraphExplorerProps> = ({
  nodes,
  learnerNodes,
  selectedNodeId,
  onSelectNode,
  onLaunchSimulation,
  onTriggerFeynman,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedAge, setSelectedAge] = useState<string>('all');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const selectedLearnerState = learnerNodes[selectedNode.id];

  const domains = ['all', 'Logika & Kausal', 'Matematika', 'Fisika', 'Komputasi'];
  const ageBrackets: { id: string; label: string }[] = [
    { id: 'all', label: 'Semua Umur (1 - 12 Thn)' },
    { id: '1-3', label: '1 - 3 Thn (Sensori)' },
    { id: '4-6', label: '4 - 6 Thn (Pra-Operasional)' },
    { id: '7-9', label: '7 - 9 Thn (Konkret)' },
    { id: '10-12', label: '10 - 12 Thn (Transisi Formal)' },
  ];

  const filteredNodes = nodes.filter((n) => {
    const matchesDomain = selectedDomain === 'all' || n.domain === selectedDomain;
    const matchesAge = selectedAge === 'all' || n.ageBracket === selectedAge;
    return matchesDomain && matchesAge;
  });

  // Helper for domain color
  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'Logika & Kausal':
        return {
          bg: 'bg-purple-950/40',
          border: 'border-purple-500/40',
          text: 'text-purple-300',
          badge: 'bg-purple-500/20 text-purple-300',
          glow: 'shadow-purple-950/40',
        };
      case 'Matematika':
        return {
          bg: 'bg-indigo-950/40',
          border: 'border-indigo-500/40',
          text: 'text-indigo-300',
          badge: 'bg-indigo-500/20 text-indigo-300',
          glow: 'shadow-indigo-950/40',
        };
      case 'Fisika':
        return {
          bg: 'bg-cyan-950/40',
          border: 'border-cyan-500/40',
          text: 'text-cyan-300',
          badge: 'bg-cyan-500/20 text-cyan-300',
          glow: 'shadow-cyan-950/40',
        };
      case 'Komputasi':
        return {
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-500/40',
          text: 'text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-300',
          glow: 'shadow-emerald-950/40',
        };
      default:
        return {
          bg: 'bg-slate-900',
          border: 'border-slate-800',
          text: 'text-slate-300',
          badge: 'bg-slate-800 text-slate-300',
          glow: 'shadow-slate-950',
        };
    }
  };

  return (
    <div id="knowledge-graph-container" className="space-y-6">
      {/* Intro Header & Filters */}
      <div className="bg-[#0b0f1d] p-4 rounded-2xl border border-slate-800 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-400" />
              <span>Dynamic Knowledge Graph (Umur 1 - 12 Tahun)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Prinsip Desain #3 & #4: <em>Struktur materi merentang dari Sensori-Motorik (1-3 thn), Pra-Operasional (4-6 thn), Operasional Konkret (7-9 thn), hingga Transisi Formal (10-12 thn).</em>
            </p>
          </div>
        </div>

        {/* Dual Filter Bars */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Age Bracket Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Baby className="w-3.5 h-3.5 text-amber-400" />
              <span>Tahap Umur:</span>
            </span>
            {ageBrackets.map((age) => (
              <button
                key={age.id}
                onClick={() => setSelectedAge(age.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  selectedAge === age.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                {age.label}
              </button>
            ))}
          </div>

          {/* Domain Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Domain:
            </span>
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedDomain === dom
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                {dom === 'all' ? 'Semua' : dom}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Nodes Grid / Tree */}
        <div className="lg:col-span-7 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredNodes.map((node) => {
              const colors = getDomainColor(node.domain);
              const state = learnerNodes[node.id];
              const isSelected = node.id === selectedNodeId;
              const hasDecay = state && state.decayRate > 0.05;
              const hasMisconception = state && state.activeMisconceptions && state.activeMisconceptions.length > 0;

              // Calculate overall mastery average across the 7 tiers
              const masteryAvg = state
                ? Object.values(state.mastery).reduce((a, b) => a + b, 0) / 7
                : 0;

              return (
                <div
                  key={node.id}
                  id={`node-card-${node.id}`}
                  onClick={() => onSelectNode(node.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                    isSelected
                      ? `${colors.bg} ${colors.border} ring-2 ring-indigo-500/50 shadow-xl`
                      : 'bg-[#0f1322] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top tags */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${colors.badge}`}>
                          {node.domain}
                        </span>
                        {node.ageBracket && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {node.ageBracket} Thn
                          </span>
                        )}
                      </div>

                      {hasDecay && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          Decay {(state.decayRate * 100).toFixed(0)}%
                        </span>
                      )}
                      {hasMisconception && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Miskonsepsi
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">
                      {node.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {node.description}
                    </p>
                  </div>

                  {/* Bottom: Mastery Progress */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1 text-slate-400">
                      <span>Kedalaman Mastery (7 Level):</span>
                      <strong className={colors.text}>{(masteryAvg * 100).toFixed(0)}%</strong>
                    </div>

                    {/* 7-Tier Mastery Micro Bars */}
                    <div className="grid grid-cols-7 gap-1 h-1.5 rounded overflow-hidden bg-slate-950">
                      {state && (
                        <>
                          <div title="Recognition" className={`h-full ${state.mastery.recognition > 0.6 ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                          <div title="Recall" className={`h-full ${state.mastery.recall > 0.6 ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                          <div title="Understanding" className={`h-full ${state.mastery.understanding > 0.6 ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                          <div title="Application" className={`h-full ${state.mastery.application > 0.6 ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                          <div title="Transfer" className={`h-full ${state.mastery.transfer > 0.6 ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                          <div title="Explanation" className={`h-full ${state.mastery.explanation > 0.6 ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                          <div title="Creation" className={`h-full ${state.mastery.creation > 0.6 ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prerequisite & Trajectory Map Flow Note */}
          <div className="bg-[#0b0f1c] p-4 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <Layers className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Lintasan Dependensi Kognitif (Umur 1 - 12 Tahun):</strong>
              <span className="text-slate-400 text-[11px] block mt-0.5">
                Permanensi Objek (1-3 thn) ➔ Konservasi Bentuk & Pola (4-6 thn) ➔ Kesetaraan & Bar Model (7-9 thn) ➔ Aljabar, Fluida, Energi & Kalkulus (10-12 thn).
                Sistem membebaskan anak maju sesuai kecepatan kognitif tanpa batasan kelas artifisial.
              </span>
            </div>
          </div>
        </div>

        {/* Selected Node Deep Inspector */}
        <div className="lg:col-span-5 bg-[#0f1424] border border-slate-800 rounded-xl p-5 space-y-5">
          {/* Header of Inspector */}
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/20 text-indigo-300">
                {selectedNode.domain}
              </span>
              {selectedNode.developmentalStage && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Baby className="w-3 h-3" />
                  <span>{selectedNode.developmentalStage}</span>
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">
              {selectedNode.name}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedNode.description}
            </p>
          </div>

          {/* 7-Tier Mastery Detail Breakdown */}
          {selectedLearnerState && (
            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Hierarki Penguasaan Anak (Mastery State):</span>
                <span className="text-[10px] text-slate-400 font-mono">Bukan Skor Biner</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: 'Recognition', value: selectedLearnerState.mastery.recognition },
                  { label: 'Recall', value: selectedLearnerState.mastery.recall },
                  { label: 'Understanding', value: selectedLearnerState.mastery.understanding },
                  { label: 'Application', value: selectedLearnerState.mastery.application },
                  { label: 'Transfer', value: selectedLearnerState.mastery.transfer },
                  { label: 'Explanation', value: selectedLearnerState.mastery.explanation },
                  { label: 'Creation', value: selectedLearnerState.mastery.creation },
                ].map((tier) => (
                  <div key={tier.label} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 w-24">{tier.label}</span>
                    <div className="flex-1 mx-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${tier.value >= 0.7 ? 'bg-emerald-400' : tier.value >= 0.4 ? 'bg-amber-400' : 'bg-slate-600'}`}
                        style={{ width: `${tier.value * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-slate-300 w-8 text-right">
                      {(tier.value * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WHY-Chain (Filosofi Why-First) */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lapisan WHY (Alasan Fundamental Konsep)</span>
            </h4>
            <div className="space-y-1.5">
              {selectedNode.whyChain.map((why, idx) => (
                <div key={idx} className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  {why}
                </div>
              ))}
            </div>
          </div>

          {/* 4 Explanation Levels */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Tingkat Penjelasan (Concrete ➔ Formal)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-amber-400 font-semibold block uppercase">1. Konkret:</span>
                <span className="text-[11px] text-slate-300">{selectedNode.explanationLevels.concrete}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-cyan-400 font-semibold block uppercase">2. Visual:</span>
                <span className="text-[11px] text-slate-300">{selectedNode.explanationLevels.visual}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-indigo-400 font-semibold block uppercase">3. Simbolik:</span>
                <span className="text-[11px] text-slate-300">{selectedNode.explanationLevels.symbolic}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-purple-400 font-semibold block uppercase">4. Formal:</span>
                <span className="text-[11px] text-slate-300">{selectedNode.explanationLevels.formal}</span>
              </div>
            </div>
          </div>

          {/* Action Launchers */}
          <div className="pt-2 space-y-2">
            {selectedNode.activeSimulationId && (
              <button
                id="launch-node-sim-btn"
                onClick={() => onLaunchSimulation(selectedNode.activeSimulationId!)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-md transition"
              >
                <span>Buka Lab Eksperimen Interaktif</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              id="feynman-sensor-trigger-btn"
              onClick={() => onTriggerFeynman(selectedNode)}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <span>Uji Dialog Socratic Feynman Sensor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
