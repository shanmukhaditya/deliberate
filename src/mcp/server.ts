import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { DeliberationEngine } from '../core/engine.js';
import { DeliberationMode, PersonaId } from '../core/types.js';

export class DeliberateMcpServer {
  private server: Server;
  private engine: DeliberationEngine;

  constructor() {
    this.engine = new DeliberationEngine();
    this.server = new Server(
      {
        name: 'deliberate-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List Tools Handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'deliberate_brainstorm',
          description:
            'Engage deep "System 2" ideation, first-principles deconstruction, adversarial council debate, and Pareto trade-off synthesis before writing code.',
          inputSchema: {
            type: 'object',
            properties: {
              goal: {
                type: 'string',
                description: 'The architectural challenge, system design, or feature to deliberate upon.',
              },
              mode: {
                type: 'string',
                enum: ['flash', 'council', 'deep-explore'],
                description: 'Deliberation mode: flash (fast 10s check), council (balanced debate), deep-explore (full Tree-of-Thoughts). Default: council.',
              },
              context: {
                type: 'string',
                description: 'Relevant codebase background, existing tech stack, or data volume constraints.',
              },
              constraints: {
                type: 'array',
                items: { type: 'string' },
                description: 'Hard engineering constraints (e.g., zero external dependencies, p99 < 5ms).',
              },
            },
            required: ['goal'],
          },
        },
        {
          name: 'deliberate_red_team',
          description:
            'Run an adversarial stress-test against a file or architecture to uncover failure modes, race conditions, memory leaks, security vulnerabilities, and missing invariants.',
          inputSchema: {
            type: 'object',
            properties: {
              goal: {
                type: 'string',
                description: 'What the code is attempting to accomplish or migrate.',
              },
              filePath: {
                type: 'string',
                description: 'Path to the target file being evaluated.',
              },
              fileContent: {
                type: 'string',
                description: 'The actual source code to red-team.',
              },
            },
            required: ['goal', 'fileContent'],
          },
        },
        {
          name: 'deliberate_council_debate',
          description:
            'Submit an idea or architecture directly to the 6-persona adversarial council (Principal Architect, Ruthless Contrarian, Performance Hacker, DX Purist, Security Auditor, Pragmatist) for unsparing critique.',
          inputSchema: {
            type: 'object',
            properties: {
              goal: {
                type: 'string',
                description: 'The idea or architecture to debate.',
              },
              personas: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['architect', 'contrarian', 'performance', 'dx', 'security', 'pragmatist'],
                },
                description: 'Specific personas to summon (defaults to all).',
              },
            },
            required: ['goal'],
          },
        },
      ];

      return { tools };
    });

    // Call Tool Handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (name === 'deliberate_brainstorm') {
          const goal = String(args?.goal || '');
          const mode = (args?.mode as DeliberationMode) || 'council';
          const context = args?.context ? String(args.context) : undefined;
          const constraints = Array.isArray(args?.constraints)
            ? args.constraints.map(String)
            : undefined;

          const result = await this.engine.run({
            goal,
            mode,
            context,
            constraints,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    status: 'success',
                    winning_architecture: result.blueprint.winningArchitecture,
                    rejected_alternatives: result.blueprint.rejectedAlternatives,
                    core_invariants: result.blueprint.coreInvariants,
                    failure_modes_and_mitigations: result.blueprint.failureModesAndMitigations,
                    implementation_steps: result.blueprint.implementationSteps,
                    code_skeleton: result.blueprint.codeSkeleton,
                    execution_time_ms: result.executionTimeMs,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        if (name === 'deliberate_red_team') {
          const goal = String(args?.goal || '');
          const filePath = args?.filePath ? String(args.filePath) : undefined;
          const fileContent = String(args?.fileContent || '');

          const result = await this.engine.run({
            goal,
            mode: 'red-team',
            filePath,
            fileContent,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    status: 'success',
                    file_evaluated: filePath,
                    adversarial_critiques: result.councilDebates,
                    discovered_failure_modes: result.blueprint.failureModesAndMitigations,
                    required_invariants: result.blueprint.coreInvariants,
                    recommended_remediation_steps: result.blueprint.implementationSteps,
                    remediated_code_skeleton: result.blueprint.codeSkeleton,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        if (name === 'deliberate_council_debate') {
          const goal = String(args?.goal || '');
          const personas = Array.isArray(args?.personas)
            ? (args.personas as PersonaId[])
            : undefined;

          const result = await this.engine.run({
            goal,
            mode: 'council',
            personas,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    status: 'success',
                    council_critiques: result.councilDebates,
                    synthesized_invariants: result.blueprint.coreInvariants,
                    trade_off_matrix: result.paretoMatrix,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        throw new Error(`Unknown tool: ${name}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: 'text', text: `Deliberate Error: ${message}` }],
        };
      }
    });
  }

  async startStdio() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Entrypoint for MCP executable
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new DeliberateMcpServer();
  server.startStdio().catch((err) => {
    console.error('Fatal MCP Server error:', err);
    process.exit(1);
  });
}
