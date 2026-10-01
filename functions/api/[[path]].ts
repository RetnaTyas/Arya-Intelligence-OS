// Pages Functions: proxy tipis ke Worker `arya-ai-gateway` (implementasi tunggal logika AI).
// Tidak ada logika inferensi, tidak ada binding Workers AI, dan tidak ada fallback di sini.
// Bila gateway tidak terpasang atau tidak dapat dijangkau, jawabannya 503 `unobserved` (tidak ada angka rekaan).

interface Env {
  AI_GATEWAY?: { fetch: (request: Request) => Promise<Response> };
}

const unavailable = (reason: 'gateway_unbound' | 'gateway_unreachable', message: string) =>
  new Response(JSON.stringify({ unobserved: true, reason, message, source: 'none' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });

export const onRequest = async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
  if (!env.AI_GATEWAY || typeof env.AI_GATEWAY.fetch !== 'function') {
    return unavailable('gateway_unbound', 'Service binding AI_GATEWAY tidak terpasang; tidak ada diagnosis.');
  }
  try {
    return await env.AI_GATEWAY.fetch(request);
  } catch (err: any) {
    console.warn('AI_GATEWAY unreachable:', err?.message);
    return unavailable('gateway_unreachable', 'Gateway AI tidak dapat dijangkau; tidak ada diagnosis.');
  }
};
