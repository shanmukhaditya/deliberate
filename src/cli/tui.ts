import picocolors from 'picocolors';
import boxen from 'boxen';
import Table from 'cli-table3';
import { DeliberationResult, PersonaCritique } from '../core/types.js';

export class DeliberateTui {
  static printBanner() {
    console.log(
      picocolors.bold(
        picocolors.cyan(`
  ██████╗ ███████╗██╗     ██╗██████╗ ███████╗██████╗  █████╗ ████████╗███████╗
  ██╔══██╗██╔════╝██║     ██║██╔══██╗██╔════╝██╔══██╗██╔══██╗╚══██╔══╝██╔════╝
  ██║  ██║█████╗  ██║     ██║██████╔╝█████╗  ██████╔╝███████║   ██║   █████╗  
  ██║  ██║██╔══╝  ██║     ██║██╔══██╗██╔══╝  ██╔══██╗██╔══██║   ██║   ██╔══╝  
  ██████╔╝███████╗███████╗██║██████╔╝███████╗██║  ██║██║  ██║   ██║   ███████╗
  ╚═════╝ ╚══════╝╚══════╝╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
        Deep Ideation & Multi-Agent Deliberation for AI Coding Agents
`)
      )
    );
  }

  static renderDebates(debates: PersonaCritique[]) {
    console.log('\n' + picocolors.bold(picocolors.magenta('🥊 ADVERSARIAL COUNCIL DEBATES & CRITIQUES:\n')));

    const personaIcons: Record<string, string> = {
      architect: '🏛️',
      contrarian: '🥊',
      performance: '⚡',
      dx: '💎',
      security: '🛡️',
      pragmatist: '🔨',
    };

    for (const critique of debates) {
      const icon = personaIcons[critique.personaId] || '👤';
      const cardContent = `
${picocolors.bold(picocolors.yellow('CORE CRITIQUE:'))} ${critique.coreCritique}

${picocolors.bold(picocolors.green('STRENGTHS IDENTIFIED:'))}
${critique.strengths.map((s) => `  ${picocolors.green('✔')} ${s}`).join('\n')}

${picocolors.bold(picocolors.red('ATTACK VECTORS & VULNERABILITIES:'))}
${critique.vulnerabilities.map((v) => `  ${picocolors.red('✖')} ${v}`).join('\n')}

${picocolors.bold(picocolors.cyan('REQUIRED INVARIANTS:'))}
${critique.requiredInvariants.map((inv) => `  ${picocolors.cyan('•')} ${inv}`).join('\n')}
${critique.proposedAlternative ? `\n${picocolors.bold(picocolors.magenta('COUNTER-PROPOSAL:'))} ${critique.proposedAlternative}` : ''}
`.trim();

      console.log(
        boxen(cardContent, {
          padding: 1,
          margin: { top: 0, bottom: 1, left: 0, right: 0 },
          borderStyle: 'round',
          borderColor: critique.personaId === 'contrarian' ? 'red' : critique.personaId === 'security' ? 'yellow' : 'cyan',
          title: ` ${icon} ${critique.personaName} `,
          titleAlignment: 'left',
        })
      );
    }
  }

