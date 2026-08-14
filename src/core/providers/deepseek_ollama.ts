import { LLMProvider, LLMRequestOptions, LLMResponse, extractJsonFromResponse } from './base.js';

export class DeepSeekProvider implements LLMProvider {
  readonly id = 'deepseek';
  readonly name = 'DeepSeek';
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey?: string, model = 'deepseek-reasoner') {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || '';
    this.defaultModel = model;
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  async generate(options: LLMRequestOptions): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not set in environment or config.');
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.defaultModel,
        messages: options.messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 4096,
        response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${err}`);
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

export class OllamaProvider implements LLMProvider {
  readonly id = 'ollama';
  readonly name = 'Local Ollama / vLLM';
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl = 'http://localhost:11434', model = 'deepseek-r1:14b') {
    this.baseUrl = baseUrl;
    this.defaultModel = model;
  }

  static async getInstalledModels(baseUrl = 'http://localhost:11434'): Promise<string[]> {
    try {
      const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) return [];
      const data = (await res.json()) as { models?: { name: string }[] };
      return data.models?.map((m) => m.name) || [];
    } catch {
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(1500) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async generate(options: LLMRequestOptions): Promise<LLMResponse> {
    const prompt = options.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.defaultModel,
        prompt,
        stream: false,
        format: options.responseFormat === 'json' ? 'json' : undefined,
        options: {
          temperature: options.temperature ?? 0.3,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Ollama error (${response.status}): ${err}`);
    }

    const data = (await response.json()) as { response?: string };
    const text = data.response || '';
    const parsedJson = options.responseFormat === 'json' ? extractJsonFromResponse(text) : undefined;

    return {
      content: text,
      parsedJson,
      model: this.defaultModel,
    };
  }
}
