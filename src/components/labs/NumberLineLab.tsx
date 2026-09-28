import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  TrendingUp,
  Brain,
  Activity,
} from 'lucide-react';
import { useLabTelemetry } from '../../engine/useLabTelemetry';
import { deriveEmpiricalEvidenceFromTelemetry } from '../../engine/empiricalEvidenceDerivation';
import { EmpiricalSimulationEvidence } from '../../engine/evidenceTriangulation';
import { KnowledgeNode } from '../../types';

export type FitQuality = 'strong' | 'weak';

export interface MissionMapping {
  missionIndex: number;
  fit: FitQuality;
  rationale: string;
}

export const NUMBER_LINE_NODE_MAPPING: Record<string, MissionMapping> = {
  // --- Fit kuat: struktur misi memang mencerminkan konsep node secara langsung ---
  'math-frac-12-number-line-fractions': {
    missionIndex: 4,
    fit: 'strong',
    rationale: 'Node ini secara harfiah tentang titik pecahan di antara dua bilangan bulat (titik 1/2 = 0.5).',
  },
  'math-frac-18-benchmark-half': {
    missionIndex: 4,
    fit: 'strong',
    rationale: 'Misi ini secara presisi menguji patokan tolok ukur setengah (1/2 = 0.5) di antara 0 dan 1.',
  },
  'math-frac-24-improper-fractions': {
    missionIndex: 5,
    fit: 'strong',
    rationale: 'Lompatan melewati angka 1 (menuju 1.5 atau 3/2) mendemonstrasikan pecahan tak murni > 1.',
  },
  'math-frac-25-mixed-numbers': {
    missionIndex: 5,
    fit: 'strong',
    rationale: 'Posisi 1 1/2 (1 utuh + 1/2 = 1.5) membuktikan dekomposisi bilangan campuran pada garis spasial.',
  },
  'math-frac-13-equivalent-visual': {
    missionIndex: 6,
    fit: 'strong',
    rationale: 'Menunjukkan ekuivalensi koordinat: titik 2.5 setara dengan 5/2 atau 2 1/2 pada sumbu kontinu.',
  },
  'math-dec-35-fraction-decimal-link': {
    missionIndex: 4,
    fit: 'strong',
    rationale: 'Menghubungkan 1/2 pecahan dengan 0.5 desimal di titik koordinat yang identik.',
  },

  // --- Fit lemah: analogi representasional, konten lab belum menguji konsep target secara presisi ---
  'math-dec-34-tenths-hundredths': {
    missionIndex: 4,
    fit: 'weak',
    rationale: 'Analogi segmen garis [0, 1]; lab saat ini menguji 0.5 dan belum menyediakan partisi mikro perseratusan.',
  },
  'math-dec-36-comparing-decimals': {
    missionIndex: 6,
    fit: 'weak',
    rationale: 'Analogi posisi desimal tunggal (2.5); lab belum memuat antarmuka perbandingan dua nilai desimal berdampingan.',
  },
  'math-rat-42-ratio-tables': {
    missionIndex: 3,
    fit: 'weak',
    rationale: 'Analogi kelipatan; lompatan +2 berulang melatih intuisi kelipatan dasar, bukan tabel rasio formal.',
  },
  'math-rat-43-unit-rate': {
    missionIndex: 3,
    fit: 'weak',
    rationale: 'Analogi laju kelipatan; lab melatih langkah seragam namun belum mengisolasi variabel waktu/satuan.',
  },
  'math-rat-44-proportional-reasoning': {
    missionIndex: 3,
    fit: 'weak',
    rationale: 'Analogi kelipatan konstan; penalaran proporsional kompleks disederhanakan ke deret lompatan +2.',
  },
  'math-rat-45-constant-proportionality': {
    missionIndex: 3,
    fit: 'weak',
    rationale: 'Analogi translasi linear k; belum memuat parameterisasi konstanta kemiringan y = kx.',
  },
  'math-frac-33-reciprocal-inverse': {
    missionIndex: 3,
    fit: 'weak',
    rationale: 'Analogi keterbalikan; lompatan maju/mundur belum memodelkan balikan perkalian (reciprocal) pecahan.',
  },
  'math-frac-11-fraction-one-whole': {
    missionIndex: 0,
    fit: 'weak',
    rationale: 'Analogi pencapaian target jarak; lompatan mendarat di 5 satuan bulat, bukan partisi n/n = 1.',
  },
  'math-frac-23-sub-diff-denom': {
    missionIndex: 2,
    fit: 'weak',
    rationale: 'Analogi arah pengurangan mundur (8 - 3); menggunakan bilangan bulat, bukan operasi pecahan beda penyebut.',
  },
  'math-frac-07-num-denom-roles': {
    missionIndex: 4,
    fit: 'weak',
    rationale: 'Analogi spasial titik 1/2; manipulasi belum memisahkan peran pembilang dan penyebut secara terisolasi.',
  },
  'math-frac-15-simplifying-fractions': {
    missionIndex: 6,
    fit: 'weak',
    rationale: 'Analogi koordinat titik 2.5; lab belum memuat reduksi pembilang dan penyebut ke bentuk paling sederhana.',
  },
  'math-frac-16-comparing-same-denom': {
    missionIndex: 4,
    fit: 'weak',
    rationale: 'Analogi urutan sumbu horizontal; belum menyediakan perbandingan dua pecahan berpenyebut sama.',
  },
  'math-frac-17-comparing-same-num': {
    missionIndex: 4,
    fit: 'weak',
    rationale: 'Analogi urutan sumbu horizontal; belum membandingkan dua pecahan berpembilang sama.',
  },
  'math-pct-37-percentage-per-hundred': {
    missionIndex: 4,
    fit: 'weak',
    rationale: 'Analogi patokan separuh (0.5 = 50%); belum memuat kisi perseratusan skala penuh.',
  },
};

