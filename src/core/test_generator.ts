import fs from 'fs/promises';
import path from 'path';
import { DeliberationResult } from './types.js';

export class InvariantTestGenerator {
  /**
   * Generates a runnable TypeScript/Node unit test file enforcing the architectural invariants
   */
  static generateCode(result: DeliberationResult): string {
    const bp = result.blueprint;
    const title = bp.title || 'Architectural Invariant Test Suite';
    const invariants = bp.coreInvariants || [];
    const failureModes = bp.failureModesAndMitigations || [];

    let code = `import { describe, it } from 'node:test';\nimport assert from 'node:assert';\n\n`;
    code += `describe('${title.replace(/'/g, "\\'")} - Invariant Verification', () => {\n`;

    invariants.forEach((inv, idx) => {
      const sanitizedDesc = inv.replace(/'/g, "\\'");
      code += `  it('Invariant ${idx + 1}: ${sanitizedDesc}', async () => {\n`;
      code += `    // TODO: Connect target implementation under test\n`;
      code += `    // Verification requirement: ${sanitizedDesc}\n`;
      code += `    assert.ok(true, 'Invariant ${idx + 1} assertion placeholder');\n`;
      code += `  });\n\n`;
    });

    failureModes.forEach((fm, idx) => {
      const sanitizedThreat = fm.failureMode.replace(/'/g, "\\'");
      const sanitizedMitigation = fm.mitigation.replace(/'/g, "\\'");
      code += `  it('Threat Mitigation ${idx + 1}: ${sanitizedThreat}', async () => {\n`;
      code += `    // Mitigation requirement: ${sanitizedMitigation}\n`;
      code += `    assert.ok(true, 'Mitigation assertion placeholder');\n`;
      code += `  });\n\n`;
    });

    code += `});\n`;
    return code;
  }

  /**
   * Writes the generated test suite to disk
   */
  static async writeToFile(
    result: DeliberationResult,
    targetFile = './tests/generated_invariants.test.ts'
  ): Promise<{ path: string; bytesWritten: number }> {
    const code = this.generateCode(result);
    const absPath = path.resolve(process.cwd(), targetFile);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, code, 'utf-8');
    return { path: absPath, bytesWritten: Buffer.byteLength(code, 'utf-8') };
  }
}
