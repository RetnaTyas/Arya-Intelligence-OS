import React, { useState, useMemo } from 'react';
import { KnowledgeNode, LearnerNodeState } from '../types';
import { evaluatePrerequisites, RecommendedExperience } from '../engine/deterministicCore';
import {
  Network,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Layers,
  CheckCircle2,
  Baby,
  Lock,
  Compass,
  Award,
  Zap,
  BookOpen,
} from 'lucide-react';

interface KnowledgeGraphExplorerProps {
  nodes: KnowledgeNode[];
  learnerNodes: Record<string, LearnerNodeState>;
  queue: RecommendedExperience[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onLaunchSimulation: (simulationId: string) => void;
  onTriggerFeynman: (node: KnowledgeNode) => void;
}

export const KnowledgeGraphExplorer: React.FC<KnowledgeGraphExplorerProps> = ({
  nodes,
  learnerNodes,
  queue,
  selectedNodeId,
  onSelectNode,
  onLaunchSimulation,
  onTriggerFeynman,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [showExplorable, setShowExplorable] = useState<boolean>(false);

  const nodeMap = useMemo(() => {
    const map = new Map<string, KnowledgeNode>();
    for (const n of nodes) {
      map.set(n.id, n);
    }
    return map;
  }, [nodes]);

  const selectedNode = nodeMap.get(selectedNodeId) || nodes[0];
  const selectedLearnerState = learnerNodes[selectedNode.id];

  const domains = ['all', 'Logika & Kausal', 'Matematika', 'Fisika', 'Komputasi'];
  const ageBrackets: { id: string; label: string }[] = [
    { id: 'all', label: 'Semua Tahap (Tier I - IV)' },
    { id: '1-3', label: 'Tier I: Sensori-Motorik' },
    { id: '4-6', label: 'Tier II: Pra-Operasional' },
    { id: '7-9', label: 'Tier III: Operasional Konkret' },
    { id: '10-12', label: 'Tier IV: Operasional Formal' },
  ];

  // Helper for domain styling
  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'Logika & Kausal':
        return {
          bg: 'bg-purple-950/40',
          border: 'border-purple-500/40',
          text: 'text-purple-300',
          badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
          glow: 'shadow-purple-950/40',
          accent: 'from-purple-500 to-indigo-600',
        };
      case 'Matematika':
        return {
          bg: 'bg-indigo-950/40',
          border: 'border-indigo-500/40',
          text: 'text-indigo-300',
          badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
          glow: 'shadow-indigo-950/40',
          accent: 'from-indigo-500 to-cyan-600',
        };
      case 'Fisika':
        return {
          bg: 'bg-cyan-950/40',
          border: 'border-cyan-500/40',
          text: 'text-cyan-300',
          badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
          glow: 'shadow-cyan-950/40',
          accent: 'from-cyan-500 to-blue-600',
        };
      case 'Komputasi':
        return {
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-500/40',
          text: 'text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
          glow: 'shadow-emerald-950/40',
          accent: 'from-emerald-500 to-teal-600',
        };
      default:
        return {
          bg: 'bg-slate-900/60',
          border: 'border-slate-800',
          text: 'text-slate-300',
          badge: 'bg-slate-800 text-slate-300 border border-slate-700',
          glow: 'shadow-slate-950',
          accent: 'from-slate-600 to-slate-700',
        };
    }
  };

  // 1. Single source of truth: visibleSet from queue
  const visibleSet = useMemo(() => new Set(queue.map((item) => item.nodeId)), [queue]);

