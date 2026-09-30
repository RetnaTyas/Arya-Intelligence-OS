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

// ---------- G8: central-hypothesis: respons parsial ⇒ probe unobserved tanpa angka, kontrol positif tetap ber-skor ----------
gate('G8', 'central-hypothesis: respons model parsial ⇒ probe hilang unobserved tanpa skor numerik, probe valid membawa skor', async () => {
  // Model returns array with item-1::base valid (0.85), but omits layer0, layer1, layer2
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
  const base = data?.results?.[0]?.base;
  const layer0 = data?.results?.[0]?.layer0;
  if (!base || !layer0) return `probe tidak ditemukan di hasil: ${JSON.stringify(data)}`;

  // Kontrol positif: base yang ada responsnya harus TIDAK unobserved dan skornya 0.85
  if (base.unobserved === true) return `kontrol positif gagal: base yang valid ditandai unobserved=true`;
  if (base.structuralMasteryScore !== 0.85) return `kontrol positif gagal: base score ${base.structuralMasteryScore} !== 0.85`;

  // Negatif: layer0 yang hilang harus unobserved dan TIDAK punya structuralMasteryScore numerik
  if (layer0.unobserved !== true) return `probe yang hilang tidak ditandai unobserved=true: ${JSON.stringify(layer0)}`;
  if (typeof layer0.structuralMasteryScore === 'number') return `probe unobserved memuat skor numerik rekaan: structuralMasteryScore=${layer0.structuralMasteryScore}`;
  return null;
});

// ---------- G9: feynman-suite: kasus hilang / null / non-numerik ⇒ unobserved tanpa angka, kasus valid tetap ber-skor ----------
gate('G9', 'feynman-suite: kasus hilang / aiScore null / string non-numerik ⇒ unobserved tanpa angka, kasus valid tetap ber-skor', async () => {
  // Model returns case-1 with valid score 0.92, case-2 with null (from JSON.stringify(NaN)), case-3 with string "bukan-angka", omits case-4
  const suiteAI = () => ({
    run: async () => ({
      response: JSON.stringify([
        { caseId: 'case-1', aiScore: 0.92 },
        { caseId: 'case-2', aiScore: null },
        { caseId: 'case-3', aiScore: 'tidak_terukur' },
      ]),
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
        { id: 'case-3', conceptName: 'Buoyancy', childUtterance: 'C' },
        { id: 'case-4', conceptName: 'Pressure', childUtterance: 'D' },
      ],
    }),
  });
  const res = await (worker as any).fetch(fsReq, { AI: suiteAI() });
  const data = await res.json();
  const c1 = data?.evaluations?.find((e: any) => e.caseId === 'case-1');
  const c2 = data?.evaluations?.find((e: any) => e.caseId === 'case-2');
  const c3 = data?.evaluations?.find((e: any) => e.caseId === 'case-3');
  const c4 = data?.evaluations?.find((e: any) => e.caseId === 'case-4');
  if (!c1 || !c2 || !c3 || !c4) return `evaluations tidak lengkap: ${JSON.stringify(data)}`;

  // Kontrol positif: case-1 harus valid
  if (c1.unobserved === true) return `kontrol positif gagal: case-1 valid ditandai unobserved=true`;
  if (c1.aiScore !== 0.92) return `kontrol positif gagal: case-1 aiScore ${c1.aiScore} !== 0.92`;

  // Negatif: case-2 (null), case-3 (string), case-4 (hilang) harus unobserved dan tidak punya aiScore numerik
  for (const [c, label] of [[c2, 'case-2 (skor null)'], [c3, 'case-3 (skor string non-numerik)'], [c4, 'case-4 (kasus hilang)']] as const) {
    if (c.unobserved !== true) return `${label} tidak ditandai unobserved=true: ${JSON.stringify(c)}`;
    if (typeof c.aiScore === 'number' && Number.isFinite(c.aiScore)) return `${label} memuat aiScore numerik rekaan: ${c.aiScore}`;
  }
  return null;
});

