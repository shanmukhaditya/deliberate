import fs from 'fs/promises';
import path from 'path';
import { PersonaId } from './types.js';

export interface ModelSelection {
  provider: 'gemini' | 'anthropic' | 'openai' | 'deepseek' | 'ollama' | 'mock';
  model?: string;
}

export interface UserDeliberateConfig {
  mode: 'unified' | 'individual';
  unified?: ModelSelection;
  personas?: Partial<Record<PersonaId, ModelSelection>>;
  synthesizer?: ModelSelection;
}

export class ConfigManager {
  private static localConfigPath = path.resolve(process.cwd(), 'deliberate.config.json');
  private static globalConfigPath = path.resolve(
    process.env.HOME || process.env.USERPROFILE || '',
    '.deliberaterc'
  );

  static async load(): Promise<UserDeliberateConfig | null> {
    // 1. Try local project config first
    try {
      const data = await fs.readFile(this.localConfigPath, 'utf-8');
      return JSON.parse(data) as UserDeliberateConfig;
    } catch {
      // 2. Try global ~/.deliberaterc
      try {
        const data = await fs.readFile(this.globalConfigPath, 'utf-8');
        return JSON.parse(data) as UserDeliberateConfig;
      } catch {
        return null;
      }
    }
  }

  static async save(config: UserDeliberateConfig, global = false): Promise<string> {
    const targetPath = global ? this.globalConfigPath : this.localConfigPath;
    await fs.writeFile(targetPath, JSON.stringify(config, null, 2), 'utf-8');
    return targetPath;
  }
}
