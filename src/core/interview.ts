import { LLMProvider } from './providers/base.js';

export interface InterviewQuestion {
  persona: string;
  question: string;
  whyItMatters: string;
}

export class CouncilInterviewer {
  constructor(private provider: LLMProvider) {}

  /**
   * Generates targeted clarifying questions from adversarial personas
   */
  async generateQuestions(goal: string, context?: string): Promise<InterviewQuestion[]> {
    const prompt = `
You are the Deliberate Adversarial Council.
Before deliberating on the user's goal: "${goal}", formulate 3-4 probing questions from distinct personas to expose hidden assumptions, scale targets, and security invariants.

${context ? `CONTEXT:\n${context}\n` : ''}

Respond ONLY with valid JSON array:
[
  {
    "persona": "Principal Architect",
    "question": "<Sharp architectural question>",
    "whyItMatters": "<Why answering this prevents architectural rework>"
  },
  {
    "persona": "Ruthless Contrarian",
    "question": "<Hard adversarial question>",
    "whyItMatters": "<Failure risk if ignored>"
  },
  {
    "persona": "Security Auditor",
    "question": "<Security / authorization boundary question>",
    "whyItMatters": "<Vulnerability prevented>"
  }
]
`.trim();

    try {
      const res = await this.provider.generate({
        messages: [{ role: 'user', content: prompt }],
        responseFormat: 'json',
        temperature: 0.3,
      });

      const parsed = res.parsedJson as InterviewQuestion[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fallback questions
    }

    return [
      {
        persona: 'Principal Architect',
        question: `What are the expected throughput, concurrency, and persistence guarantees for "${goal}"?`,
        whyItMatters: 'Dictates whether a lock-free memory ring or a durable distributed WAL is necessary.',
      },
      {
        persona: 'Ruthless Contrarian',
        question: 'What is the absolute worst failure mode that could crash this system in production?',
        whyItMatters: 'Identifies unhandled edge cases and runaway recursion cascades.',
      },
      {
        persona: 'Security Auditor',
        question: 'How are permissions, authorization tokens, and capability boundaries verified at runtime?',
        whyItMatters: 'Prevents privilege escalation and malicious payload execution.',
      },
    ];
  }
}
