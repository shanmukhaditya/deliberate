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

// Install Command for Agent Skills & Rules
program
  .command('install')
  .description('Install Deliberate skill and rules into Antigravity, Claude Code, Cursor, and Copilot')
  .option('--antigravity', 'Install Antigravity skill')
  .option('--cursor', 'Install Cursor rules')
  .option('--copilot', 'Install GitHub Copilot instructions')
  .option('--all', 'Install into all supported tools', true)
  .action(async (options) => {
    DeliberateTui.printBanner();
    console.log(picocolors.bold(picocolors.cyan('\n⚡ Installing Deliberate Integrations:\n')));

    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const cliDir = path.dirname(new URL(import.meta.url).pathname);
    // Find project root (either 1 level up from src or 2 levels up from dist/cli)
    const rootDir = cliDir.endsWith('dist/cli')
      ? path.resolve(cliDir, '../..')
      : cliDir.endsWith('src/cli')
        ? path.resolve(cliDir, '../..')
        : path.resolve(cliDir, '..');

    // 1. Antigravity Skill
    if (options.all || options.antigravity) {
      const antigravitySkillDir = path.join(homeDir, '.gemini/antigravity/skills/deliberate');
      try {
        await fs.mkdir(antigravitySkillDir, { recursive: true });
        const skillContent = await fs.readFile(
          path.join(rootDir, 'integrations/antigravity/SKILL.md'),
          'utf-8'
        );
        await fs.writeFile(path.join(antigravitySkillDir, 'SKILL.md'), skillContent);
        console.log(picocolors.green('  ✔ Google Antigravity Skill installed: ') + picocolors.dim(path.join(antigravitySkillDir, 'SKILL.md')));
      } catch (err: unknown) {
        console.log(picocolors.yellow('  ⚠ Could not auto-install Antigravity skill (permission or directory skipped).'));
      }
    }

    // 2. Cursor Rules
    if (options.all || options.cursor) {
      try {
        const cursorContent = await fs.readFile(
          path.join(rootDir, 'integrations/cursor/.cursorrules'),
          'utf-8'
        );
        await fs.writeFile(path.resolve(process.cwd(), '.cursorrules'), cursorContent);
        console.log(picocolors.green('  ✔ Cursor / Windsurf rules created: ') + picocolors.dim('./.cursorrules'));
      } catch {
        // ignore
      }
    }

    // 3. GitHub Copilot Instructions
    if (options.all || options.copilot) {
      try {
        await fs.mkdir(path.resolve(process.cwd(), '.github'), { recursive: true });
        const skillContent = await fs.readFile(
          path.join(rootDir, 'integrations/antigravity/SKILL.md'),
          'utf-8'
        );
        await fs.writeFile(path.resolve(process.cwd(), '.github/copilot-instructions.md'), skillContent);
        console.log(picocolors.green('  ✔ GitHub Copilot / Codex instructions created: ') + picocolors.dim('./.github/copilot-instructions.md'));
      } catch {
        // ignore
      }
    }

    console.log(picocolors.bold(picocolors.cyan('\n🎉 Done! Your AI coding agents now have Deliberate System-2 reasoning active.\n')));
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
