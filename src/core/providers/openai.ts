import { LLMProvider, LLMRequestOptions, LLMResponse, extractJsonFromResponse } from './base.js';

export class OpenAIProvider implements LLMProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI / Codex';
  private apiKey: string;
  private defaultModel: string;

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.defaultModel,
        messages: options.messages,
        temperature: options.temperature ?? 0.4,
        max_tokens: options.maxTokens ?? 4096,
        response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${err}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    const text = data.choices?.[0]?.message?.content || '';
    const parsedJson = options.responseFormat === 'json' ? extractJsonFromResponse(text) : undefined;

    return {
      content: text,
      parsedJson,
      model: this.defaultModel,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    };
  }
}
