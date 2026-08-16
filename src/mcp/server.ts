import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { DeliberationEngine } from '../core/engine.js';
import { Synthesizer } from '../core/synthesizer.js';
import { DeliberationMode, PersonaId } from '../core/types.js';

export class DeliberateMcpServer {
  private server: Server;
  private engine: DeliberationEngine;

  constructor() {
    this.engine = new DeliberationEngine();
    this.server = new Server(
      {
        name: 'deliberate-mcp-server',
        version: '0.3.0',
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
              asMarkdown: {
                type: 'boolean',
                description: 'If true, returns the blueprint as formatted Markdown instead of raw JSON.',
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
              asMarkdown: {
                type: 'boolean',
                description: 'If true, returns the red-team report as Markdown.',
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
                description: 'Specific council members to summon.',
              },
              context: {
                type: 'string',
                description: 'Relevant background.',
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
            ? (args.constraints as string[])
            : undefined;
          const asMarkdown = Boolean(args?.asMarkdown);

          const result = await this.engine.run({
            goal,
            mode,
            context,
            constraints,
          });

          const contentText = asMarkdown
            ? Synthesizer.exportToMarkdown(result)
            : JSON.stringify(result, null, 2);

          return {
            content: [
              {
                type: 'text',
                text: contentText,
              },
            ],
          };
        }

        if (name === 'deliberate_red_team') {
          const goal = String(args?.goal || '');
          const filePath = String(args?.filePath || 'source_file.ts');
          const fileContent = String(args?.fileContent || '');
          const asMarkdown = Boolean(args?.asMarkdown);

          const result = await this.engine.run({
            goal,
            mode: 'red-team',
            filePath,
            fileContent,
          });

          const contentText = asMarkdown
            ? Synthesizer.exportToMarkdown(result)
            : JSON.stringify(result, null, 2);

          return {
            content: [
              {
                type: 'text',
                text: contentText,
              },
            ],
          };
        }

        if (name === 'deliberate_council_debate') {
          const goal = String(args?.goal || '');
          const personas = args?.personas as PersonaId[] | undefined;
          const context = args?.context ? String(args.context) : undefined;

          const result = await this.engine.run({
            goal,
            mode: 'council',
            personas,
            context,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    goal: result.goal,
                    debates: result.councilDebates,
                    synthesis: result.blueprint.winningArchitecture,
                    invariants: result.blueprint.coreInvariants,
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
        return {
          content: [
            {
              type: 'text',
              text: `Deliberate Error: ${(err as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Deliberate MCP Server running on stdio');
  }
}
