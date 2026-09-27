import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Brain,
  Scale,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Trash2,
  RefreshCw,
  HardDrive,
  Info,
  Calendar,
  Layers,
  Send,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { HumanAuditRating, KnowledgeNode, EvidenceEntry } from '../types';
import { NARROW_DOMAIN_MATH_NODES } from '../data/narrowMathDomain';
import {
  getAllHumanRatings,
  persistHumanRating,
  deleteHumanRating,
} from '../storage/indexedDbStorage';

interface HumanVsAiAuditDashboardProps {
  knowledgeNodes: KnowledgeNode[];
  evidenceLogs?: EvidenceEntry[];
  onOpenDoc?: () => void;
}

export const HumanVsAiAuditDashboard: React.FC<HumanVsAiAuditDashboardProps> = ({
  knowledgeNodes,
  evidenceLogs = [],
  onOpenDoc,
}) => {
  const [activeTab, setActiveTab] = useState<'real_ratings' | 'synthetic_info'>('real_ratings');
  const [ratings, setRatings] = useState<HumanAuditRating[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form State for Adding New Human Rating
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    NARROW_DOMAIN_MATH_NODES[0]?.id || knowledgeNodes[0]?.id || ''
  );
  const [contextSource, setContextSource] = useState<HumanAuditRating['contextSource']>('direct_observation');
  const [contextDetails, setContextDetails] = useState<string>('');
  const [childUtterance, setChildUtterance] = useState<string>('');
  const [raterRole, setRaterRole] = useState<HumanAuditRating['raterRole']>('parent');
  const [raterName, setRaterName] = useState<string>('');
  
  const [humanScore, setHumanScore] = useState<number>(0.75);
  const [humanHasMisconception, setHumanHasMisconception] = useState<boolean>(false);
  const [humanMisconceptionLabel, setHumanMisconceptionLabel] = useState<string>('');
  const [humanNotes, setHumanNotes] = useState<string>('');

  // AI Evaluation in Form
  const [isAiEvaluating, setIsAiEvaluating] = useState<boolean>(false);
  const [evaluatedAi, setEvaluatedAi] = useState<HumanAuditRating['aiDiagnosis'] | null>(null);

  // Load existing real human ratings from IndexedDB
  const refreshRatings = async () => {
    setIsLoading(true);
    try {
      const data = await getAllHumanRatings();
      setRatings(data);
    } catch (err) {
      console.error('Gagal mengambil rating manusia dari IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshRatings();
  }, []);

  const selectedNode =
    knowledgeNodes.find((n) => n.id === selectedNodeId) ||
    NARROW_DOMAIN_MATH_NODES.find((n) => n.id === selectedNodeId);

  // Trigger live AI evaluation for the given child utterance
  const handleRequestAiEvaluation = async () => {
    if (!childUtterance.trim()) return;
    setIsAiEvaluating(true);

    try {
      const response = await fetch('/api/diagnose/feynman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptName: selectedNode?.name || 'Konsep Matematika',
          childExplanation: childUtterance,
          ageGroup: selectedNode?.ageBracket || '10-12',
          conceptNodeId: selectedNode?.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      const hasMiscon = Boolean(data.misconceptions && data.misconceptions.length > 0);
      const score = typeof data.conceptualUnderstanding === 'number' ? data.conceptualUnderstanding : 0.5;

      setEvaluatedAi({
        score,
        hasMisconception: hasMiscon,
        misconceptionLabel: hasMiscon ? data.misconceptions.join(', ') : 'None',
        reasoning: data.feedbackSummary || 'Penilaian struktur logika penalaran.',
        usedFallback: Boolean(data.usedFallback),
        source: data.source || 'Workers AI (@cf/qwen/qwen3-30b-a3b-fp8)',
        fallbackReason: data.fallbackReason,
        evaluatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      // Deterministic fallback rule-based diagnostic
      const hasMiscon = childUtterance.length < 15 || childUtterance.toLowerCase().includes('hafal');
      setEvaluatedAi({
        score: hasMiscon ? 0.35 : 0.8,
        hasMisconception: hasMiscon,
        misconceptionLabel: hasMiscon ? 'Superficial heuristic' : 'None',
        reasoning: 'Evaluasi fallback heuristik lokal: analisis panjang kalimat dan struktur sebab-akibat.',
        usedFallback: true,
        source: 'Deterministic Rule Engine (Offline Fallback)',
        fallbackReason: err?.message || 'Koneksi jaringan terputus',
        evaluatedAt: new Date().toISOString(),
      });
    } finally {
      setIsAiEvaluating(false);
    }
  };

  // Save new human audit rating to IndexedDB
  const handleSaveRating = async () => {
    if (!childUtterance.trim()) return;

    const discrepancyDelta = evaluatedAi
      ? Math.abs(humanScore - evaluatedAi.score)
      : undefined;

    const isConcordant = evaluatedAi
      ? humanHasMisconception === evaluatedAi.hasMisconception && (discrepancyDelta ?? 1.0) <= 0.35
      : undefined;

    const newRating: HumanAuditRating = {
      id: `rating-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      nodeId: selectedNode?.id || selectedNodeId,
      nodeName: selectedNode?.name || 'Konsep Tidak Dikenal',
      childUtterance: childUtterance.trim(),
      contextSource,
      contextDetails: contextDetails.trim() || undefined,
      ratedAt: new Date().toISOString(),
      raterRole,
      raterName: raterName.trim() || undefined,
      humanScore,
      humanHasMisconception,
      humanMisconceptionLabel: humanHasMisconception
        ? (humanMisconceptionLabel.trim() || 'Miskonsepsi terdeteksi manusia')
        : undefined,
      humanNotes: humanNotes.trim() || 'Observasi penalaran anak oleh manusia.',
      aiDiagnosis: evaluatedAi || undefined,
      discrepancyDelta,
      isConcordant,
      isRealData: true,
    };

    await persistHumanRating(newRating);
    await refreshRatings();

    // Reset Form
    setChildUtterance('');
    setHumanNotes('');
    setHumanMisconceptionLabel('');
    setEvaluatedAi(null);
    setShowAddModal(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus entri rating manusia ini dari IndexedDB lokal?')) {
      await deleteHumanRating(id);
      await refreshRatings();
    }
  };

  // Metrics computation over real data (Zero-Lie: No fake data injection!)
  const totalCases = ratings.length;
  const casesWithAi = ratings.filter((r) => r.aiDiagnosis);
  const totalWithAi = casesWithAi.length;

  const avgHumanScore =
    totalCases > 0
      ? ratings.reduce((sum, r) => sum + r.humanScore, 0) / totalCases
      : 0;

  const avgAiScore =
    totalWithAi > 0
      ? casesWithAi.reduce((sum, r) => sum + (r.aiDiagnosis?.score || 0), 0) / totalWithAi
      : 0;

  const avgMae =
    totalWithAi > 0
      ? casesWithAi.reduce((sum, r) => sum + (r.discrepancyDelta || 0), 0) / totalWithAi
      : 0;

  const concordantCount = casesWithAi.filter((r) => r.isConcordant).length;
  const concordanceRate = totalWithAi > 0 ? (concordantCount / totalWithAi) * 100 : 0;

  const aiLiveCount = casesWithAi.filter((r) => !r.aiDiagnosis?.usedFallback).length;
  const aiFallbackCount = casesWithAi.filter((r) => r.aiDiagnosis?.usedFallback).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Jalur Rating Manusia Riil (Human-in-the-Loop)</span>
              </span>
              <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Penyimpanan Lokal: IndexedDB
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <span>Audit Komparasi Manusia vs AI (Zero-Lie Dashboard)</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Arsitektur jujur: Data jawaban dan rating tersimpan aman di peramban pengguna. Tidak ada generator angka palsu.
              Seluruh statistik dihitung murni dari jawaban anak nyata yang dinilai oleh orang tua atau pendidik.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-950/40 flex items-center gap-2 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Catat Jawaban & Beri Rating</span>
            </button>

            <button
              onClick={refreshRatings}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs transition"
              title="Segarkan data dari IndexedDB"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('real_ratings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'real_ratings'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Data Manusia Riil ({totalCases} Kasus)</span>
          </button>
          <button
            onClick={() => setActiveTab('synthetic_info')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'synthetic_info'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Pemisahan Tegas vs Probe Sintetis</span>
          </button>
        </div>
      </div>

      {activeTab === 'real_ratings' ? (
        <>
          {/* Zero-Lie Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Total Kasus Manusia Riil</div>
              <div className="text-2xl font-bold font-mono text-purple-300">
                {totalCases}{' '}
                <span className="text-xs text-slate-500 font-normal">kasus tersimpan</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {totalWithAi} terpasang evaluasi AI
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Rata-rata Skor: Manusia vs AI</div>
              <div className="text-xl font-bold font-mono text-white flex items-center gap-2">
                <span className="text-purple-300">{(avgHumanScore * 100).toFixed(0)}%</span>
                <span className="text-slate-600 text-xs">vs</span>
                <span className="text-cyan-300">{totalWithAi > 0 ? `${(avgAiScore * 100).toFixed(0)}%` : '-'}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Selisih Rata-rata (MAE): {totalWithAi > 0 ? (avgMae * 100).toFixed(1) + '%' : '-'}
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Konkordansi Kualitatif Manusia vs AI</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {totalWithAi > 0 ? `${concordanceRate.toFixed(0)}%` : '-'}
              </div>
              <div className="text-[10px] text-slate-400">
                {totalWithAi > 0
                  ? `${concordantCount} dari ${totalWithAi} kasus cocok`
                  : 'Belum ada data AI terpasang'}
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Integritas Provenance AI</div>
              <div className="text-sm font-bold font-mono text-slate-200 mt-1">
                <span className="text-emerald-400">{aiLiveCount} Live</span> ·{' '}
                <span className="text-amber-400">{aiFallbackCount} Fallback</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Transparansi penuh sumber inferensi
              </div>
            </div>
          </div>

          {/* Honest Status Note Banner */}
          {totalCases === 0 ? (
            <div className="p-6 bg-slate-950/60 border border-dashed border-slate-700 rounded-2xl text-center space-y-3">
              <UserCheck className="w-10 h-10 text-purple-400 mx-auto opacity-70" />
              <div className="text-sm font-bold text-slate-200">
                Belum Ada Rating Observasi Manusia Riil Tersimpan di IndexedDB
              </div>
              <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                Sesuai prinsip <strong>Zero-Lie</strong>: sistem tidak mengisi dashboard ini dengan data sintetis tiruan.
                Klik tombol <strong>"+ Catat Jawaban & Beri Rating"</strong> di atas untuk memasukkan jawaban anak yang Anda amati hari ini, atau lakukan audit pada dialog Tutor Sokrates.
              </p>
            </div>
          ) : totalCases < 5 ? (
            <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center gap-3 text-xs text-indigo-200">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Keterangan Sampel Awal:</strong> Tersedia {totalCases} kasus manusia riil. Jumlah ini belum mencukupi untuk generalisasi statistik luas, namun seluruh angka konkordansi di atas dihitung 100% dari data otentik tanpa fabrikasi.
              </span>
            </div>
          ) : null}

          {/* Real Human Ratings Table / Card List */}
          {totalCases > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-200">
                  Daftar Rekaman Kasus Manusia Riil ({ratings.length} entri):
                </span>
                <span className="font-mono text-[11px]">
                  Sumber: IndexedDB ({`STORES.HUMAN_RATINGS`})
                </span>
              </div>

              <div className="space-y-3">
                {ratings.map((r) => {
                  const hasAi = Boolean(r.aiDiagnosis);
                  const delta = r.discrepancyDelta ?? 0;
                  const isConcordant = r.isConcordant;

                  return (
                    <div
                      key={r.id}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition"
                    >
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 text-[10px] font-bold font-mono">
                            DATA MANUSIA RIIL
                          </span>
                          <strong className="text-xs text-white">{r.nodeName}</strong>
                          <span className="text-slate-600">·</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(r.ratedAt).toLocaleString('id-ID')}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            Penilai: {r.raterRole} {r.raterName ? `(${r.raterName})` : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {hasAi && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                                isConcordant
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                                  : 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                              }`}
                            >
                              {isConcordant ? '✓ KONKORDAN' : '⚠ DIVERGEN'} (Δ {(delta * 100).toFixed(0)}%)
                            </span>
                          )}

                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                            title="Hapus rekaman ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Child Utterance */}
                      <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1">
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          Ujaran / Jawaban Anak Riil:
                        </div>
                        <p className="text-xs text-slate-100 font-serif italic leading-relaxed">
                          "{r.childUtterance}"
                        </p>
                        {r.contextDetails && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Konteks: {r.contextDetails} ({r.contextSource})
                          </div>
                        )}
                      </div>

                      {/* Side by Side: Human vs AI */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* Human Column */}
                        <div className="p-3 bg-purple-950/20 border border-purple-900/40 rounded-lg space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-purple-300 flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                              <span>Penilaian Manusia:</span>
                            </span>
                            <span className="font-mono font-bold text-purple-200">
                              Skor: {(r.humanScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300">
                            <strong>Miskonsepsi:</strong>{' '}
                            {r.humanHasMisconception ? (
                              <span className="text-rose-300 font-semibold">{r.humanMisconceptionLabel || 'Terdeteksi'}</span>
                            ) : (
                              <span className="text-emerald-400">Tidak Ada (Paham Struktural)</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 italic">
                            "{r.humanNotes}"
                          </p>
                        </div>

                        {/* AI Column */}
                        <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-lg space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                              <Brain className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Diagnosis AI:</span>
                            </span>
                            <span className="font-mono font-bold text-cyan-200">
                              {hasAi ? `Skor: ${((r.aiDiagnosis?.score || 0) * 100).toFixed(0)}%` : 'Belum diuji'}
                            </span>
                          </div>

                          {hasAi ? (
                            <>
                              <div className="text-[11px] text-slate-300">
                                <strong>Miskonsepsi:</strong>{' '}
                                {r.aiDiagnosis?.hasMisconception ? (
                                  <span className="text-rose-300 font-semibold">
                                    {r.aiDiagnosis.misconceptionLabel || 'Terdeteksi'}
                                  </span>
                                ) : (
                                  <span className="text-emerald-400">Tidak Terdeteksi</span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-2">
                                "{r.aiDiagnosis?.reasoning}"
                              </p>
                              <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1 mt-1">
                                <span>Sumber: {r.aiDiagnosis?.source}</span>
                                {r.aiDiagnosis?.usedFallback && (
                                  <span className="text-amber-400 font-semibold">[Fallback]</span>
                                )}
                              </div>
                            </>
                          ) : (
                            <p className="text-[11px] text-slate-500 italic">
                              Kasus ini belum dipasangkan dengan diagnosis AI.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Synthetic Info Tab: Clear Separation */
        <div className="bg-[#0b0f1e] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-indigo-300 text-sm font-bold">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Pemisahan Tegas Antara Data Manusia Riil dan Probe Sintetis</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Menjawab <strong>Temuan 9</strong> pada KNOWN_ISSUES.md: Matriks benchmark 52-node yang diturunkan dari literatur kognitif (Mack, Carpenter, Kieran, dll.) berfungsi sebagai <strong>probe pengetesan struktural dan stabilitas semantik algoritma</strong>. Matriks tersebut <em>bukan</em> data rating manusia riil.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-purple-950/20 border border-purple-800/40 rounded-xl space-y-2">
              <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                <span>1. Data Manusia Riil (Tab Ini)</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Berasal dari ucapan anak nyata (di lab, dialog Sokrates, atau observasi orang tua).</li>
                <li>Dinilai langsung oleh manusia (orang tua/pendidik).</li>
                <li>Tersimpan secara kedaulatan di IndexedDB browser.</li>
                <li>Tidak dicampur dengan generator deterministik.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-2">
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>2. Synthetic Probe (Matriks 52-Node)</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Ditujukan untuk menguji ketahanan Layer 0, 1, dan 2 (Perturbation Survival).</li>
                <li>Memverifikasi bahwa sensor AI tidak rapuh pada parafrase sinonim.</li>
                <li>Menjamin 8 klaster domain sempit tercakup secara struktural.</li>
                <li>Ditempatkan di tab pengujian teknis (Tahap 2 Harness), bukan klaim manusia riil.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Dialog Input Kasus Manusia Riil Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f1424] border border-purple-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <span>Catat Jawaban Anak Riil & Beri Rating Manusia</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Data disimpan ke IndexedDB browser perangkat Anda sebagai Ground Truth otentik.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Select Node */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Pilih Simpul Konsep:
                </label>
                <select
                  value={selectedNodeId}
                  onChange={(e) => setSelectedNodeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                >
                  <optgroup label="Domain Sempit Matematika (52 Node)">
                    {NARROW_DOMAIN_MATH_NODES.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Simpul Graf Lainnya">
                    {knowledgeNodes
                      .filter((n) => !n.id.startsWith('math-'))
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.domain})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Context Source & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Sumber Konteks Observasi:
                  </label>
                  <select
                    value={contextSource}
                    onChange={(e) => setContextSource(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="direct_observation">Observasi Langsung Percakapan</option>
                    <option value="homework">Latihan Soal / PR</option>
                    <option value="lab_simulation">Interaksi Lab Simulasi</option>
                    <option value="socratic_tutor">Dialog Tutor Sokrates</option>
                    <option value="other">Konteks Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Keterangan Tambahan Konteks (Opsional):
                  </label>
                  <input
                    type="text"
                    value={contextDetails}
                    onChange={(e) => setContextDetails(e.target.value)}
                    placeholder="Misal: Saat memotong pizza di meja makan..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Child Utterance Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200">
                    Ujaran / Jawaban Anak Riil (Verbatim):
                  </label>
                  <span className="text-[10px] text-purple-300">
                    Tulis persis apa yang dikatakan anak
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={childUtterance}
                  onChange={(e) => setChildUtterance(e.target.value)}
                  placeholder="Ketik apa yang diucapkan anak secara langsung tanpa diedit..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Button: Trigger Live AI Evaluation */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Uji Diagnosis AI Terhadap Jawaban Ini:</span>
                  </span>
                  <button
                    type="button"
                    disabled={!childUtterance.trim() || isAiEvaluating}
                    onClick={handleRequestAiEvaluation}
                    className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {isAiEvaluating ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Menganalisis...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>Jalankan Diagnosis AI Live</span>
                      </>
                    )}
                  </button>
                </div>

                {evaluatedAi && (
                  <div className="p-3 bg-cyan-950/40 border border-cyan-600/40 rounded-lg text-xs space-y-1 animate-fade-in">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-cyan-300">
                        Skor AI: {(evaluatedAi.score * 100).toFixed(0)}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {evaluatedAi.hasMisconception ? '⚠ Miskonsepsi' : '✓ Pemahaman Valid'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic">
                      "{evaluatedAi.reasoning}"
                    </p>
                    <div className="text-[9px] font-mono text-slate-400">
                      Sumber: {evaluatedAi.source}
                    </div>
                  </div>
                )}
              </div>

              {/* Human Assessment Fields */}
              <div className="space-y-3 p-4 bg-purple-950/20 border border-purple-800/40 rounded-xl">
                <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Penilaian Manusia (Orang Tua / Pendidik):</span>
                </div>

                {/* Score Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Skor Penguasaan Sejati:</span>
                    <strong className="text-purple-300 font-mono text-sm">
                      {(humanScore * 100).toFixed(0)}%
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round(humanScore * 100)}
                    onChange={(e) => setHumanScore(Number(e.target.value) / 100)}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                {/* Has Misconception Toggle */}
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-300">Apakah ada miskonsepsi?</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="hasMiscon"
                      checked={!humanHasMisconception}
                      onChange={() => setHumanHasMisconception(false)}
                      className="accent-purple-500"
                    />
                    <span className="text-slate-300">Tidak (Paham)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="hasMiscon"
                      checked={humanHasMisconception}
                      onChange={() => setHumanHasMisconception(true)}
                      className="accent-purple-500"
                    />
                    <span className="text-slate-300">Ya, Ada Miskonsepsi</span>
                  </label>
                </div>

                {humanHasMisconception && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Nama / Pola Miskonsepsi:
                    </label>
                    <input
                      type="text"
                      value={humanMisconceptionLabel}
                      onChange={(e) => setHumanMisconceptionLabel(e.target.value)}
                      placeholder={selectedNode?.commonMisconceptions?.[0]?.misconception || 'Misal: Menjumlahkan penyebut langsung'}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600"
                    />
                  </div>
                )}

                {/* Human Notes */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Catatan Kualitatif Pengamatan Manusia:
                  </label>
                  <textarea
                    rows={2}
                    value={humanNotes}
                    onChange={(e) => setHumanNotes(e.target.value)}
                    placeholder="Misal: Anak memahami konsep pembagian adil saat ditanya langsung, tapi ragu-ragu saat menuliskan simbolnya..."
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 placeholder:text-slate-600"
                  />
                </div>

                {/* Rater Profile */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400">Peran Penilai:</label>
                    <select
                      value={raterRole}
                      onChange={(e) => setRaterRole(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300"
                    >
                      <option value="parent">Orang Tua</option>
                      <option value="educator">Pendidik / Guru</option>
                      <option value="subject_expert">Pakar Bidang Studi</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Nama Penilai (Opsional):</label>
                    <input
                      type="text"
                      value={raterName}
                      onChange={(e) => setRaterName(e.target.value)}
                      placeholder="Nama Anda"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!childUtterance.trim()}
                onClick={handleSaveRating}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-900/40 transition"
              >
                Simpan Rating ke IndexedDB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
