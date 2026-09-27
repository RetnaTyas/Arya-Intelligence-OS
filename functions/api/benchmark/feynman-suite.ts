import {
  CloudflareEnv,
  getWorkersAIBinding,
  DEFAULT_WORKERS_AI_MODEL,
  extractBenchmarkArray,
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
    const { cases } = body;
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

    if (!Array.isArray(cases) || cases.length === 0) {
      return new Response(JSON.stringify({ error: 'Array of benchmark cases required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemInstruction = `
You are the Feynman Sensor in Personal Intelligence OS performing calibration against human pedagogical experts.
Evaluate each child's explanation:
1. Distinguish rote buzzword dropping from true causal mechanism. A child using big words without explaining cause-and-effect should receive a LOW score (0.2-0.4).
2. A child using simple everyday words who clearly grasps physical/mathematical conservation or causal displacement should receive a HIGH score (0.85-0.98).
3. Detect centration or procedural rule-following without relational invariants.

Output strictly a JSON array matching:
[
  {
    "caseId": string,
    "aiScore": number (0.00 to 1.00),
    "aiLabel": string,
    "aiReasoning": string
  }
]
`;

    const promptData = cases.map((c: any) => ({
      caseId: c.id,
      conceptName: c.conceptName,
      category: c.category,
      childUtterance: c.childUtterance,
    }));

    const response: any = await aiBinding.run(model, {
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Kalibrasi kasus Feynman berikut. Kembalikan HANYA array JSON [ ... ]:\n${JSON.stringify(promptData)}` },
      ],
      temperature: 0.1,
    });

    const rawData = response?.response !== undefined ? response?.response : (response?.result?.response !== undefined ? response?.result?.response : (response?.result !== undefined ? response.result : response));
    const parsedArray = extractBenchmarkArray(rawData);

    let fallbackCount = 0;
    const totalCases = cases.length;

    const evaluations = cases.map((c: any) => {
      const match = Array.isArray(parsedArray) ? parsedArray.find((p: any) => p && (p.caseId === c.id || p.id === c.id)) : null;
      if (!match) {
        fallbackCount += 1;
        const local = generateLocalFeynmanDiagnosis(c.conceptName, c.childUtterance);
        return {
          caseId: c.id,
          aiScore: local.conceptualUnderstanding,
          aiLabel: local.misconceptions.length > 0 ? 'Miskonsepsi' : 'Pemahaman Kausal',
          aiReasoning: local.feedbackSummary,
          usedFallback: true,
          source: 'deterministic-local-heuristic',
          fallbackReason: local.fallbackReason,
        };
      }
      const rawScore = match.aiScore !== undefined ? match.aiScore : match.score;
      const scoreNum = typeof rawScore === 'number' ? rawScore : Number(rawScore);
      return {
        caseId: c.id,
        aiScore: !isNaN(scoreNum) ? Math.min(1, Math.max(0, scoreNum)) : 0.75,
        aiLabel: match.aiLabel || match.label || 'Teridentifikasi',
        aiReasoning: match.aiReasoning || match.reasoning || `Inferensi kalibrasi Pages Functions Workers AI binding (AiOS AI: ${model}).`,
        usedFallback: false,
        source: `cloudflare-workers-ai (${model})`,
      };
    });

    const overallSource = fallbackCount === 0
      ? `cloudflare-workers-ai (${model})`
      : fallbackCount === totalCases
      ? 'deterministic-local-heuristic'
      : `hybrid (${totalCases - fallbackCount} AI, ${fallbackCount} fallback)`;

    return new Response(
      JSON.stringify({
        evaluations,
        source: overallSource,
        usedFallback: fallbackCount > 0,
        fallbackCount,
        totalCases,
        binding: 'AiOS AI',
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
