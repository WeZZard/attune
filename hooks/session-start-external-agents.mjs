#!/usr/bin/env node
// SessionStart hook — inject the external agents guidelines plus a
// per-agent availability report. Never fails the session: on any error it
// prints nothing and exits 0.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { emitContext } from './lib.mjs';

try {
  const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

  const guidelines = readFileSync(
    join(pluginRoot, 'references', 'external-agents-guidelines.md'),
    'utf8',
  ).trim();

  const availability = execFileSync(
    '/bin/bash',
    [join(pluginRoot, 'scripts', 'detect-external-agents.sh'), '--lines'],
    { encoding: 'utf8', timeout: 5000 },
  ).trim();

  emitContext(
    [
      guidelines,
      [
        '## External Agent Availability (detected at session start)',
        '',
        'Installed means the binary is on PATH — not that login, network, and',
        'model work. Usability is probed behaviorally on demand (see the',
        'external agents guidelines above).',
        '',
        availability,
      ].join('\n'),
    ].join('\n\n'),
  );
} catch {
  // stay silent — broken guidelines must not break session start
}
