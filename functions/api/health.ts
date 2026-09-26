import { CloudflareEnv, getWorkersAIBinding, DEFAULT_WORKERS_AI_MODEL } from '../types.ts';

export const onRequestGet = async (context: { request: Request; env: CloudflareEnv }) => {
  const { request, env } = context;

  // 1. If Service Binding to Worker arya-ai-gateway is configured, forward request
  if (env.AI_GATEWAY && typeof env.AI_GATEWAY.fetch === 'function') {
    try {
      const gwResponse = await env.AI_GATEWAY.fetch(request);
      if (gwResponse.ok) {
        const gwData: any = await gwResponse.json();
        return new Response(
          JSON.stringify({
            ...gwData,
            architecture: 'Pages Functions -> Service Binding -> arya-ai-gateway Worker',
            hasServiceBinding: true,
            status: 'ok',
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    } catch (err: any) {
      console.warn('AI_GATEWAY fetch error:', err?.message);
    }
  }

  // 2. Direct binding fallback if service binding not yet bound
  const aiBinding = getWorkersAIBinding(env);
  const activeModel = env.CLOUDFLARE_AI_MODEL || DEFAULT_WORKERS_AI_MODEL;

  return new Response(
    JSON.stringify({
      status: 'ok',
      runtime: 'Cloudflare Pages Functions',
      hasServiceBinding: Boolean(env.AI_GATEWAY),
      hasAiBinding: Boolean(aiBinding),
      bindingName: env['AiOS AI'] ? 'AiOS AI' : (env.AI ? 'AI' : 'none'),
      activeModel,
      system: 'Personal Intelligence OS (Cloudflare Pages Functions Gateway)',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
};
