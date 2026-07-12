#!/usr/bin/env node
// SessionStart hook — inject the attune guidelines (communication style,
// external agents) plus a per-agent availability report. Never fails the
// session: on any error it prints nothing and exits 0.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Hook output is hard-capped at 10,000 chars (code.claude.com/docs/en/hooks);
// past the cap Claude receives a file preview instead of the content. Stay
// under it with margin for the JSON envelope.
const CONTEXT_LIMIT = 9500;

try {
  const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
  const read = (rel) => readFileSync(join(pluginRoot, rel), 'utf8').trim();

  const availability = execFileSync(
    '/bin/bash',
    [join(pluginRoot, 'scripts', 'detect-external-agents.sh'), '--lines'],
    { encoding: 'utf8', timeout: 5000 },
  ).trim();

  let context = [
    read('references/communication-guidelines.md'),
    read('references/external-agents-guidelines.md'),
    [
      '## External Agent Availability (detected at session start)',
      '',
      'Installed means the binary is on PATH — not that login, network, and',
      'model work. Usability is probed behaviorally on demand (see the',
      'external agents guidelines above).',
      '',
      availability,
    ].join('\n'),
  ].join('\n\n');

  if (context.length > CONTEXT_LIMIT) {
    const warn =
      '\n\n[attune] WARNING: guidelines truncated at the hook output limit — tighten the reference docs.';
    context = context.slice(0, CONTEXT_LIMIT - warn.length) + warn;
  }

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: context,
      },
    }),
  );
} catch {
  // stay silent — broken guidelines must not break session start
}
