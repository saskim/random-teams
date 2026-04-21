#!/usr/bin/env node
// Runs when Claude Code stops a session — builds, tests, audits, and visual-checks the project.
import { execFileSync, spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { dirname } from 'path';

const repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
const ng = `${repoRoot}/node_modules/.bin/ng`;
const npx = `${dirname(process.execPath)}/npx`;

function run(label, cmd, args) {
  console.log(`\n▶ ${label}`);
  try {
    execFileSync(cmd, args, { stdio: 'inherit', cwd: repoRoot });
  } catch {
    console.error(`✖ ${label} failed — fix before pushing.`);
    process.exit(1);
  }
  console.log(`✔ ${label} passed.`);
}

if (!existsSync(ng)) {
  console.error('node_modules not found — run pnpm install first.');
  process.exit(1);
}

run('Build', ng, ['build']);
run('Tests', ng, ['test', '--watch=false', '--browsers=ChromeHeadless']);

console.log('\n▶ Security audit');
const audit = spawnSync(npx, ['pnpm@10.7.0', 'audit', '--audit-level=high'], {
  stdio: 'inherit',
  cwd: repoRoot,
});
if (audit.status !== 0) {
  console.error('✖ Security audit found high/critical vulnerabilities — fix before pushing.');
  process.exit(1);
}
console.log('✔ Security audit passed.');

// Visual checks — only when component files changed
const gitStatus = execSync('git status --porcelain', { encoding: 'utf8', cwd: repoRoot });
const uiChanged = gitStatus.split('\n')
  .map(line => line.slice(3).trim())
  .some(file => /\.component\.(html|ts|scss)$/.test(file));

if (uiChanged) {
  const playwright = `${repoRoot}/node_modules/.bin/playwright`;
  console.log('\n▶ Visual tests (UI files changed)');
  const result = spawnSync(playwright, ['test'], { stdio: 'inherit', cwd: repoRoot });
  if (result.status !== 0) {
    console.error('✖ Visual tests failed — opening report...');
    spawnSync('open', [`${repoRoot}/playwright-report/index.html`]);
    process.exit(1);
  }
  console.log('✔ Visual tests passed.');
} else {
  console.log('\n○ Visual tests skipped (no component files changed).');
}
