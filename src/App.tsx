import React, { useState, useEffect } from 'react';
import { Header, AppView } from './components/Header';
import { KnowledgeGraphExplorer } from './components/KnowledgeGraphExplorer';
import { LabHub, LabId } from './components/labs/LabHub';
import { SocraticTutorView } from './components/SocraticTutorView';
import { ParentTelemetryDashboard } from './components/ParentTelemetryDashboard';
import { FoundationDocViewer } from './components/FoundationDocViewer';
import { DeterministicCoreInspector } from './components/DeterministicCoreInspector';
import { FeynmanCalibrationSuite } from './components/FeynmanCalibrationSuite';

import { INITIAL_KNOWLEDGE_GRAPH } from './data/initialKnowledgeGraph';
import {
  INITIAL_LEARNER_NODES,
  INITIAL_EVIDENCE_LOGS,
  INITIAL_COGNITIVE_TELEMETRY,
  INITIAL_ACTIVE_TRAJECTORY,
} from './data/initialLearnerState';

import {
  KnowledgeNode,
  LearnerNodeState,
  EvidenceEntry,
  CognitiveDomainTelemetry,
  ActiveTrajectory,
  FeynmanDiagnosisResult,
} from './types';

import { triangulateEvidence, EmpiricalSimulationEvidence, ParentCalibrationSettings, DEFAULT_PARENT_CALIBRATION } from './engine/evidenceTriangulation';
import { applyMasteryGating } from './engine/deterministicCore';
import {
  loadInitialOSState,
  persistAllLearnerNodes,
  persistAllEvidenceLogs,
  persistActiveTrajectory,
  getBrowserStorageEstimate,
  exportOSDatasetJSON,
  importOSDatasetJSON,
  resetOSDatabase,
  clearAllOSData,
  persistParentCalibration,
  loadParentCalibration,
} from './storage/indexedDbStorage';
import { computeRealTimeTelemetry } from './engine/dynamicTelemetry';

import { Network, FlaskConical, MessageSquare, Compass, ShieldAlert, Sparkles, CheckCircle2, Cpu, Brain, HardDrive } from 'lucide-react';

