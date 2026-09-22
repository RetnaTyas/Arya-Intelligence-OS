import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Baby,
  ArrowRight,
  Bell,
  Volume2,
  Layers,
  Box,
  Eye,
  Smile,
  Zap,
} from 'lucide-react';

interface ToddlerLogicLabsProps {
  labType: 'action_reaction' | 'containment_relations' | 'mirror_identity' | 'domino_cascade';
  onMasteryEvidence: (conceptName: string, details: string) => void;
}

export const ToddlerLogicLabs: React.FC<ToddlerLogicLabsProps> = ({
  labType,
  onMasteryEvidence,
}) => {
  const [hasClaimed, setHasClaimed] = useState(false);

  // State 1: Action-Reaction
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);
  const [wheelSpeed, setWheelSpeed] = useState<'idle' | 'spinning'>('idle');
  const [bellRinging, setBellRinging] = useState(false);

  // State 2: Containment (In/Out)
  const [basketItems, setBasketItems] = useState<string[]>(['Bola Biru', 'Kubus Kuning']);
  const [tableItems, setTableItems] = useState<string[]>(['Segitiga Merah']);
  const [isLidClosed, setIsLidClosed] = useState(false);
  const [isBasketInverted, setIsBasketInverted] = useState(false);

  // State 3: Mirror Identity
  const [toddlerAction, setToddlerAction] = useState<'wave' | 'smile' | 'clap'>('wave');
  const [hasStickerOnForehead, setHasStickerOnForehead] = useState(true);
  const [stickerTouched, setStickerTouched] = useState(false);

  // State 4: Domino Cascade
  const [dominoSpacing, setDominoSpacing] = useState<'ideal' | 'too_far'>('ideal');
  const [dominoStep, setDominoStep] = useState<0 | 1 | 2 | 3>(0);
  const [isPushing, setIsPushing] = useState(false);

  // Handler for Action-Reaction trigger
  const handleTriggerAction = (type: 'bell' | 'pinwheel' | 'light') => {
    setButtonPressed(type);
    if (type === 'bell') {
      setBellRinging(true);
      setTimeout(() => setBellRinging(false), 1200);
    } else if (type === 'pinwheel') {
      setWheelSpeed('spinning');
      setTimeout(() => setWheelSpeed('idle'), 2000);
    }
  };

  // Handler for Containment (putting item in basket)
  const handleMoveToBasket = (item: string) => {
    if (isLidClosed) return;
    setTableItems((prev) => prev.filter((i) => i !== item));
    setBasketItems((prev) => [...prev, item]);
  };

  const handleTakeFromBasket = (item: string) => {
    if (isLidClosed) return;
    setBasketItems((prev) => prev.filter((i) => i !== item));
    setTableItems((prev) => [...prev, item]);
  };

  const handleInvertBasket = () => {
    if (isLidClosed) {
      // items trapped inside
      setIsBasketInverted(!isBasketInverted);
    } else {
      // all items spill out
      setIsBasketInverted(true);
      setTableItems((prev) => [...prev, ...basketItems]);
      setBasketItems([]);
      setTimeout(() => setIsBasketInverted(false), 1500);
    }
  };

  // Handler for Domino Push
  const handlePushDomino = () => {
    setIsPushing(true);
    setDominoStep(1);

    setTimeout(() => {
      if (dominoSpacing === 'ideal') {
        setDominoStep(2);
        setTimeout(() => {
          setDominoStep(3); // Hit the bell!
          setIsPushing(false);
        }, 500);
      } else {
        // Distance too far: stops at step 1
        setIsPushing(false);
      }
    }, 500);
  };

  const resetDomino = () => {
    setDominoStep(0);
    setIsPushing(false);
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
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-950 text-cyan-300 border border-cyan-800">
              Domain: Logika & Kausal
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-100">
            {labType === 'action_reaction' && 'Aksi-Reaksi Kausal & Tuas Rangsang'}
            {labType === 'containment_relations' && 'Relasi Spasial Wadah & Konten (In/Out)'}
            {labType === 'mirror_identity' && 'Pencerminan Diri & Simetri Optik'}
            {labType === 'domino_cascade' && 'Rantai Kausal Sekuensial & Efek Domino'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {labType === 'action_reaction' &&
              'Eksplorasi agensi fisik: setiap tekanan tombol memicu efek visual dan audio deterministik seketika.'}
            {labType === 'containment_relations' &&
              'Eksplorasi batas ruang: memasukkan ke dalam, mengeluarkan, dan menumpahkan wadah saat dibalik.'}
            {labType === 'mirror_identity' &&
              'Uji cermin Rouge: kesadaran refleksi optik diri dan pemetaan spasial gerakan tubuh.'}
            {labType === 'domino_cascade' &&
              'Transitivitas gaya: dorongan awal diteruskan melalui perantara balok hingga memicu sasaran akhir.'}
          </p>
        </div>

        {/* Claim Mastery Button */}
        <button
          onClick={() => {
            setHasClaimed(true);
            const titleMap = {
              action_reaction: 'Aksi-Reaksi Kausal & Tuas Rangsang',
              containment_relations: 'Relasi Spasial Wadah & Konten (In/Out)',
              mirror_identity: 'Pencerminan Diri & Simetri Optik',
              domino_cascade: 'Rantai Kausal Sekuensial & Efek Domino',
            };
            onMasteryEvidence(
              titleMap[labType],
              `Anak berhasil membuktikan pemahaman ${titleMap[labType]} pada rentang usia 1-3 tahun dengan eksplorasi interaktif kausal langsung.`
            );
          }}
          disabled={hasClaimed}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
            hasClaimed
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 cursor-default'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950'
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

      {/* 1. Action-Reaction Simulation */}
      {labType === 'action_reaction' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Action Triggers (Buttons) */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Pemicu Aksi (Tuas Balita)</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Tekan tombol warna cerah di bawah untuk memicu akibat fisik langsung:
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleTriggerAction('bell')}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg active:scale-95 transition flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-950" />
                  <span>Tekan Bel Kuning</span>
                </span>
                <span className="text-xs font-mono bg-amber-600/30 px-2 py-0.5 rounded">DENTANG!</span>
              </button>

              <button
                onClick={() => handleTriggerAction('pinwheel')}
                className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg active:scale-95 transition flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-cyan-950" />
                  <span>Putar Kincir Angin</span>
                </span>
                <span className="text-xs font-mono bg-cyan-600/30 px-2 py-0.5 rounded">WUSH!</span>
              </button>
            </div>
          </div>

          {/* Interactive Visual Arena */}
          <div className="md:col-span-2 bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
            <div className="flex items-center gap-12">
              {/* Bell Visual */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center transition-transform ${
                    bellRinging ? 'scale-125 rotate-12 bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/50' : 'text-amber-400'
                  }`}
                >
                  <Bell className="w-10 h-10" />
                </div>
                <span className="text-xs font-bold text-slate-300 mt-2">Lonceng Genta</span>
                {bellRinging && (
                  <span className="text-[11px] font-bold text-amber-300 animate-bounce mt-1">
                    DING! DONG! ♪
                  </span>
                )}
              </div>

              {/* Pinwheel Visual */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-full border-2 border-cyan-400 bg-cyan-500/10 flex items-center justify-center transition-all ${
                    wheelSpeed === 'spinning' ? 'animate-spin border-cyan-300 text-cyan-300 shadow-xl shadow-cyan-500/40' : 'text-cyan-500'
                  }`}
                >
                  <RotateCcw className="w-10 h-10" />
                </div>
                <span className="text-xs font-bold text-slate-300 mt-2">Kincir Angin</span>
                {wheelSpeed === 'spinning' && (
                  <span className="text-[11px] font-bold text-cyan-300 animate-pulse mt-1">
                    Berputar Cepat!
                  </span>
                )}
              </div>
            </div>

            {/* Causal Feedback Note */}
            <div className="mt-6 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-center">
              <span className="text-xs text-slate-300 font-medium">
                {buttonPressed
                  ? `Sebab: Tekan tombol ${buttonPressed} → Akibat deterministik langsung terlihat!`
                  : 'Sentuh tombol di kiri untuk mengamati hubungan sebab-akibat langsung.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Containment Relations Simulation */}
      {labType === 'containment_relations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Basket Container Area */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-between min-h-[300px]">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5">
                <Box className="w-4 h-4" />
                <span>Wadah Keranjang Transparan</span>
              </span>
              <button
                onClick={() => setIsLidClosed(!isLidClosed)}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  isLidClosed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {isLidClosed ? 'Tutup Rapat (Locked)' : 'Tutup Terbuka'}
              </button>
            </div>

            {/* Visual Basket Box */}
            <div
              className={`w-56 h-44 rounded-2xl border-4 border-dashed border-amber-400/80 bg-amber-500/10 p-3 flex flex-col justify-end transition-all ${
                isBasketInverted ? 'rotate-180 border-rose-400 bg-rose-500/20' : ''
              }`}
            >
              <div className="text-center text-[10px] text-amber-300 mb-2 font-mono">
                {isBasketInverted ? 'WADAH DIBALIK KE BAWAH' : 'RUANG DALAM WADAH (IN)'}
              </div>
              <div className="flex flex-wrap gap-2 justify-center items-center min-h-[60px]">
                {basketItems.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">Wadah Kosong</span>
                ) : (
                  basketItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleTakeFromBasket(item)}
                      disabled={isLidClosed}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 shadow hover:bg-amber-300 transition active:scale-95"
                      title="Klik untuk keluarkan"
                    >
                      {item}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Invert Basket Action */}
            <div className="mt-4 flex gap-2 w-full">
              <button
                onClick={handleInvertBasket}
                className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Balikkan Wadah (Uji Gravitasi)</span>
              </button>
            </div>
          </div>

          {/* Outside (Table) Area */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Ruang Luar (Meja / OUT)</span>
                </span>
                <span className="text-xs text-slate-400">{tableItems.length} Benda di Luar</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Klik benda di bawah untuk <strong>memasukkannya ke dalam wadah</strong>:
              </p>

              <div className="flex flex-wrap gap-2.5">
                {tableItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleMoveToBasket(item)}
                    disabled={isLidClosed}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow transition flex items-center gap-1.5 active:scale-95"
                  >
                    <span>{item}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="text-[10px] font-mono">Masuk</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
              {isLidClosed
                ? '🔒 Tutup terkunci: Benda tidak bisa masuk/keluar, dan tidak tumpah meski wadah dibalik.'
                : '🔓 Wadah terbuka: Saat dibalik, gravitasi menarik semua benda keluar tumpah ke meja.'}
            </div>
          </div>
        </div>
      )}

      {/* 3. Mirror Identity Simulation */}
      {labType === 'mirror_identity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Child Actor */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-between min-h-[280px]">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
              Gerakan Fisik Tubuh Anak (Realitas)
            </span>

            <div className="relative w-36 h-36 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex flex-col items-center justify-center">
              <Smile className="w-16 h-16 text-cyan-300" />
              {hasStickerOnForehead && !stickerTouched && (
                <div className="absolute top-4 w-4 h-4 rounded-full bg-rose-500 border border-white animate-pulse" />
              )}
              <span className="text-xs font-bold text-slate-200 mt-1">
                {toddlerAction === 'wave' && '👋 Melambaikan Tangan'}
                {toddlerAction === 'smile' && '😄 Tersenyum Ceria'}
                {toddlerAction === 'clap' && '👏 Bertepuk Tangan'}
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setToddlerAction('wave')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium"
              >
                Lambaikan Tangan
              </button>
              <button
                onClick={() => setToddlerAction('clap')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium"
              >
                Tepuk Tangan
              </button>
            </div>
          </div>

          {/* Mirror Reflection */}
          <div className="bg-slate-950 p-6 rounded-xl border-4 border-slate-700 shadow-inner flex flex-col items-center justify-between min-h-[280px]">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>Pantulan Cermin Datar (Refleksi Optik)</span>
            </span>

            <div className="relative w-36 h-36 rounded-full bg-slate-900 border-2 border-amber-400/80 flex flex-col items-center justify-center">
              <Smile className="w-16 h-16 text-amber-300 scale-x-[-1]" />
              {hasStickerOnForehead && !stickerTouched && (
                <button
                  onClick={() => setStickerTouched(true)}
                  className="absolute top-4 w-4 h-4 rounded-full bg-rose-500 border border-white animate-ping hover:scale-125"
                  title="Sentuh stiker di cermin"
                />
              )}
              <span className="text-xs font-bold text-amber-200 mt-1 scale-x-[-1]">
                {toddlerAction === 'wave' && '👋 Melambai Sinkron'}
                {toddlerAction === 'smile' && '😄 Tersenyum Sinkron'}
                {toddlerAction === 'clap' && '👏 Bertepuk Sinkron'}
              </span>
            </div>

            <div className="mt-3 text-center">
              {stickerTouched ? (
                <span className="text-xs font-bold text-emerald-400">
                  ✓ Berhasil! Balita menyadari stiker merah ada di dahinya sendiri, bukan pada anak lain!
                </span>
              ) : (
                <button
                  onClick={() => setStickerTouched(true)}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Sentuh Stiker Merah di Dahi
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Domino Cascade Simulation */}
      {labType === 'domino_cascade' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300">Jarak Antar Balok:</span>
              <button
                onClick={() => {
                  setDominoSpacing('ideal');
                  resetDomino();
                }}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  dominoSpacing === 'ideal' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Jarak Ideal (Rapat)
              </button>
              <button
                onClick={() => {
                  setDominoSpacing('too_far');
                  resetDomino();
                }}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  dominoSpacing === 'too_far' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Terlalu Jauh (Renggang)
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePushDomino}
                disabled={isPushing || dominoStep > 0}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow disabled:opacity-50"
              >
                Dorong Balok 1 (Gaya Awal)
              </button>
              <button
                onClick={resetDomino}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Domino Track Visual */}
          <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 flex items-center justify-around min-h-[220px]">
            {/* Domino 1 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-28 rounded-lg bg-amber-500 border-2 border-amber-300 transition-all duration-300 ${
                  dominoStep >= 1 ? 'rotate-45 translate-x-6 bg-amber-600' : ''
                }`}
              />
              <span className="text-xs font-bold text-slate-400 mt-2">Balok A</span>
            </div>

            {/* Gap arrow */}
            <ArrowRight className="w-5 h-5 text-slate-600" />

            {/* Domino 2 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-28 rounded-lg bg-cyan-500 border-2 border-cyan-300 transition-all duration-300 ${
                  dominoStep >= 2
                    ? 'rotate-45 translate-x-6 bg-cyan-600'
                    : dominoSpacing === 'too_far'
                    ? 'translate-x-12'
                    : ''
                }`}
              />
              <span className="text-xs font-bold text-slate-400 mt-2">Balok B (Perantara)</span>
            </div>

            {/* Gap arrow */}
            <ArrowRight className="w-5 h-5 text-slate-600" />

            {/* Target Bell */}
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all ${
                  dominoStep >= 3
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 scale-125 shadow-lg shadow-emerald-500/50'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                <Bell className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-slate-400 mt-2">Sasaran Lonceng C</span>
              {dominoStep >= 3 && (
                <span className="text-[11px] font-bold text-emerald-300 animate-bounce mt-1">
                  KLING! TERCAPAI!
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pedagogical Note for Parent/Educator */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 space-y-1">
        <span className="font-bold text-slate-200">Catatan Kognitif (Sensori-Motorik 1-3 Tahun):</span>
        <p>
          Balita belajar memahami hukum alam melalui manipulasi motorik langsung. Di usia ini, penjelasan abstrak
          belum berguna; yang menancap di memori adalah invariansi fisik: tombol selalu berbunyi saat ditekan, wadah
          selalu menumpahkan isinya saat dibalik tanpa tutup, dan transfer gaya membutuhkan kontak nyata.
        </p>
      </div>
    </div>
  );
};
