import { CloudflareEnv, getWorkersAIBinding, DEFAULT_WORKERS_AI_MODEL } from '../types.ts';

export const onRequestGet = async (context: { env: CloudflareEnv }) => {
  const { env } = context;
  const aiBinding = getWorkersAIBinding(env);
  const activeModel = env.CLOUDFLARE_AI_MODEL || DEFAULT_WORKERS_AI_MODEL;

  return new Response(
    JSON.stringify({
      status: 'ok',
      runtime: 'Cloudflare Pages Functions',
      hasAiBinding: Boolean(aiBinding),
      bindingName: env['AiOS AI'] ? 'AiOS AI' : (env.AI ? 'AI' : 'none'),
      activeModel,
      system: 'Personal Intelligence OS (Cloudflare Pages Functions + Workers AI)',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
};
