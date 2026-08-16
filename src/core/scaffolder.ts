import fs from 'fs/promises';
import path from 'path';
import { DeliberationResult } from './types.js';

export interface ScaffoldOptions {
  outDir?: string;
  overwrite?: boolean;
  filename?: string;
}

export class CodebaseScaffolder {
  /**
   * Materializes the synthesized architectural code skeleton into runnable project files
   */
  static async scaffold(
    resultOrFileContent: DeliberationResult | string,
    options: ScaffoldOptions = {}
  ): Promise<{ path: string; bytesWritten: number }> {
    let codeSkeleton = '';
    let title = 'architecture_scaffold';

    if (typeof resultOrFileContent === 'string') {
      try {
        const parsed = JSON.parse(resultOrFileContent) as DeliberationResult;
        codeSkeleton = parsed.blueprint?.codeSkeleton || '';
        title = parsed.blueprint?.title || title;
      } catch {
        // Markdown parsing
        const match = resultOrFileContent.match(/```(?:typescript|ts|javascript|js)?\s*([\s\S]*?)\s*```/);
        codeSkeleton = match ? match[1].trim() : resultOrFileContent.trim();
      }
    } else {
      codeSkeleton = resultOrFileContent.blueprint?.codeSkeleton || '';
      title = resultOrFileContent.blueprint?.title || title;
    }

    if (!codeSkeleton) {
      throw new Error('No architectural code skeleton found to scaffold.');
    }

    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const outDir = path.resolve(process.cwd(), options.outDir || './src/architecture');
    const fileName = options.filename || `${cleanTitle || 'scaffold'}.ts`;
    const targetFile = path.join(outDir, fileName);

    await fs.mkdir(outDir, { recursive: true });

    // Overwrite protection
    if (!options.overwrite) {
      try {
        await fs.access(targetFile);
        // File exists, write backup / timestamped version
        const tsName = `${cleanTitle || 'scaffold'}_${Date.now()}.ts`;
        const altFile = path.join(outDir, tsName);
        await fs.writeFile(altFile, codeSkeleton, 'utf-8');
        return { path: altFile, bytesWritten: Buffer.byteLength(codeSkeleton, 'utf-8') };
      } catch {
        // File does not exist, proceed
      }
    }

    await fs.writeFile(targetFile, codeSkeleton, 'utf-8');
    return { path: targetFile, bytesWritten: Buffer.byteLength(codeSkeleton, 'utf-8') };
  }
}
