import { PersonaRegistry } from './personas/registry.js';
import { TopologyRegistry } from './topologies/registry.js';
import { ProviderFactory } from './providers/factory.js';
import { Synthesizer } from './synthesizer.js';
import { ConfigManager, UserDeliberateConfig } from './config.js';
import {
  DeliberationConfig,
  DeliberationResult,
  DeliberationTelemetry,
  PersonaCritique,
  TopologyOutput,
} from './types.js';

export interface ProgressCallback {
  onStageStart?: (stage: 'topologies' | 'council' | 'synthesis', detail: string) => void;
  onItemComplete?: (item: string, result: unknown) => void;
}

export class DeliberationEngine {
  async run(
    config: DeliberationConfig,
    progress?: ProgressCallback
  ): Promise<DeliberationResult> {
    const startTime = Date.now();
    const mode = config.mode || 'council';
    const totalRounds = Math.max(1, Math.min(config.rounds || 1, 5));

    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    const providersUsed = new Set<string>();

    // 1. Load persisted configuration if available
    const savedConfig: UserDeliberateConfig | null = await ConfigManager.load();

    // Default primary provider
    const primaryProviderName =
      config.provider ||
      (savedConfig?.mode === 'unified' ? savedConfig.unified?.provider : undefined);

    const primaryModel =
      config.model ||
      (savedConfig?.mode === 'unified' ? savedConfig.unified?.model : undefined);

    const defaultProvider = await ProviderFactory.create(primaryProviderName, primaryModel);
    providersUsed.add(defaultProvider.name);

    // 2. Resolve Topologies
    const topologyRunners = config.topologies?.length
      ? config.topologies.map((t) => TopologyRegistry.get(t))
      : TopologyRegistry.getForMode(mode);

    progress?.onStageStart?.('topologies', `Executing ${topologyRunners.length} thinking topologies...`);

    // Execute topologies in parallel
    const topologyOutputs: TopologyOutput[] = await Promise.all(
      topologyRunners.map(async (top) => {
        const prompt = top.buildPrompt({
          goal: config.goal,
          context: config.context,
          fileContent: config.fileContent,
          constraints: config.constraints,
        });

        try {
          const res = await defaultProvider.generate({
            messages: [{ role: 'user', content: prompt }],
            responseFormat: 'json',
            temperature: 0.3,
          });

          if (res.usage) {
            totalPromptTokens += res.usage.promptTokens;
            totalCompletionTokens += res.usage.completionTokens;
          }

          const output = (res.parsedJson as TopologyOutput) || {
            topology: top.type,
            title: top.title,
          };
          progress?.onItemComplete?.(`Topology: ${top.title}`, output);
          return output;
        } catch {
          const fallback: TopologyOutput = {
            topology: top.type,
            title: top.title,
            deconstructedAxioms: [`Axiom: Evaluated constraint under ${top.title}`],
          };
          progress?.onItemComplete?.(`Topology: ${top.title}`, fallback);
          return fallback;
        }
      })
    );

    // 3. Resolve Personas (Council) & Multi-Round Dialectic
    const personaRunners = config.personas?.length
      ? config.personas.map((p) => PersonaRegistry.get(p))
      : PersonaRegistry.getForMode(mode);

    let allCouncilDebates: PersonaCritique[] = [];
    let previousRoundDebates: PersonaCritique[] = [];

    for (let currentRound = 1; currentRound <= totalRounds; currentRound++) {
      const roundLabel = totalRounds > 1 ? ` (Round ${currentRound}/${totalRounds})` : '';
      progress?.onStageStart?.(
        'council',
        `Confronting ${personaRunners.length} adversarial council personas${roundLabel}...`
      );

      const roundDebates: PersonaCritique[] = await Promise.all(
        personaRunners.map(async (persona) => {
          let personaProvider = defaultProvider;
          if (savedConfig?.mode === 'individual' && savedConfig.personas?.[persona.id]) {
            const specific = savedConfig.personas[persona.id]!;
            try {
              personaProvider = await ProviderFactory.create(specific.provider, specific.model);
              providersUsed.add(personaProvider.name);
            } catch {
              personaProvider = defaultProvider;
            }
          }

          let prompt = persona.buildPrompt({
            goal: config.goal,
            context: config.context,
            fileContent: config.fileContent,
            alternativeProposals: topologyOutputs.flatMap(
              (t) => t.candidateBranches?.map((b) => b.title) || []
            ),
          });

          // In round 2+, cross-examine previous round's peer critiques
          if (currentRound > 1 && previousRoundDebates.length > 0) {
            const peerSummary = previousRoundDebates
              .filter((d) => d.personaId !== persona.id)
              .map(
                (d) =>
                  `[${d.personaName}]: Core Critique: ${d.coreCritique}. Invariants Demanded: ${d.requiredInvariants.join(', ')}`
              )
              .join('\n');

            prompt += `\n\nCROSS-EXAMINATION (ROUND ${currentRound}):\nHere are the critiques from your fellow council members in the previous round:\n${peerSummary}\n\nRebut any weak assumptions made by your peers, attack their overheads, and sharpen your non-negotiable invariants.`;
          }

          try {
            const res = await personaProvider.generate({
              messages: [
                { role: 'system', content: persona.definition.systemPrompt },
                { role: 'user', content: prompt },
              ],
              responseFormat: 'json',
              temperature: 0.4,
            });

            if (res.usage) {
              totalPromptTokens += res.usage.promptTokens;
              totalCompletionTokens += res.usage.completionTokens;
            }

            const critiqueData = (res.parsedJson || {}) as Partial<PersonaCritique>;
            const critique: PersonaCritique = {
              personaId: persona.id,
              personaName: persona.name,
              round: currentRound,
              coreCritique:
                critiqueData.coreCritique || `${persona.name} reviewed the target architecture.`,
              strengths: critiqueData.strengths || [],
              vulnerabilities: critiqueData.vulnerabilities || [],
              requiredInvariants: critiqueData.requiredInvariants || [],
              proposedAlternative: critiqueData.proposedAlternative,
            };
            progress?.onItemComplete?.(
              `Council${roundLabel}: ${persona.name} (${personaProvider.name})`,
              critique
            );
            return critique;
          } catch {
            const fallback: PersonaCritique = {
              personaId: persona.id,
              personaName: persona.name,
              round: currentRound,
              coreCritique: `${persona.name} demands strict invariants for ${config.goal}.`,
              strengths: ['Standard design pattern'],
              vulnerabilities: ['Requires boundary audit'],
              requiredInvariants: ['Must handle edge-case failures gracefully'],
            };
            progress?.onItemComplete?.(`Council${roundLabel}: ${persona.name}`, fallback);
            return fallback;
          }
        })
      );

      previousRoundDebates = roundDebates;
      allCouncilDebates = roundDebates; // Final round critiques fed into synthesis
    }

    // 4. Synthesize Dialectical Blueprint
    progress?.onStageStart?.('synthesis', 'Reconciling trade-offs and generating Pareto Architectural Blueprint...');

    let synthProvider = defaultProvider;
    if (savedConfig?.mode === 'individual' && savedConfig.synthesizer) {
      try {
        synthProvider = await ProviderFactory.create(
          savedConfig.synthesizer.provider,
          savedConfig.synthesizer.model
        );
        providersUsed.add(synthProvider.name);
      } catch {
        synthProvider = defaultProvider;
      }
    }

    const synthesizer = new Synthesizer(synthProvider);
    const { blueprint, paretoMatrix } = await synthesizer.synthesize(
      config,
      topologyOutputs,
      allCouncilDebates
    );
    progress?.onItemComplete?.(`Synthesis Complete (${synthProvider.name})`, blueprint);

    const executionTimeMs = Date.now() - startTime;

    const telemetry: DeliberationTelemetry = {
      roundsCompleted: totalRounds,
      totalPromptTokens,
      totalCompletionTokens,
      totalTokens: totalPromptTokens + totalCompletionTokens,
      providersUsed: Array.from(providersUsed),
    };

    return {
      goal: config.goal,
      mode,
      context: config.context,
      topologiesExecuted: topologyRunners.map((t) => t.type),
      topologyOutputs,
      councilDebates: allCouncilDebates,
      paretoMatrix,
      blueprint,
      executionTimeMs,
      telemetry,
    };
  }
}
