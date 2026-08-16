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
import { GitHelper } from '../core/git.js';
import { CodebaseScaffolder } from '../core/scaffolder.js';
import { DeliberationMode, DeliberationResult, PersonaId } from '../core/types.js';

const program = new Command();

program
  .name('deliberate')
  .description('Deep Ideation & Multi-Agent Deliberation for AI Coding Agents')
  .version('1.0.2');

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
  .option('--scaffold [outDir]', 'Directly materialize the synthesized code skeleton into project files')
  .option('--test-gen [outPath]', 'Generate runnable unit test suite enforcing architectural invariants')
  .option('--ui', 'Start local browser dashboard visualizer upon completion')
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
          console.log(picocolors.green(`✔ Architectural Decision Record (ADR) saved to ${picocolors.bold(adrPath)}`));
        }
      }

      // Handle direct scaffolding if requested
      if (options.scaffold) {
        const outDir = typeof options.scaffold === 'string' ? options.scaffold : './src/architecture';
        const scaffoldResult = await CodebaseScaffolder.scaffold(result, { outDir });
        if (!isJson) {
          console.log(picocolors.green(`✔ Scaffolding materialized to ${picocolors.bold(scaffoldResult.path)} (${scaffoldResult.bytesWritten} bytes)`));
        }
      }

      // Handle invariant test generation if requested
      if (options.testGen) {
        const { InvariantTestGenerator } = await import('../core/test_generator.js');
        const testPath = typeof options.testGen === 'string' ? options.testGen : './tests/generated_invariants.test.ts';
        const testRes = await InvariantTestGenerator.writeToFile(result, testPath);
        if (!isJson) {
          console.log(picocolors.green(`✔ Invariant test suite generated at ${picocolors.bold(testRes.path)}\n`));
        }
      }

      // Handle --ui browser dashboard
      if (options.ui) {
        const { DashboardServer } = await import('../core/server.js');
        const { url } = await DashboardServer.start(result);
        console.log(picocolors.bold(picocolors.magenta(`\n🌐 Visual Dashboard running at: ${picocolors.underline(url)} (Press Ctrl+C to exit)\n`)));
      }
    } catch (err: unknown) {
      if (spinner) spinner.fail(picocolors.red('Deliberation error occurred.'));
      console.error(err);
      process.exit(1);
    }
  });

