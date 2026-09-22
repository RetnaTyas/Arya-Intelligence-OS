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
} from 'lucide-react';

interface NumberLineLabProps {
  onMasteryEvidence?: (concept: string, details: string) => void;
}

export const NumberLineLab: React.FC<NumberLineLabProps> = ({ onMasteryEvidence }) => {
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [historyTrail, setHistoryTrail] = useState<number[]>([0]);
  const [activeMissionIndex, setActiveMissionIndex] = useState<number>(0);
  const [missionComplete, setMissionComplete] = useState<boolean>(false);

  const maxTicks = 10;
  const ticks = Array.from({ length: maxTicks + 1 }, (_, i) => i);

  const missions = [
    {
      title: 'Kardinalitas Jarak',
      prompt: 'Bantu katak melompat dari 0 menuju teratai angka 5.',
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
  ];

  const handleJump = (delta: number) => {
    const nextPos = Math.max(0, Math.min(maxTicks, currentPosition + delta));
    setCurrentPosition(nextPos);
    setHistoryTrail((prev) => [...prev.slice(-6), nextPos]);

    const activeM = missions[activeMissionIndex];
    if (nextPos === activeM.targetPos && !missionComplete) {
      setMissionComplete(true);
      if (onMasteryEvidence) {
        onMasteryEvidence(
          'Garis Bilangan Spasial & Kardinalitas',
          `Anak berhasil membuktikan relasi jarak kognitif: Misi "${activeM.title}" tercapai di posisi teratai ${nextPos}.`
        );
      }
    }
  };

  const handleResetToStart = () => {
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
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Tantangan Belajar: {missions[activeMissionIndex].title}</span>
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
              Angka {currentPosition}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Representasi Kuantitas Fisik:</span>
            <div className="flex gap-1">
              {Array.from({ length: currentPosition }).map((_, i) => (
                <span
                  key={i}
                  className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-300 shadow-sm shadow-emerald-500/50"
                  title={`Titik satuan #${i + 1}`}
                />
              ))}
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

          {/* Ticks & Lily Pads */}
          <div className="flex justify-between w-full absolute top-10 left-0 px-4 -translate-y-1/2">
            {ticks.map((tick) => {
              const isTarget = missions[activeMissionIndex].targetPos === tick;
              const isCurrent = currentPosition === tick;

              return (
                <div key={tick} className="flex flex-col items-center -translate-x-1/2">
                  {/* Katak Avatar when on this tick */}
                  {isCurrent && (
                    <div className="absolute -top-12 animate-bounce flex flex-col items-center z-20">
                      <span className="text-3xl filter drop-shadow">🐸</span>
                      <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950 px-1 rounded border border-emerald-700">
                        Katak
                      </span>
                    </div>
                  )}

                  {/* Lily Pad Circle */}
                  <button
                    onClick={() => {
                      setCurrentPosition(tick);
                      setHistoryTrail((prev) => [...prev.slice(-6), tick]);
                      if (tick === missions[activeMissionIndex].targetPos && !missionComplete) {
                        setMissionComplete(true);
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
          <div className="flex items-center gap-1.5 font-mono">
            {historyTrail.map((pos, idx) => (
              <React.Fragment key={idx}>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold border border-slate-700">
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
          <span>Aksi Lompatan Katak (Manipulasi Spasial)</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          <button
            onClick={() => handleJump(-2)}
            disabled={currentPosition <= 1}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 disabled:opacity-40 text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Mundur 2 (-2)</span>
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
