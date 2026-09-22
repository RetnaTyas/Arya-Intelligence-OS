import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Scale,
  FlaskConical,
  HelpCircle,
  ArrowRight,
  Droplets,
  AlertCircle,
} from 'lucide-react';

interface PiagetConservationLabProps {
  onMasteryEvidence: (details: string) => void;
}

export const PiagetConservationLab: React.FC<PiagetConservationLabProps> = ({ onMasteryEvidence }) => {
  // State: 'container_a' (in wide beaker) | 'pouring' | 'container_b' (in tall cylinder)
  const [waterLocation, setWaterLocation] = useState<'container_a' | 'pouring' | 'container_b'>('container_a');
  const [selectedHypothesis, setSelectedHypothesis] = useState<'more' | 'same' | 'less' | null>(null);
  const [isWeighing, setIsWeighing] = useState<boolean>(false);
  const [hasRecordedEvidence, setHasRecordedEvidence] = useState<boolean>(false);

  const waterVolume = 250; // mL
  const waterWeight = 250; // grams

  const handlePourToTall = () => {
    setWaterLocation('pouring');
    setTimeout(() => {
      setWaterLocation('container_b');
    }, 600);
  };

  const handlePourBack = () => {
    setWaterLocation('pouring');
    setTimeout(() => {
      setWaterLocation('container_a');
    }, 600);
  };

  const handleReset = () => {
    setWaterLocation('container_a');
    setSelectedHypothesis(null);
    setIsWeighing(false);
  };

  const handleVerifyMastery = () => {
    setHasRecordedEvidence(true);
    onMasteryEvidence(
      `Membuktikan Konservasi Volume & Massa Piaget (Tahap Pra-Operasional 4-6 Tahun): Anak membuktikan secara empiris bahwa memindahkan 250 mL air dari bejana lebar ke silinder tinggi tidak mengubah volume ataupun massanya (250g), mengatasi bias kognitif sentrasi tinggi visual.`
    );
  };

  return (
    <div id="piaget-conservation-lab-container" className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-teal-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
              <span>Umur 4 - 6 Tahun · Pra-Operasional</span>
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Lab Konservasi Volume & Bentuk Piaget (Simpul: node-piaget-conservation)
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Prinsip WHY: <em>"Eksperimen klasik Jean Piaget: Anak usia pra-sekolah cenderung tertipu melihat air di tabung ramping tampak lebih tinggi. Laboratorium ini membuktikan bahwa kuantitas materi tidak berubah saat bentuk wadahnya berubah."</em>
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-teal-300 flex items-center gap-1 self-start md:self-auto transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Ulangi Percobaan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Dual Beakers Canvas */}
        <div className="lg:col-span-8 bg-[#0d121f] border border-slate-800 rounded-xl p-6 flex flex-col justify-between min-h-[460px]">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Dua Wadah dengan Geometri Berbeda:</span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
                Volume Air Sebenarnya: <strong className="text-cyan-300">250 mL</strong>
              </span>
              {isWeighing && (
                <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                  Timbangan: {waterWeight} gram
                </span>
              )}
            </div>
          </div>

          {/* Interactive Dual Container Stage */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12 my-6 select-none">
            {/* Beaker A: Wide and Short */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-slate-300 mb-2">
                Gelas A (Lebar & Rendah)
              </span>

              {/* Glass A Vessel */}
              <div className="w-36 h-40 border-b-4 border-x-4 border-slate-500 rounded-b-2xl bg-slate-950/60 relative overflow-hidden flex flex-col justify-end p-1">
                {/* Milliliter graduation lines */}
                <div className="absolute right-1 top-4 text-[8px] text-slate-600 font-mono">300ml -</div>
                <div className="absolute right-1 top-14 text-[8px] text-slate-500 font-mono">200ml -</div>
                <div className="absolute right-1 top-24 text-[8px] text-slate-600 font-mono">100ml -</div>

                {/* Water inside Beaker A */}
                {waterLocation === 'container_a' && (
                  <div className="w-full h-24 bg-gradient-to-t from-cyan-600 to-cyan-400/80 rounded-b-xl border-t-2 border-cyan-300 transition-all duration-500 relative">
                    <span className="absolute top-1 left-2 text-[10px] font-mono text-cyan-950 font-bold">
                      Level: 250 mL
                    </span>
                  </div>
                )}
              </div>

              {/* Base pedestal */}
              <div className="w-40 h-2 bg-slate-800 rounded-full mt-1" />
            </div>

            {/* Pouring Direction Arrow */}
            <div className="flex flex-col items-center justify-center">
              {waterLocation === 'container_a' ? (
                <button
                  onClick={handlePourToTall}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-950 transition animate-pulse"
                >
                  <span>Tuang ke Gelas B</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePourBack}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-teal-950 transition"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Tuang Kembali ke A</span>
                </button>
              )}

              {waterLocation === 'pouring' && (
                <span className="text-[11px] text-cyan-300 font-mono mt-2 animate-bounce flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" /> Mentransfer air...
                </span>
              )}
            </div>

            {/* Cylinder B: Tall and Narrow */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-slate-300 mb-2">
                Gelas B (Ramping & Tinggi)
              </span>

              {/* Glass B Vessel */}
              <div className="w-20 h-56 border-b-4 border-x-4 border-slate-500 rounded-b-xl bg-slate-950/60 relative overflow-hidden flex flex-col justify-end p-1">
                {/* Milliliter graduation lines */}
                <div className="absolute right-1 top-6 text-[8px] text-slate-500 font-mono">300 -</div>
                <div className="absolute right-1 top-16 text-[8px] text-cyan-400 font-mono font-bold">250 -</div>
                <div className="absolute right-1 top-28 text-[8px] text-slate-500 font-mono">200 -</div>
                <div className="absolute right-1 top-40 text-[8px] text-slate-600 font-mono">100 -</div>

                {/* Water inside Cylinder B */}
                {waterLocation === 'container_b' && (
                  <div className="w-full h-44 bg-gradient-to-t from-cyan-600 to-cyan-400/80 rounded-b-lg border-t-2 border-cyan-300 transition-all duration-500 relative">
                    <span className="absolute top-1 left-1.5 text-[9px] font-mono text-cyan-950 font-bold">
                      Tampak Tinggi!
                    </span>
                  </div>
                )}
              </div>

              {/* Base pedestal */}
              <div className="w-24 h-2 bg-slate-800 rounded-full mt-1" />
            </div>
          </div>

          {/* Socratic Question for Child */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
              <HelpCircle className="w-4 h-4" />
              <span>Teka-Teki Kognitif Piaget:</span>
            </div>
            <p className="text-slate-200 text-xs">
              Saat air berada di <strong>Gelas B</strong>, permukaannya terlihat jauh lebih tinggi daripada di Gelas A. Apakah jumlah air di Gelas B sekarang:
            </p>

            {/* Hypothesis Selection Options */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setSelectedHypothesis('more')}
                className={`p-2.5 rounded-lg border text-center transition font-medium ${
                  selectedHypothesis === 'more'
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Lebih Banyak Air
              </button>
              <button
                onClick={() => setSelectedHypothesis('same')}
                className={`p-2.5 rounded-lg border text-center transition font-medium ${
                  selectedHypothesis === 'same'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Sama Persis (Tetap 250 mL)
              </button>
              <button
                onClick={() => setSelectedHypothesis('less')}
                className={`p-2.5 rounded-lg border text-center transition font-medium ${
                  selectedHypothesis === 'less'
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Lebih Sedikit Air
              </button>
            </div>
          </div>
        </div>

        {/* Verification & Weighing Scale Panel */}
        <div className="lg:col-span-4 bg-[#0f1424] border border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-400" />
              <span>Pengujian Ilmiah Konservasi</span>
            </span>
          </h4>

          {/* Weighing Scale Button */}
          <button
            onClick={() => setIsWeighing(!isWeighing)}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-teal-500/40 text-teal-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow transition"
          >
            <Scale className="w-4 h-4 text-teal-400" />
            <span>{isWeighing ? 'Sembunyikan Neraca Timbangan' : 'Timbang Massa Kedua Gelas'}</span>
          </button>

          {/* Explanation Callout */}
          {selectedHypothesis === 'same' ? (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-1.5 text-xs text-emerald-200">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Jawaban Benar! Prinsip Konservasi Terbukti.</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Meskipun Gelas B lebih tinggi, Gelas B juga lebih sempit! Ketinggian bertambah karena lebarnya berkurang (kompensasi dimensi). Massa dan volumenya tetap persis sama yaitu <strong>250 gram</strong>.
              </p>
            </div>
          ) : selectedHypothesis ? (
            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-1.5 text-xs text-amber-200">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Bias Sentrasi Visual Ketinggian!</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Mata kita sering tertipu hanya melihat ketinggian tanpa memperhitungkan bahwa gelasnya lebih ramping. Coba tekan tombol <strong>"Timbang Massa Kedua Gelas"</strong> untuk membuktikannya!
              </p>
            </div>
          ) : null}

          {/* Cognitive Milestone Explanation */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <span className="text-teal-400 font-bold block text-xs">
              Transisi Kognitif (Umur 4 - 6 Tahun):
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Memahami bahwa kuantitas bersifat <em>invarian terhadap transformasi bentuk</em> adalah lompatan besar dari berpikir intuitif egosentris ke pemikiran operasional konkret.
            </p>
          </div>

          {/* Save Evidence Button */}
          <button
            onClick={handleVerifyMastery}
            disabled={selectedHypothesis !== 'same'}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow transition disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Simpan Bukti Konservasi Piaget</span>
          </button>

          {hasRecordedEvidence && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bukti Konservasi Volume Disimpan ke Evidence Log!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
