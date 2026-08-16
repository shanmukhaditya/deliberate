#!/usr/bin/env node
import { Command } from 'commander';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import picocolors from 'picocolors';
import { DeliberationEngine } from '../core/engine.js';
import { DeliberateTui } from './tui.js';
import { DeliberateMcpServer } from '../mcp/server.js';
import { Synthesizer } from '../core/synthesizer.js';
import { ADRGenerator } from '../core/adr.js';
import { DeliberationMode, PersonaId } from '../core/types.js';

const program = new Command();

program
  .name('deliberate')
  .description('Deep Ideation & Multi-Agent Deliberation for AI Coding Agents')
  .version('0.4.0');

// Brainstorm Command
program
  .command('brainstorm <goal>')
  .description('Run deep systematic ideation and adversarial council debate on a system or feature')
  .option('-m, --mode <mode>', 'Deliberation mode: flash, council, deep-explore', 'council')
  .option('-r, --rounds <rounds>', 'Number of dialectical debate rounds (1 to 5)', '1')
  .option('-p, --provider <provider>', 'LLM provider: gemini, anthropic, openai, deepseek, ollama, mock')
  .option('--model <model>', 'Specific model identifier')
  .option('-i, --interactive', 'Interactively select models and personas before running')
  .option('-v, --verbose', 'Show verbatim persona debates and attack vectors')
  .option('--show-debate', 'Show verbatim persona debates and attack vectors')
  .option('--export <filepath>', 'Export full architectural blueprint to file (Markdown or JSON)')
  .option('--adr <filepath>', 'Export Architectural Decision Record (ADR) in MADR format')
  .option('--json', 'Output raw JSON to stdout (ideal for piping into agents)')
  .option('-c, --context <context>', 'Additional architectural context')
  .option('--constraints <constraints...>', 'List of hard constraints')
  .action(async (goal: string, options) => {
    const isJson = Boolean(options.json);
    const showDebate = Boolean(options.verbose || options.showDebate);
    const rounds = options.rounds ? parseInt(options.rounds, 10) : 1;

    if (!isJson) {
      DeliberateTui.printBanner();
    }

    if (options.interactive && !isJson) {
      const { ModelConfigWizard } = await import('./wizard.js');
      await ModelConfigWizard.run();
    }

    const spinner = isJson
      ? null
      : ora({
          text: picocolors.cyan('Initializing Deliberation Engine...'),
          color: 'cyan',
        }).start();

    const engine = new DeliberationEngine();

    try {
      const result = await engine.run(
        {
          goal,
          mode: options.mode as DeliberationMode,
          rounds,
          provider: options.provider,
          model: options.model,
          context: options.context,
          constraints: options.constraints,
        },
        {
          onStageStart: (stage, detail) => {
            if (spinner) spinner.text = picocolors.cyan(`[${stage.toUpperCase()}] ${detail}`);
          },
          onItemComplete: (item) => {
            if (spinner) {
              spinner.succeed(picocolors.green(`Completed: ${item}`));
              spinner.start(picocolors.cyan('Deliberating next phase...'));
            }
          },
        }
      );

      if (spinner) spinner.stop();

      if (isJson) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        DeliberateTui.renderResult(result, showDebate);
      }

      // Handle file export if requested
      if (options.export) {
        const targetPath = path.resolve(process.cwd(), options.export);
        const exportContent = targetPath.endsWith('.json')
          ? JSON.stringify(result, null, 2)
          : Synthesizer.exportToMarkdown(result);

        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, exportContent, 'utf-8');
        if (!isJson) {
          console.log(picocolors.green(`✔ Blueprint successfully exported to ${picocolors.bold(targetPath)}`));
        }
      }

      // Handle ADR export if requested
      if (options.adr) {
        const adrPath = path.resolve(process.cwd(), options.adr);
        const adrContent = ADRGenerator.generate(result);

        await fs.mkdir(path.dirname(adrPath), { recursive: true });
        await fs.writeFile(adrPath, adrContent, 'utf-8');
        if (!isJson) {
          console.log(picocolors.green(`✔ Architectural Decision Record (ADR) saved to ${picocolors.bold(adrPath)}\n`));
        }
      }
    } catch (err: unknown) {
      if (spinner) spinner.fail(picocolors.red('Deliberation error occurred.'));
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
  .option('-v, --verbose', 'Show verbatim persona critiques')
  .option('--show-debate', 'Show verbatim persona critiques')
  .option('--export <filepath>', 'Export red-team audit report to file')
  .option('--json', 'Output raw JSON')
  .action(async (targetFile: string, options) => {
    const isJson = Boolean(options.json);
    const showDebate = Boolean(options.verbose || options.showDebate);

    if (!isJson) DeliberateTui.printBanner();

    const absPath = path.resolve(process.cwd(), targetFile);
    let content = '';

    try {
      content = await fs.readFile(absPath, 'utf-8');
    } catch {
      console.error(picocolors.red(`Error: Could not read file at ${absPath}`));
      process.exit(1);
    }

    const spinner = isJson
      ? null
      : ora({
          text: picocolors.red(`Summoning Red-Team Council for ${targetFile}...`),
          color: 'red',
        }).start();

    const engine = new DeliberationEngine();

    try {
      const result = await engine.run({
        goal: options.goal,
        mode: 'red-team',
        provider: options.provider,
        filePath: targetFile,
        fileContent: content,
      });

      if (spinner) spinner.stop();

      if (isJson) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        DeliberateTui.renderResult(result, showDebate);
      }

      if (options.export) {
        const targetPath = path.resolve(process.cwd(), options.export);
        const exportContent = targetPath.endsWith('.json')
          ? JSON.stringify(result, null, 2)
          : Synthesizer.exportToMarkdown(result);

        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, exportContent, 'utf-8');
        if (!isJson) {
          console.log(picocolors.green(`✔ Red-team audit report exported to ${picocolors.bold(targetPath)}\n`));
        }
      }
    } catch (err: unknown) {
      if (spinner) spinner.fail(picocolors.red('Red-team deliberation failed.'));
      console.error(err);
      process.exit(1);
    }
  });

