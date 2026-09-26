// Cloudflare Pages Functions - Environment Definitions & Single Source of Truth
// Service Binding: AI_GATEWAY -> points to private Worker "arya-ai-gateway"
// Legacy Direct Binding (Fallback): "AiOS AI" or "AI"

export interface CloudflareEnv {
  // Service binding to private backend worker (Preferred Architecture)
  AI_GATEWAY?: {
    fetch: (input: Request | string, init?: any) => Promise<Response>;
  };

  // Direct Workers AI binding fallback (Legacy)
  'AiOS AI'?: {
    run: (model: string, input: any) => Promise<any>;
  };
  AI?: {
    run: (model: string, input: any) => Promise<any>;
  };
  CLOUDFLARE_AI_MODEL?: string;
  GEMINI_API_KEY?: string;
}

export const DEFAULT_WORKERS_AI_MODEL = '@cf/qwen/qwen3-30b-a3b-fp8';

export function getWorkersAIBinding(env: CloudflareEnv) {
  return env['AiOS AI'] || env.AI || null;
}

// Re-export single source of truth from worker/lib
export { extractJsonFromText, extractBenchmarkArray } from '../worker/lib/json-extract';
export { generateLocalProbeDiagnosis, generateLocalFeynmanDiagnosis } from '../worker/lib/fallback-heuristics';
