import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Baby,
  Smile,
  ArrowDown,
  Box,
} from 'lucide-react';

interface ObjectPermanenceLabProps {
  onMasteryEvidence: (details: string) => void;
}

export const ObjectPermanenceLab: React.FC<ObjectPermanenceLabProps> = ({ onMasteryEvidence }) => {
  // Ball state: 'top' | 'falling' | 'hidden_inside' | 'revealed'
  const [ballState, setBallState] = useState<'top' | 'falling' | 'hidden_inside' | 'revealed'>('top');
  const [ballColor, setBallColor] = useState<string>('#38bdf8');
  const [isShutterOpen, setIsShutterOpen] = useState<boolean>(false);
  const [ballCount, setBallCount] = useState<number>(1);
  const [hasClaimedEvidence, setHasClaimedEvidence] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>(
    'Sentuh atau tekan "Jatuhkan Bola" untuk melihat apa yang terjadi saat bola masuk ke dalam kotak misteri!'
  );

  const colors = [
    { name: 'Biru Langit', hex: '#38bdf8' },
    { name: 'Merah Ceria', hex: '#f43f5e' },
    { name: 'Kuning Mentari', hex: '#eab308' },
    { name: 'Hijau Daun', hex: '#10b981' },
  ];

  const handleDropBall = () => {
    if (ballState !== 'top') return;
    setBallState('falling');
    setFeedbackMessage('Bola meluncur ke bawah karena gravitasi...');

    setTimeout(() => {
      setBallState('hidden_inside');
      setFeedbackMessage('Hap! Bola menghilang dari pandangan. Apakah bolanya musnah atau masih ada di dalam kotak?');
    }, 700);
  };

  const handleToggleShutter = () => {
    const nextState = !isShutterOpen;
    setIsShutterOpen(nextState);

    if (ballState === 'hidden_inside' && nextState) {
      setBallState('revealed');
      setFeedbackMessage('Cilukba! Bola masih ada di sana! Objek tetap ada meskipun tidak terlihat oleh mata.');
    }
  };

  const handleReset = () => {
    setBallState('top');
    setIsShutterOpen(false);
    setFeedbackMessage('Bola kembali ke atas. Siap dieksplorasi kembali!');
  };

  const handleVerifyMastery = () => {
    setHasClaimedEvidence(true);
    onMasteryEvidence(
      `Membuktikan Permanensi Objek & Kausalitas Fisik (Tahap Sensori-Motorik 1-3 Tahun): Anak memahami bahwa materi yang tersembunyi di balik penutup tetap eksis di ruang spasial tanpa musnah, membentuk fondasi realisme objektif dan hukum kekekalan materi.`
    );
  };

  return (
    <div id="object-permanence-lab-container" className="space-y-6 animate-fade-in">
      {/* Top Age Stage Banner */}
      <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Baby className="w-3.5 h-3.5" />
              <span>Umur 1 - 3 Tahun · Sensori-Motorik</span>
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Lab Permanensi Objek & Kausalitas Fisik Primer (Simpul: node-object-permanence)
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Prinsip WHY: <em>"Sebelum memahami sains formal, otak balita harus menstabilkan fakta bahwa dunia nyata tetap eksis bahkan saat mata tertutup (Permanensi Objek Jean Piaget)."</em>
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 self-start md:self-auto transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Ulangi Eksplorasi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Box Simulation Canvas */}
        <div className="lg:col-span-8 bg-[#0d121f] border border-slate-800 rounded-xl p-6 flex flex-col justify-between min-h-[460px]">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Eksperimen Interaktif Kotak Cilukba:</span>
            <span className={`px-2.5 py-1 rounded-full font-semibold ${
              ballState === 'revealed'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {ballState === 'top' && 'Bola Siap di Atas'}
              {ballState === 'falling' && 'Bola Sedang Meluncur'}
              {ballState === 'hidden_inside' && 'Bola Tersembunyi di Dalam'}
              {ballState === 'revealed' && 'Bola Ditemukan! (Eksis)'}
            </span>
          </div>

          {/* Interactive Rig Area */}
          <div className="relative w-full max-w-md mx-auto my-6 flex flex-col items-center select-none">
            {/* Upper Funnel / Drop Zone */}
            <div className="relative w-28 h-16 border-t-4 border-x-4 border-slate-700 rounded-t-xl bg-slate-900/60 flex items-center justify-center">
              <span className="text-[10px] text-slate-500 font-mono">Corong Luncur</span>

              {/* The Ball at TOP */}
              {ballState === 'top' && (
                <button
                  onClick={handleDropBall}
                  className="absolute -top-3 w-14 h-14 rounded-full shadow-lg border-2 border-white/80 cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center animate-bounce"
                  style={{ backgroundColor: ballColor }}
                  title="Sentuh untuk menjatuhkan bola!"
                >
                  <Smile className="w-8 h-8 text-white drop-shadow" />
                </button>
              )}

              {/* Falling Animation */}
              {ballState === 'falling' && (
                <div
                  className="absolute w-12 h-12 rounded-full shadow-md transition-all duration-700 ease-in flex items-center justify-center translate-y-16"
                  style={{ backgroundColor: ballColor }}
                >
                  <Smile className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Middle Mystery Box with Sliding Shutter Door */}
            <div className="w-56 h-48 bg-gradient-to-b from-slate-900 to-slate-950 border-4 border-slate-700 rounded-2xl relative shadow-2xl overflow-hidden flex flex-col items-center justify-center">
              {/* Internal Chamber */}
              <div className="absolute inset-2 bg-[#080c16] rounded-xl border border-slate-800 flex items-center justify-center">
                {/* When ball is inside & shutter is open */}
                {(ballState === 'revealed' || (ballState === 'hidden_inside' && isShutterOpen)) && (
                  <div
                    className="w-14 h-14 rounded-full border-2 border-white shadow-xl flex items-center justify-center animate-pulse"
                    style={{ backgroundColor: ballColor }}
                  >
                    <Smile className="w-8 h-8 text-white" />
                  </div>
                )}

                {/* Sub-label inside */}
                <span className="absolute bottom-2 text-[9px] text-slate-600 font-mono">
                  Ruang Interior Kotak Fisik
                </span>
              </div>

              {/* Sliding Door / Shutter */}
              <div
                className={`absolute inset-x-2 bottom-2 bg-gradient-to-t from-amber-900/90 to-amber-700/90 border-2 border-amber-500/80 rounded-xl transition-all duration-500 ease-in-out flex flex-col items-center justify-center cursor-pointer shadow-lg ${
                  isShutterOpen ? 'h-5 opacity-40 translate-y-8' : 'h-[90%] opacity-100'
                }`}
                onClick={handleToggleShutter}
              >
                {!isShutterOpen ? (
                  <div className="flex flex-col items-center gap-1 text-amber-100">
                    <EyeOff className="w-6 h-6" />
                    <span className="text-xs font-bold tracking-wider">PINTU TERTUTUP</span>
                    <span className="text-[10px] text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                      Ketuk Untuk Buka!
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-amber-300">
                    <Eye className="w-3.5 h-3.5" /> <span>Pintu Terbuka</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Support Mat */}
            <div className="w-64 h-3 bg-slate-800 rounded-full mt-1 border-t border-slate-700" />
          </div>

          {/* Feedback Prompt Banner */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <p className="text-sm font-medium text-amber-200">
              {feedbackMessage}
            </p>
          </div>
        </div>

        {/* Controls & Developmental Insights */}
        <div className="lg:col-span-4 bg-[#0f1424] border border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Aksi Eksplorasi Balita</span>
            </span>
          </h4>

          {/* Color Selector */}
          <div>
            <label className="text-xs text-slate-300 mb-1.5 block font-medium">
              Pilih Warna Bola Favorit:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setBallColor(c.hex)}
                  className={`h-9 rounded-lg flex items-center justify-center transition border ${
                    ballColor === c.hex ? 'border-white ring-2 ring-amber-400 scale-105' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleDropBall}
              disabled={ballState !== 'top'}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-40"
            >
              <ArrowDown className="w-4 h-4" />
              <span>Jatuhkan Bola ke Dalam Corong</span>
            </button>

            <button
              onClick={handleToggleShutter}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition"
            >
              {isShutterOpen ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
              <span>{isShutterOpen ? 'Tutup Pintu Kotak' : 'Buka Pintu Kotak (Cilukba!)'}</span>
            </button>
          </div>

          {/* Piaget Stage Insight Card */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <Baby className="w-4 h-4" />
              <span>Pilar Kognitif Piaget:</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Bayi usia di bawah 8 bulan berpikir benda yang tidak terlihat telah lenyap selamanya. Pengalaman sensori berulang melatih otak bahwa <strong>materi dan kausalitas bersifat stabil & permanen</strong>.
            </p>
          </div>

          {/* Mastery Evidence Trigger */}
          <button
            onClick={handleVerifyMastery}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow transition"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Simpan Bukti Permanensi Objek</span>
          </button>

          {hasClaimedEvidence && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bukti Sensori-Motorik Disimpan ke Evidence Log!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
