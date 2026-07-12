#!/usr/bin/env node
// SessionStart hook — seed the user store on first run, then inject the
// preference sheet. Never fails the session: on any error it prints nothing
// and exits 0.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate, userStorePath } from '../scripts/generate-sheet.mjs';

try {
  const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
  const storePath = userStorePath();
  if (!existsSync(storePath)) {
    mkdirSync(dirname(storePath), { recursive: true });
    copyFileSync(join(pluginRoot, 'seeds', 'rulings.jsonl'), storePath);
  }

  let projectDir = process.env.CLAUDE_PROJECT_DIR ?? '';
  if (!projectDir && !process.stdin.isTTY) {
    try {
      projectDir = JSON.parse(readFileSync(0, 'utf8')).cwd ?? '';
    } catch {
      // no hook payload on stdin
    }
  }

  const { sheet } = generate(projectDir || process.cwd());
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: sheet,
      },
    }),
  );
} catch {
  // stay silent — a broken sheet must not break session start
}
