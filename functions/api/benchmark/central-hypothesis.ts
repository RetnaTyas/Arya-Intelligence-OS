import {
  CloudflareEnv,
  getWorkersAIBinding,
  DEFAULT_WORKERS_AI_MODEL,
  extractBenchmarkArray,
  generateLocalProbeDiagnosis,
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

    // Chunk into batches of 4 probes (1 item = 4 probes per chunk) to avoid LLM token limits and formatting glitches
    const CHUNK_SIZE = 4;
    const chunks: any[][] = [];
    for (let i = 0; i < allPromptRows.length; i += CHUNK_SIZE) {
      chunks.push(allPromptRows.slice(i, i + CHUNK_SIZE));
    }

    const chunkResults = await Promise.all(
      chunks.map(async (chunk) => {
        try {
          const response: any = await aiBinding.run(model, {
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: `Evaluasi setiap probe berikut secara independen. Kembalikan HANYA array JSON murni [ ... ] tanpa teks pembungkus tambahan:\n${JSON.stringify(chunk)}` },
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

          const parsed = extractBenchmarkArray(rawData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((p: any) => ({
              ...p,
              usedFallback: false,
              source: `cloudflare-workers-ai (${model})`,
            }));
          }

          // Fallback heuristic for this chunk if AI returned non-array
          console.warn('AI did not return valid array, marking fallback for chunk');
          return chunk.map((p: any) => ({
            probeId: p.probeId,
            ...generateLocalProbeDiagnosis(p.probeId, p.prompt, p.studentUtterance),
          }));
        } catch (chunkErr: any) {
          console.warn('Chunk evaluation error, fallback local:', chunkErr?.message);
          return chunk.map((p: any) => ({
            probeId: p.probeId,
            ...generateLocalProbeDiagnosis(p.probeId, p.prompt, p.studentUtterance),
          }));
        }
      })
    );

    const allParsed = chunkResults.flat();
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
        if (isFallback) {
          totalFallbackProbes += 1;
        }

        return {
          hasMisconception: Boolean(found.hasMisconception === true || found.hasMisconception === 'true' || found.hasMisconception === 1),
          misconceptionName: found.misconceptionName || 'None',
          structuralMasteryScore: typeof found.structuralMasteryScore === 'number'
            ? Math.min(1, Math.max(0, found.structuralMasteryScore))
            : (!isNaN(Number(found.structuralMasteryScore)) ? Math.min(1, Math.max(0, Number(found.structuralMasteryScore))) : 0.5),
          explanation: found.explanation || (isFallback
            ? `Evaluasi fallback lokal probe ${probeKey}.`
            : `Analisis inferensi probe ${probeKey} (AiOS AI: ${model}).`),
          usedFallback: isFallback,
          source: isFallback ? 'deterministic-local-lookup' : `cloudflare-workers-ai (${model})`,
          fallbackReason: isFallback ? (found.fallbackReason || 'Model inference failed or unparseable') : undefined,
        };
      };

      const baseProbe = get('base');
      const layer0Probe = get('layer0');
      const layer1Probe = get('layer1');
      const layer2Probe = get('layer2');
      const itemUsedFallback = Boolean(
        baseProbe.usedFallback || layer0Probe.usedFallback || layer1Probe.usedFallback || layer2Probe.usedFallback
      );

      return {
        itemId: item.id,
        base: baseProbe,
        layer0: layer0Probe,
        layer1: layer1Probe,
        layer2: layer2Probe,
        usedFallback: itemUsedFallback,
        source: itemUsedFallback
          ? 'deterministic-local-lookup'
          : `cloudflare-workers-ai (${model})`,
      };
    });

    const overallSource = totalFallbackProbes === 0
      ? `cloudflare-workers-ai (${model})`
      : totalFallbackProbes === totalExpectedProbes
      ? 'deterministic-local-lookup'
      : `hybrid (${totalExpectedProbes - totalFallbackProbes} AI, ${totalFallbackProbes} fallback)`;

    return new Response(
      JSON.stringify({
        results,
        source: overallSource,
        usedFallback: totalFallbackProbes > 0,
        fallbackCount: totalFallbackProbes,
        totalProbes: totalExpectedProbes,
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
