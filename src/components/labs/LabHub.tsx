import React, { useState } from 'react';
import {
  FlaskConical,
  Scale,
  Compass,
  Cpu,
  Zap,
  TrendingUp,
  Brain,
  Baby,
  Filter,
  Sparkles,
  Droplets,
  Puzzle,
} from 'lucide-react';
import { BuoyancyLab } from './BuoyancyLab';
import { BarModelAlgebraLab } from './BarModelAlgebraLab';
import { SubmarineProjectLab } from './SubmarineProjectLab';
import { CausalLogicLab } from './CausalLogicLab';
import { CalculusRateLab } from './CalculusRateLab';
import { EnergyConservationLab } from './EnergyConservationLab';
import { ComputationalAlgorithmLab } from './ComputationalAlgorithmLab';
import { ObjectPermanenceLab } from './ObjectPermanenceLab';
import { PiagetConservationLab } from './PiagetConservationLab';
import { PatternSequenceLab } from './PatternSequenceLab';
import { ToddlerLogicLabs } from './toddler/ToddlerLogicLabs';
import { ToddlerMathLabs } from './toddler/ToddlerMathLabs';
import { ToddlerPhysicsLabs } from './toddler/ToddlerPhysicsLabs';
import { ToddlerComputingLabs } from './toddler/ToddlerComputingLabs';

import { FeynmanDiagnosisResult } from '../../types';

export type LabId =
  // Umur 1-3 Logika
  | 'object_permanence'
  | 'action_reaction'
  | 'containment_relations'
  | 'mirror_identity'
  | 'domino_cascade'
  // Umur 1-3 Matematika
  | 'subitizing_quantity'
  | 'size_comparison'
  | 'tower_stacking'
  | 'one_to_one'
  | 'part_whole'
  // Umur 1-3 Fisika
  | 'gravity_ramp'
  | 'heavy_light'
  | 'sink_or_float'
  | 'magnetic_attraction'
  | 'bounce_elasticity'
  // Umur 1-3 Komputasi
  | 'spatial_sorting'
  | 'color_grouping'
  | 'step_sequence'
  | 'binary_switch'
  | 'path_maze'
  // Umur 4-12
  | 'piaget_conservation'
  | 'pattern_sequence'
  | 'causal_logic'
  | 'bar_model'
  | 'calculus_rate'
  | 'buoyancy'
  | 'energy_conservation'
  | 'computational_algorithm'
  | 'submarine_project';

export type DomainFilter = 'Semua' | 'Logika & Kausal' | 'Matematika' | 'Fisika' | 'Komputasi';
export type AgeFilter = 'Semua' | '1-3' | '4-6' | '7-9' | '10-12';

interface LabHubProps {
  activeLabId: LabId;
  onSelectLab: (id: LabId) => void;
  onMasteryEvidence: (conceptName: string, details: string) => void;
  onStealthResolved: () => void;
  onFeynmanDiagnosed?: (result: FeynmanDiagnosisResult, explanation: string) => void;
}

