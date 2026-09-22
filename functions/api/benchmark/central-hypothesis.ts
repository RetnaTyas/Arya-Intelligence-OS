import { CloudflareEnv, getWorkersAIBinding, DEFAULT_WORKERS_AI_MODEL, extractJsonFromText } from '../../types.ts';

export const onRequestPost = async (context: { request: Request; env: CloudflareEnv }) => {
  const { request, env } = context;

  try {
    const body: any = await request.json();
    const { items } = body;
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

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Array of benchmark items required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemInstruction = `
You are the Cognitive Epistemic Assessor evaluating student utterances against Gold Standard Human Expert Benchmarks in Personal Intelligence OS (Tahap 2 Central Hypothesis Test).
For each item, analyze the student's utterance. You must determine:
1. hasMisconception: boolean
2. misconceptionName: string (describe the detected misconception or state "None")
3. structuralMasteryScore: number between 0.00 and 1.00 (evaluate deep causal understanding vs superficial rote recitation)
4. explanation: concise analytical rationale (2-3 sentences max)

Output strictly a JSON array of objects with the exact structure:
[
  {
    "itemId": string,
    "hasMisconception": boolean,
    "misconceptionName": string,
    "structuralMasteryScore": number,
    "explanation": string
  }
]
`;

    const promptItems = items.map((it: any) => ({
      itemId: it.id,
      domain: it.domain,
      prompt: it.prompt,
      studentUtterance: it.childUtterance,
    }));

    const response: any = await aiBinding.run(model, {
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Evaluasi benchmark kasus berikut:\n${JSON.stringify(promptItems)}` },
      ],
      temperature: 0.1,
    });

    const rawData = response?.response !== undefined ? response?.response : (response?.result?.response !== undefined ? response?.result?.response : (response?.result !== undefined ? response.result : response));
    const parsedArray = extractJsonFromText(rawData);

    if (!Array.isArray(parsedArray)) {
      const debugPreview = typeof rawData === 'object' ? JSON.stringify(rawData) : String(rawData || '');
      throw new Error(`Workers AI (${model}) tidak mengembalikan array JSON benchmark valid: "${debugPreview.slice(0, 100)}..."`);
    }

    const results = items.map((item: any) => {
      const found = parsedArray.find((p: any) => p.itemId === item.id);
      if (!found) {
        throw new Error(`Item ${item.id} tidak ditemukan dalam respons Workers AI.`);
      }
      return {
        itemId: item.id,
        aiDiagnosis: {
          hasMisconception: Boolean(found.hasMisconception),
          misconceptionName: found.misconceptionName || 'Tidak teridentifikasi',
          structuralMasteryScore: typeof found.structuralMasteryScore === 'number' ? Math.min(1, Math.max(0, found.structuralMasteryScore)) : 0.5,
          explanation: found.explanation || `Analisis inferensi Pages Functions Workers AI binding (AiOS AI: ${model}).`,
        },
        source: `cloudflare-workers-ai (${model})`,
      };
    });

    return new Response(
      JSON.stringify({
        results,
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
