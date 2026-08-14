import * as p from '@clack/prompts';
import picocolors from 'picocolors';
import { ConfigManager, ModelSelection, UserDeliberateConfig } from '../core/config.js';
import { PersonaId } from '../core/types.js';
import { OllamaProvider } from '../core/providers/deepseek_ollama.js';

export const getProviderOptions = () => [
  { value: 'gemini', label: 'Google Gemini', hint: 'Fast, high-throughput (gemini-2.0-flash / 1.5-pro)' },
  { value: 'anthropic', label: 'Anthropic Claude', hint: 'Elite architecture & reasoning (claude-3-7-sonnet / 3.5-sonnet)' },
  { value: 'openai', label: 'OpenAI / Codex', hint: 'Flagship reasoning & coding (gpt-4o / o3-mini / o1)' },
  { value: 'deepseek', label: 'DeepSeek', hint: 'Frontier chain-of-thought logic (deepseek-reasoner R1 / V3)' },
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
          { value: 'deepseek-r1:14b', label: 'deepseek-r1:14b', hint: 'Recommended for reasoning' },
          { value: 'deepseek-r1:32b', label: 'deepseek-r1:32b', hint: 'Heavy reasoning model' },
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
        placeholder: 'deepseek-r1:14b',
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
      { value: 'gemini-2.0-flash', label: 'gemini-2.0-flash', hint: 'Recommended (Ultra-fast, massive throughput)' },
      { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro', hint: 'Deep reasoning & spatial system design' },
      { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash', hint: 'High-throughput lightweight tier' },
      { value: '__custom__', label: 'Custom Gemini Model ID...', hint: 'Type custom model name' },
    ];

    const chosen = await p.select({
      message: `Select Gemini model for ${picocolors.bold(entityName)}:`,
      options: geminiOptions,
      initialValue: 'gemini-2.0-flash',
    });

    if (p.isCancel(chosen)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (chosen === '__custom__') {
      const custom = await p.text({ message: 'Enter custom Gemini model ID:', placeholder: 'gemini-2.0-flash' });
      if (p.isCancel(custom)) process.exit(0);
      return custom.trim();
    }
    return chosen as string;
  }

  if (provider === 'anthropic') {
    const claudeOptions = [
      { value: 'claude-3-7-sonnet-20250219', label: 'claude-3-7-sonnet-20250219', hint: 'Recommended (Frontier reasoning + hybrid thinking)' },
      { value: 'claude-3-5-sonnet-20241022', label: 'claude-3-5-sonnet-20241022', hint: 'High-precision architecture' },
      { value: 'claude-3-5-haiku-20241022', label: 'claude-3-5-haiku-20241022', hint: 'Fast filtering & validation' },
      { value: 'claude-3-opus-20240229', label: 'claude-3-opus-20240229', hint: 'Heavy reasoning & analysis' },
      { value: '__custom__', label: 'Custom Claude Model ID...', hint: 'Type custom model name' },
    ];

    const chosen = await p.select({
      message: `Select Claude model for ${picocolors.bold(entityName)}:`,
      options: claudeOptions,
      initialValue: 'claude-3-7-sonnet-20250219',
    });

    if (p.isCancel(chosen)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (chosen === '__custom__') {
      const custom = await p.text({ message: 'Enter custom Claude model ID:', placeholder: 'claude-3-7-sonnet-20250219' });
      if (p.isCancel(custom)) process.exit(0);
      return custom.trim();
    }
    return chosen as string;
  }

  if (provider === 'openai') {
    const openaiOptions = [
      { value: 'gpt-4o', label: 'gpt-4o', hint: 'Recommended (Flagship intelligence & speed)' },
      { value: 'o3-mini', label: 'o3-mini', hint: 'High-speed mathematical & code reasoning' },
      { value: 'o1', label: 'o1', hint: 'Deep deliberative reasoning flagship' },
      { value: 'gpt-4o-mini', label: 'gpt-4o-mini', hint: 'Affordable lightweight model' },
      { value: '__custom__', label: 'Custom OpenAI Model ID...', hint: 'Type custom model name' },
    ];

    const chosen = await p.select({
      message: `Select OpenAI model for ${picocolors.bold(entityName)}:`,
      options: openaiOptions,
      initialValue: 'gpt-4o',
    });

    if (p.isCancel(chosen)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (chosen === '__custom__') {
      const custom = await p.text({ message: 'Enter custom OpenAI model ID:', placeholder: 'gpt-4o' });
      if (p.isCancel(custom)) process.exit(0);
      return custom.trim();
    }
    return chosen as string;
  }

  if (provider === 'deepseek') {
    const deepseekOptions = [
      { value: 'deepseek-reasoner', label: 'deepseek-reasoner (R1)', hint: 'Recommended (Deep chain-of-thought logic)' },
      { value: 'deepseek-chat', label: 'deepseek-chat (V3)', hint: 'High-speed coding & conversational model' },
      { value: '__custom__', label: 'Custom DeepSeek Model ID...', hint: 'Type custom model name' },
    ];

    const chosen = await p.select({
      message: `Select DeepSeek model for ${picocolors.bold(entityName)}:`,
      options: deepseekOptions,
      initialValue: 'deepseek-reasoner',
    });

    if (p.isCancel(chosen)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (chosen === '__custom__') {
      const custom = await p.text({ message: 'Enter custom DeepSeek model ID:', placeholder: 'deepseek-reasoner' });
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
