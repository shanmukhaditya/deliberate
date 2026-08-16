import fs from 'fs';
import path from 'path';
import { BaseTopology, TopologyContext } from './base.js';
import { TopologyType } from '../types.js';
import {
  FirstPrinciplesTopology,
  InversionTopology,
  TrizTopology,
  ScamperTopology,
  TreeOfThoughtsTopology,
} from './definitions.js';

export interface CustomTopologyDefinition {
  type: string;
  title: string;
  description: string;
  promptTemplate: string;
}

export class DynamicCustomTopology extends BaseTopology {
  constructor(public customDef: CustomTopologyDefinition) {
    super();
  }

  get type(): TopologyType {
    return this.customDef.type as any;
  }

  get title(): string {
    return this.customDef.title;
  }

  get description(): string {
    return this.customDef.description;
  }

  buildPrompt(context: TopologyContext): string {
    return `
You are applying the custom thinking topology: ${this.title}.
${this.description}

GOAL: ${context.goal}
${context.context ? `CONTEXT: ${context.context}` : ''}
${context.fileContent ? `SOURCE CODE: \n${context.fileContent}` : ''}

INSTRUCTIONS:
${this.customDef.promptTemplate}

Respond with valid JSON:
{
  "topology": "${this.type}",
  "title": "${this.title}",
  "deconstructedAxioms": ["<Axiom 1>", "<Axiom 2>"]
}
`.trim();
  }
}

export class TopologyRegistry {
  private static instances = new Map<string, BaseTopology>([
    ['first-principles', new FirstPrinciplesTopology()],
    ['inversion', new InversionTopology()],
    ['triz', new TrizTopology()],
    ['scamper', new ScamperTopology()],
    ['tree-of-thoughts', new TreeOfThoughtsTopology()],
  ]);

  static register(def: CustomTopologyDefinition): void {
    this.instances.set(def.type, new DynamicCustomTopology(def));
  }

  static loadProjectCustomTopologies(cwd = process.cwd()): void {
    const customPath = path.resolve(cwd, 'deliberate.topologies.json');
    if (fs.existsSync(customPath)) {
      try {
        const raw = fs.readFileSync(customPath, 'utf-8');
        const list = JSON.parse(raw) as CustomTopologyDefinition[];
        if (Array.isArray(list)) {
          for (const item of list) {
            if (item.type && item.title && item.promptTemplate) {
              this.register(item);
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }

  static get(type: string): BaseTopology {
    this.loadProjectCustomTopologies();
    const topology = this.instances.get(type);
    if (!topology) {
      throw new Error(`Unknown topology type: ${type}. Available: ${Array.from(this.instances.keys()).join(', ')}`);
    }
    return topology;
  }

  static getAll(): BaseTopology[] {
    this.loadProjectCustomTopologies();
    return Array.from(this.instances.values());
  }

  static getForMode(mode: 'flash' | 'council' | 'deep-explore' | 'red-team'): BaseTopology[] {
    this.loadProjectCustomTopologies();
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
