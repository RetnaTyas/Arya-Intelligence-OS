import {
  CloudflareEnv,
  getWorkersAIBinding,
  DEFAULT_WORKERS_AI_MODEL,
  extractJsonFromText,
  generateLocalFeynmanDiagnosis,
} from '../../types.ts';

export const onRequestPost = async (context: { request: Request; env: CloudflareEnv }) => {
  const { request, env } = context;

  // 1. Service Binding Forwarding to arya-ai-gateway Worker
  if (env.AI_GATEWAY && typeof env.AI_GATEWAY.fetch === 'function') {
    return await env.AI_GATEWAY.fetch(request);
  }

  // 2. Direct Binding Fallback
  try {
    const body: any = await request.json();
    const conceptName = body.conceptName || body.concept || 'Konsep Umum';
    const studentExplanation = body.studentExplanation || body.childUtterance || body.explanation || '';
    const expectedPrinciple = body.expectedPrinciple || 'Fundamental causal mechanism';
    const aiBinding = getWorkersAIBinding(env);
    const model = env.CLOUDFLARE_AI_MODEL || DEFAULT_WORKERS_AI_MODEL;

    if (!aiBinding) {
      return new Response(
        JSON.stringify({
          error: 'Cloudflare Workers AI binding "AiOS AI" tidak ditemukan pada Pages Functions context.',
          source: 'cloudflare-workers-ai-error',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemInstruction = `
You are the Feynman Sensor in Personal Intelligence OS.
Analyze the student's verbal explanation of a concept.
You must output strictly JSON matching this structure:
{
  "conceptualUnderstanding": number (0.0 to 1.0),
  "causalReasoning": number (0.0 to 1.0),
  "transferScore": number (0.0 to 1.0),
  "analogyDetected": boolean,
  "misconceptions": string[],
  "feedbackSummary": string,
  "nextBestProbe": string
}

Concept: "${conceptName}"
Expected Principle: "${expectedPrinciple || 'Fundamental causal mechanism'}"
Do not output markdown codeblocks or extra conversational filler, output clean JSON.
`;

    const response: any = await aiBinding.run(model, {
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Analisis penjelasan siswa berikut ini:\n"${studentExplanation}"` },
      ],
      temperature: 0.1,
    });

    const rawData = response?.response !== undefined ? response?.response : (response?.result?.response !== undefined ? response?.result?.response : (response?.result !== undefined ? response.result : response));
    const parsed = extractJsonFromText(rawData);

    if (!parsed || typeof parsed !== 'object' || (typeof parsed.conceptualUnderstanding !== 'number' && typeof parsed.score !== 'number')) {
      const local = generateLocalFeynmanDiagnosis(conceptName, studentExplanation);
      return new Response(
        JSON.stringify({
          ...local,
          feynmanDiagnosis: {
            conceptualUnderstanding: local.conceptualUnderstanding,
            causalReasoning: local.causalReasoning,
            transferScore: local.transferScore,
            diagnosisExplanation: local.feedbackSummary,
            misconceptions: local.misconceptions,
          },
          usedFallback: true,
          source: 'deterministic-local-heuristic',
          fallbackReason: 'Respons Cloudflare Workers AI tidak berupa JSON valid atau tidak memuat skor pemahaman; dievaluasi menggunakan sensor heuristik lokal.',
          binding: 'AiOS AI',
          model,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // KATEGORI "TIDAK ADA": field yang tidak dikembalikan model TIDAK boleh diciptakan engine.
    // Field hilang → undefined (kunci JSON hilang) + dicatat di unobservedFields (masukan Evidence Debt §7).
    const num01 = (v: unknown): number | undefined =>
      typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : undefined;
    const conceptualUnderstanding = num01(parsed.conceptualUnderstanding) ?? num01(parsed.score);
    const causalReasoning = num01(parsed.causalReasoning);
    const transferScore = num01(parsed.transferScore);
    const unobservedFields = [
      conceptualUnderstanding === undefined ? 'conceptualUnderstanding' : null,
      causalReasoning === undefined ? 'causalReasoning' : null,
      transferScore === undefined ? 'transferScore' : null,
    ].filter(Boolean);

    return new Response(
      JSON.stringify({
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
        usedFallback: false,
        source: `cloudflare-workers-ai (${model})`,
        binding: 'AiOS AI',
        model,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: `Cloudflare Workers AI Error: ${error.message}`,
        source: 'cloudflare-workers-ai-error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
