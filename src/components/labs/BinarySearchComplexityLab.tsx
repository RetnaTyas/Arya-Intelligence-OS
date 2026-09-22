import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  HelpCircle,
  Play,
  FastForward,
} from 'lucide-react';

interface BinarySearchComplexityLabProps {
  onMasteryEvidence?: (concept: string, details: string) => void;
}

export const BinarySearchComplexityLab: React.FC<BinarySearchComplexityLabProps> = ({ onMasteryEvidence }) => {
  const [targetNumber, setTargetNumber] = useState<number>(73);
  const [arraySize] = useState<number>(100);

  // Linear search state
  const [linearStep, setLinearStep] = useState<number>(0);
  const [linearFound, setLinearFound] = useState<boolean>(false);

  // Binary search state
  const [binaryLow, setBinaryLow] = useState<number>(1);
  const [binaryHigh, setBinaryHigh] = useState<number>(100);
  const [binaryMid, setBinaryMid] = useState<number>(50);
  const [binaryStepCount, setBinaryStepCount] = useState<number>(0);
  const [binaryHistory, setBinaryHistory] = useState<{ step: number; low: number; mid: number; high: number; result: string }[]>([]);
  const [binaryFound, setBinaryFound] = useState<boolean>(false);

  const resetSearches = (newTarget?: number) => {
    const t = newTarget !== undefined ? newTarget : targetNumber;
    setTargetNumber(t);
    setLinearStep(0);
    setLinearFound(false);
    setBinaryLow(1);
    setBinaryHigh(100);
    setBinaryMid(50);
    setBinaryStepCount(0);
    setBinaryHistory([]);
    setBinaryFound(false);
  };

  const handleStepBinarySearch = () => {
    if (binaryFound || binaryLow > binaryHigh) return;

    const mid = Math.floor((binaryLow + binaryHigh) / 2);
    setBinaryMid(mid);
    const newStepCount = binaryStepCount + 1;
    setBinaryStepCount(newStepCount);

    let result = '';
    let nextLow = binaryLow;
    let nextHigh = binaryHigh;

    if (mid === targetNumber) {
      result = 'Cocok! Target Ditemukan';
      setBinaryFound(true);
      if (onMasteryEvidence) {
        onMasteryEvidence(
          'Pencarian Biner & Kompleksitas Algoritma',
          `Anak membuktikan keunggulan O(log N): Target ${targetNumber} ditemukan hanya dalam ${newStepCount} langkah biner berbanding ${targetNumber} langkah linier.`
        );
      }
    } else if (mid < targetNumber) {
      result = `${mid} < Target (Pangkas 50% Sisi Kiri: 1 s/d ${mid})`;
      nextLow = mid + 1;
      setBinaryLow(nextLow);
    } else {
      result = `${mid} > Target (Pangkas 50% Sisi Kanan: ${mid} s/d 100)`;
      nextHigh = mid - 1;
      setBinaryHigh(nextHigh);
    }

    setBinaryHistory((prev) => [
      ...prev,
      { step: newStepCount, low: binaryLow, mid, high: binaryHigh, result },
    ]);
  };

  const handleAutoRunAll = () => {
    // Linear is guaranteed to take targetNumber steps
    setLinearStep(targetNumber);
    setLinearFound(true);

    // Run full binary search
    let l = 1;
    let r = 100;
    let steps = 0;
    const hist: { step: number; low: number; mid: number; high: number; result: string }[] = [];

    while (l <= r) {
      steps++;
      const m = Math.floor((l + r) / 2);
      if (m === targetNumber) {
        hist.push({ step: steps, low: l, mid: m, high: r, result: 'Cocok! Target Ditemukan' });
        setBinaryMid(m);
        setBinaryFound(true);
        break;
      } else if (m < targetNumber) {
        hist.push({ step: steps, low: l, mid: m, high: r, result: `${m} < Target (Pangkas Kiri)` });
        l = m + 1;
      } else {
        hist.push({ step: steps, low: l, mid: m, high: r, result: `${m} > Target (Pangkas Kanan)` });
        r = m - 1;
      }
    }

    setBinaryLow(l);
    setBinaryHigh(r);
    setBinaryStepCount(steps);
    setBinaryHistory(hist);

    if (onMasteryEvidence) {
      onMasteryEvidence(
        'Pencarian Biner & Kompleksitas Algoritma',
        `Anak mengeksekusi komparasi kompleksitas O(log N) vs O(N): Binary search selesai dalam ${steps} langkah, sedangkan Linear search membutuhkan ${targetNumber} langkah.`
      );
    }
  };

  return (
    <div id="binary-search-lab" className="bg-[#0b0f1d] rounded-2xl border border-slate-800 p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Umur 10 - 12 Tahun (Transisi Formal)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
              Domain: Komputasi
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>Pencarian Biner & Kompleksitas Algoritma (O(log N) vs O(N))</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Membelah ruang pencarian secara deterministik: Mengapa komputer cerdas tidak mencari data satu per satu seperti manusia biasa!
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => resetSearches(Math.floor(Math.random() * 99) + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Acak Target Baru</span>
          </button>
        </div>
      </div>

      {/* Target Setting Controller */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Misi Mars Rover: Menemukan Sektor Frekuensi Rahasia (1 s/d 100)</span>
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Pilih angka target yang ingin dicari, lalu bandingkan kecepatan Algoritma Linier vs Algoritma Biner.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300">Target Angka:</span>
          <input
            type="range"
            min={1}
            max={100}
            value={targetNumber}
            onChange={(e) => resetSearches(Number(e.target.value))}
            className="w-32 accent-emerald-500 cursor-pointer"
          />
          <span className="text-sm font-mono font-bold text-emerald-300 bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-700/50">
            {targetNumber}
          </span>
        </div>
      </div>

      {/* Side-by-Side Algorithmic Race: Linear vs Binary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Linear Search (O(N)) */}
        <div className="p-4 rounded-xl bg-[#090d1a] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-xs font-bold text-rose-300">1. Pencarian Linier / Sekuensial</h4>
              <span className="text-[10px] font-mono text-slate-500">Kompleksitas: O(N)</span>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
              Langkah: {linearStep} / 100
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Memeriksa satu per satu dari awal (1, 2, 3...). Dalam kasus terburuk (angka 100), algoritma harus memeriksa 100 kali!
          </p>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Status Pencarian:</span>
              <span className={linearFound ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {linearFound ? `✓ Ditemukan di langkah ke-${linearStep}` : `Sedang memeriksa sektor #${linearStep + 1}`}
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-rose-500 h-full transition-all duration-200"
                style={{ width: `${linearStep}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (linearStep < targetNumber) {
                const next = linearStep + 1;
                setLinearStep(next);
                if (next === targetNumber) setLinearFound(true);
              }
            }}
            disabled={linearFound}
            className="w-full py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 disabled:opacity-40 text-rose-300 border border-rose-800/40 text-xs font-medium transition"
          >
            Langkah Linier +1 (Cek {linearStep + 1})
          </button>
        </div>

        {/* Right: Binary Search (O(log N)) */}
        <div className="p-4 rounded-xl bg-[#090d1a] border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-xs font-bold text-emerald-300">2. Pencarian Biner (Divide & Conquer)</h4>
              <span className="text-[10px] font-mono text-emerald-500">Kompleksitas: O(log₂ N)</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Langkah: {binaryStepCount} / Maksimal 7!
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Selalu melompat ke titik tengah (midpoint). Sekali uji langsung membuang 50% data yang tidak relevan!
          </p>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Rentang Aktif Saat Ini:</span>
              <span className="font-mono text-cyan-300 font-bold">
                [{binaryLow} s/d {binaryHigh}] ➔ Titik Tengah: {binaryMid}
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800 relative">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{
                  marginLeft: `${binaryLow - 1}%`,
                  width: `${Math.max(1, binaryHigh - binaryLow + 1)}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleStepBinarySearch}
              disabled={binaryFound}
              className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold shadow transition flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Belah Titik Tengah</span>
            </button>
            <button
              onClick={handleAutoRunAll}
              className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              <FastForward className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bandingkan Seketika</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step History Log of Binary Search */}
      <div className="bg-[#070b14] p-4 rounded-xl border border-slate-800 space-y-2.5">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          <span>Runtunan Eliminasi Ruang Data Biner (Log Langkah):</span>
        </h4>

        {binaryHistory.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            Klik tombol "Belah Titik Tengah" atau "Bandingkan Seketika" untuk melihat keajaiban eliminasi biner.
          </p>
        ) : (
          <div className="space-y-1.5 font-mono text-xs">
            {binaryHistory.map((item) => (
              <div
                key={item.step}
                className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold flex items-center justify-center border border-emerald-700">
                    {item.step}
                  </span>
                  <span>Uji Titik Tengah = <strong>{item.mid}</strong></span>
                </div>
                <span className="text-[11px] text-cyan-400 font-semibold">{item.result}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Epistemic Takeaway */}
      <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1 text-xs">
        <strong className="text-emerald-300 font-bold block">
          Fondasi Matematika Algoritmik: log₂(100) ≈ 6.64 ➔ Maksimal 7 Langkah!
        </strong>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          Bahkan jika array memiliki <strong>1.000.000 elemen (1 juta data)</strong>, pencarian linier butuh hingga 1.000.000 langkah, sedangkan pencarian biner hanya butuh <strong>maksimal 20 langkah</strong> (2²⁰ &gt; 1.000.000)!
        </p>
      </div>
    </div>
  );
};
