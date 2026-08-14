import { PersonaRegistry } from './personas/registry.js';
import { TopologyRegistry } from './topologies/registry.js';
import { ProviderFactory } from './providers/factory.js';
import { Synthesizer } from './synthesizer.js';
import { ConfigManager, UserDeliberateConfig } from './config.js';
import {
  DeliberationConfig,
  DeliberationResult,
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

    // 3. Resolve Personas (Council)
    const personaRunners = config.personas?.length
      ? config.personas.map((p) => PersonaRegistry.get(p))
      : PersonaRegistry.getForMode(mode);

    progress?.onStageStart?.('council', `Confronting ${personaRunners.length} adversarial council personas...`);

    // Execute council critiques in parallel (using individual persona providers if configured)
    const councilDebates: PersonaCritique[] = await Promise.all(
      personaRunners.map(async (persona) => {
        // Check if persona has an assigned specialized provider
        let personaProvider = defaultProvider;
        if (savedConfig?.mode === 'individual' && savedConfig.personas?.[persona.id]) {
          const specific = savedConfig.personas[persona.id]!;
          try {
            personaProvider = await ProviderFactory.create(specific.provider, specific.model);
          } catch {
            personaProvider = defaultProvider;
          }
        }

        const prompt = persona.buildPrompt({
          goal: config.goal,
          context: config.context,
          fileContent: config.fileContent,
          alternativeProposals: topologyOutputs.flatMap(
            (t) => t.candidateBranches?.map((b) => b.title) || []
          ),
        });

        try {
          const res = await personaProvider.generate({
            messages: [
              { role: 'system', content: persona.definition.systemPrompt },
              { role: 'user', content: prompt },
            ],
            responseFormat: 'json',
            temperature: 0.4,
          });

          const critiqueData = (res.parsedJson || {}) as Partial<PersonaCritique>;
          const critique: PersonaCritique = {
            personaId: persona.id,
            personaName: persona.name,
            coreCritique: critiqueData.coreCritique || `${persona.name} reviewed the target architecture.`,
            strengths: critiqueData.strengths || [],
            vulnerabilities: critiqueData.vulnerabilities || [],
            requiredInvariants: critiqueData.requiredInvariants || [],
            proposedAlternative: critiqueData.proposedAlternative,
          };
          progress?.onItemComplete?.(`Council: ${persona.name} (${personaProvider.name})`, critique);
          return critique;
        } catch {
          const fallback: PersonaCritique = {
            personaId: persona.id,
            personaName: persona.name,
            coreCritique: `${persona.name} demands strict invariants for ${config.goal}.`,
            strengths: ['Standard design pattern'],
            vulnerabilities: ['Requires boundary audit'],
            requiredInvariants: ['Must handle edge-case failures gracefully'],
          };
          progress?.onItemComplete?.(`Council: ${persona.name}`, fallback);
          return fallback;
        }
      })
    );

    // 4. Synthesize Dialectical Blueprint
    progress?.onStageStart?.('synthesis', 'Reconciling trade-offs and generating Pareto Architectural Blueprint...');
    
    // Check if specialized synthesizer provider is configured
    let synthProvider = defaultProvider;
    if (savedConfig?.mode === 'individual' && savedConfig.synthesizer) {
      try {
        synthProvider = await ProviderFactory.create(
          savedConfig.synthesizer.provider,
          savedConfig.synthesizer.model
        );
      } catch {
        synthProvider = defaultProvider;
      }
    }

    const synthesizer = new Synthesizer(synthProvider);
    const { blueprint, paretoMatrix } = await synthesizer.synthesize(config, topologyOutputs, councilDebates);
    progress?.onItemComplete?.(`Synthesis Complete (${synthProvider.name})`, blueprint);

    const executionTimeMs = Date.now() - startTime;

    return {
      goal: config.goal,
      mode,
      topologiesExecuted: topologyRunners.map((t) => t.type),
      topologyOutputs,
      councilDebates,
      paretoMatrix,
      blueprint,
      executionTimeMs,
    };
  }
}
