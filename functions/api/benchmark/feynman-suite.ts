import { CloudflareEnv, getWorkersAIBinding, DEFAULT_WORKERS_AI_MODEL, extractJsonFromText } from '../../types.ts';

export const onRequestPost = async (context: { request: Request; env: CloudflareEnv }) => {
  const { request, env } = context;

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
        { role: 'user', content: `Kalibrasi kasus Feynman berikut:\n${JSON.stringify(promptData)}` },
      ],
      temperature: 0.1,
    });

    const rawData = response?.response !== undefined ? response?.response : (response?.result?.response !== undefined ? response?.result?.response : (response?.result !== undefined ? response.result : response));
    const parsedArray = extractJsonFromText(rawData);

    if (!Array.isArray(parsedArray)) {
      const debugPreview = typeof rawData === 'object' ? JSON.stringify(rawData) : String(rawData || '');
      throw new Error(`Workers AI (${model}) tidak mengembalikan array JSON kalibrasi valid: "${debugPreview.slice(0, 100)}..."`);
    }

    const evaluations = cases.map((c: any) => {
      const match = parsedArray.find((p: any) => p.caseId === c.id);
      if (!match) {
        throw new Error(`Kasus ${c.id} tidak ditemukan dalam evaluasi Workers AI.`);
      }
      return {
        caseId: c.id,
        aiScore: Math.min(1, Math.max(0, match.aiScore)),
        aiLabel: match.aiLabel || 'Teridentifikasi',
        aiReasoning: match.aiReasoning || `Inferensi kalibrasi Pages Functions Workers AI binding (AiOS AI: ${model}).`,
        source: `cloudflare-workers-ai (${model})`,
      };
    });

    return new Response(
      JSON.stringify({
        evaluations,
        source: `cloudflare-workers-ai (${model})`,
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
