// Worker: arya-ai-gateway
// Private AI Gateway backend with Workers AI native binding for Personal Intelligence OS
// Called via Service Binding from Cloudflare Pages Functions (no public internet exposure)

import { extractJsonFromText, extractBenchmarkArray } from './lib/json-extract';
import { generateLocalProbeDiagnosis, generateLocalFeynmanDiagnosis } from './lib/fallback-heuristics';

export interface Env {
  AI: {
    run: (model: string, input: any) => Promise<any>;
  };
  AI_MODEL?: string;
  GATEWAY_AUTH_KEY?: string;
}

export const DEFAULT_AI_MODEL = '@cf/qwen/qwen3-30b-a3b-fp8';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const model = env.AI_MODEL || DEFAULT_AI_MODEL;

    // Optional internal service key verification if set
    if (env.GATEWAY_AUTH_KEY) {
      const authHeader = request.headers.get('X-Gateway-Auth');
      if (authHeader !== env.GATEWAY_AUTH_KEY) {
        return new Response(JSON.stringify({ error: 'Unauthorized gateway invocation' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // CORS for internal routing
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Gateway-Auth',
        },
      });
    }

    // Helper JSON response
    const json = (data: any, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    };

    try {
      // 1. Health Route: /health or /api/health
      if (pathname === '/health' || pathname === '/api/health') {
        const hasBinding = Boolean(env.AI && typeof env.AI.run === 'function');
        return json({
          status: 'ok',
          service: 'arya-ai-gateway',
          runtime: 'Cloudflare Worker (Service Binding Target)',
          hasAiBinding: hasBinding,
          bindingName: 'AI',
          model,
          isPubliclyExposed: false,
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Socratic Tutor: /tutor/socratic or /api/tutor/socratic
      if ((pathname === '/tutor/socratic' || pathname === '/api/tutor/socratic') && request.method === 'POST') {
        const body: any = await request.json();
        const { concept, studentMessage, history, learnerState } = body;

        if (!env.AI) {
          return json({
            message: `[Gateway Offline Heuristic]: Bagaimana menurutmu relasi sebab-akibat pada konsep ${concept || 'ini'}?`,
            usedFallback: true,
            source: 'deterministic-local-heuristic',
          });
        }

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
        (history || []).forEach((h: any) => {
          messages.push({
            role: h.role === 'student' ? 'user' : 'assistant',
            content: h.text,
          });
        });
        messages.push({
          role: 'user',
          content: studentMessage || 'Halo, saya ingin memahami konsep ini.',
        });

        const response: any = await env.AI.run(model, { messages, temperature: 0.7 });
        const replyText = response?.response || response?.result?.response || '';
        return json({
          message: replyText || 'Mari kita telusuri prinsip dasarnya bersama-sama.',
          source: `cloudflare-workers-ai (${model})`,
          usedFallback: false,
        });
      }

      // 3. Feynman Diagnosis: /diagnose/feynman or /api/diagnose/feynman
      if ((pathname === '/diagnose/feynman' || pathname === '/api/diagnose/feynman') && request.method === 'POST') {
        const body: any = await request.json();
        const { conceptName, studentExplanation, expectedPrinciple } = body;

        if (!env.AI) {
          const local = generateLocalFeynmanDiagnosis(conceptName, studentExplanation);
          return json(local);
        }

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
        try {
          const prompt = `Analisis penjelasan siswa berikut ini:\n"${studentExplanation}"`;
          const reply: any = await env.AI.run(model, {
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: prompt },
            ],
            temperature: 0.1,
          });

          const rawData = reply?.response || reply?.result?.response || reply;
          const parsed = extractJsonFromText(rawData);
          if (parsed && typeof parsed === 'object') {
            const conceptualUnderstanding = typeof parsed.conceptualUnderstanding === 'number'
              ? Math.min(1, Math.max(0, parsed.conceptualUnderstanding))
              : (typeof parsed.score === 'number' ? Math.min(1, Math.max(0, parsed.score)) : 0.75);
            const causalReasoning = typeof parsed.causalReasoning === 'number'
              ? Math.min(1, Math.max(0, parsed.causalReasoning))
              : 0.70;
            const transferScore = typeof parsed.transferScore === 'number'
              ? Math.min(1, Math.max(0, parsed.transferScore))
              : 0.65;

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
              usedFallback: false,
              source: `cloudflare-workers-ai (${model})`,
            });
          }
        } catch (err: any) {
          console.warn('Gateway diagnosis error, fallback to local:', err?.message);
        }

        const local = generateLocalFeynmanDiagnosis(conceptName, studentExplanation);
        return json(local);
      }

      // 4. Central Hypothesis Benchmark: /benchmark/central-hypothesis or /api/benchmark/central-hypothesis
      if ((pathname === '/benchmark/central-hypothesis' || pathname === '/api/benchmark/central-hypothesis') && request.method === 'POST') {
        const body: any = await request.json();
        const items = body?.items;
        if (!Array.isArray(items) || items.length === 0) {
          return json({ error: 'Array of benchmark items required' }, 400);
        }

        const allPromptRows = items.flatMap((it: any) => [
          {
            probeId: `${it.id}::base`,
            probeGroupId: it.id,
            prompt: it.prompt,
            studentUtterance: it.childUtterance,
          },
          {
            probeId: `${it.id}::layer0`,
            probeGroupId: it.id,
            prompt: it.perturbations?.layer0?.prompt || it.prompt,
            studentUtterance: it.perturbations?.layer0?.childUtterance || it.childUtterance,
          },
          {
            probeId: `${it.id}::layer1`,
            probeGroupId: it.id,
            prompt: it.perturbations?.layer1?.prompt || it.prompt,
            studentUtterance: it.perturbations?.layer1?.childUtterance || it.childUtterance,
          },
          {
            probeId: `${it.id}::layer2`,
            probeGroupId: it.id,
            prompt: it.perturbations?.layer2?.prompt || it.prompt,
            studentUtterance: it.perturbations?.layer2?.childUtterance || it.childUtterance,
          },
        ]);

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

        let allParsed: any[] = [];
        if (env.AI) {
          const CHUNK_SIZE = 4;
          const chunks: any[][] = [];
          for (let i = 0; i < allPromptRows.length; i += CHUNK_SIZE) {
            chunks.push(allPromptRows.slice(i, i + CHUNK_SIZE));
          }

          const chunkResults = await Promise.all(
            chunks.map(async (chunk) => {
              try {
                const response: any = await env.AI.run(model, {
                  messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: `Evaluasi setiap probe berikut secara independen. Kembalikan HANYA array JSON murni:\n${JSON.stringify(chunk)}` },
                  ],
                  temperature: 0.1,
                });
                const rawData = response?.response || response?.result?.response || response;
                const parsed = extractBenchmarkArray(rawData);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  return parsed.map((p: any) => ({
                    ...p,
                    usedFallback: false,
                    source: `cloudflare-workers-ai (${model})`,
                  }));
                }
              } catch (chunkErr: any) {
                console.warn('Gateway chunk error, local fallback:', chunkErr?.message);
              }
              return chunk.map((p: any) => ({
                probeId: p.probeId,
                ...generateLocalProbeDiagnosis(p.probeId, p.prompt, p.studentUtterance),
              }));
            })
          );
          allParsed = chunkResults.flat();
        } else {
          allParsed = allPromptRows.map((r: any) => ({
            probeId: r.probeId,
            ...generateLocalProbeDiagnosis(r.probeId, r.prompt, r.studentUtterance),
          }));
        }

        let totalFallbackProbes = 0;
        const totalExpectedProbes = items.length * 4;

        const results = items.map((item: any) => {
          const get = (suffix: string) => {
            const probeKey = `${item.id}::${suffix}`;
            const found = allParsed.find((p: any) => p && p.probeId === probeKey);
            if (!found) {
              totalFallbackProbes += 1;
              return generateLocalProbeDiagnosis(probeKey, item.prompt, item.childUtterance);
            }
            const isFallback = Boolean(found.usedFallback === true);
            if (isFallback) totalFallbackProbes += 1;
            return {
              hasMisconception: Boolean(found.hasMisconception === true || found.hasMisconception === 'true' || found.hasMisconception === 1),
              misconceptionName: found.misconceptionName || 'None',
              structuralMasteryScore: typeof found.structuralMasteryScore === 'number'
                ? Math.min(1, Math.max(0, found.structuralMasteryScore))
                : 0.5,
              explanation: found.explanation || `Evaluasi probe ${probeKey}`,
              usedFallback: isFallback,
              source: isFallback ? 'deterministic-local-lookup' : (found.source || `cloudflare-workers-ai (${model})`),
              fallbackReason: isFallback ? (found.fallbackReason || 'Model inference unparseable') : undefined,
            };
          };

          const baseProbe = get('base');
          const layer0Probe = get('layer0');
          const layer1Probe = get('layer1');
          const layer2Probe = get('layer2');
          const itemUsedFallback = Boolean(baseProbe.usedFallback || layer0Probe.usedFallback || layer1Probe.usedFallback || layer2Probe.usedFallback);

          return {
            itemId: item.id,
            base: baseProbe,
            layer0: layer0Probe,
            layer1: layer1Probe,
            layer2: layer2Probe,
            usedFallback: itemUsedFallback,
            source: itemUsedFallback ? 'deterministic-local-lookup' : `cloudflare-workers-ai (${model})`,
          };
        });

        const overallSource = totalFallbackProbes === 0
          ? `cloudflare-workers-ai (${model})`
          : totalFallbackProbes === totalExpectedProbes
          ? 'deterministic-local-lookup'
          : `hybrid (${totalExpectedProbes - totalFallbackProbes} AI, ${totalFallbackProbes} fallback)`;

        return json({
          results,
          source: overallSource,
          usedFallback: totalFallbackProbes > 0,
          fallbackCount: totalFallbackProbes,
          totalProbes: totalExpectedProbes,
        });
      }

      // 5. Feynman Suite Benchmark: /benchmark/feynman-suite or /api/benchmark/feynman-suite
      if ((pathname === '/benchmark/feynman-suite' || pathname === '/api/benchmark/feynman-suite') && request.method === 'POST') {
        const body: any = await request.json();
        const cases = body?.cases;
        if (!Array.isArray(cases) || cases.length === 0) {
          return json({ error: 'Array of benchmark cases required' }, 400);
        }

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

        let evaluations: any[] = [];
        if (env.AI) {
          try {
            const prompt = `Evaluasi kasus-kasus berikut:\n${JSON.stringify(cases.map((c: any) => ({ caseId: c.id, concept: c.conceptName, utterance: c.childUtterance })))}`;
            const response: any = await env.AI.run(model, {
              messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: prompt },
              ],
              temperature: 0.1,
            });
            const rawData = response?.response || response?.result?.response || response;
            const parsed = extractBenchmarkArray(rawData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              evaluations = parsed.map((p: any) => ({
                caseId: p.caseId,
                aiScore: typeof p.aiScore === 'number' ? Math.min(1, Math.max(0, p.aiScore)) : 0.7,
                explanation: p.explanation || 'Evaluasi AI berhasil.',
                detectedMisconceptions: Array.isArray(p.detectedMisconceptions) ? p.detectedMisconceptions : [],
                usedFallback: false,
                source: `cloudflare-workers-ai (${model})`,
              }));
            }
          } catch (err: any) {
            console.warn('Gateway feynman suite error, fallback:', err?.message);
          }
        }

        if (evaluations.length === 0) {
          evaluations = cases.map((c: any) => {
            const local = generateLocalFeynmanDiagnosis(c.conceptName, c.childUtterance);
            return {
              caseId: c.id,
              aiScore: local.conceptualUnderstanding,
              explanation: local.feedbackSummary,
              detectedMisconceptions: local.misconceptions,
              usedFallback: true,
              source: 'deterministic-local-heuristic',
              fallbackReason: 'AI model invocation unavailable, local heuristic applied',
            };
          });
        }

        const fallbackCount = evaluations.filter((e: any) => e.usedFallback).length;
        return json({
          evaluations,
          source: fallbackCount === 0 ? `cloudflare-workers-ai (${model})` : (fallbackCount === cases.length ? 'deterministic-local-heuristic' : 'hybrid'),
          usedFallback: fallbackCount > 0,
          fallbackCount,
          totalCases: cases.length,
        });
      }

      return json({ error: `Not found: ${pathname}` }, 404);
    } catch (err: any) {
      return json({ error: err?.message || 'Internal gateway error' }, 500);
    }
  },
};
