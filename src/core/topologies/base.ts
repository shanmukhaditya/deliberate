import { TopologyOutput, TopologyType } from '../types.js';

export interface TopologyContext {
  goal: string;
  context?: string;
  fileContent?: string;
  constraints?: string[];
}

export abstract class BaseTopology {
  abstract readonly type: TopologyType;
  abstract readonly title: string;
  abstract readonly description: string;

  abstract buildPrompt(context: TopologyContext): string;
}
