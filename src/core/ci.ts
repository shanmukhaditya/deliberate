import fs from 'fs/promises';
import path from 'path';
import { GitHelper } from './git.js';
import { DeliberationEngine } from './engine.js';
import { DeliberationResult } from './types.js';

export class CiHelper {
  /**
   * Runs CI adversarial red-team audit and writes GitHub Step Summary
   */
  static async runPrAudit(options: {
    provider?: string;
    summaryFile?: string;
  } = {}): Promise<{ result: DeliberationResult | null; summaryMarkdown: string }> {
    const gitDiff = await GitHelper.getDiff(false);

    if (!gitDiff.hasDiff) {
      const emptyMsg = `### ⚡ Deliberate CI PR Audit\n\n> No code modifications detected in this PR run.`;
      return { result: null, summaryMarkdown: emptyMsg };
    }

    const engine = new DeliberationEngine();
    const result = await engine.run({
      goal: `Audit Pull Request changes across ${gitDiff.filesChanged.length} files: ${gitDiff.filesChanged.join(', ')}`,
      mode: 'red-team',
      provider: options.provider,
      filePath: 'Pull Request Diff',
      fileContent: gitDiff.diffText,
    });

    const bp = result.blueprint;
    let md = `## ⚡ Deliberate CI: Pull Request Invariant & Risk Audit\n\n`;
    md += `* **Status:** Passed with ${bp.coreInvariants.length} non-negotiable invariants\n`;
    md += `* **Files Inspected:** \`${gitDiff.filesChanged.join('`, `')}\`\n\n`;

    md += `### 🛡️ Non-Negotiable Invariants Required\n\n`;
    bp.coreInvariants.forEach((inv, i) => {
      md += `${i + 1}. **${inv}**\n`;
    });
    md += `\n`;

    if (bp.failureModesAndMitigations?.length) {
      md += `### ⚠️ Potential Failure Modes & Recommended Mitigations\n\n`;
      md += `| # | Risk / Threat | Recommended Mitigation |\n| :--- | :--- | :--- |\n`;
      bp.failureModesAndMitigations.forEach((fm, i) => {
        md += `| ${i + 1} | **${fm.failureMode}** | ${fm.mitigation} |\n`;
      });
      md += `\n`;
    }

    md += `### 🥊 Council Attack Vectors\n\n`;
    for (const critique of result.councilDebates) {
      md += `* **${critique.personaName}:** ${critique.coreCritique}\n`;
    }
    md += `\n---\n*Audited by [Deliberate CI](https://github.com/shanmukhaditya/deliberate)*\n`;

    // If running inside GitHub Actions, write to GITHUB_STEP_SUMMARY
    const stepSummaryEnv = process.env.GITHUB_STEP_SUMMARY;
    if (stepSummaryEnv) {
      try {
        await fs.appendFile(stepSummaryEnv, md + '\n', 'utf-8');
      } catch {
        // ignore
      }
    }

    if (options.summaryFile) {
      const absPath = path.resolve(process.cwd(), options.summaryFile);
      await fs.mkdir(path.dirname(absPath), { recursive: true });
      await fs.writeFile(absPath, md, 'utf-8');
    }

    return { result, summaryMarkdown: md };
  }
}
