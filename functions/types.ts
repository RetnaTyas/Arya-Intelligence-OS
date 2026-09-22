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

export function extractJsonFromText(raw: any): any {
  if (raw === null || raw === undefined) return null;
  // If the binding already returned parsed object or array
  if (typeof raw === 'object') {
    return raw;
  }
  const str = String(raw).trim();
  if (!str) return null;
  const jsonMatch = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonString = jsonMatch ? jsonMatch[1].trim() : str;
  try {
    return JSON.parse(jsonString);
  } catch {
    const firstBracket = jsonString.indexOf('{');
    const firstSquare = jsonString.indexOf('[');
    let startIdx = -1;
    let endIdx = -1;
    if (firstBracket !== -1 && (firstSquare === -1 || firstBracket < firstSquare)) {
      startIdx = firstBracket;
      endIdx = jsonString.lastIndexOf('}');
    } else if (firstSquare !== -1) {
      startIdx = firstSquare;
      endIdx = jsonString.lastIndexOf(']');
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      try {
        return JSON.parse(jsonString.slice(startIdx, endIdx + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
