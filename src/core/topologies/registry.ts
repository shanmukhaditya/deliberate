import { BaseTopology } from './base.js';
import { TopologyType } from '../types.js';
import {
  FirstPrinciplesTopology,
  InversionTopology,
  TrizTopology,
  ScamperTopology,
  TreeOfThoughtsTopology,
} from './definitions.js';

export class TopologyRegistry {
  private static instances = new Map<TopologyType, BaseTopology>([
    ['first-principles', new FirstPrinciplesTopology()],
    ['inversion', new InversionTopology()],
    ['triz', new TrizTopology()],
    ['scamper', new ScamperTopology()],
    ['tree-of-thoughts', new TreeOfThoughtsTopology()],
  ]);

  static get(type: TopologyType): BaseTopology {
    const topology = this.instances.get(type);
    if (!topology) {
      throw new Error(`Unknown topology type: ${type}. Available: ${Array.from(this.instances.keys()).join(', ')}`);
    }
    return topology;
  }

  static getAll(): BaseTopology[] {
    return Array.from(this.instances.values());
  }

  static getForMode(mode: 'flash' | 'council' | 'deep-explore' | 'red-team'): BaseTopology[] {
    switch (mode) {
      case 'flash':
        return [this.get('first-principles'), this.get('inversion')];
      case 'red-team':
        return [this.get('inversion'), this.get('first-principles')];
      case 'deep-explore':
        return this.getAll();
      case 'council':
      default:
        return [this.get('first-principles'), this.get('inversion'), this.get('triz')];
    }
  }
}
