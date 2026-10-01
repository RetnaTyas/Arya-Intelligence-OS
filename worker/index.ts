// Worker: arya-ai-gateway
// Implementasi TUNGGAL logika inferensi AI untuk Personal Intelligence OS.
// - Satu-satunya jalur model: binding Workers AI `AI` (hanya ada di gateway ini).
// - Dipanggil dari Pages Functions lewat Service Binding `AI_GATEWAY` (tanpa eksposur internet publik).
// - Tidak ada fallback heuristik: bila inferensi tidak tersedia/gagal, hasilnya `unobserved`
//   (HTTP 503 untuk endpoint tunggal; item bertanda unobserved untuk endpoint batch). Tidak pernah ada angka rekaan.

import { extractJsonFromText, extractBenchmarkArray } from './lib/json-extract';

export interface Env {
  AI?: {
    run: (model: string, input: any) => Promise<any>;
  };
  AI_MODEL?: string;
}

export const DEFAULT_AI_MODEL = '@cf/qwen/qwen3-30b-a3b-fp8';

export type UnobservedReason =
  | 'ai_binding_missing'   // binding Workers AI tidak terpasang
  | 'inference_failed'     // model melempar error
  | 'unparseable_output'   // keluaran model tidak bisa diparse / kosong
  | 'model_omitted'        // model tidak mengembalikan item/probe/kasus ini
  | 'invalid_score';       // skor ada tetapi bukan angka terhingga

const REASON_MESSAGE: Record<UnobservedReason, string> = {
  ai_binding_missing: 'Binding Workers AI tidak tersedia; tidak ada diagnosis.',
  inference_failed: 'Inferensi AI gagal; tidak ada diagnosis.',
  unparseable_output: 'Keluaran AI tidak dapat dibaca; tidak ada diagnosis.',
  model_omitted: 'AI tidak mengembalikan hasil untuk item ini; tidak ada diagnosis.',
  invalid_score: 'AI mengembalikan skor yang tidak valid; tidak ada diagnosis.',
};

const unobservedItem = (reason: UnobservedReason) => ({ unobserved: true as const, reason, message: REASON_MESSAGE[reason] });

/** Skor hanya sah bila angka terhingga (null, string, NaN → tidak teramati). Dibatasi ke 0..1. */
const score01 = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : undefined;

