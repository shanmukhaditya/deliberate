import { LLMProvider, LLMRequestOptions, LLMResponse, extractJsonFromResponse } from './base.js';

export class GeminiProvider implements LLMProvider {
  readonly id = 'gemini';
  readonly name = 'Google Gemini';
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey?: string, model = 'gemini-1.5-flash') {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.defaultModel = model;
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  async generate(options: LLMRequestOptions): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment or config.');
    }

    // Format messages for Gemini API
    const contents = options.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const candidateModels = [
      this.defaultModel,
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
    ];

    // Remove duplicates while preserving order
    const modelsToTry = Array.from(new Set(candidateModels));
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
          // Model name not found on this API key tier, try next fallback model
          continue;
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API error (${response.status}): ${errText}`);
        }

        const data = (await response.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
          usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
        };

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsedJson = options.responseFormat === 'json' ? extractJsonFromResponse(text) : undefined;

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
        if (lastError.message.includes('404')) {
          continue;
        }
        throw lastError;
      }
    }

    throw lastError || new Error(`Gemini API failed to find a valid active model among: ${modelsToTry.join(', ')}`);
  }
}
