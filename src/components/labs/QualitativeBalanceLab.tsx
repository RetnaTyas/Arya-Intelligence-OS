import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';

interface ItemType {
  id: string;
  name: string;
  weight: number;
  emoji: string;
  color: string;
  size: 'sm' | 'md' | 'lg';
}

const AVAILABLE_ITEMS: ItemType[] = [
  { id: 'apple', name: 'Apel Segar', weight: 1, emoji: '🍎', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', size: 'sm' },
  { id: 'wood', name: 'Balok Kayu', weight: 2, emoji: '🪵', color: 'bg-amber-600/20 text-amber-300 border-amber-600/40', size: 'md' },
  { id: 'bear', name: 'Anak Beruang', weight: 3, emoji: '🧸', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40', size: 'lg' },
  { id: 'sponge', name: 'Spons Raksasa (Besar tapi Ringan!)', weight: 1, emoji: '🧽', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', size: 'lg' },
  { id: 'metal', name: 'Batu Besi Kecil (Kecil tapi Berat!)', weight: 4, emoji: '🔩', color: 'bg-slate-500/20 text-slate-200 border-slate-500/40', size: 'sm' },
];

interface QualitativeBalanceLabProps {
  onMasteryEvidence?: (concept: string, details: string) => void;
}

export const QualitativeBalanceLab: React.FC<QualitativeBalanceLabProps> = ({ onMasteryEvidence }) => {
  const [leftPan, setLeftPan] = useState<ItemType[]>([AVAILABLE_ITEMS[0]]); // 1 apple
  const [rightPan, setRightPan] = useState<ItemType[]>([]);
  const [activeChallengeIndex, setActiveChallengeIndex] = useState<number>(0);
  const [challengeResolved, setChallengeResolved] = useState<boolean>(false);

  const leftWeight = leftPan.reduce((sum, item) => sum + item.weight, 0);
  const rightWeight = rightPan.reduce((sum, item) => sum + item.weight, 0);

  // Tilt angle calculation: -15 to +15 degrees
  const weightDiff = rightWeight - leftWeight;
  const tiltDeg = Math.max(-14, Math.min(14, weightDiff * 3.5));

  const challenges = [
    {
      goal: 'Buatlah kedua lengan timbangan persis seimbang (Bobot Kiri = Bobot Kanan).',
      targetCondition: () => leftWeight > 0 && leftWeight === rightWeight,
      hint: 'Jika di kiri ada 1 apel (bobot 1), apa yang bernilai sama di kanan?',
    },
    {
      goal: 'Buktikan Miskonsepsi: Taruh Spons Raksasa di satu sisi, dan Batu Besi Kecil di sisi lain. Amati sisi mana yang turun!',
      targetCondition: () => {
        const hasSponge = leftPan.some((i) => i.id === 'sponge') || rightPan.some((i) => i.id === 'sponge');
        const hasMetal = leftPan.some((i) => i.id === 'metal') || rightPan.some((i) => i.id === 'metal');
        return hasSponge && hasMetal;
      },
      hint: 'Ukuran besar tidak selalu berarti lebih berat! Amati massa jenisnya.',
    },
    {
      goal: 'Seimbangkan 1 Anak Beruang (bobot 3) menggunakan kombinasi balok kayu dan apel.',
      targetCondition: () => {
        const bearOnLeft = leftPan.some((i) => i.id === 'bear') && leftWeight === 3;
        const bearOnRight = rightPan.some((i) => i.id === 'bear') && rightWeight === 3;
        return (bearOnLeft && rightWeight === 3) || (bearOnRight && leftWeight === 3);
      },
      hint: '3 = 2 (Balok Kayu) + 1 (Apel). Keseimbangan adalah fondasi kesetaraan aljabar!',
    },
  ];

  const handleAddItem = (pan: 'left' | 'right', item: ItemType) => {
    if (pan === 'left') {
      if (leftPan.length >= 6) return;
      setLeftPan([...leftPan, item]);
    } else {
      if (rightPan.length >= 6) return;
      setRightPan([...rightPan, item]);
    }
    checkChallengeAfterEdit(pan === 'left' ? [...leftPan, item] : leftPan, pan === 'right' ? [...rightPan, item] : rightPan);
  };

  const handleRemoveItem = (pan: 'left' | 'right', index: number) => {
    if (pan === 'left') {
      const next = [...leftPan];
      next.splice(index, 1);
      setLeftPan(next);
      checkChallengeAfterEdit(next, rightPan);
    } else {
      const next = [...rightPan];
      next.splice(index, 1);
      setRightPan(next);
      checkChallengeAfterEdit(leftPan, next);
    }
  };

  const checkChallengeAfterEdit = (nextLeft: ItemType[], nextRight: ItemType[]) => {
    const lWeight = nextLeft.reduce((s, i) => s + i.weight, 0);
    const rWeight = nextRight.reduce((s, i) => s + i.weight, 0);

    const currentChallenge = challenges[activeChallengeIndex];
    let satisfied = false;

    if (activeChallengeIndex === 0) {
      satisfied = lWeight > 0 && lWeight === rWeight;
    } else if (activeChallengeIndex === 1) {
      const hasSponge = nextLeft.some((i) => i.id === 'sponge') || nextRight.some((i) => i.id === 'sponge');
      const hasMetal = nextLeft.some((i) => i.id === 'metal') || nextRight.some((i) => i.id === 'metal');
      satisfied = hasSponge && hasMetal;
    } else if (activeChallengeIndex === 2) {
      const bearLeft = nextLeft.some((i) => i.id === 'bear') && lWeight === 3;
      const bearRight = nextRight.some((i) => i.id === 'bear') && rWeight === 3;
      satisfied = (bearLeft && rWeight === 3) || (bearRight && lWeight === 3);
    }

    if (satisfied && !challengeResolved) {
      setChallengeResolved(true);
      if (onMasteryEvidence) {
        onMasteryEvidence(
          'Timbangan Kualitatif & Perbandingan Berat',
          `Anak berhasil menuntaskan tantangan: "${currentChallenge.goal}" dengan konfigurasi Bobot Kiri: ${lWeight} vs Kanan: ${rWeight}.`
        );
      }
    }
  };

  const handleReset = () => {
    setLeftPan([]);
    setRightPan([]);
    setChallengeResolved(false);
  };

  return (
    <div id="qualitative-balance-lab" className="bg-[#0b0f1d] rounded-2xl border border-slate-800 p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Umur 4 - 6 Tahun (Pra-Operasional)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
              Domain: Logika & Kausal
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-400" />
            <span>Neraca Timbangan Kualitatif & Penemuan Kesetaraan</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Bermain dengan neraca fisik intuitif: menemukan bahwa tanda sama dengan (=) adalah keseimbangan massa, bukan perintah tombol kalkulator!
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 transition self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Kosongkan Neraca</span>
        </button>
      </div>

      {/* Challenge Box */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-purple-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Tantangan Penyelidikan #{activeChallengeIndex + 1} dari {challenges.length}</span>
          </span>
          <div className="flex gap-1.5">
            {challenges.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveChallengeIndex(idx);
                  setChallengeResolved(false);
                }}
                className={`w-6 h-6 rounded text-[11px] font-bold transition ${
                  activeChallengeIndex === idx
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-200 font-medium">{challenges[activeChallengeIndex].goal}</p>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 italic">💡 Petunjuk: {challenges[activeChallengeIndex].hint}</span>
          {challengeResolved && (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tercapai! Bukti Tersimpan</span>
            </span>
          )}
        </div>
      </div>

      {/* Physical Balance Scale Visual Stage */}
      <div className="bg-[#070a14] rounded-2xl border border-slate-800/90 p-6 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
        {/* Status Invarian Banner */}
        <div className="absolute top-4 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide border flex items-center gap-2 z-10 transition-all">
          {leftWeight === rightWeight ? (
            <span className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              SEIMBANG (Kiri {leftWeight} = Kanan {rightWeight})
            </span>
          ) : leftWeight > rightWeight ? (
            <span className="bg-purple-500/20 text-purple-300 border-purple-500/40 px-3 py-0.5 rounded-full">
              Sisi Kiri Lebih Berat ({leftWeight} &gt; {rightWeight})
            </span>
          ) : (
            <span className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 px-3 py-0.5 rounded-full">
              Sisi Kanan Lebih Berat ({leftWeight} &lt; {rightWeight})
            </span>
          )}
        </div>

        {/* The Balance Apparatus */}
        <div className="w-full max-w-lg mt-8 flex flex-col items-center relative">
          {/* Fulcrum Pivot Base */}
          <div className="w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-b-[54px] border-b-slate-700 relative z-0">
            <div className="absolute -top-[52px] -left-2 w-4 h-4 rounded-full bg-purple-400 shadow-md shadow-purple-500/50" />
          </div>

          {/* Rotating Beam with dynamic tilt */}
          <div
            className="w-full max-w-md h-3.5 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 rounded-full absolute top-1 shadow-md transition-transform duration-500 ease-out origin-center flex justify-between items-center px-4"
            style={{ transform: `rotate(${tiltDeg}deg)` }}
          >
            {/* Center Axis Pin */}
            <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-900 border-2 border-purple-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-300" />
            </div>

            {/* Left Suspension Cable & Pan */}
            <div
              className="absolute left-4 top-2 flex flex-col items-center origin-top transition-transform duration-500 ease-out"
              style={{ transform: `rotate(${-tiltDeg}deg)` }}
            >
              {/* String */}
              <div className="w-0.5 h-14 bg-slate-500" />
              {/* Pan */}
              <div className="w-36 min-h-[64px] bg-slate-900/90 border-2 border-slate-700 rounded-b-2xl p-2 flex flex-wrap gap-1.5 items-center justify-center shadow-xl">
                {leftPan.length === 0 ? (
                  <span className="text-[10px] text-slate-500 font-mono">Piringan Kosong</span>
                ) : (
                  leftPan.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRemoveItem('left', idx)}
                      title="Klik untuk menghapus"
                      className="px-1.5 py-1 rounded bg-slate-800 text-xs hover:bg-rose-900/40 border border-slate-700 flex items-center gap-1 transition group"
                    >
                      <span>{item.emoji}</span>
                      <span className="text-[10px] text-slate-300">{item.weight}</span>
                      <Trash2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-rose-400" />
                    </button>
                  ))
                )}
              </div>
              <span className="text-[10px] font-mono text-purple-300 font-bold mt-1">
                Total: {leftWeight} satuan
              </span>
            </div>

            {/* Right Suspension Cable & Pan */}
            <div
              className="absolute right-4 top-2 flex flex-col items-center origin-top transition-transform duration-500 ease-out"
              style={{ transform: `rotate(${-tiltDeg}deg)` }}
            >
              {/* String */}
              <div className="w-0.5 h-14 bg-slate-500" />
              {/* Pan */}
              <div className="w-36 min-h-[64px] bg-slate-900/90 border-2 border-slate-700 rounded-b-2xl p-2 flex flex-wrap gap-1.5 items-center justify-center shadow-xl">
                {rightPan.length === 0 ? (
                  <span className="text-[10px] text-slate-500 font-mono">Piringan Kosong</span>
                ) : (
                  rightPan.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRemoveItem('right', idx)}
                      title="Klik untuk menghapus"
                      className="px-1.5 py-1 rounded bg-slate-800 text-xs hover:bg-rose-900/40 border border-slate-700 flex items-center gap-1 transition group"
                    >
                      <span>{item.emoji}</span>
                      <span className="text-[10px] text-slate-300">{item.weight}</span>
                      <Trash2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-rose-400" />
                    </button>
                  ))
                )}
              </div>
              <span className="text-[10px] font-mono text-indigo-300 font-bold mt-1">
                Total: {rightWeight} satuan
              </span>
            </div>
          </div>
        </div>

        <div className="h-20" />
      </div>

      {/* Item Palette to Put on Pans */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pilih Benda untuk Diletakkan ke Neraca</span>
          </h4>
          <span className="text-[11px] text-slate-400">Klik tombol [+] Kiri atau [+] Kanan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {AVAILABLE_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border ${item.color} flex flex-col justify-between space-y-2`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800">
                    Bobot: {item.weight}
                  </span>
                </div>
                <h5 className="text-xs font-bold mt-1 text-white">{item.name}</h5>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => handleAddItem('left', item)}
                  className="py-1 px-1.5 rounded bg-slate-900 hover:bg-purple-900/60 text-purple-300 text-[10.5px] font-medium border border-purple-500/30 transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Kiri</span>
                </button>
                <button
                  onClick={() => handleAddItem('right', item)}
                  className="py-1 px-1.5 rounded bg-slate-900 hover:bg-indigo-900/60 text-indigo-300 text-[10.5px] font-medium border border-indigo-500/30 transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Kanan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
