import React, { useState, useRef } from 'react';
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Database,
  Download,
  Upload,
  HardDrive,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Info,
  Cpu,
  Brain,
  RefreshCw,
  Trash2,
  UserCheck,
} from 'lucide-react';
import {
  CognitiveDomainTelemetry,
  EvidenceEntry,
  ActiveTrajectory,
  LearnerNodeState,
  KnowledgeNode,
} from '../types';
import { calculateDeterministicEpistemicDebt } from '../engine/deterministicCore';

import {
  ParentCalibrationSettings,
  DEFAULT_PARENT_CALIBRATION,
} from '../engine/evidenceTriangulation';

interface ParentTelemetryDashboardProps {
  telemetry: CognitiveDomainTelemetry[];
  evidenceLogs: EvidenceEntry[];
  learnerNodes: Record<string, LearnerNodeState>;
  knowledgeNodes: KnowledgeNode[];
  activeTrajectory: ActiveTrajectory;
  knowledgeStability: number;
  criticalDebt: 'LOW' | 'MEDIUM' | 'HIGH';
  onNavigateToStealthProject: () => void;
  onOpenDeterministicEngine?: () => void;
  onExportJSON?: () => void;
  onImportJSON?: (file: File) => void;
  onResetData?: () => void;
  onClearAllData?: () => void;
  parentCalibration?: ParentCalibrationSettings;
  onUpdateParentCalibration?: (settings: ParentCalibrationSettings) => void;
  onApplyParentAudit?: (evidenceId: string, parentScore: number, notes: string) => void;
  storageInfo?: {
    usageMb: number;
    quotaMb: number;
    percentageUsed: number;
    isSupported: boolean;
  };
}

