#!/usr/bin/env node
// SessionStart hook — inject the writing style guidelines. Never fails the
// session: on any error it prints nothing and exits 0.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { emitContext } from './_lib.mjs';

try {
  const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
  emitContext(
    readFileSync(
      join(pluginRoot, 'references', 'writing-style-guidelines.md'),
      'utf8',
    ).trim(),
  );
} catch {
  // stay silent — broken guidelines must not break session start
}
