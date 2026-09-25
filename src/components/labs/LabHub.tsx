import React, { useState, useMemo } from 'react';
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
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Award,
  BookOpen,
  ArrowUpRight,
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
import { QualitativeBalanceLab } from './QualitativeBalanceLab';
import { NumberLineLab } from './NumberLineLab';
import { DensityMassLab } from './DensityMassLab';
import { BinarySearchComplexityLab } from './BinarySearchComplexityLab';

import { FeynmanDiagnosisResult, KnowledgeNode, LearnerNodeState } from '../../types';
import { EmpiricalSimulationEvidence } from '../../engine/evidenceTriangulation';
import { evaluatePrerequisites, RecommendedExperience } from '../../engine/deterministicCore';

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
  | 'qualitative_balance'
  | 'number_line'
  | 'piaget_conservation'
  | 'pattern_sequence'
  | 'causal_logic'
  | 'bar_model'
  | 'density_mass'
  | 'computational_algorithm'
  | 'buoyancy'
  | 'submarine_project'
  | 'energy_conservation'
  | 'calculus_rate'
  | 'binary_search_complexity';

export type DomainFilter = 'Semua' | 'Logika & Kausal' | 'Matematika' | 'Fisika' | 'Komputasi';
export type AgeFilter = 'Semua' | '1-3' | '4-6' | '7-9' | '10-12';

interface LabHubProps {
  activeLabId: LabId;
  onSelectLab: (id: LabId) => void;
  onMasteryEvidence: (conceptName: string, details: string) => void;
  onStealthResolved: () => void;
  onFeynmanDiagnosed?: (result: FeynmanDiagnosisResult, explanation: string) => void;
  onNavigateToGraph?: (nodeId: string) => void;
  onEmpiricalEvidence?: (simulationId: string, evidence: EmpiricalSimulationEvidence) => void;
  criticalDebt?: 'LOW' | 'MEDIUM' | 'HIGH';
  queue?: RecommendedExperience[];
  learnerNodes?: Record<string, LearnerNodeState>;
  knowledgeNodes?: KnowledgeNode[];
}

