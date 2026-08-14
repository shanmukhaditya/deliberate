import { LLMProvider, LLMRequestOptions, LLMResponse, extractJsonFromResponse } from './base.js';

export class GeminiProvider implements LLMProvider {
  readonly id = 'gemini';
  readonly name = 'Google Gemini';
  private apiKey: string;
  private defaultModel: string;
  private static resolvedActiveModel: string | null = null;

  constructor(apiKey?: string, model = 'gemini-2.0-flash') {
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

    const contents = options.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Cascade of latest active models
    const fallbackChain = [
      GeminiProvider.resolvedActiveModel || this.defaultModel,
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash-lite',
    ];

    const modelsToTry = Array.from(new Set(fallbackChain.filter(Boolean)));
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
          // Model deprecated or not found on this API key tier, try next
          continue;
        }

        if (!response.ok) {
          const errText = await response.text();
          if (errText.includes('NOT_FOUND') || errText.includes('404') || errText.includes('no longer available')) {
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

        // Remember the working model for the rest of the session
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
        if (lastError.message.includes('404') || lastError.message.includes('NOT_FOUND')) {
          continue;
        }
        throw lastError;
      }
    }

    throw lastError || new Error(`Gemini API: none of the models [${modelsToTry.join(', ')}] are accessible with your API key.`);
  }
}
