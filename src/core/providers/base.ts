export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequestOptions {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
  timeoutMs?: number;
}

export interface LLMResponse {
  content: string;
  parsedJson?: unknown;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  readonly id: string;
  readonly name: string;
  isAvailable(): Promise<boolean>;
  generate(options: LLMRequestOptions): Promise<LLMResponse>;
}

/**
 * Robust Multi-Pass JSON Extractor for Frontier LLMs (DeepSeek-R1, Gemini Thinking, Claude 5)
 * Handles raw JSON, markdown-wrapped blocks, and trailing thoughts/logs.
 */
export function extractJsonFromResponse<T = unknown>(text: string): T {
  if (!text || typeof text !== 'string') {
    return {} as T;
  }

  const clean = text.trim();

  // Pass 1: Direct JSON parse
  try {
    return JSON.parse(clean) as T;
  } catch {
    // continue to Pass 2
  }

  // Pass 2: Markdown fenced code block extraction
  const jsonBlocks = Array.from(clean.matchAll(/```(?:json)?\s*([\s\S]*?)\s*```/g));
  for (const match of jsonBlocks) {
    if (match[1]) {
      try {
        return JSON.parse(match[1].trim()) as T;
      } catch {
        // continue
      }
    }
  }

  // Pass 3: Balanced Brace Depth Tracking (handles pre/post thinking commentary)
  const firstBrace = clean.indexOf('{');
  if (firstBrace !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = firstBrace; i < clean.length; i++) {
      const char = clean[i];

      if (escape) {
        escape = false;
        continue;
      }

      if (char === '\\') {
        escape = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') {
          depth++;
        } else if (char === '}') {
          depth--;
          if (depth === 0) {
            const candidate = clean.slice(firstBrace, i + 1);
            try {
              return JSON.parse(candidate) as T;
            } catch {
              break;
            }
          }
        }
      }
    }
  }

  // Pass 4: Fallback greedy slice
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const candidate = clean.slice(firstBrace, lastBrace + 1);
      return JSON.parse(candidate) as T;
    } catch {
      // final fallback
    }
  }

  // Return empty fallback object rather than throwing to ensure zero-crash resilience
  return {} as T;
}