export function getMissionIndexForNode(nodeId?: string): number {
  if (!nodeId) return 0;
  return NUMBER_LINE_NODE_MAPPING[nodeId]?.missionIndex ?? 0;
}

interface NumberLineLabProps {
  onMasteryEvidence?: (concept: string, details: string) => void;
  onEmpiricalEvidence?: (evidence: EmpiricalSimulationEvidence) => void;
  nodeId?: string;
  activeNode?: KnowledgeNode;
}

export const NumberLineLab: React.FC<NumberLineLabProps> = ({
  onMasteryEvidence,
  onEmpiricalEvidence,
  nodeId,
  activeNode,
}) => {
  const telemetry = useLabTelemetry('number_line');
  const initialIndex = getMissionIndexForNode(nodeId);
  const [activeMissionIndex, setActiveMissionIndex] = useState<number>(() => initialIndex);

  const missions = [
    {
      title: 'Kardinalitas Jarak',
      prompt: 'Bantu katak melompat dari 0 menuju teratai angka 5.',
      startPos: 0,
      targetPos: 5,
      hint: 'Setiap 1 lompatan adalah penambahan 1 satuan jarak fisik.',
    },
    {
      title: 'Penjumlahan Spasial (3 + 4)',
      prompt: 'Mulai dari angka 3, lompat maju 4 langkah! Perhatikan di angka berapa katak mendarat.',
      startPos: 3,
      targetPos: 7,
      hint: 'Penjumlahan (3 + 4) di alam nyata adalah gabungan dua interval jarak: 3 langkah + 4 langkah = 7 langkah.',
    },
    {
      title: 'Operasi Pengurangan Spasial (Invers Lompatan)',
      prompt: 'Dari angka 8, lompat mundur sejauh 3 langkah (8 - 3).',
      startPos: 8,
      targetPos: 5,
      hint: 'Pengurangan adalah melangkah ke arah sebaliknya (kiri) pada sumbu ruang!',
    },
    {
      title: 'Lompatan Berkelipatan (+2, +2, +2)',
      prompt: 'Lakukan lompatan genap ganda 2 langkah sebanyak 3 kali dari 0 hingga mencapai teratai 6.',
      startPos: 0,
      targetPos: 6,
      hint: 'Lompatan berulang dengan interval sama (+2) adalah akar intuitif dari perkalian (3 × 2)!',
    },
    {
      title: 'Pecahan di Antara Bilangan Bulat (Titik 1/2 = 0.5)',
      prompt: 'Katak harus mendarat TEPAT di antara teratai 0 dan 1 — di titik tengah 1/2 (atau 0.5)!',
      startPos: 0,
      targetPos: 0.5,
      hint: 'Garis antara dua bilangan bulat bisa dibagi jadi bagian-bagian sama besar — itulah pecahan.',
    },
    {
      title: 'Pecahan Tak Murni & Bilangan Campuran (1 1/2 = 1.5)',
      prompt: 'Lompati angka 1 utuh lalu tambah setengah langkah lagi (1 + 1/2 = 1.5) untuk membuktikan pecahan tidak murni!',
      startPos: 0,
      targetPos: 1.5,
      hint: 'Pecahan tak murni dan bilangan campuran berada melampaui angka 1 pada garis bilangan yang sama.',
    },
    {
      title: 'Ekuivalensi & Skala Desimal (Titik 2.5 atau 5/2)',
      prompt: 'Lompat ke titik 2.5 (setara dengan 5/2 atau 2 1/2) untuk mengamati ekuivalensi desimal dan pecahan!',
      startPos: 0,
      targetPos: 2.5,
      hint: '2.5, 2 1/2, dan 5/2 adalah titik koordinat yang persis sama pada garis bilangan.',
    },
  ];

  const initialStart = missions[initialIndex]?.startPos ?? 0;
  const [currentPosition, setCurrentPosition] = useState<number>(() => initialStart);
  const [historyTrail, setHistoryTrail] = useState<number[]>([initialStart]);
  const [missionComplete, setMissionComplete] = useState<boolean>(false);

  const activeMapping = nodeId ? NUMBER_LINE_NODE_MAPPING[nodeId] : undefined;
  // Sumber kebenaran tunggal: ikuti activeNode.simulationAlignment
  const isDirect = activeNode?.simulationAlignment === 'direct';

  const maxTicks = 10;
  const ticks = Array.from({ length: maxTicks + 1 }, (_, i) => i);

  const handleJump = (delta: number) => {
    const nextPos = Math.max(0, Math.min(maxTicks, Math.round((currentPosition + delta) * 10) / 10));
    setCurrentPosition(nextPos);
    setHistoryTrail((prev) => [...prev.slice(-6), nextPos]);

    telemetry.recordParameterChange('frog_jump_delta', delta);
    telemetry.recordParameterChange('frog_position', nextPos);

    const activeM = missions[activeMissionIndex];
    const distance = Math.abs(nextPos - activeM.targetPos);
    const isCorrect = distance < 0.05;

    telemetry.recordVerificationAttempt(isCorrect, Math.min(1, distance / 5));

    if (isCorrect && !missionComplete) {
      setMissionComplete(true);
      const session = telemetry.finalizeSession();
      const evidence = deriveEmpiricalEvidenceFromTelemetry(session);
      if (onEmpiricalEvidence) {
        onEmpiricalEvidence(evidence);
      }
      if (onMasteryEvidence) {
        onMasteryEvidence(
          activeNode?.name || 'Garis Bilangan Spasial & Kardinalitas',
          `Anak menyelesaikan Misi "${activeM.title}" di posisi ${nextPos} (Akurasi: ${(evidence.accuracyScore * 100).toFixed(0)}%, Presisi: ${(evidence.manipulationPrecision * 100).toFixed(0)}%).`
        );
      }
    }
  };

  const handleResetToStart = () => {
    telemetry.recordReset();
    const start = missions[activeMissionIndex].startPos ?? 0;
    setCurrentPosition(start);
    setHistoryTrail([start]);
    setMissionComplete(false);
  };

  const selectMission = (idx: number) => {
    setActiveMissionIndex(idx);
    const start = missions[idx].startPos ?? 0;
    setCurrentPosition(start);
    setHistoryTrail([start]);
    setMissionComplete(false);
  };

  return (
    <div id="number-line-lab" className="bg-[#0b0f1d] rounded-2xl border border-slate-800 p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Umur 4 - 6 Tahun (Pra-Operasional)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
              Domain: Matematika
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span>Garis Bilangan Spasial & Kardinalitas (Number Line Jump Lab)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Membongkar miskonsepsi: Berhitung bukan sekadar nyanyian hafalan kata, melainkan perpindahan jarak fisik dan kumpulan kuantitas nyata!
          </p>
        </div>

        <button
          onClick={handleResetToStart}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 transition self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Kembali ke Awal</span>
        </button>
      </div>

      {/* Mission Card */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-indigo-500/30 space-y-2.5">
        {activeMapping && (
          <div className={`p-2 rounded-lg text-[11px] flex items-center justify-between gap-2 border ${
            isDirect
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <span className="font-semibold shrink-0">
              🎯 Rute Otomatis Konsep: {isDirect ? 'Kesesuaian Langsung (1-to-1 Fidelity)' : 'Mode Analogi Representasi'}
            </span>
            <span className="text-[10px] text-slate-300 italic truncate max-w-[65%]">
              {activeMapping.rationale}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Tantangan Belajar #{activeMissionIndex + 1}: {missions[activeMissionIndex].title}</span>
          </span>
          <div className="flex gap-1.5">
            {missions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => selectMission(idx)}
                className={`w-6 h-6 rounded text-[11px] font-bold transition ${
                  activeMissionIndex === idx
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-200 font-medium">{missions[activeMissionIndex].prompt}</p>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 italic">💡 {missions[activeMissionIndex].hint}</span>
          {missionComplete && (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Target Tercapai!</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Interactive Stage: Pond & Lily Pads on a Linear Number Line */}
      <div className="bg-[#060a16] rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
        {/* Real-time Mathematical Interpretation Box */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Posisi Katak Sekarang:</span>
            <span className="text-sm font-mono font-bold text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-700/40">
              {currentPosition % 1 === 0 ? `Angka ${currentPosition}` : `Pecahan / Desimal ${currentPosition}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Representasi Kuantitas Fisik:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.floor(currentPosition) }).map((_, i) => (
                <span
                  key={i}
                  className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-300 shadow-sm shadow-emerald-500/50"
                  title={`1 Satuan Penuh #${i + 1}`}
                />
              ))}
              {currentPosition % 1 !== 0 && (
                <span
                  className="w-2.5 h-2.5 rounded-l-full bg-cyan-400 border-l border-y border-cyan-300 shadow-sm shadow-cyan-500/50"
                  title="Setengah (1/2 atau 0.5) Satuan"
                />
              )}
              {currentPosition === 0 && (
                <span className="text-[11px] text-slate-500 italic">0 = Kosong (Ketiadaan Kuantitas)</span>
              )}
            </div>
          </div>
        </div>

        {/* The Number Line with Lily Pads */}
        <div className="w-full max-w-4xl py-12 px-4 relative">
          {/* Continuous Line Track */}
          <div className="h-2 bg-gradient-to-r from-emerald-600 via-indigo-600 to-cyan-600 rounded-full w-full relative">
            {/* Distance Fill from 0 to Current */}
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-indigo-400 rounded-full transition-all duration-300 shadow-md shadow-indigo-500/50"
              style={{ width: `${(currentPosition / maxTicks) * 100}%` }}
            />
          </div>

          {/* Floating Katak Avatar at continuous exact position */}
          <div
            className="absolute top-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-300 z-30"
            style={{ left: `${(currentPosition / maxTicks) * 100}%` }}
          >
            <div className="absolute -top-12 animate-bounce flex flex-col items-center">
              <span className="text-3xl filter drop-shadow">🐸</span>
              <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-700 whitespace-nowrap shadow">
                {currentPosition}
              </span>
            </div>
          </div>

          {/* Fractional Target Marker if targetPos is non-integer */}
          {missions[activeMissionIndex].targetPos % 1 !== 0 && (
            <div
              className="absolute top-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-15 pointer-events-none"
              style={{ left: `${(missions[activeMissionIndex].targetPos / maxTicks) * 100}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/40 text-amber-200 border-2 border-dashed border-amber-400 flex items-center justify-center font-bold text-[10px] animate-pulse shadow-lg">
                {missions[activeMissionIndex].targetPos}
              </div>
              <span className="text-[9px] text-amber-300 font-bold mt-1 uppercase tracking-wider">
                Target
              </span>
            </div>
          )}

          {/* Ticks & Lily Pads */}
          <div className="flex justify-between w-full absolute top-10 left-0 px-4 -translate-y-1/2">
            {ticks.map((tick) => {
              const isTarget = missions[activeMissionIndex].targetPos === tick;
              const isCurrent = Math.abs(currentPosition - tick) < 0.05;

              return (
                <div key={tick} className="flex flex-col items-center -translate-x-1/2">
                  {/* Lily Pad Circle */}
                  <button
                    onClick={() => {
                      setCurrentPosition(tick);
                      setHistoryTrail((prev) => [...prev.slice(-6), tick]);
                      telemetry.recordParameterChange('frog_click_position', tick);
                      const distance = Math.abs(tick - missions[activeMissionIndex].targetPos);
                      const isCorrect = distance < 0.05;
                      telemetry.recordVerificationAttempt(isCorrect, Math.min(1, distance / 5));

                      if (isCorrect && !missionComplete) {
                        setMissionComplete(true);
                        const session = telemetry.finalizeSession();
                        const evidence = deriveEmpiricalEvidenceFromTelemetry(session);
                        if (onEmpiricalEvidence) {
                          onEmpiricalEvidence(evidence);
                        }
                        if (onMasteryEvidence) {
                          onMasteryEvidence(
                            activeNode?.name || 'Garis Bilangan Spasial & Kardinalitas',
                            `Anak menyelesaikan Misi "${missions[activeMissionIndex].title}" di posisi ${tick} (Akurasi: ${(evidence.accuracyScore * 100).toFixed(0)}%, Presisi: ${(evidence.manipulationPrecision * 100).toFixed(0)}%).`
                          );
                        }
                      }
                    }}
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex flex-col items-center justify-center font-bold text-xs transition-all ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/40 shadow-lg scale-110'
                        : isTarget
                        ? 'bg-amber-500/30 text-amber-200 border-2 border-dashed border-amber-400 animate-pulse'
                        : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span>{tick}</span>
                  </button>

                  {/* Tick Line down */}
                  <div className="w-0.5 h-2 bg-slate-700 mt-1" />

                  {/* Target Label */}
                  {isTarget && !isCurrent && (
                    <span className="text-[9px] text-amber-400 font-bold mt-1 uppercase tracking-wider">
                      Target
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Trail History */}
        <div className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 pt-4">
          <span>Jejak Lompatan:</span>
          <div className="flex items-center gap-1.5 font-mono flex-wrap justify-center">
            {historyTrail.map((pos, idx) => (
              <React.Fragment key={idx}>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold border border-slate-700 text-xs">
                  {pos}
                </span>
                {idx < historyTrail.length - 1 && <span className="text-slate-600">➔</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Control Buttons (Jump Controls) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-indigo-400" />
          <span>Aksi Lompatan Katak (Manipulasi Spasial & Pecahan)</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          <button
            onClick={() => handleJump(-0.5)}
            disabled={currentPosition <= 0.4}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 disabled:opacity-40 text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-1 transition"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>-1/2 (-0.5)</span>
          </button>

          <button
            onClick={() => handleJump(-1)}
            disabled={currentPosition <= 0}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 disabled:opacity-40 text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Mundur 1 (-1)</span>
          </button>

          <button
            onClick={() => handleJump(0.5)}
            disabled={currentPosition >= maxTicks - 0.4}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-cyan-950/60 disabled:opacity-40 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold flex items-center justify-center gap-1 transition"
          >
            <span>+1/2 (+0.5)</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => handleJump(1)}
            disabled={currentPosition >= maxTicks}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 disabled:opacity-40 text-indigo-300 border border-slate-800 hover:border-indigo-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span>Maju 1 (+1)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleJump(2)}
            disabled={currentPosition >= maxTicks - 1}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 disabled:opacity-40 text-indigo-300 border border-slate-800 hover:border-indigo-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span>Maju 2 (+2)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleJump(3)}
            disabled={currentPosition >= maxTicks - 2}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-950/60 disabled:opacity-40 text-emerald-300 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span>Maju 3 (+3)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleJump(4)}
            disabled={currentPosition >= maxTicks - 3}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-cyan-950/60 disabled:opacity-40 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span>Maju 4 (+4)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