// Council Debate Command
program
  .command('council <goal>')
  .description('Convene specific personas for targeted architectural debate')
  .option(
    '--personas <personas...>',
    'Personas to summon: architect, contrarian, performance, dx, security, pragmatist'
  )
  .option('-p, --provider <provider>', 'LLM provider')
  .option('-v, --verbose', 'Show verbatim debates')
  .option('--show-debate', 'Show verbatim debates')
  .option('--export <filepath>', 'Export debate report to file')
  .option('--json', 'Output raw JSON')
  .action(async (goal: string, options) => {
    const isJson = Boolean(options.json);
    const showDebate = Boolean(options.verbose || options.showDebate);

    if (!isJson) DeliberateTui.printBanner();

    const spinner = isJson
      ? null
      : ora({
          text: picocolors.magenta('Convening Adversarial Council...'),
          color: 'magenta',
        }).start();

    const engine = new DeliberationEngine();

    try {
      const result = await engine.run({
        goal,
        mode: 'council',
        personas: options.personas as PersonaId[],
        provider: options.provider,
      });

      if (spinner) spinner.stop();

      if (isJson) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        DeliberateTui.renderResult(result, showDebate);
      }

      if (options.export) {
        const targetPath = path.resolve(process.cwd(), options.export);
        const exportContent = targetPath.endsWith('.json')
          ? JSON.stringify(result, null, 2)
          : Synthesizer.exportToMarkdown(result);

        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, exportContent, 'utf-8');
        if (!isJson) {
          console.log(picocolors.green(`✔ Council report exported to ${picocolors.bold(targetPath)}\n`));
        }
      }
    } catch (err: unknown) {
      if (spinner) spinner.fail(picocolors.red('Council deliberation failed.'));
      console.error(err);
      process.exit(1);
    }
  });

// Config Command (Interactive Model & Persona Selector)
program
  .command('config')
  .description('Interactively select and configure LLM models for all or individual council personas')
  .action(async () => {
    const { ModelConfigWizard } = await import('./wizard.js');
    await ModelConfigWizard.run();
  });

// Direct Model Management Command
program
  .command('model')
  .description('View or update configured models')
  .argument('[action]', 'Action: list | set | get', 'list')
  .argument('[provider]', 'Provider: gemini | anthropic | openai | deepseek | ollama')
  .argument('[modelName]', 'Model identifier to set (e.g. gemini-3.7-flash, claude-sonnet-5)')
  .option('-g, --global', 'Apply globally to ~/.deliberaterc', false)
  .action(async (action, provider, modelName, options) => {
    const { ConfigManager } = await import('../core/config.js');
    const config = (await ConfigManager.load()) || { mode: 'unified', unified: { provider: 'gemini' } };

    if (action === 'list' || action === 'get') {
      console.log(picocolors.bold(picocolors.cyan('\n⚡ Current Deliberate Model Configuration:\n')));
      console.log(`  Mode: ${picocolors.bold(config.mode)}`);
      if (config.mode === 'unified') {
        console.log(`  Provider: ${picocolors.green(config.unified?.provider || 'auto-detect')}`);
        console.log(`  Model: ${picocolors.green(config.unified?.model || 'latest default')}`);
      } else {
        console.log(picocolors.yellow('  Persona Assignments:'));
        for (const [persona, sel] of Object.entries(config.personas || {})) {
          console.log(`   • ${persona}: ${picocolors.cyan(sel?.provider || 'default')} (${picocolors.dim(sel?.model || 'latest default')})`);
        }
      }
      console.log(picocolors.dim('\nTo change models interactively, run: npx deliberate-ai config\n'));
      return;
    }

    if (action === 'set') {
      if (!provider) {
        console.error(picocolors.red('Error: Please specify a provider (e.g. deliberate model set gemini gemini-3.7-flash)'));
        process.exit(1);
      }

      config.mode = 'unified';
      config.unified = {
        provider: provider as any,
        model: modelName,
      };

      const savedPath = await ConfigManager.save(config, options.global);
      console.log(picocolors.green(`✔ Updated model to ${picocolors.bold(provider)} (${modelName || 'latest default'}) in ${savedPath}!`));
    }
  });

