import * as p from '@clack/prompts';
import picocolors from 'picocolors';
import { ConfigManager, ModelSelection, UserDeliberateConfig } from '../core/config.js';
import { PersonaId } from '../core/types.js';
import { OllamaProvider } from '../core/providers/deepseek_ollama.js';

export const getProviderOptions = () => [
  { value: 'gemini', label: 'Google Gemini', hint: 'Frontier speed & context (Gemini 3.6 Flash / 3.5 Pro)' },
  { value: 'anthropic', label: 'Anthropic Claude', hint: 'State-of-the-art software architecture (Claude 5 Sonnet / 4.5)' },
  { value: 'openai', label: 'OpenAI / Codex', hint: 'Frontier reasoning & execution (GPT-5.6 / o3-mini)' },
  { value: 'deepseek', label: 'DeepSeek', hint: 'Deep mathematical & logic reasoning (DeepSeek-R2 / V3)' },
  { value: 'ollama', label: 'Local Ollama', hint: '100% Free, private, and offline on localhost:11434' },
];

export async function promptModelForProvider(
  provider: ModelSelection['provider'],
  entityName: string
): Promise<string> {
  if (provider === 'ollama') {
    const installed = await OllamaProvider.getInstalledModels();
    const modelOptions = installed.length > 0
      ? installed.map((m) => ({ value: m, label: m, hint: 'Installed locally in Ollama' }))
      : [
          { value: 'deepseek-r2', label: 'deepseek-r2', hint: 'Latest reasoning model' },
          { value: 'qwen3:32b', label: 'qwen3:32b', hint: 'Latest coding flagship' },
          { value: 'llama4:latest', label: 'llama4:latest', hint: 'Latest open model' },
          { value: 'deepseek-r1:14b', label: 'deepseek-r1:14b', hint: 'Fast reasoning' },
        ];

    modelOptions.push({ value: '__custom__', label: 'Custom / Other Ollama Model...', hint: 'Type custom model tag' });

    const selectedModel = await p.select({
      message: `Select exact Ollama model for ${picocolors.bold(entityName)}:`,
      options: modelOptions,
      initialValue: modelOptions[0]?.value,
    });

    if (p.isCancel(selectedModel)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (selectedModel === '__custom__') {
      const customTag = await p.text({
        message: `Enter the Ollama model tag for ${entityName} (e.g. mistral:latest, phi4:latest):`,
        placeholder: 'deepseek-r2',
        validate: (val) => (!val || val.trim().length === 0 ? 'Model tag cannot be empty.' : undefined),
      });

      if (p.isCancel(customTag)) {
        p.cancel('Setup cancelled.');
        process.exit(0);
      }
      return customTag.trim();
    }

    return selectedModel as string;
  }

  if (provider === 'gemini') {
    const geminiOptions = [
      { value: 'gemini-3.6-flash', label: 'gemini-3.6-flash', hint: 'Latest (Ultra-fast, massive throughput)' },
      { value: 'gemini-3.5-pro', label: 'gemini-3.5-pro', hint: 'Latest deep reasoning flagship' },
      { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash', hint: 'Stable fast tier' },
      { value: 'gemini-2.5-pro', label: 'gemini-2.5-pro', hint: 'High-capability tier' },
      { value: '__custom__', label: 'Custom Gemini Model ID...', hint: 'Type custom model name' },
    ];

    const chosen = await p.select({
      message: `Select Gemini model for ${picocolors.bold(entityName)}:`,
      options: geminiOptions,
      initialValue: 'gemini-3.6-flash',
    });

    if (p.isCancel(chosen)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (chosen === '__custom__') {
      const custom = await p.text({ message: 'Enter custom Gemini model ID:', placeholder: 'gemini-3.6-flash' });
      if (p.isCancel(custom)) process.exit(0);
      return custom.trim();
    }
    return chosen as string;
  }

  if (provider === 'anthropic') {
    const claudeOptions = [
      { value: 'claude-5-sonnet', label: 'claude-5-sonnet', hint: 'Latest (Frontier architecture + deep reasoning)' },
      { value: 'claude-5-opus', label: 'claude-5-opus', hint: 'Maximum intelligence flagship' },
      { value: 'claude-4.5-sonnet', label: 'claude-4.5-sonnet', hint: 'High capability tier' },
      { value: 'claude-3-7-sonnet-20250219', label: 'claude-3-7-sonnet', hint: 'Hybrid thinking model' },
      { value: '__custom__', label: 'Custom Claude Model ID...', hint: 'Type custom model name' },
    ];

    const chosen = await p.select({
      message: `Select Claude model for ${picocolors.bold(entityName)}:`,
      options: claudeOptions,
      initialValue: 'claude-5-sonnet',
    });

    if (p.isCancel(chosen)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (chosen === '__custom__') {
      const custom = await p.text({ message: 'Enter custom Claude model ID:', placeholder: 'claude-5-sonnet' });
      if (p.isCancel(custom)) process.exit(0);
      return custom.trim();
    }
    return chosen as string;
  }

  if (provider === 'openai') {
    const openaiOptions = [
      { value: 'gpt-5.6', label: 'gpt-5.6', hint: 'Latest (Next-gen reasoning & architecture flagship)' },
      { value: 'gpt-5', label: 'gpt-5', hint: 'Frontier intelligence model' },
      { value: 'o3-mini', label: 'o3-mini', hint: 'High-speed reasoning model' },
      { value: 'gpt-4o', label: 'gpt-4o', hint: 'Standard multimodal model' },
      { value: '__custom__', label: 'Custom OpenAI Model ID...', hint: 'Type custom model name' },
    ];

    const chosen = await p.select({
      message: `Select OpenAI model for ${picocolors.bold(entityName)}:`,
      options: openaiOptions,
      initialValue: 'gpt-5.6',
    });

    if (p.isCancel(chosen)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (chosen === '__custom__') {
      const custom = await p.text({ message: 'Enter custom OpenAI model ID:', placeholder: 'gpt-5.6' });
      if (p.isCancel(custom)) process.exit(0);
      return custom.trim();
    }
    return chosen as string;
  }

  if (provider === 'deepseek') {
    const deepseekOptions = [
      { value: 'deepseek-r2', label: 'deepseek-r2', hint: 'Latest (Next-gen reasoning & mathematical proof)' },
      { value: 'deepseek-reasoner', label: 'deepseek-reasoner (R1)', hint: 'Chain-of-thought logic flagship' },
      { value: 'deepseek-v3', label: 'deepseek-v3', hint: 'Latest high-throughput coding model' },
      { value: '__custom__', label: 'Custom DeepSeek Model ID...', hint: 'Type custom model name' },
    ];

    const chosen = await p.select({
      message: `Select DeepSeek model for ${picocolors.bold(entityName)}:`,
      options: deepseekOptions,
      initialValue: 'deepseek-r2',
    });

    if (p.isCancel(chosen)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (chosen === '__custom__') {
      const custom = await p.text({ message: 'Enter custom DeepSeek model ID:', placeholder: 'deepseek-r2' });
      if (p.isCancel(custom)) process.exit(0);
      return custom.trim();
    }
    return chosen as string;
  }

  return '';
}

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
          label: 'Unified: Use ONE provider & model for all personas',
          hint: 'Simple, fast, uses a single API key or local model',
        },
        {
          value: 'individual',
          label: 'Mix-and-Match: Individually select provider & model per persona',
          hint: 'Elite setup (e.g. DeepSeek-R2 for Red-Team + Claude 5 for Architecture)',
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

      const selectedModel = await promptModelForProvider(
        selectedProvider as ModelSelection['provider'],
        'All Personas'
      );

      config = {
        mode: 'unified',
        unified: {
          provider: selectedProvider as ModelSelection['provider'],
          model: selectedModel,
        },
      };
    } else {
      p.note(
        'You can now assign specialized providers and exact models to each persona for maximum cognitive diversity.',
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
          message: `Provider for ${picocolors.bold(persona.name)} (${picocolors.dim(persona.desc)}):`,
          initialValue: persona.defaultProvider,
          options: getProviderOptions(),
        });

        if (p.isCancel(choice)) {
          p.cancel('Setup cancelled.');
          process.exit(0);
        }

        const modelChoice = await promptModelForProvider(
          choice as ModelSelection['provider'],
          persona.name
        );

        personaSelections[persona.id] = {
          provider: choice as ModelSelection['provider'],
          model: modelChoice,
        };
      }

      // Synthesizer Model
      const synthProviderChoice = await p.select({
        message: `Provider for ${picocolors.bold('Master Dialectical Synthesizer')} (${picocolors.dim('Reconciles Pareto Blueprint')}):`,
        initialValue: 'anthropic',
        options: getProviderOptions(),
      });

      if (p.isCancel(synthProviderChoice)) {
        p.cancel('Setup cancelled.');
        process.exit(0);
      }

      const synthModelChoice = await promptModelForProvider(
        synthProviderChoice as ModelSelection['provider'],
        'Master Synthesizer'
      );

      config = {
        mode: 'individual',
        personas: personaSelections,
        synthesizer: {
          provider: synthProviderChoice as ModelSelection['provider'],
          model: synthModelChoice,
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
