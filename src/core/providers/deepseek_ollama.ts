import { LLMProvider, LLMRequestOptions, LLMResponse, extractJsonFromResponse } from './base.js';

export class DeepSeekProvider implements LLMProvider {
  readonly id = 'deepseek';
  readonly name = 'DeepSeek';
  private apiKey: string;
  private defaultModel: string;
  private static resolvedActiveModel: string | null = null;

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

    const fallbackChain = [
      DeepSeekProvider.resolvedActiveModel || this.defaultModel,
      'deepseek-reasoner',
      'deepseek-chat',
    ];

    const modelsToTry = Array.from(new Set(fallbackChain.filter(Boolean)));
    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: options.messages,
            temperature: options.temperature ?? 0.3,
            max_tokens: options.maxTokens ?? 4096,
            response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
          }),
        });

        if (response.status === 404) {
          continue;
        }

        if (!response.ok) {
          const err = await response.text();
          if (err.includes('not_found') || err.includes('404')) {
            continue;
          }
          throw new Error(`DeepSeek API error (${response.status}): ${err}`);
        }

        const data = (await response.json()) as {
          choices?: { message?: { content?: string } }[];
          usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
        };

        const text = data.choices?.[0]?.message?.content || '';
        const parsedJson = options.responseFormat === 'json' ? extractJsonFromResponse(text) : undefined;

        DeepSeekProvider.resolvedActiveModel = modelName;

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
        if (lastError.message.includes('404')) {
          continue;
        }
        throw lastError;
      }
    }

    throw lastError || new Error(`DeepSeek API: none of the models [${modelsToTry.join(', ')}] are accessible.`);
  }
}

export class OllamaProvider implements LLMProvider {
  readonly id = 'ollama';
  readonly name = 'Local Ollama / vLLM';
  private baseUrl: string;
  private defaultModel: string;
  private static resolvedActiveModel: string | null = null;

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

    // Get list of installed models
    const installed = await OllamaProvider.getInstalledModels(this.baseUrl);

    const fallbackChain = [
      OllamaProvider.resolvedActiveModel || this.defaultModel,
      ...installed,
      'deepseek-r1:14b',
      'deepseek-r1:latest',
      'qwen2.5-coder:32b',
      'qwen2.5-coder:latest',
      'llama3.3:latest',
      'llama3.2:latest',
      'mistral:latest',
    ];

    const modelsToTry = Array.from(new Set(fallbackChain.filter(Boolean)));
    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelName,
            prompt,
            stream: false,
            format: options.responseFormat === 'json' ? 'json' : undefined,
            options: {
              temperature: options.temperature ?? 0.3,
            },
          }),
        });

        if (response.status === 404) {
          continue;
        }

        if (!response.ok) {
          const err = await response.text();
          if (err.includes('not found') || err.includes('try pulling')) {
            continue;
          }
          throw new Error(`Ollama error (${response.status}): ${err}`);
        }

        const data = (await response.json()) as { response?: string };
        const text = data.response || '';
        const parsedJson = options.responseFormat === 'json' ? extractJsonFromResponse(text) : undefined;

        OllamaProvider.resolvedActiveModel = modelName;

        return {
          content: text,
          parsedJson,
          model: modelName,
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (lastError.message.includes('not found') || lastError.message.includes('404')) {
          continue;
        }
        throw lastError;
      }
    }

    throw (
      lastError ||
      new Error(
        `Ollama: None of the models [${modelsToTry.join(', ')}] are installed locally. Run 'ollama pull deepseek-r1:14b' to download one.`
      )
    );
  }
}
