/**
 * EVIDENCE GATE — kontrak "tidak teramati ≠ angka".
 *
 * Tes ini sengaja ditulis LEBIH DULU dari patch/fase implementasi (TDD).
 * Gate G6b sampai G12 harus MERAH pada fase 1 dan menjadi HIJAU saat implementasi
 * Worker & Pages Proxy (Fase 2-4) selesai.
 *
 * Jalankan: npm run test:gate   (exit code 1 jika ada gate yang merah)
 */
import 'fake-indexeddb/auto';
(globalThis as any).window = globalThis;

import fs from 'fs';
import { triangulateEvidence } from '../src/engine/evidenceTriangulation';
import { calculateDeterministicEpistemicDebt, emptyLearnerState } from '../src/engine/deterministicCore';
import { INITIAL_KNOWLEDGE_GRAPH } from '../src/data/initialKnowledgeGraph';
import { importOSDatasetJSON, persistLearnerNode, openOSDatabase } from '../src/storage/indexedDbStorage';
import worker from '../worker/index';
import { onRequestPost as pagesFeynman } from '../functions/api/diagnose/feynman';

type Gate = { id: string; title: string; run: () => Promise<string | null> }; // null = lolos, string = alasan merah
const gates: Gate[] = [];
const gate = (id: string, title: string, run: Gate['run']) => gates.push({ id, title, run });

const feynman = (v: number): any => ({
  conceptualUnderstanding: v, causalReasoning: v, transferScore: v,
  analogyDetected: false, misconceptions: [], feedbackSummary: '', nextBestProbe: '',
});

// ---------- G1: tanpa bukti sama sekali → tidak boleh ada angka & tidak boleh update ----------
gate('G1', 'input kosong ⇒ tidak ada update learner model, tidak ada mastery delta', async () => {
  const r = triangulateEvidence(undefined, undefined, undefined, {});
  const nums = Object.values(r.recommendedMasteryDelta ?? {}).filter((x) => typeof x === 'number');
  if (r.shouldUpdateLearnerModel) return 'shouldUpdateLearnerModel=true tanpa satu pun observasi';
  if (nums.length) return `mastery delta berisi ${nums.length} angka karangan: ${JSON.stringify(r.recommendedMasteryDelta)}`;
  return null;
});

// ---------- G2: quorum — estimasi model saja tidak boleh mengubah learner model ----------
gate('G2', 'hanya sinyal model (Feynman) ⇒ provisional, shouldUpdateLearnerModel=false', async () => {
  const r = triangulateEvidence(undefined, feynman(0.95), undefined, { childUtteranceWordCount: 40 });
  if (r.shouldUpdateLearnerModel) return 'model-only lolos quorum: satu sensor tak tervalidasi (Risiko #1) memegang otoritas penuh';
  return null;
});

// ---------- G3: transfer yang belum diuji tidak boleh menjadi angka turunan ----------
gate('G3', 'tanpa tes transfer ⇒ compositeTransfer bukan angka (bukan understanding × 0.7)', async () => {
  const empirical = { simulationId: 'x', taskCompleted: true, accuracyScore: 0.9, manipulationPrecision: 0.9, trialCount: 3, isTrialAndErrorGuesswork: false };
  const r: any = triangulateEvidence(empirical, feynman(0.9), undefined, { childUtteranceWordCount: 40 });
  if (typeof r.compositeTransfer === 'number' && Number.isFinite(r.compositeTransfer)) return `compositeTransfer=${r.compositeTransfer} muncul tanpa satu pun observasi transfer`;
  return null;
});

// ---------- G4 (metamorphic): "belum diuji" harus berbeda dari "diuji dan hasilnya 0.5" ----------
gate('G4', 'unobserved ≠ observed-pada-nilai-default (triangulasi)', async () => {
  const observedAtDefault = { simulationId: 'x', taskCompleted: false, accuracyScore: 0.5, manipulationPrecision: 0.5, trialCount: 1, isTrialAndErrorGuesswork: false };
  const opts = { childUtteranceWordCount: 40 };
  const a = triangulateEvidence(undefined, feynman(0.6), undefined, opts);
  const b = triangulateEvidence(observedAtDefault, feynman(0.6), undefined, opts);
  const sameNumbers = JSON.stringify(a.evidenceBreakdown) === JSON.stringify(b.evidenceBreakdown);
  if (sameNumbers && a.confidence === b.confidence) return 'lab tak-diuji dan lab diuji-lalu-0.5 menghasilkan breakdown & confidence identik';
  return null;
});

