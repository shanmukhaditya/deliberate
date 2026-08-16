import { z } from 'zod';

export type PersonaId =
  | 'architect'
  | 'contrarian'
  | 'performance'
  | 'dx'
  | 'security'
  | 'pragmatist';

export type TopologyType =
  | 'first-principles'
  | 'inversion'
  | 'triz'
  | 'scamper'
  | 'tree-of-thoughts';

export type DeliberationMode =
  | 'flash'           // Rapid 2-agent check (10s)
  | 'council'         // Balanced multi-persona dialectic (30s)
  | 'deep-explore'    // Full Tree-of-Thoughts + Pareto trade-off matrix
  | 'red-team';       // Pure adversarial stress test on existing code

export interface DeliberationConfig {
  goal: string;
  context?: string;
  filePath?: string;
  fileContent?: string;
  mode?: DeliberationMode;
  topologies?: TopologyType[];
  personas?: PersonaId[];
  provider?: string;
  model?: string;
  temperature?: number;
  rounds?: number;
  maxRounds?: number;
  constraints?: string[];
}

export interface PersonaDefinition {
  id: PersonaId;
  name: string;
  title: string;
  stance: string;
  cognitiveDuty: string;
  systemPrompt: string;
  bias: 'structural' | 'adversarial' | 'efficiency' | 'ergonomics' | 'resilience' | 'simplicity';
}

export interface PersonaCritique {
  personaId: PersonaId;
  personaName: string;
  round?: number;
  coreCritique: string;
  strengths: string[];
  vulnerabilities: string[];
  requiredInvariants: string[];
  proposedAlternative?: string;
  rebuttals?: {
    targetPersona: string;
    critique: string;
  }[];
}

export interface TopologyOutput {
  topology: TopologyType;
  title: string;
  deconstructedAxioms?: string[];
  antiProblemFailures?: string[];
  trizContradictions?: {
    improvingParameter: string;
    worseningParameter: string;
    inventivePrinciple: string;
    resolution: string;
  }[];
  scamperMutations?: {
    operator: 'Substitute' | 'Combine' | 'Adapt' | 'Modify' | 'PutToUse' | 'Eliminate' | 'Reverse';
    mutation: string;
    verdict: string;
  }[];
  candidateBranches?: {
    id: string;
    title: string;
    description: string;
    pros: string[];
    cons: string[];
  }[];
}

export interface ParetoCriterionScore {
  criterion: 'performance' | 'dx_ergonomics' | 'simplicity' | 'security' | 'extensibility';
  score: number; // 1 to 10
  rationale: string;
}

export interface CandidateArchitecture {
  id: string;
  title: string;
  summary: string;
  paradigm: string;
  scores: ParetoCriterionScore[];
  overallScore: number;
  tradeOffSummary: string;
}

export interface ArchitecturalBlueprint {
  title: string;
  executiveSummary: string;
  winningArchitecture: CandidateArchitecture;
  rejectedAlternatives: {
    title: string;
    rejectionReason: string;
  }[];
  coreInvariants: string[];
  failureModesAndMitigations: {
    failureMode: string;
    mitigation: string;
  }[];
  implementationSteps: string[];
  codeSkeleton?: string;
}

export interface DeliberationTelemetry {
  roundsCompleted: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  providersUsed: string[];
}

export interface DeliberationResult {
  goal: string;
  mode: DeliberationMode;
  context?: string;
  topologiesExecuted: TopologyType[];
  topologyOutputs: TopologyOutput[];
  councilDebates: PersonaCritique[];
  paretoMatrix: CandidateArchitecture[];
  blueprint: ArchitecturalBlueprint;
  executionTimeMs: number;
  telemetry?: DeliberationTelemetry;
}

// Zod schemas for structured runtime validation
export const ParetoCriterionScoreSchema = z.object({
  criterion: z.enum(['performance', 'dx_ergonomics', 'simplicity', 'security', 'extensibility']),
  score: z.number().min(1).max(10),
  rationale: z.string(),
});

export const CandidateArchitectureSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  paradigm: z.string(),
  scores: z.array(ParetoCriterionScoreSchema),
  overallScore: z.number(),
  tradeOffSummary: z.string(),
});

export const ArchitecturalBlueprintSchema = z.object({
  title: z.string(),
  executiveSummary: z.string(),
  winningArchitecture: CandidateArchitectureSchema,
  rejectedAlternatives: z.array(
    z.object({
      title: z.string(),
      rejectionReason: z.string(),
    })
  ),
  coreInvariants: z.array(z.string()),
  failureModesAndMitigations: z.array(
    z.object({
      failureMode: z.string(),
      mitigation: z.string(),
    })
  ),
  implementationSteps: z.array(z.string()),
  codeSkeleton: z.string().optional(),
});
