#!/usr/bin/env node
import { Command } from 'commander';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import picocolors from 'picocolors';
import { DeliberationEngine } from '../core/engine.js';
import { DeliberateTui } from './tui.js';
import { DeliberateMcpServer } from '../mcp/server.js';
import { DeliberationMode, PersonaId } from '../core/types.js';

const program = new Command();

program
  .name('deliberate')
  .description('Deep Ideation & Multi-Agent Deliberation for AI Coding Agents')
  .version('0.1.0');

// Brainstorm Command
program
  .command('brainstorm <goal>')
  .description('Run deep systematic ideation and adversarial council debate on a system or feature')
  .option('-m, --mode <mode>', 'Deliberation mode: flash, council, deep-explore', 'council')
  .option('-p, --provider <provider>', 'LLM provider: gemini, anthropic, openai, deepseek, ollama, mock')
  .option('--model <model>', 'Specific model identifier')
  .option('-c, --context <context>', 'Additional architectural context')
  .option('--constraints <constraints...>', 'List of hard constraints')
  .action(async (goal: string, options) => {
    DeliberateTui.printBanner();

    const spinner = ora({
      text: picocolors.cyan('Initializing Deliberation Engine...'),
      color: 'cyan',
    }).start();

    const engine = new DeliberationEngine();

    try {
      const result = await engine.run(
        {
          goal,
          mode: options.mode as DeliberationMode,
          provider: options.provider,
          model: options.model,
          context: options.context,
          constraints: options.constraints,
        },
        {
          onStageStart: (stage, detail) => {
            spinner.text = picocolors.cyan(`[${stage.toUpperCase()}] ${detail}`);
          },
          onItemComplete: (item) => {
            spinner.succeed(picocolors.green(`Completed: ${item}`));
            spinner.start(picocolors.cyan('Deliberating next phase...'));
          },
        }
      );

      spinner.stop();
      DeliberateTui.renderResult(result);
    } catch (err: unknown) {
      spinner.fail(picocolors.red('Deliberation error occurred.'));
      console.error(err);
      process.exit(1);
    }
  });

// Red-Team Command
program
  .command('red-team <file>')
  .description('Adversarially stress-test a target source file against concurrency, security, and scale failures')
  .option('-g, --goal <goal>', 'What the target code is trying to achieve', 'Stress-test code invariants')
  .option('-p, --provider <provider>', 'LLM provider')
  .action(async (targetFile: string, options) => {
    DeliberateTui.printBanner();

    const absPath = path.resolve(process.cwd(), targetFile);
    let content = '';

    try {
      content = await fs.readFile(absPath, 'utf-8');
    } catch {
      console.error(picocolors.red(`Error: Could not read file at ${absPath}`));
      process.exit(1);
    }

    const spinner = ora({
      text: picocolors.red(`Summoning Red-Team Council for ${targetFile}...`),
      color: 'red',
    }).start();

    const engine = new DeliberationEngine();

    try {
      const result = await engine.run(
        {
          goal: options.goal,
          mode: 'red-team',
          filePath: absPath,
          fileContent: content,
          provider: options.provider,
        },
        {
          onStageStart: (_, detail) => {
            spinner.text = picocolors.red(detail);
          },
          onItemComplete: (item) => {
            spinner.succeed(picocolors.green(`Audited: ${item}`));
            spinner.start(picocolors.red('Auditing next threat vector...'));
          },
        }
      );

      spinner.stop();
      DeliberateTui.renderResult(result);
    } catch (err) {
      spinner.fail(picocolors.red('Red-team audit failed.'));
      console.error(err);
      process.exit(1);
    }
  });

// Council Debate Command
program
  .command('council <goal>')
  .description('Directly summon the adversarial council to debate an architectural proposal')
  .option('--personas <personas...>', 'Specific personas: architect, contrarian, performance, dx, security, pragmatist')
  .option('-p, --provider <provider>', 'LLM provider')
  .action(async (goal: string, options) => {
    DeliberateTui.printBanner();

    const spinner = ora({
      text: picocolors.magenta('Summoning Adversarial Council...'),
      color: 'magenta',
    }).start();

    const engine = new DeliberationEngine();

    try {
      const result = await engine.run(
        {
          goal,
          mode: 'council',
          personas: options.personas as PersonaId[],
          provider: options.provider,
        },
        {
          onStageStart: (_, detail) => {
            spinner.text = picocolors.magenta(detail);
          },
        }
      );

      spinner.stop();
      DeliberateTui.renderResult(result);
    } catch (err) {
      spinner.fail(picocolors.red('Council debate failed.'));
      console.error(err);
      process.exit(1);
    }
  });

// MCP Server Command
program
  .command('mcp')
  .description('Start the Model Context Protocol (MCP) server on stdio for Claude Code, Antigravity, and Cursor')
  .action(async () => {
    const server = new DeliberateMcpServer();
    await server.startStdio();
  });

program.parse(process.argv);