// ---------- G5: default epistemik di mesin debt tidak boleh menyamar sebagai observasi ----------
const NODE = INITIAL_KNOWLEDGE_GRAPH[0] as any;
const STATE: any = { nodeId: NODE.id, mastery: {}, decayRate: 0.02, lastReinforcedDate: '2026-09-01', activeMisconceptions: [], learningRate: 0.5, confidence: 'medium', debtRisk: 0, isBottleneck: false };
gate('G5a', 'decayRate hilang ≠ decayRate teramati 0.02', async () => {
  const missing = calculateDeterministicEpistemicDebt(NODE, { ...STATE, decayRate: undefined }, 0.5);
  const observed = calculateDeterministicEpistemicDebt(NODE, { ...STATE, decayRate: 0.02 }, 0.5);
  return JSON.stringify(missing) === JSON.stringify(observed) ? 'hasil identik: decay yang tak pernah diukur dibaca sebagai 0.02 terukur' : null;
});
gate('G5b', 'centrality hilang ≠ centrality 0.5', async () => {
  const missing = calculateDeterministicEpistemicDebt({ ...NODE, centrality: undefined }, STATE, 0.5);
  const asHalf = calculateDeterministicEpistemicDebt({ ...NODE, centrality: 0.5 }, STATE, 0.5);
  return JSON.stringify(missing) === JSON.stringify(asHalf) ? 'hasil identik: centrality tak diketahui dibaca sebagai fakta graf 0.5' : null;
});

// ---------- G6a: worker: field yang dihilangkan model tidak menjadi angka ----------
const partial = () => ({ run: async () => ({ response: JSON.stringify({ conceptualUnderstanding: 0.91 }) }) });
const req = () => new Request('https://x/api/diagnose/feynman', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conceptName: 'Buoyancy', studentExplanation: 'Kapal mengapung karena bentuknya menggeser air yang cukup banyak sehingga gaya angkat sama dengan beratnya.' }) });
const fabricated = (j: any) => ['causalReasoning', 'transferScore'].filter((k) => typeof j?.[k] === 'number' || typeof j?.feynmanDiagnosis?.[k] === 'number');

gate('G6a', 'worker: field yang dihilangkan model tidak menjadi angka (0.70/0.65)', async () => {
  const res = await (worker as any).fetch(req(), { AI: partial() });
  const f = fabricated(await res.json());
  return f.length ? `engine menciptakan: ${f.join(', ')}` : null;
});

// ---------- G6b: proxy Pages: tanpa AI_GATEWAY binding, jawabannya HTTP 503 unobserved ----------
gate('G6b', 'proxy Pages: tanpa AI_GATEWAY binding, jawabannya HTTP 503 unobserved', async () => {
  const res = await pagesFeynman({ request: req(), env: {} as any });
  if (res.status !== 503) return `status=${res.status} (diharapkan 503 Service Unavailable saat AI_GATEWAY tidak ada)`;
  const body: any = await res.json().catch(() => null);
  if (!body || body.unobserved !== true) return `respons bukan unobserved=true: ${JSON.stringify(body)}`;
  return null;
});

// ---------- G7: import tidak boleh merusak data yang sudah ada ----------
gate('G7', 'import payload rusak ⇒ data lama utuh, tidak ada data parsial', async () => {
  const count = async () => { const db = await openOSDatabase(); return new Promise<number>((r) => { const q = db.transaction('learner_nodes').objectStore('learner_nodes').count(); q.onsuccess = () => r(q.result); }); };
  await persistLearnerNode({ ...STATE, nodeId: 'keep-1' }); await persistLearnerNode({ ...STATE, nodeId: 'keep-2' });
  const before = await count();
  try { await importOSDatasetJSON(JSON.stringify({ learnerNodes: [{ nodeId: 'partial-x' }, { foo: 'tanpa-key' }] })); } catch { /* gagal itu wajar */ }
  await new Promise((r) => setTimeout(r, 100));
  const after = await count();
  return after === before ? null : `node sebelum=${before}, sesudah import gagal=${after} (data lama hilang / parsial ter-commit)`;
});

// ---------- G8: central-hypothesis: respons parsial ⇒ probe unobserved tanpa angka ----------
gate('G8', 'central-hypothesis: respons model parsial ⇒ probe unobserved tanpa skor numerik', async () => {
  // Model returns array with only 1 probe, omitting other 3 probes in chunk
  const partialAI = () => ({
    run: async () => ({
      response: JSON.stringify([{ probeId: 'item-1::base', structuralMasteryScore: 0.85, hasMisconception: false }]),
    }),
  });
  const chReq = new Request('https://x/api/benchmark/central-hypothesis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'test-model',
      items: [{ id: 'item-1', prompt: 'test', childUtterance: 'test' }],
    }),
  });
  const res = await (worker as any).fetch(chReq, { AI: partialAI() });
  const data = await res.json();
  const layer0 = data?.results?.[0]?.layer0;
  if (!layer0) return `layer0 probe tidak ditemukan di hasil: ${JSON.stringify(data)}`;
  if (layer0.unobserved !== true) return `probe yang hilang tidak ditandai unobserved=true: ${JSON.stringify(layer0)}`;
  if (typeof layer0.structuralMasteryScore === 'number') return `probe unobserved memuat skor numerik rekaan: structuralMasteryScore=${layer0.structuralMasteryScore}`;
  return null;
});

