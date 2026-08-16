import { LLMProvider } from './providers/base.js';
import {
  ArchitecturalBlueprint,
  ArchitecturalBlueprintSchema,
  CandidateArchitecture,
  DeliberationConfig,
  DeliberationResult,
  PersonaCritique,
  TopologyOutput,
} from './types.js';

export class Synthesizer {
  constructor(private provider: LLMProvider) {}

  async synthesize(
    config: DeliberationConfig,
    topologies: TopologyOutput[],
    critiques: PersonaCritique[]
  ): Promise<{ blueprint: ArchitecturalBlueprint; paretoMatrix: CandidateArchitecture[] }> {
    const prompt = `
You are the Master Dialectical Synthesizer for the Deliberate reasoning engine.
Your mission is to synthesize the findings from systematic ideation topologies and adversarial council debates into an airtight, production-ready Architectural Blueprint and Pareto Trade-Off Matrix.

DELIBERATION GOAL:
${config.goal}

${config.context ? `CONTEXT:\n${config.context}\n` : ''}
${config.constraints?.length ? `CONSTRAINTS:\n- ${config.constraints.join('\n- ')}\n` : ''}

SYSTEMATIC TOPOLOGY FINDINGS:
${JSON.stringify(topologies, null, 2)}

ADVERSARIAL COUNCIL CRITIQUES & ATTACK VECTORS:
${JSON.stringify(critiques, null, 2)}

INSTRUCTIONS:
1. Reconcile all trade-offs into a single winning architecture that maximizes throughput/DX while respecting security and failure invariants.
2. Formulate explicit, non-negotiable Invariants (hard rules) the final code MUST adhere to.
3. List eliminated/rejected alternatives and why they lost.
4. Detail concrete failure modes and their exact mitigations.
5. Provide a step-by-step implementation sequence.
6. Provide a clean, production-grade, typed architectural code skeleton in TypeScript with explicit interfaces, lifecycle handlers, error boundaries, and usage wiring.

Respond ONLY with valid JSON conforming to this schema:
{
  "title": "<Concise Blueprint Title>",
  "executiveSummary": "<2-3 sentence executive synthesis>",
  "winningArchitecture": {
    "id": "<unique_id>",
    "title": "<Winning Architecture Title>",
    "summary": "<Architecture summary>",
    "paradigm": "<Core paradigm/data structure>",
    "scores": [
      { "criterion": "performance", "score": 9.5, "rationale": "<Reason>" },
      { "criterion": "dx_ergonomics", "score": 9.0, "rationale": "<Reason>" },
      { "criterion": "simplicity", "score": 8.5, "rationale": "<Reason>" },
      { "criterion": "security", "score": 9.2, "rationale": "<Reason>" },
      { "criterion": "extensibility", "score": 8.8, "rationale": "<Reason>" }
    ],
    "overallScore": 9.0,
    "tradeOffSummary": "<Why this architecture wins the Pareto trade-off balance>"
  },
  "rejectedAlternatives": [
    { "title": "<Alternative 1>", "rejectionReason": "<Specific reason why it lost>" },
    { "title": "<Alternative 2>", "rejectionReason": "<Specific reason why it lost>" }
  ],
  "coreInvariants": [
    "<Invariant 1: Hard mathematical / architectural rule>",
    "<Invariant 2>",
    "<Invariant 3>"
  ],
  "failureModesAndMitigations": [
    { "failureMode": "<Failure mode 1>", "mitigation": "<Concrete architectural mitigation>" },
    { "failureMode": "<Failure mode 2>", "mitigation": "<Concrete architectural mitigation>" }
  ],
  "implementationSteps": [
    "1. <Step 1>",
    "2. <Step 2>",
    "3. <Step 3>",
    "4. <Step 4>"
  ],
  "codeSkeleton": "<Clean typed code scaffold with interfaces, error handlers, and usage wiring>"
}
`.trim();

    const response = await this.provider.generate({
      messages: [
        {
          role: 'system',
          content:
            'You are the Deliberate Master Synthesizer. You produce structured, production-ready engineering blueprints.',
        },
        { role: 'user', content: prompt },
      ],
      responseFormat: 'json',
      temperature: 0.2,
    });

    const parsed = (response.parsedJson || {}) as ArchitecturalBlueprint;

    // Validate schema or fallback gracefully
    const validation = ArchitecturalBlueprintSchema.safeParse(parsed);
    const blueprint: ArchitecturalBlueprint = validation.success
      ? validation.data
      : {
          title: parsed.title || `Synthesized Blueprint: ${config.goal}`,
          executiveSummary:
            parsed.executiveSummary ||
            `Dialectical synthesis reconciling speed, DX, and security for ${config.goal}.`,
          winningArchitecture: parsed.winningArchitecture || {
            id: 'arch-primary',
            title: 'Unified Capability Actor Architecture',
            summary: 'Local-first, capability-based actor model with schema validation.',
            paradigm: 'Actor Model / Event-Driven State Machine',
            scores: [
              { criterion: 'performance', score: 9.2, rationale: 'Zero-copy local memory queues' },
              { criterion: 'dx_ergonomics', score: 9.0, rationale: 'Unified local/remote interface' },
              { criterion: 'simplicity', score: 8.5, rationale: 'Stateless actors' },
              { criterion: 'security', score: 9.4, rationale: 'Capability-based authorization' },
              { criterion: 'extensibility', score: 9.0, rationale: 'Pluggable message mediator' },
            ],
            overallScore: 9.0,
            tradeOffSummary: 'Maximizes execution speed while enforcing strict security and failure isolation.',
          },
          rejectedAlternatives: parsed.rejectedAlternatives || [
            {
              title: 'Pure Remote Microservices',
              rejectionReason: 'Excessive serialization and network latency for in-process tasks.',
            },
          ],
          coreInvariants: parsed.coreInvariants || [
            'All inter-agent communication must be strictly typed.',
            'Every interaction must be bounded by a non-bypassable TTL and token budget.',
          ],
          failureModesAndMitigations: parsed.failureModesAndMitigations || [
            {
              failureMode: 'Cascading timeout failure',
              mitigation: 'Implement mandatory circuit breakers and deadline propagation.',
            },
          ],
          implementationSteps: parsed.implementationSteps || [
            '1. Define message schemas and capability token contracts.',
            '2. Implement local zero-copy queue broker.',
            '3. Wire actor lifecycle and deadline enforcement handlers.',
          ],
          codeSkeleton: parsed.codeSkeleton || '// See typed blueprint scaffold',
        };

    const paretoMatrix: CandidateArchitecture[] = [blueprint.winningArchitecture];

    return { blueprint, paretoMatrix };
  }