  // Filter queue by active domain & age filters
  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      const node = nodeMap.get(item.nodeId);
      if (!node) return true;
      const matchesDomain = selectedDomain === 'all' || node.domain === selectedDomain;
      const matchesAge = selectedAge === 'all' || node.ageBracket === selectedAge;
      return matchesDomain && matchesAge;
    });
  }, [queue, nodeMap, selectedDomain, selectedAge]);

  // Lapis 1: "Sekarang" (Top 1-3 cards open by default)
  const topQueue = useMemo(() => filteredQueue.slice(0, 3), [filteredQueue]);

  // Fallback for in-progress unlocked nodes not in visibleSet and not yet mastered (masteryAvg < 0.6)
  // Ensures no unlocked node disappears into a black hole (Prinsip #4 & #12)
  const otherUnlockedItems = useMemo(() => {
    return nodes
      .filter((node) => {
        if (visibleSet.has(node.id)) return false;
        const prereq = evaluatePrerequisites(node, nodes, learnerNodes);
        if (!prereq.isUnlocked) return false;
        const state = learnerNodes[node.id];
        // If state exists and masteryAvg >= 0.6, it belongs to masteredNodes (Lapis 3)
        if (state) {
          const masteryAvg = Object.values(state.mastery).reduce((a, b) => a + b, 0) / 7;
          if (masteryAvg >= 0.6) return false;
        }
        const matchesDomain = selectedDomain === 'all' || node.domain === selectedDomain;
        const matchesAge = selectedAge === 'all' || node.ageBracket === selectedAge;
        return matchesDomain && matchesAge;
      })
      .map((node) => ({
        nodeId: node.id,
        nodeName: node.name,
        domain: node.domain,
        type: 'FRONTIER_EXPLORATION' as const,
        priorityScore: 50,
        simulationId: node.activeSimulationId,
        deterministicReason: 'Konsep terbuka siap dieksplorasi kembali.',
        pedagogicalObjective: `Melanjutkan pemahaman untuk ${node.name}.`,
      }));
  }, [nodes, learnerNodes, visibleSet, selectedDomain, selectedAge]);

  // Lapis 2: "Bisa Kamu Coba Juga" (Remaining queue items + in-progress unlocked nodes, collapsed by default)
  const explorableQueue = useMemo(() => {
    return [...filteredQueue.slice(3), ...otherUnlockedItems];
  }, [filteredQueue, otherUnlockedItems]);

  // Lapis 3: "Sudah Kamu Kuasai" (Unlocked & proven mastered nodes with masteryAvg >= 0.6, collapsed by default)
  const masteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (visibleSet.has(node.id)) return false;
      const state = learnerNodes[node.id];
      if (!state) return false;
      const masteryAvg = Object.values(state.mastery).reduce((a, b) => a + b, 0) / 7;
      if (masteryAvg < 0.6) return false;
      const prereq = evaluatePrerequisites(node, nodes, learnerNodes);
      if (!prereq.isUnlocked) return false;
      const matchesDomain = selectedDomain === 'all' || node.domain === selectedDomain;
      const matchesAge = selectedAge === 'all' || node.ageBracket === selectedAge;
      return matchesDomain && matchesAge;
    });
  }, [nodes, learnerNodes, visibleSet, selectedDomain, selectedAge]);

  // 1-Hop Locked Boundary (Nodes that are locked, but EXACTLY 1 prerequisite step away from unlocking)
  const oneHopLockedNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (visibleSet.has(node.id)) return false;
      const prereq = evaluatePrerequisites(node, nodes, learnerNodes);
      if (prereq.isUnlocked) return false;
      // Mathematically exact: exactly 1 unmet prerequisite remaining
      const isOneHop = prereq.unmetPrerequisites.length === 1;
      const matchesDomain = selectedDomain === 'all' || node.domain === selectedDomain;
      const matchesAge = selectedAge === 'all' || node.ageBracket === selectedAge;
      return isOneHop && matchesDomain && matchesAge;
    });
  }, [nodes, learnerNodes, visibleSet, selectedDomain, selectedAge]);

  // Child-friendly badge & description helper for queue types (Zero shame / No debt labels!)
  const getExperienceMeta = (type: RecommendedExperience['type']) => {
    switch (type) {
      case 'BOTTLENECK_REPAIR':
        return {
          badge: 'Yuk Kita Ingat Lagi!',
          icon: Sparkles,
          chipColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          accentBorder: 'border-amber-500/40',
          invitation: 'Ada rahasia seru yang bisa kita ingat kembali agar fondasimu makin kokoh!',
        };
      case 'FRONTIER_EXPLORATION':
        return {
          badge: 'Dunia Baru Terbuka!',
          icon: Compass,
          chipColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          accentBorder: 'border-emerald-500/40',
          invitation: 'Semua pintu prasyarat telah terbuka! Siap menjelajah konsep baru?',
        };
      case 'TRANSFER_CONSOLIDATION':
        return {
          badge: 'Tantangan Lintas Bidang',
          icon: Layers,
          chipColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          accentBorder: 'border-indigo-500/40',
          invitation: 'Uji kehebatanmu menghubungkan konsep ini ke dunia nyata yang lebih luas!',
        };
      case 'SPACED_RETRIEVAL':
        return {
          badge: 'Segarkan Ingatan',
          icon: Zap,
          chipColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          accentBorder: 'border-cyan-500/40',
          invitation: 'Tantangan ringan untuk menyegarkan kembali pemahamanmu yang hebat!',
        };
      default:
        return {
          badge: 'Petualangan Konsep',
          icon: Sparkles,
          chipColor: 'bg-slate-700/40 text-slate-200 border-slate-600',
          accentBorder: 'border-slate-700',
          invitation: 'Jelajahi dan temukan ide baru di sini.',
        };
    }
  };

  return (
    <div id="knowledge-graph-container" className="space-y-6">
      {/* Intro Header & Filters */}
      <div className="bg-[#0b0f1d] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-400" />
              <span>Peta Petualangan Konsep (Knowledge Graph)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Jelajahi dunia pengetahuan langkah demi langkah. Setiap petualangan dirancang menghubungkan alasan mendasar (WHY) hingga aplikasi nyata.
            </p>
          </div>
        </div>

        {/* Dual Filter Bars */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80">
          {/* Age Bracket Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Baby className="w-3.5 h-3.5 text-amber-400" />
              <span>Tahap Kognitif:</span>
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
                {dom === 'all' ? 'Semua Domain' : dom}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3 Structured Layers + 1-Hop Silhouette */}
        <div className="lg:col-span-7 space-y-6">

          {/* ============================================================ */}
          {/* LAPIS 1 — "Sekarang" (Top 1–3 Cards, Default Terbuka)        */}
          {/* ============================================================ */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Sekarang · Fokus Petualanganmu</span>
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400/90 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {topQueue.length} Misi Prioritas
              </span>
            </div>

            {topQueue.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-[#0c1020] text-center text-slate-400 text-xs">
                Tidak ada misi aktif pada filter ini. Coba pilih domain atau tahap usia lain.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {topQueue.map((item, index) => {
                  const node = nodeMap.get(item.nodeId);
                  if (!node) return null;
                  const colors = getDomainColor(node.domain);
                  const state = learnerNodes[node.id];
                  const isSelected = node.id === selectedNodeId;
                  const meta = getExperienceMeta(item.type);
                  const MetaIcon = meta.icon;

                  const masteryAvg = state
                    ? Object.values(state.mastery).reduce((a, b) => a + b, 0) / 7
                    : 0;

                  return (
                    <div
                      key={item.nodeId}
                      id={`node-card-${item.nodeId}`}
                      onClick={() => onSelectNode(node.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                        isSelected
                          ? `${colors.bg} ${colors.border} ring-2 ring-indigo-500/60 shadow-xl`
                          : 'bg-[#0f1322] border-slate-800 hover:border-slate-700 hover:bg-[#12182c]'
                      }`}
                    >
                      <div>
                        {/* Top Badge Strip */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
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

                          {/* Friendly Encouraging Tag */}
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border flex items-center gap-1 ${meta.chipColor}`}>
                            <MetaIcon className="w-3 h-3" />
                            <span>{meta.badge}</span>
                          </span>
                        </div>

                        {/* Node Title & Warm Invitation */}
                        <h4 className="text-base font-bold text-white leading-snug flex items-center gap-1.5">
                          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                            #{index + 1}
                          </span>
                          <span>{node.name}</span>
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {node.description}
                        </p>
                        <p className="text-[11px] text-indigo-300/90 mt-2 italic flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span>{meta.invitation}</span>
                        </p>
                      </div>

                      {/* Bottom: Child-Friendly Mastery Ladder */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">Kemajuanmu:</span>
                          <div className="w-24 h-1.5 rounded-full overflow-hidden bg-slate-950 border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                              style={{ width: `${Math.max(10, masteryAvg * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-400">
                            {(masteryAvg * 100).toFixed(0)}%
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectNode(node.id);
                            if (node.activeSimulationId) {
                              onLaunchSimulation(node.activeSimulationId);
                            } else {
                              onTriggerFeynman(node);
                            }
                          }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow transition"
                        >
                          <span>Mulai</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ============================================================ */}
          {/* LAPIS 2 — "Bisa Kamu Coba Juga" (Sisa Queue, Collapsed)       */}
          {/* ============================================================ */}
          {explorableQueue.length > 0 && (
            <section className="bg-[#0b0f1e] rounded-xl border border-slate-800 overflow-hidden">
              <button
                id="toggle-explorable-btn"
                onClick={() => setShowExplorable((prev) => !prev)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/60 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Bisa Kamu Coba Juga</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-mono">
                        {explorableQueue.length} konsep
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pintu petualangan lain yang siap kamu masuki kapan saja.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-indigo-400 font-medium">
                  <span>{showExplorable ? 'Sembunyikan' : 'Buka Peta'}</span>
                  {showExplorable ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {showExplorable && (
                <div className="p-4 pt-0 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {explorableQueue.map((item) => {
                    const node = nodeMap.get(item.nodeId);
                    if (!node) return null;
                    const colors = getDomainColor(node.domain);
                    const isSelected = node.id === selectedNodeId;
                    const meta = getExperienceMeta(item.type);

                    return (
                      <div
                        key={item.nodeId}
                        onClick={() => onSelectNode(node.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? `${colors.bg} ${colors.border} ring-1 ring-indigo-500/60 shadow`
                            : 'bg-[#0f1426] border-slate-800/80 hover:border-slate-700 hover:bg-[#121930]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className={`px-1.5 py-0.2 text-[9px] font-semibold rounded ${colors.badge}`}>
                              {node.domain}
                            </span>
                            <span className={`px-1.5 py-0.2 text-[9px] font-medium rounded-full border ${meta.chipColor}`}>
                              {meta.badge}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-white leading-snug">
                            {node.name}
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {node.description}
                          </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-indigo-400">
                          <span>Pilih konsep ini</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ============================================================ */}
          {/* LAPIS 3 — "Sudah Kamu Kuasai" (Arsip Prestasi, Collapsed)    */}
          {/* ============================================================ */}
          {masteredNodes.length > 0 && (
            <section className="bg-[#0a1120] rounded-xl border border-emerald-900/30 overflow-hidden">
              <button
                id="toggle-archived-btn"
                onClick={() => setShowArchived((prev) => !prev)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-emerald-950/20 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Sudah Kamu Kuasai</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono font-bold">
                        {masteredNodes.length} tuntas
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Koleksi konsep yang sudah kokoh dalam ingatan dan pemahamanmu.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <span>{showArchived ? 'Sembunyikan' : 'Lihat Koleksi'}</span>
                  {showArchived ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {showArchived && (
                <div className="p-4 pt-0 border-t border-emerald-900/30 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {masteredNodes.map((node) => {
                    const colors = getDomainColor(node.domain);
                    const isSelected = node.id === selectedNodeId;

                    return (
                      <div
                        key={node.id}
                        onClick={() => onSelectNode(node.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? `${colors.bg} ${colors.border} ring-1 ring-emerald-500/60 shadow`
                            : 'bg-[#0d1627] border-emerald-900/30 hover:border-emerald-700/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className={`px-1.5 py-0.2 text-[9px] font-semibold rounded ${colors.badge}`}>
                              {node.domain}
                            </span>
                            <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                              <span>Tuntas</span>
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-white leading-snug">
                            {node.name}
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {node.description}
                          </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-emerald-900/40 flex items-center justify-between text-[10px] text-emerald-400">
                          <span>Buka kembali</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ============================================================ */}
          {/* SILUET TERKUNCI (1-Hop dari Frontier)                        */}
          {/* ============================================================ */}
          {oneHopLockedNodes.length > 0 && (
            <section className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Masa Depan · 1 Langkah Lagi
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">
                  ({oneHopLockedNodes.length} dunia menunggumu)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {oneHopLockedNodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-3 rounded-xl border border-dashed border-slate-800 bg-[#070a14]/60 opacity-60 flex items-start gap-2.5 cursor-not-allowed select-none"
                    title={`Selesaikan prasyarat untuk membuka konsep ${node.name}`}
                  >
                    <div className="p-2 rounded-lg bg-slate-900 text-slate-500 border border-slate-800 shrink-0 mt-0.5">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-slate-500 px-1 rounded bg-slate-900">
                          {node.domain}
                        </span>
                        <span className="text-[9px] text-slate-500 font-medium">
                          Terkunci
                        </span>
                      </div>
                      <h5 className="text-xs font-semibold text-slate-300 truncate">
                        {node.name}
                      </h5>
                      <p className="text-[10px] text-slate-500 truncate">
                        1 prasyarat lagi untuk membuka petualangan ini.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pedagogy Footnote */}
          <div className="bg-[#0b0f1c] p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-slate-200">Prinsip Epistemik Tanpa Titik Henti (No Dead-Ends):</strong>{' '}
              Peta kognitif membuka jalur secara adaptif. Anak bebas melangkah ke frontier mana pun tanpa paksaan urutan kelas kaku.
            </div>
          </div>
        </div>

        {/* Right Column: Selected Node Deep Inspector */}
        <div className="lg:col-span-5 bg-[#0f1424] border border-slate-800 rounded-xl p-5 space-y-5 h-fit sticky top-4 shadow-xl">
          {/* Header of Inspector */}
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getDomainColor(selectedNode.domain).badge}`}>
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

          {/* Tangga Penguasaan Anak (Mastery State, Zero Shame) */}
          {selectedLearnerState && (
            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tangga Kemahiran Konsep:</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  {(Object.values(selectedLearnerState.mastery).reduce((a, b) => a + b, 0) / 7 * 100).toFixed(0)}% Tuntas
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: 'Mengenal', value: selectedLearnerState.mastery.recognition },
                  { label: 'Mengingat', value: selectedLearnerState.mastery.recall },
                  { label: 'Memahami (WHY)', value: selectedLearnerState.mastery.understanding },
                  { label: 'Menerapkan', value: selectedLearnerState.mastery.application },
                  { label: 'Mentransfer Ide', value: selectedLearnerState.mastery.transfer },
                  { label: 'Menjelaskan Sendiri', value: selectedLearnerState.mastery.explanation },
                  { label: 'Mencipta / Sintesis', value: selectedLearnerState.mastery.creation },
                ].map((tier) => (
                  <div key={tier.label} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 w-36 truncate">{tier.label}</span>
                    <div className="flex-1 mx-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          tier.value >= 0.7
                            ? 'bg-emerald-400'
                            : tier.value >= 0.4
                            ? 'bg-indigo-400'
                            : 'bg-slate-600'
                        }`}
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
              <span>Lapisan Alasan Mendasar (WHY)</span>
            </h4>
            <div className="space-y-1.5">
              {selectedNode.whyChain.map((why, idx) => (
                <div key={idx} className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  {why}
                </div>
              ))}
            </div>
          </div>

          {/* 4 Explanation Levels (Bruner's Representations) */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Tingkat Representasi (Konkret ➔ Simbolik)
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
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <span>Buka Lab Eksperimen Interaktif</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              id="feynman-sensor-trigger-btn"
              onClick={() => onTriggerFeynman(selectedNode)}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Uji Pemahaman dengan Feynman Sensor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
