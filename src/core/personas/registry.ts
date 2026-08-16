import fs from 'fs';
import path from 'path';
import { BasePersona } from './base.js';
import { PersonaDefinition, PersonaId } from '../types.js';
import {
  PrincipalArchitectPersona,
  RuthlessContrarianPersona,
  PerformanceHackerPersona,
  DxPuristPersona,
  SecurityAuditorPersona,
  PragmatistPersona,
} from './definitions.js';

export class DynamicCustomPersona extends BasePersona {
  constructor(public definition: PersonaDefinition) {
    super();
  }
}

export class PersonaRegistry {
  private static instances = new Map<string, BasePersona>([
    ['architect', new PrincipalArchitectPersona()],
    ['contrarian', new RuthlessContrarianPersona()],
    ['performance', new PerformanceHackerPersona()],
    ['dx', new DxPuristPersona()],
    ['security', new SecurityAuditorPersona()],
    ['pragmatist', new PragmatistPersona()],
  ]);

  static register(definition: PersonaDefinition): void {
    this.instances.set(definition.id, new DynamicCustomPersona(definition));
  }

  static loadProjectCustomPersonas(cwd = process.cwd()): void {
    const customPath = path.resolve(cwd, 'deliberate.personas.json');
    if (fs.existsSync(customPath)) {
      try {
        const raw = fs.readFileSync(customPath, 'utf-8');
        const customList = JSON.parse(raw) as PersonaDefinition[];
        if (Array.isArray(customList)) {
          for (const p of customList) {
            if (p.id && p.name && p.systemPrompt) {
              this.register(p);
            }
          }
        }
      } catch {
        // ignore parse error
      }
    }
  }

  static get(id: string): BasePersona {
    this.loadProjectCustomPersonas();
    const persona = this.instances.get(id);
    if (!persona) {
      throw new Error(`Unknown persona ID: ${id}. Available: ${Array.from(this.instances.keys()).join(', ')}`);
    }
    return persona;
  }

  static getAll(): BasePersona[] {
    this.loadProjectCustomPersonas();
    return Array.from(this.instances.values());
  }

  static getForMode(mode: 'flash' | 'council' | 'deep-explore' | 'red-team'): BasePersona[] {
    this.loadProjectCustomPersonas();
    switch (mode) {
      case 'flash':
        return [this.get('architect'), this.get('contrarian')];
      case 'red-team':
        return [this.get('contrarian'), this.get('security'), this.get('performance')];
      case 'council':
      case 'deep-explore':
      default:
        return this.getAll();
    }
  }
}
