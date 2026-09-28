import React, { useState, useEffect } from 'react';
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
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import { useLabTelemetry } from '../../engine/useLabTelemetry';
import { deriveEmpiricalEvidenceFromTelemetry } from '../../engine/empiricalEvidenceDerivation';
import { EmpiricalSimulationEvidence } from '../../engine/evidenceTriangulation';
import { KnowledgeNode } from '../../types';
import { getRoute } from '../../data/simulationRouting';

export type PathRule =
  | { kind: 'equal_jumps'; size: number; count: number }
  | { kind: 'monotonic'; dir: 'left' | 'right' };

export interface IdentifySpec {
  prompt: string;
  options: { label: string; correct: boolean }[];
}

export interface Mission {
  title: string;
  prompt: string;
  startPos: number;
  targetPos: number;
  hint: string;
  pathRule?: PathRule;
  identify?: IdentifySpec;
}

const JUMP_DELTAS = [-1, -0.5, 0.5, 1, 2, 3, 4];

export function minHops(start: number, target: number, maxTick = 10): number {
  const q: [number, number][] = [[start, 0]];
  const seen = new Set([start]);
  while (q.length) {
    const [pos, d] = q.shift()!;
    if (Math.abs(pos - target) < 0.05) return d;
    for (const dx of JUMP_DELTAS) {
      const n = Math.round((pos + dx) * 10) / 10;
      if (n >= 0 && n <= maxTick && !seen.has(n)) {
        seen.add(n);
        q.push([n, d + 1]);
      }
    }
  }
  return 1;
}

export function checkPathRule(rule?: PathRule, jumps: number[] = []): boolean {
  if (!rule) return true;
  if (rule.kind === 'monotonic') {
    if (jumps.length === 0) return false;
    return rule.dir === 'right' ? jumps.every((d) => d > 0) : jumps.every((d) => d < 0);
  }
  if (rule.kind === 'equal_jumps') {
    if (jumps.length !== rule.count) return false;
    return jumps.every((d) => Math.abs(d - rule.size) < 0.05);
  }
  return true;
}

