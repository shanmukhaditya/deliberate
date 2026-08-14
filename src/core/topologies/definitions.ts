import { BaseTopology, TopologyContext } from './base.js';
import { TopologyType } from '../types.js';

export class FirstPrinciplesTopology extends BaseTopology {
  readonly type: TopologyType = 'first-principles';
  readonly title = 'First-Principles Deconstruction';
  readonly description =
    'Recursively strip away all conventional libraries, frameworks, and habits until only foundational physics, constraints, and mathematical realities remain.';

  buildPrompt(context: TopologyContext): string {
    return `
You are the First-Principles Deconstruction Engine in the Deliberate reasoning system.

GOAL / SYSTEM TO DECONSTRUCT:
${context.goal}

${context.context ? `CONTEXT:\n${context.context}\n` : ''}
${context.constraints?.length ? `HARD CONSTRAINTS:\n- ${context.constraints.join('\n- ')}\n` : ''}

INSTRUCTIONS:
1. Identify all default, lazy assumptions people make for this problem (e.g. "We need Redis", "We need a database table", "We need a microservice").
2. Strip away the assumptions to bare computational & physical constraints: What is the true data throughput? Memory limit? Latency boundary? Network I/O? State mutation rate?
3. Build the optimal solution upward from pure axioms.

Respond ONLY with valid JSON matching this schema:
{
  "topology": "first-principles",
  "title": "First-Principles Deconstruction",
  "deconstructedAxioms": [
    "<Axiom 1: Core mathematical/physical reality of the problem>",
    "<Axiom 2: Fundamental constraint without any framework bias>",
    "<Axiom 3: The minimal theoretical data structure or algorithmic mechanism required>"
  ]
}
`.trim();
  }
}

export class InversionTopology extends BaseTopology {
  readonly type: TopologyType = 'inversion';
  readonly title = 'Inversion / The Anti-Problem (Jacobi Heuristic)';
  readonly description =
    'Design the system to intentionally fail as catastrophically as possible, then invert every failure mode into an absolute architectural invariant.';

