import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DeliberationEngine } from '../src/core/engine.js';
import { PersonaRegistry } from '../src/core/personas/registry.js';
import { TopologyRegistry } from '../src/core/topologies/registry.js';
import { extractJsonFromResponse } from '../src/core/providers/base.js';
import { Synthesizer } from '../src/core/synthesizer.js';

describe('Deliberate Core Reasoning Suite', () => {
  it('should resolve all 6 personas from the registry with correct biases', () => {
    const allPersonas = PersonaRegistry.getAll();
    assert.strictEqual(allPersonas.length, 6);
    assert.strictEqual(PersonaRegistry.get('architect').definition.bias, 'structural');
    assert.strictEqual(PersonaRegistry.get('contrarian').definition.bias, 'adversarial');
    assert.strictEqual(PersonaRegistry.get('performance').definition.bias, 'efficiency');
    assert.strictEqual(PersonaRegistry.get('dx').definition.bias, 'ergonomics');
    assert.strictEqual(PersonaRegistry.get('security').definition.bias, 'resilience');
    assert.strictEqual(PersonaRegistry.get('pragmatist').definition.bias, 'simplicity');
  });

  it('should resolve all 5 thinking topologies from the registry', () => {
    const allTopologies = TopologyRegistry.getAll();
    assert.strictEqual(allTopologies.length, 5);
    assert.strictEqual(TopologyRegistry.get('first-principles').type, 'first-principles');
    assert.strictEqual(TopologyRegistry.get('inversion').type, 'inversion');
    assert.strictEqual(TopologyRegistry.get('triz').type, 'triz');
    assert.strictEqual(TopologyRegistry.get('scamper').type, 'scamper');
    assert.strictEqual(TopologyRegistry.get('tree-of-thoughts').type, 'tree-of-thoughts');
  });

  it('should execute full council deliberation deterministically with MockProvider', async () => {
    const engine = new DeliberationEngine();
    const result = await engine.run({
      goal: 'Design an ultra-fast in-memory distributed lock-free ring buffer',
      mode: 'council',
      provider: 'mock',
    });

    assert.strictEqual(result.goal, 'Design an ultra-fast in-memory distributed lock-free ring buffer');
    assert.strictEqual(result.mode, 'council');
    assert.ok(result.topologiesExecuted.length >= 3);
    assert.strictEqual(result.councilDebates.length, 6);
    assert.ok(result.blueprint.winningArchitecture.title.length > 0);
    assert.ok(result.blueprint.coreInvariants.length > 0);
    assert.ok(result.paretoMatrix.length >= 1);
    assert.ok(result.executionTimeMs >= 0);
  });

  it('should execute red-team mode against code invariants', async () => {
    const engine = new DeliberationEngine();
    const sampleCode = `
      export function transferMoney(from: string, to: string, amount: number) {
        db.query("UPDATE accounts SET balance = balance - " + amount + " WHERE id = " + from);
        db.query("UPDATE accounts SET balance = balance + " + amount + " WHERE id = " + to);
      }
    `;

    const result = await engine.run({
      goal: 'Audit funds transfer function for race conditions and SQL injection',
      mode: 'red-team',
      fileContent: sampleCode,
      filePath: 'src/billing/transfer.ts',
      provider: 'mock',
    });

    assert.strictEqual(result.mode, 'red-team');
    assert.strictEqual(result.councilDebates.length, 3);
    assert.ok(result.blueprint.coreInvariants.length > 0);
    assert.ok(result.blueprint.failureModesAndMitigations.length > 0);
  });

  it('should robustly parse messy and markdown-wrapped LLM JSON (BUG-01)', () => {
    // 1. Direct JSON
    const direct = extractJsonFromResponse<{ key: string }>('{"key": "value"}');
    assert.strictEqual(direct.key, 'value');

    // 2. Markdown wrapped
    const markdown = extractJsonFromResponse<{ key: string }>(
      'Here is the result:\n```json\n{"key": "from_markdown"}\n```\nHope this helps!'
    );
    assert.strictEqual(markdown.key, 'from_markdown');

    // 3. Pre-thought commentary and post-logs (DeepSeek-R1 style)
    const thinkingStyle = extractJsonFromResponse<{ status: string }>(
      '<think>\nI should synthesize the architecture carefully.\n</think>\n{"status": "ok"}\nTokens used: 450'
    );
    assert.strictEqual(thinkingStyle.status, 'ok');

    // 4. Broken fallback
    const broken = extractJsonFromResponse('invalid raw text without json');
    assert.deepStrictEqual(broken, {});
  });

  it('should generate well-structured GitHub Flavored Markdown blueprints (PRD-01 & PRD-02)', async () => {
    const engine = new DeliberationEngine();
    const result = await engine.run({
      goal: 'Design a high-throughput event streamer',
      mode: 'flash',
      provider: 'mock',
    });

    const md = Synthesizer.exportToMarkdown(result);
    assert.ok(md.includes('# ⚡ Architectural Blueprint:'));
    assert.ok(md.includes('## 🏛️ Winning Architecture:'));
    assert.ok(md.includes('## 🛡️ Core Architectural Invariants'));
    assert.ok(md.includes('## 🚀 Step-by-Step Implementation Roadmap'));
    assert.ok(md.includes('Synthesized autonomously via [Deliberate]'));
  });
});
