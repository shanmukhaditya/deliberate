import { LLMProvider, LLMRequestOptions, LLMResponse, extractJsonFromResponse } from './base.js';

export class GeminiProvider implements LLMProvider {
  readonly id = 'gemini';
  readonly name = 'Google Gemini';
  private apiKey: string;
  private defaultModel: string;
  private static resolvedActiveModel: string | null = null;
  private static discoveredModels: string[] | null = null;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.defaultModel = model || 'gemini-2.5-flash';
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  /**
   * Dynamically query Google AI Studio API for all available models on this API key
   */
  private async getAvailableModels(): Promise<string[]> {
    if (GeminiProvider.discoveredModels && GeminiProvider.discoveredModels.length > 0) {
      return GeminiProvider.discoveredModels;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return [];

      const data = (await res.json()) as {
        models?: { name: string; supportedGenerationMethods?: string[] }[];
      };

      const validModels = (data.models || [])
        .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m) => m.name.replace(/^models\//, ''))
        .filter((name) => !name.includes('embedding') && !name.includes('aqa'));

      if (validModels.length > 0) {
        // Sort with latest/pro/flash first
        validModels.sort((a, b) => {
          if (a.includes('2.5-pro') || a.includes('3.0')) return -1;
          if (b.includes('2.5-pro') || b.includes('3.0')) return 1;
          if (a.includes('2.5-flash')) return -1;
          if (b.includes('2.5-flash')) return 1;
          if (a.includes('2.0-flash')) return -1;
          if (b.includes('2.0-flash')) return 1;
          return 0;
        });

        GeminiProvider.discoveredModels = validModels;
        return validModels;
      }
    } catch {
      // ignore network errors and use fallback list
    }
    return [];
  }

  async generate(options: LLMRequestOptions): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment or config.');
    }

    const contents = options.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // 1. Fetch dynamically available models from Google API
    const liveModels = await this.getAvailableModels();

    // 2. Build prioritized candidate list with dynamic discovery first
    const candidateModels = [
      GeminiProvider.resolvedActiveModel,
      this.defaultModel,
      ...liveModels,
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ];

    const modelsToTry = Array.from(new Set(candidateModels.filter(Boolean) as string[]));
    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: options.temperature ?? 0.4,
              maxOutputTokens: options.maxTokens ?? 4096,
              responseMimeType: options.responseFormat === 'json' ? 'application/json' : 'text/plain',
            },
          }),
        });

        if (response.status === 404) {
          continue;
        }

        if (!response.ok) {
          const errText = await response.text();
          if (
            errText.includes('NOT_FOUND') ||
            errText.includes('404') ||
            errText.includes('no longer available') ||
            errText.includes('not supported')
          ) {
            continue;
          }
          throw new Error(`Gemini API error (${response.status}): ${errText}`);
        }

        const data = (await response.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
          usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
        };

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsedJson = options.responseFormat === 'json' ? extractJsonFromResponse(text) : undefined;

        // Remember working active model
        GeminiProvider.resolvedActiveModel = modelName;

        return {
          content: text,
          parsedJson,
          model: modelName,
          usage: {
            promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
            completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
            totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
          },
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (
          lastError.message.includes('404') ||
          lastError.message.includes('NOT_FOUND') ||
          lastError.message.includes('no longer available')
        ) {
          continue;
        }
        throw lastError;
      }
    }

    throw lastError || new Error(`Gemini API: none of the models [${modelsToTry.join(', ')}] are accessible with your API key.`);
  }
}
