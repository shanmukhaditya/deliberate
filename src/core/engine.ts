import { PersonaRegistry } from './personas/registry.js';
import { TopologyRegistry } from './topologies/registry.js';
import { ProviderFactory } from './providers/factory.js';
import { Synthesizer } from './synthesizer.js';
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

    // 1. Resolve LLM Provider
    const provider = await ProviderFactory.create(config.provider, config.model);

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
          const res = await provider.generate({
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

    // Execute council critiques in parallel
    const councilDebates: PersonaCritique[] = await Promise.all(
      personaRunners.map(async (persona) => {
        const prompt = persona.buildPrompt({
          goal: config.goal,
          context: config.context,
          fileContent: config.fileContent,
          alternativeProposals: topologyOutputs.flatMap(
            (t) => t.candidateBranches?.map((b) => b.title) || []
          ),
        });

        try {
          const res = await provider.generate({
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
          progress?.onItemComplete?.(`Council: ${persona.name}`, critique);
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
    const synthesizer = new Synthesizer(provider);
    const { blueprint, paretoMatrix } = await synthesizer.synthesize(config, topologyOutputs, councilDebates);
    progress?.onItemComplete?.('Synthesis Complete', blueprint);

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