export const LabHub: React.FC<LabHubProps> = ({
  activeLabId,
  onSelectLab,
  onMasteryEvidence,
  onStealthResolved,
  onFeynmanDiagnosed,
  onNavigateToGraph,
  onEmpiricalEvidence,
  criticalDebt = 'LOW',
  queue = [],
  learnerNodes = {},
  knowledgeNodes = [],
}) => {
  const [selectedDomain, setSelectedDomain] = useState<DomainFilter>('Semua');
  const [selectedAge, setSelectedAge] = useState<AgeFilter>('Semua');
  const [showExplorableLabs, setShowExplorableLabs] = useState<boolean>(false);
  const [showArchivedLabs, setShowArchivedLabs] = useState<boolean>(false);

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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
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
      ageLabel: 'Tier I (Sensori)',
      icon: Compass,
      color: 'from-green-600 to-teal-600',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Navigasi ruang linear: memandu anak kucing melintasi jalur berurutan menuju mangkuk susu.',
    },
    // ----------------------------------------------------
    // Umur 4 - 6 Tahun: Pra-Operasional & Intuisi Kuantitas
    // ----------------------------------------------------
    {
      id: 'qualitative_balance' as LabId,
      name: 'Neraca Timbangan Kualitatif',
      nodeRef: 'node-qualitative-balance',
      domain: 'Logika & Kausal' as const,
      ageBracket: '4-6' as const,
      ageLabel: 'Tier II (Ikonik)',
      icon: Scale,
      color: 'from-purple-600 to-indigo-600',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'Menemukan hakikat kesetaraan fisik (=) dan membongkar miskonsepsi "benda besar pasti lebih berat".',
    },
    {
      id: 'number_line' as LabId,
      name: 'Garis Bilangan Spasial & Kardinalitas',
      nodeRef: 'node-number-line-counting',
      domain: 'Matematika' as const,
      ageBracket: '4-6' as const,
      ageLabel: 'Tier II (Ikonik)',
      icon: TrendingUp,
      color: 'from-indigo-600 to-cyan-600',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'Lompatan katak di atas garis bilangan 0-10: menghubungkan jarak spasial, kuantitas diskret, dan simbol bilangan.',
    },
    {
      id: 'piaget_conservation' as LabId,
      name: 'Konservasi Volume & Bentuk Piaget',
      nodeRef: 'node-piaget-conservation',
      domain: 'Fisika' as const,
      ageBracket: '4-6' as const,
      ageLabel: 'Tier II (Ikonik)',
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
      ageLabel: 'Tier II (Ikonik)',
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
      ageLabel: 'Tier III (Konkret)',
      icon: Brain,
      color: 'from-cyan-600 to-blue-600',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      description: 'Menemukan mengapa tanda (=) adalah neraca invarian bilateral dan sifat transitif logika.',
    },
    {
      id: 'bar_model' as LabId,
      name: 'Bar Model & Aljabar Simbolik',
      nodeRef: 'node-bar-model',
      domain: 'Matematika' as const,
      ageBracket: '7-9' as const,
      ageLabel: 'Tier III (Konkret)',
      icon: Scale,
      color: 'from-indigo-600 to-blue-600',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'Mereduksi persamaan neraca simetris dua sisi tanpa menghafal aturan "pindah ruas ganti tanda".',
    },
    {
      id: 'density_mass' as LabId,
      name: 'Kerapatan Massa & Volume (Inquiry Lab)',
      nodeRef: 'node-density-mass',
      domain: 'Fisika' as const,
      ageBracket: '7-9' as const,
      ageLabel: 'Tier III (Konkret)',
      icon: FlaskConical,
      color: 'from-cyan-600 to-teal-600',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      description: 'Membongkar mitos "benda besar pasti berat" melalui timbangan digital, gelas ukur volume, dan uji tangki air.',
    },
    {
      id: 'computational_algorithm' as LabId,
      name: 'State Machine & Algoritma Mars Rover',
      nodeRef: 'node-algorithms',
      domain: 'Komputasi' as const,
      ageBracket: '7-9' as const,
      ageLabel: 'Tier III (Konkret)',
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
      ageLabel: 'Tier IV (Formal)',
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
      ageLabel: 'Tier IV (Formal)',
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
      ageLabel: 'Tier IV (Formal)',
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
      ageLabel: 'Tier IV (Formal)',
      icon: TrendingUp,
      color: 'from-indigo-600 to-purple-600',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      description: 'Menganalisis kecepatan sesaat roket saat interval waktu h menyusut mendekati nol tanpa paradoks 0/0.',
    },
    {
      id: 'binary_search_complexity' as LabId,
      name: 'Pencarian Biner & Kompleksitas Algoritma',
      nodeRef: 'node-binary-search-complexity',
      domain: 'Komputasi' as const,
      ageBracket: '10-12' as const,
      ageLabel: 'Tier IV (Formal)',
      icon: Cpu,
      color: 'from-emerald-600 to-cyan-600',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Membelah ruang pencarian memori transmisi Mars Rover: O(log N) biner vs O(N) linier satu-per-satu.',
    },
  ];

  const filteredCatalogue = labCatalogue.filter((item) => {
    const matchesDomain = selectedDomain === 'Semua' || item.domain === selectedDomain;
    const matchesAge = selectedAge === 'Semua' || item.ageBracket === selectedAge;
    return matchesDomain && matchesAge;
  });

  const queueMap = useMemo(() => {
    const map = new Map<string, RecommendedExperience>();
    (queue || []).forEach((q) => {
      map.set(q.nodeId, q);
    });
    return map;
  }, [queue]);

  const topQueueNodeIds = useMemo(() => {
    return new Set((queue || []).slice(0, 3).map((q) => q.nodeId));
  }, [queue]);

  const allQueueNodeIds = useMemo(() => {
    return new Set((queue || []).map((q) => q.nodeId));
  }, [queue]);

  // Categorize filtered catalogue into 3 Layers + Locked Silhouette
  const { priorityLabs, explorableLabs, masteredLabs, lockedLabs } = useMemo(() => {
    const pLabs: typeof labCatalogue = [];
    const eLabs: typeof labCatalogue = [];
    const mLabs: typeof labCatalogue = [];
    const lLabs: typeof labCatalogue = [];

    filteredCatalogue.forEach((lab) => {
      const isCurrentlyActive = lab.id === activeLabId;
      const isTopQueue = topQueueNodeIds.has(lab.nodeRef);
      const isInQueue = allQueueNodeIds.has(lab.nodeRef);

      // Check prerequisite if knowledgeNodes provided
      const node = knowledgeNodes?.find((n) => n.id === lab.nodeRef);
      const state = learnerNodes?.[lab.nodeRef];
      const prereq = node && knowledgeNodes.length > 0 && Object.keys(learnerNodes).length > 0
        ? evaluatePrerequisites(node, knowledgeNodes, learnerNodes)
        : { isUnlocked: true };

      if (!prereq.isUnlocked) {
        lLabs.push(lab);
        return;
      }

      if (isCurrentlyActive || isTopQueue) {
        pLabs.push(lab);
      } else if (isInQueue) {
        eLabs.push(lab);
      } else if (state && Object.values(state.mastery).reduce((a, b) => a + b, 0) / 7 >= 0.6) {
        mLabs.push(lab);
      } else {
        eLabs.push(lab);
      }
    });

    return {
      priorityLabs: pLabs,
      explorableLabs: eLabs,
      masteredLabs: mLabs,
      lockedLabs: lLabs,
    };
  }, [filteredCatalogue, activeLabId, topQueueNodeIds, allQueueNodeIds, knowledgeNodes, learnerNodes]);

  // Child-friendly badge helper for recommendation types
  const getQueueBadge = (nodeRef: string) => {
    const rec = queueMap.get(nodeRef);
    if (!rec) return null;
    switch (rec.type) {
      case 'BOTTLENECK_REPAIR':
        return {
          label: 'Yuk Kita Ingat Lagi!',
          chip: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'FRONTIER_EXPLORATION':
        return {
          label: 'Dunia Baru!',
          chip: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'TRANSFER_CONSOLIDATION':
        return {
          label: 'Tantangan Seru',
          chip: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        };
      case 'SPACED_RETRIEVAL':
        return {
          label: 'Segarkan Ingatan',
          chip: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Child-Friendly Misi Petualangan Khusus (Zero-Shame Framing) */}
      {criticalDebt === 'HIGH' && activeLabId !== 'submarine_project' && (
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-500/40">
                  🌟 Misi Petualangan Khusus
                </span>
                <span className="text-xs font-bold text-white">
                  Tantangan Rahasia Kapal Selam Nautica!
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Sebuah misi penting menunggumu di kedalaman laut 100 meter. Yuk bantu kendalikan tangki ballast untuk menemukan rahasia keseimbangan daya apung netral!
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectLab('submarine_project')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center justify-center gap-2 shrink-0 transition cursor-pointer"
          >
            <span>Buka Misi Kapal Selam ➔</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Domain & Age Navigation Filter Bar */}
      <div className="bg-[#0c101c] p-4 rounded-2xl border border-slate-800 space-y-3.5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Age Bracket Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Baby className="w-3.5 h-3.5 text-amber-400" />
              <span>Tahap Kognitif:</span>
            </span>
            {[
              { id: 'Semua', label: 'Semua Tahap (Tier I - IV)' },
              { id: '1-3', label: 'Tier I: Sensori-Motorik' },
              { id: '4-6', label: 'Tier II: Pra-Operasional' },
              { id: '7-9', label: 'Tier III: Operasional Konkret' },
              { id: '10-12', label: 'Tier IV: Operasional Formal' },
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

        {/* ============================================================ */}
        {/* LAPIS 1: LAB MISI SEKARANG (Default Terbuka, 1–3 Lab Fokus)   */}
        {/* ============================================================ */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sekarang · Lab Misi Utama</span>
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400/90 font-medium bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              {priorityLabs.length} Lab Fokus
            </span>
          </div>

          {priorityLabs.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-800 bg-[#0a0d18] text-center text-slate-400 text-xs">
              Pilih lab dari daftar eksplorasi di bawah untuk mulai bereksperimen.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {priorityLabs.map((lab) => {
                const Icon = lab.icon;
                const isSelected = activeLabId === lab.id;
                const queueBadge = getQueueBadge(lab.nodeRef);

                return (
                  <div
                    key={lab.id}
                    onClick={() => onSelectLab(lab.id)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-slate-900 to-[#12182c] border-cyan-400/80 ring-2 ring-cyan-500/30 shadow-lg'
                        : 'bg-[#0f1424] border-slate-800 hover:border-slate-700 hover:bg-[#12182c]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${lab.color} flex items-center justify-center text-white shadow`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${lab.badgeBg}`}>
                            {lab.domain}
                          </span>
                        </div>
                        {queueBadge ? (
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${queueBadge.chip}`}>
                            {queueBadge.label}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            {lab.ageLabel}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">
                        {lab.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {lab.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      {isSelected ? (
                        <span className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                          <span>Sedang Aktif</span>
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLab(lab.id);
                          }}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                        >
                          <span>Buka Lab</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}

                      {onNavigateToGraph && lab.nodeRef && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToGraph(lab.nodeRef);
                          }}
                          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-0.5 transition"
                          title="Lihat simpul ini di Peta Petualangan"
                        >
                          <span>Peta Ilmu</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* LAPIS 2: LAB PETUALANGAN LAINNYA (Collapsed by Default)       */}
        {/* ============================================================ */}
        {explorableLabs.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setShowExplorableLabs((prev) => !prev)}
              className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 flex items-center justify-between text-left transition border border-slate-800 group"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition" />
                <div>
                  <span className="text-xs font-bold text-white">
                    Bisa Kamu Coba Juga ({explorableLabs.length} lab terbuka)
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Eksperimen lain yang sudah siap untuk kamu coba kapan saja.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-indigo-400 font-medium">
                <span>{showExplorableLabs ? 'Sembunyikan' : 'Buka Pilihan'}</span>
                {showExplorableLabs ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {showExplorableLabs && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-3 mt-1">
                {explorableLabs.map((lab) => {
                  const Icon = lab.icon;
                  const isSelected = activeLabId === lab.id;

                  return (
                    <button
                      key={lab.id}
                      onClick={() => onSelectLab(lab.id)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'bg-slate-900 border-cyan-400/80 ring-2 ring-cyan-500/20 shadow'
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
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            {lab.ageLabel}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-200 line-clamp-1">
                          {lab.name}
                        </h5>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                          {lab.description}
                        </p>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${lab.badgeBg}`}>
                          {lab.domain}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-cyan-400 font-bold">
                            Aktif
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* LAPIS 3: LAB YANG SUDAH KAMU KUASAI (Arsip Prestasi)         */}
        {/* ============================================================ */}
        {masteredLabs.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setShowArchivedLabs((prev) => !prev)}
              className="w-full p-2.5 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/30 flex items-center justify-between text-left transition border border-emerald-900/30 group"
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition" />
                <div>
                  <span className="text-xs font-bold text-white">
                    Sudah Kamu Kuasai ({masteredLabs.length} lab tuntas)
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Eksperimen yang konsep dasarnya sudah kamu buktikan dengan sangat baik.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <span>{showArchivedLabs ? 'Sembunyikan' : 'Lihat Koleksi'}</span>
                {showArchivedLabs ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {showArchivedLabs && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-3 mt-1">
                {masteredLabs.map((lab) => {
                  const Icon = lab.icon;
                  const isSelected = activeLabId === lab.id;

                  return (
                    <button
                      key={lab.id}
                      onClick={() => onSelectLab(lab.id)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'bg-[#0e1828] border-emerald-500/80 ring-2 ring-emerald-500/20 shadow'
                          : 'bg-[#09111c] border-emerald-900/30 hover:border-emerald-700/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div
                            className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${lab.color} flex items-center justify-center text-white shadow`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Tuntas</span>
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-200 line-clamp-1">
                          {lab.name}
                        </h5>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                          {lab.description}
                        </p>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-emerald-900/40 flex items-center justify-between">
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${lab.badgeBg}`}>
                          {lab.domain}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            Aktif
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* LAB TERKUNCI (Siluet 1-Langkah Lagi)                          */}
        {/* ============================================================ */}
        {lockedLabs.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold uppercase tracking-wider text-[11px]">
                Masa Depan · Lab Menunggumu ({lockedLabs.length} lab)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {lockedLabs.map((lab) => (
                <div
                  key={lab.id}
                  className="p-2.5 rounded-xl border border-dashed border-slate-800 bg-[#070a14]/60 opacity-60 flex items-center gap-2 cursor-not-allowed select-none"
                  title={`Selesaikan prasyarat di Peta Petualangan untuk membuka lab ${lab.name}`}
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-semibold text-slate-400 truncate">
                      {lab.name}
                    </h5>
                    <span className="text-[9px] text-slate-500">
                      Terkunci · Kuasai prasyarat
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Lab Header & Navigation Link to Knowledge Graph */}
      {(() => {
        const activeItem = labCatalogue.find((item) => item.id === activeLabId);
        if (!activeItem) return null;
        const Icon = activeItem.icon;
        return (
          <div className="bg-[#0e1324] p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${activeItem.color} flex items-center justify-center text-white shadow`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{activeItem.name}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.2 rounded ${activeItem.badgeBg}`}>
                    {activeItem.domain}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeItem.ageLabel}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  Simpul Terkait di Peta Ilmu: <strong className="text-slate-300 font-mono">{activeItem.nodeRef}</strong>
                </span>
              </div>
            </div>

            {onNavigateToGraph && activeItem.nodeRef && (
              <button
                onClick={() => onNavigateToGraph(activeItem.nodeRef)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 text-xs border border-cyan-500/40 transition shadow self-start sm:self-auto font-medium"
                title="Buka simpul ini di Peta Ilmu (Knowledge Graph)"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lihat di Peta Ilmu ➔</span>
              </button>
            )}
          </div>
        );
      })()}

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
        {activeLabId === 'qualitative_balance' && (
          <QualitativeBalanceLab
            onMasteryEvidence={(concept, details) => onMasteryEvidence(concept, details)}
          />
        )}

        {activeLabId === 'number_line' && (
          <NumberLineLab
            onMasteryEvidence={(concept, details) => onMasteryEvidence(concept, details)}
          />
        )}

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
            onEmpiricalEvidence={(ev) => onEmpiricalEvidence?.('causal_logic', ev)}
          />
        )}

        {activeLabId === 'bar_model' && (
          <BarModelAlgebraLab
            onMasteryEvidence={(details) =>
              onMasteryEvidence('Aljabar Simbolik & Transformasi Kesetaraan', details)
            }
            onEmpiricalEvidence={(ev) => onEmpiricalEvidence?.('bar_model', ev)}
          />
        )}

        {activeLabId === 'density_mass' && (
          <DensityMassLab
            onMasteryEvidence={(concept, details) => onMasteryEvidence(concept, details)}
            onEmpiricalEvidence={(ev) => onEmpiricalEvidence?.('density_mass', ev)}
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
            onEmpiricalEvidence={(ev) => onEmpiricalEvidence?.('buoyancy', ev)}
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

        {activeLabId === 'binary_search_complexity' && (
          <BinarySearchComplexityLab
            onMasteryEvidence={(concept, details) => onMasteryEvidence(concept, details)}
            onEmpiricalEvidence={(ev) => onEmpiricalEvidence?.('binary_search', ev)}
          />
        )}
      </div>
    </div>
  );
};
