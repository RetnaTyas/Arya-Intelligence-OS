import { CloudflareEnv, getWorkersAIBinding, DEFAULT_WORKERS_AI_MODEL, extractJsonFromText } from '../../types.ts';

export const onRequestPost = async (context: { request: Request; env: CloudflareEnv }) => {
  const { request, env } = context;

  try {
    const body: any = await request.json();
    const { conceptName, studentExplanation, expectedPrinciple } = body;
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

    const rawText = response?.response || response?.result?.response || '';
    const parsed = extractJsonFromText(rawText);

    if (!parsed || typeof parsed.conceptualUnderstanding !== 'number') {
      throw new Error(`Workers AI (${model}) tidak menghasilkan JSON Feynman yang valid: "${rawText.slice(0, 100)}..."`);
    }

    return new Response(
      JSON.stringify({
        ...parsed,
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
