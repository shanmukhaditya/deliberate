export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequestOptions {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
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

export function extractJsonFromResponse<T = unknown>(text: string): T {
  const clean = text.trim();
  // Match markdown code block ```json ... ``` or raw JSON
  const jsonMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, clean];
  const candidate = (jsonMatch[1] || clean).trim();

  try {
    return JSON.parse(candidate) as T;
  } catch (err) {
    // If strict parse fails, try finding the first { or [ and last } or ]
    const firstBrace = candidate.indexOf('{');
    const firstBracket = candidate.indexOf('[');
    const startIdx =
      firstBrace !== -1 && firstBracket !== -1
        ? Math.min(firstBrace, firstBracket)
        : firstBrace !== -1
          ? firstBrace
          : firstBracket;

    const lastBrace = candidate.lastIndexOf('}');
    const lastBracket = candidate.lastIndexOf(']');
    const endIdx = Math.max(lastBrace, lastBracket);

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const extracted = candidate.slice(startIdx, endIdx + 1);
      return JSON.parse(extracted) as T;
    }
    throw new Error(`Failed to parse valid JSON from LLM response: ${text.slice(0, 200)}...`);
  }
}