const MISSIONS: Mission[] = [
  {
    title: 'Kardinalitas Jarak',
    prompt: 'Bantu katak melompat dari 0 menuju teratai angka 5.',
    startPos: 0,
    targetPos: 5,
    hint: 'Setiap 1 lompatan adalah penambahan 1 satuan jarak fisik ke arah kanan.',
    pathRule: { kind: 'monotonic', dir: 'right' },
  },
  {
    title: 'Penjumlahan Spasial (3 + 4)',
    prompt: 'Mulai dari angka 3, lompat maju 4 langkah! Perhatikan di angka berapa katak mendarat.',
    startPos: 3,
    targetPos: 7,
    hint: 'Penjumlahan (3 + 4) di alam nyata adalah gabungan dua interval jarak searah.',
    pathRule: { kind: 'monotonic', dir: 'right' },
  },
  {
    title: 'Operasi Pengurangan Spasial (Invers Lompatan)',
    prompt: 'Dari angka 8, lompat mundur sejauh 3 langkah (8 - 3).',
    startPos: 8,
    targetPos: 5,
    hint: 'Pengurangan adalah melangkah ke arah sebaliknya (kiri) pada sumbu ruang!',
    pathRule: { kind: 'monotonic', dir: 'left' },
  },
  {
    title: 'Lompatan Berkelipatan (+2, +2, +2)',
    prompt: 'Lakukan lompatan genap ganda 2 langkah sebanyak 3 kali dari 0 hingga mencapai teratai 6.',
    startPos: 0,
    targetPos: 6,
    hint: 'Lompatan berulang dengan interval sama (+2) adalah akar intuitif dari perkalian (3 × 2)! Setiap lompatan harus persis +2.',
    pathRule: { kind: 'equal_jumps', size: 2, count: 3 },
  },
  {
    title: 'Pecahan di Antara Bilangan Bulat (Titik 1/2 = 0.5)',
    prompt: 'Katak harus mendarat TEPAT di antara teratai 0 dan 1 — di titik tengah 1/2 (atau 0.5)!',
    startPos: 0,
    targetPos: 0.5,
    hint: 'Garis antara dua bilangan bulat bisa dibagi jadi bagian-bagian sama besar — itulah pecahan.',
    identify: {
      prompt: 'Konfirmasi Pemahaman: Pilih semua nama matematis yang bernilai persis sama dengan titik koordinat ini (0.5):',
      options: [
        { label: '1/2', correct: true },
        { label: '0.5', correct: true },
        { label: '2/1', correct: false },
        { label: '1/5', correct: false },
      ],
    },
  },
  {
    title: 'Pecahan Tak Murni & Bilangan Campuran (1 1/2 = 1.5)',
    prompt: 'Lompati angka 1 utuh lalu tambah setengah langkah lagi (1 + 1/2 = 1.5) untuk membuktikan pecahan tidak murni!',
    startPos: 0,
    targetPos: 1.5,
    hint: 'Pecahan tak murni dan bilangan campuran berada melampaui angka 1 pada garis bilangan yang sama.',
    identify: {
      prompt: 'Konfirmasi Representasi: Pilih semua bentuk kuantitas yang setara dengan titik ini (1.5):',
      options: [
        { label: '3/2', correct: true },
        { label: '1 1/2', correct: true },
        { label: '1.5', correct: true },
        { label: '2/3', correct: false },
        { label: '1/5', correct: false },
      ],
    },
  },
  {
    title: 'Ekuivalensi & Skala Desimal (Titik 2.5 atau 5/2)',
    prompt: 'Lompat ke titik 2.5 (setara dengan 5/2 atau 2 1/2) untuk mengamati ekuivalensi desimal dan pecahan!',
    startPos: 0,
    targetPos: 2.5,
    hint: '2.5, 2 1/2, dan 5/2 adalah titik koordinat yang persis sama pada garis bilangan kontinu.',
    identify: {
      prompt: 'Konfirmasi Ekuivalensi: Pilih semua nama representasi yang mewakili titik yang sama (2.5):',
      options: [
        { label: '5/2', correct: true },
        { label: '2 1/2', correct: true },
        { label: '2.5', correct: true },
        { label: '2/5', correct: false },
        { label: '2.05', correct: false },
      ],
    },
  },
];

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
  const route = getRoute(nodeId, 'number_line');
  const initialIndex = route?.scenarioIndex ?? 0;

  const [activeMissionIndex, setActiveMissionIndex] = useState<number>(() => initialIndex);
  const initialStart = MISSIONS[initialIndex]?.startPos ?? 0;
  const [currentPosition, setCurrentPosition] = useState<number>(() => initialStart);
  const [historyTrail, setHistoryTrail] = useState<number[]>([initialStart]);
  const [attemptJumps, setAttemptJumps] = useState<number[]>([]);
  const [missionComplete, setMissionComplete] = useState<boolean>(false);
  const [stage, setStage] = useState<'jump' | 'identify'>('jump');
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);

  // Sumber kebenaran tunggal: sinkron dengan SIMULATION_ROUTING / activeNode.simulationAlignment
  const isDirect = route ? route.fit === 'strong' : (activeNode?.simulationAlignment === 'direct');

  const maxTicks = 10;
  const ticks = Array.from({ length: maxTicks + 1 }, (_, i) => i);

  // Inisialisasi skenario telemetri pada mount
  useEffect(() => {
    const m = MISSIONS[initialIndex];
    const hops = minHops(m.startPos, m.targetPos);
    telemetry.beginScenario(m.title, hops);
  }, []);

  const selectMission = (idx: number) => {
    setActiveMissionIndex(idx);
    const m = MISSIONS[idx];
    const start = m.startPos ?? 0;
    setCurrentPosition(start);
    setHistoryTrail([start]);
    setAttemptJumps([]);
    setStage('jump');
    setSelectedOptions(new Set());
    setFeedback(null);
    setMissionComplete(false);

    const hops = minHops(start, m.targetPos);
    telemetry.beginScenario(m.title, hops);
  };

  const handleJump = (delta: number) => {
    if (missionComplete || stage === 'identify') return;
    const nextPos = Math.max(0, Math.min(maxTicks, Math.round((currentPosition + delta) * 10) / 10));
    setCurrentPosition(nextPos);
    setHistoryTrail((prev) => [...prev.slice(-6), nextPos]);
    setAttemptJumps((prev) => [...prev, delta]);
    setFeedback(null);

    // 1 lompatan = 1 parameter_change (TIDAK ADA verification_attempt di sini)
    telemetry.recordParameterChange('frog_jump_delta', delta);
  };

  const handleResetToStart = () => {
    telemetry.recordReset();
    const start = MISSIONS[activeMissionIndex].startPos ?? 0;
    setCurrentPosition(start);
    setHistoryTrail([start]);
    setAttemptJumps([]);
    setFeedback(null);
    setStage('jump');
    setSelectedOptions(new Set());
    setMissionComplete(false);
  };

  const confirmArrival = () => {
    if (missionComplete || stage === 'identify') return;
    const m = MISSIONS[activeMissionIndex];
    const span = Math.max(Math.abs(m.targetPos - m.startPos), 0.5);
    const offBy = Math.abs(currentPosition - m.targetPos);
    const landed = offBy < 0.05;
    const pathOk = checkPathRule(m.pathRule, attemptJumps);
    const isCorrect = landed && pathOk;

    // Normalisasi jarak: dibagi rentang span, bukan nilai konstan
    const distance = landed ? (pathOk ? 0 : 0.5) : Math.min(1, offBy / span);
    telemetry.recordVerificationAttempt(isCorrect, distance);

    if (!isCorrect) {
      if (landed && !pathOk) {
        setFeedback('Katak sampai di angka target, tetapi pola lompatan belum sesuai instruksi misi. Coba ulangi dengan langkah yang diminta.');
      } else {
        setFeedback(`Katak saat ini di posisi ${currentPosition}, sedangkan target adalah ${m.targetPos}. Lanjutkan melompat!`);
      }
      return;
    }

    if (m.identify) {
      setStage('identify');
      setFeedback(null);
      return;
    }

    completeMission();
  };

  const toggleOption = (label: string) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const confirmIdentification = () => {
    const m = MISSIONS[activeMissionIndex];
    if (!m.identify) return;
    const options = m.identify.options;
    const missedOrWrong = options.filter((opt) => selectedOptions.has(opt.label) !== opt.correct).length;
    const isCorrect = missedOrWrong === 0;
    const distance = missedOrWrong / options.length;

    telemetry.recordVerificationAttempt(isCorrect, distance);

    if (!isCorrect) {
      setFeedback('Pilihan bentuk representasi belum tepat. Periksa kembali nama pecahan murni, campuran, atau desimal yang senilai.');
      return;
    }

    completeMission();
  };

  const completeMission = () => {
    setMissionComplete(true);
    setFeedback(null);
    const session = telemetry.finalizeSession();
    const evidence = deriveEmpiricalEvidenceFromTelemetry(session);
    if (onEmpiricalEvidence) {
      onEmpiricalEvidence(evidence);
    }
    if (onMasteryEvidence) {
      onMasteryEvidence(
        activeNode?.name || 'Garis Bilangan Spasial & Kardinalitas',
        `Anak menyelesaikan Misi "${MISSIONS[activeMissionIndex].title}" (Akurasi: ${(evidence.accuracyScore * 100).toFixed(0)}%, Presisi: ${(evidence.manipulationPrecision * 100).toFixed(0)}%).`
      );
    }
  };

  const activeMission = MISSIONS[activeMissionIndex];

  return (
    <div id="number-line-lab" className="bg-[#0b0f1d] rounded-2xl border border-slate-800 p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Umur 4 - 6 & 7 - 9 Tahun
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
              Domain: Matematika
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span>Garis Bilangan Spasial, Kardinalitas & Pecahan</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Membongkar miskonsepsi: Berhitung bukan hafalan kata, melainkan perpindahan jarak fisik dan koordinat kontinu!
          </p>
        </div>

        <button
          onClick={handleResetToStart}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 transition self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ulangi Misi</span>
        </button>
      </div>

      {/* Mission Card */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-indigo-500/30 space-y-2.5">
        {route && (
          <div
            className={`p-2 rounded-lg text-[11px] flex items-center justify-between gap-2 border ${
              isDirect
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <span className="font-semibold shrink-0">
              🎯 Rute Otomatis Konsep: {isDirect ? 'Kesesuaian Langsung (1-to-1 Fidelity)' : 'Mode Analogi Representasi'}
            </span>
            <span className="text-[10px] text-slate-300 italic truncate max-w-[65%]">
              {route.rationale}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Tantangan Belajar #{activeMissionIndex + 1}: {activeMission.title}</span>
          </span>
          <div className="flex gap-1.5">
            {MISSIONS.map((_, idx) => (
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

        <p className="text-xs text-slate-200 font-medium">{activeMission.prompt}</p>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 italic">💡 {activeMission.hint}</span>
          {missionComplete && (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Target Tercapai & Terbukti!</span>
            </span>
          )}
        </div>

        {feedback && (
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
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
          {activeMission.targetPos % 1 !== 0 && (
            <div
              className="absolute top-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-15 pointer-events-none"
              style={{ left: `${(activeMission.targetPos / maxTicks) * 100}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/40 text-amber-200 border-2 border-dashed border-amber-400 flex items-center justify-center font-bold text-[10px] animate-pulse shadow-lg">
                {activeMission.targetPos}
              </div>
              <span className="text-[9px] text-amber-300 font-bold mt-1 uppercase tracking-wider">
                Target
              </span>
            </div>
          )}

          {/* Ticks & Lily Pads (Teleport tertutup: hanya highlight target & visualisasi jarak) */}
          <div className="flex justify-between w-full absolute top-10 left-0 px-4 -translate-y-1/2">
            {ticks.map((tick) => {
              const isTarget = activeMission.targetPos === tick;
              const isCurrent = Math.abs(currentPosition - tick) < 0.05;

              return (
                <div key={tick} className="flex flex-col items-center -translate-x-1/2">
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex flex-col items-center justify-center font-bold text-xs transition-all select-none ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/40 shadow-lg scale-110'
                        : isTarget
                        ? 'bg-amber-500/30 text-amber-200 border-2 border-dashed border-amber-400 animate-pulse'
                        : 'bg-slate-900 text-slate-300 border border-slate-700'
                    }`}
                    title={`Teratai ${tick}`}
                  >
                    <span>{tick}</span>
                  </div>

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

      {/* Bagian 5: Langkah Identifikasi Representasi Pecahan/Desimal (Jika dalam stage identify) */}
      {stage === 'identify' && activeMission.identify && !missionComplete && (
        <div className="bg-slate-900/90 border-2 border-indigo-500/60 rounded-xl p-5 space-y-4 shadow-xl animate-fade-in">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>Langkah Verifikasi Identifikasi Kognitif: Pecahan Senilai & Desimal</span>
          </div>
          <p className="text-xs text-slate-200">{activeMission.identify.prompt}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {activeMission.identify.options.map((opt) => {
              const isSelected = selectedOptions.has(opt.label);
              return (
                <button
                  key={opt.label}
                  onClick={() => toggleOption(opt.label)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 ring-2 ring-indigo-500/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono text-sm">{opt.label}</span>
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={confirmIdentification}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Konfirmasi Bentuk Ekuivalen</span>
          </button>
        </div>
      )}

      {/* Control Buttons (Jump Controls & Tombol Konfirmasi Mendarat) */}
      {stage === 'jump' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
              <span>Aksi Lompatan Katak (Manipulasi Spasial & Pecahan)</span>
            </h4>

            {/* Tombol Konfirmasi Eksplisit Satu-Satunya */}
            <button
              onClick={confirmArrival}
              disabled={missionComplete}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Aku Sudah Sampai! (Verifikasi Posisi)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            <button
              onClick={() => handleJump(-0.5)}
              disabled={currentPosition <= 0.4 || missionComplete}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 disabled:opacity-40 text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-1 transition"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>-1/2 (-0.5)</span>
            </button>

            <button
              onClick={() => handleJump(-1)}
              disabled={currentPosition <= 0 || missionComplete}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 disabled:opacity-40 text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Mundur 1 (-1)</span>
            </button>

            <button
              onClick={() => handleJump(0.5)}
              disabled={currentPosition >= maxTicks - 0.4 || missionComplete}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-cyan-950/60 disabled:opacity-40 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold flex items-center justify-center gap-1 transition"
            >
              <span>+1/2 (+0.5)</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => handleJump(1)}
              disabled={currentPosition >= maxTicks || missionComplete}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 disabled:opacity-40 text-indigo-300 border border-slate-800 hover:border-indigo-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <span>Maju 1 (+1)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleJump(2)}
              disabled={currentPosition >= maxTicks - 1 || missionComplete}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 disabled:opacity-40 text-indigo-300 border border-slate-800 hover:border-indigo-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <span>Maju 2 (+2)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleJump(3)}
              disabled={currentPosition >= maxTicks - 2 || missionComplete}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-950/60 disabled:opacity-40 text-emerald-300 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <span>Maju 3 (+3)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleJump(4)}
              disabled={currentPosition >= maxTicks - 3 || missionComplete}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-cyan-950/60 disabled:opacity-40 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <span>Maju 4 (+4)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
