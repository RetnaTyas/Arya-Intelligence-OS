import { CloudflareEnv, getWorkersAIBinding, DEFAULT_WORKERS_AI_MODEL } from '../types.ts';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

type GatewayStatus = 'not-bound' | 'ok' | 'invalid-response' | 'unreachable';

export const onRequestGet = async (context: { request: Request; env: CloudflareEnv }) => {
  const { request, env } = context;

  let gatewayStatus: GatewayStatus = 'not-bound';
  let gatewayDetail: string | undefined;

  // 1. Service Binding ke Worker arya-ai-gateway: harus benar-benar dibuktikan sehat,
  //    bukan sekadar "binding ada". Worker template "Hello world" membalas 200 text/plain,
  //    jadi wajib dicek content-type DAN identitas service di body JSON.
  if (env.AI_GATEWAY && typeof env.AI_GATEWAY.fetch === 'function') {
    try {
      const gwResponse = await env.AI_GATEWAY.fetch(request);
      const contentType = gwResponse.headers.get('content-type') || '';

      if (gwResponse.ok && contentType.includes('application/json')) {
        const gwData: any = await gwResponse.json();
        if (gwData && gwData.service === 'arya-ai-gateway') {
          return new Response(
            JSON.stringify({
              ...gwData,
              architecture: 'Pages Functions -> Service Binding -> arya-ai-gateway Worker',
              hasServiceBinding: true,
              gatewayStatus: 'ok',
              status: 'ok',
            }),
            { headers: JSON_HEADERS }
          );
        }
        gatewayStatus = 'invalid-response';
        gatewayDetail = 'Balasan JSON diterima tetapi bukan dari arya-ai-gateway.';
      } else {
        gatewayStatus = 'invalid-response';
        gatewayDetail = `HTTP ${gwResponse.status}, content-type "${contentType || 'kosong'}". Kemungkinan worker belum ter-deploy dari repo (masih template Hello World).`;
      }
    } catch (err: any) {
      gatewayStatus = 'unreachable';
      gatewayDetail = err?.message || 'Service binding gagal dipanggil.';
      console.warn('AI_GATEWAY fetch error:', gatewayDetail);
    }
  }

  // 2. Fallback: binding Workers AI langsung di Pages (hanya info diagnostik)
  const aiBinding = getWorkersAIBinding(env);
  const activeModel = env.CLOUDFLARE_AI_MODEL || DEFAULT_WORKERS_AI_MODEL;

  return new Response(
    JSON.stringify({
      status: gatewayStatus === 'not-bound' ? 'ok' : 'degraded',
      runtime: 'Cloudflare Pages Functions',
      hasServiceBinding: Boolean(env.AI_GATEWAY),
      gatewayStatus,
      ...(gatewayDetail ? { gatewayDetail } : {}),
      hasAiBinding: Boolean(aiBinding),
      bindingName: env['AiOS AI'] ? 'AiOS AI' : env.AI ? 'AI' : 'none',
      activeModel,
      system: 'Personal Intelligence OS (Cloudflare Pages Functions Gateway)',
    }),
    { headers: JSON_HEADERS }
  );
};
