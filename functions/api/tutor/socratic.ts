import { CloudflareEnv, getWorkersAIBinding, DEFAULT_WORKERS_AI_MODEL } from '../../types.ts';

export const onRequestPost = async (context: { request: Request; env: CloudflareEnv }) => {
  const { request, env } = context;

  try {
    const body: any = await request.json();
    const { concept, studentMessage, history, learnerState } = body;
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

    const messages = [
      { role: 'system', content: systemInstruction },
    ];

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

    const response: any = await aiBinding.run(model, {
      messages,
      temperature: 0.7,
    });

    const replyText = response?.response || response?.result?.response || '';
    if (!replyText) {
      throw new Error(`Workers AI (${model}) mengembalikan respons kosong.`);
    }

    return new Response(
      JSON.stringify({
        text: replyText,
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