export const ParentTelemetryDashboard: React.FC<ParentTelemetryDashboardProps> = ({
  telemetry,
  evidenceLogs,
  learnerNodes,
  knowledgeNodes,
  activeTrajectory,
  knowledgeStability,
  criticalDebt,
  onNavigateToStealthProject,
  onOpenDeterministicEngine,
  onExportJSON,
  onImportJSON,
  onResetData,
  onClearAllData,
  parentCalibration = DEFAULT_PARENT_CALIBRATION,
  onUpdateParentCalibration,
  onApplyParentAudit,
  storageInfo,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [exportNotice, setExportNotice] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [auditingEntryId, setAuditingEntryId] = useState<string | null>(null);
  const [auditScore, setAuditScore] = useState<number>(0.8);
  const [auditNotes, setAuditNotes] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLearnerNodeKeys = Object.keys(learnerNodes);
  const totalLearnerNodes = activeLearnerNodeKeys.length;

  // Dynamic calculation of Transfer Strength across all active nodes (0 if empty)
  const dynamicTransferStrength = totalLearnerNodes === 0
    ? 0
    : Math.round(
        (Object.values(learnerNodes).reduce((sum, n) => sum + (n.mastery?.transfer || 0), 0) /
          totalLearnerNodes) * 100
      );

  // Dynamic calculation of cognitive stage solidness (Piaget & Vygotsky development spectrum)
  const computeBracketStats = (bracket: '1-3' | '4-6' | '7-9' | '10-12') => {
    const bracketNodes = knowledgeNodes.filter((n) => n.ageBracket === bracket);
    const total = bracketNodes.length;
    if (total === 0 || totalLearnerNodes === 0) {
      return { total, masteredCount: 0, solidPercent: 0, statusLabel: '0% (Belum Ada Aktivitas)' };
    }
    const mastered = bracketNodes.filter((n) => {
      const st = learnerNodes[n.id];
      return st && st.mastery && st.mastery.understanding >= 0.70;
    });
    const percent = Math.round((mastered.length / total) * 100);
    const label = percent >= 95 ? `${percent}% Solid` : percent > 0 ? `${percent}% Konsolidasi` : '0% Belum Terbuka';
    return { total, masteredCount: mastered.length, solidPercent: percent, statusLabel: label };
  };

  const stage1 = computeBracketStats('1-3');
  const stage2 = computeBracketStats('4-6');
  const stage3 = computeBracketStats('7-9');
  const stage4 = computeBracketStats('10-12');

  // Dynamic ranking of top epistemic debt risk nodes ONLY for existing tracked nodes
  const riskRankedNodes = totalLearnerNodes === 0
    ? []
    : knowledgeNodes
        .filter((node) => learnerNodes[node.id] !== undefined)
        .map((node) => {
          const state = learnerNodes[node.id];
          const decay = state.decayRate || 0;
          const debtAssessment = calculateDeterministicEpistemicDebt(node, state);
          const debt: number = debtAssessment.debtRiskScore;
          return {
            node,
            state,
            decay,
            debt,
          };
        })
        .sort((a, b) => b.debt - a.debt || b.decay - a.decay)
        .slice(0, 4);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportJSON) {
      onImportJSON(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
              <div className={`text-2xl font-extrabold font-mono ${
                criticalDebt === 'HIGH' ? 'text-rose-400' : criticalDebt === 'MEDIUM' ? 'text-amber-400' : 'text-cyan-400'
              }`}>
                {criticalDebt === 'HIGH' ? 'HIGH' : criticalDebt === 'MEDIUM' ? 'ELEVATED' : 'LOW'}
              </div>
              <span className="text-[10px] text-slate-400 block">Predictive maintenance aktif</span>
            </div>

            <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Transfer Strength</span>
              <div className="text-2xl font-extrabold text-purple-400 font-mono">
                {dynamicTransferStrength}%
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
              <span className={`text-[10px] font-mono font-bold ${stage1.solidPercent >= 80 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {stage1.statusLabel} ({stage1.masteredCount}/{stage1.total})
              </span>
            </div>
            <h4 className="text-xs font-bold text-white">Sensori-Motorik</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Permanensi objek fisik, subitisasi kuantitas kasar, dan kecocokan ruang topologis.
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${stage1.solidPercent}%` }}
              />
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-teal-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Umur 4 - 6 Tahun
              </span>
              <span className={`text-[10px] font-mono font-bold ${stage2.solidPercent >= 80 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {stage2.statusLabel} ({stage2.masteredCount}/{stage2.total})
              </span>
            </div>
            <h4 className="text-xs font-bold text-white">Pra-Operasional</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Konservasi volume Piaget, komparasi bobot kualitatif, dan pengenalan pola sekuensial.
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${stage2.solidPercent}%` }}
              />
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Umur 7 - 9 Tahun
              </span>
              <span className={`text-[10px] font-mono font-bold ${stage3.solidPercent >= 80 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {stage3.statusLabel} ({stage3.masteredCount}/{stage3.total})
              </span>
            </div>
            <h4 className="text-xs font-bold text-white">Operasional Konkret</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Kesetaraan relasional tanda (=), pemodelan balok spasial (Bar Model), dan algoritma diskrit.
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${stage3.solidPercent}%` }}
              />
            </div>
          </div>

          {/* Stage 4 */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Umur 10 - 12 Tahun
              </span>
              <span className={`text-[10px] font-mono font-bold ${stage4.solidPercent >= 80 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {stage4.statusLabel} ({stage4.masteredCount}/{stage4.total})
              </span>
            </div>
            <h4 className="text-xs font-bold text-white">Transisi Operasional Formal</h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Aljabar simbolik murni, mekanika fluida Archimedes, rekayasa multi-variabel & limit kalkulus.
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${stage4.solidPercent}%` }}
              />
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

          {/* Node Risk Table (Dynamically computed from actual graph & learner states) */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono px-2">
              <span>Node Pengetahuan</span>
              <span>Decay / Centrality</span>
              <span>Status Tindakan</span>
            </div>

            {riskRankedNodes.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 bg-slate-950/60 rounded-lg">
                Tidak ada risiko hutang kognitif terdeteksi.
              </div>
            ) : (
              riskRankedNodes.map(({ node, decay, debt }) => {
                const isHighRisk = debt >= 0.08 || decay >= 0.08;
                const isWarning = debt >= 0.04 || decay >= 0.04;

                return (
                  <div
                    key={node.id}
                    className={`p-2.5 rounded-lg flex items-center justify-between transition ${
                      isHighRisk
                        ? 'bg-amber-500/10 border border-amber-500/30'
                        : isWarning
                        ? 'bg-cyan-950/30 border border-cyan-500/20'
                        : 'bg-slate-950/60 border border-slate-800'
                    }`}
                  >
                    <div>
                      <strong className={`block ${isHighRisk ? 'text-amber-200' : 'text-slate-200'}`}>
                        {node.name}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Decay: {Math.round(decay * 100)}% · Centrality: {node.centrality.toFixed(2)} · Risk: {(debt * 100).toFixed(1)}%
                      </span>
                    </div>

                    {isHighRisk ? (
                      <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-950/80 px-2 py-1 rounded border border-teal-800">
                        Stealth Insertion: Aktif
                      </span>
                    ) : isWarning ? (
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-1 rounded border border-cyan-800/60">
                        Monitoring
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded">
                        Stabil
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Ground Truth Calibration (Parent vs AI) */}
      <div className="bg-[#0b1022] border border-indigo-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 font-mono">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>Audit Human-in-the-Loop: Ground Truth Orang Tua vs AI</span>
              </span>
              <span className="text-xs text-indigo-300 font-mono hidden sm:inline">Homeschooling Sovereign Principle</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Kedaulatan Evaluasi: Orang Tua Pemegang Otoritas Kebenaran
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Di aplikasi belajar dari rumah, orang tua adalah sumber kebenaran (<em>Ground Truth</em>) utama. Anda dapat mengatur bobot penilaian: jika Anda menguasai topik anak, Anda dapat memperbesar bobot observasi Anda. Jika materi terlalu teoritis (misal kalkulus abstrak), Anda dapat mengalihkan penilaian diagnostik pada AI dan lab empiris.
            </p>
          </div>

          {/* Current weight display */}
          <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-col items-end shrink-0 min-w-[200px]">
            <div className="text-[11px] text-slate-400 font-mono">Formula Pembobotan Aktif:</div>
            <div className="text-sm font-bold font-mono text-purple-300 mt-0.5">
              Ortu {(parentCalibration.parentWeight * 100).toFixed(0)}% · AI {(parentCalibration.aiWeight * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Mode: <span className="text-emerald-400 uppercase font-semibold">{parentCalibration.mode.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => {
              if (onUpdateParentCalibration) {
                onUpdateParentCalibration({
                  parentWeight: 0.80,
                  aiWeight: 0.20,
                  mode: 'human_dominant',
                  expertiseLevel: 'expert',
                });
              }
            }}
            className={`p-3 rounded-xl border text-left transition space-y-1 ${
              parentCalibration.mode === 'human_dominant'
                ? 'bg-purple-950/40 border-purple-500/80 ring-2 ring-purple-500/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Ortu Pakar Penuh</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200">80% / 20%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Ortu memahami materi & intuisi anak. Putusan ortu menjadi ground truth definitif penahan noise AI.
            </p>
          </button>

          <button
            onClick={() => {
              if (onUpdateParentCalibration) {
                onUpdateParentCalibration({
                  parentWeight: 0.50,
                  aiWeight: 0.50,
                  mode: 'balanced',
                  expertiseLevel: 'moderate',
                });
              }
            }}
            className={`p-3 rounded-xl border text-left transition space-y-1 ${
              parentCalibration.mode === 'balanced'
                ? 'bg-indigo-950/40 border-indigo-500/80 ring-2 ring-indigo-500/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Audit Berimbang (Co-Audit)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-200">50% / 50%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Kolaborasi seimbang: AI mendeteksi struktur logika bahasa, orang tua mengonfirmasi penalaran riil anak.
            </p>
          </button>

          <button
            onClick={() => {
              if (onUpdateParentCalibration) {
                onUpdateParentCalibration({
                  parentWeight: 0.15,
                  aiWeight: 0.85,
                  mode: 'ai_delegated',
                  expertiseLevel: 'novice',
                });
              }
            }}
            className={`p-3 rounded-xl border text-left transition space-y-1 ${
              parentCalibration.mode === 'ai_delegated'
                ? 'bg-cyan-950/40 border-cyan-500/80 ring-2 ring-cyan-500/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Pendampingan Penuh AI</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-200">15% / 85%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Pilihan jika ortu kurang menguasai materi lanjut. Evaluasi diserahkan ke AI & verifikasi lab empiris.
            </p>
          </button>
        </div>

        {/* Custom Weight Slider */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Setel Bobot Kustom Pakar Manusia (Orang Tua):</span>
            <span className="font-mono text-xs font-bold text-purple-300">
              {(parentCalibration.parentWeight * 100).toFixed(0)}% Ortu · {(parentCalibration.aiWeight * 100).toFixed(0)}% AI
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={Math.round(parentCalibration.parentWeight * 100)}
            onChange={(e) => {
              const pW = Number(e.target.value) / 100;
              const aW = Number((1.0 - pW).toFixed(2));
              let mode: 'human_dominant' | 'balanced' | 'ai_delegated' = 'balanced';
              if (pW >= 0.70) mode = 'human_dominant';
              else if (pW <= 0.30) mode = 'ai_delegated';

              if (onUpdateParentCalibration) {
                onUpdateParentCalibration({
                  parentWeight: pW,
                  aiWeight: aW,
                  mode,
                  expertiseLevel: parentCalibration.expertiseLevel,
                });
              }
            }}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0% (AI Penuh)</span>
            <span>50% (Co-Audit Seimbang)</span>
            <span>100% (Pakar Ortu Mutlak)</span>
          </div>
        </div>
      </div>

      {/* Local Browser Storage (IndexedDB) & Data Sovereignty Section */}
      <div className="bg-[#0b0f1e] border border-cyan-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Penyimpanan Lokal Browser: IndexedDB Aktif</span>
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Kapasitas Sesuai Storage HP</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Kedaulatan Data & Log Bukti Tanpa Ketergantungan Server Pihak Ketiga
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Seluruh progress, rekaman telemetri, dan log bukti kausal disimpan langsung di dalam <strong>IndexedDB</strong> browser perangkat ini. Ruang penyimpanan aman dan berkapasitas besar (ratusan MB hingga puluhan GB), tidak dibatasi kuota 5MB standar localStorage.
            </p>
          </div>

          {/* Storage telemetry pill */}
          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800/90 flex flex-col items-end shrink-0">
            <div className="text-[11px] text-slate-400 font-mono">Estimasi Kuota Storage HP:</div>
            <div className="text-sm font-bold font-mono text-cyan-300">
              {storageInfo?.usageMb.toFixed(2) || '0.15'} MB / ~{storageInfo?.quotaMb ? (storageInfo.quotaMb > 1024 ? (storageInfo.quotaMb / 1024).toFixed(1) + ' GB' : storageInfo.quotaMb + ' MB') : '10+ GB'}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
              ✓ {evidenceLogs.length} Entri Bukti · {totalLearnerNodes} Node Terlacak
            </div>
          </div>
        </div>

        {/* Data Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800/80">
          <button
            id="btn-export-full-db"
            onClick={onExportJSON || handleExportData}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Cadangan Lengkap (JSON)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            id="btn-import-full-db"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Impor / Pulihkan Cadangan JSON</span>
          </button>

          <button
            id="btn-reset-demo-db"
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ml-auto"
            title="Pulihkan dataset demonstrasi awal untuk keperluan pengujian"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Pulihkan Dataset Contoh Baseline</span>
          </button>

          <button
            id="btn-clear-empty-db"
            onClick={() => setShowClearConfirm(true)}
            className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
            title="Hapus seluruh data dan kosongkan profil belajar anak sepenuhnya"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Hapus Bersih Semua Data (Kosongkan Profil)</span>
          </button>
        </div>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="p-4 bg-rose-950/70 border border-rose-700 rounded-xl space-y-2.5 animate-fade-in">
            <div className="flex items-center gap-2 text-rose-200 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Konfirmasi Hapus Bersih & Kosongkan Seluruh Data:</span>
            </div>
            <p className="text-[11px] text-rose-200/90 leading-relaxed">
              Tindakan ini akan <strong>menghapus bersih seluruh data node anak dan log bukti</strong> di IndexedDB lokal browser ini. Setelah dihapus, statistik akan kembali ke <strong>0 (kosong) tanpa data tiruan atau hardcoded</strong>. Pastikan Anda telah mengunduh cadangan JSON jika ingin menyimpan rekaman sebelumnya.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  if (onClearAllData) onClearAllData();
                  setShowClearConfirm(false);
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold shadow"
              >
                Ya, Hapus Bersih Seluruhnya
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Reset Demo Baseline Confirmation Modal */}
        {showResetConfirm && (
          <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-2.5 animate-fade-in">
            <div className="flex items-center gap-2 text-cyan-200 text-xs font-bold">
              <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Pulihkan Dataset Contoh Baseline:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Tindakan ini akan memulihkan sampel data demonstrasi awal (graf kognitif 1-12 tahun & contoh bukti log) ke dalam IndexedDB lokal Anda untuk keperluan pengujian dan demonstrasi sistem.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  if (onResetData) onResetData();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold shadow"
              >
                Pulihkan Sampel Demo
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        )}
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
          {filteredEvidence.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800 text-slate-400 space-y-2">
              <Database className="w-8 h-8 text-slate-600 mx-auto opacity-50" />
              <div className="text-xs font-bold text-slate-300">Belum Ada Log Bukti Tersimpan di IndexedDB</div>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
                Seluruh telemetri simulasi lab dan percakapan Sokrates disimpan di IndexedDB browser lokal tanpa server telemetry pihak ketiga. Buka <strong>Lab Simulasi & Proyek</strong> atau <strong>Tutor Socratic AI</strong> untuk mulai merekam bukti pemikiran anak.
              </p>
            </div>
          ) : (
            filteredEvidence.map((entry) => (
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

                    {onApplyParentAudit && (
                      <button
                        onClick={() => {
                          if (auditingEntryId === entry.id) {
                            setAuditingEntryId(null);
                          } else {
                            setAuditingEntryId(entry.id);
                            setAuditScore(entry.feynmanDiagnosis?.conceptualUnderstanding || 0.8);
                            setAuditNotes('');
                          }
                        }}
                        className="ml-2 px-2 py-0.5 rounded bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/60 text-purple-200 text-[10px] font-semibold flex items-center gap-1 transition"
                      >
                        <Brain className="w-3 h-3 text-purple-400" />
                        <span>{auditingEntryId === entry.id ? 'Tutup' : 'Audit Ortu'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Parent Audit Console */}
                {auditingEntryId === entry.id && (
                  <div className="p-3 bg-purple-950/30 border border-purple-500/40 rounded-xl space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-200 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Audit Human-in-the-Loop (Koreksi Ortu):</span>
                      </span>
                      <span className="font-mono text-xs text-purple-300 font-bold">
                        Skor Evaluasi Ortu: {(auditScore * 100).toFixed(0)}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={Math.round(auditScore * 100)}
                      onChange={(e) => setAuditScore(Number(e.target.value) / 100)}
                      className="w-full accent-purple-500 cursor-pointer"
                    />

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={auditNotes}
                        onChange={(e) => setAuditNotes(e.target.value)}
                        placeholder="Catatan observasi orang tua (misal: Anak paham konsep, hanya grogi mengetik)..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-500"
                      />
                      <button
                        onClick={() => {
                          if (onApplyParentAudit) {
                            onApplyParentAudit(entry.id, auditScore, auditNotes);
                          }
                          setAuditingEntryId(null);
                        }}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold shrink-0 shadow"
                      >
                        Simpan Ground Truth
                      </button>
                    </div>
                  </div>
                )}

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
            ))
          )}
        </div>
      </div>
    </div>
  );
};
