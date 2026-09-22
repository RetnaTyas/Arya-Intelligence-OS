import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Layers,
  CheckCircle,
  ShieldAlert,
  Sparkles,
  Compass,
  Download,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  Flame,
  Cpu,
  Brain,
  Search,
} from 'lucide-react';

interface FoundationDocViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FoundationDocViewer: React.FC<FoundationDocViewerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('ringkasan');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const tabs = [
    { id: 'ringkasan', label: '1. Ringkasan & Tesis' },
    { id: 'masalah', label: '2. Masalah yang Dipecahkan' },
    { id: 'prinsip', label: '3. 12 Prinsip Desain' },
    { id: 'arsitektur', label: '4. Arsitektur Logis' },
    { id: 'graph', label: '5. Knowledge Graph' },
    { id: 'mastery', label: '6. Mastery & Feynman' },
    { id: 'selfhealing', label: '7. Self-Healing & Debt' },
    { id: 'loop', label: '8. Empat Loop Sistem' },
    { id: 'telemetri', label: '9. Telemetri Kognitif' },
    { id: 'bisnis', label: '10. Produk & Model Bisnis' },
    { id: 'risiko', label: '11. 11 Asumsi & Risiko' },
    { id: 'roadmap', label: '12. Peta Jalan (Tahap 0-6)' },
    { id: 'log', label: '13. Log Keputusan Desain' },
    { id: 'glosarium', label: '14. Glosarium Lengkap' },
    { id: 'raw', label: '📄 Dokumen Lengkap (Markdown)' },
  ];

  const handleDownloadMarkdown = () => {
    const markdownContent = `# Personal Intelligence OS
## Dokumen Fondasi: Konsep, Prinsip, dan Arsitektur
Status: Draf v0.1 (konsolidasi) · Sifat: Dokumen hidup · Cakupan: Konsep, arsitektur logis, model bisnis, risiko.

Lokasi Berkas di Proyek: /docs/architecture/DOKUMEN_FONDASI_ARSITEKTUR.md
`;
    const element = document.createElement('a');
    const file = new Blob([markdownContent], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'DOKUMEN_FONDASI_ARSITEKTUR.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('/docs/architecture/DOKUMEN_FONDASI_ARSITEKTUR.md');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTabs = searchQuery.trim()
    ? tabs.filter((t) => t.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : tabs;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-4xl bg-[#0c101c] border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg border border-indigo-500/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Dokumen Fondasi: Konsep, Prinsip, dan Arsitektur
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Draf v0.1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tersimpan di <code className="text-indigo-300 font-mono text-[11px]">/docs/architecture/DOKUMEN_FONDASI_ARSITEKTUR.md</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Salin path dokumen"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition text-xs flex items-center gap-1.5 border border-slate-800"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden md:inline">{copied ? 'Tersalin' : 'Salin Path'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Navigation Bar */}
        <div className="border-b border-slate-800 bg-slate-900/70 p-2.5 flex flex-col sm:flex-row gap-2 items-center justify-between">
          {/* Scrollable Tabs */}
          <div className="flex overflow-x-auto w-full gap-1.5 scrollbar-thin py-1">
            {filteredTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-xs leading-relaxed">
          {/* 1. Ringkasan */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <span>1. Ringkasan & Tesis</span>
                </h3>
                <span className="text-[10px] text-indigo-300 font-mono">Draf v0.1</span>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-white text-xs block">Tesis Utama:</strong>
                <p className="text-slate-300 leading-relaxed">
                  Pendidikan pasca-COVID hanya mendigitalkan birokrasi abad ke-19: manusia diproses per *batch* berdasarkan tahun lahir, kurikulum linear, dan hafalan. Perubahan medium (papan tulis ➔ layar) tidak mengubah logika dasarnya.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-white text-xs block">Gagasan Personal Intelligence OS:</strong>
                <p className="text-slate-300 leading-relaxed">
                  Proyek ini bukan LMS dan bukan "sekolah online". Ini adalah Personal Intelligence OS: sebuah sistem yang memelihara perkembangan intelektual seorang manusia sebagai lintasan yang unik. Pendidikan hanya menjadi interface pertamanya.
                </p>
              </div>

              <div className="bg-[#0f1424] p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs">Pembagian Fungsi Inti (Model Dua Lapis):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-indigo-400 font-bold block mb-1">Sekolah (Social Sandbox)</span>
                    <span className="text-slate-400">Belajar hidup bersama manusia: interaksi, kalibrasi sosial, negosiasi, kepemimpinan, lingkungan fisik.</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-cyan-500/30">
                    <span className="text-cyan-400 font-bold block mb-1">Intelligence OS</span>
                    <span className="text-slate-400">Membangun kapabilitas intelektual mandiri: lintasan individu, mastery berakar, akselerasi tanpa batas usia.</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-amber-400 font-bold block mb-1">Rumah</span>
                    <span className="text-slate-400">Budaya, nilai, kebiasaan hidup, observasi karakter.</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-purple-500/30">
                    <span className="text-purple-400 font-bold block mb-1">AI</span>
                    <span className="text-slate-400">Tutor Socratic, simulasi, umpan balik, diagnosis dan pendampingan (bukan kurikulum god).</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-emerald-500/30 sm:col-span-2">
                    <span className="text-emerald-400 font-bold block mb-1">Orang Tua</span>
                    <span className="text-slate-400">Arsitek, pengamat, pengambil keputusan arah perkembangan jangka panjang.</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 rounded-xl text-indigo-200">
                <strong>Prinsip Satu Kalimat:</strong> <em>"Mass education tidak harus berarti standardized education. Satu mesin yang sama, jutaan jalur berbeda."</em>
              </div>
            </div>
          )}

          {/* 2. Masalah yang Dipecahkan */}
          {activeTab === 'masalah' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>2. Enam Masalah Fundamental yang Dipecahkan</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    title: '1. Batch Processing Manusia',
                    desc: 'Umur biologis menentukan apa yang boleh dipelajari, terlepas dari kesiapan atau lompatan kapabilitas anak.',
                  },
                  {
                    title: '2. Kurikulum Linear',
                    desc: 'Kelas 1 ➔ Kelas 2 ➔ Kelas 3 secara kaku, walau anak bosan setengah mati atau sebaliknya tertinggal di fondasi.',
                  },
                  {
                    title: '3. Kelulusan Semu',
                    desc: 'Nilai 70% dianggap lulus, padahal 30% fondasi yang hilang menjadi bom waktu di materi tingkat lanjut.',
                  },
                  {
                    title: '4. Epistemic Debt',
                    desc: 'Celah fondasi (misalnya pecahan atau aljabar yang rapuh) menumpuk diam-diam lalu meruntuhkan pemahaman fisika atau kalkulus.',
                  },
                  {
                    title: '5. Remedial yang Memalukan',
                    desc: 'Kelas perbaikan khusus memicu rasa malu, stigma sosial, dan resistensi psikologis terhadap proses belajar.',
                  },
                  {
                    title: '6. Ukuran Statis',
                    desc: 'Rapor angka dan skor IQ hanyalah artefak historis, bukan gambaran lintasan intelektual hidup yang terus bertumbuh.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <strong className="text-amber-300 text-xs block">{item.title}</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. 12 Prinsip Desain */}
          {activeTab === 'prinsip' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>3. Dua Belas Prinsip Desain Mengikat</span>
                </h3>
                <span className="text-[10px] text-cyan-300 font-mono">Arsitektur & Produk</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { title: 'Ukur observable learning state, bukan IQ', desc: 'Sistem mengukur mastery, transfer, retensi, kedalaman penalaran, pola kesalahan, dan learning rate. IQ bukan variabel master di database.' },
                  { title: 'Graph adalah sumber kebenaran', desc: 'Knowledge Graph menentukan struktur kurikulum. AI bukan Supreme Curriculum God.' },
                  { title: 'Pisahkan peta ilmu dari peta anak', desc: 'Knowledge Graph (dunia ilmu) dan Learner Model (posisi anak terhadap dunia itu) adalah dua entitas berbeda. Jangan dicampur.' },
                  { title: 'Simpan bukti, bukan progress bar', desc: 'Yang disimpan adalah evidence: apa yang dilakukan anak, bagaimana ia menjelaskan, di mana transfernya berhasil atau gagal.' },
                  { title: 'Kesalahan adalah data emas', desc: 'Sistem harus tahu bagaimana anak salah, bukan hanya bahwa ia salah.' },
                  { title: 'Umur adalah metadata, kemampuan adalah ukuran', desc: 'Umur menunjukkan di mana manusia berada. Kapabilitas menunjukkan apa yang bisa ia lakukan.' },
                  { title: 'Forward motion + backward repair', desc: 'Anak terus maju, fondasi diperbaiki sambil berjalan. Tidak ada vonis turun kelas.' },
                  { title: 'Zero Critical Epistemic Debt, bukan Zero Debt', desc: 'Manusia memang lupa. Yang dijaga adalah decay pada prerequisite yang berbahaya bagi lintasan aktif.' },
                  { title: 'Why-first', desc: 'Aturan ➔ Prinsip ➔ Derivasi. Setiap konsep berakar pada pertanyaan fundamental "kenapa".' },
                  { title: 'No content without a cognitive purpose', desc: 'Materi yang tidak membangun konsep, memperbaiki miskonsepsi, melatih kemampuan, atau membuktikan transfer dibuang.' },
                  { title: 'Voluntary engagement, bukan behavioral exploitation', desc: 'Tanpa FOMO, loot box, streak anxiety, scarcity buatan, atau notifikasi spam.' },
                  { title: 'Tidak ada endpoint', desc: 'Dunia tidak ditutup karena kurikulum selesai. Penguasaan membuka kapabilitas baru.' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <strong className="text-white text-xs block font-semibold">
                      {idx + 1}. {item.title}
                    </strong>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Arsitektur Logis */}
          {activeTab === 'arsitektur' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>4. Arsitektur Logis & Aliran Data</span>
                </h3>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto whitespace-pre leading-snug">
{`                    PERSONAL INTELLIGENCE OS
                              │
             ┌────────────────┴────────────────┐
             │                                 │
      KNOWLEDGE GRAPH                    LEARNER MODEL
      (peta dunia ilmu)                  (peta anak terhadap ilmu)
             │                                 │
   ┌─────────┼─────────┐              ┌────────┼────────┐
 Concept   Skill   Dependency      Mastery  Errors  Learning Rate
             │                                 │
             └────────────────┬────────────────┘
                              │
                       ADAPTIVE ENGINE
                              │
             ┌────────────────┼────────────────┐
         Challenge          Tutor          Simulation
             └────────────────┼────────────────┘
                              │
                         EVIDENCE LOG
                              │
                   ┌──────────┴──────────┐
              Parent View           Child View`}
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs">Komponen Sistem:</h4>
                <div className="space-y-1.5">
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                    <strong className="text-cyan-300">Knowledge Graph:</strong> Peta konsep, skill, prerequisite, dan lapisan WHY (Source of truth struktur).
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                    <strong className="text-purple-300">Learner Model:</strong> Keadaan anak per node: mastery, retensi, transfer, miskonsepsi (Diperbarui dari evidence).
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                    <strong className="text-emerald-300">Evidence Log:</strong> Rekam jejak interaksi bermakna, aset seumur hidup anak yang diaudit orang tua.
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                    <strong className="text-amber-300">Adaptive Engine:</strong> Memilih pengalaman belajar berikutnya yang paling informatif dengan membaca graph + learner state.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-lg text-indigo-200 text-xs">
                <strong>Batasan Peran AI:</strong> <em>Tutor + Diagnostician + Generator + Simulator Interface</em>. AI membaca graph, melihat learner state, bertanya, membaca jawaban, menghasilkan evidence, dan memperbarui learner model. AI <strong>tidak</strong> menulis ulang graph secara otonom.
              </div>
            </div>
          )}

          {/* 5. Knowledge Graph */}
          {activeTab === 'graph' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>5. Knowledge Graph & Lapisan WHY</span>
                </h3>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-cyan-400 font-bold">Struktur Dynamic Skill Tree:</div>
                <div className="pl-2 border-l border-cyan-800">
                  Bar Model (visual logic)<br />
                  &nbsp;&nbsp;└➔ Aljabar Simbolik<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├➔ Fisika Mekanik (Fluida, Archimedes, Kapal Selam)<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├➔ Pemrograman / Algoritma<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└➔ Kalkulus
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-white text-xs block">Lapisan WHY (Kenapa Aljabar Ada?):</strong>
                <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                  <li>Bagaimana manusia merepresentasikan kuantitas yang belum diketahui?</li>
                  <li>Kenapa representasi simbolik?</li>
                  <li>Kenapa bentuk persamaan?</li>
                  <li>Kenapa transformasi mempertahankan kesetaraan (neraca dua sisi)?</li>
                  <li>Asumsi apa yang membuatnya valid?</li>
                </ul>
                <p className="text-[11px] text-indigo-300 italic pt-1">
                  Hasilnya: anak tidak belajar "pindahkan x ke sebelah kanan", melainkan "kita melakukan operasi yang sama pada kedua sisi karena ingin mempertahankan relasi kesetaraan".
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-white text-xs block">Skema Node (Draf JSON):</strong>
                <pre className="text-[11px] font-mono text-emerald-300 bg-slate-900 p-3 rounded overflow-x-auto">
{`{
  "concept": "equality",
  "prerequisites": ["quantity", "comparison"],
  "explanation_levels": ["concrete", "visual", "symbolic", "formal"],
  "mastery_evidence": ["solve", "explain", "predict", "transfer", "create"],
  "why_chain": ["..."]
}`}
                </pre>
              </div>
            </div>
          )}

          {/* 6. Mastery & Feynman Sensor */}
          {activeTab === 'mastery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>6. Hierarki Mastery & Feynman Sensor</span>
                </h3>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-white text-xs block">7 Tingkat Penguasaan (Mastery Hierarchy):</strong>
                <div className="text-xs font-mono text-indigo-300 p-2.5 bg-slate-900 rounded border border-slate-800">
                  Recognition ➔ Recall ➔ Understanding ➔ Application ➔ Transfer ➔ Explanation ➔ Creation
                </div>
                <p className="text-slate-400 text-[11px]">
                  Mastery bukan skor biner lulus/gagal. Sistem berkata: <em>"Konsep dikuasai untuk aplikasi rutin, kemampuan transfer belum terverifikasi."</em>
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-white text-xs block">Feynman Sensor:</strong>
                <p className="text-slate-300 text-[11px]">
                  Teknik Feynman dipakai sebagai sensor berkelanjutan. AI mengajukan pertanyaan Socratic pemantik (misal: "kenapa kapal baja terapung sedangkan paku tenggelam?"), lalu memetakan pemikiran anak:
                </p>
                <div className="font-mono text-[11px] bg-slate-900 p-3 rounded text-cyan-300">
                  Buoyancy<br />
                  ├── conceptual understanding:  0.91<br />
                  ├── causal reasoning:          0.83<br />
                  ├── transfer:                  0.54<br />
                  └── misconception:             detected ("berat menentukan tenggelam/mengapung")
                </div>
              </div>
            </div>
          )}

          {/* 7. Self-Healing & Debt */}
          {activeTab === 'selfhealing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>7. Self-Healing Learning & Epistemic Debt</span>
                </h3>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-white text-xs block">Epistemic Debt:</strong>
                <p className="text-slate-300 text-[11px]">
                  Akumulasi celah fondasi yang menjadi bottleneck di materi lanjutan.
                </p>
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg font-mono text-amber-200 text-xs">
                  Debt Risk = Decay × Dependency Centrality × Future Relevance × Uncertainty
                </div>
              </div>

              <div className="bg-teal-950/40 border border-teal-500/40 p-4 rounded-xl space-y-2">
                <strong className="text-teal-200 text-xs block">Stealth Insertion (Passive Contextual Remediation):</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Remedial tidak menjadi ruangan terpisah yang memalukan. Saat decay terdeteksi (contoh aljabar turun 15%), sistem menyisipkan perbaikan ke dalam proyek berminat tinggi (misalnya: menghitung volume air ballast kapal selam di kedalaman 100m). Fondasi pulih sebagai efek samping penemuan, tanpa rasa malu!
                </p>
              </div>
            </div>
          )}

          {/* 8. Empat Loop Sistem */}
          {activeTab === 'loop' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>8. Empat Loop Sistem</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-cyan-500/30 space-y-1">
                  <div className="text-cyan-300 font-bold">1. Curiosity Loop</div>
                  <div className="text-[11px] text-slate-400">Explore/Build ➔ Kapabilitas baru ➔ Rasa ingin tahu baru (Motivasi intrinsik, tanpa endpoint).</div>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-1">
                  <div className="text-emerald-300 font-bold">2. Mastery Loop</div>
                  <div className="text-[11px] text-slate-400">Evidence ➔ Assessment ➔ Mastery berlapis (Verifikasi penguasaan hingga transfer).</div>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-amber-500/30 space-y-1">
                  <div className="text-amber-300 font-bold">3. Repair Loop</div>
                  <div className="text-[11px] text-slate-400">Decay terdeteksi ➔ Reconsolidation kontekstual ➔ Pengetahuan pulih (Fondasi tidak retak).</div>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-purple-500/30 space-y-1">
                  <div className="text-purple-300 font-bold">4. Trajectory Loop</div>
                  <div className="text-[11px] text-slate-400">Analisis dependensi/bottleneck ➔ Kapabilitas berikutnya terbuka ➔ Abstraksi lebih tinggi.</div>
                </div>
              </div>
            </div>
          )}

          {/* 9. Telemetri Kognitif */}
          {activeTab === 'telemetri' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <span>9. Telemetri & Profil Kognitif</span>
                </h3>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <strong className="text-white block">Prinsip Telemetri Smartwatch:</strong>
                <ul className="space-y-1 list-disc list-inside text-slate-400 text-[11px]">
                  <li>Per domain, bukan satu skor rata-rata (Matematika Advanced, Bahasa Typical, Spasial Developing).</li>
                  <li>Tren pribadi, bukan perbandingan antar anak ("apakah kemampuan anak ini berkembang?").</li>
                  <li>Hindari label "mental age" atau "IQ age" yang membatasi anak.</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-white font-bold">ARYA · INTELLIGENCE OS</div>
                <div className="text-emerald-400">Reasoning ↑    Spatial ↑↑    Causal ↑↑↑    Algebra ↓</div>
                <div className="text-slate-400">Knowledge Stability: 91% · Critical Debt: LOW · Transfer Strength: 78%</div>
                <div className="text-cyan-300">Active Trajectory: Fluid Mechanics ➔ Engineering</div>
                <div className="text-indigo-300">System Action: Algebra disisipkan ke proyek buoyancy kapal selam</div>
              </div>
            </div>
          )}

          {/* 10. Produk & Bisnis */}
          {activeTab === 'bisnis' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>10. Produk dan Model Bisnis</span>
                </h3>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <strong className="text-white block">Positioning Inti:</strong>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Jangan jual "AI tutor" (mudah ditiru). Jual: <em>"Satu sistem yang tahu apa yang sudah Anda kuasai, apa yang belum, mengapa Anda salah, dan apa yang harus dipelajari berikutnya."</em>
                </p>
                <div className="p-2.5 bg-indigo-950/60 rounded border border-indigo-500/40 text-indigo-300 font-semibold text-xs">
                  DNA Produk: "Don't sell education. Sell the ability to learn anything."
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-cyan-300 block">Knowledge Engine</strong>
                  <span className="text-[10px] text-slate-400">"Apa yang ada?"</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-indigo-300 block">Adaptive Engine</strong>
                  <span className="text-[10px] text-slate-400">"Apa yang cocok?"</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-purple-300 block">Discovery Engine</strong>
                  <span className="text-[10px] text-slate-400">"Apa yang menarik?"</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-xs">
                <strong className="text-white block">Jalur Perubahan: "Pressure from Below"</strong>
                <p className="text-slate-400 text-[11px] font-mono leading-relaxed">
                  Platform ➔ Anak belajar lebih cepat ➔ Orang tua melihat hasil ➔ Lebih banyak pendaftar ➔ Sekolah ditanya ➔ Sekolah mengadopsi ➔ Guru memakai ➔ Standar bergeser.
                </p>
              </div>
            </div>
          )}

          {/* 11. 11 Asumsi & Risiko */}
          {activeTab === 'risiko' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>11. Sebelas Asumsi Terbuka & Mitigasi Risiko</span>
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { no: 1, title: 'Reliabilitas Feynman Sensor', impact: 'Seluruh learner model bergantung padanya; diagnosis noise ➔ intervensi salah.', mitigation: 'Uji akurasi diagnosis vs penilaian manusia sebelum membangun lapisan lain.' },
                  { no: 2, title: 'Debt Risk belum operasional', impact: 'Prediksi tampak presisi padahal tebakan.', mitigation: 'Mulai dari Decay × Centrality pada jalur aktif; perlakukan Uncertainty sebagai interval kepercayaan.' },
                  { no: 3, title: 'Metrik tampak presisi tanpa definisi', impact: 'Risiko Goodhart: anak mengoptimalkan dasbor angka.', mitigation: 'Definisi operasional tiap metrik; tampilkan interval ketidakpastian.' },
                  { no: 4, title: 'Capability Stage bisa diam-diam berbasis umur', impact: 'Kembali ke ukuran batch lama.', mitigation: 'Kalibrasi terhadap graph dan evidence, bukan populasi sekolah.' },
                  { no: 5, title: 'Retensi vs tanpa dark pattern', impact: 'Churn tinggi jika tak ada pengait.', mitigation: 'Uji apakah desain intrinsik cukup menahan retensi; jangan menyelundupkan mekanisme eksploitatif.' },
                  { no: 6, title: 'Belajar mandiri tidak cocok untuk semua anak', impact: 'Melebarkan ketimpangan.', mitigation: 'Peran orang tua/mentor; desain adaptif untuk berbagai tingkat motivasi awal.' },
                  { no: 7, title: 'Ketimpangan akses', impact: 'Sistem memperkuat kesenjangan sebelum mengoreksinya.', mitigation: 'Strategi akses dan penetapan harga sejak awal.' },
                  { no: 8, title: 'Kepemilikan dan privasi Learner Model', impact: 'Profil kognitif seumur hidup anak adalah aset sekaligus risiko privasi terbesar.', mitigation: 'Kontrol orang tua, auditabilitas, hak ekspor JSON/hapus mutlak.' },
                  { no: 9, title: 'Etika stealth insertion', impact: 'Manipulasi terselubung jika tanpa izin.', mitigation: 'Transparansi penuh ke orang tua; keterbukaan bertahap ke anak.' },
                  { no: 10, title: '"Pressure from below" adalah rantai asumsi', impact: 'Adopsi tidak terjadi jika terhambat sertifikasi.', mitigation: 'Definisikan portofolio penalaran yang dapat diverifikasi pihak luar.' },
                  { no: 11, title: 'Visi ≠ Bukti', impact: 'Over-investment pada hipotesis.', mitigation: 'Validasi bertahap melalui peta jalan tahap demi tahap.' },
                ].map((r) => (
                  <div key={r.no} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-amber-300">#{r.no} {r.title}:</strong>
                    <div className="text-[11px] text-slate-400 mt-0.5"><strong>Dampak:</strong> {r.impact}</div>
                    <div className="text-[11px] text-emerald-300 mt-0.5"><strong>Mitigasi:</strong> {r.mitigation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. Peta Jalan */}
          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <span>12. Peta Jalan Pembangunan (Tahap 0 - 6)</span>
                </h3>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-indigo-500/30 text-indigo-200 text-xs">
                <strong>Prinsip Urutan:</strong> <em>Data model dulu, antarmuka belakangan. Jangan mulai dari Open edX atau UI. MVP pertama boleh sederhana visualnya asalkan fondasinya solid.</em>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { stage: 'Tahap 0 · Skema', desc: 'Rumuskan entitas graph, evidence, misconception, learner state.' },
                  { stage: 'Tahap 1 · Satu domain sempit', desc: 'Contoh: dari pecahan sampai persamaan (±50-100 node). Satu pengguna pertama.' },
                  { stage: 'Tahap 2 · Uji hipotesis pusat', desc: 'Apakah diagnosis miskonsepsi oleh AI cocok dengan penilaian manusia teliti? Perbaiki sensor sebelum fitur lain.' },
                  { stage: 'Tahap 3 · Evidence + Learner Model', desc: 'Log bukti, pembaruan state, next-best-experience.' },
                  { stage: 'Tahap 4 · Repair Loop', desc: 'Decay detection dan stealth insertion, dimulai dari Decay × Centrality.' },
                  { stage: 'Tahap 5 · Telemetri', desc: 'Dasbor sederhana dengan metrik yang sudah terdefinisi secara operasional.' },
                  { stage: 'Tahap 6 · Perluasan domain dan model bisnis', desc: 'Baru dilakukan setelah nilai inti dan retensi intrinsik terbukti.' },
                ].map((s, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center font-bold text-indigo-300 text-[10px] shrink-0">
                      {idx}
                    </span>
                    <div>
                      <strong className="text-white block">{s.stage}</strong>
                      <span className="text-slate-400 text-[11px]">{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 13. Log Keputusan Desain */}
          {activeTab === 'log' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>13. Log Keputusan Desain & Alasan Epistemik</span>
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { decision: 'IQ bukan master variable', reason: 'Tidak dapat diobservasi langsung, berisiko menjadi label pembatas anak.' },
                  { decision: 'Graph sebagai source of truth, bukan AI', reason: 'Konsistensi kurikulum, auditabilitas, dan keamanan struktural.' },
                  { decision: 'Knowledge Graph dan Learner Model dipisah', reason: 'Peta dunia objektif berbeda dari posisi belajar individu anak.' },
                  { decision: 'Mastery berlapis (7 level), bukan 100% biner', reason: 'Menangkap kedalaman transfer dan penjelasan, bukan hanya rutinitas teknis.' },
                  { decision: 'Feynman sebagai sensor, bukan ujian akhir', reason: 'Diagnosis berkelanjutan tanpa tekanan evaluatif formal.' },
                  { decision: '"Zero Critical Debt", bukan Zero Debt', reason: 'Realistis terhadap sifat biologis lupa; memprioritaskan fondasi krusial.' },
                  { decision: 'Profil per domain + tren, tanpa "mental age"', reason: 'Menghindari label linier reduktif yang membatasi potensi.' },
                  { decision: 'Sekolah dipertahankan sebagai Social Sandbox', reason: 'Kompetensi sosial manusia tidak sepenuhnya bisa disimulasikan AI.' },
                  { decision: 'Tanpa dark pattern', reason: 'Selaras dengan etika integritas perkembangan intelektual sejati.' },
                  { decision: 'Free vs Subscriber dibedakan oleh kekuatan mesin', reason: 'Menghindari sistem mundur menjadi sekadar katalog video kursus.' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-indigo-300 block text-xs">{item.decision}</strong>
                    <span className="text-slate-400 text-[11px] block mt-0.5"><strong>Alasan:</strong> {item.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 14. Glosarium */}
          {activeTab === 'glosarium' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>14. Glosarium Istilah Epistemik & Kognitif</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                {[
                  { term: 'Intelligence OS', def: 'Sistem operasi personal untuk perkembangan intelektual; lapisan intelektual dari model dua lapis.' },
                  { term: 'Social Sandbox', def: 'Lingkungan fisik untuk interaksi sosial, negosiasi, kepemimpinan, dan empati.' },
                  { term: 'Knowledge Graph', def: 'Peta konsep, skill, prerequisite, dan rantai penalaran WHY.' },
                  { term: 'Learner Model', def: 'Representasi keadaan anak per node: mastery, retensi, transfer, miskonsepsi.' },
                  { term: 'Evidence Log', def: 'Catatan bukti tindakan, prediksi, eksperimen, dan penjelasan anak.' },
                  { term: 'Misconception Graph', def: 'Peta cara berpikir keliru yang lazim dan jalur koreksi counterexample.' },
                  { term: 'Feynman Sensor', def: 'Mekanisme diagnosis pemahaman lewat dialog penjelasan Socratic terpandu.' },
                  { term: 'Epistemic Debt', def: 'Akumulasi celah fondasi yang menjadi bottleneck di materi tingkat lanjut.' },
                  { term: 'Critical Epistemic Debt', def: 'Debt pada prerequisite yang berbahaya bagi lintasan aktif.' },
                  { term: 'Stealth Insertion', def: 'Menyisipkan perbaikan fondasi ke proyek berminat tinggi tanpa label remedial memalukan.' },
                  { term: 'Cognitive Bottleneck Prediction', def: 'Memperkirakan node yang akan sulit jika decay pada prasyarat berlanjut.' },
                  { term: 'Capability Stage', def: 'Tahap kemampuan per domain berdasarkan evidence, bebas dari pembatasan batch umur.' },
                  { term: 'Unbatching Cognition', def: 'Melepaskan lintasan intelektual dari pengelompokan usia biologis.' },
                  { term: 'Pressure from Below', def: 'Perubahan sistem pendidikan yang didorong adopsi organik keluarga dan anak.' },
                ].map((g, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-teal-300 block text-xs">{g.term}</strong>
                    <span className="text-slate-400 text-[11px] block mt-0.5">{g.def}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 15. Raw Markdown Document */}
          {activeTab === 'raw' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>DOKUMEN_FONDASI_ARSITEKTUR.md (Naskah Penuh)</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    /docs/architecture/DOKUMEN_FONDASI_ARSITEKTUR.md
                  </span>
                </div>
                <button
                  onClick={handleDownloadMarkdown}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File (.md)</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
{`# Personal Intelligence OS
## Dokumen Fondasi: Konsep, Prinsip, dan Arsitektur
Status: Draf v0.1 (konsolidasi) · Sifat: Dokumen hidup · Cakupan: Konsep, arsitektur logis, model bisnis, risiko.

1. Ringkasan
Tesis: Pendidikan pasca-COVID hanya mendigitalkan birokrasi abad ke-19...
Gagasan: Personal Intelligence OS memelihara perkembangan intelektual sebagai lintasan unik...
Prinsip satu kalimat: "Mass education tidak harus berarti standardized education. Satu mesin yang sama, jutaan jalur berbeda."

2. Masalah yang Dipecahkan
- Batch processing manusia
- Kurikulum linear
- Kelulusan semu (70% lulus, 30% bom waktu)
- Epistemic Debt
- Remedial yang memalukan
- Ukuran statis

3. Prinsip Desain (12 Prinsip Mengikat)
...
4. Arsitektur Logis (Knowledge Graph, Learner Model, Adaptive Engine, Evidence Log)
...
5. Knowledge Graph & WHY-Chain
...
6. Learner Model & Feynman Sensor
...
7. Self-Healing Learning & Stealth Insertion
...
8. Empat Loop Sistem (Curiosity, Mastery, Repair, Trajectory)
...
9. Telemetri Kognitif (Smartwatch untuk Pengetahuan)
...
10. Produk & Model Bisnis
...
11. 11 Asumsi Terbuka & Mitigasi Risiko
...
12. Peta Jalan Pembangunan (Tahap 0 - 6)
...
13. Log Keputusan Desain
...
14. Glosarium Istilah Epistemik`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
