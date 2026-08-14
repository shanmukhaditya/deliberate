import { BasePersona } from './base.js';
import { PersonaId } from '../types.js';
import {
  PrincipalArchitectPersona,
  RuthlessContrarianPersona,
  PerformanceHackerPersona,
  DxPuristPersona,
  SecurityAuditorPersona,
  PragmatistPersona,
} from './definitions.js';

export class PersonaRegistry {
  private static instances = new Map<PersonaId, BasePersona>([
    ['architect', new PrincipalArchitectPersona()],
    ['contrarian', new RuthlessContrarianPersona()],
    ['performance', new PerformanceHackerPersona()],
    ['dx', new DxPuristPersona()],
    ['security', new SecurityAuditorPersona()],
    ['pragmatist', new PragmatistPersona()],
  ]);

  static get(id: PersonaId): BasePersona {
    const persona = this.instances.get(id);
    if (!persona) {
      throw new Error(`Unknown persona ID: ${id}. Available: ${Array.from(this.instances.keys()).join(', ')}`);
    }
    return persona;
  }

  static getAll(): BasePersona[] {
    return Array.from(this.instances.values());
  }

  static getForMode(mode: 'flash' | 'council' | 'deep-explore' | 'red-team'): BasePersona[] {
    switch (mode) {
      case 'flash':
        // Fast 2-persona sanity check
        return [this.get('architect'), this.get('contrarian')];
      case 'red-team':
        // Security + Contrarian + Performance
        return [this.get('contrarian'), this.get('security'), this.get('performance')];
      case 'council':
      case 'deep-explore':
      default:
        // Full council
        return this.getAll();
    }
  }
}
