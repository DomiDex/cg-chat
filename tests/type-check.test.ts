import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('TypeScript Configuration', () => {
  it('should pass type checking for all packages', () => {
    expect(() => {
      execSync('pnpm type-check', { stdio: 'pipe' });
    }).not.toThrow();
  });

  it('should generate declaration files', () => {
    execSync('pnpm --filter @cg/types build', { stdio: 'pipe' });
    const declarationPath = path.join(__dirname, '../packages/@cg/types/dist/index.d.ts');
    expect(fs.existsSync(declarationPath)).toBe(true);
  });

  it('should resolve path aliases correctly', () => {
    const tsConfigPath = path.join(__dirname, '../tsconfig.base.json');
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
    expect(tsConfig.compilerOptions.paths).toBeDefined();
    expect(tsConfig.compilerOptions.paths['@/*']).toBeDefined();
  });

  it('should have correct TypeScript version', () => {
    const output = execSync('npx tsc --version', { encoding: 'utf-8' });
    expect(output).toMatch(/Version 5\.\d+\.\d+/);
  });

  it('should have strict mode enabled in base config', () => {
    const tsConfigPath = path.join(__dirname, '../tsconfig.base.json');
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
    expect(tsConfig.compilerOptions.strict).toBe(true);
  });

  it('should have all required packages with TypeScript config', () => {
    const packagesWithTsConfig = [
      'apps/web',
      'apps/api',
      'packages/convex',
      'packages/@cg/convex-client',
      'packages/@cg/types',
      'packages/@cg/utils',
      'packages/@cg/config',
      'packages/database',
    ];

    packagesWithTsConfig.forEach((pkg) => {
      const tsConfigPath = path.join(__dirname, '..', pkg, 'tsconfig.json');
      expect(fs.existsSync(tsConfigPath)).toBe(true);
    });
  });
});
