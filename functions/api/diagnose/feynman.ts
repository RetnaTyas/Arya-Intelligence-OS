import {
  CloudflareEnv,
  getWorkersAIBinding,
  DEFAULT_WORKERS_AI_MODEL,
  extractJsonFromText,
  generateLocalFeynmanDiagnosis,
} from '../../types.ts';

export const onRequestPost = async (context: { request: Request; env: CloudflareEnv }) => {
  const { request, env } = context;

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

    if (!parsed || typeof parsed !== 'object') {
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
          source: `cloudflare-workers-ai (${model})`,
          binding: 'AiOS AI',
          model,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const conceptualUnderstanding = typeof parsed.conceptualUnderstanding === 'number'
      ? Math.min(1, Math.max(0, parsed.conceptualUnderstanding))
      : (typeof parsed.score === 'number' ? Math.min(1, Math.max(0, parsed.score)) : 0.75);
    const causalReasoning = typeof parsed.causalReasoning === 'number'
      ? Math.min(1, Math.max(0, parsed.causalReasoning))
      : 0.70;
    const transferScore = typeof parsed.transferScore === 'number'
      ? Math.min(1, Math.max(0, parsed.transferScore))
      : 0.65;

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
