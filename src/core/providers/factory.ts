import { LLMProvider } from './base.js';
import { GeminiProvider } from './gemini.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { DeepSeekProvider, OllamaProvider } from './deepseek_ollama.js';
import { MockProvider } from './mock.js';
import picocolors from 'picocolors';

export class ProviderFactory {
  static async create(preferredProvider?: string, model?: string): Promise<LLMProvider> {
    if (preferredProvider) {
      switch (preferredProvider.toLowerCase()) {
        case 'gemini':
        case 'google':
          return new GeminiProvider(undefined, model || 'gemini-2.0-flash');
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
          return new OllamaProvider(undefined, model || 'deepseek-r1:14b');
        case 'mock':
          return new MockProvider();
      }
    }

    // Auto-detection hierarchy based on environment variables
    if (process.env.GEMINI_API_KEY) {
      return new GeminiProvider(process.env.GEMINI_API_KEY, model || 'gemini-2.0-flash');
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

    // Check if local Ollama is running on localhost:11434
    const localOllama = new OllamaProvider(undefined, model || 'deepseek-r1:14b');
    if (await localOllama.isAvailable()) {
      return localOllama;
    }

    // If no provider or keys found, throw a friendly actionable error instead of silent mock data
    throw new Error(
      `\n` +
      picocolors.bold(picocolors.red('✖ No LLM API Key detected!\n\n')) +
      picocolors.yellow('Please set one of the following environment variables:\n') +
      `  ${picocolors.cyan('export GEMINI_API_KEY')}="your-key"       ${picocolors.dim('# Google Gemini (gemini-2.0-flash / gemini-1.5-pro)')}\n` +
      `  ${picocolors.cyan('export ANTHROPIC_API_KEY')}="your-key"    ${picocolors.dim('# Anthropic Claude (claude-3-7-sonnet)')}\n` +
      `  ${picocolors.cyan('export OPENAI_API_KEY')}="your-key"       ${picocolors.dim('# OpenAI (gpt-4o / o3-mini)')}\n` +
      `  ${picocolors.cyan('export DEEPSEEK_API_KEY')}="your-key"     ${picocolors.dim('# DeepSeek (deepseek-reasoner R1 / V3)')}\n\n` +
      picocolors.yellow('Or run local Ollama free & offline:\n') +
      `  ${picocolors.cyan('ollama run deepseek-r1:14b')}\n`
    );
  }
}
