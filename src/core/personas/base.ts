import { PersonaDefinition, PersonaId } from '../types.js';

export interface PersonaEvaluationContext {
  goal: string;
  context?: string;
  fileContent?: string;
  proposedArchitecture?: string;
  alternativeProposals?: string[];
}

export abstract class BasePersona {
  abstract readonly definition: PersonaDefinition;

  get id(): PersonaId {
    return this.definition.id;
  }

  get name(): string {
    return this.definition.name;
  }

  get title(): string {
    return this.definition.title;
  }

  buildPrompt(context: PersonaEvaluationContext): string {
    return `
You are ${this.definition.name}, acting as the ${this.definition.title}.
Your Cognitive Duty: ${this.definition.cognitiveDuty}
Your Stance: ${this.definition.stance}

CRITICAL ANTI-SYCOPHANCY RULE:
Do NOT be polite, agreeable, or generic. Do not say "I agree with other points."
Focus 100% on your specific domain lens. Attack flaws, identify missing invariants, and demand rigorous engineering standards.

OBJECTIVE / GOAL TO DELIBERATE:
${context.goal}

${context.context ? `CONTEXT:\n${context.context}\n` : ''}
${context.fileContent ? `TARGET CODE:\n\`\`\`\n${context.fileContent}\n\`\`\`\n` : ''}
${context.proposedArchitecture ? `PROPOSED ARCHITECTURE UNDER EVALUATION:\n${context.proposedArchitecture}\n` : ''}

Provide your structured deliberation critique in the following JSON format:
{
  "coreCritique": "<concise, unsparing 2-3 sentence core analysis>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "vulnerabilities": ["<vulnerability/attack vector 1>", "<vulnerability/attack vector 2>"],
  "requiredInvariants": ["<hard rule/invariant 1 that code MUST satisfy>", "<hard rule/invariant 2>"],
  "proposedAlternative": "<concrete alternative pattern or mechanism if current is flawed>"
}
`.trim();
  }
}