// Install Command for Agent Skills & Rules
program
  .command('install')
  .description('Install Deliberate skills and rules into Antigravity, Claude, Codex, Cursor, and Windsurf')
  .option('-t, --target <target>', 'Target agent: all, antigravity, claude, codex, cursor, windsurf', 'all')
  .action(async (options) => {
    DeliberateTui.printBanner();
    console.log(picocolors.bold(picocolors.cyan(`⚡ Installing Deliberate integration for target: ${options.target}...\n`)));

    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const cwd = process.cwd();

    // 1. Google Antigravity Skill Installation
    if (options.target === 'all' || options.target === 'antigravity') {
      const agySkillDir = path.join(homeDir, '.gemini', 'antigravity', 'skills', 'deliberate');
      try {
        await fs.mkdir(agySkillDir, { recursive: true });
        const skillContent = `---
name: deliberate
description: Systematic multi-agent ideation and adversarial deliberation council (TRIZ, Inversion, First-Principles, 6 Personas) for architecture design and code review.
---

# Deliberate Reasoning Engine

Run multi-agent deliberation before implementing complex features:
- \`npx deliberate-ai brainstorm "<goal>"\`
- \`npx deliberate-ai red-team <filepath>\`
`;
        await fs.writeFile(path.join(agySkillDir, 'SKILL.md'), skillContent, 'utf-8');
        console.log(picocolors.green(`✔ Google Antigravity skill installed to ${picocolors.bold(agySkillDir)}`));
      } catch (err: unknown) {
        console.log(picocolors.yellow(`⚠ Could not write Antigravity skill: ${(err as Error).message}`));
      }
    }

    // 2. Claude Desktop MCP Config
    if (options.target === 'all' || options.target === 'claude') {
      const claudeConfigDir = path.join(homeDir, 'Library', 'Application Support', 'Claude');
      const claudeConfigFile = path.join(claudeConfigDir, 'claude_desktop_config.json');
      try {
        await fs.mkdir(claudeConfigDir, { recursive: true });
        let existingConfig: any = {};
        try {
          const raw = await fs.readFile(claudeConfigFile, 'utf-8');
          existingConfig = JSON.parse(raw);
        } catch {
          existingConfig = {};
        }

        existingConfig.mcpServers = existingConfig.mcpServers || {};
        existingConfig.mcpServers['deliberate'] = {
          command: 'npx',
          args: ['-y', 'deliberate-ai', 'mcp'],
        };

        await fs.writeFile(claudeConfigFile, JSON.stringify(existingConfig, null, 2), 'utf-8');
        console.log(picocolors.green(`✔ Claude Code / Desktop MCP server configured in ${picocolors.bold(claudeConfigFile)}`));
      } catch (err: unknown) {
        console.log(picocolors.yellow(`⚠ Could not write Claude config: ${(err as Error).message}`));
      }
    }

    // 3. Cursor & Windsurf Rules
    if (options.target === 'all' || options.target === 'cursor' || options.target === 'windsurf') {
      const cursorRulesPath = path.join(cwd, '.cursorrules');
      const rulesContent = `# Deliberate Reasoning Engine Rules
Before generating complex architectural systems or refactors, invoke Deliberate:
- Run: npx deliberate-ai brainstorm "<feature_goal>"
- Run: npx deliberate-ai red-team <file_path>
- Invariants generated by Deliberate must be treated as non-negotiable hard constraints.
`;
      try {
        await fs.writeFile(cursorRulesPath, rulesContent, 'utf-8');
        console.log(picocolors.green(`✔ .cursorrules added to current project (${picocolors.bold(cursorRulesPath)})`));
      } catch (err: unknown) {
        console.log(picocolors.yellow(`⚠ Could not write .cursorrules: ${(err as Error).message}`));
      }
    }

    console.log(picocolors.bold(picocolors.green('\n🎉 Deliberate is fully installed and ready across your AI coding agent toolchain!')));
  });

// MCP Server Command
program
  .command('mcp')
  .description('Start Model Context Protocol (MCP) server for Claude Code, Antigravity, and Cursor')
  .action(async () => {
    const server = new DeliberateMcpServer();
    await server.start();
  });

program.parse(process.argv);
