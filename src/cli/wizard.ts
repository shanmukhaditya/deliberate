import * as p from '@clack/prompts';
import picocolors from 'picocolors';
import { ConfigManager, ModelSelection, UserDeliberateConfig } from '../core/config.js';
import { PersonaId } from '../core/types.js';

export const getProviderOptions = () => [
  { value: 'gemini', label: 'Google Gemini', hint: 'Ultra-fast, massive context window (Gemini 2.5 Flash/Pro)' },
  { value: 'anthropic', label: 'Anthropic Claude', hint: 'Elite software architecture & nuance (Claude 3.7 Sonnet)' },
  { value: 'openai', label: 'OpenAI / Codex', hint: 'Industry-standard reasoning & coding (GPT-4o / o3-mini)' },
  { value: 'deepseek', label: 'DeepSeek', hint: 'Deep mathematical & logic reasoning (DeepSeek-R1 / V3)' },
  { value: 'ollama', label: 'Local Ollama', hint: '100% Free, private, and offline on localhost:11434' },
];

export class ModelConfigWizard {
  static async run(): Promise<UserDeliberateConfig> {
    console.clear();
    p.intro(picocolors.bold(picocolors.cyan('⚡ Deliberate Model & Council Persona Selector')));

    // 1. Choose Setup Style
    const setupType = await p.select({
      message: 'How would you like to configure models for your Adversarial Council?',
      options: [
        {
          value: 'unified',
          label: 'Unified: Use ONE model for all personas',
          hint: 'Simple, fast, uses a single API key',
        },
        {
          value: 'individual',
          label: 'Mix-and-Match: Individually select models per persona',
          hint: 'Elite setup (e.g. DeepSeek-R1 for Red-Team + Claude 3.7 for Architecture)',
        },
      ],
    });

    if (p.isCancel(setupType)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    let config: UserDeliberateConfig;

    if (setupType === 'unified') {
      const selectedProvider = await p.select({
        message: 'Select the primary LLM Provider for all deliberation phases:',
        options: getProviderOptions(),
      });

      if (p.isCancel(selectedProvider)) {
        p.cancel('Setup cancelled.');
        process.exit(0);
      }

      config = {
        mode: 'unified',
        unified: {
          provider: selectedProvider as ModelSelection['provider'],
        },
      };
    } else {
      p.note(
        'You can now assign specialized models to each persona for maximum cognitive diversity.',
        'Council Mix-and-Match Configuration'
      );

      const personasToConfigure: { id: PersonaId; name: string; desc: string; defaultProvider: string }[] = [
        { id: 'architect', name: 'The Principal Architect', desc: 'System modularity & evolvability', defaultProvider: 'anthropic' },
        { id: 'contrarian', name: 'The Ruthless Contrarian (Red-Teamer)', desc: 'Stress-tests & hunts hidden flaws', defaultProvider: 'deepseek' },
        { id: 'performance', name: 'The Performance Hacker', desc: 'Zero-copy, p99 latency & memory', defaultProvider: 'gemini' },
        { id: 'dx', name: 'The DX & Ergonomics Purist', desc: 'API elegance & minimal boilerplate', defaultProvider: 'anthropic' },
        { id: 'security', name: 'The Security Auditor', desc: 'Zero-trust boundaries & injection safety', defaultProvider: 'openai' },
        { id: 'pragmatist', name: 'The Pragmatist (KISS/YAGNI)', desc: 'Cuts over-engineering & complexity', defaultProvider: 'gemini' },
      ];

      const personaSelections: Partial<Record<PersonaId, ModelSelection>> = {};

      for (const persona of personasToConfigure) {
        const choice = await p.select({
          message: `Model for ${picocolors.bold(persona.name)} (${picocolors.dim(persona.desc)}):`,
          initialValue: persona.defaultProvider,
          options: getProviderOptions(),
        });

        if (p.isCancel(choice)) {
          p.cancel('Setup cancelled.');
          process.exit(0);
        }

        personaSelections[persona.id] = {
          provider: choice as ModelSelection['provider'],
        };
      }

      // Synthesizer Model
      const synthChoice = await p.select({
        message: `Model for ${picocolors.bold('Master Dialectical Synthesizer')} (${picocolors.dim('Reconciles Pareto Blueprint')}):`,
        initialValue: 'anthropic',
        options: getProviderOptions(),
      });

      if (p.isCancel(synthChoice)) {
        p.cancel('Setup cancelled.');
        process.exit(0);
      }

      config = {
        mode: 'individual',
        personas: personaSelections,
        synthesizer: {
          provider: synthChoice as ModelSelection['provider'],
        },
      };
    }

    // Save Scope Selection
    const saveScope = await p.select({
      message: 'Where should this configuration be saved?',
      options: [
        { value: 'project', label: 'Local Project Config (./deliberate.config.json)', hint: 'Applies to this repository only' },
        { value: 'global', label: 'Global User Config (~/.deliberaterc)', hint: 'Applies across all projects on your machine' },
      ],
    });

    if (p.isCancel(saveScope)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    const savedPath = await ConfigManager.save(config, saveScope === 'global');
    p.outro(picocolors.green(`✔ Configuration saved successfully to ${picocolors.bold(savedPath)}!`));

    return config;
  }
}