// ---------- G10: table-driven 4 endpoint x 3 mode kegagalan ⇒ unobserved tanpa skor numerik ----------
gate('G10', 'table-driven: 4 endpoint x 3 mode kegagalan ⇒ unobserved tanpa field skor numerik', async () => {
  const failureModes = [
    { name: 'binding hilang', env: {} },
    { name: 'model melempar error', env: { AI: { run: async () => { throw new Error('Workers AI crashed'); } } } },
    { name: 'keluaran tak terparse', env: { AI: { run: async () => ({ response: '<<<NOT VALID JSON>>>' }) } } },
  ];

  const endpoints = [
    {
      name: '/diagnose/feynman',
      type: 'single' as const,
      req: () => new Request('https://x/api/diagnose/feynman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptName: 'Buoyancy', studentExplanation: 'Penjelasan' }),
      }),
    },
    {
      name: '/tutor/socratic',
      type: 'single' as const,
      req: () => new Request('https://x/api/tutor/socratic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: 'Buoyancy', studentMessage: 'Halo' }),
      }),
    },
    {
      name: '/benchmark/central-hypothesis',
      type: 'batch' as const,
      req: () => new Request('https://x/api/benchmark/central-hypothesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'test',
          items: [{ id: 'i1', prompt: 'p', childUtterance: 'u' }],
        }),
      }),
    },
    {
      name: '/benchmark/feynman-suite',
      type: 'batch' as const,
      req: () => new Request('https://x/api/benchmark/feynman-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'test',
          cases: [{ id: 'c1', conceptName: 'C', childUtterance: 'u' }],
        }),
      }),
    },
  ];

  for (const ep of endpoints) {
    for (const mode of failureModes) {
      const res = await (worker as any).fetch(ep.req(), mode.env);
      const label = `${ep.name} [${mode.name}]`;

      if (ep.type === 'single') {
        if (res.status !== 503) {
          return `${label}: status=${res.status} (diharapkan 503 Service Unavailable)`;
        }
        const body = await res.json().catch(() => null);
        if (!body || body.unobserved !== true) {
          return `${label}: respons tidak memuat unobserved=true: ${JSON.stringify(body)}`;
        }
        const numFields = ['conceptualUnderstanding', 'causalReasoning', 'transferScore']
          .filter((k) => typeof body[k] === 'number' || typeof body?.feynmanDiagnosis?.[k] === 'number');
        if (numFields.length) {
          return `${label}: memuat field numerik rekaan: ${numFields.join(', ')}`;
        }
      } else {
        // Batch endpoint
        const body = await res.json().catch(() => null);
        if (!body) return `${label}: body kosong`;
        if (body.unobserved !== true && res.status !== 503) {
          // Check if items inside are marked unobserved
          const items = body.results || body.evaluations || [];
          for (const it of items) {
            const probes = it.base ? [it.base, it.layer0, it.layer1, it.layer2] : [it];
            for (const p of probes) {
              if (p && p.unobserved !== true) {
                return `${label}: probe/kasus tidak ditandai unobserved=true: ${JSON.stringify(p)}`;
              }
              const scores = [p?.structuralMasteryScore, p?.aiScore].filter((x) => typeof x === 'number');
              if (scores.length) {
                return `${label}: probe memuat skor numerik rekaan: ${scores.join(', ')}`;
              }
            }
          }
        }
      }
    }
  }
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

// ---------- G12: emptyLearnerState() helper menggantikan literal karangan & bebas pencemaran || 0.x / ?? 0.x di App.tsx ----------
gate('G12', 'emptyLearnerState() helper tunggal & audit kepatuhan App.tsx (tanpa || 0.x / ?? 0.x / literal karangan)', async () => {
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

  // 1. Memeriksa bahwa emptyLearnerState benar-benar diimpor dan dipakai
  if (!appSrc.includes('emptyLearnerState')) {
    return 'App.tsx belum mengimpor atau menggunakan emptyLearnerState';
  }

  // 2. Tidak boleh ada literal mastery buatan (mis. recognition: 0.8 atau recognition: 1)
  if (/recognition:\s*(?:0\.[1-9]|1(?:\.0)?)/.test(appSrc)) {
    return 'App.tsx masih memuat literal state karangan (recognition: > 0)';
  }

  // 3. Tidak boleh ada fallback || 0.x atau ?? 0.x pada kalkulasi penguasaan/peluruhan
  const fallbackMatches = appSrc.match(/(?:\|\||\?\?)\s*0\.[0-9]+/g);
  if (fallbackMatches && fallbackMatches.length > 0) {
    return `App.tsx masih menggunakan fallback (${fallbackMatches.join(', ')}) yang menelan angka 0 menjadi baseline default`;
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