  buildPrompt(context: TopologyContext): string {
    return `
You are the Inversion & Anti-Problem Engine (Jacobi's Heuristic) in the Deliberate reasoning system.

GOAL / SYSTEM:
${context.goal}

${context.context ? `CONTEXT:\n${context.context}\n` : ''}
${context.fileContent ? `TARGET CODE:\n\`\`\`\n${context.fileContent}\n\`\`\`\n` : ''}

INSTRUCTIONS:
1. Deliberately conceptualize how to engineer this system to produce the WORST OUTCOME:
   - Maximum race conditions, data loss, deadlock, split-brain, memory leaks, and cascading outages.
2. Invert each catastrophic failure into a non-negotiable architectural invariant / guardrail.

Respond ONLY with valid JSON matching this schema:
{
  "topology": "inversion",
  "title": "Inversion & Failure Invariants",
  "antiProblemFailures": [
    "<Failure 1: How the system catastrophically breaks in edge cases>",
    "<Failure 2: Memory/Network/State vulnerability under stress>",
    "<Failure 3: Subtly corrupting data or locking resources>"
  ]
}
`.trim();
  }
}

export class TrizTopology extends BaseTopology {
  readonly type: TopologyType = 'triz';
  readonly title = 'TRIZ Contradiction Resolution';
  readonly description =
    'Identify inherent technical contradictions (e.g. High Throughput vs Low Memory) and apply inventive principles to eliminate the compromise.';

  buildPrompt(context: TopologyContext): string {
    return `
You are the TRIZ (Theory of Inventive Problem Solving) Engine in the Deliberate reasoning system.

GOAL / SYSTEM:
${context.goal}

${context.context ? `CONTEXT:\n${context.context}\n` : ''}

INSTRUCTIONS:
1. Identify the fundamental engineering contradiction in this design (Parameter A improves, but Parameter B degrades).
2. Apply TRIZ inventive principles (e.g., Separation in Time/Space, Inversion of Control, Pre-computation/Prior Action, Dynamic Reconfiguration, Nested Asymmetry) to ELIMINATE the contradiction without compromise.

Respond ONLY with valid JSON matching this schema:
{
  "topology": "triz",
  "title": "TRIZ Contradiction Resolution",
  "trizContradictions": [
    {
      "improvingParameter": "<e.g. Query Latency>",
      "worseningParameter": "<e.g. Write Amplification & Memory Overhead>",
      "inventivePrinciple": "<e.g. Principle 19: Periodic Action / Asynchronous Batched Commit>",
      "resolution": "<Concrete algorithmic design resolving the contradiction>"
    }
  ]
}
`.trim();
  }
}

export class ScamperTopology extends BaseTopology {
  readonly type: TopologyType = 'scamper';
  readonly title = 'SCAMPER Architectural Mutation';
  readonly description =
    'Systematically apply 7 lateral thinking operators (Substitute, Combine, Adapt, Modify, Put to use, Eliminate, Reverse) to discover non-obvious designs.';

  buildPrompt(context: TopologyContext): string {
    return `
You are the SCAMPER Architectural Mutation Engine in the Deliberate reasoning system.

GOAL / SYSTEM:
${context.goal}

${context.context ? `CONTEXT:\n${context.context}\n` : ''}

INSTRUCTIONS:
Apply SCAMPER operators to generate creative, high-leverage architectural variations:
- Substitute (replace standard components with unconventional primitives)
- Combine (merge disparate lifecycles into a single atomic pass)
- Adapt (borrow a mechanism from OS kernels, DB internals, or physics)
- Modify/Magnify/Minify (what if scale is 100x? what if resources are tiny?)
- Put to another use (reuse existing data structures for secondary capabilities)
- Eliminate (remove entire layers/dependencies)
- Reverse/Rearrange (flip push to pull, eager to lazy, client to server)

Respond ONLY with valid JSON matching this schema:
{
  "topology": "scamper",
  "title": "SCAMPER Architectural Mutation",
  "scamperMutations": [
    {
      "operator": "Substitute",
      "mutation": "<Specific replacement proposed>",
      "verdict": "<Why this unlocks higher performance or simplicity>"
    },
    {
      "operator": "Eliminate",
      "mutation": "<Layer or dependency eliminated>",
      "verdict": "<Impact on operational overhead and velocity>"
    },
    {
      "operator": "Reverse",
      "mutation": "<Order or flow inverted>",
      "verdict": "<Impact on latency or state management>"
    }
  ]
}
`.trim();
  }
}

export class TreeOfThoughtsTopology extends BaseTopology {
  readonly type: TopologyType = 'tree-of-thoughts';
  readonly title = 'Tree-of-Thoughts Exploration';
  readonly description =
    'Branch into 3-4 distinct architectural paradigms and evaluate their structural trade-offs.';

  buildPrompt(context: TopologyContext): string {
    return `
You are the Tree-of-Thoughts Branching Engine in the Deliberate reasoning system.

GOAL / SYSTEM:
${context.goal}

${context.context ? `CONTEXT:\n${context.context}\n` : ''}

INSTRUCTIONS:
Generate 3 distinct, competitive architectural candidate branches:
- Branch 1: The Maximum-Performance / Zero-Copy approach
- Branch 2: The Minimalist / Zero-Dependency approach (KISS)
- Branch 3: The Highly Extensible / Modular Distributed approach

Respond ONLY with valid JSON matching this schema:
{
  "topology": "tree-of-thoughts",
  "title": "Tree-of-Thoughts Exploration",
  "candidateBranches": [
    {
      "id": "branch_1",
      "title": "<Branch 1 Name>",
      "description": "<Concise architecture overview>",
      "pros": ["<Pro 1>", "<Pro 2>"],
      "cons": ["<Con 1>", "<Con 2>"]
    },
    {
      "id": "branch_2",
      "title": "<Branch 2 Name>",
      "description": "<Concise architecture overview>",
      "pros": ["<Pro 1>", "<Pro 2>"],
      "cons": ["<Con 1>", "<Con 2>"]
    },
    {
      "id": "branch_3",
      "title": "<Branch 3 Name>",
      "description": "<Concise architecture overview>",
      "pros": ["<Pro 1>", "<Pro 2>"],
      "cons": ["<Con 1>", "<Con 2>"]
    }
  ]
}
`.trim();
  }
}
