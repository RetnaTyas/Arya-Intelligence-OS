import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Baby,
  Scale,
  Circle,
  Square,
  Scissors,
  Layers,
  Heart,
  Smile,
} from 'lucide-react';

interface ToddlerMathLabsProps {
  labType: 'subitizing_quantity' | 'size_comparison' | 'tower_stacking' | 'one_to_one' | 'part_whole';
  onMasteryEvidence: (conceptName: string, details: string) => void;
}

export const ToddlerMathLabs: React.FC<ToddlerMathLabsProps> = ({
  labType,
  onMasteryEvidence,
}) => {
  const [hasClaimed, setHasClaimed] = useState(false);

  // 1. Subitizing State (1-3 strawberries/dots)
  const [currentSubitizeCount, setCurrentSubitizeCount] = useState<1 | 2 | 3>(2);
  const [subitizeFeedback, setSubitizeFeedback] = useState<string | null>(null);

  // 2. Size Comparison State
  const [selectedPlate, setSelectedPlate] = useState<'big' | 'small' | null>(null);
  const [fedTarget, setFedTarget] = useState<'bear' | 'rabbit' | null>(null);

  // 3. Tower Stacking State (Montessori Pink Tower: 5 blocks from size 5 to 1)
  const [stack, setStack] = useState<number[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const availableBlocks = [5, 4, 3, 2, 1];

  // 4. One-to-One Matching State (3 rabbits, 3 carrots)
  const [rabbitFeedStatus, setRabbitFeedStatus] = useState<boolean[]>([false, false, false]);
  const [remainingCarrots, setRemainingCarrots] = useState<number>(3);

  // 5. Part-Whole State
  const [isFruitCut, setIsFruitCut] = useState(false);

  // Subitizing choice handler
  const handleSubitizeGuess = (guess: number) => {
    if (guess === currentSubitizeCount) {
      setSubitizeFeedback(`Tepat sekali! Tanpa menghitung satu per satu, matamu langsung mengenali ${guess} buah!`);
    } else {
      setSubitizeFeedback(`Coba perhatikan lagi polanya. Ini adalah ${currentSubitizeCount} buah.`);
    }
  };

  // Tower Block placement
  const handleAddBlockToStack = (size: number) => {
    if (stack.includes(size) || isCollapsed) return;

    // Check stability: if new block placed on top is BIGGER than the top block, it collapses!
    if (stack.length > 0) {
      const currentTop = stack[stack.length - 1];
      if (size > currentTop) {
        // Tumble!
        setStack([...stack, size]);
        setIsCollapsed(true);
        return;
      }
    }

    setStack([...stack, size]);
  };

  const resetTower = () => {
    setStack([]);
    setIsCollapsed(false);
  };

  // One-to-one feeding
  const handleFeedRabbit = (index: number) => {
    if (rabbitFeedStatus[index] || remainingCarrots <= 0) return;
    const next = [...rabbitFeedStatus];
    next[index] = true;
    setRabbitFeedStatus(next);
    setRemainingCarrots((prev) => prev - 1);
  };

  const resetFeed = () => {
    setRabbitFeedStatus([false, false, false]);
    setRemainingCarrots(3);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Baby className="w-3.5 h-3.5" />
              <span>Sensori-Motorik (Umur 1 - 3 Tahun)</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-950 text-indigo-300 border border-indigo-800">
              Domain: Matematika
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-100">
            {labType === 'subitizing_quantity' && 'Subitisasi & Persepsi Kuantitas Kasar'}
            {labType === 'size_comparison' && 'Perbandingan Ukuran Relatif & Magnitudo'}
            {labType === 'tower_stacking' && 'Seriasi Ukuran & Stabilitas Menara (Pink Tower)'}
            {labType === 'one_to_one' && 'Korespondensi Satu-ke-Satu (1-to-1 Matching)'}
            {labType === 'part_whole' && 'Part-Whole Intuitif & Konservasi Kesatuan'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {labType === 'subitizing_quantity' &&
              'Pengenalan instan jumlah 1, 2, atau 3 benda secara visual tanpa membilang satu per satu.'}
            {labType === 'size_comparison' &&
              'Membedakan dimensi fisik: besar vs kecil, banyak vs sedikit untuk membangun relasi ordinal.'}
            {labType === 'tower_stacking' &&
              'Menumpuk 5 balok dari alas terlebar ke puncak terkecil untuk menguji pusat massa kesetimbangan.'}
            {labType === 'one_to_one' &&
              'Memasangkan tepat 1 benda ke 1 sasaran secara adil, fondasi sejati proses pencacahan.'}
            {labType === 'part_whole' &&
              'Memotong satu buah utuh menjadi 2 belahan dan menyatukannya kembali tanpa kehilangan substansi.'}
          </p>
        </div>

        {/* Claim Mastery Button */}
        <button
          onClick={() => {
            setHasClaimed(true);
            const titleMap = {
              subitizing_quantity: 'Subitisasi & Persepsi Kuantitas Kasar',
              size_comparison: 'Perbandingan Ukuran Relatif & Magnitudo',
              tower_stacking: 'Seriasi Ukuran & Stabilitas Menara (Pink Tower)',
              one_to_one: 'Korespondensi Satu-ke-Satu (1-to-1 Matching)',
              part_whole: 'Part-Whole Intuitif & Konservasi Kesatuan',
            };
            onMasteryEvidence(
              titleMap[labType],
              `Anak berhasil membuktikan penguasaan konsep matematika dasar ${titleMap[labType]} pada tahap sensori-motorik usia 1-3 tahun.`
            );
          }}
          disabled={hasClaimed}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
            hasClaimed
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 cursor-default'
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white'
          }`}
        >
          {hasClaimed ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Bukti Penguasaan Tercatat</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Catat Bukti Penguasaan</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Subitizing Simulation */}
      {labType === 'subitizing_quantity' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Ubah Jumlah Benda di Piring
            </h4>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => {
                    setCurrentSubitizeCount(cnt);
                    setSubitizeFeedback(null);
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition ${
                    currentSubitizeCount === cnt
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cnt} Buah
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-300 block mb-2 font-bold">
                Tebak Sekilas (Tanpa Berhitung):
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleSubitizeGuess(num)}
                    className="py-3 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-bold text-sm transition active:scale-95"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visual Plate Arena */}
          <div className="md:col-span-2 bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[260px]">
            {/* White Plate with Strawberries */}
            <div className="w-48 h-48 rounded-full border-4 border-slate-700 bg-slate-100 shadow-xl flex items-center justify-center p-4">
              <div className="flex flex-wrap gap-4 items-center justify-center">
                {Array.from({ length: currentSubitizeCount }).map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full bg-rose-500 border-2 border-rose-300 shadow-md flex items-center justify-center text-white text-lg animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    🍓
                  </div>
                ))}
              </div>
            </div>

            {/* Pattern Dots indicator */}
            <div className="flex items-center gap-1.5 mt-4">
              {Array.from({ length: currentSubitizeCount }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-indigo-400" />
              ))}
            </div>

            {subitizeFeedback && (
              <p className="mt-3 text-xs font-bold text-emerald-400 text-center animate-fade-in">
                {subitizeFeedback}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 2. Size Comparison Simulation */}
      {labType === 'size_comparison' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Big Item */}
          <div
            onClick={() => setSelectedPlate('big')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition flex flex-col items-center justify-between min-h-[240px] ${
              selectedPlate === 'big'
                ? 'bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-500/30'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Apel Raksasa (BESAR)
            </span>
            <div className="w-32 h-32 rounded-full bg-rose-500 border-4 border-rose-300 shadow-2xl flex items-center justify-center text-5xl">
              🍎
            </div>
            <span className="text-xs text-slate-300 font-medium">Cocok untuk Beruang Besar 🐻</span>
          </div>

          {/* Small Item */}
          <div
            onClick={() => setSelectedPlate('small')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition flex flex-col items-center justify-between min-h-[240px] ${
              selectedPlate === 'small'
                ? 'bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-500/30'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Apel Mini (KECIL)
            </span>
            <div className="w-14 h-14 rounded-full bg-rose-500 border-2 border-rose-300 shadow-lg flex items-center justify-center text-2xl">
              🍎
            </div>
            <span className="text-xs text-slate-300 font-medium">Cocok untuk Kelinci Kecil 🐰</span>
          </div>

          <div className="md:col-span-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-xs font-bold text-slate-200">
              {selectedPlate === 'big' && '✓ Kamu memilih yang BESAR: Diameter lebih lebar, volume lebih banyak!'}
              {selectedPlate === 'small' && '✓ Kamu memilih yang KECIL: Lebih ramping dan ringan di telapak tangan.'}
              {!selectedPlate && 'Pilih apel di atas untuk menguji persepsi ukuran komparatif.'}
            </span>
          </div>
        </div>
      )}

      {/* 3. Pink Tower Stacking Simulation */}
      {labType === 'tower_stacking' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Available Blocks */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-300 uppercase">Balok Kayu Tersedia</span>
              <button
                onClick={resetTower}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Klik balok untuk menumpuknya ke menara. Aturan gravitasi: balok besar harus di bawah!
            </p>

            <div className="flex flex-col gap-2">
              {availableBlocks.map((size) => {
                const isPlaced = stack.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => handleAddBlockToStack(size)}
                    disabled={isPlaced || isCollapsed}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                      isPlaced
                        ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-default'
                        : 'bg-pink-600 hover:bg-pink-500 text-white shadow active:scale-95'
                    }`}
                  >
                    <span>Kubus Ukuran {size}</span>
                    <span className="text-[10px] font-mono opacity-80">
                      {size === 5 ? 'Paling Lebar' : size === 1 ? 'Paling Kecil' : `Level ${size}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stacking Tower Visual */}
          <div className="md:col-span-2 bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-end min-h-[300px]">
            {isCollapsed ? (
              <div className="text-center p-6 animate-bounce">
                <span className="text-4xl block mb-2">💥</span>
                <span className="text-sm font-bold text-rose-400 block">
                  MENARA ROBOH!
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Kamu menaruh balok besar di atas balok kecil. Gravitasi membuat pusat massa tidak stabil!
                </p>
                <button
                  onClick={resetTower}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                >
                  Coba Susun Ulang (Besar ke Kecil)
                </button>
              </div>
            ) : stack.length === 0 ? (
              <span className="text-xs text-slate-500 italic mb-12">
                Pondasi kosong. Taruh balok terbesar terlebih dahulu!
              </span>
            ) : (
              <div className="flex flex-col items-center gap-1 mb-4">
                {stack
                  .slice()
                  .reverse()
                  .map((size, idx) => {
                    const widthPixels = size * 32 + 20;
                    return (
                      <div
                        key={idx}
                        className="h-8 rounded-md bg-gradient-to-r from-pink-500 to-rose-400 border border-pink-300 shadow flex items-center justify-center text-xs font-bold text-slate-950 transition-all duration-300 animate-fade-in"
                        style={{ width: `${widthPixels}px` }}
                      >
                        {size}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Base platform */}
            <div className="w-56 h-3 bg-slate-700 rounded-full" />
            <span className="text-[10px] text-slate-400 mt-1 font-mono">Alas Lantai Rata</span>

            {stack.length === 5 && !isCollapsed && (
              <span className="text-xs font-bold text-emerald-400 mt-2 animate-bounce">
                🎉 Luar biasa! Menara tersusun sempurna dari ukuran 5 ke 1 tanpa goyah!
              </span>
            )}
          </div>
        </div>
      )}

      {/* 4. One-to-One Matching Simulation */}
      {labType === 'one_to_one' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-bold text-indigo-300 uppercase block">
                Prinsip Keadilan: 1 Kelinci = Tepat 1 Wortel
              </span>
              <span className="text-xs text-slate-400">
                Sisa Wortel di Keranjang: <strong>{remainingCarrots}</strong> buah
              </span>
            </div>
            <button
              onClick={resetFeed}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              Reset Makanan
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((idx) => {
              const isFed = rabbitFeedStatus[idx];
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border-2 flex flex-col items-center justify-between min-h-[200px] transition ${
                    isFed
                      ? 'bg-emerald-950/40 border-emerald-500/60'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <span className="text-4xl mb-2">{isFed ? '😋' : '🐰'}</span>
                  <span className="text-xs font-bold text-slate-200">
                    Kelinci #{idx + 1}
                  </span>

                  <div className="mt-3">
                    {isFed ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span>🥕 Kenyang!</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleFeedRabbit(idx)}
                        disabled={remainingCarrots <= 0}
                        className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow transition active:scale-95 disabled:opacity-40"
                      >
                        Beri 1 Wortel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Part-Whole Simulation */}
      {labType === 'part_whole' && (
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[260px] space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
              {isFruitCut ? 'Semangka Terpotong (2 Belahan: 1/2 + 1/2)' : 'Semangka Utuh (1 Utuh)'}
            </span>
            <p className="text-xs text-slate-400">
              Tekan tombol potong atau satukan untuk menguji reversibilitas materi.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {isFruitCut ? (
              <>
                <div className="w-24 h-24 rounded-l-full bg-emerald-600 border-2 border-emerald-400 p-2 flex items-center justify-center text-rose-500 font-bold text-xl shadow-lg animate-fade-in">
                  🍉 1/2
                </div>
                <div className="w-24 h-24 rounded-r-full bg-emerald-600 border-2 border-emerald-400 p-2 flex items-center justify-center text-rose-500 font-bold text-xl shadow-lg animate-fade-in">
                  1/2 🍉
                </div>
              </>
            ) : (
              <div className="w-32 h-32 rounded-full bg-emerald-600 border-4 border-emerald-400 p-2 flex items-center justify-center text-rose-400 font-bold text-3xl shadow-xl animate-fade-in">
                🍉 1 Utuh
              </div>
            )}
          </div>

          <button
            onClick={() => setIsFruitCut(!isFruitCut)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg transition active:scale-95 flex items-center gap-2"
          >
            <Scissors className="w-4 h-4" />
            <span>{isFruitCut ? 'Satukan Kembali Menjadi 1 Utuh' : 'Potong Semangka Menjadi 2 Belahan'}</span>
          </button>
        </div>
      )}

      {/* Pedagogical Note for Parent/Educator */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 space-y-1">
        <span className="font-bold text-slate-200">Catatan Matematika Dini:</span>
        <p>
          Anak usia 1-3 tahun belum membutuhkan lembar kerja angka simbolik tertulis. Fondasi sejati numerasi
          dibangun dari <em>subitisasi</em> (persepsi kuantitas instan), keteraturan urutan (seriasi menara balok),
          keadilan korespondensi 1-ke-1, dan pemahaman bahwa kesatuan utuh terbentuk dari bagian-bagian.
        </p>
      </div>
    </div>
  );
};
