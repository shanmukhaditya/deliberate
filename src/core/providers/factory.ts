import { LLMProvider } from './base.js';
import { GeminiProvider } from './gemini.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { DeepSeekProvider, OllamaProvider } from './deepseek_ollama.js';
import { MockProvider } from './mock.js';

export class ProviderFactory {
  static async create(preferredProvider?: string, model?: string): Promise<LLMProvider> {
    if (preferredProvider) {
      switch (preferredProvider.toLowerCase()) {
        case 'gemini':
        case 'google':
          return new GeminiProvider(undefined, model || 'gemini-2.5-flash');
        case 'openai':
        case 'codex':
        case 'gpt':
          return new OpenAIProvider(undefined, model || 'gpt-4o');
        case 'anthropic':
        case 'claude':
          return new AnthropicProvider(undefined, model || 'claude-3-7-sonnet-20250219');
        case 'deepseek':
          return new DeepSeekProvider(undefined, model || 'deepseek-reasoner');
        case 'ollama':
        case 'local':
          return new OllamaProvider(undefined, model);
        case 'mock':
          return new MockProvider();
      }
    }

    // Auto-detection hierarchy based on environment variables
    if (process.env.GEMINI_API_KEY) {
      return new GeminiProvider(process.env.GEMINI_API_KEY, model || 'gemini-2.5-flash');
    }
    if (process.env.ANTHROPIC_API_KEY) {
      return new AnthropicProvider(process.env.ANTHROPIC_API_KEY, model || 'claude-3-7-sonnet-20250219');
    }
    if (process.env.OPENAI_API_KEY) {
      return new OpenAIProvider(process.env.OPENAI_API_KEY, model || 'gpt-4o');
    }
    if (process.env.DEEPSEEK_API_KEY) {
      return new DeepSeekProvider(process.env.DEEPSEEK_API_KEY, model || 'deepseek-reasoner');
    }

    // Check if local Ollama is available
    const localOllama = new OllamaProvider();
    if (await localOllama.isAvailable()) {
      return localOllama;
    }

    // Default to deterministic MockProvider if no keys or local model are found
    return new MockProvider();
  }
}
