import fs from 'fs/promises';
import path from 'path';

export class GitHookManager {
  /**
   * Finds the root .git directory
   */
  static async findGitDir(cwd = process.cwd()): Promise<string | null> {
    let current = path.resolve(cwd);
    while (current !== path.dirname(current)) {
      const gitPath = path.join(current, '.git');
      try {
        const stat = await fs.stat(gitPath);
        if (stat.isDirectory()) {
          return gitPath;
        }
      } catch {
        // continue walking up
      }
      current = path.dirname(current);
    }
    return null;
  }

  /**
   * Installs pre-push red-team git hook
   */
  static async install(cwd = process.cwd()): Promise<{ success: boolean; hookPath: string; message: string }> {
    const gitDir = await this.findGitDir(cwd);
    if (!gitDir) {
      return {
        success: false,
        hookPath: '',
        message: 'No .git directory found in current working tree.',
      };
    }

    const hooksDir = path.join(gitDir, 'hooks');
    await fs.mkdir(hooksDir, { recursive: true });

    const prePushPath = path.join(hooksDir, 'pre-push');
    const hookScript = `#!/bin/sh
# Deliberate Pre-Push Invariant & Risk Protection Hook
if [ -f "./dist/cli/index.js" ]; then
  node ./dist/cli/index.js red-team --git
elif command -v deliberate >/dev/null 2>&1; then
  deliberate red-team --git
fi
exit 0
`;

    await fs.writeFile(prePushPath, hookScript, { mode: 0o755 });
    return {
      success: true,
      hookPath: prePushPath,
      message: 'Git pre-push hook successfully installed and activated.',
    };
  }

  /**
   * Removes pre-push git hook
   */
  static async remove(cwd = process.cwd()): Promise<{ success: boolean; message: string }> {
    const gitDir = await this.findGitDir(cwd);
    if (!gitDir) {
      return { success: false, message: 'No .git directory found.' };
    }

    const prePushPath = path.join(gitDir, 'hooks', 'pre-push');
    try {
      await fs.unlink(prePushPath);
      return { success: true, message: 'Git pre-push hook removed.' };
    } catch {
      return { success: true, message: 'No pre-push hook was active.' };
    }
  }
}