// Red-Team Command
program
  .command('red-team [file]')
  .description('Adversarially stress-test a target source file or uncommitted git diff against failures')
  .option('-g, --goal <goal>', 'What the target code is trying to achieve', 'Stress-test code invariants')
  .option('--git', 'Automatically extract and red-team uncommitted git changes')
  .option('--staged', 'Automatically extract and red-team staged git changes')
  .option('-p, --provider <provider>', 'LLM provider')
  .option('-v, --verbose', 'Show verbatim persona critiques')
  .option('--show-debate', 'Show verbatim persona critiques')
  .option('--export <filepath>', 'Export red-team audit report to file')
  .option('--json', 'Output raw JSON')
  .action(async (targetFile: string | undefined, options) => {
    const isJson = Boolean(options.json);
    const showDebate = Boolean(options.verbose || options.showDebate);

    if (!isJson) DeliberateTui.printBanner();

    let content = '';
    let filePath = targetFile || 'git_diff';

    if (options.git || options.staged || !targetFile) {
      const gitResult = await GitHelper.getDiff(Boolean(options.staged));
      if (!gitResult.hasDiff) {
        console.log(picocolors.yellow(`\n⚠ ${gitResult.summary}\n`));
        return;
      }
      content = gitResult.diffText;
      filePath = `git_diff (${gitResult.filesChanged.length} files: ${gitResult.filesChanged.slice(0, 3).join(', ')})`;
      if (!isJson) {
        console.log(picocolors.cyan(`🔍 Inspecting ${gitResult.summary}...\n`));
      }
    } else {
      const absPath = path.resolve(process.cwd(), targetFile);
      try {
        content = await fs.readFile(absPath, 'utf-8');
      } catch {
        console.error(picocolors.red(`Error: Could not read file at ${absPath}`));
        process.exit(1);
      }
    }

    const spinner = isJson
      ? null
      : ora({
          text: picocolors.red(`Summoning Red-Team Council for ${filePath}...`),
          color: 'red',
        }).start();

    const engine = new DeliberationEngine();

    try {
      const result = await engine.run({
        goal: options.goal,
        mode: 'red-team',
        provider: options.provider,
        filePath,
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

// Direct Scaffold Command
program
  .command('scaffold <blueprintFile>')
  .description('Materialize an architectural blueprint (JSON or Markdown) into runnable project code files')
  .option('-o, --out-dir <dir>', 'Target output directory', './src/architecture')
  .option('-w, --overwrite', 'Overwrite existing files if present', false)
  .action(async (blueprintFile: string, options) => {
    DeliberateTui.printBanner();
    const absPath = path.resolve(process.cwd(), blueprintFile);

    try {
      const fileContent = await fs.readFile(absPath, 'utf-8');
      const res = await CodebaseScaffolder.scaffold(fileContent, {
        outDir: options.outDir,
        overwrite: options.overwrite,
      });
      console.log(picocolors.green(`\n✔ Successfully scaffolded code to ${picocolors.bold(res.path)} (${res.bytesWritten} bytes)!\n`));
    } catch (err: unknown) {
      console.error(picocolors.red(`Error: ${(err as Error).message}`));
      process.exit(1);
    }
  });

// Invariant Test Generator Command
program
  .command('test-gen <blueprintFile>')
  .description('Generate runnable unit test suite enforcing architectural invariants from a blueprint')
  .option('-o, --out-file <path>', 'Output test file path', './tests/generated_invariants.test.ts')
  .action(async (blueprintFile: string, options) => {
    DeliberateTui.printBanner();
    const { InvariantTestGenerator } = await import('../core/test_generator.js');
    const absPath = path.resolve(process.cwd(), blueprintFile);

    try {
      const raw = await fs.readFile(absPath, 'utf-8');
      const parsed = JSON.parse(raw) as DeliberationResult;
      const res = await InvariantTestGenerator.writeToFile(parsed, options.outFile);
      console.log(picocolors.green(`\n✔ Successfully generated invariant tests at ${picocolors.bold(res.path)} (${res.bytesWritten} bytes)!\n`));
    } catch (err: unknown) {
      console.error(picocolors.red(`Error: ${(err as Error).message}`));
      process.exit(1);
    }
  });

// CI Pull Request Auditor Command
program
  .command('ci')
  .description('Run automated CI Pull Request Invariant & Risk Audit')
  .option('-s, --summary <filepath>', 'Save step summary markdown to file')
  .option('-p, --provider <provider>', 'LLM provider')
  .action(async (options) => {
    const { CiHelper } = await import('../core/ci.js');
    console.log(picocolors.bold(picocolors.cyan('\n⚡ Running Deliberate CI Pull Request Invariant Audit...\n')));

    try {
      const { summaryMarkdown } = await CiHelper.runPrAudit({
        summaryFile: options.summary,
        provider: options.provider,
      });
      console.log(summaryMarkdown);
      console.log(picocolors.green('✔ CI Audit completed successfully!\n'));
    } catch (err: unknown) {
      console.error(picocolors.red(`CI Audit failed: ${(err as Error).message}`));
      process.exit(1);
    }
  });

// Visual Web Dashboard Command
program
  .command('ui [blueprintFile]')
  .alias('serve')
  .description('Start local web server and open interactive Visual Blueprint Dashboard')
  .option('-p, --port <port>', 'Port number to listen on', '3333')
  .action(async (blueprintFile: string | undefined, options) => {
    DeliberateTui.printBanner();
    const { DashboardServer } = await import('../core/server.js');
    let result: DeliberationResult;

    if (blueprintFile) {
      const absPath = path.resolve(process.cwd(), blueprintFile);
      const raw = await fs.readFile(absPath, 'utf-8');
      result = JSON.parse(raw) as DeliberationResult;
    } else {
      // Create quick sample deliberation result
      const engine = new DeliberationEngine();
      result = await engine.run({
        goal: 'Deliberate Interactive Web Dashboard',
        mode: 'flash',
        provider: 'mock',
      });
    }

    const port = parseInt(options.port, 10) || 3333;
    const serverInfo = await DashboardServer.start(result, port);
    console.log(picocolors.bold(picocolors.green(`\n🚀 Deliberate Visual Dashboard is LIVE at:`)));
    console.log(`   ${picocolors.bold(picocolors.cyan(picocolors.underline(serverInfo.url)))}\n`);
    console.log(picocolors.dim('   Interactive Pareto Radar, Collapsible Debates & Code Scaffolds.\n   Press Ctrl+C to stop.\n'));
  });

// Web Playground Command
program
  .command('playground')
  .description('Launch the interactive Deliberate Web Playground & Architecture Roaster in your browser')
  .option('-p, --port <port>', 'Port number to listen on', '3000')
  .action(async (options) => {
    DeliberateTui.printBanner();
    const http = await import('http');
    const { PLAYGROUND_HTML } = await import('../core/playground_html.js');

    let port = parseInt(options.port, 10) || 3000;
    const startServer = () => {
      const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(PLAYGROUND_HTML);
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          port++;
          startServer();
        } else {
          console.error(err);
        }
      });

      server.listen(port, () => {
        const url = `http://localhost:${port}`;
        console.log(picocolors.bold(picocolors.green(`\n🎮 Deliberate Web Playground is LIVE at:`)));
        console.log(`   ${picocolors.bold(picocolors.cyan(picocolors.underline(url)))}\n`);
        console.log(picocolors.dim('   Roast My Architecture & Interactive Council.\n   Press Ctrl+C to stop.\n'));
      });
    };

    startServer();
  });

// Multi-Provider Benchmark Command
program
  .command('benchmark <goal>')
  .description('Benchmark latency, tokens, and Pareto scores across all LLM providers')
  .action(async (goal: string) => {
    DeliberateTui.printBanner();
    const { BenchmarkRunner } = await import('../core/benchmark.js');
    console.log(picocolors.bold(picocolors.cyan(`\n⚡ Running Multi-Provider Benchmark for: "${goal}"...\n`)));

    const spinner = ora('Evaluating provider latency and outputs...').start();
    const results = await BenchmarkRunner.run(goal);
    spinner.stop();

    const Table = (await import('cli-table3')).default;
    const table = new Table({
      head: [
        picocolors.bold('Provider'),
        picocolors.bold('Model'),
        picocolors.bold('Status'),
        picocolors.bold('Latency (ms)'),
        picocolors.bold('Pareto Score'),
      ],
      colWidths: [18, 25, 15, 15, 15],
    });

    for (const r of results) {
      table.push([
        picocolors.bold(r.provider),
        picocolors.dim(r.model),
        r.available ? picocolors.green('✔ Available') : picocolors.red('✖ Offline'),
        r.available ? `${r.executionTimeMs}ms` : '-',
        r.available ? `${r.overallScore}/10` : '-',
      ]);
    }

    console.log(table.toString() + '\n');
  });

// Git Hook Manager Command
program
  .command('hook')
  .description('Manage Git pre-push and pre-commit protection hooks')
  .argument('[action]', 'Action: install | remove | status', 'install')
  .action(async (action) => {
    DeliberateTui.printBanner();
    const { GitHookManager } = await import('../core/hooks.js');

    if (action === 'install') {
      const res = await GitHookManager.install();
      if (res.success) {
        console.log(picocolors.green(`\n✔ ${res.message}`));
        console.log(picocolors.dim(`   Hook location: ${res.hookPath}\n`));
      } else {
        console.log(picocolors.red(`\n✖ ${res.message}\n`));
      }
    } else if (action === 'remove' || action === 'uninstall') {
      const res = await GitHookManager.remove();
      console.log(picocolors.yellow(`\n✔ ${res.message}\n`));
    }
  });

// Architecture Evolution Differ Command
program
  .command('diff <blueprintA> <blueprintB>')
  .description('Semantically diff two architectural blueprints to track invariant evolution and Pareto deltas')
  .action(async (bpAFile: string, bpBFile: string) => {
    DeliberateTui.printBanner();
    const { BlueprintDiffer } = await import('../core/differ.js');
    const pathA = path.resolve(process.cwd(), bpAFile);
    const pathB = path.resolve(process.cwd(), bpBFile);

    try {
      const rawA = await fs.readFile(pathA, 'utf-8');
      const rawB = await fs.readFile(pathB, 'utf-8');
      const a = JSON.parse(rawA) as DeliberationResult;
      const b = JSON.parse(rawB) as DeliberationResult;

      const diff = BlueprintDiffer.diff(a, b);
      console.log(picocolors.bold(picocolors.cyan('\n⚡ Architectural Blueprint Evolution Diff:\n')));
      console.log(`  ${picocolors.dim('Blueprint A:')} ${picocolors.white(diff.titleA)} (Score: ${diff.overallScoreA}/10)`);
      console.log(`  ${picocolors.dim('Blueprint B:')} ${picocolors.white(diff.titleB)} (Score: ${diff.overallScoreB}/10)`);
      console.log(`  ${picocolors.bold('Score Delta:')} ${diff.overallScoreDelta >= 0 ? picocolors.green(`+${diff.overallScoreDelta}`) : picocolors.red(diff.overallScoreDelta.toString())}\n`);

      const Table = (await import('cli-table3')).default;
      const table = new Table({
        head: [picocolors.bold('Criterion'), picocolors.bold('A'), picocolors.bold('B'), picocolors.bold('Delta')],
        colWidths: [20, 10, 10, 12],
      });

      for (const c of diff.criteriaDiffs) {
        table.push([
          c.criterion.toUpperCase(),
          c.scoreA.toString(),
          c.scoreB.toString(),
          c.delta > 0 ? picocolors.green(`+${c.delta}`) : c.delta < 0 ? picocolors.red(c.delta.toString()) : '0',
        ]);
      }
      console.log(table.toString());

      if (diff.invariantsAdded.length) {
        console.log(picocolors.green('\n➕ Invariants Added:'));
        diff.invariantsAdded.forEach((inv) => console.log(`  + ${inv}`));
      }

      if (diff.invariantsRemoved.length) {
        console.log(picocolors.red('\n➖ Invariants Removed:'));
        diff.invariantsRemoved.forEach((inv) => console.log(`  - ${inv}`));
      }

      console.log('\n');
    } catch (err: unknown) {
      console.error(picocolors.red(`Diff error: ${(err as Error).message}`));
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

// Persona Management Command
program
  .command('persona')
  .description('List available personas or create a custom project persona')
  .argument('[action]', 'Action: list | init', 'list')
  .action(async (action) => {
    const { PersonaRegistry } = await import('../core/personas/registry.js');

    if (action === 'list') {
      console.log(picocolors.bold(picocolors.cyan('\n🏛️  Deliberate Adversarial Council Personas:\n')));
      const all = PersonaRegistry.getAll();
      for (const p of all) {
        console.log(`  • ${picocolors.bold(p.name)} (${picocolors.yellow(p.id)})`);
        console.log(`    ${picocolors.dim(p.definition.stance)}`);
        console.log(`    Cognitive Duty: ${picocolors.white(p.definition.cognitiveDuty)}\n`);
      }
      return;
    }

    if (action === 'init') {
      const samplePath = path.resolve(process.cwd(), 'deliberate.personas.json');
      const sampleContent = [
        {
          id: 'compliance',
          name: 'The Compliance & Governance Officer',
          title: 'Staff Compliance Architect',
          stance: 'Enforce SOC2, GDPR, HIPAA, and Zero-Trust data governance.',
          cognitiveDuty: 'Audit data lineage, tenant boundaries, and cryptographic logging.',
          bias: 'resilience',
          systemPrompt: 'You are the Compliance Officer. You demand strict tenant data isolation, audit logs, and data retention policies.'
        }
      ];
      await fs.writeFile(samplePath, JSON.stringify(sampleContent, null, 2), 'utf-8');
      console.log(picocolors.green(`✔ Created custom persona template at ${picocolors.bold(samplePath)}!`));
      console.log(picocolors.dim('Edit this file to define domain-specific council members for your team.\n'));
    }
  });

// Topology Management Command
program
  .command('topology')
  .description('List available thinking topologies or create a custom project topology')
  .argument('[action]', 'Action: list | init', 'list')
  .action(async (action) => {
    const { TopologyRegistry } = await import('../core/topologies/registry.js');

    if (action === 'list') {
      console.log(picocolors.bold(picocolors.cyan('\n🧠 Deliberate Systematic Thinking Topologies:\n')));
      const all = TopologyRegistry.getAll();
      for (const t of all) {
        console.log(`  • ${picocolors.bold(t.title)} (${picocolors.yellow(t.type)})`);
        console.log(`    ${picocolors.dim(t.description)}\n`);
      }
      return;
    }

    if (action === 'init') {
      const samplePath = path.resolve(process.cwd(), 'deliberate.topologies.json');
      const sampleContent = [
        {
          type: 'chaos-engineering',
          title: 'Chaos & Blast Radius Deconstruction',
          description: 'Simulate sudden network partitions, corrupted disk writes, and runaway cascading dependencies.',
          promptTemplate: 'Identify 3 unrecoverable chaos scenarios and propose hard circuit breaker invariants.'
        }
      ];
      await fs.writeFile(samplePath, JSON.stringify(sampleContent, null, 2), 'utf-8');
      console.log(picocolors.green(`✔ Created custom topology template at ${picocolors.bold(samplePath)}!`));
    }
  });

// Interactive Council Interview Command ("Grill Me" Mode)
program
  .command('interview <goal>')
  .alias('grill-me')
  .description('Interactive Council Q&A interview to resolve underspecified requirements before deliberating')
  .option('-p, --provider <provider>', 'LLM provider')
  .action(async (goal: string, options) => {
    DeliberateTui.printBanner();
    console.log(picocolors.bold(picocolors.magenta(`\n🥊 Convening Adversarial Council Interview for: "${goal}"...\n`)));

    const { ProviderFactory } = await import('../core/providers/factory.js');
    const { CouncilInterviewer } = await import('../core/interview.js');
    const provider = await ProviderFactory.create(options.provider);
    const interviewer = new CouncilInterviewer(provider);

    const spinner = ora('Formulating sharp adversarial questions...').start();
    const questions = await interviewer.generateQuestions(goal);
    spinner.stop();

    console.log(picocolors.bold(picocolors.cyan('Answer these clarifying questions to eliminate design ambiguity:\n')));
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]!;
      console.log(`  ${picocolors.bold(picocolors.yellow(`[${q.persona}]`))} ${picocolors.white(q.question)}`);
      console.log(`  ${picocolors.dim(`↳ Why it matters: ${q.whyItMatters}`)}\n`);
    }

    console.log(picocolors.dim('Run brainstorm with your answers: npx deliberate-ai brainstorm "<goal>" -c "<answers>"\n'));
  });

// Automated GitHub Release Command
program
  .command('release [tagName]')
  .description('Publish official GitHub Release with release notes via GitHub REST API')
  .option('-t, --title <title>', 'Release title', 'Deliberate Production Release')
  .action(async (tagName: string | undefined, options) => {
    DeliberateTui.printBanner();
    const { GitHubReleasePublisher } = await import('../core/github_release.js');
    const tag = tagName || 'v1.0.0';

    const res = await GitHubReleasePublisher.publish({
      tagName: tag,
      releaseTitle: options.title || `${tag}: Production GA Release`,
      bodyMarkdown: `### ⚡ Deliberate ${tag} — Production Release\n\nSystem-2 multi-agent deliberation and adversarial reasoning engine for AI coding agents.`,
    });

    if (res.success) {
      console.log(picocolors.bold(picocolors.green(`\n✔ Successfully published GitHub Release at: ${res.url}\n`)));
    } else {
      console.log(picocolors.yellow(`\n⚠ ${res.error}`));
      console.log(`👉 Publish in 1 click: ${picocolors.cyan(picocolors.underline(res.url))}\n`);
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
