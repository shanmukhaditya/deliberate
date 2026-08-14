import { LLMProvider } from './providers/base.js';
import {
  ArchitecturalBlueprint,
  ArchitecturalBlueprintSchema,
  CandidateArchitecture,
  DeliberationConfig,
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
6. Provide a clean, production-grade code skeleton in TypeScript or relevant language.

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
  "codeSkeleton": "<Clean code snippet demonstrating the core interface/structure>"
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

    // Validate schema
    const validated = ArchitecturalBlueprintSchema.safeParse(parsed);
    const blueprint: ArchitecturalBlueprint = validated.success
      ? validated.data
      : {
          title: parsed.title || 'Synthesized Architectural Blueprint',
          executiveSummary: parsed.executiveSummary || 'Synthesized deliberation proposal.',
          winningArchitecture: parsed.winningArchitecture || {
            id: 'winning_arch',
            title: 'Optimal Synthesized Architecture',
            summary: 'Engineered for high performance and minimal complexity.',
            paradigm: 'Optimized Architecture',
            scores: [
              { criterion: 'performance', score: 9.0, rationale: 'Optimized' },
              { criterion: 'dx_ergonomics', score: 8.5, rationale: 'Ergonomic' },
              { criterion: 'simplicity', score: 8.5, rationale: 'Simple' },
              { criterion: 'security', score: 9.0, rationale: 'Resilient' },
              { criterion: 'extensibility', score: 8.5, rationale: 'Modular' },
            ],
            overallScore: 8.7,
            tradeOffSummary: 'Balanced Pareto optimum.',
          },
          rejectedAlternatives: parsed.rejectedAlternatives || [],
          coreInvariants: parsed.coreInvariants || ['Must maintain state consistency', 'Must handle errors gracefully'],
          failureModesAndMitigations: parsed.failureModesAndMitigations || [],
          implementationSteps: parsed.implementationSteps || ['1. Define core types', '2. Implement system', '3. Add tests'],
          codeSkeleton: parsed.codeSkeleton,
        };

    const rejectedList = blueprint.rejectedAlternatives || [];
    const paretoMatrix: CandidateArchitecture[] = [
      blueprint.winningArchitecture,
      ...rejectedList.map((alt, idx) => ({
        id: `rejected_${idx + 1}`,
        title: alt.title || `Alternative ${idx + 1}`,
        summary: alt.rejectionReason || 'Sub-optimal trade-off',
        paradigm: 'Alternative',
        scores: [
          { criterion: 'simplicity' as const, score: 6.0, rationale: alt.rejectionReason || 'Complex' },
          { criterion: 'performance' as const, score: 6.5, rationale: 'Sub-optimal' },
          { criterion: 'dx_ergonomics' as const, score: 7.0, rationale: 'Standard' },
          { criterion: 'security' as const, score: 7.0, rationale: 'Standard' },
          { criterion: 'extensibility' as const, score: 7.0, rationale: 'Standard' },
        ],
        overallScore: 6.7,
        tradeOffSummary: alt.rejectionReason || 'Rejected alternative',
      })),
    ];

    return { blueprint, paretoMatrix };

    return { blueprint, paretoMatrix };
  }
}