const replyText = (reply: any): any => reply?.response || reply?.result?.response || reply;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const aiBinding = env.AI && typeof env.AI.run === 'function' ? env.AI : null;
    const url = new URL(request.url);
    const pathname = url.pathname;
    const model = env.AI_MODEL || DEFAULT_AI_MODEL;
    const source = `cloudflare-workers-ai (${model})`;

    const json = (data: any, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

    /** Endpoint tunggal gagal ⇒ 503 unobserved, tanpa field skor. */
    const unavailable = (reason: UnobservedReason) =>
      json({ ...unobservedItem(reason), source: 'none', model }, 503);

    const readBody = async (): Promise<any | null> => {
      try {
        const b = await request.json();
        return b && typeof b === 'object' ? b : null;
      } catch {
        return null;
      }
    };
    const badRequest = () => json({ error: 'Body JSON tidak valid', reason: 'invalid_json' }, 400);

    try {
      // 1. Health: kesiapan inferensi (bukan sekadar liveness)
      if (pathname === '/health' || pathname === '/api/health') {
        return json({
          status: aiBinding ? 'ok' : 'degraded',
          service: 'arya-ai-gateway',
          hasAiBinding: Boolean(aiBinding),
          model,
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Socratic Tutor
      if ((pathname === '/tutor/socratic' || pathname === '/api/tutor/socratic') && request.method === 'POST') {
        const body = await readBody();
        if (!body) return badRequest();
        const { concept, studentMessage, history, learnerState } = body;
        if (!aiBinding) return unavailable('ai_binding_missing');

        const systemInstruction = `
You are the Socratic Tutor & Feynman Sensor inside the "Personal Intelligence OS".
Your role is NOT to deliver lectures, but to:
1. Ask probing, curiosity-sparking Socratic questions based on the "WHY-first" philosophy (Rules -> Principles -> Derivation).
2. Never just give the final formula. Help the student derive it through thought experiments, causal chains, and predictions.
3. Act as a Feynman Sensor: detect whether the student really understands the mechanism or is just repeating buzzwords.
4. Detect cognitive misconceptions (e.g. confusing mass with density, thinking heavier objects always sink, or treating algebra as 'magic steps').
5. Respond in Indonesian (Bahasa Indonesia) warmly, concisely (2-4 sentences max), accompanied by a provocative question or thought experiment.

Concept context: ${JSON.stringify(concept || 'General')}
Current learner state: ${JSON.stringify(learnerState || {})}
`;
        const messages: any[] = [{ role: 'system', content: systemInstruction }];
        (Array.isArray(history) ? history : []).forEach((h: any) => {
          messages.push({ role: h.role === 'student' ? 'user' : 'assistant', content: h.text });
        });
        messages.push({ role: 'user', content: studentMessage || 'Halo, saya ingin memahami konsep ini.' });

        let reply: any;
        try {
          reply = await aiBinding.run(model, { messages, temperature: 0.7 });
        } catch (err: any) {
          console.warn('Gateway socratic error:', err?.message);
          return unavailable('inference_failed');
        }
        const text = replyText(reply);
        if (typeof text !== 'string' || text.trim() === '') return unavailable('unparseable_output');
        return json({ text, source, model });
      }

      // 3. Feynman Diagnosis
      if ((pathname === '/diagnose/feynman' || pathname === '/api/diagnose/feynman') && request.method === 'POST') {
        const body = await readBody();
        if (!body) return badRequest();
        const { conceptName, studentExplanation, expectedPrinciple } = body;
        if (!aiBinding) return unavailable('ai_binding_missing');

        const systemInstruction = `
You are a Feynman Diagnostic Sensor evaluating children's understanding in the "Personal Intelligence OS".
Evaluate whether the student explanation demonstrates authentic causal understanding or mere buzzword dropping:
- conceptualUnderstanding: 0.0 - 1.0
- causalReasoning: 0.0 - 1.0
- transferScore: 0.0 - 1.0
- analogyDetected: boolean
- misconceptions: string[] (detected misunderstandings)
- feedbackSummary: concise Indonesian summary of their grasp
- nextBestProbe: suggested follow-up Socratic question
Output STRICTLY JSON format:
{
  "conceptualUnderstanding": number,
  "causalReasoning": number,
  "transferScore": number,
  "analogyDetected": boolean,
  "misconceptions": string[],
  "feedbackSummary": string,
  "nextBestProbe": string
}
Concept: "${conceptName}"
Expected Principle: "${expectedPrinciple || ''}"
`;
        let reply: any;
        try {
          const prompt = `Analisis penjelasan siswa berikut ini:\n"${studentExplanation}"`;
          reply = await aiBinding.run(model, {
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: prompt },
            ],
            temperature: 0.1,
          });
        } catch (err: any) {
          console.warn('Gateway diagnosis error:', err?.message);
          return unavailable('inference_failed');
        }

        const parsed = extractJsonFromText(replyText(reply));
        const conceptualUnderstanding = parsed && typeof parsed === 'object'
          ? (score01(parsed.conceptualUnderstanding) ?? score01(parsed.score))
          : undefined;
        // Skor utama tidak teramati ⇒ tidak ada diagnosis sama sekali (tidak ada bagian yang bisa dipercaya).
        if (conceptualUnderstanding === undefined) return unavailable('unparseable_output');

        // KATEGORI "TIDAK ADA": field lain yang tidak dikembalikan model tetap undefined + dicatat di unobservedFields.
        const causalReasoning = score01(parsed.causalReasoning);
        const transferScore = score01(parsed.transferScore);
        const unobservedFields = [
          causalReasoning === undefined ? 'causalReasoning' : null,
          transferScore === undefined ? 'transferScore' : null,
        ].filter(Boolean);

        return json({
          ...parsed,
          conceptualUnderstanding,
          causalReasoning,
          transferScore,
          feynmanDiagnosis: {
            conceptualUnderstanding,
            causalReasoning,
            transferScore,
            diagnosisExplanation: parsed.feedbackSummary || parsed.explanation || 'Diagnosis verbal berhasil dianalisis.',
            misconceptions: Array.isArray(parsed.misconceptions) ? parsed.misconceptions : [],
          },
          unobservedFields,
          source,
        });
      }

      // 4. Central Hypothesis Benchmark
      if ((pathname === '/benchmark/central-hypothesis' || pathname === '/api/benchmark/central-hypothesis') && request.method === 'POST') {
        const body = await readBody();
        if (!body) return badRequest();
        const items = body.items;
        if (!Array.isArray(items) || items.length === 0) {
          return json({ error: 'Array of benchmark items required' }, 400);
        }
        if (!aiBinding) return unavailable('ai_binding_missing');

        const SUFFIXES = ['base', 'layer0', 'layer1', 'layer2'] as const;
        const allPromptRows = items.flatMap((it: any) =>
          SUFFIXES.map((suffix) => {
            const layer = suffix === 'base' ? undefined : it.perturbations?.[suffix];
            return {
              probeId: `${it.id}::${suffix}`,
              probeGroupId: it.id,
              prompt: layer?.prompt || it.prompt,
              studentUtterance: layer?.childUtterance || it.childUtterance,
            };
          })
        );

        const systemInstruction = `You are the Cognitive Epistemic Assessor evaluating student utterances in Personal Intelligence OS (Tahap 2 Central Hypothesis Test).
Each row is INDEPENDENT. Output strictly a JSON array of objects:
[
  {
    "probeId": string,
    "hasMisconception": boolean,
    "misconceptionName": string,
    "structuralMasteryScore": number (0.00 - 1.00),
    "explanation": string
  }
]`;
        // Hasil per probeId: baris dari model (belum divalidasi) atau alasan gagal untuk seluruh chunk.
        const modelRows = new Map<string, any>();
        const chunkFailure = new Map<string, UnobservedReason>();

        const CHUNK_SIZE = 4;
        const chunks: any[][] = [];
        for (let i = 0; i < allPromptRows.length; i += CHUNK_SIZE) chunks.push(allPromptRows.slice(i, i + CHUNK_SIZE));

        await Promise.all(
          chunks.map(async (chunk) => {
            const failChunk = (reason: UnobservedReason) => chunk.forEach((p: any) => chunkFailure.set(p.probeId, reason));
            try {
              const response: any = await aiBinding.run(model, {
                messages: [
                  { role: 'system', content: systemInstruction },
                  { role: 'user', content: `Evaluasi setiap probe berikut secara independen. Kembalikan HANYA array JSON murni:\n${JSON.stringify(chunk)}` },
                ],
                temperature: 0.1,
              });
              const parsed = extractBenchmarkArray(replyText(response));
              if (!Array.isArray(parsed) || parsed.length === 0) return failChunk('unparseable_output');
              const wanted = new Set(chunk.map((p: any) => p.probeId));
              for (const row of parsed) {
                // Hanya probeId yang diminta pada chunk ini; yang pertama menang; id asing diabaikan.
                if (row && wanted.has(row.probeId) && !modelRows.has(row.probeId)) modelRows.set(row.probeId, row);
              }
            } catch (err: any) {
              console.warn('Gateway chunk error:', err?.message);
              failChunk('inference_failed');
            }
          })
        );

        let unobservedCount = 0;
        const probe = (probeKey: string) => {
          const row = modelRows.get(probeKey);
          if (!row) {
            unobservedCount += 1;
            return unobservedItem(chunkFailure.get(probeKey) ?? 'model_omitted');
          }
          const structuralMasteryScore = score01(row.structuralMasteryScore ?? row.score);
          if (structuralMasteryScore === undefined) {
            unobservedCount += 1;
            return unobservedItem('invalid_score');
          }
          return {
            hasMisconception: Boolean(row.hasMisconception === true || row.hasMisconception === 'true' || row.hasMisconception === 1),
            misconceptionName: row.misconceptionName || 'None',
            structuralMasteryScore,
            explanation: row.explanation || `Evaluasi probe ${probeKey}`,
            source,
          };
        };

        const results = items.map((item: any) => ({
          itemId: item.id,
          base: probe(`${item.id}::base`),
          layer0: probe(`${item.id}::layer0`),
          layer1: probe(`${item.id}::layer1`),
          layer2: probe(`${item.id}::layer2`),
        }));

        const totalProbes = items.length * SUFFIXES.length;
        return json({ results, source, unobservedCount, totalProbes });
      }

      // 5. Feynman Suite Benchmark
      if ((pathname === '/benchmark/feynman-suite' || pathname === '/api/benchmark/feynman-suite') && request.method === 'POST') {
        const body = await readBody();
        if (!body) return badRequest();
        const cases = body.cases;
        if (!Array.isArray(cases) || cases.length === 0) {
          return json({ error: 'Array of benchmark cases required' }, 400);
        }
        if (!aiBinding) return unavailable('ai_binding_missing');

        const systemInstruction = `You are the Feynman Sensor in Personal Intelligence OS. Evaluate each child's explanation:
1. Low score (0.2-0.4) for buzzword dropping without mechanism.
2. High score (0.85-0.98) for clear grasp of causal displacement or conservation.
Output STRICTLY JSON array:
[
  {
    "caseId": string,
    "aiScore": number (0.00 - 1.00),
    "explanation": string,
    "detectedMisconceptions": string[]
  }
]`;
        let parsed: any[] | null = null;
        let failure: UnobservedReason = 'unparseable_output';
        try {
          const prompt = `Evaluasi kasus-kasus berikut:\n${JSON.stringify(cases.map((c: any) => ({ caseId: c.id, concept: c.conceptName, utterance: c.childUtterance })))}`;
          const response: any = await aiBinding.run(model, {
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: prompt },
            ],
            temperature: 0.1,
          });
          const arr = extractBenchmarkArray(replyText(response));
          if (Array.isArray(arr) && arr.length > 0) parsed = arr;
        } catch (err: any) {
          console.warn('Gateway feynman suite error:', err?.message);
          failure = 'inference_failed';
        }

        let unobservedCount = 0;
        const evaluations = cases.map((c: any) => {
          if (!parsed) {
            unobservedCount += 1;
            return { caseId: c.id, ...unobservedItem(failure) };
          }
          const row = parsed.find((p: any) => p && p.caseId === c.id);
          if (!row) {
            unobservedCount += 1;
            return { caseId: c.id, ...unobservedItem('model_omitted') };
          }
          const aiScore = score01(row.aiScore);
          if (aiScore === undefined) {
            unobservedCount += 1;
            return { caseId: c.id, ...unobservedItem('invalid_score') };
          }
          return {
            caseId: c.id,
            aiScore,
            explanation: row.explanation || 'Evaluasi AI berhasil.',
            detectedMisconceptions: Array.isArray(row.detectedMisconceptions) ? row.detectedMisconceptions : [],
            source,
          };
        });

        return json({ evaluations, source, unobservedCount, totalCases: cases.length });
      }

      return json({ error: `Not found: ${pathname}` }, 404);
    } catch (err: any) {
      return json({ error: err?.message || 'Internal gateway error' }, 500);
    }
  },
};
