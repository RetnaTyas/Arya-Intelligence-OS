/**
 * EVIDENCE GATE — kontrak "tidak teramati ≠ angka".
 *
 * Tes ini sengaja ditulis LEBIH DULU dari patch. Semuanya harus MERAH pada kode saat ini
 * dan HIJAU setelah boundary Evidence<T> diterapkan. Jangan dilonggarkan agar lulus.
 *
 * Jalankan: npm run test:gate   (exit code 1 jika ada gate yang merah)
 *
 * Prinsip: tes memakai bentuk kontrak seminimal mungkin (bukan menebak nama field baru),
 * kecuali G3 yang menuntut "tidak ada angka" untuk transfer yang belum diuji.
 */
import 'fake-indexeddb/auto';
(globalThis as any).window = globalThis;

import { triangulateEvidence } from '../src/engine/evidenceTriangulation';
import { calculateDeterministicEpistemicDebt } from '../src/engine/deterministicCore';
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

// ---------- G6: field yang tidak dikembalikan model tidak boleh diciptakan engine ----------
const partial = () => ({ run: async () => ({ response: JSON.stringify({ conceptualUnderstanding: 0.91 }) }) });
const req = () => new Request('https://x/api/diagnose/feynman', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conceptName: 'Buoyancy', studentExplanation: 'Kapal mengapung karena bentuknya menggeser air yang cukup banyak sehingga gaya angkat sama dengan beratnya.' }) });
const fabricated = (j: any) => ['causalReasoning', 'transferScore'].filter((k) => typeof j?.[k] === 'number' || typeof j?.feynmanDiagnosis?.[k] === 'number');
gate('G6a', 'worker: field yang dihilangkan model tidak menjadi angka (0.70/0.65)', async () => {
  const res = await (worker as any).fetch(req(), { AI: partial() });
  const f = fabricated(await res.json());
  return f.length ? `engine menciptakan: ${f.join(', ')}` : null;
});
gate('G6b', 'Pages Functions (jalur langsung): field yang dihilangkan model tidak menjadi angka', async () => {
  const res = await pagesFeynman({ request: req(), env: { 'AiOS AI': partial() } as any });
  const f = fabricated(await res.json());
  return f.length ? `engine menciptakan: ${f.join(', ')}` : null;
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
