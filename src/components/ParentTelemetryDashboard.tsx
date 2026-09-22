import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Database,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Info,
  Cpu,
  Brain,
} from 'lucide-react';
import {
  CognitiveDomainTelemetry,
  EvidenceEntry,
  ActiveTrajectory,
  LearnerNodeState,
} from '../types';

interface ParentTelemetryDashboardProps {
  telemetry: CognitiveDomainTelemetry[];
  evidenceLogs: EvidenceEntry[];
  learnerNodes: Record<string, LearnerNodeState>;
  activeTrajectory: ActiveTrajectory;
  knowledgeStability: number;
  criticalDebt: 'LOW' | 'MEDIUM' | 'HIGH';
  onNavigateToStealthProject: () => void;
  onOpenDeterministicEngine?: () => void;
}

export const ParentTelemetryDashboard: React.FC<ParentTelemetryDashboardProps> = ({
  telemetry,
  evidenceLogs,
  learnerNodes,
  activeTrajectory,
  knowledgeStability,
  criticalDebt,
  onNavigateToStealthProject,
  onOpenDeterministicEngine,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [exportNotice, setExportNotice] = useState<boolean>(false);

  // Filter evidence
  const filteredEvidence = evidenceLogs.filter((entry) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'decay') return entry.retentionStatus === 'decay_alert';
    if (selectedFilter === 'transfer') {
      return entry.actions.some((a) => a.actionType === 'transfer_success' || a.actionType === 'transfer_fail');
    }
    if (selectedFilter === 'misconception') {
      return entry.feynmanDiagnosis?.misconceptionDetected;
    }
    return true;
  });

  const renderTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up_triple':
        return <span className="text-emerald-400 font-bold font-mono text-sm tracking-tighter">↑↑↑</span>;
      case 'up_double':
        return <span className="text-emerald-400 font-bold font-mono text-sm tracking-tighter">↑↑</span>;
      case 'up':
        return <span className="text-emerald-400 font-bold font-mono text-sm">↑</span>;
      case 'down':
        return <span className="text-amber-400 font-bold font-mono text-sm">↓</span>;
      default:
        return <span className="text-slate-400 font-bold font-mono text-sm">→</span>;
    }
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify(
        {
          learner: 'Arya',
          exportTimestamp: new Date().toISOString(),
          principle: 'Parent Data Sovereignty (Asumsi #8 Dokumen Fondasi)',
          knowledgeStability,
          criticalDebt,
          telemetry,
          evidenceLogs,
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `arya_intelligence_os_evidence_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div id="parent-telemetry-container" className="space-y-6">
      {/* Smartwatch Banner - Section 9.2 Reference */}
      <div className="bg-gradient-to-r from-[#11172a] via-[#0f1b2d] to-[#16122c] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Health Telemetry untuk Pengetahuan
                </span>
                <span className="text-xs text-slate-400 font-mono">Model Belajar Individu</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-wide mt-1">
                ARYA · INTELLIGENCE OS
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluasi observable learning state: bukan tes IQ atau rapor statis, melainkan tren kapabilitas hidup.
              </p>
            </div>

            {/* Export data button */}
            <div className="flex items-center gap-2">
              <button
                id="export-evidence-json-btn"
                onClick={handleExportData}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ekspor Evidence Log (JSON)</span>
              </button>
            </div>
          </div>

          {/* Quick Domain Vector Trends (Section 9.2 Exact Mock) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {telemetry.map((t) => (
              <div key={t.domain} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium truncate">{t.domain.split(' ')[0]}</span>
                  {renderTrendIcon(t.trend)}
                </div>
                <div className="text-xs font-mono font-bold text-slate-200">
                  {t.stabilityScore}% Stabilitas
                </div>
                <div className="text-[10px] text-slate-500 truncate" title={t.demonstratedStage}>
                  {t.demonstratedStage}
                </div>
              </div>
            ))}
          </div>

          {/* Key Metric Blocks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Knowledge Stability</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {knowledgeStability}%
              </div>
              <span className="text-[10px] text-emerald-400/80 block">Fondasi berakar kuat</span>
            </div>

            <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Critical Debt</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {criticalDebt}
              </div>
              <span className="text-[10px] text-slate-400 block">Zero Critical Debt Policy</span>
            </div>

            <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Bottleneck Risk</span>
              <div className="text-2xl font-extrabold text-cyan-400 font-mono">
                LOW
              </div>
              <span className="text-[10px] text-slate-400 block">Predictive maintenance aktif</span>
            </div>

            <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Transfer Strength</span>
              <div className="text-2xl font-extrabold text-purple-400 font-mono">
                78%
              </div>
              <span className="text-[10px] text-purple-400/80 block">Mampu transfer lintas bidang</span>
            </div>
          </div>

          {/* Active Trajectory & System Action Box */}
          <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-semibold">
                  Active Trajectory
                </span>
                <span className="text-xs font-bold text-white">
                  {activeTrajectory.title}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                <strong>System Action:</strong> {activeTrajectory.systemActionNote}
              </p>
            </div>

            <button
              onClick={onNavigateToStealthProject}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow transition whitespace-nowrap self-start md:self-auto"
            >
              <span>Inspeksi Proyek Stealth Insertion</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Deterministic Core & Feynman Noise Shield Section */}
      <div className="bg-[#0b0f1e] border border-cyan-500/30 rounded-2xl p-5 space-y-3.5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Deterministic Core Architecture</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">Anti Single-Point-of-Failure</span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Tata Kelola Kurikulum Deterministik & Perlindungan Noise Feynman
            </h3>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              AI tidak menentukan kurikulum atau membuka prerequisite secara sepihak. Seluruh rekomendasi pengalaman belajar, formula peluruhan retensi (Ebbinghaus), dan gating penguasaan diatur oleh logika deterministik. Bobot diagnosis dialog AI dibatasi hingga 15% dan ditriangulasi dengan telemetri lab empiris (60%).
            </p>
          </div>

          {onOpenDeterministicEngine && (
            <button
              onClick={onOpenDeterministicEngine}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow transition whitespace-nowrap self-start sm:self-auto shrink-0"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Buka Engine & Kalibrasi</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-mono block">Aturan Prerequisite</span>
            <div className="text-xs font-bold text-emerald-400 font-mono">100% Deterministik</div>
            <span className="text-[10px] text-slate-500 block">Min. Understanding ≥70% & Recall ≥60%</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-mono block">Formula Peluruhan Retensi</span>
            <div className="text-xs font-bold text-cyan-400 font-mono">R(t) = exp( -Δt / S )</div>
            <span className="text-[10px] text-slate-500 block">Eksponensial Ebbinghaus, bukan tebakan</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-mono block">Triangulasi Bukti</span>
            <div className="text-xs font-bold text-purple-400 font-mono">Lab 60% · Transfer 25% · AI 15%</div>
            <span className="text-[10px] text-slate-500 block">Perisai diskrepansi buzzword aktif</span>
          </div>
        </div>
      </div>

      {/* Trajectory Milestone Spectrum (Umur 1 - 12 Tahun) */}
      <div className="bg-[#0e1322] border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Spektrum Perkembangan Kognitif (Cakupan Umur 1 - 12 Tahun)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Prinsip: <em>Age-Independent Trajectory (Tanpa Batch Umur)</em>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Stage 1 */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Umur 1 - 3 Tahun
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Solid</span>
            </div>
            <h4 className="text-xs font-bold text-white">Sensori-Motorik</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Permanensi objek fisik, subitisasi kuantitas kasar, dan kecocokan ruang topologis.
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full w-full" />
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Umur 4 - 6 Tahun
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">96% Solid</span>
            </div>
            <h4 className="text-xs font-bold text-white">Pra-Operasional</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Konservasi volume Piaget, komparasi bobot kualitatif, dan pengenalan pola sekuensial.
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full w-[96%]" />
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Umur 7 - 9 Tahun
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">91% Solid</span>
            </div>
            <h4 className="text-xs font-bold text-white">Operasional Konkret</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Kesetaraan relasional tanda (=), pemodelan balok spasial (Bar Model), dan algoritma diskrit.
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full w-[91%]" />
            </div>
          </div>

          {/* Stage 4 */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Umur 10 - 12 Tahun
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-bold">78% Konsolidasi</span>
            </div>
            <h4 className="text-xs font-bold text-white">Transisi Operasional Formal</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Aljabar simbolik murni, mekanika fluida Archimedes, rekayasa multi-variabel & limit kalkulus.
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full w-[78%]" />
            </div>
          </div>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Evidence Log berhasil diekspor. Data profil kognitif anak seutuhnya dimiliki dan diaudit oleh orang tua.</span>
        </div>
      )}

      {/* The 4 Loops Telemetry & Epistemic Debt Equation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* The 4 System Loops (Section 8) */}
        <div className="lg:col-span-6 bg-[#0f1424] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Empat Loop Sistem (Memelihara Perkembangan)</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Bukan LMS</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
              <div className="flex justify-between items-center font-semibold text-cyan-300">
                <span>1. Curiosity Loop</span>
                <span className="text-[10px] font-mono bg-cyan-950 px-1.5 py-0.5 rounded text-cyan-400">Aktif</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Eksplorasi/Build ➔ Kapabilitas baru ➔ Rasa ingin tahu baru. Tanpa streak anxiety atau FOMO.
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
              <div className="flex justify-between items-center font-semibold text-emerald-300">
                <span>2. Mastery Loop</span>
                <span className="text-[10px] font-mono bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-400">7 Level</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Evidence ➔ Assessment Socratic ➔ Hierarki Mastery. Verifikasi penguasaan berlapis hingga kemampuan transfer.
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 border border-amber-500/30 rounded-lg space-y-1">
              <div className="flex justify-between items-center font-semibold text-amber-300">
                <span>3. Repair Loop (Self-Healing)</span>
                <span className="text-[10px] font-mono bg-amber-950 px-1.5 py-0.5 rounded text-amber-400">Stealth Insertion</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Decay 15% pada aljabar terdeteksi ➔ Reconsolidation disisipkan ke Proyek Kapal Selam ➔ Fondasi pulih tanpa kelas remedial terpisah.
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
              <div className="flex justify-between items-center font-semibold text-purple-300">
                <span>4. Trajectory Loop</span>
                <span className="text-[10px] font-mono bg-purple-950 px-1.5 py-0.5 rounded text-purple-400">Non-Linear</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Analisis dependensi & bottleneck ➔ Kapabilitas berikutnya terbuka menuju kalkulus dan komputasi.
              </p>
            </div>
          </div>
        </div>

        {/* Epistemic Debt Radar & Formula (Section 7.4) */}
        <div className="lg:col-span-6 bg-[#0f1424] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Formulasi Epistemic Debt Risk</span>
            </h3>
            <span className="text-[10px] text-amber-300 font-mono bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800">
              Bagian 7.4
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs font-mono space-y-2">
            <div className="text-[11px] text-amber-300 font-bold">
              Debt Risk = Decay × Dependency Centrality × Future Relevance × Uncertainty
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Yang dijaga bukanlah zero decay (manusia wajar lupa), melainkan kelupaan pada konsep fondasi sentral yang akan meruntuhkan materi lanjutan.
            </p>
          </div>

          {/* Node Risk Table */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono px-2">
              <span>Node Pengetahuan</span>
              <span>Decay / Centrality</span>
              <span>Status Tindakan</span>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg flex items-center justify-between">
              <div>
                <strong className="text-amber-200 block">Aljabar Simbolik</strong>
                <span className="text-[10px] text-slate-400 font-mono">Decay: 15% · Centrality: 0.92</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-950/80 px-2 py-1 rounded border border-teal-800">
                Stealth Insertion: Aktif
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
              <div>
                <strong className="text-slate-200 block">Gaya Apung Archimedes</strong>
                <span className="text-[10px] text-slate-400 font-mono">Decay: 5% · Centrality: 0.85</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded">
                Stabil
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
              <div>
                <strong className="text-slate-200 block">Fondasi Kesetaraan</strong>
                <span className="text-[10px] text-slate-400 font-mono">Decay: 2% · Centrality: 0.95</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded">
                Mastered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Long-Term Evidence Log (Section 6.4) */}
      <div className="bg-[#0f1424] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Evidence Log: Rekam Jejak Pemikiran Seumur Hidup</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Prinsip Desain #4: <em>Simpan bukti (evidence), bukan persentase kelulusan semu. Catat apa yang dilakukan anak, bagaimana ia bernalar, dan di mana transfernya berhasil atau tertunda.</em>
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                selectedFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Bukti
            </button>
            <button
              onClick={() => setSelectedFilter('transfer')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                selectedFilter === 'transfer' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Transfer Bukti
            </button>
            <button
              onClick={() => setSelectedFilter('misconception')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                selectedFilter === 'misconception' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Miskonsepsi
            </button>
          </div>
        </div>

        {/* Evidence Table */}
        <div className="space-y-3">
          {filteredEvidence.map((entry) => (
            <div
              key={entry.id}
              className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 space-y-3 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-mono text-slate-400">{entry.timestamp}</span>
                  <span className="text-slate-600">·</span>
                  <strong className="text-xs text-white">{entry.conceptName}</strong>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-[10px] text-slate-400">Confidence:</span>
                  <span className="text-emerald-400 font-semibold">{entry.confidence.toUpperCase()}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[10px] text-slate-400">Retention:</span>
                  <span className="text-indigo-300 font-semibold">{entry.retentionStatus}</span>
                </div>
              </div>

              {/* Action List items */}
              <div className="space-y-1.5">
                {entry.actions.map((act, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0 mt-0.5">
                      {act.actionType.replace('_', ' ')}
                    </span>
                    <span className={act.actionType === 'transfer_fail' ? 'text-amber-300 italic' : ''}>
                      {act.description}
                    </span>
                  </div>
                ))}
              </div>

              {/* Feynman Sensor Diagnosis details */}
              {entry.feynmanDiagnosis && (
                <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                  <span>Konseptual: <strong className="text-cyan-300">{(entry.feynmanDiagnosis.conceptualUnderstanding * 100).toFixed(0)}%</strong></span>
                  <span>Kausalitas: <strong className="text-emerald-300">{(entry.feynmanDiagnosis.causalReasoning * 100).toFixed(0)}%</strong></span>
                  <span>Transfer: <strong className="text-amber-300">{(entry.feynmanDiagnosis.transferScore * 100).toFixed(0)}%</strong></span>
                  {entry.feynmanDiagnosis.misconceptionDetected && (
                    <span className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/60">
                      Miskonsepsi: {entry.feynmanDiagnosis.misconceptionDetected}
                    </span>
                  )}
                </div>
              )}

              {entry.notes && (
                <p className="text-[11px] text-slate-400 italic bg-slate-900/50 p-2 rounded">
                  Catatan Observasi: "{entry.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
