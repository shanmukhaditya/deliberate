import { DeliberationEngine } from './engine.js';
import { ProviderFactory } from './providers/factory.js';

export interface ProviderBenchmarkResult {
  provider: string;
  model: string;
  available: boolean;
  executionTimeMs: number;
  overallScore: number;
  totalTokens: number;
  error?: string;
}

export class BenchmarkRunner {
  /**
   * Concurrently runs deliberation across multiple providers and collects performance metrics
   */
  static async run(
    goal: string,
    providers = ['mock', 'gemini', 'anthropic', 'openai', 'deepseek', 'ollama']
  ): Promise<ProviderBenchmarkResult[]> {
    const results: ProviderBenchmarkResult[] = [];

    await Promise.all(
      providers.map(async (p) => {
        const start = Date.now();
        try {
          const providerInstance = await ProviderFactory.create(p);
          const isAvail = await providerInstance.isAvailable();
          if (!isAvail && p !== 'mock') {
            results.push({
              provider: p,
              model: 'N/A',
              available: false,
              executionTimeMs: 0,
              overallScore: 0,
              totalTokens: 0,
              error: 'API key not configured or service unreachable',
            });
            return;
          }

          const engine = new DeliberationEngine();
          const res = await engine.run({
            goal,
            mode: 'flash',
            provider: p,
          });

          results.push({
            provider: p,
            model: providerInstance.name,
            available: true,
            executionTimeMs: Date.now() - start,
            overallScore: res.blueprint.winningArchitecture.overallScore,
            totalTokens: res.telemetry?.totalTokens || 0,
          });
        } catch (err: unknown) {
          results.push({
            provider: p,
            model: 'error',
            available: false,
            executionTimeMs: Date.now() - start,
            overallScore: 0,
            totalTokens: 0,
            error: (err as Error).message,
          });
        }
      })
    );

    return results.sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0) || a.executionTimeMs - b.executionTimeMs);
  }
}
