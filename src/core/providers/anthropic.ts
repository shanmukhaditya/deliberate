import { LLMProvider, LLMRequestOptions, LLMResponse, extractJsonFromResponse } from './base.js';

export class AnthropicProvider implements LLMProvider {
  readonly id = 'anthropic';
  readonly name = 'Anthropic Claude';
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey?: string, model = 'claude-3-7-sonnet-20250219') {
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.defaultModel,
        system: systemMessage || undefined,
        messages: userMessages,
        max_tokens: options.maxTokens ?? 4096,
        temperature: options.temperature ?? 0.4,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${err}`);
    }

    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
      usage?: { input_tokens: number; output_tokens: number };
    };

    const text = data.content?.[0]?.text || '';
    const parsedJson = options.responseFormat === 'json' ? extractJsonFromResponse(text) : undefined;

    return {
      content: text,
      parsedJson,
      model: this.defaultModel,
      usage: {
        promptTokens: data.usage?.input_tokens ?? 0,
        completionTokens: data.usage?.output_tokens ?? 0,
        totalTokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
      },
    };
  }
}
