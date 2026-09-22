// Cloudflare Pages Functions - Environment Definitions
// Binding: Type = Workers AI, Name = "AiOS AI" (accessible via env["AiOS AI"] or env.AI)

export interface CloudflareEnv {
  // Cloudflare Pages Workers AI binding name: "AiOS AI"
  'AiOS AI': {
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
  // Support exact user specified binding name 'AiOS AI' as well as standard 'AI'
  return env['AiOS AI'] || env.AI || null;
}

export function extractJsonFromText(rawText: string): any {
  if (!rawText) return null;
  const cleaned = rawText.trim();
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonString = jsonMatch ? jsonMatch[1] : cleaned;
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}
