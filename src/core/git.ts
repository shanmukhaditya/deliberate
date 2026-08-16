import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface GitDiffResult {
  hasDiff: boolean;
  diffText: string;
  filesChanged: string[];
  summary: string;
}

export class GitHelper {
  /**
   * Extracts git diff for unstaged or staged changes with timeout protection
   */
  static async getDiff(staged = false, cwd = process.cwd()): Promise<GitDiffResult> {
    try {
      const args = staged ? ['diff', '--cached'] : ['diff', 'HEAD'];
      const { stdout } = await execFileAsync('git', args, {
        cwd,
        timeout: 10000,
        maxBuffer: 10 * 1024 * 1024,
      });

      const diffText = stdout.trim();
      if (!diffText) {
        return {
          hasDiff: false,
          diffText: '',
          filesChanged: [],
          summary: 'No git changes detected.',
        };
      }

      // Extract changed file names
      const fileNames = Array.from(
        new Set(
          diffText
            .split('\n')
            .filter((line) => line.startsWith('diff --git'))
            .map((line) => line.split(' ')[2]?.replace(/^a\//, ''))
            .filter(Boolean) as string[]
        )
      );

      return {
        hasDiff: true,
        diffText,
        filesChanged: fileNames,
        summary: `Detected changes across ${fileNames.length} file(s): ${fileNames.join(', ')}`,
      };
    } catch (err: unknown) {
      return {
        hasDiff: false,
        diffText: '',
        filesChanged: [],
        summary: `Git command error: ${(err as Error).message}`,
      };
    }
  }
}