// ---------- G9: feynman-suite: kasus hilang/skor NaN ⇒ unobserved tanpa angka ----------
gate('G9', 'feynman-suite: kasus hilang / aiScore NaN ⇒ unobserved tanpa angka', async () => {
  // Model only returns 1 of 2 cases, and with NaN score
  const partialSuiteAI = () => ({
    run: async () => ({
      response: JSON.stringify([{ caseId: 'case-1', aiScore: NaN }]),
    }),
  });
  const fsReq = new Request('https://x/api/benchmark/feynman-suite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'test-model',
      cases: [
        { id: 'case-1', conceptName: 'Density', childUtterance: 'A' },
        { id: 'case-2', conceptName: 'Gravity', childUtterance: 'B' },
      ],
    }),
  });
  const res = await (worker as any).fetch(fsReq, { AI: partialSuiteAI() });
  const data = await res.json();
  const c1 = data?.evaluations?.find((e: any) => e.caseId === 'case-1');
  const c2 = data?.evaluations?.find((e: any) => e.caseId === 'case-2');
  if (!c1 || !c2) return `evaluations tidak lengkap: ${JSON.stringify(data)}`;
  if (c1.unobserved !== true) return `case-1 dengan skor NaN tidak ditandai unobserved=true: ${JSON.stringify(c1)}`;
  if (typeof c1.aiScore === 'number' && Number.isFinite(c1.aiScore)) return `case-1 memuat aiScore numerik rekaan: ${c1.aiScore}`;
  if (c2.unobserved !== true) return `case-2 yang hilang dari model tidak ditandai unobserved=true: ${JSON.stringify(c2)}`;
  if (typeof c2.aiScore === 'number' && Number.isFinite(c2.aiScore)) return `case-2 memuat aiScore numerik rekaan: ${c2.aiScore}`;
  return null;
});

// ---------- G10: kegagalan binding / error model ⇒ 503 / unobserved tanpa field skor numerik ----------
gate('G10', 'endpoint feynman: binding hilang atau error ⇒ HTTP 503 unobserved tanpa skor numerik', async () => {
  // worker without AI binding
  const res = await (worker as any).fetch(req(), {});
  if (res.status !== 503) return `status=${res.status} (diharapkan 503 saat AI binding tidak ada)`;
  const body = await res.json().catch(() => null);
  if (!body || body.unobserved !== true) return `body bukan unobserved=true: ${JSON.stringify(body)}`;
  const numFields = ['conceptualUnderstanding', 'causalReasoning', 'transferScore']
    .filter((k) => typeof body[k] === 'number' || typeof body?.feynmanDiagnosis?.[k] === 'number');
  if (numFields.length) return `respons 503 memuat field numerik rekaan: ${numFields.join(', ')}`;
  return null;
});

// ---------- G11: socratic AI failure ⇒ 503 unobserved ----------
gate('G11', 'socratic: kegagalan AI / binding tidak ada ⇒ HTTP 503 unobserved', async () => {
  const socReq = new Request('https://x/api/tutor/socratic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ concept: 'Buoyancy', studentMessage: 'Kenapa batu tenggelam?' }),
  });
  const res = await (worker as any).fetch(socReq, {});
  if (res.status !== 503) return `status=${res.status} (diharapkan 503 saat AI binding tidak ada)`;
  const body = await res.json().catch(() => null);
  if (!body || body.unobserved !== true) return `respons bukan unobserved=true: ${JSON.stringify(body)}`;
  return null;
});

// ---------- G12: emptyLearnerState() helper menggantikan literal karangan & || 0.x di App.tsx ----------
gate('G12', 'emptyLearnerState() helper tunggal & bebas pencemaran || 0.x di App.tsx', async () => {
  const s = emptyLearnerState('test-node');
  if (!s || s.nodeId !== 'test-node') return 'emptyLearnerState tidak mengembalikan state dengan nodeId valid';
  if (s.decayRate !== undefined) return `emptyLearnerState decayRate=${s.decayRate} (harus undefined)`;
  if (s.evidenceCount !== 0) return `emptyLearnerState evidenceCount=${s.evidenceCount} (harus 0)`;
  const masteries = Object.values(s.mastery || {});
  if (masteries.length !== 7 || masteries.some((v) => v !== 0)) {
    return `mastery awal harus 7 tingkat bernilai 0: ${JSON.stringify(s.mastery)}`;
  }
  // Audit source code App.tsx
  const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
  if (appSrc.includes('recognition: 0.8') || appSrc.includes('recognition: 1')) {
    return 'App.tsx masih memuat literal state karangan (recognition: 0.8 / 1)';
  }
  if (appSrc.includes('|| 0.5') || appSrc.includes('|| 0.6') || appSrc.includes('|| 0.4')) {
    return 'App.tsx masih menggunakan fallback || 0.x yang menelan mastery 0 menjadi baseline default';
  }
  return null;
});

(async () => {
  let red = 0;
  for (const g of gates) {
    let out: string | null;
    try { out = await g.run(); } catch (e: any) { out = `exception: ${e?.message ?? e}`; }
    if (out) { red++; console.log(`  ✗ [MERAH] ${g.id} ${g.title}\n      ↳ ${out}`); } else console.log(`  ✓ [HIJAU] ${g.id} ${g.title}`);
  }
  console.log(`\n${gates.length - red}/${gates.length} gate hijau · ${red} merah`);
  process.exit(red ? 1 : 0);
})();
