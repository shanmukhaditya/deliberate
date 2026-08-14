import { LLMProvider, LLMRequestOptions, LLMResponse, extractJsonFromResponse } from './base.js';

export class OpenAIProvider implements LLMProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI / Codex';
  private apiKey: string;
  private defaultModel: string;
  private static resolvedActiveModel: string | null = null;

  constructor(apiKey?: string, model = 'gpt-4o') {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.defaultModel = model;
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  async generate(options: LLMRequestOptions): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment or config.');
    }

    const fallbackChain = [
      OpenAIProvider.resolvedActiveModel || this.defaultModel,
      'gpt-4o',
      'gpt-4o-mini',
      'o3-mini',
      'gpt-4-turbo',
    ];

    const modelsToTry = Array.from(new Set(fallbackChain.filter(Boolean)));
    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: options.messages,
            temperature: options.temperature ?? 0.4,
            max_tokens: options.maxTokens ?? 4096,
            response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
          }),
        });

        if (response.status === 404) {
          continue;
        }

        if (!response.ok) {
          const err = await response.text();
          if (err.includes('model_not_found') || err.includes('does not exist') || err.includes('404')) {
            continue;
          }
          throw new Error(`OpenAI API error (${response.status}): ${err}`);
        }

        const data = (await response.json()) as {
          choices?: { message?: { content?: string } }[];
          usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
        };

        const text = data.choices?.[0]?.message?.content || '';
        const parsedJson = options.responseFormat === 'json' ? extractJsonFromResponse(text) : undefined;

        OpenAIProvider.resolvedActiveModel = modelName;

        return {
          content: text,
          parsedJson,
          model: modelName,
          usage: {
            promptTokens: data.usage?.prompt_tokens ?? 0,
            completionTokens: data.usage?.completion_tokens ?? 0,
            totalTokens: data.usage?.total_tokens ?? 0,
          },
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (lastError.message.includes('404') || lastError.message.includes('model_not_found')) {
          continue;
        }
        throw lastError;
      }
    }

    throw lastError || new Error(`OpenAI API: none of the models [${modelsToTry.join(', ')}] are accessible.`);
  }
}
