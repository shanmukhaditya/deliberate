import { DeliberationEngine } from './core/engine.js';
import { DeliberationConfig, DeliberationResult } from './core/types.js';

export * from './core/types.js';
export * from './core/personas/base.js';
export * from './core/personas/definitions.js';
export * from './core/personas/registry.js';
export * from './core/topologies/base.js';
export * from './core/topologies/definitions.js';
export * from './core/topologies/registry.js';
export * from './core/providers/base.js';
export * from './core/providers/factory.js';
export * from './core/engine.js';
export * from './core/synthesizer.js';
export * from './mcp/server.js';

// Ergonomic top-level singleton helper
export const deliberate = {
  async brainstorm(config: DeliberationConfig | string): Promise<DeliberationResult> {
    const engine = new DeliberationEngine();
    const finalConfig: DeliberationConfig = typeof config === 'string' ? { goal: config } : config;
    return engine.run({ ...finalConfig, mode: finalConfig.mode || 'council' });
  },

  async redTeam(
    filePath: string,
    fileContent: string,
    goal = 'Stress-test invariants and edge cases'
  ): Promise<DeliberationResult> {
    const engine = new DeliberationEngine();
    return engine.run({
      goal,
      mode: 'red-team',
      filePath,
      fileContent,
    });
  },

  async council(goal: string, options: Partial<DeliberationConfig> = {}): Promise<DeliberationResult> {
    const engine = new DeliberationEngine();
    return engine.run({
      goal,
      mode: 'council',
      ...options,
    });
  },
};

export default deliberate;
