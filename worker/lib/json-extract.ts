// Multi-strategy JSON cleaner & extractor for LLMs (Cloudflare Workers AI, Qwen, Gemini, etc.)
// Single Source of Truth for arya-ai-gateway and Personal Intelligence OS

export function extractJsonFromText(raw: any): any {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'object') return raw;

  let str = String(raw).trim();
  if (!str) return null;

  // 1. Strip reasoning tags like <think>...</think> produced by reasoning models (Qwen / DeepSeek)
  str = str.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Extract from markdown code fences if present (```json ... ``` or ``` ... ```)
  const fenceMatch = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    str = fenceMatch[1].trim();
  }

  // 3. Handle double-serialized or outer-quoted JSON strings
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    try {
      const unescaped = JSON.parse(str);
      if (typeof unescaped === 'string') {
        str = unescaped.trim();
      } else if (typeof unescaped === 'object' && unescaped !== null) {
        return unescaped;
      }
    } catch {
      str = str.slice(1, -1).trim();
    }
  }

  // Helper to test variants
  function tryParseVariants(text: string): any {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {}

    // Clean trailing commas before closing brackets or curlies
    try {
      const noTrailing = text.replace(/,\s*([\]}])/g, '$1');
      return JSON.parse(noTrailing);
    } catch {}

    return null;
  }

  // 4. Initial parse pass
  let parsed = tryParseVariants(str);

  // 5. Unwrap nested stringified JSON if parsed returned another string
  while (typeof parsed === 'string') {
    const trimmed = parsed.trim();
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      const next = tryParseVariants(trimmed);
      if (next === null || next === parsed) break;
      parsed = next;
    } else {
      break;
    }
  }

  if (parsed !== null && typeof parsed === 'object') {
    return parsed;
  }

  // 6. Substring scan: locate outermost array [ ... ]
  const firstSquare = str.indexOf('[');
  const lastSquare = str.lastIndexOf(']');
  if (firstSquare !== -1 && lastSquare > firstSquare) {
    const candidate = str.slice(firstSquare, lastSquare + 1);
    const res = tryParseVariants(candidate);
    if (res !== null && typeof res === 'object') return res;
  }

  // 7. Substring scan: locate outermost object { ... }
  const firstCurly = str.indexOf('{');
  const lastCurly = str.lastIndexOf('}');
  if (firstCurly !== -1 && lastCurly > firstCurly) {
    const candidate = str.slice(firstCurly, lastCurly + 1);
    const res = tryParseVariants(candidate);
    if (res !== null && typeof res === 'object') return res;
  }

  // 8. Truncated array repair: if output was cut off before closing ']', salvage closed items
  if (firstSquare !== -1) {
    const sub = str.slice(firstSquare);
    const lastObjEnd = sub.lastIndexOf('}');
    if (lastObjEnd !== -1) {
      const candidate = sub.slice(0, lastObjEnd + 1).replace(/,\s*$/, '') + ']';
      const res = tryParseVariants(candidate);
      if (Array.isArray(res) && res.length > 0) return res;
    }
  }

  return null;
}

// Specialized array extractor for benchmark & calibration responses
export function extractBenchmarkArray(raw: any): any[] | null {
  try {
    const parsed = extractJsonFromText(raw);
    if (!parsed) return null;
    if (Array.isArray(parsed)) return parsed;

    if (typeof parsed === 'object') {
      for (const key of ['probes', 'results', 'evaluations', 'items', 'data', 'benchmark', 'cases']) {
        if (Array.isArray((parsed as any)[key])) return (parsed as any)[key];
      }
      const values = Object.values(parsed);
      const arr = values.find(Array.isArray);
      if (arr) return arr as any[];

      // Single probe/case object returned
      if ('probeId' in parsed || 'hasMisconception' in parsed || 'caseId' in parsed || 'aiScore' in parsed) {
        return [parsed];
      }

      // Record of objects keyed by index or probeId
      if (
        values.length > 0 &&
        typeof values[0] === 'object' &&
        values[0] !== null &&
        ('probeId' in (values[0] as any) || 'hasMisconception' in (values[0] as any) || 'caseId' in (values[0] as any))
      ) {
        return values as any[];
      }
    }
  } catch (err: any) {
    console.warn('extractBenchmarkArray warning:', err?.message);
  }
  return null;
}