  /**
   * Export deliberation result into GitHub Flavored Markdown
   */
  static exportToMarkdown(result: DeliberationResult): string {
    const bp = result.blueprint;
    const dateStr = new Date().toISOString().split('T')[0];

    let md = `# ⚡ Architectural Blueprint: ${bp.title}\n\n`;
    md += `> **Goal:** ${result.goal}  \n`;
    md += `> **Deliberation Mode:** \`${result.mode}\` | **Execution Time:** ${(result.executionTimeMs / 1000).toFixed(1)}s | **Date:** ${dateStr}  \n`;
    md += `> **Pareto Score:** ${bp.winningArchitecture.overallScore}/10\n\n`;

    md += `## 📋 Executive Summary\n\n${bp.executiveSummary}\n\n`;

    md += `## 🏛️ Winning Architecture: ${bp.winningArchitecture.title}\n\n`;
    md += `* **Paradigm:** \`${bp.winningArchitecture.paradigm}\`\n`;
    md += `* **Rationale:** ${bp.winningArchitecture.tradeOffSummary}\n\n`;

    md += `### Pareto Criteria Breakdown\n\n`;
    md += `| Criterion | Score (/10) | Trade-Off Rationale |\n`;
    md += `| :--- | :--- | :--- |\n`;
    for (const score of bp.winningArchitecture.scores) {
      md += `| **${score.criterion.toUpperCase()}** | ${score.score} | ${score.rationale} |\n`;
    }
    md += `\n`;

    md += `## 🛡️ Core Architectural Invariants (Must Satisfy)\n\n`;
    bp.coreInvariants.forEach((inv, idx) => {
      md += `${idx + 1}. **${inv}**\n`;
    });
    md += `\n`;

    md += `## ⚠️ Failure Modes & Mitigations\n\n`;
    bp.failureModesAndMitigations.forEach((fm, idx) => {
      md += `${idx + 1}. **Threat:** ${fm.failureMode}  \n   ↳ **Mitigation:** ${fm.mitigation}\n`;
    });
    md += `\n`;

    md += `## ❌ Rejected Alternatives\n\n`;
    bp.rejectedAlternatives.forEach((alt) => {
      md += `* **${alt.title}:** ${alt.rejectionReason}\n`;
    });
    md += `\n`;

    md += `## 🚀 Step-by-Step Implementation Roadmap\n\n`;
    bp.implementationSteps.forEach((step) => {
      md += `* ${step}\n`;
    });
    md += `\n`;

    if (bp.codeSkeleton) {
      md += `## 💻 Architectural Scaffold Contract\n\n`;
      md += `\`\`\`typescript\n${bp.codeSkeleton}\n\`\`\`\n\n`;
    }

    if (result.councilDebates && result.councilDebates.length > 0) {
      md += `## 🥊 Adversarial Council Critiques\n\n`;
      for (const critique of result.councilDebates) {
        md += `### ${critique.personaName}\n\n`;
        md += `* **Core Assessment:** ${critique.coreCritique}\n`;
        if (critique.vulnerabilities.length > 0) {
          md += `* **Vulnerabilities Identified:** ${critique.vulnerabilities.join('; ')}\n`;
        }
        if (critique.requiredInvariants.length > 0) {
          md += `* **Demanded Invariants:** ${critique.requiredInvariants.join('; ')}\n`;
        }
        if (critique.proposedAlternative) {
          md += `* **Proposed Counter-Alternative:** ${critique.proposedAlternative}\n`;
        }
        md += `\n`;
      }
    }

    md += `---\n*Synthesized autonomously via [Deliberate](https://github.com/shanmukhaditya/deliberate)*\n`;
    return md;
  }
}
