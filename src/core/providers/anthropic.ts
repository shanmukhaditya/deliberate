import { LLMProvider, LLMRequestOptions, LLMResponse, extractJsonFromResponse } from './base.js';

export class AnthropicProvider implements LLMProvider {
  readonly id = 'anthropic';
  readonly name = 'Anthropic Claude';
  private apiKey: string;
  private defaultModel: string;
  private static resolvedActiveModel: string | null = null;

  constructor(apiKey?: string, model = 'claude-5-sonnet') {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.defaultModel = model;
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  async generate(options: LLMRequestOptions): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment or config.');
    }

    const systemMessage = options.messages.find((m) => m.role === 'system')?.content || '';
    const userMessages = options.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const fallbackChain = [
      AnthropicProvider.resolvedActiveModel || this.defaultModel,
      'claude-5-sonnet',
      'claude-5-opus',
      'claude-4.5-sonnet',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
    ];

    const modelsToTry = Array.from(new Set(fallbackChain.filter(Boolean)));
    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: modelName,
            system: systemMessage || undefined,
            messages: userMessages,
            max_tokens: options.maxTokens ?? 4096,
            temperature: options.temperature ?? 0.4,
          }),
        });

        if (response.status === 404) {
          continue;
        }

        if (!response.ok) {
          const err = await response.text();
          if (err.includes('not_found') || err.includes('model_not_found') || err.includes('404')) {
            continue;
          }
          throw new Error(`Anthropic API error (${response.status}): ${err}`);
        }

        const data = (await response.json()) as {
          content?: { type: string; text?: string }[];
          usage?: { input_tokens: number; output_tokens: number };
        };

        const text = data.content?.[0]?.text || '';
        const parsedJson = options.responseFormat === 'json' ? extractJsonFromResponse(text) : undefined;

        AnthropicProvider.resolvedActiveModel = modelName;

        return {
          content: text,
          parsedJson,
          model: modelName,
          usage: {
            promptTokens: data.usage?.input_tokens ?? 0,
            completionTokens: data.usage?.output_tokens ?? 0,
            totalTokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
          },
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (lastError.message.includes('not_found') || lastError.message.includes('404')) {
          continue;
        }
        throw lastError;
      }
    }

    throw lastError || new Error(`Anthropic API: none of the models [${modelsToTry.join(', ')}] are accessible.`);
  }
}