export const LabHub: React.FC<LabHubProps> = ({
  activeLabId,
  onSelectLab,
  onMasteryEvidence,
  onStealthResolved,
  onFeynmanDiagnosed,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<DomainFilter>('Semua');
  const [selectedAge, setSelectedAge] = useState<AgeFilter>('Semua');

  const labCatalogue = [
    // ----------------------------------------------------
    // Umur 1 - 3 Tahun: Sensori-Motorik & Permanensi
    // ----------------------------------------------------
    {
      id: 'object_permanence' as LabId,
      name: 'Permanensi Objek & Kausalitas Primer',
      nodeRef: 'node-object-permanence',
      domain: 'Logika & Kausal' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Baby,
      color: 'from-amber-600 to-orange-600',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Eksperimen kotak cilukba: membuktikan bahwa objek tetap eksis meskipun tidak terlihat mata.',
    },
    {
      id: 'action_reaction' as LabId,
      name: 'Aksi-Reaksi Kausal & Tuas Rangsang',
      nodeRef: 'node-action-reaction',
      domain: 'Logika & Kausal' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Eksplorasi agensi fisik: setiap tekanan tombol memicu efek audio-visual deterministik seketika.',
    },
    {
      id: 'containment_relations' as LabId,
      name: 'Relasi Spasial Wadah & Konten (In/Out)',
      nodeRef: 'node-containment-relations',
      domain: 'Logika & Kausal' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Baby,
      color: 'from-orange-600 to-amber-600',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Eksplorasi batas ruang: memasukkan ke dalam, mengeluarkan, dan menumpahkan wadah saat dibalik.',
    },
    {
      id: 'mirror_identity' as LabId,
      name: 'Pencerminan Diri & Simetri Optik',
      nodeRef: 'node-mirror-identity',
      domain: 'Logika & Kausal' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Sparkles,
      color: 'from-amber-600 to-yellow-500',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Uji cermin Rouge: kesadaran refleksi optik diri dan pemetaan spasial gerakan tubuh.',
    },
    {
      id: 'domino_cascade' as LabId,
      name: 'Rantai Kausal Sekuensial & Efek Domino',
      nodeRef: 'node-domino-cascade',
      domain: 'Logika & Kausal' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Compass,
      color: 'from-yellow-600 to-amber-600',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Transitivitas gaya: dorongan awal diteruskan melalui balok perantara hingga memicu sasaran akhir.',
    },

    // --- Matematika 1 - 3 Tahun ---
    {
      id: 'subitizing_quantity' as LabId,
      name: 'Subitisasi & Persepsi Kuantitas Kasar',
      nodeRef: 'node-subitizing-quantity',
      domain: 'Matematika' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Scale,
      color: 'from-indigo-500 to-purple-500',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'Pengenalan instan jumlah 1, 2, atau 3 buah secara visual tanpa membilang satu per satu.',
    },
    {
      id: 'size_comparison' as LabId,
      name: 'Perbandingan Ukuran Relatif & Magnitudo',
      nodeRef: 'node-size-comparison',
      domain: 'Matematika' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Scale,
      color: 'from-indigo-600 to-blue-600',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'Membedakan dimensi fisik: besar vs kecil, banyak vs sedikit untuk membangun relasi ordinal.',
    },
    {
      id: 'tower_stacking' as LabId,
      name: 'Seriasi Ukuran & Menara Pink Tower',
      nodeRef: 'node-tower-stacking',
      domain: 'Matematika' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Brain,
      color: 'from-pink-600 to-rose-600',
      badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      description: 'Menumpuk 5 balok dari alas terlebar ke puncak terkecil untuk menguji pusat massa kesetimbangan.',
    },
    {
      id: 'one_to_one' as LabId,
      name: 'Korespondensi Satu-ke-Satu (1-to-1 Matching)',
      nodeRef: 'node-one-to-one',
      domain: 'Matematika' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Sparkles,
      color: 'from-purple-600 to-indigo-600',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'Memasangkan tepat 1 wortel untuk 1 kelinci secara adil, fondasi sejati proses pencacahan.',
    },
    {
      id: 'part_whole' as LabId,
      name: 'Part-Whole Intuitif & Konservasi Kesatuan',
      nodeRef: 'node-part-whole',
      domain: 'Matematika' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Brain,
      color: 'from-indigo-500 to-teal-500',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'Memotong satu buah utuh menjadi 2 belahan dan menyatukannya kembali tanpa kehilangan substansi.',
    },

    // --- Fisika 1 - 3 Tahun ---
    {
      id: 'gravity_ramp' as LabId,
      name: 'Gravitasi Jatuh Bebas & Bidang Miring',
      nodeRef: 'node-gravity-ramp',
      domain: 'Fisika' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Zap,
      color: 'from-teal-500 to-cyan-500',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      description: 'Eksplorasi gaya tarik bumi: sudut miring mempercepat bola menggelinding ke bawah.',
    },
    {
      id: 'heavy_light' as LabId,
      name: 'Massa Komparatif & Jungkat-Jungkit',
      nodeRef: 'node-heavy-light',
      domain: 'Fisika' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Scale,
      color: 'from-cyan-600 to-teal-600',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      description: 'Benda berbobot lebih berat menekan tuas jungkat-jungkit lebih dalam dibandingkan benda ringan.',
    },
    {
      id: 'sink_or_float' as LabId,
      name: 'Tenggelam vs Terapung Intuitif Fluida',
      nodeRef: 'node-sink-or-float',
      domain: 'Fisika' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Droplets,
      color: 'from-teal-600 to-blue-600',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      description: 'Air memberikan gaya apung ke atas: kayu mengambang, sedangkan batu dan logam tenggelam.',
    },
    {
      id: 'magnetic_attraction' as LabId,
      name: 'Gaya Magnetik & Tarik Logam',
      nodeRef: 'node-magnetic-attraction',
      domain: 'Fisika' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Zap,
      color: 'from-rose-600 to-teal-600',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      description: 'Gaya kontak tak kasat mata: magnet menarik paku dan klip besi tanpa perlu menyentuh langsung.',
    },
    {
      id: 'bounce_elasticity' as LabId,
      name: 'Elastisitas & Benturan Pantul Benda',
      nodeRef: 'node-bounce-elasticity',
      domain: 'Fisika' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Sparkles,
      color: 'from-teal-500 to-emerald-500',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      description: 'Bola karet elastis memantul kembali, sedangkan adonan lempung pipih menyerap energi tanpa memantul.',
    },

    // --- Komputasi 1 - 3 Tahun ---
    {
      id: 'spatial_sorting' as LabId,
      name: 'Pola Geometri & Shape Sorter',
      nodeRef: 'node-spatial-sorting',
      domain: 'Komputasi' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Puzzle,
      color: 'from-emerald-500 to-teal-500',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Mencocokkan bentuk fisik dengan lubang cetakan geometris: lingkaran, segitiga, persegi.',
    },
    {
      id: 'color_grouping' as LabId,
      name: 'Klasifikasi Atribut & Kelompok Warna',
      nodeRef: 'node-color-grouping',
      domain: 'Komputasi' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Cpu,
      color: 'from-emerald-600 to-green-500',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Pengelompokan elemen berdasarkan kesamaan atribut diskret: kelereng merah vs biru.',
    },
    {
      id: 'step_sequence' as LabId,
      name: 'Runtunan Instruksi 2-Langkah (Algoritma Dini)',
      nodeRef: 'node-step-sequence',
      domain: 'Komputasi' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Compass,
      color: 'from-teal-600 to-emerald-600',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Pemahaman urutan kausal: langkah ambil kunci adalah prasyarat langkah membuka peti.',
    },
    {
      id: 'binary_switch' as LabId,
      name: 'Saklar Logika Biner 0/1 (Boolean State)',
      nodeRef: 'node-binary-switch',
      domain: 'Komputasi' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Zap,
      color: 'from-emerald-500 to-cyan-500',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Dua kondisi diskret saling eksklusif (ON atau OFF, 1 atau 0) pada saklar kendali.',
    },
    {
      id: 'path_maze' as LabId,
      name: 'Pelacakan Lintasan Garis (Path Traversal)',
      nodeRef: 'node-path-maze',
      domain: 'Komputasi' as const,
      ageBracket: '1-3' as const,
      ageLabel: '1 - 3 Thn (Sensori)',
      icon: Compass,
      color: 'from-green-600 to-teal-600',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Navigasi ruang linear: memandu anak kucing melintasi jalur berurutan menuju mangkuk susu.',
    },
    // ----------------------------------------------------
    // Umur 4 - 6 Tahun: Pra-Operasional & Intuisi Kuantitas
    // ----------------------------------------------------
    {
      id: 'piaget_conservation' as LabId,
      name: 'Konservasi Volume & Bentuk Piaget',
      nodeRef: 'node-piaget-conservation',
      domain: 'Fisika' as const,
      ageBracket: '4-6' as const,
      ageLabel: '4 - 6 Thn (Pra-Operasional)',
      icon: Droplets,
      color: 'from-teal-600 to-cyan-600',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      description: 'Mengatasi ilusi sentrasi tinggi bejana: air dipindah ke gelas ramping massanya tetap 250g.',
    },
    {
      id: 'pattern_sequence' as LabId,
      name: 'Pengenalan Pola & Algoritma Awal',
      nodeRef: 'node-pattern-sequencing',
      domain: 'Komputasi' as const,
      ageBracket: '4-6' as const,
      ageLabel: '4 - 6 Thn (Pra-Operasional)',
      icon: Puzzle,
      color: 'from-purple-600 to-fuchsia-600',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'Menemukan siklus perulangan manik-manik dan meramalkan suku berikutnya secara deterministik.',
    },
    // ----------------------------------------------------
    // Umur 7 - 9 Tahun: Operasional Konkret
    // ----------------------------------------------------
    {
      id: 'causal_logic' as LabId,
      name: 'Kesetaraan Relasional & Rantai Kausal',
      nodeRef: 'node-equality',
      domain: 'Logika & Kausal' as const,
      ageBracket: '7-9' as const,
      ageLabel: '7 - 9 Thn (Konkret)',
      icon: Brain,
      color: 'from-cyan-600 to-blue-600',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      description: 'Menemukan mengapa tanda (=) adalah neraca invarian bilateral dan sifat transitif logika.',
    },
    {
      id: 'bar_model' as LabId,
      name: 'Bar Model & Aljabar Simbolik',
      nodeRef: 'node-symbolic-algebra',
      domain: 'Matematika' as const,
      ageBracket: '7-9' as const,
      ageLabel: '7 - 9 Thn (Konkret)',
      icon: Scale,
      color: 'from-indigo-600 to-blue-600',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'Mereduksi persamaan neraca simetris dua sisi tanpa menghafal aturan "pindah ruas ganti tanda".',
    },
    {
      id: 'computational_algorithm' as LabId,
      name: 'State Machine & Algoritma Mars Rover',
      nodeRef: 'node-algorithms',
      domain: 'Komputasi' as const,
      ageBracket: '7-9' as const,
      ageLabel: '7 - 9 Thn (Konkret)',
      icon: Cpu,
      color: 'from-purple-600 to-indigo-600',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'Navigasi grid deterministik, penanganan obstacle, dan eksekusi instruksi step-by-step tanpa bug.',
    },
    // ----------------------------------------------------
    // Umur 10 - 12 Tahun: Transisi Operasional Formal & Sintesis
    // ----------------------------------------------------
    {
      id: 'buoyancy' as LabId,
      name: 'Fluida & Gaya Apung Archimedes',
      nodeRef: 'node-buoyancy-archimedes',
      domain: 'Fisika' as const,
      ageBracket: '10-12' as const,
      ageLabel: '10 - 12 Thn (Formal)',
      icon: FlaskConical,
      color: 'from-cyan-600 to-teal-600',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      description: 'Eksperimen fluida komparatif massa vs volume air tumpah yang terintegrasi dengan Feynman Sensor AI.',
    },
    {
      id: 'submarine_project' as LabId,
      name: 'Proyek Rekayasa Ballast Kapal Selam',
      nodeRef: 'node-submarine-ballast',
      domain: 'Logika & Kausal' as const,
      ageBracket: '10-12' as const,
      ageLabel: '10 - 12 Thn (Formal)',
      icon: Compass,
      color: 'from-teal-600 to-emerald-600',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      isProject: true,
      description: 'Sintesis daya apung netral di kedalaman 100m dengan pemulihan aljabar terselubung (Stealth Remediation).',
    },
    {
      id: 'energy_conservation' as LabId,
      name: 'Hukum Kekekalan Energi Mekanik',
      nodeRef: 'node-energy-conservation',
      domain: 'Fisika' as const,
      ageBracket: '10-12' as const,
      ageLabel: '10 - 12 Thn (Formal)',
      icon: Zap,
      color: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Lintasan roller coaster konversi Energi Potensial, Kinetik, dan Gesekan Termal (Teorema Noether).',
    },
    {
      id: 'calculus_rate' as LabId,
      name: 'Kalkulus: Laju Perubahan & Limit',
      nodeRef: 'node-calculus-rate',
      domain: 'Matematika' as const,
      ageBracket: '10-12' as const,
      ageLabel: '10 - 12 Thn (Formal)',
      icon: TrendingUp,
      color: 'from-indigo-600 to-purple-600',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'Menganalisis kecepatan sesaat roket saat interval waktu h menyusut mendekati nol tanpa paradoks 0/0.',
    },
  ];

  const filteredCatalogue = labCatalogue.filter((item) => {
    const matchesDomain = selectedDomain === 'Semua' || item.domain === selectedDomain;
    const matchesAge = selectedAge === 'Semua' || item.ageBracket === selectedAge;
    return matchesDomain && matchesAge;
  });

  return (
    <div className="space-y-6">
      {/* Domain & Age Navigation Filter Bar */}
      <div className="bg-[#0c101c] p-4 rounded-2xl border border-slate-800 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Age Bracket Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Baby className="w-3.5 h-3.5 text-amber-400" />
              <span>Rentang Usia:</span>
            </span>
            {[
              { id: 'Semua', label: 'Semua Usia (1 - 12 Thn)' },
              { id: '1-3', label: '1 - 3 Thn (Sensori)' },
              { id: '4-6', label: '4 - 6 Thn (Pra-Operasional)' },
              { id: '7-9', label: '7 - 9 Thn (Konkret)' },
              { id: '10-12', label: '10 - 12 Thn (Transisi Formal)' },
            ].map((age) => (
              <button
                key={age.id}
                onClick={() => setSelectedAge(age.id as AgeFilter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  selectedAge === age.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                {age.label}
              </button>
            ))}
          </div>

          {/* Domain Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Domain:</span>
            </span>
            {(['Semua', 'Logika & Kausal', 'Matematika', 'Fisika', 'Komputasi'] as DomainFilter[]).map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedDomain === dom
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Horizontal Carousel of Labs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-800/80">
          {filteredCatalogue.map((lab) => {
            const Icon = lab.icon;
            const isSelected = activeLabId === lab.id;

            return (
              <button
                key={lab.id}
                onClick={() => onSelectLab(lab.id)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-slate-900 to-[#121629] border-cyan-400/80 ring-2 ring-cyan-500/20 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${lab.color} flex items-center justify-center text-white shadow`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {lab.ageLabel.split(' ')[0]} {lab.ageLabel.split(' ')[1]} {lab.ageLabel.split(' ')[2]}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                    {lab.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {lab.description}
                  </p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${lab.badgeBg}`}>
                    {lab.domain}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5">
                      Aktif
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Currently Active Lab View */}
      <div className="animate-fade-in">
        {/* Ages 1 - 3 */}
        {activeLabId === 'object_permanence' && (
          <ObjectPermanenceLab
            onMasteryEvidence={(details) =>
              onMasteryEvidence('Permanensi Objek & Kausalitas Primer', details)
            }
          />
        )}

        {(activeLabId === 'action_reaction' ||
          activeLabId === 'containment_relations' ||
          activeLabId === 'mirror_identity' ||
          activeLabId === 'domino_cascade') && (
          <ToddlerLogicLabs
            labType={activeLabId}
            onMasteryEvidence={(concept, details) => onMasteryEvidence(concept, details)}
          />
        )}

        {(activeLabId === 'subitizing_quantity' ||
          activeLabId === 'size_comparison' ||
          activeLabId === 'tower_stacking' ||
          activeLabId === 'one_to_one' ||
          activeLabId === 'part_whole') && (
          <ToddlerMathLabs
            labType={activeLabId}
            onMasteryEvidence={(concept, details) => onMasteryEvidence(concept, details)}
          />
        )}

        {(activeLabId === 'gravity_ramp' ||
          activeLabId === 'heavy_light' ||
          activeLabId === 'sink_or_float' ||
          activeLabId === 'magnetic_attraction' ||
          activeLabId === 'bounce_elasticity') && (
          <ToddlerPhysicsLabs
            labType={activeLabId}
            onMasteryEvidence={(concept, details) => onMasteryEvidence(concept, details)}
          />
        )}

        {(activeLabId === 'spatial_sorting' ||
          activeLabId === 'color_grouping' ||
          activeLabId === 'step_sequence' ||
          activeLabId === 'binary_switch' ||
          activeLabId === 'path_maze') && (
          <ToddlerComputingLabs
            labType={activeLabId}
            onMasteryEvidence={(concept, details) => onMasteryEvidence(concept, details)}
          />
        )}

        {/* Ages 4 - 6 */}
        {activeLabId === 'piaget_conservation' && (
          <PiagetConservationLab
            onMasteryEvidence={(details) =>
              onMasteryEvidence('Konservasi Volume & Bentuk Piaget', details)
            }
          />
        )}

        {activeLabId === 'pattern_sequence' && (
          <PatternSequenceLab
            onMasteryEvidence={(details) =>
              onMasteryEvidence('Pengenalan Pola & Algoritma Awal', details)
            }
          />
        )}

        {/* Ages 7 - 9 */}
        {activeLabId === 'causal_logic' && (
          <CausalLogicLab
            onMasteryEvidence={(details) =>
              onMasteryEvidence('Fondasi Kesetaraan & Hubungan', details)
            }
          />
        )}

        {activeLabId === 'bar_model' && (
          <BarModelAlgebraLab
            onMasteryEvidence={(details) =>
              onMasteryEvidence('Aljabar Simbolik & Transformasi Kesetaraan', details)
            }
          />
        )}

        {activeLabId === 'computational_algorithm' && (
          <ComputationalAlgorithmLab
            onMasteryEvidence={(details) =>
              onMasteryEvidence('Algoritma, State & Logika Komputasi', details)
            }
          />
        )}

        {/* Ages 10 - 12 */}
        {activeLabId === 'buoyancy' && (
          <BuoyancyLab
            onFeynmanDiagnosed={onFeynmanDiagnosed}
            onMasteryEvidence={(details) =>
              onMasteryEvidence('Mekanika Fluida & Gaya Apung Archimedes', details)
            }
          />
        )}

        {activeLabId === 'submarine_project' && (
          <SubmarineProjectLab onStealthResolved={onStealthResolved} />
        )}

        {activeLabId === 'energy_conservation' && (
          <EnergyConservationLab
            onMasteryEvidence={(details) =>
              onMasteryEvidence('Hukum Kekekalan Energi Mekanik', details)
            }
          />
        )}

        {activeLabId === 'calculus_rate' && (
          <CalculusRateLab
            onMasteryEvidence={(details) =>
              onMasteryEvidence('Kalkulus: Laju Perubahan & Limit', details)
            }
          />
        )}
      </div>
    </div>
  );
};
