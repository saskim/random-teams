#!/usr/bin/env node
// Runs after every file edit — formats the changed file with Prettier.
import { execFileSync } from 'child_process';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

const PRETTIER_EXTENSIONS = new Set(['.ts', '.html', '.scss', '.css', '.json', '.js', '.md']);

const input = JSON.parse(await new Promise((res) => {
  let data = '';
  process.stdin.on('data', (chunk) => (data += chunk));
  process.stdin.on('end', () => res(data));
}));

const filePath = input?.tool_input?.file_path ?? '';
if (!filePath) process.exit(0);

const ext = filePath.slice(filePath.lastIndexOf('.'));
if (!PRETTIER_EXTENSIONS.has(ext)) process.exit(0);

const repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
const prettier = `${repoRoot}/node_modules/.bin/prettier`;

if (existsSync(prettier)) {
  execFileSync(prettier, ['--write', filePath], { stdio: 'ignore' });
}