export default function App() {
  // Views & Tabs
  const [currentView, setCurrentView] = useState<AppView>('child');
  const [childTab, setChildTab] = useState<'graph' | 'labs' | 'socratic'>('graph');
  const [engineSubTab, setEngineSubTab] = useState<'core' | 'feynman'>('core');
  const [activeLabId, setActiveLabId] = useState<LabId>('buoyancy');
  const [isDocOpen, setIsDocOpen] = useState<boolean>(false);

  // Core OS State
  const [knowledgeNodes] = useState<KnowledgeNode[]>(INITIAL_KNOWLEDGE_GRAPH);
  const [learnerNodes, setLearnerNodes] = useState<Record<string, LearnerNodeState>>(INITIAL_LEARNER_NODES);
  const [evidenceLogs, setEvidenceLogs] = useState<EvidenceEntry[]>(INITIAL_EVIDENCE_LOGS);
  const [telemetry, setTelemetry] = useState<CognitiveDomainTelemetry[]>(INITIAL_COGNITIVE_TELEMETRY);
  const [activeTrajectory, setActiveTrajectory] = useState<ActiveTrajectory>(INITIAL_ACTIVE_TRAJECTORY);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-buoyancy-archimedes');
  const [parentCalibration, setParentCalibration] = useState<ParentCalibrationSettings>(DEFAULT_PARENT_CALIBRATION);

  const [knowledgeStability, setKnowledgeStability] = useState<number>(91);
  const [criticalDebt, setCriticalDebt] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Empirical Lab Telemetry derived from real child manipulations (docs/architecture/lab-telemetry-design.md)
  const [pendingEmpiricalEvidence, setPendingEmpiricalEvidence] = useState<Record<string, EmpiricalSimulationEvidence>>({});

  const handleEmpiricalEvidence = (simulationId: string, evidence: EmpiricalSimulationEvidence) => {
    // 1. Store in pending map (available for multi-modal Feynman triangulation)
    setPendingEmpiricalEvidence((prev) => ({ ...prev, [simulationId]: evidence }));

    // 2. Identify the target KnowledgeNode in the graph
    const matchedNode =
      knowledgeNodes.find((n) => n.activeSimulationId === simulationId || n.id.includes(simulationId)) ||
      selectedNode;

    if (!matchedNode) return;

    // 3. Deterministic Mastery Calculation based on real empirical telemetry:
    // - Accuracy score (0..1)
    // - Manipulation precision (0..1)
    // - Penalty if trial & error guesswork was detected
    const discount = evidence.isTrialAndErrorGuesswork ? 0.5 : 1.0;
    const accuracyGain = (evidence.accuracyScore * 0.18) * discount;
    const precisionGain = (evidence.manipulationPrecision * 0.12) * discount;

    const confidence: 'high' | 'medium' | 'low' =
      evidence.accuracyScore >= 0.75 && !evidence.isTrialAndErrorGuesswork
        ? 'high'
        : evidence.accuracyScore >= 0.5
        ? 'medium'
        : 'low';

    // 4. Update Learner State with deterministic mastery gating
    setLearnerNodes((prev) => {
      const current = prev[matchedNode.id] || {
        nodeId: matchedNode.id,
        mastery: {
          recognition: 0.8,
          recall: 0.7,
          understanding: 0.7,
          application: 0.6,
          transfer: 0.5,
          explanation: 0.5,
          creation: 0.3,
        },
        decayRate: 0.02,
        confidence: 'medium',
        evidenceCount: 2,
        lastInteracted: new Date().toISOString(),
        activeMisconceptions: [],
      };

      const gatedMastery = applyMasteryGating(current.mastery, {
        application: (current.mastery.application || 0.5) + accuracyGain,
        transfer: (current.mastery.transfer || 0.4) + precisionGain,
        understanding: (current.mastery.understanding || 0.6) + (accuracyGain * 0.8),
      });

      return {
        ...prev,
        [matchedNode.id]: {
          ...current,
          mastery: gatedMastery,
          confidence,
          evidenceCount: (current.evidenceCount ?? 0) + 1,
          lastInteracted: new Date().toISOString(),
        },
      };
    });

    // 5. Append to immutable Evidence Log
    const newEntry: EvidenceEntry = {
      id: `ev-emp-${simulationId}-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      conceptId: matchedNode.id,
      conceptName: matchedNode.name,
      actions: [
        {
          actionType: 'solve_challenge',
          description: `Telemetri Empiris Lab: ${evidence.trialCount} kali uji coba, Akurasi: ${(evidence.accuracyScore * 100).toFixed(0)}%, Presisi: ${(evidence.manipulationPrecision * 100).toFixed(0)}%. ${
            evidence.isTrialAndErrorGuesswork
              ? 'Terdeteksi pola tebak-acak (penalti diterapkan pada akselerasi mastery).'
              : 'Eksplorasi sistematis terverifikasi.'
          }`,
          timestamp: new Date().toISOString(),
        },
      ],
      confidence,
      retentionStatus: 'verified_transfer',
      notes: `Bukti empiris langsung dari interaksi anak pada simulasi ${simulationId}.`,
    };

    setEvidenceLogs((prev) => [newEntry, ...prev]);
    setKnowledgeStability((prev) => Math.min(99, prev + 1));
    showToast(`✓ Telemetri Empiris ${matchedNode.name}: Akurasi ${(evidence.accuracyScore * 100).toFixed(0)}% terintegrasi ke State Anak!`);
  };

  // IndexedDB Storage & Quota State
  const [isDbReady, setIsDbReady] = useState<boolean>(false);
  const [storageInfo, setStorageInfo] = useState<{
    usageMb: number;
    quotaMb: number;
    percentageUsed: number;
    isSupported: boolean;
  }>({
    usageMb: 0.15,
    quotaMb: 2048,
    percentageUsed: 0.01,
    isSupported: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1. Initial hydration from IndexedDB local browser storage
  useEffect(() => {
    let isMounted = true;

    async function hydrateFromIndexedDB() {
      try {
        const loaded = await loadInitialOSState();
        if (!isMounted) return;

        setLearnerNodes(loaded.learnerNodes);
        setEvidenceLogs(loaded.evidenceLogs);
        setActiveTrajectory(loaded.activeTrajectory);

        // Dynamically compute real telemetry from persisted learner nodes and evidence logs
        const computed = computeRealTimeTelemetry(
          knowledgeNodes,
          loaded.learnerNodes,
          loaded.evidenceLogs,
          loaded.activeTrajectory
        );

        setTelemetry(computed.telemetry);
        setKnowledgeStability(computed.overallKnowledgeStability);
        setCriticalDebt(computed.criticalDebt);
        setIsDbReady(true);

        const savedCalibration = await loadParentCalibration();
        if (savedCalibration && isMounted) {
          setParentCalibration(savedCalibration);
        }

        const est = await getBrowserStorageEstimate();
        if (isMounted) {
          setStorageInfo(est);
        }

        if (loaded.isFreshDB) {
          showToast('IndexedDB diinisialisasi: Penyimpanan lokal aktif di browser ini.');
        }
      } catch (err) {
        console.warn('Inisialisasi IndexedDB fallback:', err);
        setIsDbReady(true);
      }
    }

    hydrateFromIndexedDB();

    return () => {
      isMounted = false;
    };
  }, [knowledgeNodes]);

  // 2. Persist to IndexedDB & recompute real-time telemetry whenever learner state updates
  useEffect(() => {
    if (!isDbReady) return;

    persistAllLearnerNodes(learnerNodes);
    persistAllEvidenceLogs(evidenceLogs);
    persistActiveTrajectory(activeTrajectory);

    // Compute dynamic telemetry, stability, and debt without mock values
    const computed = computeRealTimeTelemetry(
      knowledgeNodes,
      learnerNodes,
      evidenceLogs,
      activeTrajectory
    );

    setTelemetry(computed.telemetry);
    setKnowledgeStability(computed.overallKnowledgeStability);
    setCriticalDebt(computed.criticalDebt);

    // Refresh storage estimate
    getBrowserStorageEstimate().then((est) => setStorageInfo(est));
  }, [learnerNodes, evidenceLogs, activeTrajectory, isDbReady, knowledgeNodes]);

  // Handler for full JSON backup download
  const handleExportFullJSON = async () => {
    try {
      const jsonStr = await exportOSDatasetJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute('download', `arya_intelligence_os_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
      showToast('✓ Cadangan lengkap IndexedDB berhasil diekspor!');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengekspor data cadangan.');
    }
  };

  // Handler for JSON backup file import
  const handleImportFullJSON = async (file: File) => {
    try {
      const text = await file.text();
      const res = await importOSDatasetJSON(text);
      if (res.success) {
        setLearnerNodes(res.learnerNodes);
        setEvidenceLogs(res.evidenceLogs);
        setActiveTrajectory(res.activeTrajectory);
        showToast(
          `✓ Data berhasil dipulihkan: ${Object.keys(res.learnerNodes).length} node & ${res.evidenceLogs.length} bukti tersimpan.`
        );
      }
    } catch (err: any) {
      console.error('Import error:', err);
      showToast(`Gagal mengimpor file: ${err.message || 'Format tidak valid'}`);
    }
  };

  // Handler to clear all data completely (empty profile, 0% stats, no fake fallback)
  const handleClearAllData = async () => {
    try {
      await clearAllOSData();
      setLearnerNodes({});
      setEvidenceLogs([]);
      setActiveTrajectory({
        id: 'traj-empty',
        title: 'Trajektori Kosong (Menunggu Aktivitas Pertama)',
        fromNode: 'node-buoyancy-archimedes',
        toNode: 'node-symbolic-algebra',
        status: 'active',
        systemActionNote: 'Menunggu inisiasi aktivitas pertama anak',
      });
      showToast('✓ Seluruh data anak & log bukti berhasil dihapus bersih (0%).');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengosongkan data.');
    }
  };

  // Handler to update Parent Ground Truth calibration
  const handleUpdateParentCalibration = async (settings: ParentCalibrationSettings) => {
    setParentCalibration(settings);
    await persistParentCalibration(settings);
    showToast(
      `✓ Kalibrasi Ground Truth disimpan: ${(settings.parentWeight * 100).toFixed(0)}% Ortu / ${(settings.aiWeight * 100).toFixed(0)}% AI`
    );
  };

  // Handler to apply Parent Ground Truth inline audit to an evidence entry
  const handleApplyParentAudit = async (entryId: string, parentScore: number, notes?: string) => {
    const pWeight = parentCalibration.parentWeight;
    const aiWeight = parentCalibration.aiWeight;

    setEvidenceLogs((prev) =>
      prev.map((e) => {
        if (e.id === entryId) {
          const currentAiScore = e.feynmanDiagnosis?.conceptualUnderstanding ?? 0.7;
          const fusedScore = Number(((pWeight * parentScore) + (aiWeight * currentAiScore)).toFixed(3));
          return {
            ...e,
            confidence: 'high',
            notes: notes
              ? `[Ground Truth Ortu: ${(parentScore * 100).toFixed(0)}%, Fusi: ${(fusedScore * 100).toFixed(0)}%] ${notes}`
              : `[Ground Truth Ortu: ${(parentScore * 100).toFixed(0)}%, Fusi: ${(fusedScore * 100).toFixed(0)}%]`,
            feynmanDiagnosis: e.feynmanDiagnosis
              ? {
                  ...e.feynmanDiagnosis,
                  conceptualUnderstanding: fusedScore,
                }
              : undefined,
          };
        }
        return e;
      })
    );

    showToast('✓ Ground Truth Orang Tua berhasil diterapkan ke log bukti!');
  };

  // Handler to reset IndexedDB to clean state
  const handleResetDatabase = async () => {
    try {
      await resetOSDatabase();
      const loaded = await loadInitialOSState();
      setLearnerNodes(loaded.learnerNodes);
      setEvidenceLogs(loaded.evidenceLogs);
      setActiveTrajectory(loaded.activeTrajectory);
      showToast('Basis data IndexedDB berhasil dipulihkan ke sampel baseline demo!');
    } catch (err) {
      console.error(err);
      showToast('Gagal mereset basis data.');
    }
  };

  const selectedNode = knowledgeNodes.find((n) => n.id === selectedNodeId) || knowledgeNodes[0];

  // Callback when Feynman Sensor evaluates learner explanation in BuoyancyLab
  const handleFeynmanDiagnosed = (result: FeynmanDiagnosisResult, childExplanation: string) => {
    const wordCount = (childExplanation || '').split(/\s+/).filter(Boolean).length;

    // Multi-modal evidence triangulation: Lab Empiris (60%) + Transfer (25%) + Feynman AI (15%)
    // Menggunakan bukti empiris interaksi anak nyata dari telemetry lab (docs/architecture/lab-telemetry-design.md)
    const empirical = pendingEmpiricalEvidence['buoyancy'];

    if (!empirical) {
      // Tidak ada bukti empiris tersedia — JANGAN diam-diam pakai angka optimis.
      // Turunkan confidence secara eksplisit alih-alih menyamarkan ketiadaan data.
      console.warn('Empirical evidence belum tersedia untuk simulationId=buoyancy; triangulasi berjalan tanpa bukti lab.');
    }

    const triangulation = triangulateEvidence(
      empirical, // undefined jika lab belum pernah dites — triangulateEvidence SUDAH menangani ini (empiricalScore = 0.5 default netral)
      result,
      {
        targetDomain: 'Fisika Fluida & Archimedes',
        appliedSuccessfully: result.transferScore >= 0.6,
        transferScore: result.transferScore,
      },
      {
        childUtteranceWordCount: wordCount,
        parentCalibration,
      }
    );

    // 1. Update Learner State with deterministic mastery gating
    setLearnerNodes((prev) => {
      const current = prev['node-buoyancy-archimedes'] || {
        nodeId: 'node-buoyancy-archimedes',
        mastery: { recognition: 1, recall: 0.9, understanding: 0.8, application: 0.7, transfer: 0.5, explanation: 0.5, creation: 0.3 },
        decayRate: 0.05,
        confidence: 'medium',
        evidenceCount: 4,
        lastInteracted: new Date().toISOString(),
        activeMisconceptions: [],
      };

      const gatedMastery = applyMasteryGating(current.mastery, triangulation.recommendedMasteryDelta);
      const updatedMisconceptions = result.misconceptions || [];

      return {
        ...prev,
        'node-buoyancy-archimedes': {
          ...current,
          mastery: gatedMastery,
          confidence: triangulation.confidence,
          evidenceCount: (current.evidenceCount ?? 0) + 1,
          activeMisconceptions: updatedMisconceptions,
          lastInteracted: new Date().toISOString(),
        },
      };
    });

    // 2. Append to Evidence Log with triangulation audit metadata
    const empiricalSummary = empirical
      ? `Lab Empiris: ${empirical.trialCount}x uji, akurasi ${(empirical.accuracyScore * 100).toFixed(0)}%, presisi ${(empirical.manipulationPrecision * 100).toFixed(0)}%`
      : 'Lab Empiris: Belum diuji (Default netral 50%)';

    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      conceptId: 'node-buoyancy-archimedes',
      conceptName: 'Gaya Apung & Kerapatan (Archimedes)',
      actions: [
        {
          actionType: 'explain_concept',
          description: `Penjelasan anak: "${childExplanation.slice(0, 120)}..."`,
          timestamp: new Date().toISOString(),
        },
      ],
      feynmanDiagnosis: {
        conceptualUnderstanding: result.conceptualUnderstanding,
        causalReasoning: result.causalReasoning,
        transferScore: result.transferScore,
        misconceptionDetected: result.misconceptions && result.misconceptions.length > 0 ? result.misconceptions[0] : undefined,
      },
      confidence: triangulation.confidence,
      retentionStatus: triangulation.noiseFlagDetected ? 'pending' : 'fresh',
      notes: triangulation.noiseFlagDetected
        ? `[Feynman Noise Shield Aktif] ${triangulation.discrepancyNote} | ${empiricalSummary}`
        : `[Triangulasi Tervalidasi] ${result.feedbackSummary} | ${empiricalSummary}`,
    };

    setEvidenceLogs((prev) => [newEntry, ...prev]);

    if (triangulation.noiseFlagDetected) {
      showToast(`Perisai Noise Feynman: ${triangulation.discrepancyNote}`);
    } else {
      showToast(
        `Triangulasi Multimodal (${empirical ? `Lab ${empirical.trialCount}x uji` : 'Lab Netral'} + AI 15%): Bukti kausal diverifikasi & digate secara deterministik!`
      );
    }
  };

  // Callback for Bar Model Algebra Lab
  const handleBarModelEvidence = (details: string) => {
    setLearnerNodes((prev) => {
      const current = prev['node-bar-model'];
      return {
        ...prev,
        'node-bar-model': {
          ...current,
          mastery: {
            ...current.mastery,
            transfer: 0.95,
            explanation: 0.95,
          },
          evidenceCount: (current.evidenceCount ?? 0) + 1,
          lastInteracted: new Date().toISOString(),
        },
      };
    });

    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      conceptId: 'node-bar-model',
      conceptName: 'Bar Model ke Aljabar',
      actions: [
        {
          actionType: 'solve_challenge',
          description: details,
          timestamp: new Date().toISOString(),
        },
      ],
      confidence: 'high',
      retentionStatus: 'verified_transfer',
      notes: 'Anak mendemonstrasikan prinsip simetri dua sisi secara mandiri.',
    };

    setEvidenceLogs((prev) => [newEntry, ...prev]);
    showToast('Bukti Logika: Prinsip neraca kesetaraan berhasil terverifikasi!');
  };

  // General Evidence Logger for all Domain Simulation Labs
  const handleGenericLabMasteryEvidence = (conceptName: string, details: string) => {
    // 1. Identify relevant node if possible
    const matchedNode =
      knowledgeNodes.find((n) => n.name.toLowerCase().includes(conceptName.toLowerCase().split(' ')[0])) ||
      selectedNode;

    // 2. Elevate learner mastery for matched node
    if (matchedNode) {
      setLearnerNodes((prev) => {
        const current = prev[matchedNode.id] || {
          nodeId: matchedNode.id,
          mastery: { recognition: 0.8, recall: 0.7, understanding: 0.7, application: 0.6, transfer: 0.5, explanation: 0.5, creation: 0.3 },
          decayRate: 0.02,
          confidence: 'medium',
          evidenceCount: 2,
          lastInteracted: new Date().toISOString(),
          activeMisconceptions: [],
        };

        return {
          ...prev,
          [matchedNode.id]: {
            ...current,
            mastery: {
              ...current.mastery,
              application: Math.min(1.0, (current.mastery.application || 0.6) + 0.15),
              transfer: Math.min(1.0, (current.mastery.transfer || 0.5) + 0.15),
              understanding: Math.min(1.0, (current.mastery.understanding || 0.7) + 0.1),
            },
            evidenceCount: (current.evidenceCount ?? 0) + 1,
            lastInteracted: new Date().toISOString(),
          },
        };
      });
    }

    // 3. Append to immutable Evidence Log
    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      conceptId: matchedNode.id,
      conceptName,
      actions: [
        {
          actionType: 'solve_challenge',
          description: details,
          timestamp: new Date().toISOString(),
        },
      ],
      confidence: 'high',
      retentionStatus: 'verified_transfer',
      notes: 'Penguasaan konsep tervalidasi melalui pembuktian mandiri pada Lab Simulasi Domain.',
    };

    setEvidenceLogs((prev) => [newEntry, ...prev]);
    setKnowledgeStability((prev) => Math.min(99, prev + 1));
    showToast(`✓ Bukti Epistemik: ${conceptName} berhasil disimpan ke Evidence Log!`);
  };

  // Callback when Submarine Project Lab finishes the Stealth Insertion
  const handleStealthRemediationResolved = () => {
    // 1. Repair epistemic debt on symbolic algebra
    setLearnerNodes((prev) => {
      const currentAlg = prev['node-symbolic-algebra'];
      if (!currentAlg) return prev;
      return {
        ...prev,
        'node-symbolic-algebra': {
          ...currentAlg,
          decayRate: 0.0, // Decay recovered!
          mastery: {
            ...currentAlg.mastery,
            application: 0.88,
            transfer: 0.85,
          },
          evidenceCount: (currentAlg.evidenceCount ?? 0) + 1,
          lastInteracted: new Date().toISOString(),
        },
      };
    });

    // 2. Update telemetry
    setTelemetry((prev) =>
      prev.map((item) =>
        item.domain === 'Algebra & Simbolik'
          ? { ...item, trend: 'up', stabilityScore: 88, demonstratedStage: 'Applied Stage (Neutralized)' }
          : item
      )
    );

    setKnowledgeStability(94);

    // 3. Update trajectory system action
    setActiveTrajectory((prev) => ({
      ...prev,
      systemActionNote: '✅ Reconsolidation Aljabar Sukses! Epistemic Debt pulih 100% via misi kapal selam.',
    }));

    // 4. Log Evidence
    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      conceptId: 'node-symbolic-algebra',
      conceptName: 'Aljabar Simbolik (Stealth Insertion)',
      actions: [
        {
          actionType: 'transfer_success',
          description: 'Menyelesaikan perumusan aljabar linier tangki ballast 1500 + 1.5x = 2400 untuk mencapai keseimbangan fluida 100m.',
          timestamp: new Date().toISOString(),
        },
      ],
      confidence: 'high',
      retentionStatus: 'verified_transfer',
      notes: 'Self-healing engine berhasil merekonsolidasi aljabar tanpa memicu rasa malu remedial.',
    };

    setEvidenceLogs((prev) => [newEntry, ...prev]);
    showToast('✨ Self-Healing Sukses: Epistemic Debt Aljabar pulih sempurna via proyek eksplorasi!');
  };

  // Callback for Socratic conversations
  const handleSocraticEvidence = (conceptName: string, studentQuery: string, tutorReply: string) => {
    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      conceptId: selectedNode.id,
      conceptName,
      actions: [
        {
          actionType: 'ask_socratic_question',
          description: `Pertanyaan penalaran anak: "${studentQuery}"`,
          timestamp: new Date().toISOString(),
        },
      ],
      confidence: 'medium',
      retentionStatus: 'fresh',
      notes: `Dialog Socratic dieksplorasi. Respons bimbingan: "${tutorReply.slice(0, 90)}..."`,
    };

    setEvidenceLogs((prev) => [newEntry, ...prev]);
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Universal Header */}
      <Header
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v)}
        onOpenDoc={() => setIsDocOpen(true)}
        knowledgeStability={knowledgeStability}
        criticalDebt={criticalDebt}
        activeTrajectoryTitle={activeTrajectory.title}
      />

      {/* Epistemic Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'child' ? (
          <div className="space-y-6">
            {/* Child View Navigation Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c101c] p-2 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  id="tab-graph-btn"
                  onClick={() => setChildTab('graph')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                    childTab === 'graph'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Peta Ilmu (Knowledge Graph)</span>
                </button>

                <button
                  id="tab-labs-btn"
                  onClick={() => setChildTab('labs')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                    childTab === 'labs'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Lab Simulasi & Proyek</span>
                </button>

                <button
                  id="tab-socratic-btn"
                  onClick={() => setChildTab('socratic')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                    childTab === 'socratic'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Tutor Socratic AI</span>
                </button>
              </div>

              {/* Lab Counter Indicator when on labs tab */}
              {childTab === 'labs' && (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-slate-300 font-mono text-[11px]">
                    33 Lab Simulasi & Proyek (Cakupan Lengkap 4 Domain & Rentang Usia 1-12 Thn)
                  </span>
                </div>
              )}
            </div>

            {/* Active Sub-Tab View */}
            {childTab === 'graph' && (
              <KnowledgeGraphExplorer
                nodes={knowledgeNodes}
                learnerNodes={learnerNodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
                onLaunchSimulation={(simId) => {
                  const legacyMap: Record<string, LabId> = {
                    'sim-buoyancy-tank': 'buoyancy',
                    'sim-bar-model-balance': 'bar_model',
                    'sim-submarine-ballast': 'submarine_project',
                  };
                  const resolvedLabId = legacyMap[simId] || (simId as LabId);
                  setActiveLabId(resolvedLabId);
                  setChildTab('labs');
                }}
                onTriggerFeynman={(node) => {
                  setSelectedNodeId(node.id);
                  setChildTab('socratic');
                }}
              />
            )}

            {childTab === 'labs' && (
              <LabHub
                activeLabId={activeLabId}
                onSelectLab={setActiveLabId}
                onMasteryEvidence={handleGenericLabMasteryEvidence}
                onStealthResolved={handleStealthRemediationResolved}
                onFeynmanDiagnosed={handleFeynmanDiagnosed}
                onNavigateToGraph={(nodeId) => {
                  setSelectedNodeId(nodeId);
                  setChildTab('graph');
                }}
                onEmpiricalEvidence={handleEmpiricalEvidence}
              />
            )}

            {childTab === 'socratic' && (
              <SocraticTutorView
                activeNode={selectedNode}
                learnerState={learnerNodes[selectedNode.id]}
                onEvidenceGenerated={handleSocraticEvidence}
              />
            )}
          </div>
        ) : currentView === 'parent' ? (
          /* Parent Telemetry View (Section 9) */
          <ParentTelemetryDashboard
            telemetry={telemetry}
            evidenceLogs={evidenceLogs}
            learnerNodes={learnerNodes}
            knowledgeNodes={knowledgeNodes}
            activeTrajectory={activeTrajectory}
            knowledgeStability={knowledgeStability}
            criticalDebt={criticalDebt}
            storageInfo={storageInfo}
            parentCalibration={parentCalibration}
            onUpdateParentCalibration={handleUpdateParentCalibration}
            onApplyParentAudit={handleApplyParentAudit}
            onExportJSON={handleExportFullJSON}
            onImportJSON={handleImportFullJSON}
            onResetData={handleResetDatabase}
            onClearAllData={handleClearAllData}
            onNavigateToStealthProject={() => {
              setCurrentView('child');
              setChildTab('labs');
              setActiveLabId('submarine_project');
            }}
            onOpenDeterministicEngine={() => {
              setCurrentView('engine');
            }}
          />
        ) : (
          /* Deterministic Core & Feynman Calibration View */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  id="tab-deterministic-core-btn"
                  onClick={() => setEngineSubTab('core')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                    engineSubTab === 'core'
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>Deterministic Core Engine</span>
                </button>
                <button
                  id="tab-feynman-calibration-btn"
                  onClick={() => setEngineSubTab('feynman')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                    engineSubTab === 'feynman'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span>Feynman Sensor Calibration Suite (Tahap 2)</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-400 px-2 hidden lg:block">
                Dokumen Fondasi: Bagian 4.3 (Batasan AI) & Bagian 11 (Mitigasi Risiko #1)
              </div>
            </div>

            {engineSubTab === 'core' ? (
              <DeterministicCoreInspector
                nodes={knowledgeNodes}
                learnerNodes={learnerNodes}
                evidenceLogs={evidenceLogs}
                parentCalibration={parentCalibration}
                onUpdateParentCalibration={handleUpdateParentCalibration}
                onSelectNode={(id) => setSelectedNodeId(id)}
                onLaunchSimulation={(simId) => {
                  setCurrentView('child');
                  setChildTab('labs');
                  setActiveLabId(simId as any);
                }}
              />
            ) : (
              <FeynmanCalibrationSuite />
            )}
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-900 bg-[#080b12] py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Personal Intelligence OS · Dokumen Fondasi v0.1 Konsolidasi</span>
          <span className="text-slate-400">
            Prinsip: Mass education tanpa standardisasi kaku · Graph adalah sumber kebenaran · Simpan bukti bukan progress bar
          </span>
        </div>
      </footer>

      {/* Dokumen Fondasi Reader Slide-Over */}
      <FoundationDocViewer isOpen={isDocOpen} onClose={() => setIsDocOpen(false)} />
    </div>
  );
}
