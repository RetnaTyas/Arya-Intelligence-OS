import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Baby,
  Cpu,
  Sliders,
  Play,
  Key,
  Gift,
  Lightbulb,
  Navigation,
  Compass,
} from 'lucide-react';

interface ToddlerComputingLabsProps {
  labType: 'spatial_sorting' | 'color_grouping' | 'step_sequence' | 'binary_switch' | 'path_maze';
  onMasteryEvidence: (conceptName: string, details: string) => void;
}

export const ToddlerComputingLabs: React.FC<ToddlerComputingLabsProps> = ({
  labType,
  onMasteryEvidence,
}) => {
  const [hasClaimed, setHasClaimed] = useState(false);

  // 1. Spatial Sorting (Shape Sorter)
  const [sortedShapes, setSortedShapes] = useState<{ circle: boolean; square: boolean; triangle: boolean }>({
    circle: false,
    square: false,
    triangle: false,
  });

  // 2. Color Grouping State (Red, Green, Blue marbles)
  const [redBin, setRedBin] = useState<number>(0);
  const [blueBin, setBlueBin] = useState<number>(0);
  const [unassignedMarbles, setUnassignedMarbles] = useState<string[]>(['red', 'blue', 'red', 'blue']);

  // 3. Step Sequence State (Step 1: Get Key, Step 2: Unlock Chest)
  const [hasKey, setHasKey] = useState(false);
  const [isChestOpen, setIsChestOpen] = useState(false);

  // 4. Binary Switch State (0 / 1)
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  // 5. Path Maze State (Grid steps 0 -> 1 -> 2 -> 3)
  const [catPosition, setCatPosition] = useState<number>(0);

  // Handlers for Shape sorting
  const handleSortShape = (shape: 'circle' | 'square' | 'triangle') => {
    setSortedShapes((prev) => ({ ...prev, [shape]: true }));
  };

  const resetShapes = () => {
    setSortedShapes({ circle: false, square: false, triangle: false });
  };

  // Color grouping handler
  const handleSortMarble = (color: 'red' | 'blue') => {
    const idx = unassignedMarbles.indexOf(color);
    if (idx === -1) return;

    setUnassignedMarbles((prev) => {
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });

    if (color === 'red') setRedBin((prev) => prev + 1);
    if (color === 'blue') setBlueBin((prev) => prev + 1);
  };

  const resetMarbles = () => {
    setRedBin(0);
    setBlueBin(0);
    setUnassignedMarbles(['red', 'blue', 'red', 'blue']);
  };

  // Step Sequence actions
  const handleGetKey = () => {
    setHasKey(true);
  };

  const handleOpenChest = () => {
    if (hasKey) {
      setIsChestOpen(true);
    }
  };

  const resetSequence = () => {
    setHasKey(false);
    setIsChestOpen(false);
  };

  // Path Maze step
  const handleMoveCat = () => {
    setCatPosition((prev) => Math.min(prev + 1, 3));
  };

  const resetCat = () => {
    setCatPosition(0);
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
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
              Domain: Komputasi
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-100">
            {labType === 'spatial_sorting' && 'Pengenalan Pola Geometri & Shape Sorter'}
            {labType === 'color_grouping' && 'Klasifikasi Atribut & Pengelompokan Warna'}
            {labType === 'step_sequence' && 'Runtunan Instruksi 2-Langkah (Algoritma Dini)'}
            {labType === 'binary_switch' && 'Saklar Logika Biner 0/1 (Boolean State)'}
            {labType === 'path_maze' && 'Pelacakan Lintasan Garis (Path Traversal)'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {labType === 'spatial_sorting' &&
              'Mencocokkan bentuk fisik dengan cetakan lubang geometris: lingkaran, segitiga, persegi.'}
            {labType === 'color_grouping' &&
              'Pengelompokan elemen berdasarkan kesamaan atribut diskret: kelereng merah vs biru.'}
            {labType === 'step_sequence' &&
              'Pemahaman urutan kausal: langkah pertama (ambil kunci) adalah prasyarat langkah kedua (buka peti).'}
            {labType === 'binary_switch' &&
              'Dua kondisi diskret saling eksklusif (ON atau OFF, 1 atau 0) pada saklar kendali.'}
            {labType === 'path_maze' &&
              'Navigasi ruang linear: memandu karakter melintasi jalur berurutan menuju sasaran tujuan.'}
          </p>
        </div>

        {/* Claim Mastery Button */}
        <button
          onClick={() => {
            setHasClaimed(true);
            const titleMap = {
              spatial_sorting: 'Pengenalan Pola Geometri & Shape Sorter',
              color_grouping: 'Klasifikasi Atribut & Pengelompokan Warna',
              step_sequence: 'Runtunan Instruksi 2-Langkah (Algoritma Dini)',
              binary_switch: 'Saklar Logika Biner 0/1 (Boolean State)',
              path_maze: 'Pelacakan Lintasan Garis (Path Traversal)',
            };
            onMasteryEvidence(
              titleMap[labType],
              `Anak berhasil membuktikan penguasaan dasar komputasional ${titleMap[labType]} pada tahap sensori-motorik usia 1-3 tahun.`
            );
          }}
          disabled={hasClaimed}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
            hasClaimed
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 cursor-default'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950'
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

      {/* 1. Spatial Sorting (Shape Sorter) */}
      {labType === 'spatial_sorting' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-300 font-bold">
              Klik bentuk di bawah untuk mencocokkannya ke lubang cetakan pasangannya:
            </span>
            <button
              onClick={resetShapes}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
            >
              Reset Bentuk
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Circle */}
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-between min-h-[200px]">
              <span className="text-xs font-bold text-amber-400 uppercase">Lingkaran (Bulat)</span>
              <div
                className={`w-20 h-20 rounded-full border-4 border-dashed flex items-center justify-center transition-all ${
                  sortedShapes.circle
                    ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-lg'
                    : 'border-slate-700 bg-slate-900 text-slate-600'
                }`}
              >
                {sortedShapes.circle ? '● Masuk!' : 'Lubang Bulat'}
              </div>
              {!sortedShapes.circle ? (
                <button
                  onClick={() => handleSortShape('circle')}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                >
                  Masukkan Balok Bulat
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400">✓ Cocok Sempurna!</span>
              )}
            </div>

            {/* Square */}
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-between min-h-[200px]">
              <span className="text-xs font-bold text-cyan-400 uppercase">Persegi (Kotak)</span>
              <div
                className={`w-20 h-20 rounded-xl border-4 border-dashed flex items-center justify-center transition-all ${
                  sortedShapes.square
                    ? 'bg-cyan-500 border-cyan-300 text-slate-950 shadow-lg'
                    : 'border-slate-700 bg-slate-900 text-slate-600'
                }`}
              >
                {sortedShapes.square ? '■ Masuk!' : 'Lubang Kotak'}
              </div>
              {!sortedShapes.square ? (
                <button
                  onClick={() => handleSortShape('square')}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow"
                >
                  Masukkan Balok Kotak
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400">✓ Cocok Sempurna!</span>
              )}
            </div>

            {/* Triangle */}
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-between min-h-[200px]">
              <span className="text-xs font-bold text-rose-400 uppercase">Segitiga (Tiga Sudut)</span>
              <div
                className={`w-20 h-20 rounded-xl border-4 border-dashed flex items-center justify-center transition-all ${
                  sortedShapes.triangle
                    ? 'bg-rose-500 border-rose-300 text-slate-950 shadow-lg'
                    : 'border-slate-700 bg-slate-900 text-slate-600'
                }`}
              >
                {sortedShapes.triangle ? '▲ Masuk!' : 'Lubang Segitiga'}
              </div>
              {!sortedShapes.triangle ? (
                <button
                  onClick={() => handleSortShape('triangle')}
                  className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs shadow"
                >
                  Masukkan Balok Segitiga
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400">✓ Cocok Sempurna!</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Color Grouping Simulation */}
      {labType === 'color_grouping' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-bold text-emerald-300 uppercase block">
                Pilahlah Kelereng Berdasarkan Kesamaan Warna
              </span>
              <span className="text-xs text-slate-400">
                Sisa kelereng di nampan acak: {unassignedMarbles.length} butir
              </span>
            </div>
            <button
              onClick={resetMarbles}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              Reset Kelereng
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Random Tray */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-between min-h-[220px]">
              <span className="text-xs font-bold text-slate-300 uppercase">Nampan Campuran</span>
              <div className="flex flex-wrap gap-3 justify-center my-4">
                {unassignedMarbles.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">Semua kelereng terpilah rapi!</span>
                ) : (
                  unassignedMarbles.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => handleSortMarble(color as 'red' | 'blue')}
                      className={`w-10 h-10 rounded-full shadow-lg border-2 active:scale-95 transition flex items-center justify-center text-xs font-bold ${
                        color === 'red'
                          ? 'bg-rose-500 border-rose-300 text-white'
                          : 'bg-blue-500 border-blue-300 text-white'
                      }`}
                      title="Klik untuk memilah"
                    >
                      {color === 'red' ? 'M' : 'B'}
                    </button>
                  ))
                )}
              </div>
              <span className="text-[11px] text-slate-400">Klik kelereng untuk mengirim ke wadah pasangannya</span>
            </div>

            {/* Red Bin */}
            <div className="bg-slate-950 p-5 rounded-xl border-2 border-rose-500/40 bg-rose-950/20 flex flex-col items-center justify-between min-h-[220px]">
              <span className="text-xs font-bold text-rose-300 uppercase">Wadah Merah (Red Bin)</span>
              <div className="flex flex-wrap gap-2 justify-center my-4">
                {Array.from({ length: redBin }).map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-rose-500 border-2 border-rose-300 shadow" />
                ))}
              </div>
              <span className="text-xs font-mono text-rose-300 font-bold">{redBin} Kelereng Merah</span>
            </div>

            {/* Blue Bin */}
            <div className="bg-slate-950 p-5 rounded-xl border-2 border-blue-500/40 bg-blue-950/20 flex flex-col items-center justify-between min-h-[220px]">
              <span className="text-xs font-bold text-blue-300 uppercase">Wadah Biru (Blue Bin)</span>
              <div className="flex flex-wrap gap-2 justify-center my-4">
                {Array.from({ length: blueBin }).map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-300 shadow" />
                ))}
              </div>
              <span className="text-xs font-mono text-blue-300 font-bold">{blueBin} Kelereng Biru</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Step Sequence Simulation */}
      {labType === 'step_sequence' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-emerald-300 uppercase">
              Rangkaian Algoritmik: Langkah 1 Harus Selesai Sebelum Langkah 2!
            </span>
            <button
              onClick={resetSequence}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              Reset Peti
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Step 1: Key */}
            <div
              className={`p-6 rounded-xl border-2 flex flex-col items-center justify-between min-h-[220px] transition ${
                hasKey ? 'bg-amber-950/40 border-amber-500/60' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Langkah 1: Ambil Kunci Emas
              </span>

              <div className="text-5xl my-2">{hasKey ? '🔑' : '🔒'}</div>

              {!hasKey ? (
                <button
                  onClick={handleGetKey}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition active:scale-95"
                >
                  Ambil Kunci Emas Sekarang
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400">✓ Kunci Berhasil Diambil!</span>
              )}
            </div>

            {/* Step 2: Chest */}
            <div
              className={`p-6 rounded-xl border-2 flex flex-col items-center justify-between min-h-[220px] transition ${
                isChestOpen ? 'bg-emerald-950/40 border-emerald-500/60' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Langkah 2: Buka Peti Harta Karun
              </span>

              <div className="text-5xl my-2">{isChestOpen ? '🎁' : '📦'}</div>

              {!isChestOpen ? (
                <button
                  onClick={handleOpenChest}
                  disabled={!hasKey}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {hasKey ? 'Buka Peti dengan Kunci' : 'Terkunci! Butuh Langkah 1 Dulu'}
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400 animate-bounce">
                  🎉 Harta Karun Terbuka! Urutan algoritma berhasil dijalankan.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Binary Switch Simulation */}
      {labType === 'binary_switch' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Switch toggle control */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-between min-h-[240px]">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Saklar Kendali Biner
            </span>

            <button
              onClick={() => setIsSwitchOn(!isSwitchOn)}
              className={`w-28 h-14 rounded-full p-1.5 transition-colors duration-300 flex items-center shadow-2xl ${
                isSwitchOn ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center font-black text-xs text-slate-950 font-mono">
                {isSwitchOn ? '1' : '0'}
              </div>
            </button>

            <span className="text-xs font-mono font-bold text-slate-200">
              Kondisi Logika: {isSwitchOn ? 'TRUE (1 / NYALA)' : 'FALSE (0 / MATI)'}
            </span>
          </div>

          {/* Lamp Visual output */}
          <div
            className={`p-6 rounded-xl border-2 flex flex-col items-center justify-between min-h-[240px] transition-all duration-300 ${
              isSwitchOn
                ? 'bg-amber-500/20 border-amber-400 shadow-2xl shadow-amber-500/20'
                : 'bg-slate-950 border-slate-800'
            }`}
          >
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Lampu Output Mercusuar
            </span>

            <Lightbulb
              className={`w-24 h-24 transition-all duration-300 ${
                isSwitchOn ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]' : 'text-slate-700'
              }`}
            />

            <span className="text-xs font-bold text-slate-300">
              {isSwitchOn ? '✨ Terang Benderang (State 1)' : '🌑 Gelap Gulita (State 0)'}
            </span>
          </div>
        </div>
      )}

      {/* 5. Path Maze Simulation */}
      {labType === 'path_maze' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-emerald-300 uppercase">
              Bimbing Kucing Kecil Menuju Mangkuk Susu
            </span>
            <button
              onClick={resetCat}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              Ulang Lintasan
            </button>
          </div>

          {/* 4-Step Linear Track Visual */}
          <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 flex items-center justify-between min-h-[220px]">
            {[0, 1, 2, 3].map((step) => {
              const isCatHere = catPosition === step;
              const isGoal = step === 3;
              return (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                      isCatHere
                        ? 'bg-amber-500/30 border-amber-400 scale-110 shadow-lg'
                        : isGoal
                        ? 'bg-cyan-950/40 border-cyan-700'
                        : 'bg-slate-900 border-slate-800 text-slate-600'
                    }`}
                  >
                    {isCatHere ? (
                      <span className="text-3xl animate-bounce">🐱</span>
                    ) : isGoal ? (
                      <span className="text-3xl">🥛</span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-slate-500">Jejak {step + 1}</span>
                    )}
                  </div>
                  {step < 3 && <div className="w-8 h-1 bg-slate-800 rounded" />}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            {catPosition < 3 ? (
              <button
                onClick={handleMoveCat}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg transition active:scale-95 flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Maju 1 Langkah ke Depan</span>
              </button>
            ) : (
              <span className="text-xs font-bold text-emerald-400 animate-bounce">
                🎉 Nyam-nyam! Kucing berhasil sampai di mangkuk susu melalui lintasan yang benar!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Pedagogical Note for Parent/Educator */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 space-y-1">
        <span className="font-bold text-slate-200">Catatan Pemikiran Komputasional Dini:</span>
        <p>
          Komputasi bukan sekadar kode komputer; ini adalah struktur bernalar logis. Memasukkan bentuk geometris
          ke lubang yang tepat adalah <em>pattern matching</em>; memilah kelereng adalah <em>data categorization</em>;
          mengambil kunci sebelum membuka peti adalah <em>sequential execution</em>; dan saklar lampu adalah konsep
          <em>binary boolean logic</em> yang paling fundamental.
        </p>
      </div>
    </div>
  );
};
