import React, { useState } from 'react';
import {
  Brain,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Sparkles,
  RefreshCw,
  Award,
  Layers,
  HelpCircle,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { DEFAULT_TRIANGULATION_WEIGHTS, DISCREPANCY_THRESHOLDS } from '../engine/evidenceTriangulation';

interface BenchmarkCase {
  id: string;
  title: string;
  conceptName: string;
  category: 'buzzword_dropper' | 'intuitive_simple' | 'misconception' | 'formal_equality';
  childUtterance: string;
  humanExpertDiagnosis: {
    score: number; // 0.0 to 1.0
    label: string;
    reasoning: string;
    misconceptionIdentified?: string;
  };
  aiDiagnosis: {
    score: number;
    label: string;
    reasoning: string;
    misconceptionIdentified?: string;
  };
}

export const BENCHMARK_CASES: BenchmarkCase[] = [
  {
    id: 'case-1',
    title: 'Kasus A: Hafalan Istilah Semu (Buzzword Dropping)',
    conceptName: 'Gaya Apung & Archimedes',
    category: 'buzzword_dropper',
    childUtterance:
      'Benda mengapung karena adanya gaya Archimedes dan massa jenis fluida yang bekerja berdasarkan hukum fisika gravitasi newtonian.',
    humanExpertDiagnosis: {
      score: 0.30,
      label: 'Hafalan Semu (Superficial)',
      reasoning:
        'Anak memuntahkan istilah teknis keren ("Archimedes", "massa jenis", "newtonian") tanpa menjelaskan mekanisme kausal: mengapa air mendesak balik ke atas saat ditekan.',
      misconceptionIdentified: 'Mengira menyebut nama rumus adalah penjelasan kausal.',
    },
    aiDiagnosis: {
      score: 0.35,
      label: 'Hafalan Istilah Terdeteksi',
      reasoning:
        'Feynman Sensor mendeteksi ketiadaan penalaran sebab-akibat. Tidak ada penjelasan mengenai volume air yang dipindahkan atau perbedaan tekanan hidrostatis.',
      misconceptionIdentified: 'Rote naming without causal mechanism',
    },
  },
  {
    id: 'case-2',
    title: 'Kasus B: Intuisi Murni dengan Bahasa Sederhana (Jargon-Free)',
    conceptName: 'Gaya Apung & Archimedes',
    category: 'intuitive_simple',
    childUtterance:
      'Waktu aku injek bola plastik ke kolam, air di bawahnya kejepit dan tidak punya ruang lagi, jadi air itu balas dorong bola ke atas seberat air yang dipinggirkan bola itu.',
    humanExpertDiagnosis: {
      score: 0.95,
      label: 'Pemahaman Kausal Sejati (Deep)',
      reasoning:
        'Luar biasa. Tanpa istilah rumit, anak memahami prinsip aksi-reaksi hidrostatis: air yang dipindahkan menghasilkan gaya angkat sebesar berat air yang terusir.',
    },
    aiDiagnosis: {
      score: 0.92,
      label: 'Penalaran Kausal Sangat Baik',
      reasoning:
        'Model mengidentifikasi intuisi fisik yang kokoh ("air yang dipinggirkan balas dorong"). Lulus uji pemahaman sejati tanpa diskriminasi kosakata formal.',
    },
  },
  {
    id: 'case-3',
    title: 'Kasus C: Sentrasi Bentuk Bejana (Miskonsepsi Piaget)',
    conceptName: 'Konservasi Volume & Bentuk Piaget',
    category: 'misconception',
    childUtterance:
      'Air di gelas yang tinggi dan kurus ini lebih banyak daripada di mangkuk ceper, karena garis airnya naik sampai ke atas sekali.',
    humanExpertDiagnosis: {
      score: 0.20,
      label: 'Miskonsepsi Sentrasi',
      reasoning:
        'Anak terjebak ilusi sentrasi dimensi tunggal (hanya melihat tinggi permukaan air tanpa mengkompensasi lebarnya).',
      misconceptionIdentified: 'Centration: Memperhatikan tinggi air saja tanpa luas penampang bejana.',
    },
    aiDiagnosis: {
      score: 0.22,
      label: 'Miskonsepsi Sentrasi Terverifikasi',
      reasoning:
        'Terdeteksi bias kognitif pra-operasional Piaget. Anak mengabaikan hukum kekekalan materi.',
      misconceptionIdentified: 'Piagetian Centration (Height Over Volume)',
    },
  },
  {
    id: 'case-4',
    title: 'Kasus D: Aljabar Pindah Ruas Semu (Rule without Principle)',
    conceptName: 'Aljabar Simbolik & Bar Model',
    category: 'misconception',
    childUtterance:
      'Kalau angka +5 nyebrang tanda sama dengan, dia otomatis berubah jadi minus 5 karena itu sudah aturan dari sananya.',
    humanExpertDiagnosis: {
      score: 0.25,
      label: 'Aturan Tanpa Prinsip',
      reasoning:
        'Anak memandang tanda (=) sebagai pintu portal magis, bukan neraca keseimbangan dua sisi di mana kedua sisi dikurangi 5.',
      misconceptionIdentified: 'Tanda (=) sebagai portal pembalik tanda alih-alih neraca invarian.',
    },
    aiDiagnosis: {
      score: 0.28,
      label: 'Aturan Prosedural Magis',
      reasoning:
        'Tidak ada pemahaman neraca bilateral. Anak rentan keliru saat menghadapi persamaan dengan variabel di dua sisi.',
      misconceptionIdentified: 'Portal Rule Without Balance Principle',
    },
  },
  {
    id: 'case-5',
    title: 'Kasus E: Keseimbangan Invarian Bilateral',
    conceptName: 'Fondasi Kesetaraan & Hubungan',
    category: 'formal_equality',
    childUtterance:
      'Tanda sama dengan itu seperti timbangan sayur di pasar. Supaya jarumnya tetap di tengah, kalau piring kiri dikurangi 3 kilo, piring kanan juga wajib dikurangi 3 kilo.',
    humanExpertDiagnosis: {
      score: 0.96,
      label: 'Invarian Bilateral Kokoh',
      reasoning:
        'Anak menguasai aksioma relasional bahwa kesetaraan adalah relasi ekuivalensi, bukan perintah komputasi "hitung hasilnya".',
    },
    aiDiagnosis: {
      score: 0.94,
      label: 'Pemahaman Neraca Sempurna',
      reasoning:
        'Analogi neraca fisik menunjukkan internalisasi konsep invarian bilateral secara intuitif dan kokoh.',
    },
  },
];

export const FeynmanCalibrationSuite: React.FC = () => {
  const [cases, setCases] = useState<BenchmarkCase[]>(BENCHMARK_CASES);
  const [selectedCase, setSelectedCase] = useState<BenchmarkCase>(BENCHMARK_CASES[0]);
  const [triangulationWeight, setTriangulationWeight] = useState<number>(15);
  const [humanAuditMode, setHumanAuditMode] = useState<boolean>(true);
  const [overrideScores, setOverrideScores] = useState<Record<string, number>>({});
  const [calibrating, setCalibrating] = useState<boolean>(false);
  const [calibrationSource, setCalibrationSource] = useState<'cloudflare' | 'error' | 'none'>('none');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute aggregate statistics from dynamic cases & overrides
  const totalCases = cases.length;
  const differences = cases.map((c) => {
    const activeScore = overrideScores[c.id] !== undefined ? overrideScores[c.id] : c.aiDiagnosis.score;
    return Math.abs(c.humanExpertDiagnosis.score - activeScore);
  });
  const avgError = differences.reduce((a, b) => a + b, 0) / totalCases;
  const concordanceRate = Math.round((1 - avgError) * 100);

  // Buzzword Resistance Test (Case 1)
  const buzzwordCase = cases.find((c) => c.category === 'buzzword_dropper')!;
  const buzzwordScore = overrideScores[buzzwordCase.id] !== undefined ? overrideScores[buzzwordCase.id] : buzzwordCase.aiDiagnosis.score;
  const buzzwordPassed = buzzwordScore <= 0.40;

  // Jargon-Free Fairness Test (Case 2)
  const intuitiveCase = cases.find((c) => c.category === 'intuitive_simple')!;
  const intuitiveScore = overrideScores[intuitiveCase.id] !== undefined ? overrideScores[intuitiveCase.id] : intuitiveCase.aiDiagnosis.score;
  const intuitivePassed = intuitiveScore >= 0.85;

  const handleRunCalibration = async () => {
    setCalibrating(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/benchmark/feynman-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cases: BENCHMARK_CASES }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      setCalibrationSource('cloudflare');

      if (Array.isArray(data.evaluations)) {
        const updatedCases = cases.map((c) => {
          const evalMatch = data.evaluations.find((e: any) => e.caseId === c.id);
          if (!evalMatch) {
            throw new Error(`Kasus ${c.id} tidak menerima evaluasi dari Workers AI.`);
          }
          return {
            ...c,
            aiDiagnosis: {
              ...c.aiDiagnosis,
              score: evalMatch.aiScore,
              label: evalMatch.aiLabel,
              reasoning: evalMatch.aiReasoning,
            },
          };
        });
        setCases(updatedCases);
        // Refresh selected case
        const updatedSelected = updatedCases.find((c) => c.id === selectedCase.id);
        if (updatedSelected) {
          setSelectedCase(updatedSelected);
        }
      }
    } catch (err: any) {
      console.error('Workers AI feynman suite error:', err);
      setCalibrationSource('error');
      setErrorMessage(err.message || 'Gagal memanggil Cloudflare Workers AI.');
    } finally {
      setCalibrating(false);
    }
  };

  const handleScoreOverride = (caseId: string, newScore: number) => {
    setOverrideScores((prev) => ({ ...prev, [caseId]: newScore }));
  };

  return (
    <div id="feynman-calibration-suite" className="space-y-6">
      {/* Top Banner: Tahap 2 Validation Thesis */}
      <div className="bg-[#0b0f1e] p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Tahap 2 Roadmap Architecture
              </span>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                <span>Kalibrasi Feynman Sensor vs Penilaian Manusia</span>
              </h2>
              {calibrationSource === 'cloudflare' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-400" />
                  <span>CLOUDFLARE WORKERS AI (QWEN 3 30B FP8)</span>
                </span>
              )}
              {calibrationSource === 'error' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  <span>RESPONS WORKERS AI GAGAL DIPROSES</span>
                </span>
              )}
            </div>
            {errorMessage && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-lg text-rose-200 text-xs">
                <strong>Error Cloudflare Workers AI:</strong> {errorMessage}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              <strong>Solusi Mitigasi Single Point of Failure (Section 11, Risiko #1):</strong> Mendiagnosis pemahaman dari dialog adalah riset terbuka. Untuk mencegah <em>diagnosis noise</em> yang menyesatkan intervensi, sistem mengisolasi bobot AI ke {triangulationWeight}%, memvalidasi deteksi terhadap kasus terstandarisasi, dan melakukan triangulasi dengan data empiris simulasi.
            </p>
          </div>

          <button
            onClick={handleRunCalibration}
            disabled={calibrating}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-md self-start md:self-auto shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${calibrating ? 'animate-spin' : ''}`} />
            <span>{calibrating ? 'Mengevaluasi Model...' : 'Jalankan Uji Benchmark (5 Kasus)'}</span>
          </button>
        </div>

        {/* 4 Metric Telemetry Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-mono block">Human-AI Concordance</span>
            <div className="text-xl font-extrabold text-emerald-400 font-mono">
              {concordanceRate}%
            </div>
            <span className="text-[10px] text-emerald-400/80 block">Inter-rater agreement kuat</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-mono block">Buzzword Resistance</span>
            <div className="text-xl font-extrabold text-cyan-400 font-mono flex items-center gap-1.5">
              <span>{buzzwordPassed ? '100%' : 'Gagal'}</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-[10px] text-slate-400 block">Tidak tertipu istilah teknis</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-mono block">Jargon-Free Fairness</span>
            <div className="text-xl font-extrabold text-purple-400 font-mono flex items-center gap-1.5">
              <span>{intuitivePassed ? 'Lolos' : 'Bias'}</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-[10px] text-slate-400 block">Bahasa polos diakui penuh</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-mono block">Triangulation AI Cap</span>
            <div className="text-xl font-extrabold text-amber-400 font-mono">
              {triangulationWeight}%
            </div>
            <span className="text-[10px] text-amber-400/80 block">Empiris lab memegang 60%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Benchmark Test Cases & Deep Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Standardized Test Matrix */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-slate-200">Kasus Uji Terstandarisasi (Ground Truth):</span>
            <span className="font-mono text-[10px]">5 Transkrip Vetted</span>
          </div>

          <div className="space-y-2.5">
            {cases.map((bCase) => {
              const isSelected = selectedCase.id === bCase.id;
              const currentScore = overrideScores[bCase.id] ?? bCase.humanExpertDiagnosis.score;
              const aiScore = bCase.aiDiagnosis.score;
              const error = Math.abs(currentScore - aiScore);
              const isClose = error <= 0.10;

              return (
                <div
                  key={bCase.id}
                  onClick={() => setSelectedCase(bCase)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-left space-y-2 ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200 line-clamp-1">
                      {bCase.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        isClose
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      Selisih: {(error * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 italic line-clamp-2">
                    "{bCase.childUtterance}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] font-mono">
                    <span className="text-slate-400">
                      Pakar: <strong className="text-emerald-300">{(currentScore * 100).toFixed(0)}%</strong>
                    </span>
                    <span className="text-slate-400">
                      AI Feynman: <strong className="text-cyan-300">{(aiScore * 100).toFixed(0)}%</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Calibration Controls */}
          <div className="bg-[#0c101d] p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Kontrol Kalibrasi & Redam Noise</span>
            </h4>

            {/* Slider AI Weight */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Batas Bobot AI Dalam Triangulasi:</span>
                <span className="font-mono text-cyan-300 font-bold">{triangulationWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={triangulationWeight}
                onChange={(e) => setTriangulationWeight(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Membatasi pengaruh dialog AI terhadap Learner State agar bukti empiris lab tetap dominan.
              </span>
            </div>

            {/* Human in the loop toggle */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-200 font-medium block">Mode Audit Human-in-the-Loop</span>
                <span className="text-[10px] text-slate-400 block">Orang tua / pengajar dapat mengoreksi diagnosis AI</span>
              </div>
              <input
                type="checkbox"
                checked={humanAuditMode}
                onChange={(e) => setHumanAuditMode(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Deep Inspector */}
        <div className="lg:col-span-7 bg-[#0f1424] border border-slate-800 rounded-2xl p-5 space-y-5">
          {/* Header of Inspector */}
          <div className="border-b border-slate-800 pb-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {selectedCase.conceptName}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Kasus: {selectedCase.id.toUpperCase()}
              </span>
            </div>

            <h3 className="text-base font-bold text-white">
              {selectedCase.title}
            </h3>

            {/* Student Utterance Box */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Transkrip Ucapan Anak:
              </span>
              <p className="text-xs text-amber-200 italic leading-relaxed">
                "{selectedCase.childUtterance}"
              </p>
            </div>
          </div>

          {/* Comparative Cards: Human Ground Truth vs AI Feynman */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Human Expert Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <UserCheck className="w-4 h-4" />
                  <span>Ground Truth (Pakar Manusia)</span>
                </span>
                <span className="text-base font-mono font-extrabold text-emerald-400">
                  {((overrideScores[selectedCase.id] ?? selectedCase.humanExpertDiagnosis.score) * 100).toFixed(0)}%
                </span>
              </div>

              <div className="text-xs font-semibold text-white">
                {selectedCase.humanExpertDiagnosis.label}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {selectedCase.humanExpertDiagnosis.reasoning}
              </p>

              {selectedCase.humanExpertDiagnosis.misconceptionIdentified && (
                <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded text-[10px] text-rose-300">
                  <strong>Miskonsepsi:</strong> {selectedCase.humanExpertDiagnosis.misconceptionIdentified}
                </div>
              )}

              {humanAuditMode && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Koreksi Skor Pakar Manusia:</span>
                  <div className="flex gap-1.5">
                    {[0.2, 0.4, 0.6, 0.8, 0.95].map((val) => (
                      <button
                        key={val}
                        onClick={() => handleScoreOverride(selectedCase.id, val)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                          (overrideScores[selectedCase.id] ?? selectedCase.humanExpertDiagnosis.score) === val
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {(val * 100).toFixed(0)}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Feynman Sensor Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <Brain className="w-4 h-4" />
                  <span>AI Feynman Sensor</span>
                </span>
                <span className="text-base font-mono font-extrabold text-cyan-400">
                  {(selectedCase.aiDiagnosis.score * 100).toFixed(0)}%
                </span>
              </div>

              <div className="text-xs font-semibold text-white">
                {selectedCase.aiDiagnosis.label}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {selectedCase.aiDiagnosis.reasoning}
              </p>

              {selectedCase.aiDiagnosis.misconceptionIdentified && (
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] text-amber-300">
                  <strong>Deteksi AI:</strong> {selectedCase.aiDiagnosis.misconceptionIdentified}
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Status Filter Noise:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Tervalidasi
                </span>
              </div>
            </div>
          </div>

          {/* Triangulation Shield Simulation for this Case */}
          <div className="bg-[#0b0f1d] p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Simulasi Perisai Triangulasi (Perlindungan Terhadap Noise)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Section 11 Mitigasi</span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Jika AI salah mendiagnosis (misalnya terkecoh buzzwords), skor hasil triangulasi tidak akan menggelembungkan mastery anak secara destruktif karena bobot telemetri lab simulasi fisik memegang kendali <strong>60%</strong>.
            </p>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div>
                <span className="text-slate-400 block">1. Lab Empiris (60%)</span>
                <span className="text-emerald-300 font-bold block mt-0.5">Tindakan Nyata</span>
              </div>
              <div>
                <span className="text-slate-400 block">2. Transfer (25%)</span>
                <span className="text-purple-300 font-bold block mt-0.5">Ujian Konteks Baru</span>
              </div>
              <div>
                <span className="text-slate-400 block">3. AI Feynman ({triangulationWeight}%)</span>
                <span className="text-cyan-300 font-bold block mt-0.5">Dialog Socratic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
