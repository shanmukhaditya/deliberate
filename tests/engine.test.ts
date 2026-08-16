import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DeliberationEngine } from '../src/core/engine.js';
import { PersonaRegistry } from '../src/core/personas/registry.js';
import { TopologyRegistry } from '../src/core/topologies/registry.js';
import { extractJsonFromResponse } from '../src/core/providers/base.js';
import { Synthesizer } from '../src/core/synthesizer.js';
import { ADRGenerator } from '../src/core/adr.js';

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
    assert.ok(result.telemetry !== undefined);
  });

  it('should execute multi-round dialectical cross-examination debate (PRD-04)', async () => {
    const engine = new DeliberationEngine();
    const result = await engine.run({
      goal: 'Design high-frequency trading ledger',
      mode: 'council',
      rounds: 2,
      provider: 'mock',
    });

    assert.strictEqual(result.telemetry?.roundsCompleted, 2);
    assert.strictEqual(result.councilDebates.length, 6);
    assert.strictEqual(result.councilDebates[0]?.round, 2);
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

  it('should generate standard Architectural Decision Records in MADR format (PRD-05)', async () => {
    const engine = new DeliberationEngine();
    const result = await engine.run({
      goal: 'Adopt Event Sourced CQRS for Order Ledger',
      mode: 'flash',
      provider: 'mock',
    });

    const adr = ADRGenerator.generate(result, 42);
    assert.ok(adr.includes('# ADR-0042:'));
    assert.ok(adr.includes('## Context and Problem Statement'));
    assert.ok(adr.includes('## Decision Drivers'));
    assert.ok(adr.includes('## Considered Options'));
    assert.ok(adr.includes('## Decision Outcome'));
    assert.ok(adr.includes('## Core Invariants & Compliance Rules'));
  });

  it('should dynamically register and execute custom domain personas (PRD-07)', async () => {
    PersonaRegistry.register({
      id: 'finops' as any,
      name: 'The FinOps Optimizer',
      title: 'Cloud Cost Architect',
      stance: 'Eliminate idle egress and compute costs.',
      cognitiveDuty: 'Enforce serverless/spot execution boundaries.',
      bias: 'efficiency',
      systemPrompt: 'You are the FinOps Optimizer. You hate cloud waste.',
    });

    const finops = PersonaRegistry.get('finops');
    assert.strictEqual(finops.name, 'The FinOps Optimizer');
    assert.strictEqual(finops.definition.bias, 'efficiency');

    const engine = new DeliberationEngine();
    const result = await engine.run({
      goal: 'Design multi-region data warehouse',
      mode: 'council',
      personas: ['finops' as any, 'architect'],
      provider: 'mock',
    });

    assert.strictEqual(result.councilDebates.length, 2);
  });

  it('should safely extract git diff without throwing (PRD-09)', async () => {
    const { GitHelper } = await import('../src/core/git.js');
    const diff = await GitHelper.getDiff();
    assert.strictEqual(typeof diff.hasDiff, 'boolean');
    assert.strictEqual(typeof diff.summary, 'string');
  });

  it('should materialize code scaffolding to disk (PRD-10)', async () => {
    const { CodebaseScaffolder } = await import('../src/core/scaffolder.js');
    const engine = new DeliberationEngine();
    const result = await engine.run({
      goal: 'Build typed WebSocket actor',
      mode: 'flash',
      provider: 'mock',
    });

    const res = await CodebaseScaffolder.scaffold(result, {
      outDir: './scratch/test_scaffold',
      filename: 'test_actor.ts',
      overwrite: true,
    });

    assert.ok(res.bytesWritten > 0);
    assert.ok(res.path.includes('test_actor.ts'));
  });

  it('should generate runnable TypeScript invariant test suites (PRD-11)', async () => {
    const { InvariantTestGenerator } = await import('../src/core/test_generator.js');
    const engine = new DeliberationEngine();
    const result = await engine.run({
      goal: 'Design resilient lock-free broker',
      mode: 'flash',
      provider: 'mock',
    });

    const code = InvariantTestGenerator.generateCode(result);
    assert.ok(code.includes("import { describe, it } from 'node:test'"));
    assert.ok(code.includes('Invariant 1:'));
    assert.ok(code.includes('Threat Mitigation 1:'));
  });

  it('should run CI PR invariant audit without throwing (PRD-12)', async () => {
    const { CiHelper } = await import('../src/core/ci.js');
    const res = await CiHelper.runPrAudit({ provider: 'mock' });
    assert.ok(typeof res.summaryMarkdown === 'string');
    assert.ok(res.summaryMarkdown.includes('Deliberate CI'));
  });

  it('should render HTML visual dashboard and start local server (PRD-13)', async () => {
    const { DashboardServer } = await import('../src/core/server.js');
    const engine = new DeliberationEngine();
    const result = await engine.run({
      goal: 'Design Web Dashboard Visualizer',
      mode: 'flash',
      provider: 'mock',
    });

    const html = DashboardServer.renderHtml(result);
    assert.ok(html.includes('⚡ Deliberate Dashboard:'));
    assert.ok(html.includes('Pareto Trade-Off Radar'));
    assert.ok(html.includes('Hard Architectural Invariants'));

    const serverInfo = await DashboardServer.start(result, 4500);
    assert.ok(serverInfo.port >= 4500);
    assert.ok(serverInfo.url.includes('http://localhost:'));
    serverInfo.close();
  });

  it('should execute multi-provider benchmark suite (PRD-14)', async () => {
    const { BenchmarkRunner } = await import('../src/core/benchmark.js');
    const results = await BenchmarkRunner.run('Test benchmark goal', ['mock']);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0]?.provider, 'mock');
    assert.strictEqual(results[0]?.available, true);
    assert.ok(results[0]?.executionTimeMs >= 0);
  });
});




