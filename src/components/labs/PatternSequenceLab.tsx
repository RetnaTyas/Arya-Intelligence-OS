import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Brain,
  Layers,
  ArrowRight,
  Smile,
  Shuffle,
} from 'lucide-react';

interface PatternSequenceLabProps {
  onMasteryEvidence: (details: string) => void;
}

interface PatternChallenge {
  id: number;
  name: string;
  ruleDescription: string;
  sequence: { shape: 'circle' | 'square' | 'triangle' | 'star'; color: string; label: string }[];
  options: { shape: 'circle' | 'square' | 'triangle' | 'star'; color: string; label: string }[];
  correctIndex: number;
}

const CHALLENGES: PatternChallenge[] = [
  {
    id: 1,
    name: 'Pola Bergantian Sederhana (A - B - A - B)',
    ruleDescription: 'Lingkaran Biru bergantian dengan Bintang Emas',
    sequence: [
      { shape: 'circle', color: '#38bdf8', label: 'Biru' },
      { shape: 'star', color: '#eab308', label: 'Emas' },
      { shape: 'circle', color: '#38bdf8', label: 'Biru' },
      { shape: 'star', color: '#eab308', label: 'Emas' },
      { shape: 'circle', color: '#38bdf8', label: 'Biru' },
    ],
    options: [
      { shape: 'square', color: '#f43f5e', label: 'Kotak Merah' },
      { shape: 'star', color: '#eab308', label: 'Bintang Emas' },
      { shape: 'triangle', color: '#10b981', label: 'Segitiga Hijau' },
    ],
    correctIndex: 1,
  },
  {
    id: 2,
    name: 'Pola Perulangan Ganda (A - A - B - A - A - B)',
    ruleDescription: 'Dua Kotak Merah, lalu Satu Segitiga Hijau',
    sequence: [
      { shape: 'square', color: '#f43f5e', label: 'Merah' },
      { shape: 'square', color: '#f43f5e', label: 'Merah' },
      { shape: 'triangle', color: '#10b981', label: 'Hijau' },
      { shape: 'square', color: '#f43f5e', label: 'Merah' },
      { shape: 'square', color: '#f43f5e', label: 'Merah' },
    ],
    options: [
      { shape: 'triangle', color: '#10b981', label: 'Segitiga Hijau' },
      { shape: 'circle', color: '#38bdf8', label: 'Lingkaran Biru' },
      { shape: 'square', color: '#f43f5e', label: 'Kotak Merah' },
    ],
    correctIndex: 0,
  },
  {
    id: 3,
    name: 'Pola Siklus Tiga Elemen (A - B - C - A - B - C)',
    ruleDescription: 'Lingkaran Biru -> Kotak Merah -> Bintang Emas',
    sequence: [
      { shape: 'circle', color: '#38bdf8', label: 'Biru' },
      { shape: 'square', color: '#f43f5e', label: 'Merah' },
      { shape: 'star', color: '#eab308', label: 'Emas' },
      { shape: 'circle', color: '#38bdf8', label: 'Biru' },
      { shape: 'square', color: '#f43f5e', label: 'Merah' },
    ],
    options: [
      { shape: 'circle', color: '#38bdf8', label: 'Lingkaran Biru' },
      { shape: 'star', color: '#eab308', label: 'Bintang Emas' },
      { shape: 'square', color: '#f43f5e', label: 'Kotak Merah' },
    ],
    correctIndex: 1,
  },
];

