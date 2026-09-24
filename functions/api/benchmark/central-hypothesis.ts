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

    const systemInstruction = `You are the Cognitive Epistemic Assessor evaluating student utterances in Personal Intelligence OS (Tahap 2 Central Hypothesis Test).

Each row below is INDEPENDENT — a separate probe with its own prompt and student utterance.
Diagnose each row purely on its own content. Do NOT let your answer to one row be influenced by your answer to another row, even if they share a probeGroupId (they test the SAME underlying concept from different angles — your job is to answer each fresh, not to make them look consistent).

For each row, determine:
1. hasMisconception: boolean (true if child demonstrates a misconception or incorrect reasoning, false if understanding is structurally sound)
2. misconceptionName: string (describe the detected misconception or state "None")
3. structuralMasteryScore: number between 0.00 and 1.00 (evaluate deep causal understanding vs superficial rote recitation)
4. explanation: concise analytical rationale (1-2 sentences)

Output strictly a JSON array of objects with the exact structure:
[
  {
    "probeId": string,
    "hasMisconception": boolean,
    "misconceptionName": string,
    "structuralMasteryScore": number,
    "explanation": string
  }
]`;

    // Flatten each item into 4 independent probe rows (base, layer0, layer1, layer2)
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

    // Chunk into batches of 3 items (12 probes) to avoid LLM token truncation
    const CHUNK_SIZE = 12;
    const chunks: any[][] = [];
    for (let i = 0; i < allPromptRows.length; i += CHUNK_SIZE) {
      chunks.push(allPromptRows.slice(i, i + CHUNK_SIZE));
    }

    const chunkResults = await Promise.all(
      chunks.map(async (chunk) => {
        const response: any = await aiBinding.run(model, {
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: `Evaluasi setiap probe berikut secara independen:\n${JSON.stringify(chunk)}` },
          ],
          temperature: 0.1,
        });

        const rawData = response?.response !== undefined
          ? response?.response
          : response?.result?.response !== undefined
          ? response?.result?.response
          : response?.result !== undefined
          ? response.result
          : response;

        const parsed = extractJsonFromText(rawData);
        if (!Array.isArray(parsed)) {
          const debugPreview = typeof rawData === 'object' ? JSON.stringify(rawData) : String(rawData || '');
          throw new Error(`Workers AI (${model}) tidak mengembalikan array JSON benchmark valid: "${debugPreview.slice(0, 100)}..."`);
        }
        return parsed;
      })
    );

    const allParsed = chunkResults.flat();

    const results = items.map((item: any) => {
      const get = (suffix: string) => {
        const probeKey = `${item.id}::${suffix}`;
        const found = allParsed.find((p: any) => p.probeId === probeKey);
        if (!found) {
          throw new Error(`Probe ${probeKey} tidak ditemukan dalam respons Workers AI.`);
        }
        return {
          hasMisconception: Boolean(found.hasMisconception),
          misconceptionName: found.misconceptionName || 'None',
          structuralMasteryScore: typeof found.structuralMasteryScore === 'number'
            ? Math.min(1, Math.max(0, found.structuralMasteryScore))
            : 0.5,
          explanation: found.explanation || `Analisis inferensi probe ${probeKey} (AiOS AI: ${model}).`,
        };
      };

      return {
        itemId: item.id,
        base: get('base'),
        layer0: get('layer0'),
        layer1: get('layer1'),
        layer2: get('layer2'),
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
