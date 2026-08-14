import * as p from '@clack/prompts';
import picocolors from 'picocolors';
import { ConfigManager, ModelSelection, UserDeliberateConfig } from '../core/config.js';
import { PersonaId } from '../core/types.js';
import { OllamaProvider } from '../core/providers/deepseek_ollama.js';

export const getProviderOptions = () => [
  { value: 'gemini', label: 'Google Gemini', hint: 'Frontier speed & 2M context (gemini-3.7-flash / 3.1-pro)' },
  { value: 'anthropic', label: 'Anthropic Claude', hint: 'State-of-the-art agentic architecture (claude-sonnet-5 / opus-5 / fable-5)' },
  { value: 'openai', label: 'OpenAI / Codex', hint: 'Flagship reasoning & cyber auditing (gpt-5.6-sol / luna / cyber)' },
  { value: 'deepseek', label: 'DeepSeek', hint: '1.6T MoE reasoning flagship (deepseek-v4-pro / v4-flash)' },
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
          { value: 'deepseek-v4-flash', label: 'deepseek-v4-flash', hint: 'Recommended for reasoning' },
          { value: 'deepseek-v4-pro', label: 'deepseek-v4-pro', hint: 'Flagship MoE model' },
          { value: 'qwen2.5-coder:32b', label: 'qwen2.5-coder:32b', hint: 'Elite local coding' },
          { value: 'llama3.3:70b', label: 'llama3.3:70b', hint: 'General intelligence' },
          { value: 'mistral:latest', label: 'mistral:latest', hint: 'Lightweight & fast' },
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
        message: `Enter the Ollama model tag for ${entityName} (e.g. phi4:latest, codellama:latest):`,
        placeholder: 'deepseek-v4-flash',
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
      { value: 'gemini-3.7-flash', label: 'gemini-3.7-flash', hint: 'Recommended (Latest Aug 2026 workhorse, agentic reasoning)' },
      { value: 'gemini-3.6-flash', label: 'gemini-3.6-flash', hint: 'High-throughput flash tier' },
      { value: 'gemini-3.1-pro', label: 'gemini-3.1-pro', hint: 'Pro class flagship (2M token context window)' },
      { value: 'gemini-3.5-flash', label: 'gemini-3.5-flash', hint: 'Sustained agentic runs' },
      { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash', hint: 'Cost-efficient production tier' },
      { value: '__custom__', label: 'Custom Gemini Model ID...', hint: 'Type custom model name' },
    ];

    const chosen = await p.select({
      message: `Select Gemini model for ${picocolors.bold(entityName)}:`,
      options: geminiOptions,
      initialValue: 'gemini-3.7-flash',
    });

    if (p.isCancel(chosen)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (chosen === '__custom__') {
      const custom = await p.text({ message: 'Enter custom Gemini model ID:', placeholder: 'gemini-3.7-flash' });
      if (p.isCancel(custom)) process.exit(0);
      return custom.trim();
    }
    return chosen as string;
  }

  if (provider === 'anthropic') {
    const claudeOptions = [
      { value: 'claude-sonnet-5', label: 'claude-sonnet-5', hint: 'Recommended (Latest production workhorse, tool use & planning)' },
      { value: 'claude-opus-5', label: 'claude-opus-5', hint: 'Flagship for complex agentic coding & enterprise' },
      { value: 'claude-fable-5', label: 'claude-fable-5', hint: 'Mythos-class deepest reasoning & research' },
      { value: 'claude-haiku-4-5', label: 'claude-haiku-4-5', hint: 'High-volume low-latency execution' },
      { value: 'claude-sonnet-4-6', label: 'claude-sonnet-4-6', hint: 'High-precision architecture tier' },
      { value: '__custom__', label: 'Custom Claude Model ID...', hint: 'Type custom model name' },
    ];

    const chosen = await p.select({
      message: `Select Claude model for ${picocolors.bold(entityName)}:`,
      options: claudeOptions,
      initialValue: 'claude-sonnet-5',
    });

    if (p.isCancel(chosen)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (chosen === '__custom__') {
      const custom = await p.text({ message: 'Enter custom Claude model ID:', placeholder: 'claude-sonnet-5' });
      if (p.isCancel(custom)) process.exit(0);
      return custom.trim();
    }
    return chosen as string;
  }

  if (provider === 'openai') {
    const openaiOptions = [
      { value: 'gpt-5.6-sol', label: 'gpt-5.6-sol', hint: 'Recommended (Flagship reasoning & complex architecture)' },
      { value: 'gpt-5.6-luna', label: 'gpt-5.6-luna', hint: 'High-speed, cost-sensitive workloads' },
      { value: 'gpt-5.6-cyber', label: 'gpt-5.6-cyber', hint: 'Specialized security & code vulnerability auditing' },
      { value: 'o3-mini', label: 'o3-mini', hint: 'High-speed mathematical & logic reasoning' },
      { value: 'gpt-4o', label: 'gpt-4o', hint: 'Standard multimodal model' },
      { value: '__custom__', label: 'Custom OpenAI Model ID...', hint: 'Type custom model name' },
    ];

    const chosen = await p.select({
      message: `Select OpenAI model for ${picocolors.bold(entityName)}:`,
      options: openaiOptions,
      initialValue: 'gpt-5.6-sol',
    });

    if (p.isCancel(chosen)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (chosen === '__custom__') {
      const custom = await p.text({ message: 'Enter custom OpenAI model ID:', placeholder: 'gpt-5.6-sol' });
      if (p.isCancel(custom)) process.exit(0);
      return custom.trim();
    }
    return chosen as string;
  }

  if (provider === 'deepseek') {
    const deepseekOptions = [
      { value: 'deepseek-v4-pro', label: 'deepseek-v4-pro', hint: 'Recommended (1.6T MoE flagship with thinking modes)' },
      { value: 'deepseek-v4-flash', label: 'deepseek-v4-flash', hint: 'High-efficiency fast reasoning tier' },
      { value: 'deepseek-reasoner', label: 'deepseek-reasoner', hint: 'Chain-of-thought legacy tier' },
      { value: '__custom__', label: 'Custom DeepSeek Model ID...', hint: 'Type custom model name' },
    ];

    const chosen = await p.select({
      message: `Select DeepSeek model for ${picocolors.bold(entityName)}:`,
      options: deepseekOptions,
      initialValue: 'deepseek-v4-pro',
    });

    if (p.isCancel(chosen)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (chosen === '__custom__') {
      const custom = await p.text({ message: 'Enter custom DeepSeek model ID:', placeholder: 'deepseek-v4-pro' });
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
          hint: 'Elite setup (e.g. DeepSeek-V4-Pro for Red-Team + Claude Opus 5 for Architecture)',
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
