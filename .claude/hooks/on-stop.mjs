#!/usr/bin/env node
// Runs when Claude Code stops a session — executes the full test suite headlessly.
import { execFileSync } from 'child_process';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

const repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
const ng = `${repoRoot}/node_modules/.bin/ng`;

if (existsSync(ng)) {
  console.log('Running tests...');
  try {
    execFileSync(ng, ['test', '--watch=false', '--browsers=ChromeHeadless'], {
      stdio: 'inherit',
      cwd: repoRoot,
    });
    console.log('All tests passed.');
  } catch {
    console.error('Tests failed — fix before pushing.');
    process.exit(1);
  }
}
