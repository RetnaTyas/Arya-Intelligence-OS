import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Baby,
  ArrowDown,
  Droplets,
  Magnet,
  Zap,
  Layers,
  Circle,
} from 'lucide-react';

interface ToddlerPhysicsLabsProps {
  labType: 'gravity_ramp' | 'heavy_light' | 'sink_or_float' | 'magnetic_attraction' | 'bounce_elasticity';
  onMasteryEvidence: (conceptName: string, details: string) => void;
}

export const ToddlerPhysicsLabs: React.FC<ToddlerPhysicsLabsProps> = ({
  labType,
  onMasteryEvidence,
}) => {
  const [hasClaimed, setHasClaimed] = useState(false);

  // 1. Gravity Ramp State
  const [rampAngle, setRampAngle] = useState<'gentle' | 'steep'>('gentle');
  const [ballRolling, setBallRolling] = useState(false);
  const [rollPosition, setRollPosition] = useState<number>(0); // 0 (top) to 100 (bottom)

  // 2. Heavy vs Light (Seesaw) State
  const [leftItem, setLeftItem] = useState<{ name: string; weight: number }>({ name: 'Batu Kerikil', weight: 8 });
  const [rightItem, setRightItem] = useState<{ name: string; weight: number }>({ name: 'Bulu Unggas', weight: 1 });

  // 3. Sink or Float State
  const [poolItems, setPoolItems] = useState<
    { id: string; name: string; behavior: 'float' | 'sink'; isSubmerged: boolean; icon: string }[]
  >([
    { id: 'duck', name: 'Bebek Karet', behavior: 'float', isSubmerged: false, icon: '🦆' },
    { id: 'rock', name: 'Batu Kali', behavior: 'sink', isSubmerged: false, icon: '🪨' },
    { id: 'wood', name: 'Balok Kayu', behavior: 'float', isSubmerged: false, icon: '🪵' },
    { id: 'coin', name: 'Koin Emas', behavior: 'sink', isSubmerged: false, icon: '🪙' },
  ]);

  // 4. Magnet Attraction State
  const [magnetNear, setMagnetNear] = useState(false);

  // 5. Bounce & Elasticity State
  const [droppedType, setDroppedType] = useState<'rubber_ball' | 'playdough' | null>(null);
  const [isBouncing, setIsBouncing] = useState(false);

  // Ramp Roll Action
  const handleRollBall = () => {
    if (ballRolling) return;
    setBallRolling(true);
    setRollPosition(0);

    const duration = rampAngle === 'steep' ? 600 : 1200;
    const interval = 50;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setRollPosition((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setBallRolling(false);
          return 100;
        }
        return prev + step;
      });
    }, interval);
  };

  // Reset Ramp
  const resetRamp = () => {
    setBallRolling(false);
    setRollPosition(0);
  };

  // Drop object in water pool
  const toggleSubmerge = (id: string) => {
    setPoolItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isSubmerged: !item.isSubmerged } : item))
    );
  };

  // Drop Bounce test
  const handleDropBounce = (type: 'rubber_ball' | 'playdough') => {
    setDroppedType(type);
    setIsBouncing(true);
    setTimeout(() => {
      setIsBouncing(false);
    }, 1500);
  };

  // Calculate seesaw tilt
  const tiltDeg = leftItem.weight > rightItem.weight ? -15 : leftItem.weight < rightItem.weight ? 15 : 0;

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
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-teal-950 text-teal-300 border border-teal-800">
              Domain: Fisika
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-100">
            {labType === 'gravity_ramp' && 'Gravitasi Jatuh Bebas & Bidang Miring'}
            {labType === 'heavy_light' && 'Massa Komparatif & Jungkat-Jungkit Keseimbangan'}
            {labType === 'sink_or_float' && 'Tenggelam vs Terapung Intuitif Fluida'}
            {labType === 'magnetic_attraction' && 'Gaya Magnetik & Tarik-Menolak Logam'}
            {labType === 'bounce_elasticity' && 'Elastisitas & Benturan Pantul Benda'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {labType === 'gravity_ramp' &&
              'Eksplorasi gaya tarik bumi: sudut miring mempercepat bola menggelinding ke bawah.'}
            {labType === 'heavy_light' &&
              'Benda berbobot lebih berat menekan tuas jungkat-jungkit lebih dalam dibandingkan benda ringan.'}
            {labType === 'sink_or_float' &&
              'Air memberikan gaya apung ke atas: kayu dan spons mengambang, sedangkan batu dan logam tenggelam.'}
            {labType === 'magnetic_attraction' &&
              'Gaya kontak tak kasat mata: magnet menarik besi tanpa perlu menyentuh langsung.'}
            {labType === 'bounce_elasticity' &&
              'Bola karet elastis memantul kembali, sedangkan adonan lempung pipih menyerap benturan.'}
          </p>
        </div>

        {/* Claim Mastery Button */}
        <button
          onClick={() => {
            setHasClaimed(true);
            const titleMap = {
              gravity_ramp: 'Gravitasi Jatuh Bebas & Bidang Miring',
              heavy_light: 'Massa Komparatif & Jungkat-Jungkit Keseimbangan',
              sink_or_float: 'Tenggelam vs Terapung Intuitif Fluida',
              magnetic_attraction: 'Gaya Magnetik & Tarik-Menolak Logam',
              bounce_elasticity: 'Elastisitas & Benturan Pantul Benda',
            };
            onMasteryEvidence(
              titleMap[labType],
              `Anak berhasil membuktikan penguasaan konsep fisika dasar ${titleMap[labType]} pada tahap sensori-motorik usia 1-3 tahun.`
            );
          }}
          disabled={hasClaimed}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
            hasClaimed
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 cursor-default'
              : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950'
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

      {/* 1. Gravity Ramp Simulation */}
      {labType === 'gravity_ramp' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
              Kemiringan Perosotan
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRampAngle('gentle');
                  resetRamp();
                }}
                className={`flex-1 py-2 rounded-lg font-bold text-xs transition ${
                  rampAngle === 'gentle' ? 'bg-teal-600 text-white shadow' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Landai (Pelan)
              </button>
              <button
                onClick={() => {
                  setRampAngle('steep');
                  resetRamp();
                }}
                className={`flex-1 py-2 rounded-lg font-bold text-xs transition ${
                  rampAngle === 'steep' ? 'bg-amber-600 text-white shadow' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Curam (Cepat!)
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={handleRollBall}
                disabled={ballRolling}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ArrowDown className="w-4 h-4" />
                <span>Lepaskan Bola Kayu!</span>
              </button>
            </div>
          </div>

          {/* Ramp Visual Arena */}
          <div className="md:col-span-2 bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col justify-between min-h-[260px] relative overflow-hidden">
            <span className="text-[11px] font-mono text-slate-400">
              Lintasan Bidang Miring (Percepatan Gravitasi: a = g · sin θ)
            </span>

            {/* Ramp Track Line */}
            <div className="relative w-full h-32 flex items-center">
              {/* Ramp Beam */}
              <div
                className={`absolute w-full h-4 bg-gradient-to-r from-amber-600 to-amber-800 rounded-full shadow transition-all duration-300 ${
                  rampAngle === 'steep' ? 'rotate-12 origin-left' : 'rotate-6 origin-left'
                }`}
              />

              {/* Rolling Ball */}
              <div
                className="absolute w-8 h-8 rounded-full bg-rose-500 border-2 border-rose-300 shadow-md flex items-center justify-center text-xs font-bold text-white transition-all"
                style={{
                  left: `${Math.min(rollPosition, 92)}%`,
                  top: `${rampAngle === 'steep' ? rollPosition * 0.7 : rollPosition * 0.4}px`,
                }}
              >
                ⚽
              </div>
            </div>

            {/* Target Catcher */}
            <div className="w-full flex justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-2">
              <span>Puncak (Start)</span>
              <span>
                {rollPosition >= 100
                  ? '🎯 Hore! Bola sampai di dasar karena tarikan gravitasi!'
                  : 'Siap meluncur ke bawah.'}
              </span>
              <span>Dasar (Finish)</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Heavy vs Light (Seesaw) Simulation */}
      {labType === 'heavy_light' && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-teal-300 uppercase">
              Uji Beban di Sisi Kiri & Kanan
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setLeftItem({ name: 'Batu Kerikil', weight: 8 });
                  setRightItem({ name: 'Bulu Unggas', weight: 1 });
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium"
              >
                Batu vs Bulu
              </button>
              <button
                onClick={() => {
                  setLeftItem({ name: 'Kapas Lembut', weight: 2 });
                  setRightItem({ name: 'Gajah Mainan', weight: 10 });
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium"
              >
                Kapas vs Gajah
              </button>
              <button
                onClick={() => {
                  setLeftItem({ name: 'Apel Merah', weight: 5 });
                  setRightItem({ name: 'Apel Merah', weight: 5 });
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium"
              >
                Seimbang (Sama Berat)
              </button>
            </div>
          </div>

          {/* Seesaw Visual */}
          <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[260px] relative">
            {/* Tilting Beam */}
            <div
              className="w-80 h-4 bg-amber-600 rounded-full relative transition-transform duration-500 shadow-xl"
              style={{ transform: `rotate(${tiltDeg}deg)` }}
            >
              {/* Left Seat */}
              <div className="absolute -top-12 left-0 flex flex-col items-center">
                <span className="text-2xl">{leftItem.weight >= 8 ? '🪨' : leftItem.weight <= 2 ? '🪶' : '🍎'}</span>
                <span className="text-[10px] font-bold text-slate-200 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 mt-1 whitespace-nowrap">
                  {leftItem.name}
                </span>
              </div>

              {/* Right Seat */}
              <div className="absolute -top-12 right-0 flex flex-col items-center">
                <span className="text-2xl">{rightItem.weight >= 8 ? '🐘' : rightItem.weight <= 2 ? '🪶' : '🍎'}</span>
                <span className="text-[10px] font-bold text-slate-200 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 mt-1 whitespace-nowrap">
                  {rightItem.name}
                </span>
              </div>
            </div>

            {/* Fulcrum (Triangle Pivot) */}
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[36px] border-b-slate-600 mt-2" />
            <div className="w-48 h-2 bg-slate-700 rounded-full mt-1" />

            <div className="mt-6 text-center text-xs font-bold text-slate-300">
              {tiltDeg < 0 && `Sisi Kiri (${leftItem.name}) lebih berat, menekan ke bawah!`}
              {tiltDeg > 0 && `Sisi Kanan (${rightItem.name}) lebih berat, menekan ke bawah!`}
              {tiltDeg === 0 && 'Kedua sisi seimbang! Massa kedua benda tepat setara.'}
            </div>
          </div>
        </div>
      )}

      {/* 3. Sink or Float Simulation */}
      {labType === 'sink_or_float' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
              Benda di Pinggir Kolam
            </span>
            <p className="text-[11px] text-slate-400">
              Klik benda untuk mencelupkannya ke dalam air:
            </p>

            <div className="flex flex-col gap-2">
              {poolItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleSubmerge(item.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                    item.isSubmerged
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-70">
                    {item.isSubmerged ? 'Di Dalam Air' : 'Di Luar'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Water Pool Visual */}
          <div className="md:col-span-2 bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col justify-between min-h-[280px]">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 text-cyan-300 font-bold">
                <Droplets className="w-4 h-4" />
                <span>Kolam Air Akuarium</span>
              </span>
              <span>Permukaan Air</span>
            </div>

            {/* Aquarium Box */}
            <div className="relative w-full h-44 rounded-xl border-2 border-cyan-500/50 bg-gradient-to-b from-cyan-500/20 to-blue-600/40 p-3 overflow-hidden">
              {/* Water surface ripple line */}
              <div className="absolute top-2 left-0 right-0 h-1 bg-cyan-400/40 animate-pulse" />

              {/* Surface (Floating Items) */}
              <div className="absolute top-4 left-4 right-4 flex gap-4">
                {poolItems
                  .filter((item) => item.isSubmerged && item.behavior === 'float')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-cyan-500/30 border border-cyan-400 text-xs font-bold text-slate-100 flex items-center gap-1.5 animate-bounce shadow"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.name} (Terapung!)</span>
                    </div>
                  ))}
              </div>

              {/* Bottom (Sinking Items) */}
              <div className="absolute bottom-2 left-4 right-4 flex gap-4">
                {poolItems
                  .filter((item) => item.isSubmerged && item.behavior === 'sink')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 shadow"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.name} (Tenggelam ke Dasar)</span>
                    </div>
                  ))}
              </div>
            </div>

            <span className="text-[11px] text-slate-400 text-center mt-2">
              Prinsip: Benda yang massa jenisnya lebih ringan dari air mengapung; yang lebih padat tenggelam.
            </span>
          </div>
        </div>
      )}

      {/* 4. Magnetic Attraction Simulation */}
      {labType === 'magnetic_attraction' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-between min-h-[240px]">
            <span className="text-xs font-bold text-rose-300 uppercase flex items-center gap-1.5">
              <Magnet className="w-4 h-4" />
              <span>Tongkat Magnet</span>
            </span>

            <div
              className={`w-24 h-24 rounded-2xl bg-rose-600 border-4 border-rose-300 shadow-xl flex flex-col items-center justify-center text-white transition-transform ${
                magnetNear ? 'scale-110 shadow-rose-500/50' : ''
              }`}
            >
              <Magnet className="w-10 h-10" />
              <span className="text-[10px] font-mono mt-1 font-bold">UTARA (N)</span>
            </div>

            <button
              onClick={() => setMagnetNear(!magnetNear)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow transition ${
                magnetNear
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {magnetNear ? 'Jauhkan Tongkat Magnet' : 'Dekatkan Tongkat Magnet ke Benda'}
            </button>
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col justify-between min-h-[240px]">
            <span className="text-xs font-bold text-slate-300 uppercase">
              Benda Uji (Logam vs Non-Logam)
            </span>

            <div className="grid grid-cols-2 gap-3 my-2">
              <div
                className={`p-3 rounded-lg border text-center transition ${
                  magnetNear
                    ? 'bg-rose-950/60 border-rose-400 text-rose-200 translate-x-2 shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-2xl block mb-1">📎</span>
                <span className="text-xs font-bold">Klip Besi</span>
                <span className="text-[10px] block mt-1 font-mono">
                  {magnetNear ? '⚡ MENEMPEL KUAT!' : 'Besi Feromagnetik'}
                </span>
              </div>

              <div
                className={`p-3 rounded-lg border text-center transition ${
                  magnetNear ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-2xl block mb-1">✏️</span>
                <span className="text-xs font-bold">Pensil Kayu</span>
                <span className="text-[10px] block mt-1 font-mono">
                  {magnetNear ? 'Tidak Menempel' : 'Bahan Kayu'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg">
              {magnetNear
                ? 'Gaya magnet bekerja menembus udara dan menarik bahan besi tanpa kontak awal!'
                : 'Dekatkan magnet untuk melihat gaya tarik tak terlihat.'}
            </div>
          </div>
        </div>
      )}

      {/* 5. Bounce & Elasticity Simulation */}
      {labType === 'bounce_elasticity' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
              Pilih Material Uji
            </span>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleDropBounce('rubber_ball')}
                disabled={isBouncing}
                className="py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow transition active:scale-95 flex items-center justify-between"
              >
                <span>Bola Karet (Elastis)</span>
                <span className="text-lg">🏀</span>
              </button>

              <button
                onClick={() => handleDropBounce('playdough')}
                disabled={isBouncing}
                className="py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow transition active:scale-95 flex items-center justify-between"
              >
                <span>Adonan Lempung (Plastis)</span>
                <span className="text-lg">🥟</span>
              </button>
            </div>
          </div>

          {/* Visual Bounce Arena */}
          <div className="md:col-span-2 bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-between min-h-[260px]">
            <span className="text-xs text-slate-400">
              Ketinggian Pelepasan 100 cm
            </span>

            <div className="h-36 flex items-end justify-center w-full relative">
              {droppedType === 'rubber_ball' ? (
                <div
                  className={`w-12 h-12 rounded-full bg-teal-400 border-2 border-white shadow-lg flex items-center justify-center text-xl text-slate-950 font-bold ${
                    isBouncing ? 'animate-bounce' : ''
                  }`}
                >
                  🏀
                </div>
              ) : droppedType === 'playdough' ? (
                <div
                  className={`w-16 h-6 rounded-full bg-orange-500 border-2 border-orange-300 shadow flex items-center justify-center text-xs font-bold text-white transition-all`}
                >
                  Pipih!
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic mb-8">
                  Pilih material di kiri untuk menguji pantulan.
                </span>
              )}
            </div>

            {/* Floor line */}
            <div className="w-64 h-3 bg-slate-700 rounded-full" />
            <span className="text-xs font-bold text-slate-300 mt-2">
              {droppedType === 'rubber_ball' && '✓ Bola karet memantul tinggi karena memiliki elastisitas tinggi!'}
              {droppedType === 'playdough' && '✓ Adonan lempung berubah bentuk pipih dan menyerap energi tanpa memantul.'}
              {!droppedType && 'Lantai Keras'}
            </span>
          </div>
        </div>
      )}

      {/* Pedagogical Note for Parent/Educator */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 space-y-1">
        <span className="font-bold text-slate-200">Catatan Fisika Dini:</span>
        <p>
          Hukum fisika bagi balita bukan rumus matematika, melainkan persepsi tubuh terhadap energi:
          kecepatan luncur gravitasi di perosotan, perbedaan berat di jungkat-jungkit, sensasi daya apung air
          yang menolak tenggelam, dan keajaiban gaya magnet yang bekerja tanpa sentuhan langsung.
        </p>
      </div>
    </div>
  );
};