  static renderResult(result: DeliberationResult, showDebate = false) {
    if (showDebate && result.councilDebates && result.councilDebates.length > 0) {
      this.renderDebates(result.councilDebates);
    }

    const bp = result.blueprint;
    const win = bp.winningArchitecture;

    console.log('\n');

    // 1. Executive Summary Box
    const summaryText = `
${picocolors.bold(picocolors.yellow('GOAL:'))} ${result.goal}
${picocolors.bold(picocolors.green('WINNING ARCHITECTURE:'))} ${win.title} (${win.paradigm})
${picocolors.bold(picocolors.magenta('OVERALL PARETO SCORE:'))} ${win.overallScore}/10  |  ${picocolors.dim(`Execution Time: ${result.executionTimeMs}ms`)}

${picocolors.white(bp.executiveSummary)}
`.trim();

    console.log(
      boxen(summaryText, {
        padding: 1,
        margin: 0,
        borderStyle: 'round',
        borderColor: 'cyan',
        title: ' ⚡ DELIBERATE SYNTHESIS BLUEPRINT ',
        titleAlignment: 'center',
      })
    );

    // 2. Pareto Criteria Scores Table
    console.log('\n' + picocolors.bold(picocolors.cyan('📊 PARETO CRITERIA BREAKDOWN:')));
    const scoreTable = new Table({
      head: [
        picocolors.bold('Criterion'),
        picocolors.bold('Score (1-10)'),
        picocolors.bold('Trade-Off Rationale'),
      ],
      colWidths: [20, 15, 60],
      wordWrap: true,
    });

    for (const score of win.scores) {
      const colorScore =
        score.score >= 8.5
          ? picocolors.green(score.score.toString())
          : score.score >= 7.0
            ? picocolors.yellow(score.score.toString())
            : picocolors.red(score.score.toString());

      scoreTable.push([score.criterion.toUpperCase(), colorScore, score.rationale]);
    }
    console.log(scoreTable.toString());

    // 3. Invariants & Guardrails
    console.log('\n' + picocolors.bold(picocolors.yellow('🛡️  HARD ARCHITECTURAL INVARIANTS (MUST SATISFY):')));
    bp.coreInvariants.forEach((inv, i) => {
      console.log(`  ${picocolors.cyan(`[Invariant ${i + 1}]`)} ${picocolors.white(inv)}`);
    });

    // 4. Failure Modes & Mitigations
    if (bp.failureModesAndMitigations?.length) {
      console.log('\n' + picocolors.bold(picocolors.red('⚠️  SIMULATED FAILURE MODES & MITIGATIONS:')));
      bp.failureModesAndMitigations.forEach((fm, i) => {
        console.log(
          `  ${picocolors.red(`[Threat ${i + 1}]`)} ${picocolors.bold(fm.failureMode)}\n    ${picocolors.green('↳ Mitigation:')} ${fm.mitigation}`
        );
      });
    }

    // 5. Rejected Alternatives
    if (bp.rejectedAlternatives?.length) {
      console.log('\n' + picocolors.bold(picocolors.magenta('❌ REJECTED ALTERNATIVES (WHY THEY LOST):')));
      bp.rejectedAlternatives.forEach((alt) => {
        console.log(
          `  ${picocolors.dim('•')} ${picocolors.bold(alt.title)}: ${picocolors.dim(alt.rejectionReason)}`
        );
      });
    }

    // 6. Actionable Implementation Steps
    console.log('\n' + picocolors.bold(picocolors.green('🚀 STEP-BY-STEP IMPLEMENTATION PLAN:')));
    bp.implementationSteps.forEach((step) => {
      console.log(`  ${picocolors.green('✔')} ${step}`);
    });

    // 7. Architectural Code Skeleton
    if (bp.codeSkeleton) {
      console.log('\n' + picocolors.bold(picocolors.cyan('💻 ARCHITECTURAL CODE SKELETON:')));
      console.log(
        boxen(bp.codeSkeleton, {
          padding: 1,
          borderStyle: 'single',
          borderColor: 'gray',
        })
      );
    }

    // 8. Deliberation Telemetry Footer
    if (result.telemetry) {
      const tel = result.telemetry;
      console.log(
        picocolors.dim(
          `⏱️  ${result.executionTimeMs}ms  |  🔄 Rounds: ${tel.roundsCompleted}  |  📊 Tokens: ${tel.totalTokens || 'N/A'} (Prompt: ${tel.totalPromptTokens}, Completion: ${tel.totalCompletionTokens})  |  🤖 Providers: ${tel.providersUsed.join(', ')}`
        )
      );
    }

    console.log('\n');
  }
}