export const PatternSequenceLab: React.FC<PatternSequenceLabProps> = ({ onMasteryEvidence }) => {
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [hasClaimedEvidence, setHasClaimedEvidence] = useState<boolean>(false);

  const challenge = CHALLENGES[currentLevel];

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    const correct = idx === challenge.correctIndex;
    setIsAnswerCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNextChallenge = () => {
    setSelectedOption(null);
    setIsAnswerCorrect(null);
    setCurrentLevel((prev) => (prev + 1) % CHALLENGES.length);
  };

  const handleVerifyEvidence = () => {
    setHasClaimedEvidence(true);
    onMasteryEvidence(
      `Pengenalan Pola & Algoritma Sekuensial (Tahap Pra-Sekolah 4-6 Tahun): Anak berhasil menganalisis keteraturan siklus pola multi-elemen dan memprediksi suku berikutnya secara deterministik tanpa tebakan acak.`
    );
  };

  const renderShapeIcon = (shape: string, color: string, size = 'w-10 h-10') => {
    if (shape === 'circle') {
      return (
        <div
          className={`${size} rounded-full border-2 border-white/80 shadow-md flex items-center justify-center`}
          style={{ backgroundColor: color }}
        />
      );
    }
    if (shape === 'square') {
      return (
        <div
          className={`${size} rounded-xl border-2 border-white/80 shadow-md flex items-center justify-center`}
          style={{ backgroundColor: color }}
        />
      );
    }
    if (shape === 'triangle') {
      return (
        <div
          className={`${size} border-2 border-white/80 shadow-md flex items-center justify-center [clip-path:polygon(50%_0%,0%_100%,100%_100%)]`}
          style={{ backgroundColor: color }}
        />
      );
    }
    // Star
    return (
      <div
        className={`${size} rounded-lg border-2 border-white/80 shadow-md flex items-center justify-center`}
        style={{ backgroundColor: color }}
      >
        <Sparkles className="w-5 h-5 text-white" />
      </div>
    );
  };

  return (
    <div id="pattern-sequence-lab-container" className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>Umur 4 - 6 Tahun · Pra-Operasional</span>
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Lab Pengenalan Pola & Algoritma Awal (Simpul: node-pattern-sequencing)
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Prinsip WHY: <em>"Fondasi komputasi dan matematika bukan menulis kode atau rumus rumit, melainkan kemampuan mengenali keteraturan dan memprediksi langkah berikutnya."</em>
          </p>
        </div>

        <button
          onClick={handleNextChallenge}
          className="text-xs text-slate-400 hover:text-purple-300 flex items-center gap-1 self-start md:self-auto transition"
        >
          <Shuffle className="w-3.5 h-3.5" /> Ganti Pola Tantangan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Beads Sequence Display */}
        <div className="lg:col-span-8 bg-[#0d121f] border border-slate-800 rounded-xl p-6 flex flex-col justify-between min-h-[460px]">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Tantangan {currentLevel + 1} dari {CHALLENGES.length}:</span>
            <span className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 font-bold">
              Skor Akurasi: {score} Pola Sukses
            </span>
          </div>

          <div className="my-6 space-y-6">
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-white">{challenge.name}</h4>
              <p className="text-xs text-slate-400">Aturan rahasia: {challenge.ruleDescription}</p>
            </div>

            {/* Sequence Row */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-center gap-3 select-none">
              {challenge.sequence.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    {renderShapeIcon(item.shape, item.color, 'w-12 h-12')}
                    <span className="text-[10px] text-slate-400 font-mono">{idx + 1}</span>
                  </div>
                  {idx < challenge.sequence.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                </div>
              ))}

              <ArrowRight className="w-5 h-5 text-purple-400 shrink-0 animate-pulse" />

              {/* The Mystery Next Bead */}
              <div className="flex flex-col items-center gap-1">
                <div className={`w-12 h-12 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${
                  isAnswerCorrect === true
                    ? 'border-emerald-400 bg-emerald-950/60'
                    : isAnswerCorrect === false
                    ? 'border-rose-400 bg-rose-950/60'
                    : 'border-purple-400/80 bg-purple-950/40 animate-pulse'
                }`}>
                  {selectedOption !== null ? (
                    renderShapeIcon(
                      challenge.options[selectedOption].shape,
                      challenge.options[selectedOption].color,
                      'w-10 h-10'
                    )
                  ) : (
                    <span className="text-xl font-bold text-purple-300">?</span>
                  )}
                </div>
                <span className="text-[10px] text-purple-300 font-mono font-bold">Langkah ke-6</span>
              </div>
            </div>

            {/* Options to Choose */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block text-center">
                Pilih elemen yang cocok untuk melengkapi pola di atas:
              </span>
              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                {challenge.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition hover:scale-105 active:scale-95 ${
                      selectedOption === idx
                        ? isAnswerCorrect
                          ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/40'
                          : 'bg-rose-950/80 border-rose-400 ring-2 ring-rose-500/40'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {renderShapeIcon(opt.shape, opt.color, 'w-10 h-10')}
                    <span className="text-xs text-slate-200 font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Message */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center text-xs">
            {isAnswerCorrect === true ? (
              <span className="text-emerald-300 font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Hebat! Pola berhasil ditebak dengan benar sesuai algoritma sekuens.</span>
              </span>
            ) : isAnswerCorrect === false ? (
              <span className="text-rose-300 font-medium">
                Coba perhatikan urutannya kembali: setelah elemen ke-5, elemen apa yang seharusnya berulang?
              </span>
            ) : (
              <span className="text-slate-400">
                Pilih salah satu dari 3 pilihan di atas untuk menguji intuisimu!
              </span>
            )}
          </div>
        </div>

        {/* Cognitive Insights & Controls */}
        <div className="lg:col-span-4 bg-[#0f1424] border border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Fondasi Pemikiran Komputasi</span>
            </span>
          </h4>

          <button
            onClick={handleNextChallenge}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow transition"
          >
            <span>Tantangan Pola Berikutnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Insight Card */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <span className="text-purple-400 font-bold block text-xs">
              Mengapa Pola Mendahului Coding?
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Semua program komputer di dunia (loop <code>for/while</code>, deret Fibonacci, kompresi data) bekerja dengan mengeksploitasi <strong>pola berulang</strong>. Anak yang terlatih mengenali pola akan memahami abstraksi matematika secara alami.
            </p>
          </div>

          {/* Save Evidence Button */}
          <button
            onClick={handleVerifyEvidence}
            disabled={!isAnswerCorrect}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow transition disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Simpan Bukti Pengenalan Pola</span>
          </button>

          {hasClaimedEvidence && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bukti Logika Pola Berhasil Disimpan!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
